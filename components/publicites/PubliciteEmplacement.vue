<!-- components/publicites/PubliciteEmplacement.vue -->
<template>
  <div class="bg-gray-100 rounded-lg overflow-hidden">
    <div class="bg-gray-200 p-1 text-xs text-gray-500 text-center">{{ titre }}</div>
    
    <!-- Chargement -->
    <div v-if="loading" class="flex items-center justify-center" :style="{ height: `${height}px` }">
      <div class="animate-pulse bg-gray-200 w-full h-full"></div>
    </div>
    
    <!-- Publicité trouvée -->
    <div v-else-if="publicite" class="w-full" :style="{ height: `${height}px` }">
      <!-- Si l'élément a un lien -->
      <a v-if="publicite.lien" :href="publicite.lien" target="_blank" class="block w-full h-full">
        <img 
          v-if="publicite.image" 
          :src="`http://localhost:8055/assets/${publicite.image}`"
          :alt="publicite.titre || titre" 
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
          {{ publicite.titre || titre }}
        </div>
      </a>
      
      <!-- Si l'élément n'a pas de lien -->
      <div v-else class="w-full h-full">
        <img 
          v-if="publicite.image" 
          :src="`http://localhost:8055/assets/${publicite.image}`"
          :alt="publicite.titre || titre" 
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
          {{ publicite.titre || titre }}
        </div>
      </div>
    </div>
    
    <!-- Aucune publicité trouvée - afficher le placeholder -->
    <div v-else class="flex items-center justify-center" :style="{ height: `${height}px` }">
      <span class="text-gray-400 text-sm text-center" v-html="placeholderText || `Format ${width}×${height}`"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Props
const props = defineProps({
  emplacement: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: 300
  },
  height: {
    type: Number,
    default: 250
  },
  titre: {
    type: String,
    default: 'Publicité'
  },
  placeholderText: {
    type: String,
    default: ''
  }
});

const publicite = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    loading.value = true;
    console.log(`Chargement de la publicité pour l'emplacement: ${props.emplacement}`);
    
    // Rechercher une publicité active pour cet emplacement
    const response = await fetch(`/api/directus/items/publicite?fields=*&filter[emplacement][_eq]=${props.emplacement}&filter[status][_eq]=active&limit=1`);
    
    if (!response.ok) {
      console.error(`Erreur lors de la récupération de la publicité: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log(`Publicités pour ${props.emplacement}:`, data);
    
    if (data.data && data.data.length > 0) {
      publicite.value = data.data[0];
      console.log(`Publicité chargée pour ${props.emplacement}:`, publicite.value.id);
    } else {
      console.log(`Aucune publicité trouvée pour l'emplacement ${props.emplacement}`);
    }
  } catch (err) {
    console.error('Erreur lors du chargement de la publicité:', err);
  } finally {
    loading.value = false;
  }
});
</script>