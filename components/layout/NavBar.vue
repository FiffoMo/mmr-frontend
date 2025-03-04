<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <NuxtLink to="/" class="text-2xl font-bold text-blue-600">MMR</NuxtLink>

        <!-- Navigation principale - version desktop -->
        <nav class="hidden md:flex space-x-6">
          <NuxtLink to="/annonces/maisons" class="hover:text-blue-600">Maisons</NuxtLink>
          <NuxtLink to="/annonces/appartements" class="hover:text-blue-600">Appartements</NuxtLink>
          <NuxtLink to="/annonces/immeubles" class="hover:text-blue-600">Immeubles</NuxtLink>
          <NuxtLink to="/annonces/constructions" class="hover:text-blue-600">Constructions</NuxtLink>
          <NuxtLink to="/blog" class="hover:text-blue-600">Articles</NuxtLink>
          <NuxtLink to="/tarifs" class="hover:text-blue-600">Tarifs</NuxtLink>
          <NuxtLink to="/publicite" class="hover:text-blue-600">Pub</NuxtLink>
        </nav>

        <!-- Actions utilisateur -->
        <div class="flex items-center space-x-4">
          <NuxtLink to="/annonces/ajouter" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
</script>