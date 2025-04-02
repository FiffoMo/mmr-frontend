// middleware/auth.global.js
export default defineNuxtRouteMiddleware((to, from) => {
  // Ne s'exécute que côté client
  if (process.server) return;

  // Obtenir le store d'authentification
  const authStore = useAuthStore();
  
  // Les routes qui nécessitent une authentification
  const protectedRoutes = ['/settings'];
  const requiresAuth = protectedRoutes.some(route => to.path.startsWith(route));
  
  // Vérifier l'authentification pour les routes protégées
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirection vers login - utilisateur non authentifié');
    return navigateTo('/login');
  }
});