// server/api/annonces/search.js
export default defineEventHandler(async (event) => {
  try {
    // Récupérer les paramètres de la requête
    const query = getQuery(event);
    
    console.log("Paramètres de recherche bruts reçus:", query);
    
    // URL de base pour l'API Directus
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    const directusToken = process.env.DIRECTUS_TOKEN;
    
    // Construction des paramètres de requête pour Directus
    let apiUrl = `${directusUrl}/items/Annonces?fields=*,image_principale.*&filter[status][_eq]=published`;
    
    // Stocker les filtres pour un second filtrage côté serveur
    const serverFilters = {};
    
    // Filtrer par catégorie
    if (query.category && query.category !== '') {
      apiUrl += `&filter[categorie_annonce][_eq]=${encodeURIComponent(query.category)}`;
      serverFilters.category = query.category;
    }
    
    // Filtrer par localisation
    if (query.location && query.location !== '') {
      apiUrl += `&filter[localisation][_contains]=${encodeURIComponent(query.location)}`;
      serverFilters.location = query.location.toLowerCase();
    }
    
    // Filtrer par prix maximum
    if (query.maxPrice && query.maxPrice !== '') {
      apiUrl += `&filter[prix_vente][_lte]=${encodeURIComponent(query.maxPrice)}`;
      serverFilters.maxPrice = parseFloat(query.maxPrice);
    }
    
    // Filtrer par nombre de chambres minimum
    if (query.chambres_min && query.chambres_min !== '') {
      apiUrl += `&filter[chambres][_gte]=${encodeURIComponent(query.chambres_min)}`;
      serverFilters.chambres_min = parseInt(query.chambres_min, 10);
    }
    
    // Filtrer par surface minimum
    if (query.surface_min && query.surface_min !== '') {
      apiUrl += `&filter[surface_habitable][_gte]=${encodeURIComponent(query.surface_min)}`;
      serverFilters.surface_min = parseFloat(query.surface_min);
    }
    
    // Filtrer par mots-clés
    if (query.keywords && query.keywords !== '') {
      apiUrl += `&filter[Description][_contains]=${encodeURIComponent(query.keywords)}`;
      serverFilters.keywords = query.keywords.toLowerCase();
    }
    
    // Ajout du tri (le plus récent d'abord)
    apiUrl += '&sort=-date_created';
    
    console.log("URL de recherche Directus COMPLÈTE:", apiUrl);
    
    // Appel à l'API Directus
    // Ajouter un en-tête spécifique qui pourrait être requis
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${directusToken}`,
      'Cache-Control': 'no-cache'  // Pour éviter les problèmes de cache
    };
    
    // Ajouter le token d'authentification si disponible
    if (directusToken) {
      headers['Authorization'] = `Bearer ${directusToken}`;
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API Directus: ${response.status}`);
    }
    
    const data = await response.json();
    let annonces = data.data || [];
    
    console.log(`Première étape: ${annonces.length} annonces trouvées via l'API Directus`);
    
    // DEUXIÈME FILTRE: Appliquer un filtrage côté serveur pour être sûr que les critères sont respectés
    if (serverFilters.surface_min) {
      console.log(`Filtrage supplémentaire par surface >= ${serverFilters.surface_min}`);
      const annoncesBefore = annonces.length;
      
      annonces = annonces.filter(annonce => {
        // S'assurer que la surface est un nombre
        const surface = parseFloat(annonce.surface_habitable);
        
        if (isNaN(surface)) {
          console.log(`Annonce ${annonce.id} a une surface non numérique: ${annonce.surface_habitable}`);
          return false;
        }
        
        const result = surface >= serverFilters.surface_min;
        if (!result) {
          console.log(`Annonce ${annonce.id} filtrée: surface ${surface} < ${serverFilters.surface_min}`);
        }
        return result;
      });
      
      console.log(`Après filtrage par surface: ${annonces.length}/${annoncesBefore} annonces restantes`);
    }
    
    // Si d'autres filtres sont nécessaires, les appliquer ici...
    
    // Filtrage pour le rendement
    if (serverFilters.rentabilite_min) {
      const annoncesBefore = annonces.length;
      annonces = annonces.filter(annonce => {
        if (!annonce.prix_vente || !annonce.prix_location) return false;
        const yieldValue = (annonce.prix_location * 12 / annonce.prix_vente) * 100;
        return yieldValue >= serverFilters.rentabilite_min;
      });
      
      console.log(`Après filtrage par rendement: ${annonces.length}/${annoncesBefore} annonces restantes`);
    }
    
    // Logs des annonces finales pour débogage
    console.log(`Résultat final: ${annonces.length} annonces`);
    if (annonces.length > 0) {
      console.log("Exemples d'annonces trouvées:");
      annonces.slice(0, 3).forEach(annonce => {
        console.log(`ID: ${annonce.id}, Titre: ${annonce.Titre}, Surface: ${annonce.surface_habitable}, Catégorie: ${annonce.categorie_annonce}`);
      });
    }
    
    // Retourner les résultats
    return {
      success: true,
      annonces,
      total: annonces.length,
      query: query,
      currentPage: 1,
      totalPages: 1
    };
    
  } catch (error) {
    console.error('Erreur complète recherche annonces:', error);
    return {
      success: false,
      error: error.message || "Erreur lors de la recherche d'annonces"
    };
  }
});