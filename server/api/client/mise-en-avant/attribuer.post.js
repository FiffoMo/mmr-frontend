// /mmr-frontend/server/api/client/mise-en-avant/attribuer.post.js
import { defineEventHandler, readBody, createError } from 'h3';
import { useDirectusSDK } from '~/composables/useDirectusSDK';

export default defineEventHandler(async (event) => {
  try {
    const { forfaitId, annonceId } = await readBody(event);
    const directusSDK = useDirectusSDK();
    
    if (!forfaitId || !annonceId) {
      return createError({
        statusCode: 400,
        message: "Identifiants de forfait et d'annonce requis"
      });
    }
    
    console.log(`Attribution de la mise en avant: forfait ${forfaitId} -> annonce ${annonceId}`);
    
    // 1. Vérifier si l'utilisateur est authentifié
    const user = await directusSDK.getUserProfile(['id']);
    
    if (!user || !user.id) {
      return createError({
        statusCode: 401,
        message: "Utilisateur non authentifié"
      });
    }
    
    // 2. Récupérer le forfait
    const forfait = await directusSDK.getItem('commandes', forfaitId);
    
    if (!forfait) {
      return createError({
        statusCode: 404,
        message: "Forfait non trouvé"
      });
    }
    
    if (forfait.client_id !== user.id) {
      return createError({
        statusCode: 403,
        message: "Vous n'êtes pas autorisé à utiliser ce forfait"
      });
    }
    
    // 3. Vérifier si le forfait est de type mise_en_avant ou similaire
    const estMiseEnAvant = (
      forfait.type_produit === 'mise_en_avant' || 
      (forfait.produit && forfait.produit.type_produit === 'mise_en_avant') ||
      (forfait.produit && forfait.produit.nom && forfait.produit.nom.toLowerCase().includes('mise en avant'))
    );
    
    if (!estMiseEnAvant) {
      return createError({
        statusCode: 400,
        message: "Ce forfait n'est pas un forfait de mise en avant"
      });
    }
    
    // 4. Vérifier si le forfait est encore valide
    const dateFin = new Date(forfait.date_fin);
    if (dateFin < new Date()) {
      return createError({
        statusCode: 400,
        message: "Ce forfait est expiré"
      });
    }
    
    // 5. Récupérer l'annonce
    const annonce = await directusSDK.getItem('annonces', annonceId);
    
    if (!annonce) {
      return createError({
        statusCode: 404,
        message: "Annonce non trouvée"
      });
    }
    
    if (annonce.client_id !== user.id) {
      return createError({
        statusCode: 403,
        message: "Vous n'êtes pas autorisé à modifier cette annonce"
      });
    }
    
    // 6. Si le forfait était déjà attribué à une autre annonce, retirer l'attribution
    if (forfait.annonce_id && forfait.annonce_id !== annonceId) {
      try {
        console.log(`Retrait de la mise en avant de l'annonce précédente: ${forfait.annonce_id}`);
        await directusSDK.updateItem('annonces', forfait.annonce_id, {
          mise_en_avant: false,
          date_mise_en_avant: null
        });
      } catch (err) {
        console.error('Erreur lors de la mise à jour de l\'ancienne annonce:', err);
        // On continue même en cas d'erreur ici
      }
    }
    
    // 7. Mettre à jour le forfait avec la nouvelle annonce
    console.log(`Mise à jour du forfait ${forfaitId} avec l'annonce ${annonceId}`);
    await directusSDK.updateItem('commandes', forfaitId, {
      annonce_id: annonceId
    });
    
    // 8. Mettre à jour l'annonce
    console.log(`Mise à jour de l'annonce ${annonceId} avec mise_en_avant=true`);
    await directusSDK.updateItem('annonces', annonceId, {
      mise_en_avant: true,
      date_mise_en_avant: new Date().toISOString()
    });
    
    // 9. Ajouter l'entrée dans la table mise_en_avant si elle existe
    try {
      // Vérifier si la table mise_en_avant existe
      const tables = await directusSDK.getItems('directus_collections', {
        filter: { collection: { _eq: 'mise_en_avant' } }
      });
      
      if (tables && tables.length > 0) {
        // Vérifier s'il existe déjà une entrée pour ce forfait
        const miseEnAvant = await directusSDK.getItems('mise_en_avant', {
          filter: {
            commande_id: { _eq: forfaitId }
          }
        });
        
        if (miseEnAvant && miseEnAvant.length > 0) {
          // Mettre à jour l'entrée existante
          console.log(`Mise à jour de l'entrée mise_en_avant ${miseEnAvant[0].id}`);
          await directusSDK.updateItem('mise_en_avant', miseEnAvant[0].id, {
            annonce_id: annonceId
          });
        } else {
          // Créer une nouvelle entrée
          console.log('Création d\'une nouvelle entrée mise_en_avant');
          await directusSDK.createItem('mise_en_avant', {
            client_id: user.id,
            commande_id: forfaitId,
            annonce_id: annonceId,
            date_debut: forfait.date_debut || new Date().toISOString(),
            date_fin: forfait.date_fin
          });
        }
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la table mise_en_avant:', err);
      // Ne pas échouer si cette étape échoue
    }
    
    return {
      success: true,
      message: "Forfait de mise en avant attribué avec succès"
    };
  } catch (error) {
    console.error('Erreur lors de l\'attribution du forfait:', error);
    
    return createError({
      statusCode: 500,
      message: "Une erreur est survenue lors de l'attribution du forfait"
    });
  }
});