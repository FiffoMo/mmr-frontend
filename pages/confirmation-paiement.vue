<!-- pages/confirmation-paiement.vue -->
<template>
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-3xl mx-auto">
        <div v-if="loading" class="text-center py-16">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          <p class="mt-4 text-gray-600">Vérification de votre paiement...</p>
        </div>
        
        <div v-else-if="error" class="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{{ error }}</p>
          <NuxtLink to="/tarifs" class="mt-4 inline-block text-cyan-600 hover:underline">
            Retour à la page des tarifs
          </NuxtLink>
        </div>
        
        <div v-else-if="paymentSuccessful" class="text-center py-8">
          <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 class="text-3xl font-bold mb-2">Paiement réussi !</h1>
          <p class="text-gray-600 mb-8">Merci pour votre achat. Votre commande est maintenant active.</p>
          
          <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Récapitulatif de votre commande</h2>
            
            <div class="border-b pb-4 mb-4">
              <div class="flex justify-between mb-2">
                <span class="font-medium">Produit</span>
                <span>{{ orderDetails.productName || 'Produit inconnu' }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="font-medium">Montant</span>
                <span>{{ formatPrice(orderDetails.amount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Référence</span>
                <span>{{ orderDetails.orderId || 'N/A' }}</span>
              </div>
            </div>
            
            <p class="text-gray-600 mb-4">
              Une confirmation a été envoyée à l'adresse email associée à votre compte.
            </p>
            
            <div class="text-center">
              <NuxtLink 
                :to="getSettingsUrl(orderDetails.productType)" 
                class="inline-block px-6 py-3 bg-cyan-500 text-white font-medium rounded-md hover:bg-cyan-600"
              >
                Gérer mes produits
              </NuxtLink>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <div class="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          
          <h1 class="text-3xl font-bold mb-2">Paiement en cours de traitement</h1>
          <p class="text-gray-600 mb-4">Votre paiement est en cours de traitement. Nous vous tiendrons informé par email.</p>
          
          <div class="flex justify-center mt-6">
            <NuxtLink 
              to="/settings?tab=orders" 
              class="px-6 py-3 bg-cyan-500 text-white font-medium rounded-md hover:bg-cyan-600"
            >
              Voir mes commandes
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const route = useRoute();
  const loading = ref(true);
  const error = ref(null);
  const paymentSuccessful = ref(false);
  const orderDetails = ref({});
  
  const getSettingsUrl = (productType) => {
    switch (productType) {
      case 'annonces':
        return '/settings?tab=annonces';
      case 'publicite':
        return '/settings?tab=publicites';
      case 'mise_en_avant':
        return '/settings?tab=annonces'; // Les mises en avant se gèrent dans l'onglet annonces
      default:
        return '/settings'; // Page des paramètres par défaut
    }
  };

  // Format price to currency
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price/100); // Stripe returns amounts in cents
  };
  
  // Vérifie le statut du paiement
  const verifyPayment = async (sessionId) => {
    try {
      // Appel à l'API pour vérifier le paiement
      const response = await fetch(`/api/stripe/verify-payment?session_id=${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la vérification du paiement');
      }
  
      const data = await response.json();
      
      if (data.status === 'success') {
        paymentSuccessful.value = true;
        orderDetails.value = {
          productName: data.productName,
          amount: data.amount,
          orderId: data.orderId,
          productType: data.productType
        };
      } else {
        error.value = data.message || 'Le paiement n\'a pas pu être vérifié.';
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du paiement:', err);
      error.value = `Une erreur est survenue: ${err.message}`;
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(async () => {
    // Get session ID from query parameters
    const sessionId = route.query.session_id;
    
    if (!sessionId) {
      error.value = 'Session de paiement invalide ou expirée.';
      loading.value = false;
      return;
    }
    
    // Vérifier le paiement
    await verifyPayment(sessionId);
  });
  </script>