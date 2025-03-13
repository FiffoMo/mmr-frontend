export default defineEventHandler(async (event) => {
    const id = event.context.params.id;
    console.log(`API Route - Détail annonce ID: ${id}`);
    
    // Configuration
    const directusUrl = 'http://localhost:8055';
    const directusToken = 'OrpaglfnzQVxvUvK6Dv6ULJErlPVnpw1';
    
    try {
      const apiUrl = `${directusUrl}/items/Annonces/${id}`;
      console.log(`Requête Directus: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`Directus: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(`Données annonce ${id} récupérées`);
      
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
  });