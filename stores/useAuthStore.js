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
    isAdClient: (state) => state.user?.type === 2
  },
  
  actions: {
    // Initialiser l'état d'authentification depuis le localStorage
    initAuth() {
      if (process.client) {
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
      
      if (process.client) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    },
    
    // Effacer l'état d'authentification
    clearAuth() {
      this.token = null;
      this.user = null;
      
      if (process.client) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    },
    
    // Se connecter
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
        
        const response = await fetch(`${directusUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.errors?.[0]?.message || 'Identifiants incorrects');
        }
        
        const data = await response.json();
        
        // Récupérer les informations utilisateur
        const userResponse = await fetch(`${directusUrl}/users/me`, {
          headers: {
            'Authorization': `Bearer ${data.data.access_token}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Erreur lors de la récupération des données utilisateur');
        }
        
        const userData = await userResponse.json();
        
        // Définir l'état d'authentification
        this.setAuth(data.data.access_token, userData.data);
        
        return userData.data;
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
        const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
        
        if (this.token) {
          await fetch(`${directusUrl}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          });
        }
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      } finally {
        this.clearAuth();
        this.loading = false;
      }
    },
    
    // Mettre à jour les informations utilisateur
    updateUser(userData) {
      this.user = { ...this.user, ...userData };
      
      if (process.client) {
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
    }
  }
});