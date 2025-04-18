// server/api/email-contact.post.js

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
  
      // Configuration de l'environnement
      const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
      const directusToken = process.env.DIRECTUS_ADMIN_TOKEN;
      
      // Récupérer les informations de l'annonce
      const annonceResponse = await fetch(`${directusUrl}/items/annonces/${annonceId}?fields=*,proprietaire.*`, {
        headers: {
          'Authorization': `Bearer ${directusToken}`
        }
      });
      
      if (!annonceResponse.ok) {
        throw new Error(`Erreur lors de la récupération de l'annonce: ${annonceResponse.status}`);
      }
      
      const annonceData = await annonceResponse.json();
      const annonce = annonceData.data;
      
      if (!annonce || !annonce.proprietaire) {
        throw new Error('Annonce ou propriétaire non trouvé');
      }
      
      const proprietaireEmail = annonce.proprietaire.email;
      const proprietaireNom = `${annonce.proprietaire.first_name || ''} ${annonce.proprietaire.last_name || ''}`.trim();
      
      // Configuration pour l'envoi d'emails
      // Nous utilisons ici directus comme service email
      
      // 1. Email au propriétaire
      await fetch(`${directusUrl}/flows/trigger/email-proprietaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${directusToken}`
        },
        body: JSON.stringify({
          to: proprietaireEmail,
          subject: `Nouvelle demande pour votre annonce: ${annonceTitle}`,
          emailVisiteur,
          nomVisiteur,
          telephone,
          message,
          annonceTitle,
          annonceId
        })
      });
      
      // 2. Email de confirmation au visiteur
      await fetch(`${directusUrl}/flows/trigger/email-confirmation-visiteur`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${directusToken}`
        },
        body: JSON.stringify({
          to: emailVisiteur,
          subject: `Confirmation de votre demande - ${annonceTitle}`,
          nomVisiteur,
          message,
          annonceTitle,
          proprietaireNom: proprietaireNom || "Le propriétaire"
        })
      });
      
      return {
        statusCode: 200,
        body: { success: true, message: 'Emails envoyés avec succès' }
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails:', error);
      
      return {
        statusCode: 500,
        body: { success: false, message: error.message }
      };
    }
  });