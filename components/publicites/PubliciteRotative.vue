<!-- PubliciteRotative.vue - Version avec rotation équitable -->
<template>
  <div class="flex justify-center">
    <!-- Chargement -->
    <div 
      v-if="loading" 
      class="animate-pulse bg-gray-200"
      :style="{ width: `${width}px`, height: `${height}px` }"
    ></div>
    
    <!-- Container principal -->
    <div 
      v-else-if="currentPub"
      class="pub-container bg-gray-100 rounded-lg overflow-hidden"
      :style="{ width: `${width}px`, height: `${height}px` }"
    >
      <!-- Lien cliquable si URL présente -->
      <a 
        v-if="currentPub.url" 
        :href="currentPub.url" 
        target="_blank" 
        rel="noopener noreferrer" 
        @click="trackClick"
        class="pub-link"
      >
        <img 
          v-if="currentPub.image" 
          :src="getImageUrl(currentPub.image)" 
          :alt="currentPub.titre || 'Publicité'" 
          class="pub-image w-full h-full object-cover"
          @load="trackImpression"
        />
        <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
          {{ currentPub.titre || 'Publicité' }}
        </div>
      </a>
      
      <!-- Affichage simple sans lien -->
      <div v-else class="w-full h-full">
        <img 
          v-if="currentPub.image" 
          :src="getImageUrl(currentPub.image)" 
          :alt="currentPub.titre || 'Publicité'" 
          class="w-full h-full object-cover"
          @load="trackImpression"
        />
        <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
          {{ currentPub.titre || 'Publicité' }}
        </div>
      </div>
      
      <div class="pub-label" v-if="showLabel">Publicité</div>
    </div>
    
    <!-- Contenu de fallback personnalisé -->
    <div 
      v-else-if="fallbackContent" 
      class="pub-container relative"
      :style="{ width: `${width}px`, height: `${height}px` }"
    >
      <div v-html="fallbackContent" class="w-full h-full"></div>
      <div class="pub-label" v-if="showLabel">Publicité</div>
    </div>
    
    <!-- Aucune publicité trouvée -->
    <div 
      v-else 
      class="flex items-center justify-center bg-gray-200 rounded-lg" 
      :style="{ width: `${width}px`, height: `${height}px` }"
    >
      <span class="text-gray-400 text-sm text-center">Format {{ width }}×{{ height }}</span>
    </div>

    <!-- Debug info (en développement) -->
    <div v-if="isDev && useEquitableRotation && debugInfo" class="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1 z-10 rounded">
      {{ debugInfo }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useDirectusSDK } from '~/composables/useDirectusSDK'
import { useRotationManager } from '~/composables/useRotationManager'

export default {
  name: 'PubliciteRotative',
  
  props: {
    emplacement: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      default: 320
    },
    height: {
      type: Number,
      default: 360
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    fallbackContent: {
      type: String,
      default: null
    }
  },

  setup(props) {
    const directusSDK = useDirectusSDK()
    
    // Détection du mode développement
    const isDev = computed(() => {
      if (typeof window !== 'undefined') {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      }
      return false
    })
    
    // Fonction unique pour récupérer les publicités
    const fetchPublicites = async () => {
      const response = await fetch(`/api/directus/items/publicite`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      const now = new Date()
      
      // Filtrer les publicités selon l'emplacement, le statut et les dates
      return data.data
        .filter(pub => {
          // Vérifier à la fois statut_affichage et status pour compatibilité
          const statusOk = (pub.statut_affichage === 'actif') || (pub.status === 'active');
          const datesOk = new Date(pub.date_debut) <= now && new Date(pub.date_fin) >= now;
          
          return pub.emplacement === props.emplacement && statusOk && datesOk;
        })
        .map(pub => pub.id) // Retourner seulement les IDs pour la rotation
    }
    
    // Utiliser le gestionnaire de rotation équitable
    const rotationManager = useRotationManager(`publicite_${props.emplacement}`, fetchPublicites)

    // Info de debug pour la rotation équitable
    const debugInfo = computed(() => {
      if (!rotationManager) return ''
      try {
        const debug = rotationManager.getDebugInfo()
        return `Pub ${debug.position + 1}/${debug.rotation.length}`
      } catch {
        return 'N/A'
      }
    })
    
    return {
      directusSDK,
      rotationManager,
      isDev,
      debugInfo
    }
  },
  
  data() {
    return {
      currentPub: null,
      loading: true,
      error: null
    }
  },
  
  async created() {
    await this.initRotation()
  },
  
  methods: {
    async initRotation() {
      try {
        this.loading = true
        
        // Fonction pour récupérer une publicité complète par ID
        const fetchFullPublicite = async (pubId) => {
          try {
            const response = await fetch(`/api/directus/items/publicite/${pubId}`)
            if (!response.ok) {
              throw new Error(`Erreur lors de la récupération de la publicité ${pubId}`)
            }
            const data = await response.json()
            return data.data
          } catch (err) {
            console.error(`Erreur lors de la récupération de la publicité ${pubId}:`, err)
            throw err
          }
        }
        
        // Charger la publicité courante avec rotation équitable
        await this.rotationManager.loadCurrentItem(fetchFullPublicite)
        
        // Récupérer la publicité du gestionnaire
        this.currentPub = this.rotationManager.currentItem.value
        this.error = this.rotationManager.error.value
        
        // Tracker l'impression si on a une publicité
        if (this.currentPub) {
          this.trackImpression()
        }
        
      } catch (err) {
        console.error(`Erreur lors du chargement des publicités pour ${this.emplacement}:`, err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    
    getImageUrl(imageId) {
      if (!imageId) return ''
      
      if (imageId.includes('.jpg') || imageId.includes('.png') || imageId.includes('.jpeg') || imageId.includes('.gif') || imageId.includes('.webp')) {
        return `/uploads/${imageId}`
      }
      
      return `/uploads/${imageId}.jpg`
    },
    
    async trackImpression() {
      if (!this.currentPub) return
      
      try {
        const updatedImpressions = (this.currentPub.impressions || 0) + 1
        
        try {
          await this.directusSDK.updateItem('publicite', this.currentPub.id, {
            impressions: updatedImpressions
          })
          this.currentPub.impressions = updatedImpressions
          return
        } catch (sdkError) {
          console.warn('SDK updateItem échoué pour trackImpression:', sdkError)
        }
        
        await fetch(`/api/directus/items/publicite/${this.currentPub.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            impressions: updatedImpressions
          })
        })
        
        this.currentPub.impressions = updatedImpressions
      } catch (error) {
        console.error('Erreur lors du suivi d\'impression:', error)
      }
    },
    
    async trackClick() {
      if (!this.currentPub) return
      
      try {
        const updatedClicks = (this.currentPub.clics || 0) + 1
        
        try {
          await this.directusSDK.updateItem('publicite', this.currentPub.id, {
            clics: updatedClicks
          })
          this.currentPub.clics = updatedClicks
          return
        } catch (sdkError) {
          console.warn('SDK updateItem échoué pour trackClick:', sdkError)
        }
        
        await fetch(`/api/directus/items/publicite/${this.currentPub.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clics: updatedClicks
          })
        })
        
        this.currentPub.clics = updatedClicks
      } catch (error) {
        console.error('Erreur lors du suivi de clic:', error)
      }
    }
  }
}
</script>