/**
 * Service centralisé pour la gestion des annonces
 */
import { ref, computed } from 'vue';
import { useDirectusSDK } from '~/composables/useDirectusSDK';

export function useAnnonces() {
  // Accès au SDK Directus
  const directusSDK = useDirectusSDK();
  
  // État interne
  const annonces = ref([]);
  const annonceDetail = ref(null);
  const coupsDeCoeur = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  /**
   * Récupérer les dernières annonces
   */
  const fetchRecentAnnonces = async (limit = 9) => {
    loading.value = true;
    error.value = null;
    
    // Configuration du timeout
    const timeout = setTimeout(() => {
      if (loading.value) {
        loading.value = false;
        annonces.value = [];
        error.value = "La requête a pris trop de temps à s'exécuter";
      }
    }, 5000);
    
    try {
      // Utiliser directement l'approche par URL avec bon formatage des paramètres
      // Les logs montrent que le SDK a des problèmes de formatage d'URL
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit);
      queryParams.append('filter[status][_eq]', 'published');
      queryParams.append('sort', '-date_created'); // Le format de tri paraît causer des problèmes
      
      console.log("Tentative de récupération des annonces récentes via URL directe");
      const response = await fetch(`/api/directus/items/Annonces?${queryParams.toString()}`);
      
      if (!response.ok) {
        // Si erreur 403 sur le tri, essayer sans tri
        if (response.status === 403) {
          console.warn("Erreur 403 avec le tri, nouvelle tentative sans tri");
          const simpleParams = new URLSearchParams();
          simpleParams.append('limit', limit);
          simpleParams.append('filter[status][_eq]', 'published');
          
          const retryResponse = await fetch(`/api/directus/items/Annonces?${simpleParams.toString()}`);
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            annonces.value = retryData.data || [];
            return {
              success: true,
              annonces: retryData.data || [],
              total: retryData.meta?.total_count || 0
            };
          } else {
            throw new Error(`Échec de la récupération même sans tri: ${retryResponse.status}`);
          }
        } else {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      // Vérification et protection contre les données manquantes
      if (!data || !data.data) {
        console.warn("La réponse ne contient pas de données valides");
        annonces.value = [];
        return {
          success: false,
          annonces: [],
          total: 0
        };
      }
      
      // Traitement des données
      annonces.value = data.data || [];
      return {
        success: true,
        annonces: data.data || [],
        total: data.meta?.total_count || 0
      };
    } catch (err) {
      console.error("Erreur lors du chargement des annonces:", err);
      error.value = err.message || 'Erreur lors du chargement des annonces';
      annonces.value = []; // Toujours initialiser à vide
      return {
        success: false,
        error: err.message,
        annonces: []
      };
    } finally {
      clearTimeout(timeout);
      loading.value = false;
    }
  };
  
  /**
   * Récupérer les coups de coeur
   */
  const fetchCoupsDeCoeur = async () => {
    loading.value = true;
    error.value = null;
    
    // Configuration du timeout
    const timeout = setTimeout(() => {
      if (loading.value) {
        loading.value = false;
        coupsDeCoeur.value = [];
        error.value = "La requête a pris trop de temps à s'exécuter";
      }
    }, 5000);
    
    try {
      // Préférer une approche robuste avec gestion des erreurs
      try {
        // 1. Approche directe simplifiée - nécessaire car le SDK a des problèmes d'URL
        const miseEnAvantResponse = await fetch('/api/directus/items/mise_en_avant?fields=id,annonce&limit=10');
        
        if (!miseEnAvantResponse.ok) {
          console.warn(`Récupération des mises en avant a échoué: ${miseEnAvantResponse.status}`);
          coupsDeCoeur.value = [];  // Initialiser à vide par défaut
          return {
            success: false,
            annonces: [],
            total: 0
          };
        }
        
        const miseEnAvantData = await miseEnAvantResponse.json();
        
        // Vérification et protection contre les données manquantes
        if (!miseEnAvantData || !miseEnAvantData.data) {
          console.warn("La réponse de mise_en_avant ne contient pas de données valides");
          coupsDeCoeur.value = [];
          return {
            success: false,
            annonces: [],
            total: 0
          };
        }
        
        // Extraire les IDs d'annonce de manière sécurisée
        const annonceIds = miseEnAvantData.data
          .filter(item => item && item.annonce)
          .map(item => item.annonce);
        
        if (annonceIds.length === 0) {
          console.log("Aucun ID d'annonce trouvé dans les mises en avant");
          coupsDeCoeur.value = [];
          return {
            success: true,
            annonces: [],
            total: 0
          };
        }
        
        // Récupérer les annonces individuellement au lieu d'utiliser _in qui peut causer des problèmes
        const annoncesPromises = annonceIds.map(id => 
          fetch(`/api/directus/items/Annonces/${id}?fields=*`)
            .then(res => res.ok ? res.json() : null)
            .then(data => data?.data)
            .catch(error => {
              console.warn(`Erreur lors de la récupération de l'annonce ${id}:`, error);
              return null;
            })
        );
        
        const annoncesResults = await Promise.allSettled(annoncesPromises);
        const annonces = annoncesResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => result.value);
        
        console.log(`Récupération réussie de ${annonces.length} annonces coups de coeur`);
        coupsDeCoeur.value = annonces;
        
        return {
          success: true,
          annonces: annonces,
          total: annonces.length
        };
      } catch (innerErr) {
        console.error("Échec de l'approche directe:", innerErr);
        
        // 2. Approche alternative très simplifiée sans SDK
        // Récupérer directement quelques annonces récentes comme fallback
        const fallbackResponse = await fetch('/api/directus/items/Annonces?limit=6&fields=*');
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const fallbackAnnonces = fallbackData.data || [];
          
          console.log("Utilisation du fallback pour les coups de coeur");
          coupsDeCoeur.value = fallbackAnnonces;
          
          return {
            success: true,
            annonces: fallbackAnnonces,
            total: fallbackAnnonces.length
          };
        } else {
          throw new Error("Toutes les tentatives de récupération ont échoué");
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement des coups de coeur:", err);
      error.value = err.message || 'Erreur lors du chargement des coups de coeur';
      coupsDeCoeur.value = []; // Toujours initialiser à vide
      return {
        success: false,
        error: err.message,
        annonces: []
      };
    } finally {
      clearTimeout(timeout);
      loading.value = false;
    }
  };
  
  /**
   * Déterminer si une annonce est un coup de coeur
   */
  const isCoupDeCoeur = (annonce) => {
    // Support pour recevoir soit un ID soit un objet annonce
    const annonceId = typeof annonce === 'object' ? annonce.id : annonce;
    return coupsDeCoeur.value.some(item => item.id === annonceId);
  };
  
  /**
   * Récupérer une annonce par son ID
   */
  const fetchAnnonceById = async (id) => {
    loading.value = true;
    error.value = null;
    
    // Configuration du timeout
    const timeout = setTimeout(() => {
      if (loading.value) {
        loading.value = false;
        annonceDetail.value = null;
        error.value = "La requête a pris trop de temps à s'exécuter";
      }
    }, 5000);
    
    try {
      // 1. Essayer d'abord avec le SDK
      const result = await directusSDK.getItem('Annonces', id);
      
      if (result) {
        annonceDetail.value = result;
        return {
          success: true,
          annonce: result
        };
      }
      
      // 2. Fallback direct
      console.log(`Récupération de l'annonce ${id}`);
      const response = await fetch(`/api/directus/items/Annonces/${id}`);
      const data = await response.json();
      
      console.log("Réponse:", data);
      
      if (response.ok) {
        annonceDetail.value = data.data;
        return {
          success: true,
          annonce: data.data
        };
      } else {
        const errorMsg = data?.errors?.[0]?.message || 'Erreur lors du chargement de l\'annonce';
        error.value = errorMsg;
        return {
          success: false,
          error: errorMsg
        };
      }
    } catch (err) {
      console.error(err);
      error.value = err.message || 'Erreur lors du chargement de l\'annonce';
      return {
        success: false,
        error: err.message
      };
    } finally {
      clearTimeout(timeout);
      loading.value = false;
    }
  };

  /**
   * Rechercher des annonces avec des filtres
   */
  const searchAnnonces = async (searchParams) => {
    loading.value = true;
    error.value = null;
    
    // Configuration du timeout
    const timeout = setTimeout(() => {
      if (loading.value) {
        loading.value = false;
        annonces.value = [];
        error.value = "La requête a pris trop de temps à s'exécuter";
      }
    }, 5000);
    
    try {
      console.log("Début recherche avec paramètres:", searchParams);
      
      // 1. Essayer d'abord avec le SDK
      const filter = {
        status: { _eq: 'published' }
      };
      
      // Ajouter les filtres en fonction des paramètres
      if (searchParams.category) {
        filter.categorie_annonce = { _eq: searchParams.category };
      }
      
      if (searchParams.location) {
        filter.localisation = { _contains: searchParams.location };
      }
      
      if (searchParams.maxPrice && !isNaN(parseInt(searchParams.maxPrice))) {
        filter.prix_vente = { _lte: parseInt(searchParams.maxPrice) };
      }
      
      if (searchParams.chambres && !isNaN(parseInt(searchParams.chambres))) {
        filter.chambres = { _gte: parseInt(searchParams.chambres) };
      }
      
      if (searchParams.surface_min && !isNaN(parseInt(searchParams.surface_min))) {
        filter.surface = { _gte: parseInt(searchParams.surface_min) };
      }
      
      if (searchParams.rentabilite_min && !isNaN(parseFloat(searchParams.rentabilite_min))) {
        filter.rentabilite = { _gte: parseFloat(searchParams.rentabilite_min) };
      }
      
      const sdkResult = await directusSDK.getItems('Annonces', {
        filter: filter,
        limit: searchParams.limit || 20,
        page: searchParams.page || 1,
        sort: ['-date_created']
      });
      
      if (sdkResult && sdkResult.length > 0) {
        annonces.value = sdkResult;
        return sdkResult;
      }
      
      // 2. Fallback: Approche directe
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (searchParams.limit) {
        queryParams.append('limit', searchParams.limit);
      } else {
        queryParams.append('limit', 20);
      }
      
      if (searchParams.page) {
        queryParams.append('page', searchParams.page);
      }
      
      // Filtres
      if (searchParams.category) {
        queryParams.append('filter[categorie_annonce][_eq]', searchParams.category);
      }
      
      if (searchParams.location) {
        queryParams.append('filter[localisation][_contains]', searchParams.location);
      }
      
      if (searchParams.maxPrice && !isNaN(parseInt(searchParams.maxPrice))) {
        queryParams.append('filter[prix_vente][_lte]', searchParams.maxPrice);
      }
      
      if (searchParams.chambres && !isNaN(parseInt(searchParams.chambres))) {
        queryParams.append('filter[chambres][_gte]', searchParams.chambres);
      }
      
      if (searchParams.surface_min && !isNaN(parseInt(searchParams.surface_min))) {
        queryParams.append('filter[surface][_gte]', searchParams.surface_min);
      }
      
      if (searchParams.rentabilite_min && !isNaN(parseFloat(searchParams.rentabilite_min))) {
        queryParams.append('filter[rentabilite][_gte]', searchParams.rentabilite_min);
      }
      
      // Statut publié par défaut
      queryParams.append('filter[status][_eq]', 'published');
      
      // Tri par date
      queryParams.append('sort', '-date_created');
      
      const searchUrl = `/api/directus/items/Annonces?${queryParams.toString()}`;
      console.log("URL de recherche:", searchUrl);
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Réponse de recherche complète:", data);
      
      if (data && response.ok) {
        const annoncesList = data.data || [];
        console.log(`Nombre d'annonces trouvées: ${annoncesList.length}`);
        // Forcer la mise à jour de l'état des annonces dans le composable
        annonces.value = annoncesList;
        console.log("État des annonces après mise à jour:", annonces.value);
        return annoncesList;
      } else {
        const errorMsg = data?.errors?.[0]?.message || 'Erreur lors de la recherche';
        console.error("Erreur de succès:", errorMsg);
        error.value = errorMsg;
        annonces.value = []; // Forcer un tableau vide en cas d'erreur
        return [];
      }
    } catch (err) {
      console.error("Erreur complète:", err);
      error.value = err.message || 'Erreur lors de la recherche';
      annonces.value = []; // Forcer un tableau vide en cas d'erreur
      return [];
    } finally {
      clearTimeout(timeout);
      loading.value = false;
    }
  };
  
  /**
   * Créer une alerte email (recherche sauvegardée) pour un utilisateur
   */
  const saveSearchAlert = async (searchParams, userId) => {
    if (!userId) {
      error.value = "Vous devez être connecté pour créer une alerte";
      return {
        success: false,
        error: "Vous devez être connecté pour créer une alerte"
      };
    }
    
    loading.value = true;
    error.value = null;
    
    // Configuration du timeout
    const timeout = setTimeout(() => {
      if (loading.value) {
        loading.value = false;
        error.value = "La requête a pris trop de temps à s'exécuter";
      }
    }, 5000);
    
    try {
      // 1. Essayer d'abord avec le SDK
      const item = {
        client_id: userId, // Utiliser client_id au lieu de utilisateur
        nom: searchParams.nom || "Nouvelle alerte",
        criteres: JSON.stringify(searchParams),
        frequence: searchParams.frequence || "hebdomadaire"
      };
      
      const result = await directusSDK.createItem('recherches_sauvegardees', item);
      
      if (result) {
        return {
          success: true,
          alert: result
        };
      }
      
      // 2. Fallback direct
      const response = await fetch('/api/directus/items/recherches_sauvegardees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: userId, // Utiliser client_id au lieu de utilisateur
          nom: searchParams.nom || "Nouvelle alerte",
          criteres: JSON.stringify(searchParams),
          frequence: searchParams.frequence || "hebdomadaire"
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          alert: data.data
        };
      } else {
        const errorMsg = data?.errors?.[0]?.message || 'Erreur lors de la création de l\'alerte';
        error.value = errorMsg;
        return {
          success: false,
          error: errorMsg
        };
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors de la création de l\'alerte';
      return {
        success: false,
        error: err.message
      };
    } finally {
      clearTimeout(timeout);
      loading.value = false;
    }
  };

  /**
   * Ajouter une annonce aux favoris
   */
  const addToFavorites = async (annonceId, userId) => {
    if (!userId) {
      error.value = "Vous devez être connecté pour ajouter un favori";
      return {
        success: false,
        error: "Vous devez être connecté pour ajouter un favori"
      };
    }
    
    loading.value = true;
    error.value = null;
    
    // Configuration du timeout
    const timeout = setTimeout(() => {
      if (loading.value) {
        loading.value = false;
        error.value = "La requête a pris trop de temps à s'exécuter";
      }
    }, 5000);
    
    try {
      // 1. Essayer d'abord avec le SDK
      const item = {
        client_id: userId, // Utiliser client_id au lieu de utilisateur
        annonce: annonceId,
        date_created: new Date().toISOString()
      };
      
      const result = await directusSDK.createItem('favoris', item);
      
      if (result) {
        return {
          success: true,
          favorite: result
        };
      }
      
      // 2. Fallback direct
      const response = await fetch('/api/directus/items/favoris', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: userId, // Utiliser client_id au lieu de utilisateur
          annonce: annonceId,
          date_created: new Date().toISOString()
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          favorite: data.data
        };
      } else {
        const errorMsg = data?.errors?.[0]?.message || 'Erreur lors de l\'ajout aux favoris';
        error.value = errorMsg;
        return {
          success: false,
          error: errorMsg
        };
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors de l\'ajout aux favoris';
      return {
        success: false,
        error: err.message
      };
    } finally {
      clearTimeout(timeout);
      loading.value = false;
    }
  };
  
  return {
    // État
    annonces,
    annonceDetail,
    coupsDeCoeur,
    loading,
    error,
    
    // Getters
    isCoupDeCoeur,
    
    // Actions
    fetchRecentAnnonces,
    fetchCoupsDeCoeur,
    fetchAnnonceById,
    searchAnnonces,
    saveSearchAlert,
    addToFavorites
  };
}