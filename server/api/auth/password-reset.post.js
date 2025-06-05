// server/api/auth/password-reset.post.js - VERSION CORRIGÉE
import crypto from 'crypto';
import { generatePasswordResetEmail } from '~/utils/email/templates/auth/password-reset.js';
import { sendSimpleEmail } from '~/utils/email-service.js';

export default defineEventHandler(async (event) => {
  try {
    const { email } = await readBody(event);
    
    // Validation des données
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'L\'adresse email est requise'
      });
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Format d\'email invalide'
      });
    }

    console.log('Demande de réinitialisation de mot de passe pour:', email);

    const runtimeConfig = useRuntimeConfig();
    const directusUrl = runtimeConfig.directusUrl || 'http://localhost:8055';
    const directusToken = runtimeConfig.directusApiToken;

    // Étape 1: Vérifier que l'utilisateur existe
    const checkUserResponse = await fetch(`${directusUrl}/users?filter[email][_eq]=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!checkUserResponse.ok) {
      console.error('Erreur lors de la vérification utilisateur:', checkUserResponse.status);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur serveur lors de la vérification de l\'utilisateur'
      });
    }

    const checkUserData = await checkUserResponse.json();
    
    if (!checkUserData.data || checkUserData.data.length === 0) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      // On retourne toujours un succès même si l'utilisateur n'existe pas
      console.log('Utilisateur non trouvé pour email:', email);
      return {
        success: true,
        message: 'Si cette adresse email existe dans notre système, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.'
      };
    }

    const user = checkUserData.data[0];
    console.log('Utilisateur trouvé:', user.id);

    // Étape 2: Générer un token de réinitialisation sécurisé
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    // Étape 3: Stocker le token de réinitialisation dans Directus
    const updateUserResponse = await fetch(`${directusUrl}/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password_reset_token: resetToken,
        password_reset_expires: resetTokenExpiry.toISOString()
      })
    });

    if (!updateUserResponse.ok) {
      console.error('Erreur lors de la sauvegarde du token:', updateUserResponse.status);
      const errorText = await updateUserResponse.text();
      console.error('Détails erreur:', errorText);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la génération du token de réinitialisation'
      });
    }

    console.log('Token de réinitialisation généré et sauvegardé pour utilisateur:', user.id);

    // Étape 4: Générer et envoyer l'email directement
    const resetLink = `${runtimeConfig.public?.appUrl || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const emailHtml = generatePasswordResetEmail({
      firstName: user.first_name || 'Utilisateur',
      lastName: user.last_name || '',
      resetLink: resetLink,
      expiresIn: '24 heures'
    });

    // Envoi avec sendSimpleEmail (mais attention: va créer un doublon header/footer)
    const emailResult = await sendSimpleEmail(
      email,
      'Réinitialisation de votre mot de passe - Ma Maison Rapporte',
      emailHtml
    );

    if (emailResult.success) {
      console.log('Email de réinitialisation envoyé avec succès à:', email);
    } else {
      console.error('Erreur lors de l\'envoi de l\'email:', emailResult.error);
      // Log l'erreur mais ne pas faire échouer la requête
    }

    return {
      success: true,
      message: 'Un email avec les instructions de réinitialisation a été envoyé à votre adresse.'
    };

  } catch (error) {
    console.error('Erreur dans password-reset:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la génération du token de réinitialisation'
    });
  }
});