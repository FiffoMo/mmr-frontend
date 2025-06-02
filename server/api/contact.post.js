// server/api/contact.post.js
// Version SANS limitation pour les tests
import { sendTemplatedEmail } from '~/utils/email-service.js';
import { generateContactEmailContent } from '~/utils/email/templates/contact/contact-form.js';

// Configuration test/prod
const IS_DEV = process.env.NODE_ENV === 'development';
const DISABLE_RATE_LIMIT = true; // ← Mettez false pour réactiver

// Cache simple pour limitation par IP (en mémoire)
const ipLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 heure en ms
const MAX_MESSAGES_PER_HOUR = 3;
const EMAIL_TIMEOUT = 15000; // 15 secondes timeout

export default defineEventHandler(async (event) => {
  const startTime = Date.now();
  
  try {
    const body = await readBody(event);
    const headers = getHeaders(event);
    const clientIP = headers['x-forwarded-for'] || headers['x-real-ip'] || '127.0.0.1';
    const userAgent = headers['user-agent'] || '';
    
    console.log('📧 Nouveau message contact:', {
      ip: clientIP,
      hasName: !!body.name,
      hasEmail: !!body.email,
      messageLength: body.message?.length || 0,
      timestamp: new Date().toISOString(),
      rateLimitDisabled: DISABLE_RATE_LIMIT
    });

    // === VALIDATIONS ET ANTI-SPAM ===
    
    // 1. Validation des champs obligatoires
    if (!body.email || !body.message) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email et message requis'
      });
    }

    // 2. Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Format email invalide'
      });
    }

    // 3. ANTI-SPAM : Honeypot (champ caché qui doit rester vide)
    if (body.website || body.url || body.honeypot) {
      console.warn('🚨 Tentative de spam détectée (honeypot):', clientIP);
      // Simuler un succès pour ne pas révéler le honeypot
      return {
        success: true,
        message: 'Message envoyé avec succès',
        timestamp: new Date().toISOString()
      };
    }

    // 4. ANTI-SPAM : Question mathématique simple (si fournie)
    if (body.mathQuestion && body.mathAnswer) {
      const [num1, operator, num2] = body.mathQuestion.split(' ');
      let expectedAnswer;
      
      switch (operator) {
        case '+':
          expectedAnswer = parseInt(num1) + parseInt(num2);
          break;
        case '-':
          expectedAnswer = parseInt(num1) - parseInt(num2);
          break;
        case '*':
        case '×':
          expectedAnswer = parseInt(num1) * parseInt(num2);
          break;
        default:
          expectedAnswer = null;
      }
      
      if (expectedAnswer !== null && parseInt(body.mathAnswer) !== expectedAnswer) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Réponse mathématique incorrecte'
        });
      }
    }

    // 5. ANTI-SPAM : Limitation par IP (DÉSACTIVÉE POUR LES TESTS)
    if (!DISABLE_RATE_LIMIT) {
      const now = Date.now();
      const ipKey = clientIP;
      
      if (ipLimits.has(ipKey)) {
        const ipData = ipLimits.get(ipKey);
        
        // Nettoyer les anciens messages
        ipData.messages = ipData.messages.filter(timestamp => 
          now - timestamp < RATE_LIMIT_WINDOW
        );
        
        if (ipData.messages.length >= MAX_MESSAGES_PER_HOUR) {
          throw createError({
            statusCode: 429,
            statusMessage: `Trop de messages envoyés. Veuillez patienter avant de renvoyer un message.`
          });
        }
        
        ipData.messages.push(now);
      } else {
        ipLimits.set(ipKey, { messages: [now] });
      }
    } else {
      console.log('⚠️ Rate limiting DÉSACTIVÉ pour les tests');
    }

    // 6. Validation longueur des champs
    if (body.message.length > 5000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message trop long (maximum 5000 caractères)'
      });
    }

    if (body.name && body.name.length > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nom trop long (maximum 100 caractères)'
      });
    }

    // === PRÉPARATION DES DONNÉES ===
    
    const contactData = {
      name: body.name?.trim(),
      email: body.email?.trim().toLowerCase(),
      phone: body.phone?.trim(),
      message: body.message?.trim(),
      timestamp: new Date().toLocaleString('fr-FR'),
      ip: clientIP,
      userAgent: userAgent
    };

    console.log('✅ Validations anti-spam passées pour:', contactData.email);

    // === ENVOI DES EMAILS AVEC TIMEOUT ===
    
    // Fonction d'envoi avec timeout
    const sendWithTimeout = async (emailPromise, description) => {
      return Promise.race([
        emailPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout ${description} après ${EMAIL_TIMEOUT}ms`)), EMAIL_TIMEOUT)
        )
      ]);
    };

    let success = false;
    let details = {};

    // 1. Email pour l'équipe MMR (obligatoire) - AVEC TIMEOUT
    try {
      console.log('📧 Envoi email équipe...');
      const teamEmailContent = generateContactEmailContent(contactData, 'team');
      
      const teamEmailPromise = sendTemplatedEmail({
        to: [process.env.EMAIL_SMTP_USER || 'contact@ma-maison-rapporte.com'],
        subject: `📧 Nouveau contact - ${contactData.name || contactData.email}`,
        content: teamEmailContent,
        headerTitle: 'Nouveau Message de Contact',
        headerOptions: { 
          icon: '📧', 
          headerColor: '#0891b2' 
        },
        footerOptions: { 
          showUnsubscribe: false 
        }
      });

      const teamResult = await sendWithTimeout(teamEmailPromise, 'email équipe');
      
      if (teamResult.success) {
        success = true;
        details.equipe = {
          sent: true,
          messageId: teamResult.messageId
        };
        console.log('✅ Email équipe envoyé:', teamResult.messageId);
      } else {
        console.error('❌ Échec email équipe:', teamResult.error);
        details.equipe = {
          sent: false,
          error: teamResult.error
        };
      }
    } catch (error) {
      console.error('❌ Timeout/Erreur email équipe:', error.message);
      details.equipe = {
        sent: false,
        error: error.message,
        isTimeout: error.message.includes('Timeout')
      };
    }

    // 2. Email de confirmation pour l'utilisateur (si demandé) - AVEC TIMEOUT
    if (body.sendCopy && success) { // Seulement si l'email équipe a réussi
      try {
        console.log('📧 Envoi email confirmation...');
        const confirmationContent = generateContactEmailContent(contactData, 'confirmation');
        
        const confirmationEmailPromise = sendTemplatedEmail({
          to: [contactData.email],
          subject: '✅ Confirmation de votre message - Ma Maison Rapporte',
          content: confirmationContent,
          headerTitle: 'Message bien reçu',
          headerOptions: { 
            icon: '✅', 
            headerColor: '#059669' 
          },
          footerOptions: { 
            showUnsubscribe: true 
          }
        });

        const confirmationResult = await sendWithTimeout(confirmationEmailPromise, 'email confirmation');
        
        if (confirmationResult.success) {
          details.confirmation = {
            sent: true,
            messageId: confirmationResult.messageId
          };
          console.log('✅ Email confirmation envoyé:', confirmationResult.messageId);
        } else {
          console.warn('⚠️ Échec email confirmation (non bloquant):', confirmationResult.error);
          details.confirmation = {
            sent: false,
            error: confirmationResult.error
          };
        }
      } catch (error) {
        console.warn('⚠️ Timeout/Erreur email confirmation (non bloquant):', error.message);
        details.confirmation = {
          sent: false,
          error: error.message,
          isTimeout: error.message.includes('Timeout')
        };
      }
    }

    // Nettoyer périodiquement le cache des IPs (simple)
    if (!DISABLE_RATE_LIMIT && Math.random() < 0.1) { // 10% de chance
      cleanupIPLimits();
    }

    const processingTime = Date.now() - startTime;
    console.log(`📊 Contact traité en ${processingTime}ms`);

    return {
      success,
      message: success ? 'Message envoyé avec succès' : 'Erreur lors de l\'envoi du message',
      details,
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}ms`,
      timeout: EMAIL_TIMEOUT,
      rateLimitDisabled: DISABLE_RATE_LIMIT
    };

  } catch (error) {
    console.error('❌ Erreur contact:', error);
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: false,
      message: error.statusMessage || error.message || 'Erreur lors de l\'envoi du message',
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}ms`
    };
  }
});

// Fonction de nettoyage du cache IP
function cleanupIPLimits() {
  const now = Date.now();
  const keysToDelete = [];
  
  for (const [ip, data] of ipLimits.entries()) {
    data.messages = data.messages.filter(timestamp => 
      now - timestamp < RATE_LIMIT_WINDOW
    );
    
    if (data.messages.length === 0) {
      keysToDelete.push(ip);
    }
  }
  
  keysToDelete.forEach(key => ipLimits.delete(key));
  
  if (keysToDelete.length > 0) {
    console.log(`🧹 Cache IP nettoyé: ${keysToDelete.length} entrées supprimées`);
  }
}