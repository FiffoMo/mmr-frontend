// server/api/codes-promo/valider.post.js
export default defineEventHandler(async (event) => {
    try {
      const body = await readBody(event);
      const { code, produitId, clientId } = body;
  
      // Validation des paramètres requis
      if (!code || !produitId || !clientId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Code promo, ID produit et ID client requis'
        });
      }
  
      // 1. Récupérer le code promo
      const codePromoResponse = await $fetch('/api/directus/items/codes_promo', {
        method: 'GET',
        query: {
          'filter[code][_eq]': code,
          'filter[actif][_eq]': true,
          limit: 1
        }
      });
  
      if (!codePromoResponse.data || codePromoResponse.data.length === 0) {
        return {
          success: false,
          error: 'Code promo invalide ou inactif'
        };
      }
  
      const codePromo = codePromoResponse.data[0];
      const maintenant = new Date();
  
      // 2. Vérifications de validité
      // Date de début
      if (codePromo.date_debut && new Date(codePromo.date_debut) > maintenant) {
        return {
          success: false,
          error: 'Ce code promo n\'est pas encore actif'
        };
      }
  
      // Date de fin
      if (new Date(codePromo.date_fin) < maintenant) {
        return {
          success: false,
          error: 'Ce code promo a expiré'
        };
      }
  
      // Limite d'usage globale
      if (codePromo.usage_max && codePromo.usage_actuel >= codePromo.usage_max) {
        return {
          success: false,
          error: 'Ce code promo a atteint sa limite d\'utilisation'
        };
      }
  
      // 3. Vérifier si le client a déjà utilisé ce code
      const utilisationResponse = await $fetch('/api/directus/items/utilisations_codes_promo', {
        method: 'GET',
        query: {
          'filter[client_id][_eq]': clientId,
          'filter[code_promo_id][_eq]': codePromo.id,
          limit: 1
        }
      });
  
      if (utilisationResponse.data && utilisationResponse.data.length > 0) {
        return {
          success: false,
          error: 'Vous avez déjà utilisé ce code promo'
        };
      }
  
      // 4. Récupérer les détails du produit
      const produitResponse = await $fetch(`/api/directus/items/produits/${produitId}`, {
        method: 'GET'
      });
  
      if (!produitResponse.data) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Produit non trouvé'
        });
      }
  
      const produit = produitResponse.data;
      const prixOriginal = parseFloat(produit.prix) || 0;
  
      // 5. Calculer la réduction
      let montantReduction = 0;
      
      if (codePromo.type_reduction === 'pourcentage') {
        montantReduction = (prixOriginal * parseFloat(codePromo.valeur_reduction)) / 100;
      } else if (codePromo.type_reduction === 'montant') {
        montantReduction = parseFloat(codePromo.valeur_reduction);
      }
  
      // S'assurer que la réduction ne dépasse pas le prix du produit
      montantReduction = Math.min(montantReduction, prixOriginal);
      
      const prixFinal = Math.max(0, prixOriginal - montantReduction);
  
      // 6. Retourner le résultat
      return {
        success: true,
        data: {
          codePromo: {
            id: codePromo.id,
            code: codePromo.code,
            nom: codePromo.nom,
            type_reduction: codePromo.type_reduction,
            valeur_reduction: codePromo.valeur_reduction
          },
          produit: {
            id: produit.id,
            nom: produit.nom,
            prix_original: prixOriginal
          },
          reduction: {
            montant: Math.round(montantReduction * 100) / 100, // Arrondir à 2 décimales
            pourcentage: prixOriginal > 0 ? Math.round((montantReduction / prixOriginal) * 100 * 100) / 100 : 0
          },
          prix_final: Math.round(prixFinal * 100) / 100
        }
      };
  
    } catch (error) {
      console.error('Erreur validation code promo:', error);
      
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Erreur lors de la validation du code promo'
      });
    }
  });