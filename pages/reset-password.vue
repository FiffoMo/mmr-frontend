<!-- pages/reset-password.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Réinitialisation du mot de passe
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Créez un nouveau mot de passe pour votre compte
          </p>
        </div>
  
        <div v-if="tokenError" class="bg-red-50 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ tokenError }}</p>
              <p class="mt-2">
                <a href="/login" class="font-medium text-red-700 hover:text-red-600">
                  Retour à la page de connexion
                </a>
              </p>
            </div>
          </div>
        </div>
        
        <form v-else class="mt-8 space-y-6" @submit.prevent="resetPassword">
          <div class="space-y-4">
            <div>
              <label for="new-password" class="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
              <input 
                id="new-password" 
                v-model="form.password" 
                type="password" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              >
              <p class="mt-1 text-xs text-gray-500">Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.</p>
            </div>
            
            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input 
                id="confirm-password" 
                v-model="form.confirmPassword" 
                type="password" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              >
            </div>
          </div>
  
          <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
  
          <div v-if="success" class="bg-green-50 border-l-4 border-green-400 p-4">
            <div class="flex">
              <div class="ml-3">
                <p class="text-sm text-green-700">{{ success }}</p>
                <p class="mt-2">
                  <a href="/login" class="font-medium text-green-700 hover:text-green-600">
                    Aller à la page de connexion
                  </a>
                </p>
              </div>
            </div>
          </div>
  
          <div>
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-70"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Réinitialiser le mot de passe
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        token: null,
        form: {
          password: '',
          confirmPassword: ''
        },
        loading: false,
        error: null,
        success: null,
        tokenError: null
      };
    },
    
    mounted() {
      // Récupérer le token de réinitialisation de l'URL
      const urlParams = new URLSearchParams(window.location.search);
      this.token = urlParams.get('token');
      
      if (!this.token) {
        this.tokenError = "Token de réinitialisation manquant ou invalide. Veuillez utiliser le lien complet reçu par email.";
      }
    },
    
    methods: {
      async resetPassword() {
        this.loading = true;
        this.error = null;
        this.success = null;
        
        // Vérification de la correspondance des mots de passe
        if (this.form.password !== this.form.confirmPassword) {
          this.error = 'Les mots de passe ne correspondent pas';
          this.loading = false;
          return;
        }
        
        // Vérification de la complexité du mot de passe
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(this.form.password)) {
          this.error = 'Le mot de passe ne respecte pas les critères de sécurité';
          this.loading = false;
          return;
        }
        
        try {
          // Appel à l'API Directus pour réinitialiser le mot de passe
          const response = await fetch('/api/directus/auth/password/reset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: this.token,
              password: this.form.password
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.message || 'Erreur lors de la réinitialisation du mot de passe');
          }
          
          this.success = "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.";
          this.form.password = '';
          this.form.confirmPassword = '';
        } catch (error) {
          console.error('Erreur de réinitialisation de mot de passe:', error);
          
          if (error.message.includes('token') || error.message.includes('expired')) {
            this.error = 'Le lien de réinitialisation a expiré ou est invalide. Veuillez demander un nouveau lien.';
          } else {
            this.error = error.message || 'Une erreur est survenue lors de la réinitialisation de votre mot de passe';
          }
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>