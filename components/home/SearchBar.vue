<template>
  <div class="bg-white shadow-lg rounded-lg p-6 -mt-10 relative z-10 mx-4 md:mx-auto max-w-5xl">
    <h2 class="text-xl font-semibold mb-4">Rechercher un bien immobilier</h2>
    <form @submit.prevent="submitSearch">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Type de bien</label>
          <select 
            id="category" 
            v-model="searchParams.category"
            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous types</option>
            <option value="maisons">Maisons</option>
            <option value="appartements">Appartements</option>
            <option value="immeubles">Immeubles</option>
            <option value="constructions">Constructions</option>
          </select>
        </div>
        
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
          <input 
            type="text" 
            id="location" 
            v-model="searchParams.location"
            placeholder="Ville, code postal..." 
            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Budget max</label>
          <input 
            type="number" 
            id="price" 
            v-model="searchParams.maxPrice"
            placeholder="Prix maximum" 
            class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div class="flex items-end">
          <button 
            type="submit"
            class="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-md transition duration-200"
          >
            Rechercher
          </button>
        </div>
      </div>
      
      <!-- Critères avancés (masqués par défaut) -->
      <div v-if="showAdvanced" class="mt-4 pt-4 border-t border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="bedrooms" class="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
            <select 
              id="bedrooms" 
              v-model="searchParams.bedrooms"
              class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Indifférent</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          
          <div>
            <label for="surface" class="block text-sm font-medium text-gray-700 mb-1">Surface min (m²)</label>
            <input 
              type="number" 
              id="surface" 
              v-model="searchParams.minSurface"
              placeholder="Surface minimum" 
              class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label for="rental-yield" class="block text-sm font-medium text-gray-700 mb-1">Rendement min (%)</label>
            <input 
              type="number" 
              id="rental-yield" 
              v-model="searchParams.minYield"
              placeholder="Rendement minimum" 
              class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label for="keywords" class="block text-sm font-medium text-gray-700 mb-1">Mots-clés</label>
            <input 
              type="text" 
              id="keywords" 
              v-model="searchParams.keywords"
              placeholder="Ex: jardin, piscine..." 
              class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div class="mt-3 text-center">
        <button 
          type="button" 
          @click="showAdvanced = !showAdvanced"
          class="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
        >
          <span>{{ showAdvanced ? 'Masquer les filtres avancés' : 'Afficher plus de filtres' }}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 ml-1"
            :class="{ 'rotate-180': showAdvanced }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showAdvanced = ref(false);

const searchParams = ref({
  category: '',
  location: '',
  maxPrice: '',
  bedrooms: '',
  minSurface: '',
  minYield: '',
  keywords: ''
});

const submitSearch = () => {
  // Construire l'objet de paramètres de requête à partir des champs remplis
  const queryParams = Object.entries(searchParams.value)
    .filter(([_, value]) => value !== '' && value !== null)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
    
  // Rediriger vers la page de résultats de recherche avec les paramètres
  router.push({
    path: '/annonces',
    query: queryParams
  });
};
</script>