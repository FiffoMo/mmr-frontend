// server/api/directus/[...].js
export default defineEventHandler(async (event) => {
  // Configuration pour Directus
  const config = useRuntimeConfig();
  const directusUrl = config.public.directusUrl || 'http://localhost:8055';
  const directusToken = config.directusApiToken || 'Qqq_txN484Kd4C8_pQajEDBl4xqmG3vr';
  
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
    
    // Récupérer les headers de la requête originale
    const headers = event.node.req.headers;
    
    // Options de requête
    const options = {
      method: event.method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    };
    
    // Gérer l'authentification: soit par token API soit par cookie/header Auth
    if (headers.authorization) {
      // Si le client envoie un header Authorization, l'utiliser tel quel
      options.headers['Authorization'] = headers.authorization;
    } else if (headers.cookie) {
      // Si un cookie est présent, le transmettre
      options.headers['Cookie'] = headers.cookie;
    } else {
      // Pour certaines routes publiques qui nécessitent une authentification API
      // Vérifiez d'abord si c'est une route qui devrait être accessible sans authentification
      const publicRoutes = [
        '/items/Annonces', 
        '/items/articles', 
        '/items/articles_categories', 
        '/items/produits',
        '/items/publicite',
        '/items/mise_en_avant'
      ];
      const needsDefaultAuth = publicRoutes.some(route => pathWithoutQuery.includes(route));
      
      if (needsDefaultAuth) {
        // N'utiliser le token API par défaut que pour les routes qui en ont besoin
        options.headers['Authorization'] = `Bearer ${directusToken}`;
        console.log('Utilisation du token API par défaut pour route publique');
      }
    }
    
    // Ajouter un corps pour les requêtes POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(event.method)) {
      const body = await readBody(event);
      
      // Déboguer le corps pour voir ce qui est envoyé
      console.log('Corps de la requête:', {
        bodyType: typeof body,
        body: body,
        hasEmail: body && 'email' in body
      });
      
      if (body) {
        // Si on est sur la route d'authentification, assurer que le corps est correct
        if (pathWithoutQuery.includes('/auth/login')) {
          console.log('Détection route auth/login, vérification du corps');
          
          // S'assurer que le corps est bien formaté pour l'authentification
          const loginBody = {
            email: body.email,
            password: body.password
          };
          
          console.log('Corps login reformaté:', loginBody);
          options.body = JSON.stringify(loginBody);
        } else {
          // Pour les autres routes, utiliser le corps tel quel
          options.body = JSON.stringify(body);
        }
      }
    }
    
    // Faire la requête à Directus
    const response = await fetch(targetUrl, options);
    
    // Récupérer tous les headers de la réponse
    const responseHeaders = Object.fromEntries(response.headers.entries());
    
    // Transférer les cookies de Directus vers le client si présents
    if (responseHeaders['set-cookie']) {
      event.node.res.setHeader('Set-Cookie', responseHeaders['set-cookie']);
    }
    
    // Si la réponse n'est pas OK
    if (!response.ok) {
      console.error(`Erreur Directus: ${response.status}`);
      const errorText = await response.text();
      console.error('Détail erreur:', errorText);
      
      // Essayer de parser l'erreur comme JSON, sinon renvoyer le texte brut
      let errorBody;
      try {
        errorBody = JSON.parse(errorText);
      } catch {
        errorBody = { error: errorText };
      }
      
      // Renvoyer le statut et le corps de l'erreur
      return {
        statusCode: response.status,
        body: errorBody
      };
    }
    
    // Retourner la réponse en JSON
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