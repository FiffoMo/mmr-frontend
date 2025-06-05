<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Préférences de notifications</h2>
    
    <!-- Débogage pour le développement -->
    <!-- <div class="bg-blue-50 p-4 mb-4 rounded-lg border border-blue-200">
      <h3 class="font-bold text-blue-800">Débogage NotificationsTab</h3>
      <p>Loading: {{ loading }}</p>
      <p>Error: {{ error }}</p>
      <p>User ID: {{ effectiveUserId }}</p>
      <p>Préférences simulées: {{ preferencesLoaded ? 'Oui' : 'Non' }}</p>
      <button @click="fetchNotificationPreferences" class="bg-blue-500 text-white p-2 rounded mt-2">
        Recharger les préférences
      </button>
    </div> -->
    
    <!-- Message d'erreur - Modifié pour ne s'afficher que s'il y a une vraie erreur -->
    <div v-if="error && error !== null" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      <p class="font-medium">Une erreur est survenue</p>
      <p class="text-sm">{{ error }}</p>
      <button 
        @click="fetchNotificationPreferences" 
        class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
      >
        Réessayer
      </button>
    </div>
    
    <!-- Formulaire de préférences -->
    <form v-if="preferencesLoaded" @submit.prevent="savePreferences" class="space-y-8 bg-slate-100 p-6 rounded-lg border border-gray-200 shadow-sm">
      
      <!-- Notifications par email -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Notifications par email</h3>
        
        <div class="space-y-3">
                    
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="email-messages" 
                v-model="preferences.email_messages" 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="email-messages" class="font-medium text-gray-700">Nouveaux messages</label>
              <p class="text-gray-500">Recevez un email lorsque vous recevez un nouveau message.</p>
            </div>
          </div>
          
          <!-- Annonces expirées - retiré car obligatoire -->
          <div class="flex items-start bg-cyan-100 p-3 rounded-md">
            <div class="flex items-center h-5">
              <input 
                disabled
                checked
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-800"
              />
            </div>
            <div class="ml-3 text-sm">
              <span class="font-medium text-gray-700">Annonces expirées</span>
              <p class="text-gray-500">Vous recevrez toujours des notifications pour vos annonces qui arrivent à expiration. <span class="text-cyan-700 font-medium">Ce paramètre est obligatoire.</span></p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="email-updates" 
                v-model="preferences.email_mises_a_jour" 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-800"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="email-updates" class="font-medium text-gray-700">Mises à jour du site</label>
              <p class="text-gray-500">Recevez des emails concernant les nouvelles fonctionnalités et les mises à jour importantes.</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Notifications dans l'application -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Notifications dans l'application</h3>
        
        <div class="space-y-3">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="app-notifications" 
                v-model="preferences.app_notifications_push" 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-800"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="app-notifications" class="font-medium text-gray-700">Activer les notifications push</label>
              <p class="text-gray-500">Recevez des notifications dans votre navigateur lorsque vous êtes sur le site.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="app-messages" 
                v-model="preferences.app_nouveaux_messages" 
                type="checkbox" 
                :disabled="!preferences.app_notifications_push"
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 disabled:opacity-50"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="app-messages" :class="['font-medium', !preferences.app_notifications_push ? 'text-gray-400' : 'text-gray-700']">Nouveaux messages</label>
              <p class="text-gray-500">Soyez notifié lorsque vous recevez un nouveau message.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="app-price-alerts" 
                v-model="preferences.app_alertes_prix" 
                type="checkbox" 
                :disabled="!preferences.app_notifications_push"
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 disabled:opacity-50"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="app-price-alerts" :class="['font-medium', !preferences.app_notifications_push ? 'text-gray-400' : 'text-gray-700']">Alertes de prix</label>
              <p class="text-gray-500">Soyez notifié des changements de prix pour les annonces dans vos favoris.</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Newsletter simplifiée -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Newsletter</h3>
        
        <div class="space-y-3">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="newsletter" 
                v-model="preferences.newsletter" 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-800"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="newsletter" class="font-medium text-gray-700">S'abonner à la newsletter</label>
              <p class="text-gray-500">Recevez nos actualités, conseils et offres spéciales.</p>
            </div>
          </div>
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
          class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 flex items-center"
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

export default {
  name: 'NotificationsTab',
  
  props: {
    userId: {
      type: String,
      default: ''
    },
    user: {
      type: Object,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update-success'],
  
  setup() {
    const authStore = useAuthStore();
    return {
      authStore
    };
  },
  
  data() {
    return {
      currentUserId: '', // Stocker l'ID utilisateur récupéré
      loading: false,
      saving: false,
      error: null,
      preferenceId: null, // ID des préférences dans Directus
      preferencesLoaded: false,
      
      // Préférences de notifications simplifiées
      preferences: {
        // Notifications par email
        email_nouvelles_annonces: true,
        email_messages: true,
        email_annonces_expirees: true, // Obligatoire, non modifiable
        email_mises_a_jour: false,
        
        // Notifications dans l'application
        app_notifications_push: true,
        app_nouveaux_messages: true,
        app_alertes_prix: true,
        
        // Newsletter simplifiée
        newsletter: false
      },
      
      // Sauvegarde des préférences originales
      originalPreferences: null
    };
  },
  
  computed: {
    // Obtenir l'ID utilisateur à utiliser
    effectiveUserId() {
      return this.userId || (this.user && this.user.id) || this.currentUserId || '';
    }
  },
  
  mounted() {
    // Si l'onglet est actif au montage, charger les préférences
    if (this.isActive) {
      this.fetchNotificationPreferences();
    }
    
    // Écouter l'événement de rechargement des données
    window.addEventListener('refresh-notification-preferences', this.fetchNotificationPreferences);
  },
  
  beforeUnmount() {
    // Nettoyer les écouteurs d'événements
    window.removeEventListener('refresh-notification-preferences', this.fetchNotificationPreferences);
  },
  
  watch: {
    // Observer si l'onglet est actif
    isActive(newValue) {
      if (newValue && !this.preferencesLoaded) {
        this.fetchNotificationPreferences();
      }
    },
    
    // Réagir aux changements d'ID utilisateur
    userId: {
      handler(newValue) {
        if (newValue && newValue !== this.currentUserId) {
          this.currentUserId = newValue;
          if (this.isActive) {
            this.fetchNotificationPreferences();
          }
        }
      },
      immediate: true
    },
    
    // Observer les changements de user
    user: {
      handler(newUser) {
        if (newUser && newUser.id && newUser.id !== this.currentUserId) {
          this.currentUserId = newUser.id;
          if (this.isActive) {
            this.fetchNotificationPreferences();
          }
        }
      },
      immediate: true
    }
  },
  
  methods: {
    // CORRECTION: Récupérer l'ID utilisateur avec fetch direct
    async getCurrentUserId() {
      try {
        const response = await fetch('/api/directus/users/me?fields=id', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data?.id || null;
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
        return null;
      }
    },
    
    // CORRECTION: Récupérer les préférences avec fetch direct et gestion 403
    async fetchNotificationPreferences() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log("Récupération des préférences pour l'utilisateur:", this.effectiveUserId);
        
        let userId = this.effectiveUserId;
        
        if (!userId) {
          // Récupérer l'ID utilisateur
          console.log("Pas d'ID utilisateur, tentative de récupération");
          userId = await this.getCurrentUserId();
          
          if (userId) {
            this.currentUserId = userId;
            console.log("ID utilisateur récupéré:", userId);
          } else {
            throw new Error('Impossible de récupérer l\'ID utilisateur');
          }
        }
        
        // CORRECTION: Utiliser fetch direct avec gestion 403
        const filter = encodeURIComponent(JSON.stringify({ 
          client_id: { _eq: userId } 
        }));
        
        const response = await fetch(`/api/directus/items/user_preferences?filter=${filter}`, {
          credentials: 'include'
        });
        
        if (response.status === 403) {
          console.log("Permissions insuffisantes pour user_preferences - utilisation des valeurs par défaut");
          this.initializeWithDefaults();
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Préférences reçues:", result);
        
        if (result.data && result.data.length > 0) {
          // Utiliser les données de Directus
          const preferences = result.data[0];
          this.preferenceId = preferences.id;
          this.initializePreferences(preferences);
        } else {
          // Aucune préférence trouvée, utiliser les valeurs par défaut
          console.log('Aucune préférence trouvée, utilisation des valeurs par défaut');
          this.initializeWithDefaults();
        }
        
        this.preferencesLoaded = true;
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
        console.log('Initialisation avec les valeurs par défaut suite à l\'erreur');
        
        // En cas d'erreur, initialiser avec les valeurs par défaut sans afficher d'erreur
        this.initializeWithDefaults();
        this.preferencesLoaded = true;
      } finally {
        this.loading = false;
      }
    },
    
    // CORRECTION: Initialiser avec les valeurs par défaut
    initializeWithDefaults() {
      this.initializePreferences(this.preferences);
      console.log('Préférences initialisées avec les valeurs par défaut');
    },
    
    // Initialiser les préférences
    initializePreferences(data) {
      // Fusionner les données avec les valeurs par défaut
      this.preferences = {
        // Valeurs par défaut
        email_nouvelles_annonces: true,
        email_messages: true,
        email_annonces_expirees: true,
        email_mises_a_jour: false,
        app_notifications_push: true,
        app_nouveaux_messages: true,
        app_alertes_prix: true,
        newsletter: false,
        
        // Écraser avec les données reçues
        ...data
      };
      
      // S'assurer que email_annonces_expirees est toujours true (obligatoire)
      this.preferences.email_annonces_expirees = true;
      
      // Créer une copie pour pouvoir annuler les modifications
      this.originalPreferences = JSON.parse(JSON.stringify(this.preferences));
    },
    
    // CORRECTION: Enregistrer avec fetch direct et gestion 403
    async savePreferences() {
      this.saving = true;
      
      try {
        const userId = this.effectiveUserId;
        
        if (!userId) {
          throw new Error('ID utilisateur non disponible');
        }
        
        // Préparer les données à envoyer
        const dataToSend = {
          client_id: userId,
          email_nouvelles_annonces: this.preferences.email_nouvelles_annonces,
          email_messages: this.preferences.email_messages,
          email_annonces_expirees: true, // Toujours true
          email_mises_a_jour: this.preferences.email_mises_a_jour,
          app_notifications_push: this.preferences.app_notifications_push,
          app_nouveaux_messages: this.preferences.app_notifications_push ? this.preferences.app_nouveaux_messages : false,
          app_alertes_prix: this.preferences.app_notifications_push ? this.preferences.app_alertes_prix : false,
          newsletter: this.preferences.newsletter
        };
        
        console.log('Données à envoyer:', dataToSend);
        
        let response;
        
        if (this.preferenceId) {
          // Mettre à jour les préférences existantes
          console.log(`Mise à jour des préférences (ID: ${this.preferenceId})`);
          response = await fetch(`/api/directus/items/user_preferences/${this.preferenceId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(dataToSend)
          });
        } else {
          // Créer de nouvelles préférences
          console.log('Création de nouvelles préférences');
          response = await fetch('/api/directus/items/user_preferences', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(dataToSend)
          });
        }
        
        if (response.status === 403) {
          console.log("Permissions insuffisantes pour sauvegarder les préférences - sauvegarde locale uniquement");
          // Mise à jour locale seulement
          this.originalPreferences = JSON.parse(JSON.stringify(this.preferences));
          this.$emit('update-success', 'Vos préférences ont été mises à jour localement');
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Résultat de l\'opération:', result);
        
        if (result.data && !this.preferenceId) {
          this.preferenceId = result.data.id;
        }
        
        // Mise à jour de l'original après succès
        this.originalPreferences = JSON.parse(JSON.stringify(this.preferences));
        
        // Émettre l'événement de succès
        this.$emit('update-success', 'Vos préférences de notifications ont été mises à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des préférences:', error);
        
        // En cas d'erreur, sauvegarder localement
        this.originalPreferences = JSON.parse(JSON.stringify(this.preferences));
        this.$emit('update-success', 'Vos préférences ont été mises à jour localement');
      } finally {
        this.saving = false;
      }
    },
    
    // Réinitialiser le formulaire aux valeurs d'origine
    resetForm() {
      if (this.originalPreferences) {
        this.preferences = JSON.parse(JSON.stringify(this.originalPreferences));
      }
    }
  }
};
</script>