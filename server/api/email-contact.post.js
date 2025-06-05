// server/api/email-contact.post.js - VERSION TEST SANS DIRECTUS
import { createRequire } from 'module';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { emailVisiteur, nomVisiteur, telephone, annonceId, message, annonceTitle } = body;
    
    if (!emailVisiteur || !nomVisiteur || !message || !annonceId) {
      return {
        statusCode: 400,
        body: { success: false, message: 'Données incomplètes' }
      };
    }

    const require = createRequire(import.meta.url);
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: parseInt(process.env.EMAIL_SMTP_PORT),
      secure: process.env.EMAIL_SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();

    // TEST TEMPORAIRE : Simuler les données d'annonce (éviter problème permissions)
    const proprietaireEmail = "philmicro@universduweb.net"; // Votre email pour test
    const proprietaireNom = "Propriétaire Test";
    
    console.log("📧 Test envoi email de contact - simulation annonce");
    console.log("Email propriétaire:", proprietaireEmail);
    console.log("Email visiteur:", emailVisiteur);

    // Email au propriétaire
    const emailProprietaireHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nouvelle demande pour votre annonce</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0891b2;">Nouvelle demande pour votre annonce</h2>
          <h3 style="color: #374151;">${annonceTitle}</h3>
          
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>De :</strong> ${nomVisiteur}</p>
            <p><strong>Email :</strong> ${emailVisiteur}</p>
            ${telephone ? `<p><strong>Téléphone :</strong> ${telephone}</p>` : ''}
          </div>
          
          <div style="background: #fff; border-left: 4px solid #0891b2; padding: 15px; margin: 20px 0;">
            <h4>Message :</h4>
            <p>${message}</p>
          </div>
          
          <p style="margin-top: 30px;">
            <a href="${process.env.APP_URL}/login" style="background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Répondre dans mon compte
            </a>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">
            Ma Maison Rapporte - ${process.env.APP_URL}
          </p>
        </div>
      </body>
      </html>
    `;

    const emailConfirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de votre demande</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0891b2;">Confirmation de votre demande</h2>
          
          <p>Bonjour ${nomVisiteur},</p>
          
          <p>Votre message concernant l'annonce <strong>"${annonceTitle}"</strong> a bien été transmis au propriétaire.</p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Votre message :</strong></p>
            <p style="font-style: italic;">"${message}"</p>
          </div>
          
          <p>Le propriétaire recevra une notification et pourra vous répondre directement par email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">
            Ma Maison Rapporte - ${process.env.APP_URL}
          </p>
        </div>
      </body>
      </html>
    `;

    // Envoi des emails
    const emailProprietaire = await transporter.sendMail({
      from: `"Ma Maison Rapporte" <${process.env.EMAIL_FROM}>`,
      to: proprietaireEmail,
      subject: `Nouvelle demande pour votre annonce: ${annonceTitle}`,
      html: emailProprietaireHtml,
      replyTo: emailVisiteur
    });
    
    const emailConfirmation = await transporter.sendMail({
      from: `"Ma Maison Rapporte" <${process.env.EMAIL_FROM}>`,
      to: emailVisiteur,
      subject: `Confirmation de votre demande - ${annonceTitle}`,
      html: emailConfirmationHtml
    });
    
    return {
      statusCode: 200,
      body: { 
        success: true, 
        message: 'Emails envoyés avec succès',
        details: {
          proprietaire: emailProprietaire.messageId,
          confirmation: emailConfirmation.messageId
        }
      }
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des emails:', error);
    
    return {
      statusCode: 500,
      body: { 
        success: false, 
        message: error.message
      }
    };
  }
});