// Structure du dossier
/components
  /settings
    ProfileTab.vue       // Informations personnelles
    NotificationsTab.vue // Préférences de notifications
    SearchesTab.vue      // Recherches sauvegardées
    FavoritesTab.vue     // Annonces favorites
    ListingsTab.vue      // Gestion des annonces (client annonces)
    AdsTab.vue           // Gestion des publicités (client publicité)
    MessagesTab.vue      // Messagerie
/pages
  settings.vue           // Conteneur principal avec gestion des onglets

// settings.vue (composant principal)
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête avec le titre et éventuelles informations utilisateur -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      <div v-if="user" class="text-sm text-gray-600">
        Connecté en tant que <span class="font-medium">{{ user.first_name }} {{ user.last_name }}</span>
      </div>
    </div>
    
    <!-- Message de chargement -->
    <div v-if="loading" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <p class="text-gray-600">Chargement de vos informations...</p>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      <p class="font-medium">Une erreur est survenue</p>
      <p class="text-sm">{{ error }}</p>
      <button 
        @click="fetchUserData" 
        class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
      >
        Réessayer
      </button>
    </div>
    
    <!-- Contenu principal (visible seulement si les données sont chargées) -->
    <div v-else-if="user">
      <!-- Tabs de navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8 overflow-x-auto">
          <a 
            v-for="tab in filteredTabs" 
            :key="tab.id"
            :class="[
              activeTab === tab.id 
                ? 'border-cyan-500 text-cyan-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer'
            ]"
            @click="selectTab(tab.id)"
          >
            {{ tab.name }}
            <span v-if="tab.id === 'messages' && unreadMessages > 0" 
                  class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
              {{ unreadMessages }}
            </span>
          </a>
        </nav>
      </div>
      
      <!-- Contenu des tabs -->
      <div class="bg-white shadow rounded-lg">
        <ProfileTab 
          v-if="activeTab === 'profile'" 
          :user="user" 
          :userType="userType"
          @update-success="handleUpdateSuccess" 
        /> 
        <NotificationsTab 
          v-if="activeTab === 'notifications'" 
          :user-id="user.id" 
          @update-success="handleUpdateSuccess" 
        />
        <SearchesTab 
          v-if="activeTab === 'savedSearches'" 
          :user-id="user.id" 
        />
        <FavoritesTab 
          v-if="activeTab === 'favorites'" 
          :user-id="user.id" 
        />
        <ListingsTab 
          v-if="activeTab === 'listings' && userType >= 1" 
          :user-id="user.id" 
        />
        <AdsTab 
          v-if="activeTab === 'ads' && userType >= 2" 
          :user-id="user.id" 
        />
        <MessagesTab 
          v-if="activeTab === 'messages'" 
          :user-id="user.id" 
          @messages-read="updateUnreadCount" 
        />
        <OrdersTab 
          v-if="activeTab === 'orders'" 
          :user-id="user.id" 
        />
      </div>
    </div>

    <!-- Message si non connecté (à gérer avec l'authentification plus tard) -->
    <div v-else class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
      <p class="font-medium">Accès restreint</p>
      <p class="text-sm">Vous devez être connecté pour accéder à votre tableau de bord.</p>
      <NuxtLink to="/connexion" class="mt-2 inline-block text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded">
        Se connecter
      </NuxtLink>
    </div>

    <!-- Notification toast (pour les messages de succès) -->
    <div v-if="notification.show" 
         class="fixed bottom-5 right-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded shadow-lg transition-opacity duration-300"
         :class="notification.show ? 'opacity-100' : 'opacity-0'">
      <p>{{ notification.message }}</p>
    </div>
  </div>
</template>
  
<script>
import ProfileTab from '@/components/settings/ProfileTab.vue';
import NotificationsTab from '@/components/settings/NotificationsTab.vue';
import SearchesTab from '@/components/settings/SearchesTab.vue';
import FavoritesTab from '@/components/settings/FavoritesTab.vue';
import ListingsTab from '@/components/settings/ListingsTab.vue';
import AdsTab from '@/components/settings/AdsTab.vue';
import MessagesTab from '@/components/settings/MessagesTab.vue';
import OrdersTab from '@/components/settings/OrdersTab.vue';

export default {
  name: 'SettingsPage',
  
  components: {
    ProfileTab,
    NotificationsTab,
    SearchesTab,
    FavoritesTab,
    ListingsTab,
    AdsTab,
    MessagesTab,
    OrdersTab
  },
  
  data() {
    return {
      // États de l'interface
      loading: false, // Mettre à false pour éviter l'erreur immédiate
      error: null,
      
      // Onglet actif
      activeTab: 'profile',
      
      // Données utilisateur
      user: { 
        id: '1',  // Valeur temporaire pour développement
        first_name: 'Utilisateur',
        last_name: 'Test'
      },
      userType: 2, // Valeur temporaire pour développement
      unreadMessages: 3, // Valeur temporaire pour développement
      
      // Notification toast
      notification: {
        show: false,
        message: '',
        timer: null
      },
      
      // Onglets disponibles
      availableTabs: [
        { id: 'profile', name: 'Profil' },
        { id: 'notifications', name: 'Notifications' },
        { id: 'savedSearches', name: 'Recherches' },
        { id: 'favorites', name: 'Favoris' },
        { id: 'messages', name: 'Messagerie' },
        { id: 'orders', name: 'Mes commandes' }, // Nouvel onglet
        { id: 'listings', name: 'Mes annonces' },
        { id: 'ads', name: 'Mes publicités' }
      ]
    };
  },
  
  computed: {
    // Filtre les onglets selon le type d'utilisateur
    filteredTabs() {
      return this.availableTabs.filter(tab => {
        if (tab.id === 'listings' && this.userType < 1) return false;
        if (tab.id === 'ads' && this.userType < 2) return false;
        return true;
      });
    }
  },
  
  mounted() {
    // Vérifier si un onglet spécifique est demandé dans l'URL
    this.checkUrlTab();
    
    // Pour le moment, nous utilisons des données fictives
    // Décommenter la ligne suivante lorsque l'API sera prête:
    // this.fetchUserData();
  },
  
  methods: {
    // Récupération des données utilisateur depuis Directus
    async fetchUserData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Pour l'instant, nous simulons un appel API réussi
        // À remplacer par une véritable implémentation d'API plus tard
        
        // Exemple d'appel à axios (à ajuster selon votre configuration)
        /*
        const response = await this.$axios.$get('/api/users/me');
        this.user = response.data;
        await this.determineUserType();
        await this.fetchUnreadMessagesCount();
        */
        
        // Simulation d'un délai pour le développement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        this.error = "Impossible de charger vos informations. Veuillez réessayer.";
      } finally {
        this.loading = false;
      }
    },
    
    // Version simplifiée pour le développement
    async determineUserType() {
      // À implémenter plus tard avec l'API réelle
      console.log('Détermination du type d\'utilisateur...');
    },
    
    // Version simplifiée pour le développement
    async fetchUnreadMessagesCount() {
      // À implémenter plus tard avec l'API réelle
      console.log('Récupération du nombre de messages non lus...');
    },
    
    // Mettre à jour le compteur de messages non lus
    updateUnreadCount(count) {
      this.unreadMessages = count;
    },
    
    // Sélectionner un onglet et mettre à jour l'URL
    selectTab(tabId) {
      this.activeTab = tabId;
      
      // Mettre à jour l'URL sans recharger la page
      const url = new URL(window.location);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url);
    },
    
    // Vérifier l'onglet demandé dans l'URL
    checkUrlTab() {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && this.availableTabs.some(t => t.id === tab)) {
        this.activeTab = tab;
      }
    },
    
    // Gestion des mises à jour réussies (pour les notifications)
    handleUpdateSuccess(message) {
      // Nettoyer tout timer existant
      if (this.notification.timer) {
        clearTimeout(this.notification.timer);
      }
      
      // Afficher la notification
      this.notification.message = message || 'Mise à jour réussie';
      this.notification.show = true;
      
      // Masquer après 3 secondes
      this.notification.timer = setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    }
  }
};
</script>