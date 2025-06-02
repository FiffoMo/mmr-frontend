<!-- pages/dashboard/annonces/liste-annonces.vue -->
<template>
    <div class="bg-gray-100 min-h-screen py-8">
      <div class="container mx-auto px-4">
        <h1 class="text-2xl font-bold mb-6">Mes annonces</h1>
        
        <!-- Message de chargement -->
        <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
          <div class="animate-spin mx-auto h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
          <p class="text-gray-600">Chargement de vos annonces...</p>
        </div>
        
        <!-- Message d'erreur -->
        <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
              <button @click="fetchAnnonces" class="mt-2 text-sm font-medium text-red-700 underline">Réessayer</button>
            </div>
          </div>
        </div>
        
        <!-- Aucune annonce -->
        <div v-else-if="annonces.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 class="text-xl font-semibold mb-2">Aucune annonce</h2>
          <p class="text-gray-600 mb-4">Vous n'avez pas encore publié d'annonce immobilière.</p>
          <button @click="router.push('/publier-annonce')" class="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded">
            Créer ma première annonce
          </button>
        </div>
        
        <!-- Liste des annonces -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="annonce in annonces" :key="annonce.id" class="bg-white rounded-lg shadow overflow-hidden">
            <!-- Image principale -->
            <div class="h-48 bg-gray-200 relative">
              <img 
                v-if="annonce.image_principale" 
                :src="`/uploads/${annonce.image_principale}`" 
                :alt="annonce.Titre" 
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 22V12h6v10" />
                </svg>
              </div>
              
              <!-- Badge de statut -->
              <div class="absolute top-2 right-2">
                <span :class="getStatusClass(annonce.status)">
                  {{ getStatusLabel(annonce.status) }}
                </span>
              </div>
            </div>
            
            <!-- Contenu -->
            <div class="p-4">
              <h3 class="font-semibold text-lg mb-1 truncate">{{ annonce.Titre }}</h3>
              <p class="text-gray-600 text-sm mb-2 truncate">{{ annonce.localisation }}</p>
              
              <div class="flex justify-between items-center mb-3">
                <span class="text-cyan-600 font-medium">{{ formatPrice(annonce.prix_vente) }}</span>
                <span class="text-gray-500 text-sm">{{ formatDate(annonce.date_created) }}</span>
              </div>
              
              <div class="border-t pt-3 flex justify-between">
                <button 
                  @click="router.push(`/annonces/detail-${annonce.id}`)"
                  class="text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                >
                  Voir l'annonce
                </button>
                
                <button 
                  @click="router.push(`/editer-annonce/${annonce.id}`)"
                  class="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '~/stores/useAuthStore';
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  const annonces = ref([]);
  const loading = ref(true);
  const error = ref(null);
  
  // Récupérer les annonces au chargement de la page
  onMounted(() => {
    fetchAnnonces();
  });
  
  // Fonction pour récupérer les annonces
  async function fetchAnnonces() {
    loading.value = true;
    error.value = null;
    
    try {
      if (!authStore.isAuthenticated || !authStore.user?.id) {
        throw new Error('Vous devez être connecté pour voir vos annonces');
      }
      
      const userId = authStore.user.id;
      console.log("Récupération des annonces pour l'utilisateur:", userId);
      
      // Appel direct à l'API pour récupérer les annonces de l'utilisateur
      const response = await fetch(`/api/directus/items/annonces?filter[client_id][_eq]=${userId}&sort[]=-date_created`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur API:", errorData);
        throw new Error(`Erreur lors de la récupération des annonces: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Annonces récupérées:", result);
      
      // Mettre à jour la liste des annonces
      annonces.value = result.data || [];
      
    } catch (err) {
      console.error("Erreur:", err);
      error.value = err.message || "Une erreur est survenue lors du chargement des annonces";
    } finally {
      loading.value = false;
    }
  }
  
  // Formatage du prix
  function formatPrice(price) {
    if (price === null || price === undefined) return 'Prix non défini';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  }
  
  // Formatage de la date
  function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }
  
  // Classe CSS pour le statut
  function getStatusClass(status) {
    switch (status) {
      case 'published':
        return 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
      case 'pending':
        return 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800';
      case 'expired':
        return 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
      case 'draft':
        return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
      default:
        return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
    }
  }
  
  // Libellé du statut
  function getStatusLabel(status) {
    switch (status) {
      case 'published':
        return 'Publiée';
      case 'pending':
        return 'En attente';
      case 'suspended':
        return 'Suspendue';
      case 'expired':
        return 'Expirée';
      case 'draft':
        return 'Brouillon';
      default:
        return status || 'Inconnu';
    }
  }
  </script>