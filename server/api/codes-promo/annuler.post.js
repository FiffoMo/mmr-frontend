    // server/api/codes-promo/annuler.post.js
  export default defineEventHandler(async (event) => {
    try {
      const body = await readBody(event);
      const { utilisationId } = body;
  
      if (!utilisationId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'ID d\'utilisation requis'
        });
      }
  
      // Supprimer l'utilisation (le trigger décrémentera automatiquement usage_actuel)
      await $fetch(`/api/directus/items/utilisations_codes_promo/${utilisationId}`, {
        method: 'DELETE'
      });
  
      return {
        success: true,
        message: 'Utilisation du code promo annulée'
      };
  
    } catch (error) {
      console.error('Erreur annulation code promo:', error);
      
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Erreur lors de l\'annulation du code promo'
      });
    }
  });