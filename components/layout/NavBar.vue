<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <NuxtLink to="/"><img src="~/assets/images/logo_mmr_150.png" alt="Constructions"></NuxtLink>

        <!-- Navigation principale - version desktop -->
        <!-- Navigation -->
        <nav class="hidden md:flex space-x-6">
          <NuxtLink to="/annonces" class="text-gray-700 hover:text-cyan-600">Tous les biens</NuxtLink>
          <NuxtLink to="/annonces?category=maisons" class="text-gray-700 hover:text-cyan-600">Maisons</NuxtLink>
          <NuxtLink to="/annonces?category=immeubles" class="text-gray-700 hover:text-cyan-600">Immeubles</NuxtLink>
          <!-- Menu déroulant "Autres" -->
          <div class="relative">
            <button 
              @click="toggleDropdown" 
              class="text-gray-700 hover:text-cyan-600 flex items-center"
            >
              Autres
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              v-show="isDropdownOpen" 
              class="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-10"
              @mouseleave="isDropdownOpen = false"
            >
              <NuxtLink to="/annonces?category=appartements" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Appartements</NuxtLink>
              <NuxtLink to="/annonces?category=construction" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Constructions</NuxtLink>
              <NuxtLink to="/annonces?category=demeures" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Demeures</NuxtLink>
              <NuxtLink to="/annonces?category=maisons_dhote" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Maisons d'hôte</NuxtLink>
            </div>
          </div>
          
          <span class="text-gray-300">|</span>
          <!-- ajout phil  -->
          <div class="relative">
            <button 
              @click="toggleDropdown" 
              class="text-gray-700 hover:text-cyan-600 flex items-center"
            >
              Services
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              v-show="isDropdownOpen" 
              class="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-10"
              @mouseleave="isDropdownOpen = false"
            >
              <NuxtLink to="/about" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">A propos</NuxtLink>
              <NuxtLink to="/faq" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">FAQ</NuxtLink>
              <NuxtLink to="/testimonials" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Témoignages</NuxtLink>
            </div>
          </div>
          <!-- fin ajout phil -->
          <NuxtLink to="/articles" class="text-gray-700 hover:text-cyan-600">Articles utiles</NuxtLink>
          <NuxtLink to="/tarifs" class="text-gray-700 hover:text-cyan-600">Tarifs</NuxtLink>
          <NuxtLink to="/publicite" class="text-gray-700 hover:text-cyan-600">Pub</NuxtLink>
          <NuxtLink to="/contact" class="text-gray-700 hover:bg-cyan-50">Contact</NuxtLink>
        </nav>

        <!-- Actions utilisateur -->
        <div class="flex items-center space-x-4">
          <NuxtLink to="/annonces/ajouter" class="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600">
            + Ajouter une annonce
          </NuxtLink>
          <NuxtLink to="/login" class="hover:text-blue-600">Connexion</NuxtLink>
          <!-- Panier (à implémenter avec Stripe) -->
          <button class="relative">
            <span class="sr-only">Panier</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <!-- Indicateur du nombre d'articles -->
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
          </button>
          
          <!-- Menu mobile (hamburger) -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menu mobile -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4">
        <nav class="flex flex-col space-y-4">
          <NuxtLink to="/annonces/maisons" class="hover:text-blue-600">Maisons</NuxtLink>
          <NuxtLink to="/annonces/appartements" class="hover:text-blue-600">Appartements</NuxtLink>
          <NuxtLink to="/annonces/immeubles" class="hover:text-blue-600">Immeubles</NuxtLink>
          <NuxtLink to="/annonces/constructions" class="hover:text-blue-600">Constructions</NuxtLink>
          <NuxtLink to="/blog" class="hover:text-blue-600">Articles</NuxtLink>
          <NuxtLink to="/tarifs" class="hover:text-blue-600">Tarifs</NuxtLink>
          <NuxtLink to="/publicite" class="hover:text-blue-600">Pub</NuxtLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const mobileMenuOpen = ref(false);

const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Fermer le menu au clic à l'extérieur
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      isDropdownOpen.value = false;
    }
  });
});
</script>

<style scoped>
.nav {
  position: relative;
  z-index: 50;
}
</style>
