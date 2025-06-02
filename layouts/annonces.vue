<!-- layouts/annonces.vue -->
<template>
  <div>
    <!-- En-tête du site -->
    <NavBar />
    
    <!-- Contenu principal -->
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-flow-col lg:gap-8">
        <!-- Contenu de la page (espace variable) -->
        <div class="lg:col-span-auto">
          <!-- C'est ici que le contenu de vos pages sera injecté -->
          <slot></slot>
        </div>
        
        <!-- SIDEBAR - Barre latérale (largeur fixe) -->
        <div class="lg:w-[320px] shrink-0 space-y-6">
          <!-- Publicité supérieure (320x320) -->
          <PubliciteRotative
            emplacement="annonce_sidebar_top" 
            :width="320" 
            :height="320"
            :show-label="true"
            :fallback-content="topAdFallback"
          />
          
          <!-- Annonce mise en avant -->
          <MiseEnAvantSidebar class="mb-6" />
          
          <!-- Publicité inférieure (320x640) -->
          <PubliciteRotative 
            emplacement="annonce_sidebar_bottom" 
            :width="320" 
            :height="640"
            :show-label="true"
            :fallback-content="bottomAdFallback"
          />
        </div>
      </div>
    </div>
    
      <!-- Publicité en bas de la page d'accueil -->
      <div class="my-4 mt-12 mb-12">
      <PubliciteRotative
          emplacement="inside_footer" 
          :width="1030" 
          :height="200"
          :show-label="true"
          :fallback-content="topAdFallback"
        />
    </div>

    <!-- Pied de page -->
    <Footer />
    
    <!-- Bouton d'alerte flottant (présent sur toutes les pages) -->
    <AlerteEmailTrigger />
  </div>
</template>

<script setup>
import NavBar from '~/components/layout/NavBar.vue';
import Footer from '~/components/layout/Footer.vue';
import MiseEnAvantSidebar from '~/components/annonces/MiseEnAvantSidebar.vue';
import AlerteEmailTrigger from '~/components/alertes/AlerteEmailTrigger.vue';
import PubliciteRotative from '~/components/publicites/PubliciteRotative.vue';

// Contenu de fallback pour les publicités
const topAdFallback = `
  <div class="bg-cyan-500 text-white rounded-lg overflow-hidden relative w-full h-full">
    <div class="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
      <div class="text-center p-4">
        <div class="text-2xl font-bold mb-2">VOTRE PUB ICI</div>
        <div class="text-sm">Donnez du poids à votre communication
          <br><br><br>
          Annonce Sidebar Top<br>
          Format 320 x 320</div>
        </div>
      </div>
    </div>
  </div>  
`;

const bottomAdFallback = `
  <div class="bg-cyan-500 text-white rounded-lg overflow-hidden relative w-full h-full">
    <div class="w-full h-full bg-gradient-to-b from-cyan-500 to-blue-600 flex items-center justify-center">
      <div class="text-center p-4">
        <div class="text-2xl font-bold mb-2">VOTRE PUB ICI</div>
        <div class="text-sm mb-8">Donnez de la hauteur à votre communication
          <br><br><br>
          Annonce Sidebar Bottom<br>
          Format 320 x 640</div>
        </div>
      </div>
    </div>
  </div>  
`;
</script>