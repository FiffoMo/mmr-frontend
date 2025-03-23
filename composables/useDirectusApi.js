// composables/useDirectusApi.js
import { ref } from 'vue'

export const useDirectusApi = () => {
  const loading = ref(false)
  const error = ref(null)

  // Configuration de base
  const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055'
  
  /**
   * Fonction utilitaire pour les appels à l'API
   * @param {string} endpoint - Endpoint API Directus
   * @param {object} options - Options de la requête
   * @returns {Promise} - Promesse avec le résultat
   */
  const fetchApi = async (endpoint, options = {}) => {
    loading.value = true
    error.value = null
    
    try {
      // Récupérer le token d'authentification depuis le localStorage ou cookie
      let token = null
      if (process.client) {
        token = localStorage.getItem('auth_token')
      }
      
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      }
      
      // Ajouter le token si disponible
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${directusUrl}${endpoint}`, {
        ...options,
        headers
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.message || 'Une erreur est survenue')
      }
      
      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Récupérer les informations du profil utilisateur
   * @returns {Promise} - Promesse avec les données utilisateur
   */
  const getUserProfile = async () => {
    return fetchApi('/users/me?fields=*,avatar.*')
  }
  
  /**
   * Mettre à jour le profil utilisateur
   * @param {object} userData - Données à mettre à jour
   * @returns {Promise} - Promesse avec les données mises à jour
   */
  const updateUserProfile = async (userData) => {
    return fetchApi('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(userData)
    })
  }
  
  /**
   * Récupérer les préférences de notifications
   * @returns {Promise} - Promesse avec les préférences
   */
  const getNotificationPreferences = async () => {
    return fetchApi('/items/preferences_notifications?filter[user][_eq]=$CURRENT_USER')
  }
  
  /**
   * Mettre à jour les préférences de notifications
   * @param {object} preferences - Nouvelles préférences
   * @returns {Promise} - Promesse avec les données mises à jour
   */
  const updateNotificationPreferences = async (id, preferences) => {
    return fetchApi(`/items/preferences_notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(preferences)
    })
  }
  
  /**
   * Récupérer les favoris de l'utilisateur
   * @returns {Promise} - Promesse avec les favoris
   */
  const getUserFavorites = async () => {
    return fetchApi('/items/favoris?filter[user][_eq]=$CURRENT_USER&fields=*,annonce.*')
  }
  
  /**
   * Supprimer un favori
   * @param {string} id - ID du favori
   * @returns {Promise} - Promesse avec la confirmation
   */
  const removeFavorite = async (id) => {
    return fetchApi(`/items/favoris/${id}`, {
      method: 'DELETE'
    })
  }
  
  /**
   * Récupérer les commandes/forfaits de l'utilisateur
   * @returns {Promise} - Promesse avec les commandes
   */
  const getUserOrders = async () => {
    return fetchApi('/items/commandes?filter[user][_eq]=$CURRENT_USER&fields=*,produit.*&sort=-date_creation')
  }
  
  /**
   * Récupérer les annonces de l'utilisateur
   * @returns {Promise} - Promesse avec les annonces
   */
  const getUserListings = async () => {
    return fetchApi('/items/annonces?filter[user][_eq]=$CURRENT_USER&fields=*,commande.*&sort=-date_creation')
  }
  
  /**
   * Modifier le statut d'une annonce (suspendue/active)
   * @param {string} id - ID de l'annonce
   * @param {string} status - Nouveau statut
   * @returns {Promise} - Promesse avec l'annonce mise à jour
   */
  const updateListingStatus = async (id, status) => {
    return fetchApi(`/items/annonces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }
  
  /**
   * Déplacer une annonce vers un autre forfait
   * @param {string} id - ID de l'annonce
   * @param {string} commandeId - ID du forfait de destination
   * @returns {Promise} - Promesse avec l'annonce mise à jour
   */
  const moveListingToOrder = async (id, commandeId) => {
    return fetchApi(`/items/annonces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ commande: commandeId })
    })
  }
  
  /**
   * Récupérer les publicités de l'utilisateur
   * @returns {Promise} - Promesse avec les publicités
   */
  const getUserAds = async () => {
    return fetchApi('/items/publicite?filter[user][_eq]=$CURRENT_USER&fields=*&sort=-date_creation')
  }
  
  /**
   * Modifier le statut d'une publicité (suspendue/active)
   * @param {string} id - ID de la publicité
   * @param {string} status - Nouveau statut
   * @returns {Promise} - Promesse avec la publicité mise à jour
   */
  const updateAdStatus = async (id, status) => {
    return fetchApi(`/items/publicite/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  }
  
  /**
   * Récupérer les infos sur la mise en avant active
   * @returns {Promise} - Promesse avec les données de mise en avant
   */
  const getActiveHighlight = async () => {
    return fetchApi('/items/mise_en_avant?filter[user][_eq]=$CURRENT_USER&filter[date_expiration][_gt]=$NOW&fields=*,annonce.*&limit=1')
  }
  
  /**
   * Mettre à jour l'annonce mise en avant
   * @param {string} id - ID de la mise en avant
   * @param {string} annonceId - ID de la nouvelle annonce à mettre en avant
   * @returns {Promise} - Promesse avec la mise en avant mise à jour
   */
  const updateHighlightedListing = async (id, annonceId) => {
    return fetchApi(`/items/mise_en_avant/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ annonce: annonceId })
    })
  }
  
  /**
   * Récupérer les recherches sauvegardées de l'utilisateur
   * @returns {Promise} - Promesse avec les recherches
   */
  const getUserSearches = async () => {
    return fetchApi('/items/recherches_sauvegardees?filter[user][_eq]=$CURRENT_USER&fields=*&sort=-date_creation')
  }
  
  /**
   * Supprimer une recherche sauvegardée
   * @param {string} id - ID de la recherche
   * @returns {Promise} - Promesse avec la confirmation
   */
  const removeSearch = async (id) => {
    return fetchApi(`/items/recherches_sauvegardees/${id}`, {
      method: 'DELETE'
    })
  }
  
  return {
    loading,
    error,
    getUserProfile,
    updateUserProfile,
    getNotificationPreferences,
    updateNotificationPreferences,
    getUserFavorites,
    removeFavorite,
    getUserOrders,
    getUserListings,
    updateListingStatus,
    moveListingToOrder,
    getUserAds,
    updateAdStatus,
    getActiveHighlight,
    updateHighlightedListing,
    getUserSearches,
    removeSearch
  }
}