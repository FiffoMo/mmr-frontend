<template>
    <div class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Recherches sauvegardées</h2>
        <button 
          type="button"
          class="px-3 py-1.5 bg-cyan-500 text-white text-sm rounded-md hover:bg-cyan-700"
          @click="toggleNotificationsForAll"
        >
          {{ allNotificationsEnabled ? 'Désactiver toutes les alertes' : 'Activer toutes les alertes' }}
        </button>
      </div>
      
      <!-- Chargement -->
      <div v-if="loading" class="py-10 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <p class="mt-2 text-gray-500">Chargement des recherches...</p>
      </div>
      
      <!-- Aucune recherche sauvegardée -->
      <div v-else-if="savedSearches.length === 0" class="bg-gray-100 p-8 rounded-lg text-center">
        <p class="text-gray-500">Vous n'avez pas encore de recherches sauvegardées.</p>
        <a href="/annonces" class="mt-2 inline-block text-cyan-600 hover:text-cyan-900 hover:underline">
          Parcourir les annonces
        </a>
      </div>
      
      <!-- Liste des recherches sauvegardées -->
      <div v-else class="space-y-4">
        <div v-for="(search, index) in savedSearches" :key="index" class="bg-gray-100 p-4 rounded-lg">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium">{{ search.name || 'Recherche ' + (index + 1) }}</h3>
              <p class="text-sm text-gray-600 mt-1">
                {{ formatSearchCriteria(search) }}
              </p>
              <div class="mt-2 flex space-x-2 text-sm">
                <span class="text-cyan-600 hover:text-cyan-900 hover:underline cursor-pointer" @click="editSearch(search)">
                  Modifier
                </span>
                <span class="text-red-600 hover:text-red-900 hover:underline cursor-pointer" @click="deleteSearch(search.id)">
                  Supprimer
                </span>
                <a 
                  :href="generateSearchUrl(search)" 
                  class="text-cyan-600 hover:text-cyan-900 hover:underline"
                >
                  Voir les résultats
                </a>
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 mr-2">Alertes</span>
              <label class="switch relative inline-block w-10 h-5">
                <input 
                  type="checkbox" 
                  v-model="search.notificationsEnabled"
                  class="opacity-0 w-0 h-0" 
                  @change="updateSearchNotification(search)"
                />
                <span class="slider absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all duration-300 before:absolute before:h-3 before:w-3 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all before:duration-300"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal d'édition de recherche -->
      <div 
        v-if="showEditModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg max-w-lg w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Modifier la recherche</h3>
            <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="saveSearch" class="space-y-4">
            <!-- Nom de la recherche -->
            <div>
              <label for="searchName" class="block text-sm font-medium text-gray-700 mb-2">Nom de la recherche</label>
              <input 
                type="text" 
                id="searchName" 
                v-model="editedSearch.name" 
                class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="Ex: Appartements à Paris"
              />
            </div>
            
            <!-- Type de bien -->
            <div>
              <label for="propertyType" class="block text-sm font-medium text-gray-700 mb-2">Type de bien</label>
              <select 
                id="propertyType" 
                v-model="editedSearch.criteria.type" 
                class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              >
                <option value="">Tous les biens</option>
                <option v-for="type in propertyTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            
            <!-- Localisation -->
            <div>
              <label for="location" class="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
              <input 
                type="text" 
                id="location" 
                v-model="editedSearch.criteria.location" 
                class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="Ville, département, région..."
              />
            </div>
            
            <!-- Budget max -->
            <div>
              <label for="maxPrice" class="block text-sm font-medium text-gray-700 mb-2">Budget maximum</label>
              <div class="relative">
                <input 
                  type="number" 
                  id="maxPrice" 
                  v-model="editedSearch.criteria.maxPrice" 
                  min="0" 
                  step="1000" 
                  class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 pl-8"
                />
                <span class="absolute left-3 top-2.5">€</span>
              </div>
            </div>
            
            <!-- Critères avancés (collapsible) -->
            <div>
              <button 
                type="button" 
                @click="showAdvancedCriteria = !showAdvancedCriteria" 
                class="flex items-center text-cyan-600 hover:text-cyan-900 text-sm"
              >
                <svg 
                  class="w-4 h-4 mr-1 transform transition-transform" 
                  :class="{ 'rotate-90': showAdvancedCriteria }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                Critères avancés
              </button>
              
              <div v-if="showAdvancedCriteria" class="mt-4 space-y-4 pl-2 border-l-2 border-cyan-100">
                <!-- Surface min/max -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="minSurface" class="block text-sm font-medium text-gray-700 mb-2">Surface min (m²)</label>
                    <input 
                      type="number" 
                      id="minSurface" 
                      v-model="editedSearch.criteria.minSurface" 
                      min="0" 
                      class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label for="maxSurface" class="block text-sm font-medium text-gray-700 mb-2">Surface max (m²)</label>
                    <input 
                      type="number" 
                      id="maxSurface" 
                      v-model="editedSearch.criteria.maxSurface" 
                      min="0" 
                      class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                
                <!-- Nombre de pièces min/max -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="minRooms" class="block text-sm font-medium text-gray-700 mb-2">Pièces min</label>
                    <input 
                      type="number" 
                      id="minRooms" 
                      v-model="editedSearch.criteria.minRooms" 
                      min="1" 
                      class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label for="maxRooms" class="block text-sm font-medium text-gray-700 mb-2">Pièces max</label>
                    <input 
                      type="number" 
                      id="maxRooms" 
                      v-model="editedSearch.criteria.maxRooms" 
                      min="1" 
                      class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                
                <!-- Caractéristiques supplémentaires -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Caractéristiques</label>
                  <div class="grid grid-cols-2 gap-2">
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="editedSearch.criteria.features.balcony" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Balcon/Terrasse</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="editedSearch.criteria.features.parking" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Parking</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="editedSearch.criteria.features.elevator" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Ascenseur</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="editedSearch.criteria.features.garden" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Jardin</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Notifications -->
            <div class="flex items-center pt-2 border-t border-gray-200">
              <input 
                type="checkbox" 
                id="enableNotifications" 
                v-model="editedSearch.notificationsEnabled" 
                class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label for="enableNotifications" class="ml-2 block text-sm text-gray-900">
                Recevoir des alertes pour les nouvelles annonces correspondant à cette recherche
              </label>
            </div>
            
            <!-- Boutons -->
            <div class="flex justify-end space-x-3 pt-4">
              <button 
                type="button" 
                @click="showEditModal = false" 
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-700"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SearchesTab',
    
    data() {
      return {
        // Données
        savedSearches: [],
        
        // États
        loading: false,
        loadingAction: false,
        allNotificationsEnabled: true,
        showEditModal: false,
        showAdvancedCriteria: false,
        
        // Recherche en cours d'édition
        editedSearch: null,
        editedSearchIndex: -1,
        
        // Types de biens immobiliers disponibles
        propertyTypes: [
          'Appartement',
          'Maison',
          'Villa',
          'Studio',
          'Loft',
          'Terrain',
          'Local commercial',
          'Immeuble',
          'Parking/Box'
        ]
      };
    },
    
    created() {
      // Charger les recherches sauvegardées au montage du composant
      this.fetchSavedSearches();
    },
    
    methods: {
      // Récupération des recherches sauvegardées
      async fetchSavedSearches() {
        this.loading = true;
        
        try {
          // Dans un cas réel, ce serait un appel API
          // const response = await api.getSavedSearches();
          // this.savedSearches = response;
          
          // Pour l'exemple, nous utilisons des données fictives
          this.savedSearches = [
            {
              id: 1,
              name: 'Appartements à Paris',
              notificationsEnabled: true,
              criteria: {
                type: 'Appartement',
                location: 'Paris',
                maxPrice: 250000,
                minSurface: 30,
                maxSurface: null,
                minRooms: 2,
                maxRooms: null,
                features: {
                  balcony: true,
                  parking: false,
                  elevator: true,
                  garden: false
                }
              }
            },
            {
              id: 2,
              name: 'Maisons à Bordeaux',
              notificationsEnabled: false,
              criteria: {
                type: 'Maison',
                location: 'Bordeaux',
                maxPrice: 450000,
                minSurface: 80,
                maxSurface: 200,
                minRooms: 3,
                maxRooms: 5,
                features: {
                  balcony: false,
                  parking: true,
                  elevator: false,
                  garden: true
                }
              }
            }
          ];
          
          // Vérifier si toutes les notifications sont activées
          this.checkAllNotificationsState();
          
          // Simuler une latence
          await new Promise(resolve => setTimeout(resolve, 600));
        } catch (error) {
          console.error('Erreur lors du chargement des recherches sauvegardées:', error);
        } finally {
          this.loading = false;
        }
      },
      
      // Vérifier l'état global des notifications
      checkAllNotificationsState() {
        this.allNotificationsEnabled = this.savedSearches.length > 0 && 
          this.savedSearches.every(search => search.notificationsEnabled);
      },
      
      // Activer/désactiver toutes les notifications
      async toggleNotificationsForAll() {
        if (this.savedSearches.length === 0) return;
        
        const newState = !this.allNotificationsEnabled;
        this.loadingAction = true;
        
        try {
          // Mise à jour de l'état local
          this.savedSearches.forEach(search => {
            search.notificationsEnabled = newState;
          });
          
          this.allNotificationsEnabled = newState;
          
          // Dans un cas réel, ce serait un appel API
          // await api.updateAllSearchNotifications(newState);
          
          // Simuler une latence
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Erreur lors de la mise à jour des notifications:', error);
          alert('Une erreur est survenue lors de la mise à jour des notifications');
          
          // Restaurer l'état précédent en cas d'erreur
          this.fetchSavedSearches();
        } finally {
          this.loadingAction = false;
        }
      },
      
      // Mettre à jour les notifications pour une recherche spécifique
      async updateSearchNotification(search) {
        try {
          // Dans un cas réel, ce serait un appel API
          // await api.updateSearchNotification(search.id, search.notificationsEnabled);
          
          // Vérifier si toutes les notifications sont activées/désactivées
          this.checkAllNotificationsState();
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la notification:', error);
          alert('Une erreur est survenue lors de la mise à jour de la notification');
          
          // Restaurer l'état précédent en cas d'erreur
          search.notificationsEnabled = !search.notificationsEnabled;
        }
      },
      
      // Éditer une recherche
      editSearch(search) {
        // Créer une copie profonde pour éviter de modifier directement l'objet
        this.editedSearch = JSON.parse(JSON.stringify(search));
        this.editedSearchIndex = this.savedSearches.findIndex(s => s.id === search.id);
        this.showAdvancedCriteria = this.hasAdvancedCriteria(this.editedSearch);
        this.showEditModal = true;
      },
      
      // Vérifier si la recherche contient des critères avancés
      hasAdvancedCriteria(search) {
        const { criteria } = search;
        return criteria.minSurface || 
          criteria.maxSurface || 
          criteria.minRooms || 
          criteria.maxRooms || 
          Object.values(criteria.features).some(v => v);
      },
      
      // Sauvegarder une recherche modifiée
      async saveSearch() {
        if (!this.editedSearch.criteria.type && !this.editedSearch.criteria.location) {
          alert('Veuillez spécifier au moins un type de bien ou une localisation');
          return;
        }
        
        this.loadingAction = true;
        
        try {
          // Dans un cas réel, ce serait un appel API
          // await api.updateSavedSearch(this.editedSearch);
          
          // Mise à jour locale
          if (this.editedSearchIndex !== -1) {
            this.savedSearches[this.editedSearchIndex] = { ...this.editedSearch };
          }
          
          // Fermer le modal
          this.showEditModal = false;
          this.editedSearch = null;
          this.editedSearchIndex = -1;
          
          // Vérifier l'état des notifications
          this.checkAllNotificationsState();
          
          // Simuler une latence
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de la recherche:', error);
          alert('Une erreur est survenue lors de la sauvegarde de la recherche');
        } finally {
          this.loadingAction = false;
        }
      },
      
      // Supprimer une recherche
      async deleteSearch(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette recherche sauvegardée ?')) {
          return;
        }
        
        this.loadingAction = true;
        
        try {
          // Dans un cas réel, ce serait un appel API
          // await api.deleteSavedSearch(id);
          
          // Mise à jour locale
          this.savedSearches = this.savedSearches.filter(search => search.id !== id);
          
          // Vérifier l'état des notifications
          this.checkAllNotificationsState();
          
          // Simuler une latence
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Erreur lors de la suppression de la recherche:', error);
          alert('Une erreur est survenue lors de la suppression de la recherche');
        } finally {
          this.loadingAction = false;
        }
      },
      
      // Générer l'URL pour une recherche sauvegardée
      generateSearchUrl(search) {
        const params = new URLSearchParams();
        const { criteria } = search;
        
        if (criteria.type) params.append('type', criteria.type);
        if (criteria.location) params.append('location', criteria.location);
        if (criteria.maxPrice) params.append('maxPrice', criteria.maxPrice);
        
        // Ajouter les critères avancés
        if (criteria.minSurface) params.append('minSurface', criteria.minSurface);
        if (criteria.maxSurface) params.append('maxSurface', criteria.maxSurface);
        if (criteria.minRooms) params.append('minRooms', criteria.minRooms);
        if (criteria.maxRooms) params.append('maxRooms', criteria.maxRooms);
        
        // Ajouter les caractéristiques
        for (const [key, value] of Object.entries(criteria.features)) {
          if (value) params.append(`feature_${key}`, 'true');
        }
        
        return `/annonces?${params.toString()}`;
      },
      
      // Formater les critères de recherche pour l'affichage
      formatSearchCriteria(search) {
        const parts = [];
        const { criteria } = search;
        
        if (criteria.type) parts.push(criteria.type);
        if (criteria.location) parts.push(criteria.location);
        if (criteria.maxPrice) parts.push(`Budget: ${this.formatPrice(criteria.maxPrice)}`);
        
        // Ajouter les critères de surface si présents
        if (criteria.minSurface && criteria.maxSurface) {
          parts.push(`${criteria.minSurface}-${criteria.maxSurface} m²`);
        } else if (criteria.minSurface) {
          parts.push(`Min ${criteria.minSurface} m²`);
        } else if (criteria.maxSurface) {
          parts.push(`Max ${criteria.maxSurface} m²`);
        }
        
        // Ajouter les critères de pièces si présents
        if (criteria.minRooms && criteria.maxRooms) {
          parts.push(`${criteria.minRooms}-${criteria.maxRooms} pièces`);
        } else if (criteria.minRooms) {
          parts.push(`Min ${criteria.minRooms} pièces`);
        } else if (criteria.maxRooms) {
          parts.push(`Max ${criteria.maxRooms} pièces`);
        }
        
        return parts.join(' - ');
      },
      
      // Formater un prix
      formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Style pour l'indicateur activé/désactivé */
  .slider:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #0ea5e9;
  }
  
  input:checked + .slider:before {
    transform: translateX(18px);
  }
  </style>