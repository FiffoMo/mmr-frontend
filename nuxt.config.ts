// Fichier à placer dans: mmr-frontend/nuxt.config.ts

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

  // Vous pouvez aussi définir l'URL de Directus ici
  runtimeConfig: {
    public: {
      directusUrl: process.env.DIRECTUS_URL || 'http://localhost:8055'
    }
  },

  compatibilityDate: '2025-03-24'
})