// utils/email-service.js
// Service email modulaire unifié pour Ma Maison Rapporte
import { createRequire } from 'module';
import { SMTP_CONFIG, EMAIL_CONFIG } from './email/config/smtp.js';
import { generateEmailHeader } from './email/templates/base/header.js';
import { generateEmailFooter } from './email/templates/base/footer.js';
import { EMAIL_STYLES } from './email/templates/base/styles.js';

let transporterInstance = null;

// Créer le transporteur email avec retry
export const createEmailTransporter = async () => {
  if (transporterInstance) {
    return transporterInstance;
  }

  const require = createRequire(import.meta.url);
  const nodemailer = require('nodemailer');

  try {
    // CORRECTION: Utiliser createTransport (pas createTransporter)
    transporterInstance = nodemailer.createTransport(SMTP_CONFIG);
    
    // Vérifier la connexion
    await transporterInstance.verify();
    console.log('✅ Transporteur email initialisé avec succès');
    
    return transporterInstance;
  } catch (error) {
    console.error('❌ Erreur configuration SMTP:', error);
    transporterInstance = null;
    throw error;
  }
};

// Service principal d'assemblage et envoi d'emails
export const sendTemplatedEmail = async (emailOptions, maxRetries = 3) => {
  const {
    to,
    subject,
    content, // Contenu HTML du corps de l'email
    headerTitle = null,
    headerOptions = {},
    footerOptions = {},
    from = null
  } = emailOptions;

  console.log('📧 Préparation email templé:', {
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    hasContent: !!content,
    headerTitle
  });

  try {
    // Assembler le template complet
    const fullHtml = assembleEmailTemplate({
      content,
      headerTitle,
      headerOptions,
      footerOptions
    });

    // Préparer les options d'envoi
    const mailOptions = {
      from: from || `"${EMAIL_CONFIG.companyName}" <${EMAIL_CONFIG.from}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html: fullHtml
    };

    // Envoyer avec retry
    const result = await sendEmailWithRetry(mailOptions, maxRetries);
    
    console.log('✅ Email templé envoyé avec succès:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected
    };

  } catch (error) {
    console.error('❌ Erreur envoi email templé:', error);
    return {
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
};

// Fonction d'assemblage du template complet
export const assembleEmailTemplate = ({
  content,
  headerTitle = 'Email Ma Maison Rapporte',
  headerOptions = {},
  footerOptions = {}
}) => {
  
  console.log('🔧 Assemblage template:', {
    headerTitle,
    hasContent: !!content,
    contentLength: content?.length || 0
  });

  // Générer les parties
  const header = generateEmailHeader(headerTitle, headerOptions);
  const footer = generateEmailFooter(footerOptions);

  // Assembler le HTML complet
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerTitle}</title>
      ${EMAIL_STYLES}
    </head>
    <body>
      <div class="email-container">
        ${header}
        <div class="email-content">
          ${content || '<p>Contenu email manquant</p>'}
        </div>
        ${footer}
      </div>
    </body>
    </html>
  `;

  return fullHtml;
};

// Envoi avec retry (fonction interne)
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  const transporter = await createEmailTransporter();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Tentative d'envoi ${attempt}/${maxRetries}...`);
      
      const result = await transporter.sendMail(mailOptions);
      
      if (attempt > 1) {
        console.log(`✅ Email envoyé après ${attempt} tentatives`);
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Tentative ${attempt} échouée:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Pause progressive: 1s, 2s, 3s...
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Test de connexion SMTP
export const testEmailConnection = async () => {
  console.log('🔧 Test de la connexion SMTP...');
  
  try {
    const transporter = await createEmailTransporter();
    console.log('✅ Connexion SMTP OK');
    
    return { 
      success: true, 
      message: 'Connexion SMTP fonctionnelle',
      config: {
        host: SMTP_CONFIG.host,
        port: SMTP_CONFIG.port,
        user: SMTP_CONFIG.auth.user
      }
    };
    
  } catch (error) {
    console.error('❌ Erreur connexion SMTP:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Impossible de se connecter au serveur SMTP'
    };
  }
};

// Fonction utilitaire pour un email simple (sans template spécialisé)
export const sendSimpleEmail = async (to, subject, content, options = {}) => {
  return await sendTemplatedEmail({
    to,
    subject,
    content,
    headerTitle: options.headerTitle || subject,
    headerOptions: options.headerOptions || {},
    footerOptions: options.footerOptions || {},
    from: options.from
  }, options.maxRetries || 3);
};

// Export pour compatibilité avec l'ancien système (transition)
export const sendEmail = async (mailOptions, maxRetries = 3) => {
  // Mode compatibilité - si c'est l'ancien format
  if (mailOptions.html) {
    return await sendSimpleEmail(
      mailOptions.to,
      mailOptions.subject,
      mailOptions.html,
      { from: mailOptions.from, maxRetries }
    );
  }
  
  // Sinon, utiliser le nouveau système
  return await sendTemplatedEmail(mailOptions, maxRetries);
};