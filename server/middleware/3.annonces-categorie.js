// 3.annonces-categorie.js
export default defineEventHandler(async (event) => {
  // Vérifiez si la route commence par /api/annonces
  if (!event.path.startsWith('/api/annonces')) {
    return;
  }

  // Configuration
  const directusUrl = 'http://localhost:8055';
  const directusToken = 'OrpaglfnzQVxvUvK6Dv6ULJErlPVnpw1';

  // Vérifier si c'est une requête pour une annonce spécifique
  const annonceIdMatch = event.path.match(/^\/api\/annonces\/(\d+)$/);
  if (annonceIdMatch) {
    const annonceId = annonceIdMatch[1];
    console.log(`Requête pour annonce spécifique: ${annonceId}`);
    
    try {
      const apiUrl = `${directusUrl}/items/Annonces/${annonceId}`;
      console.log(`Fetching annonce details from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Annonce ${annonceId} récupérée`);
      
      return {
        success: true,
        annonce: data.data
      };
    } catch (error) {
      console.error(`Erreur: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sinon, traiter comme une requête de liste d'annonces
  const query = getQuery(event);
  const { category, location, maxPrice, chambres } = query;
  
  console.log("Paramètres de recherche:", { category, location, maxPrice, chambres });
  
  try {
    // Construction de l'URL avec les filtres
    let apiUrl = `${directusUrl}/items/Annonces?fields=*`;
    
    // Ajouter les filtres de recherche
    if (category) {
      apiUrl += `&filter[categorie_annonce][_eq]=${encodeURIComponent(category)}`;
    }
    
    if (location) {
      apiUrl += `&filter[localisation][_contains]=${encodeURIComponent(location)}`;
    }
    
    if (maxPrice && !isNaN(parseInt(maxPrice))) {
      apiUrl += `&filter[prix_vente][_lte]=${parseInt(maxPrice)}`;
    }
    
    if (chambres && !isNaN(parseInt(chambres))) {
      apiUrl += `&filter[chambres][_gte]=${parseInt(chambres)}`;
    }

    // Statut publié
    if (!query.all) {
      apiUrl += '&filter[status][_eq]=published';
    }

    // Pagination
    if (query.limit) {
      apiUrl += `&limit=${query.limit}`;
    } else {
      apiUrl += '&limit=20';
    }
    
    if (query.page) {
      apiUrl += `&page=${query.page}`;
    }
    
    // Tri par date
    apiUrl += '&sort=-date_created';

    console.log(`Fetching annonces list from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Annonces récupérées: ${data.data?.length || 0}`);

    return {
      success: true,
      annonces: data.data || [],
      total: data.meta?.total_count || 0,
      currentPage: parseInt(query.page) || 1,
      totalPages: Math.ceil((data.meta?.total_count || 0) / (parseInt(query.limit) || 20))
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      success: false,
      error: error.message,
      annonces: []
    };
  }
});