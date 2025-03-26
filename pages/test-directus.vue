<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Test Connexion Directus</h1>
    
    <div class="flex space-x-4 mb-4">
      <button @click="testDirectusApi" class="bg-blue-500 text-white px-4 py-2 rounded">
        Tester API Directus
      </button>
    </div>
    
    <div v-if="loading" class="p-4 bg-gray-100 rounded">
      Chargement en cours...
    </div>
    
    <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded mb-4">
      {{ error }}
    </div>
    
    <div v-if="data" class="mt-4">
      <h2 class="text-xl font-semibold mb-2">Données récupérées:</h2>
      <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-96">{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      error: null,
      data: null
    }
  },
  methods: {
    async testDirectusApi() {
      this.loading = true;
      this.error = null;
      this.data = null;
      
      try {
        // Test avec users/me
        const response = await fetch('/api/directus/users/me');
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        this.data = await response.json();
        console.log('Données reçues:', this.data);
      } catch (error) {
        console.error('Erreur:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>