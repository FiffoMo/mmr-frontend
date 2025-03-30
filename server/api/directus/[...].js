// Fichier à placer dans: mmr-frontend/server/api/directus/[...].js
export default defineEventHandler(async (event) => {
  // Configuration pour Directus
  const directusUrl = 'http://localhost:8055';
  const directusToken = 'Qqq_txN484Kd4C8_pQajEDBl4xqmG3vr'; // Token statique à utiliser en fallback
  
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
    
    // Récupérer le token d'authentification depuis les cookies ou headers
    let userToken = null;
    
    // Option 1: Récupérer le token depuis le header Authorization
    const authHeader = event.node.req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      userToken = authHeader.substring(7);
    }
    
    // Option 2: Récupérer le token depuis un cookie si option 1 échoue
    if (!userToken) {
      const cookies = parseCookies(event);
      userToken = cookies.auth_token;
    }
    
    // Utiliser le token utilisateur s'il existe, sinon utiliser le token statique
    const authToken = userToken || directusToken;
    
    // Options de requête
    const options = {
      method: event.method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
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
    let response = await fetch(targetUrl, options);
    
    // Si la réponse n'est pas OK (401 Unauthorized par exemple)
    if (!response.ok) {
      const status = response.status;
      console.error(`Erreur Directus: ${status}`);
      
      try {
        const errorText = await response.text();
        console.error('Détail erreur:', errorText);
        
        // Si c'est une erreur 401 (non autorisé) et que c'est à cause d'un token expiré
        if (status === 401 && errorText.includes('Token expired')) {
          console.log('Token expiré, utilisation du token statique comme fallback');
          
          // Réessayer avec le token statique
          const fallbackOptions = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${directusToken}`
            }
          };
          
          // Faire une nouvelle requête avec le token statique
          response = await fetch(targetUrl, fallbackOptions);
          
          if (!response.ok) {
            const fallbackErrorText = await response.text();
            console.error('Erreur avec le token fallback:', fallbackErrorText);
            throw new Error(`Erreur Directus même avec token fallback: ${response.status}`);
          }
        } else {
          throw new Error(`Erreur Directus: ${response.status}`);
        }
      } catch (errorParsingError) {
        console.error('Erreur lors du traitement de l\'erreur:', errorParsingError);
        throw new Error(`Erreur Directus: ${response.status}`);
      }
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