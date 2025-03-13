// 4.annonce-detail.js
export default defineEventHandler(async (event) => {
  // Vérifier si la requête concerne une annonce spécifique
  if (!event.path.match(/^\/api\/annonces\/\d+$/)) {
    return;
  }

  // Extraire l'ID directement du chemin
  const annonceId = event.path.split('/').pop();
  console.log(`Requête détail annonce - ID: ${annonceId}`);
  
  // Configuration
  const directusUrl = 'http://localhost:8055';
  const directusToken = 'OrpaglfnzQVxvUvK6Dv6ULJErlPVnpw1';
  
  try {
    const apiUrl = `${directusUrl}/items/Annonces/${annonceId}`;
    console.log(`Requête envoyée à Directus: ${apiUrl}`);
    
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
    console.log(`Données récupérées pour l'annonce ${annonceId}`);
    
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