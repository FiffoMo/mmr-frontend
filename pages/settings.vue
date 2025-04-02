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
          :user-type="userType"
          :is-active="activeTab === 'profile'"
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
          v-if="activeTab === 'listings'" 
          :user-id="user.id" 
        />
        <AdsTab 
          v-if="activeTab === 'ads'" 
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
        <HighlightTab 
          v-if="activeTab === 'highlight'" 
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
    
    <!-- Zone de débogage visible uniquement en mode développement -->
    <div v-if="isDebugging" class="fixed bottom-0 right-0 p-4 bg-gray-800 text-white rounded-tl-lg max-w-md text-xs overflow-auto max-h-64 z-50">
      <h3 class="font-bold mb-2">Débogage Authentification</h3>
      <div class="mb-2">
        <p>Utilisateur chargé: <span :class="user ? 'text-green-400' : 'text-red-400'">
          {{ user ? 'Oui' : 'Non' }}
        </span></p>
        <p>User ID: {{ user?.id || 'Non défini' }}</p>
        <p>Type utilisateur: {{ userType }}</p>
      </div>
      <h3 class="font-bold mb-2">Données utilisateur</h3>
      <div v-if="loading" class="text-yellow-400">Chargement...</div>
      <div v-else-if="error" class="text-red-400">{{ error }}</div>
      <div v-else-if="user">
        <p>Nom: {{ user.first_name }} {{ user.last_name }}</p>
        <p>Type: {{ userType }}</p>
        <p>Messages non lus: {{ unreadMessages }}</p>
      </div>
      <div v-else class="text-red-400">Utilisateur non chargé</div>
      <button @click="logDebugInfo" class="mt-2 px-2 py-1 bg-blue-700 text-white rounded text-xs">
        Log dans la console
      </button>
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
import { useFavorites } from '~/composables/useFavorites'; // Ajout de l'import pour useFavorites

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
  
  data() {
    return {
      // Variables de débogage
      isDebugging: false, // Mettre à false pour désactiver le débogage en production
      
      // États de l'interface
      loading: false, // Mettre à false pour éviter l'erreur immédiate
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
        { id: 'ads', name: 'Mes publicités' },
        { id: 'highlight', name: 'Mise en avant' }
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
    
    // Journaliser des informations de débogage après le chargement
    setTimeout(() => {
      this.logDebugInfo();
    }, 1000);
  },
  
  methods: {
    // Fonction de débogage pour journaliser les informations dans la console
    logDebugInfo() {
      if (!this.isDebugging) return;
      
      console.group('🔍 Débogage Settings - Données Utilisateur');
      console.log('User:', this.user);
      console.log('User Type:', this.userType);
      console.log('Onglet actif:', this.activeTab);
      console.log('Chargement:', this.loading);
      console.log('Erreur:', this.error);
      console.groupEnd();
      
      console.group('🔍 Débogage Settings - État Interface');
      console.log('Onglets filtrés:', this.filteredTabs);
      console.log('Messages non lus:', this.unreadMessages);
      console.groupEnd();
      
      // Tentative d'accès au store d'authentification si disponible
      try {
        const authStore = this.$pinia?.state.value?.auth;
        if (authStore) {
          console.group('🔍 Débogage Settings - Auth Store');
          console.log('Auth Store:', authStore);
          console.log('Authentifié:', !!authStore.token);
          console.log('Token:', authStore.token ? `${authStore.token.substring(0, 10)}...` : 'Non défini');
          console.groupEnd();
        }
      } catch (error) {
        console.warn('Store d\'authentification non accessible:', error);
      }
    },
    
    // Récupération des données utilisateur depuis Directus
    async fetchUserData() {
      this.loading = true;
      this.error = null;
      
      try {
        let userFound = false;
        
        // Tenter de récupérer l'utilisateur depuis le store d'authentification
        try {
          const authStore = this.$pinia?.state.value?.auth;
          if (authStore && authStore.user) {
            this.user = authStore.user;
            this.userType = parseInt(authStore.userType || 0);
            userFound = true;
            console.log('Utilisateur récupéré depuis le store d\'authentification:', this.user);
          } else {
            console.log('Aucun utilisateur trouvé dans le store d\'authentification');
          }
        } catch (error) {
          console.warn('Erreur lors de l\'accès au store d\'authentification:', error);
        }
        
        // Si aucun utilisateur n'est récupéré, faire une requête à l'API
        if (!userFound) {
          try {
            console.log('Tentative de récupération des données depuis l\'API...');
            const response = await fetch('/api/directus/users/me?fields=*', {
              credentials: 'include' // Inclure les cookies d'authentification
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.data) {
                this.user = data.data;
                userFound = true;
                console.log('Utilisateur récupéré depuis l\'API:', this.user);
                
                // Déterminer le type d'utilisateur depuis les rôles ou d'autres propriétés
                this.determineUserType();
              } else {
                throw new Error('Format de réponse invalide');
              }
            } else {
              throw new Error(`Erreur API: ${response.status}`);
            }
          } catch (apiError) {
            console.error('Erreur lors de la requête API:', apiError);
            throw apiError;
          }
        }
        
        // Si l'utilisateur est trouvé, charger des données supplémentaires
        if (userFound) {
          // Récupérer le nombre de messages non lus
          await this.fetchUnreadMessagesCount();
        } else {
          throw new Error('Impossible de récupérer les données utilisateur');
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        this.error = "Impossible de charger vos informations. Veuillez réessayer.";
      } finally {
        this.loading = false;
        // Journaliser après le chargement des données
        this.logDebugInfo();
      }
    },
    
    // Déterminer le type d'utilisateur (admin, client annonces, client publicité)
    determineUserType() {
      if (!this.user) return;
      
      // Par défaut, considérer l'utilisateur comme admin (type 0)
      let type = 0;
      
      // Vérifier les rôles ou d'autres propriétés pour déterminer le type
      // Exemple: si l'utilisateur a un rôle "client_annonces", type = 1
      // Exemple: si l'utilisateur a un rôle "client_publicite", type = 2
      
      // Pour test, on peut utiliser l'administrateur comme tous les types
      type = 2; // Accès à tous les onglets
      
      this.userType = type;
      console.log('Type d\'utilisateur déterminé:', type);
    },
    
    // Récupérer le nombre de messages non lus
    async fetchUnreadMessagesCount() {
      try {
        // En développement, on peut utiliser une valeur fictive
        this.unreadMessages = 3;
        
        // En production, implémenter l'appel API réel
        /*
        const response = await fetch(`/api/directus/items/messages?filter[recipient_id][_eq]=${this.user.id}&filter[read][_eq]=false&aggregate[count]=*`);
        
        if (response.ok) {
          const data = await response.json();
          this.unreadMessages = data.data?.[0]?.count || 0;
        } else {
          console.warn('Erreur lors de la récupération des messages non lus:', response.status);
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
    selectTab(tabId) {
      const previousTab = this.activeTab;
      this.activeTab = tabId;
      
      // Mettre à jour l'URL sans recharger la page
      const url = new URL(window.location);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url);
      
      // Émettre un événement personnalisé pour indiquer le changement d'onglet
      if (tabId === 'profile') {
        // Utiliser setTimeout pour s'assurer que le composant est monté
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('tab-profile-activated'));
          console.log('Événement tab-profile-activated émis');
        }, 100);
      }
      
      // Si nécessaire, effectuer des actions supplémentaires selon les onglets
      if (previousTab !== tabId) {
        console.log(`Changement d'onglet: ${previousTab} -> ${tabId}`);
        // Autres actions si nécessaire...
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
    }
  }
};
</script>