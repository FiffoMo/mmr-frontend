<template>
  <div class="tab-content">
    <!-- État de chargement -->
    <div v-if="loading && !error" class="py-10 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      <p class="mt-2 text-gray-500">Chargement de vos alertes...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="bg-red-50 p-6 rounded-lg mb-6">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Une erreur est survenue</h3>
          <p class="mt-2 text-sm text-red-700">
            {{ errorMessage || "Impossible de charger vos alertes. Veuillez réessayer ultérieurement." }}
          </p>
        </div>
      </div>
    </div>

    <!-- Pas de données -->
    <div v-else-if="!loading && searches.length === 0" class="bg-gray-100 p-8 rounded-lg text-center">
      <div class="text-gray-400 mb-4">
        <div class="bell-icon-container inline-flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
          </svg>
        </div>
      </div>
      <h3 class="text-lg font-medium text-gray-900">Aucune alerte</h3>
      <p class="mt-2 text-gray-500 mb-6">
        Vous n'avez pas encore configuré d'alertes immobilières.
        Les alertes vous permettent d'être notifié dès qu'un bien correspondant à vos critères est mis en ligne.
      </p>
      <p class="text-gray-500 mb-6">
        Pour créer une alerte, consultez nos annonces et cliquez sur l'icône de cloche qui apparaît sur chaque annonce.
      </p>
      <div class="mt-6">
        <NuxtLink to="/annonces" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
          Voir les annonces
        </NuxtLink>
      </div>
    </div>

    <!-- Données disponibles -->
    <div v-else-if="searches.length > 0" class="searches-container">
      <h3 class="text-xl font-bold mb-6">Mes alertes (<span>{{ searches.length }}</span>)</h3>

      <p class="text-gray-500 mb-6">
        Créez une alerte email cliquant sur l'<strong><span style="background-color:#C0FAFF">icône Cloche</span></strong> qui apparaît sur chaque annonce immobilière<br>
        ou cliquez sur le bouton <strong><span style="background-color:#C0FAFF">"Alerte email"</span></strong> à droite des pages du site et renseignez vos critères de recherches.
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(search, index) in searches" :key="index" class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div class="bg-slate-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h4 class="font-medium text-gray-900 truncate">
              {{ search && search.nom ? search.nom : 'Alerte sans nom' }}
            </h4>
          </div>
          <div class="p-4">
            <div class="space-y-3">
              <!-- Type de bien -->
              <div class="flex items-center" v-if="search.type_bien">
                <span class="text-sm font-medium text-gray-500 w-20">Type:</span>
                <span class="text-sm text-gray-900">{{ formatType(search.type_bien) }}</span>
              </div>
              <div class="flex items-center" v-else-if="getTypeFromCriteres(search)">
                <span class="text-sm font-medium text-gray-500 w-20">Type:</span>
                <span class="text-sm text-gray-900">{{ formatType(getTypeFromCriteres(search)) }}</span>
              </div>
              
              <!-- Localisation -->
              <div class="flex items-center" v-if="search.localisation">
                <span class="text-sm font-medium text-gray-500 w-20">Lieu:</span>
                <span class="text-sm text-gray-900">{{ search.localisation }}</span>
              </div>
              <div class="flex items-center" v-else-if="getLocationFromCriteres(search)">
                <span class="text-sm font-medium text-gray-500 w-20">Lieu:</span>
                <span class="text-sm text-gray-900">{{ getLocationFromCriteres(search) }}</span>
              </div>
              
              <!-- Prix max -->
              <div class="flex items-center" v-if="search.prix_max">
                <span class="text-sm font-medium text-gray-500 w-20">Prix max:</span>
                <span class="text-sm text-gray-900">{{ formatPrice(search.prix_max) }}</span>
              </div>
              <div class="flex items-center" v-else-if="getPriceFromCriteres(search)">
                <span class="text-sm font-medium text-gray-500 w-20">Prix max:</span>
                <span class="text-sm text-gray-900">{{ formatPrice(getPriceFromCriteres(search)) }}</span>
              </div>
              
              <!-- Surface -->
              <div class="flex items-center" v-if="search.surface_min || search.surface_max">
                <span class="text-sm font-medium text-gray-500 w-20">Surface:</span>
                <span class="text-sm text-gray-900">
                  {{ formatSurface(search.surface_min) }} {{ search.surface_max ? '- ' + formatSurface(search.surface_max) : '' }}
                </span>
              </div>
              <div class="flex items-center" v-else-if="getSurfaceFromCriteres(search)">
                <span class="text-sm font-medium text-gray-500 w-20">Surface:</span>
                <span class="text-sm text-gray-900">{{ formatSurface(getSurfaceFromCriteres(search)) }}</span>
              </div>
              
              <!-- Chambres -->
              <div class="flex items-center" v-if="search.chambres_min || search.chambres_max">
                <span class="text-sm font-medium text-gray-500 w-20">Chambres:</span>
                <span class="text-sm text-gray-900">
                  {{ search.chambres_min || '?' }} {{ search.chambres_max ? '- ' + search.chambres_max : '' }}
                </span>
              </div>
            </div>
          </div>
          <div class="bg-slate-100 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
            <small class="text-xs text-gray-500">Créée le {{ formatDate(search.date_created) }}</small>
            <div class="flex space-x-2">
              <button 
                @click="toggleSearchStatus(search)" 
                class="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                :class="search.notifications_actives ? 'text-cyan-600 bg-cyan-100' : 'text-gray-400 bg-gray-200'"
                :title="search.notifications_actives ? 'Désactiver l\'alerte' : 'Activer l\'alerte'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button 
                @click="deleteSearch(search)" 
                class="p-1 rounded-full text-red-600 bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
                title="Supprimer l'alerte">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>  
</template>

<script>
import { useDirectusSDK } from '~/composables/useDirectusSDK';
import { useAuthStore } from '~/stores/useAuthStore';
import { ref, watch, onMounted, onUnmounted } from 'vue';

export default {
  name: 'SearchesTab',
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const directusSDK = useDirectusSDK();
    const authStore = useAuthStore();
    
    const loading = ref(false);
    const error = ref(false);
    const errorMessage = ref('');
    const searches = ref([]);
    const dataRequested = ref(false);
    
    async function fetchSearches() {
      // Vérifier si l'utilisateur est connecté
      if (!authStore.user) {
        console.log('Attente des données utilisateur...');
        loading.value = true;
        
        // Attendre que les données utilisateur soient disponibles avec un timeout
        const timeout = setTimeout(() => {
          if (loading.value) {
            console.error('Timeout: Impossible de récupérer les données utilisateur');
            error.value = true;
            errorMessage.value = 'Vous devez être connecté pour accéder à vos alertes.';
            loading.value = false;
            searches.value = [];
          }
        }, 5000);

        // Tenter de récupérer l'utilisateur directement
        try {
          const userResponse = await directusSDK.getSingle('users/me', {
            fields: ['id']
          });
          
          if (!userResponse || !userResponse.data || !userResponse.data.id) {
            console.error('Réponse utilisateur invalide:', userResponse);
            throw new Error('Impossible de récupérer les informations utilisateur');
          }
          
          console.log('Utilisateur récupéré directement:', userResponse.data.id);
          clearTimeout(timeout);
          await loadSearchesForUser(userResponse.data.id);
          return;
        } catch (primaryError) {
          console.warn('Impossible de récupérer l\'utilisateur directement:', primaryError);
          
          // Si authStore.clientId est disponible, l'utiliser
          if (authStore.clientId) {
            console.log('Utilisation de clientId depuis authStore:', authStore.clientId);
            clearTimeout(timeout);
            await loadSearchesForUser(authStore.clientId);
            return;
          }
          
          // Continuer et attendre que l'utilisateur soit chargé dans le store
          let attempts = 0;
          const maxAttempts = 10;
          const checkInterval = setInterval(async () => {
            attempts++;
            if (authStore.user || authStore.clientId) {
              console.log('Données utilisateur trouvées après attente');
              clearInterval(checkInterval);
              clearTimeout(timeout);
              await loadSearchesForUser(authStore.user?.id || authStore.clientId);
            } else if (attempts >= maxAttempts) {
              console.error('Nombre maximum de tentatives atteint');
              clearInterval(checkInterval);
              clearTimeout(timeout);
              error.value = true;
              errorMessage.value = 'Impossible de vérifier votre identité. Veuillez vous reconnecter.';
              loading.value = false;
              searches.value = [];
            }
          }, 500);
        }
        
        return;
      }
      
      await loadSearchesForUser(authStore.user.id || authStore.clientId);
    }
    
    async function loadSearchesForUser(userId) {
      if (!userId) {
        console.error('ID utilisateur manquant');
        error.value = true;
        errorMessage.value = 'Vous devez être connecté pour accéder à vos alertes.';
        searches.value = [];
        loading.value = false;
        return;
      }

      loading.value = true;
      error.value = false;
      
      try {
        console.log('Chargement des alertes pour l\'utilisateur:', userId);
        
        // Tentative directe avec fetch pour plus de fiabilité
        const response = await fetch(`/api/directus/items/recherches_sauvegardees?filter[client_id][_eq]=${userId}`);
        
        if (!response.ok) {
          // Si échec avec client_id, essayer avec utilisateur
          const legacyResponse = await fetch(`/api/directus/items/recherches_sauvegardees?filter[utilisateur][_eq]=${userId}`);
          
          if (!legacyResponse.ok) {
            throw new Error(`Erreur HTTP: ${legacyResponse.status}`);
          }
          
          const legacyJsonData = await legacyResponse.json();
          searches.value = legacyJsonData.data || [];
        } else {
          const jsonData = await response.json();
          searches.value = jsonData.data || [];
        }
        
        console.log('Alertes récupérées:', searches.value);
        
      } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error);
        error.value = true;
        errorMessage.value = error.message || 'Erreur lors du chargement des alertes';
        searches.value = [];
      } finally {
        loading.value = false;
      }
    }
    
    async function toggleSearchStatus(search) {
      try {
        // Créer une copie mise à jour
        const updatedSearch = { 
          ...search, 
          notifications_actives: !search.notifications_actives 
        };
        
        // S'assurer que client_id est défini lors de la mise à jour
        // Si client_id n'existe pas, utiliser utilisateur comme fallback
        if (!updatedSearch.client_id && updatedSearch.utilisateur) {
          updatedSearch.client_id = updatedSearch.utilisateur;
        }
        
        console.log('Mise à jour de l\'alerte:', updatedSearch);
        await directusSDK.updateItem('recherches_sauvegardees', search.id, updatedSearch);
        
        // Mettre à jour l'état local
        const index = searches.value.findIndex(s => s.id === search.id);
        if (index !== -1) {
          searches.value[index].notifications_actives = !search.notifications_actives;
          
          // Mettre à jour client_id dans l'état local si nécessaire
          if (!searches.value[index].client_id && searches.value[index].utilisateur) {
            searches.value[index].client_id = searches.value[index].utilisateur;
          }
        }
      } catch (error) {
        console.error('Erreur lors de la modification de l\'alerte:', error);
      }
    }
    
    async function deleteSearch(search) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
        return;
      }
      
      try {
        console.log('Suppression de l\'alerte ID:', search.id);
        await directusSDK.deleteItem('recherches_sauvegardees', search.id);
        
        // Mettre à jour l'état local
        searches.value = searches.value.filter(s => s.id !== search.id);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'alerte:', error);
      }
    }
    
    // Fonctions d'extraction des critères
    function getTypeFromCriteres(search) {
      if (!search.criteres_supplementaires) return null;
      
      try {
        let criteres;
        try {
          criteres = typeof search.criteres_supplementaires === 'string' 
            ? JSON.parse(search.criteres_supplementaires) 
            : search.criteres_supplementaires;
        } catch (parseError) {
          console.warn('Erreur de parsing JSON pour criteres_supplementaires:', parseError);
          return null;
        }
        
        console.log('Structure des critères pour l\'alerte:', search.id, criteres);
        
        // Essayer plusieurs variations possibles pour le type
        if (Array.isArray(criteres.types) && criteres.types.length > 0) {
          return criteres.types[0];
        }
        
        // Si c'est un objet avec des propriétés type_bien, types ou type
        if (criteres.type_bien) return criteres.type_bien;
        if (criteres.type) return criteres.type;
        
        // Si l'objet a une propriété de type tableau avec un nom différent
        for (const key in criteres) {
          if (Array.isArray(criteres[key]) && key.includes('type')) {
            return criteres[key][0];
          }
        }
        
        return null;
      } catch (e) {
        console.error('Erreur lors de l\'extraction du type des critères:', e);
        return null;
      }
    }

    function getLocationFromCriteres(search) {
      if (!search.criteres_supplementaires) return null;
      
      try {
        const criteres = typeof search.criteres_supplementaires === 'string' 
          ? JSON.parse(search.criteres_supplementaires) 
          : search.criteres_supplementaires;
        
        return criteres.localisation || criteres.location;
      } catch (e) {
        console.error('Erreur lors de l\'extraction de la localisation des critères:', e);
        return null;
      }
    }

    function getPriceFromCriteres(search) {
      if (!search.criteres_supplementaires) return null;
      
      try {
        const criteres = typeof search.criteres_supplementaires === 'string' 
          ? JSON.parse(search.criteres_supplementaires) 
          : search.criteres_supplementaires;
        
        return criteres.prix_max || criteres.max_price;
      } catch (e) {
        console.error('Erreur lors de l\'extraction du prix des critères:', e);
        return null;
      }
    }

    function getSurfaceFromCriteres(search) {
      if (!search.criteres_supplementaires) return null;
      
      try {
        const criteres = typeof search.criteres_supplementaires === 'string' 
          ? JSON.parse(search.criteres_supplementaires) 
          : search.criteres_supplementaires;
        
        return criteres.surface_min || criteres.min_surface;
      } catch (e) {
        console.error('Erreur lors de l\'extraction de la surface des critères:', e);
        return null;
      }
    }
    
    function formatType(type) {
      const types = {
        // Valeurs originales
        'apartment': 'Appartement',
        'house': 'Maison',
        'land': 'Terrain',
        'commercial': 'Local commercial',
        'office': 'Bureau',
        // Nouvelles valeurs du formulaire
        'APPARTEMENT': 'Appartement',
        'MAISON': 'Maison',
        'CONSTRUCTION': 'Construction',
        'IMMEUBLE': 'Immeuble',
        'MAISON D\'HÔTE': 'Maison d\'hôte'
      };
      return types[type] || type;
    }
    
    function formatPrice(price) {
      if (!price) return 'N/A';
      return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'EUR',
        maximumFractionDigits: 0 
      }).format(price);
    }
    
    function formatSurface(surface) {
      if (!surface) return 'N/A';
      return `${surface} m²`;
    }
    
    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    }
    
    function encodeSearchCriteria(search) {
      // Encoder les critères pour les utiliser dans l'URL
      return encodeURIComponent(JSON.stringify({
        type: search.type_bien,
        location: search.localisation,
        max_price: search.prix_max,
        min_surface: search.surface_min,
        max_surface: search.surface_max,
        min_bedrooms: search.chambres_min,
        max_bedrooms: search.chambres_max
      }));
    }
    
    // Déclencher le chargement dès le montage
    onMounted(() => {
      if (authStore.isAuthenticated) {
        fetchSearches();
        dataRequested.value = true;
      }
    });
    
    // Chargement initial des données
    let unwatch = null;
    
    if (props.isActive && !dataRequested.value) {
      fetchSearches();
      dataRequested.value = true;
    } else {
      unwatch = watch(() => props.isActive, (newVal) => {
        if (newVal) {
          fetchSearches();
          dataRequested.value = true;
        }
      });
    }
    
    // Nettoyage à la destruction du composant
    onUnmounted(() => {
      if (unwatch) {
        unwatch();
      }
    });
    
    return {
      loading,
      error,
      errorMessage,
      searches,
      toggleSearchStatus,
      deleteSearch,
      formatType,
      formatPrice,
      formatSurface,
      formatDate,
      encodeSearchCriteria,
      // Ajouter les nouvelles fonctions au retour
      getTypeFromCriteres,
      getLocationFromCriteres,
      getPriceFromCriteres,
      getSurfaceFromCriteres
    };
  }
};
</script>