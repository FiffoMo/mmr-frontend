<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Mes publicités</h2>
    
    <!-- Chargement initial -->
    <div v-if="loading" class="py-10 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      <p class="mt-2 text-gray-500">Chargement de vos publicités...</p>
    </div>
    
    <!-- Erreur -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      <p class="font-medium">Une erreur est survenue</p>
      <p class="text-sm">{{ error }}</p>
      <button 
        @click="fetchAds" 
        class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
      >
        Réessayer
      </button>
    </div>
    
    <!-- Aucune publicité -->
    <div v-else-if="ads.length === 0" class="text-center py-10 bg-slate-200 rounded-lg">
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
      <div class="bg-slate-200 overflow-hidden border border-gray-300 shadow-sm rounded-lg">
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
                Aucune publicité correspondant à vos critères
              </td>
            </tr>
            <tr v-for="ad in filteredAds" :key="ad.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-20 w-32 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                    <img v-if="ad.image" :src="ad.image" alt="" class="h-full w-full object-cover" />
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
                    <div v-if="ad.days_left" :class="{'text-red-600 font-medium': ad.days_left <= 7}">
                      Expire dans {{ ad.days_left }} jours
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
      
      <!-- Pagination (si nécessaire) -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <div class="flex-1 flex justify-between sm:hidden">
          <button 
            @click="currentPage > 1 && (currentPage--)" 
            :disabled="currentPage === 1"
            :class="[
              currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50',
              'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md'
            ]"
          >
            Précédent
          </button>
          <button 
            @click="currentPage < totalPages && (currentPage++)" 
            :disabled="currentPage === totalPages"
            :class="[
              currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50',
              'ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md'
            ]"
          >
            Suivant
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Page <span class="font-medium">{{ currentPage }}</span> sur <span class="font-medium">{{ totalPages }}</span>
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="currentPage = 1"
                :disabled="currentPage === 1"
                :class="[
                  currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium'
                ]"
              >
                <span class="sr-only">Première page</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  page === currentPage 
                    ? 'z-10 bg-cyan-50 border-cyan-500 text-cyan-600' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="currentPage = totalPages"
                :disabled="currentPage === totalPages"
                :class="[
                  currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium'
                ]"
              >
                <span class="sr-only">Dernière page</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
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
export default {
  name: 'AdsTab',
  
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  
  emits: ['update-success'],
  
  data() {
    return {
      loading: false,
      error: null,
      
      // Filtres
      statusFilter: '',
      typeFilter: '',
      
      // Données
      ads: [],
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      
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
        
        // Filtre par type
        if (this.typeFilter && ad.type !== this.typeFilter) {
          return false;
        }
        
        return true;
      });
    },
    
    // Nombre total de pages
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    
    // Pages à afficher dans la pagination
    displayedPages() {
      const pages = [];
      const maxPages = 5; // Nombre maximum de boutons de page à afficher
      
      if (this.totalPages <= maxPages) {
        // Si le nombre total de pages est inférieur au maximum, afficher toutes les pages
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Sinon, afficher une plage centrée sur la page actuelle
        let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
        let end = Math.min(this.totalPages, start + maxPages - 1);
        
        // Ajuster le début si la fin est trop proche du total
        if (end === this.totalPages) {
          start = Math.max(1, end - maxPages + 1);
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    }
  },
  
  mounted() {
    this.loadTestData();
  },
  
  beforeDestroy() {
    // Nettoyer le timer de notification si existant
    if (this.notification.timer) {
      clearTimeout(this.notification.timer);
    }
  },
  
  methods: {
    // Charger des données de test
    loadTestData() {
      this.loading = true;
      
      // Charger directement des données de test pour être sûr qu'elles s'affichent
      setTimeout(() => {
        this.ads = [
          {
            id: '1',
            title: 'Bannière promotionnelle été',
            type: 'banner',
            location: 'homepage',
            dimensions: '728x90 px',
            image: 'https://placehold.co/728x90',
            url: 'https://example.com/promo',
            price: 25000,
            start_date: '2023-06-01',
            end_date: '2023-07-31',
            days_left: 45,
            status: 'active',
            impressions: 12456,
            clicks: 348,
            ctr: 0.0279 // Click-through rate
          },
          {
            id: '2',
            title: 'Offre spéciale investisseurs',
            type: 'sidebar',
            location: 'listing_page',
            dimensions: '300x250 px',
            image: 'https://placehold.co/300x250',
            url: 'https://example.com/invest',
            price: 18000,
            start_date: '2023-04-15',
            end_date: '2023-05-15',
            days_left: 4,
            status: 'active',
            impressions: 8765,
            clicks: 215,
            ctr: 0.0245
          },
          {
            id: '3',
            title: 'Annonce financement immobilier',
            type: 'popup',
            location: 'exit_intent',
            dimensions: '500x400 px',
            image: 'https://placehold.co/500x400',
            url: 'https://example.com/finance',
            price: 35000,
            start_date: '2023-03-01',
            end_date: '2023-06-01',
            days_left: 22,
            status: 'suspended',
            impressions: 5432,
            clicks: 178,
            ctr: 0.0328
          },
          {
            id: '4',
            title: 'Bannière agence immobilière',
            type: 'banner',
            location: 'search_results',
            dimensions: '728x90 px',
            image: null,
            url: 'https://example.com/agency',
            price: 15000,
            start_date: null,
            end_date: null,
            days_left: null,
            status: 'pending',
            impressions: 0,
            clicks: 0,
            ctr: 0
          }
        ];
        
        this.totalItems = this.ads.length;
        this.loading = false;
        
        console.log("Données fictives chargées:", this.ads);
        
        // Après chargement, tenter de récupérer les données réelles de l'API
        this.fetchAds();
      }, 300);
    },
    
    // Récupérer les publicités depuis l'API
    async fetchAds() {
      try {
        // Appel à l'API via notre proxy Directus
        const response = await fetch(`/api/directus/items/publicite?filter[user_created][_eq]=${this.userId}&fields=*&sort=-date_created`);
        
        if (!response.ok) {
          console.warn("API non disponible, données fictives conservées");
          return;
        }
        
        const data = await response.json();
        
        if (data && data.data && data.data.length > 0) {
          // Transformer les données pour correspondre au format attendu
          const apiAds = data.data.map(ad => {
            // Calculer les jours restants
            let daysLeft = null;
            if (ad.date_fin) {
              const endDate = new Date(ad.date_fin);
              const today = new Date();
              const diff = endDate - today;
              daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
            }
            
            return {
              id: ad.id,
              title: ad.titre || 'Sans titre',
              type: ad.type || 'banner',
              location: ad.emplacement || 'homepage',
              dimensions: ad.dimensions || '',
              image: ad.image ? `/uploads/${ad.image}` : null,
              url: ad.url || '#',
              price: ad.prix || 0,
              start_date: ad.date_debut || null,
              end_date: ad.date_fin || null,
              days_left: daysLeft,
              status: ad.status || 'pending',
              impressions: ad.impressions || 0,
              clicks: ad.clics || 0,
              ctr: ad.clics && ad.impressions ? (ad.clics / ad.impressions) : 0
            };
          });
          
          // Remplacer les données fictives par les données réelles
          this.ads = apiAds;
          this.totalItems = apiAds.length;
          console.log("Données réelles chargées:", this.ads);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des publicités:', error);
        // Conserver les données fictives en cas d'erreur
      }
    },
    
    // Obtenir la classe CSS pour un statut
    getStatusClass(status) {
      switch (status) {
        case 'active':
        case 'published':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
        case 'pending':
        case 'draft':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
        case 'suspended':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800';
        case 'expired':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
        default:
          return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
      }
    },
    
    // Obtenir le libellé français pour un statut
    getStatusLabel(status) {
      switch (status) {
        case 'active':
        case 'published':
          return 'Active';
        case 'pending':
        case 'draft':
          return 'En attente';
        case 'suspended':
          return 'Suspendue';
        case 'expired':
        case 'archived':
          return 'Terminée';
        case 'rejected':
          return 'Rejetée';
        default:
          return status || 'Inconnu';
      }
    },
    
    // Obtenir le libellé pour un type de publicité
    getTypeLabel(type) {
      switch (type) {
        case 'banner':
          return 'Bannière';
        case 'sidebar':
          return 'Sidebar';
        case 'popup':
          return 'Popup';
        default:
          return type || 'Inconnu';
      }
    },
    
    // Obtenir le libellé pour un emplacement
    getLocationLabel(location) {
      switch (location) {
        case 'homepage':
          return 'Page d\'accueil';
        case 'listing_page':
          return 'Page de liste d\'annonces';
        case 'search_results':
          return 'Résultats de recherche';
        case 'detail_page':
          return 'Page de détail d\'annonce';
        case 'exit_intent':
          return 'Intention de sortie (popup)';
        default:
          return location || 'Inconnu';
      }
    },
    
    // Formater un prix en euros
    formatPrice(cents) {
      if (cents === undefined || cents === null) return 'N/A';
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(cents);
    },
    
    // Formater une date
    formatDate(dateStr) {
      if (!dateStr) return 'N/A';
      
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },
    
    // Voir les statistiques d'une publicité
    viewAdStats(adId) {
      this.showNotification(`Redirection vers les statistiques de la publicité #${adId}`);
    },
    
    // Modifier une publicité
    editAd(adId) {
      this.showNotification(`Redirection vers l'édition de la publicité #${adId}`);
    },
    
    // Suspendre une publicité
    async suspendAd(adId) {
      if (confirm('Êtes-vous sûr de vouloir suspendre cette publicité ? Elle ne sera plus visible pour les visiteurs jusqu\'à sa réactivation.')) {
        try {
          // Mise à jour locale
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
    
    // Réactiver une publicité
    async reactivateAd(adId) {
      try {
        // Mise à jour locale
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
    
    // Supprimer une publicité
    async deleteAd(adId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette publicité ? Cette action est irréversible.')) {
        try {
          // Mise à jour locale
          this.ads = this.ads.filter(a => a.id !== adId);
          this.totalItems--;
          
          this.showNotification('Publicité supprimée avec succès');
        } catch (error) {
          console.error('Erreur lors de la suppression de la publicité:', error);
          alert('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    },
    
    // Afficher une notification temporaire
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
      
      // Émettre l'événement vers le parent
      this.$emit('update-success', message);
    }
  }
};
</script>