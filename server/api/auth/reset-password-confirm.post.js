// server/api/auth/reset-password-confirm.post.js - VERSION CORRIGÉE AVEC DEBUG

export default defineEventHandler(async (event) => {
  try {
    const { token, email, password } = await readBody(event);
    
    console.log('🔍 RESET PASSWORD DEBUG - Début du processus');
    console.log('Email:', email);
    console.log('Token:', token ? token.substring(0, 10) + '...' : 'MANQUANT');
    console.log('Password fourni:', password ? 'OUI' : 'NON');
    
    // Validation des données
    if (!token || !email || !password) {
      console.error('❌ Données manquantes:', { hasToken: !!token, hasEmail: !!email, hasPassword: !!password });
      throw createError({
        statusCode: 400,
        statusMessage: 'Données manquantes'
      });
    }

    // Validation du mot de passe
    if (password.length < 8) {
      console.error('❌ Mot de passe trop court');
      throw createError({
        statusCode: 400,
        statusMessage: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Validation des critères de mot de passe
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      console.error('❌ Critères mot de passe non respectés');
      throw createError({
        statusCode: 400,
        statusMessage: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      });
    }

    console.log('✅ Validation des données OK');

    const runtimeConfig = useRuntimeConfig();
    const directusUrl = runtimeConfig.directusUrl || 'http://localhost:8055';
    const directusToken = runtimeConfig.directusApiToken;

    console.log('🔧 Configuration Directus:', { url: directusUrl, hasToken: !!directusToken });

    // ÉTAPE 1: Rechercher l'utilisateur par EMAIL d'abord
    console.log('🔍 ÉTAPE 1: Recherche utilisateur par email...');
    const userSearchUrl = `${directusUrl}/users?filter[email][_eq]=${encodeURIComponent(email)}`;
    console.log('URL recherche utilisateur:', userSearchUrl);

    const userResponse = await fetch(userSearchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Statut recherche utilisateur:', userResponse.status);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('❌ Erreur lors de la recherche utilisateur:', userResponse.status, errorText);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur serveur lors de la recherche utilisateur'
      });
    }

    const userData = await userResponse.json();
    console.log('Résultats recherche utilisateur:', {
      count: userData.data?.length || 0,
      users: userData.data?.map(u => ({ id: u.id, email: u.email, hasResetToken: !!u.password_reset_token }))
    });
    
    if (!userData.data || userData.data.length === 0) {
      console.error('❌ Aucun utilisateur trouvé pour cet email');
      throw createError({
        statusCode: 400,
        statusMessage: 'Email non trouvé'
      });
    }

    const user = userData.data[0];
    console.log('👤 Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      hasResetToken: !!user.password_reset_token,
      resetTokenMatch: user.password_reset_token === token,
      tokenExpiry: user.password_reset_expires
    });

    // ÉTAPE 2: Vérifier que le token correspond
    if (!user.password_reset_token || user.password_reset_token !== token) {
      console.error('❌ Token de réinitialisation incorrect ou manquant');
      console.log('Token en base:', user.password_reset_token ? user.password_reset_token.substring(0, 10) + '...' : 'AUCUN');
      console.log('Token fourni:', token.substring(0, 10) + '...');
      throw createError({
        statusCode: 400,
        statusMessage: 'Token invalide'
      });
    }

    console.log('✅ Token de réinitialisation valide');
    
    // ÉTAPE 3: Vérifier l'expiration du token
    if (user.password_reset_expires) {
      const expiryDate = new Date(user.password_reset_expires);
      const now = new Date();
      
      console.log('🕐 Vérification expiration:', {
        expiry: expiryDate.toISOString(),
        now: now.toISOString(),
        expired: now > expiryDate
      });
      
      if (now > expiryDate) {
        console.error('❌ Token expiré');
        
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
        
        throw createError({
          statusCode: 400,
          statusMessage: 'Token expiré'
        });
      }
    }

    console.log('✅ Token non expiré');

    // ÉTAPE 4: Mettre à jour le mot de passe
    console.log('🔄 ÉTAPE 4: Mise à jour du mot de passe...');
    
    const updateData = {
      password: password,
      password_reset_token: null,
      password_reset_expires: null
    };

    console.log('Données de mise à jour:', {
      hasPassword: !!updateData.password,
      resetTokenCleared: updateData.password_reset_token === null,
      expiryCleared: updateData.password_reset_expires === null
    });

    const updateUrl = `${directusUrl}/users/${user.id}`;
    console.log('URL mise à jour:', updateUrl);

    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${directusToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    console.log('Statut mise à jour:', updateResponse.status);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Erreur lors de la mise à jour du mot de passe:', updateResponse.status, errorText);
      
      // Essayer de parser l'erreur JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Détails erreur JSON:', errorJson);
      } catch (e) {
        console.error('Erreur non-JSON:', errorText);
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la mise à jour du mot de passe'
      });
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Mise à jour réussie:', {
      userId: updateResult.data?.id,
      email: updateResult.data?.email,
      hasPassword: !!updateResult.data,
      resetTokenRemoved: !updateResult.data?.password_reset_token
    });

    // ÉTAPE 5: Test de connexion pour validation
    console.log('🧪 ÉTAPE 5: Test de connexion avec nouveau mot de passe...');
    
    const loginTestResponse = await fetch(`${directusUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    console.log('Statut test connexion:', loginTestResponse.status);

    if (loginTestResponse.ok) {
      const loginData = await loginTestResponse.json();
      console.log('✅ Test de connexion réussi - mot de passe bien enregistré');
    } else {
      const loginError = await loginTestResponse.text();
      console.error('❌ Test de connexion échoué:', loginTestResponse.status, loginError);
      
      // Pas fatal, mais indique un problème
      console.warn('⚠️  Le mot de passe a été mis à jour mais le test de connexion a échoué');
    }

    console.log('🎉 RESET PASSWORD - PROCESSUS TERMINÉ AVEC SUCCÈS');

    return {
      success: true,
      message: 'Votre mot de passe a été modifié avec succès',
      debug: {
        userId: user.id,
        email: user.email,
        passwordUpdated: true,
        tokenCleared: true
      }
    };

  } catch (error) {
    console.error('💥 ERREUR GLOBALE dans reset-password-confirm:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Une erreur est survenue lors de la modification du mot de passe'
    });
  }
});