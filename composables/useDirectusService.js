// composables/useDirectusService.js
import { ref } from 'vue';

export const useDirectusService = () => {
  const loading = ref(false);
  const error = ref(null);
  
  // Fonction de base pour les appels API
  const apiCall = async (endpoint, options = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const url = `/api/directus${endpoint}`;
      console.log(`Appel API via proxy: ${url}`);
      console.log('Token disponible:', !!localStorage.getItem('auth_token'));
      
      const response = await $fetch(url, options);
      console.log('Réponse API reçue:', response);
      return response;
    } catch (err) {
      console.error('Erreur API détaillée:', err);
      error.value = err.message || 'Une erreur est survenue';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  // ===== UTILISATEURS =====
  
  // Récupérer le profil de l'utilisateur courant
  const getUserProfile = async () => {
    console.log('Service: Récupération du profil utilisateur...');
    console.log('Service: Token disponible:', !!localStorage.getItem('auth_token'));
    return apiCall('/users/me?fields=*,avatar.*');
  };
  
  // Mettre à jour le profil utilisateur
  const updateUserProfile = async (userData) => {
    return apiCall('/users/me', {
      method: 'PATCH',
      body: userData
    });
  };
  
  // ===== COLLECTIONS =====
  
  // Récupérer des éléments d'une collection
  const getItems = async (collection, params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Convertir les paramètres en query string
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiCall(`/items/${collection}${queryString}`);
  };
  
  // Récupérer un élément spécifique
  const getItem = async (collection, id, params = {}) => {
    const queryParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiCall(`/items/${collection}/${id}${queryString}`);
  };
  
  // Créer un nouvel élément
  const createItem = async (collection, data) => {
    return apiCall(`/items/${collection}`, {
      method: 'POST',
      body: data
    });
  };
  
  // Mettre à jour un élément
  const updateItem = async (collection, id, data) => {
    return apiCall(`/items/${collection}/${id}`, {
      method: 'PATCH',
      body: data
    });
  };
  
  // Supprimer un élément
  const deleteItem = async (collection, id) => {
    return apiCall(`/items/${collection}/${id}`, {
      method: 'DELETE'
    });
  };
  
  // ===== FICHIERS =====
  
  // Uploader un fichier
  const uploadFile = async (file, fileInfo = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Ajouter des métadonnées
    for (const [key, value] of Object.entries(fileInfo)) {
      formData.append(key, value);
    }
    
    return apiCall('/files', {
      method: 'POST',
      body: formData
    });
  };
  
  return {
    loading,
    error,
    getUserProfile,
    updateUserProfile,
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    uploadFile
  };
};