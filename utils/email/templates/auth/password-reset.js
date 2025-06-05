import { generateEmailHeader } from '../base/header.js';
import { generateEmailFooter } from '../base/footer.js';
import { EMAIL_STYLES } from '../base/styles.js';

export function generatePasswordResetEmail(data) {
  const { firstName, lastName, resetLink, expiresIn } = data;
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de votre mot de passe</title>
  ${EMAIL_STYLES}
</head>
<body>
  <div class="email-container">
    ${generateEmailHeader('Ma Maison Rapporte')}
    
    <!-- Contenu principal -->
    <div class="email-content">
      <div class="info-box warning">
        <div class="box-title">
          <span>🔐</span>
          Réinitialisation de mot de passe demandée
        </div>
        <p>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte.</p>
      </div>
      
      <div class="greeting">
        <p>Bonjour ${firstName} ${lastName},</p>
      </div>
      
      <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte Ma Maison Rapporte.</p>
      
      <p>Pour définir votre nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
      
      <div class="cta-section">
        <a href="${resetLink}" class="cta-button grand">
          Définir mon nouveau mot de passe
        </a>
      </div>
      
      <div class="info-box primary">
        <div class="box-title">🛡️ Informations importantes :</div>
        <ul class="action-list">
          <li><strong>Ce lien expire dans ${expiresIn}</strong></li>
          <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
          <li>Votre mot de passe actuel reste inchangé tant que vous ne cliquez pas sur le lien</li>
          <li>Pour votre sécurité, utilisez un mot de passe fort et unique</li>
        </ul>
      </div>
      
      <hr class="separator">
      
      <div class="info-box secondary">
        <div class="box-title">🔒 Conseils de sécurité :</div>
        <p>Votre nouveau mot de passe doit contenir :</p>
        <ul class="action-list">
          <li>Au moins 8 caractères</li>
          <li>Au moins une majuscule et une minuscule</li>
          <li>Au moins un chiffre</li>
          <li>De préférence un caractère spécial</li>
        </ul>
      </div>
      
      <div class="info-box neutral">
        <div class="box-title">Le lien ne fonctionne pas ?</div>
        <p>Copiez et collez cette adresse dans votre navigateur :</p>
        <div class="recap-content">
          ${resetLink}
        </div>
      </div>
      
      <div class="contact-info">
        <p>Si vous rencontrez des difficultés ou si vous n'avez pas demandé cette réinitialisation, contactez-nous à :</p>
        <p><strong>Email :</strong> <a href="mailto:support@ma-maison-rapporte.com">support@ma-maison-rapporte.com</a></p>
        <p><strong>Téléphone :</strong> 01 23 45 67 89</p>
      </div>
    </div>
    
    ${generateEmailFooter()}
  </div>
</body>
</html>
  `.trim();
}

export function generatePasswordChangedEmail(data) {
  const { firstName, lastName, changeDate } = data;
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mot de passe modifié avec succès</title>
  ${EMAIL_STYLES}
</head>
<body>
  <div class="email-container">
    ${generateEmailHeader('Ma Maison Rapporte')}
    
    <!-- Contenu principal -->
    <div class="email-content">
      <div class="info-box success">
        <div class="box-title">
          <span>✅</span>
          Mot de passe modifié avec succès
        </div>
        <p>Votre mot de passe a été changé le ${changeDate}</p>
      </div>
      
      <div class="greeting">
        <p>Bonjour ${firstName} ${lastName},</p>
      </div>
      
      <p>Votre mot de passe Ma Maison Rapporte a été modifié avec succès.</p>
      
      <div class="info-box primary">
        <div class="box-title">📋 Détails de la modification :</div>
        <ul class="action-list">
          <li><strong>Date et heure :</strong> ${changeDate}</li>
          <li><strong>Compte :</strong> ${firstName} ${lastName}</li>
          <li><strong>Action :</strong> Réinitialisation de mot de passe</li>
        </ul>
      </div>
      
      <p>Vous pouvez maintenant vous connecter à votre compte avec votre nouveau mot de passe.</p>
      
      <div class="cta-section">
        <a href="${process.env.PUBLIC_URL || 'https://ma-maison-rapporte.com'}/login" class="cta-button">
          Se connecter à mon compte
        </a>
      </div>
      
      <div class="info-box error">
        <div class="box-title">🛡️ Cette modification n'était pas autorisée ?</div>
        <p>Si vous n'avez pas demandé cette modification de mot de passe, votre compte pourrait être compromis.</p>
        <p><strong>Actions recommandées :</strong></p>
        <ul class="action-list">
          <li>Contactez immédiatement notre support</li>
          <li>Vérifiez vos autres comptes en ligne</li>
          <li>Changez les mots de passe de vos autres services</li>
        </ul>
      </div>
      
      <div class="contact-info">
        <p><strong>Besoin d'aide ?</strong> Notre équipe support est là pour vous :</p>
        <p><strong>Email :</strong> <a href="mailto:support@ma-maison-rapporte.com">support@ma-maison-rapporte.com</a></p>
        <p><strong>Téléphone :</strong> 01 23 45 67 89</p>
      </div>
    </div>
    
    ${generateEmailFooter()}
  </div>
</body>
</html>
  `.trim();
}