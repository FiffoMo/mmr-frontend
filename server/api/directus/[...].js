// server/api/directus/[...].js
export default defineEventHandler(async (event) => {
    // Configuration pour Directus
    const directusUrl = 'http://localhost:8055';
    const directusToken = 'Qqq_txN484Kd4C8_pQajEDBl4xqmG3vr'; // Votre token statique
    
    try {
      // Récupérer le chemin après /api/directus/
      const path = event.path.replace(/^\/api\/directus/, '');
      
      // Extraire la partie du chemin sans les paramètres de requête
      const pathWithoutQuery = path.split('?')[0];
      
      // Récupérer les paramètres de requête de l'URL originale
      const query = getQuery(event);
      
      // Construire une nouvelle chaîne de requête à partir des paramètres
      const queryString = new URLSearchParams(query).toString();
      
      // Construire l'URL complète pour Directus
      const targetUrl = `${directusUrl}${pathWithoutQuery}${queryString ? `?${queryString}` : ''}`;
      
      console.log(`Proxy Directus - Requête: ${targetUrl}`);
      
      // Options de requête
      const options = {
        method: event.method,
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Ajouter un corps pour les requêtes POST, PUT, PATCH
      if (['POST', 'PUT', 'PATCH'].includes(event.method)) {
        const body = await readBody(event);
        if (body) {
          options.body = JSON.stringify(body);
        }
      }
      
      // Faire la requête à Directus
      const response = await fetch(targetUrl, options);
      
      // Si la réponse n'est pas OK
      if (!response.ok) {
        console.error(`Erreur Directus: ${response.status}`);
        const errorText = await response.text();
        console.error('Détail erreur:', errorText);
        return {
          statusCode: response.status,
          body: {
            error: `Erreur Directus: ${response.status}`,
            detail: errorText
          }
        };
      }
      
      // Retourner la réponse
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Erreur proxy Directus:', error);
      return {
        statusCode: 500,
        body: {
          error: 'Erreur interne du proxy Directus',
          message: error.message
        }
      };
    }
  });