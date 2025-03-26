/**
 * Service centralisé pour la gestion des annonces
 */
import { ref, computed } from 'vue';

export function useAnnonces() {
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
    
    try {
      // Utilisation du nouveau proxy Directus
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit);
      queryParams.append('filter[status][_eq]', 'published');
      queryParams.append('sort', '-date_created');
      
      const response = await fetch(`/api/directus/items/Annonces?${queryParams.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        annonces.value = data.data || [];
        return {
          success: true,
          annonces: data.data || [],
          total: data.meta?.total_count || 0
        };
      } else {
        const errorMsg = data?.errors?.[0]?.message || 'Erreur lors du chargement des annonces';
        error.value = errorMsg;
        return {
          success: false,
          error: errorMsg,
          annonces: []
        };
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des annonces';
      return {
        success: false,
        error: err.message,
        annonces: []
      };
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Récupérer les coups de coeur
   */
  const fetchCoupsDeCoeur = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // D'abord récupérer les mises en avant
      const miseEnAvantResponse = await fetch('/api/directus/items/mise_en_avant?fields=id,annonce&limit=10');
      
      if (!miseEnAvantResponse.ok) {
        throw new Error(`Erreur lors de la récupération des mises en avant: ${miseEnAvantResponse.status}`);
      }
      
      const miseEnAvantData = await miseEnAvantResponse.json();
      
      // Extraire les IDs d'annonce
      const annonceIds = miseEnAvantData.data
        .filter(item => item.annonce)
        .map(item => item.annonce);
      
      if (annonceIds.length === 0) {
        coupsDeCoeur.value = [];
        return {
          success: true,
          annonces: [],
          total: 0
        };
      }
      
      // Construire le filtre pour récupérer ces annonces
      const queryParams = new URLSearchParams();
      queryParams.append('filter[status][_eq]', 'published');
      
      // Ajouter chaque ID d'annonce comme filtre
      annonceIds.forEach(id => {
        queryParams.append('filter[id][_in]', id);
      });
      
      const response = await fetch(`/api/directus/items/Annonces?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des annonces coups de coeur: ${response.status}`);
      }
      
      const data = await response.json();
      coupsDeCoeur.value = data.data || [];
      
      return {
        success: true,
        annonces: data.data || [],
        total: data.data?.length || 0
      };
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des coups de coeur';
      return {
        success: false,
        error: err.message,
        annonces: []
      };
    } finally {
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
    
    try {
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
      loading.value = false;
    }
  };

  /**
   * Rechercher des annonces avec des filtres
   */
  const searchAnnonces = async (searchParams) => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log("Début recherche avec paramètres:", searchParams);
      
      // Construire les paramètres de requête pour Directus
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
    searchAnnonces
  };
}