<!-- pages/articles/index.vue -->

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-gray-500">Chargement des articles...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded mb-6">
      {{ error }}
    </div>
    
    <template v-else>
      <!-- Structure principale avec colonne principale et sidebar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Colonne principale (3/4) -->
        <div class="md:col-span-3">
          <!-- Titre et introduction -->
          <h1 class="text-3xl font-bold mb-6 text-center">Articles utiles et News</h1>
          
          <!-- Introduction -->
          <div class="mb-8">
            <h3 class="text-2xl font-medium text-center text-gray-700 mb-4">
              Bienvenue dans notre section articles</h3>
            <p class="text-gray-700 mb-4 text-center">Nos articles sont conçues pour vous apporter des informations précieuses 
              et pratiques sur la valorisation de votre bien immobilier.<br>
              Découvrez comment transformer vos espaces inutilisés en opportunités de revenus supplémentaires, les meilleures pratiques 
              pour la location, et les dernières tendances du marché immobilier.
            </p>
          </div>
        
        <!-- Barre de filtres améliorée -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <label class="font-medium text-gray-700 mr-2">Catégorie:</label>
              <select v-model="selectedCategory" class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                <option value="">Toutes les catégories</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.nom }}
                </option>
              </select>
            </div>
            <div>
              <label class="font-medium text-gray-700 mr-2">Trier par:</label>
              <select v-model="sortOption" class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                <option value="date-desc">Plus récents</option>
                <option value="date-asc">Plus anciens</option>
                <option value="title-asc">Titre (A-Z)</option>
                <option value="title-desc">Titre (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Article à la une -->
        <div v-if="featuredArticle" class="mb-10">
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="md:flex">
              <div class="md:w-1/2">
                <img 
                  v-if="featuredArticle.image_principale" 
                  :src="`http://localhost:8055/assets/${featuredArticle.image_principale}`" 
                  :alt="featuredArticle.titre" 
                  class="w-full h-64 md:h-full object-cover cursor-pointer"
                  @click="$router.push(`/articles/${featuredArticle.id}`)"
                />
                <div v-else class="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <span>Aucune image</span>
                </div>
              </div>
              <div class="p-6 md:w-1/2">
                <div class="text-sm text-cyan-600 mb-1">{{ formatDate(featuredArticle.date_publication) }}</div>
                <h2 class="text-2xl font-bold mb-3 cursor-pointer hover:text-cyan-600" @click="$router.push(`/articles/${featuredArticle.id}`)">
                  {{ featuredArticle.titre }}
                </h2>
                <p class="text-gray-600 mb-4 line-clamp-3">{{ getExcerpt(featuredArticle) }}</p>
                <NuxtLink 
                  :to="`/articles/${featuredArticle.id}`" 
                  class="inline-block bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600 transition-colors"
                >
                  Lire l'article
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Liste des articles -->
        <div v-if="filteredArticles.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="article in filteredArticles" 
            :key="article.id" 
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div class="h-48 bg-gray-200">
              <img 
                v-if="article.image_principale" 
                :src="`http://localhost:8055/assets/${article.image_principale}`" 
                :alt="article.titre" 
                class="w-full h-full object-cover cursor-pointer"
                @click="$router.push(`/articles/${article.id}`)"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <span>Aucune image</span>
              </div>
            </div>
            
            <div class="p-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-cyan-600">{{ formatDate(article.date_publication) }}</span>
                <a 
                  href="#" 
                  @click.prevent="selectCategory(article.categorie)" 
                  class="px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300 transition-colors"
                >
                  {{ getCategoryName(article.categorie) }}
                </a>
              </div>
              
              <h3 class="text-lg font-semibold mb-2 cursor-pointer hover:text-cyan-600" @click="$router.push(`/articles/${article.id}`)">
                {{ article.titre }}
              </h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{ getExcerpt(article) }}</p>
              
              <NuxtLink 
                :to="`/articles/${article.id}`" 
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
    
      <!-- ////   Sidebar (largeur fixe) ////-->
      <div class="lg:w-[320px] shrink-0">
        <!-- Navigation par catégorie -->
        <div class="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 class="font-semibold mb-4">Parcourir par catégorie</h3>
          <div class="space-y-2">
            <button 
              @click="selectCategory('')"
              class="w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 transition-colors"
              :class="{'bg-cyan-50 text-cyan-700 font-medium': selectedCategory === ''}"
            >
              Tous les articles
            </button>
            <button 
              v-for="cat in categories" 
              :key="cat.id"
              @click="selectCategory(cat.id)"
              class="w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 transition-colors"
              :class="{'bg-cyan-50 text-cyan-700 font-medium': selectedCategory == cat.id}"
            >
              {{ cat.nom }}
            </button>
          </div>
        </div>
        
        <!-- Publicité 1 (article_right_top) avec rotation équitable -->
        <div class="mb-6">
          <PubliciteRotative 
            emplacement="article_right_top"
            :width="360"
            :height="320"
            :show-label="true"
            :use-equitable-rotation="true"
            :fallback-content="topAdFallback"
          />
        </div>
        
        <!-- Annonce à la une (composant dynamique) -->
        <MiseEnAvantSidebar class="mb-6" />
        
        <!-- Publicité 2 (article_right_bottom) avec rotation équitable -->
        <PubliciteRotative 
            emplacement="article_right_bottom"
            :width="360" 
            :height="640"
            :show-label="true"
            :use-equitable-rotation="true"
            :fallback-content="bottomAdFallback"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import MiseEnAvantSidebar from '~/components/annonces/MiseEnAvantSidebar.vue';
import PubliciteRotative from '~/components/publicites/PubliciteRotative.vue';

export default {
  components: {
    MiseEnAvantSidebar,
    PubliciteRotative
  },
  data() {
    return {
      articles: [],
      categories: [],
      selectedCategory: '',
      sortOption: 'date-desc',
      loading: true,
      error: null,
      topAdFallback: `
        <div class="bg-cyan-500 text-white rounded-lg overflow-hidden relative w-full h-full">
          <div class="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
            <div class="text-center p-4">
              <div class="text-2xl font-bold mb-2">VOTRE PUB ICI</div>
              <div class="text-sm">Donnez du poids à votre communication</div>
              <div class="text-xs mt-2">Format 300 x 250</div>
            </div>
          </div>
        </div>
      `,
      bottomAdFallback: `
        <div class="bg-cyan-500 text-white rounded-lg overflow-hidden relative w-full h-full">
          <div class="w-full h-full bg-gradient-to-b from-cyan-500 to-blue-600 flex items-center justify-center">
            <div class="text-center p-4">
              <div class="text-2xl font-bold mb-2">VOTRE PUB ICI</div>
              <div class="text-sm mb-8">Donnez de la hauteur à votre communication</div>
              <div class="text-xs">Format 300 x 600</div>
            </div>
          </div>
        </div>
      `
    }
  },
  
  computed: {
    featuredArticle() {
      if (this.articles.length === 0) return null;
      return [...this.articles].sort((a, b) => 
        new Date(b.date_publication) - new Date(a.date_publication)
      )[0];
    },
    
    filteredArticles() {
      // Filtrer par catégorie si une catégorie est sélectionnée
      let filtered = this.selectedCategory 
        ? this.articles.filter(article => article.categorie == this.selectedCategory)
        : this.articles;
      
      // Exclure l'article à la une
      if (this.featuredArticle) {
        filtered = filtered.filter(article => article.id !== this.featuredArticle.id);
      }
      
      // Trier les articles
      switch(this.sortOption) {
        case 'date-desc':
          return filtered.sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication));
        case 'date-asc':
          return filtered.sort((a, b) => new Date(a.date_publication) - new Date(b.date_publication));
        case 'title-asc':
          return filtered.sort((a, b) => a.titre.localeCompare(b.titre));
        case 'title-desc':
          return filtered.sort((a, b) => b.titre.localeCompare(a.titre));
        default:
          return filtered;
      }
    }
  },
  
  async mounted() {
    try {
      this.loading = true;
      
      // Récupération des articles
      const articlesResponse = await fetch('/api/directus/items/articles?filter[status]=published');
      
      if (!articlesResponse.ok) {
        throw new Error('Erreur lors de la récupération des articles');
      }
      
      const articlesData = await articlesResponse.json();
      this.articles = articlesData.data || [];
      
      // Récupération des catégories
      const categoriesResponse = await fetch('/api/directus/items/articles_categories');
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        this.categories = categoriesData.data || [];
        
        // Vérifier si un paramètre categorie est présent dans l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('categorie');
        if (categoryParam) {
          this.selectedCategory = categoryParam;
        }
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      this.error = error.message || 'Une erreur est survenue lors du chargement des articles';
    } finally {
      this.loading = false;
    }
  },
  
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'Date non disponible';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    },
    
    getExcerpt(article) {
      // Utiliser le résumé s'il existe, sinon extraire du contenu
      let text = '';
      if (article.resume) {
        text = article.resume;
      } else {
        // Supprimer les balises HTML du contenu
        const content = article.contenu || '';
        text = content.replace(/<[^>]*>/g, '');
      }
      
      // Limiter à environ 120 caractères et ajouter [...]
      if (text.length > 120) {
        return text.substring(0, 120).trim() + ' [...]';
      }
      
      return text;
    },
    
    getCategoryName(categoryId) {
      if (!categoryId) return 'Catégorie inconnue';
      
      const category = this.categories.find(cat => cat.id == categoryId);
      return category ? category.nom : 'Catégorie inconnue';
    },
    
    selectCategory(categoryId) {
      this.selectedCategory = categoryId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
</script>