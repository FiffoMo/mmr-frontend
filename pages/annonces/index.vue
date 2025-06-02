<template>
  <div class="container mx-auto pt-8 mb-32">
    <div class="mt-12 mb-12">
      <SearchBar />
    </div>
    
    <h1 class="text-3xl font-bold mb-6">
      {{ searchActive ? 'Résultats de recherche' : categoryTitle }}
    </h1>
    
    <div v-if="loading" class="text-center py-10">
      <p class="text-gray-500">Chargement des annonces...</p>
    </div>
    
    <div v-else-if="error" class="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <p>{{ error }}</p>
    </div>
    
    <!-- Nouveau bloc pour annonces vides avec message amélioré -->
    <div v-else-if="annonces.length === 0" class="text-center py-10 bg-gray-100 rounded-lg">
      <p class="text-gray-700 mb-4">
        {{ searchActive ? 'Aucune annonce ne correspond à votre recherche.' : 'Aucune annonce trouvée pour cette catégorie.' }}
      </p>
      <p class="text-gray-600 mb-6">
        Essayez d'autres critères de recherche ou consultez toutes nos annonces.
      </p>
      <NuxtLink to="/" class="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-6 rounded-md transition duration-200">
        Revenir à l'accueil
      </NuxtLink>
    </div>
    
    <!-- Critères de recherche appliqués -->
    <div v-if="searchActive && Object.keys(searchCriteria).length > 0" class="mb-6 p-4 bg-amber-100 rounded-lg">
      <h2 class="font-semibold mb-2">Critères de recherche :</h2>
      <div class="flex flex-wrap gap-2">
        <div v-if="searchCriteria.category" class="px-3 py-1 bg-white border rounded-full text-sm">
          Type: {{ getCategoryLabel(searchCriteria.category) }}
        </div>
        <div v-if="searchCriteria.location" class="px-3 py-1 bg-white border rounded-full text-sm">
          Localisation: {{ searchCriteria.location }}
        </div>
        <div v-if="searchCriteria.maxPrice" class="px-3 py-1 bg-white border rounded-full text-sm">
          Budget max: {{ formatPrice(searchCriteria.maxPrice) }}
        </div>
      </div>
      <button 
        @click="clearSearch" 
        class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Effacer les filtres
      </button>
    </div>
    
    <div v-if="annonces.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <AnnonceCard 
        v-for="annonce in annonces" 
        :key="annonce.id" 
        :annonce="annonce"
      />
    </div>
  </div>
</template>

<script setup>
// Déclarer que cette page utilise le layout "annonces"
definePageMeta({
  layout: 'annonces'
});

// Le reste du script reste inchangé
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AnnonceCard from '~/components/annonces/AnnonceCard.vue';
import SearchBar from '~/components/home/SearchBar.vue';
import { useAnnonces } from '~/composables/useAnnonces';

const route = useRoute();
const router = useRouter();
const category = computed(() => route.query.category || null);

// Récupérer tous les paramètres de recherche de l'URL
const searchCriteria = computed(() => {
  console.log("Route query:", route.query);
  
  const criteria = {};
  
  // Paramètres de base (uniquement ceux que nous gardons)
  if (route.query.category) criteria.category = route.query.category;
  if (route.query.location) criteria.location = route.query.location;
  if (route.query.maxPrice) criteria.maxPrice = route.query.maxPrice;
  
  console.log("Critères extraits:", criteria);
  return criteria;
});

// Déterminer si la recherche est active
const searchActive = computed(() => {
  return Object.keys(searchCriteria.value).length > 0;
});

const { annonces, loading, error, searchAnnonces, fetchRecentAnnonces } = useAnnonces();

const categoryTitle = computed(() => {
  const titles = {
    'maisons': 'Maisons',
    'appartements': 'Appartements',
    'immeubles': 'Immeubles',
    'constructions': 'Constructions',
    'maisons_dhote': 'Maisons d\'hôte'
  };
  
  return category.value ? titles[category.value] || 'Annonces' : 'Toutes les annonces';
});

// Fonction pour formater les prix
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
};

// Fonction pour obtenir le libellé d'une catégorie
const getCategoryLabel = (categoryCode) => {
  const categories = {
    'maisons': 'Maison',
    'appartements': 'Appartement',
    'immeubles': 'Immeuble',
    'constructions': 'Construction',
    'maisons_dhote': 'Maison d\'hôte'
  };
  
  return categories[categoryCode] || categoryCode;
};

// Fonction pour effacer tous les filtres et charger toutes les annonces
const clearSearch = () => {
  router.push('/annonces');
};

// Fonction pour récupérer les annonces selon les critères
const fetchAnnonces = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    if (searchActive.value) {
      console.log("Recherche active avec critères:", searchCriteria.value);
      
      // Si des critères de recherche sont présents, utiliser searchAnnonces
      const results = await searchAnnonces(searchCriteria.value);
      
      // Force l'assignation explicite des résultats
      annonces.value = results || [];
      
      console.log(`Recherche terminée : ${annonces.value.length} résultat(s) affiché(s)`);
    } else if (category.value) {
      // Si seulement une catégorie est spécifiée
      let url = `/api/annonces?category=${category.value}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        annonces.value = data.annonces;
      } else {
        error.value = data.error || 'Erreur lors du chargement des annonces';
      }
    } else {
      // Sinon, charger toutes les annonces
      await fetchRecentAnnonces(20);
    }
  } catch (err) {
    console.error('Erreur during fetch:', err);
    error.value = err.message || 'Erreur lors du chargement des annonces';
    annonces.value = []; // S'assurer que le tableau est vide en cas d'erreur
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAnnonces);

// Recharger les annonces quand les paramètres de recherche changent
watch([category, searchCriteria], fetchAnnonces, { deep: true });
</script>

<style scoped>
/* Ajouter un style personnalisé pour l'espacement exact de 30px */
.mt-30 {
  margin-top: 30px;
}
.navbar {
  position: relative;
  z-index: 50; /* Une valeur plus élevée que celle du formulaire de recherche */
}

/* Si vous avez un menu déroulant spécifique, assurez-vous qu'il a aussi un z-index élevé */
.dropdown-menu {
  z-index: 50; 
}
</style>
