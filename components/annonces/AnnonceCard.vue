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
        <NuxtLink :to="`/annonces/detail-${annonce.id}`" class="text-cyan-500 hover:text-cyan-700 font-medium">
          Voir le bien
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAnnonces } from '~/composables/useAnnonces';

// Récupérer le composable useAnnonces
const { isCoupDeCoeur } = useAnnonces();

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