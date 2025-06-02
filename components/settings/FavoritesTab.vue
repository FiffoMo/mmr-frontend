<template>
  <div class="tab-content">
    <!-- En-tête avec nombre de favoris et bouton de rechargement -->
    <div class="bg-slate-100 p-4 mb-6 rounded-lg flex justify-between items-center">
      <h3 class="font-medium">Nombre de favoris: {{ favorites.length }}</h3>
      <button @click="fetchFavorites()" class="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md">
        Recharger
      </button>
    </div>
    
    <!-- Liste des favoris -->
    <div class="space-y-4">
      <div 
        v-for="favorite in favorites" 
        :key="favorite.id" 
        class="border rounded-lg bg-white shadow-sm overflow-hidden"
      >
        <div class="flex flex-col md:flex-row">
          <!-- Image de l'annonce avec taille contrainte -->
          <div class="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
            <img 
              v-if="favorite.annonce?.image_principale" 
              :src="`${directusUrl}/assets/${favorite.annonce.image_principale}`"
              :alt="favorite.annonce.Titre" 
              class="w-full h-full object-cover"
              style="aspect-ratio: 16/9;"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <!-- Informations de l'annonce -->
          <div class="p-4 md:w-2/3 flex flex-col justify-between relative">
            <!-- Bouton de suppression (position absolute) -->
            <button 
              @click="removeFavorite(favorite)"
              class="absolute top-4 right-4 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full"
              title="Supprimer des favoris"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            
            <!-- Titre et localisation -->
            <div>
              <h4 class="font-bold text-lg md:text-xl mb-1 pr-10">{{ favorite.annonce?.Titre || 'Sans titre' }}</h4>
              <p class="text-gray-600">{{ favorite.annonce?.localisation }}</p>
              <p class="font-semibold text-cyan-600 text-lg mt-2">{{ formatPrice(favorite.annonce?.prix_vente) }}</p>
            </div>
            
            <!-- Lien vers le détail -->
            <div class="mt-4">
              <NuxtLink 
                :to="`/annonces/detail-${favorite.annonce?.id}`" 
                class="inline-flex items-center text-md text-cyan-700 hover:text-cyan-800 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Voir le détail
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Si aucun favori -->
      <div v-if="favorites.length === 0" class="text-center p-8 bg-gray-100 rounded-lg">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useDirectusSDK } from '~/composables/useDirectusSDK';
import { useAuthStore } from '~/stores/useAuthStore';

const config = useRuntimeConfig();
const directusUrl = config.public.directusUrl || 'http://localhost:8055';

// Props
const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    default: null
  }
});

// Composables
const directusSDK = useDirectusSDK();
const authStore = useAuthStore();

// État
const loading = ref(false);
const error = ref(false);
const favorites = ref([]);
const dataRequested = ref(false);

// Fonction pour charger les favoris
const fetchFavorites = async () => {
  // S'assurer que nous avons un ID utilisateur
  const userId = props.userId || authStore.clientId;
  
  if (!userId) {
    console.warn('FavoritesTab: Aucun ID utilisateur disponible');
    return;
  }
  
  loading.value = true;
  
  try {
    console.log('FavoritesTab: Chargement des favoris pour', userId);
    
    // Utiliser le SDK pour récupérer les favoris
    const result = await directusSDK.getUserFavorites();
    
    if (result && Array.isArray(result)) {
      favorites.value = result;
    } else {
      // Fallback en cas d'échec du SDK
      const response = await fetch(`/api/directus/items/favoris?filter[client_id][_eq]=${userId}&fields=*,annonce.*`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.data && Array.isArray(data.data)) {
        favorites.value = data.data;
      } else {
        favorites.value = [];
      }
    }
  } catch (err) {
    console.error('FavoritesTab: Erreur lors du chargement des favoris:', err);
    favorites.value = [];
  } finally {
    loading.value = false;
  }
};

// Supprimer un favori
const removeFavorite = async (favorite) => {
  try {
    if (!favorite || !favorite.id) {
      console.error('FavoritesTab: ID du favori manquant');
      return;
    }
    
    // Confirmation
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce favori ?")) {
      return;
    }
    
    await directusSDK.deleteItem('favoris', favorite.id);
    
    // Mettre à jour l'état local
    favorites.value = favorites.value.filter(f => f.id !== favorite.id);
    
    console.log('FavoritesTab: Favori supprimé avec succès');
  } catch (err) {
    console.error('FavoritesTab: Erreur lors de la suppression du favori:', err);
    alert("Impossible de supprimer le favori. Veuillez réessayer.");
  }
};

// Formatage du prix
const formatPrice = (price) => {
  if (!price) return 'Prix non spécifié';
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(price);
};

// Chargement initial ou lors de l'activation de l'onglet
onMounted(() => {
  if (props.isActive && !dataRequested.value) {
    fetchFavorites();
    dataRequested.value = true;
  }
});

// Surveiller les changements d'état actif
watch(() => props.isActive, (newValue) => {
  if (newValue && !dataRequested.value) {
    fetchFavorites();
    dataRequested.value = true;
  }
});
</script>

<style scoped>
/* Assurer que les images restent dans leurs conteneurs */
img {
  max-width: 100%;
  height: auto;
}
</style>