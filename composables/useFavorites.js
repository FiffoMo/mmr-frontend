// composables/useFavorites.js
import { ref, computed } from 'vue';

// État partagé pour stocker les favoris
const favorites = ref([]);
const loading = ref(false);
const initialized = ref(false);

export function useFavorites() {
  // Charger les favoris depuis l'API
  const fetchFavorites = async (userId) => {
    if (!userId) return;
    
    // Éviter de charger plusieurs fois si déjà initialisé
    if (initialized.value && favorites.value.length > 0) return;
    
    loading.value = true;
    try {
      const response = await fetch(`/api/directus/items/favoris?filter[utilisateur][_eq]=${userId}&fields=*,annonce.*`);
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.data) {
        favorites.value = data.data;
        initialized.value = true;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    } finally {
      loading.value = false;
    }
  };
  
  // Vérifier si une annonce est dans les favoris
  const isFavorite = (annonceId) => {
    if (!annonceId) return false;
    return favorites.value.some(fav => fav.annonce === annonceId || fav.annonce?.id === annonceId);
  };
  
  // Ajouter/retirer une annonce des favoris
  const toggleFavorite = async (annonceId, userId) => {
    if (!userId || !annonceId) {
      console.error('ID utilisateur ou annonce manquant');
      return;
    }
    
    try {
      if (isFavorite(annonceId)) {
        // Trouver l'ID du favori
        const favorite = favorites.value.find(fav => 
          fav.annonce === annonceId || fav.annonce?.id === annonceId
        );
        
        if (!favorite) {
          throw new Error('Favori introuvable');
        }
        
        // Supprimer le favori
        const response = await fetch(`/api/directus/items/favoris/${favorite.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        // Mettre à jour l'état local
        favorites.value = favorites.value.filter(fav => 
          fav.annonce !== annonceId && fav.annonce?.id !== annonceId
        );
      } else {
        // Ajouter aux favoris
        const response = await fetch('/api/directus/items/favoris', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            annonce: annonceId,
            utilisateur: userId
          })
        });
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ajouter à l'état local
        if (data && data.data) {
          favorites.value.push(data.data);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      // On pourrait ajouter ici une notification à l'utilisateur
    }
  };
  
  // Obtenir les annonces favorites détaillées
  const getFavoriteAnnonces = computed(() => {
    return favorites.value
      .filter(fav => fav.annonce && typeof fav.annonce === 'object')
      .map(fav => fav.annonce);
  });
  
  // Effacer tous les favoris d'un utilisateur
  const clearAllFavorites = async (userId) => {
    if (!userId) return;
    
    try {
      // Version simplifiée qui supprime un par un
      // Dans un cas réel, vous pourriez avoir une route API dédiée pour supprimer tous les favoris en une fois
      const deletePromises = favorites.value.map(fav => 
        fetch(`/api/directus/items/favoris/${fav.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      // Vider le tableau local
      favorites.value = [];
    } catch (error) {
      console.error('Erreur lors de la suppression de tous les favoris:', error);
    }
  };
  
  // Initialiser les favoris au chargement de l'application
  // Vous pourriez appeler cela depuis un middleware ou un plugin Nuxt
  const initFavorites = (userId) => {
    if (userId && !initialized.value) {
      fetchFavorites(userId);
    }
  };
  
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