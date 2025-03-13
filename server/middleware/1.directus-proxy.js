// server/middleware/1.directus-proxy.js
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  
  // Ne traiter que les requêtes à l'URL spécifique
  if (url.pathname === '/api/alertes-email' && event.node.req.method === 'POST') {
    try {
      const body = await readBody(event);
      
      // Validation des données
      if (!body.email) {
        return {
          statusCode: 400,
          body: { error: 'L\'adresse email est obligatoire' }
        };
      }
      
      console.log('Données reçues:', body);
      
      // Générer un token unique pour confirmation
      const token = uuidv4();
      
      // Préparer les données pour Directus
      const alerteData = {
        email: body.email,
        types: Array.isArray(body.types) ? body.types : [],
        prix_max: body.prix_max || null,
        surface_min: body.surface_min || null,
        localisation: body.localisation || null,
        rentabilite_min: body.rentabilite_min || null,
        frequence_quotidienne: body.frequence_quotidienne || false,
        accept_confidentialite: body.accept_confidentialite || false,
        token_confirmation: token,
        status: 'inactive'
      };
      
      // Utiliser node-fetch (importé dynamiquement)
      const { default: fetch } = await import('node-fetch');
      
      // URL et token codés en dur pour le test
      const directusUrl = 'http://localhost:8055';
      const directusToken = 'vb_N7Ta-SBiSHbXYNL3TXnYMyKABZU_U';
      
      console.log('Envoi à Directus:', alerteData);
      
      // Appel à l'API Directus
      const response = await fetch(`${directusUrl}/items/alertes_email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${directusToken}`
        },
        body: JSON.stringify(alerteData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur Directus:', response.status, errorText);
        throw new Error(`Erreur lors de la création: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Réponse de Directus:', result);
      
      return {
        success: true,
        message: 'Alerte créée avec succès. Veuillez confirmer votre email.',
        data: result.data
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
      
      return {
        statusCode: 500,
        body: { 
          error: 'Une erreur est survenue lors du traitement de votre demande',
          message: error.message
        }
      };
    }
  }
});