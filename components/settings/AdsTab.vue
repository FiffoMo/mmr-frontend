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
            <tr v-if="ads.length === 0" class="hover:bg-gray-50">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                Aucune publicité disponible
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
                    @click="showExtendDurationDialog(ad.id)"
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
    
    <!-- Modal de prolongation de durée -->
    <div v-if="extendDurationModal.show" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Prolonger la publicité
                </h3>
                <div class="mt-4">
                  <p class="text-sm text-gray-500 mb-4">
                    Sélectionnez la durée pour laquelle vous souhaitez prolonger cette publicité.
                  </p>
                  
                  <div class="mt-4">
                    <label for="extension-days" class="block text-sm font-medium text-gray-700">Durée (en jours)</label>
                    <select 
                      id="extension-days" 
                      v-model="extendDurationModal.days" 
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                    >
                      <option value="7">7 jours</option>
                      <option value="15">15 jours</option>
                      <option value="30">30 jours</option>
                      <option value="60">60 jours</option>
                      <option value="90">90 jours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="confirmExtendDuration()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Prolonger
            </button>
            <button 
              type="button" 
              @click="cancelExtendDuration()"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
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
import { useDirectusSDK } from '@/composables/useDirectusSDK';

export default {
  name: 'AdsTab',
  
  props: {
    userId: {
      type: String,
      required: true
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
      },
      
      // Modal de prolongation de durée
      extendDurationModal: {
        show: false,
        adId: null,
        days: 30
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
    this.fetchAds();
  },
  
  beforeDestroy() {
    // Nettoyer le timer de notification si existant
    if (this.notification.timer) {
      clearTimeout(this.notification.timer);
    }
  },
  
  methods: {
    // Méthode fetchAds() mise à jour pour utiliser client_id
    async fetchAds() {
      this.loading = true;
      this.error = null;
      
      // Timeout pour éviter les chargements infinis
      const timeout = setTimeout(() => {
        if (this.loading) {
          console.log('Timeout atteint lors du chargement des publicités');
          this.loading = false;
          this.ads = [];
        }
      }, 5000);
      
      try {
        console.log('Début de fetchAds()');
        
        // Récupérer l'ID utilisateur depuis les props
        const userId = this.userId;
        console.log('ID Utilisateur:', userId);
        
        if (!userId) {
          throw new Error('Utilisateur non identifié');
        }
        
        // Utiliser d'abord la méthode standardisée du SDK si disponible
        try {
          console.log('Tentative de récupération via SDK...');
          const result = await this.directusSDK.getUserAds();
          
          if (result && result.data && result.data.length > 0) {
            console.log('Publicités récupérées via SDK:', result.data);
            // Traitement des données ici...
            this.processAdsData(result.data);
            return;
          } else {
            console.log('Aucune publicité trouvée via SDK, essai avec client_id explicite...');
          }
        } catch (sdkError) {
          console.warn('SDK non disponible ou erreur:', sdkError);
        }
        
        // Fallback: utiliser le SDK avec client_id explicite
        try {
          const fallbackResult = await this.directusSDK.getItems('publicite', {
            filter: { client_id: { _eq: userId } },
            fields: '*'
          });
          
          if (fallbackResult && fallbackResult.data && fallbackResult.data.length > 0) {
            console.log('Publicités récupérées via fallback SDK:', fallbackResult.data);
            this.processAdsData(fallbackResult.data);
            return;
          } else {
            console.log('Aucune publicité trouvée via fallback SDK, essai avec fetch direct...');
          }
        } catch (fallbackError) {
          console.warn('Fallback SDK échoué:', fallbackError);
        }
        
        // Dernier recours: utiliser fetch directement avec le standard client_id
        const response = await fetch(`/api/directus/items/publicite?filter[client_id][_eq]=${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur détaillée API:', errorData);
          throw new Error(`Erreur API: ${errorData?.errors?.[0]?.message || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Réponse brute de publicites:', result);
        
        if (!result.data || result.data.length === 0) {
          console.log('Aucune publicité trouvée');
          this.ads = [];
          this.totalItems = 0;
          return;
        }
        
        this.processAdsData(result.data);
        
      } catch (error) {
        console.error('Erreur lors du chargement des publicités:', error);
        this.error = error.message || "Impossible de charger vos publicités.";
        this.ads = [];
        this.totalItems = 0;
      } finally {
        clearTimeout(timeout);
        this.loading = false;
      }
    },

    // Méthode pour traiter les données récupérées
    processAdsData(data) {
      this.ads = data.map(ad => ({
        id: ad.id,
        title: ad.titre || 'Sans titre',
        type: ad.emplacement || 'banner',
        location: ad.emplacement || 'homepage',
        url: ad.url || '#',
        image: ad.image ? `/uploads/${ad.image}` : null,
        start_date: ad.date_debut || null,
        end_date: ad.date_fin || null,
        duree: ad.duree || null,
        price: ad.prix || 0,
        status: ad.status || ad.statut_affichage || 'draft',
        days_left: ad.date_fin ? Math.max(0, Math.ceil((new Date(ad.date_fin) - new Date()) / (1000 * 60 * 60 * 24))) : null,
        impressions: ad.impressions || 0,
        clicks: ad.clics || 0,
        ctr: ad.clics && ad.impressions ? (ad.clics / ad.impressions) : 0,
        dimensions: '300x250' // Valeur par défaut, à remplacer par une propriété réelle si disponible
      }));
      
      // Vérifier si des publicités sont expirées et mettre à jour leur statut
      const now = new Date();
      this.ads.forEach(ad => {
        if (ad.end_date && new Date(ad.end_date) < now && ad.status === 'active') {
          ad.status = 'expired';
        }
      });
      
      this.totalItems = this.ads.length;
      console.log('Publicités transformées:', this.ads);
    },
    
    // Calculer la date de fin à partir de la date de début et de la durée
    calculateEndDate(startDate, duration) {
      if (!startDate || !duration) return null;
      
      try {
        // Convertir la chaîne de date en objet Date
        const start = new Date(startDate);
        
        // Ajouter le nombre de jours spécifié dans durée
        const end = new Date(start);
        end.setDate(start.getDate() + Number(duration));
        
        // Formater la date pour MySQL (YYYY-MM-DD HH:MM:SS)
        return this.formatDateForMySQL(end);
      } catch (error) {
        console.error('Erreur lors du calcul de la date de fin:', error);
        return null;
      }
    },

    // Formater une date pour MySQL
    formatDateForMySQL(date) {
      if (!date) return null;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // Mise à jour d'une publicité avec gestion de la durée
    async updateAd(adId, adData) {
      try {
        // Si date_debut et duree sont définies, calculer date_fin
        if (adData.date_debut && adData.duree) {
          adData.date_fin = this.calculateEndDate(adData.date_debut, adData.duree);
        }
        
        // Utiliser updateItem du SDK
        await this.directusSDK.updateItem('publicite', adId, adData);
        
        // Mettre à jour localement
        const index = this.ads.findIndex(a => a.id === adId);
        if (index !== -1) {
          // Mettre à jour l'élément dans le tableau
          this.ads[index] = { ...this.ads[index], ...adData };
          
          // Recalculer days_left si date_fin a été mise à jour
          if (adData.date_fin) {
            this.ads[index].days_left = Math.max(0, Math.ceil(
              (new Date(adData.date_fin) - new Date()) / (1000 * 60 * 60 * 24)
            ));
          }
        }
        
        this.showNotification('Publicité mise à jour avec succès');
        return true;
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la publicité:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
        return false;
      }
    },

    // Création d'une publicité avec gestion de la durée
    async createAd(adData) {
      try {
        // Assurer que client_id est défini (en utilisant le userId des props)
        adData.client_id = this.userId;
        
        // Si date_debut et duree sont définies, calculer date_fin
        if (adData.date_debut && adData.duree) {
          adData.date_fin = this.calculateEndDate(adData.date_debut, adData.duree);
        }
        
        // Utiliser createItem du SDK
        const createdAd = await this.directusSDK.createItem('publicite', adData);
        
        // Rafraîchir la liste des publicités
        await this.fetchAds();
        
        this.showNotification('Publicité créée avec succès');
        return createdAd;
      } catch (error) {
        console.error('Erreur lors de la création de la publicité:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
        return null;
      }
    },

    // Suspendre une publicité
    async suspendAd(adId) {
      if (confirm('Êtes-vous sûr de vouloir suspendre cette publicité ?')) {
        try {
          // Utiliser updateItem du SDK
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

    // Réactiver une publicité
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
            if (confirm('Cette publicité a expiré. Voulez-vous prolonger sa durée ?')) {
              // Ouvrir le formulaire de prolongation
              this.showExtendDurationDialog(adId);
              return;
            }
          }
        }
        
        // Utiliser updateItem du SDK
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

    // Supprimer une publicité
    async deleteAd(adId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) {
        try {
          // Utiliser deleteItem du SDK
          await this.directusSDK.deleteItem('publicite', adId);
          
          // Mettre à jour localement
          this.ads = this.ads.filter(a => a.id !== adId);
          this.totalItems--;
          
          this.showNotification('Publicité supprimée avec succès');
        } catch (error) {
          console.error('Erreur lors de la suppression de la publicité:', error);
          alert('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    },
    
    // Afficher le modal de prolongation de durée
    showExtendDurationDialog(adId) {
      this.extendDurationModal.adId = adId;
      this.extendDurationModal.show = true;
    },
    
    // Annuler la prolongation de durée
    cancelExtendDuration() {
      this.extendDurationModal.show = false;
      this.extendDurationModal.adId = null;
    },
    
    // Confirmer la prolongation de durée
    async confirmExtendDuration() {
      if (!this.extendDurationModal.adId || !this.extendDurationModal.days) {
        alert('Veuillez sélectionner une durée valide');
        return;
      }
      
      try {
        const adId = this.extendDurationModal.adId;
        const additionalDays = Number(this.extendDurationModal.days);
        
        await this.extendAdDuration(adId, additionalDays);
        
        // Fermer le modal
        this.extendDurationModal.show = false;
        this.extendDurationModal.adId = null;
      } catch (error) {
        console.error('Erreur lors de la prolongation:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    },
    
    // Étendre la durée d'une publicité
    async extendAdDuration(adId, additionalDays) {
      try {
        const adIndex = this.ads.findIndex(a => a.id === adId);
        if (adIndex === -1) {
          throw new Error('Publicité non trouvée');
        }
        
        const ad = this.ads[adIndex];
        const now = new Date();
        let newStartDate = now;
        let newEndDate = null;
        
        // Si la publicité n'a pas expiré, ajouter des jours à la date de fin existante
        if (ad.end_date && new Date(ad.end_date) > now) {
          newEndDate = new Date(ad.end_date);
          newEndDate.setDate(newEndDate.getDate() + Number(additionalDays));
        } else {
          // Si la publicité a expiré, commencer à partir d'aujourd'hui
          newEndDate = new Date(now);
          newEndDate.setDate(now.getDate() + Number(additionalDays));
        }
        
        // Calculer la nouvelle durée totale
        const newDuration = Math.ceil((newEndDate - newStartDate) / (1000 * 60 * 60 * 24));
        
        // Mettre à jour la publicité avec les nouvelles dates et durée
        const updateData = {
          date_debut: this.formatDateForMySQL(newStartDate),
          date_fin: this.formatDateForMySQL(newEndDate),
          duree: newDuration,
          status: 'active' // Réactiver automatiquement
        };
        
        // Utiliser updateItem du SDK
        await this.directusSDK.updateItem('publicite', adId, updateData);
        
        // Mettre à jour localement
        Object.assign(this.ads[adIndex], {
          start_date: updateData.date_debut,
          end_date: updateData.date_fin,
          duree: newDuration,
          status: 'active',
          days_left: newDuration
        });
        
        this.showNotification(`Publicité prolongée avec succès pour ${additionalDays} jours`);
        return true;
      } catch (error) {
        console.error('Erreur lors de l\'extension de la durée de la publicité:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
        return false;
      }
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
        'active': 'Actif',
        'archived': 'Archivé',
        'suspended': 'Suspendu',
        'pending': 'En attente',
        'expired': 'Expiré'
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
    
    // Formater une date pour l'affichage
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

    // Formater un prix en euros
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
    
    // Méthodes pour les actions
    viewAdStats(adId) { 
      this.showNotification(`Redirection vers les statistiques de la publicité #${adId}`);
    },
    
    editAd(adId) {
      this.showNotification(`Redirection vers l'édition de la publicité #${adId}`);
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
      
      // Émettre l'événement vers le parent
      this.$emit('update-success', message);
    }
  }
};
</script>