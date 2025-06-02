<!-- components/home/RecentAnnonces.vue -->
<template>
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Dernières annonces</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Découvrez les dernières propriétés à fort potentiel ajoutées sur notre plateforme
        </p>
      </div>
      
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 6" :key="i" class="animate-pulse bg-gray-200 rounded-lg h-80"></div>
      </div>
      
      <div v-else-if="error" class="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="annonces.length === 0" class="text-center py-10">
        <p class="text-gray-500">Aucune annonce disponible pour le moment</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnnonceCard 
          v-for="annonce in annonces" 
          :key="annonce.id" 
          :annonce="annonce"
        />
      </div>
      
      <div class="text-center mt-10">
        <NuxtLink 
          to="/annonces" 
          class="inline-block py-3 px-6 bg-cyan-500 hover:bg-cyan-700 text-white font-medium rounded-lg transition duration-200"
        >
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

// Utiliser le service centralisé pour la gestion des annonces
const { annonces, loading, error, fetchRecentAnnonces } = useAnnonces();

// Charger les annonces récentes au montage du composant
onMounted(async () => {
  console.log("Montage du composant RecentAnnonces");
  await fetchRecentAnnonces(6); // Limiter à 6 annonces pour la page d'accueil
});
</script>