<!-- components/settings/HighlightTab.vue -->
<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Mise en avant de mes annonces</h2>
    
    <!-- Message de chargement -->
    <div v-if="loading || apiLoading" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <p class="text-gray-600">Chargement des informations...</p>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="error || apiError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      <p class="font-medium">Une erreur est survenue</p>
      <p class="text-sm">{{ error || apiError }}</p>
      <button 
        @click="fetchHighlightData" 
        class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
      >
        Réessayer
      </button>
    </div>
    
    <!-- Pas de mise en avant active -->
    <div v-else-if="highlights.length === 0" class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
      <p class="font-medium">Vous n'avez pas de mise en avant active</p>
      <p class="text-sm">Contactez l'administrateur pour acheter ce service et mettre en avant une de vos annonces sur la page d'accueil.</p>
    </div>
    
    <!-- Liste des mises en avant actives -->
    <div v-else class="space-y-8">
      <!-- Section pour chaque mise en avant -->
      <div v-for="highlight in highlights" :key="highlight.id" class="space-y-6 bg-slate-200 p-6 rounded-lg border border-gray-200 shadow-sm">
        <!-- En-tête avec info sur la commande -->
        <div :class="highlight.isExpired ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-green-50 border-green-200 text-green-700'" class="px-4 py-3 rounded mb-6 border">
          <div class="flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
            <div>
              <p class="font-medium">
                Forfait Mise en Avant - N° commande {{ highlight.commande.reference || highlight.commande.id }}
              </p>
              <p class="text-sm" v-if="!highlight.isExpired">
                Actif jusqu'au {{ formatDate(highlight.date_expiration) }}
              </p>
              <p class="text-sm" v-else>
                Expiré le {{ formatDate(highlight.date_expiration) }}
              </p>
            </div>
            <div v-if="!highlight.isExpired" class="bg-white px-3 py-1 rounded-full text-green-800 text-sm font-medium">
              {{ highlight.daysLeft }} jours restants
            </div>
            <div v-else class="bg-white px-3 py-1 rounded-full text-yellow-800 text-sm font-medium">
              Expiré
            </div>
          </div>
        </div>
        
        <!-- Contenu de la mise en avant: choix de l'annonce -->
        <div v-if="!highlight.isExpired">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Choisir l'annonce à mettre en avant</h3>
          
          <div v-if="loadingAnnonces" class="text-center py-4">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500 mb-2"></div>
            <p class="text-gray-600 text-sm">Chargement de vos annonces...</p>
          </div>
          
          <div v-else-if="annonces.length === 0" class="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded mb-6">
            <p class="font-medium">Aucune annonce disponible</p>
            <p class="text-sm">Vous n'avez pas d'annonces actives à mettre en avant.</p>
          </div>
          
          <div v-else>
            <div class="mb-4">
              <label :for="'annonce-select-' + highlight.id" class="block text-sm font-medium text-gray-700 mb-1">
                Sélectionnez l'annonce à mettre en avant
              </label>
              <select
                :id="'annonce-select-' + highlight.id"
                v-model="highlight.selectedAnnonceId"
                class="block w-full h-10 px-3 rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
              >
                <option v-for="annonce in annonces" :key="annonce.id" :value="annonce.id">
                  {{ annonce.titre }} - {{ formatPrice(annonce.prix) }}
                </option>
              </select>
            </div>
            
            <!-- Aperçu de l'annonce sélectionnée -->
            <div v-if="getSelectedAnnonce(highlight)" class="bg-white p-4 rounded-md border border-gray-200 mb-4">
              <h4 class="text-md font-medium text-gray-900 mb-2">Aperçu de l'annonce sélectionnée</h4>
              <div class="flex items-center">
                <div class="w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-3">
                  <img 
                    v-if="getSelectedAnnonce(highlight).image_principale" 
                    :src="getImageUrl(getSelectedAnnonce(highlight).image_principale)" 
                    alt="Image" 
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ getSelectedAnnonce(highlight).titre }}</p>
                  <p class="text-sm text-gray-500">{{ getSelectedAnnonce(highlight).localisation }}</p>
                  <p class="text-md font-medium text-cyan-600">{{ formatPrice(getSelectedAnnonce(highlight).prix) }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Message de sauvegarde -->
          <div v-if="highlight.saveMessage" class="mt-4" :class="highlight.saveError ? 'text-red-600' : 'text-green-600'">
            {{ highlight.saveMessage }}
          </div>
          
          <!-- Boutons d'action -->
          <div class="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="updateHighlight(highlight)"
              :disabled="saving || !highlight.selectedAnnonceId || highlight.selectedAnnonceId === highlight.annonce?.id"
              class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center disabled:opacity-50"
            >
              <svg v-if="savingHighlightId === highlight.id" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mettre à jour
            </button>
          </div>
        </div>
        
        <!-- Message pour les mises en avant expirées -->
        <div v-else class="mt-4 text-center">
          <p class="text-gray-600">Cette mise en avant a expiré. Pour renouveler ce service, contactez l'administrateur.</p>
          <button 
            @click="renewHighlight(highlight.id)" 
            class="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-md"
          >
            Renouveler
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDirectusApi } from '@/composables/useDirectusApi';
import { useAuthStore } from '@/stores/useAuthStore';

export default {
  name: 'HighlightTab',
  
  props: {
    userId: {
      type: String,
      default: null
    },
    user: {
      type: Object,
      default: null
    }
  },
  
  emits: ['update-success'],
  
  setup() {
    // Utiliser le service API Directus
    const { 
      loading: apiLoading, 
      error: apiError
    } = useDirectusApi();
    
    // Utiliser le store d'authentification
    const authStore = useAuthStore();
    
    return {
      apiLoading,
      apiError,
      authStore
    };
  },
  
  data() {
    return {
      loading: false,
      loadingAnnonces: false,
      saving: false,
      error: null,
      saveMessage: null,
      saveError: false,
      
      highlight: null,
      annonces: [],
      selectedAnnonceId: null
    };
  },
  
  computed: {
    // Vérifie si la mise en avant est expirée
    isExpired() {
      if (!this.highlight || !this.highlight.date_expiration) return false;
      return new Date(this.highlight.date_expiration) < new Date();
    },
    
    // Récupère l'annonce sélectionnée
    selectedAnnonce() {
      if (!this.selectedAnnonceId) return null;
      return this.annonces.find(annonce => annonce.id === this.selectedAnnonceId);
    },
    
    // URL de base Directus
    directusUrl() {
      return this.$config?.public?.directusUrl || process.env.DIRECTUS_URL || 'http://localhost:8055';
    },
    
    // Récupérer l'ID utilisateur effectif
    effectiveUserId() {
      return this.userId || (this.user ? this.user.id : null) || this.authStore.user?.id;
    }
  },
  
  mounted() {
    // Initialiser l'état d'authentification (au cas où)
    this.authStore.initAuth();
    
    // Charger les données
    this.fetchHighlightData();
  },
  
  methods: {
    // Récupérer les données de mise en avant
    async fetchHighlightData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Vérifier si nous avons un ID utilisateur
        if (!this.effectiveUserId) {
          console.error('ID utilisateur non disponible');
          this.error = "Impossible de charger vos données: utilisateur non identifié.";
          return;
        }
        
        console.log('Chargement des données de mise en avant pour l\'utilisateur:', this.effectiveUserId);
        
        // Appeler l'API Directus via notre proxy
        const response = await fetch(`/api/directus/items/user_highlights?filter[user_id][_eq]=${this.effectiveUserId}&fields=*,annonce.*`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
          this.highlight = result.data[0];
          
          // Si on a une mise en avant active, on charge les annonces disponibles
          if (!this.isExpired) {
            this.fetchAnnonces();
            
            // Présélectionner l'annonce actuelle
            if (this.highlight.annonce) {
              this.selectedAnnonceId = this.highlight.annonce.id;
            }
          }
        } else {
          this.highlight = null;
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la mise en avant:', error);
        this.error = "Impossible de charger vos données de mise en avant. Veuillez réessayer.";
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer les annonces disponibles
    async fetchAnnonces() {
      this.loadingAnnonces = true;
      
      try {
        // Appeler l'API Directus via notre proxy
        const response = await fetch(`/api/directus/items/annonces?filter[user_id][_eq]=${this.effectiveUserId}&filter[status][_in]=active,published&fields=*`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
          // Filtrer pour ne garder que les annonces actives
          this.annonces = result.data;
        } else {
          this.annonces = [];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
      } finally {
        this.loadingAnnonces = false;
      }
    },
    
    // Mettre à jour l'annonce mise en avant
    async updateHighlight() {
      if (!this.selectedAnnonceId || !this.highlight) return;
      
      this.saving = true;
      this.saveMessage = null;
      this.saveError = false;
      
      try {
        // Appeler l'API Directus via notre proxy
        const response = await fetch(`/api/directus/items/user_highlights/${this.highlight.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ annonce_id: this.selectedAnnonceId })
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Mise à jour locale
        this.highlight = {
          ...this.highlight,
          annonce: this.selectedAnnonce
        };
        
        this.saveMessage = "Votre annonce mise en avant a été mise à jour avec succès.";
        
        // Émettre l'événement de succès vers le parent
        this.$emit('update-success', this.saveMessage);
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        this.saveMessage = "Une erreur est survenue lors de la mise à jour. Veuillez réessayer.";
        this.saveError = true;
      } finally {
        this.saving = false;
        
        // Effacer le message après 3 secondes
        setTimeout(() => {
          this.saveMessage = null;
        }, 3000);
      }
    },
    
    // Formater une date
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },
    
    // Calculer le nombre de jours restants
    getRemainingDays(dateString) {
      if (!dateString) return 0;
      
      const expiration = new Date(dateString);
      const today = new Date();
      
      // Différence en millisecondes
      const diffTime = expiration - today;
      // Convertir en jours (arrondi supérieur)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, diffDays);
    },
    
    // Formater un prix
    formatPrice(price) {
      if (price === undefined || price === null) return '';
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(price);
    },
    
    // Obtenir l'URL d'une image
    getImageUrl(imageId) {
      if (!imageId) return null;
      return `/api/directus/assets/${imageId}`;
    }
  }
};
</script>