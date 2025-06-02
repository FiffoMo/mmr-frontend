<template>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- En-tête de page -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Gérez vos publicités</h1>
        <p class="mt-2 text-sm text-gray-600">
          Consultez et gérez toutes vos publicités pour promouvoir votre activité.
        </p>
      </div>
  
      <!-- Chargement -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p class="mt-4 text-gray-600">Chargement de vos publicités...</p>
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
              <button @click="fetchAds" class="font-medium underline">Réessayer</button>
            </p>
          </div>
        </div>
      </div>
  
      <!-- Aucune publicité -->
      <div v-else-if="ads.length === 0" class="text-center py-10 bg-gray-100 rounded-lg">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune publicité</h3>
        <p class="mt-1 text-sm text-gray-500">Vous n'avez pas encore de publicité active sur notre plateforme.</p>
        <div class="mt-6">
          <NuxtLink to="/publicite/creer" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
            Créer une publicité
          </NuxtLink>
        </div>
      </div>
  
      <!-- Liste des publicités -->
      <div v-else>
        <!-- En-tête avec les filtres -->
        <div class="mb-6 flex flex-wrap justify-between items-center gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <div>
              <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select 
                id="status-filter" 
                v-model="statusFilter" 
                class="block h-10 px-3 rounded-md border-gray-300 border shadow-sm bg-white focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="suspended">Suspendue</option>
                <option value="pending">En attente</option>
                <option value="expired">Expirée</option>
              </select>
            </div>
          </div>
          
          <div>
            <NuxtLink to="/publicite/creer" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouvelle publicité
            </NuxtLink>
          </div>
        </div>
  
        <!-- Tableau des publicités -->
        <div class="bg-white overflow-hidden border border-gray-300 shadow-sm rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publicité
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistiques
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="filteredAds.length === 0" class="hover:bg-gray-50">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                  Aucune publicité correspondant aux critères de filtrage
                </td>
              </tr>
              <tr v-for="ad in filteredAds" :key="ad.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-20 w-32 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      <img 
                        v-if="ad.image" 
                        :src="ad.image" 
                        alt="" 
                        class="h-full w-full object-cover"
                        @error="handleImageError($event, ad)"
                      />
                      <div v-else class="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ ad.title }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ getTypeLabel(ad.type) }}
                      </div>
                      <div class="text-sm text-cyan-600">
                        {{ formatPrice(ad.price) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm">
                    <div class="text-gray-900">{{ getLocationLabel(ad.location) }}</div>
                    <div class="text-gray-500 mt-1">{{ ad.dimensions }}</div>
                    <div class="text-gray-500">
                      <div v-if="ad.start_date && ad.end_date">
                        {{ formatDate(ad.start_date) }} - {{ formatDate(ad.end_date) }}
                      </div>
                      <div v-if="ad.duree" class="text-gray-600">
                        Durée: {{ ad.duree }} jours
                      </div>
                      <div v-if="ad.days_left !== null" :class="{'text-red-600 font-medium': ad.days_left <= 7}">
                        <span v-if="ad.days_left > 0">Expire dans {{ ad.days_left }} jours</span>
                        <span v-else class="text-red-600 font-medium">Expirée</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-600">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {{ ad.impressions.toLocaleString() }} impressions
                    </div>
                    <div class="flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      {{ ad.clicks.toLocaleString() }} clics
                    </div>
                    <div class="flex items-center mt-1">
                      <span class="font-medium">{{ (ad.ctr * 100).toFixed(2) }}%</span>
                      <span class="ml-1">CTR</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(ad.status)">
                    {{ getStatusLabel(ad.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <!-- Boutons d'action -->
                  <div class="flex justify-end space-x-2">
                    <button 
                      @click="viewAdStats(ad.id)"
                      class="text-gray-600 hover:text-gray-900"
                      title="Voir les statistiques"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    
                    <button 
                      @click="editAd(ad.id)"
                      class="text-cyan-600 hover:text-cyan-800"
                      title="Modifier la publicité"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <!-- Bouton Suspendre (pour les publicités actives) -->
                    <button 
                      v-if="ad.status === 'active'"
                      @click="suspendAd(ad.id)"
                      class="text-amber-600 hover:text-amber-800"
                      title="Suspendre la publicité"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    <!-- Bouton Réactiver (pour les publicités suspendues) -->
                    <button 
                      v-if="ad.status === 'suspended'"
                      @click="reactivateAd(ad.id)"
                      class="text-green-600 hover:text-green-800"
                      title="Réactiver la publicité"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    <!-- Bouton Prolonger (pour les publicités expirées) -->
                    <button 
                      v-if="ad.status === 'expired' || (ad.end_date && new Date(ad.end_date) < new Date())"
                      @click="extendAd(ad.id)"
                      class="text-blue-600 hover:text-blue-800"
                      title="Prolonger la publicité"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    <button 
                      @click="deleteAd(ad.id)"
                      class="text-red-600 hover:text-red-800"
                      title="Supprimer la publicité"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Notification toast pour les messages de succès -->
      <div 
        v-if="notification.show" 
        class="fixed bottom-5 right-5 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300"
        :class="notification.show ? 'opacity-100' : 'opacity-0'"
      >
        <div class="flex">
          <svg class="h-5 w-5 text-green-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ notification.message }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { useDirectusSDK } from '@/composables/useDirectusSDK';
  import { useAuthStore } from '@/stores/useAuthStore';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'PubliciteIndex',
    
    setup() {
      const directusSDK = useDirectusSDK();
      const authStore = useAuthStore();
      const router = useRouter();
      
      return {
        directusSDK,
        authStore,
        router
      };
    },
    
    data() {
      return {
        loading: true,
        error: null,
        ads: [],
        
        // Filtres
        statusFilter: '',
        
        // Notification toast
        notification: {
          show: false,
          message: '',
          timer: null
        }
      };
    },
    
    computed: {
      // Publicités filtrées
      filteredAds() {
        return this.ads.filter(ad => {
          // Filtre par statut
          if (this.statusFilter && ad.status !== this.statusFilter) {
            return false;
          }
          
          return true;
        });
      }
    },
    
    mounted() {
      this.fetchAds();
    },
    
    beforeUnmount() {
      if (this.notification.timer) {
        clearTimeout(this.notification.timer);
      }
    },
    
    methods: {
      // Récupérer les publicités
      async fetchAds() {
        this.loading = true;
        this.error = null;
        
        try {
          const userId = this.authStore.clientId;
          
          if (!userId) {
            throw new Error('Utilisateur non identifié');
          }
          
          const isAdmin = this.authStore.isAdmin || (this.authStore.user?.role?.name === 'Administrator');
          
          let adsData = [];
          
          if (isAdmin) {
            // Pour les administrateurs, récupérer toutes les publicités
            const result = await this.directusSDK.getItems('publicite', {
              fields: '*'
            });
            
            if (result && result.length > 0) {
              adsData = result;
            }
          } else {
            // Pour les utilisateurs réguliers, filtrer par client_id ou client
            const params = {
              filter: { 
                _or: [
                  { client_id: { _eq: userId } },
                  { client: { _eq: userId } },
                  { user_created: { _eq: userId } }
                ]
              },
              fields: '*'
            };
            
            const result = await this.directusSDK.getItems('publicite', params);
            
            if (result && result.length > 0) {
              adsData = result;
            }
          }
          
          this.processAdsData(adsData);
        } catch (error) {
          console.error('Erreur lors du chargement des publicités:', error);
          this.error = error.message || "Impossible de charger vos publicités. Veuillez réessayer.";
          this.ads = [];
        } finally {
          this.loading = false;
        }
      },
      
      // Traiter les données des publicités
      processAdsData(data) {
        this.ads = data.map(ad => ({
          id: ad.id,
          title: ad.titre || 'Sans titre',
          type: ad.emplacement || 'banner',
          location: ad.emplacement || 'homepage',
          url: ad.url || '#',
          image: this.getImageUrl(ad.image),
          start_date: ad.date_debut || null,
          end_date: ad.date_fin || null,
          duree: ad.duree || null,
          price: ad.prix || 0,
          status: ad.status || ad.statut_affichage || 'draft',
          days_left: ad.date_fin ? Math.max(0, Math.ceil((new Date(ad.date_fin) - new Date()) / (1000 * 60 * 60 * 24))) : null,
          impressions: ad.impressions || 0,
          clicks: ad.clics || 0,
          ctr: ad.clics && ad.impressions ? (ad.clics / ad.impressions) : 0,
          dimensions: '300x250' // Valeur par défaut
        }));
        
        // Vérifier si des publicités sont expirées et mettre à jour leur statut
        const now = new Date();
        this.ads.forEach(ad => {
          if (ad.end_date && new Date(ad.end_date) < now && ad.status === 'active') {
            ad.status = 'expired';
          }
        });
      },
      
      // Gérer les erreurs d'image
      handleImageError(event, ad) {
        ad.image = null;
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
      
      // Méthodes de formatage
      formatDate(dateStr) {
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        
        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
          return 'Date invalide';
        }
        
        // Formater la date en français
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
      },
      
      formatPrice(cents) {
        if (cents === null || cents === undefined) return '0,00 €';
        
        // S'assurer que nous avons un nombre
        const price = Number(cents);
        
        // Formater avec séparateur de milliers et 2 décimales
        return price.toLocaleString('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
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
        return `px-2 py-1 text-xs font-medium rounded-md ${statusMap[status] || 'bg-gray-100 text-gray-800'}`;
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
  
      // Obtenir le label du type d'emplacement
      getTypeLabel(type) {
        const typeLabels = {
          'banner': 'Bannière',
          'sidebar': 'Barre latérale',
          'homepage': 'Page d\'accueil',
          'search_results': 'Résultats de recherche',
          'listing_page': 'Page d\'annonce',
          'popup': 'Pop-up'
        };
        return typeLabels[type] || type;
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
      
      // Méthodes pour les actions sur les publicités
      async suspendAd(adId) {
        if (confirm('Êtes-vous sûr de vouloir suspendre cette publicité ?')) {
          try {
            await this.directusSDK.updateItem('publicite', adId, { status: 'suspended' });
            
            // Mettre à jour localement
            const index = this.ads.findIndex(a => a.id === adId);
            if (index !== -1) {
              this.ads[index].status = 'suspended';
            }
            
            this.showNotification('Publicité suspendue avec succès');
          } catch (error) {
            console.error('Erreur lors de la suspension de la publicité:', error);
            alert('Une erreur est survenue. Veuillez réessayer.');
          }
        }
      },
      
      async reactivateAd(adId) {
      try {
        // Vérifier si la date de fin est passée
        const adIndex = this.ads.findIndex(a => a.id === adId);
        if (adIndex !== -1) {
          const ad = this.ads[adIndex];
          const now = new Date();
          const endDate = ad.end_date ? new Date(ad.end_date) : null;
          
          // Si la date de fin est passée, demander confirmation pour prolonger
          if (endDate && endDate < now) {
            if (confirm('Cette publicité a expiré. Voulez-vous la prolonger de 30 jours ?')) {
              // Calculer la nouvelle date de fin
              const newEndDate = new Date();
              newEndDate.setDate(newEndDate.getDate() + 30);
              
              // Mettre à jour la publicité
              await this.directusSDK.updateItem('publicite', adId, {
                status: 'active',
                date_debut: this.formatDateForMySQL(new Date()),
                date_fin: this.formatDateForMySQL(newEndDate),
                duree: 30
              });
              
              // Mettre à jour localement
              this.ads[adIndex].status = 'active';
              this.ads[adIndex].start_date = new Date().toISOString();
              this.ads[adIndex].end_date = newEndDate.toISOString();
              this.ads[adIndex].duree = 30;
              this.ads[adIndex].days_left = 30;
              
              this.showNotification('Publicité réactivée et prolongée de 30 jours');
              return;
            }
          }
        }
        
        // Réactiver sans prolonger
        await this.directusSDK.updateItem('publicite', adId, { status: 'active' });
        
        // Mettre à jour localement
        const index = this.ads.findIndex(a => a.id === adId);
        if (index !== -1) {
          this.ads[index].status = 'active';
        }
        
        this.showNotification('Publicité réactivée avec succès');
      } catch (error) {
        console.error('Erreur lors de la réactivation de la publicité:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    },
    
    async deleteAd(adId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette publicité ? Cette action est irréversible.')) {
        try {
          await this.directusSDK.deleteItem('publicite', adId);
          
          // Mettre à jour localement
          this.ads = this.ads.filter(a => a.id !== adId);
          
          this.showNotification('Publicité supprimée avec succès');
        } catch (error) {
          console.error('Erreur lors de la suppression de la publicité:', error);
          alert('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    },
    
    extendAd(adId) {
      // Rediriger vers la page de modification avec option de prolongation
      this.router.push(`/publicite/modifier?id=${adId}&extend=true`);
    },
    
    editAd(adId) {
      // Rediriger vers la page de modification
      this.router.push(`/publicite/modifier?id=${adId}`);
    },
    
    viewAdStats(adId) {
      // Rediriger vers la page de statistiques
      this.router.push(`/publicite/statistiques?id=${adId}`);
    },
    
    // Formater une date pour MySQL
    formatDateForMySQL(date) {
      if (!date) return null;
      
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    
    // Notification toast
    showNotification(message) {
      // Nettoyer tout timer existant
      if (this.notification.timer) {
        clearTimeout(this.notification.timer);
      }
      
      // Afficher la notification
      this.notification.message = message;
      this.notification.show = true;
      
      // Cacher après 3 secondes
      this.notification.timer = setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    }
  }
};
</script>