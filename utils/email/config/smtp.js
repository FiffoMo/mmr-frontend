// utils/email/config/smtp.js
export const SMTP_CONFIG = {
  host: process.env.EMAIL_SMTP_HOST || 'mail.ma-maison-rapporte.com',
  port: parseInt(process.env.EMAIL_SMTP_PORT) || 465,
  secure: process.env.EMAIL_SMTP_SECURE === 'true' || process.env.EMAIL_SMTP_SECURE === true, // Support both string and boolean
  auth: {
    user: process.env.EMAIL_SMTP_USER || 'contact@ma-maison-rapporte.com',
    pass: process.env.EMAIL_SMTP_PASSWORD || 'XgS&!roM9PES@nQr'
  },
  tls: {
    rejectUnauthorized: false
  }
};

export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'no-reply@ma-maison-rapporte.com',
  companyName: 'Ma Maison Rapporte',
  baseUrl: process.env.APP_URL || 'http://localhost:3000',
  supportEmail: 'contact@ma-maison-rapporte.com'
};