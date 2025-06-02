// /mmr-frontend/server/api/client/commandes.get.js
import { defineEventHandler, getQuery } from 'h3';
import { useDirectusSDK } from '~/composables/useDirectusSDK';

export default defineEventHandler(async (event) => {
  try {
    const directusSDK = useDirectusSDK();
    const query = getQuery(event);
    const type = query.type || null;
    const status = query.status || null;
    
    // Obtenir l'utilisateur actuel
    const user = await directusSDK.getUserProfile(['id']);
    
    if (!user || !user.id) {
      return {
        statusCode: 401,
        body: {
          message: "Utilisateur non authentifié"
        }
      };
    }
    
    console.log('Récupération des commandes pour l\'utilisateur:', user.id);
    console.log('Type demandé:', type);
    console.log('Statut demandé:', status);
    
    // Construire le filtre
    const filter = {
      client_id: { _eq: user.id }
    };
    
    // Ajouter le type de produit au filtre si spécifié
    if (type) {
      filter.type_produit = { _eq: type };
      
      // Si type=mise_en_avant, essayer également avec des valeurs alternatives
      if (type === 'mise_en_avant') {
        // Option alternative: utiliser un filtre OR pour capturer différentes variantes
        return await getMiseEnAvantCommandes(directusSDK, user.id, status);
      }
    }
    
    // Ajouter le statut au filtre si spécifié (actif = date_fin future ou statut spécifique)
    if (status === 'active') {
      filter.date_fin = { _gt: new Date().toISOString() };
    } else if (status) {
      filter.status = { _eq: status };
    }
    
    console.log('Filtre appliqué:', JSON.stringify(filter));
    
    // Récupérer les commandes
    const commandes = await directusSDK.getItems('commandes', {
      filter,
      fields: '*,produit.*,annonce.*',
      sort: '-date_created'
    });
    
    console.log(`${commandes.length} commandes trouvées`);
    
    // Transformer les données pour inclure les jours restants
    const commandesTransformees = commandes.map(commande => {
      const dateFin = commande.date_fin ? new Date(commande.date_fin) : null;
      const today = new Date();
      
      // Calculer les jours restants
      const joursRestants = dateFin 
        ? Math.max(0, Math.ceil((dateFin - today) / (1000 * 60 * 60 * 24))) 
        : 0;
      
      return {
        ...commande,
        jours_restants: joursRestants,
        est_actif: dateFin ? dateFin > today : false
      };
    });
    
    return commandesTransformees;
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    
    return {
      statusCode: 500,
      body: {
        message: "Erreur lors de la récupération des commandes",
        error: error.message
      }
    };
  }
});

// Fonction spécifique pour récupérer les commandes de mise en avant avec différentes stratégies
async function getMiseEnAvantCommandes(directusSDK, userId, status) {
  console.log('Recherche spécifique des commandes de mise en avant');
  
  try {
    // Stratégie 1: Chercher par type_produit=mise_en_avant
    const filtre1 = {
      client_id: { _eq: userId },
      type_produit: { _eq: 'mise_en_avant' }
    };
    
    if (status === 'active') {
      filtre1.date_fin = { _gt: new Date().toISOString() };
    }
    
    const commandes1 = await directusSDK.getItems('commandes', {
      filter: filtre1,
      fields: '*,produit.*,annonce.*',
      sort: '-date_created'
    });
    
    console.log(`Stratégie 1: ${commandes1.length} commandes trouvées`);
    
    // Si on a trouvé des commandes, les transformer et les retourner
    if (commandes1.length > 0) {
      return transformerCommandes(commandes1);
    }
    
    // Stratégie 2: Chercher par le nom du produit contenant "mise en avant"
    const filtre2 = {
      client_id: { _eq: userId },
      produit: {
        nom: { _contains: 'mise en avant' }
      }
    };
    
    if (status === 'active') {
      filtre2.date_fin = { _gt: new Date().toISOString() };
    }
    
    const commandes2 = await directusSDK.getItems('commandes', {
      filter: filtre2,
      fields: '*,produit.*,annonce.*',
      sort: '-date_created'
    });
    
    console.log(`Stratégie 2: ${commandes2.length} commandes trouvées`);
    
    // Si on a trouvé des commandes, les transformer et les retourner
    if (commandes2.length > 0) {
      return transformerCommandes(commandes2);
    }
    
    // Stratégie 3: Dernière tentative, récupérer toutes les commandes et filtrer manuellement
    console.log('Stratégie 3: Récupération de toutes les commandes et filtrage manuel');
    
    const toutesCommandes = await directusSDK.getItems('commandes', {
      filter: {
        client_id: { _eq: userId }
      },
      fields: '*,produit.*,annonce.*',
      sort: '-date_created'
    });
    
    // Filtrer manuellement les commandes qui semblent être des mises en avant
    const commandesFiltrees = toutesCommandes.filter(commande => {
      // Vérifier si c'est une commande de mise en avant selon différents critères
      const estMiseEnAvant = (
        commande.type_produit === 'mise_en_avant' || 
        (commande.produit && commande.produit.type_produit === 'mise_en_avant') ||
        (commande.produit && commande.produit.nom && commande.produit.nom.toLowerCase().includes('mise en avant'))
      );
      
      // Vérifier le statut actif si demandé
      if (status === 'active') {
        const dateFin = commande.date_fin ? new Date(commande.date_fin) : null;
        return estMiseEnAvant && dateFin && dateFin > new Date();
      }
      
      return estMiseEnAvant;
    });
    
    console.log(`Stratégie 3: ${commandesFiltrees.length} commandes trouvées après filtrage manuel`);
    
    return transformerCommandes(commandesFiltrees);
  } catch (error) {
    console.error('Erreur lors de la récupération spécifique des mises en avant:', error);
    return [];
  }
}

// Fonction de transformation des commandes
function transformerCommandes(commandes) {
  const today = new Date();
  
  return commandes.map(commande => {
    const dateFin = commande.date_fin ? new Date(commande.date_fin) : null;
    
    // Calculer les jours restants
    const joursRestants = dateFin 
      ? Math.max(0, Math.ceil((dateFin - today) / (1000 * 60 * 60 * 24))) 
      : 0;
    
    return {
      ...commande,
      jours_restants: joursRestants,
      est_actif: dateFin ? dateFin > today : false
    };
  });
}