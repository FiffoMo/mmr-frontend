// server/api/stripe/verify-payment.js
import Stripe from 'stripe';

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
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_yourkey';
      const stripe = new Stripe(stripeSecretKey);
      
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
      
      // Configuration pour Directus (même approche que dans create-checkout-session.js)
      const directusUrl = 'http://localhost:8055';
      const directusToken = 'Qqq_txN484Kd4C8_pQajEDBl4xqmG3vr'; // Votre token statique
      
      // Récupérer le produit directement depuis Directus
      const productResponse = await fetch(`${directusUrl}/items/produits/${productId}?fields=*`, {
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!productResponse.ok) {
        return createError({
          statusCode: 404,
          message: 'Produit non trouvé'
        });
      }
      
      const productData = await productResponse.json();
      const product = productData.data;
      
      // Pour simplifier dans un premier temps, nous allons juste retourner les informations 
      // sans créer de commande ni gérer les crédits utilisateur
      
      return {
        status: 'success',
        productName: product.nom,
        amount: session.amount_total,
        orderId: `ORD-${Math.floor(Math.random() * 10000)}`, // Temporaire
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