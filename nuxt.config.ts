// mmr-frontend/nuxt.config.ts

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'  // Ajout du module Pinia
  ],

  // Configuration de Pinia
  pinia: {
    autoImports: ['defineStore', 'acceptHMRUpdate'],
  },

  // Imports automatiques
  imports: {
    dirs: ['stores'],
  },

  // Configuration de l'URL Directus et du chemin des assets
  runtimeConfig: {
    // Variables côté serveur (privées)
    directusUrl: process.env.DIRECTUS_URL || 'http://localhost:8055',
    directusApiToken: process.env.DIRECTUS_API_TOKEN,
    
    // Variables publiques (côté client)
    public: {
      directusUrl: process.env.DIRECTUS_URL || 'http://localhost:8055',
      assetsBaseUrl: process.env.ASSETS_BASE_URL || '/api/assets',
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    }
  },

  // Middleware serveur pour les assets
  serverMiddleware: [
    { path: '/api/assets', handler: '~/server/middleware/assets.js' }
  ],

  // Définir des alias pour les chemins courants
  alias: {
    'assets': '~/assets',
    'uploads': '~/assets/uploads'
  },

  compatibilityDate: '2025-03-24'
})