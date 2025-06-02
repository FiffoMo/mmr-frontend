<template>
  <div v-if="isActive" class="bg-white shadow sm:rounded-lg p-4 mb-4">
    <!-- En-tête -->
    <div class="pb-5 border-b border-gray-200">
      <h3 class="text-lg leading-6 font-medium text-gray-900">
        Mes commandes
      </h3>
      <p class="mt-2 max-w-4xl text-sm text-gray-500">
        Consultez l'historique de vos commandes et forfaits.
      </p>
    </div>

    <!-- Affichage du loader pendant le chargement -->
    <div v-if="loading && !error" class="py-12 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      <p class="mt-4 text-sm text-gray-500">Chargement de vos commandes...</p>
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
            {{ errorMessage || "Une erreur est survenue lors du chargement de vos commandes." }}
          </p>
          <p class="mt-2 text-sm text-red-700">
            <button @click="fetchOrders" class="font-medium underline text-red-700 hover:text-red-600">
              Réessayer
            </button>
          </p>
        </div>
      </div>
    </div>

    <!-- Aucune commande -->
    <div v-else-if="!loading && orders.length === 0" class="bg-gray-50 rounded-lg p-8 my-6 text-center">
      <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
        <svg class="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
      <p class="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        Vous n'avez pas encore passé de commande. Découvrez nos forfaits pour commencer à publier vos annonces.
      </p>
      <NuxtLink to="/tarifs" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        Découvrir nos forfaits
      </NuxtLink>
    </div>

    <!-- Liste des commandes -->
    <div v-else-if="orders.length > 0" class="mt-6">
      <!-- Filtres et tri -->
      <div class="flex flex-wrap gap-4 mb-4 justify-between">
        <div class="w-full md:w-1/3">
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
          </select>
        </div>
        
        <div class="w-full md:w-1/3">
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
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
                v-for="order in paginatedOrders" 
                :key="order.id" 
                :class="[
                  'hover:bg-opacity-75 transition-colors duration-150',
                  order.type_produit === 'annonces' || (order.produit?.nom && order.produit.nom.toLowerCase().includes('annonce')) ? 'bg-green-100' : '',
                  order.type_produit === 'mise_en_avant' || (order.produit?.nom && order.produit.nom.toLowerCase().includes('mise en avant')) ? 'bg-blue-100' : '',
                  order.type_produit === 'publicite' || isAdPackage(order) ? 'bg-yellow-100' : '',
                  !order.type_produit || (order.type_produit !== 'annonces' && order.type_produit !== 'mise_en_avant' && order.type_produit !== 'publicite' && !isAdPackage(order)) ? 'hover:bg-gray-50' : ''
                ]"
              >
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  #{{ order.reference || `CMD-${order.id}` }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatDate(order.date_created || order.date_debut) }}
                </div>
                <div v-if="order.date_fin" class="text-xs text-gray-500" :class="{'text-red-600': isExpiringSoon(order.date_fin)}">
                  Expire le {{ formatDate(order.date_fin) }}
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm text-gray-900">
                  {{ order.produit ? order.produit.nom : 'Produit inconnu' }}
                </div>
                <div v-if="order.type_produit" class="text-xs text-gray-500">
                  {{ order.type_produit }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatPrice(order.montant) }}
                </div>
                <!-- Affichage du code promo si utilisé -->
                <div v-if="order.code_promo_utilise && order.montant_reduction" class="text-xs text-green-600 flex items-center mt-1">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  -{{ formatPrice(order.montant_reduction) }} ({{ order.code_promo_utilise }})
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusClass(order.status)">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="showOrderDetails(order)" 
                  class="text-cyan-600 hover:text-cyan-900 mr-2"
                >
                  Détails
                </button>
                <!-- Nouveau bouton "Créer ma publicité" -->
                <button 
                  v-if="order.status === 'active' && isAdPackage(order) && !isAdCreated(order)"
                  @click="createAdFromOrder(order)" 
                  class="text-gray-800 hover:text-green-500 mr-2"
                  title="Créer une publicité avec ce forfait"
                >
                  Créer ma publicité
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

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-700">
          Page {{ currentPage }} sur {{ totalPages }}
        </div>
        <div class="flex space-x-1">
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-2 py-2 rounded-md border" 
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            <span class="sr-only">Premier</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 rounded-md border" 
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            Précédent
          </button>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-4 py-2 rounded-md border" 
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            Suivant
          </button>
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center px-2 py-2 rounded-md border" 
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            <span class="sr-only">Dernier</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de détails de commande -->
    <div v-if="selectedOrder" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="selectedOrder = null"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <!-- En-tête de la modal -->
          <div class="bg-cyan-700 px-4 py-3 sm:px-6 flex items-center justify-between">
            <h3 class="text-lg leading-6 font-medium text-white" id="modal-title">
              Détails de la commande #{{ selectedOrder.reference || `CMD-${selectedOrder.id}` }}
            </h3>
            <button @click="selectedOrder = null" class="text-white hover:text-gray-200">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 class="text-sm font-medium text-gray-500 mb-1">Date de commande</h4>
                <p class="text-sm text-gray-900">{{ formatDate(selectedOrder.date_created || selectedOrder.date_debut) }}</p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-500 mb-1">Statut</h4>
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusClass(selectedOrder.status)">
                  {{ getStatusLabel(selectedOrder.status) }}
                </span>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-500 mb-1">Produit</h4>
                <p class="text-sm text-gray-900">{{ selectedOrder.produit ? selectedOrder.produit.nom : 'Produit inconnu' }}</p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-500 mb-1">Montant</h4>
                <div>
                  <p class="text-sm text-gray-900">{{ formatPrice(selectedOrder.montant) }}</p>
                  <!-- Affichage détaillé du code promo dans le modal -->
                  <div v-if="selectedOrder.code_promo_utilise && selectedOrder.montant_reduction" class="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
                    <div class="flex items-center text-green-700 text-xs font-medium mb-1">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                      Code promo appliqué
                    </div>
                    <div class="text-xs text-gray-600">
                      <div class="flex justify-between">
                        <span>Code:</span>
                        <span class="font-mono font-semibold">{{ selectedOrder.code_promo_utilise }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Réduction:</span>
                        <span class="text-green-600 font-semibold">-{{ formatPrice(selectedOrder.montant_reduction) }}</span>
                      </div>
                      <div v-if="getPrixOriginal(selectedOrder)" class="flex justify-between pt-1 border-t border-green-200 mt-1">
                        <span>Prix original:</span>
                        <span class="line-through text-gray-500">{{ formatPrice(getPrixOriginal(selectedOrder)) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="selectedOrder.date_fin">
                <h4 class="text-sm font-medium text-gray-500 mb-1">Date d'expiration</h4>
                <p class="text-sm text-gray-900" :class="{'text-red-600': isExpiringSoon(selectedOrder.date_fin)}">
                  {{ formatDate(selectedOrder.date_fin) }}
                </p>
              </div>
              <div v-if="selectedOrder.annonces_restantes !== undefined">
                <h4 class="text-sm font-medium text-gray-500 mb-1">Annonces restantes</h4>
                <p class="text-sm text-gray-900">{{ selectedOrder.annonces_restantes }}</p>
              </div>
            </div>
            
            <div v-if="selectedOrder.type_produit" class="mb-6">
              <h4 class="text-sm font-medium text-gray-500 mb-1">Type de produit</h4>
              <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded">{{ selectedOrder.type_produit }}</p>
            </div>
            
            <div v-if="selectedOrder.notes_admin" class="mb-6">
              <h4 class="text-sm font-medium text-gray-500 mb-1">Notes</h4>
              <p class="text-sm text-gray-900 bg-gray-50 p-3 rounded">{{ selectedOrder.notes_admin }}</p>
            </div>

            <div class="mt-5 sm:mt-6 flex justify-end space-x-3">
              <button 
                @click="selectedOrder = null" 
                type="button" 
                class="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Fermer
              </button>
              <!-- Nouveau bouton dans le modal pour les forfaits publicité non utilisés -->
              <button 
                v-if="selectedOrder.status === 'active' && isAdPackage(selectedOrder) && !isAdCreated(selectedOrder)"
                @click="createAdFromOrder(selectedOrder); selectedOrder = null" 
                type="button" 
                class="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Créer ma publicité
              </button>
              <button 
                v-if="selectedOrder.status === 'active'"
                @click="renewOrder(selectedOrder); selectedOrder = null" 
                type="button" 
                class="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Renouveler
              </button>
            </div>
          </div>
        </div>
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
      error: false,
      errorMessage: '',
      dataRequested: false,
      orders: [],
      selectedOrder: null,
      
      // Nouvelle propriété pour les publicités créées
      createdAds: [],
      
      // Filtres et tri
      statusFilter: '',
      sortBy: 'date_desc',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10
    };
  },

  computed: {
    // Publicités filtrées
    filteredOrders() {
      let result = [...this.orders];
      
      // Filtrer par statut
      if (this.statusFilter) {
        result = result.filter(order => order.status === this.statusFilter);
      }
      
      // Appliquer le tri
      result.sort((a, b) => {
        const dateA = new Date(a.date_created || a.date_debut || 0);
        const dateB = new Date(b.date_created || b.date_debut || 0);
        
        switch (this.sortBy) {
          case 'date_asc':
            return dateA - dateB;
          case 'date_desc':
            return dateB - dateA;
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
    
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredOrders.slice(start, end);
    },
    
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    }
  },

  watch: {
    isActive(newVal) {
      if (newVal && !this.dataRequested) {
        this.fetchOrders();
        this.dataRequested = true;
      }
    },
    
    statusFilter() {
      this.currentPage = 1; // Réinitialiser la pagination lors du changement de filtre
    },
    
    sortBy() {
      this.currentPage = 1; // Réinitialiser la pagination lors du changement de tri
    }
  },

  mounted() {
    if (this.isActive) {
      this.fetchOrders();
      this.fetchCreatedAds(); // Nouvelle méthode pour récupérer les publicités existantes
    }
    
    // Ajouter un écouteur d'événement pour rafraîchir les données
    window.addEventListener('refresh-orders-data', this.handleRefresh);
  },

  beforeDestroy() {
    // Nettoyer l'écouteur d'événement
    window.removeEventListener('refresh-orders-data', this.handleRefresh);
  },

  methods: {
    // Ajouter cette méthode
    handleRefresh() {
      console.log('Rafraîchissement des données de commandes demandé');
      this.dataRequested = false; // Réinitialiser pour permettre une nouvelle requête
      this.fetchOrders();
      this.fetchCreatedAds(); // Aussi rafraîchir les publicités créées
    },
    
    async fetchOrders() {
      this.loading = true;
      this.error = false;
      this.errorMessage = '';
      
      // Timeout pour éviter un chargement infini
      const timeout = setTimeout(() => {
        if (this.loading) {
          this.loading = false;
          this.orders = [];
          console.log('Timeout atteint lors du chargement des commandes');
        }
      }, 5000);

      try {
        const directusSDK = useDirectusSDK();
        const authStore = useAuthStore();
        const userId = authStore.user?.id;
        
        if (!userId) {
          throw new Error('Utilisateur non connecté');
        }
        
        console.log('Tentative de récupération des commandes pour l\'utilisateur:', userId);
        
        // Utiliser d'abord la méthode standardisée du SDK si disponible
        try {
          console.log('Tentative de récupération via SDK...');
          const result = await directusSDK.getUserOrders();
          
          if (result && result.data && result.data.length > 0) {
            console.log('Commandes récupérées via SDK:', result.data);
            this.orders = result.data;
            return;
          } else {
            console.log('Aucune commande trouvée via SDK, essai avec client_id explicite...');
          }
        } catch (sdkError) {
          console.warn('SDK non disponible ou erreur:', sdkError);
        }
        
        // Fallback: utiliser le SDK avec client_id explicite
        try {
          const fallbackResult = await directusSDK.getItems('commandes', {
            filter: { client_id: { _eq: userId } },
            fields: '*,produit.*'
            // Suppression du tri par date qui cause l'erreur 403
            // sort: ['-date_created']
          });
          
          if (fallbackResult && fallbackResult.data && fallbackResult.data.length > 0) {
            console.log('Commandes récupérées via fallback SDK:', fallbackResult.data);
            // Trier côté client plutôt que côté serveur
            this.orders = fallbackResult.data.sort((a, b) => {
              return new Date(b.date_created || b.date_debut || 0) - new Date(a.date_created || a.date_debut || 0);
            });
            return;
          } else {
            console.log('Aucune commande trouvée via fallback SDK, essai avec fetch direct...');
          }
        } catch (fallbackError) {
          console.warn('Fallback SDK échoué:', fallbackError);
        }
        
        // Dernier recours: utiliser directement fetch via le proxy API
        // CORRECTION: Utiliser client_id au lieu de client et supprimer le tri par date
        const response = await fetch(`/api/directus/items/commandes?filter[client_id][_eq]=${userId}&fields=*,produit.*`);        

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur API:', errorData);
          throw new Error(`Erreur API: ${errorData?.errors?.[0]?.message || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Commandes récupérées par fetch direct:', data);
        this.orders = data.data || [];
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        this.error = true;
        this.errorMessage = error.message || 'Impossible de charger vos commandes';
        this.orders = [];
      } finally {
        clearTimeout(timeout);
        this.loading = false;
      }
    },
    
    // Nouvelle méthode pour récupérer les publicités existantes liées à des commandes
    async fetchCreatedAds() {
      try {
        const directusSDK = useDirectusSDK();
        const authStore = useAuthStore();
        const userId = authStore.user?.id;
        
        if (!userId) return;
        
        // Récupérer toutes les publicités de l'utilisateur qui ont une référence à une commande
        try {
          const result = await directusSDK.getItems('publicite', {
            filter: {
              _and: [
                {
                  _or: [
                    { client_id: { _eq: userId } },
                    { client: { _eq: userId } },
                    { user_created: { _eq: userId } }
                  ]
                },
                { commande_id: { _nnull: true } }
              ]
            },
            fields: ['id', 'commande_id']
          });
          
          if (result && result.data && result.data.length > 0) {
            this.createdAds = result.data;
            console.log('Publicités liées à des commandes:', this.createdAds);
          } else {
            console.log('Aucune publicité liée à une commande trouvée');
            this.createdAds = [];
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des publicités liées:', error);
          console.log('Fallback: tentative de récupération directe via fetch');
          
          // Fallback avec fetch direct
          try {
            const filter = JSON.stringify({
              _and: [
                {
                  _or: [
                    { client_id: { _eq: userId } },
                    { client: { _eq: userId } },
                    { user_created: { _eq: userId } }
                  ]
                },
                { commande_id: { _nnull: true } }
              ]
            });
            
            const response = await fetch(`/api/directus/items/publicite?filter=${encodeURIComponent(filter)}&fields=id,commande_id`, {
              credentials: 'include'
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.data) {
                this.createdAds = data.data;
                console.log('Publicités liées récupérées par fetch:', this.createdAds);
              }
            }
          } catch (fetchError) {
            console.error('Échec de la récupération par fetch:', fetchError);
            this.createdAds = [];
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des publicités liées:', error);
        this.createdAds = [];
      }
    },
    
    // Vérifier si une commande est un forfait publicité
    isAdPackage(order) {
      // Vérifier si le type de produit contient "publicité" ou si le nom du produit contient "pub"
      const typeContainsPublicite = order.type_produit && 
        order.type_produit.toLowerCase().includes('publicité');
      
      // Vérifier si le produit associé existe et contient des mots-clés
      const produitContientMotsClés = order.produit && order.produit.nom && (
        order.produit.nom.toLowerCase().includes('pub') || 
        order.produit.nom.toLowerCase().includes('bannière') ||
        order.produit.nom.toLowerCase().includes('banniere') ||
        order.produit.nom.toLowerCase().includes('affichage')
      );
      
      return typeContainsPublicite || produitContientMotsClés;
    },
    
    // Vérifier si une publicité a déjà été créée pour cette commande
    isAdCreated(order) {
      return this.createdAds.some(ad => ad.commande_id === order.id);
    },
    
    // Créer une publicité à partir d'une commande
    createAdFromOrder(order) {
      console.log('Création d\'une publicité à partir de la commande:', order);
      
      // Détecter l'emplacement
      let emplacement = 'inside_footer'; // valeur par défaut
      if (order.produit && order.produit.emplacement) {
        emplacement = order.produit.emplacement;
      }
      
      // Rediriger vers la page de création de publicité avec plus de paramètres utiles
      this.$router.push({
        path: '/ads/creer',
        query: { 
          commande_id: order.id,
          emplacement: emplacement, // ajouter l'emplacement comme paramètre si disponible
          duree: order.produit?.duree_jours || 30, // ajouter la durée comme paramètre si disponible
          type_produit: order.type_produit || '' // ajouter le type de produit comme paramètre
        }
      });
    },
    
    // Méthodes essentielles qui manquaient - CORRECTION PRINCIPALE
    showOrderDetails(order) {
      this.selectedOrder = order;
    },
    
    renewOrder(order) {
      // Implémentation de la logique de renouvellement
      console.log('Renouvellement de la commande:', order);
      
      // Rediriger vers la page des tarifs avec une requête de renouvellement
      this.$router.push({
        path: '/tarifs',
        query: { renew: order.id }
      });
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },
    
    formatPrice(price) {
      if (price === undefined || price === null) return '0,00 €';
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    },
    
    isExpiringSoon(dateString) {
      if (!dateString) return false;
      
      const expirationDate = new Date(dateString);
      const now = new Date();
      
      // Considérer comme "bientôt expiré" si moins de 7 jours
      const diffTime = expirationDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= 0 && diffDays <= 7;
    },

    // Calculer le prix original avant réduction
    getPrixOriginal(order) {
      if (order.montant_reduction && order.montant_reduction > 0) {
        return parseFloat(order.montant) + parseFloat(order.montant_reduction);
      }
      return null;
    },
    
    getStatusClass(status) {
      switch (status) {
        case 'active':
          return 'bg-green-200 text-green-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'completed':
          return 'bg-blue-100 text-blue-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    },
    
    getStatusLabel(status) {
      switch (status) {
        case 'active':
          return 'Active';
        case 'pending':
          return 'En attente';
        case 'completed':
          return 'Terminée';
        case 'cancelled':
          return 'Annulée';
        case 'draft':
          return 'Brouillon';
        default:
          return status || 'Inconnu';
      }
    }
  }
};
</script>
