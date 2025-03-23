
<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Préférences de notifications</h2>
    
    <!-- Message de chargement -->
    <div v-if="loading" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <p class="text-gray-600">Chargement de vos préférences...</p>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
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
    <form v-else @submit.prevent="savePreferences" class="space-y-8 bg-slate-200 p-6 rounded-lg border border-gray-200 shadow-sm">
      
      <!-- Notifications par email -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Notifications par email</h3>
        
        <div class="space-y-3">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="email-new-listings" 
                v-model="preferences.email_nouvelles_annonces" 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="email-new-listings" class="font-medium text-gray-700">Nouvelles annonces correspondant à vos critères</label>
              <p class="text-gray-500">Recevez un email lorsque de nouvelles annonces correspondant à vos recherches sauvegardées sont publiées.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="email-messages" 
                v-model="preferences.email_messages" 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
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
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
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
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
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
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
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
      
      <!-- Alertes SMS - temporairement désactivé -->
      <!-- <div class="space-y-4 opacity-60">
        <div class="flex justify-between items-center border-b border-gray-200 pb-2">
          <h3 class="text-lg font-medium text-gray-900">Alertes SMS</h3>
          <span class="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">Bientôt disponible</span>
        </div>
        
        <div class="space-y-2">
          <p class="text-sm text-gray-500 italic">
            Cette fonctionnalité est temporairement suspendue. Nous travaillons à l'améliorer et la rendre disponible prochainement.
          </p>
        </div>
      </div> -->
      
      <!-- Newsletter -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Newsletter</h3>
        
        <div class="space-y-3">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input 
                id="newsletter" 
                v-model="preferences.newsletter" 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="newsletter" class="font-medium text-gray-700">S'abonner à la newsletter</label>
              <p class="text-gray-500">Recevez nos actualités, conseils et offres spéciales.</p>
            </div>
          </div>
          
          <div v-if="preferences.newsletter" class="ml-7 space-y-3">
            <div>
              <label for="newsletter-frequency" class="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
              <select 
                id="newsletter-frequency" 
                v-model="preferences.newsletter_frequence" 
                class="block w-full h-10 px-3 rounded-md border-slate-300 border shadow-sm bg-white focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
              >
                <option value="">Choisir une fréquence</option>
                <option value="mensuel">Mensuelle</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="semestriel">Semestriel</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Centres d'intérêt</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div v-for="(interest, index) in availableInterests" :key="index" class="flex items-center">
                  <input 
                    :id="`interest-${index}`" 
                    v-model="selectedInterests" 
                    :value="interest.value" 
                    type="checkbox" 
                    class="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <label :for="`interest-${index}`" class="ml-2 text-sm text-gray-700">
                    {{ interest.label }}
                  </label>
                </div>
              </div>
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
export default {
  name: 'NotificationsTab',
  
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  
  emits: ['update-success'],
  
  data() {
    return {
      loading: false,
      saving: false,
      error: null,
      
      // Préférences de notifications
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
        
        // Alertes SMS (temporairement désactivé)
        sms_active: false,
        sms_messages_urgents: false,
        sms_visites_confirmees: false,
        sms_offres: false,
        telephone_verifie: false,
        telephone: '',
        
        // Newsletter
        newsletter: false,
        newsletter_frequence: '',
        newsletter_interets: []
      },
      
      // Sauvegarde des préférences originales
      originalPreferences: null,
      
      // Centres d'intérêt disponibles pour la newsletter
      availableInterests: [
        { value: 'actualites', label: 'Actualités immobilières' },
        { value: 'conseils', label: 'Conseils et astuces' },
        { value: 'tendances', label: 'Tendances du marché' },
        { value: 'investissement', label: 'Investissement' },
        { value: 'financement', label: 'Financement et crédit' },
        { value: 'promotions', label: 'Offres spéciales' }
      ],
      
      // Centres d'intérêt sélectionnés
      selectedInterests: []
    };
  },
  
  watch: {
    // Synchroniser les intérêts sélectionnés avec preferences.newsletter_interets
    selectedInterests: {
      handler(newValue) {
        this.preferences.newsletter_interets = newValue;
      },
      deep: true
    }
  },
  
  mounted() {
    this.fetchNotificationPreferences();
  },
  
  methods: {
    // Récupérer les préférences de notifications
    async fetchNotificationPreferences() {
      this.loading = true;
      this.error = null;
      
      try {
        // À remplacer par l'appel API réel
        // const response = await this.$axios.$get(`/api/users/${this.userId}/notification-preferences`);
        // const preferencesData = response.data;
        
        // Simulation pour le développement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const preferencesData = {
          email_nouvelles_annonces: true,
          email_messages: true,
          email_annonces_expirees: true,
          email_mises_a_jour: false,
          app_notifications_push: true,
          app_nouveaux_messages: true,
          app_alertes_prix: false,
          sms_active: false,
          sms_messages_urgents: true,
          sms_visites_confirmees: true,
          sms_offres: false,
          telephone_verifie: false,
          telephone: '0612345678',
          newsletter: true,
          newsletter_frequence: 'mensuel',
          newsletter_interets: ['actualites', 'tendances', 'investissement']
        };
        
        this.initializePreferences(preferencesData);
      } catch (error) {
        console.error('Erreur lors du chargement des préférences de notifications:', error);
        this.error = "Impossible de charger vos préférences. Veuillez réessayer.";
      } finally {
        this.loading = false;
      }
    },
    
    // Initialiser les préférences
    initializePreferences(data) {
      // Fusionner les données avec les valeurs par défaut
      this.preferences = {
        ...this.preferences,
        ...data
      };
      
      // S'assurer que email_annonces_expirees est toujours true (obligatoire)
      this.preferences.email_annonces_expirees = true;
      
      // Temporairement désactiver les SMS
      this.preferences.sms_active = false;
      
      // Initialiser les intérêts sélectionnés
      this.selectedInterests = Array.isArray(data.newsletter_interets) 
        ? [...data.newsletter_interets] 
        : [];
      
      // Créer une copie pour pouvoir annuler les modifications
      this.originalPreferences = JSON.parse(JSON.stringify(this.preferences));
    },
    
    // Enregistrer les préférences
    async savePreferences() {
      this.saving = true;
      
      try {
        // Préparer les données à envoyer
        const dataToSend = {
          ...this.preferences,
          // S'assurer que email_annonces_expirees est toujours true
          email_annonces_expirees: true
        };
        
        // Désactiver les sous-options SMS si sms_active est false
        if (!dataToSend.sms_active) {
          dataToSend.sms_messages_urgents = false;
          dataToSend.sms_visites_confirmees = false;
          dataToSend.sms_offres = false;
        }
        
        // Désactiver les sous-options app_notifications si app_notifications_push est false
        if (!dataToSend.app_notifications_push) {
          dataToSend.app_nouveaux_messages = false;
          dataToSend.app_alertes_prix = false;
        }
        
        // Réinitialiser les options de newsletter si newsletter est false
        if (!dataToSend.newsletter) {
          dataToSend.newsletter_frequence = '';
          dataToSend.newsletter_interets = [];
        }
        
        // À remplacer par l'appel API réel
        // const response = await this.$axios.$patch(`/api/users/${this.userId}/notification-preferences`, dataToSend);
        
        // Simulation pour le développement
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mise à jour de l'original après succès
        this.originalPreferences = JSON.parse(JSON.stringify(this.preferences));
        
        // Émettre l'événement de succès
        this.$emit('update-success', 'Vos préférences de notifications ont été mises à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des préférences:', error);
        alert('Une erreur est survenue lors de la sauvegarde de vos préférences. Veuillez réessayer.');
      } finally {
        this.saving = false;
      }
    },
    
    // Réinitialiser le formulaire aux valeurs d'origine
    resetForm() {
      this.preferences = JSON.parse(JSON.stringify(this.originalPreferences));
      
      // Réinitialiser également les intérêts sélectionnés
      this.selectedInterests = Array.isArray(this.originalPreferences.newsletter_interets) 
        ? [...this.originalPreferences.newsletter_interets] 
        : [];
    }
  }
};
</script>