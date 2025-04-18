<template>
  <div class="tab-content">
    <!-- Chargement -->
    <div v-if="loading && !error" class="py-10 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      <p class="mt-2 text-gray-500">Chargement des favoris...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="bg-red-50 p-6 rounded-lg mb-6">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Une erreur est survenue</h3>
          <p class="mt-2 text-sm text-red-700">
            {{ errorMessage || "Impossible de charger vos favoris. Veuillez réessayer ultérieurement." }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Recherche -->
    <div v-else-if="favorites.length > 0" class="mb-6">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Rechercher dans vos favoris..." 
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
        >
      </div>
    </div>
    
    <!-- Aucun favori -->
    <div v-else-if="favorites.length === 0" class="bg-gray-100 p-8 rounded-lg text-center">
      <div class="text-gray-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900">Aucun favori</h3>
      <p class="mt-2 text-gray-500 mb-6">Vous n'avez pas encore d'annonces favorites.</p>
      <div class="mt-6">
        <NuxtLink to="/annonces" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
          Parcourir les annonces
        </NuxtLink>
      </div>
    </div>
    
    <!-- Aucun résultat de recherche -->
    <div v-else-if="searchQuery && filteredFavorites.length === 0" class="bg-gray-100 p-8 rounded-lg text-center">
      <div class="text-gray-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900">Aucun résultat</h3>
      <p class="text-gray-500 mb-4">Aucune annonce ne correspond à votre recherche.</p>
      <button 
        @click="searchQuery = ''" 
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
      >
        Effacer la recherche
      </button>
    </div>
    
    <!-- Liste des favoris -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="(favorite, index) in filteredFavorites" :key="index" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="relative pb-2/3">
          <img 
            v-if="favorite.annonce && favorite.annonce.photos && favorite.annonce.photos.length > 0" 
            :src="favorite.annonce.photos[0]" 
            :alt="favorite.annonce.titre || 'Photo du bien'" 
            class="absolute h-full w-full object-cover"
          >
          <div v-else class="absolute h-full w-full bg-gray-200 flex items-center justify-center">
            <svg class="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div class="p-4">
          <div class="flex justify-between">
            <h3 class="text-lg font-medium text-gray-900 truncate">
              {{ favorite.annonce?.titre || 'Annonce sans titre' }}
            </h3>
            <button 
              @click="removeFavorite(favorite)" 
              class="text-red-500 hover:text-red-700 focus:outline-none"
              title="Retirer des favoris"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-lg font-semibold text-gray-900">
            {{ formatPrice(favorite.annonce?.prix) }}
          </p>
          <p class="mt-1 text-sm text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ favorite.annonce?.localisation || 'Emplacement non spécifié' }}
          </p>
          <div class="mt-2 flex space-x-4 text-sm text-gray-500">
            <div v-if="favorite.annonce?.surface" class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
              {{ favorite.annonce.surface }} m²
            </div>
            <div v-if="favorite.annonce?.pieces" class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {{ favorite.annonce.pieces }} pièce(s)
            </div>
            <div v-if="favorite.annonce?.chambres" class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {{ favorite.annonce.chambres }} chambre(s)
            </div>
          </div>
          <div class="mt-4">
            <NuxtLink 
              :to="`/annonces/${favorite.annonce?.id}`" 
              class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-cyan-700 bg-cyan-100 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Voir le détail
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useDirectusSDK } from '~/composables/useDirectusSDK';
import { useAuthStore } from '~/stores/useAuthStore';

export default {
  name: 'FavoritesTab',
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const directusSDK = useDirectusSDK();
    const authStore = useAuthStore();
    
    const loading = ref(false);
    const error = ref(false);
    const errorMessage = ref('');
    const favorites = ref([]);
    const searchQuery = ref('');
    const dataRequested = ref(false);
    
    const filteredFavorites = computed(() => {
      if (!searchQuery.value) return favorites.value;
      
      const query = searchQuery.value.toLowerCase();
      return favorites.value.filter(favorite => {
        const annonce = favorite.annonce;
        if (!annonce) return false;
        
        return (
          (annonce.titre && annonce.titre.toLowerCase().includes(query)) ||
          (annonce.description && annonce.description.toLowerCase().includes(query)) ||
          (annonce.localisation && annonce.localisation.toLowerCase().includes(query)) ||
          (annonce.type_bien && annonce.type_bien.toLowerCase().includes(query))
        );
      });
    });
    
    async function fetchFavorites() {
      // Vérifier si l'utilisateur est connecté
      if (!authStore.user) {
        console.log('Attente des données utilisateur...');
        loading.value = true;
        
        // Attendre que les données utilisateur soient disponibles avec un timeout
        const timeout = setTimeout(() => {
          if (loading.value) {
            console.error('Timeout: Impossible de récupérer les données utilisateur');
            error.value = true;
            errorMessage.value = 'Vous devez être connecté pour accéder à vos favoris.';
            loading.value = false;
            favorites.value = [];
          }
        }, 5000);

        // Tenter de récupérer l'utilisateur directement
        try {
          const userResponse = await directusSDK.getSingle('users/me', {
            fields: ['id']
          });
          
          if (userResponse && userResponse.data && userResponse.data.id) {
            console.log('Utilisateur récupéré directement:', userResponse.data.id);
            clearTimeout(timeout);
            await loadFavoritesForUser(userResponse.data.id);
            return;
          }
        } catch (primaryError) {
          console.warn('Impossible de récupérer l\'utilisateur directement:', primaryError);
          // Continuer et attendre que l'utilisateur soit chargé dans le store
        }
        
        // Attendre un peu que les données utilisateur soient chargées dans le store
        let attempts = 0;
        const maxAttempts = 10;
        const checkInterval = setInterval(async () => {
          attempts++;
          if (authStore.user) {
            console.log('Données utilisateur trouvées après attente');
            clearInterval(checkInterval);
            clearTimeout(timeout);
            await loadFavoritesForUser(authStore.user.id);
          } else if (attempts >= maxAttempts) {
            console.error('Nombre maximum de tentatives atteint');
            clearInterval(checkInterval);
            clearTimeout(timeout);
            error.value = true;
            errorMessage.value = 'Impossible de vérifier votre identité. Veuillez vous reconnecter.';
            loading.value = false;
            favorites.value = [];
          }
        }, 500);
        
        return;
      }
      
      await loadFavoritesForUser(authStore.user.id);
    }
    
    async function loadFavoritesForUser(userId) {
      if (!userId) {
        console.error('ID utilisateur manquant');
        error.value = true;
        errorMessage.value = 'Vous devez être connecté pour accéder à vos favoris.';
        favorites.value = [];
        loading.value = false;
        return;
      }

      loading.value = true;
      error.value = false;
      
      // Timeout pour éviter les chargements infinis
      const timeout = setTimeout(() => {
        if (loading.value) {
          console.log('Timeout atteint lors du chargement des favoris');
          loading.value = false;
          favorites.value = [];
        }
      }, 5000);

      try {
        console.log('Chargement des favoris pour l\'utilisateur:', userId);
        
        // Utilisation du SDK plutôt que fetch direct
        try {
          // Utiliser client_id au lieu de utilisateur pour le filtre
          const result = await directusSDK.getUserFavorites();
          
          console.log('Résultat de getUserFavorites:', result);
          
          if (result && Array.isArray(result)) {
            // Les données d'annonce sont déjà incluses via la relation configurée
            favorites.value = result;
          } else {
            // Fallback avec fetch direct si le SDK ne fonctionne pas comme prévu
            const url = `/api/directus/items/favoris?filter[client_id][_eq]=${userId}&fields=*,annonce.*`;
            
            console.log('URL de la requête de secours:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const jsonData = await response.json();
            console.log('Réponse fetch direct:', jsonData);
            
            if (jsonData && jsonData.data && Array.isArray(jsonData.data)) {
              favorites.value = jsonData.data;
            } else {
              favorites.value = [];
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des favoris:', error);
          throw error;
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
        error.value = true;
        errorMessage.value = error.message || 'Erreur lors du chargement des favoris';
        favorites.value = [];
      } finally {
        clearTimeout(timeout);
        loading.value = false;
      }
    }
    
    async function removeFavorite(favorite) {
      try {
        await directusSDK.deleteItem('favoris', favorite.id);
        favorites.value = favorites.value.filter(f => f.id !== favorite.id);
        // Afficher une notification
        // this.$toast.success('Favori supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du favori:', error);
        // this.$toast.error('Impossible de supprimer le favori');
      }
    }
    
    function formatPrice(price) {
      if (!price) return 'Prix non spécifié';
      return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'EUR',
        maximumFractionDigits: 0 
      }).format(price);
    }
    
    // Chargement initial des données
    let unwatch = null;
    
    if (props.isActive && !dataRequested.value) {
      fetchFavorites();
      dataRequested.value = true;
    } else {
      unwatch = watch(() => props.isActive, (newVal) => {
        if (newVal && !dataRequested.value) {
          fetchFavorites();
          dataRequested.value = true;
          
          // Nettoyer le watcher après utilisation
          if (unwatch) {
            unwatch();
            unwatch = null;
          }
        }
      });
    }
    
    // Nettoyage à la destruction du composant
    onUnmounted(() => {
      if (unwatch) {
        unwatch();
      }
    });
    
    return {
      loading,
      error,
      errorMessage,
      favorites,
      searchQuery,
      filteredFavorites,
      removeFavorite,
      formatPrice
    };
  }
};
</script>

<style scoped>
/* Tailwind gère déjà la majorité des styles */
.pb-2\/3 {
  padding-bottom: 66.666667%;
}
</style>