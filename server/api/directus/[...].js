// server/api/directus/[...].js - Proxy pour Directus
import { defineEventHandler, getRequestURL, readBody } from 'h3';

// Configuration API Directus
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_API_TOKEN = process.env.DIRECTUS_API_TOKEN || 'Qqq_txN484Kd4C8_pQajEDBl4xqmG3vr';
const DIRECTUS_EMAIL_TOKEN = process.env.DIRECTUS_EMAIL_TOKEN;

// Liste des routes nécessitant le token email pour certaines fonctionnalités
const EMAIL_ROUTES = [
  '/items/contact',
  '/items/newsletter'
];

// Alternative à useAuthStore pour l'environnement serveur
const getAuthToken = () => {
  // Dans l'environnement serveur, nous utilisons toujours le token API par défaut
  // car nous n'avons pas accès au localStorage ou au store client
  return DIRECTUS_API_TOKEN;
};

export default defineEventHandler(async (event) => {
  try {
    // Récupérer tous les segments après /api/directus/
    const requestUrl = getRequestURL(event);
    const segments = requestUrl.pathname.split('/api/directus/').pop();
    
    // Si segments vide, renvoyer une erreur 404
    if (!segments) {
      return {
        statusCode: 404,
        body: {
          error: 'Route Directus non spécifiée'
        }
      };
    }
    
    // Construire l'URL vers Directus
    let directusRequestUrl = `${DIRECTUS_URL}/${segments}`;
    
    // Ajouter les paramètres de requête s'ils existent
    if (requestUrl.search) {
      // Conserver le format des champs tel quel
      if (requestUrl.search.includes('fields=*')) {
        console.log('Format de champs conservé: fields=*');
      }
      directusRequestUrl += requestUrl.search;
    }
    
    console.log('Proxy Directus - Requête:', directusRequestUrl);
    
    // Déterminer le token à utiliser
    let token = DIRECTUS_API_TOKEN;
    
    // Vérifier si la route nécessite le token email
    const isEmailRoute = EMAIL_ROUTES.some(route => segments.startsWith(route));
    if (isEmailRoute && DIRECTUS_EMAIL_TOKEN) {
      console.log('Utilisation du token email pour route:', segments);
      token = DIRECTUS_EMAIL_TOKEN;
    } else {
      console.log('Utilisation du token API par défaut pour route publique');
    }
    
    // Options de requête par défaut
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      method: event.method
    };
    
    // Ajouter le corps de la requête pour les méthodes POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(event.method)) {
      const body = await readBody(event);
      
      // Log pour le débogage
      console.log('Corps de la requête:', {
        bodyType: typeof body,
        body,
        hasEmail: body && typeof body === 'object' && 'email' in body
      });
      
      requestOptions.body = JSON.stringify(body);
    }
    
    console.log('Proxy Directus - Requête complète:', directusRequestUrl, requestOptions);
    
    // Effectuer la requête à Directus
    const response = await fetch(directusRequestUrl, requestOptions);
    const data = await response.json();
    
    // Si la réponse n'est pas OK, capturer les détails de l'erreur
    if (!response.ok) {
      console.error('Erreur Directus:', response.status);
      console.error('Détail erreur:', JSON.stringify(data));
      
      return {
        statusCode: response.status,
        body: data
      };
    }
    
    // Renvoyer la réponse de Directus
    return data;
  } catch (error) {
    console.error('Erreur proxy Directus:', error);
    
    return {
      statusCode: 500,
      body: {
        error: 'Erreur interne du serveur',
        message: error.message
      }
    };
  }
});