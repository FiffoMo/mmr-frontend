// server/api/cron/status.get.js - Version PRODUCTION
// monitoring
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export default defineEventHandler(async (event) => {
  const isProd = process.env.NODE_ENV === 'production'
  
  try {
    const fs = require('fs').promises
    const path = require('path')
    
    // Lire le dernier timestamp
    const lastCheckFile = path.join(process.cwd(), '.cache', 'last_alert_check.json')
    let lastCheck = null
    let timeSinceLastCheck = null
    
    try {
      const data = await fs.readFile(lastCheckFile, 'utf8')
      const parsed = JSON.parse(data)
      lastCheck = parsed.value
      timeSinceLastCheck = Math.round((Date.now() - new Date(lastCheck).getTime()) / (1000 * 60))
    } catch (error) {
      // Fichier n'existe pas encore
    }
    
    // Lire les logs récents PHP (production)
    let recentLogs = []
    let logStats = null
    
    if (isProd) {
      try {
        const logFile = path.join(process.cwd(), 'cron-alerts.log')
        const logData = await fs.readFile(logFile, 'utf8')
        const lines = logData.split('\n').filter(line => line.trim())
        
        // Statistiques des logs
        const successCount = lines.filter(line => line.includes('SUCCÈS')).length
        const errorCount = lines.filter(line => line.includes('ERREUR')).length
        
        logStats = {
          total: lines.length,
          success: successCount,
          errors: errorCount,
          successRate: lines.length > 0 ? Math.round((successCount / lines.length) * 100) : 0
        }
        
        // Derniers logs (10 plus récents)
        recentLogs = lines.slice(-10)
      } catch (error) {
        // Pas de logs ou erreur lecture
      }
    }
    
    // Vérifier Directus
    let directusStatus = 'unknown'
    let directusResponseTime = null
    
    try {
      const directusUrl = process.env.DIRECTUS_URL
      const startTime = Date.now()
      
      const response = await $fetch(`${directusUrl}/server/health`, {
        timeout: 5000
      })
      
      directusResponseTime = Date.now() - startTime
      directusStatus = 'online'
    } catch (error) {
      directusStatus = 'offline'
    }
    
    // Calculer le statut global
    let status = 'healthy'
    let alerts = []
    let recommendations = []
    
    // Alertes basées sur le dernier check
    if (!lastCheck) {
      status = 'warning'
      alerts.push('Aucun check effectué - Configuration du cron nécessaire')
      recommendations.push('Vérifiez la configuration de votre tâche cron dans cPanel')
    } else {
      const expectedInterval = isProd ? 30 : 60 // 30min en prod, 60min en dev
      
      if (timeSinceLastCheck > expectedInterval * 2) {
        status = 'error'
        alerts.push(`Dernier check il y a ${timeSinceLastCheck} minutes (attendu: ${expectedInterval}min)`)
        recommendations.push('Vérifiez que la tâche cron est active dans cPanel')
      } else if (timeSinceLastCheck > expectedInterval + 10) {
        status = 'warning'
        alerts.push(`Léger retard: ${timeSinceLastCheck} minutes`)
      }
    }
    
    // Alertes Directus
    if (directusStatus === 'offline') {
      status = 'error'
      alerts.push('Directus hors ligne')
      recommendations.push('Vérifiez la configuration DIRECTUS_URL dans .env')
    } else if (directusResponseTime > 3000) {
      status = 'warning'
      alerts.push(`Directus lent: ${directusResponseTime}ms`)
    }
    
    // Alertes basées sur les logs (production)
    if (isProd && logStats) {
      if (logStats.successRate < 80) {
        status = 'error'
        alerts.push(`Taux de succès faible: ${logStats.successRate}%`)
      } else if (logStats.successRate < 95) {
        status = 'warning'
        alerts.push(`Taux de succès modéré: ${logStats.successRate}%`)
      }
    }
    
    // Calcul du prochain check attendu
    const nextExpectedCheck = lastCheck ? 
      new Date(new Date(lastCheck).getTime() + (isProd ? 30 : 60) * 60 * 1000) : 
      null
    
    const result = {
      status,
      environment: isProd ? 'production' : 'development',
      timestamp: new Date().toISOString(),
      
      // Informations sur le dernier check
      lastCheck,
      timeSinceLastCheck,
      nextExpectedCheck: nextExpectedCheck?.toISOString(),
      
      // Statut des services
      services: {
        directus: {
          status: directusStatus,
          responseTime: directusResponseTime,
          url: process.env.DIRECTUS_URL
        }
      },
      
      // Alertes et recommandations
      alerts: alerts.length > 0 ? alerts : undefined,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      
      // Statistiques (production uniquement)
      stats: isProd ? logStats : undefined,
      
      // Logs récents (limités)
      recentActivity: recentLogs.length > 0 ? recentLogs.slice(-5) : undefined,
      
      // Informations de configuration
      config: {
        expectedInterval: isProd ? '30 minutes' : '60 minutes',
        cronCommand: isProd ? 
          'curl -H "x-cron-auth: true" -X POST https://ma-maison-rapporte.com/api/cron/process-alerts' :
          'Développement - test manuel'
      }
    }
    
    return result
    
  } catch (error) {
    return {
      status: 'error',
      environment: isProd ? 'production' : 'development',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
})