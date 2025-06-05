// composables/useDirectusSDK.js - VERSION CORRIGÉE
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
      
      // CORRECTION: Import correct du store d'authentification
      const { useAuthStore } = await import('@/stores/useAuthStore');
      const authStore = useAuthStore();
      
      // S'assurer que les credentials sont inclus
      const fetchOptions = {
        ...options,
        credentials: 'include'
      };
      
      // Ajouter le token d'authentification si disponible
      if (authStore.token) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Authorization': `Bearer ${authStore.token}`
        };
        console.log(`SDK: Token utilisateur ajouté: ${authStore.token.substring(0, 20)}...`);
      } else {
        console.log('SDK: Aucun token utilisateur disponible');
      }
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Erreur HTTP ${response.status}` }));
        console.error('SDK: Erreur API:', errorData);
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('SDK: Réponse API reçue', data);
      
      // CORRECTION: Directus peut retourner différentes structures
      // Pour /users/me, les données peuvent être directement dans la réponse
      if (data.data !== undefined) {
        return data.data;  // Structure standard {data: {...}}
      } else if (data.id !== undefined) {
        return data;       // Structure directe pour certaines opérations users
      } else {
        return data;       // Retourner la réponse complète
      }
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
    // Vérifier si c'est une collection qui utilise utilisateur et non client_id
    if ((collection === 'favoris' || collection === 'recherches_sauvegardees') && data.client_id && !data.utilisateur) {
      // Ajouter le champ utilisateur avec la même valeur que client_id
      console.log(`Ajout du champ utilisateur pour la collection ${collection}`);
      data = {
        ...data,
        utilisateur: data.client_id
      };
    }
    
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
    try {
      // Récupérer d'abord le profil utilisateur pour obtenir l'ID
      const user = await getUserProfile(['id']);
      
      if (!user || !user.id) {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }
      
      // CORRECTION: Utiliser user_preferences au lieu de preferences_notifications
      return getItems('user_preferences', {
        filter: { client_id: { _eq: user.id } }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences de notifications:', error);
      return [];
    }
  };
  
  /**
   * Récupérer les favoris de l'utilisateur
   * @returns {Promise} - Favoris de l'utilisateur
   */
  const getUserFavorites = async () => {
    try {
      // Récupérer d'abord le profil utilisateur pour obtenir l'ID
      const user = await getUserProfile(['id']);
      
      if (!user || !user.id) {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }
      
      // Utiliser client_id au lieu de utilisateur
      return getItems('favoris', {
        filter: {
          client_id: { _eq: user.id }
        },
        fields: 'id,status,date_created,client_id,annonce.id,annonce.Titre,annonce.prix_vente,annonce.localisation,annonce.surface_habitable,annonce.pieces,annonce.chambres,annonce.image_principale'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      
      // Essayer avec fetch directement en cas d'erreur avec getItems
      try {
        const { useAuthStore } = await import('@/stores/useAuthStore');
        const authStore = useAuthStore();
        const userId = error.userId || (await getUserProfile(['id']))?.id;
        
        if (!userId) {
          throw new Error('ID utilisateur non disponible');
        }
        
        // CORRECTION: Utiliser le pattern harmonisé avec filtres JSON encodés
        const filter = encodeURIComponent(JSON.stringify({ client_id: { _eq: userId } }));
        const response = await fetch(`/api/directus/items/favoris?filter=${filter}&fields=id,status,date_created,client_id,annonce.id,annonce.Titre,annonce.prix_vente,annonce.localisation,annonce.surface_habitable,annonce.pieces,annonce.chambres,annonce.image_principale`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data || [];
      } catch (fetchError) {
        console.error('Erreur lors de la récupération directe des favoris:', fetchError);
        return [];
      }
    }
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
    try {
      // Récupérer d'abord le profil utilisateur pour obtenir l'ID
      const user = await getUserProfile(['id']);
      
      if (!user || !user.id) {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }
      
      // Utiliser client_id au lieu de client
      return getItems('commandes', {
        filter: {
          client_id: { _eq: user.id }
        },
        fields: '*,produit.*',
        sort: '-date_created'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return [];
    }
  };
  
  /**
   * Récupérer les annonces de l'utilisateur
   * @returns {Promise} - Annonces de l'utilisateur
   */
  const getUserListings = async () => {
    try {
      // Récupérer d'abord le profil utilisateur pour obtenir l'ID
      const user = await getUserProfile(['id']);
      
      if (!user || !user.id) {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }
      
      // Utiliser client_id au lieu de user_created
      return getItems('annonces', {
        filter: {
          client_id: { _eq: user.id }
        },
        fields: '*,commande_id.*',
        sort: '-date_created'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
      return [];
    }
  };

  /**
   * Récupérer les conversations de l'utilisateur
   * @returns {Promise} - Conversations de l'utilisateur
   */
  const getUserConversations = async () => {
    try {
      // Récupérer d'abord le profil utilisateur pour obtenir l'ID
      const user = await getUserProfile(['id']);
      
      if (!user || !user.id) {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }
      
      // Utiliser client_id au lieu de user_proprietaire
      return getItems('conversations', {
        filter: { 
          client_id: { _eq: user.id } 
        },
        fields: '*,annonce.*',
        sort: '-date_updated'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return [];
    }
  };
  
  /**
   * Récupérer les recherches sauvegardées de l'utilisateur
   * @returns {Promise} - Recherches sauvegardées
   */
  const getUserSavedSearches = async () => {
    try {
      // Récupérer d'abord le profil utilisateur pour obtenir l'ID
      const user = await getUserProfile(['id']);
      
      if (!user || !user.id) {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }
      
      // Utiliser client_id au lieu de utilisateur
      return getItems('recherches_sauvegardees', {
        filter: {
          client_id: { _eq: user.id }
        },
        fields: '*'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des recherches sauvegardées:', error);
      return [];
    }
  };
  
  /**
   * Récupérer les mises en avant de l'utilisateur
   * @returns {Promise} - Mises en avant
   */
  const getUserHighlights = async () => {
    try {
      // Récupérer d'abord le profil utilisateur pour obtenir l'ID
      const user = await getUserProfile(['id']);
      
      if (!user || !user.id) {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }
      
      // Utiliser client_id au lieu de client
      return getItems('mise_en_avant', {
        filter: {
          client_id: { _eq: user.id }
        },
        fields: '*,annonce.*'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des mises en avant:', error);
      return [];
    }
  };

/**
 * Récupérer les forfaits utilisateur avec leurs annonces associées
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise} - Forfaits utilisateur avec annonces
 */
const getUserForfaitsWithListings = async (userId) => {
  try {
    if (!userId) {
      // Si userId n'est pas fourni, récupérer l'ID de l'utilisateur courant
      const user = await getUserProfile(['id']);
      userId = user?.id;
      
      if (!userId) {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }
    }
    
    // 1. Récupérer les commandes de l'utilisateur (qui sont des forfaits d'annonces)
    const commandes = await getItems('commandes', {
      filter: {
        client_id: { _eq: userId }
      },
      fields: '*,produit.*',
      sort: '-date_created'
    });
    
    if (!commandes || commandes.length === 0) {
      return [];
    }
    
    // 2. Filtrer pour ne garder que les forfaits d'annonces
    const forfaitsAnnonces = commandes.filter(commande => {
      const typeProduit = commande.type_produit || (commande.produit && commande.produit.type_produit) || '';
      const nomProduit = (commande.produit?.nom || '').toLowerCase();
      
      // Inclure explicitement les forfaits d'Annonces
      if (typeProduit === 'Annonces' || typeProduit === 'annonces') {
        return true;
      }
      
      // Inclure si le nom contient des mots-clés d'annonces
      if (nomProduit.includes('annonce') || nomProduit.includes('basic') || 
          nomProduit.includes('premium') || nomProduit.includes('dixit')) {
        return true;
      }
      
      // Exclure explicitement mise en avant et publicité
      if (typeProduit.includes('mise') || typeProduit.includes('pub') ||
          nomProduit.includes('mise en avant') || nomProduit.includes('pub')) {
        return false;
      }
      
      // Par défaut, inclure si type_produit est vide (compatibilité)
      return typeProduit === '';
    });
    
    // Continuer avec les forfaits filtrés
    return await traiterCommandes(forfaitsAnnonces);
    
  } catch (error) {
    console.error('Erreur dans getUserForfaitsWithListings:', error);
    return [];
  }
};

// Fonction helper pour traiter les commandes et récupérer leurs annonces
async function traiterCommandes(commandes) {
  // Pour chaque commande, récupérer les annonces associées
  return await Promise.all(
    commandes.map(async (commande) => {
      try {
        // Récupérer les annonces liées à cette commande
        const annonces = await getItems('annonces', {
          filter: {
            commande_id: { _eq: commande.id }
          },
          fields: '*'
        });
        
        // Construire un objet qui ressemble à ce qu'aurait retourné user_forfaits
        return {
          id: commande.id,
          client_id: commande.client_id,
          date_debut: commande.date_debut,
          date_fin: commande.date_fin,
          status: commande.status,
          forfait_type: commande.produit?.nom || 'Forfait',
          description: commande.produit?.description || '',
          nombre_annonces_total: commande.produit?.nombre || 0,
          nombre_annonces_restantes: commande.annonces_restantes || 0,
          duree_jours: commande.produit?.duree_jours || 0,
          prix: commande.montant || commande.produit?.prix || 0,
          est_actif: new Date(commande.date_fin) > new Date() && commande.status === 'published',
          reference: commande.reference,
          annonces: annonces || []
        };
      } catch (e) {
        console.error(`Erreur lors de la récupération des annonces pour la commande ${commande.id}:`, e);
        return {
          ...commande,
          annonces: []
        };
      }
    })
  );
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
    getUserListings,
    getUserConversations,
    getUserSavedSearches,
    getUserHighlights,
    getUserForfaitsWithListings
  };
};