// server/api/stripe/verify-payment.js
// Version avec envoi d'email de confirmation + notification équipe
import Stripe from 'stripe';
import { sendTemplatedEmail } from '~/utils/email-service.js';
import { generateStripeConfirmationContent, generateAdminNotificationContent } from '~/utils/email/templates/stripe/payment-confirmation.js';

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
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        return createError({
          statusCode: 500,
          message: 'Clé secrète Stripe manquante dans la configuration'
        });
      }
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
      const { 
        productId, 
        productType, 
        userId,
        codePromoId,
        codePromoCode,
        montantReduction,
        prixOriginal,
        prixFinal
      } = session.metadata;
      
      // Configuration Directus
      const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
      const directusToken = process.env.DIRECTUS_API_TOKEN;
      
      if (!directusToken) {
        return createError({
          statusCode: 500,
          message: 'Token Directus manquant dans la configuration'
        });
      }
      
      // Récupérer le produit depuis Directus
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
      
      // Récupérer les informations du client
      const userResponse = await fetch(`${directusUrl}/users/${userId}?fields=*`, {
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const userData = userResponse.ok ? await userResponse.json() : null;
      const user = userData?.data || {};
      
      // Générer une référence unique pour la commande
      const reference = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Préparer les données de commande
      const commandeData = {
        client_id: userId,
        produit: productId,
        montant: session.amount_total / 100,
        date_created: new Date().toISOString(),
        date_paiement: new Date().toISOString(),
        stripe_payment_id: session.id,
        statut_paiement: 'complete',
        status: 'active',
        reference: reference
      };
      
      // Ajouter les informations du code promo si applicable
      if (codePromoId && codePromoCode) {
        commandeData.code_promo_utilise = codePromoCode;
        commandeData.montant_reduction = parseFloat(montantReduction) || 0;
        console.log('Code promo appliqué à la commande:', codePromoCode);
      }
      
      console.log('Création de commande avec les données:', commandeData);
      
      // Envoyer la requête pour créer la commande
      const createResponse = await fetch(`${directusUrl}/items/commandes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commandeData)
      });
      
      if (!createResponse.ok) {
        console.error('Erreur lors de la création de la commande:', await createResponse.text());
        return createError({
          statusCode: 500,
          message: 'Erreur lors de la création de la commande'
        });
      }
      
      const newCommande = await createResponse.json();
      console.log('Commande créée avec succès:', newCommande.data);
      
      // Enregistrer l'utilisation du code promo si applicable
      if (codePromoId && userId) {
        try {
          const utilisationResponse = await fetch(`${directusUrl}/items/utilisations_codes_promo`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${directusToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              code_promo_id: parseInt(codePromoId),
              client_id: userId,
              commande_id: reference,
              montant_reduction: parseFloat(montantReduction) || 0
            })
          });
          
          if (utilisationResponse.ok) {
            console.log('✅ Utilisation du code promo enregistrée');
          } else {
            console.error('❌ Erreur lors de l\'enregistrement de l\'utilisation du code promo');
          }
        } catch (promoError) {
          console.error('Erreur code promo (non bloquante):', promoError);
        }
      }
      
      // === NOUVEAU : ENVOI EMAIL DE CONFIRMATION ===
      try {
        console.log('📧 Préparation email de confirmation...');
        
        // Préparer les données pour l'email
        const orderData = {
          customerName: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : session.customer_details?.name || 'Client',
          customerEmail: user.email || session.customer_details?.email,
          orderNumber: reference,
          orderDate: new Date().toLocaleDateString('fr-FR'),
          productName: product.nom,
          productType: product.type_produit,
          originalPrice: parseFloat(prixOriginal) || product.prix,
          finalPrice: (session.amount_total / 100),
          discountAmount: parseFloat(montantReduction) || 0,
          promoCode: codePromoCode || null,
          paymentMethod: 'Carte bancaire',
          serviceActivationDate: new Date().toLocaleDateString('fr-FR'),
          serviceExpirationDate: calculateExpirationDate(product.type_produit, product.duree),
          // Ajout des nouveaux liens
          dashboardLinks: {
            orders: 'http://localhost:3000/settings?tab=orders',
            listings: 'http://localhost:3000/settings?tab=listings', 
            highlight: 'http://localhost:3000/settings?tab=highlight',
            ads: 'http://localhost:3000/settings?tab=ads'
          }
        };
        
        console.log('📧 Données email préparées pour:', orderData.customerEmail);
        console.log('🔍 ProductType envoyé au template:', product.type_produit);
        console.log('🔍 ProductName:', product.nom);
        
        // Générer le contenu de l'email
        const confirmationContent = generateStripeConfirmationContent(orderData);
        
        // 1. Email de confirmation au CLIENT
        const clientEmailResult = await sendTemplatedEmail({
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
        
        // 2. Email de notification à L'ÉQUIPE MMR
        const adminEmailContent = generateAdminNotificationContent(orderData);
        const adminEmailResult = await sendTemplatedEmail({
          to: ['contact@ma-maison-rapporte.com'],
          subject: `🛒 Nouvelle commande #${orderData.orderNumber} - ${orderData.finalPrice.toFixed(2)}€`,
          content: adminEmailContent,
          headerTitle: 'Nouvelle commande',
          headerOptions: { 
            icon: '🛒', 
            headerColor: '#0891b2' 
          },
          footerOptions: { 
            showUnsubscribe: false 
          }
        });
        
        // Logs des résultats
        if (clientEmailResult.success) {
          console.log('✅ Email client envoyé:', clientEmailResult.messageId);
        } else {
          console.error('❌ Échec email client:', clientEmailResult.error);
        }
        
        if (adminEmailResult.success) {
          console.log('✅ Email équipe envoyé:', adminEmailResult.messageId);
        } else {
          console.error('❌ Échec email équipe:', adminEmailResult.error);
        }
        
        // Marquer l'email comme envoyé si au moins un des deux a réussi
        if (clientEmailResult.success || adminEmailResult.success) {
          await fetch(`${directusUrl}/items/commandes/${newCommande.data.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${directusToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email_confirmation_envoye: clientEmailResult.success,
              email_confirmation_date: new Date().toISOString(),
              email_admin_envoye: adminEmailResult.success
            })
          });
        }
        
      } catch (emailError) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', emailError);
        // Ne pas faire échouer la validation du paiement pour autant
      }
      
      return {
        status: 'success',
        productName: product.nom,
        amount: session.amount_total,
        orderId: reference,
        productType: productType,
        codePromoUtilise: codePromoCode || null,
        reductionAppliquee: montantReduction ? parseFloat(montantReduction) : null,
        emailSent: true // Indiquer que l'email a été traité
      };
      
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      
      return createError({
        statusCode: 500,
        message: 'Erreur lors de la vérification du paiement'
      });
    }
});

// Fonction utilitaire pour calculer la date d'expiration
function calculateExpirationDate(productType, duree) {
  if (!duree) return null;
  
  const now = new Date();
  const expiration = new Date(now);
  
  if (duree.includes('mois')) {
    const months = parseInt(duree);
    expiration.setMonth(expiration.getMonth() + months);
  } else if (duree.includes('an')) {
    const years = parseInt(duree);
    expiration.setFullYear(expiration.getFullYear() + years);
  } else {
    expiration.setMonth(expiration.getMonth() + 1);
  }
  
  return expiration.toLocaleDateString('fr-FR');
}