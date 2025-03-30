<template>
    <div class="flex justify-center">
      <!-- Container principal -->
      <div 
        class="pub-container bg-gray-100 rounded-lg overflow-hidden"
        :style="{ width: `${width}px`, height: `${height}px` }"
        v-if="currentPub"
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
      
      <!-- Chargement -->
      <div 
        v-else-if="loading" 
        class="animate-pulse bg-gray-200"
        :style="{ width: `${width}px`, height: `${height}px` }"
      ></div>
      
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
      }
    },
    
    data() {
      return {
        publicites: [],
        currentIndex: 0,
        rotationInterval: null,
        currentPub: null,
        loading: true
      }
    },
    
    async created() {
      // Charger les publicités pour cet emplacement
      await this.fetchPublicites();
      
      // Démarrer la rotation si des publicités sont disponibles
      if (this.publicites.length > 0) {
        this.startRotation();
      }
    },
    
    beforeUnmount() {
      // Arrêter la rotation lorsque le composant est détruit
      this.stopRotation();
    },
    
    methods: {
      // Récupérer les publicités pour cet emplacement
      async fetchPublicites() {
        try {
            this.loading = true;
            console.log(`Chargement des publicités pour l'emplacement: ${this.emplacement}`);
            
            // Utilisons le proxy configuré correctement
            const response = await fetch(`/api/directus/items/publicite?fields=*&filter[emplacement][_eq]=${this.emplacement}&filter[statut_affichage][_eq]=actif&filter[date_debut][_lte]=${new Date().toISOString()}&filter[date_fin][_gte]=${new Date().toISOString()}`);;
            
            if (!response.ok) {
            console.error(`Erreur lors de la récupération des publicités: ${response.status}`);
            return;
            }
            
            const data = await response.json();
            console.log(`Publicités pour ${this.emplacement}:`, data);
            
            if (data.data && data.data.length > 0) {
            this.publicites = data.data;
            // Mélanger les publicités pour une rotation aléatoire mais équitable
            this.shuffleArray(this.publicites);
            this.currentPub = this.publicites[0];
            console.log(`${this.publicites.length} publicités chargées pour ${this.emplacement}`);
            } else {
            console.log(`Aucune publicité trouvée pour l'emplacement ${this.emplacement}`);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des publicités:', error);
        } finally {
            this.loading = false;
        }
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
        // Utiliser l'URL correcte pour les assets Directus
        return `http://localhost:8055/assets/${imageId}`;
      },
      
      // Suivre les impressions
      async trackImpression() {
        // Incrémenter le compteur d'impressions
        if (this.currentPub) {
          try {
            await fetch(`/api/directus/items/publicite/${this.currentPub.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                impressions: (this.currentPub.impressions || 0) + 1
              })
            });
          } catch (error) {
            console.error('Erreur lors du suivi d\'impression:', error);
          }
        }
      },
      
      // Suivre les clics
      async trackClick() {
        // Incrémenter le compteur de clics
        if (this.currentPub) {
          try {
            await fetch(`/api/directus/items/publicite/${this.currentPub.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                clics: (this.currentPub.clics || 0) + 1
              })
            });
          } catch (error) {
            console.error('Erreur lors du suivi de clic:', error);
          }
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