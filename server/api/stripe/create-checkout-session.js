// server/api/stripe/create-checkout-session.js
import Stripe from 'stripe';

// Fonction pour supprimer les balises HTML côté serveur
function stripHtml(html) {
  if (!html) return '';
  // Supprimer les balises HTML avec des expressions régulières
  return html.replace(/<[^>]*>/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { productId, productType, userId } = body;
    
    if (!productId) {
      return createError({
        statusCode: 400,
        message: 'ID de produit manquant'
      });
    }
    
    // Configuration pour Directus
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

    // Contrôle: Après avoir récupéré le produit
    console.log('Produit récupéré par ID:', productId);
    console.log('Données du produit:', product);
    
    // Nettoyer le nom et la description pour Stripe
    const cleanName = stripHtml(product.nom);
    const cleanDescription = stripHtml(product.description || '');

    // Initialize Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_yourkey';
    const stripe = new Stripe(stripeSecretKey);
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: cleanName,
              description: cleanDescription,
            },
            unit_amount: Math.round(product.prix * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      client_reference_id: userId || '1',
      metadata: {
        productId,
        productType: product.type_produit,
        userId: userId || '1'
      },
      mode: 'payment',
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/confirmation-paiement?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/acheter-forfait/${productId}?cancelled=true`,
    });
    
    // Return the Stripe checkout URL
    return {
      sessionUrl: session.url
    };
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    
    return createError({
      statusCode: 500,
      message: 'Erreur lors de la création de la session de paiement'
    });
  }
});