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

      <!-- Formulaire de réinitialisation -->
      <form v-if="!success" class="mt-8 space-y-6" @submit.prevent="resetPassword">
        <div class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <input 
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              placeholder="Entrez votre nouveau mot de passe"
            >
            <p class="mt-1 text-xs text-gray-500">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.
            </p>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input 
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              placeholder="Confirmez votre nouveau mot de passe"
            >
          </div>
        </div>

        <!-- Messages d'erreur -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Bouton de soumission -->
        <div>
          <button 
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-70"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Réinitialiser le mot de passe
          </button>
        </div>
      </form>

      <!-- Message de succès -->
      <div v-else class="mt-8 text-center">
        <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm text-green-700">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
            </div>
          </div>
        </div>
        
        <NuxtLink 
          to="/login" 
          class="font-medium text-cyan-600 hover:text-cyan-500"
        >
          Aller à la page de connexion
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        password: '',
        confirmPassword: ''
      },
      loading: false,
      error: null,
      success: false,
      token: null,
      email: null
    };
  },
  
  mounted() {
    // Récupérer le token et l'email depuis l'URL
    this.token = this.$route.query.token;
    this.email = this.$route.query.email;
    
    console.log('🔍 Page reset-password montée avec:', {
      hasToken: !!this.token,
      email: this.email
    });
    
    // Vérifier que nous avons les paramètres nécessaires
    if (!this.token || !this.email) {
      this.error = 'Lien de réinitialisation invalide ou expiré';
      return;
    }
    
    // Valider le token au chargement de la page
    this.validateToken();
  },
  
  methods: {
    async validateToken() {
      try {
        console.log('🔍 Validation du token de réinitialisation...');
        
        // CORRECTION: Utiliser notre API personnalisée
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: this.token,
            email: this.email
          })
        });
        
        const result = await response.json();
        
        if (!result.valid) {
          this.error = result.message || 'Token invalide ou expiré';
          console.error('❌ Token invalide:', result);
        } else {
          console.log('✅ Token valide');
        }
      } catch (error) {
        console.error('Erreur lors de la validation du token:', error);
        this.error = 'Erreur lors de la validation du lien';
      }
    },
    
    async resetPassword() {
      this.loading = true;
      this.error = null;
      
      try {
        // Validation des mots de passe
        if (this.form.password !== this.form.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        
        if (this.form.password.length < 8) {
          throw new Error('Le mot de passe doit contenir au moins 8 caractères');
        }
        
        // Vérification de la complexité
        const hasUppercase = /[A-Z]/.test(this.form.password);
        const hasLowercase = /[a-z]/.test(this.form.password);
        const hasNumber = /[0-9]/.test(this.form.password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(this.form.password);
        
        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
          throw new Error('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial');
        }
        
        console.log('🔄 Envoi de la réinitialisation...');
        
        // CORRECTION: Utiliser notre API personnalisée au lieu du proxy Directus
        const response = await fetch('/api/auth/reset-password-confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: this.token,
            email: this.email,
            password: this.form.password
          })
        });
        
        console.log('Statut réponse reset:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.statusMessage || 'Erreur lors de la réinitialisation');
        }
        
        const result = await response.json();
        console.log('✅ Réinitialisation réussie:', result);
        
        this.success = true;
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>