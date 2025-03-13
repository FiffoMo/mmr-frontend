<template>
  <div class="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6">
    <div class="flex items-start mb-4">
      <div class="flex-shrink-0 mt-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-lg font-semibold text-gray-800">Recevez les nouvelles annonces par email</h3>
        <p class="text-gray-600 text-sm mt-1">Soyez informé dès qu'un bien correspondant à vos critères est mis en ligne.</p>
      </div>
    </div>
    
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Votre email</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          required
          placeholder="exemple@domaine.com"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Type de bien</label>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="type in typeOptions"
            :key="type.value"
            class="flex items-center"
          >
            <input
              :id="`type-${type.value}`"
              v-model="formData.types"
              type="checkbox"
              :value="type.value"
              class="h-4 w-4 text-cyan-500 focus:ring-cyan-400 rounded"
            />
            <label :for="`type-${type.value}`" class="ml-2 text-sm text-gray-700">{{ type.label }}</label>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="prixMax" class="block text-sm font-medium text-gray-700 mb-1">Prix maximum</label>
          <select
            id="prixMax"
            v-model="formData.prixMax"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="">Non précisé</option>
            <option value="100000">100 000 €</option>
            <option value="150000">150 000 €</option>
            <option value="200000">200 000 €</option>
            <option value="250000">250 000 €</option>
            <option value="300000">300 000 €</option>
            <option value="400000">400 000 €</option>
            <option value="500000">500 000 €</option>
            <option value="750000">750 000 €</option>
            <option value="1000000">1 000 000 €</option>
          </select>
        </div>
        
        <div>
          <label for="surfaceMin" class="block text-sm font-medium text-gray-700 mb-1">Surface minimum</label>
          <select
            id="surfaceMin"
            v-model="formData.surfaceMin"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
          >
            <option value="">Non précisé</option>
            <option value="20">20 m²</option>
            <option value="35">35 m²</option>
            <option value="50">50 m²</option>
            <option value="70">70 m²</option>
            <option value="90">90 m²</option>
            <option value="120">120 m²</option>
            <option value="150">150 m²</option>
          </select>
        </div>
      </div>
      
      <div>
        <label for="localisation" class="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
        <input
          id="localisation"
          v-model="formData.localisation"
          type="text"
          placeholder="Ville, département, région..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>
      
      <div>
        <label for="rentabiliteMin" class="block text-sm font-medium text-gray-700 mb-1">Rentabilité minimale</label>
        <select
          id="rentabiliteMin"
          v-model="formData.rentabiliteMin"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="">Non précisé</option>
          <option value="3">Au moins 3%</option>
          <option value="4">Au moins 4%</option>
          <option value="5">Au moins 5%</option>
          <option value="6">Au moins 6%</option>
          <option value="7">Au moins 7%</option>
          <option value="8">Au moins 8%</option>
        </select>
      </div>
      
      <div class="flex items-center">
        <input
          id="frequence"
          v-model="formData.frequenceQuotidienne"
          type="checkbox"
          class="h-4 w-4 text-cyan-500 focus:ring-cyan-400 rounded"
        />
        <label for="frequence" class="ml-2 text-sm text-gray-700">
          Je souhaite recevoir une alerte quotidienne (sinon hebdomadaire)
        </label>
      </div>
      
      <!-- Ajout du champ de confidentialité -->
      <div class="flex items-center">
        <input
          id="confidentialite"
          v-model="formData.acceptConfidentialite"
          type="checkbox"
          required
          class="h-4 w-4 text-cyan-500 focus:ring-cyan-400 rounded"
        />
        <label for="confidentialite" class="ml-2 text-sm text-gray-700">
          J'accepte de recevoir des alertes email et j'ai lu la <a href="/confidentialite" class="text-amber-800 hover:underline">politique de confidentialité</a>*
        </label>
      </div>
      
      <div class="pt-2">
        <button
          type="submit"
          :disabled="isSubmitting"
          :class="[
            'w-full bg-cyan-500 text-white py-2 px-4 rounded-md font-medium transition-colors',
            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-cyan-600'
          ]"
        >
          <span v-if="isSubmitting">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Inscription en cours...
          </span>
          <span v-else>Créer mon alerte email</span>
        </button>
      </div>
    </form>
    
    <!-- Message de confirmation -->
    <div v-if="showConfirmation" class="mt-4 p-3 bg-green-50 text-green-800 rounded-md">
      <div class="flex">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <p>Votre alerte a bien été créée ! Vous recevrez un email de confirmation.</p>
      </div>
    </div>
    
    <!-- Message d'erreur -->
    <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
      <div class="flex">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
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
  { label: 'Immeuble', value: 'IMMEUBLE' },
  { label: 'Maison d\'hôte', value: 'MAISON D\'HÔTE' },
];

const formData = reactive({
  email: '',
  types: [],
  prixMax: '',
  surfaceMin: '',
  localisation: '',
  rentabiliteMin: '',
  frequenceQuotidienne: false,
  acceptConfidentialite: false // Ajout du champ manquant
});

const isSubmitting = ref(false);
const showConfirmation = ref(false);
const errorMessage = ref('');

const submitForm = async () => {
  if (!formData.acceptConfidentialite) {
    errorMessage.value = 'Vous devez accepter la politique de confidentialité pour créer une alerte.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    // Appel à notre API avec les bons noms de champs pour correspondre à Directus
    const response = await $fetch('/api/alertes-email', {
      method: 'POST',
      body: {
        email: formData.email,
        types: formData.types,
        prix_max: formData.prixMax,
        surface_min: formData.surfaceMin,
        localisation: formData.localisation,
        rentabilite_min: formData.rentabiliteMin,
        frequence_quotidienne: formData.frequenceQuotidienne,
        accept_confidentialite: formData.acceptConfidentialite
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