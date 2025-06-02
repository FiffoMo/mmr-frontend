<!-- pages/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ isLogin ? 'Connexion à votre compte' : (isForgotPassword ? 'Récupération de compte' : 'Créer un compte') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ isLogin ? 'Accédez à votre espace personnel' : (isForgotPassword ? 'Nous vous enverrons un lien pour réinitialiser votre mot de passe' : 'Rejoignez notre plateforme immobilière') }}
        </p>
      </div>
      
      <!-- Formulaire de connexion -->
      <form v-if="isLogin" class="mt-8 space-y-6" @submit.prevent="login">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Adresse email</label>
            <input 
              id="email-address" 
              v-model="loginForm.email" 
              name="email" 
              type="email" 
              autocomplete="email" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm" 
              placeholder="Adresse email"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input 
              id="password" 
              v-model="loginForm.password" 
              name="password" 
              type="password" 
              autocomplete="current-password" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm" 
              placeholder="Mot de passe"
            >
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input 
              id="remember-me" 
              name="remember-me" 
              type="checkbox" 
              v-model="loginForm.remember"
              class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
            >
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Se souvenir de moi
            </label>
          </div>

          <div class="text-sm">
            <a href="#" @click.prevent="showForgotPassword" class="font-medium text-cyan-600 hover:text-cyan-500">
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-70"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-cyan-500 group-hover:text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Se connecter
          </button>
        </div>
      </form>
      
      <!-- Formulaire d'inscription -->
      <form v-else-if="!isForgotPassword" class="mt-8 space-y-6" @submit.prevent="register">
        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="first-name" class="block text-sm font-medium text-gray-700">Prénom</label>
              <input 
                id="first-name" 
                v-model="registerForm.firstName" 
                type="text" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              >
            </div>
            <div>
              <label for="last-name" class="block text-sm font-medium text-gray-700">Nom</label>
              <input 
                id="last-name" 
                v-model="registerForm.lastName" 
                type="text" 
                required 
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              >
            </div>
          </div>
          
          <div>
            <label for="register-email" class="block text-sm font-medium text-gray-700">Email</label>
            <input 
              id="register-email" 
              v-model="registerForm.email" 
              type="email" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            >
          </div>
          
          <div>
            <label for="register-password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input 
              id="register-password" 
              v-model="registerForm.password" 
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
              v-model="registerForm.confirmPassword" 
              type="password" 
              required 
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            >
          </div>
          
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="terms" 
                v-model="registerForm.acceptTerms"
                type="checkbox" 
                required
                class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              >
            </div>
            <div class="ml-3 text-sm">
              <label for="terms" class="text-gray-700">
                J'accepte les <a href="/legal/cgv" class="font-medium text-cyan-600 hover:text-cyan-500">conditions générales</a> et la <a href="/legal/confidentialite" class="font-medium text-cyan-600 hover:text-cyan-500">politique de confidentialité</a>
              </label>
            </div>
          </div>
        </div>

        <div v-if="registerError" class="bg-red-50 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ registerError }}</p>
            </div>
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="registerLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-70"
          >
            <span v-if="registerLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-cyan-500 group-hover:text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Créer mon compte
          </button>
        </div>
      </form>
      
      <!-- Formulaire de récupération de mot de passe -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="requestPasswordReset">
        <div>
          <label for="reset-email" class="block text-sm font-medium text-gray-700">Adresse email</label>
          <input 
            id="reset-email" 
            v-model="resetForm.email" 
            type="email" 
            required 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            placeholder="Saisissez votre adresse email"
          >
        </div>

        <div v-if="resetSuccess" class="bg-green-50 border-l-4 border-green-400 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm text-green-700">{{ resetSuccess }}</p>
            </div>
          </div>
        </div>

        <div v-if="resetError" class="bg-red-50 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ resetError }}</p>
            </div>
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="resetLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-70"
          >
            <span v-if="resetLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-cyan-500 group-hover:text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Envoyer le lien de récupération
          </button>
        </div>
      </form>
      
      <!-- Liens de basculement entre formulaires -->
      <div class="mt-6 text-center">
        <div v-if="isLogin" class="text-sm">
          <p class="text-1xl font-extrabold text-gray-900 mb-2">Vous n'avez pas encore de compte&nbsp;?</p>
          <a href="#" @click.prevent="showRegister" class="font-medium text-cyan-600 hover:text-cyan-500">
            Créer un compte
          </a>
        </div>
        <div v-else-if="isForgotPassword" class="text-sm">
          <a href="#" @click.prevent="showLogin" class="font-medium text-cyan-600 hover:text-cyan-500">
            Retour à la connexion
          </a>
        </div>
        <div v-else class="text-sm">
          <p>Vous avez déjà un compte ?</p>
          <a href="#" @click.prevent="showLogin" class="font-medium text-cyan-600 hover:text-cyan-500">
            Se connecter
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/useAuthStore';

export default {
  data() {
    return {
      // État de l'interface
      formMode: 'login', // 'login', 'register', 'forgot'
      
      // Formulaire de connexion
      loginForm: {
        email: '',
        password: '',
        remember: false
      },
      loading: false,
      error: null,
      
      // Formulaire d'inscription
      registerForm: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
      },
      registerLoading: false,
      registerError: null,
      
      // Formulaire de récupération de mot de passe
      resetForm: {
        email: ''
      },
      resetLoading: false,
      resetError: null,
      resetSuccess: null
    };
  },
  
  computed: {
    isLogin() {
      return this.formMode === 'login';
    },
    isForgotPassword() {
      return this.formMode === 'forgot';
    }
  },
  
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  
  methods: {
    // Navigation entre les formulaires
    showLogin() {
      this.formMode = 'login';
      this.error = null;
      this.registerError = null;
      this.resetError = null;
      this.resetSuccess = null;
    },
    
    showRegister() {
      this.formMode = 'register';
      this.error = null;
      this.registerError = null;
      this.resetError = null;
      this.resetSuccess = null;
    },
    
    showForgotPassword() {
      this.formMode = 'forgot';
      this.error = null;
      this.registerError = null;
      this.resetError = null;
      this.resetSuccess = null;
      
      // Pré-remplir avec l'email de connexion si disponible
      if (this.loginForm.email) {
        this.resetForm.email = this.loginForm.email;
      }
    },
    
    // Connexion
    async login() {
      this.loading = true;
      this.error = null;
      
      try {
        await this.authStore.login(this.loginForm.email, this.loginForm.password);
        
        // Vérifier s'il y a une redirection demandée dans l'URL
        const redirect = this.$route.query.redirect;
        
        if (redirect) {
          // Rediriger vers la page d'achat ou autre page demandée
          this.$router.push(decodeURIComponent(redirect));
        } else {
          // Redirection par défaut vers le tableau de bord
          this.$router.push('/settings');
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
        this.error = error.message || 'Identifiants incorrects';
      } finally {
        this.loading = false;
      }
    },
    
    // Inscription
    async register() {
      this.registerLoading = true;
      this.registerError = null;
      
      // Vérification de la correspondance des mots de passe
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.registerError = 'Les mots de passe ne correspondent pas';
        this.registerLoading = false;
        return;
      }
      
      // Vérification de la complexité du mot de passe
      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
      if (!passwordRegex.test(this.registerForm.password)) {
        this.registerError = 'Le mot de passe ne respecte pas les critères de sécurité';
        this.registerLoading = false;
        return;
      }
      
      try {
        // Utiliser le store pour gérer l'inscription
        await this.authStore.register(
          this.registerForm.firstName,
          this.registerForm.lastName,
          this.registerForm.email,
          this.registerForm.password
        );
        
        // Vérifier s'il y a une redirection demandée dans l'URL
        const redirect = this.$route.query.redirect;
        
        if (redirect) {
          // Rediriger vers la page d'achat ou autre page demandée
          this.$router.push(decodeURIComponent(redirect));
        } else {
          // Redirection par défaut
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Erreur d\'inscription:', error);
        
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          this.registerError = 'Cette adresse email est déjà utilisée';
        } else {
          this.registerError = error.message || 'Erreur lors de la création du compte';
        }
      } finally {
        this.registerLoading = false;
      }
    },
    
    // Récupération de mot de passe
    async requestPasswordReset() {
      this.resetLoading = true;
      this.resetError = null;
      this.resetSuccess = null;
      
      try {
        // Construire l'URL de réinitialisation
        const resetUrl = `${window.location.origin}/reset-password`;
        
        // Utiliser le store pour demander une réinitialisation
        await this.authStore.requestPasswordReset(this.resetForm.email, resetUrl);
        
        this.resetSuccess = "Un email contenant les instructions pour réinitialiser votre mot de passe a été envoyé.";
      } catch (error) {
        console.error('Erreur de récupération de mot de passe:', error);
        
        // Pour des raisons de sécurité, ne pas indiquer si l'email existe ou non
        this.resetSuccess = "Si cette adresse email correspond à un compte, vous recevrez les instructions pour réinitialiser votre mot de passe.";
      } finally {
        this.resetLoading = false;
      }
    }
  }
};
</script>