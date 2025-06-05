// server/api/auth/me.get.js
import { defineEventHandler, getHeader } from 'h3';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

export default defineEventHandler(async (event) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = getHeader(event, 'authorization') || getHeader(event, 'Authorization');
    
    console.log('ME API: Header Authorization reçu:', authHeader ? 'Présent' : 'Absent');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('ME API: Token manquant ou format incorrect');
      throw createError({
        statusCode: 401,
        statusMessage: 'Token manquant'
      });
    }
    
    const token = authHeader.substring(7);
    console.log('ME API: Récupération des données utilisateur avec token:', token.substring(0, 20) + '...');
    
    // Appel direct à l'API Directus pour récupérer les données utilisateur
    const response = await fetch(`${DIRECTUS_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('ME API: Statut réponse Directus:', response.status);
    
    const data = await response.json();
    console.log('ME API: Données utilisateur reçues:', {
      hasData: !!data.data,
      userId: data.data?.id,
      userEmail: data.data?.email
    });
    
    if (!response.ok) {
      console.error('ME API: Erreur récupération utilisateur:', data);
      
      throw createError({
        statusCode: response.status,
        statusMessage: data.errors?.[0]?.message || 'Erreur récupération utilisateur'
      });
    }
    
    return data;
    
  } catch (error) {
    console.error('ME API: Erreur dans me.get.js:', error);
    throw error;
  }
});