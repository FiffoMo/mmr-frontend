// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-03-06',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },
  experimental: {
    reactivityTransform: true,
  },
  vite: {
    optimizeDeps: {
      include: ['@headlessui/vue', '@heroicons/vue'],
    },
  },
  runtimeConfig: {
    // Clés privées
    directusApiToken: process.env.DIRECTUS_API_TOKEN,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    
    // Clés publiques
    public: {
      directusUrl: process.env.DIRECTUS_URL,
    }
  },
  nitro: {
    routeRules: {
      '/api/**': { cors: true }
    }
  },
  devServer: {
    port: 3000
  }
  // ...autres configurations existantes
})