<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="relative">
      <NuxtLink :to="`/annonces/detail-${annonce.id}`">
        <img 
          v-if="annonce.image_principale"
          :src="`http://localhost:8055/assets/${annonce.image_principale}`"
          :alt="annonce.Titre" 
          class="w-full h-48 object-cover"
        />
        <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span class="text-gray-400">Pas d'image</span>
        </div>
      </NuxtLink>
      
      <div class="absolute top-2 right-2 flex flex-col space-y-2">
        <!-- Bouton Favoris (étoile) -->
        <div class="group relative">
          <button 
            @click.prevent="handleFavoriteClick(annonce.id)"
            class="h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" 
                :class="isFavorite(annonce.id) ? 'text-red-500' : 'text-slate-400'"
                fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
          <span class="absolute right-full -top-1 mr-2 w-40 px-2 py-1 bg-gray-800 rounded-md text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {{ isFavorite(annonce.id) ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
          </span>
        </div>
        
        <!-- Bouton pour créer une alerte similaire -->
        <div class="group relative">
          <button 
            @click.prevent="handleSaveSearch"
            class="h-7 w-7 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <span class="absolute right-full -top-1 mr-2 w-40 px-2 py-1 bg-gray-800 rounded-md text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Créer une alerte similaire
          </span>
        </div>
      </div>
      
      <div 
        v-if="showCoupDeCoeur" 
        class="absolute top-0 left-0 bg-amber-600 text-white px-3 py-1 text-sm font-semibold"
      >
        Coup de cœur
      </div>
      
      <div class="absolute bottom-0 right-0 bg-cyan-500 text-white px-3 py-1">
        {{ formatPrice(annonce.prix_vente) }}
      </div>
    </div>
    
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2 truncate">{{ annonce.Titre }}</h3>
      <p class="text-gray-700 mb-2 truncate">{{ annonce.localisation }}</p>
      
      <div class="flex items-center text-sm text-gray-500 space-x-4 mb-3">
        <span>{{ annonce.surface_habitable || '?' }} m²</span>
        <span>{{ annonce.pieces || '?' }} pièces</span>
        <span>{{ annonce.chambres || '?' }} ch.</span>
      </div>
      
      <div class="flex justify-between items-center">
        <span class="text-sm bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
          {{ getCategoryLabel(annonce.categorie_annonce) }}
        </span>
        
        <!-- Bouton pour voir le bien -->
        <NuxtLink :to="`/annonces/detail-${annonce.id}`" class="text-cyan-600 hover:text-cyan-800 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Voir le détail
        </NuxtLink>
      </div>
    </div>
    
    <!-- Modal de login -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium mb-4">Connexion requise</h3>
        <p class="mb-4">Vous devez être connecté pour effectuer cette action.</p>
        <div class="flex justify-end space-x-3">
          <button @click="showLoginModal = false" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
            Annuler
          </button>
          <NuxtLink to="/login" class="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
            Se connecter
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAnnonces } from '~/composables/useAnnonces';
import { useFavorites } from '~/composables/useFavorites'; 
import { useAuthStore } from '~/stores/useAuthStore';
import { useDirectusSDK } from '~/composables/useDirectusSDK';

// État pour le modal de login
const showLoginModal = ref(false);
const loginAction = ref(''); // 'favorite' ou 'search'

// Récupérer le composable useAnnonces
const { isCoupDeCoeur } = useAnnonces();

// Récupérer le store d'authentification
const authStore = useAuthStore();

// Récupérer le composable useFavorites
const { isFavorite, toggleFavorite, fetchFavorites } = useFavorites();

// DirectusSDK pour les appels API directs
const directusSDK = useDirectusSDK();

// Définir les props
const props = defineProps({
  annonce: {
    type: Object,
    required: true
  },
  forceCoupDeCoeur: {
    type: Boolean,
    default: false
  }
});

// Calculer si on doit afficher le badge coup de coeur
const showCoupDeCoeur = computed(() => {
  return props.forceCoupDeCoeur || isCoupDeCoeur(props.annonce);
});

// Vérifier si l'utilisateur est connecté
const isAuthenticated = computed(() => {
  return authStore.isAuthenticated && authStore.clientId;
});

// Charger les favoris au montage du composant
onMounted(() => {
  if (isAuthenticated.value) {
    fetchFavorites();
  }
});

// Gestion du clic sur le bouton favoris
const handleFavoriteClick = async (annonceId) => {
  console.log('Clic sur favoris pour:', annonceId);
  
  if (!isAuthenticated.value) {
    console.log('Utilisateur non connecté, affichage du modal de login');
    loginAction.value = 'favorite';
    showLoginModal.value = true;
    return;
  }
  
  console.log('Utilisateur connecté, toggle du favori');
  await toggleFavorite(annonceId);
};

// Gestion du clic sur le bouton de sauvegarde de recherche
const handleSaveSearch = async () => {
  console.log('Clic sur sauvegarde de recherche');
  
  if (!isAuthenticated.value) {
    console.log('Utilisateur non connecté, affichage du modal de login');
    loginAction.value = 'search';
    showLoginModal.value = true;
    return;
  }
  
  console.log('Utilisateur connecté, sauvegarde de la recherche');
  await saveSearch();
};

// Fonction pour sauvegarder les critères de recherche actuels
const saveSearch = async () => {
  try {
    console.log('Sauvegarde des critères de recherche en cours...');
    
    // Vérifier que l'email utilisateur est disponible
    if (!authStore.user?.email) {
      console.error('Email utilisateur non disponible:', authStore.user);
      alert('Erreur: Email utilisateur non disponible. Veuillez vous reconnecter.');
      return false;
    }
    
    // Construire les critères à partir de l'annonce actuelle
    const searchData = {
      nom: `Similaire à ${props.annonce.Titre}`,
      type_bien: props.annonce.categorie_annonce || '',
      localisation: props.annonce.localisation || '',
      prix_max: Math.round(props.annonce.prix_vente * 1.1), // +10% du prix actuel
      surface_min: Math.round(props.annonce.surface_habitable * 0.9), // -10% de la surface
      pieces_min: props.annonce.pieces,
      chambres_min: props.annonce.chambres,
      notifications_actives: true
    };
    
    console.log('Données de recherche:', searchData);
    console.log('💾 Email utilisateur pour alerte:', authStore.user.email);
    
    // Utiliser directement le SDK pour créer l'alerte avec tous les champs individuels
    const result = await directusSDK.createItem('recherches_sauvegardees', {
      client_id: authStore.clientId,
      email: authStore.user.email,  // ← AJOUT DE L'EMAIL
      utilisateur: authStore.clientId, // Ajouter les deux champs pour compatibilité
      nom: searchData.nom,
      type_bien: searchData.type_bien,
      localisation: searchData.localisation,
      prix_max: searchData.prix_max,
      surface_min: searchData.surface_min,
      pieces_min: searchData.pieces_min,
      chambres_min: searchData.chambres_min,
      criteres_supplementaires: JSON.stringify(searchData), // Stocker aussi une copie complète pour référence
      notifications_actives: searchData.notifications_actives
    });
    
    if (result) {
      alert('Alerte créée avec succès ! Vous recevrez des emails pour les biens similaires.');
      return true;
    } else {
      throw new Error('Échec de la sauvegarde');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des critères de recherche:', error);
    alert('Une erreur est survenue lors de la création de l\'alerte');
    return false;
  }
};

// Formatter le prix
const formatPrice = (price) => {
  if (!price) return 'Prix non défini';
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
};

// Obtenir le libellé de la catégorie
const getCategoryLabel = (category) => {
  const categories = {
    'maisons': 'Maison',
    'appartements': 'Appartement',
    'immeubles': 'Immeuble',
    'construction': 'Construction',
    'maisons_dhote': 'Maison d\'hôte'
  };
  
  return categories[category] || category || 'Non catégorisé';
};
</script>