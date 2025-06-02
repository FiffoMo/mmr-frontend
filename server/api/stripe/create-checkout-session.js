// server/api/stripe/create-checkout-session.js
import Stripe from 'stripe';
import { readBody } from 'h3';

// Fonction complète pour supprimer les balises HTML côté serveur
function stripHtml(html) {
  if (!html) return '';
  
  // Liste étendue des entités HTML à remplacer
  const htmlEntities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&lt;': '<',
    '&gt;': '>',
    '&eacute;': 'é',
    '&egrave;': 'è',
    '&agrave;': 'à',
    '&ccedil;': 'ç',
    '&ocirc;': 'ô',
    '&ucirc;': 'û',
    '&ecirc;': 'ê',
    '&acirc;': 'â',
    '&euml;': 'ë',
    '&iuml;': 'ï',
    '&ugrave;': 'ù',
    '&rsquo;': "'",  // Apostrophe simplifiée pour éviter les problèmes
    '&lsquo;': "'",  // Guillemet simple gauche simplifié
    '&rdquo;': '"',  // Guillemet double droit
    '&ldquo;': '"',  // Guillemet double gauche
    '&ndash;': '-',  // Tiret demi-cadratin
    '&mdash;': '--', // Tiret cadratin
    '&hellip;': '...', // Points de suspension
    '&trade;': 'TM',  // Symbole trademark
    '&copy;': '(c)',   // Symbole copyright
    '&reg;': '(R)',    // Symbole registered
    '&euro;': 'EUR',   // Symbole euro
    '&pound;': 'GBP',  // Symbole livre sterling
    '&deg;': '°'     // Symbole degré
  };
  
  // D'abord supprimer les balises HTML
  let tempText = html.replace(/<[^>]*>/g, ' ');
  
  // Remplacer toutes les entités HTML connues
  for (const [entity, replacement] of Object.entries(htmlEntities)) {
    // Utilisation d'une expression régulière globale pour remplacer toutes les occurrences
    const regex = new RegExp(entity, 'g');
    tempText = tempText.replace(regex, replacement);
  }
  
  // Remplacer toutes les entités numériques (comme &#39;)
  tempText = tempText.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  });
  
  // Nettoyer les espaces multiples et couper les espaces en début et fin
  return tempText.replace(/\s{2,}/g, ' ').trim();
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { productId, productType, userId, codePromo } = body;
    
    if (!productId) {
      return createError({
        statusCode: 400,
        message: 'ID de produit manquant'
      });
    }
    
    // Configuration pour Directus (VARIABLES D'ENVIRONNEMENT)
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    const directusToken = process.env.DIRECTUS_API_TOKEN;
    
    if (!directusToken) {
      return createError({
        statusCode: 500,
        message: 'Token Directus manquant dans la configuration'
      });
    }
    
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

    console.log('Produit récupéré par ID:', productId);
    console.log('Données du produit:', product);
    
    // Calculer le prix final (avec ou sans code promo)
    let prixFinal = parseFloat(product.prix) || 0;
    let montantReduction = 0;
    let codePromoInfo = null;
    
    // Si un code promo est fourni, l'appliquer
    if (codePromo && codePromo.id) {
      console.log('Code promo détecté:', codePromo);
      
      // Récupérer les détails du code promo pour vérification
      const codePromoResponse = await fetch(`${directusUrl}/items/codes_promo/${codePromo.id}?fields=*`, {
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (codePromoResponse.ok) {
        const codePromoData = await codePromoResponse.json();
        const codePromoDetails = codePromoData.data;
        
        // Vérifier que le code est toujours valide
        const maintenant = new Date();
        const dateExpiration = new Date(codePromoDetails.date_fin);
        
        if (codePromoDetails.actif && dateExpiration > maintenant) {
          // Appliquer la réduction
          prixFinal = parseFloat(codePromo.prixFinal) || prixFinal;
          montantReduction = parseFloat(codePromo.montantReduction) || 0;
          
          codePromoInfo = {
            id: codePromoDetails.id,
            code: codePromoDetails.code,
            montantReduction: montantReduction,
            prixOriginal: parseFloat(product.prix),
            prixFinal: prixFinal
          };
          
          console.log('Code promo appliqué:', codePromoInfo);
        } else {
          console.warn('Code promo expiré ou inactif:', codePromoDetails.code);
        }
      } else {
        console.warn('Impossible de récupérer les détails du code promo');
      }
    }
    
    // S'assurer que le prix final n'est pas négatif
    prixFinal = Math.max(0, prixFinal);
    
    // Nettoyer le nom et la description pour Stripe
    const cleanName = stripHtml(product.nom);
    const cleanDescription = stripHtml(product.description || '');
    
    // Ajouter info sur la réduction dans la description si applicable
    let stripeDescription = cleanDescription;
    if (codePromoInfo && montantReduction > 0) {
      stripeDescription += ` | Code promo: ${codePromoInfo.code} (-${montantReduction.toFixed(2)}€)`;
    }

    // Initialize Stripe (VARIABLES D'ENVIRONNEMENT)
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return createError({
        statusCode: 500,
        message: 'Clé secrète Stripe manquante dans la configuration'
      });
    }
    const stripe = new Stripe(stripeSecretKey);
    
    // Préparer les métadonnées pour la session
    const metadata = {
      productId,
      productType: product.type_produit,
      userId: userId || '1',
      prixOriginal: product.prix.toString()
    };
    
    // Ajouter les métadonnées du code promo si applicable
    if (codePromoInfo) {
      metadata.codePromoId = codePromoInfo.id.toString();
      metadata.codePromoCode = codePromoInfo.code;
      metadata.montantReduction = montantReduction.toString();
      metadata.prixFinal = prixFinal.toString();
    }
    
    console.log('Métadonnées de la session Stripe:', metadata);
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: cleanName,
              description: stripeDescription,
            },
            unit_amount: Math.round(prixFinal * 100), // Convert to cents with final price
          },
          quantity: 1,
        },
      ],
      client_reference_id: userId || '1',
      metadata: metadata,
      mode: 'payment',
      success_url: `${process.env.APP_URL}/confirmation-paiement?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/acheter-forfait/${productId}?cancelled=true`,
    });
    
    console.log('Session Stripe créée:', session.id);
    console.log('Prix final appliqué:', prixFinal);
    
    // Return the Stripe checkout URL
    return {
      sessionUrl: session.url,
      sessionId: session.id,
      prixFinal: prixFinal,
      montantReduction: montantReduction
    };
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    
    return createError({
      statusCode: 500,
      message: 'Erreur lors de la création de la session de paiement'
    });
  }
});