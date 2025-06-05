// server/api/directus/[...].js - Proxy corrigé pour Directus avec debug
import { defineEventHandler, getRequestURL, readBody, getHeader } from 'h3';

// Configuration API Directus
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_API_TOKEN = process.env.DIRECTUS_API_TOKEN || 'Qqq_txN484Kd4C8_pQajEDBl4xqmG3vr';
const DIRECTUS_EMAIL_TOKEN = process.env.DIRECTUS_EMAIL_TOKEN;

// Liste des routes nécessitant le token email pour certaines fonctionnalités
const EMAIL_ROUTES = [
  '/items/contact',
  '/items/newsletter'
];

// Routes qui nécessitent le token admin (gestion système)
const ADMIN_ROUTES = [
  '/server/health',
  '/server/info',
  '/settings',
  '/flows',
  '/operations',
  '/permissions',
  '/roles',
  '/presets'
];

// Routes publiques qui n'ont pas besoin d'authentification
const PUBLIC_ROUTES = [
  '/items/annonces',
  '/items/articles',
  '/items/pages',
  '/files/', // Pour les images publiques
  '/assets/' // Pour les assets publiques
];

// Routes d'authentification qui doivent passer sans token utilisateur
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/logout',
  '/auth/refresh',
  '/auth/password/request',
  '/auth/password/reset',
  '/users' // Pour la création d'utilisateur (inscription)
];

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
      directusRequestUrl += requestUrl.search;
    }
    
    console.log('Proxy Directus - Requête:', directusRequestUrl);
    console.log('Méthode:', event.method);
    
    // LOGIQUE DE SÉLECTION DU TOKEN (CORRIGÉE AVEC DEBUG)
    let token = null;
    let tokenSource = '';
    
    // 1. Vérifier d'abord si c'est une route d'authentification
    const isAuthRoute = AUTH_ROUTES.some(route => segments.startsWith(route.replace('/', '')));
    
    // 2. Vérifier si c'est une route admin
    const isAdminRoute = ADMIN_ROUTES.some(route => segments.startsWith(route.replace('/', '')));
    
    // 3. Vérifier si c'est une route email spéciale
    const isEmailRoute = EMAIL_ROUTES.some(route => segments.startsWith(route.replace('/items/', '')));
    
    // 4. Vérifier si c'est une route publique
    const isPublicRoute = PUBLIC_ROUTES.some(route => segments.startsWith(route.replace('/', '')));
    
    if (isAuthRoute) {
      // Routes d'authentification : gestion spéciale
      if (segments.startsWith('users') && event.method === 'POST') {
        // Création d'utilisateur : utiliser le token admin
        token = DIRECTUS_API_TOKEN;
        tokenSource = 'admin (création utilisateur)';
      } else if (segments.startsWith('auth/login') || segments.startsWith('auth/logout') || segments.startsWith('auth/refresh')) {
        // Routes d'auth login/logout : pas de token
        tokenSource = 'aucun (authentification)';
      } else if (segments.startsWith('users/me')) {
        console.log('🔍 DEBUG: Route users/me détectée');
        // SOLUTION TEMPORAIRE: Forcer admin pour éviter token corrompu
        console.warn('Route /users/me forcée vers admin pour éviter token corrompu');
        token = DIRECTUS_API_TOKEN;
        tokenSource = 'admin (force fallback users/me)';
      } else {
        // Autres routes d'auth : pas de token
        tokenSource = 'aucun (authentification)';
      }
    } else if (isAdminRoute) {
      // Routes admin : toujours utiliser le token admin
      token = DIRECTUS_API_TOKEN;
      tokenSource = 'admin (route système)';
    } else if (isEmailRoute && DIRECTUS_EMAIL_TOKEN) {
      // Routes email : utiliser le token email si disponible
      token = DIRECTUS_EMAIL_TOKEN;
      tokenSource = 'email';
    } else {
      // TOUTES LES AUTRES ROUTES : Essayer d'utiliser le token utilisateur
      const authHeader = getHeader(event, 'authorization') || getHeader(event, 'Authorization');
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Utiliser le token de l'utilisateur connecté
        token = authHeader.substring(7); // Enlever "Bearer "
        tokenSource = 'utilisateur connecté';
        console.log('Token utilisateur détecté:', token.substring(0, 10) + '...');
      } else if (isPublicRoute) {
        // Route publique sans authentification
        tokenSource = 'aucun (route publique)';
      } else {
        // Route protégée sans token utilisateur : utiliser le token admin en fallback
        token = DIRECTUS_API_TOKEN;
        tokenSource = 'admin (fallback)';
        console.warn(`Route protégée sans token utilisateur: ${segments}`);
      }
    }
    
    console.log(`Token utilisé: ${tokenSource}`);
    
    // Options de requête
    const requestOptions = {
      method: event.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Ajouter l'autorisation si on a un token
    if (token) {
      requestOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Transférer d'autres headers importants du client
    const headersToForward = ['user-agent', 'accept-language', 'x-forwarded-for'];
    headersToForward.forEach(headerName => {
      const headerValue = getHeader(event, headerName);
      if (headerValue) {
        requestOptions.headers[headerName] = headerValue;
      }
    });
    
    // Ajouter le corps de la requête pour les méthodes POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(event.method)) {
      const body = await readBody(event);
      
      // Vérifier si c'est un upload de fichier
      const contentType = getHeader(event, 'content-type') || '';
      const isFileUpload = segments === 'files' && contentType.includes('multipart/form-data');
      
      if (isFileUpload) {
        // Pour les uploads : supprimer le Content-Type et laisser le navigateur le gérer
        delete requestOptions.headers['Content-Type'];
        requestOptions.body = body;
      } else {
        // Pour les autres requêtes : convertir en JSON
        requestOptions.body = JSON.stringify(body);
      }
      
      console.log('Corps de la requête:', {
        type: isFileUpload ? 'file' : 'json',
        hasData: !!body
      });
    }
    
    console.log('Proxy Directus - Requête finale:', {
      url: directusRequestUrl,
      method: event.method,
      hasAuth: !!token,
      tokenSource
    });
    
    // Effectuer la requête à Directus
    const response = await fetch(directusRequestUrl, requestOptions);
    
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // Si la réponse n'est pas du JSON valide
      const textResponse = await response.text();
      console.error('Réponse non-JSON de Directus:', textResponse);
      
      return {
        statusCode: response.status,
        body: {
          error: 'Réponse invalide de Directus',
          details: textResponse
        }
      };
    }
    
    // Si la réponse n'est pas OK, capturer les détails de l'erreur
    if (!response.ok) {
      console.error('Erreur Directus:', {
        status: response.status,
        statusText: response.statusText,
        url: directusRequestUrl,
        tokenSource,
        error: data
      });
      
      return {
        statusCode: response.status,
        body: data
      };
    }
    
    // Log de succès pour les opérations importantes
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.method)) {
      console.log(`Succès ${event.method} sur ${segments} avec token ${tokenSource}`);
    }
    
    // Renvoyer la réponse de Directus
    return data;
    
  } catch (error) {
    console.error('Erreur proxy Directus:', error);
    
    return {
      statusCode: 500,
      body: {
        error: 'Erreur interne du serveur',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };
  }
});