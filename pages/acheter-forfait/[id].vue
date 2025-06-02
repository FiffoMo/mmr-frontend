<!-- pages/acheter-forfait/[id].vue -->
<template>
  <div class="container mx-auto px-4 py-12">
    <div v-if="loading" class="flex justify-center">
      <div class="animate-pulse space-y-8 w-full max-w-3xl">
        <div class="bg-white rounded-lg shadow-md p-6 h-64"></div>
      </div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 p-4 rounded-lg text-red-700 max-w-3xl mx-auto">
      <p>{{ error }}</p>
      <NuxtLink to="/tarifs" class="mt-4 inline-block text-cyan-600 hover:underline">
        Retour à la page des tarifs
      </NuxtLink>
    </div>
    
    <div v-else class="max-w-3xl mx-auto">
      <!-- Étapes du processus -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">1</div>
            <div class="text-sm mt-1">Sélection</div>
          </div>
          <div class="flex-1 h-1 bg-gray-200 mx-2">
            <div class="h-full bg-cyan-500" style="width: 0%"></div>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">2</div>
            <div class="text-sm mt-1">Paiement</div>
          </div>
          <div class="flex-1 h-1 bg-gray-200 mx-2"></div>
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">3</div>
            <div class="text-sm mt-1">Confirmation</div>
          </div>
        </div>
      </div>
      
      <h1 class="text-3xl font-bold mb-6">{{ cleanedProductName }}</h1>
      
      <!-- Résumé du produit -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-4 border-b pb-4">
          <div>
            <h2 class="text-xl font-semibold">{{ getProductTitle(product) }}</h2>
          </div>
          <div class="text-2xl font-bold">{{ formatPrice(product.prix) }}</div>
        </div>
        
        <ul class="space-y-2 mb-6">
          <li v-for="(feature, index) in getFeatures(product)" :key="index" class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>{{ feature }}</span>
          </li>
        </ul>
        
        <!-- Utilisation de v-if pour éviter d'afficher des balises HTML brutes -->
        <div v-if="product.description" class="text-gray-600 border-t pt-4">
          <div v-html="sanitizedDescription"></div>
        </div>
      </div>

      <!-- Section Code Promo -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 flex items-center">
          <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
          Code promo (optionnel)
        </h2>
        
        <div class="flex gap-3 mb-4">
          <div class="flex-1">
            <input
              v-model="codePromo"
              type="text"
              placeholder="Inscrivez ici votre code promo"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              :disabled="isValidatingPromo || codePromoValide"
              @keyup.enter="validerCodePromo"
            />
            <p class="text-xs text-gray-500 mt-1">
              Entrez votre code promo pour bénéficier de votre réduction
            </p>
          </div>
          <button
            @click="validerCodePromo"
            :disabled="!codePromo.trim() || isValidatingPromo || codePromoValide"
            class="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isValidatingPromo">Vérification...</span>
            <span v-else-if="codePromoValide">✓ Appliqué</span>
            <span v-else>Appliquer</span>
          </button>
        </div>

        <!-- Message de succès -->
        <div v-if="codePromoValide" class="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div>
              <p class="text-green-800 font-medium">Code promo appliqué avec succès !</p>
              <p class="text-green-700 text-sm">
                {{ codePromoDetails.nom }} - 
                Réduction de {{ formatPrice(codePromoDetails.reduction.montant) }}
                ({{ codePromoDetails.reduction.pourcentage }}%)
              </p>
              <button
                @click="retirerCodePromo"
                class="text-green-600 hover:text-green-800 text-sm underline mt-1"
              >
                Retirer le code promo
              </button>
            </div>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div v-if="codePromoError" class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-red-800 font-medium">Erreur avec le code promo</p>
              <p class="text-red-700 text-sm">{{ codePromoError }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Récapitulatif des prix -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Récapitulatif</h2>
        
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Prix du forfait</span>
            <span class="font-medium">{{ formatPrice(product.prix) }}</span>
          </div>
          
          <div v-if="codePromoValide" class="flex justify-between items-center text-green-600">
            <span>Réduction ({{ codePromoDetails.codePromo.code }})</span>
            <span>-{{ formatPrice(codePromoDetails.reduction.montant) }}</span>
          </div>
          
          <div class="border-t pt-3 flex justify-between items-center">
            <span class="text-lg font-semibold">Total à payer</span>
            <span class="text-2xl font-bold" :class="codePromoValide ? 'text-green-600' : ''">
              {{ formatPrice(prixFinal) }}
            </span>
          </div>
          
          <div v-if="codePromoValide && codePromoDetails.reduction.pourcentage > 0" class="text-sm text-green-600 text-right">
            Vous économisez {{ codePromoDetails.reduction.pourcentage }}% !
          </div>
        </div>
      </div>
      
      <!-- Conditions -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Conditions d'utilisation</h2>
        <div class="space-y-2 text-gray-600">
          <p>En procédant à l'achat, vous acceptez nos <strong><NuxtLink to="/legal/cgv">conditions générales d'utilisation</NuxtLink></strong>.</p>
          <p v-if="product.type_produit === 'annonces'">
            Le forfait sera activé immédiatement après confirmation du paiement.
          </p>
          <p v-else-if="product.type_produit === 'publicite'">
            Après votre achat, vous pourrez configurer votre publicité et télécharger votre visuel dans votre espace client.
          </p>
          <p v-else-if="product.type_produit === 'mise_en_avant'">
            Après votre achat, vous pourrez sélectionner l'annonce à mettre en avant dans votre espace client.
          </p>
        </div>
      </div>
      
      <!-- Boutons d'action -->
      <div class="flex space-x-4">
        <NuxtLink 
          :to="product.type_produit === 'publicite' ? '/tarifs-publicite' : '/tarifs'" 
          class="px-6 py-3 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
        >
          Retour
        </NuxtLink>
        <button 
          @click="proceedToPayment" 
          class="flex-1 px-6 py-3 bg-cyan-500 text-white font-medium rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          :disabled="isProcessing"
        >
          <span v-if="isProcessing">Traitement...</span>
          <span v-else>Procéder au paiement</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/stores/useAuthStore';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const productId = route.params.id;
const loading = ref(true);
const error = ref(null);
const product = ref({});
const isProcessing = ref(false);

// Variables pour les codes promo
const codePromo = ref('');
const isValidatingPromo = ref(false);
const codePromoValide = ref(false);
const codePromoDetails = ref(null);
const codePromoError = ref('');

// Computed properties pour nettoyer le HTML
const cleanedProductName = computed(() => {
  if (!product.value.nom) return '';
  return stripHtml(product.value.nom);
});

const cleanedDescription = computed(() => {
  if (!product.value.description) return '';
  return stripHtml(product.value.description);
});

const sanitizedDescription = computed(() => {
  if (!product.value.description) return '';
  return product.value.description;
});

// Prix final après application du code promo
const prixFinal = computed(() => {
  if (codePromoValide.value && codePromoDetails.value) {
    return codePromoDetails.value.prix_final;
  }
  return product.value.prix || 0;
});

// Fonction pour supprimer les balises HTML
const stripHtml = (html) => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Format price to currency
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Gratuit';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Validation du code promo
const validerCodePromo = async () => {
  if (!codePromo.value.trim()) return;
  
  isValidatingPromo.value = true;
  codePromoError.value = '';
  
  try {
    const response = await $fetch('/api/codes-promo/valider', {
      method: 'POST',
      body: {
        code: codePromo.value.trim(),
        produitId: productId,
        clientId: authStore.user?.id
      }
    });
    
    if (response.success) {
      codePromoValide.value = true;
      codePromoDetails.value = response.data;
    } else {
      codePromoError.value = response.error;
    }
  } catch (err) {
    console.error('Erreur validation code promo:', err);
    codePromoError.value = err.data?.message || 'Erreur lors de la validation du code promo';
  } finally {
    isValidatingPromo.value = false;
  }
};

// Retirer le code promo
const retirerCodePromo = () => {
  codePromo.value = '';
  codePromoValide.value = false;
  codePromoDetails.value = null;
  codePromoError.value = '';
};

// Get dimensions pour les publicités
const getDimensions = (emplacement) => {
  const dimensions = {
    'home_top': '1030×200 px',
    'home_footer': '1030×200 px',
    'inside_footer': '1030×200 px',
    'article_right_top': '320×320 px',
    'article_right_bottom': '320×640 px',
    'annonce_sidebar_top': '320×320 px',
    'annonce_sidebar_bottom': '320×6400 px'
  };
  
  return dimensions[emplacement] || '320×320 px';
};

// Get features based on product type
const getFeatures = (product) => {
  if (product.features) {
    try {
      if (typeof product.features === 'string') {
        return JSON.parse(product.features);
      }
      if (Array.isArray(product.features)) {
        return product.features;
      }
    } catch (err) {
      console.error('Erreur lors du parsing des caractéristiques:', err);
    }
  }
  
  const productType = product.type_produit || '';
  const nom = (product.nom || '').toLowerCase();
  
  if (productType === 'annonces') {
    if (nom.includes('basic')) {
      return [
        '1 annonce',
        'Visible pendant 60 jours',
        'Jusqu\'à 15 photos',
        'Affichage du potentiel locatif',
        'Renouvellement facile'
      ];
    } else if (nom.includes('dixit')) {
      return [
        '10 annonces',
        'Visible pendant 60 jours',
        'Jusqu\'à 15 photos',
        'Affichage du potentiel locatif',
        'Renouvellement facile'
      ];
    } else if (nom.includes('premium')) {
      return [
        '25 annonces',
        'Visible pendant 60 jours',
        'Jusqu\'à 15 photos',
        'Affichage du potentiel locatif',
        'Renouvellement facile'
      ];
    }
  } else if (productType === 'publicite') {
    return [
      `Emplacement: ${product.emplacement || 'Non spécifié'}`,
      `Durée: ${product.duree_jours || 90} jours`,
      'Visibilité optimale',
      'Support au format image',
      'Statistiques de performance'
    ];
  } else if (productType === 'mise_en_avant') {
    return [
      'En première page du site "Coup de Coeur !"',
      'En début de la catégorie choisie',
      'Affichage aléatoire dans la sidebar',
      `Visibilité garantie pendant ${product.duree_jours || 20} jours`
    ];
  }
  
  return ['Produit personnalisé'];
};

// Get product title
const getProductTitle = (product) => {
  const productType = product.type_produit || '';
  
  if (productType === 'annonces') return 'Forfait annonces';
  if (productType === 'publicite') return 'Espace publicitaire';
  if (productType === 'mise_en_avant') return 'Option de mise en avant';
  
  return 'Produit';
};

// Proceed to payment - version mise à jour avec code promo
const proceedToPayment = async () => {
  try {
    isProcessing.value = true;
    
    const userId = authStore.user?.id;
    
    if (!userId) {
      throw new Error('Vous devez être connecté pour effectuer un achat');
    }
    
    // Créer le payload pour Stripe
    const paymentData = {
      productId: productId,
      productType: product.value.type_produit || 'annonces',
      userId: userId,
      emplacement: product.value.emplacement
    };
    
    // Ajouter les informations du code promo si applicable
    if (codePromoValide.value && codePromoDetails.value) {
      paymentData.codePromo = {
        id: codePromoDetails.value.codePromo.id,
        code: codePromoDetails.value.codePromo.code,
        montantReduction: codePromoDetails.value.reduction.montant,
        prixFinal: codePromoDetails.value.prix_final
      };
    }
    
    // Créer une session de paiement Stripe
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la création de la session de paiement');
    }
    
    const { sessionUrl } = await response.json();
    
    // Redirect to Stripe Checkout
    window.location.href = sessionUrl;
  } catch (err) {
    console.error('Erreur lors du traitement du paiement:', err);
    error.value = `Une erreur est survenue: ${err.message}`;
  } finally {
    isProcessing.value = false;
  }
};

onMounted(async () => {
  // Vérifier si l'utilisateur est connecté
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { 
        redirect: route.fullPath,
        source: 'direct_purchase',
        productId: route.params.id
      }
    });
    return;
  }
  
  try {
    // Fetch product details
    const response = await fetch(`/api/directus/items/produits/${productId}?fields=*`);
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du produit: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.data) {
      product.value = data.data;
    } else {
      throw new Error('Impossible de trouver ce produit');
    }
  } catch (err) {
    console.error('Erreur lors du chargement du produit:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>