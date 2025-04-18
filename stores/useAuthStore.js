// stores/useAuthStore.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    userType: (state) => state.user?.type || 0,
    isClient: (state) => state.user?.type >= 1,
    isAdClient: (state) => state.user?.type === 2,
    // Ajout d'un getter pour client_id
    clientId: (state) => state.user?.id || null
  },
  
  actions: {
    // Initialiser l'état d'authentification depuis le localStorage
    initAuth() {
      // Vérifier si le code s'exécute dans un navigateur
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('auth_user');
        
        if (token) {
          this.token = token;
          
          if (userData) {
            try {
              this.user = JSON.parse(userData);
            } catch (error) {
              console.error('Erreur lors du parsing des données utilisateur:', error);
              this.clearAuth();
            }
          }
        }
      }
    },
    
    // Définir l'état d'authentification
    setAuth(token, user) {
      this.token = token;
      this.user = user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    },
    
    // Mettre à jour les données utilisateur
    setUser(userData) {
      if (!userData) return;
      
      // Fusionner les nouvelles données avec les données existantes
      this.user = { ...this.user, ...userData };
      
      // Persister les modifications dans le localStorage
      if (typeof window !== 'undefined' && this.user) {
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
      
      console.log('Données utilisateur mises à jour dans le store:', this.user);
    },
    
    // Synchroniser les données utilisateur avec le localStorage
    syncUserData() {
      if (typeof window !== 'undefined' && this.user) {
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
    },
    
    // Effacer l'état d'authentification
    clearAuth() {
      this.token = null;
      this.user = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    },
    
    // Se connecter
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        if (!email || !password) {
          throw new Error('Email et mot de passe requis');
        }
        
        const response = await fetch('/api/directus/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            email: email,
            password: password
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.[0]?.message || 'Identifiants incorrects');
        }
        
        const data = await response.json();
        
        if (!data.data || !data.data.access_token) {
          throw new Error('Token d\'accès manquant dans la réponse');
        }
        
        // Récupérer les informations utilisateur
        const userResponse = await fetch('/api/directus/users/me', {
          headers: {
            'Authorization': `Bearer ${data.data.access_token}`
          },
          credentials: 'include'
        });
        
        if (!userResponse.ok) {
          throw new Error('Erreur lors de la récupération des données utilisateur');
        }
        
        const userData = await userResponse.json();
        
        // Définir l'état d'authentification
        this.setAuth(data.data.access_token, userData.data);
        
        return userData.data;
      } catch (error) {
        console.error('Erreur de connexion:', error);
        this.error = error.message;
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
        // Déterminer l'ID du rôle "Utilisateur"
        const roleId = '27b07ae3-cc05-402a-947e-23d847b0f329';
        
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
            role: roleId
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.[0]?.message || 'Erreur lors de la création du compte');
        }
        
        // Se connecter automatiquement après l'inscription
        return await this.login(email, password);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Se déconnecter
    async logout() {
      this.loading = true;
      
      try {
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
        
        // Suppression des cookies
        if (typeof window !== 'undefined') {
          document.cookie.split(";").forEach((c) => {
            const cookieName = c.split("=")[0].trim();
            if (cookieName.includes("directus") || cookieName.includes("auth")) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      } finally {
        // Effacer les données d'authentification
        this.clearAuth();
        
        // Forcer une actualisation complète de la page
        if (typeof window !== 'undefined') {
          window.location.replace('/');
        }
        
        this.loading = false;
      }
    },
    
    // Demander une réinitialisation de mot de passe
    async requestPasswordReset(email, resetUrl) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/directus/auth/password/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            reset_url: resetUrl
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.[0]?.message || 'Erreur lors de la demande de réinitialisation');
        }
        
        // Retourne true en cas de succès
        return true;
      } catch (error) {
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
        
        // Retourne true en cas de succès
        return true;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Vérifier si l'utilisateur est connecté
    checkAuth() {
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');
        
        if (userStr && token) {
          try {
            this.user = JSON.parse(userStr);
            this.token = token;
            return true;
          } catch (e) {
            console.error("Erreur lors de la récupération des données utilisateur:", e);
            this.clearAuth();
            return false;
          }
        } else {
          this.clearAuth();
          return false;
        }
      }
      
      return false;
    }
  }
});