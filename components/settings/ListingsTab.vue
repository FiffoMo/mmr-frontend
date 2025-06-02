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
      <NuxtLink to="/publier-annonce" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Publier une annonce
      </NuxtLink>
    </div>

    <!-- Liste des forfaits et annonces -->
    <div v-else>
      <!-- Filtres de recherche/tri -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4 bg-slate-100 p-4 rounded-lg">
        <div>
          <label for="forfait-filter" class="block text-sm font-medium text-slate-700 mb-1">Forfait</label>
          <select 
            id="forfait-filter" 
            v-model="forfaitFilter" 
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
          >
            <option value="">Tous les forfaits</option>
            <option value="active">Forfaits en cours</option>
            <option v-for="forfait in forfaits" :key="forfait.id" :value="forfait.id">
              {{ forfait.produit?.nom || forfait.nom }} (Réf: {{ forfait.reference || `ORD-${forfait.id.substring(0, 4)}` }})
            </option>
          </select>
        </div>
        
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select 
            id="status-filter" 
            v-model="statusFilter" 
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publiée</option>
            <option value="expired">Expirée</option>
            <option value="suspended">Suspendue</option>
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
      <div v-for="forfait in filteredForfaits" :key="forfait.id" class="mb-8">
        <!-- En-tête du forfait amélioré -->
        <div class="bg-green-100 p-4 rounded-t-lg flex justify-between items-center border border-green-50">
        <div>
          <h3 class="font-medium text-gray-900">
            {{ forfait.produit?.nom || forfait.nom }}
            <span class="ml-2 text-sm text-gray-500">
              Réf: {{ forfait.reference || `ORD-${forfait.id.substring(0, 4)}` }}
            </span>
          </h3>
          <p class="text-sm text-gray-500">
            Utilisation: {{ forfait.annonces && forfait.annonces.length || 0 }} / {{ forfait.produit?.nombre || forfait.nombre_annonces_total || '∞' }} annonces
            <span v-if="forfait.date_fin"> - Jusqu'au {{ formatDate(forfait.date_fin) }}</span>
          </p>
        </div>
        
        <!-- Nouveau bouton "Ajouter une annonce" ici -->
        <button 
          v-if="canAddAnnonceToForfait(forfait)"
          @click="goToCreateListing(forfait.id)" 
          class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Ajouter une annonce
        </button>
      </div>

        <!-- Aucune annonce dans ce forfait -->
        <div v-if="!forfait.annonces || filteredAnnonces(forfait).length === 0" class="bg-slate-100 p-6 rounded-b-lg text-center mb-4 border-t-0 border border-gray-100">
          <p class="text-gray-500 text-sm mb-3">
            <span v-if="forfait.annonces && forfait.annonces.length > 0">Aucune annonce ne correspond à vos critères de recherche.</span>
            <span v-else>Aucune annonce n'est associée à ce forfait.</span>
          </p>
          <button 
            v-if="canAddAnnonceToForfait(forfait)"
            @click="goToCreateListing(forfait.id)" 
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
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
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3 mt-4">
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
              <div v-if="forfaitExpire(forfait)" class="absolute top-2 left-2">
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
                  {{ annonce.vues || 0 }}
                </div>
                <div class="flex items-center">
                  <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {{ annonce.favoris || 0 }}
                </div>
                <div class="flex items-center">
                  <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {{ annonce.messages || 0 }}
                </div>
              </div>
              
              <!-- Boutons d'actions -->
              <div class="flex flex-col">
                <!-- Première ligne : Bouton Voir (à droite) -->
                <div class="flex justify-between mb-1">
                  <div class="flex space-x-2">
                    <!-- Bouton Modifier -->
                    <button 
                      @click="goToCreateAnnonce(annonce.id)" 
                      class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                      <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                    
                    <!-- Bouton Dupliquer -->
                    <button 
                      @click="duplicateListing(annonce.id, forfait.id)" 
                      class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                      <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                      Dupliquer
                    </button>
                  </div>
                  
                  <!-- Bouton Voir ou indication À modifier selon le statut -->
                  <div>
                    <!-- Bouton Voir (visible pour toutes les annonces sauf les copies non modifiées) -->
                    <button 
                      v-if="!annonce.est_copie || annonce.status !== 'suspended'"
                      @click="viewListing(annonce.id)" 
                      class="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                      Voir
                    </button>
                    
                    <!-- Message "À modifier" uniquement pour les copies en attente de modification -->
                    <span 
                      v-else
                      class="inline-flex items-center px-3 py-1 text-xs leading-4 font-medium text-orange-600"
                    >
                      <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      À modifier
                    </span>
                  </div>
                </div>

                <!-- Deuxième ligne : Suspendre + Supprimer -->
                <div class="flex space-x-2 mt-1 mb-1">
                  <!-- Bouton Suspendre (visible uniquement si l'annonce est publiée) -->
                  <button 
                    v-if="annonce.status === 'published'"
                    @click="suspendListing(annonce.id)" 
                    class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Suspendre
                  </button>
                  
                  <!-- Bouton Réactiver (visible uniquement si l'annonce est suspendue) -->
                  <button 
                    v-if="annonce.status === 'suspended' && !forfaitExpire(forfait)"
                    @click="reactivateListing(annonce.id)" 
                    class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Réactiver
                  </button>
                  
                  <!-- Bouton Retirer mise en avant (visible si l'annonce est mise en avant) -->
                  <button 
                    v-if="annonce.mise_en_avant"
                    @click="removePromotion(annonce.id)" 
                    class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Retirer
                  </button>
                  
                  <!-- Bouton Supprimer -->
                  <button 
                    @click="deleteListing(annonce.id)" 
                    class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
                
                <!-- Troisième ligne : Changer de forfait -->
                <div class="mt-1">
                  <!-- Bouton Changer de forfait -->
                  <button 
                    v-if="getAvailableForfaits(forfait.id).length > 0"
                    @click="showMoveModal(annonce.id, forfait.id)" 
                    class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                  >
                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Changer de forfait
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour le déplacement d'annonce entre forfaits -->
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
                  Changer de forfait
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 mb-4">
                    Sélectionnez le forfait vers lequel vous souhaitez déplacer cette annonce :
                  </p>
                  
                  <div class="space-y-3 max-h-60 overflow-y-auto pr-2">
                    <div 
                      v-for="targetForfait in getAvailableForfaits(moveModal.sourceForfaitId)" 
                      :key="targetForfait.id"
                      class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      @click="selectTargetForfait(targetForfait.id)"
                    >
                      <div class="flex justify-between items-center">
                        <div>
                          <p class="font-medium text-gray-900">{{ targetForfait.produit?.nom || targetForfait.nom }}</p>
                          <p class="text-xs text-gray-500">
                            {{ targetForfait.annonces && targetForfait.annonces.length || 0 }} / {{ targetForfait.produit?.nombre || targetForfait.nombre_annonces_total || '∞' }} annonces utilisées 
                            <span v-if="targetForfait.date_fin">• {{ getRemainingDays(targetForfait.date_fin) }} jours restants</span>
                          </p>
                        </div>
                        <span 
                          v-if="moveModal.targetForfaitId === targetForfait.id"
                          class="flex-shrink-0 h-5 w-5 text-cyan-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="confirmMove"
              :disabled="!moveModal.targetForfaitId"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-cyan-600 text-base font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer le déplacement
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
import { useAnnonces } from '~/composables/useAnnonces';
import { useAuthStore } from '~/stores/useAuthStore';

export default {
  name: 'ListingsTab',

  props: {
    isActive: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String,
      default: null
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
      searchFilter: '',
      searchQuery: '',
      forfaitFilter: '', // Filtre par forfait
      
      // Gestion du menu d'options
      optionsMenuOpen: null,

      // Gestionnaire de clic document
      handleDocumentClick: null,
      
      // Modal de déplacement d'annonce
      moveModal: {
        show: false,
        annonceId: null,
        sourceForfaitId: null,
        targetForfaitId: null
      },

      miseEnAvantModal: {
        show: false,
        annonce: null,
        forfaits: [],
        selectedForfaitId: null,
        loading: false,
        error: null
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
      if (newVal) {
        this.fetchListings();
      }
    }
  },

  mounted() {
    if (this.isActive) {
      this.fetchListings();
    }
  },

  computed: {
    // Autres computed properties...
    
    // Filtrer les forfaits selon les critères (forfaitFilter) et exclure les forfaits "mise en avant"
    filteredForfaits() {
      if (!this.forfaits || this.forfaits.length === 0) {
        return [];
      }
      
      // Filtrer pour exclure les forfaits de type "mise en avant" et "publicite"
      let forfaitsFiltered = this.forfaits.filter(forfait => {
        // Vérifier si le forfait a un type spécifié
        const forfaitType = (forfait.type || '').toLowerCase();
        const produitType = (forfait.produit?.type || '').toLowerCase();
        
        // Exclure les forfaits avec le type "mise_en_avant" ou "publicite"
        return forfaitType !== 'mise_en_avant' && 
              forfaitType !== 'publicite' && 
              produitType !== 'mise_en_avant' && 
              produitType !== 'publicite';
      });
      
      // Si aucun filtre de forfait n'est sélectionné, retourner tous les forfaits filtrés
      if (!this.forfaitFilter) {
        return forfaitsFiltered;
      }
      
      // Si le filtre est "active", retourner seulement les forfaits non expirés
      if (this.forfaitFilter === 'active') {
        return forfaitsFiltered.filter(forfait => !this.forfaitExpire(forfait));
      }
      
      // Sinon, retourner le forfait spécifique sélectionné
      return forfaitsFiltered.filter(forfait => forfait.id === this.forfaitFilter);
    }
  },

  methods: {
  // Déplacez ici les méthodes qui étaient dans data()
  async attribuerMiseEnAvant(annonce) {
    this.miseEnAvantModal.show = true;
    this.miseEnAvantModal.annonce = annonce;
    this.miseEnAvantModal.selectedForfaitId = null;
    this.miseEnAvantModal.loading = true;
    this.miseEnAvantModal.error = null;
    
    try {
      // Récupérer les forfaits mise en avant disponibles
      const response = await fetch('/api/client/commandes?type=mise_en_avant&status=active');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des forfaits');
      }
      
      const data = await response.json();
      // Filtrer pour n'avoir que les forfaits actifs (non expirés)
      this.miseEnAvantModal.forfaits = data.filter(f => {
        // Calculer si la date de fin est dans le futur
        const dateFin = new Date(f.date_fin);
        return dateFin > new Date();
      });
    } catch (error) {
      console.error('Erreur:', error);
      this.miseEnAvantModal.error = 'Impossible de récupérer vos forfaits de mise en avant';
    } finally {
      this.miseEnAvantModal.loading = false;
    }
  },

  // Fonction pour confirmer l'attribution du forfait
  async confirmerMiseEnAvant() {
    if (!this.miseEnAvantModal.selectedForfaitId) {
      return;
    }
    
    try {
      const response = await fetch('/api/client/mise-en-avant/attribuer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          forfaitId: this.miseEnAvantModal.selectedForfaitId,
          annonceId: this.miseEnAvantModal.annonce.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'attribution du forfait');
      }
      
      // Fermer la modale et afficher une notification
      this.miseEnAvantModal.show = false;
      this.showNotification('L\'annonce a été mise en avant avec succès', 'success');
      
      // Rafraîchir les annonces
      this.fetchListings();
    } catch (error) {
      console.error('Erreur:', error);
      this.miseEnAvantModal.error = 'Impossible d\'attribuer le forfait de mise en avant';
    }
  },

  // Fonction pour rediriger vers la page d'achat
  acheterMiseEnAvant() {
    this.miseEnAvantModal.show = false;
    // Rediriger vers la page tarifs, section mise en avant
    window.location.href = '/tarifs#mise-en-avant';
  },
  
  async fetchListings() {
    console.log("Début fetchListings avec userId:", this.userId || 'non défini');
    this.loading = true;
    this.error = null;
    
    // Timeout pour éviter un chargement infini
    const timeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = "Le chargement a pris trop de temps. Veuillez réessayer.";
        console.log('Timeout atteint lors du chargement des forfaits');
      }
    }, 10000);
    
    try {
      const authStore = useAuthStore();
      const userId = this.userId || authStore.user?.id;
      
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }
      
      console.log('Récupération des forfaits et annonces pour l\'utilisateur:', userId);
      
      // Étape 1: Récupérer les forfaits (commandes)
      let forfaits = [];
      
      // Essai 1: Utiliser useDirectusSDK
      try {
        const directusSDK = useDirectusSDK();
        const commandesResult = await directusSDK.getItems('commandes', {
          filter: { client_id: { _eq: userId } },
          fields: '*,produit.*'
        });
        
        if (commandesResult && commandesResult.length > 0) {
          console.log("Commandes récupérées via SDK:", commandesResult);
          forfaits = commandesResult;
        }
      } catch (error) {
        console.log("Erreur avec SDK:", error);
        
        // Essai 2: Utiliser fetch directement
        try {
          const response = await fetch(`/api/directus/items/commandes?filter[client_id][_eq]=${userId}&fields=*,produit.*`, {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          const result = await response.json();
          console.log("Commandes récupérées via fetch:", result);
          
          if (result.data && result.data.length > 0) {
            forfaits = result.data;
          }
        } catch (fetchError) {
          console.error('Erreur lors de la récupération des commandes via fetch:', fetchError);
          throw new Error("Impossible de charger vos forfaits. Veuillez réessayer.");
        }
      }
      
      if (forfaits.length === 0) {
        this.forfaits = [];
        this.loading = false;
        clearTimeout(timeout);
        return;
      }
      
      // Étape 2: Récupérer les annonces
      // Utiliser directement fetch pour les annonces
      let annonces = [];
      
      try {
        const annonceResponse = await fetch(`/api/directus/items/Annonces?filter[client_id][_eq]=${userId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!annonceResponse.ok) {
          throw new Error(`Erreur HTTP: ${annonceResponse.status}`);
        }
        
        const annonceResult = await annonceResponse.json();
        console.log("Annonces récupérées via fetch:", annonceResult);
        
        if (annonceResult.data && annonceResult.data.length > 0) {
          annonces = annonceResult.data;
        }
      } catch (fetchError) {
        console.error('Erreur lors de la récupération des annonces via fetch:', fetchError);
      }
      
      // Étape 3: Associer les annonces aux forfaits
      let forfaitsAvecAnnonces = forfaits.map(forfait => {
        const annoncesDuForfait = annonces.filter(annonce => 
          annonce.commande_id && annonce.commande_id.toString() === forfait.id.toString()
        ).map(annonce => ({
          id: annonce.id,
          titre: annonce.Titre || 'Sans titre',
          type_bien: annonce.categorie_annonce || '',
          localisation: annonce.localisation || '',
          prix: annonce.prix_vente || 0,
          surface: annonce.surface_habitable || 0,
          pieces: annonce.pieces || 0,
          chambres: annonce.chambres || 0,
          image: annonce.image_principale ? this.getAssetUrl(annonce.image_principale) : null,
          status: annonce.status || 'pending',
          date_publication: annonce.date_debut || null,
          vues: annonce.vues || 0,
          favoris: annonce.favoris || 0, // Correction ici: "a" changé en "0"
          messages: annonce.messages || 0,
          mise_en_avant: Boolean(annonce.mise_en_avant),
          suspension_auto: Boolean(annonce.suspension_auto),
          commande_id: annonce.commande_id
        }));
        
        return {
          ...forfait,
          annonces: annoncesDuForfait,
          jours_restants: this.getRemainingDays(forfait.date_fin)
        };
      });
      
      // CORRECTION : Filtrer les forfaits pour n'inclure que ceux de type "annonces"
      console.log("Avant filtrage:", forfaitsAvecAnnonces.length, "forfaits");
      forfaitsAvecAnnonces = forfaitsAvecAnnonces.filter(forfait => {
        const typeProduit = forfait.type_produit || '';
        return typeProduit === 'annonces' || typeProduit === '';
      });
      console.log("Après filtrage par type_produit:", forfaitsAvecAnnonces.length, "forfaits");
      
      // Ajouter un forfait "Sans forfait" pour les annonces sans commande_id
      const annoncesSansForfait = annonces.filter(annonce => !annonce.commande_id).map(annonce => ({
        id: annonce.id,
        titre: annonce.Titre || 'Sans titre',
        type_bien: annonce.categorie_annonce || '',
        localisation: annonce.localisation || '',
        prix: annonce.prix_vente || 0,
        surface: annonce.surface_habitable || 0,
        pieces: annonce.pieces || 0,
        chambres: annonce.chambres || 0,
        image: annonce.image_principale ? this.getAssetUrl(annonce.image_principale) : null,
        status: annonce.status || 'pending',
        date_publication: annonce.date_debut || null,
        vues: annonce.vues || 0,
        favoris: annonce.favoris || 0,
        messages: annonce.messages || 0,
        mise_en_avant: Boolean(annonce.mise_en_avant),
        suspension_auto: Boolean(annonce.suspension_auto),
        commande_id: null
      }));
      
      if (annoncesSansForfait.length > 0) {
        forfaitsAvecAnnonces.push({
          id: 'sans_forfait',
          nom: 'Annonces sans forfait',
          produit: { nom: 'Annonces sans forfait', nombre: Infinity },
          date_debut: null,
          date_fin: null,
          annonces: annoncesSansForfait,
          jours_restants: null
        });
      }
      
      // Trier les forfaits par date de création (les plus récents en premier)
      forfaitsAvecAnnonces.sort((a, b) => {
        // Le forfait "sans forfait" toujours en dernier
        if (a.id === 'sans_forfait') return 1;
        if (b.id === 'sans_forfait') return -1;
        
        return new Date(b.date_created || b.date_debut || 0) - new Date(a.date_created || a.date_debut || 0);
      });
      
      this.forfaits = forfaitsAvecAnnonces;
      console.log("Forfaits avec annonces:", this.forfaits);
      
      // Vérifier et suspendre automatiquement les annonces des forfaits expirés
      this.checkAndSuspendExpiredListings();
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.error = error.message || "Impossible de charger vos annonces. Veuillez réessayer.";
    } finally {
      clearTimeout(timeout);
      this.loading = false;
    }
  },

  // Helper function pour obtenir l'URL des assets
  getAssetUrl(assetId) {
    if (!assetId) return null;
    return `http://localhost:8055/assets/${assetId}`;
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
  
  // Vérifier si un forfait est expiré
  forfaitExpire(forfait) {
    if (!forfait.date_fin) return false;
    
    const dateExpiration = new Date(forfait.date_fin);
    const today = new Date();
    
    return dateExpiration < today;
  },
  
  // Vérifier si on peut ajouter une annonce à un forfait
  canAddAnnonceToForfait(forfait) {
    if (this.forfaitExpire(forfait)) return false;
    
    const limite = forfait.produit?.nombre || forfait.nombre_annonces_total || Infinity;
    const utilisees = forfait.annonces ? forfait.annonces.length : 0;
    
    return utilisees < limite;
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
  
  // Obtenir la classe CSS pour un statut
  getStatusClass(status) {
    switch (status) {
      case 'published':
        return 'px-2 py-1 text-xs font-medium rounded-full bg-green-200 text-green-800';
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
    case 'suspended':
      return 'Suspendue';
    case 'expired':
      return 'Expirée';
    case 'draft':
      return 'Brouillon';
    case 'archived':
      return 'Archivée';
    // Si par hasard il reste des annonces avec status "pending", les afficher comme "Publiée"
    case 'pending':
      return 'Publiée';
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
  
  // Méthode toggleOptionsMenu modifiée
  toggleOptionsMenu(annonceId, event) {
    // Empêcher la propagation pour éviter que l'événement n'atteigne le document
    if (event) {
      event.stopPropagation();
    }
    
    // Basculer l'état du menu
    this.optionsMenuOpen = this.optionsMenuOpen === annonceId ? null : annonceId;
  },
  
  
  goToCreateListing(forfaitId) {
    console.log(`Redirection vers la page de création d'annonce avec le forfait ${forfaitId}`);
    
    // Rediriger vers la page de création d'annonce avec l'ID du forfait en paramètre d'URL
    window.location.href = `/dashboard/annonces/createAnnonce?forfait=${forfaitId}`;
  },
    
  // Vérifier et suspendre les annonces des forfaits expirés
  async checkAndSuspendExpiredListings() {
    this.annoncesSuspenduesAuto = [];
    const annoncesASuspendre = [];
    
    // Parcourir tous les forfaits expirés
    for (const forfait of this.forfaits) {
      if (this.forfaitExpire(forfait) && forfait.annonces) {
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
          const response = await fetch(`/api/directus/items/Annonces/${annonce.id}`, {
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
              if (!forfait.annonces) continue;
              
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
  
  // Suspendre une annonce
  async suspendListing(annonceId) {
    if (confirm('Êtes-vous sûr de vouloir suspendre cette annonce ? Elle ne sera plus visible pour les visiteurs jusqu\'à sa réactivation.')) {
      try {
        // Appel API pour modifier le statut - notez le A majuscule
        const response = await fetch(`/api/directus/items/Annonces/${annonceId}`, {
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
          if (!forfait.annonces) continue;
          
          const index = forfait.annonces.findIndex(a => a.id === annonceId);
          if (index !== -1) {
            forfait.annonces[index].status = 'suspended';
            forfait.annonces[index].suspension_auto = false;
            break;
          }
        }
        
        this.optionsMenuOpen = null;
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
        if (!forfait.annonces) continue;
        
        const annonce = forfait.annonces.find(a => a.id === annonceId);
        if (annonce) {
          forfaitAnnonce = forfait;
          break;
        }
      }
      
      // Vérifier si le forfait est expiré
      if (forfaitAnnonce && this.forfaitExpire(forfaitAnnonce)) {
        if (!confirm('Ce forfait est expiré. L\'annonce ne sera pas visible sur le site. Voulez-vous quand même la réactiver ?')) {
          return;
        }
      }
      
      // Appel API pour modifier le statut
      const response = await fetch(`/api/directus/items/Annonces/${annonceId}`, {
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
        if (!forfait.annonces) continue;
        
        const index = forfait.annonces.findIndex(a => a.id === annonceId);
        if (index !== -1) {
          forfait.annonces[index].status = 'published';
          forfait.annonces[index].suspension_auto = false;
          break;
        }
      }
      
      this.optionsMenuOpen = null;
      this.showNotification('Annonce réactivée avec succès');
    } catch (error) {
      console.error('Erreur lors de la réactivation de l\'annonce:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  },
  
  // Fonction pour dupliquer une annonce
  async duplicateListing(annonceId, forfaitId) {
    try {
      console.log(`=== DÉBUT DUPLICATION ANNONCE ===`);
      console.log(`Annonce à dupliquer: ${annonceId}`);
      console.log(`Forfait: ${forfaitId}`);
      
      // 1. Vérifier si le forfait existe
      const forfait = this.forfaits.find(f => f.id === forfaitId);
      if (!forfait) {
        console.error(`Forfait non trouvé: ${forfaitId}`);
        throw new Error('Forfait non trouvé');
      }
      
      // 2. Vérifier si l'annonce existe dans le forfait
      if (!forfait.annonces) {
        console.error('Le forfait n\'a pas d\'annonces');
        throw new Error('Le forfait n\'a pas d\'annonces');
      }
      
      const annonceIndex = forfait.annonces.findIndex(a => a.id === annonceId);
      if (annonceIndex === -1) {
        console.error(`Annonce ${annonceId} non trouvée dans le forfait`);
        throw new Error('Annonce non trouvée dans le forfait');
      }
      
      // 3. Vérifier s'il reste de la place dans le forfait
      const limite = forfait.produit?.nombre || forfait.nombre_annonces_total || Infinity;
      const utilisees = forfait.annonces.length;
      
      if (utilisees >= limite) {
        alert('Ce forfait a atteint sa limite d\'annonces. Veuillez renouveler votre forfait ou en acheter un nouveau.');
        return;
      }
      
      // 4. Créer une copie de l'annonce source
      const annonceSource = forfait.annonces[annonceIndex];
      console.log('Annonce source:', annonceSource);
      
      // Préparer les données pour la nouvelle annonce
      const nouvelleAnnonceData = {
        // Garder les mêmes propriétés que l'annonce source, sauf celles spécifiées ci-dessous
        Titre: `${annonceSource.titre} (copie)`,
        localisation: annonceSource.localisation,
        prix_vente: annonceSource.prix,
        surface_habitable: annonceSource.surface,
        pieces: annonceSource.pieces,
        chambres: annonceSource.chambres,
        image_principale: annonceSource.image?.id || annonceSource.image_principale,
        categorie_annonce: annonceSource.type_bien,
        commande_id: forfaitId,
        client_id: this.userId, // Utiliser l'ID de l'utilisateur actuel
        status: 'suspended', // La nouvelle annonce est suspendue par défaut
        date_debut: null, // Pas de date de début tant que non publiée
        vues: 0, // Réinitialiser les statistiques
        favoris: 0,
        messages: 0,
        mise_en_avant: false, // Pas de mise en avant par défaut
        est_copie: true // Marqueur pour indiquer qu'il s'agit d'une copie non modifiée
      };
      
      console.log('Données de la nouvelle annonce:', nouvelleAnnonceData);
      
      // 5. Afficher un message d'information à l'utilisateur
      // Utiliser directement l'objet notification au lieu d'appeler showNotification
      // C'est cette partie qui causait l'erreur
      if (this.notification) {
        clearTimeout(this.notification.timer); // Nettoyer tout timer existant
        this.notification.message = 'Duplication en cours...';
        this.notification.show = true;
        this.notification.timer = setTimeout(() => {
          this.notification.show = false;
        }, 3000);
      }
      
      // 6. Appel API pour créer la nouvelle annonce
      console.log('Création de la nouvelle annonce via API...');
      
      const response = await fetch('/api/directus/items/Annonces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(nouvelleAnnonceData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || `Erreur HTTP: ${response.status}`);
      }
      
      // 7. Récupérer les données de la nouvelle annonce
      const responseData = await response.json();
      console.log('Réponse API:', responseData);
      
      if (!responseData.data || !responseData.data.id) {
        throw new Error('La réponse de l\'API ne contient pas l\'ID de la nouvelle annonce');
      }
      
      const nouvelleAnnonceId = responseData.data.id;
      console.log(`Nouvelle annonce créée avec l'ID: ${nouvelleAnnonceId}`);
      
      // 8. Ajouter la nouvelle annonce au forfait dans l'état local
      const nouvelleAnnonce = {
        id: nouvelleAnnonceId,
        titre: `${annonceSource.titre} (copie)`,
        type_bien: annonceSource.type_bien,
        localisation: annonceSource.localisation,
        prix: annonceSource.prix,
        surface: annonceSource.surface,
        pieces: annonceSource.pieces,
        chambres: annonceSource.chambres,
        image: annonceSource.image,
        image_principale: annonceSource.image_principale,
        status: 'suspended',
        date_publication: null,
        vues: 0,
        favoris: 0,
        messages: 0,
        mise_en_avant: false,
        suspension_auto: false,
        commande_id: forfaitId,
        est_copie: true // Marqueur local également
      };
      
      forfait.annonces.push(nouvelleAnnonce);
      console.log(`Annonce ajoutée au forfait localement`);
      
      // 9. Afficher un message de succès
      // Là aussi, utiliser directement l'objet notification
      if (this.notification) {
        clearTimeout(this.notification.timer);
        this.notification.message = 'Annonce dupliquée avec succès';
        this.notification.show = true;
        this.notification.timer = setTimeout(() => {
          this.notification.show = false;
        }, 3000);
      }
      
      console.log(`=== FIN DUPLICATION ANNONCE ===`);
      
      return nouvelleAnnonceId;
    } catch (error) {
      console.error('Erreur lors de la duplication de l\'annonce:', error);
      alert(`Une erreur est survenue lors de la duplication: ${error.message}`);
      return null;
    }
  },
  
  // Voir une annonce (redirection vers la page détail)
  viewListing(annonceId) {
    window.open(`/annonces/detail-${annonceId}`, '_blank');
  },
  
  // Modifier une annonce (redirection vers la page d'édition)
  editListing(annonceId) {
    window.location.href = '/dashboard/annonces/createAnnonce';
  },
  
  // Supprimer une annonce
  async deleteListing(annonceId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
      try {
        // Appel API pour supprimer l'annonce
        const response = await fetch(`/api/directus/items/Annonces/${annonceId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Supprimer l'annonce du forfait correspondant
        for (const forfait of this.forfaits) {
          if (!forfait.annonces) continue;
          
          const index = forfait.annonces.findIndex(a => a.id === annonceId);
          if (index !== -1) {
            forfait.annonces.splice(index, 1);
            break;
          }
        }
        
        this.optionsMenuOpen = null;
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
      const response = await fetch(`/api/directus/items/Annonces/${annonceId}`, {
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
        if (!forfait.annonces) continue;
        
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
      const response = await fetch(`/api/directus/items/Annonces/${annonceId}`, {
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
        if (!forfait.annonces) continue;
        
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

  // Fonction pour confirmer l'attribution du forfait
  async confirmerMiseEnAvant() {
    if (!this.miseEnAvantModal.selectedForfaitId) {
      return;
    }
    
    try {
      console.log(`Attribution du forfait ${this.miseEnAvantModal.selectedForfaitId} à l'annonce ${this.miseEnAvantModal.annonce.id}`);
      
      const response = await fetch('/api/client/mise-en-avant/attribuer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          forfaitId: this.miseEnAvantModal.selectedForfaitId,
          annonceId: this.miseEnAvantModal.annonce.id
        })
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'attribution du forfait');
      }
      
      // Fermer la modale et afficher une notification
      this.miseEnAvantModal.show = false;
      this.showNotification('L\'annonce a été mise en avant avec succès', 'success');
      
      // Rafraîchir les annonces après un court délai
      setTimeout(() => {
        this.fetchListings();
      }, 1000);
    } catch (error) {
      console.error('Erreur:', error);
      this.miseEnAvantModal.error = error.message || 'Impossible d\'attribuer le forfait de mise en avant';
    }
  },

  // Fonction pour rediriger vers la page d'achat
  acheterMiseEnAvant() {
    this.miseEnAvantModal.show = false;
    // Rediriger vers la page tarifs, section mise en avant
    window.location.href = '/tarifs#mise-en-avant';
  },
  
  // Obtenir la liste des forfaits disponibles pour déplacer une annonce
  getAvailableForfaits(currentForfaitId) {
    return this.forfaits.filter(forfait => {
      // Exclure le forfait "sans forfait" comme cible
      if (forfait.id === 'sans_forfait') return false;
      
      // Exclure le forfait actuel
      if (forfait.id === currentForfaitId) return false;
      
      // Vérifier s'il s'agit d'un forfait valide
      if (!forfait.produit) return false;
      
      // Vérifier si le forfait est expiré
      if (this.forfaitExpire(forfait)) return false;
      
      // Vérifier s'il y a de la place disponible
      const limite = forfait.produit.nombre || Infinity;
      const utilisees = forfait.annonces ? forfait.annonces.length : 0;
      
      return utilisees < limite;
    });
  },
  
  // Afficher la modal de déplacement d'annonce
  showMoveModal(annonceId, sourceForfaitId) {
    // Vérifier s'il y a des forfaits disponibles
    const availableForfaits = this.getAvailableForfaits(sourceForfaitId);
    
    if (availableForfaits.length === 0) {
      alert('Aucun forfait disponible pour déplacer cette annonce. Veuillez acheter un nouveau forfait ou renouveler un forfait existant.');
      return;
    }
    
    // Configurer la modal
    this.moveModal = {
      show: true,
      annonceId,
      sourceForfaitId,
      targetForfaitId: null
    };
    
    // Fermer le menu d'options
    this.optionsMenuOpen = null;
  },
  
  // Sélectionner un forfait cible dans la modal
  selectTargetForfait(forfaitId) {
    this.moveModal.targetForfaitId = forfaitId;
  },
  
  // Confirmer le déplacement d'une annonce
  async confirmMove() {
    try {
      const { annonceId, sourceForfaitId, targetForfaitId } = this.moveModal;
      
      // Vérifications de sécurité
      if (!annonceId || !sourceForfaitId || !targetForfaitId) {
        console.error('Données incomplètes pour le déplacement:', { annonceId, sourceForfaitId, targetForfaitId });
        alert('Veuillez sélectionner un forfait de destination.');
        return;
      }
      
      console.log(`=== DÉBUT DÉPLACEMENT ANNONCE ===`);
      console.log(`Déplacement de l'annonce ${annonceId}`);
      console.log(`Forfait source: ${sourceForfaitId}`);
      console.log(`Forfait cible: ${targetForfaitId}`);
      
      // 1. Vérification initiale des forfaits source et cible
      const sourceForfait = this.forfaits.find(f => f.id === sourceForfaitId);
      const targetForfait = this.forfaits.find(f => f.id === targetForfaitId);
      
      if (!sourceForfait) {
        console.error(`Forfait source non trouvé: ${sourceForfaitId}`);
        throw new Error('Forfait source non trouvé');
      }
      
      if (!targetForfait) {
        console.error(`Forfait cible non trouvé: ${targetForfaitId}`);
        throw new Error('Forfait cible non trouvé');
      }
      
      console.log(`Forfait source trouvé: ${sourceForfait.produit?.nom || sourceForfait.nom || 'Sans nom'}`);
      console.log(`Forfait cible trouvé: ${targetForfait.produit?.nom || targetForfait.nom || 'Sans nom'}`);
      
      // 2. Vérification de l'annonce dans le forfait source
      if (!sourceForfait.annonces) {
        console.error('Le forfait source n\'a pas d\'annonces');
        throw new Error('Le forfait source n\'a pas d\'annonces');
      }
      
      const annonceIndex = sourceForfait.annonces.findIndex(a => a.id === annonceId);
      
      if (annonceIndex === -1) {
        console.error(`Annonce ${annonceId} non trouvée dans le forfait source`);
        throw new Error('Annonce non trouvée dans le forfait source');
      }
      
      // Récupérer une copie de l'annonce à déplacer
      const annonceToMove = JSON.parse(JSON.stringify(sourceForfait.annonces[annonceIndex]));
      console.log('Annonce à déplacer:', annonceToMove);
      
      // Vérifier si une réactivation est nécessaire
      let statusChange = false;
      if (annonceToMove.status === 'suspended' && annonceToMove.suspension_auto && !this.forfaitExpire(targetForfait)) {
        statusChange = true;
        console.log('L\'annonce sera réactivée car elle était suspendue automatiquement et le forfait cible est actif');
      }
      
      // 3. Préparation des données pour l'API
      const apiData = {
        commande_id: targetForfaitId
      };
      
      if (statusChange) {
        apiData.status = 'published';
        apiData.suspension_auto = false;
      }
      
      console.log('Données à envoyer à l\'API:', apiData);
      
      // 4. Appel à l'API pour mettre à jour l'annonce
      console.log(`Envoi de la requête PATCH pour l'annonce ${annonceId}...`);
      const response = await fetch(`/api/directus/items/Annonces/${annonceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(apiData)
      });
      
      const responseStatus = response.status;
      let responseData = null;
      
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Erreur lors de la lecture de la réponse JSON:', e);
      }
      
      console.log(`Réponse de l'API (${responseStatus}):`, responseData);
      
      if (!response.ok) {
        console.error(`Erreur API (${responseStatus}):`, responseData);
        throw new Error(`Erreur lors de la mise à jour de l'annonce: ${responseStatus}`);
      }
      
      // 5. Mise à jour locale des données
      console.log('Mise à jour locale des données...');
      
      // Initialiser les tableaux d'annonces si nécessaire
      if (!targetForfait.annonces) {
        targetForfait.annonces = [];
      }
      
      // Modifier la commande_id de l'annonce
      annonceToMove.commande_id = targetForfaitId;
      
      // Mettre à jour le statut si nécessaire
      if (statusChange) {
        annonceToMove.status = 'published';
        annonceToMove.suspension_auto = false;
      }
      
      // Supprimer l'annonce du forfait source
      console.log(`Suppression de l'annonce de l'index ${annonceIndex} du forfait source`);
      sourceForfait.annonces.splice(annonceIndex, 1);
      
      // Ajouter l'annonce au forfait cible
      console.log(`Ajout de l'annonce au forfait cible`);
      targetForfait.annonces.push(annonceToMove);
      
      console.log('Forfait source après modification:', sourceForfait.annonces.length, 'annonces');
      console.log('Forfait cible après modification:', targetForfait.annonces.length, 'annonces');
      
      // 6. Fermer la modal et afficher une notification
      this.moveModal.show = false;
      this.moveModal.annonceId = null;
      this.moveModal.sourceForfaitId = null;
      this.moveModal.targetForfaitId = null;
      
      console.log(`=== FIN DÉPLACEMENT ANNONCE ===`);
      this.showNotification('Annonce déplacée avec succès');
      
    } catch (error) {
      console.error('Erreur lors du déplacement de l\'annonce:', error);
      alert(`Une erreur est survenue lors du déplacement: ${error.message}`);
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
  },
  
  // Redirection vers la page createAnnonce pour modifier une annonce
  goToCreateAnnonce(annonceId) {
    console.log(`Redirection vers la page d'édition pour l'annonce ${annonceId}`);
    
    // Si c'est une copie, on met à jour le marqueur est_copie à false
    const annonce = this.trouverAnnonce(annonceId);
    if (annonce && annonce.est_copie) {
      // Mettre à jour le statut localement
      annonce.est_copie = false;
      
      // Mettre à jour le statut via l'API
      fetch(`/api/directus/items/Annonces/${annonceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ est_copie: false })
      }).catch(error => {
        console.error('Erreur lors de la mise à jour du statut est_copie:', error);
      });
    }
    
    // Redirection avec l'ID de l'annonce à modifier
    window.location.href = `/dashboard/annonces/createAnnonce?id=${annonceId}`;
  },

  // Méthode utilitaire pour trouver une annonce par son ID dans tous les forfaits
  trouverAnnonce(annonceId) {
    for (const forfait of this.forfaits) {
      if (!forfait.annonces) continue;
      
      const annonce = forfait.annonces.find(a => a.id === annonceId);
      if (annonce) return annonce;
    }
    
    return null;
  }
}};
</script>

<style>
/* Styles pour assurer que le menu d'options s'affiche correctement */
.relative {
  position: relative;
}

/* S'assurer que le menu est au-dessus des autres éléments */
[id^="dropdown-"] .absolute {
  z-index: 50;
}

/* Éviter que le menu ne soit coupé s'il dépasse de son conteneur */
.grid {
  overflow: visible;
}

/* Amélioration du positionnement du menu d'options */
@media (max-width: 640px) {
  [id^="dropdown-"] .absolute {
    left: 0;
    right: auto;
  }
}

@media (min-width: 641px) {
  [id^="dropdown-"] .absolute {
    left: auto;
    right: 0;
  }
}
</style>