// server/middleware/2.stripe-payment.js
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  
  // Intercepter les requêtes de paiement Stripe
  if (url.pathname === '/api/create-checkout-session' && event.node.req.method === 'POST') {
    console.log('Requête de création de session Stripe reçue');
    
    try {
      const body = await readBody(event);
      console.log('Données reçues:', body);
      
      // Importation dynamique de Stripe
      const { default: Stripe } = await import('stripe');
      
      // Récupérer la clé API depuis la configuration
      const config = useRuntimeConfig();
      const stripeSecretKey = config.stripeSecretKey;
      
      if (!stripeSecretKey) {
        console.error('Clé API Stripe non configurée');
        throw new Error('Configuration Stripe manquante');
      }
      
      console.log('Initialisation de Stripe avec la clé:', stripeSecretKey.substring(0, 8) + '...');
      const stripe = new Stripe(stripeSecretKey);
      
      // Créer une session de paiement
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: body.productName || 'Produit test',
              },
              unit_amount: body.amount || 1000, // 10€ par défaut
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `http://localhost:3000/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/stripe-cancel`,
      });
      
      console.log('Session créée avec succès:', session.id);
      
      return {
        success: true,
        sessionId: session.id,
        url: session.url
      };
    } catch (error) {
      console.error('Erreur Stripe complète:', error);
      
      return {
        statusCode: 500,
        error: 'Erreur lors de la création du paiement',
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      };
    }
  }
});