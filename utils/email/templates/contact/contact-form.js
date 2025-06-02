// utils/email/templates/contact/contact-form.js
// Template contact avec votre design exact

export function generateContactEmailContent(data, type = 'team') {
  const { name, email, phone, message, timestamp, ip, userAgent } = data;
  const baseUrl = process.env.APP_URL || 'https://ma-maison-rapporte.com';

  if (type === 'team') {
    // Email pour l'équipe Ma Maison Rapporte - VOTRE DESIGN
    return `
      <h2 class="content-title">Nouveau message</h2>
      
      <div class="info-box primary">
        <h3 class="box-title"><span>👤</span>Informations du contact</h3>
        <div class="contact-details">
          <p><strong>Nom :</strong> ${name || 'Non renseigné'}</p>
          <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ''}
          <p><strong>Date :</strong> ${timestamp || new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
      
      <div class="message-box">
        <h3 class="box-title"><span>💬</span>Message</h3>
        <div class="message-content">
${message}
        </div>
      </div>
      
      <div class="action-box success">
        <h4 class="box-title">🚀 Actions rapides</h4>
        <p><strong>Pour répondre :</strong></p>
        <p>📧 Répondre directement à <a href="mailto:${email}">${email}</a></p>
        ${phone ? `<p>📞 Appeler au <a href="tel:${phone.replace(/\s/g, '')}">${phone}</a></p>` : ''}
      </div>
    `;
  }

  if (type === 'confirmation') {
    // Email de confirmation pour le client - VOTRE DESIGN
    return `
      <h2 class="content-title">Confirmation de réception</h2>
      
      <p class="greeting">Bonjour${name ? ` <strong>${name}</strong>` : ''},</p>
      
      <p>Nous avons bien reçu votre message et vous remercions de nous avoir contactés.</p>
      
      <div class="message-box">
        <h3 class="box-title"><span>💬</span>Récapitulatif de votre message</h3>
        <div class="recap-content">
          <p><em>"${message.length > 100 ? message.substring(0, 100) + '...' : message}"</em></p>
        </div>
      </div>
      
      <div class="action-box success">
        <h3 class="box-title">Notre équipe vous répondra sous 24-48h</h3>
        <p>En attendant, n'hésitez pas à nous contacter directement :</p>
        
        <div class="contact-info">
          <p><strong>Téléphone :</strong> <a href="tel:+33667244289">+33 (0)6 67 24 42 89</a></p>
          <p><strong>Horaires :</strong> Du lundi au vendredi, 9h-17h</p>
          <p><strong>Email :</strong> <a href="mailto:contact@ma-maison-rapporte.com">contact@ma-maison-rapporte.com</a></p>
          <p><strong>Adresse :</strong> 12 Rue de la Part-Dieu, 69003 Lyon</p>
        </div>
      </div>
      
      <div class="message-box">
        <h3 class="box-title"><span>🏠</span>Découvrez nos services</h3>
        <p class="service-list">
          <a href="${baseUrl}" class="cta-button">Parcourir les annonces</a> 
          <a href="${baseUrl}/deposer-annonce" class="cta-button">Déposer une annonce</a>
          <a href="${baseUrl}/tarifs" class="cta-button">Voir nos tarifs</a>
        </p>
        <div class="cta-section">
          <a href="${baseUrl}" class="cta-button grand">Visiter notre site</a>
        </div>
      </div>
    `;
  }

  return '<p>Type de template non reconnu.</p>';
}