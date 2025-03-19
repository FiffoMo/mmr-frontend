<template>
  <div class="search-bar bg-white shadow-lg rounded-lg p-6 -mt-10 relative z-10 mx-4 md:mx-auto max-w-5xl">
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
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchParams = ref({
  category: '',
  location: '',
  maxPrice: ''
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
<style scoped>
.search-bar {
  position: relative;
  z-index: 1;
  }
</style>

