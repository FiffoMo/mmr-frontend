  // server/api/codes-promo/appliquer.post.js
  export default defineEventHandler(async (event) => {
    try {
      const body = await readBody(event);
      const { codePromoId, clientId, commandeId, montantReduction } = body;
  
      // Validation des paramètres
      if (!codePromoId || !clientId || !commandeId || montantReduction === undefined) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Paramètres manquants pour l\'application du code promo'
        });
      }
  
      // Vérifier que le code promo n'a pas déjà été utilisé par ce client
      const utilisationExistante = await $fetch('/api/directus/items/utilisations_codes_promo', {
        method: 'GET',
        query: {
          'filter[client_id][_eq]': clientId,
          'filter[code_promo_id][_eq]': codePromoId,
          limit: 1
        }
      });
  
      if (utilisationExistante.data && utilisationExistante.data.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Code promo déjà utilisé par ce client'
        });
      }
  
      // Enregistrer l'utilisation du code promo
      const utilisationResponse = await $fetch('/api/directus/items/utilisations_codes_promo', {
        method: 'POST',
        body: {
          code_promo_id: codePromoId,
          client_id: clientId,
          commande_id: commandeId,
          montant_reduction: parseFloat(montantReduction)
        }
      });
  
      return {
        success: true,
        data: {
          utilisation_id: utilisationResponse.data.id,
          message: 'Code promo appliqué avec succès'
        }
      };
  
    } catch (error) {
      console.error('Erreur application code promo:', error);
      
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Erreur lors de l\'application du code promo'
      });
    }
  });