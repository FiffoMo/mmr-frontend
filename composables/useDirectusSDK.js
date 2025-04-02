// composables/useDirectusSDK.js
import { ref } from 'vue';

export const useDirectusSDK = () => {
  const loading = ref(false);
  const error = ref(null);
  
  /**
   * Fonction de base pour les appels API via le proxy Nuxt
   * @param {string} endpoint - Chemin de l'API Directus (sans /api/directus)
   * @param {object} options - Options fetch supplémentaires
   * @returns {Promise} - Résultat de l'appel API
   */
  const apiCall = async (endpoint, options = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Utiliser le proxy d'API pour tous les appels
      const url = `/api/directus${endpoint}`;
      console.log(`SDK: Appel API via proxy: ${url}`);
      
      // S'assurer que les credentials sont inclus
      const fetchOptions = {
        ...options,
        credentials: 'include'
      };
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Erreur HTTP ${response.status}` }));
        console.error('SDK: Erreur API:', errorData);
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('SDK: Réponse API reçue', data);
      
      // Directus renvoie toujours les données dans un objet "data"
      return data.data;
    } catch (err) {
      console.error('SDK: Erreur API détaillée:', err);
      error.value = err.message || 'Une erreur est survenue';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Récupérer le profil de l'utilisateur courant
   * @param {Array} fields - Champs à récupérer
   * @returns {Promise} - Données utilisateur
   */
  const getUserProfile = async (fields = ['*', 'avatar.*']) => {
    const fieldsStr = Array.isArray(fields) ? fields.join(',') : fields;
    return apiCall(`/users/me?fields=${fieldsStr}`);
  };
  
  /**
   * Mettre à jour le profil utilisateur
   * @param {object} userData - Données à mettre à jour
   * @returns {Promise} - Données utilisateur mises à jour
   */
  const updateUserProfile = async (userData) => {
    console.log('SDK: Mise à jour du profil avec données:', userData);
    return apiCall('/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
  };
  
  /**
   * Récupérer des éléments d'une collection
   * @param {string} collection - Nom de la collection
   * @param {object} params - Paramètres de filtre, tri, etc.
   * @returns {Promise} - Éléments de la collection
   */
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
  
  /**
   * Récupérer un élément spécifique
   * @param {string} collection - Nom de la collection
   * @param {string} id - ID de l'élément
   * @param {object} params - Paramètres additionnels
   * @returns {Promise} - Élément spécifique
   */
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
  
  /**
   * Créer un nouvel élément
   * @param {string} collection - Nom de la collection
   * @param {object} data - Données à insérer
   * @returns {Promise} - Élément créé
   */
  const createItem = async (collection, data) => {
    return apiCall(`/items/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  };
  
  /**
   * Mettre à jour un élément
   * @param {string} collection - Nom de la collection
   * @param {string} id - ID de l'élément
   * @param {object} data - Données à mettre à jour
   * @returns {Promise} - Élément mis à jour
   */
  const updateItem = async (collection, id, data) => {
    return apiCall(`/items/${collection}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  };
  
  /**
   * Supprimer un élément
   * @param {string} collection - Nom de la collection
   * @param {string} id - ID de l'élément
   * @returns {Promise} - Confirmation de suppression
   */
  const deleteItem = async (collection, id) => {
    return apiCall(`/items/${collection}/${id}`, {
      method: 'DELETE'
    });
  };
  
  /**
   * Uploader un fichier
   * @param {File} file - Fichier à uploader
   * @param {object} fileInfo - Métadonnées du fichier
   * @returns {Promise} - Fichier uploadé
   */
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
  
  // === FONCTIONS SPÉCIFIQUES POUR LES COLLECTIONS DU PROJET ===
  
  /**
   * Récupérer les préférences de notifications
   * @returns {Promise} - Préférences de notifications
   */
  const getNotificationPreferences = async () => {
    return getItems('preferences_notifications', {
      filter: { user: { _eq: '$CURRENT_USER' } }
    });
  };
  
  /**
   * Récupérer les favoris de l'utilisateur
   * @returns {Promise} - Favoris de l'utilisateur
   */
  const getUserFavorites = async () => {
    return getItems('favoris', {
      filter: {
        user: { _eq: '$CURRENT_USER' }
      },
      fields: ['*', 'annonce.*']
    });
  };
  
  /**
   * Supprimer un favori
   * @param {string} id - ID du favori
   * @returns {Promise} - Confirmation de suppression
   */
  const removeFavorite = async (id) => {
    return deleteItem('favoris', id);
  };
  
  /**
   * Récupérer les commandes/forfaits de l'utilisateur
   * @returns {Promise} - Commandes de l'utilisateur
   */
  const getUserOrders = async () => {
    return getItems('commandes', {
      filter: {
        user: { _eq: '$CURRENT_USER' }
      },
      fields: ['*', 'produit.*'],
      sort: ['-date_creation']
    });
  };
  
  /**
   * Récupérer les annonces de l'utilisateur
   * @returns {Promise} - Annonces de l'utilisateur
   */
  const getUserListings = async () => {
    return getItems('annonces', {
      filter: {
        user: { _eq: '$CURRENT_USER' }
      },
      fields: ['*', 'commande.*'],
      sort: ['-date_creation']
    });
  };

  // Exposer les fonctions
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
    uploadFile,
    getNotificationPreferences,
    getUserFavorites,
    removeFavorite,
    getUserOrders,
    getUserListings
  };
};