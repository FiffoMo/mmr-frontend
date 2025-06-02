<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête de page -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        <template v-if="isExtendMode">Prolonger la publicité</template>
        <template v-else>{{ isEditMode ? 'Modifier la publicité' : 'Créer une nouvelle publicité' }}</template>
      </h1>
      <p class="mt-2 text-sm text-gray-600">
        <template v-if="isExtendMode">Définissez une nouvelle période pour continuer à diffuser votre publicité</template>
        <template v-else>{{ isEditMode ? 'Modifiez votre publicité existante' : 'Créez une nouvelle publicité pour promouvoir votre activité' }}</template>
      </p>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      <p class="mt-4 text-gray-600">{{ isEditMode ? 'Chargement de la publicité...' : 'Initialisation...' }}</p>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-600">{{ error }}</p>
          <p class="mt-2 text-xs text-red-500">
            <button @click="goBack" class="font-medium underline">Retour</button>
          </p>
        </div>
      </div>
    </div>

    <!-- Formulaire -->
    <form v-else @submit.prevent="saveAd" class="bg-white shadow-md rounded-lg p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Informations générales -->
        <div class="md:col-span-2">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Informations générales</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Titre -->
            <div class="col-span-2">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Titre de la publicité *</label>
              <input
                id="title"
                v-model="adData.titre"
                type="text"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="Ex: Promotion exceptionnelle sur nos biens"
            />
          </div>

          <!-- URL de destination -->
          <div class="col-span-2">
            <label for="url" class="block text-sm font-medium text-gray-700 mb-1">URL de destination *</label>
            <input
              id="url"
              v-model="adData.url"
              type="url"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              placeholder="https://www.exemple.fr/ma-page"
            />
            <p class="mt-1 text-xs text-gray-500">L'adresse vers laquelle les visiteurs seront redirigés en cliquant sur votre publicité.</p>
          </div>

          <!-- Emplacement - Affichage en lecture seule -->
          <div>
  <label class="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
  <div class="block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-gray-600 sm:text-sm">
    {{ adData.emplacement || 'À déterminer' }} ({{ getLocationLabel(adData.emplacement) }})
  </div>
</div>
          <!-- Statut - Limité à Actif/Suspendu -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
            <select
              id="status"
              v-model="adData.status"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspendue</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class="md:col-span-2">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Image de la publicité</h2>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
          <!-- Prévisualisation de l'image -->
          <div v-if="imagePreview" class="mb-4 relative">
            <img :src="imagePreview" alt="Prévisualisation" class="max-h-48 max-w-full rounded-md" />
            <button
              @click="removeImage"
              class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 -mt-2 -mr-2"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Zone de glisser-déposer -->
          <div v-if="!imagePreview" class="w-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="mt-1 text-sm text-gray-600">
              Glissez et déposez une image, ou 
              <label for="file-upload" class="text-cyan-600 hover:text-cyan-800 cursor-pointer">
                parcourez vos fichiers
              </label>
            </p>
            <p class="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 5MB</p>
          </div>

          <input
            id="file-upload"
            type="file"
            class="hidden"
            accept="image/*"
            @change="handleImageUpload"
          />

          <div v-if="!imagePreview" class="mt-4">
            <button
              type="button"
              @click="triggerFileInput"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Sélectionner une image
            </button>
          </div>
        </div>
        <p v-if="!adData.image && !imageFile && isEditMode" class="mt-2 text-sm text-red-500">
          Image requise. Veuillez télécharger une image pour votre publicité.
        </p>
      </div>

      <!-- Durée et prix - En lecture seule -->
      <div class="md:col-span-2">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Durée et tarification</h2>
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Date de début -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <div class="block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-gray-600 sm:text-sm">
                {{ formatDate(adData.date_debut) }}
              </div>
            </div>

            <!-- Durée en jours -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Durée</label>
              <div class="block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-gray-600 sm:text-sm">
                {{ adData.duree }} jours
              </div>
            </div>

            <!-- Prix -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prix</label>
              <div class="block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-gray-600 sm:text-sm">
                {{ formatPrice(adData.prix) }}
              </div>
            </div>
            
            <!-- Date de fin (calculée) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <div class="block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-gray-600 sm:text-sm">
                {{ getCalculatedEndDate() }}
              </div>
            </div>
            
            <!-- Information sur la commande liée, si présente -->
            <div v-if="adData.commande_id" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Commande associée</label>
              <div class="block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md shadow-sm text-gray-600 sm:text-sm">
                #{{ commandeDetails?.reference || `CMD-${adData.commande_id}` }}
              </div>
            </div>
          </div>
          
          <p class="mt-3 text-xs text-gray-500 italic">
            Ces informations sont définies lors de l'achat de votre forfait et ne peuvent pas être modifiées.
          </p>
        </div>
      </div>
    </div>

    <!-- Boutons d'action -->
    <div class="mt-8 flex justify-end space-x-4">
      <button
        type="button"
        @click="goBack"
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
      >
        Annuler
      </button>
      <button
        type="submit"
        :disabled="saving"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 inline-flex items-center disabled:opacity-50"
      >
        <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <template v-if="isExtendMode">Prolonger la publicité</template>
        <template v-else>{{ isEditMode ? 'Enregistrer les modifications' : 'Créer la publicité' }}</template>
      </button>
    </div>
  </form>

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
import { useDirectusSDK } from '@/composables/useDirectusSDK';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'PubliciteModifier',
  
  setup() {
    const directusSDK = useDirectusSDK();
    const authStore = useAuthStore();
    const route = useRoute();
    const router = useRouter();
    
    return {
      directusSDK,
      authStore,
      route,
      router
    };
  },
  
  data() {
    return {
      adData: {
        titre: '',
        url: '',
        emplacement: '',
        status: 'active', // Default est maintenant 'active' au lieu de 'draft'
        date_debut: this.formatDateForInput(new Date()),
        duree: '30',
        prix: 0,
        image: null,
        client_id: '',
        commande_id: null // Champ pour lier à la commande
      },
      commandeDetails: null, // Pour stocker les détails de la commande liée
      imageFile: null,
      imagePreview: null,
      loading: false,
      saving: false,
      error: null,
      notification: {
        show: false,
        message: '',
        timer: null
      }
    };
  },
  
  computed: {
    isEditMode() {
      return !!this.route.query.id;
    },
    
    isExtendMode() {
      return this.route.query.extend === 'true';
    },
    
    // Nouveau computed pour savoir si on est en mode création depuis une commande
    isOrderLinkedMode() {
      return !!this.route.query.commande_id;
    },
    
    adId() {
      return this.route.query.id;
    },
    
    // Nouveau computed pour récupérer l'ID de la commande
    commandeId() {
      return this.route.query.commande_id;
    }
  },
  
  async mounted() {
    // Définir l'ID client
    this.adData.client_id = this.authStore.clientId;
    
    // Si un ID de commande est fourni, récupérer les détails de la commande
    if (this.isOrderLinkedMode) {
      this.loading = true;
      try {
        // NOUVEAU: Vérifier si des paramètres supplémentaires sont fournis dans l'URL
        const urlEmplacement = this.route.query.emplacement;
        const urlDuree = this.route.query.duree;
        const urlTypeProduit = this.route.query.type_produit;
        
        // Si ces paramètres sont présents, les utiliser directement sans requête DB
        if (urlEmplacement || urlDuree || urlTypeProduit) {
          console.log('Paramètres trouvés dans l\'URL:', {
            emplacement: urlEmplacement,
            duree: urlDuree,
            type_produit: urlTypeProduit
          });
          
          // Préparer un objet commandeDetails minimal
          this.commandeDetails = {
            id: this.commandeId,
            status: 'active',
            montant: 0,
            produit: {
              nom: 'Forfait publicité',
              emplacement: urlEmplacement || 'inside_footer',
              duree_jours: urlDuree || 30,
              type_produit: urlTypeProduit || 'publicité'
            }
          };
          
          // Appliquer ces valeurs directement
          this.initializeAdDataFromOrder();
        } else {
          // Sinon, récupérer normalement depuis la base de données
          await this.fetchOrderDetails();
          this.initializeAdDataFromOrder();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails de la commande:', error);
        this.error = "Impossible de charger les détails de la commande. Veuillez réessayer.";
        
        // NOUVEAU: Malgré l'erreur, initialiser avec des valeurs par défaut
        this.initializeAdDataFromOrder();
      } finally {
        this.loading = false;
      }
    }
    // Sinon, si en mode édition, récupérer les détails de la publicité
    else if (this.isEditMode) {
      this.loading = true;
      try {
        await this.fetchAd();
        
        // Si le mode de prolongation est activé, mettre à jour les dates automatiquement
        if (this.isExtendMode) {
          // Définir la date de début à aujourd'hui
          this.adData.date_debut = this.formatDateForInput(new Date());
          
          // Afficher un message pour indiquer que la publicité sera prolongée
          this.showNotification('Mode prolongation activé - Veuillez confirmer les nouvelles dates.');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la publicité:', error);
        this.error = "Impossible de charger la publicité. Veuillez réessayer.";
      } finally {
        this.loading = false;
      }
    }
  },
  
  beforeUnmount() {
    if (this.notification.timer) {
      clearTimeout(this.notification.timer);
    }
  },
  
  methods: {
    // Nouvelle méthode pour afficher la date de fin calculée
    getCalculatedEndDate() {
      if (!this.adData.date_debut || !this.adData.duree) return 'Non définie';
      
      try {
        // Convertir la chaîne de date en objet Date
        const start = new Date(this.adData.date_debut);
        
        // Ajouter le nombre de jours spécifié dans durée
        const end = new Date(start);
        end.setDate(start.getDate() + Number(this.adData.duree));
        
        // Formater la date pour l'affichage
        return this.formatDate(end);
      } catch (error) {
        console.error('Erreur lors du calcul de la date de fin:', error);
        return 'Erreur de calcul';
      }
    },

    isAdProduct(produit) {
      if (!produit) return false;
      
      // Vérifier le type_produit
      if (produit.type_produit && produit.type_produit.toLowerCase().includes('publicité')) {
        return true;
      }
      
      // Vérifier le nom du produit pour des mots-clés
      if (produit.nom && (
        produit.nom.toLowerCase().includes('pub') || 
        produit.nom.toLowerCase().includes('bannière') ||
        produit.nom.toLowerCase().includes('banniere') ||
        produit.nom.toLowerCase().includes('affichage')
      )) {
        return true;
      }
      
      // Vérifier l'emplacement (s'il existe, c'est probablement un produit publicitaire)
      if (produit.emplacement) {
        return true;
      }  
    },
       
    // Méthode améliorée pour récupérer les détails de la commande
    async fetchOrderDetails() {
      try {
        // Vérification préliminaire
        if (!this.commandeId) {
          throw new Error('ID de commande non spécifié');
        }

        console.log(`Tentative de récupération de la commande ${this.commandeId}`);

        // Récupérer les données de base de la commande
        const response = await fetch(`/api/directus/items/commandes/${this.commandeId}?fields=id,produit,status,montant,reference,type_produit`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.data) {
          throw new Error('Aucune donnée reçue pour cette commande');
        }
        
        const commande = data.data;
        console.log('Données de base de la commande récupérées:', commande);
        
        // Si produit est présent, essayer de le récupérer
        let produitData = null;
        if (commande.produit) {
          try {
            // Récupérer uniquement les données du produit dont nous avons besoin
            const produitResponse = await fetch(`/api/directus/items/produits/${commande.produit}?fields=id,nom,emplacement,type_produit,duree_jours`, {
              credentials: 'include'
            });
            
            if (produitResponse.ok) {
              const produitResult = await produitResponse.json();
              if (produitResult && produitResult.data) {
                produitData = produitResult.data;
                console.log('Produit associé récupéré:', produitData);
                
                // NOUVEAU: Vérifier si c'est un produit publicitaire avec notre fonction helper
                const isPubliciteProduct = this.isAdProduct(produitData);
                console.log('Est-ce un produit publicitaire?', isPubliciteProduct);
                
                if (isPubliciteProduct) {
                  // Si c'est un produit publicitaire, annuler tout message d'erreur précédent
                  this.error = null;
                } else {
                  // Si ce n'est pas un produit publicitaire, définir le message d'erreur
                  this.error = "Cette commande ne correspond pas à un forfait publicité.";
                  console.warn("Commande non-publicitaire détectée, mais on continue avec des valeurs par défaut");
                }
              }
            }
          } catch (produitError) {
            console.error('Erreur lors de la récupération des détails du produit:', produitError);
          }
        }
        
        // IMPORTANT: Si l'emplacement n'est pas défini, essayer de le définir manuellement
        if (produitData && !produitData.emplacement) {
          console.warn("Emplacement non trouvé, définition manuelle");
          
          // NOUVEAU: Essayer de deviner l'emplacement d'après d'autres attributs
          if (produitData.nom) {
            const nom = produitData.nom.toLowerCase();
            if (nom.includes('pied') || nom.includes('footer')) {
              produitData.emplacement = 'inside_footer';
              console.log('Emplacement défini selon le nom à: inside_footer');
            } else if (nom.includes('entête') || nom.includes('header')) {
              produitData.emplacement = 'home_top';
              console.log('Emplacement défini selon le nom à: home_top');
            } else if (nom.includes('article')) {
              produitData.emplacement = 'article_right_top';
              console.log('Emplacement défini selon le nom à: article_right_top');
            } else if (nom.includes('annonce') || nom.includes('sidebar')) {
              produitData.emplacement = 'annonce_sidebar_top';
              console.log('Emplacement défini selon le nom à: annonce_sidebar_top');
            } else {
              // Valeur par défaut
              produitData.emplacement = 'inside_footer';
              console.log('Emplacement défini par défaut à: inside_footer');
            }
          } else {
            // Valeur par défaut
            produitData.emplacement = 'inside_footer';
            console.log('Emplacement défini par défaut à: inside_footer');
          }
        }
        
        // Création de l'objet commandeDetails
        this.commandeDetails = {
          ...commande,
          produit: produitData || {
            nom: 'Forfait publicité',
            emplacement: 'inside_footer', // Valeur par défaut
            duree_jours: 30
          }
        };
        
        // IMPORTANT: Vérification finale de l'emplacement
        if (this.commandeDetails.produit && !this.commandeDetails.produit.emplacement) {
          console.warn("Emplacement toujours non trouvé après multiples tentatives, définition manuelle");
          this.commandeDetails.produit.emplacement = 'inside_footer';
        }
        
        return this.commandeDetails;
      } catch (error) {
        console.error('Erreur principale:', error);
        
        // Solution de secours
        this.commandeDetails = {
          id: this.commandeId,
          status: 'active',
          montant: 0,
          reference: `CMD-${this.commandeId}`,
          produit: {
            nom: 'Forfait publicité',
            emplacement: 'inside_footer',
            duree_jours: 30
          }
        };
        
        return this.commandeDetails;
      }
    },

    // Méthode mise à jour pour initialiser les données de publicité
    initializeAdDataFromOrder() {
      if (!this.commandeDetails) {
        // Valeurs par défaut
        this.adData.commande_id = this.commandeId;
        this.adData.prix = 0;
        this.adData.duree = '30';
        this.adData.emplacement = 'inside_footer';
        
        this.showNotification('Création de publicité avec des valeurs par défaut');
        return;
      }
      
      // Associer l'ID de la commande
      this.adData.commande_id = this.commandeDetails.id;
      
      // Définir le prix à partir de la commande
      if (this.commandeDetails.montant) {
        this.adData.prix = this.commandeDetails.montant;
      }
      
      // Définir la durée à partir du produit associé
      if (this.commandeDetails.produit && this.commandeDetails.produit.duree_jours) {
        this.adData.duree = this.commandeDetails.produit.duree_jours.toString();
      } else {
        this.adData.duree = '30'; // Valeur par défaut
      }
      
      // IMPORTANT: Définir l'emplacement à partir du produit
      if (this.commandeDetails.produit && this.commandeDetails.produit.emplacement) {
        const produitEmplacement = this.commandeDetails.produit.emplacement;
        console.log(`★★★ Utilisation de l'emplacement du produit: "${produitEmplacement}"`);
        
        // Assigner directement sans traitement
        this.adData.emplacement = produitEmplacement;
      } else {
        console.warn("Emplacement non trouvé dans le produit, utilisation d'une valeur par défaut");
        this.adData.emplacement = 'inside_footer';
        
        // Afficher un message pour l'utilisateur
        this.showNotification('Emplacement par défaut utilisé: Pied de page interne');
      }
      
      // Date de début = aujourd'hui par défaut
      this.adData.date_debut = this.formatDateForInput(new Date());
      
      // Si le titre du produit existe, l'utiliser comme suggestion pour le titre de la publicité
      if (this.commandeDetails.produit && this.commandeDetails.produit.nom) {
        this.adData.titre = `Publicité: ${this.commandeDetails.produit.nom}`;
      }
      
      // Message pour l'utilisateur
      if (this.error) {
        // Si une erreur existe mais qu'on continue quand même
        this.showNotification('Création avec des paramètres par défaut - Vous pouvez continuer');
      } else {
        this.showNotification('Création de publicité associée à votre commande');
      }
    },
    
    // Récupérer les données de la publicité
    async fetchAd() {
      try {
        const ad = await this.directusSDK.getItem('publicite', this.adId);
        
        if (!ad) {
          throw new Error('Publicité non trouvée');
        }
        
        console.log('Données de publicité récupérées:', ad); // Pour debug
        
        // Mettre à jour les données du formulaire
        this.adData = {
          titre: ad.titre || '',
          url: ad.url || '',
          emplacement: ad.emplacement || '', // Assurer que l'emplacement est correctement récupéré
          status: ad.status || 'active',
          date_debut: this.formatDateForInput(ad.date_debut ? new Date(ad.date_debut) : new Date()),
          duree: ad.duree ? ad.duree.toString() : '30',
          prix: ad.prix || 0,
          image: ad.image || null,
          client_id: this.authStore.clientId,
          commande_id: ad.commande_id || null
        };
        
        // Si une commande est associée, récupérer ses détails
        if (ad.commande_id) {
          try {
            await this.fetchOrderDetails(ad.commande_id);
          } catch (error) {
            console.warn('Impossible de récupérer les détails de la commande associée, mais l\'édition peut continuer', error);
          }
        }
        
        // Si une image existe, configurer la prévisualisation
        if (ad.image) {
          this.imagePreview = this.getImageUrl(ad.image);
        }
        
      } catch (error) {
        console.error('Erreur lors de la récupération de la publicité:', error);
        throw error;
      }
    },
    
    // Enregistrer la publicité
    async saveAd() {
      this.error = null;
      this.saving = true;
      
      try {
        // Valider les données
        if (!this.adData.titre || !this.adData.url) {
          throw new Error('Veuillez remplir tous les champs obligatoires');
        }
        
        if (!this.imageFile && !this.adData.image) {
          throw new Error('Veuillez sélectionner une image pour votre publicité');
        }
        
        // Si une nouvelle image a été téléchargée, l'uploader d'abord
        if (this.imageFile) {
          try {
            const uploadedFile = await this.uploadImage();
            if (!uploadedFile || !uploadedFile.id) {
              throw new Error('Échec du téléchargement de l\'image');
            }
            this.adData.image = uploadedFile.id;
          } catch (imageError) {
            console.error('Erreur lors du téléchargement de l\'image:', imageError);
            throw new Error('Échec du téléchargement de l\'image. Veuillez réessayer.');
          }
        }
        
        // CORRECTION: Eviter les champs qui causent des erreurs 403
        const dataToSave = {
          titre: this.adData.titre,
          url: this.adData.url,
          status: this.adData.status,
          image: this.adData.image,
          client_id: this.authStore.clientId,
          emplacement: this.adData.emplacement,
          date_debut: this.formatDateForMySQL(new Date(this.adData.date_debut)),
          duree: parseInt(this.adData.duree),
          prix: this.adData.prix
        };
        
        // Calculer la date de fin si possible
        if (this.adData.date_debut && this.adData.duree) {
          dataToSave.date_fin = this.calculateEndDate(this.adData.date_debut, this.adData.duree);
        }
        
        // IMPORTANT: N'inclure commande_id que si on est en mode création et qu'il existe
        if (!this.isEditMode && this.commandeId) {
          try {
            dataToSave.commande_id = this.commandeId;
            dataToSave.commande = this.commandeId; // Au cas où l'API s'attend à ce nom
            console.log('Ajout du commande_id:', this.commandeId);
          } catch (error) {
            console.warn('Impossible d\'ajouter les champs de commande:', error);
          }
        }
        
        console.log('Données à enregistrer:', dataToSave);
        
        // En mode édition
        if (this.isEditMode) {
          // En mode édition, ne pas inclure client_id pour éviter l'erreur 403
          delete dataToSave.client_id;
          
          try {
            await this.directusSDK.updateItem('publicite', this.adId, dataToSave);
          } catch (error) {
            console.error('Erreur lors de la mise à jour avec SDK:', error);
            
            // Fallback: essayer avec fetch direct
            const response = await fetch(`/api/directus/items/publicite/${this.adId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(dataToSave)
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error('Erreur lors de la mise à jour via fetch:', errorData);
              throw new Error(`Erreur lors de la mise à jour: ${errorData?.errors?.[0]?.message || response.statusText}`);
            }
          }
        } else {
          // En mode création
          try {
            await this.directusSDK.createItem('publicite', dataToSave);
          } catch (error) {
            console.error('Erreur lors de la création avec SDK:', error);
            
            // Fallback: essayer avec fetch direct
            const response = await fetch('/api/directus/items/publicite', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify(dataToSave)
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error('Erreur lors de la création via fetch:', errorData);
              throw new Error(`Erreur lors de la création: ${errorData?.errors?.[0]?.message || response.statusText}`);
            }
          }
        }
        
        // Message de succès adapté selon le mode
        if (this.isExtendMode) {
          this.showNotification('Publicité prolongée avec succès');
        } else if (this.isEditMode) {
          this.showNotification('Publicité mise à jour avec succès');
        } else if (this.isOrderLinkedMode) {
          this.showNotification('Publicité créée avec succès pour votre commande');
        } else {
          this.showNotification('Publicité créée avec succès');
        }
        
        // Déclencher un événement pour rafraîchir la liste des publicités
        window.dispatchEvent(new CustomEvent('refresh-ads-data'));
        
        // Rafraîchir également les commandes pour mettre à jour l'état des boutons
        window.dispatchEvent(new CustomEvent('refresh-orders-data'));
        
        // Rediriger vers la liste des publicités après un court délai
        setTimeout(() => {
          this.goBack();
        }, 1500);
        
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la publicité:', error);
        this.error = error.message || 'Une erreur est survenue. Veuillez réessayer.';
      } finally {
        this.saving = false;
      }
    },
    
    // Gérer le téléchargement d'image
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Vérifier le type et la taille du fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        this.error = "Type de fichier non pris en charge. Utilisez JPG, PNG ou GIF.";
        return;
      }
      
      if (file.size > maxSize) {
        this.error = "L'image est trop volumineuse. La taille maximale est de 5MB.";
        return;
      }
      
      this.imageFile = file;
      this.error = null;
      
      // Créer une URL pour la prévisualisation
      this.imagePreview = URL.createObjectURL(file);
    },
    
    // Déclencher l'input de fichier
    triggerFileInput() {
      document.getElementById('file-upload').click();
    },
    
    // Supprimer l'image
    removeImage() {
      this.imageFile = null;
      this.imagePreview = null;
      this.adData.image = null;
      
      // Réinitialiser l'input de fichier
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    },
    
    // Formater une date pour l'affichage
    formatDate(date) {
      if (!date) return 'Non définie';
      
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Date invalide';
      
      // Format: JJ/MM/AAAA
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    
    // Formater une date pour l'input date HTML
    formatDateForInput(date) {
      if (!date) return '';
      
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    },
    
    // Formater une date pour MySQL
    formatDateForMySQL(date) {
      if (!date) return null;
      
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    
    // Calculer la date de fin à partir de la date de début et de la durée
    calculateEndDate(startDate, duration) {
      if (!startDate || !duration) return null;
      
      try {
        // Convertir la chaîne de date en objet Date
        const start = new Date(startDate);
        
        // Ajouter le nombre de jours spécifié dans durée
        const end = new Date(start);
        end.setDate(start.getDate() + Number(duration));
        
        // Formater la date pour MySQL
        return this.formatDateForMySQL(end);
      } catch (error) {
        console.error('Erreur lors du calcul de la date de fin:', error);
        return null;
      }
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
    
    // Uploader une image
    // Dans modifier.vue, modifiez la méthode uploadImage pour corriger l'erreur de téléchargement

    // Remplacez la méthode uploadImage existante dans votre fichier par celle-ci :

    async uploadImage() {
      if (!this.imageFile) {
        throw new Error('Aucun fichier image sélectionné');
      }
      
      console.log("Tentative d'upload direct avec la méthode de createAnnonce");
      
      try {
        // Créer un FormData
        const formData = new FormData();
        formData.append('file', this.imageFile);
        formData.append('type', this.imageFile.type || 'image/jpeg');
        formData.append('title', this.imageFile.name || `Publicité: ${this.adData.titre || 'Sans titre'}`);
        formData.append('filename_download', this.imageFile.name || 'publicite.jpg');
        formData.append('storage', 'local');
        
        console.log(`Tentative d'upload direct pour l'image`, this.imageFile.name);
        
        // Définir l'URL Directus en fonction de l'environnement
        const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
        const directusUrl = isDev ? 'http://localhost:8055' : '/api/directus';
        
        // Upload direct vers Directus avec token d'authentification
        const uploadResponse = await fetch(`${directusUrl}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer Qqq_txN484Kd4C8_pQajEDBl4xqmG3vr`
          },
          body: formData
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error(`Erreur ${uploadResponse.status} lors de l'upload:`, errorText);
          throw new Error(`Échec de l'upload: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        const result = await uploadResponse.json();
        console.log("Résultat de l'upload:", result);
        
        if (result.data && result.data.id) {
          const fileId = result.data.id;
          console.log(`ID de fichier obtenu: ${fileId}`);
          return { id: fileId };
        } else {
          console.error("La réponse ne contient pas d'ID de fichier:", result);
          throw new Error("La réponse de l'API ne contient pas l'ID de l'image.");
        }
      } catch (error) {
        console.error('Erreur complète lors de l\'upload de l\'image:', error);
        throw new Error(`Échec de l'upload de l'image: ${error.message}`);
      }
    },
    
    // Afficher une notification
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
    
    // Obtenir le label de l'emplacement avec support des nouveaux formats
    getLocationLabel(location) {
      // Log pour diagnostiquer les problèmes
      console.log('Demande de label pour l\'emplacement:', location);
      
      const locationLabels = {
        // Nouveaux emplacements (valeurs en minuscules)
        'home_top': 'Haut de la page d\'accueil',
        'home_footer': 'Pied de page d\'accueil',
        'inside_footer': 'Pied de page interne',
        'article_right_top': 'Haut de colonne droite d\'article',
        'article_right_bottom': 'Bas de colonne droite d\'article',
        'annonce_sidebar_top': 'Haut de colonne d\'annonce',
        'annonce_sidebar_bottom': 'Bas de colonne d\'annonce',
        
        // Anciennes valeurs (pour compatibilité)
        'homepage': 'Page d\'accueil',
        'search_results': 'Résultats de recherche', 
        'listing_page': 'Page d\'annonce',
        'sidebar': 'Barre latérale',
        'footer': 'Pied de page',
        'header': 'En-tête'
      };
      
      // Si on a un label, l'utiliser, sinon retourner la valeur brute
      const label = locationLabels[location];
      console.log('Label trouvé:', label || 'Non trouvé dans le dictionnaire');
      
      return label || location || 'Non défini';
    },
    
    // Formater un prix en euros
    formatPrice(price) {
      if (price === undefined || price === null) return '0,00 €';
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    },
    
    // Revenir à la page précédente en tenant compte du contexte
    goBack() {
      try {
        console.log('Mode de création:', {
          isOrderLinkedMode: this.isOrderLinkedMode,
          isEditMode: this.isEditMode,
          route: this.route.path
        });
        
        // Si on vient de la liste des commandes
        if (this.isOrderLinkedMode) {
          // CORRECTION: Vérifier si la route existe avant de rediriger
          if (this.$router.hasRoute('/dashboard/settings')) {
            this.router.push('/dashboard/settings?tab=orders');
          } else {
            // Chercher dans l'historique de navigation
            if (window.history.length > 1) {
              this.router.go(-1); // Revenir à la page précédente
            } else {
              // Fallback: essayer plusieurs routes possibles
              const possibleRoutes = [
                '/dashboard/settings?tab=orders', 
                '/settings?tab=orders',
                '/profile?tab=orders',
                '/dashboard',
                '/'
              ];
              
              for (const route of possibleRoutes) {
                if (this.$router.hasRoute(route.split('?')[0])) {
                  console.log('Route trouvée:', route);
                  this.router.push(route);
                  return;
                }
              }
              
              // Dernier recours: rediriger vers la racine
              this.router.push('/');
            }
          }
        } else {
          // Si on vient de la liste des publicités
          if (this.$router.hasRoute('/dashboard/settings')) {
            this.router.push('/dashboard/settings?tab=ads');
          } else if (this.$router.hasRoute('/settings')) {
            this.router.push('/settings?tab=ads');
          } else {
            // Chercher dans l'historique
            if (window.history.length > 1) {
              this.router.go(-1);
            } else {
              // Dernier recours
              this.router.push('/');
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la redirection:', error);
        
        // En cas d'erreur, essayer de revenir à la racine
        try {
          this.router.push('/');
        } catch (finalError) {
          console.error('Impossible de rediriger:', finalError);
          // Redirection JavaScript en dernier recours
          window.location.href = '/';
        }
      }
    }
  }
};
</script>