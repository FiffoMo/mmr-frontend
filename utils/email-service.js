// utils/email-service.js

/**
 * Service d'envoi d'emails
 * Ce service peut être configuré pour utiliser différents fournisseurs d'email
 * comme nodemailer, sendgrid, etc.
 */

/**
 * Envoie un email
 * @param {Object} options - Options d'envoi
 * @param {string} options.to - Destinataire
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.text - Corps de l'email en texte brut (optionnel)
 * @param {string} options.html - Corps de l'email en HTML (optionnel)
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export async function sendMail(options) {
    // Vérification des paramètres requis
    if (!options.to || !options.subject || (!options.text && !options.html)) {
      throw new Error('Paramètres manquants pour l\'envoi d\'email');
    }
    
    // Configuration des variables d'environnement
    const emailService = process.env.EMAIL_SERVICE || 'directus';
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    const directusToken = process.env.DIRECTUS_ADMIN_TOKEN;
    
    // En fonction du service configuré
    switch (emailService.toLowerCase()) {
      case 'directus':
        // Utiliser Directus pour envoyer des emails
        try {
          const response = await fetch(`${directusUrl}/flows/trigger/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${directusToken}`
            },
            body: JSON.stringify({
              to: options.to,
              subject: options.subject,
              html: options.html || options.text
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erreur Directus: ${errorData.errors?.[0]?.message || response.status}`);
          }
          
          return { success: true };
        } catch (error) {
          console.error('Erreur lors de l\'envoi d\'email via Directus:', error);
          throw error;
        }
        
      // Vous pouvez ajouter d'autres services ici
      // case 'sendgrid':
      //   // Configuration pour SendGrid
      
      // case 'mailjet':
      //   // Configuration pour Mailjet
        
      default:
        // Service par défaut (simulé pour le développement)
        console.log(`À: ${options.to}`);
        console.log(`Sujet: ${options.subject}`);
        console.log(`Contenu: ${options.html || options.text}`);
        
        return { success: true, info: 'Email simulé (développement)' };
    }
    }

    /**
     * Construit un template d'email simple
     * @param {Object} options - Options du template
     * @param {string} options.title - Titre de l'email
     * @param {string} options.content - Contenu de l'email (peut contenir du HTML)
     * @param {string} options.buttonText - Texte du bouton (optionnel)
     * @param {string} options.buttonUrl - URL du bouton (optionnel)
     * @param {string} options.footerText - Texte du pied de page (optionnel)
     * @returns {string} - Template HTML
     */
    export function buildEmailTemplate(options) {
    const { title, content, buttonText, buttonUrl, footerText } = options;
    
    let buttonHtml = '';
    if (buttonText && buttonUrl) {
        buttonHtml = `
        <tr>
            <td align="center" style="padding: 20px 0;">
            <a href="${buttonUrl}" target="_blank" style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                ${buttonText}
            </a>
            </td>
        </tr>
        `;
    }
    
    let footerHtml = '';
    if (footerText) {
        footerHtml = `
        <tr>
            <td style="padding: 20px 0; text-align: center; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0;">
            ${footerText}
            </td>
        </tr>
        `;
    }
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #4a5568; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <tr>
            <td style="padding: 20px 0; text-align: center;">
                <h1 style="color: #2d3748; margin: 0;">${title}</h1>
            </td>
            </tr>
            <tr>
            <td style="padding: 20px 0;">
                ${content}
            </td>
            </tr>
            ${buttonHtml}
            ${footerHtml}
        </table>
        </body>
        </html>
    `;
    }