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
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Tableau de bord</h1>
      
      <!-- Tabs de navigation -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <a 
            v-for="tab in filteredTabs" 
            :key="tab.id"
            :class="[
              activeTab === tab.id 
                ? 'border-cyan-500 text-cyan-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
            @click="activeTab = tab.id"
            href="#"
          >
            {{ tab.name }}
          </a>
        </nav>
      </div>
      
      <!-- Contenu des tabs -->
      <div class="bg-white shadow rounded-lg">
        <ProfileTab v-if="activeTab === 'profile'" @update-success="handleUpdateSuccess" />
        <NotificationsTab v-if="activeTab === 'notifications'" @update-success="handleUpdateSuccess" />
        <SearchesTab v-if="activeTab === 'savedSearches'" />
        <FavoritesTab v-if="activeTab === 'favorites'" />
        <ListingsTab v-if="activeTab === 'listings' && userType >= 1" />
        <AdsTab v-if="activeTab === 'ads' && userType >= 2" />
        <MessagesTab v-if="activeTab === 'messages'" />
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
  
  export default {
    name: 'SettingsPage',
    
    components: {
      ProfileTab,
      NotificationsTab,
      SearchesTab,
      FavoritesTab,
      ListingsTab,
      AdsTab,
      MessagesTab
    },
    
    data() {
      return {
        // Onglet actif
        activeTab: 'profile',
        
        // Type d'utilisateur: 0 = utilisateur simple, 1 = client annonces, 2 = client publicité
        userType: 2, // À définir dynamiquement selon l'utilisateur connecté
        
        // Onglets disponibles
        availableTabs: [
          { id: 'profile', name: 'Profil' },
          { id: 'notifications', name: 'Notifications' },
          { id: 'savedSearches', name: 'Recherches' },
          { id: 'favorites', name: 'Favoris' },
          { id: 'messages', name: 'Messagerie' },
          { id: 'listings', name: 'Mes annonces' }, // Visible pour userType >= 1
          { id: 'ads', name: 'Mes publicités' }     // Visible pour userType >= 2
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
      // Récupérer le type d'utilisateur au chargement
      this.fetchUserType();
      
      // Vérifier si un onglet spécifique est demandé dans l'URL
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && this.availableTabs.some(t => t.id === tab)) {
        this.activeTab = tab;
      }
    },
    
    methods: {
      // Récupération du type d'utilisateur
      fetchUserType() {
        try {
          // Dans un cas réel, ce serait un appel API
          // const response = await api.getUserType();
          // this.userType = response.userType;
          
          // Pour l'exemple, nous utilisons un type fixe (2)
          console.log('Type d\'utilisateur chargé');
        } catch (error) {
          console.error('Erreur lors du chargement du type d\'utilisateur:', error);
        }
      },
      
      // Gestion des mises à jour réussies (pour les notifications)
      handleUpdateSuccess(message) {
        // Cette méthode pourrait utiliser un système de notification Toast
        alert(message || 'Mise à jour réussie');
      }
    }
  };
  </script>