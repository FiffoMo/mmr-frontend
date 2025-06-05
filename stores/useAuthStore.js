// stores/useAuthStore.js - VERSION CORRIGÉE ET NETTOYÉE
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userType: (state) => state.user?.type || 0,
    isClient: (state) => state.user?.type >= 1,
    isAdClient: (state) => state.user?.type === 2,
    clientId: (state) => state.user?.id || null
  },
  
  actions: {
    // Initialiser l'état d'authentification depuis le localStorage
    initAuth() {
      // Vérifier si le code s'exécute dans un navigateur
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('auth_user');
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            
            // Vérifier la validité des données
            if (parsedUser && parsedUser.id && parsedUser.email) {
              this.token = token;
              this.user = parsedUser;
              console.log('Auth initialisée pour l\'utilisateur:', parsedUser.email);
              
              // Vérifier la validité du token en arrière-plan
              // this.validateTokenAsync();
            } else {
              console.log('Données utilisateur invalides, nettoyage...');
              this.clearAuth();
            }
          } catch (error) {
            console.error('Erreur lors du parsing des données utilisateur:', error);
            this.clearAuth();
          }
        } else {
          console.log('Aucun token ou données utilisateur trouvés');
          this.clearAuth();
        }
      }
    },
    
    // Valider le token de manière asynchrone
    async validateTokenAsync() {
      if (!this.token) return;
      
      try {
        const response = await fetch('/api/directus/users/me', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.log('Token invalide, déconnexion...');
          this.clearAuth();
          return;
        }
        
        const userData = await response.json();
        
        // Vérifier si l'utilisateur retourné correspond à celui stocké
        if (userData.data && userData.data.id !== this.user?.id) {
          console.log('Utilisateur différent détecté, mise à jour...');
          this.user = userData.data;
          this.syncUserData();
        }
        
      } catch (error) {
        console.error('Erreur lors de la validation du token:', error);
        this.clearAuth();
      }
    },
    
    // Définir l'état d'authentification avec nettoyage préalable
    setAuth(token, user) {
      // IMPORTANT: Nettoyer d'abord les anciennes données
      this.clearAuth();
      
      // Puis définir les nouvelles données
      this.token = token;
      this.user = user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
      
      console.log('Authentification définie pour:', user?.email, 'ID:', user?.id);
    },
    
    // Mettre à jour les données utilisateur
    setUser(userData) {
      if (!userData) return;
      
      // Fusionner les nouvelles données avec les données existantes
      this.user = { ...this.user, ...userData };
      
      // Persister les modifications dans le localStorage
      this.syncUserData();
      
      console.log('Données utilisateur mises à jour dans le store:', this.user);
    },
    
    // Synchroniser les données utilisateur avec le localStorage
    syncUserData() {
      if (typeof window !== 'undefined' && this.user) {
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
    },
    
    // Effacer l'état d'authentification de manière complète
    clearAuth() {
      this.token = null;
      this.user = null;
      this.error = null;
      
      if (typeof window !== 'undefined') {
        // Nettoyer le localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        // Nettoyer aussi d'autres clés potentielles
        ['directus_token', 'directus_user', 'user_session'].forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Nettoyer les cookies liés à Directus
        document.cookie.split(";").forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('directus') || name.includes('auth')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
      }
      
      console.log('Authentification complètement nettoyée');
    },

    // Méthode de déconnexion forcée pour debug
    forceLogout() {
      console.log('🔥 FORCE LOGOUT - Nettoyage complet');
      
      // Nettoyer l'état du store
      this.token = null;
      this.user = null;
      this.error = null;
      this.loading = false;
      
      // Nettoyer le localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Nettoyer tous les cookies
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      }
      
      console.log('✅ Force logout terminé');
    },
    
    // Se connecter avec nettoyage préalable
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        if (!email || !password) {
          throw new Error('Email et mot de passe requis');
        }
        
        // Nettoyer toute authentification précédente avant la nouvelle connexion
        this.clearAuth();
        
        console.log('Tentative de connexion pour:', email);
        
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        });
        
        console.log('Réponse login brute:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.log('Erreur login:', errorData);
          throw new Error(errorData.message || 'Identifiants incorrects');
        }
        
        const data = await response.json();
        console.log('Data login reçue:', data);
        
        if (!data.data || !data.data.access_token) {
          throw new Error('Token d\'accès manquant dans la réponse');
        }
        
        console.log('Token reçu, récupération des données utilisateur...');
        
        // Récupérer les informations utilisateur avec le nouveau token
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.data.access_token}`
          },
          credentials: 'include'
        });
        
        console.log('Réponse user data brute:', userResponse.status, userResponse.statusText);
        
        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          console.log('Erreur user data:', errorData);
          throw new Error(errorData.message || 'Erreur lors de la récupération des données utilisateur');
        }
        
        const userData = await userResponse.json();
        console.log('User data reçue:', userData);
        
        if (!userData.data || !userData.data.id) {
          throw new Error('Données utilisateur invalides');
        }
        
        console.log('Connexion réussie pour utilisateur:', userData.data.email, 'ID:', userData.data.id);
        
        // Définir l'état d'authentification avec les nouvelles données
        this.setAuth(data.data.access_token, userData.data);
        
        return userData.data;
      } catch (error) {
        console.error('Erreur de connexion:', error);
        this.error = error.message;
        this.clearAuth(); // Nettoyer en cas d'erreur
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Inscription d'un nouvel utilisateur
    async register(firstName, lastName, email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        // Nettoyer toute authentification précédente
        this.clearAuth();
        
        // Déterminer l'ID du rôle "Utilisateur"
        const roleId = '27b07ae3-cc05-402a-947e-23d847b0f329';
        
        console.log('Création du compte pour:', email);
        
        // Créer un nouvel utilisateur via l'API Directus
        const response = await fetch('/api/directus/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email.trim(),
            password: password,
            role: roleId,
            status: 'active' // S'assurer que le compte est actif
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.[0]?.message || 'Erreur lors de la création du compte');
        }
        
        const newUser = await response.json();
        console.log('Compte créé, connexion automatique...');
        
        // Se connecter automatiquement après l'inscription
        return await this.login(email, password);
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        this.error = error.message;
        this.clearAuth();
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Se déconnecter
    async logout() {
      this.loading = true;
      
      try {
        console.log('Déconnexion en cours...');
        
        if (this.token) {
          // Appel à l'API pour la déconnexion
          await fetch('/api/directus/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`
            },
            credentials: 'include'
          });
        }
      } catch (error) {
        console.error('Erreur lors de la déconnexion API:', error);
      } finally {
        // Effacer toutes les données d'authentification
        this.clearAuth();
        
        this.loading = false;
        
        // Rediriger vers la page d'accueil
        if (typeof window !== 'undefined') {
          console.log('Redirection vers la page d\'accueil');
          await navigateTo('/');
        }
      }
    },
    
    // Demander une réinitialisation de mot de passe
    async requestPasswordReset(email, resetUrl) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔄 Demande de réinitialisation de mot de passe pour:', email);
        
        // CORRECTION: Utiliser notre API personnalisée qui fonctionne
        const response = await fetch('/api/auth/password-reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim()
            // Note: resetUrl n'est pas nécessaire car il est construit côté serveur
          })
        });
        
        console.log('Statut réponse reset password:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur reset password:', errorData);
          throw new Error(errorData.statusMessage || 'Erreur lors de la demande de réinitialisation');
        }
        
        const result = await response.json();
        console.log('✅ Demande de réinitialisation envoyée avec succès');
        
        return result;
      } catch (error) {
        console.error('Erreur dans requestPasswordReset:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Réinitialiser le mot de passe
    async resetPassword(token, password) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/directus/auth/password/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token,
            password
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.[0]?.message || 'Erreur lors de la réinitialisation du mot de passe');
        }
        
        return true;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Vérifier si l'utilisateur est connecté (méthode améliorée)
    checkAuth() {
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');
        
        if (userStr && token) {
          try {
            const parsedUser = JSON.parse(userStr);
            
            // Vérifications de validité
            if (parsedUser && parsedUser.id && parsedUser.email && token.length > 10) {
              this.user = parsedUser;
              this.token = token;
              
              console.log('Auth vérifiée pour:', parsedUser.email);
              return true;
            } else {
              console.log('Données d\'authentification invalides');
              this.clearAuth();
              return false;
            }
          } catch (e) {
            console.error("Erreur lors de la vérification des données utilisateur:", e);
            this.clearAuth();
            return false;
          }
        } else {
          console.log('Aucune donnée d\'authentification trouvée');
          this.clearAuth();
          return false;
        }
      }
      
      return false;
    },
    
    // Nouvelle méthode pour vérifier la validité du token
    async checkToken() {
      if (!this.token) {
        this.clearAuth();
        return false;
      }
      
      try {
        const response = await fetch('/api/directus/users/me', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.log('Token expiré ou invalide');
          this.clearAuth();
          return false;
        }
        
        const userData = await response.json();
        
        if (userData.data) {
          // CORRECTION: Au lieu de comparer les IDs, mettre à jour les données
          // Si l'utilisateur est différent, c'est peut-être après un reset
          if (!this.user || userData.data.id !== this.user.id) {
            console.log('Mise à jour des données utilisateur après validation token');
            this.setUser(userData.data);
          } else {
            // Juste mettre à jour les données sans changer l'ID
            this.setUser(userData.data);
          }
          return true;
        } else {
          console.warn('Aucune donnée utilisateur retournée');
          this.clearAuth();
          return false;
        }
        
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        this.clearAuth();
        return false;
      }
    }
  }
});