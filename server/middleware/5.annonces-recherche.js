// 5.annonces-recherche.js - server/middleware/5.annonces-recherche.js
export default defineEventHandler(async (event) => {
    const url = getRequestURL(event);
    
    // Capture uniquement les requêtes vers /api/annonces/recherche
    if (url.pathname === '/api/annonces/recherche' && event.node.req.method === 'GET') {
      try {
        // Récupérer les paramètres de la requête
        const query = getQuery(event);
        const {
          type,
          prix_max,
          surface_min,
          chambres_min,
          rentabilite_min,
          localisation
        } = query;
        
        console.log('Recherche d\'annonces avec les critères:', query);
        
        // Construire le filtre pour Directus
        let filter = {};
        
        if (type) {
          filter.type = { _eq: type };
        }
        
        if (prix_max) {
          filter.prix = { _lte: parseInt(prix_max) };
        }
        
        if (surface_min) {
          filter.surface = { _gte: parseInt(surface_min) };
        }
        
        if (chambres_min) {
          filter.chambres = { _gte: parseInt(chambres_min) };
        }
        
        if (rentabilite_min) {
          filter.rentabilite = { _gte: parseFloat(rentabilite_min) };
        }
        
        if (localisation) {
          // Recherche sur plusieurs champs
          filter._or = [
            { ville: { _contains: localisation } },
            { code_postal: { _contains: localisation } },
            { adresse: { _contains: localisation } }
          ];
        }
        
        // Construire les paramètres de requête
        const filterParams = `?filter=${JSON.stringify(filter)}&fields=*,images.*`;
        
        // Importer fetch de manière dynamique
        const { default: fetch } = await import('node-fetch');
        
        // URL Directus et token
        const directusUrl = 'http://localhost:8055';
        const directusToken = 'OrpaglfnzQVxvUvK6Dv6ULJErlPVnpw1';
        
        // Appel à l'API Directus
        const response = await fetch(`${directusUrl}/items/annonces${filterParams}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${directusToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erreur Directus: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`${result.data.length} annonces trouvées`);
        
        return {
          success: true,
          annonces: result.data
        };
        
      } catch (error) {
        console.error('Erreur lors de la recherche d\'annonces:', error);
        
        return {
          statusCode: 500,
          error: 'Une erreur est survenue lors de la recherche d\'annonces',
          message: error.message
        };
      }
    }
  });