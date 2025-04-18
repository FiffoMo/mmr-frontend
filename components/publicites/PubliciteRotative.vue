<!-- PubliciteRotative.vue avec chargement amélioré -->
<template>
  <div class="flex justify-center">
    <!-- Chargement - Montré jusqu'à ce que les données soient prêtes -->
    <div 
      v-if="loading" 
      class="animate-pulse bg-gray-200"
      :style="{ width: `${width}px`, height: `${height}px` }"
    ></div>
    
    <!-- Container principal - Visible seulement quand une publicité est disponible -->
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
    
    <!-- Aucune publicité trouvée - afficher le placeholder -->
    <div 
      v-else 
      class="flex items-center justify-center bg-gray-200" 
      :style="{ width: `${width}px`, height: `${height}px` }"
    >
      <span class="text-gray-400 text-sm text-center">Format {{ width }}×{{ height }}</span>
    </div>
  </div>
</template>

<script>
import { useDirectusSDK } from '~/composables/useDirectusSDK';

export default {
  name: 'PubliciteRotative',
  
  props: {
    // Emplacement de la publicité (home_top, home_footer, etc.)
    emplacement: {
      type: String,
      required: true
    },
    // Largeur en pixels
    width: {
      type: Number,
      default: 300
    },
    // Hauteur en pixels
    height: {
      type: Number,
      default: 250
    },
    // Afficher le label "Publicité"
    showLabel: {
      type: Boolean,
      default: true
    },
    // Durée d'affichage de chaque publicité (en millisecondes)
    rotationDuration: {
      type: Number,
      default: 5000 // 5 secondes
    },
    // Délai maximal de chargement
    loadingTimeout: {
      type: Number,
      default: 5000 // 5 secondes par défaut
    }
  },

  setup() {
    // Initialiser le service SDK Directus
    const directusSDK = useDirectusSDK();
    
    return {
      directusSDK
    };
  },
  
  data() {
    return {
      publicites: [],
      currentIndex: 0,
      rotationInterval: null,
      currentPub: null,
      loading: true,
      error: null,
      timeoutId: null
    }
  },
  
  async created() {
    // Configurer un timeout pour le chargement
    this.timeoutId = setTimeout(() => {
      if (this.loading) {
        console.log(`PubliciteRotative: Timeout de chargement pour ${this.emplacement} atteint`);
        this.loading = false;
      }
    }, this.loadingTimeout);

    // Pré-sélectionner currentPub comme null pour éviter un flash de contenu vide
    this.currentPub = null;
    
    // Immédiatement appeler fetchPublicites
    this.fetchPublicites().then(() => {
      // Si des publicités sont disponibles, en sélectionner une et démarrer la rotation
      if (this.publicites.length > 0) {
        this.currentIndex = Math.floor(Math.random() * this.publicites.length);
        this.currentPub = this.publicites[this.currentIndex];
        this.startRotation();
      }
    }).catch(error => {
      console.error(`Erreur inattendue lors du chargement des publicités pour ${this.emplacement}:`, error);
    }).finally(() => {
      // Supprimer le timeout de chargement
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      
      // Marquer le chargement comme terminé, qu'il ait réussi ou échoué
      this.loading = false;
    });
  },
  
  beforeUnmount() {
    // Arrêter la rotation lorsque le composant est détruit
    this.stopRotation();
    
    // Nettoyer le timeout s'il existe encore
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  },
  
  methods: {
    // Récupérer les publicités pour cet emplacement avec stratégie de fallback à 3 niveaux
    async fetchPublicites() {
      try {
        const emplacementLowerCase = this.emplacement.toLowerCase();
        console.log(`Chargement des publicités pour l'emplacement: ${emplacementLowerCase}`);
        this.loading = true;
        this.error = null;
        
        // Détecter si nous sommes côté client
        const isClient = typeof window !== 'undefined';
        
        if (isClient) {
          // Code exécuté uniquement côté client (navigateur)
          try {
            const url = `/api/directus/items/publicite`;
            const response = await fetch(url);
            
            if (!response.ok) {
              throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.data) {
              const now = new Date();
              
              // Filtre côté client pour tous les critères
              const filteredData = data.data.filter(pub => {
                return pub.emplacement === emplacementLowerCase &&
                      pub.statut_affichage === 'actif' && 
                      new Date(pub.date_debut) <= now &&
                      new Date(pub.date_fin) >= now;
              });
              
              this.publicites = filteredData;
              console.log(`Publicités récupérées pour ${emplacementLowerCase}: ${this.publicites.length}`);
              
              // Mélanger les publicités pour avoir un ordre aléatoire
              if (this.publicites.length > 1) {
                this.shuffleArray(this.publicites);
              }
              
              // Si des publicités sont trouvées, mettre à jour les impressions
              if (this.publicites.length > 0) {
                this.updateImpressions();
              }
            } else {
              console.warn("La réponse ne contient pas de données valides");
              this.publicites = [];
            }
          } catch (fetchError) {
            console.warn("Erreur de récupération des publicités côté client:", fetchError);
            this.publicites = [];
          }
        } else {
          // Côté serveur, ne rien faire - le composant sera hydraté côté client
          console.log("Exécution côté serveur, l'hydratation côté client récupérera les données");
          this.publicites = [];
        }
      } catch (err) {
        console.error("Erreur lors du chargement des publicités:", err);
        this.error = err.message;
        this.publicites = [];
      }
    },

    // Nouvelle méthode pour traiter les publicités
    processPublicites() {
      // Mélanger les publicités pour avoir un ordre aléatoire
      if (this.publicites.length > 1) {
        this.shuffleArray(this.publicites);
      }
      
      // Si des publicités sont trouvées, mettre à jour les impressions
      if (this.publicites.length > 0) {
        this.updateImpressions();
      }
    },

    updateImpressions() {
      // Mettre à jour les compteurs d'impression pour toutes les publicités affichées
      this.publicites.forEach(pub => {
        try {
          const impressions = (pub.impressions || 0) + 1;
          
          fetch(`/api/directus/items/publicite/${pub.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ impressions })
          }).catch(error => {
            console.warn(`Erreur lors de la mise à jour des impressions pour la pub ${pub.id}:`, error);
          });
        } catch (err) {
          console.warn(`Erreur lors de la mise à jour des impressions:`, err);
        }
      });
    },
            
    // Mélanger un tableau (algorithme de Fisher-Yates)
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    },
    
    // Démarrer la rotation des publicités
    startRotation() {
      // Si une seule publicité ou moins, pas besoin de rotation
      if (this.publicites.length <= 1) {
        return;
      }
      
      this.rotationInterval = setInterval(() => {
        this.rotatePublicite();
      }, this.rotationDuration);
    },
    
    // Arrêter la rotation des publicités
    stopRotation() {
      if (this.rotationInterval) {
        clearInterval(this.rotationInterval);
        this.rotationInterval = null;
      }
    },
        
    // Passer à la publicité suivante
    rotatePublicite() {
      // Passer à la publicité suivante
      this.currentIndex = (this.currentIndex + 1) % this.publicites.length;
      this.currentPub = this.publicites[this.currentIndex];
    },
    
    // Construire l'URL de l'image à partir de l'ID
    getImageUrl(imageId) {
      if (!imageId) return '';
      
      // Vérifier si l'ID contient déjà une extension
      if (imageId.includes('.jpg') || imageId.includes('.png') || imageId.includes('.jpeg') || imageId.includes('.gif') || imageId.includes('.webp')) {
        return `/uploads/${imageId}`;
      }
      
      // Sinon, ajouter une extension par défaut
      return `/uploads/${imageId}.jpg`;
    },
    
    // Suivre les impressions avec stratégie de fallback
    async trackImpression() {
      if (!this.currentPub) return;
      
      try {
        const updatedImpressions = (this.currentPub.impressions || 0) + 1;
        
        // Niveau 1: Utiliser updateItem du SDK
        try {
          await this.directusSDK.updateItem('publicite', this.currentPub.id, {
            impressions: updatedImpressions
          });
          return;
        } catch (sdkError) {
          console.warn('SDK updateItem échoué pour trackImpression:', sdkError);
        }
        
        // Niveau 2: Utiliser fetch direct comme fallback
        await fetch(`/api/directus/items/publicite/${this.currentPub.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            impressions: updatedImpressions
          })
        });
        
        // Mettre à jour localement
        this.currentPub.impressions = updatedImpressions;
      } catch (error) {
        console.error('Erreur lors du suivi d\'impression:', error);
      }
    },
    
    // Suivre les clics avec stratégie de fallback
    async trackClick() {
      if (!this.currentPub) return;
      
      try {
        const updatedClicks = (this.currentPub.clics || 0) + 1;
        
        // Niveau 1: Utiliser updateItem du SDK
        try {
          await this.directusSDK.updateItem('publicite', this.currentPub.id, {
            clics: updatedClicks
          });
          return;
        } catch (sdkError) {
          console.warn('SDK updateItem échoué pour trackClick:', sdkError);
        }
        
        // Niveau 2: Utiliser fetch direct comme fallback
        await fetch(`/api/directus/items/publicite/${this.currentPub.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clics: updatedClicks
          })
        });
        
        // Mettre à jour localement
        this.currentPub.clics = updatedClicks;
      } catch (error) {
        console.error('Erreur lors du suivi de clic:', error);
      }
    }
  }
}
</script>

<style scoped>
.pub-container {
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.pub-link {
  display: block;
  width: 100%;
  height: 100%;
}

.pub-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pub-label {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.6);
  background-color: rgba(255, 255, 255, 0.7);
  padding: 2px 5px;
  border-radius: 2px;
}

/* Animation de chargement */
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>