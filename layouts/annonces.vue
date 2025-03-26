<!-- layouts/annonces.vue -->
<template>
  <div>
    <!-- En-tête du site -->
    <NavBar />
    
    <!-- Contenu principal -->
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Contenu de la page (2/3) -->
        <div class="md:w-2/3 lg:w-3/4">
          <slot />
        </div>
        
        <!-- Barre latérale (1/3) -->
        <div class="md:w-1/3 lg:w-1/4 space-y-6">
          <!-- Publicité supérieure (300x250) -->
          <PubliciteEmplacement 
            emplacement="annonce_sidebar-top" 
            :width="300" 
            :height="250"
            titre="Publicité"
            placeholderText="Bannière<br>Annonce Sidebar Top<br>300 × 250 px"
          />
          
          <!-- Annonce mise en avant -->
          <MiseEnAvantSidebar />
          
          <!-- Publicité inférieure (300x600) -->
          <PubliciteEmplacement 
            emplacement="annonce_sidebar-bottom" 
            :width="300" 
            :height="600"
            titre="Espace publicitaire bas"
            placeholderText="Bannière<br>Annonce Sidebar Bottom<br>300 × 600 px"
          />
        </div>
      </div>
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
import PubliciteEmplacement from '~/components/publicites/PubliciteEmplacement.vue';
</script>