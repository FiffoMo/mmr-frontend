// utils/email/templates/base/styles.js
// Styles CORRIGÉS - header blanc + footer bandeau

export const EMAIL_STYLES = `
  <style>
    /* email-styles.css */
    /* Styles pour les templates email Ma Maison Rapporte */

    /* === RESET ET BASE === */
    body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
        line-height: 1.6; 
        color: #333; 
        margin: 0; 
        padding: 20px; 
        background-color: #F1F5F9; 
      }
      
      /* === CONTAINER PRINCIPAL === */
      .email-container { 
        max-width: 720px; 
        margin: 0 auto; 
        background-color: #ffffff; 
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); 
        border-radius: 8px;
        overflow: hidden;
        padding: 30px 20px; 
      }
      
      /* === HEADER === */
      .email-header { 
        background: linear-gradient(140deg, #03B6D4 0%, #0396D0 100%); 
        padding: 45px 20px 30px 20px; 
        text-align: center; 
      }
      
      .header-logo {
        max-width: 200px;
        height: auto;
        margin-bottom: 15px;
        display: block;
        margin-left: auto;
        margin-right: auto;
      }
      
      /* CORRECTION 1: Texte header en blanc avec !important */
      .email-header h3 { 
        color: #ffffff !important; 
        margin: 0;
        padding: 20px 0 10px 0; 
        font-size: 19px; 
        font-weight: bold; 
      }
      
      .email-header p { 
        color: rgba(255, 255, 255, 0.9); 
        margin: 10px 0 0 0; 
        font-size: 16px; 
      }
      
      /* Classe utilitaire pour texte blanc */
      .txt-blanc {
        color: #ffffff !important;
      }
      
      /* === CONTENU PRINCIPAL === */
      .email-content { 
        padding: 30px 20px; 
      }
      
      .content-title {
        color: #0891b2;
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 22px;
        font-weight: 600;
      }
      .box-title span {
        background-color: rgb(255, 255, 255);
        background: linear-gradient(130deg, #ffffff 0%, #b0dff2 100%); 
        padding: 15px 12px;
        border-radius: 50%;
        margin-right: 10px;
        -webkit-box-shadow: inset 2px 3px 10px -3px rgba(0,0,0,0.50);
        box-shadow: inset 2px 3px 10px -3px rgba(0,0,0,0.50);
      }
      
      .greeting {
        font-size: 16px;
        margin-bottom: 15px;
      }
      
      /* === BOÎTES D'INFORMATION === */
      .info-box {
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }

      .action-box.success {
        margin: 40px;
      }
      
      /* Boîte primaire (cyan) */
      .info-box.primary {
        background: #f0f9ff;
        border-left-color: #E4F5FF;
      }
      
      .info-box.primary .box-title {
        color: #0891b2;
      }
      
      /* Boîte secondaire (gris) */
      .info-box.secondary {
        background: #f8fafc;
        border-left-color: #64748b;
      }
      
      .info-box.secondary .box-title {
        color: #64748b;
      }
      
      /* Boîte succès (vert) */
      .info-box.success {
        background: #f0fdf4;
        border-left-color: #10b981;
      }
      
      .info-box.success .box-title {
        color: #065f46;
      }
      
      /* Boîte warning (orange) */
      .info-box.warning {
        background: rgba(255, 191, 81, 0.935);
      }
      
      .info-box.warning .box-title {
        color: #333;
        font-size: 18px;
      }
      
      /* Boîte erreur (rouge) */
      .info-box.error {
        background: #fef2f2;
        border-left-color: #ef4444;
      }
      
      .info-box.error .box-title {
        color: #dc2626;
      }
      
      /* Boîte neutre */
      .info-box.neutral {
        background: #f8fafc;
        border-left-color: #e5e7eb;
      }
      
      .info-box.neutral .box-title {
        color: #374151;
      }
      
      /* === TITRES DES BOÎTES === */
      .box-title {
        margin-top: 0;
        margin: 10px 10px 24px 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      /* === DÉTAILS DE CONTACT === */
      .contact-details {
        background: white;
        padding: 15px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }
      
      .contact-details p {
        margin: 5px 0;
      }
      
      .contact-info {
        background: white;
        padding: 15px;
        border-radius: 6px;
        margin: 15px 0;
        color: #333;
      }
      
      .contact-info p {
        margin: 5px 0;
      }
      
      /* === MESSAGE === */
      .message-box {
        background: #F1F5F9;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin: 30px 0;
      }
      
      .message-content {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        white-space: pre-line;
        font-family: inherit;
      }
      
      .recap-content {
        background: #ffffff;
        padding: 20px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        font-style: italic;
      }
      
      /* === LISTES === */
      .action-list, .service-list {
        margin: 10px 0;
        padding-left: 20px;
      }
      
      .action-list li, .service-list li {
        margin: 8px 0;
      }
      
      /* === LIENS === */
      a {
        color: #0891b2;
        text-decoration: none;
      }
      
      a:hover {
        color: #0e7490;
        text-decoration: underline;
      }
      
      .service-link {
        color: #0891b2;
        font-weight: 500;
      }
      
      .service-link:hover {
        color: #0e7490;
      }
      
      /* === BOUTON CTA === */
      .cta-section {
        text-align: center;
        margin: 30px 0;
      }
      
      .cta-button {
        display: block;
        background: #03B6D4;
        max-width: 50%;
        color: white !important;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        font-size: 16px;
        text-align: center;
        transition: background-color 0.2s;
        margin: 10px auto;
      }
      .cta-button.grand {
        max-width: 70%;
        padding: 12px 24px;
      }

      .cta-button.petit {
        max-width: 40%;
        padding: 6px 9px;
        margin-top: 20px;
      }

      .cta-button:hover {
        background: #0e7490;
        text-decoration: none;
      }
      
      /* === SÉPARATEUR === */
      .separator {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 30px 0;
      }
      
      /* === RÉCAPITULATIF COMMANDE === */
      .order-summary {
        background: #F1F5F9;
        padding: 20px;
        border-radius: 8px;
        margin: 25px 0;
        border-left: 4px solid #03B6D4;
      }
      
      .order-summary .box-title {
        margin: 10px 0 15px 0;
        color: #1f2937;
        font-size: 18px;
      }
      .order-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        padding: 8px 0;
      }
      
      .order-row.total {
        border-top: 1px solid #e5e7eb;
        padding-top: 15px;
        margin-top: 15px;
        font-size: 16px;
      }
      
      .discount {
        color: #059669;
        font-weight: 500;
      }
      
      /* === HIGHLIGHT PROMO === */
      .promo-highlight {
        background: #78E9A0;
        border-radius: 4px;
        padding: 10px;
        margin: 10px 0;
        text-align: center;
      }
      
      .promo-highlight strong {
        color: #2d2d2d;
      }
      
      /* === FOOTER CORRIGÉ === */
      .email-footer {
        background: #ffffff;
        text-align: center;
        font-size: 14px;
        color: #333;
        margin: 0;
        padding: 0;
      }
      
      /* CORRECTION 2: Bandeau foncé avec logo centré */
      .footer-logo-band {
        background: #1F2937;
        padding: 20px;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 80px;
      }
      
      .footer-logo-band img {
        max-width: 200px;
        height: auto;
        display: block;
      }
      
      .footer-contact-info {
        padding: 30px 20px;
        margin: 0;
        background-color: #f1f5f9;
        color: #333;
      }

      .email-footer a {
        color: #0891b2;
        text-decoration: none;
      }
      
      .email-footer a:hover {
        text-decoration: underline;
      }
      
      .email-footer p {
        margin: 5px 0;
      }
      
      .unsubscribe {
        margin-top: 15px !important;
        font-size: 12px !important;
        color: #9ca3af !important;
        padding: 15px 20px;
        background: #ffffff;
      }
      
      /* === TIMESTAMP === */
      .timestamp {
        margin: 10px 0 0 0 !important;
        font-size: 12px;
        color: #6b7280;
      }
      .mt-10 {
        margin-top: 10px;
      }
      .mt-20 {
        margin-top: 20px;
      }
      .mt-30 {
        margin-top: 30px;
      }
      .mb-10 {
        margin-bottom: 10px;
      }
      .mb-20 {
        margin-bottom: 20px;
      }
      .mb-30 {
        margin-bottom: 30px;
      }
      /* === RESPONSIVE === */
      @media only screen and (max-width: 600px) {
        body {
          padding: 10px;
        }
        
        .email-container { 
          margin: 0; 
          box-shadow: none;
          border-radius: 0;
        }
        
        .email-header, .email-content, .email-footer { 
          padding: 20px 15px; 
        }
        
        .email-header h1 { 
          font-size: 24px; 
        }
        
        .footer-logo-band {
          padding: 15px;
          min-height: 60px;
        }
        
        .footer-contact-info {
          padding: 20px 15px;
        }
        
        .order-row { 
          flex-direction: column;
          gap: 5px;
        }
        
        .order-row span:last-child {
          text-align: right;
        }
        
        .cta-button {
          display: block;
          width: 100%;
          box-sizing: border-box;
        }
      }
  </style>
`;