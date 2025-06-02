// utils/email/templates/stripe/payment-confirmation.js
// Template confirmation de commande - Inspiré des standards e-commerce

export function generateStripeConfirmationContent(orderData) {
    const {
      customerName,
      customerEmail,
      orderNumber,
      orderDate,
      productName,
      productType,
      originalPrice,
      finalPrice,
      discountAmount,
      promoCode,
      paymentMethod,
      serviceActivationDate,
      serviceExpirationDate
    } = orderData;
  
    const baseUrl = process.env.APP_URL || 'https://ma-maison-rapporte.com';
    const hasDiscount = discountAmount > 0;
  
    return `
      <h2 class="content-title">Merci pour votre commande !</h2>
      
      <p class="greeting">Bonjour <strong>${customerName}</strong>,</p>
      
      <p>Votre commande a été confirmée et votre paiement a été traité avec succès. Voici le récapitulatif de votre achat :</p>
  
      <!-- Récapitulatif de commande -->
      <div class="order-summary mt-30">
        <h3 class="box-title"><span>📋</span>Récapitulatif de votre commande</h3>
        <p style="margin-bottom: 20px;"><strong>Commande #${orderNumber}</strong> • ${orderDate}</p>
        
        <div class="order-row">
          <span>${productName}</span>
          <span>${originalPrice.toFixed(2)}€</span>
        </div>
        
        ${hasDiscount ? `
        <div class="order-row">
          <span>Code promo: ${promoCode}</span>
          <span class="discount">-${discountAmount.toFixed(2)}€</span>
        </div>
        ` : ''}
        
        <div class="order-row total">
          <span><strong>Total payé</strong></span>
          <span><strong>${finalPrice.toFixed(2)}€</strong></span>
        </div>
        
        <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
          Payé par ${paymentMethod} • ${orderDate}
        </p>
      </div>
  
      ${hasDiscount ? `
      <!-- Code promo appliqué -->
      <div class="promo-highlight">
        <strong>🎉 Code promo appliqué :</strong> ${promoCode} (-${Math.round((discountAmount / originalPrice) * 100)}%)
      </div>
      ` : ''}
  
      <!-- Activation du service -->
      <div class="info-box success">
        <h3 class="box-title"><span>✅</span>Votre service est maintenant actif</h3>
        <div class="contact-info">
          <p><strong>Service :</strong> ${productName}</p>
          <p><strong>Activation :</strong> ${serviceActivationDate}</p>
          ${serviceExpirationDate ? `<p><strong>Expire le :</strong> ${serviceExpirationDate}</p>` : ''}
          <p><strong>Email du compte :</strong> ${customerEmail}</p>
        </div>
      </div>
  
      <!-- Actions disponibles -->
      <div class="message-box">
        <h3 class="box-title"><span>🚀</span>Commencez dès maintenant</h3>
        <p class="service-list">
          ${productType === 'annonces' ? `
          Pour créer et gérer vos(votre) annonce(s), cliquez sur le bouton ci-dessous pour vous rendre dans le tableau de bord / rubrique <strong>Mes annonces</strong> et cliquez sur <strong>"+ Ajouter une annonce"</strong>.<br>
            <a href="${baseUrl}/settings?tab=listings" class="cta-button">Déposer votre première annonce</a>
            ` : productType === 'publicite' ? `
            Pour créer et gérer votre publicité, cliquez sur le bouton ci-dessous pour vous rendre dans le tableau de bord / rubrique <strong>Mes commandes</strong>. Sur la droite de votre commande cliquez sur <strong>"Créer ma publicité"</strong>.<br>
            <a href="${baseUrl}/settings?tab=orders" class="cta-button">Créer ma publicité</a>
            ` : productType === 'mise_en_avant' ? `
            Pour gérer votre annonce Mise en Avant, cliquez sur le bouton ci-dessous pour vous rendre dans le tableau de bord / rubrique <strong>Mise en avant</strong>. Cliquez sur <strong>"Choisir l'annonce à mettre en avant"</strong>.<br>
            <a href="${baseUrl}/settings?tab=highlight" class="cta-button">Gérer ma mise en avant</a>
            ` : `
            <a href="${baseUrl}/settings" class="cta-button">Accéder à votre espace</a>
            <a href="${baseUrl}/aide" class="cta-button">Guide d'utilisation</a>
          `}
        </p>
        <div class="cta-section">
          <a href="${baseUrl}/settings" class="cta-button grand">Accéder à mon compte</a>
        </div>
      </div>
  
      <!-- Support client -->
      <div class="info-box primary">
        <h3 class="box-title"><span>💬</span>Besoin d'aide ?</h3>
        <p>Notre équipe est là pour vous accompagner :</p>
        <div class="contact-info">
          <p>📞 <strong>Téléphone :</strong> <a href="tel:+33667244289">+33 (0)6 67 24 42 89</a></p>
          <p>📧 <strong>Email :</strong> <a href="mailto:contact@ma-maison-rapporte.com">contact@ma-maison-rapporte.com</a></p>
          <p>🕒 <strong>Horaires :</strong> Du lundi au vendredi, 9h-17h</p>
        </div>
      </div>
  
      <!-- Informations importantes -->
      <div class="info-box neutral">
        <h3 class="box-title"><span>📄</span>Informations importantes</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Votre facture est disponible dans votre <a href="${baseUrl}/settings?tab=orders" style="color: #0891b2;">espace client</a></li>
          <li>Ce service se renouvelle automatiquement sauf résiliation</li>
          <li>Vous pouvez gérer vos préférences depuis votre compte</li>
          <li>En cas de question, consultez notre <a href="${baseUrl}/faq" style="color: #0891b2;">FAQ</a></li>
        </ul>
      </div>
    `;
  }
  
  // Template de notification pour l'équipe MMR
  export function generateAdminNotificationContent(orderData) {
    const {
      customerName,
      customerEmail,
      orderNumber,
      orderDate,
      productName,
      originalPrice,
      finalPrice,
      discountAmount,
      promoCode,
      serviceActivationDate
    } = orderData;
  
    const baseUrl = process.env.APP_URL || 'https://ma-maison-rapporte.com';
    const hasDiscount = discountAmount > 0;
  
    return `
      <h2 class="content-title">Nouvelle commande sur le site</h2>
      
      <p>Une nouvelle commande vient d'être passée et payée sur le site Ma Maison Rapporte.</p>
  
      <!-- Informations client -->
      <div class="info-box primary">
        <h3 class="box-title"><span>👤</span>Informations client</h3>
        <div class="contact-details">
          <p><strong>Nom :</strong> ${customerName}</p>
          <p><strong>Email :</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
          <p><strong>Date de commande :</strong> ${orderDate}</p>
        </div>
      </div>
  
      <!-- Détails de la commande -->
      <div class="order-summary mt-30">
        <h3 class="box-title"><span>🛒</span>Détails de la commande</h3>
        <p style="margin-bottom: 20px;"><strong>Commande #${orderNumber}</strong></p>
        
        <div class="order-row">
          <span>${productName}</span>
          <span>${originalPrice.toFixed(2)}€</span>
        </div>
        
        ${hasDiscount ? `
        <div class="order-row">
          <span>Code promo: ${promoCode}</span>
          <span class="discount">-${discountAmount.toFixed(2)}€</span>
        </div>
        ` : ''}
        
        <div class="order-row total">
          <span><strong>Total encaissé</strong></span>
          <span><strong>${finalPrice.toFixed(2)}€</strong></span>
        </div>
      </div>
  
      ${hasDiscount ? `
      <!-- Code promo utilisé -->
      <div class="promo-highlight">
        <strong>🎁 Code promo utilisé :</strong> ${promoCode} (-${Math.round((discountAmount / originalPrice) * 100)}%)
      </div>
      ` : ''}
  
      <!-- Actions rapides -->
      <div class="action-box success">
        <h3 class="box-title">🚀 Actions rapides</h3>
        <p><strong>Gestion client :</strong></p>
        <p>📧 Contacter le client : <a href="mailto:${customerEmail}">${customerEmail}</a></p>
        <p>🔗 Voir dans Directus : <a href="${process.env.DIRECTUS_URL}/admin/content/commandes">Gérer la commande</a></p>
      </div>
  
      <!-- Statistiques -->
      <div class="info-box neutral">
        <h3 class="box-title"><span>📊</span>Informations service</h3>
        <p><strong>Service activé :</strong> ${serviceActivationDate}</p>
        <p><strong>Type de produit :</strong> ${orderData.productType}</p>
        <p><strong>Paiement :</strong> Carte bancaire (Stripe)</p>
      </div>
    `;
  }
  
  // Template pour email d'échec de paiement
  export function generateStripeFailureContent(orderData) {
    const {
      customerName,
      orderNumber,
      productName,
      finalPrice,
      failureReason,
      retryUrl
    } = orderData;
  
    const baseUrl = process.env.APP_URL || 'https://ma-maison-rapporte.com';
  
    return `
      <h2 class="content-title">Problème avec votre paiement</h2>
      
      <p class="greeting">Bonjour <strong>${customerName}</strong>,</p>
      
      <p>Nous avons rencontré un problème lors du traitement de votre paiement pour la commande <strong>#${orderNumber}</strong>.</p>
  
      <!-- Détails de l'erreur -->
      <div class="info-box error">
        <h3 class="box-title"><span>❌</span>Échec du paiement</h3>
        <p><strong>Produit :</strong> ${productName}</p>
        <p><strong>Montant :</strong> ${finalPrice.toFixed(2)}€</p>
        <p><strong>Raison :</strong> ${failureReason}</p>
      </div>
  
      <!-- Solutions -->
      <div class="info-box warning">
        <h3 class="box-title"><span>🔧</span>Comment résoudre le problème</h3>
        <p>Voici quelques solutions pour finaliser votre achat :</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>Vérifiez les informations</strong> de votre carte bancaire</li>
          <li><strong>Contactez votre banque</strong> si le paiement a été refusé</li>
          <li><strong>Essayez une autre carte</strong> ou mode de paiement</li>
          <li><strong>Vérifiez la limite</strong> de votre carte</li>
        </ul>
      </div>
  
      <!-- Bouton pour réessayer -->
      <div class="message-box">
        <h3 class="box-title"><span>💳</span>Finaliser votre achat</h3>
        <p>Votre panier a été sauvegardé. Cliquez ci-dessous pour réessayer le paiement :</p>
        <div class="cta-section">
          <a href="${retryUrl || `${baseUrl}/checkout`}" class="cta-button grand">Réessayer le paiement</a>
        </div>
        <p style="text-align: center; margin-top: 15px;">
          <a href="${baseUrl}/contact" style="color: #0891b2;">Besoin d'aide ? Contactez-nous</a>
        </p>
      </div>
  
      <!-- Support -->
      <div class="action-box success">
        <h3 class="box-title">Notre équipe peut vous aider</h3>
        <p>Si le problème persiste, n'hésitez pas à nous contacter :</p>
        <p>📞 Appelez-nous au <a href="tel:+33667244289">+33 (0)6 67 24 42 89</a></p>
        <p>📧 Ou écrivez-nous à <a href="mailto:contact@ma-maison-rapporte.com">contact@ma-maison-rapporte.com</a></p>
      </div>
    `;
  }