// server/api/directus/auth/password/reset.post.js
// Proxy vers notre API de reset-password-confirm

export default defineEventHandler(async (event) => {
    try {
      const body = await readBody(event);
      console.log('🔄 Proxy password reset vers notre API...');
      
      // Rediriger vers notre API qui fonctionne
      const response = await fetch(`${getRequestURL(event).origin}/api/auth/reset-password-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw createError({
          statusCode: response.status,
          statusMessage: errorData.statusMessage || 'Erreur de réinitialisation'
        });
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Erreur dans proxy password reset:', error);
      throw error;
    }
  });