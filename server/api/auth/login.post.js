// server/api/auth/login.post.js
import { defineEventHandler, readBody } from 'h3';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    console.log('LOGIN API: Tentative de connexion pour:', body.email);
    
    // Appel direct à l'API Directus pour la connexion
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password
      })
    });
    
    console.log('LOGIN API: Statut réponse Directus:', response.status);
    
    const data = await response.json();
    console.log('LOGIN API: Données reçues de Directus:', {
      hasData: !!data.data,
      hasToken: !!data.data?.access_token,
      tokenPreview: data.data?.access_token ? data.data.access_token.substring(0, 20) + '...' : 'N/A'
    });
    
    if (!response.ok) {
      console.error('LOGIN API: Erreur login Directus:', data);
      
      throw createError({
        statusCode: response.status,
        statusMessage: data.errors?.[0]?.message || 'Erreur de connexion'
      });
    }
    
    return data;
    
  } catch (error) {
    console.error('LOGIN API: Erreur dans login.post.js:', error);
    throw error;
  }
});