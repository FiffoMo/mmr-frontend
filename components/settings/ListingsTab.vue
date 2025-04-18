<template>
  <div v-if="isActive" class="bg-white shadow sm:rounded-lg p-4 mb-4">
    <!-- En-tête -->
    <div class="pb-5 border-b border-gray-200">
      <h3 class="text-lg leading-6 font-medium text-gray-900">
        Mes annonces
      </h3>
      <p class="mt-2 max-w-4xl text-sm text-gray-500">
        Gérez vos annonces immobilières et suivez leur performance.
      </p>
    </div>

    <!-- Affichage du loader pendant le chargement -->
    <div v-if="loading && !error" class="py-12 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      <p class="mt-4 text-sm text-gray-500">Chargement de vos annonces...</p>
    </div>

    <!-- Affichage en cas d'erreur -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 my-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">
            {{ error || "Une erreur est survenue lors du chargement de vos annonces." }}
          </p>
          <p class="mt-2 text-sm text-red-700">
            <button @click="fetchListings" class="font-medium underline text-red-700 hover:text-red-600">
              Réessayer
            </button>
          </p>
        </div>
      </div>
    </div>

    <!-- Aucune annonce -->
    <div v-else-if="!loading && (!forfaits || forfaits.length === 0 || !forfaits.some(f => f.annonces && f.annonces.length > 0))" class="bg-gray-50 rounded-lg p-8 my-6 text-center">
      <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
        <svg class="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune annonce</h3>
      <p class="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        Vous n'avez pas encore publié d'annonce immobilière. Pour commencer, créez votre première annonce en cliquant sur le bouton ci-dessous.
      </p>
      <NuxtLink to="/publier-annonce" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Publier une annonce
      </NuxtLink>
    </div>

    <!-- Liste des forfaits et annonces -->
    <div v-else>
      <!-- Filtres de recherche/tri -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select 
            id="status-filter" 
            v-model="statusFilter" 
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publiée</option>
            <option value="pending">En attente</option>
            <option value="expired">Expirée</option>
            <option value="suspended">Suspendue</option>
            <option value="draft">Brouillon</option>
          </select>
        </div>
        
        <div>
          <label for="search-query" class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
          <input 
            type="text" 
            id="search-query" 
            v-model="searchQuery" 
            placeholder="Rechercher par titre, lieu..." 
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
          />
        </div>
      </div>

      <!-- Affichage des forfaits -->
      <div v-for="forfait in forfaits" :key="forfait.id" class="mb-8">
        <!-- En-tête du forfait -->
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h4 class="text-lg font-medium text-gray-900">{{ forfait.nom }}</h4>
            <p class="text-sm text-gray-500">
              {{ forfait.annonces.length }} / {{ forfait.limite_annonces }} annonces utilisées
              <span v-if="forfait.jours_restants !== null" :class="{ 'text-red-600': forfait.jours_restants <= 7 }">
                • {{ forfait.jours_restants }} jours restants
              </span>
              <span v-if="forfait.estExpire" class="text-red-600 font-medium">
                • Forfait expiré
              </span>
            </p>
          </div>
          <div class="flex space-x-3">
            <button 
              v-if="forfait.annonces.length < forfait.limite_annonces && !forfait.estExpire"
              @click="goToCreateListing(forfait.id)" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-sm"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Ajouter une annonce
            </button>
            <button
              @click="renewForfait(forfait.id)"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
              Renouveler
            </button>
          </div>
        </div>

        <!-- Aucune annonce dans ce forfait -->
        <div v-if="filteredAnnonces(forfait).length === 0" class="bg-gray-50 p-6 rounded-lg text-center mb-4">
          <p class="text-gray-500 text-sm mb-3">Aucune annonce ne correspond à vos critères de recherche.</p>
          <button 
            v-if="forfait.annonces.length < forfait.limite_annonces && !forfait.estExpire"
            @click="goToCreateListing(forfait.id)" 
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Ajouter une annonce
          </button>
          <button 
            v-else-if="searchQuery || statusFilter"
            @click="searchQuery = ''; statusFilter = ''" 
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Effacer les filtres
          </button>
        </div>

        <!-- Grille d'annonces -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
          <div v-for="annonce in filteredAnnonces(forfait)" :key="annonce.id" class="bg-white overflow-hidden shadow rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
            <div class="relative">
              <!-- Image de l'annonce -->
              <div class="h-40 bg-gray-200 relative">
                <img v-if="annonce.image" :src="annonce.image" alt="" class="h-full w-full object-cover" />
                <div v-else class="h-full w-full flex items-center justify-center text-gray-400">
                  <svg class="h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 22V12h6v10" />
                  </svg>
                </div>
              </div>
              
              <!-- Badge de statut -->
              <div class="absolute top-2 right-2">
                <span :class="getStatusClass(annonce.status)">
                  {{ getStatusLabel(annonce.status) }}
                </span>
              </div>
              
              <!-- Badge mise en avant -->
              <div v-if="annonce.mise_en_avant" class="absolute top-2 left-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                  Mise en avant
                </span>
              </div>
              
              <!-- Badge forfait expiré -->
              <div v-if="forfait.estExpire" class="absolute top-2 left-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                  Forfait expiré
                </span>
              </div>
            </div>
            
            <div class="p-4">
              <!-- Infos de l'annonce -->
              <h4 class="text-sm font-medium text-gray-900 truncate mb-1">{{ annonce.titre }}</h4>
              <p class="text-xs text-gray-500 mb-2">{{ annonce.localisation }}</p>
              
              <div class="flex justify-between items-center mb-3">
                <p class="text-sm font-medium text-cyan-600">{{ formatPrice(annonce.prix) }}</p>
                <p class="text-xs text-gray-500">{{ annonce.surface }} m² • {{ annonce.pieces }} pièces</p>
              </div>
              
              <!-- Statistiques -->
              <div class="flex justify-between text-xs text-gray-500 mb-3">
                <div class="flex items-center">
                  <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {{ annonce.vues }}
                </div>
                <div class="flex items-center">
                  <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {{ annonce.favoris }}
                </div>
                <div class="flex items-center">
                  <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {{ annonce.messages }}
                </div>
              </div>
              
              <!-- Boutons d'actions -->
              <div class="flex justify-between">
                <div class="relative" :id="`dropdown-${annonce.id}`">
                  <button 
                    @click="toggleOptionsMenu(annonce.id)" 
                    class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    Options
                  </button>
                  
                  <!-- Menu déroulant -->
                  <div 
                    v-if="optionsMenuOpen === annonce.id" 
                    class="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                  >
                    <div class="py-1">
                      <button 
                        @click="editListing(annonce.id)" 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Modifier
                      </button>
                      
                      <button 
                        v-if="annonce.status === 'published'"
                        @click="suspendListing(annonce.id)" 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Suspendre
                      </button>
                      
                      <button 
                        v-if="annonce.status === 'suspended' && !forfait.estExpire"
                        @click="reactivateListing(annonce.id)" 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Réactiver
                      </button>
                      
                      <button 
                        v-if="!annonce.mise_en_avant && !forfait.estExpire"
                        @click="promoteListing(annonce.id)" 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mettre en avant
                      </button>
                      
                      <button 
                        v-else-if="annonce.mise_en_avant"
                        @click="removePromotion(annonce.id)" 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Retirer mise en avant
                      </button>
                      
                      <button 
                        v-if="canMoveToOtherForfait(annonce, forfait)"
                        @click="moveListingToForfait(annonce.id, forfait.id, getAvailableForfaits(forfait.id)[0].id)" 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Déplacer vers un autre forfait
                      </button>
                      
                      <button 
                        @click="deleteListing(annonce.id)" 
                        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="viewListing(annonce.id)" 
                  class="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Voir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de déplacement d'annonce -->
    <div v-if="moveModal.show" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="moveModal.show = false"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-cyan-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Déplacer l'annonce
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Vous êtes sur le point de déplacer cette annonce du forfait "{{ moveModal.sourceForfaitName }}" vers "{{ moveModal.targetForfaitName }}". Confirmez-vous ce déplacement ?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="confirmMove"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-cyan-600 text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Confirmer
            </button>
            <button 
              type="button" 
              @click="moveModal.show = false"
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
import { useDirectusSDK } from '~/composables/useDirectusSDK';
import { useAuthStore } from '~/stores/useAuthStore';

export default {
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      loading: false,
      error: null,
      dataRequested: false,
      forfaits: [],
      
      // Filtres
      statusFilter: '',
      searchQuery: '',
      
      // Gestion du menu d'options
      optionsMenuOpen: null,
      
      // Modal de déplacement d'annonce
      moveModal: {
        show: false,
        annonceId: null,
        sourceForfaitId: null,
        targetForfaitId: null,
        sourceForfaitName: '',
        targetForfaitName: ''
      },
      
      // Notification toast
      notification: {
        show: false,
        message: '',
        timer: null
      },
      
      // Liste des annonces suspendues automatiquement (forfaits expirés)
      annoncesSuspenduesAuto: []
    };
  },

  watch: {
    isActive(newVal) {
      if (newVal && !this.dataRequested) {
        this.fetchListings();
        this.dataRequested = true;
      }
    }
  },

  mounted() {
    // Ajouter un écouteur de clic global pour fermer le menu d'options
    document.addEventListener('click', this.handleOutsideClick);
    
    if (this.isActive && !this.dataRequested) {
      this.fetchListings();
      this.dataRequested = true;
    }
  },

  beforeUnmount() {
    // Nettoyer l'écouteur de clic
    document.removeEventListener('click', this.handleOutsideClick);
    
    // Nettoyer le timer de notification si existant
    if (this.notification.timer) {
      clearTimeout(this.notification.timer);
    }
  },

  methods: {
    async fetchListings() {
      this.loading = true;
      this.error = null;
      
      // Timeout pour éviter un chargement infini
      const timeout = setTimeout(() => {
        if (this.loading) {
          this.loading = false;
          this.forfaits = [];
          console.log('Timeout atteint lors du chargement des annonces');
        }
      }, 8000);
      
      try {
        const authStore = useAuthStore();
        const userId = authStore.user?.id;
        
        if (!userId) {
          throw new Error('Utilisateur non connecté');
        }
        
        // Utiliser useDirectusSDK pour récupérer les données
        const directusSDK = useDirectusSDK();
        
        try {
          // Utiliser client_id au lieu de user_id pour suivre la standardisation
          const result = await directusSDK.getClientForfaitsWithListings(userId);
          
          if (result && result.data) {
            this.processForfaitsData(result.data);
          } else {
            throw new Error('Aucune donnée reçue');
          }
        } catch (sdkError) {
          console.warn('Échec SDK, tentative avec fetch direct:', sdkError);
          
          // Recours au fetch direct en utilisant la collection commandes pour récupérer les forfaits
          // et en utilisant client_id au lieu de user_id
          const response = await fetch(`/api/directus/items/commandes?filter[client_id][_eq]=${userId}&fields=*,produit.*,annonces.*`, {
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur détaillée API:', errorData);
            throw new Error(`Erreur API: ${errorData?.errors?.[0]?.message || response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.data) {
            this.processForfaitsData(result.data);
          } else {
            this.forfaits = [];
          }
        }
        
        // Vérifier et suspendre automatiquement les annonces des forfaits expirés
        await this.checkAndSuspendExpiredListings();
        
        console.log('Forfaits et annonces récupérés:', this.forfaits);
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
        this.error = error.message || "Impossible de charger vos annonces. Veuillez réessayer.";
        this.forfaits = [];
      } finally {
        clearTimeout(timeout);
        this.loading = false;
      }
    },
    
    // Vérifier et suspendre les annonces des forfaits expirés
    async checkAndSuspendExpiredListings() {
      this.annoncesSuspenduesAuto = [];
      const annoncesASuspendre = [];
      
      // Parcourir tous les forfaits expirés
      for (const forfait of this.forfaits) {
        if (forfait.estExpire) {
          // Parcourir les annonces publiées dans ce forfait
          for (const annonce of forfait.annonces) {
            if (annonce.status === 'published') {
              annoncesASuspendre.push({
                id: annonce.id,
                titre: annonce.titre
              });
            }
          }
        }
      }
      
      // Si on a des annonces à suspendre
      if (annoncesASuspendre.length > 0) {
        try {
          // Suspendre toutes les annonces en parallèle
          await Promise.all(annoncesASuspendre.map(async (annonce) => {
            const response = await fetch(`/api/directus/items/annonces/${annonce.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ 
                status: 'suspended',
                suspension_auto: true
              })
            });
            
            if (response.ok) {
              this.annoncesSuspenduesAuto.push(annonce);
              
              // Mettre à jour le statut localement
              for (const forfait of this.forfaits) {
                const index = forfait.annonces.findIndex(a => a.id === annonce.id);
                if (index !== -1) {
                  forfait.annonces[index].status = 'suspended';
                  forfait.annonces[index].suspension_auto = true;
                }
              }
            }
          }));
          
          // Afficher un message si des annonces ont été suspendues
          if (this.annoncesSuspenduesAuto.length > 0) {
            const message = this.annoncesSuspenduesAuto.length === 1
              ? "1 annonce a été automatiquement suspendue car son forfait est expiré."
              : `${this.annoncesSuspenduesAuto.length} annonces ont été automatiquement suspendues car leurs forfaits sont expirés.`;
            
            this.showNotification(message);
          }
        } catch (error) {
          console.error('Erreur lors de la suspension automatique des annonces:', error);
        }
      }
    },
    
    // Traitement des données de forfaits
    processForfaitsData(data) {
      // Conversion des commandes en "forfaits" pour conserver la structure existante du composant
      this.forfaits = data.map(commande => {
        // Extraire les informations du produit associé à la commande
        const produit = commande.produit || {};
        
        // Vérifier si le forfait est expiré en utilisant date_fin au lieu de date_expiration
        const jours = this.getRemainingDays(commande.date_fin);
        const estExpire = jours <= 0;
        
        return {
          id: commande.id,
          nom: produit.nom || 'Forfait sans nom',
          // Utiliser nombre_annonces si disponible, sinon limite_annonces ou une valeur par défaut
          limite_annonces: produit.nombre_annonces || produit.limite_annonces || 0,
          // Utiliser la date de fin de la commande pour l'expiration
          date_expiration: this.formatDate(commande.date_fin),
          jours_restants: jours,
          estExpire: estExpire,
          // Filtrer les annonces pour ne garder que celles liées à cette commande
          annonces: Array.isArray(commande.annonces) ? commande.annonces.map(annonce => ({
            id: annonce.id,
            // Adaptation aux noms de champs réels (Titre au lieu de titre, etc.)
            titre: annonce.Titre || 'Sans titre',
            type_bien: annonce.type_bien || '',
            localisation: annonce.localisation || '',
            prix: annonce.prix_vente || 0,
            surface: annonce.surface_habitable || 0,
            pieces: annonce.pieces || 0,
            chambres: annonce.chambres || 0,
            image: annonce.image_principale ? `/uploads/${annonce.image_principale}` : null,
            status: annonce.status || 'pending',
            date_publication: annonce.date_publication || null,
            vues: annonce.vues || 0,
            favoris: annonce.favoris || 0,
            messages: annonce.messages || 0,
            mise_en_avant: Boolean(annonce.mise_en_avant),
            suspension_auto: Boolean(annonce.suspension_auto),
            // Ajouter commande_id pour référencer correctement le forfait dans les opérations
            commande_id: commande.id
          })) : []
        };
      });
    },
    
    // Filtrer les annonces d'un forfait selon les critères
    filteredAnnonces(forfait) {
      if (!forfait.annonces) return [];
      
      return forfait.annonces.filter(annonce => {
        // Filtre par statut
        if (this.statusFilter && annonce.status !== this.statusFilter) {
          return false;
        }
        
        // Filtre par recherche
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          return (annonce.titre && annonce.titre.toLowerCase().includes(query)) ||
                 (annonce.localisation && annonce.localisation.toLowerCase().includes(query)) ||
                 (annonce.type_bien && annonce.type_bien.toLowerCase().includes(query));
        }
        
        return true;
      });
    },
    
    // Calculer le nombre de jours restants
    getRemainingDays(dateString) {
      if (!dateString) return null;
      
      const expiration = new Date(dateString);
      const today = new Date();
      
      // Différence en millisecondes
      const diffTime = expiration - today;
      // Convertir en jours (arrondi supérieur)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, diffDays);
    },
    
    // Obtenir la classe CSS pour un statut
    getStatusClass(status) {
      switch (status) {
        case 'published':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
        case 'pending':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
        case 'suspended':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800';
        case 'expired':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
        case 'draft':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
        default:
          return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
      }
    },
    
    // Obtenir le libellé français pour un statut
    getStatusLabel(status) {
      switch (status) {
        case 'published':
          return 'Publiée';
        case 'pending':
          return 'En attente';
        case 'suspended':
          return 'Suspendue';
        case 'expired':
          return 'Expirée';
        case 'draft':
          return 'Brouillon';
        case 'archived':
          return 'Archivée';
        default:
          return status || 'Inconnu';
      }
    },
    
    // Formater un prix en euros
    formatPrice(price) {
      if (price === undefined || price === null) return 'N/A';
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(price);
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
    
    // Ouvrir/fermer le menu d'options
    toggleOptionsMenu(annonceId) {
      if (this.optionsMenuOpen === annonceId) {
        this.optionsMenuOpen = null;
      } else {
        this.optionsMenuOpen = annonceId;
      }
    },
    
    // Gérer les clics en dehors du menu d'options
    handleOutsideClick(event) {
      // Ne rien faire si aucun menu n'est ouvert
      if (this.optionsMenuOpen === null) return;
      
      // Vérifier si le clic est en dehors d'un menu
      if (!event.target.closest('.relative')) {
        this.optionsMenuOpen = null;
      }
    },
    
    // Suspendre une annonce
    async suspendListing(annonceId) {
      if (confirm('Êtes-vous sûr de vouloir suspendre cette annonce ? Elle ne sera plus visible pour les visiteurs jusqu\'à sa réactivation.')) {
        try {
          // Appel API pour modifier le statut
          const response = await fetch(`/api/directus/items/annonces/${annonceId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
              status: 'suspended',
              suspension_auto: false 
            })
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          // Mettre à jour localement
          for (const forfait of this.forfaits) {
            const index = forfait.annonces.findIndex(a => a.id === annonceId);
            if (index !== -1) {
              forfait.annonces[index].status = 'suspended';
              forfait.annonces[index].suspension_auto = false;
              break;
            }
          }
          
          this.showNotification('Annonce suspendue avec succès');
        } catch (error) {
          console.error('Erreur lors de la suspension de l\'annonce:', error);
          alert('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    },
    
    // Réactiver une annonce
    async reactivateListing(annonceId) {
      try {
        // Trouver le forfait de l'annonce
        let forfaitAnnonce = null;
        for (const forfait of this.forfaits) {
          const annonce = forfait.annonces.find(a => a.id === annonceId);
          if (annonce) {
            forfaitAnnonce = forfait;
            break;
          }
        }
        
        // Vérifier si le forfait est expiré
        if (forfaitAnnonce && forfaitAnnonce.estExpire) {
          if (!confirm('Ce forfait est expiré. L\'annonce ne sera pas visible sur le site. Voulez-vous quand même la réactiver ?')) {
            return;
          }
        }
        
        // Appel API pour modifier le statut
        const response = await fetch(`/api/directus/items/annonces/${annonceId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            status: 'published',
            suspension_auto: false 
          })
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Mettre à jour localement
        for (const forfait of this.forfaits) {
          const index = forfait.annonces.findIndex(a => a.id === annonceId);
          if (index !== -1) {
            forfait.annonces[index].status = 'published';
            forfait.annonces[index].suspension_auto = false;
            break;
          }
        }
        
        this.showNotification('Annonce réactivée avec succès');
      } catch (error) {
        console.error('Erreur lors de la réactivation de l\'annonce:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    },
    
    // Voir une annonce (redirection vers la page détail)
    viewListing(annonceId) {
      window.open(`/annonces/detail-${annonceId}`, '_blank');
    },
    
    // Modifier une annonce (redirection vers la page d'édition)
    editListing(annonceId) {
      this.$router.push(`/editer-annonce/${annonceId}`);
    },
    
    // Supprimer une annonce
    async deleteListing(annonceId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
        try {
          // Appel API pour supprimer l'annonce
          const response = await fetch(`/api/directus/items/annonces/${annonceId}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          // Supprimer l'annonce du forfait correspondant
          for (const forfait of this.forfaits) {
            const index = forfait.annonces.findIndex(a => a.id === annonceId);
            if (index !== -1) {
              forfait.annonces.splice(index, 1);
              break;
            }
          }
          
          this.showNotification('Annonce supprimée avec succès');
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'annonce:', error);
          alert('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    },
    
    // Mettre en avant une annonce
    async promoteListing(annonceId) {
      try {
        // Appel API pour mettre à jour l'annonce
        const response = await fetch(`/api/directus/items/annonces/${annonceId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ mise_en_avant: true })
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Mettre à jour localement
        for (const forfait of this.forfaits) {
          const index = forfait.annonces.findIndex(a => a.id === annonceId);
          if (index !== -1) {
            forfait.annonces[index].mise_en_avant = true;
            break;
          }
        }
        
        this.optionsMenuOpen = null;
        this.showNotification('Annonce mise en avant avec succès');
      } catch (error) {
        console.error('Erreur lors de la mise en avant de l\'annonce:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    },
    
    // Retirer la mise en avant d'une annonce
    async removePromotion(annonceId) {
      try {
        // Appel API pour mettre à jour l'annonce
        const response = await fetch(`/api/directus/items/annonces/${annonceId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ mise_en_avant: false })
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Mettre à jour localement
        for (const forfait of this.forfaits) {
          const index = forfait.annonces.findIndex(a => a.id === annonceId);
          if (index !== -1) {
            forfait.annonces[index].mise_en_avant = false;
            break;
          }
        }
        
        this.optionsMenuOpen = null;
        this.showNotification('Mise en avant supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression de la mise en avant:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    },
    
    // Aller à la page de création d'annonce avec le forfait présélectionné
    goToCreateListing(forfaitId) {
      this.$router.push({
        path: '/publier-annonce',
        query: { forfait: forfaitId }
      });
    },
    
    // Renouveler un forfait
    renewForfait(forfaitId) {
      this.$router.push({
        path: '/tarifs',
        query: { renew: forfaitId }
      });
    },
    
    // Vérifier si l'annonce peut être déplacée vers un autre forfait
    canMoveToOtherForfait(annonce, currentForfait) {
      // Vérifier s'il y a d'autres forfaits avec de la place disponible
      return this.getAvailableForfaits(currentForfait.id).length > 0;
    },
    
    // Obtenir la liste des forfaits disponibles pour déplacer une annonce
    getAvailableForfaits(currentForfaitId) {
      return this.forfaits.filter(forfait => {
        // Exclure le forfait actuel
        if (forfait.id === currentForfaitId) return false;
        
        // Vérifier s'il y a de la place disponible
        return forfait.annonces.length < forfait.limite_annonces && !forfait.estExpire;
      });
    },
    
    // Afficher la modal de confirmation pour déplacer une annonce
    moveListingToForfait(annonceId, sourceForfaitId, targetForfaitId) {
      // Trouver les noms des forfaits
      const sourceForfait = this.forfaits.find(f => f.id === sourceForfaitId);
      const targetForfait = this.forfaits.find(f => f.id === targetForfaitId);
      
      if (!sourceForfait || !targetForfait) return;
      
      // Configurer la modal
      this.moveModal = {
        show: true,
        annonceId,
        sourceForfaitId,
        targetForfaitId,
        sourceForfaitName: sourceForfait.nom,
        targetForfaitName: targetForfait.nom
      };
      
      // Fermer le menu d'options
      this.optionsMenuOpen = null;
    },
    
    // Confirmer le déplacement d'une annonce
    async confirmMove() {
      try {
        const { annonceId, sourceForfaitId, targetForfaitId } = this.moveModal;
        
        // Vérifier si l'annonce est suspendue à cause d'un forfait expiré
        let annonceStatus = 'same';
        for (const forfait of this.forfaits) {
          if (forfait.id === sourceForfaitId && forfait.estExpire) {
            const annonce = forfait.annonces.find(a => a.id === annonceId);
            if (annonce && annonce.status === 'suspended' && annonce.suspension_auto) {
              annonceStatus = 'published';
            }
          }
        }
        
        // Appel API pour mettre à jour l'annonce
        // Utiliser commande_id au lieu de forfait_id pour être cohérent avec le modèle de données
        const body = { commande_id: targetForfaitId };
        
        // Si l'annonce était suspendue automatiquement et qu'on la déplace vers un forfait actif
        if (annonceStatus === 'published') {
          body.status = 'published';
          body.suspension_auto = false;
        }
        
        const response = await fetch(`/api/directus/items/annonces/${annonceId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(body)
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Mettre à jour localement
        const sourceForfait = this.forfaits.find(f => f.id === sourceForfaitId);
        const targetForfait = this.forfaits.find(f => f.id === targetForfaitId);
        
        if (sourceForfait && targetForfait) {
          // Trouver l'annonce dans le forfait source
          const annonceIndex = sourceForfait.annonces.findIndex(a => a.id === annonceId);
          
          if (annonceIndex !== -1) {
            // Récupérer l'annonce
            const annonce = { ...sourceForfait.annonces[annonceIndex] };
            
            // Mettre à jour le statut si nécessaire
            if (annonceStatus === 'published') {
              annonce.status = 'published';
              annonce.suspension_auto = false;
            }
            
            // Mettre à jour la référence commande_id
            annonce.commande_id = targetForfaitId;
            
            // Ajouter l'annonce au forfait cible
            targetForfait.annonces.push(annonce);
            
            // Supprimer l'annonce du forfait source
            sourceForfait.annonces.splice(annonceIndex, 1);
          }
        }
        
        // Fermer la modal
        this.moveModal.show = false;
        
        // Afficher la notification
        this.showNotification('Annonce déplacée avec succès');
      } catch (error) {
        console.error('Erreur lors du déplacement de l\'annonce:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
        this.moveModal.show = false;
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
    }
  }
};
</script>