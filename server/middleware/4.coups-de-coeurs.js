// 4.coups-de-coeurs.js - Middleware pour récupérer les annonces en mise en avant (coups de coeur)
export default defineEventHandler(async (event) => {
    // Vérifier si la route correspond
    if (!event.path.startsWith('/api/coups-de-coeur')) {
      return;
    }
  
    // Configuration
    const directusUrl = 'http://localhost:8055';
    const directusToken = 'OrpaglfnzQVxvUvK6Dv6ULJErlPVnpw1';
    
    try {
      // Approche alternative: récupérer d'abord les IDs d'annonce depuis les mises en avant
      let apiUrl = `${directusUrl}/items/mise_en_avant?fields=id,annonce&limit=10`;
      
      console.log(`Fetching mise_en_avant from: ${apiUrl}`);
  
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`Erreur API Directus: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log(`Mises en avant récupérées: ${data.data?.length || 0}`);
      
      // Afficher le détail des mises en avant pour débogage
      console.log('Mises en avant (brut):', JSON.stringify(data.data, null, 2));
      
      // Extraire les IDs d'annonce uniques et valides (non null)
      const annonceIds = [...new Set(data.data
        .filter(item => item.annonce)
        .map(item => item.annonce))];
        
      console.log(`IDs d'annonce extraits: ${annonceIds.length}`, annonceIds);
      
      // Si aucun ID d'annonce n'est trouvé, retourner une liste vide
      if (annonceIds.length === 0) {
        return {
          success: true,
          annonces: [],
          total: 0
        };
      }
      
      // Approche alternative et plus simple - récupérer directement toutes les annonces
      // puis filtrer celles qui sont en mise en avant
      const annoncesUrl = `${directusUrl}/items/Annonces?fields=*&filter[status][_eq]=published`;
      
      console.log(`Fetching annonces: ${annoncesUrl}`);
      
      const annoncesResponse = await fetch(annoncesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!annoncesResponse.ok) {
        throw new Error(`Erreur API Directus: ${annoncesResponse.status} - ${annoncesResponse.statusText}`);
      }
      
      const annoncesData = await annoncesResponse.json();
      console.log(`Toutes les annonces récupérées: ${annoncesData.data?.length || 0}`);
      
      // Filtrer uniquement les annonces qui sont en mise en avant
      const annoncesMiseEnAvant = annoncesData.data
        .filter(annonce => annonceIds.includes(annonce.id))
        .slice(0, 6);
        
      console.log(`Annonces mises en avant filtrées: ${annoncesMiseEnAvant.length}`);
      
      return {
        success: true,
        annonces: annoncesMiseEnAvant || [],
        total: annoncesMiseEnAvant.length || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des coups de coeur:', error);
      return {
        success: false,
        error: error.message,
        annonces: []
      };
    }
  });