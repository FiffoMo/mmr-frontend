<template>
  <section class="py-12">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold">Dernières annonces</h2>
        <NuxtLink 
          to="/annonces" 
          class="text-blue-600 hover:text-blue-800 flex items-center"
        >
          Voir toutes les annonces
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnnonceCard 
          v-for="annonce in recentAnnonces" 
          :key="annonce.id" 
          :annonce="annonce"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import AnnonceCard from '~/components/annonces/AnnonceCard.vue';

// Données mockées pour les annonces récentes
// Dans une vraie application, ces données viendraient de l'API Directus
const recentAnnonces = [
  {
    id: 1,
    title: 'Maison contemporaine avec vue',
    location: 'Aix-en-Provence, 13100',
    price: 390000,
    rental_income: 1200,
    surface: 140,
    bedrooms: 4,
    created_at: '2025-03-01',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 2,
    title: 'Appartement T3 centre-ville',
    location: 'Lyon, 69002',
    price: 245000,
    rental_income: 950,
    surface: 68,
    bedrooms: 2,
    created_at: '2025-03-02',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    title: 'Immeuble de rapport 4 appartements',
    location: 'Nantes, 44000',
    price: 620000,
    rental_income: 2800,
    surface: 320,
    bedrooms: 8,
    created_at: '2025-03-03',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];
</script>