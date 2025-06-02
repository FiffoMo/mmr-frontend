// server/api/cron/process-alerts.post.js
// cron automatique
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const isDev = process.env.NODE_ENV === 'development'
  
  try {
    console.log('🚀 Début du traitement des alertes automatiques')
    console.log(`🔧 Mode: ${isDev ? 'DÉVELOPPEMENT' : 'PRODUCTION'}`)
    
    // Sécurité adaptée selon l'environnement
    if (!isDev) {
      const headers = getHeaders(event)
      const userAgent = headers['user-agent'] || ''
      const cronAuth = headers['x-cron-auth']
      
      if (!cronAuth && !userAgent.includes('curl') && !userAgent.includes('wget')) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Accès refusé - Endpoint réservé au cron'
        })
      }
    } else {
      console.log('🔓 Mode développement - sécurité allégée')
    }

    // Récupérer le timestamp du dernier check
    const lastCheckKey = 'last_alert_check'
    let lastCheck = await getStoredValue(lastCheckKey)
    
    // En dev : prendre les 24 dernières heures pour plus de tests
    // En prod : prendre les 2 dernières heures
    const hoursBack = isDev ? 24 : 2
    if (!lastCheck) {
      lastCheck = new Date(Date.now() - hoursBack * 60 * 60 * 1000)
    } else {
      lastCheck = new Date(lastCheck)
    }

    console.log(`🔍 Recherche des annonces depuis: ${lastCheck.toISOString()}`)
    console.log(`📅 Période de recherche: ${hoursBack}h en arrière`)

    // Configuration Directus - Force l'utilisation du token principal
    const directusUrl = process.env.DIRECTUS_URL
    const directusToken = process.env.DIRECTUS_API_TOKEN  // Force le token principal pour l'instant

    if (!directusUrl || !directusToken) {
      throw new Error('Configuration Directus manquante dans .env')
    }

    console.log(`🔗 Connexion Directus: ${directusUrl}`)
    console.log(`🔑 Token utilisé: ${directusToken.substring(0, 8)}... (Principal - temporaire)`)

    // Récupérer TOUTES les annonces récentes (sans filtres complexes)
    // puis filtrer côté serveur pour éviter les problèmes de permissions
    console.log('📊 Récupération des annonces (approche simple)...')
    
    const response = await $fetch(`${directusUrl}/items/Annonces`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      },
      query: {
        'sort': '-date_created',
        'limit': isDev ? 100 : 200  // Plus large pour compenser l'absence de filtre
      }
    })

    const allListings = response.data || []
    console.log(`📋 ${allListings.length} annonces récupérées au total`)

    // Filtrer côté serveur les annonces depuis lastCheck
    const newListings = allListings.filter(listing => {
      const createdDate = new Date(listing.date_created)
      return createdDate > lastCheck
    })

    console.log(`🔍 ${newListings.length} nouvelles annonces depuis ${lastCheck.toISOString()}`)

    if (newListings.length === 0) {
      await updateStoredValue(lastCheckKey, new Date().toISOString())
      return { 
        success: true, 
        message: 'Aucune nouvelle annonce',
        mode: isDev ? 'development' : 'production',
        duration: Date.now() - startTime 
      }
    }

    // Traiter chaque annonce
    let processedCount = 0
    let errorCount = 0
    const errors = []
    const processedListings = []

    for (const listing of newListings) {
      try {
        console.log(`📋 Traitement annonce ID: ${listing.id} (titre: ${listing.titre?.substring(0, 50)}...)`)
        
        // Appeler votre système d'alertes existant
        const baseUrl = process.env.APP_URL || 'http://localhost:3000'
        const alertResult = await $fetch(`${baseUrl}/api/check-alerts`, {
          method: 'POST',
          body: { annonceId: listing.id }
        })

        if (alertResult.success) {
          processedCount++
          processedListings.push({
            id: listing.id,
            titre: listing.titre,
            alertesSent: alertResult.alertesSent || 0
          })
          console.log(`✅ Annonce ${listing.id} traitée: ${alertResult.alertesSent || 0} alertes envoyées`)
        }

      } catch (error) {
        errorCount++
        errors.push({
          annonceId: listing.id,
          titre: listing.titre,
          error: error.message
        })
        console.error(`❌ Erreur pour annonce ${listing.id}:`, error.message)
      }

      // Pause plus courte en dev pour les tests
      const pauseMs = isDev ? 50 : 100
      await new Promise(resolve => setTimeout(resolve, pauseMs))
    }

    // Mettre à jour le timestamp
    await updateStoredValue(lastCheckKey, new Date().toISOString())

    const result = {
      success: true,
      mode: isDev ? 'development' : 'production',
      timestamp: new Date().toISOString(),
      newListings: newListings.length,
      processed: processedCount,
      errors: errorCount,
      duration: Date.now() - startTime,
      details: {
        lastCheck: lastCheck.toISOString(),
        hoursBack,
        processedListings: isDev ? processedListings : undefined, // Plus de détails en dev
        errorDetails: errors.length > 0 ? errors : undefined
      }
    }

    console.log('🎯 Traitement terminé:', result)
    return result

  } catch (error) {
    console.error('💥 Erreur fatale du cron:', error)
    return { 
      success: false, 
      error: error.message,
      mode: isDev ? 'development' : 'production',
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    }
  }
})

// Fonctions utilitaires (identiques pour dev/prod)
async function getStoredValue(key) {
  try {
    const fs = require('fs').promises
    const path = require('path')
    const filePath = path.join(process.cwd(), '.cache', `${key}.json`)
    
    const data = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(data)
    return parsed.value
  } catch (error) {
    return null
  }
}

async function updateStoredValue(key, value) {
  try {
    const fs = require('fs').promises
    const path = require('path')
    const cacheDir = path.join(process.cwd(), '.cache')
    const filePath = path.join(cacheDir, `${key}.json`)
    
    await fs.mkdir(cacheDir, { recursive: true })
    
    const data = {
      value: value,
      updated: new Date().toISOString()
    }
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Erreur sauvegarde timestamp:', error)
  }
}