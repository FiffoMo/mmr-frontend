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
import { useDirectusService } from '@/composables/useDirectusService';
import { useAuthStore } from '@/stores/useAuthStore';

export default {
  name: 'HighlightTab',
  
  setup() {
    // Utiliser le service API Directus (mais nous utiliserons des données simulées pour le développement)
    const { 
      loading: apiLoading, 
      error: apiError,
      getActiveHighlight,
      getUserListings,
      updateHighlightedListing
    } = useDirectusService();
    
    // Utiliser le store d'authentification
    const authStore = useAuthStore();
    
    return {
      apiLoading,
      apiError,
      getActiveHighlight,
      getUserListings,
      updateHighlightedListing,
      authStore
    };
  },
  
  data() {
    return {
      loading: false,
      loadingAnnonces: false,
      saving: false,
      savingHighlightId: null,
      error: null,
      
      highlights: [],
      annonces: []
    };
  },
  
  mounted() {
    // Initialiser l'état d'authentification (au cas où)
    this.authStore.initAuth();
    
    // Charger les données
    this.fetchHighlightData();
  },
  
  methods: {
    // Récupérer l'annonce sélectionnée pour une mise en avant
    getSelectedAnnonce(highlight) {
      if (!highlight.selectedAnnonceId) return null;
      return this.annonces.find(annonce => annonce.id === highlight.selectedAnnonceId);
    },
    
    // Récupérer les données de mise en avant
    async fetchHighlightData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Pour le développement, utilisons des données simulées
        // Données fictives pour plusieurs mises en avant
        const mockHighlightData = [
          {
            id: '123',
            date_creation: '2023-01-15T10:00:00',
            date_expiration: '2025-06-30T23:59:59', // Date future
            annonce: {
              id: '201',
              titre: 'Appartement 3 pièces avec terrasse',
              prix: 450000
            },
            user: '1',
            status: 'active',
            commande: {
              id: '1001',
              reference: 'CMD-1001',
              date: '2023-01-15T10:00:00'
            },
            isExpired: false,
            daysLeft: 459, // Calculé à partir de date_expiration
            selectedAnnonceId: '201', // Initialisé avec l'annonce actuelle
            saveMessage: null,
            saveError: false
          },
          {
            id: '124',
            date_creation: '2022-11-10T09:30:00',
            date_expiration: '2023-02-10T23:59:59', // Date passée
            annonce: {
              id: '202',
              titre: 'Studio meublé proche métro',
              prix: 220000
            },
            user: '1',
            status: 'expired',
            commande: {
              id: '982',
              reference: 'CMD-982',
              date: '2022-11-10T09:30:00'
            },
            isExpired: true,
            daysLeft: 0,
            selectedAnnonceId: '202',
            saveMessage: null,
            saveError: false
          },
          {
            id: '125',
            date_creation: '2023-03-22T14:45:00',
            date_expiration: '2025-04-22T23:59:59', // Date future
            annonce: {
              id: '203',
              titre: 'Maison 5 pièces avec jardin',
              prix: 980000
            },
            user: '1',
            status: 'active',
            commande: {
              id: '1050',
              reference: 'CMD-1050',
              date: '2023-03-22T14:45:00'
            },
            isExpired: false,
            daysLeft: 390,
            selectedAnnonceId: '203',
            saveMessage: null,
            saveError: false
          }
        ];
        
        // En mode production, utilisez cette partie du code à la place des données simulées
        /*
        // Utiliser le service Directus API pour récupérer toutes les mises en avant de l'utilisateur
        const result = await this.getActiveHighlight();
        
        if (result.data && result.data.length > 0) {
          // Transformer les données pour ajouter les propriétés nécessaires
          this.highlights = result.data.map(highlight => {
            const now = new Date();
            const expiration = new Date(highlight.date_expiration);
            const isExpired = expiration < now;
            const daysLeft = isExpired ? 0 : Math.ceil((expiration - now) / (1000 * 60 * 60 * 24));
            
            return {
              ...highlight,
              isExpired,
              daysLeft,
              selectedAnnonceId: highlight.annonce ? highlight.annonce.id : null,
              saveMessage: null,
              saveError: false
            };
          });
        } else {
          this.highlights = [];
        }
        */
        
        // Utiliser les données simulées pour le développement
        this.highlights = mockHighlightData;
        
        // Trier les highlights: actifs d'abord, puis par date d'expiration
        this.highlights.sort((a, b) => {
          if (a.isExpired && !b.isExpired) return 1;
          if (!a.isExpired && b.isExpired) return -1;
          return new Date(a.date_expiration) - new Date(b.date_expiration);
        });
        
        // Si on a des mises en avant, charger les annonces disponibles
        if (this.highlights.length > 0) {
          this.fetchAnnonces();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des mises en avant:', error);
        this.error = "Impossible de charger vos données de mise en avant. Veuillez réessayer.";
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer les annonces disponibles
    async fetchAnnonces() {
      this.loadingAnnonces = true;
      
      try {
        // Données simulées pour les annonces disponibles
        const mockAnnonces = [
          {
            id: '201',
            titre: 'Appartement 3 pièces avec terrasse',
            localisation: 'Paris 11e',
            prix: 450000,
            status: 'published',
            image_principale: null // Dans un cas réel, ce serait l'ID de l'image
          },
          {
            id: '202',
            titre: 'Studio meublé proche métro',
            localisation: 'Paris 15e',
            prix: 220000,
            status: 'published',
            image_principale: null
          },
          {
            id: '203',
            titre: 'Maison 5 pièces avec jardin',
            localisation: 'Suresnes',
            prix: 980000,
            status: 'published',
            image_principale: null
          },
          {
            id: '204',
            titre: 'Duplex avec vue panoramique',
            localisation: 'Lyon 6e',
            prix: 580000,
            status: 'published',
            image_principale: null
          }
        ];
        
        // En mode production, utilisez cette partie du code à la place des données simulées
        /*
        // Utiliser le service Directus API pour récupérer les annonces de l'utilisateur
        const result = await this.getUserListings();
        
        if (result.data) {
          // Filtrer pour ne garder que les annonces actives
          this.annonces = result.data.filter(annonce => annonce.status === 'active' || annonce.status === 'published');
        } else {
          this.annonces = [];
        }
        */
        
        // Utiliser les données simulées pour le développement
        this.annonces = mockAnnonces;
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 400));
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
        this.annonces = []; // En cas d'erreur, on initialise avec un tableau vide
      } finally {
        this.loadingAnnonces = false;
      }
    },
    
    // Mettre à jour l'annonce mise en avant
    async updateHighlight(highlight) {
      const annonceId = highlight.selectedAnnonceId;
      if (!annonceId) return;
      
      this.savingHighlightId = highlight.id;
      this.saving = true;
      
      try {
        // Simuler la mise à jour pour le développement
        console.log(`Mise à jour de la mise en avant ${highlight.id}: annonce ${annonceId}`);
        
        // En mode production, utilisez cette partie du code
        /*
        // Utiliser le service Directus API pour mettre à jour la mise en avant
        await this.updateHighlightedListing(highlight.id, annonceId);
        */
        
        // Mise à jour locale
        const selectedAnnonce = this.annonces.find(a => a.id === annonceId);
        const index = this.highlights.findIndex(h => h.id === highlight.id);
        
        if (index !== -1 && selectedAnnonce) {
          // Mettre à jour l'annonce dans le highlight
          this.highlights[index].annonce = selectedAnnonce;
        }
        
        // Définir le message de succès pour cette mise en avant
        highlight.saveMessage = "Votre annonce mise en avant a été mise à jour avec succès.";
        highlight.saveError = false;
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        highlight.saveMessage = "Une erreur est survenue lors de la mise à jour. Veuillez réessayer.";
        highlight.saveError = true;
      } finally {
        this.saving = false;
        this.savingHighlightId = null;
        
        // Effacer le message après 3 secondes
        setTimeout(() => {
          highlight.saveMessage = null;
        }, 3000);
      }
    },
    
    // Renouveler une mise en avant expirée
    renewHighlight(highlightId) {
      // En mode réel, rediriger vers la page de tarifs ou de renouvellement
      alert(`Redirection vers la page de renouvellement de la mise en avant ${highlightId}`);
      
      // Exemple:
      // this.$router.push({
      //   path: '/tarifs',
      //   query: { renew: highlightId, type: 'highlight' }
      // });
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
      if (!imageId) {
        // Image de remplacement pour le développement
        return 'https://placehold.co/300x200/e2e8f0/a0aec0?text=Propriété';
      }
      
      // En mode production, utilisez cette partie pour récupérer l'image depuis Directus
      return `/api/directus/assets/${imageId}`;
    }
  }
};
</script>