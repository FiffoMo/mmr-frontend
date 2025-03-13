<template>
  <div class="container mx-auto p-4">
    <div class="bg-green-100 p-6 rounded-lg max-w-md mx-auto">
      <h1 class="text-2xl font-bold text-green-800 mb-4">Paiement réussi!</h1>
      <p>Votre paiement a été traité avec succès.</p>
      <p v-if="sessionId" class="mt-2">ID de session: {{ sessionId }}</p>
      
      <div class="mt-6">
        <NuxtLink to="/stripe-simple" class="text-blue-500 hover:underline">
          Retour à la page de test
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sessionId: ''
    }
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.sessionId = urlParams.get('session_id');
  }
}
</script>