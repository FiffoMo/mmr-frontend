// utils/email/templates/base/footer.js
// Footer CORRIGÉ avec bandeau foncé et logo centré

export function generateEmailFooter(options = {}) {
  const baseUrl = process.env.APP_URL || 'https://ma-maison-rapporte.com';
  const showUnsubscribe = options.showUnsubscribe !== false;
  
  return `
    <div class="email-footer">
      <!-- Bandeau foncé avec logo centré -->
      <div class="footer-logo-band">
        <img src="${baseUrl}/images/logo_mmr_clair_200.png" alt="Ma Maison Rapporte">
      </div>
      
      <!-- Informations de contact -->
      <div class="footer-contact-info">
        <h3><strong>MMR - Ma Maison Rapporte Sàrl</strong></h3>
        <p><strong>Téléphone :</strong> <a href="tel:+33667244289">+33 (0)6 67 24 42 89</a></p>
        <p><strong>Horaires :</strong> Du lundi au vendredi, 9h-17h</p>
        <p><strong>Email :</strong> <a href="mailto:contact@ma-maison-rapporte.com">contact@ma-maison-rapporte.com</a></p>
        <p><strong>Adresse :</strong> 12 Rue de la Part-Dieu, 69003 Lyon</p>
        <p><a href="${baseUrl}" class="cta-button petit">Visitez notre site</a></p>
      </div>
      
      ${showUnsubscribe ? `
      <div class="unsubscribe">
        Cet email a été envoyé automatiquement.<br>
        Si vous ne souhaitez plus recevoir ces notifications, 
        <a href="${baseUrl}/unsubscribe">cliquez ici</a>.
      </div>
      ` : ''}
    </div>
  `;
}