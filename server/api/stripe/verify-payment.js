// server/api/stripe/verify-payment.js
export default defineEventHandler(async (event) => {
    try {
      const query = getQuery(event);
      const { session_id } = query;
      
      if (!session_id) {
        return createError({
          statusCode: 400,
          message: 'ID de session manquant'
        });
      }
      
      // Initialize Stripe
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      // Retrieve the session
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items', 'payment_intent']
      });
      
      if (!session) {
        return createError({
          statusCode: 404,
          message: 'Session de paiement non trouvée'
        });
      }
      
      if (session.payment_status !== 'paid') {
        return {
          status: 'pending',
          message: 'Le paiement est en cours de traitement'
        };
      }
      
      // Get product and user details from metadata
      const { productId, productType, userId } = session.metadata;
      
      // Connect to Directus
      const directus = await getDirectusClient();
      
      // Get product information
      const product = await directus.items('produits').readOne(productId);
      
      if (!product) {
        return createError({
          statusCode: 404,
          message: 'Produit non trouvé'
        });
      }
      
      // Create an order in Directus
      const order = await directus.items('commandes').createOne({
        user: userId,
        produit: productId,
        montant: session.amount_total / 100, // Convert from cents
        stripe_session_id: session_id,
        stripe_payment_id: session.payment_intent ? session.payment_intent.id : null,
        status: 'completed',
        date: new Date().toISOString()
      });
      
      // Actions spécifiques selon le type de produit
      switch (productType) {
        case 'annonces':
          // Ajouter des crédits d'annonces à l'utilisateur
          await handleAnnoncesProduct(directus, userId, product);
          break;
        
        case 'publicite':
          // Créer un espace publicitaire pour l'utilisateur
          await handlePubliciteProduct(directus, userId, product, order.id);
          break;
        
        case 'mise_en_avant':
          // Ajouter un crédit de mise en avant à l'utilisateur
          await handleMiseEnAvantProduct(directus, userId, product);
          break;
      }
      
      // Return success response
      return {
        status: 'success',
        productName: product.nom,
        amount: session.amount_total,
        orderId: order.id,
        productType: productType
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      
      return createError({
        statusCode: 500,
        message: 'Erreur lors de la vérification du paiement'
      });
    }
  });
  
  // Fonctions d'aide pour gérer différents types de produits
  async function handleAnnoncesProduct(directus, userId, product) {
    // Get the current user
    const user = await directus.users.readOne(userId);
    
    // Determine credits based on the product name
    let creditsToAdd = 0;
    const productName = product.nom.toLowerCase();
    
    if (productName.includes('basic')) {
      creditsToAdd = 1;
    } else if (productName.includes('dixit')) {
      creditsToAdd = 10;
    } else if (productName.includes('premium')) {
      creditsToAdd = 25;
    }
    
    // Update user credits
    if (creditsToAdd > 0) {
      await directus.users.updateOne(userId, {
        credits: (user.credits || 0) + creditsToAdd
      });
    }
  }
  
  async function handlePubliciteProduct(directus, userId, product, orderId) {
    // Créer une entrée dans la collection publicite
    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setDate(dateDebut.getDate() + (product.duree_jours || 90));
    
    await directus.items('publicite').createOne({
      client: userId,
      emplacement: product.emplacement,
      statut_affichage: 'inactif', // En attente que l'utilisateur configure sa publicité
      date_debut: dateDebut.toISOString(),
      date_fin: dateFin.toISOString(),
      prix: product.prix,
      statut_paiement: 'paye',
      commande_id: orderId,
      impressions: 0,
      clics: 0,
      status: 'en_attente' // En attente de l'upload de l'image
    });
  }
  
  async function handleMiseEnAvantProduct(directus, userId, product) {
    // Ajouter un crédit de mise en avant à l'utilisateur
    const user = await directus.users.readOne(userId);
    
    await directus.users.updateOne(userId, {
      mise_en_avant_credits: (user.mise_en_avant_credits || 0) + 1
    });
  }