// middleware/auth.global.js - VERSION CORRIGÉE
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Ne s'exécute que côté client
  if (process.server) return;

  // Obtenir le store d'authentification
  const authStore = useAuthStore();
  
  // Les routes qui nécessitent une authentification
  const protectedRoutes = ['/settings', '/dashboard'];
  const requiresAuth = protectedRoutes.some(route => to.path.startsWith(route));
  
  // Vérifier l'authentification pour les routes protégées
  if (requiresAuth) {
    // Vérifier d'abord si nous avons un token valide
    const isAuthenticated = await authStore.checkToken();
    
    if (!isAuthenticated) {
      console.log('Redirection vers login - utilisateur non authentifié pour la route:', to.path);
      
      // Nettoyer l'état d'authentification
      authStore.clearAuth();
      
      // Rediriger vers la page de connexion avec l'URL de retour
      const redirectUrl = to.fullPath !== '/login' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
      return navigateTo(`/login${redirectUrl}`);
    }
    
    console.log('Utilisateur authentifié:', authStore.user?.email, 'accède à:', to.path);
  }
  
  // Si nous sommes sur la page de login et que l'utilisateur est déjà connecté
  if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('Utilisateur déjà connecté, redirection...');
    
    // Récupérer l'URL de redirection depuis les paramètres de requête
    const redirectTo = to.query.redirect || '/settings';
    return navigateTo(redirectTo);
  }
});