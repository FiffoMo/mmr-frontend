// middleware/block-users-me.global.js
export default defineNuxtRouteMiddleware((to, from) => {
    if (process.client) {
      // Intercepter et bloquer les appels à users/me
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        
        if (typeof url === 'string' && url.includes('users/me')) {
          // Vérifier s'il y a un token Authorization
          const options = args[1] || {};
          const hasAuth = options.headers?.Authorization || options.headers?.authorization;
          
          if (!hasAuth) {
            console.warn('🚫 Blocage appel users/me sans token:', url);
            // Retourner une promesse qui résout immédiatement
            return Promise.resolve(new Response('{}', { status: 200 }));
          }
        }
        
        return originalFetch.apply(this, args);
      };
    }
  });