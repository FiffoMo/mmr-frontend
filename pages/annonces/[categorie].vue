<!-- pages/annonces/[categorie].vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 capitalize">{{ categorieFormatted }}</h1>

    <!-- Section Coups de cœur -->
    <div v-if="coupDeCoeur.length > 0" class="mb-10">
      <h2 class="text-2xl font-semibold mb-4 text-cyan-600">Coups de cœur</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnnonceCard 
          v-for="annonce in coupDeCoeur" 
          :key="annonce.id" 
          :annonce="annonce"
          highlighted
        />
      </div>
    </div>

    <!-- Section Annonces récentes -->
    <div>
      <h2 class="text-2xl font-semibold mb-4">Annonces récentes</h2>
      
      <!-- Options de tri -->
      <div class="flex justify-end mb-4">
        <select v-model="sortOption" class="border rounded px-3 py-2">
          <option value="date-desc">Plus récentes</option>
          <option value="date-asc">Plus anciennes</option>
          <option value="prix-asc">Prix croissant</option>
          <option value="prix-desc">Prix décroissant</option>
          <option value="rentabilite-desc">Meilleure rentabilité</option>
        </select>
      </div>
      
      <!-- Liste des annonces -->
      <div v-if="sortedAnnonces.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnnonceCard 
          v-for="annonce in sortedAnnonces" 
          :key="annonce.id" 
          :annonce="annonce"
        />
      </div>
      
      <!-- Message si aucune annonce -->
      <div v-else class="bg-gray-100 p-8 rounded-lg text-center">
        <p class="text-gray-600">Aucune annonce disponible dans cette catégorie pour le moment.</p>
      </div>
    </div>
  </div>
</template>

<script>
import AnnonceCard from '~/components/annonces/AnnonceCard.vue';

export default {
  components: {
    AnnonceCard
  },
  
  data() {
    return {
      coupDeCoeur: [],
      annonces: [],
      sortOption: 'date-desc',
      loading: true,
      error: null
    }
  },
  
  computed: {
    categorieFormatted() {
      // Formatage du nom de la catégorie (ex: "appartements" -> "Appartements")
      const categorie = this.$route.params.categorie;
      return categorie.charAt(0).toUpperCase() + categorie.slice(1);
    },
    
    sortedAnnonces() {
      const annonces = [...this.annonces];
      
      switch(this.sortOption) {
        case 'date-desc':
          return annonces.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
        case 'date-asc':
          return annonces.sort((a, b) => new Date(a.date_creation) - new Date(b.date_creation));
        case 'prix-asc':
          return annonces.sort((a, b) => a.prix - b.prix);
        case 'prix-desc':
          return annonces.sort((a, b) => b.prix - a.prix);
        case 'rentabilite-desc':
          return annonces.sort((a, b) => b.rentabilite - a.rentabilite);
        default:
          return annonces;
      }
    }
  },
  
  async mounted() {
    try {
      this.loading = true;
      
      // Récupération des annonces depuis notre API
      const categorie = this.$route.params.categorie;
      const response = await fetch(`/api/annonces/categorie?categorie=${categorie}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des annonces');
      }
      
      const data = await response.json();
      
      if (data.success) {
        this.coupDeCoeur = data.coupDeCoeur || [];
        this.annonces = data.annonces || [];
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  },
  
  // Réagir aux changements de catégorie
  watch: {
    '$route.params.categorie': {
      handler() {
        this.fetchAnnonces();
      }
    }
  },
  
  methods: {
    async fetchAnnonces() {
      try {
        this.loading = true;
        
        const categorie = this.$route.params.categorie;
        const response = await fetch(`/api/annonces/categorie?categorie=${categorie}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des annonces');
        }
        
        const data = await response.json();
        
        if (data.success) {
          this.coupDeCoeur = data.coupDeCoeur || [];
          this.annonces = data.annonces || [];
        } else {
          throw new Error(data.message || 'Erreur inconnue');
        }
        
      } catch (error) {
        console.error('Erreur:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>