// server/api/send-email.post.js - VERSION SANS IMPORTS DYNAMIQUES
import { sendSimpleEmail, assembleEmailTemplate } from '~/utils/email-service.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { to, subject, html, content, headerTitle, headerOptions, footerOptions } = body;

    // Validation des données requises
    if (!to) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Destinataire (to) requis'
      });
    }

    if (!html && !content) {
      throw createError({
        statusCode: 400,
        statusMessage: 'HTML ou content requis'
      });
    }

    if (!subject) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Sujet requis'
      });
    }

    console.log('Demande d\'envoi email:', { to, subject, hasHtml: !!html, hasContent: !!content });

    let result;

    if (html) {
      // Envoi direct avec HTML complet fourni
      result = await sendSimpleEmail(to, subject, html);
    } else if (content) {
      // Assemblage avec template modulaire
      const assembledHtml = assembleEmailTemplate({
        content,
        headerTitle: headerTitle || subject,
        headerOptions: headerOptions || {},
        footerOptions: footerOptions || {}
      });
      
      result = await sendSimpleEmail(to, subject, assembledHtml);
    }

    console.log('Email envoyé avec succès:', result.messageId);

    return {
      success: true,
      messageId: result.messageId,
      message: 'Email envoyé avec succès'
    };

  } catch (error) {
    console.error('Erreur lors de l\'envoi d\'email:', error);

    // Gestion des erreurs spécifiques
    if (error.statusCode) {
      throw error;
    }

    // Erreurs SMTP ou autres
    if (error.code === 'EAUTH') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur d\'authentification SMTP'
      });
    }

    if (error.code === 'ECONNECTION') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Impossible de se connecter au serveur email'
      });
    }

    if (error.responseCode === 550) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Adresse email invalide'
      });
    }

    // Erreur générique
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de l\'envoi de l\'email'
    });
  }
});