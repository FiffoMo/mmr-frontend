// server/api/alertes-email/index.js
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  // Ne traiter que les requêtes POST
  if (event.method !== 'POST') {
    return {
      statusCode: 405,
      body: { error: 'Méthode non autorisée' }
    };
  }

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
    
    // Utiliser notre proxy Directus
    const directusResponse = await $fetch('/api/directus/items/alertes_email', {
      method: 'POST',
      body: alerteData
    });
    
    // Ici, vous pourriez implémenter l'envoi de l'email de confirmation
    // ...
    
    return {
      success: true,
      message: 'Alerte créée avec succès. Veuillez confirmer votre email.',
      data: directusResponse.data
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
});