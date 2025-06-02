<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <NuxtLink to="/"><img src="~/assets/images/logo_mmr_150.png" alt="Constructions"></NuxtLink>

        <!-- Navigation principale - version desktop -->
        <!-- Navigation -->
        <nav class="hidden md:flex space-x-6">
          <NuxtLink to="/annonces" class="text-gray-700 hover:text-cyan-600"><strong>Tous</strong> </NuxtLink>
          <NuxtLink to="/annonces?category=maisons" class="text-gray-700 hover:text-cyan-600">Maisons</NuxtLink>
          <NuxtLink to="/annonces?category=immeubles" class="text-gray-700 hover:text-cyan-600">Immeubles</NuxtLink>
          
          <!-- Menu déroulant "Autres" -->
          <div class="relative">
            <button 
              @click="toggleAutresDropdown" 
              class="text-gray-700 hover:text-cyan-600 flex items-center"
            >
              Autres
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              v-show="isAutresDropdownOpen" 
              class="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-10"
              @mouseleave="isAutresDropdownOpen = false"
            >
              <NuxtLink to="/annonces?category=appartements" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Appartements</NuxtLink>
              <NuxtLink to="/annonces?category=construction" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Constructions</NuxtLink>
              <NuxtLink to="/annonces?category=demeures" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Demeures</NuxtLink>
              <NuxtLink to="/annonces?category=maisons_dhote" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Maisons d'hôte</NuxtLink>
            </div>
          </div>
          
          <span class="text-gray-300">|</span>
          
          <NuxtLink to="/articles" class="text-gray-700 hover:text-cyan-600">BLOG & NEWS</NuxtLink>

          <span class="text-gray-300">|</span>
                    
          <!-- Menu déroulant "Services" -->
          <div class="relative">
            <button 
              @click="toggleServicesDropdown" 
              class="text-gray-700 hover:text-cyan-600 flex items-center"
            >
              Services
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              v-show="isServicesDropdownOpen" 
              class="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-10"
              @mouseleave="isServicesDropdownOpen = false"
            >
              <NuxtLink to="/tarifs" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50"><strong>Annonces Tarifs</strong></NuxtLink>
              <NuxtLink to="/tarifs-publicite" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50"><strong>Publicité - Tarifs</strong></NuxtLink>
              <NuxtLink to="/about" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">A propos</NuxtLink>
              <NuxtLink to="/faq" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">FAQ</NuxtLink>
              <!-- <NuxtLink to="/testimonials" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Témoignages</NuxtLink> -->
              <NuxtLink to="/contact" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Contact</NuxtLink>
            </div>
          </div>
        </nav>

        <!-- Actions utilisateur -->
        <div class="flex items-center space-x-4">
          <!-- Bouton ajouter une annonce réduit de taille -->
          <AddAnnonceButton :is-header="true" class="text-sm px-2 py-1" />
          
          <!-- Menu utilisateur non authentifié -->
          <template v-if="!isAuthenticated">
            <NuxtLink to="/login" class="hover:text-blue-600">Connexion</NuxtLink>
          </template>
          
          <!-- Menu utilisateur authentifié -->
          <div v-else class="relative">
            <button 
              @click="toggleUserDropdown" 
              class="text-gray-700 hover:text-cyan-600 flex items-center"
            >
              Mon compte
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              v-show="isUserDropdownOpen" 
              class="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-10"
              @mouseleave="isUserDropdownOpen = false"
            >
              <NuxtLink to="/settings" class="block px-4 py-2 text-gray-700 hover:bg-cyan-50">Tableau de bord</NuxtLink>
              <button 
                @click="logout" 
                class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-cyan-50"
              >
                Déconnexion
              </button>
            </div>
          </div>
          
          <!-- Panier (à implémenter avec Stripe) -->
          <button class="relative">
            <span class="sr-only">Panier</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <!-- Indicateur du nombre d'articles -->
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
          </button>
          
          <!-- Menu mobile (hamburger) -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menu mobile -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4">
        <nav class="flex flex-col space-y-4">
          <NuxtLink to="/annonces" class="hover:text-blue-600">Rechercher</NuxtLink>
          <NuxtLink to="/annonces?category=maisons" class="hover:text-blue-600">Maisons</NuxtLink>
          <NuxtLink to="/annonces?category=immeubles" class="hover:text-blue-600">Immeubles</NuxtLink>
          <NuxtLink to="/annonces?category=appartements" class="hover:text-blue-600">Appartements</NuxtLink>
          <NuxtLink to="/annonces?category=constructions" class="hover:text-blue-600">Constructions</NuxtLink>
          <NuxtLink to="/articles" class="hover:text-blue-600">Articles utiles</NuxtLink>
          <NuxtLink to="/tarifs" class="hover:text-blue-600">Tarifs</NuxtLink>
          <NuxtLink to="/publicite" class="hover:text-blue-600">Pub</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-blue-600">Contact</NuxtLink>
          
          <!-- Ajout des liens d'authentification pour mobile -->
          <div class="pt-4 border-t border-gray-200">
            <template v-if="!isAuthenticated">
              <NuxtLink to="/login" class="hover:text-blue-600">Connexion</NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/settings" class="hover:text-blue-600">Tableau de bord</NuxtLink>
              <button @click="logout" class="mt-2 hover:text-blue-600">Déconnexion</button>
            </template>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';
import AddAnnonceButton from '~/components/common/AddAnnonceButton.vue';

export default {
  components: {
    AddAnnonceButton
  },
  setup() {
    const mobileMenuOpen = ref(false);
    
    // Dropdowns séparés pour chaque menu
    const isAutresDropdownOpen = ref(false);
    const isServicesDropdownOpen = ref(false);
    const isUserDropdownOpen = ref(false);
    
    // Router pour la redirection après déconnexion
    const router = useRouter();
    
    // Store d'authentification
    const authStore = useAuthStore();
    
    // Toggle functions pour chaque dropdown
    const toggleAutresDropdown = () => {
      isAutresDropdownOpen.value = !isAutresDropdownOpen.value;
      isServicesDropdownOpen.value = false;
      isUserDropdownOpen.value = false;
    };
    
    const toggleServicesDropdown = () => {
      isServicesDropdownOpen.value = !isServicesDropdownOpen.value;
      isAutresDropdownOpen.value = false;
      isUserDropdownOpen.value = false;
    };
    
    const toggleUserDropdown = () => {
      isUserDropdownOpen.value = !isUserDropdownOpen.value;
      isAutresDropdownOpen.value = false;
      isServicesDropdownOpen.value = false;
    };
    
    // Déconnexion
    const logout = async () => {
      try {
        await authStore.logout();
        router.push('/');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    };
    
    // Fermer les menus au clic à l'extérieur
    onMounted(() => {
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.relative')) {
          isAutresDropdownOpen.value = false;
          isServicesDropdownOpen.value = false;
          isUserDropdownOpen.value = false;
        }
      });
    });
    
    return {
      mobileMenuOpen,
      isAutresDropdownOpen,
      isServicesDropdownOpen,
      isUserDropdownOpen,
      toggleAutresDropdown,
      toggleServicesDropdown,
      toggleUserDropdown,
      logout,
      isAuthenticated: computed(() => authStore.isAuthenticated)
    };
  }
};
</script>

<style scoped>
.nav {
  position: relative;
  z-index: 50;
}
</style>