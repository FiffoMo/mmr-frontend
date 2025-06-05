// plugins/auth.client.js - VERSION CORRIGÉE
import { useAuthStore } from '~/stores/useAuthStore';

export default defineNuxtPlugin({
  name: 'auth-plugin',
  enforce: 'post',
  setup() {
    try {
      console.log('Initialisation du plugin d\'authentification...');
      
      // S'exécute uniquement côté client grâce au nom du fichier .client.js
      const authStore = useAuthStore();
      
      // Initialiser l'authentification
      authStore.initAuth();
      
      console.log('Plugin auth: État d\'authentification initialisé');
      console.log('Utilisateur connecté:', authStore.user?.email || 'Aucun');
      
      // Vérifier la validité du token toutes les 15 minutes
      const tokenCheckInterval = setInterval(() => {
        if (authStore.token && authStore.user) {
          console.log('Vérification périodique du token...');
          authStore.checkToken().catch(error => {
            console.error('Erreur lors de la vérification périodique du token:', error);
            clearInterval(tokenCheckInterval);
          });
        }
      }, 15 * 60 * 1000); // 15 minutes
      
      // Nettoyer l'intervalle quand l'utilisateur quitte la page
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          clearInterval(tokenCheckInterval);
        });
      }
      
      // Écouter les changements dans le localStorage (pour la synchronisation multi-onglets)
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
          if (e.key === 'auth_token' || e.key === 'auth_user') {
            console.log('Changement d\'authentification détecté dans un autre onglet');
            
            // Re-initialiser l'état d'authentification
            authStore.initAuth();
          }
        });
      }
      
    } catch (error) {
      console.error('Erreur dans le plugin auth:', error);
    }
  }
});