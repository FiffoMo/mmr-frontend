<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Mon espace</h1>
    
    <!-- Message de chargement -->
    <div v-if="loading" class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
      <p class="text-center text-gray-600">Chargement de vos informations...</p>
    </div>
    
    <!-- Message d'erreur -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
      <h3 class="font-bold">Une erreur est survenue</h3>
      <p>{{ error }}</p>
      <button 
        @click="fetchUserData" 
        class="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-red-800"
      >
        Réessayer
      </button>
    </div>
    
    <!-- Contenu principal -->
    <div v-else>
      <!-- Menu de navigation horizontal avec groupes -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-wrap items-center space-x-1 md:space-x-4">
          <!-- Groupe Profil -->
          <div class="relative group">
            <button class="flex items-center px-3 py-2 text-gray-700 font-medium rounded-md hover:bg-gray-50">
              <span>Profil</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="absolute left-0 top-full z-10 hidden group-hover:block w-40 rounded-md shadow-lg bg-white">
              <!-- Pont invisible pour maintenir le hover -->
              <div class="absolute top-0 left-0 h-2 w-full -mt-1"></div>
              <div class="rounded-md bg-white shadow-xs">
                <button
                  v-for="tab in profileTabs"
                  :key="tab.id"
                  @click="selectTab(tab.id)"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  v-bind:class="activeTab === tab.id ? 'bg-cyan-50 text-cyan-700' : ''"
                >
                  {{ tab.name }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Messages (standalone) -->
          <button
            @click="selectTab('messages')"
            class="flex items-center px-3 py-2 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            v-bind:class="activeTab === 'messages' ? 'bg-cyan-50 text-cyan-700' : ''"
          >
            <span class="relative flex items-center">
              Messages
              <span 
                v-if="unreadMessages" 
                class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800"
              >
                {{ unreadMessages }}
              </span>
            </span>
          </button>
          
          <!-- Groupe Mes Achats (visible seulement pour userType >= 1) -->
          <div v-if="userType >= 1" class="relative group">
            <button class="flex items-center px-3 py-2 text-gray-700 font-medium rounded-md hover:bg-gray-50">
              <span>Mes achats</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div class="absolute left-0 top-full z-10 hidden group-hover:block w-40 rounded-md shadow-lg bg-white">
              <!-- Pont invisible pour maintenir le hover -->
              <div class="absolute top-0 left-0 h-2 w-full -mt-1"></div>
              <div class="rounded-md bg-white shadow-xs">
                <button
                  v-for="tab in purchaseTabs"
                  :key="tab.id"
                  @click="selectTab(tab.id)"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  v-bind:class="activeTab === tab.id ? 'bg-cyan-50 text-cyan-700' : ''"
                >
                  {{ tab.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Contenu de l'onglet actif -->
      <div class="bg-white rounded-lg shadow-sm">
        <component 
          :is="getComponentForTab(activeTab)" 
          :user="user" 
          :user-type="userType"
          @update-success="handleUpdateSuccess"
          @update-unread-count="updateUnreadCount"
        />
      </div>
    </div>
    
    <!-- Notification toast -->
    <div 
      v-if="notification.show" 
      class="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-lg transition-opacity"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">{{ notification.message }}</p>
        </div>
      </div>
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
import { useDirectusApi } from '@/composables/useDirectusApi';

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
    
    // Initialiser le service Directus API
    const { 
      loading: apiLoading,
      error: apiError,
      getUserProfile
    } = useDirectusApi();
    
    return {
      authStore,
      apiLoading,
      apiError,
      getUserProfile
    };
  },
  
  data() {
    return {
      // États de l'interface
      loading: false,
      error: null,
      
      // Onglet actif
      activeTab: 'profile',
      
      // Données utilisateur
      user: { 
        id: '1',
        first_name: 'Utilisateur',
        last_name: 'Test'
      },
      userType: 0,
      unreadMessages: 0,
      
      // Notification toast
      notification: {
        show: false,
        message: '',
        timer: null
      },
      
      // Groupes d'onglets
      profileTabs: [
        { id: 'profile', name: 'Profil' },
        { id: 'notifications', name: 'Notifications' },
        { id: 'savedSearches', name: 'Recherches' },
        { id: 'favorites', name: 'Favoris' }
      ],
      
      purchaseTabs: [
        { id: 'orders', name: 'Mes commandes' },
        { id: 'listings', name: 'Mes annonces' },
        { id: 'highlight', name: 'Mise en avant' },
        { id: 'ads', name: 'Mes publicités' }
      ]
    };
  },
  
  computed: {
    // Filtre les onglets d'achat selon le type d'utilisateur
    filteredPurchaseTabs() {
      return this.purchaseTabs.filter(tab => {
        if (tab.id === 'ads' && this.userType < 2) return false;
        return true;
      });
    },
    
    // Tous les onglets disponibles (pour vérification URL)
    allTabs() {
      const tabs = [...this.profileTabs, { id: 'messages', name: 'Messagerie' }];
      if (this.userType >= 1) {
        tabs.push(...this.filteredPurchaseTabs);
      }
      return tabs;
    }
  },
  
  mounted() {
    // TEMPORAIRE: Définir un token de test pour Directus (à remplacer par un vrai système de connexion)
    // localStorage.setItem('auth_token', 'ZYfCrLEDGsOa4ue5T9hvUf4rBg2z6_Qs');
    // console.log('Tentative de récupération du profil utilisateur');
    // const result = await this.getUserProfile();
    // console.log('Résultat:', result);
    
    // Initialiser l'état d'authentification
    this.authStore.initAuth();
    
    // Vérifier si un onglet spécifique est demandé dans l'URL
    this.checkUrlTab();
    
    // Récupérer les données utilisateur
    this.fetchUserData();
  },
  
  methods: {
    // Récupération des données utilisateur depuis Directus
    async fetchUserData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Vérifier si l'utilisateur est authentifié
        if (!this.authStore.isAuthenticated) {
          // TEMPORAIRE: Simuler une connexion pour le développement
          // Dans une vraie application, rediriger vers la page de connexion
          this.user = {
            id: '1',
            first_name: 'Utilisateur',
            last_name: 'Test',
            type: 2 // Type 2 pour voir tous les onglets pendant le développement
          };
          this.userType = 2;
          this.loading = false;
          return;
        }
        
        // Récupérer le profil utilisateur depuis Directus
        const result = await this.getUserProfile();
        
        if (result.data) {
          this.user = result.data;
          this.userType = result.data.type || 0;
          
          // Récupérer le nombre de messages non lus (à implémenter)
          await this.fetchUnreadMessagesCount();
        } else {
          throw new Error("Aucune donnée utilisateur trouvée");
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        this.error = "Impossible de charger vos informations. Veuillez réessayer.";
      } finally {
        this.loading = false;
      }
    },
    
    // Version simplifiée pour le développement
    async fetchUnreadMessagesCount() {
      // À implémenter plus tard avec l'API réelle
      this.unreadMessages = 3; // Valeur temporaire pour développement
    },
    
    // Mettre à jour le compteur de messages non lus
    updateUnreadCount(count) {
      this.unreadMessages = count;
    },
    
    // Obtenir le composant correspondant à l'onglet actif
    getComponentForTab(tabId) {
      const componentMap = {
        'profile': ProfileTab,
        'notifications': NotificationsTab,
        'savedSearches': SearchesTab,
        'favorites': FavoritesTab,
        'messages': MessagesTab,
        'listings': ListingsTab,
        'orders': OrdersTab,
        'ads': AdsTab,
        'highlight': HighlightTab
      };
      
      return componentMap[tabId] || ProfileTab;
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
      
      // Vérifier si l'onglet existe dans nos différents groupes
      const allTabIds = this.allTabs.map(tab => tab.id);
      
      if (tab && allTabIds.includes(tab)) {
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