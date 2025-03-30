// Fichier à placer dans: mmr-frontend/plugins/auth.client.js
import { useAuthStore } from '~/stores/useAuthStore';

export default defineNuxtPlugin({
  name: 'auth-plugin',
  // S'exécuter après les autres plugins (donc après l'initialisation de Pinia)
  enforce: 'post',
  setup() {
    try {
      // S'exécute uniquement côté client grâce au nom du fichier .client.js
      const authStore = useAuthStore();
      
      // Initialiser l'authentification
      authStore.initAuth();
      
      console.log('Plugin auth: État d\'authentification initialisé');
      
      // Vérifier la validité du token toutes les 30 minutes
      setInterval(() => {
        if (authStore.token) {
          try {
            authStore.checkToken();
          } catch (error) {
            console.error('Erreur lors de la vérification du token:', error);
          }
        }
      }, 30 * 60 * 1000);
    } catch (error) {
      console.error('Erreur dans le plugin auth:', error);
    }
  }
});