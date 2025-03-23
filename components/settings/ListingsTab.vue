<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Mes annonces</h2>
    
    <!-- Chargement initial -->
    <div v-if="loading" class="py-10 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      <p class="mt-2 text-gray-500">Chargement de vos annonces...</p>
    </div>
    
    <!-- Erreur -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      <p class="font-medium">Une erreur est survenue</p>
      <p class="text-sm">{{ error }}</p>
      <button 
        @click="fetchListings" 
        class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
      >
        Réessayer
      </button>
    </div>
    
    <!-- Aucune annonce -->
    <div v-else-if="forfaits.length === 0" class="text-center py-10 bg-gray-50 rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune annonce</h3>
      <p class="mt-1 text-sm text-gray-500">Vous n'avez pas encore publié d'annonce.</p>
      <div class="mt-6">
        <NuxtLink to="/publier-annonce" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
          Publier une annonce
        </NuxtLink>
      </div>
    </div>
    
    <!-- Liste des annonces groupées par forfait -->
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
              <option value="published">Publiée</option>
              <option value="suspended">Suspendue</option>
              <option value="pending">En attente</option>
              <option value="expired">Expirée</option>
            </select>
          </div>
          
          <div>
            <label for="listing-search" class="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input 
              id="listing-search" 
              v-model="searchQuery" 
              type="text" 
              placeholder="Rechercher une annonce..." 
              class="block w-60 h-10 px-3 rounded-md border-gray-300 border shadow-sm bg-white focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div>
          <NuxtLink to="/publier-annonce" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle annonce
          </NuxtLink>
        </div>
      </div>
      
      <!-- Section par forfait -->
      <div v-for="forfait in forfaits" :key="forfait.id" class="mb-8">
        <!-- En-tête du forfait -->
        <div class="bg-slate-200 p-4 rounded-t-lg border border-gray-300">
          <div class="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ forfait.nom }}</h3>
              <div class="text-sm text-gray-600 flex flex-wrap items-center gap-4 mt-1">
                <span>
                  <span class="font-medium">{{ forfait.annonces.length }}</span> / {{ forfait.limite_annonces }} annonces
                </span>
                <span :class="[forfait.jours_restants <= 7 ? 'text-red-600 font-medium' : 'text-gray-600']">
                  Expire dans {{ forfait.jours_restants }} jours
                  <span v-if="forfait.jours_restants <= 7" class="text-red-600">
                    ({{ forfait.date_expiration }})
                  </span>
                </span>
              </div>
            </div>
            
            <div>
              <button 
                v-if="forfait.annonces.length < forfait.limite_annonces"
                @click="goToCreateListing(forfait.id)"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-cyan-700 bg-cyan-100 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                <svg class="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Publier sur ce forfait
              </button>
              <button 
                v-if="forfait.jours_restants <= 30"
                @click="renewForfait(forfait.id)"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ml-2"
              >
                <svg class="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Renouveler
              </button>
            </div>
          </div>
        </div>
        
        <!-- Liste des annonces du forfait -->
        <div class="overflow-hidden shadow border border-t-0 border-gray-300 rounded-b-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annonce
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
              <tr v-if="filteredAnnonces(forfait).length === 0" class="hover:bg-gray-50">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                  Aucune annonce correspondant à vos critères dans ce forfait
                </td>
              </tr>
              <tr v-for="annonce in filteredAnnonces(forfait)" :key="annonce.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      <img v-if="annonce.image" :src="annonce.image" alt="" class="h-full w-full object-cover" />
                      <div v-else class="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ annonce.titre }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ annonce.localisation }}
                      </div>
                      <div class="text-sm font-medium text-cyan-600">
                        {{ formatPrice(annonce.prix) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    <div>{{ annonce.type_bien }}</div>
                    <div>{{ annonce.surface }}m² · {{ annonce.pieces }} pièces · {{ annonce.chambres }} ch.</div>
                  </div>
                  <div v-if="annonce.date_publication" class="text-xs text-gray-500 mt-1">
                    Publiée le {{ formatDate(annonce.date_publication) }}
                  </div>
                  <div v-if="annonce.mise_en_avant" class="mt-1">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      <svg class="-ml-0.5 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Mise en avant
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-600">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {{ annonce.vues || 0 }} vues
                    </div>
                    <div class="flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {{ annonce.favoris || 0 }} favoris
                    </div>
                    <div class="flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      {{ annonce.messages || 0 }} messages
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(annonce.status)">
                    {{ getStatusLabel(annonce.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <!-- Boutons d'action -->
                  <div class="flex justify-end space-x-2">
                    <button 
                      @click="viewListing(annonce.id)"
                      class="text-gray-600 hover:text-gray-900"
                      title="Voir l'annonce"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    <button 
                      @click="editListing(annonce.id)"
                      class="text-cyan-600 hover:text-cyan-800"
                      title="Modifier l'annonce"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <!-- Bouton Suspendre/Réactiver -->
                    <button 
                      v-if="annonce.status === 'published'"
                      @click="suspendListing(annonce.id)"
                      class="text-amber-600 hover:text-amber-800"
                      title="Suspendre l'annonce"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    <button 
                      v-if="annonce.status === 'suspended'"
                      @click="reactivateListing(annonce.id)"
                      class="text-green-600 hover:text-green-800"
                      title="Réactiver l'annonce"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    <!-- Options avancées -->
                    <div class="relative">
                      <button 
                        @click="toggleOptionsMenu(annonce.id)"
                        class="text-gray-500 hover:text-gray-700"
                        title="Plus d'options"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      
                      <!-- Menu déroulant -->
                      <div 
                        v-if="optionsMenuOpen === annonce.id" 
                        class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        @click.away="optionsMenuOpen = null"
                      >
                        <!-- Déplacer vers un autre forfait -->
                        <div v-if="canMoveToOtherForfait(annonce, forfait)" class="px-3 py-2 text-xs text-gray-700 font-medium">
                          Déplacer vers :
                        </div>
                        <template v-if="canMoveToOtherForfait(annonce, forfait)">
                          <a 
                            v-for="targetForfait in getAvailableForfaits(forfait.id)" 
                            :key="targetForfait.id"
                            href="#" 
                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            @click.prevent="moveListingToForfait(annonce.id, forfait.id, targetForfait.id)"
                          >
                            {{ targetForfait.nom }}
                            <span class="text-xs text-gray-500">
                              ({{ targetForfait.annonces.length }}/{{ targetForfait.limite_annonces }})
                            </span>
                          </a>
                          <div class="border-t border-gray-100 my-1"></div>
                        </template>
                        
                        <!-- Option de mise en avant -->
                        <a 
                          v-if="!annonce.mise_en_avant"
                          href="#" 
                          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          @click.prevent="promoteListing(annonce.id)"
                        >
                          <span class="flex items-center">
                            <svg class="mr-2 h-4 w-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Mettre en avant
                          </span>
                        </a>
                        
                        <a 
                          v-else
                          href="#" 
                          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          @click.prevent="removePromotion(annonce.id)"
                        >
                          <span class="flex items-center">
                            <svg class="mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                            Retirer mise en avant
                          </span>
                        </a>
                        
                        <!-- Supprimer -->
                        <a 
                          href="#" 
                          class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          @click.prevent="deleteListing(annonce.id)"
                        >
                          <span class="flex items-center">
                            <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation de déplacement d'annonce -->
    <div v-if="moveModal.show" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4">
        <div class="bg-cyan-500 px-4 py-3">
          <h3 class="text-lg font-medium text-white">Déplacer l'annonce</h3>
        </div>
        <div class="p-6">
          <p class="mb-4">
            Voulez-vous vraiment déplacer cette annonce du forfait <span class="font-medium">{{ moveModal.sourceForfaitName }}</span> vers le forfait <span class="font-medium">{{ moveModal.targetForfaitName }}</span> ?
          </p>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button 
              @click="moveModal.show = false" 
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <button 
              @click="confirmMove" 
              class="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
            >
              Confirmer
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
export default {
  name: 'ListingsTab',
  
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
      searchQuery: '',
      
      // Données
      forfaits: [],
      
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
      }
    };
  },
  
  mounted() {
    this.fetchListings();
    
    // Ajouter un écouteur de clic global pour fermer le menu d'options
    document.addEventListener('click', this.handleOutsideClick);
  },
  
  beforeDestroy() {
    // Nettoyer l'écouteur de clic
    document.removeEventListener('click', this.handleOutsideClick);
    
    // Nettoyer le timer de notification si existant
    if (this.notification.timer) {
      clearTimeout(this.notification.timer);
    }
  },
  
  methods: {
    // Récupérer les forfaits et annonces
    async fetchListings() {
      this.loading = true;
      this.error = null;
      
      try {
        // À remplacer par l'appel API réel
        // const response = await this.$axios.$get(`/api/users/${this.userId}/forfaits-annonces`);
        // this.forfaits = response.data;
        
        // Données simulées pour le développement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.forfaits = [
          {
            id: '1',
            nom: 'Forfait Premium',
            limite_annonces: 25,
            date_expiration: '20/06/2023',
            jours_restants: 45,
            annonces: [
              {
                id: '101',
                titre: 'Appartement 3 pièces avec terrasse',
                type_bien: 'Appartement',
                localisation: 'Paris 11e',
                prix: 450000,
                surface: 65,
                pieces: 3,
                chambres: 2,
                image: 'https://via.placeholder.com/300x200',
                status: 'published',
                date_publication: '2023-03-15',
                vues: 356,
                favoris: 12,
                messages: 5,
                mise_en_avant: true
              },
              {
                id: '102',
                titre: 'Studio meublé proche métro',
                type_bien: 'Studio',
                localisation: 'Paris 15e',
                prix: 220000,
                surface: 28,
                pieces: 1,
                chambres: 0,
                image: 'https://via.placeholder.com/300x200',
                status: 'published',
                date_publication: '2023-04-02',
                vues: 178,
                favoris: 5,
                messages: 3,
                mise_en_avant: false
              },
              {
                id: '103',
                titre: 'Maison 5 pièces avec jardin',
                type_bien: 'Maison',
                localisation: 'Suresnes',
                prix: 980000,
                surface: 140,
                pieces: 5,
                chambres: 4,
                image: 'https://via.placeholder.com/300x200',
                status: 'suspended',
                date_publication: '2023-02-28',
                vues: 245,
                favoris: 8,
                messages: 4,
                mise_en_avant: false
              }
            ]
          },
          {
            id: '2',
            nom: 'Forfait Dixit',
            limite_annonces: 10,
            date_expiration: '15/04/2023',
            jours_restants: 5,
            annonces: [
              {
                id: '201',
                titre: 'Appartement 2 pièces rénové',
                type_bien: 'Appartement',
                localisation: 'Lyon 3e',
                prix: 280000,
                surface: 45,
                pieces: 2,
                chambres: 1,
                image: 'https://via.placeholder.com/300x200',
                status: 'published',
                date_publication: '2023-03-20',
                vues: 124,
                favoris: 3,
                messages: 1,
                mise_en_avant: false
              },
              {
                id: '202',
                titre: 'Loft dans ancien atelier',
                type_bien: 'Loft',
                localisation: 'Lyon 7e',
                prix: 420000,
                surface: 95,
                pieces: 3,
                chambres: 2,
                image: null,
                status: 'pending',
                date_publication: null,
                vues: 0,
                favoris: 0,
                messages: 0,
                mise_en_avant: false
              }
            ]
          },
          {
            id: '3',
            nom: 'Forfait Essentiel',
            limite_annonces: 5,
            date_expiration: '15/10/2023',
            jours_restants: 160,
            annonces: []
          }
        ];
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
        this.error = "Impossible de charger vos annonces. Veuillez réessayer.";
      } finally {
        this.loading = false;
      }
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
          return annonce.titre.toLowerCase().includes(query) ||
                 annonce.localisation.toLowerCase().includes(query) ||
                 annonce.type_bien.toLowerCase().includes(query);
        }
        
        return true;
      });
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
        default:
          return status || 'Inconnu';
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
          // À remplacer par l'appel API réel
          // await this.$axios.$patch(`/api/annonces/${annonceId}`, { status: 'suspended' });
          
          // Simulation pour le développement
          // Trouver l'annonce dans les forfaits
          for (const forfait of this.forfaits) {
            const index = forfait.annonces.findIndex(a => a.id === annonceId);
            if (index !== -1) {
              forfait.annonces[index].status = 'suspended';
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
        // À remplacer par l'appel API réel
        // await this.$axios.$patch(`/api/annonces/${annonceId}`, { status: 'published' });
        
        // Simulation pour le développement
        // Trouver l'annonce dans les forfaits
        for (const forfait of this.forfaits) {
          const index = forfait.annonces.findIndex(a => a.id === annonceId);
          if (index !== -1) {
            forfait.annonces[index].status = 'published';
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
          // À remplacer par l'appel API réel
          // await this.$axios.$delete(`/api/annonces/${annonceId}`);
          
          // Simulation pour le développement
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
        // À remplacer par l'appel API réel
        // await this.$axios.$post(`/api/annonces/${annonceId}/promote`);
        
        // Simulation pour le développement
        // Trouver l'annonce dans les forfaits
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
        // À remplacer par l'appel API réel
        // await this.$axios.$delete(`/api/annonces/${annonceId}/promote`);
        
        // Simulation pour le développement
        // Trouver l'annonce dans les forfaits
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
        return forfait.annonces.length < forfait.limite_annonces;
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
        
        // À remplacer par l'appel API réel
        // await this.$axios.$post(`/api/annonces/${annonceId}/move`, {
        //   source_forfait_id: sourceForfaitId,
        //   target_forfait_id: targetForfaitId
        // });
        
        // Simulation pour le développement
        const sourceForfait = this.forfaits.find(f => f.id === sourceForfaitId);
        const targetForfait = this.forfaits.find(f => f.id === targetForfaitId);
        
        if (sourceForfait && targetForfait) {
          // Trouver l'annonce dans le forfait source
          const annonceIndex = sourceForfait.annonces.findIndex(a => a.id === annonceId);
          
          if (annonceIndex !== -1) {
            // Récupérer l'annonce
            const annonce = { ...sourceForfait.annonces[annonceIndex] };
            
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
      
      // Émettre l'événement vers le parent
      this.$emit('update-success', message);
    }
  }
};
</script>