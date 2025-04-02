<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Mes commandes</h2>
    
    <!-- États de chargement et d'erreur -->
    <div v-if="loading" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <p class="text-gray-600">Chargement de vos commandes...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      <p class="font-medium">Une erreur est survenue</p>
      <p class="text-sm">{{ error }}</p>
      <button 
        @click="fetchOrders" 
        class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
      >
        Réessayer
      </button>
    </div>
    
    <!-- Aucune commande -->
    <div v-else-if="orders.length === 0" class="text-center py-10 bg-gray-50 rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
      <p class="mt-1 text-sm text-gray-500">Vous n'avez pas encore passé de commande.</p>
      <div class="mt-6">
        <NuxtLink to="/tarifs" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
          Découvrir nos forfaits
        </NuxtLink>
      </div>
    </div>
    
    <!-- Liste des commandes -->
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
            <option value="active">Active</option>
            <option value="pending">En attente</option>
            <option value="completed">Terminée</option>
            <option value="cancelled">Annulée</option>
            <option value="refunded">Remboursée</option>
          </select>
        </div>
        
        <div>
          <label for="sort-by" class="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
          <select 
            id="sort-by" 
            v-model="sortBy" 
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
          >
            <option value="date_desc">Date (récent → ancien)</option>
            <option value="date_asc">Date (ancien → récent)</option>
            <option value="price_desc">Prix (élevé → bas)</option>
            <option value="price_asc">Prix (bas → élevé)</option>
          </select>
        </div>
      </div>
      
      <!-- Tableau des commandes -->
      <div class="overflow-x-auto rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de fin
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
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
            <tr v-for="order in filteredOrders" :key="order.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  #{{ order.reference }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDateSimple(order.date_created) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900" :class="{'text-red-600 font-medium': isExpiringSoon(order.date_expiration)}">
                  {{ formatDateSimple(order.date_expiration) }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                  {{ order.produit ? order.produit.nom : 'Produit inconnu' }}
                </div>
                <div class="text-xs text-gray-500" v-if="order.details">
                  {{ order.details }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatPrice(order.montant) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.status)">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="showOrderDetails(order)" 
                  class="text-cyan-600 hover:text-cyan-900 mr-3"
                >
                  Détails
                </button>
                <button 
                  v-if="order.status === 'active'"
                  @click="renewOrder(order)" 
                  class="text-amber-600 hover:text-amber-900"
                >
                  Renouveler
                </button>
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
    
    <!-- Modal de détails de commande -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 md:mx-auto">
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">
            Détails de la commande #{{ selectedOrder.reference }}
          </h3>
          <button @click="selectedOrder = null" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-1">Date de commande</h4>
              <p class="text-sm text-gray-900">{{ formatDate(selectedOrder.date_created) }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-1">Statut</h4>
              <p><span :class="getStatusClass(selectedOrder.status)">
                {{ getStatusLabel(selectedOrder.status) }}
              </span></p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-1">Produit</h4>
              <p class="text-sm text-gray-900">{{ selectedOrder.produit ? selectedOrder.produit.nom : 'Produit inconnu' }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-500 mb-1">Montant</h4>
              <p class="text-sm text-gray-900">{{ formatPrice(selectedOrder.montant) }}</p>
            </div>
            <div v-if="selectedOrder.date_expiration">
              <h4 class="text-sm font-medium text-gray-500 mb-1">Date d'expiration</h4>
              <p class="text-sm text-gray-900">{{ formatDate(selectedOrder.date_expiration) }}</p>
            </div>
            <div v-if="selectedOrder.mode_paiement">
              <h4 class="text-sm font-medium text-gray-500 mb-1">Mode de paiement</h4>
              <p class="text-sm text-gray-900">{{ selectedOrder.mode_paiement }}</p>
            </div>
          </div>
          
          <div v-if="selectedOrder.details" class="mb-6">
            <h4 class="text-sm font-medium text-gray-500 mb-1">Détails du produit</h4>
            <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded">{{ selectedOrder.details }}</p>
          </div>
          
          <div v-if="selectedOrder.elements && selectedOrder.elements.length > 0" class="mb-6">
            <h4 class="text-sm font-medium text-gray-500 mb-2">Éléments associés</h4>
            <ul class="text-sm text-gray-900 bg-gray-50 p-3 rounded">
              <li v-for="(element, index) in selectedOrder.elements" :key="index" class="mb-2 last:mb-0">
                <a v-if="element.type === 'annonce' && element.id" 
                   :href="`/annonces/detail-${element.id}`" 
                   class="text-cyan-600 hover:underline">
                  {{ element.titre || `Annonce #${element.id}` }}
                </a>
                <a v-else-if="element.type === 'publicite' && element.id" 
                   :href="`/publicite?id=${element.id}`" 
                   class="text-cyan-600 hover:underline">
                  {{ element.titre || `Publicité #${element.id}` }}
                </a>
                <span v-else>{{ element.titre || `Élément #${element.id}` }}</span>
              </li>
            </ul>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button 
              @click="selectedOrder = null" 
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
            >
              Fermer
            </button>
            <button 
              v-if="selectedOrder.status === 'active'"
              @click="renewOrder(selectedOrder); selectedOrder = null" 
              class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-md"
            >
              Renouveler
            </button>
          </div>
        </div>
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
        // Appel API vers Directus via notre proxy
        const response = await fetch(`/api/directus/items/user_forfaits?filter[user_id][_eq]=${this.userId}&fields=*,annonces.*`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.data) {
          // Traitement des données
          this.forfaits = result.data.map(forfait => ({
            id: forfait.id,
            nom: forfait.nom || 'Forfait sans nom',
            limite_annonces: forfait.limite_annonces || 0,
            date_expiration: this.formatDate(forfait.date_expiration),
            jours_restants: this.getRemainingDays(forfait.date_expiration),
            annonces: Array.isArray(forfait.annonces) ? forfait.annonces.map(annonce => ({
              id: annonce.id,
              titre: annonce.titre || 'Sans titre',
              type_bien: annonce.type_bien || '',
              localisation: annonce.localisation || '',
              prix: annonce.prix || 0,
              surface: annonce.surface || 0,
              pieces: annonce.pieces || 0,
              chambres: annonce.chambres || 0,
              image: annonce.image_principale ? `/uploads/${annonce.image_principale}` : null,
              status: annonce.status || 'pending',
              date_publication: annonce.date_publication || null,
              vues: annonce.vues || 0,
              favoris: annonce.favoris || 0,
              messages: annonce.messages || 0,
              mise_en_avant: Boolean(annonce.mise_en_avant)
            })) : []
          }));
        } else {
          this.forfaits = [];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
        this.error = "Impossible de charger vos annonces. Veuillez réessayer.";
      } finally {
        this.loading = false;
      }
    },
    
    // Calculer le nombre de jours restants
    getRemainingDays(dateString) {
      if (!dateString) return 0;
      
      const expiration = new Date(dateString);
      const today = new Date();
      
      // Différence en millisecondes
      const diffTime = expiration - today;
      // Convertir en jours (arrondi supérieur)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, diffDays);
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
          // Appel API pour modifier le statut
          const response = await fetch(`/api/directus/items/annonces/${annonceId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status: 'suspended' })
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          // Mettre à jour localement
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
        // Appel API pour modifier le statut
        const response = await fetch(`/api/directus/items/annonces/${annonceId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: 'published' })
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Mettre à jour localement
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
        
        // Appel API pour mettre à jour l'annonce
        const response = await fetch(`/api/directus/items/annonces/${annonceId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ forfait_id: targetForfaitId })
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