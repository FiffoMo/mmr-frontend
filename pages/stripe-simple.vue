<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Test Stripe Simple</h1>
    
    <div class="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 class="text-xl font-semibold mb-4">Produit test</h2>
      <p class="text-gray-700 mb-2">Prix: 10,00 €</p>
      
      <button 
        @click="handlePayment" 
        class="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600"
      >
        Payer avec Stripe
      </button>
      
      <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
      <div v-if="loading" class="mt-4 text-blue-500">Chargement...</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      error: null
    }
  },
  methods: {
    async handlePayment() {
      this.loading = true;
      this.error = null;
      
      try {
        // Appel simple à l'API
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productName: 'Test produit',
            amount: 1000
          })
        });
        
        // Ajouter des logs pour le débogage
        console.log('Statut de la réponse:', response.status);
        
        const data = await response.json();
        console.log('Données reçues:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors du paiement');
        }
        
        // Redirection vers la page de paiement Stripe
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('URL de redirection manquante');
        }
      } catch (err) {
        console.error('Erreur complète:', err);
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>