<!-- pages/articles/[id].vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-gray-500">Chargement de l'article...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">
      {{ error }}
    </div>
    
    <div v-else>
      <!-- Navigation -->
      <div class="mb-6">
        <NuxtLink to="/articles" class="text-cyan-600 hover:underline">
          &larr; Retour aux articles
        </NuxtLink>
      </div>
      
      <!-- En-tête de l'article -->
      <div class="mb-8">
        <div class="flex items-center text-gray-500 text-sm mb-2">
          <span>{{ formatDate(article.date_publication) }}</span>
          <span class="mx-2">•</span>
          <a 
            href="/articles" 
            @click.prevent="goToCategory(article.categorie)"
            class="hover:text-cyan-600 hover:underline"
          >
            {{ getCategoryName(article.categorie) }}
          </a>
          <span class="mx-2">•</span>
          <span>{{ getReadingTime(article.contenu) }} min de lecture</span>
        </div>
        
        <h1 class="text-4xl font-bold mb-4">{{ article.titre }}</h1>
        
        <div v-if="author" class="flex items-center">
          <div class="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
            <img 
              v-if="author.avatar" 
              :src="`http://localhost:8055/assets/${author.avatar}`" 
              :alt="author.name" 
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <span class="text-xs">{{ getInitials(author.name) }}</span>
            </div>
          </div>
          <div>
            <div class="font-medium">{{ author.name }}</div>
            <div class="text-sm text-gray-500">{{ author.title || 'Auteur' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Image principale -->
      <div class="mb-8">
        <img 
          v-if="article.image_principale" 
          :src="`http://localhost:8055/assets/${article.image_principale}`" 
          :alt="article.titre" 
          class="w-full h-80 object-cover rounded-lg"
        />
      </div>
      
      <!-- Contenu de l'article -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Contenu principal -->
        <div class="md:col-span-3">
          <div class="prose max-w-none">
            <div v-html="article.contenu"></div>
          </div>
          
          <!-- Tags -->
          <div v-if="tags.length > 0" class="mt-8">
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tag in tags" 
                :key="tag"
                class="px-3 py-1 bg-gray-200 rounded-full text-sm"
              >
                #{{ tag.trim() }}
              </span>
            </div>
          </div>
          
          <!-- Partage -->
          <div class="mt-8 pt-6 border-t">
            <h3 class="font-semibold mb-2">Partager cet article</h3>
            <div class="flex space-x-4">
              <a href="#" @click.prevent="shareOnFacebook" class="text-blue-600 hover:text-blue-800">
                <span class="sr-only">Facebook</span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                </svg>
              </a>
              <a href="#" @click.prevent="shareOnTwitter" class="text-blue-400 hover:text-blue-600">
                <span class="sr-only">Twitter</span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" @click.prevent="shareOnWhatsApp" class="text-green-600 hover:text-green-800">
                <span class="sr-only">WhatsApp</span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill-rule="evenodd" d="M2.004 22l1.352-4.968A9.954 9.954 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.954 9.954 0 01-5.03-1.355L2.004 22zM8.391 7.308a.961.961 0 00-.371.1 1.293 1.293 0 00-.294.228c-.12.113-.188.211-.261.306A2.729 2.729 0 006.9 9.62c.002.49.13.967.33 1.413.409.902 1.082 1.857 1.971 2.742.214.213.423.427.648.626a9.448 9.448 0 003.84 2.046l.569.087c.185.01.37-.004.556-.013a1.99 1.99 0 00.833-.231c.166-.088.244-.132.383-.22 0 0 .043-.028.125-.09.135-.1.218-.171.33-.288.083-.086.155-.187.21-.302.078-.163.156-.474.188-.733.024-.198.017-.306.014-.373-.004-.107-.093-.218-.19-.265l-.582-.261s-.87-.379-1.401-.621a.498.498 0 00-.177-.041.482.482 0 00-.378.127v-.002c-.005 0-.072.057-.795.933a.35.35 0 01-.368.13 1.416 1.416 0 01-.191-.066c-.124-.052-.167-.072-.252-.109l-.005-.002a6.01 6.01 0 01-1.57-1c-.126-.11-.243-.23-.363-.346a6.296 6.296 0 01-1.02-1.268l-.059-.095a.923.923 0 01-.102-.205c-.038-.147.061-.265.061-.265s.243-.266.356-.41a4.38 4.38 0 00.263-.373c.118-.19.155-.385.093-.536-.28-.684-.57-1.365-.868-2.041-.059-.134-.234-.23-.393-.249-.054-.006-.108-.012-.162-.016a3.385 3.385 0 00-.403.004z" clip-rule="evenodd" />
                </svg>
              </a>
              <a href="#" @click.prevent="shareOnLinkedIn" class="text-blue-700 hover:text-blue-900">
                <span class="sr-only">LinkedIn</span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Barre latérale -->
        <div class="md:col-span-1">
          <div class="bg-gray-50 p-6 rounded-lg sticky top-6">
            <h3 class="font-semibold mb-4">Articles similaires</h3>
            
            <div v-if="similarArticles.length > 0" class="space-y-4">
              <div 
                v-for="similar in similarArticles" 
                :key="similar.id" 
                class="border-b pb-4 last:border-0"
              >
                <NuxtLink :to="`/articles/${similar.id}`" class="hover:text-cyan-600">
                  <h4 class="font-medium mb-1">{{ similar.titre }}</h4>
                  <p class="text-sm text-gray-500">{{ formatDate(similar.date_publication) }}</p>
                </NuxtLink>
              </div>
            </div>
            
            <div v-else class="text-gray-500 text-sm">
              Aucun article similaire trouvé.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      article: null,
      categories: [],
      author: null,
      similarArticles: [],
      loading: true,
      error: null
    }
  },
  
  computed: {
    tags() {
      if (!this.article || !this.article.tags) return [];
      return this.article.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
  },
  
  async mounted() {
    try {
      this.loading = true;
      
      // Récupération de l'article
      const articleId = this.$route.params.id;
      const response = await fetch(`/api/directus/items/articles/${articleId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'article');
      }
      
      const data = await response.json();
      this.article = data.data;
      
      // Récupération des catégories
      const categoriesResponse = await fetch('/api/directus/items/articles_categories');
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        this.categories = categoriesData.data || [];
      }
      
      // Récupération de l'auteur
      if (this.article && this.article.auteur) {
        await this.fetchAuthor(this.article.auteur);
      }
      
      // Récupération des articles similaires (même catégorie)
      if (this.article && this.article.categorie) {
        const similarResponse = await fetch(
          `/api/directus/items/articles?filter[categorie][_eq]=${this.article.categorie}&filter[id][_neq]=${this.article.id}&filter[status]=published&limit=3`
        );
        
        if (similarResponse.ok) {
          const similarData = await similarResponse.json();
          this.similarArticles = similarData.data || [];
        }
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      this.error = 'Impossible de charger cet article. Il n\'existe peut-être plus.';
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
    
    getReadingTime(content) {
      if (!content) return 5;
      
      // Supprimer les balises HTML pour compter uniquement le texte
      const plainText = content.replace(/<[^>]*>/g, '');
      // Moyenne de 200 mots par minute
      const wordCount = plainText.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      
      return readingTime || 1; // Minimum 1 minute
    },
    
    getInitials(name) {
      if (!name) return 'AA';
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    
    getCategoryName(categoryId) {
      if (!categoryId) return 'Catégorie inconnue';
      
      const category = this.categories.find(cat => cat.id == categoryId);
      return category ? category.nom : 'Catégorie inconnue';
    },
    
    async fetchAuthor(authorId) {
      try {
        const authorResponse = await fetch(`/api/directus/users/${authorId}`);
        
        if (authorResponse.ok) {
          const authorData = await authorResponse.json();
          this.author = {
            name: authorData.data?.first_name && authorData.data?.last_name 
              ? `${authorData.data.first_name} ${authorData.data.last_name}`
              : authorData.data?.email || 'Auteur inconnu',
            title: authorData.data?.title || 'Auteur',
            avatar: authorData.data?.avatar
          };
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'auteur:', error);
      }
    },
    
    goToCategory(categoryId) {
      if (!categoryId) return;
      this.$router.push(`/articles?categorie=${categoryId}`);
    },
    
    // Méthodes de partage social
    shareOnFacebook() {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    },
    
    shareOnTwitter() {
      const text = this.article.titre;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    },
    
    shareOnWhatsApp() {
      const text = `${this.article.titre} - ${window.location.href}`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    },
    
    shareOnLinkedIn() {
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    }
  }
}
</script>