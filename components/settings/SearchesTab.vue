<!-- page Mes alertes -->

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Mes alertes</h2>
      <button 
        type="button"
        class="px-3 py-1.5 bg-cyan-500 text-white text-sm rounded-md hover:bg-cyan-700"
        @click="toggleNotificationsForAll"
        :disabled="loadingAction"
      >
        {{ allNotificationsEnabled ? 'Désactiver toutes les alertes' : 'Activer toutes les alertes' }}
      </button>
    </div>
    
    <!-- Chargement -->
    <div v-if="loading" class="py-10 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      <p class="mt-2 text-gray-500">Chargement de vos alertes...</p>
    </div>
    
    <!-- Aucune alerte -->
    <div v-else-if="savedSearches.length === 0" class="bg-gray-100 p-8 rounded-lg text-center">
      <p class="text-gray-500">Vous n'avez pas encore configuré d'alertes immobilières.</p>
      <a href="/annonces" class="mt-2 inline-block text-cyan-600 hover:text-cyan-900 hover:underline">
        Parcourir les annonces
      </a>
    </div>
    
    <!-- Liste des alertes -->
    <div v-else class="space-y-4">
      <div v-for="(search, index) in savedSearches" :key="search.id" class="bg-gray-100 p-4 rounded-lg">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium">{{ search.name || 'Alerte ' + (index + 1) }}</h3>
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
    
    <!-- Modal d'édition -->
    <div 
      v-if="showEditModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg max-w-lg w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Modifier l'alerte</h3>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Le reste du modal reste identique -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchesTab',
  
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  
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
      
      // Alerte en cours d'édition
      editedSearch: null,
      editedSearchIndex: -1,
      
      // Types de biens immobiliers disponibles
      propertyTypes: [
        'maisons',
        'appartements',
        'immeubles',
        'construction',
        'maisons_dhote'
      ]
    };
  },
  
  created() {
    // Charger les alertes au montage du composant
    this.fetchSavedSearches();
  },
  
  methods: {
    // Récupération des alertes depuis Directus
    async fetchSavedSearches() {
      this.loading = true;
      
      try {
        // Requête à l'API Directus via notre proxy
        const response = await fetch(`/api/directus/items/recherches_sauvegardees?filter[utilisateur][_eq]=${this.userId}`);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.data) {
          // Transformer les données avant de les assigner
          this.savedSearches = data.data.map(search => {
            // Extraire les critères supplémentaires
            let supplementaryFeatures = {};
            if (search.criteres_supplementaires) {
              try {
                if (typeof search.criteres_supplementaires === 'string') {
                  supplementaryFeatures = JSON.parse(search.criteres_supplementaires);
                } else {
                  supplementaryFeatures = search.criteres_supplementaires;
                }
              } catch (e) {
                console.error('Erreur lors du parsing des critères supplémentaires:', e);
                supplementaryFeatures = {};
              }
            }
            
            // Construire l'objet de critères
            const criteria = {
              type: search.type_bien || '',
              location: search.localisation || '',
              maxPrice: search.prix_max,
              minSurface: search.surface_min,
              maxSurface: search.surface_max,
              minRooms: search.pieces_min,
              maxRooms: search.pieces_max,
              minBedrooms: search.chambres_min,
              maxBedrooms: search.chambres_max,
              features: {
                balcony: supplementaryFeatures.balcon || false,
                parking: supplementaryFeatures.parking || false,
                elevator: supplementaryFeatures.ascenseur || false,
                garden: supplementaryFeatures.jardin || false
              }
            };
            
            return {
              id: search.id,
              name: search.nom || '',
              notificationsEnabled: search.notifications_actives || false,
              criteria: criteria,
              originalData: search // Conserver les données originales pour la mise à jour
            };
          });
          
          // Vérifier si toutes les notifications sont activées
          this.checkAllNotificationsState();
        } else {
          this.savedSearches = [];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error);
        this.savedSearches = [];
      } finally {
        this.loading = false;
      }
    },
    
    // Vérifier l'état global des notifications
    checkAllNotificationsState() {
      this.allNotificationsEnabled = this.savedSearches.length > 0 && 
        this.savedSearches.every(search => search.notificationsEnabled);
    },
    
    // Activer/désactiver toutes les alertes
    async toggleNotificationsForAll() {
      if (this.savedSearches.length === 0 || this.loadingAction) return;
      
      const newState = !this.allNotificationsEnabled;
      this.loadingAction = true;
      
      try {
        // Préparer les mises à jour pour chaque alerte
        const updatePromises = this.savedSearches.map(async (search) => {
          search.notificationsEnabled = newState;
          
          return fetch(`/api/directus/items/recherches_sauvegardees/${search.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              notifications_actives: newState
            })
          });
        });
        
        // Attendre que toutes les mises à jour soient terminées
        await Promise.all(updatePromises);
        
        this.allNotificationsEnabled = newState;
      } catch (error) {
        console.error('Erreur lors de la mise à jour des alertes:', error);
        // Restaurer l'état précédent en cas d'erreur
        await this.fetchSavedSearches();
      } finally {
        this.loadingAction = false;
      }
    },
    
    // Mettre à jour les notifications pour une alerte spécifique
    async updateSearchNotification(search) {
      try {
        const response = await fetch(`/api/directus/items/recherches_sauvegardees/${search.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            notifications_actives: search.notificationsEnabled
          })
        });
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        // Vérifier si toutes les notifications sont activées/désactivées
        this.checkAllNotificationsState();
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'alerte:', error);
        // Restaurer l'état précédent en cas d'erreur
        search.notificationsEnabled = !search.notificationsEnabled;
      }
    },
    
    // Éditer une alerte
    editSearch(search) {
      // Créer une copie profonde pour éviter de modifier directement l'objet
      this.editedSearch = JSON.parse(JSON.stringify(search));
      this.editedSearchIndex = this.savedSearches.findIndex(s => s.id === search.id);
      this.showAdvancedCriteria = this.hasAdvancedCriteria(this.editedSearch);
      this.showEditModal = true;
    },
    
    // Vérifier si l'alerte contient des critères avancés
    hasAdvancedCriteria(search) {
      const { criteria } = search;
      return criteria.minSurface || 
        criteria.maxSurface || 
        criteria.minRooms || 
        criteria.maxRooms || 
        criteria.minBedrooms ||
        criteria.maxBedrooms ||
        Object.values(criteria.features).some(v => v);
    },
    
    // Sauvegarder une alerte modifiée
    async saveSearch() {
      if (!this.editedSearch.criteria.type && !this.editedSearch.criteria.location) {
        alert('Veuillez spécifier au moins un type de bien ou une localisation');
        return;
      }
      
      this.loadingAction = true;
      
      try {
        // Préparer les données pour l'API selon la structure de la table
        const updateData = {
          nom: this.editedSearch.name,
          notifications_actives: this.editedSearch.notificationsEnabled,
          type_bien: this.editedSearch.criteria.type,
          localisation: this.editedSearch.criteria.location,
          prix_max: this.editedSearch.criteria.maxPrice,
          surface_min: this.editedSearch.criteria.minSurface,
          surface_max: this.editedSearch.criteria.maxSurface,
          pieces_min: this.editedSearch.criteria.minRooms,
          pieces_max: this.editedSearch.criteria.maxRooms,
          chambres_min: this.editedSearch.criteria.minBedrooms,
          chambres_max: this.editedSearch.criteria.maxBedrooms,
          criteres_supplementaires: JSON.stringify(this.editedSearch.criteria.features)
        };
        
        // Envoyer la mise à jour à l'API
        const response = await fetch(`/api/directus/items/recherches_sauvegardees/${this.editedSearch.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
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
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'alerte:', error);
        alert('Une erreur est survenue lors de la sauvegarde de l\'alerte');
      } finally {
        this.loadingAction = false;
      }
    },
    
    // Supprimer une alerte
    async deleteSearch(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
        return;
      }
      
      this.loadingAction = true;
      
      try {
        // Appel à l'API pour supprimer l'alerte
        const response = await fetch(`/api/directus/items/recherches_sauvegardees/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        // Mise à jour locale
        this.savedSearches = this.savedSearches.filter(search => search.id !== id);
        
        // Vérifier l'état des notifications
        this.checkAllNotificationsState();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'alerte:', error);
        alert('Une erreur est survenue lors de la suppression de l\'alerte');
      } finally {
        this.loadingAction = false;
      }
    },
    
    // Générer l'URL pour une alerte sauvegardée
    generateSearchUrl(search) {
      const params = new URLSearchParams();
      const { criteria } = search;
      
      if (criteria.type) params.append('type', criteria.type);
      if (criteria.location) params.append('lieu', criteria.location);
      if (criteria.maxPrice) params.append('prix_max', criteria.maxPrice);
      
      // Ajouter les critères avancés
      if (criteria.minSurface) params.append('surface_min', criteria.minSurface);
      if (criteria.maxSurface) params.append('surface_max', criteria.maxSurface);
      if (criteria.minRooms) params.append('pieces_min', criteria.minRooms);
      if (criteria.maxRooms) params.append('pieces_max', criteria.maxRooms);
      if (criteria.minBedrooms) params.append('chambres_min', criteria.minBedrooms);
      if (criteria.maxBedrooms) params.append('chambres_max', criteria.maxBedrooms);
      
      // Ajouter les caractéristiques
      for (const [key, value] of Object.entries(criteria.features)) {
        if (value) {
          const featureKey = key === 'balcony' ? 'balcon' : 
                           key === 'parking' ? 'parking' : 
                           key === 'elevator' ? 'ascenseur' : 
                           key === 'garden' ? 'jardin' : key;
          params.append(featureKey, 'true');
        }
      }
      
      return `/annonces?${params.toString()}`;
    },
    
    // Formater les critères de recherche pour l'affichage
    formatSearchCriteria(search) {
      const parts = [];
      const { criteria } = search;
      
      if (criteria.type) {
        // Convertir l'ID de type en libellé lisible
        const typeLabels = {
          'maisons': 'Maison',
          'appartements': 'Appartement',
          'immeubles': 'Immeuble',
          'construction': 'Construction',
          'maisons_dhote': 'Maison d\'hôte'
        };
        parts.push(typeLabels[criteria.type] || criteria.type);
      }
      
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
      
      // Ajouter les critères de chambres si présents
      if (criteria.minBedrooms && criteria.maxBedrooms) {
        parts.push(`${criteria.minBedrooms}-${criteria.maxBedrooms} ch.`);
      } else if (criteria.minBedrooms) {
        parts.push(`Min ${criteria.minBedrooms} ch.`);
      } else if (criteria.maxBedrooms) {
        parts.push(`Max ${criteria.maxBedrooms} ch.`);
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