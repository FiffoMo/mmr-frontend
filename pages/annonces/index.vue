<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">
      {{ categoryTitle }}
    </h1>
    
    <div v-if="loading" class="text-center py-10">
      <p class="text-gray-500">Chargement des annonces...</p>
    </div>
    
    <div v-else-if="error" class="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="annonces.length === 0" class="text-center py-10">
      <p class="text-gray-500">Aucune annonce trouvée pour cette catégorie</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <AnnonceCard 
        v-for="annonce in annonces" 
        :key="annonce.id" 
        :annonce="annonce"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import AnnonceCard from '~/components/annonces/AnnonceCard.vue';

const route = useRoute();
const category = computed(() => route.query.category || null);

const annonces = ref([]);
const loading = ref(true);
const error = ref(null);

const categoryTitle = computed(() => {
  const titles = {
    'maisons': 'Maisons',
    'immeubles': 'Immeubles',
    'constructions': 'Constructions',
    'maisons_dhote': 'Maisons d\'hôte'
  };
  
  return category.value ? titles[category.value] || 'Annonces' : 'Toutes les annonces';
});

const fetchAnnonces = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    let url = '/api/annonces';
    if (category.value) {
      url += `?category=${category.value}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      annonces.value = data.annonces;
    } else {
      error.value = data.error || 'Erreur lors du chargement des annonces';
    }
  } catch (err) {
    console.error('Erreur:', err);
    error.value = err.message || 'Erreur lors du chargement des annonces';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAnnonces);

// Recharger les annonces quand la catégorie change
watch(category, fetchAnnonces);
</script>