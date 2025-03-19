<template>
    <div class="p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
      <form @submit.prevent="updateProfile" class="space-y-6 bg-gray-100 p-6 rounded-lg">
        <!-- Prénom et Nom sur la même ligne -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">Prénom</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="profile.firstName" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">Nom</label>
            <input 
              type="text" 
              id="lastName" 
              v-model="profile.lastName" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>
        </div>
        
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="profile.email" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          />
        </div>
        
        <!-- Téléphone -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700">Téléphone</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="profile.phone" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
          />
        </div>
        
        <!-- Changer mot de passe -->
        <div class="border-t border-gray-200 pt-4">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Changer le mot de passe</h3>
          <div class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
              <input 
                type="password" 
                id="currentPassword" 
                v-model="passwordForm.current" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
              <input 
                type="password" 
                id="newPassword" 
                v-model="passwordForm.new" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input 
                type="password" 
                id="confirmPassword" 
                v-model="passwordForm.confirm" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>
        
        <!-- Boutons -->
        <div class="flex justify-end space-x-3">
          <button 
            type="button" 
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            @click="resetForm"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-700"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProfileTab',
    
    emits: ['update-success'],
    
    data() {
      return {
        profile: {
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        },
        
        // Formulaire de changement de mot de passe
        passwordForm: {
          current: '',
          new: '',
          confirm: ''
        },
        
        // État de chargement
        loading: false
      };
    },
    
    created() {
      // Charger les données du profil au montage du composant
      this.fetchProfile();
    },
    
    methods: {
      // Récupération des données du profil
      async fetchProfile() {
        this.loading = true;
        
        try {
          // Dans un cas réel, ce serait un appel API
          // const response = await api.getProfile();
          // this.profile = response;
          
          // Pour l'exemple, nous utilisons des données fictives
          this.profile = {
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@example.com',
            phone: '06 12 34 56 78'
          };
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
        } finally {
          this.loading = false;
        }
      },
      
      // Mise à jour du profil
      async updateProfile() {
        // Validation du formulaire de mot de passe
        if (this.passwordForm.new || this.passwordForm.current || this.passwordForm.confirm) {
          if (!this.passwordForm.current) {
            alert('Veuillez saisir votre mot de passe actuel');
            return;
          }
          
          if (this.passwordForm.new !== this.passwordForm.confirm) {
            alert('Les nouveaux mots de passe ne correspondent pas');
            return;
          }
          
          if (this.passwordForm.new.length < 8) {
            alert('Le nouveau mot de passe doit contenir au moins 8 caractères');
            return;
          }
        }
        
        this.loading = true;
        
        try {
          // Mise à jour du profil
          // Dans un cas réel, ce serait un appel API
          // await api.updateProfile(this.profile);
          
          // Si changement de mot de passe
          if (this.passwordForm.new) {
            // await api.updatePassword(this.passwordForm);
            this.resetPasswordForm();
          }
          
          // Émettre l'événement de succès vers le parent
          this.$emit('update-success', 'Profil mis à jour avec succès');
        } catch (error) {
          console.error('Erreur lors de la mise à jour du profil:', error);
          alert('Une erreur est survenue lors de la mise à jour du profil');
        } finally {
          this.loading = false;
        }
      },
      
      // Réinitialisation du formulaire
      resetForm() {
        // Recharger les données du profil depuis le serveur
        this.fetchProfile();
        this.resetPasswordForm();
      },
      
      // Réinitialisation du formulaire de mot de passe
      resetPasswordForm() {
        this.passwordForm = {
          current: '',
          new: '',
          confirm: ''
        };
      }
    }
  };
  </script>