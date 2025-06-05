<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Mise en avant de mes annonces</h2>
    
    <!-- Message de chargement -->
    <div v-if="loading && !error" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <p class="text-gray-600">Chargement des informations...</p>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      <p class="font-medium">Une erreur est survenue</p>
      <p class="text-sm">{{ error }}</p>
      <button 
        @click="fetchHighlightData" 
        class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
      >
        Réessayer
      </button>
    </div>
    
    <!-- Pas de mise en avant active -->
    <div v-else-if="!loading && highlights.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
      <div class="flex flex-col items-center justify-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune mise en avant</h3>
        <p class="text-gray-500 mb-6">Vous n'avez pas encore de mise en avant active pour vos annonces.</p>
        
        <a href="/tarifs" class="bg-cyan-500 hover:bg-cyan-700 text-white py-2 px-6 rounded-md transition-colors mb-6">
          Découvrir nos forfaits
        </a>
        
        <p class="text-sm text-gray-400">
          Votre mise en avant ne s'affiche pas ? <a href="mailto:sav@ma-maison-rapporte.fr" class="text-cyan-600 hover:underline">Contactez le SAV</a>
        </p>
      </div>
    </div>
    
    <!-- Liste des mises en avant actives -->
    <div v-ifelse-="highlights.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- Section pour chaque mise en avant -->
      <div v-for="highlight in highlights" :key="highlight.id" 
        :class="[
          'rounded-lg shadow p-6 border border-gray-200',
          highlight.isExpired ? 'bg-slate-100' : 'bg-blue-100'
        ]">
        <!-- En-tête avec info sur la commande -->
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-900">
            Forfait MISE EN AVANT 
            <span class="text-gray-600 font-normal">
              N° {{ getCommandeReference(highlight) }}
            </span>
          </h3>
          <div class="mt-1 flex flex-col sm:flex-row sm:gap-4">
            <p class="text-sm text-gray-500">
              <span class="font-medium">Achat:</span> {{ formatDate(highlight.date_debut) }}
            </p>
            <p class="text-sm text-gray-500 flex items-center flex-wrap">
              <span class="font-medium">Expiration:</span> {{ formatDate(highlight.date_fin) }}
              <span v-if="!highlight.isExpired" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800">
                {{ highlight.daysLeft }} jours restants
              </span>
            </p>
          </div>
        </div>
        
        <!-- Bouton de sélection d'annonce -->
        <button 
          v-if="!highlight.isExpired"
          @click="openAnnonceSelector(highlight)" 
          class="px-4 py-2 border border-transparent text-sm text-center font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mb-4"
        >
          Choisir l'annonce à mettre en avant
        </button>
        
        <!-- Section aperçu de l'annonce sélectionnée -->
        <div class="bg-slate-100 p-4 rounded-lg border border-gray-200">
          <h4 class="text-md font-medium text-gray-800 mb-4 text-lg">Annonce mise en avant</h4>
          
          <div v-if="!getSelectedAnnonce(highlight) && !highlight.annonce" class="text-center py-6">
            <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 22V12h6v10" />
            </svg>
            <p class="mt-2 text-sm text-gray-500">Aucune annonce sélectionnée</p>
            <p class="text-xs text-gray-400">Veuillez choisir une annonce à mettre en avant</p>
          </div>
          
          <div v-else class="bg-white p-4 rounded-md border border-gray-200">
            <div class="flex flex-col sm:flex-row items-start sm:items-center">
              <!-- Image de l'annonce -->
              <div class="w-full sm:w-24 h-24 bg-gray-200 rounded-md overflow-hidden mr-3 mb-3 sm:mb-0 flex-shrink-0">
                <img 
                  v-if="(getSelectedAnnonce(highlight) || highlight.annonce)?.image_principale" 
                  :src="getImageUrl((getSelectedAnnonce(highlight) || highlight.annonce)?.image_principale)" 
                  alt="Image" 
                  class="w-full h-full object-cover"
                  @error="handleImageError($event, getSelectedAnnonce(highlight) || highlight.annonce)"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <!-- Infos de l'annonce -->
              <div class="flex-grow">
                <h5 class="font-medium text-gray-900 mb-1">
                  {{ (getSelectedAnnonce(highlight) || highlight.annonce)?.titre || (getSelectedAnnonce(highlight) || highlight.annonce)?.Titre }}
                </h5>
                <p class="text-sm text-gray-500 mb-1">
                  {{ (getSelectedAnnonce(highlight) || highlight.annonce)?.localisation }}
                </p>
                <p class="text-md font-medium text-cyan-600">
                  {{ formatPrice((getSelectedAnnonce(highlight) || highlight.annonce)?.prix || (getSelectedAnnonce(highlight) || highlight.annonce)?.prix_vente) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Message si aucune annonce disponible - toujours affiché -->
        <!-- Message si aucune annonce disponible - conditionné à l'absence d'annonces -->
        <div v-if="annonces.length === 0" class="bg-slate-100 mt-5 border border-gray-200 text-gray-700 px-4 py-3 text-center rounded mb-4">
          <p class="font-medium text-lg">Aucune annonce à promouvoir ?</p>
          <p class="text-sm mb-2">Vous pouvez créer une nouvelle annonce à mettre en avant.</p>
          <a 
            href="/tarifs" 
            class="inline-block px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            Créer une annonce
          </a>
         </div>


        <!-- Message de sauvegarde -->
        <div v-if="highlight.saveMessage" class="mt-4" :class="highlight.saveError ? 'text-red-600' : 'text-green-600'">
          {{ highlight.saveMessage }}
        </div>
        
        <!-- Bouton de renouvellement pour les forfaits expirés -->
        <div v-if="highlight.isExpired" class="mt-6 text-center">
          <p class="text-sm text-gray-600 mb-2">Ce forfait de mise en avant a expiré.</p>
          <a href="/tarifs#mise-en-avant" class="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-md">
            Renouveler mon forfait
          </a>
        </div>
      </div>
    </div>
    
    <!-- Modal de sélection d'annonce -->
    <div v-if="modal.show" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
        <!-- En-tête du modal -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Choisir une annonce à mettre en avant</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Corps du modal -->
        <div class="px-6 py-4 flex-1 overflow-y-auto">
          <!-- Chargement des annonces -->
          <div v-if="loadingAnnonces" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-2"></div>
            <p class="text-gray-600">Chargement de vos annonces...</p>
          </div>
          
          <!-- Aucune annonce disponible -->
          <div v-else-if="annonces.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="mt-2 text-gray-500">Aucune annonce active disponible</p>
            <a 
              href="/dashboard/annonces/createAnnonce" 
              class="mt-4 inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700"
            >
              Créer une annonce
            </a>
          </div>
          
          <!-- Liste des annonces -->
          <div v-else class="space-y-3">
            <div 
              v-for="annonce in annonces" 
              :key="annonce.id" 
              class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
              :class="{ 'border-cyan-500 bg-cyan-50': modal.currentHighlight && modal.currentHighlight.selectedAnnonceId === annonce.id }"
              @click="selectAnnonce(annonce.id)"
            >
              <div class="flex items-start sm:items-center gap-3">
                <!-- Image de l'annonce -->
                <div class="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    v-if="annonce.image_principale" 
                    :src="getImageUrl(annonce.image_principale)" 
                    :alt="annonce.titre || annonce.Titre" 
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 22V12h6v10" />
                    </svg>
                  </div>
                </div>
                
                <!-- Infos de l'annonce -->
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ annonce.titre || annonce.Titre }}</h4>
                  <p class="text-sm text-gray-500">{{ annonce.localisation }}</p>
                  <p class="text-sm font-medium text-cyan-600">{{ formatPrice(annonce.prix || annonce.prix_vente) }}</p>
                </div>
                
                <!-- Indicateur de sélection -->
                <div v-if="modal.currentHighlight && modal.currentHighlight.selectedAnnonceId === annonce.id" class="text-cyan-600">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pied du modal -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button 
            @click="closeModal" 
            class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
          >
            Annuler
          </button>
          <button 
            @click="confirmSelection"
            :disabled="!modal.currentHighlight || !modal.currentHighlight.selectedAnnonceId || saving"
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 flex items-center"
          >
            <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDirectusSDK } from '@/composables/useDirectusSDK';
import { useAuthStore } from '@/stores/useAuthStore';

export default {
  name: 'HighlightTab',
  
  props: {
    userId: {
      type: String,
      default: null
    },
    user: {
      type: Object,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update-success'],
  
  setup() {
    // Utiliser le service SDK Directus
    const directusSDK = useDirectusSDK();
    
    // Utiliser le store d'authentification
    const authStore = useAuthStore();
    
    return {
      directusSDK,
      authStore
    };
  },
  
  data() {
    return {
      loading: false,
      loadingAnnonces: false,
      saving: false,
      error: null,
      savingHighlightId: null,
      
      highlights: [],
      annonces: [],
      
      // Drapeau pour suivre si les données ont été demandées
      dataRequested: false,
      
      // Modal de sélection d'annonce
      modal: {
        show: false,
        currentHighlight: null
      }
    };
  },
  
  computed: {
    // Récupérer l'ID utilisateur effectif
    effectiveUserId() {
      return this.userId || (this.user ? this.user.id : null) || this.authStore.user?.id;
    }
  },
  
  watch: {
    // Surveiller si l'onglet devient actif
    isActive(newValue) {
      if (newValue && !this.dataRequested) {
        // Rafraîchir les données lorsque l'onglet devient actif
        this.fetchHighlightData();
      }
    }
  },
  
  mounted() {
    // Écouter l'événement de rafraîchissement spécifique
    window.addEventListener('refresh-highlight-data', this.fetchHighlightData);
    
    // Également écouter l'événement général de rafraîchissement des commandes
    window.addEventListener('refresh-orders-data', this.refreshData);
    
    // Charger les données si l'onglet est actif
    if (this.isActive && !this.dataRequested) {
      this.fetchHighlightData();
    }
  },
  
  beforeUnmount() {
    // Nettoyer les écouteurs d'événements
    window.removeEventListener('refresh-highlight-data', this.fetchHighlightData);
    window.removeEventListener('refresh-orders-data', this.refreshData);
  },
  
  methods: {
    // Récupérer les données de mise en avant
    async fetchHighlightData() {
      console.log('Chargement des mises en avant...');
      this.loading = true;
      this.error = null;
      this.dataRequested = true;
      
      try {
        // Vérifier si l'utilisateur est connecté
        if (!this.effectiveUserId) {
          console.error('ID utilisateur non disponible');
          this.error = "Impossible de charger vos données: utilisateur non identifié.";
          this.debugCommandes();
          this.loading = false;
          return;
        }
        
        console.log('Chargement des données de mise en avant pour l\'utilisateur:', this.effectiveUserId);
        
        // Récupérer les mises en avant avec directus
        let result = null;
        
        try {
          // Utiliser fetch directement avec un format de requête compatible
          const response = await fetch(`/api/directus/items/mise_en_avant?filter[client][_eq]=${this.effectiveUserId}&fields=*,annonce.*,annonce.image_principale.*,commande_id.*`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            console.log(`Erreur HTTP ${response.status} avec filtre client, tentative avec client_id...`);
            
            // Alternative avec client_id
            const responseFallback = await fetch(`/api/directus/items/mise_en_avant?filter[client_id][_eq]=${this.effectiveUserId}&fields=*,annonce.*,annonce.image_principale.*,commande_id.*`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (!responseFallback.ok) {
              console.log(`Erreur HTTP ${responseFallback.status} avec les deux filtres, on passe à la recherche via commandes`);
              throw new Error('Impossible de récupérer les mises en avant');
            }
            
            const fallbackData = await responseFallback.json();
            result = fallbackData.data;
            console.log('Résultat avec filtre client_id:', result);
          } else {
            const responseData = await response.json();
            result = responseData.data;
            console.log('Résultat avec filtre client:', result);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des mises en avant:', error);
          // Nous passerons à la récupération via commandes, ne propagez pas l'erreur
        }
        
        // POINT CLÉ: Récupérer directement toutes les commandes de type mise_en_avant
        // Toujours exécuter cette étape, même si des résultats ont déjà été trouvés
        console.log('Récupération des commandes de mise en avant...');
        const commandes = await this.fetchMiseEnAvantCommandes();
        console.log('Commandes de mise en avant trouvées:', commandes);
        
        // Créer un tableau unifié des résultats
        let resultsUnified = [];
        
        // Ajouter les résultats existants de mise_en_avant s'il y en a
        if (result && result.length > 0) {
          resultsUnified = [...result];
        }
        
        // Ajouter les commandes qui ne sont pas déjà représentées dans result
        // IMPORTANT: Vérifier correctement si une commande est déjà présente
        if (commandes && commandes.length > 0) {
          // Créer un ensemble d'IDs de commandes déjà présentes
          const existingCommandeIds = new Set();
          
          if (result && result.length > 0) {
            for (const item of result) {
              if (item.commande_id) {
                const commandeId = typeof item.commande_id === 'object' 
                  ? (item.commande_id.id || item.commande_id) 
                  : item.commande_id;
                
                existingCommandeIds.add(String(commandeId));
              }
            }
          }
          
          console.log('Commandes déjà présentes:', [...existingCommandeIds]);
          
          // Ajouter uniquement les commandes qui ne sont pas déjà présentes
          for (const commande of commandes) {
            if (!existingCommandeIds.has(String(commande.id))) {
              console.log('Ajout de la commande qui n\'était pas déjà présente:', commande.id);
              
              resultsUnified.push({
                id: `commande-${commande.id}`,
                commande_id: commande,  // On garde la commande complète ici
                date_debut: commande.date_debut,
                date_fin: commande.date_fin,
                annonce: null,
                client: this.effectiveUserId,
                // Ajouter un flag pour indiquer que c'est une commande directe
                isCommandeDirect: true
              });
            }
          }
        }
        
        console.log('Résultats unifiés avant traitement:', resultsUnified);
        
        // Traiter les données
        if (resultsUnified.length > 0) {
          const processedHighlights = await this.processHighlightsData(resultsUnified);
          this.highlights = processedHighlights;
          
          // Si on a des mises en avant actives, charger les annonces disponibles
          if (this.highlights.some(h => !h.isExpired)) {
            this.fetchAnnonces();
          }
          
          console.log('Highlights après traitement:', this.highlights);
        } else {
          console.log('Aucune mise en avant trouvée');
          this.highlights = [];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des mises en avant:', error);
        this.error = "Impossible de charger vos données de mise en avant. Veuillez réessayer.";
        this.highlights = [];
      } finally {
        this.loading = false;
      }
      
      // Déboguer la structure des données après traitement
      if (this.highlights && this.highlights.length > 0) {
        console.log('=== STRUCTURE DES MISES EN AVANT ===');
        const sample = this.highlights[0];
        console.log('Premier élément:', sample);
        console.log('Type de commande_id:', typeof sample.commande_id);
        
        if (typeof sample.commande_id === 'object' && sample.commande_id !== null) {
          console.log('Propriétés de commande_id:', Object.keys(sample.commande_id));
          for (const key in sample.commande_id) {
            console.log(`- ${key}:`, sample.commande_id[key]);
          }
        }
        
        console.log('Commande complète:', sample.commande);
        console.log('Référence calculée:', this.getCommandeReference(sample));
        console.log('=== FIN DU DÉBOGAGE ===');
      }
    },
    
    // Récupérer les commandes de type mise en avant
    async fetchMiseEnAvantCommandes() {
      try {
        console.log('Récupération des commandes de type mise_en_avant pour:', this.effectiveUserId);
        
        // Utiliser directement fetch pour éviter les problèmes d'autorisation avec le SDK
        const response = await fetch(`/api/directus/items/commandes?filter[client_id][_eq]=${this.effectiveUserId}&filter[type_produit][_eq]=mise_en_avant&fields=*,produit.*`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          // En cas d'erreur, tenter avec un autre filtre
          console.log(`Erreur HTTP ${response.status}, tentative avec moins de champs...`);
          
          const fallbackResponse = await fetch(`/api/directus/items/commandes?filter[client_id][_eq]=${this.effectiveUserId}&filter[type_produit][_eq]=mise_en_avant`, {
            credentials: 'include'
          });
          
          if (!fallbackResponse.ok) {
            console.error(`Erreur HTTP ${fallbackResponse.status} avec la requête de secours`);
            return [];
          }
          
          const fallbackData = await fallbackResponse.json();
          console.log('Commandes récupérées (méthode fallback):', fallbackData.data);
          return fallbackData.data || [];
        }
        
        const responseData = await response.json();
        console.log('Commandes récupérées:', responseData.data);
        return responseData.data || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        return [];
      }
    },
    
    // Traiter les données de mise en avant
    async processHighlightsData(data) {
      const highlightsWithDetails = [];
      
      console.log('Traitement des données:', data);
      
      for (const highlight of data) {
        try {
          // Vérifier si on a déjà les détails de la commande
          let commandeDetails = highlight.commande || null;
          
          // Si commande_id est un objet complet, c'est peut-être déjà la commande
          if (!commandeDetails && highlight.commande_id && typeof highlight.commande_id === 'object') {
            if (highlight.commande_id.id !== undefined) {
              // C'est probablement une commande complète
              commandeDetails = highlight.commande_id;
              console.log('Commande complète trouvée dans commande_id:', commandeDetails);
            }
          }
          
          // Si on n'a toujours pas les détails, essayer de les récupérer
          if (!commandeDetails) {
            // Déterminer l'ID de la commande
            const commandeId = this.getCommandeId(highlight);
            
            if (commandeId) {
              try {
                console.log(`Récupération des détails de la commande ${commandeId}`);
                
                // Tentative avec le SDK
                commandeDetails = await this.directusSDK.getItem('commandes', commandeId);
              } catch (error) {
                console.log('Erreur lors de la récupération de la commande, tentative avec fetch direct');
                
                // Fallback avec fetch direct
                try {
                  const response = await fetch(`/api/directus/items/commandes/${commandeId}`, {
                    credentials: 'include'
                  });
                  
                  if (response.ok) {
                    const responseData = await response.json();
                    commandeDetails = responseData.data;
                  } else {
                    console.error('Fetch direct de la commande a échoué:', response.status);
                  }
                } catch (fetchError) {
                  console.error('Erreur de fetch direct:', fetchError);
                }
              }
            }
          }
          
          // Si c'est une commande directe et non une mise_en_avant, s'assurer qu'on a les dates
          if ((!highlight.date_debut || !highlight.date_fin) && commandeDetails) {
            highlight.date_debut = highlight.date_debut || commandeDetails.date_debut;
            highlight.date_fin = highlight.date_fin || commandeDetails.date_fin;
          }
          
          // Vérifier si on a déjà les détails de l'annonce
          let annonceDetails = highlight.annonce || null;
          
          // Récupérer les détails de l'annonce si nécessaire
          if (!annonceDetails && highlight.annonce) {
            try {
              annonceDetails = await this.directusSDK.getItem('Annonces', highlight.annonce);
            } catch (error) {
              console.log('Erreur lors de la récupération de l\'annonce, tentative avec fetch direct');
              
              const response = await fetch(`/api/directus/items/Annonces/${highlight.annonce}`, {
                credentials: 'include'
              });
              
              if (response.ok) {
                const responseData = await response.json();
                annonceDetails = responseData.data;
              }
            }
          }
          
          
          // Déterminer si la mise en avant est expirée
          const dateFin = new Date(highlight.date_fin);
          const isExpired = dateFin < new Date();
          
          // Calculer le nombre de jours restants
          const daysLeft = this.getRemainingDays(highlight.date_fin);
          
          // Si nous avons les détails de la commande, extraire la référence
          const reference = commandeDetails?.reference || 
                           (highlight.commande_id?.reference) ||
                           `ORD-${commandeDetails?.id || '???'}`;
          
          highlightsWithDetails.push({
            ...highlight,
            commande: commandeDetails || { id: this.getCommandeId(highlight) },
            commandeReference: reference, // Stockage explicite de la référence
            annonce: annonceDetails,
            isExpired,
            daysLeft,
            selectedAnnonceId: annonceDetails ? annonceDetails.id : '',
            saveMessage: null,
            saveError: false
          });
        } catch (error) {
          console.error('Erreur lors du traitement de la mise en avant:', error);
        }
      }
      
      // Trier les mises en avant (non expirées d'abord, puis par date d'expiration)
      highlightsWithDetails.sort((a, b) => {
        if (a.isExpired !== b.isExpired) {
          return a.isExpired ? 1 : -1;
        }
        
        return new Date(b.date_fin) - new Date(a.date_fin);
      });
      
      return highlightsWithDetails;
    },
    
    // Nouvelle méthode utilitaire pour extraire l'ID de la commande de manière cohérente
    getCommandeId(highlight) {
      if (!highlight) return null;
      
      // Si c'est une chaîne "commande-XX", extraire l'ID
      if (highlight.id && typeof highlight.id === 'string' && highlight.id.startsWith('commande-')) {
        return highlight.id.replace('commande-', '');
      }
      
      // Si commande_id est un objet avec un id
      if (highlight.commande_id && typeof highlight.commande_id === 'object' && highlight.commande_id.id) {
        return highlight.commande_id.id;
      }
      
      // Si commande_id est un ID direct
      if (highlight.commande_id && (typeof highlight.commande_id === 'string' || typeof highlight.commande_id === 'number')) {
        return highlight.commande_id;
      }
      
      // Si highlight a une commande avec un id
      if (highlight.commande && highlight.commande.id) {
        return highlight.commande.id;
      }
      
      console.warn('Impossible de déterminer l\'ID de la commande:', highlight);
      return null;
    },
    
    // Récupérer les annonces disponibles
    async fetchAnnonces() {
      this.loadingAnnonces = true;
      console.log('Récupération des annonces pour l\'utilisateur:', this.effectiveUserId);
      
      try {
        // Version simplifiée pour l'administrateur - récupérer toutes les annonces
        if (this.authStore.isAdmin || this.authStore.user?.role?.name === 'Administrator') {
          console.log('Utilisateur administrateur détecté, récupération de toutes les annonces.');
          
          // Pour les administrateurs, récupérer toutes les annonces actives
          const response = await fetch(`/api/directus/items/Annonces?filter[status][_in]=active,published`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          const responseData = await response.json();
          this.annonces = responseData.data || [];
          console.log(`${this.annonces.length} annonces récupérées pour l'administrateur.`);
        } else {
          // Version standard pour les clients normaux
          console.log('Récupération des annonces du client...');
          const response = await fetch(`/api/directus/items/Annonces?filter[client_id][_eq]=${this.effectiveUserId}&filter[status][_in]=active,published`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            console.log(`Erreur HTTP ${response.status}, tentative simplifiée...`);
            
            // Tentative avec moins de champs
            const fallbackResponse = await fetch(`/api/directus/items/Annonces?filter[client_id][_eq]=${this.effectiveUserId}&filter[status][_in]=active,published`, {
              credentials: 'include'
            });
            
            if (!fallbackResponse.ok) {
              throw new Error(`Erreur HTTP: ${fallbackResponse.status}`);
            }
            
            const fallbackData = await fallbackResponse.json();
            this.annonces = fallbackData.data || [];
          } else {
            const responseData = await response.json();
            this.annonces = responseData.data || [];
          }
        }
        
        console.log('Annonces récupérées:', this.annonces.length);
        
        // Normaliser les données des annonces pour gérer les différences de structure
        this.annonces = this.annonces.map(annonce => ({
          ...annonce,
          titre: annonce.titre || annonce.Titre || 'Sans titre',
          prix: annonce.prix || annonce.prix_vente || 0
        }));
        
        // Afficher les 3 premières annonces pour le débogage
        if (this.annonces.length > 0) {
          console.log('Échantillon des annonces récupérées:', this.annonces.slice(0, 3));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
        this.annonces = [];
      } finally {
        this.loadingAnnonces = false;
      }
    },
    
    // Ajout d'une méthode d'actualisation spécifique
    refreshData() {
      console.log("Rafraîchissement forcé des données de mise en avant");
      this.loading = false;
      this.error = null;
      this.dataRequested = false;
      this.highlights = [];
      this.fetchHighlightData();
    },
    
    // Version corrigée de updateHighlight avec vérification sécurisée pour startsWith
    async updateHighlight(highlight) {
      if (!highlight.selectedAnnonceId) {
        console.log('Aucune annonce sélectionnée');
        return;
      }
      
      // Vérifier que highlight.id existe pour éviter les erreurs
      if (!highlight.id) {
        console.error('ID de mise en avant manquant', highlight);
        return;
      }
      
      this.saving = true;
      this.savingHighlightId = highlight.id;
      
      // Réinitialiser les messages
      const highlightIndex = this.highlights.findIndex(h => h.id === highlight.id);
      if (highlightIndex !== -1) {
        this.highlights[highlightIndex].saveMessage = null;
        this.highlights[highlightIndex].saveError = false;
      }
      
      try {
        console.log(`Mise à jour de la mise en avant ${highlight.id} avec l'annonce ${highlight.selectedAnnonceId}`);
        
        // Vérifier si l'ID est un ID fictif (créé à partir d'une commande)
        // Vérification sécurisée avec check du type et existence avant d'appeler startsWith
        const isCommandeId = highlight.id && 
                            typeof highlight.id === 'string' && 
                            highlight.id.startsWith && 
                            highlight.id.startsWith('commande-');
        if (isCommandeId) {
          // Créer une nouvelle mise en avant pour cette commande
          const newMiseEnAvant = {
            status: 'active',
            annonce: highlight.selectedAnnonceId
          };
          
          // Utiliser client ou client_id selon la structure attendue
          if (highlight.client) {
            newMiseEnAvant.client = this.effectiveUserId;
          } else {
            newMiseEnAvant.client_id = this.effectiveUserId;
          }
          
          // Ajouter les autres propriétés
          newMiseEnAvant.commande_id = this.getCommandeId(highlight);
          newMiseEnAvant.date_debut = highlight.date_debut;
          newMiseEnAvant.date_fin = highlight.date_fin;
          
          console.log('Création d\'une nouvelle mise en avant avec:', newMiseEnAvant);
          
          const response = await fetch('/api/directus/items/mise_en_avant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(newMiseEnAvant)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur de création:', errorData);
            throw new Error(`Erreur lors de la création: ${response.status}`);
          }
          
          const newHighlight = await response.json();
          console.log('Nouvelle mise en avant créée:', newHighlight);
          
          // Afficher un message de succès
          this.$emit('update-success', "Votre annonce a été mise en avant avec succès.");
          
          // Rafraîchir les données
          await this.fetchHighlightData();
        } else {
          // Mettre à jour une mise en avant existante
          console.log(`Mise à jour de mise_en_avant/${highlight.id} avec annonce: ${highlight.selectedAnnonceId}`);
          
          const response = await fetch(`/api/directus/items/mise_en_avant/${highlight.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              annonce: highlight.selectedAnnonceId
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur de mise à jour:', errorData);
            throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
          }
          
          // Mettre à jour localement
          if (highlightIndex !== -1) {
            const selectedAnnonce = this.annonces.find(a => a.id === highlight.selectedAnnonceId);
            
            // Mettre à jour l'annonce associée à la mise en avant
            this.highlights[highlightIndex].annonce = selectedAnnonce;
            
            // Afficher le message de succès
            this.highlights[highlightIndex].saveMessage = "Votre annonce mise en avant a été mise à jour avec succès.";
            
            // Émettre l'événement de succès vers le parent
            this.$emit('update-success', "Votre annonce mise en avant a été mise à jour avec succès.");
            
            // Effacer le message après 3 secondes
            setTimeout(() => {
              if (this.highlights[highlightIndex]) {
                this.highlights[highlightIndex].saveMessage = null;
              }
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        
        // Afficher le message d'erreur
        if (highlightIndex !== -1) {
          this.highlights[highlightIndex].saveMessage = "Une erreur est survenue lors de la mise à jour. Veuillez réessayer.";
          this.highlights[highlightIndex].saveError = true;
          
          // Effacer le message après 3 secondes
          setTimeout(() => {
            if (this.highlights[highlightIndex]) {
              this.highlights[highlightIndex].saveMessage = null;
              this.highlights[highlightIndex].saveError = false;
            }
          }, 3000);
        }
      } finally {
        this.saving = false;
        this.savingHighlightId = null;
      }
    },
    
    // Ouvrir le modal de sélection d'annonce
    openAnnonceSelector(highlight) {
      // Charger les annonces si nécessaire
      if (this.annonces.length === 0) {
        this.fetchAnnonces();
      }
      
      this.modal.currentHighlight = highlight;
      this.modal.show = true;
    },
    
    // Fermer le modal
    closeModal() {
      this.modal.show = false;
      this.modal.currentHighlight = null;
    },
    
    // Sélectionner une annonce dans le modal
    selectAnnonce(annonceId) {
      if (this.modal.currentHighlight) {
        this.modal.currentHighlight.selectedAnnonceId = annonceId;
      }
    },
    
    // Mise à jour de la méthode handleImageError pour utiliser une image en base64
    handleImageError(event, item) {
      console.log('Erreur de chargement d\'image pour:', item);
      
      // Image placeholder en base64 (rectangle gris avec texte)
      const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5OTk5Ij5JbWFnZSBub24gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
      
      // Utiliser l'image en base64 (ne dépend d'aucun fichier externe)
      event.target.src = placeholderImage;
      
      // Ajouter une classe pour indiquer l'erreur
      event.target.classList.add('image-error');
      
      if (item) {
        item.imageLoadError = true;
      }
    },

    // Confirmer la sélection et mettre à jour
    async confirmSelection() {
      if (!this.modal.currentHighlight || !this.modal.currentHighlight.selectedAnnonceId) {
        return;
      }
      
      // Mettre à jour la mise en avant
      await this.updateHighlight(this.modal.currentHighlight);
      
      // Fermer le modal
      this.closeModal();
    },
    
    // Récupérer l'annonce sélectionnée pour une mise en avant
    getSelectedAnnonce(highlight) {
      if (!highlight.selectedAnnonceId) return null;
      return this.annonces.find(annonce => annonce.id === highlight.selectedAnnonceId);
    },
    
    // Formater une date
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
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
    
    // Formater un prix
    formatPrice(price) {
      if (price === undefined || price === null) return 'N/A';
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(price);
    },
    
    // Formater l'ID de commande pour affichage
    formatCommandeId(commandeId) {
      if (!commandeId) return 'N/A';
      
      // Si c'est un objet, extraire l'ID correctement
      if (typeof commandeId === 'object') {
        // Format 1: { id: 'xxx' }
        if (commandeId.id) {
          return `ORD-${commandeId.id.toString().substring(0, 4)}`;
        }
        
        // Format 2: { _eq: 'xxx' } souvent utilisé dans les filtres
        if (commandeId._eq) {
          return `ORD-${commandeId._eq.toString().substring(0, 4)}`;
        }
        
        // Dernier recours: afficher l'ID de l'objet directement
        console.log('Format de commande_id non reconnu:', JSON.stringify(commandeId));
        return 'ORD-???';
      }
      
      // Si c'est une chaîne ou un nombre, le formater directement
      return `ORD-${commandeId.toString().substring(0, 4)}`;
    },

    // Obtenir l'URL d'une image
    getImageUrl(imageId) {
      if (!imageId) return null;
      
      // Si imageId est déjà un objet avec une URL
      if (typeof imageId === 'object' && imageId.url) {
        return imageId.url;
      }
      
      // Si imageId est déjà une URL complète
      if (typeof imageId === 'string' && (imageId.startsWith('http://') || imageId.startsWith('https://'))) {
        return imageId;
      }
      
      // Vérifier si nous sommes en environnement de développement
      const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      // Adapter l'URL selon l'environnement
      if (isDev) {
        return `http://localhost:8055/assets/${imageId}`;
      } else {
        // En production, utiliser le domaine actuel
        return `/api/directus/assets/${imageId}`;
      }
    },

    // Correction de la méthode getCommandeReference pour utiliser la nouvelle structure
    getCommandeReference(highlight) {
      // Si on a stocké la référence directement, l'utiliser
      if (highlight.commandeReference) {
        return highlight.commandeReference;
      }
      
      // Sinon, vérifier toutes les possibilités
      // D'après vos logs, commande_id est un objet qui contient déjà la référence
      if (highlight.commande_id && highlight.commande_id.reference) {
        return highlight.commande_id.reference;
      }
      
      // Fallbacks au cas où la structure changerait
      if (highlight.commande && highlight.commande.reference) {
        return highlight.commande.reference;
      }
      
      if (highlight.reference) {
        return highlight.reference;
      }
      
      // Si aucune référence trouvée, construire à partir de l'ID
      const id = this.getCommandeId(highlight) || '???';
      return `ORD-${id}`;
    },

    debugCommandes() {
      console.log('=== DÉBUT DU DÉBOGAGE DES COMMANDES ===');
      
      if (this.highlights && this.highlights.length > 0) {
        // Examiner la première mise en avant
        const firstHighlight = this.highlights[0];
        console.log('Structure complète de la première mise en avant:', JSON.stringify(firstHighlight, null, 2));
        
        // Examiner spécifiquement ce qui nous intéresse
        console.log('commande_id type:', typeof firstHighlight.commande_id);
        console.log('commande_id valeur:', firstHighlight.commande_id);
        console.log('commande complet:', firstHighlight.commande);
        
        if (firstHighlight.commande) {
          console.log('commande.reference:', firstHighlight.commande.reference);
        }
        
        // Si commande_id est un objet, examiner ses propriétés
        if (typeof firstHighlight.commande_id === 'object' && firstHighlight.commande_id !== null) {
          console.log('Propriétés de commande_id:', Object.keys(firstHighlight.commande_id));
          
          for (const key of Object.keys(firstHighlight.commande_id)) {
            console.log(`- ${key}:`, firstHighlight.commande_id[key]);
          }
        }
      } else {
        console.log('Aucune mise en avant disponible pour le débogage');
      }
      
      console.log('=== FIN DU DÉBOGAGE DES COMMANDES ===');
    },
    
    // Méthode utilitaire pour extraire l'ID brut d'une commande
    getRawId(highlight) {
      if (!highlight) return '???';
      
      // Si on a un ID direct, l'utiliser
      if (highlight.id && typeof highlight.id === 'string' && !highlight.id.startsWith('commande-')) {
        return highlight.id;
      }
      
      // Si on a un commande_id qui est une chaîne ou un nombre
      if (highlight.commande_id && (typeof highlight.commande_id === 'string' || typeof highlight.commande_id === 'number')) {
        return highlight.commande_id;
      }
      
      // Si commande_id est un objet
      if (highlight.commande_id && typeof highlight.commande_id === 'object') {
        // Essayer différentes propriétés
        const possibleIds = ['id', '_eq', 'commande', 'value', 'reference'];
        for (const prop of possibleIds) {
          if (highlight.commande_id[prop]) {
            return highlight.commande_id[prop];
          }
        }
        
        // Cas spécial: si on a uniquement une propriété, l'utiliser
        const keys = Object.keys(highlight.commande_id).filter(k => !k.startsWith('_'));
        if (keys.length === 1) {
          return highlight.commande_id[keys[0]];
        }
      }
      
      // Si highlight.commande existe et a un id
      if (highlight.commande && highlight.commande.id) {
        return highlight.commande.id;
      }
      
      // Dernier recours
      console.log('Impossible de trouver un ID valide pour:', highlight);
      return '???';
    }
  }
};
</script>