// server/api/check-alerts.post.js - VERSION CORRIGÉE
// logique d'alertes
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const annonceId = body.annonceId

    if (!annonceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'annonceId manquant'
      })
    }

    console.log(`🚀 Traitement des alertes pour l'annonce ID: ${annonceId}`)

    // 1. Récupérer l'annonce depuis Directus avec les VRAIS noms de champs
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055'
    const directusToken = process.env.DIRECTUS_API_TOKEN

    const annonceResponse = await $fetch(`${directusUrl}/items/Annonces/${annonceId}`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      }
    })

    const annonceData = annonceResponse.data || annonceResponse

    // 2. Mapper correctement les champs avec les vrais noms Directus
    const annonce = {
      id: annonceData.id,
      titre: annonceData.Titre,  // Majuscule !
      type: normalizeType(annonceData.categorie_annonce),  // categorie_annonce -> type
      prix: annonceData.prix_vente,  // prix_vente
      ville: extractVille(annonceData.localisation),  // Extraire de localisation
      region: extractRegion(annonceData.localisation),  // Extraire de localisation
      surface: annonceData.surface_habitable,  // surface_habitable
      chambres: annonceData.chambres,  // chambres (pas nb_chambres)
      date_created: annonceData.date_created,
      status: annonceData.status,
      proprietaire: annonceData.client_id  // client_id = proprietaire
    }

    console.log('📋 Annonce récupérée:', {
      id: annonce.id,
      titre: annonce.titre,
      type: annonce.type,
      prix: annonce.prix,
      ville: annonce.ville
    })

    // 3. Récupérer les alertes actives - approche simple qui fonctionne
    const alertesResponse = await $fetch(`${directusUrl}/items/recherches_sauvegardees`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      },
      query: {
        'sort': '-date_created',
        'limit': 100
      }
    })

    console.log('✅ Alertes récupérées directement depuis Directus')
    const allAlertes = alertesResponse.data || []
    
    // Filtrer côté serveur les alertes actives
    const alertes = allAlertes.filter(alerte => alerte.notifications_actives === true)
    console.log(`📢 ${alertes.length} alertes actives trouvées sur ${allAlertes.length} total`)
    
    // Pour chaque alerte, récupérer les détails du client
    const alertesWithEmails = []
    for (const alerte of alertes) {
      if (alerte.client_id) {
        try {
          const clientResponse = await $fetch(`${directusUrl}/users/${alerte.client_id}`, {
            headers: {
              'Authorization': `Bearer ${directusToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          console.log(`👤 Client ${alerte.client_id} récupéré:`, {
            email: clientResponse.email,
            first_name: clientResponse.first_name
          })
          
          alerte.client_id = {
            id: alerte.client_id,
            email: clientResponse.email,
            first_name: clientResponse.first_name,
            last_name: clientResponse.last_name
          }
          alertesWithEmails.push(alerte)
        } catch (error) {
          console.log(`⚠️ Impossible de récupérer le client ${alerte.client_id}:`, error.message)
        }
      }
    }
    
    console.log(`📧 ${alertesWithEmails.length} alertes avec emails récupérées`)
    
    // Utiliser les alertes avec emails
    const alertesFinales = alertesWithEmails

    if (alertesFinales.length === 0) {
      return {
        success: true,
        message: 'Aucune alerte active avec email valide',
        alertesSent: 0
      }
    }

    // 4. Logique de correspondance améliorée
    let alertesSent = 0
    const correspondances = []

    for (const alerte of alertesFinales) {
      try {
        // Ignorer les alertes du propriétaire de l'annonce
        if (alerte.client_id?.id === annonce.proprietaire) {
          console.log(`⏭️ Ignorer alerte du propriétaire ${annonce.proprietaire}`)
          continue
        }

        const score = calculateMatchScore(annonce, alerte)
        
        if (score >= 3) {  // Seuil minimum
          console.log(`✅ Correspondance trouvée! Score: ${score}`)
          
          // Vérifier que l'email est disponible avant d'envoyer
          const emailToUse = alerte.email || alerte.client_id?.email || 'contact@ma-maison-rapporte.com'  // Priorité: email stocké > client_id.email > fallback
          
          if (emailToUse && emailToUse !== 'contact@ma-maison-rapporte.com') {
            console.log(`📧 Envoi email à: ${emailToUse} (client réel)`)
            
            // Créer une version avec le bon email
            const alerteWithEmail = {
              ...alerte,
              client_id: {
                ...alerte.client_id,
                email: emailToUse
              }
            }
            
            await sendAlertEmail(annonce, alerteWithEmail, score)
            alertesSent++
            
            correspondances.push({
              alerteId: alerte.id,
              clientEmail: emailToUse,
              score: score
            })
          } else {
            console.log(`📧 Envoi email à: ${emailToUse} (fallback)`)
            
            // Utiliser le fallback
            const alerteWithEmail = {
              ...alerte,
              client_id: {
                ...alerte.client_id,
                email: emailToUse
              }
            }
            
            await sendAlertEmail(annonce, alerteWithEmail, score)
            alertesSent++
            
            correspondances.push({
              alerteId: alerte.id,
              clientEmail: emailToUse,
              score: score
            })
          }
        } else {
          console.log(`❌ Pas de correspondance. Score: ${score} (minimum: 3)`)
        }
      } catch (error) {
        console.error(`❌ Erreur traitement alerte ${alerte.id}:`, error.message)
      }
    }

    console.log(`🎯 ${alertesSent} alertes correspondent à l'annonce`)

    return {
      success: true,
      annonceId: annonceId,
      alertesChecked: alertesFinales.length,
      alertesSent: alertesSent,
      correspondances: correspondances
    }

  } catch (error) {
    console.error('💥 Erreur check-alerts:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

// Fonctions utilitaires pour mapper les champs Directus
function normalizeType(categorieAnnonce) {
  if (!categorieAnnonce) return null
  
  const mapping = {
    'maisons': 'MAISON',
    'appartements': 'APPARTEMENT',
    'terrains': 'TERRAIN',
    'commerces': 'COMMERCE',
    'immeubles': 'IMMEUBLE'
  }
  
  return mapping[categorieAnnonce.toLowerCase()] || categorieAnnonce.toUpperCase()
}

function extractVille(localisation) {
  if (!localisation) return null
  
  // Format: "Nice - Provence-Alpes-Côte d'Azur"
  const parts = localisation.split(' - ')
  return parts[0]?.trim()
}

function extractRegion(localisation) {
  if (!localisation) return null
  
  // Format: "Nice - Provence-Alpes-Côte d'Azur"
  const parts = localisation.split(' - ')
  return parts[1]?.trim()
}

function calculateMatchScore(annonce, alerte) {
  let score = 0

  // Type obligatoire (très important)
  if (alerte.type_bien && annonce.type) {
    const alerteType = normalizeType(alerte.type_bien)  // Normaliser aussi le type de l'alerte
    if (alerteType === annonce.type) {
      score += 5  // Points importants pour le type
      console.log(`✅ Type correspond: ${annonce.type}`)
    } else {
      console.log(`❌ Type ne correspond pas: ${alerte.type_bien} (${alerteType}) vs ${annonce.type}`)
      return 0  // Arrêt si type ne correspond pas
    }
  }

  // Région/Localisation
  if (alerte.region && annonce.region) {
    if (alerte.region.toLowerCase().includes(annonce.region.toLowerCase()) ||
        annonce.region.toLowerCase().includes(alerte.region.toLowerCase())) {
      score += 3
      console.log(`✅ Région correspond: ${annonce.region}`)
    }
  }

  if (alerte.ville && annonce.ville) {
    if (alerte.ville.toLowerCase().includes(annonce.ville.toLowerCase()) ||
        annonce.ville.toLowerCase().includes(alerte.ville.toLowerCase())) {
      score += 3
      console.log(`✅ Ville correspond: ${annonce.ville}`)
    }
  }

  // Prix (tolérance +50k€ au-dessus du budget)
  if (alerte.prix_max && annonce.prix) {
    if (annonce.prix <= alerte.prix_max + 50000) {
      score += 2
      console.log(`✅ Prix OK: ${annonce.prix}€ (max: ${alerte.prix_max + 50000}€)`)
    } else {
      console.log(`❌ Prix trop élevé: ${annonce.prix}€ (max: ${alerte.prix_max + 50000}€)`)
    }
  }

  return score
}

async function sendAlertEmail(annonce, alerte, score) {
  try {
    const nodemailer = require('nodemailer')

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: parseInt(process.env.EMAIL_SMTP_PORT),
      secure: process.env.EMAIL_SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASSWORD
      }
    })

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">🏠 Nouvelle annonce correspondant à votre alerte</h2>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">${annonce.titre}</h3>
        <p><strong>Prix:</strong> ${annonce.prix?.toLocaleString()}€</p>
        <p><strong>Type:</strong> ${annonce.type}</p>
        <p><strong>Localisation:</strong> ${annonce.ville}, ${annonce.region}</p>
        ${annonce.surface ? `<p><strong>Surface:</strong> ${annonce.surface}m²</p>` : ''}
        ${annonce.chambres ? `<p><strong>Chambres:</strong> ${annonce.chambres}</p>` : ''}
      </div>

      <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #065f46; margin: 0;">
          <strong>Score de correspondance: ${score}/10</strong><br>
          Cette annonce correspond à ${Math.round((score/10)*100)}% à vos critères.
        </p>
      </div>

      <p>
        <a href="${process.env.APP_URL}/annonce/${annonce.id}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Voir l'annonce complète
        </a>
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        Vous recevez cet email car vous avez une alerte active sur Ma Maison Rapporte.<br>
        <a href="${process.env.APP_URL}/dashboard/alertes">Gérer mes alertes</a>
      </p>
    </div>
    `

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: alerte.client_id?.email,
      subject: `🏠 Nouvelle annonce: ${annonce.titre}`,
      html: htmlContent
    })

    console.log(`📧 Email envoyé à ${alerte.client_id?.email}`)

  } catch (error) {
    console.error('❌ Erreur envoi email:', error.message)
    throw error
  }
}