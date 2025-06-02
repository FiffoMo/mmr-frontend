<!-- components/alertes/AlerteEmailSidebar.vue -->
<!-- version compacte du formulaire AlerteEmailForm, conçue pour être affichée dans une barre latérale. Actuellement non utilisée ! -->
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
    
    <!-- Message de connexion requis -->
    <div v-if="!isAuthenticated" class="mb-3 p-2 bg-amber-50 text-amber-800 rounded-md text-xs">
      <div class="flex">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <div>
          <p class="font-medium">Connexion requise</p>
          <div class="mt-1 flex space-x-2">
            <NuxtLink to="/login" class="text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded text-amber-700">
              Se connecter
            </NuxtLink>
            <NuxtLink to="/register" class="text-xs px-2 py-1 bg-cyan-100 hover:bg-cyan-200 rounded text-cyan-700">
              S'inscrire
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <form v-if="isAuthenticated" @submit.prevent="submitForm" class="space-y-3">
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
      
      <!-- Nom de l'alerte -->
      <div>
        <label for="sidebar-nom" class="block text-xs font-medium text-gray-700 mb-1">Nom (optionnel)</label>
        <input
          id="sidebar-nom"
          v-model="formData.nom"
          type="text"
          placeholder="Ex: Appartement Paris"
          class="w-full rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
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
          <span v-if="isSubmitting">
            <svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Création...
          </span>
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
        <div>
          <p>Alerte créée !</p>
          <p class="text-xs mt-1">Voir dans l'onglet "Mes alertes".</p>
        </div>
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
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '~/stores/useAuthStore';
import { useDirectusSDK } from '~/composables/useDirectusSDK';

const authStore = useAuthStore();
const directusSDK = useDirectusSDK();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userId = computed(() => authStore.clientId);

const typeOptions = [
  { label: 'Appartement', value: 'APPARTEMENT' },
  { label: 'Maison', value: 'MAISON' },
  { label: 'Construction', value: 'CONSTRUCTION' },
  { label: 'Immeuble', value: 'IMMEUBLE' }
];

const formData = reactive({
  nom: '',
  types: [],
  prixMax: '',
  surfaceMin: '',
  localisation: '',
});

const isSubmitting = ref(false);
const showConfirmation = ref(false);
const errorMessage = ref('');

const submitForm = async () => {
  // Vérifier que l'utilisateur est connecté
  if (!isAuthenticated.value) {
    errorMessage.value = 'Vous devez être connecté pour créer une alerte.';
    return;
  }

  // Vérifier que l'email utilisateur est disponible
  if (!authStore.user?.email) {
    errorMessage.value = 'Email utilisateur non disponible. Veuillez vous reconnecter.';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    // Générer un nom si non fourni
    const alertNom = formData.nom || generateAlertName();
    
    // Créer l'objet de critères pour la recherche
    const criteres = {
      types: formData.types,
      prix_max: formData.prixMax ? parseFloat(formData.prixMax) : null,
      surface_min: formData.surfaceMin ? parseFloat(formData.surfaceMin) : null,
      localisation: formData.localisation
    };
    
    console.log('💾 Création alerte sidebar avec email:', authStore.user.email);
    
    // Appel via le SDK pour créer dans recherches_sauvegardees
    const response = await directusSDK.createItem('recherches_sauvegardees', {
      client_id: userId.value,         // ID de l'utilisateur connecté
      email: authStore.user.email,  // ← AJOUT DE L'EMAIL
      utilisateur: userId.value,       // Pour compatibilité
      nom: alertNom,                   // Nom de l'alerte
      type_bien: formData.types[0] || null,  // Premier type sélectionné
      localisation: formData.localisation,
      prix_max: formData.prixMax ? parseFloat(formData.prixMax) : null,
      surface_min: formData.surfaceMin ? parseFloat(formData.surfaceMin) : null,
      criteres_supplementaires: JSON.stringify(criteres), // Autres critères en JSON
      notifications_actives: true
    });
    
    console.log('✅ Alerte sidebar créée avec succès:', response);
    
    // Réinitialiser le formulaire
    formData.nom = '';
    formData.types = [];
    formData.prixMax = '';
    formData.surfaceMin = '';
    formData.localisation = '';
    
    // Afficher le message de confirmation
    showConfirmation.value = true;
    setTimeout(() => {
      showConfirmation.value = false;
    }, 5000);
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'alerte sidebar:', error);
    errorMessage.value = error.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    isSubmitting.value = false;
  }
};

// Fonction pour générer un nom d'alerte basé sur les critères
const generateAlertName = () => {
  let name = '';
  
  // Ajouter le type de bien
  if (formData.types.length > 0) {
    name += formData.types[0].charAt(0) + formData.types[0].slice(1).toLowerCase();
  } else {
    name += 'Bien immobilier';
  }
  
  // Ajouter la localisation
  if (formData.localisation) {
    name += ` à ${formData.localisation}`;
  }
  
  return name;
};
</script>