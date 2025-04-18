<!-- components/common/AddAnnonceButton.vue 
Ce bouton peut être placé dans le header ou dans le bandeau de footer et :
Vérifie si l'utilisateur est connecté
S'il n'est pas connecté, affiche une modal pour l'inviter à se connecter
S'il est connecté, vérifie s'il a des forfaits disponibles
Redirige vers la page de création d'annonce ou la page des forfaits selon le cas
-->
<template>
  <div>
    <!-- Bouton d'ajout d'annonce -->
    <button 
      @click="handleButtonClick"
      class="bg-cyan-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
      :class="{'opacity-75 cursor-wait': loading}"
      :disabled="loading"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      <span>{{ isHeader ? 'Déposer une annonce' : 'Publier une annonce' }}</span>
    </button>

    <!-- Modal de confirmation pour les utilisateurs non connectés -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          <!-- Bouton de fermeture -->
          <button 
            @click="hideModal" 
            class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Contenu modal -->
          <div class="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-amber-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="text-xl font-bold mb-2">Vous n'êtes pas connecté</h2>
            <p class="text-gray-600">Pour publier une annonce, vous devez vous connecter ou créer un compte et acheter un forfait.</p>
          </div>

          <div class="flex flex-col gap-3">
            <NuxtLink 
              to="/login" 
              class="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded text-center font-medium"
              @click="hideModal"
            >
              Se connecter
            </NuxtLink>
            <NuxtLink 
              to="/login" 
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded text-center font-medium"
              @click="hideModal"
            >
              Créer un compte
            </NuxtLink>
            <NuxtLink 
              to="/tarifs" 
              class="w-full text-cyan-600 hover:text-cyan-800 py-2 px-4 text-center font-medium"
              @click="hideModal"
            >
              Voir les forfaits disponibles
            </NuxtLink>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/useAuthStore';
import { useDirectusSDK } from '~/composables/useDirectusSDK';

// Props
const props = defineProps({
  // Si le bouton est dans le header, il a un texte différent
  isHeader: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();
const authStore = useAuthStore();
const directusSDK = useDirectusSDK();

const loading = ref(false);
const showModal = ref(false);

// Fonction pour fermer la modal
const hideModal = () => {
  showModal.value = false;
};

// Fermer la modal lors d'un changement de route
watch(() => router.currentRoute.value.path, () => {
  hideModal();
});

// Vérifier si l'utilisateur a un forfait actif avec des annonces disponibles
const checkUserForfaits = async () => {
  loading.value = true;
  
  try {
    // Récupérer les forfaits de l'utilisateur
    const result = await directusSDK.getItems('user_forfaits', {
      filter: {
        client_id: { _eq: authStore.user.id },
        date_fin: { _gt: new Date().toISOString() },
        annonces_restantes: { _gt: 0 }
      },
      limit: 1
    });
    
    if (result && result.length > 0) {
      // L'utilisateur a un forfait valide avec des annonces disponibles
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Erreur lors de la vérification des forfaits:', err);
    return false;
  } finally {
    loading.value = false;
  }
};

// Gérer le clic sur le bouton
const handleButtonClick = async () => {
  // Si l'utilisateur n'est pas connecté, afficher la modal
  if (!authStore.isAuthenticated) {
    showModal.value = true;
    return;
  }
  
  // Vérifier si l'utilisateur a un forfait actif
  const hasForfait = await checkUserForfaits();
  
  if (hasForfait) {
    // Rediriger vers la page de création d'annonce
    router.push('/dashboard/annonces/createAnnonce');  // Mise à jour du chemin
  } else {
    // Rediriger vers la page des forfaits
    router.push('/tarifs');
  }
};

// Ajouter un écouteur d'événement global sur la touche Echap pour fermer la modal
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && showModal.value) {
      hideModal();
    }
  });
}
</script>