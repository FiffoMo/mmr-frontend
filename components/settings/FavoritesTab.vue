<template>
    <div class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Annonces favorites</h2>
        <div class="flex space-x-2 items-center">
          <button
            v-if="favorites.length > 0"
            @click="showSortOptions = !showSortOptions"
            class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 relative"
          >
            <span class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
              Trier
            </span>
            
            <!-- Options de tri -->
            <div 
              v-if="showSortOptions" 
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1"
            >
              <button 
                v-for="option in sortOptions" 
                :key="option.value"
                @click="setSortOrder(option.value)"
                class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                :class="currentSort === option.value ? 'text-cyan-600 font-medium' : 'text-gray-700'"
              >
                {{ option.label }}
              </button>
            </div>
          </button>
          
          <div class="relative">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Rechercher..." 
              class="pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:border-cyan-500 focus:ring-cyan-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Chargement -->
      <div v-if="loading" class="py-10 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <p class="mt-2 text-gray-500">Chargement des favoris...</p>
      </div>
      
      <!-- Aucun favori -->
      <div v-else-if="favorites.length === 0" class="bg-gray-100 p-8 rounded-lg text-center">
        <p class="text-gray-500">Vous n'avez pas encore d'annonces favorites.</p>
        <a href="/annonces" class="mt-2 inline-block text-cyan-600 hover:text-cyan-900 hover:underline">
          Parcourir les annonces
        </a>
      </div>
      
      <!-- Aucun résultat de recherche -->
      <div v-else-if="filteredFavorites.length === 0" class="bg-gray-100 p-8 rounded-lg text-center">
        <p class="text-gray-500">Aucune annonce ne correspond à votre recherche.</p>
        <button @click="searchQuery = ''" class="mt-2 text-cyan-600 hover:text-cyan-900 hover:underline">
          Effacer la recherche
        </button>
      </div>
      
      <!-- Liste des favoris -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="favorite in paginatedFavorites" 
          :key="favorite.id" 
          class="bg-gray-100 rounded-lg overflow-hidden"
          :class="{ 'ring-2 ring-cyan-500': selectedFavorites.includes(favorite.id) }"
        >
          <div class="relative">
            <img :src="favorite.image" alt="Propriété" class="w-full h-48 object-cover" />
            <span 
              v-if="favorite.newPrice" 
              class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
            >
              Prix baissé
            </span>
            
            <!-- Checkbox de sélection -->
            <div class="absolute top-2 left-2">
              <input 
                type="checkbox" 
                :id="`select-${favorite.id}`" 
                :checked="selectedFavorites.includes(favorite.id)" 
                @change="toggleSelectFavorite(favorite.id)"
                class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label :for="`select-${favorite.id}`" class="sr-only">Sélectionner</label>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-medium text-lg">{{ favorite.title }}</h3>
            <div class="flex justify-between items-center mt-1">
              <p 
                class="text-gray-700 font-semibold" 
                :class="{'line-through text-gray-400': favorite.newPrice}"
              >
                {{ formatPrice(favorite.price) }}
              </p>
              <p v-if="favorite.newPrice" class="text-green-600 font-semibold">
                {{ formatPrice(favorite.newPrice) }}
              </p>
            </div>
            <p class="text-sm text-gray-500">{{ favorite.location }}</p>
            <p class="text-sm text-gray-500">{{ favorite.type }} - {{ favorite.rooms }} pièces - {{ favorite.surface }} m²</p>
            <div class="mt-4 flex justify-between">
              <a 
                :href="`/annonces/detail-${favorite.id}`" 
                class="text-cyan-600 hover:text-cyan-900 hover:underline"
              >
                Voir l'annonce
              </a>
              <button 
                @click="removeFavorite(favorite.id)" 
                class="text-gray-500 hover:text-red-500 text-sm flex items-center"
              >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
               Retirer
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex justify-center">
        <nav class="flex items-center">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 1"
            :class="[
              'px-3 py-1 border rounded-l-md',
              currentPage === 1 
                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            Précédent
          </button>
          
          <button 
            v-for="page in displayedPages" 
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-3 py-1 border-t border-b',
              currentPage === page 
                ? 'bg-cyan-500 text-white border-cyan-500' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
            ]"
          >
            {{ page }}
          </button>
          
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            :class="[
              'px-3 py-1 border rounded-r-md',
              currentPage === totalPages 
                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            ]"
          >
            Suivant
          </button>
        </nav>
      </div>
      
      <!-- Sélection d'annonces -->
      <div v-if="favorites.length > 0" class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Actions groupées</h3>
          <div class="flex items-center">
            <span class="text-sm text-gray-600 mr-2">
              {{ selectedFavorites.length }} annonce(s) sélectionnée(s)
            </span>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <button 
            @click="selectAllFavorites" 
            class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
            :class="{ 'bg-gray-100': selectedFavorites.length === filteredFavorites.length }"
          >
            {{ selectedFavorites.length === filteredFavorites.length ? 'Désélectionner tout' : 'Sélectionner tout' }}
          </button>
          
          <button 
            @click="compareSelected" 
            class="px-3 py-1.5 border border-cyan-500 bg-cyan-500 text-white text-sm rounded-md hover:bg-cyan-600"
            :disabled="selectedFavorites.length < 2"
            :class="{ 'opacity-50 cursor-not-allowed': selectedFavorites.length < 2 }"
          >
            Comparer
          </button>
          
          <button 
            @click="confirmRemoveSelected" 
            class="px-3 py-1.5 border border-red-500 text-red-500 text-sm rounded-md hover:bg-red-50"
            :disabled="selectedFavorites.length === 0"
            :class="{ 'opacity-50 cursor-not-allowed': selectedFavorites.length === 0 }"
          >
            Supprimer la sélection
          </button>
        </div>
      </div>
      
      <!-- Modal de comparaison -->
      <div 
        v-if="showCompareModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Comparaison des annonces</h3>
            <button @click="showCompareModal = false" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th class="p-2 border text-left bg-gray-50">Caractéristique</th>
                  <th 
                    v-for="favorite in comparedFavorites" 
                    :key="favorite.id" 
                    class="p-2 border text-center bg-gray-50 min-w-[200px]"
                  >
                    {{ favorite.title }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- Photos -->
                <tr>
                  <td class="p-2 border font-medium">Photo</td>
                  <td v-for="favorite in comparedFavorites" :key="`img-${favorite.id}`" class="p-2 border text-center">
                    <img :src="favorite.image" alt="Propriété" class="h-28 object-cover mx-auto" />
                  </td>
                </tr>
                
                <!-- Prix -->
                <tr>
                  <td class="p-2 border font-medium">Prix</td>
                  <td v-for="favorite in comparedFavorites" :key="`price-${favorite.id}`" class="p-2 border text-center">
                    <div>
                      <p 
                        :class="{'line-through text-gray-400': favorite.newPrice}"
                      >
                        {{ formatPrice(favorite.price) }}
                      </p>
                      <p v-if="favorite.newPrice" class="text-green-600 font-semibold">
                        {{ formatPrice(favorite.newPrice) }}
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Localisation -->
                <tr>
                  <td class="p-2 border font-medium">Localisation</td>
                  <td v-for="favorite in comparedFavorites" :key="`loc-${favorite.id}`" class="p-2 border text-center">
                    {{ favorite.location }}
                  </td>
                </tr>
                
                <!-- Type -->
                <tr>
                  <td class="p-2 border font-medium">Type</td>
                  <td v-for="favorite in comparedFavorites" :key="`type-${favorite.id}`" class="p-2 border text-center">
                    {{ favorite.type }}
                  </td>
                </tr>
                
                <!-- Surface -->
                <tr>
                  <td class="p-2 border font-medium">Surface</td>
                  <td v-for="favorite in comparedFavorites" :key="`surface-${favorite.id}`" class="p-2 border text-center">
                    {{ favorite.surface }} m²
                  </td>
                </tr>
                
                <!-- Pièces -->
                <tr>
                  <td class="p-2 border font-medium">Pièces</td>
                  <td v-for="favorite in comparedFavorites" :key="`rooms-${favorite.id}`" class="p-2 border text-center">
                    {{ favorite.rooms }}
                  </td>
                </tr>
                
                <!-- Prix au m² -->
                <tr>
                  <td class="p-2 border font-medium">Prix au m²</td>
                  <td v-for="favorite in comparedFavorites" :key="`sqm-${favorite.id}`" class="p-2 border text-center">
                    {{ formatPrice(favorite.newPrice ? favorite.newPrice / favorite.surface : favorite.price / favorite.surface) }}/m²
                  </td>
                </tr>
                
                <!-- Autres caractéristiques -->
                <tr v-for="(feature, index) in compareFeatures" :key="`feature-${index}`">
                  <td class="p-2 border font-medium">{{ feature.label }}</td>
                  <td 
                    v-for="favorite in comparedFavorites" 
                    :key="`${feature.key}-${favorite.id}`" 
                    class="p-2 border text-center"
                  >
                    <svg v-if="favorite[feature.key]" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </td>
                </tr>
                
                <!-- Actions -->
                <tr>
                  <td class="p-2 border font-medium">Actions</td>
                  <td v-for="favorite in comparedFavorites" :key="`actions-${favorite.id}`" class="p-2 border text-center">
                    <a 
                      :href="`/annonces/detail-${favorite.id}`" 
                      class="text-cyan-600 hover:text-cyan-900 hover:underline block"
                    >
                      Voir l'annonce
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>

<script>
export default {
  name: 'FavoritesTab',
  
  data() {
    return {
      // Données
      favorites: [],
      
      // États
      loading: false,
      currentPage: 1,
      itemsPerPage: 9,
      searchQuery: '',
      currentSort: 'recent',
      showSortOptions: false,
      
      // Sélection et comparaison
      selectedFavorites: [],
      showCompareModal: false,
      
      // Options de tri
      sortOptions: [
        { label: 'Plus récentes', value: 'recent' },
        { label: 'Prix croissant', value: 'price_asc' },
        { label: 'Prix décroissant', value: 'price_desc' },
        { label: 'Surface décroissante', value: 'surface_desc' }
      ],
      
      // Caractéristiques pour la comparaison
      compareFeatures: [
        { key: 'elevator', label: 'Ascenseur' },
        { key: 'balcony', label: 'Balcon/Terrasse' },
        { key: 'parking', label: 'Parking' },
        { key: 'garden', label: 'Jardin' },
        { key: 'pool', label: 'Piscine' },
        { key: 'secureAccess', label: 'Accès sécurisé' },
        { key: 'furnished', label: 'Meublé' }
      ]
    };
  },
  
  computed: {
    // Filtrer les favoris selon la recherche
    filteredFavorites() {
      let result = [...this.favorites];
      
      // Filtre de recherche
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(item => 
          item.title.toLowerCase().includes(query) || 
          item.location.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query)
        );
      }
      
      // Tri des résultats
      switch(this.currentSort) {
        case 'price_asc':
          result.sort((a, b) => (a.newPrice || a.price) - (b.newPrice || b.price));
          break;
        case 'price_desc':
          result.sort((a, b) => (b.newPrice || b.price) - (a.newPrice || a.price));
          break;
        case 'surface_desc':
          result.sort((a, b) => b.surface - a.surface);
          break;
        case 'recent':
        default:
          result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
          break;
      }
      
      return result;
    },
    
    // Favoris à afficher sur la page courante
    paginatedFavorites() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredFavorites.slice(start, end);
    },
    
    // Nombre total de pages
    totalPages() {
      return Math.ceil(this.filteredFavorites.length / this.itemsPerPage);
    },
    
    // Pages à afficher dans la pagination
    displayedPages() {
      const pages = [];
      const maxDisplayedPages = 5;
      
      if (this.totalPages <= maxDisplayedPages) {
        // Afficher toutes les pages
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Afficher un sous-ensemble de pages
        const leftOffset = Math.floor(maxDisplayedPages / 2);
        let start = this.currentPage - leftOffset;
        
        if (start < 1) {
          start = 1;
        } else if (start + maxDisplayedPages > this.totalPages) {
          start = this.totalPages - maxDisplayedPages + 1;
        }
        
        for (let i = 0; i < maxDisplayedPages; i++) {
          pages.push(start + i);
        }
      }
      
      return pages;
    },
    
    // Favoris à comparer
    comparedFavorites() {
      return this.favorites.filter(favorite => this.selectedFavorites.includes(favorite.id));
    }
  },
  
  created() {
    // Charger les favoris au montage du composant
    this.fetchFavorites();
    
    // Fermer le menu de tri lors d'un clic à l'extérieur
    document.addEventListener('click', this.clickOutside);
  },
  
  beforeUnmount() {
    // Nettoyer les écouteurs d'événements
    document.removeEventListener('click', this.clickOutside);
  },
  
  watch: {
    // Réinitialiser la page courante lors d'une recherche
    searchQuery() {
      this.currentPage = 1;
    }
  },
  
  methods: {
    // Récupération des favoris
    async fetchFavorites() {
      this.loading = true;
      
      try {
        // Dans un cas réel, ce serait un appel API
        // const response = await api.getFavorites();
        // this.favorites = response;
        
        // Pour l'exemple, nous utilisons des données fictives
        this.favorites = [
          {
            id: 101,
            title: 'Appartement 3 pièces avec terrasse',
            price: 240000,
            location: 'Paris 15e',
            type: 'Appartement',
            rooms: 3,
            surface: 65,
            image: '/images/dummy/apt1.jpg',
            dateAdded: '2025-03-01',
            elevator: true,
            balcony: true,
            parking: false,
            garden: false,
            pool: false,
            secureAccess: true,
            furnished: false
          },
          {
            id: 102,
            title: 'Maison 5 pièces avec jardin',
            price: 420000,
            newPrice: 399000,
            location: 'Bordeaux',
            type: 'Maison',
            rooms: 5,
            surface: 120,
            image: '/images/dummy/house1.jpg',
            dateAdded: '2025-02-15',
            elevator: false,
            balcony: true,
            parking: true,
            garden: true,
            pool: false,
            secureAccess: true,
            furnished: false
          },
          {
            id: 103,
            title: 'Studio en centre-ville',
            price: 120000,
            location: 'Lyon',
            type: 'Studio',
            rooms: 1,
            surface: 28,
            image: '/images/dummy/studio1.jpg',
            dateAdded: '2025-03-10',
            elevator: true,
            balcony: false,
            parking: false,
            garden: false,
            pool: false,
            secureAccess: true,
            furnished: true
          },
          {
            id: 104,
            title: 'Villa avec piscine',
            price: 780000,
            location: 'Nice',
            type: 'Villa',
            rooms: 6,
            surface: 210,
            image: '/images/dummy/villa1.jpg',
            dateAdded: '2025-02-20',
            elevator: false,
            balcony: true,
            parking: true,
            garden: true,
            pool: true,
            secureAccess: true,
            furnished: false
          },
          {
            id: 105,
            title: 'Loft industriel rénové',
            price: 350000,
            location: 'Lille',
            type: 'Loft',
            rooms: 2,
            surface: 95,
            image: '/images/dummy/loft1.jpg',
            dateAdded: '2025-03-05',
            elevator: true,
            balcony: false,
            parking: true,
            garden: false,
            pool: false,
            secureAccess: true,
            furnished: false
          }
        ];
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Supprimer un favori
    async removeFavorite(id) {
      if (!confirm('Êtes-vous sûr de vouloir retirer cette annonce de vos favoris ?')) {
        return;
      }
      
      try {
        // Dans un cas réel, ce serait un appel API
        // await api.removeFavorite(id);
        
        // Mise à jour locale
        this.favorites = this.favorites.filter(fav => fav.id !== id);
        
        // Mise à jour de la sélection
        this.selectedFavorites = this.selectedFavorites.filter(favId => favId !== id);
      } catch (error) {
        console.error('Erreur lors de la suppression du favori:', error);
        alert('Une erreur est survenue lors de la suppression du favori');
      }
    },
    
    // Changement de page
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      
      // Remonter en haut de la liste
      window.scrollTo({
        top: this.$el.offsetTop,
        behavior: 'smooth'
      });
    },
    
    // Définir l'ordre de tri
    setSortOrder(order) {
      this.currentSort = order;
      this.showSortOptions = false;
      this.currentPage = 1;
    },
    
    // Fermer le menu de tri lors d'un clic à l'extérieur
    clickOutside(event) {
      if (this.showSortOptions && !event.target.closest('button')) {
        this.showSortOptions = false;
      }
    },
    
    // Sélectionner/désélectionner un favori
    toggleSelectFavorite(id) {
      const index = this.selectedFavorites.indexOf(id);
      if (index === -1) {
        this.selectedFavorites.push(id);
      } else {
        this.selectedFavorites.splice(index, 1);
      }
    },
    
    // Sélectionner/désélectionner tous les favoris
    selectAllFavorites() {
      if (this.selectedFavorites.length === this.filteredFavorites.length) {
        // Tout désélectionner
        this.selectedFavorites = [];
      } else {
        // Tout sélectionner
        this.selectedFavorites = this.filteredFavorites.map(fav => fav.id);
      }
    },
    
    // Comparer les annonces sélectionnées
    compareSelected() {
      if (this.selectedFavorites.length < 2) {
        alert('Veuillez sélectionner au moins 2 annonces à comparer');
        return;
      }
      
      this.showCompareModal = true;
    },
    
    // Confirmer la suppression des favoris sélectionnés
    confirmRemoveSelected() {
      if (this.selectedFavorites.length === 0) return;
      
      if (confirm(`Êtes-vous sûr de vouloir retirer ${this.selectedFavorites.length} annonce(s) de vos favoris ?`)) {
        this.removeSelectedFavorites();
      }
    },
    
    // Supprimer les favoris sélectionnés
    async removeSelectedFavorites() {
      try {
        // Dans un cas réel, ce serait un appel API
        // await api.removeMultipleFavorites(this.selectedFavorites);
        
        // Mise à jour locale
        this.favorites = this.favorites.filter(fav => !this.selectedFavorites.includes(fav.id));
        
        // Réinitialiser la sélection
        this.selectedFavorites = [];
        
        // Vérifier si on doit ajuster la page courante
        if (this.filteredFavorites.length === 0 && this.currentPage > 1) {
          this.currentPage = Math.max(1, this.currentPage - 1);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression des favoris:', error);
        alert('Une erreur est survenue lors de la suppression des favoris');
      }
    },
    
    // Formater un prix
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
    }
  }
};
</script>

<style scoped>
/* Styles pour les boutons de pagination */
.page-button {
  @apply px-3 py-1 border cursor-pointer;
}

.page-button.active {
  @apply bg-cyan-500 text-white border-cyan-500;
}

.page-button.disabled {
  @apply bg-gray-100 text-gray-400 cursor-not-allowed;
}

/* Animation de chargement */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>