// utils/email/templates/base/header.js
// Header CORRIGÉ avec texte blanc forcé

export function generateEmailHeader(title, options = {}) {
  const baseUrl = process.env.APP_URL || 'https://ma-maison-rapporte.com';
  
  return `
    <div class="email-header">
      <img src="${baseUrl}/images/logo_mmr_250.png" alt="Ma Maison Rapporte" class="header-logo">
      <h3 style="color: #ffffff !important;">Le premier portail immobilier<br>dédié aux biens avec potentiel locatif</h3>
    </div>
  `;
}