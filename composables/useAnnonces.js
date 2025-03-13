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
  
  // IDs des annonces en mise en avant (à remplacer par détection dynamique)
  const coupsDeCoeurIds = [12, 7, 9, 10, 11];
  
  /**
   * Déterminer si une annonce est un coup de coeur
   */
  const isCoupDeCoeur = (annonce) => {
    // Support pour recevoir soit un ID soit un objet annonce
    const annonceId = typeof annonce === 'object' ? annonce.id : annonce;
    return coupsDeCoeurIds.includes(Number(annonceId));
  };
  
  /**
   * Récupérer les dernières annonces
   */
  const fetchRecentAnnonces = async (limit = 9) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`/api/annonces?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        annonces.value = data.annonces;
      } else {
        error.value = data.error || 'Erreur lors du chargement des annonces';
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des annonces';
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
      const response = await fetch('/api/coups-de-coeur');
      const data = await response.json();
      
      if (data.success) {
        coupsDeCoeur.value = data.annonces;
      } else {
        error.value = data.error || 'Erreur lors du chargement des coups de coeur';
      }
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des coups de coeur';
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Récupérer une annonce par son ID
   */
  const fetchAnnonceById = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log(`Récupération de l'annonce ${id}`);
      const response = await fetch(`/api/annonces/${id}`);
      const data = await response.json();
      
      console.log("Réponse:", data);
      
      if (data.success) {
        annonceDetail.value = data.annonce;
      } else {
        error.value = data.error || 'Erreur lors du chargement de l\'annonce';
      }
    } catch (err) {
      console.error(err);
      error.value = err.message || 'Erreur lors du chargement de l\'annonce';
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
    fetchAnnonceById
  };
}