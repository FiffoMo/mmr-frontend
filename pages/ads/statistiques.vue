<template>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- En-tête de page -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Statistiques de la publicité</h1>
          <p v-if="ad" class="mt-2 text-sm text-gray-600">
            {{ ad.titre }}
          </p>
        </div>
        <button
          @click="goBack"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Retour
        </button>
      </div>
  
      <!-- Chargement -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p class="mt-4 text-gray-600">Chargement des statistiques...</p>
      </div>
  
      <!-- Message d'erreur -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-600">{{ error }}</p>
            <p class="mt-2 text-xs text-red-500">
              <button @click="goBack" class="font-medium underline">Retour</button>
            </p>
          </div>
        </div>
      </div>
  
      <!-- Contenu principal -->
      <div v-else-if="ad" class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Aperçu de la publicité -->
        <div class="border-b border-gray-200 bg-gray-50 p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center">
            <!-- Image de la publicité -->
            <div class="w-full sm:w-40 h-24 bg-gray-200 rounded-md overflow-hidden mr-6 mb-4 sm:mb-0">
              <img 
                v-if="ad.image" 
                :src="getImageUrl(ad.image)" 
                alt="" 
                class="h-full w-full object-cover"
                @error="handleImageError"
              />
              <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <!-- Informations de la publicité -->
            <div class="flex-grow">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Titre</h3>
                  <p class="mt-1 text-md text-gray-900">{{ ad.titre }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Emplacement</h3>
                  <p class="mt-1 text-md text-gray-900">{{ getLocationLabel(ad.location || ad.emplacement) }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Statut</h3>
                  <span :class="getStatusClass(ad.status)">
                    {{ getStatusLabel(ad.status) }}
                  </span>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Période</h3>
                  <p class="mt-1 text-md text-gray-900">
                    {{ formatDate(ad.start_date || ad.date_debut) }} - {{ formatDate(ad.end_date || ad.date_fin) }}
                  </p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Durée</h3>
                  <p class="mt-1 text-md text-gray-900">{{ ad.duree }} jours</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Prix</h3>
                  <p class="mt-1 text-md text-gray-900">{{ formatPrice(ad.price || ad.prix) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Cartes de statistiques -->
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Statistiques globales</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <!-- Impressions -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">Impressions</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(ad.impressions) }}</p>
                </div>
                <div class="bg-cyan-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-xs text-gray-500">Nombre de fois que votre publicité a été affichée</p>
            </div>
            
            <!-- Clics -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">Clics</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(ad.clicks || ad.clics) }}</p>
                </div>
                <div class="bg-cyan-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-xs text-gray-500">Nombre de clics sur votre publicité</p>
            </div>
            
            <!-- Taux de clics (CTR) -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-500">Taux de clics (CTR)</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ formatPercentage(ad.ctr || (ad.clicks && ad.impressions ? ad.clicks / ad.impressions : 0)) }}</p>
                </div>
                <div class="bg-cyan-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-xs text-gray-500">Pourcentage d'impressions ayant généré un clic</p>
            </div>
          </div>
          
          <!-- Graphique des performances -->
          <div class="mt-8">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Évolution des performances</h2>
            
            <!-- Message informant que les données de graphique sont simulées -->
            <div class="bg-blue-50 p-4 rounded-md mb-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-700">
                    Pour le moment, les données de graphique sont simulées. Les statistiques réelles seront disponibles prochainement.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Le graphique (simulé pour le moment) -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 h-64 flex items-center justify-center">
              <div id="performanceChart" class="w-full h-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { useDirectusSDK } from '@/composables/useDirectusSDK';
  import { useRoute, useRouter } from 'vue-router';
  
  export default {
    name: 'PubliciteStatistiques',
    
    setup() {
      const directusSDK = useDirectusSDK();
      const route = useRoute();
      const router = useRouter();
      
      return {
        directusSDK,
        route,
        router
      };
    },
    
    data() {
      return {
        ad: null,
        loading: true,
        error: null,
        simulatedData: {
          dates: [],
          impressions: [],
          clicks: []
        }
      };
    },
    
    async mounted() {
      const adId = this.route.query.id;
      
      if (!adId) {
        this.error = "Aucune publicité spécifiée";
        this.loading = false;
        return;
      }
      
      try {
        await this.fetchAd(adId);
        this.generateSimulatedData();
        
        // Charge le graphique après le rendu du composant
        this.$nextTick(() => {
          this.renderChart();
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.error = "Impossible de charger les statistiques de la publicité";
      } finally {
        this.loading = false;
      }
    },
    
    methods: {
      // Récupérer les données de la publicité
      async fetchAd(adId) {
        try {
          const ad = await this.directusSDK.getItem('publicite', adId);
          
          if (!ad) {
            throw new Error('Publicité non trouvée');
          }
          
          this.ad = ad;
        } catch (error) {
          console.error('Erreur lors de la récupération de la publicité:', error);
          throw error;
        }
      },
      
      // Générer des données simulées pour le graphique
      generateSimulatedData() {
        // Simuler les 30 derniers jours (ou moins si la publicité est plus récente)
        const startDate = this.ad.date_debut ? new Date(this.ad.date_debut) : new Date();
        const endDate = new Date();
        const totalDays = Math.min(30, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        
        // Génération des dates
        this.simulatedData.dates = [];
        for (let i = 0; i < totalDays; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (totalDays - i - 1));
          this.simulatedData.dates.push(date.toISOString().split('T')[0]);
        }
        
        // Génération des impressions et clics
        this.simulatedData.impressions = [];
        this.simulatedData.clicks = [];
        
        // Total d'impressions et de clics pour répartir sur la période
        const totalImpressions = this.ad.impressions || 1000;
        const totalClicks = this.ad.clics || this.ad.clicks || 50;
        
        // Distribution suivant une tendance à la hausse
        for (let i = 0; i < totalDays; i++) {
          // Formule créant une tendance générale à la hausse avec des variations aléatoires
          const dayFactor = 0.5 + (i / totalDays) * 0.8; // Tendance à la hausse (de 0.5 à 1.3)
          const randomFactor = 0.8 + Math.random() * 0.4; // Variation aléatoire entre 0.8 et 1.2
          
          const impressions = Math.round((totalImpressions / totalDays) * dayFactor * randomFactor);
          this.simulatedData.impressions.push(impressions);
          
          // Clics basés sur impressions et CTR moyen avec variation
          const dayClicks = Math.round(impressions * (totalClicks / totalImpressions) * (0.8 + Math.random() * 0.4));
          this.simulatedData.clicks.push(dayClicks);
        }
      },
      
      // Afficher le graphique (avec une bibliothèque fictive pour le moment)
      renderChart() {
        // Note: Dans une implémentation réelle, vous utiliseriez une bibliothèque comme Chart.js, ApexCharts, etc.
        const chartElement = document.getElementById('performanceChart');
        
        if (!chartElement) return;
        
        // Ajouter du contenu visuel temporaire
        chartElement.innerHTML = `
          <div class="w-full h-full flex flex-col">
            <div class="text-center text-gray-400 font-medium mb-2">Simulation de graphique (30 derniers jours)</div>
            <div class="flex-grow relative">
              <div class="absolute bottom-0 left-0 w-full h-3/4 flex items-end">
                ${this.simulatedData.impressions.map((imp, i) => {
                  const height = (imp / Math.max(...this.simulatedData.impressions)) * 100;
                  return `<div class="flex-grow mx-0.5">
                    <div class="bg-cyan-200 h-${Math.max(1, Math.round(height))}%" title="${this.simulatedData.dates[i]}: ${imp} impressions"></div>
                  </div>`;
                }).join('')}
              </div>
              <div class="absolute bottom-0 left-0 w-full h-3/4 flex items-end">
                ${this.simulatedData.clicks.map((clicks, i) => {
                  const height = (clicks / Math.max(...this.simulatedData.impressions)) * 100;
                  return `<div class="flex-grow mx-0.5">
                    <div class="bg-cyan-500 h-${Math.max(1, Math.round(height))}%" title="${this.simulatedData.dates[i]}: ${clicks} clics"></div>
                  </div>`;
                }).join('')}
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <div>${this.simulatedData.dates[0]}</div>
              <div>${this.simulatedData.dates[Math.floor(this.simulatedData.dates.length / 2)]}</div>
              <div>${this.simulatedData.dates[this.simulatedData.dates.length - 1]}</div>
            </div>
            <div class="flex justify-center mt-4">
              <div class="flex items-center mr-4">
                <div class="w-3 h-3 bg-cyan-200 mr-1"></div>
                <span class="text-xs text-gray-500">Impressions</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-cyan-500 mr-1"></div>
                <span class="text-xs text-gray-500">Clics</span>
              </div>
            </div>
          </div>
        `;
      },
      
      // Méthodes de formatage
      formatNumber(number) {
        if (number === undefined || number === null) return '0';
        return new Intl.NumberFormat('fr-FR').format(number);
      },
      
      formatPercentage(value) {
        if (value === undefined || value === null) return '0%';
        return new Intl.NumberFormat('fr-FR', {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      },
      
      formatPrice(price) {
        if (price === undefined || price === null) return '0,00 €';
        
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(price);
      },
      
      formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        
        const date = new Date(dateStr);
        
        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
          return 'Date invalide';
        }
        
        // Formater la date en français
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
      },
      
      // Méthodes de mapping des statuts
      getStatusClass(status) {
        const statusMap = {
          'draft': 'bg-gray-100 text-gray-800',
          'active': 'bg-green-100 text-green-800',
          'archived': 'bg-gray-200 text-gray-600',
          'suspended': 'bg-red-100 text-red-800',
          'pending': 'bg-yellow-100 text-yellow-800',
          'expired': 'bg-red-50 text-red-600'
        };
        return `px-2 py-1 text-xs font-medium rounded-full ${statusMap[status] || 'bg-gray-100 text-gray-800'}`;
      },
  
      getStatusLabel(status) {
        const statusLabels = {
          'draft': 'Brouillon',
          'active': 'Active',
          'archived': 'Archivée',
          'suspended': 'Suspendue',
          'pending': 'En attente',
          'expired': 'Expirée'
        };
        return statusLabels[status] || status;
      },
      
      // Obtenir le label de l'emplacement
      getLocationLabel(location) {
        const locationLabels = {
          'homepage': 'Page d\'accueil',
          'search_results': 'Résultats de recherche',
          'listing_page': 'Page d\'annonce',
          'sidebar': 'Barre latérale',
          'footer': 'Pied de page',
          'header': 'En-tête'
        };
        return locationLabels[location] || location;
      },
      
      // Obtenir l'URL d'une image
      getImageUrl(imageId) {
        if (!imageId) return null;
        
        // Si imageId est déjà un objet avec une URL
        if (typeof imageId === 'object' && imageId.url) {
          return imageId.url;
        }
        
        // Si imageId est déjà une URL complète
        if (typeof imageId === 'string' && (imageId.startsWith('http://') || imageId.startsWith('https://'))) {
          return imageId;
        }
        
        // Vérifier si nous sommes en environnement de développement
        const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
        
        // Adapter l'URL selon l'environnement
        if (isDev) {
          return `http://localhost:8055/assets/${imageId}`;
        } else {
          // En production, utiliser le domaine actuel
          return `/api/directus/assets/${imageId}`;
        }
      },
      
      // Gérer les erreurs d'image
      handleImageError() {
        if (this.ad) {
          this.ad.image = null;
        }
      },
      
      // Retour à la page précédente
      goBack() {
        this.router.push('/settings?tab=ads');
      }
    }
  };
  </script>