export default defineEventHandler(async (event) => {
    try {
      const { token, email } = await readBody(event);
      
      // Validation des données
      if (!token || !email) {
        return {
          valid: false,
          message: 'Token ou email manquant'
        };
      }
  
      console.log('Validation du token de réinitialisation pour:', email);
  
      const runtimeConfig = useRuntimeConfig();
      const directusUrl = runtimeConfig.directusUrl || 'http://localhost:8055';
      const directusToken = runtimeConfig.directusApiToken;
  
      // Rechercher l'utilisateur avec ce token et cet email
      const userResponse = await fetch(`${directusUrl}/users?filter[email][_eq]=${encodeURIComponent(email)}&filter[password_reset_token][_eq]=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${directusToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!userResponse.ok) {
        console.error('Erreur lors de la recherche utilisateur:', userResponse.status);
        return {
          valid: false,
          message: 'Erreur serveur'
        };
      }
  
      const userData = await userResponse.json();
      
      if (!userData.data || userData.data.length === 0) {
        console.log('Token ou email invalide');
        return {
          valid: false,
          message: 'Token invalide ou expiré'
        };
      }
  
      const user = userData.data[0];
      
      // Vérifier l'expiration du token
      if (user.password_reset_expires) {
        const expiryDate = new Date(user.password_reset_expires);
        const now = new Date();
        
        if (now > expiryDate) {
          console.log('Token expiré pour utilisateur:', user.id);
          
          // Nettoyer le token expiré
          await fetch(`${directusUrl}/users/${user.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${directusToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              password_reset_token: null,
              password_reset_expires: null
            })
          });
          
          return {
            valid: false,
            message: 'Token expiré'
          };
        }
      }
  
      console.log('Token valide pour utilisateur:', user.id);
      
      return {
        valid: true,
        message: 'Token valide'
      };
  
    } catch (error) {
      console.error('Erreur dans validate-reset-token:', error);
      return {
        valid: false,
        message: 'Erreur lors de la validation'
      };
    }
  });