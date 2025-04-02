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
  name: 'OrdersTab',
  
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
      orders: [], // Liste des commandes
      
      // État du modal
      selectedOrder: null,
      
      // Filtres et tri
      statusFilter: '', // '' = tous
      sortBy: 'date_desc',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    };
  },
  
  computed: {
    // Commandes filtrées et triées
    filteredOrders() {
      let result = [...this.orders];
      
      // Appliquer le filtre de statut
      if (this.statusFilter) {
        result = result.filter(order => order.status === this.statusFilter);
      }
      
      // Appliquer le tri
      result.sort((a, b) => {
        switch (this.sortBy) {
          case 'date_asc':
            return new Date(a.date_created) - new Date(b.date_created);
          case 'date_desc':
            return new Date(b.date_created) - new Date(a.date_created);
          case 'price_asc':
            return a.montant - b.montant;
          case 'price_desc':
            return b.montant - a.montant;
          default:
            return 0;
        }
      });
      
      return result;
    },
    
    // Nombre total de pages
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
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
    this.fetchOrders();
  },
  
  methods: {
    // Récupérer les commandes depuis l'API
    async fetchOrders() {
      this.loading = true;
      this.error = null;
      
      try {
        // Correction: champ 'client' au lieu de 'utilisateur'
        const response = await fetch(`/api/directus/items/commandes?filter[client][_eq]=${this.userId}&fields=*,produit.*&sort=-date_created`);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.data) {
          // Transformer les données
          this.orders = data.data.map(order => {
            // Utiliser les champs date_debut et date_fin pour les dates
            const dateCreated = new Date(order.date_created || order.date_debut || Date.now());
            const dateExpiration = order.date_fin ? new Date(order.date_fin) : null;
            
            // Calculer les jours restants
            let joursRestants = 0;
            if (dateExpiration) {
              const today = new Date();
              const diff = dateExpiration - today;
              joursRestants = Math.ceil(diff / (1000 * 60 * 60 * 24));
            }
            
            // Pour chaque commande, récupérer les éléments associés (comme les annonces)
            this.fetchOrderItems(order.id);
            
            return {
              id: order.id,
              reference: order.reference || `CMD-${order.id}`,
              date_created: order.date_created || order.date_debut,
              montant: order.montant || 0,
              status: order.status || 'pending',
              statut_paiement: order.statut_paiement || 'pending',
              produit: order.produit || { nom: 'Produit inconnu' },
              details: `${order.type_produit || ''} ${order.annonces_restantes ? '- Annonces restantes: ' + order.annonces_restantes : ''}`,
              date_expiration: dateExpiration ? dateExpiration.toISOString() : null,
              jours_restants: joursRestants > 0 ? joursRestants : 0,
              mode_paiement: 'Carte bancaire', // Par défaut
              elements: [] // Sera rempli par fetchOrderItems
            };
          });
          
          this.totalItems = this.orders.length;
        } else {
          this.orders = [];
          this.totalItems = 0;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        this.error = "Impossible de charger vos commandes. Veuillez réessayer.";
      } finally {
        this.loading = false;
      }
    },
    
    // Récupérer les éléments liés à une commande (annonces, publicités, etc.)
    async fetchOrderItems(orderId) {
      try {
        // Récupérer les annonces liées à cette commande
        const annoncesResponse = await fetch(`/api/directus/items/annonces?filter[produit][_eq]=${orderId}&fields=id,titre,type_bien&limit=100`);
        
        if (annoncesResponse.ok) {
          const annoncesData = await annoncesResponse.json();
          
          if (annoncesData.data && annoncesData.data.length > 0) {
            // Trouver la commande dans la liste
            const orderIndex = this.orders.findIndex(o => o.id === orderId);
            
            if (orderIndex !== -1) {
              // Ajouter les annonces aux éléments
              const annonces = annoncesData.data.map(annonce => ({
                type: 'annonce',
                id: annonce.id,
                titre: annonce.titre || `Annonce #${annonce.id}`
              }));
              
              this.orders[orderIndex].elements = [...this.orders[orderIndex].elements, ...annonces];
            }
          }
        }
        
        // On pourrait ajouter d'autres types d'éléments (publicités, etc.) si nécessaire
      } catch (error) {
        console.error(`Erreur lors du chargement des éléments pour la commande ${orderId}:`, error);
      }
    },
    
    // Formater une date avec heure
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    
    // Formater une date sans heure (pour l'affichage simplifié)
    formatDateSimple(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },
    
    // Vérifier si une date d'expiration approche (moins de 7 jours)
    isExpiringSoon(dateString) {
      if (!dateString) return false;
      
      const expirationDate = new Date(dateString);
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      return expirationDate > today && expirationDate <= sevenDaysFromNow;
    },
    
    // Formater un prix en euros
    formatPrice(amount) {
      if (amount === undefined || amount === null) return 'N/A';
      
      // Ici on suppose que montant est stocké directement en euros, pas en centimes
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(amount);
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
        case 'completed':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800';
        case 'cancelled':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
        case 'refunded':
          return 'px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800';
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
        case 'completed':
          return 'Terminée';
        case 'cancelled':
          return 'Annulée';
        case 'refunded':
          return 'Remboursée';
        default:
          return status || 'Inconnu';
      }
    },
    
    // Afficher les détails d'une commande
    showOrderDetails(order) {
      this.selectedOrder = order;
    },
    
    // Renouveler une commande
    async renewOrder(order) {
      // Dans une implémentation réelle, cela redirigerait vers le processus de renouvellement
      // Pour l'instant, nous allons simplement déclencher un événement pour indiquer l'intention
      this.$emit('update-success', `Redirection vers le renouvellement de la commande #${order.reference}`);
      
      // En production, nous pourrions utiliser:
      // this.$router.push({
      //   path: '/tarifs',
      //   query: { renew: order.id }
      // });
    }
  }
};
</script>