<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Débogage pour voir les données brutes -->
    <!-- <div class="bg-blue-50 p-4 mb-4 rounded-lg border border-blue-200">
      <h3 class="font-bold text-blue-800">Débogage des données</h3>
      <p>Loading: {{ loading || directusSDK?.loading }}</p>
      <p>Error: {{ error || directusSDK?.error }}</p>
      <p>User disponible: {{ !!user }}</p>
      <p v-if="user">Utilisateur: {{ user.first_name }} {{ user.last_name }}</p>
      <p v-if="user">ID: {{ user.id }}</p>
      <p>Type: {{ userType }}</p>
      <button @click="fetchUserData" class="bg-blue-500 text-white p-2 rounded mt-2">
        Recharger les données
      </button>
    </div> -->
    
    <!-- En-tête avec le titre et éventuelles informations utilisateur -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      <div v-if="user" class="text-sm text-gray-600">
        Connecté en tant que <span class="font-black">{{ user.first_name }} {{ user.last_name }}</span>
      </div>
    </div>
    
    <!-- Message de chargement -->
    <div v-if="(loading || directusSDK?.loading) && !user" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
      <p class="text-gray-600">Chargement de vos informations...</p>
    </div>
    
    <!-- Message d'erreur -->
    <div v-if="(error || directusSDK?.error) && !user" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      <p class="font-medium">Une erreur est survenue</p>
      <p class="text-sm">{{ error || directusSDK?.error }}</p>
      <button 
        @click="fetchUserData" 
        class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
      >
        Réessayer
      </button>
    </div>
    
    <!-- Contenu principal (visible seulement si les données sont chargées) -->
    <div v-if="user">
      <!-- Tabs de navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-4 overflow-x-auto">
          <a 
            v-for="tab in filteredTabs" 
            :key="tab.id"
            :class="[
              // Classes communes pour tous les onglets
              'whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm cursor-pointer rounded-t-lg',
              
              // Classes spécifiques à l'onglet actif
              activeTab === tab.id 
                ? 'border-cyan-500 text-cyan-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              
              // Couleurs de fond spécifiques pour certains onglets
              tab.id === 'orders' ? 'bg-slate-100' : '',
              tab.id === 'listings' ? 'bg-green-100' : '',
              tab.id === 'highlight' ? 'bg-blue-100' : '',
              tab.id === 'ads' ? 'bg-yellow-100' : ''
            ]"
            @click="selectTab(tab.id)"
          >
            {{ tab.name }}
            <span v-if="tab.id === 'messages' && unreadMessages > 0" 
                  class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
              {{ unreadMessages }}
            </span>
          </a>
        </nav>
      </div>
      
      <!-- Contenu des tabs - utilisation du v-show pour éviter les remontages mais v-if pour désactiver temporairement -->
      <div class="bg-white shadow rounded-lg">
        <div v-show="activeTab === 'profile'">
          <ProfileTab 
            :user="user" 
            :user-type="userType"
            :is-active="activeTab === 'profile'"
            @update-success="handleUpdateSuccess" 
          />
        </div>
        
        <div v-show="activeTab === 'notifications'">
          <NotificationsTab 
            :user="user"
            :user-id="user.id" 
            :is-active="activeTab === 'notifications'"
            @update-success="handleUpdateSuccess" 
          />
        </div>
        
        <div v-show="activeTab === 'savedSearches'">
          <SearchesTab 
            :user-id="user.id" 
            :is-active="activeTab === 'savedSearches'"
          />
        </div>
        
        <div v-show="activeTab === 'favorites'">
          <FavoritesTab 
            :user-id="user.id"
            :is-active="activeTab === 'favorites'"
          />
        </div>
        
        <div v-show="activeTab === 'messages'">
          <MessagesTab 
            :user-id="user.id" 
            :is-active="activeTab === 'messages'"
            @messages-read="updateUnreadCount" 
          />
        </div>
        
        <div v-show="activeTab === 'listings'">
          <ListingsTab 
            :user-id="user.id"
            :is-active="activeTab === 'listings'"
          />
        </div>
        
        <div v-show="activeTab === 'ads'">
          <AdsTab 
            :user-id="user.id"
            :is-active="activeTab === 'ads'"
          />
        </div>
        
        <div v-show="activeTab === 'orders'">
          <OrdersTab 
            :user-id="user.id"
            :is-active="activeTab === 'orders'"
          />
        </div>
        
        <div v-show="activeTab === 'highlight'">
          <HighlightTab 
            :user-id="user.id"
            :is-active="activeTab === 'highlight'"
            @update-success="handleUpdateSuccess"
          />
        </div>
      </div>
    </div>

    <!-- Message si non connecté -->
    <div v-if="!user && !loading && !error" class="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
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
import HighlightTab from '@/components/settings/HighlightTab.vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDirectusSDK } from '@/composables/useDirectusSDK';

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
    OrdersTab,
    HighlightTab
  },
  
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
      // Variables de débogage
      isDebugging: true, // Activer pour le débogage, désactiver en production
      
      // États de l'interface
      loading: false,
      error: null,
      
      // Onglet actif
      activeTab: 'profile',
      
      // Données utilisateur
      user: null,
      userType: 0,
      unreadMessages: 0,
      
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
        { id: 'savedSearches', name: 'Mes alertes' },
        { id: 'favorites', name: 'Favoris' },
        { id: 'messages', name: 'Messagerie' },
        { id: 'orders', name: 'Mes commandes' },
        { id: 'listings', name: 'Mes annonces' },
        { id: 'highlight', name: 'Mise en avant' },
        { id: 'ads', name: 'Mes publicités' }
      ]
    };
  },
  
  computed: {
    // Filtre les onglets selon le type d'utilisateur
    filteredTabs() {
      // Pour les administrateurs ou tests, montrer tous les onglets
      if (this.userType === 0) return this.availableTabs;
      
      return this.availableTabs.filter(tab => {
        if (tab.id === 'listings' && this.userType < 1) return false;
        if (tab.id === 'ads' && this.userType < 2) return false;
        if (tab.id === 'highlight' && this.userType < 1) return false;
        return true;
      });
    }
  },
  
  mounted() {
    // Vérifier si un onglet spécifique est demandé dans l'URL
    this.checkUrlTab();
    
    // Récupérer les données utilisateur
    this.fetchUserData();
  },
  
  methods: {
    // Version simplifiée pour récupérer les données utilisateur
    async fetchUserData() {
      console.log('Récupération des données utilisateur via SDK');
      this.loading = true;
      this.error = null;
      
      try {
        // Utiliser uniquement le SDK pour récupérer les données
        const userData = await this.directusSDK.getUserProfile(['*', 'avatar.*']);
        
        if (userData) {
          console.log('Données utilisateur récupérées avec succès:', userData);
          
          // Assigner directement sans conversion JSON pour préserver la réactivité
          this.user = userData;
          
          // Déterminer le type d'utilisateur
          this.determineUserType();
          
          // Mettre à jour également le store d'authentification
          if (this.authStore && this.authStore.user) {
            console.log('Mise à jour du store d\'authentification');
            this.authStore.setUser(userData);
          }
          
          // Récupérer le nombre de messages non lus
          await this.fetchUnreadMessagesCount();
          
          // Émettre un événement global pour informer les autres composants
          window.dispatchEvent(new CustomEvent('user-data-updated', { detail: userData }));
        } else {
          throw new Error('Aucune donnée utilisateur retournée');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        this.error = "Impossible de charger vos informations. Veuillez réessayer.";
      } finally {
        this.loading = false;
      }
    },
    
    // Déterminer le type d'utilisateur (admin, client, etc.)
    determineUserType() {
      if (!this.user) return;
      
      // Pour test, on utilise l'administrateur comme tous les types
      // À remplacer par une logique basée sur les rôles
      this.userType = 2; // Accès à tous les onglets
      console.log('Type d\'utilisateur déterminé:', this.userType);
    },
    
    // Récupérer le nombre de messages non lus
    async fetchUnreadMessagesCount() {
      try {
        // En développement, on utilise une valeur fictive
        this.unreadMessages = 3;
        
        // En production, décommenter ce code pour récupérer les vrais messages:
        /*
        const unreadMessages = await this.directusSDK.getItems('messages', {
          filter: {
            recipient_id: { _eq: this.user.id },
            read: { _eq: false }
          },
          aggregate: {
            count: '*'
          }
        });
        
        if (unreadMessages && unreadMessages.length > 0) {
          this.unreadMessages = unreadMessages[0].count || 0;
        }
        */
      } catch (error) {
        console.error('Erreur lors de la récupération des messages non lus:', error);
        this.unreadMessages = 0;
      }
    },
    
    // Mettre à jour le compteur de messages non lus
    updateUnreadCount(count) {
      this.unreadMessages = count;
    },
    
    // Sélectionner un onglet et mettre à jour l'URL
    // Sélectionner un onglet et mettre à jour l'URL
    selectTab(tabId) {
      console.log('Changement d\'onglet demandé:', tabId);
      const previousTab = this.activeTab;
      
      // Ne rien faire si on clique déjà sur l'onglet actif
      if (previousTab === tabId) {
        console.log('Déjà sur cet onglet, aucune action nécessaire');
        return;
      }
      
      // Mettre à jour l'onglet actif
      this.activeTab = tabId;
      console.log('Onglet actif mis à jour:', this.activeTab);
      
      // Mettre à jour l'URL sans recharger la page
      const url = new URL(window.location);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url);
      
      // Déclencher des événements spécifiques selon l'onglet activé
      if (tabId === 'profile') {
        window.dispatchEvent(new CustomEvent('refresh-profile-data'));
      }
      else if (tabId === 'notifications') {
        window.dispatchEvent(new CustomEvent('refresh-notification-preferences'));
      }
      else if (tabId === 'favorites') {
        window.dispatchEvent(new CustomEvent('refresh-favorites-data'));
      }
      else if (tabId === 'highlight') {
        window.dispatchEvent(new CustomEvent('refresh-highlight-data'));
      }
      // Ajouter un événement pour l'onglet Mes commandes
      else if (tabId === 'orders') {
        window.dispatchEvent(new CustomEvent('refresh-orders-data'));
      }
      // Ajouter des événements pour les autres onglets
      else if (tabId === 'savedSearches') {
        window.dispatchEvent(new CustomEvent('refresh-searches-data'));
      }
      else if (tabId === 'messages') {
        window.dispatchEvent(new CustomEvent('refresh-messages-data'));
      }
      else if (tabId === 'listings') {
        window.dispatchEvent(new CustomEvent('refresh-listings-data'));
      }
      else if (tabId === 'ads') {
        window.dispatchEvent(new CustomEvent('refresh-ads-data'));
      }
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
      
      // Rafraîchir les données utilisateur
      this.fetchUserData();
    }
  }
};
</script>