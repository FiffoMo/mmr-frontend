<!-- components/annonces/MiseEnAvantSidebar.vue -->
<template>
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="bg-amber-100 py-2 px-4">
        <h3 class="font-semibold text-amber-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          {{ isBackupAnnonce ? 'Annonce récente' : 'Annonce à la une' }}
        </h3>
      </div>
      
      <div v-if="loading" class="p-4">
        <div class="animate-pulse flex flex-col space-y-3">
          <div class="h-48 bg-gray-200 rounded"></div>
          <div class="h-6 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
      
      <div v-else-if="error" class="p-4 text-red-500 text-sm">
        {{ error }}
      </div>
      
      <div v-else-if="annonce" class="flex flex-col">
        <!-- Image -->
        <div class="relative h-48 bg-gray-100">
          <img 
            v-if="annonce.image_principale" 
            :src="`http://localhost:8055/assets/${annonce.image_principale}`"
            :alt="annonce.Titre || 'Annonce immobilière'" 
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            Pas d'image disponible
          </div>
          
          <!-- Badge selon type d'annonce -->
          <div 
            :class="[
              'absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded',
              isBackupAnnonce ? 'bg-cyan-500' : 'bg-amber-500'
            ]"
          >
            {{ isBackupAnnonce ? 'Nouveauté' : 'Coup de cœur' }}
          </div>
        </div>
        
        <!-- Contenu -->
        <div class="p-4">
          <h4 class="font-bold text-gray-800 mb-2 line-clamp-2">
            {{ annonce.Titre || 'Bien immobilier' }}
          </h4>
          
          <div class="flex justify-between items-center mb-2">
            <span class="text-cyan-600 font-bold">{{ formatPrice(annonce.prix_vente) }}</span>
            <span class="text-gray-500 text-sm">{{ formatArea(annonce.surface_habitable) }}</span>
          </div>
          
          <p class="text-gray-600 text-sm mb-3 line-clamp-2">
            {{ annonce.localisation || 'Emplacement non précisé' }}
          </p>
          
          <NuxtLink 
            :to="`/annonces/detail-${annonce.id}`" 
            class="block text-center bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
          >
            Voir le détail
          </NuxtLink>
        </div>
      </div>
      
      <div v-else class="p-4 text-gray-500 text-sm">
        Aucune annonce disponible pour le moment.
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const annonce = ref(null);
  const loading = ref(true);
  const error = ref(null);
  const isBackupAnnonce = ref(false);
  
  onMounted(async () => {
    try {
      loading.value = true;
      console.log('Vérification des annonces mises en avant...');
      
      // Étape 1: Vérifier s'il y a des mises en avant
      const miseEnAvantResponse = await fetch('/api/directus/items/mise_en_avant?fields=id,annonce&limit=10');
      
      if (!miseEnAvantResponse.ok) {
        console.error(`Erreur de mise en avant: ${miseEnAvantResponse.status}`);
        throw new Error(`Erreur lors de la récupération des mises en avant`);
      }
      
      const miseEnAvantData = await miseEnAvantResponse.json();
      console.log('Données mise en avant:', miseEnAvantData);
      
      // Extraire les IDs d'annonce valides (non null)
      const annonceIds = miseEnAvantData.data
        .filter(item => item.annonce)
        .map(item => item.annonce);
      
      console.log('IDs annonces en mise en avant trouvés:', annonceIds);
      
      // Si nous avons des annonces en mise en avant
      if (annonceIds.length > 0) {
        // Étape 2a: Récupérer la première annonce mise en avant
        const annonceId = annonceIds[0];
        const annonceResponse = await fetch(`/api/directus/items/Annonces/${annonceId}?fields=*`);
        
        if (!annonceResponse.ok) {
          console.error(`Erreur lors de la récupération de l'annonce ${annonceId}: ${annonceResponse.status}`);
          throw new Error(`Erreur lors de la récupération de l'annonce`);
        }
        
        const annonceData = await annonceResponse.json();
        console.log('Annonce mise en avant récupérée:', annonceData);
        
        annonce.value = annonceData.data;
        isBackupAnnonce.value = false;
        console.log('Affichage annonce mise en avant:', annonce.value.id);
      } else {
        // Étape 2b: Pas de mise en avant, utiliser la dernière annonce comme repli
        console.log('Aucune mise en avant trouvée, utilisation d\'une annonce récente...');
        const recentAnnonceResponse = await fetch(`/api/directus/items/Annonces?fields=*&sort=-date_created&limit=1&filter[status][_eq]=published`);
          
        if (!recentAnnonceResponse.ok) {
          throw new Error(`Erreur API: ${recentAnnonceResponse.status}`);
        }
        
        const recentAnnonceData = await recentAnnonceResponse.json();
        console.log('Réponse annonce récente:', recentAnnonceData);
        
        if (recentAnnonceData.data && recentAnnonceData.data.length > 0) {
          annonce.value = recentAnnonceData.data[0];
          isBackupAnnonce.value = true;
          console.log('Annonce récente chargée:', annonce.value.id);
        } else {
          console.log('Aucune annonce trouvée');
        }
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      error.value = 'Impossible de charger l\'annonce';
    } finally {
      loading.value = false;
    }
  });
  
  // Formatter le prix
  const formatPrice = (price) => {
    if (!price) return 'Prix non communiqué';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Formatter la surface
  const formatArea = (area) => {
    if (!area) return '';
    return `${area} m²`;
  };
  </script>