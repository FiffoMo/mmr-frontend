<!-- pages/blog/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Articles et actualités</h1>
    
    <!-- Article à la une -->
    <div v-if="featuredArticle" class="mb-10">
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="md:flex">
          <div class="md:w-1/2">
            <img 
              :src="`http://localhost:8055/assets/${featuredArticle.image}`" 
              :alt="featuredArticle.titre" 
              class="w-full h-64 md:h-full object-cover"
            />
          </div>
          <div class="p-6 md:w-1/2">
            <div class="text-sm text-cyan-600 mb-1">{{ formatDate(featuredArticle.date_publication) }}</div>
            <h2 class="text-2xl font-bold mb-3">{{ featuredArticle.titre }}</h2>
            <p class="text-gray-600 mb-4 line-clamp-3">{{ featuredArticle.extrait }}</p>
            <NuxtLink 
              :to="`/blog/${featuredArticle.id}`" 
              class="inline-block bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 transition-colors"
            >
              Lire l'article
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Filtres et tri -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <label class="mr-2">Catégorie:</label>
        <select v-model="selectedCategory" class="border rounded px-3 py-2">
          <option value="">Toutes les catégories</option>
          <option v-for="categorie in categories" :key="categorie" :value="categorie">
            {{ categorie }}
          </option>
        </select>
      </div>
      <div>
        <label class="mr-2">Trier par:</label>
        <select v-model="sortOption" class="border rounded px-3 py-2">
          <option value="date-desc">Plus récents</option>
          <option value="date-asc">Plus anciens</option>
          <option value="title-asc">Titre (A-Z)</option>
          <option value="title-desc">Titre (Z-A)</option>
        </select>
      </div>
    </div>
    
    <!-- Liste des articles -->
    <div v-if="filteredAndSortedArticles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="article in filteredAndSortedArticles" 
        :key="article.id" 
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <div class="h-48 bg-gray-200">
          <img 
            v-if="article.image" 
            :src="`http://localhost:8055/assets/${article.image}`" 
            :alt="article.titre" 
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <span>Aucune image</span>
          </div>
        </div>
        
        <div class="p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-cyan-600">{{ formatDate(article.date_publication) }}</span>
            <span class="px-2 py-1 bg-gray-200 text-xs rounded">{{ article.categorie }}</span>
          </div>
          
          <h3 class="text-lg font-semibold mb-2">{{ article.titre }}</h3>
          <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ article.extrait }}</p>
          
          <NuxtLink 
            :to="`/blog/${article.id}`" 
            class="text-cyan-500 hover:underline"
          >
            Lire la suite →
          </NuxtLink>
        </div>
      </div>
    </div>
    
    <!-- Message si aucun article -->
    <div v-else class="bg-gray-100 p-8 rounded-lg text-center">
      <p class="text-gray-600">Aucun article disponible dans cette catégorie.</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      articles: [],
      selectedCategory: '',
      sortOption: 'date-desc',
      loading: true,
      error: null
    }
  },
  
  computed: {
    categories() {
      // Extraire les catégories uniques des articles
      return [...new Set(this.articles.map(article => article.categorie))];
    },
    
    featuredArticle() {
      // Récupérer l'article mis en avant (le plus récent avec featured=true)
      return this.articles.find(article => article.featured) || 
             (this.articles.length > 0 ? this.articles[0] : null);
    },
    
    filteredAndSortedArticles() {
      // Filtrer par catégorie si une catégorie est sélectionnée
      let filteredArticles = this.selectedCategory 
        ? this.articles.filter(article => article.categorie === this.selectedCategory)
        : this.articles;
      
      // Exclure l'article à la une
      if (this.featuredArticle) {
        filteredArticles = filteredArticles.filter(article => article.id !== this.featuredArticle.id);
      }
      
      // Trier les articles
      switch(this.sortOption) {
        case 'date-desc':
          return filteredArticles.sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication));
        case 'date-asc':
          return filteredArticles.sort((a, b) => new Date(a.date_publication) - new Date(b.date_publication));
        case 'title-asc':
          return filteredArticles.sort((a, b) => a.titre.localeCompare(b.titre));
        case 'title-desc':
          return filteredArticles.sort((a, b) => b.titre.localeCompare(a.titre));
        default:
          return filteredArticles;
      }
    }
  },
  
  async mounted() {
    try {
      this.loading = true;
      
      // Récupération des articles depuis Directus
      const { default: fetch } = await import('node-fetch');
      const directusUrl = 'http://localhost:8055';
      const response = await fetch(`${directusUrl}/items/articles?fields=*`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des articles');
      }
      
      const data = await response.json();
      this.articles = data.data;
      
    } catch (error) {
      console.error('Erreur:', error);
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  },
  
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    }
  }
}
</script>