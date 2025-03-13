<template>
  <div class="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
    <iframe 
      v-if="isLoaded"
      width="100%" 
      height="100%" 
      frameborder="0" 
      scrolling="no" 
      marginheight="0" 
      marginwidth="0" 
      :src="mapUrl"
    ></iframe>
    <div v-else class="w-full h-full flex items-center justify-center">
      <p class="text-gray-500">Chargement de la carte...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  location: {
    type: String,
    required: true
  }
});

const mapCoordinates = ref({ lat: 46.5, lon: 4.5 }); // Coordonnées par défaut (France)
const isLoaded = ref(false);

// Obtenir l'URL de la carte
const mapUrl = computed(() => {
  const { lat, lon } = mapCoordinates.value;
  const deltaLat = 0.05;
  const deltaLon = 0.1;
  
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon-deltaLon}%2C${lat-deltaLat}%2C${lon+deltaLon}%2C${lat+deltaLat}&layer=mapnik&marker=${lat}%2C${lon}`;
});

// Charger les coordonnées
onMounted(async () => {
  if (!props.location) {
    isLoaded.value = true;
    return;
  }
  
  try {
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(props.location)}`);
    const data = await response.json();
    
    if (data.success) {
      mapCoordinates.value = {
        lat: data.lat,
        lon: data.lon
      };
    }
  } catch (error) {
    console.error("Erreur de géocodage:", error);
  } finally {
    isLoaded.value = true;
  }
});
</script>