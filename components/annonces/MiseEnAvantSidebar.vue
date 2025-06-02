<!-- components/annonces/MiseEnAvantSidebar.vue -->
<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="bg-amber-100 py-2 px-4">
      <h3 class="font-semibold text-amber-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        {{ isBackupItem ? 'Annonce récente' : 'Annonce à la une' }}
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
    
    <div v-else-if="currentItem" class="flex flex-col">
      <!-- Image -->
      <div class="relative h-48 bg-gray-100">
        <img 
          v-if="currentItem.image_principale" 
          :src="`http://localhost:8055/assets/${currentItem.image_principale}`"
          :alt="currentItem.Titre || 'Annonce immobilière'" 
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
          Pas d'image disponible
        </div>
        
        <!-- Badge selon type d'annonce -->
        <div 
          :class="[
            'absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded',
            isBackupItem ? 'bg-cyan-500' : 'bg-amber-500'
          ]"
        >
          {{ isBackupItem ? 'Nouveauté' : 'Coup de cœur' }}
        </div>
      </div>
      
      <!-- Contenu -->
      <div class="p-4">
        <h4 class="font-bold text-gray-800 mb-2 line-clamp-2">
          {{ currentItem.Titre || 'Bien immobilier' }}
        </h4>
        
        <div class="flex justify-between items-center mb-2">
          <span class="text-cyan-600 font-bold">{{ formatPrice(currentItem.prix_vente) }}</span>
          <span class="text-gray-500 text-sm">{{ formatArea(currentItem.surface_habitable) }}</span>
        </div>
        
        <p class="text-gray-600 text-sm mb-3 line-clamp-2">
          {{ currentItem.localisation || 'Emplacement non précisé' }}
        </p>
        
        <NuxtLink 
          :to="`/annonces/detail-${currentItem.id}`" 
          class="block text-center bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          Voir le détail
        </NuxtLink>
      </div>
    </div>
    
    <div v-else class="p-4 text-gray-500 text-sm">
      Aucune annonce disponible pour le moment.
    </div>

    <!-- Bouton de débogage (en développement seulement) -->
    <!-- <div v-if="isDev" class="p-2 bg-gray-50 text-xs">
      <button @click="debugRotation" class="text-blue-600 underline">
        Debug rotation ({{ debugInfo }})
      </button>
    </div> -->
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRotationManager } from '~/composables/useRotationManager'

// Vérifier si on est en mode développement
const isDev = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  }
  return false
})

// Utiliser le gestionnaire de rotation pour les mises en avant
const {
  currentItem,
  loading,
  error,
  isBackupItem,
  loadCurrentItem,
  getDebugInfo
} = useRotationManager('mise_en_avant', fetchMiseEnAvantItems)

// Info de debug
const debugInfo = computed(() => {
  if (!isDev.value) return ''
  try {
    const debug = getDebugInfo()
    return `${debug.position + 1}/${debug.rotation.length}`
  } catch {
    return 'N/A'
  }
})

/**
 * Récupère la liste des annonces mises en avant
 */
async function fetchMiseEnAvantItems() {
  const response = await fetch('/api/directus/items/mise_en_avant?fields=id,annonce&limit=100')
  if (!response.ok) {
    throw new Error(`Erreur API mise en avant: ${response.status}`)
  }
  const data = await response.json()
  return data.data.filter(item => item.annonce) // Filtrer les items avec annonce valide
}

/**
 * Récupère les données complètes d'une annonce
 */
async function fetchFullAnnonce(annonceId) {
  const response = await fetch(`/api/directus/items/Annonces/${annonceId}?fields=*`)
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de l'annonce ${annonceId}`)
  }
  const data = await response.json()
  return data.data
}

/**
 * Solution de repli : récupérer une annonce récente
 */
async function fetchRecentAnnonce() {
  // Utiliser une requête sans tri par date_created pour éviter l'erreur 403
  const response = await fetch('/api/directus/items/Annonces?fields=*&limit=1&filter[status][_eq]=published')
  if (!response.ok) {
    throw new Error(`Erreur API annonces récentes: ${response.status}`)
  }
  const data = await response.json()
  return data.data && data.data.length > 0 ? data.data[0] : null
}

// Formatters
const formatPrice = (price) => {
  if (!price) return 'Prix non communiqué'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price)
}

const formatArea = (area) => {
  if (!area) return ''
  return `${area} m²`
}

// Fonction de débogage
const debugRotation = () => {
  console.log('Debug info:', getDebugInfo())
}

// Charger l'annonce au montage du composant
onMounted(() => {
  loadCurrentItem(fetchFullAnnonce, fetchRecentAnnonce)
})
</script>