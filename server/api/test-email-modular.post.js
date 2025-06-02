// server/api/test-email-modular.post.js
// Test du système email modulaire (chemin import corrigé)
import { 
    testEmailConnection, 
    sendTemplatedEmail, 
    assembleEmailTemplate,
    sendSimpleEmail 
  } from '~/utils/email-service.js';  // ← Chemin corrigé !
  
  export default defineEventHandler(async (event) => {
    try {
      const body = await readBody(event);
      const { 
        type = 'connection',
        to = null 
      } = body;
  
      console.log('🧪 Test email modulaire:', { type, to });
  
      // Test 1: Connexion SMTP
      if (type === 'connection') {
        console.log('🔍 Test de connexion SMTP...');
        const connectionResult = await testEmailConnection();
        
        return {
          success: connectionResult.success,
          test: 'connection',
          result: connectionResult,
          timestamp: new Date().toISOString()
        };
      }
  
      // Test 2: Assemblage template seulement (sans envoi)
      if (type === 'template') {
        console.log('🔧 Test d\'assemblage template...');
        
        const testContent = `
          <h2 style="color: #0891b2;">🧪 Test Template Modulaire</h2>
          <p>Ce test vérifie que l'assemblage header + contenu + footer fonctionne correctement.</p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0369a1;">Composants testés:</h3>
            <ul>
              <li>✅ Header avec titre personnalisé</li>
              <li>✅ Styles CSS intégrés</li>
              <li>✅ Contenu principal (ce que vous lisez)</li>
              <li>✅ Footer avec liens</li>
            </ul>
          </div>
          
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString('fr-FR')}</p>
          <p><strong>Test ID:</strong> TEST-${Math.random().toString(36).substr(2, 9)}</p>
        `;
  
        const assembledHtml = assembleEmailTemplate({
          content: testContent,
          headerTitle: 'Test Template Modulaire',
          headerOptions: { 
            icon: '🧪',
            headerColor: '#059669' 
          },
          footerOptions: { 
            showUnsubscribe: false 
          }
        });
  
        return {
          success: true,
          test: 'template',
          result: {
            htmlGenerated: true,
            htmlLength: assembledHtml.length,
            preview: assembledHtml.substring(0, 500) + '...'
            // fullHtml: assembledHtml // Décommentez pour voir le HTML complet
          },
          timestamp: new Date().toISOString()
        };
      }
  
      // Test 3: Envoi email simple
      if (type === 'send-simple') {
        if (!to) {
          throw new Error('Adresse email "to" requise pour le test d\'envoi');
        }
  
        console.log('📧 Test envoi email simple...');
        
        const simpleContent = `
          <h2 style="color: #0891b2;">✅ Test Email Modulaire Réussi</h2>
          <p>Si vous recevez cet email, le système modulaire fonctionne parfaitement !</p>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #065f46;">🎯 Ce qui a été testé:</h3>
            <ul style="margin-bottom: 0;">
              <li>Configuration SMTP ✅</li>
              <li>Assemblage Header/Content/Footer ✅</li>
              <li>Envoi avec retry automatique ✅</li>
              <li>Templates modulaires ✅</li>
            </ul>
          </div>
          
          <p><strong>Prêt pour production !</strong></p>
          <p><small>Test envoyé le ${new Date().toLocaleString('fr-FR')}</small></p>
        `;
  
        const result = await sendSimpleEmail(
          to,
          '✅ Test Email Modulaire - Ma Maison Rapporte',
          simpleContent,
          {
            headerTitle: 'Test Email Modulaire',
            headerOptions: { icon: '✅', headerColor: '#059669' }
          }
        );
  
        return {
          success: result.success,
          test: 'send-simple',
          result: {
            sent: result.success,
            messageId: result.messageId,
            accepted: result.accepted,
            rejected: result.rejected,
            error: result.error
          },
          timestamp: new Date().toISOString()
        };
      }
  
      // Test 4: Test complet (connexion + envoi)
      if (type === 'full') {
        if (!to) {
          throw new Error('Adresse email "to" requise pour le test complet');
        }
  
        console.log('🔍 Test complet du système...');
        
        // 1. Test connexion
        const connectionTest = await testEmailConnection();
        if (!connectionTest.success) {
          return {
            success: false,
            test: 'full',
            error: 'Test de connexion échoué',
            details: connectionTest
          };
        }
  
        // 2. Test envoi
        const sendResult = await sendSimpleEmail(
          to,
          '🎯 Test Complet Système Email - Ma Maison Rapporte',
          `
            <h2 style="color: #0891b2;">🎯 Test Complet Réussi!</h2>
            <p>Tous les composants du système email modulaire fonctionnent:</p>
            
            <div class="success-box">
              <ul>
                <li>✅ Connexion SMTP validée</li>
                <li>✅ Templates assemblés</li>
                <li>✅ Email envoyé avec succès</li>
                <li>✅ Retry fonctionnel</li>
              </ul>
            </div>
            
            <p><strong>Le système est prêt pour la production!</strong></p>
            <p><small>Test effectué le ${new Date().toLocaleString('fr-FR')}</small></p>
          `,
          {
            headerTitle: 'Test Complet du Système',
            headerOptions: { icon: '🎯' }
          }
        );
  
        return {
          success: sendResult.success,
          test: 'full',
          result: {
            connection: connectionTest,
            sending: sendResult
          },
          timestamp: new Date().toISOString()
        };
      }
  
      throw new Error(`Type de test inconnu: ${type}`);
  
    } catch (error) {
      console.error('❌ Erreur test email modulaire:', error);
      
      return {
        success: false,
        test: type || 'unknown',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  });