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
        
        <h1 class="text-3xl font-bold mb-6">{{ product.nom }}</h1>
        
        <!-- Résumé du produit -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <div class="flex justify-between items-center mb-4 border-b pb-4">
            <div>
              <h2 class="text-xl font-semibold">{{ getProductTitle(product) }}</h2>
              <p class="text-gray-600">{{ product.description || 'Produit Ma-Maison-Rapporte' }}</p>
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
          
          <!-- Informations spécifiques aux publicités -->
          <div v-if="product.type_produit === 'publicite'" class="border-t pt-4 mb-4">
            <h3 class="font-medium mb-2">Dimensions recommandées</h3>
            <p class="text-gray-600">
              {{ getDimensions(product.emplacement) || '1030×200 pixels' }}
            </p>
          </div>
          
          <div v-if="product.description" class="text-gray-600 border-t pt-4">
            <div v-html="product.description"></div>
          </div>
        </div>
        
        <!-- Conditions -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold mb-4">Conditions d'utilisation</h2>
          <div class="space-y-2 text-gray-600">
            <p>En procédant à l'achat, vous acceptez nos conditions générales d'utilisation.</p>
            <p v-if="product.type_produit === 'annonces'">
              Le forfait sera activé immédiatement après confirmation du paiement.
            </p>
            <p v-else-if="product.type_produit === 'publicite'">
              Après votre achat, vous pourrez configurer votre publicité et télécharger votre visuel dans votre espace client.
            </p>
            <p v-else-if="product.type_produit === 'mise_en_avant'">
              Après votre achat, vous pourrez sélectionner l'annonce à mettre en avant dans votre espace client.
            </p>
            <p>Une facture vous sera envoyée par email.</p>
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
  import { ref, onMounted } from 'vue';
  
  const route = useRoute();
  const router = useRouter();
  
  const productId = route.params.id;
  const loading = ref(true);
  const error = ref(null);
  const product = ref({});
  const isProcessing = ref(false);
  
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
  
  // Get dimensions pour les publicités
  const getDimensions = (emplacement) => {
    const dimensions = {
      'HOME_TOP': '1030×200 px',
      'HOME_FOOTER': '1030×200 px',
      'INSIDE_FOOTER': '980×120 px',
      'ARTICLE_RIGHT_TOP': '278×90 px',
      'ARTICLE_RIGHT_BOTTOM': '278×90 px',
      'ANNONCE_SIDEBAR_TOP': '310×90 px',
      'ANNONCE_SIDEBAR_BOTTOM': '330×90 px'
    };
    
    return dimensions[emplacement] || '300×250 px';
  };
  
  // Get features based on product type
  const getFeatures = (product) => {
    // Si le produit a un champ features qui est un tableau ou une chaîne JSON
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
    
    // Déterminer le type de produit
    const productType = product.type_produit || '';
    const nom = (product.nom || '').toLowerCase();
    
    // Caractéristiques par défaut selon le type de produit
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
  
  // Proceed to payment - version simplifiée pour les tests
  const proceedToPayment = async () => {
    try {
      isProcessing.value = true;
      
      // Utiliser un ID utilisateur fictif pour les tests
      const testUserId = '1';
      
      // Créer une session de paiement Stripe
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          productType: product.value.type_produit || 'annonces',
          userId: testUserId
        })
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