<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="relative">
      <img 
        :src="annonce.image || 'https://placehold.co/600x400?text=Aucune+image'" 
        alt="Photo de bien immobilier" 
        class="w-full h-48 object-cover"
      />
      <div 
        v-if="annonce.featured" 
        class="absolute top-0 left-0 bg-yellow-500 text-white px-3 py-1 text-sm font-semibold"
      >
        Coup de cœur
      </div>
      <div class="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-semibold">
        {{ formatPrice(annonce.rental_income) }}/mois
      </div>
    </div>
    
    <div class="p-4">
      <div class="flex justify-between items-start">
        <h3 class="text-lg font-semibold line-clamp-1">{{ annonce.title }}</h3>
        <p class="text-xl font-bold text-blue-600">{{ formatPrice(annonce.price) }}</p>
      </div>
      
      <p class="text-gray-600 text-sm mt-1">{{ annonce.location }}</p>
      
      <div class="flex mt-3 text-gray-600 text-sm space-x-4">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {{ annonce.surface }} m²
        </div>
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
          </svg>
          {{ annonce.bedrooms }} ch.
        </div>
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatDate(annonce.created_at) }}
        </div>
      </div>
      
      <div class="mt-3 bg-green-50 p-2 rounded-md">
        <p class="text-sm text-green-700 font-medium">Rendement: {{ calculateYield(annonce.price, annonce.rental_income) }}%</p>
      </div>
      
      <div class="mt-4">
        <NuxtLink :to="`/annonces/${annonce.id}`" class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
          Voir le détail
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  annonce: {
    type: Object,
    required: true
  }
});

// Formater le prix (ex: 250000 -> 250 000 €)
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
    .format(price)
    .replace(',00', '');
};

// Calculer le rendement brut annuel
const calculateYield = (price, monthlyRent) => {
  if (!price || !monthlyRent || price === 0) return '0';
  const annualRent = monthlyRent * 12;
  const yieldPercent = (annualRent / price) * 100;
  return yieldPercent.toFixed(2);
};

// Formater la date (ex: 2023-08-15 -> 15/08/2023)
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR').format(date);
};
</script>