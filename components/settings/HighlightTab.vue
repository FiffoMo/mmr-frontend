<!-- components/settings/HighlightTab.vue -->
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
          
          <a href="/tarifs" class="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-6 rounded-md transition-colors mb-6">
            Découvrir nos forfaits
          </a>
          
          <p class="text-sm text-gray-400">
            Votre mise en avant ne s'affiche pas ? <a href="mailto:sav@ma-maison-rapporte.fr" class="text-cyan-600 hover:underline">Contactez le SAV</a>
          </p>
        </div>
      </div>
      
      <!-- Liste des mises en avant actives -->
      <div v-else-if="highlights.length > 0" class="space-y-8">
        <!-- Section pour chaque mise en avant -->
        <div v-for="highlight in highlights" :key="highlight.id" class="space-y-6 bg-slate-200 p-6 rounded-lg border border-gray-200 shadow-sm">
          <!-- En-tête avec info sur la commande -->
          <div :class="highlight.isExpired ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-green-50 border-green-200 text-green-700'" class="px-4 py-3 rounded mb-6 border">
            <div class="flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
              <div>
                <p class="font-medium">
                  Forfait Mise en Avant - N° commande {{ highlight.commande?.reference || highlight.commande?.id || highlight.commande_id || "N/A" }}
                </p>
                <p class="text-sm" v-if="!highlight.isExpired">
                  Actif jusqu'au {{ formatDate(highlight.date_expiration || highlight.date_fin) }}
                </p>
                <p class="text-sm" v-else>
                  Expiré le {{ formatDate(highlight.date_expiration || highlight.date_fin) }}
                </p>
              </div>
              <div v-if="!highlight.isExpired" class="bg-white px-3 py-1 rounded-full text-green-800 text-sm font-medium">
                {{ highlight.daysLeft }} jours restants
              </div>
              <div v-else class="bg-white px-3 py-1 rounded-full text-yellow-800 text-sm font-medium">
                Expiré
              </div>
            </div>
          </div>
          
          <!-- Contenu de la mise en avant: choix de l'annonce -->
          <div v-if="!highlight.isExpired">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Choisir l'annonce à mettre en avant</h3>
            
            <div v-if="loadingAnnonces" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500 mb-2"></div>
              <p class="text-gray-600 text-sm">Chargement de vos annonces...</p>
            </div>
            
            <div v-else-if="annonces.length === 0" class="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded mb-6">
              <p class="font-medium">Aucune annonce disponible</p>
              <p class="text-sm">Vous n'avez pas d'annonces actives à mettre en avant.</p>
            </div>
            
            <div v-else>
              <div class="mb-4">
                <label :for="'annonce-select-' + highlight.id" class="block text-sm font-medium text-gray-700 mb-1">
                  Sélectionnez l'annonce à mettre en avant
                </label>
                <select
                  :id="'annonce-select-' + highlight.id"
                  v-model="highlight.selectedAnnonceId"
                  class="block w-full h-10 px-3 rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                >
                  <option v-for="annonce in annonces" :key="annonce.id" :value="annonce.id">
                    {{ annonce.titre }} - {{ formatPrice(annonce.prix) }}
                  </option>
                </select>
              </div>
              
              <!-- Aperçu de l'annonce sélectionnée -->
              <div v-if="getSelectedAnnonce(highlight)" class="bg-white p-4 rounded-md border border-gray-200 mb-4">
                <h4 class="text-md font-medium text-gray-900 mb-2">Aperçu de l'annonce sélectionnée</h4>
                <div class="flex items-center">
                  <div class="w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-3">
                    <img 
                      v-if="getSelectedAnnonce(highlight).image_principale" 
                      :src="getImageUrl(getSelectedAnnonce(highlight).image_principale)" 
                      alt="Image" 
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ getSelectedAnnonce(highlight).titre }}</p>
                    <p class="text-sm text-gray-500">{{ getSelectedAnnonce(highlight).localisation }}</p>
                    <p class="text-md font-medium text-cyan-600">{{ formatPrice(getSelectedAnnonce(highlight).prix) }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Message de sauvegarde -->
            <div v-if="highlight.saveMessage" class="mt-4" :class="highlight.saveError ? 'text-red-600' : 'text-green-600'">
              {{ highlight.saveMessage }}
            </div>
            
            <!-- Boutons d'action -->
            <div class="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="updateHighlight(highlight)"
                :disabled="saving || !highlight.selectedAnnonceId || highlight.selectedAnnonceId === highlight.annonce?.id"
                class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center disabled:opacity-50"
              >
                <svg v-if="savingHighlightId === highlight.id" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mettre à jour
              </button>
            </div>
          </div>
          
          <!-- Message pour les mises en avant expirées -->
          <div v-else class="mt-4 text-center">
            <p class="text-gray-600">Cette mise en avant a expiré. Pour renouveler ce service, contactez l'administrateur.</p>
            <button 
              @click="renewHighlight(highlight.id)" 
              class="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-md"
            >
              Renouveler
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
        
        // Ajouter un drapeau pour suivre si les données ont été demandées
        dataRequested: false
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
      // Écouter l'événement de rafraîchissement
      window.addEventListener('refresh-highlight-data', this.fetchHighlightData);
      
      // Charger les données si l'onglet est actif
      if (this.isActive && !this.dataRequested) {
        this.fetchHighlightData();
      }
    },
    
    beforeUnmount() {
      // Nettoyer l'écouteur d'événement
      window.removeEventListener('refresh-highlight-data', this.fetchHighlightData);
    },
    
    methods: {
      // Récupérer les données de mise en avant avec gestion de timeout
      async fetchHighlightData() {
        this.loading = true;
        this.error = null;
        this.dataRequested = true;
        
        // Ajouter un timeout pour éviter l'attente infinie
        const timeout = setTimeout(() => {
          if (this.loading) {
            this.loading = false;
            this.highlights = []; // Forcer un tableau vide
            console.log('Timeout atteint lors du chargement des mises en avant');
          }
        }, 5000); // 5 secondes de timeout
        
        try {
          // Vérifier si nous avons un ID utilisateur
          if (!this.effectiveUserId) {
            console.error('ID utilisateur non disponible');
            this.error = "Impossible de charger vos données: utilisateur non identifié.";
            clearTimeout(timeout);
            this.loading = false;
            return;
          }
          
          console.log('Chargement des données de mise en avant pour l\'utilisateur:', this.effectiveUserId);
          
          // Utiliser le SDK pour récupérer les données de mise en avant avec client_id au lieu de user_created
          const result = await this.directusSDK.getUserHighlights();
          
          // Si getUserHighlights() échoue, essayer avec getItems en utilisant client_id
          if (!result || !Array.isArray(result) || result.length === 0) {
            console.log('Aucun résultat avec getUserHighlights, essai avec getItems');
            try {
              const fallbackResult = await this.directusSDK.getItems('mise_en_avant', {
                filter: { client_id: { _eq: this.effectiveUserId } },
                fields: '*,annonce.*,commande.*'
              });
              
              if (fallbackResult && Array.isArray(fallbackResult) && fallbackResult.length > 0) {
                console.log('Données récupérées avec client_id:', fallbackResult);
                processHighlightsData(fallbackResult);
                return;
              }
            } catch (fallbackError) {
              console.error('Erreur avec la requête de secours:', fallbackError);
            }
          }
          
          console.log('Données de mise en avant récupérées:', result);
          
          // Traiter les données récupérées
          processHighlightsData(result);
          
        } catch (error) {
          console.error('Erreur lors du chargement des mises en avant:', error);
          this.error = "Impossible de charger vos données de mise en avant. Veuillez réessayer.";
          // Important: initialiser explicitement à un tableau vide en cas d'erreur
          this.highlights = [];
          
          // Annuler le timeout puisque nous avons une erreur
          clearTimeout(timeout);
        } finally {
          // S'assurer que loading est toujours mis à false
          this.loading = false;
        }
        
        // Fonction interne pour traiter les données de mise en avant
        async function processHighlightsData(data) {
          // Annuler le timeout puisque nous avons une réponse
          clearTimeout(timeout);
          
          // Initialiser highlights comme un tableau vide par défaut
          this.highlights = [];
          
          // Vérifier explicitement si le résultat est un tableau et s'il contient des éléments
          if (data && Array.isArray(data) && data.length > 0) {
            const highlightsWithDetails = [];
            
            for (const highlight of data) {
              try {
                // Récupérer les détails de la commande séparément si nécessaire
                let commandeDetails = highlight.commande || null;
                if (!commandeDetails && highlight.commande_id) {
                  commandeDetails = await this.directusSDK.getItem('commandes', highlight.commande_id);
                }
                
                // Récupérer les détails de l'annonce séparément si nécessaire
                let annonceDetails = highlight.annonce || null;
                if (!annonceDetails && highlight.annonce_id) {
                  annonceDetails = await this.directusSDK.getItem('annonces', highlight.annonce_id);
                }
                
                // Vérifier si la mise en avant est expirée
                const isExpired = highlight.date_fin ? new Date(highlight.date_fin) < new Date() : false;
                
                // Calculer le nombre de jours restants
                const daysLeft = isExpired ? 0 : this.getRemainingDays(highlight.date_fin);
                
                highlightsWithDetails.push({
                  ...highlight,
                  commande: commandeDetails || { id: highlight.commande_id },
                  annonce: annonceDetails || null,
                  isExpired,
                  daysLeft,
                  selectedAnnonceId: highlight.annonce || null,
                  date_expiration: highlight.date_fin, // Pour compatibilité avec le template
                  saveMessage: null,
                  saveError: false
                });
              } catch (error) {
                console.error('Erreur lors de la récupération des détails de la mise en avant:', error);
              }
            }
            
            this.highlights = highlightsWithDetails;
            
            // Si on a des mises en avant actives, charger les annonces disponibles
            if (this.highlights.some(h => !h.isExpired)) {
              this.fetchAnnonces();
            }
          } else {
            // Important: initialiser explicitement à un tableau vide
            console.log('Aucune donnée de mise en avant trouvée');
            this.highlights = [];
          }
        }
      },

      // Récupérer les annonces disponibles
      async fetchAnnonces() {
        this.loadingAnnonces = true;
        
        try {
          // Utiliser le SDK Directus pour récupérer les annonces avec client_id
          const result = await this.directusSDK.getUserListings();
          
          if (result && Array.isArray(result)) {
            // Filtrer pour n'avoir que les annonces publiées
            this.annonces = result.filter(annonce => 
              annonce.status === 'active' || annonce.status === 'published'
            );
          } else {
            // Fallback avec fetch direct
            const fallbackResult = await this.directusSDK.getItems('annonces', {
              filter: {
                client_id: { _eq: this.effectiveUserId },
                status: { _in: ['active', 'published'] }
              },
              fields: ['*', 'image_principale.*']
            });
            
            this.annonces = fallbackResult || [];
          }
        } catch (error) {
          console.error('Erreur lors du chargement des annonces:', error);
          this.annonces = [];
        } finally {
          this.loadingAnnonces = false;
        }
      },
      
      // Mettre à jour l'annonce mise en avant
      async updateHighlight(highlight) {
        if (!highlight.selectedAnnonceId || !highlight.id) return;
        
        this.saving = true;
        this.savingHighlightId = highlight.id;
        
        // Réinitialiser les messages
        const highlightIndex = this.highlights.findIndex(h => h.id === highlight.id);
        if (highlightIndex !== -1) {
          this.highlights[highlightIndex].saveMessage = null;
          this.highlights[highlightIndex].saveError = false;
        }
        
        try {
          // Utiliser le SDK Directus pour mettre à jour la mise en avant
          // Utiliser "annonce" au lieu de "annonce_id"
          await this.directusSDK.updateItem('mise_en_avant', highlight.id, {
            annonce: highlight.selectedAnnonceId
          });
          
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
      
      // Renouveler une mise en avant expirée
      renewHighlight(highlightId) {
        // Cette fonction pourrait rediriger vers une page de paiement
        // ou envoyer une demande à l'administrateur
        alert("Fonctionnalité de renouvellement à implémenter. Contactez l'administrateur.");
      },
      
      // Récupérer l'annonce sélectionnée pour une mise en avant
      getSelectedAnnonce(highlight) {
        if (!highlight.selectedAnnonceId) return null;
        return this.annonces.find(annonce => annonce.id === highlight.selectedAnnonceId);
      },
      
      // Formater une date
      formatDate(dateString) {
        if (!dateString) return '';
        
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
        if (price === undefined || price === null) return '';
        
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0
        }).format(price);
      },
      
      // Obtenir l'URL d'une image
      getImageUrl(imageId) {
        if (!imageId) return null;
        return `/api/directus/assets/${imageId}`;
      }
    }
  };
  </script>