<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Mon profil</h2>
    
    <!-- Débogage du profil -->
    <div class="bg-blue-50 p-4 mb-4 rounded-lg border border-blue-200">
      <h3 class="font-bold text-blue-800">Débogage ProfileTab</h3>
      <p>Loading: {{ loading || directusSDK?.loading }}</p>
      <p>Error: {{ error || directusSDK?.error }}</p>
      <p>Props user disponible: {{ !!user }}</p>
      <p v-if="user">Props user: {{ user.first_name }} {{ user.last_name }}</p>
      <p>Form disponible: {{ !!profileForm.first_name }}</p>
      <p v-if="profileForm.first_name">Form: {{ profileForm.first_name }} {{ profileForm.last_name }}</p>
      <button @click="fetchUserProfile" class="bg-blue-500 text-white p-2 rounded mt-2">
        Recharger le profil
      </button>
    </div>
    
    <!-- Formulaire de profil -->
    <form v-if="profileForm.first_name" @submit.prevent="saveProfile" class="space-y-6 bg-slate-200 p-6 rounded-lg border border-gray-200 shadow-sm">
      <!-- Avatar / Logo -->
      <div class="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-gray-200">
        <div class="flex-shrink-0">
          <div class="relative">
            <img 
              v-if="profileForm.avatar" 
              :src="avatarUrl" 
              alt="Avatar" 
              class="h-24 w-24 rounded-full object-cover border border-gray-200"
            />
            <div 
              v-else 
              class="h-24 w-24 rounded-full bg-white flex items-center justify-center text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <button 
              type="button"
              @click="$refs.fileInput.click()"
              class="absolute bottom-0 right-0 bg-cyan-600 text-white rounded-full p-1 hover:bg-cyan-700 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="handleFileUpload"
            />
          </div>
          <button 
            v-if="profileForm.avatar" 
            type="button"
            @click="removeAvatar"
            class="mt-2 text-xs text-gray-500 hover:text-red-600"
          >
            Supprimer l'image
          </button>
        </div>
        <div class="flex-grow">
          <h3 class="text-lg font-medium text-gray-900 mb-1">Photo de profil</h3>
          <p class="text-sm text-gray-500 mb-2">
            Cette image sera affichée sur votre profil public et vos annonces.
          </p>
          <p class="text-xs text-gray-400">
            Formats acceptés: JPG, PNG. Taille maximum: 2 Mo.
          </p>
        </div>
      </div>
      
      <!-- Informations personnelles -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Informations personnelles</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Prénom -->
          <div>
            <label for="first-name" class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input
              id="first-name"
              v-model="profileForm.first_name"
              type="text"
              required
              class="block w-full h-10 px-3 rounded-md border-gray-300 border shadow-sm bg-white focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
            />
          </div>
          
          <!-- Nom -->
          <div>
            <label for="last-name" class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              id="last-name"
              v-model="profileForm.last_name"
              type="text"
              required
              class="block w-full h-10 px-3 rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
            />
          </div>
          
          <!-- Entreprise -->
          <div class="md:col-span-2">
            <label for="company" class="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
            <input
              id="company"
              v-model="profileForm.company"
              type="text"
              class="block w-full h-10 px-3 rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
              placeholder="Nom de votre entreprise (facultatif)"
            />
          </div>
        </div>
      </div>
      
      <!-- Coordonnées -->
      <div class="space-y-4 pt-6 border-t border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Coordonnées</h3>
        
        <!-- Email -->
        <div class="space-y-2">
          <div class="flex justify-between">
            <label for="email" class="block text-sm font-medium text-gray-700">Adresse email *</label>
            <div class="flex items-center">
              <input 
                id="hide-email" 
                v-model="profileForm.hide_email" 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label for="hide-email" class="ml-2 text-xs text-gray-500">Masquer au public</label>
            </div>
          </div>
          <input
            id="email"
            v-model="profileForm.email"
            type="email"
            :required="isClient"
            class="block w-full h-10 px-3 rounded-md border-gray-300 border shadow-sm bg-white focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
          />
          <p v-if="isClient" class="mt-1 text-xs text-red-500">
            * Obligatoire pour les clients avec forfaits
          </p>
        </div>
        
        <!-- Téléphone -->
        <div class="space-y-2">
          <div class="flex justify-between">
            <label for="phone" class="block text-sm font-medium text-gray-700">Téléphone</label>
            <div class="flex items-center">
              <input 
                id="hide-phone" 
                v-model="profileForm.hide_phone" 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label for="hide-phone" class="ml-2 text-xs text-gray-500">Masquer au public</label>
            </div>
          </div>
          <input
            id="phone"
            v-model="profileForm.phone"
            type="tel"
            :required="isClient"
            class="block h-10 px-3 w-full rounded-md border-gray-300 border shadow-sm bg-white focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
            :placeholder="isClient ? 'Votre numéro de téléphone' : 'Votre numéro de téléphone (facultatif)'"
          />
          <p v-if="isClient" class="mt-1 text-xs text-red-500">
            * Obligatoire pour les clients avec forfaits
          </p>
        </div>
        
        <!-- Adresse -->
                 <div class="space-y-2">
          <div class="flex justify-between">
            <label for="address" class="block text-sm font-medium text-gray-700">Adresse</label>
            <div class="flex items-center">
              <input 
                id="hide-address" 
                v-model="profileForm.hide_address" 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label for="hide-address" class="ml-2 text-xs text-gray-500">Masquer au public</label>
            </div>
          </div>
          <textarea
            id="address"
            v-model="profileForm.address"
            rows="3"
            :required="isClient"
            class="block pt-3 px-3 w-full rounded-md border-gray-300 border shadow-sm bg-white focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
            :placeholder="isClient ? 'Votre adresse' : 'Votre adresse (facultative)'"
          ></textarea>
          <p v-if="isClient" class="mt-1 text-xs text-red-500">
            * Obligatoire pour les clients avec forfaits
          </p>
        </div>
        
        <!-- Comment me contacter -->
        <div class="space-y-2">
          <label for="contact-instructions" class="block text-sm font-medium text-gray-700">Comment me contacter ?</label>
          <textarea
            id="contact-instructions"
            v-model="profileForm.contact_instructions"
            rows="3"
            class="block pt-3 px-3 w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
            placeholder="Instructions spécifiques pour vous contacter (facultatif)"
          ></textarea>
          <p class="text-xs text-gray-500">
            Vous pouvez préciser ici vos préférences de contact (horaires, méthode privilégiée, etc.)
          </p>
        </div>
      </div>
      
      <!-- Boutons d'action -->
      <div class="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 mr-3"
        >
          Annuler
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
        >
          <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Enregistrer
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/useAuthStore';
import { useDirectusSDK } from '@/composables/useDirectusSDK';

export default {
  name: 'ProfileTab',
  
  props: {
    userId: {
      type: String,
      default: ''
    },
    user: {
      type: Object,
      default: null
    },
    userType: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update-success'],
  
  setup() {
    // Initialiser le store d'authentification
    const authStore = useAuthStore();
    
    // Initialiser le service SDK Directus
    const directusSDK = useDirectusSDK();
    
    return {
      authStore,
      directusSDK
    };
  },
  
  data() {
    return {
      loading: false,
      saving: false,
      error: null,
      
      // Formulaire de profil
      profileForm: {
        // Champs de base
        first_name: '',
        last_name: '',
        email: '',
        
        // Champs supplémentaires
        avatar: null,
        avatar_file: null, // Pour le téléchargement du fichier
        company: '',
        phone: '',
        address: '',
        contact_instructions: '',
        
        // Options de confidentialité
        hide_email: false,
        hide_phone: false,
        hide_address: false
      },
      
      // Sauvegarde du profil original pour pouvoir annuler les modifications
      originalProfile: null
    };
  },
  
  computed: {
    // URL de l'avatar (pour l'affichage)
    avatarUrl() {
      if (this.profileForm.avatar) {
        // Si c'est un ID, construire le chemin correct vers le dossier public
        const avatarId = typeof this.profileForm.avatar === 'object' 
          ? this.profileForm.avatar.id 
          : this.profileForm.avatar;
          
        return `/uploads/${avatarId}.png`;
      } else if (this.profileForm.avatar_file) {
        // Si c'est un fichier nouvellement téléchargé
        return URL.createObjectURL(this.profileForm.avatar_file);
      }
      
      return null;
    },
    
    // Détermine si l'utilisateur est un client (avec forfaits)
    isClient() {
      // Cette valeur devrait être fournie par le composant parent
      // Par défaut, on considère les userType 1 et 2 comme des clients
      return this.userType >= 1;
    }
  },
  
  mounted() {
    console.log('ProfileTab monté');
    
    // Initialiser le formulaire si l'utilisateur est disponible
    if (this.user && this.isActive) {
      console.log('Initialisation du formulaire depuis les props');
      this.initializeForm(this.user);
    } else if (this.isActive) {
      console.log('Pas d\'utilisateur dans les props, tentative de récupération');
      this.fetchUserProfile();
    }
    
    // Écouter l'événement de rechargement du profil
    window.addEventListener('refresh-profile-data', this.fetchUserProfile);
  },
  
  beforeUnmount() {
    // Nettoyer les écouteurs d'événements
    window.removeEventListener('refresh-profile-data', this.fetchUserProfile);
  },
  
  watch: {
    // Observer si l'onglet est actif
    isActive(newValue) {
      if (newValue) {
        console.log('Onglet profil activé, rechargement des données');
        this.fetchUserProfile();
      }
    },
    
    // Observer les changements dans l'utilisateur fourni par le parent
    user: {
      handler(newUser) {
        if (newUser && this.isActive && !this.loading) {
          console.log('Nouvel utilisateur reçu via props, mise à jour du formulaire');
          this.initializeForm(newUser);
        }
      },
      deep: true
    }
  },
  
  methods: {
    // Récupérer le profil utilisateur avec le SDK
    async fetchUserProfile() {
      console.log('ProfileTab: Tentative de récupération du profil utilisateur via SDK');
      this.loading = true;
      this.error = null;
      
      try {
        console.log('ProfileTab: Appel à directusSDK.getUserProfile()');
        const userData = await this.directusSDK.getUserProfile(['*', 'avatar.*']);
        
        console.log('ProfileTab: Données reçues du SDK:', userData);
        
        if (userData) {
          console.log('ProfileTab: Initialisation du formulaire avec les données reçues');
          this.initializeForm(userData);
          
          // Émettre un événement pour informer le parent que les données ont été mises à jour
          this.$emit('user-updated', userData);
        } else {
          console.log('ProfileTab: Aucune donnée utilisateur retournée');
          throw new Error('Aucune donnée utilisateur retournée');
        }
      } catch (error) {
        console.error('ProfileTab: Erreur lors de la récupération du profil via SDK:', error);
        this.error = "Impossible de charger votre profil. Veuillez réessayer.";
      } finally {
        console.log('ProfileTab: Fin du chargement, mise à jour de loading à false');
        this.loading = false;
      }
    },
    
    // Initialiser le formulaire avec les données utilisateur
    initializeForm(userData) {
      console.log('Initialisation du formulaire avec données:', userData);
      
      // Créer un nouvel objet pour éviter les références
      const formData = {
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        avatar: userData.avatar || null,
        avatar_file: null,
        company: userData.company || '',
        phone: userData.phone || '',
        address: userData.address || '',
        contact_instructions: userData.contact_instructions || '',
        hide_email: Boolean(userData.hide_email),
        hide_phone: Boolean(userData.hide_phone),
        hide_address: Boolean(userData.hide_address)
      };
      
      console.log('Données de formulaire préparées:', formData);
      
      // Assigner l'objet complet
      this.profileForm = formData;
      
      // Sauvegarder pour pouvoir annuler
      this.originalProfile = JSON.parse(JSON.stringify(formData));
      
      console.log('Formulaire initialisé avec succès');
    },
    
    // Gérer le téléchargement d'un fichier image
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Vérifier le type de fichier
      if (!file.type.match('image.*')) {
        alert('Veuillez sélectionner une image.');
        return;
      }
      
      // Vérifier la taille du fichier (2 Mo max)
      if (file.size > 2 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 2 Mo.');
        return;
      }
      
      // Stocker le fichier
      this.profileForm.avatar_file = file;
      
      // Réinitialiser l'input
      event.target.value = '';
    },
    
    // Supprimer l'avatar
    removeAvatar() {
      this.profileForm.avatar = null;
      this.profileForm.avatar_file = null;
    },
    
    // Enregistrer le profil avec le SDK
    // Méthode saveProfile() complète et corrigée pour ProfileTab.vue
    async saveProfile() {
  this.saving = true;
  
  try {
    let avatarId = this.profileForm.avatar;
    
    // Si un nouveau fichier est téléchargé, l'uploader
    if (this.profileForm.avatar_file) {
      const fileData = await this.directusSDK.uploadFile(this.profileForm.avatar_file, {
        title: `Avatar - ${this.profileForm.first_name} ${this.profileForm.last_name}`
      });
      
      // Récupérer l'ID du fichier téléchargé
      if (fileData && fileData.id) {
        avatarId = fileData.id;
      }
    }
    
    // Données à envoyer
    const userData = {
      first_name: this.profileForm.first_name,
      last_name: this.profileForm.last_name,
      email: this.profileForm.email,
      avatar: avatarId,
      company: this.profileForm.company,
      phone: this.profileForm.phone,
      address: this.profileForm.address,
      contact_instructions: this.profileForm.contact_instructions,
      hide_email: this.profileForm.hide_email,
      hide_phone: this.profileForm.hide_phone,
      hide_address: this.profileForm.hide_address
    };
    
    console.log('Mise à jour du profil avec données:', userData);
    
    // Mettre à jour le profil avec le SDK
    const result = await this.directusSDK.updateUserProfile(userData);
    
    if (result) {
      console.log('Profil mis à jour avec succès:', result);
      
      // Mettre à jour le formulaire avec les données retournées
      this.initializeForm(result);
      
      // Mettre à jour l'utilisateur dans le store d'authentification
      if (this.authStore && this.authStore.user) {
        console.log('Mise à jour du store d\'authentification');
        this.authStore.setUser(result);
      }
      
      // Notification de succès
      this.$emit('update-success', 'Votre profil a été mis à jour avec succès');
      
      // Déclencher un événement global pour informer les autres composants
      window.dispatchEvent(new CustomEvent('user-data-updated', { detail: result }));
    } else {
      console.error('Aucune donnée retournée après la mise à jour');
      throw new Error('Aucune donnée retournée après la mise à jour');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du profil:', error);
    alert('Une erreur est survenue lors de la sauvegarde de votre profil. Veuillez réessayer.');
  } finally {
    this.saving = false;
  }
},
    
    // Réinitialiser le formulaire aux valeurs d'origine
    resetForm() {
      this.profileForm = JSON.parse(JSON.stringify(this.originalProfile));
      this.profileForm.avatar_file = null; // Réinitialiser le fichier téléchargé
    }
  }
};
</script>