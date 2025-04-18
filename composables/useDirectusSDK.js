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
    try {
      // Récupérer d'abord le profil utilisateur pour obtenir l'ID
      const user = await getUserProfile(['id']);
      
      if (!user || !user.id) {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }
      
      // Utiliser client_id au lieu de utilisateur
      return getItems('preferences_notifications', {
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
        const userId = error.userId || (await getUserProfile(['id']))?.id;
        if (!userId) {
          throw new Error('ID utilisateur non disponible');
        }
        
        // Utiliser client_id au lieu de utilisateur
        const response = await fetch(`/api/directus/items/favoris?filter[client_id][_eq]=${userId}&fields=id,status,date_created,client_id,annonce.id,annonce.Titre,annonce.prix_vente,annonce.localisation,annonce.surface_habitable,annonce.pieces,annonce.chambres,annonce.image_principale`);
        
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
        client_id: { _eq: userId },
        // Utiliser la valeur correcte 'annonces' pour le type de produit
        type_produit: { _eq: 'annonces' }
      },
      fields: '*,produit.*',
      sort: '-date_created'
    });
    
    if (!commandes || commandes.length === 0) {
      // Si aucune commande n'est trouvée avec ce filtre, essayer sans le filtre type_produit
      // car il se peut que les enregistrements existants n'aient pas ce champ rempli
      console.log('Aucune commande trouvée avec le filtre type_produit. Essai sans ce filtre...');
      
      const toutesCommandes = await getItems('commandes', {
        filter: {
          client_id: { _eq: userId }
        },
        fields: '*,produit.*',
        sort: '-date_created'
      });
      
      if (!toutesCommandes || toutesCommandes.length === 0) {
        return [];
      }
      
      // Filtrer manuellement les commandes qui semblent être des forfaits d'annonces
      // en se basant sur les autres propriétés
      const commandesFiltrees = toutesCommandes.filter(commande => 
        commande.produit && 
        (commande.produit.type_produit === 'annonces' || 
         commande.annonces_restantes !== null ||
         (commande.produit.nom && commande.produit.nom.toLowerCase().includes('annonce')))
      );
      
      if (commandesFiltrees.length === 0) {
        return [];
      }
      
      // Continuer avec les commandes filtrées
      return await traiterCommandes(commandesFiltrees);
    }
    
    // Continuer avec les commandes trouvées avec le filtre exact
    return await traiterCommandes(commandes);
    
  } catch (error) {
    console.error('Erreur dans getUserForfaitsWithListings:', error);
    
    // Implémentation de secours avec un timeout pour éviter les blocages
    const timeout = setTimeout(() => {
      console.warn('Timeout atteint lors de la récupération des forfaits');
      return [];
    }, 5000);
    
    try {
      // Essayer une approche alternative plus directe
      if (!userId) {
        const user = await getUserProfile(['id']);
        userId = user?.id;
      }
      
      // Récupération directe via fetch
      const response = await fetch(`/api/directus/items/commandes?filter[client_id][_eq]=${userId}&fields=*,produit.*`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      const commandes = result.data || [];
      
      // Filtrer les forfaits d'annonces
      const forfaits = commandes.filter(commande => 
        commande.type_produit === 'annonces' || 
        (commande.produit && commande.produit.type_produit === 'annonces')
      );
      
      if (forfaits.length === 0) {
        clearTimeout(timeout);
        return [];
      }
      
      // Pour chaque forfait, récupérer les annonces associées
      const forfaritsAvecAnnonces = await Promise.all(
        forfaits.map(async (forfait) => {
          try {
            const annonceResponse = await fetch(`/api/directus/items/annonces?filter[commande_id][_eq]=${forfait.id}&fields=*`, {
              credentials: 'include'
            });
            
            if (!annonceResponse.ok) {
              return {
                ...forfait,
                annonces: []
              };
            }
            
            const annonceResult = await annonceResponse.json();
            return {
              id: forfait.id,
              client_id: forfait.client_id,
              date_debut: forfait.date_debut,
              date_fin: forfait.date_fin,
              status: forfait.status,
              forfait_type: forfait.produit?.nom || 'Forfait',
              description: forfait.produit?.description || '',
              nombre_annonces_total: forfait.produit?.nombre || 0,
              nombre_annonces_restantes: forfait.annonces_restantes || 0,
              duree_jours: forfait.produit?.duree_jours || 0,
              prix: forfait.montant || forfait.produit?.prix || 0,
              est_actif: new Date(forfait.date_fin) > new Date() && forfait.status === 'published',
              reference: forfait.reference,
              annonces: annonceResult.data || []
            };
          } catch (e) {
            console.error(`Erreur lors de la récupération des annonces pour le forfait ${forfait.id}:`, e);
            return {
              ...forfait,
              annonces: []
            };
          }
        })
      );
      
      clearTimeout(timeout);
      return forfaritsAvecAnnonces;
    } catch (altError) {
      clearTimeout(timeout);
      console.error('Erreur alternative dans getUserForfaitsWithListings:', altError);
      return [];
    }
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