<!-- components/stripe/CheckoutButton.vue -->
<template>
  <div class="stripe-checkout">
    <button 
      class="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 disabled:bg-gray-400"
      :disabled="loading" 
      @click="createCheckoutSession"
    >
      {{ loading ? 'Redirection...' : 'Payer maintenant' }}
    </button>
    <div v-if="error" class="text-red-500 mt-2">{{ error }}</div>
  </div>
</template>

<script>
export default {
  props: {
    productName: {
      type: String,
      default: 'Produit test'
    },
    productDescription: {
      type: String,
      default: 'Description du produit test'
    },
    amount: {
      type: Number,
      default: 1000 // 10 EUR en centimes
    },
    successUrl: {
      type: String,
      default: null
    },
    cancelUrl: {
      type: String,
      default: null
    }
  },
  
  data() {
    return {
      loading: false,
      error: null
    }
  },
  
  methods: {
    async createCheckoutSession() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productName: this.productName,
            productDescription: this.productDescription,
            amount: this.amount,
            successUrl: this.successUrl,
            cancelUrl: this.cancelUrl
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la création du paiement');
        }
        
        console.log('Redirection vers Stripe:', data.url);
        
        // Rediriger vers la page de paiement Stripe
        window.location.href = data.url;
      } catch (error) {
        this.error = error.message;
        console.error('Erreur de paiement:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>