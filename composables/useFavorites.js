// composables/useFavorites.js
import { ref, computed, onMounted } from 'vue';
import { useDirectusSDK } from './useDirectusSDK';
import { useAuthStore } from '~/stores/useAuthStore';

// État partagé pour stocker les favoris
const favorites = ref([]);
const loading = ref(false);
const initialized = ref(false);

export function useFavorites() {
  // Accès au SDK Directus
  const directusSDK = useDirectusSDK();
  
  // Accès au store d'authentification
  const authStore = useAuthStore();
  
  // Charger les favoris depuis l'API
  const fetchFavorites = async () => {
    // Vérifions si l'utilisateur est authentifié
    if (!authStore.isAuthenticated || !authStore.clientId) {
      console.log('Impossible de charger les favoris: utilisateur non connecté');
      return;
    }
    
    // Éviter de charger plusieurs fois si déjà initialisé
    if (initialized.value && favorites.value.length > 0) return;
    
    loading.value = true;
    
    try {
      console.log('Chargement des favoris pour l\'utilisateur:', authStore.clientId);
      
      // Utiliser le SDK Directus pour récupérer les favoris
      const userFavorites = await directusSDK.getUserFavorites();
      
      console.log('Favoris récupérés via SDK:', userFavorites);
      
      if (userFavorites && Array.isArray(userFavorites)) {
        favorites.value = userFavorites;
        initialized.value = true;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      
      // En cas d'échec, essayer le fallback direct mais avec client_id
      try {
        const userId = authStore.clientId;
        
        if (!userId) {
          throw new Error('ID utilisateur non disponible');
        }
        
        // Utiliser client_id au lieu de utilisateur
        const response = await fetch(`/api/directus/items/favoris?filter[client_id][_eq]=${userId}&fields=id,status,date_created,client_id,annonce.id,annonce.Titre,annonce.prix_vente,annonce.localisation,annonce.surface_habitable,annonce.pieces,annonce.chambres,annonce.image_principale`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.data) {
          favorites.value = result.data;
          initialized.value = true;
        }
      } catch (fallbackError) {
        console.error('Erreur lors de la récupération directe des favoris:', fallbackError);
        // Ne pas modifier favorites.value
      }
    } finally {
      loading.value = false;
    }
  };
  
  // Vérifier si une annonce est dans les favoris
  const isFavorite = (annonceId) => {
    if (!annonceId) return false;
    
    return favorites.value.some(fav => {
      // Vérifier les deux possibilités de structure
      if (fav.annonce && typeof fav.annonce === 'object') {
        return fav.annonce.id === annonceId;
      }
      return fav.annonce === annonceId;
    });
  };
  
  // Ajouter/retirer une annonce des favoris
  const toggleFavorite = async (annonceId) => {
    if (!authStore.isAuthenticated || !authStore.clientId) {
      console.error('Utilisateur non connecté');
      return false;
    }
    
    if (!annonceId) {
      console.error('ID annonce manquant');
      return false;
    }
    
    const userId = authStore.clientId;
    loading.value = true;
    
    try {
      if (isFavorite(annonceId)) {
        // Trouver l'ID du favori
        const favorite = favorites.value.find(fav => 
          (fav.annonce === annonceId) || 
          (fav.annonce && fav.annonce.id === annonceId)
        );
        
        if (!favorite) {
          throw new Error('Favori introuvable');
        }
        
        // Supprimer le favori avec le SDK
        await directusSDK.removeFavorite(favorite.id);
        
        // Mettre à jour l'état local
        favorites.value = favorites.value.filter(fav => 
          fav.id !== favorite.id
        );
        
        console.log('Favori supprimé avec succès');
        return true;
      } else {
        // Ajouter aux favoris avec le SDK
        // Ajouter les deux champs pour assurer la compatibilité
        const newFavorite = await directusSDK.createItem('favoris', {
          annonce: annonceId,
          client_id: userId,
          utilisateur: userId, // Ajouter également le champ utilisateur
          date_created: new Date().toISOString()
        });
        
        // Ajouter à l'état local
        if (newFavorite) {
          favorites.value.push(newFavorite);
          console.log('Favori ajouté avec succès');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // Obtenir les annonces favorites détaillées
  const getFavoriteAnnonces = computed(() => {
    return favorites.value
      .filter(fav => fav.annonce && typeof fav.annonce === 'object')
      .map(fav => fav.annonce);
  });
  
  // Effacer tous les favoris d'un utilisateur
  const clearAllFavorites = async () => {
    if (!authStore.isAuthenticated || !authStore.clientId) return;
    
    try {
      loading.value = true;
      
      // Supprimer chaque favori avec le SDK
      const deletePromises = favorites.value.map(fav => 
        directusSDK.deleteItem('favoris', fav.id)
      );
      
      await Promise.all(deletePromises);
      
      // Vider le tableau local
      favorites.value = [];
      console.log('Tous les favoris ont été supprimés');
    } catch (error) {
      console.error('Erreur lors de la suppression de tous les favoris:', error);
    } finally {
      loading.value = false;
    }
  };
  
  // Initialiser les favoris au chargement de l'application
  const initFavorites = () => {
    if (authStore.isAuthenticated && !initialized.value) {
      fetchFavorites();
    }
  };
  
  // Charger automatiquement les favoris si l'utilisateur est connecté
  onMounted(() => {
    if (authStore.isAuthenticated) {
      initFavorites();
    }
  });
  
  return {
    favorites: computed(() => favorites.value),
    loading: computed(() => loading.value),
    isFavorite,
    toggleFavorite,
    fetchFavorites,
    getFavoriteAnnonces,
    clearAllFavorites,
    initFavorites
  };
}