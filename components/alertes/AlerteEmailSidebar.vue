<!-- components/alertes/AlerteEmailSidebar.vue -->
<template>
    <div class="bg-white rounded-lg shadow-md p-4 mb-4">
      <div class="flex items-start mb-4">
        <div class="flex-shrink-0 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div class="ml-2">
          <h3 class="text-base font-semibold text-gray-800">Alerte immobilière</h3>
          <p class="text-gray-600 text-xs">Soyez informé des nouvelles annonces</p>
        </div>
      </div>
      
      <form @submit.prevent="submitForm" class="space-y-3">
        <!-- Email -->
        <div>
          <label for="sidebar-email" class="block text-xs font-medium text-gray-700 mb-1">Votre email*</label>
          <input
            id="sidebar-email"
            v-model="formData.email"
            type="email"
            required
            placeholder="exemple@domaine.com"
            class="w-full rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        
        <!-- Type de bien - version compacte -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Type de bien</label>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1">
            <div
              v-for="type in typeOptions.slice(0, 4)"
              :key="type.value"
              class="flex items-center"
            >
              <input
                :id="`sidebar-type-${type.value}`"
                v-model="formData.types"
                type="checkbox"
                :value="type.value"
                class="h-3 w-3 text-cyan-500 rounded"
              />
              <label :for="`sidebar-type-${type.value}`" class="ml-1 text-xs text-gray-700">{{ type.label }}</label>
            </div>
          </div>
        </div>
        
        <!-- Prix et Surface - sur la même ligne -->
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label for="sidebar-prixMax" class="block text-xs font-medium text-gray-700 mb-1">Prix max</label>
            <select
              id="sidebar-prixMax"
              v-model="formData.prixMax"
              class="w-full rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">Non précisé</option>
              <option value="150000">150 000 €</option>
              <option value="250000">250 000 €</option>
              <option value="400000">400 000 €</option>
              <option value="750000">750 000 €</option>
            </select>
          </div>
          
          <div>
            <label for="sidebar-surfaceMin" class="block text-xs font-medium text-gray-700 mb-1">Surface min</label>
            <select
              id="sidebar-surfaceMin"
              v-model="formData.surfaceMin"
              class="w-full rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">Non précisé</option>
              <option value="35">35 m²</option>
              <option value="70">70 m²</option>
              <option value="120">120 m²</option>
            </select>
          </div>
        </div>
        
        <!-- Localisation -->
        <div>
          <label for="sidebar-localisation" class="block text-xs font-medium text-gray-700 mb-1">Localisation</label>
          <input
            id="sidebar-localisation"
            v-model="formData.localisation"
            type="text"
            placeholder="Ville, région..."
            class="w-full rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        
        <!-- Rentabilité -->
        <div>
          <label for="sidebar-rentabiliteMin" class="block text-xs font-medium text-gray-700 mb-1">Rentabilité min</label>
          <select
            id="sidebar-rentabiliteMin"
            v-model="formData.rentabiliteMin"
            class="w-full rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="">Non précisé</option>
            <option value="4">Au moins 4%</option>
            <option value="6">Au moins 6%</option>
            <option value="8">Au moins 8%</option>
          </select>
        </div>
        
        <!-- Fréquence -->
        <div class="flex items-center">
          <input
            id="sidebar-frequence"
            v-model="formData.frequenceQuotidienne"
            type="checkbox"
            class="h-3 w-3 text-cyan-500 rounded"
          />
          <label for="sidebar-frequence" class="ml-1 text-xs text-gray-700">
            Alertes quotidiennes
          </label>
        </div>
        
        <!-- Confidentialité -->
        <div class="flex items-center">
          <input
            id="sidebar-confidentialite"
            v-model="formData.acceptConfidentialite"
            type="checkbox"
            required
            class="h-3 w-3 text-cyan-500 rounded"
          />
          <label for="sidebar-confidentialite" class="ml-1 text-xs text-gray-700">
            J'accepte la <a href="/confidentialite" class="text-amber-700 hover:underline">politique de confidentialité</a>*
          </label>
        </div>
        
        <!-- Bouton de soumission -->
        <div class="pt-1">
          <button
            type="submit"
            :disabled="isSubmitting"
            :class="[
              'w-full bg-cyan-500 text-white py-1.5 px-4 rounded-md text-sm font-medium transition-colors',
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-cyan-600'
            ]"
          >
            <span v-if="isSubmitting">Inscription...</span>
            <span v-else>Créer mon alerte</span>
          </button>
        </div>
      </form>
      
      <!-- Message de confirmation -->
      <div v-if="showConfirmation" class="mt-2 p-2 bg-green-50 text-green-800 rounded-md text-xs">
        <div class="flex">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <p>Alerte créée ! Vérifiez votre email.</p>
        </div>
      </div>
      
      <!-- Message d'erreur -->
      <div v-if="errorMessage" class="mt-2 p-2 bg-red-50 text-red-800 rounded-md text-xs">
        <div class="flex">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <p>{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  
  const typeOptions = [
    { label: 'Appartement', value: 'APPARTEMENT' },
    { label: 'Maison', value: 'MAISON' },
    { label: 'Construction', value: 'CONSTRUCTION' },
    { label: 'Immeuble', value: 'IMMEUBLE' }
  ];
  
  const formData = reactive({
    email: '',
    types: [],
    prixMax: '',
    surfaceMin: '',
    localisation: '',
    rentabiliteMin: '',
    frequenceQuotidienne: false,
    acceptConfidentialite: false
  });
  
  const isSubmitting = ref(false);
  const showConfirmation = ref(false);
  const errorMessage = ref('');
  
  const submitForm = async () => {
    if (!formData.acceptConfidentialite) {
      errorMessage.value = 'Vous devez accepter la politique de confidentialité.';
      return;
    }
  
    isSubmitting.value = true;
    errorMessage.value = '';
    
    try {
      // Appel via notre nouveau proxy Directus
      const response = await $fetch('/api/directus/items/alertes_email', {
        method: 'POST',
        body: {
          email: formData.email,
          types: formData.types,
          prix_max: formData.prixMax ? parseInt(formData.prixMax) : null,
          surface_min: formData.surfaceMin ? parseInt(formData.surfaceMin) : null,
          localisation: formData.localisation,
          rentabilite_min: formData.rentabiliteMin ? parseFloat(formData.rentabiliteMin) : null,
          frequence_quotidienne: formData.frequenceQuotidienne,
          accept_confidentialite: formData.acceptConfidentialite,
          token_confirmation: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2), // Générer un token unique
          status: 'inactive'
        }
      });
      
      // Réinitialiser le formulaire
      formData.email = '';
      formData.types = [];
      formData.prixMax = '';
      formData.surfaceMin = '';
      formData.localisation = '';
      formData.rentabiliteMin = '';
      formData.frequenceQuotidienne = false;
      formData.acceptConfidentialite = false;
      
      // Afficher le message de confirmation
      showConfirmation.value = true;
      setTimeout(() => {
        showConfirmation.value = false;
      }, 5000);
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error);
      errorMessage.value = error.data?.error || 'Une erreur est survenue. Veuillez réessayer.';
    } finally {
      isSubmitting.value = false;
    }
  };
  </script>