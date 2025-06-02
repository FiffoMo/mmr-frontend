// server/api/stripe/webhook.js
// Webhook Stripe avec envoi d'emails automatique
import Stripe from 'stripe';
import { readBody } from 'h3';
import { sendTemplatedEmail } from '~/utils/email-service.js';
import { generateStripeConfirmationContent, generateStripeFailureContent } from '~/utils/email/templates/stripe/payment-confirmation.js';

export default defineEventHandler(async (event) => {
  try {
    // Récupérer le corps brut de la requête et la signature Stripe
    const body = await readBody(event, 'text');
    const signature = event.req.headers['stripe-signature'];
    
    if (!signature) {
      console.error('Webhook Stripe reçu sans signature');
      return createError({
        statusCode: 400,
        message: 'Signature Stripe manquante'
      });
    }
    
    // Initialiser Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return createError({
        statusCode: 500,
        message: 'Clé secrète Stripe manquante dans la configuration'
      });
    }
    const stripe = new Stripe(stripeSecretKey);
    
    // Vérifier la signature du webhook
    let stripeEvent;
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET n\'est pas défini');
        return createError({
          statusCode: 500,
          message: 'Configuration Webhook manquante'
        });
      }
      
      stripeEvent = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Événement Stripe validé:', stripeEvent.type);
    } catch (err) {
      console.error('❌ Échec de validation du webhook:', err.message);
      return createError({
        statusCode: 400,
        message: `Erreur de signature: ${err.message}`
      });
    }
    
    // Configuration Directus
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    const directusToken = process.env.DIRECTUS_API_TOKEN;
    
    if (!directusToken) {
      console.error('Token Directus manquant');
      return { received: true, status: 'error', message: 'Token Directus manquant' };
    }
    
    // === PAIEMENT RÉUSSI ===
    if (stripeEvent.type === 'checkout.session.completed') {
      console.log('🎉 Paiement réussi - traitement en cours...');
      await handleSuccessfulPayment(stripeEvent.data.object, stripe, directusUrl, directusToken);
    }
    
    // === PAIEMENT ÉCHOUÉ ===
    if (stripeEvent.type === 'payment_intent.payment_failed') {
      console.log('❌ Paiement échoué - envoi notification...');
      await handleFailedPayment(stripeEvent.data.object, stripe, directusUrl, directusToken);
    }
    
    // === PAIEMENT EXPIRÉ ===
    if (stripeEvent.type === 'checkout.session.expired') {
      console.log('⏰ Session expirée - nettoyage...');
      await handleExpiredSession(stripeEvent.data.object, directusUrl, directusToken);
    }
    
    return { received: true, status: 'success' };
    
  } catch (error) {
    console.error('❌ Erreur générale du webhook:', error);
    
    return createError({
      statusCode: 500,
      message: `Erreur lors du traitement du webhook: ${error.message}`
    });
  }
});

// === TRAITEMENT PAIEMENT RÉUSSI ===
async function handleSuccessfulPayment(session, stripe, directusUrl, directusToken) {
  try {
    const { 
      id: sessionId,
      customer_details,
      amount_total,
      metadata = {}
    } = session;
    
    const {
      productId, 
      productType, 
      userId,
      codePromoId,
      codePromoCode,
      montantReduction,
      prixOriginal,
      prixFinal
    } = metadata;
    
    if (!productId || !userId) {
      console.error('Métadonnées incomplètes:', metadata);
      return;
    }
    
    // Récupérer les informations du produit
    const productResponse = await fetch(`${directusUrl}/items/produits/${productId}?fields=*`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!productResponse.ok) {
      console.error('Produit non trouvé:', productId);
      return;
    }
    
    const productData = await productResponse.json();
    const product = productData.data;
    
    // Récupérer les informations du client
    const userResponse = await fetch(`${directusUrl}/users/${userId}?fields=*`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userData = userResponse.ok ? await userResponse.json() : null;
    const user = userData?.data || {};
    
    // Chercher ou créer la commande
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    let commande = await findOrCreateOrder(sessionId, {
      client_id: userId,
      produit: productId,
      montant: amount_total / 100,
      stripe_payment_id: sessionId,
      statut_paiement: 'complete',
      status: 'active',
      reference: orderNumber,
      code_promo_utilise: codePromoCode || null,
      montant_reduction: parseFloat(montantReduction) || 0
    }, directusUrl, directusToken);
    
    // Préparer les données pour l'email
    const orderData = {
      customerName: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : customer_details?.name || 'Client',
      customerEmail: user.email || customer_details?.email,
      orderNumber: commande.reference || orderNumber,
      orderDate: new Date().toLocaleDateString('fr-FR'),
      productName: product.nom,
      productType: product.type_produit,
      originalPrice: parseFloat(prixOriginal) || product.prix,
      finalPrice: (amount_total / 100),
      discountAmount: parseFloat(montantReduction) || 0,
      promoCode: codePromoCode || null,
      paymentMethod: 'Carte bancaire',
      serviceActivationDate: new Date().toLocaleDateString('fr-FR'),
      serviceExpirationDate: calculateExpirationDate(product.type_produit, product.duree)
    };
    
    console.log('📧 Envoi email de confirmation à:', orderData.customerEmail);
    
    // Générer et envoyer l'email de confirmation
    const confirmationContent = generateStripeConfirmationContent(orderData);
    
    const emailResult = await sendTemplatedEmail({
      to: [orderData.customerEmail],
      subject: `✅ Commande confirmée #${orderData.orderNumber} - Ma Maison Rapporte`,
      content: confirmationContent,
      headerTitle: 'Commande confirmée',
      headerOptions: { 
        icon: '✅', 
        headerColor: '#059669' 
      },
      footerOptions: { 
        showUnsubscribe: true 
      }
    });
    
    if (emailResult.success) {
      console.log('✅ Email de confirmation envoyé:', emailResult.messageId);
      
      // Marquer l'email comme envoyé dans la commande
      await fetch(`${directusUrl}/items/commandes/${commande.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_confirmation_envoye: true,
          email_confirmation_date: new Date().toISOString()
        })
      });
    } else {
      console.error('❌ Échec envoi email confirmation:', emailResult.error);
    }
    
    // Enregistrer l'utilisation du code promo si applicable
    if (codePromoId && userId) {
      await recordPromoUsage(codePromoId, userId, orderNumber, montantReduction, directusUrl, directusToken);
    }
    
  } catch (error) {
    console.error('❌ Erreur traitement paiement réussi:', error);
  }
}

// === TRAITEMENT PAIEMENT ÉCHOUÉ ===
async function handleFailedPayment(paymentIntent, stripe, directusUrl, directusToken) {
  try {
    const {
      customer,
      amount,
      last_payment_error,
      metadata = {}
    } = paymentIntent;
    
    // Récupérer les infos client si disponible
    let customerInfo = { email: null, name: 'Client' };
    if (customer) {
      try {
        const customerData = await stripe.customers.retrieve(customer);
        customerInfo = {
          email: customerData.email,
          name: customerData.name || 'Client'
        };
      } catch (err) {
        console.warn('Impossible de récupérer les infos client:', err.message);
      }
    }
    
    if (!customerInfo.email) {
      console.warn('Pas d\'email client pour notifier l\'échec');
      return;
    }
    
    // Déterminer la raison de l'échec
    const failureReason = getFailureReason(last_payment_error);
    
    // Préparer les données pour l'email
    const orderData = {
      customerName: customerInfo.name,
      orderNumber: `TEMP-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: metadata.productName || 'Service Ma Maison Rapporte',
      finalPrice: amount / 100,
      failureReason,
      retryUrl: `${process.env.APP_URL}/checkout?retry=true`
    };
    
    console.log('📧 Envoi email échec paiement à:', customerInfo.email);
    
    // Générer et envoyer l'email d'échec
    const failureContent = generateStripeFailureContent(orderData);
    
    const emailResult = await sendTemplatedEmail({
      to: [customerInfo.email],
      subject: `❌ Problème avec votre paiement - Ma Maison Rapporte`,
      content: failureContent,
      headerTitle: 'Problème de paiement',
      headerOptions: { 
        icon: '❌', 
        headerColor: '#dc2626' 
      },
      footerOptions: { 
        showUnsubscribe: true 
      }
    });
    
    if (emailResult.success) {
      console.log('✅ Email échec paiement envoyé:', emailResult.messageId);
    } else {
      console.error('❌ Échec envoi email échec:', emailResult.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur traitement paiement échoué:', error);
  }
}

// === TRAITEMENT SESSION EXPIRÉE ===
async function handleExpiredSession(session, directusUrl, directusToken) {
  // Pour l'instant, juste logger
  // Pourrait envoyer un email de rappel plus tard
  console.log('⏰ Session expirée:', session.id);
}

// === FONCTIONS UTILITAIRES ===

async function findOrCreateOrder(sessionId, orderData, directusUrl, directusToken) {
  // Chercher une commande existante
  const searchResponse = await fetch(`${directusUrl}/items/commandes?filter[stripe_payment_id][_eq]=${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${directusToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const searchData = await searchResponse.json();
  
  if (searchData.data && searchData.data.length > 0) {
    // Mettre à jour la commande existante
    const commandeId = searchData.data[0].id;
    await fetch(`${directusUrl}/items/commandes/${commandeId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...orderData,
        date_paiement: new Date().toISOString()
      })
    });
    return searchData.data[0];
  } else {
    // Créer une nouvelle commande
    const createResponse = await fetch(`${directusUrl}/items/commandes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...orderData,
        date_created: new Date().toISOString(),
        date_paiement: new Date().toISOString()
      })
    });
    
    const newCommande = await createResponse.json();
    return newCommande.data;
  }
}

async function recordPromoUsage(codePromoId, userId, orderNumber, montantReduction, directusUrl, directusToken) {
  try {
    await fetch(`${directusUrl}/items/utilisations_codes_promo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code_promo_id: parseInt(codePromoId),
        client_id: userId,
        commande_id: orderNumber,
        montant_reduction: parseFloat(montantReduction) || 0
      })
    });
    console.log('✅ Utilisation code promo enregistrée');
  } catch (error) {
    console.error('❌ Erreur enregistrement code promo:', error);
  }
}

function calculateExpirationDate(productType, duree) {
  if (!duree) return null;
  
  const now = new Date();
  const expiration = new Date(now);
  
  // Ajouter la durée selon le type
  if (duree.includes('mois')) {
    const months = parseInt(duree);
    expiration.setMonth(expiration.getMonth() + months);
  } else if (duree.includes('an')) {
    const years = parseInt(duree);
    expiration.setFullYear(expiration.getFullYear() + years);
  } else {
    // Par défaut 1 mois
    expiration.setMonth(expiration.getMonth() + 1);
  }
  
  return expiration.toLocaleDateString('fr-FR');
}

function getFailureReason(lastPaymentError) {
  if (!lastPaymentError) return 'Erreur de paiement inconnue';
  
  const code = lastPaymentError.code || '';
  const message = lastPaymentError.message || '';
  
  // Messages personnalisés selon le code d'erreur Stripe
  const errorMessages = {
    'card_declined': 'Votre carte a été refusée par votre banque',
    'insufficient_funds': 'Fonds insuffisants sur votre carte',
    'expired_card': 'Votre carte a expiré',
    'incorrect_cvc': 'Code de sécurité incorrect',
    'processing_error': 'Erreur de traitement temporaire',
    'authentication_required': 'Authentification 3D Secure requise'
  };
  
  return errorMessages[code] || `Erreur de paiement: ${message}`;
}