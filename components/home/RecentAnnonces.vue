<template>
  <section class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Dernières annonces</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Découvrez les biens à fort potentiel locatif récemment ajoutés
        </p>
      </div>
      
      <div v-if="loading" class="text-center py-10">
        <p class="text-gray-500">Chargement des annonces...</p>
      </div>
      
      <div v-else-if="error" class="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <p>{{ error }}</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnnonceCard 
          v-for="annonce in annonces" 
          :key="annonce.id" 
          :annonce="annonce"
        />
      </div>
      
      <div class="text-center mt-8">
        <NuxtLink to="/annonces" class="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-md text-lg font-medium inline-block transition-colors">
          Voir toutes les annonces
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAnnonces } from '~/composables/useAnnonces';
import AnnonceCard from '../annonces/AnnonceCard.vue';

// Utiliser le composable useAnnonces 
const { annonces, loading, error, fetchRecentAnnonces } = useAnnonces();

// Charger les annonces au montage du composant
onMounted(() => {
  fetchRecentAnnonces(9);
});
</script>