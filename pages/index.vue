<template>
  <div>
    <!-- Hero Slider -->
    <HeroSlider />
    
    <!-- Barre de recherche -->
    <div class="container mx-auto">
      <SearchBar />
    </div>

    <!-- Publicité en haut de la page d'accueil -->
    <div class="my-4 mt-10">
      <!-- Publicité supérieure (1030x200) -->
        <PubliciteRotative
          emplacement="home_top" 
          :width="1030" 
          :height="200"
          :show-label="true"
          :fallback-content="topAdFallback"
        />
    </div>

    <!-- Présentation du concept MMR -->
    <section class="py-16 container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Bienvenue sur Ma Maison Rapporte</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Le premier portail immobilier dédié aux biens avec potentiel locatif.
          Vendez votre bien en valorisant son rendement potentiel et attirez des investisseurs sérieux.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div class="text-center p-6 bg-slate-100 rounded-lg shadow-md">
          <div class="bg-cyan-100 text-amber-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Visibilité maximale</h3>
          <p class="text-gray-600">
            Touchez une audience ciblée d'investisseurs à la recherche de biens avec un potentiel de rendement locatif.
          </p>
        </div>
        
        <div class="text-center p-6 bg-slate-100 rounded-lg shadow-md">
          <div class="bg-cyan-100 text-amber-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Vente plus rapide</h3>
          <p class="text-gray-600">
            En mettant en avant le potentiel locatif, vous attirerez des acheteurs décidés et réduirez le temps de vente.
          </p>
        </div>
        
        <div class="text-center p-6 bg-slate-100 rounded-lg shadow-md">
          <div class="bg-cyan-100 text-amber-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Outils spécialisés</h3>
          <p class="text-gray-600">
            Nos outils vous permettent de mettre en valeur le potentiel de rendement de votre bien pour attirer les bons acheteurs.
          </p>
        </div>
      </div>
    </section>
    
    <!-- Catégories -->
    <CategoryBrowser />

    <!-- Coups de coeur -->
    <MiseEnAvant />
    
    <!-- Annonces récentes -->
    <RecentAnnonces />
    
    <!-- Forfaits -->
    <PricingSection />

     <!-- Forfaits -->
    <!-- <TemoignageClient /> -->

    <!-- Publicité en bas de la page d'accueil -->
    <div class="my-4 mt-10">
      <PubliciteRotative
          emplacement="home_footer" 
          :width="1030" 
          :height="200"
          :show-label="true"
          :fallback-content="topAdFallback"
        />
    </div>

    <!-- Alertes email - Nouvelle section -->
    <div class="container mx-auto mt-10 mb-20">
      <AlerteEmailTrigger />
    </div>
    
    <!-- Call-to-action -->
    <section class="py-16 bg-cyan-500 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">Prêt à vendre votre bien avec son potentiel locatif ?</h2>
        <p class="text-xl mb-8 max-w-3xl mx-auto">
          Rejoignez les milliers de vendeurs qui ont trouvé leur acheteur sur Ma Maison Rapporte.
        </p>
        <NuxtLink 
        to="/dashboard/annonces/createAnnonce" class="bg-white text-cyan-500 hover:bg-cyan-50 px-8 py-3 rounded-md text-lg font-medium inline-block transition-colors"
        >
          Déposer mon annonce
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import HeroSlider from '~/components/home/HeroSlider.vue';
import SearchBar from '~/components/home/SearchBar.vue';
import CategoryBrowser from '~/components/home/CategoryBrowser.vue';
import MiseEnAvant from '~/components/home/MiseEnAvant.vue';
import RecentAnnonces from '~/components/home/RecentAnnonces.vue';
import PricingSection from '~/components/home/PricingSection.vue';
import AlerteEmailTrigger from '~/components/alertes/AlerteEmailTrigger.vue';
import TemoignageClient from '~/components/home/TemoignageClient.vue';
import PubliciteRotative from '~/components/publicites/PubliciteRotative.vue';
import { ref } from 'vue';

const topAdFallback = ref(`
  <div class="bg-cyan-500 text-white rounded-lg overflow-hidden relative w-full h-full">
    <div class="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
      <div class="text-center p-4">
        <div class="text-2xl font-bold mb-2">VOTRE PUB ICI</div>
        <div class="text-sm">Donnez du poids à votre communication
          <br><br><br>
          Annonce HOME TOP<br>
          Format 1030 x 2000</div>
        </div>
      </div>
    </div>
  </div>  
`);

</script>
