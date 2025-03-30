// Fichier à placer dans: mmr-frontend/middleware/auth.js
import { useAuthStore } from '~/stores/useAuthStore';

export default defineNuxtRouteMiddleware((to, from) => {
  // Ce middleware fonctionne côté client uniquement
  if (process.server) return;

  const authStore = useAuthStore();
  
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = authStore.isAuthenticated;
  const requiresAuth = to.meta.requiresAuth === true;
  
  console.log(`Route ${to.path} - Authentification requise: ${requiresAuth ? 'Oui' : 'Non'}`);
  console.log(`Utilisateur authentifié: ${isAuthenticated ? 'Oui' : 'Non'}`);
  
  // Rediriger vers la page de connexion si nécessaire
  if (requiresAuth && !isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }
});