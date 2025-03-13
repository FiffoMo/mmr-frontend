<template>
  <section class="py-16 bg-amber-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Nos coups de cœur</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Découvrez notre sélection de biens exceptionnels à fort potentiel
        </p>
      </div>
      
      <div v-if="loading" class="text-center py-10">
        <p class="text-gray-500">Chargement des coups de cœur...</p>
      </div>
      
      <div v-else-if="error" class="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="coupsDeCoeur.length === 0" class="text-center py-10">
        <p class="text-gray-500">Aucun coup de cœur disponible pour le moment</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnnonceCard 
          v-for="annonce in coupsDeCoeur" 
          :key="annonce.id" 
          :annonce="annonce"
          force-coup-de-coeur
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAnnonces } from '~/composables/useAnnonces';
import AnnonceCard from '../annonces/AnnonceCard.vue';

// Utiliser le service centralisé
const { coupsDeCoeur, loading, error, fetchCoupsDeCoeur } = useAnnonces();

// Charger les coups de coeur au montage du composant
onMounted(() => {
  fetchCoupsDeCoeur();
});
</script>