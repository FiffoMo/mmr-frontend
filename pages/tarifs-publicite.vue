<!-- pages/tarifs-publicite.vue (partie template) -->
<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-center mb-2">Espaces publicitaires</h1>
    <p class="text-xl text-center text-gray-600 mb-12">Augmentez votre visibilité auprès des investisseurs immobiliers</p>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center">
      <div class="animate-pulse space-y-8 w-full max-w-6xl">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-md p-6 h-64"></div>
        </div>
      </div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 p-4 rounded-lg text-red-700 max-w-3xl mx-auto">
      <p>{{ error }}</p>
    </div>
    
    <!-- Introduction -->
    <div v-else class="max-w-4xl mx-auto mb-12">
      <div class="text-center mb-8">
        <p class="text-gray-700 mb-4">
          Nos espaces publicitaires vous permettent d'atteindre une audience ciblée d'investisseurs et d'acheteurs immobiliers. 
          Choisissez l'emplacement qui correspond le mieux à vos objectifs de communication.
        </p>
        <p class="text-gray-600 mb-2">
          Pour toute demande spécifique ou pour les campagnes personnalisées, contactez notre équipe commerciale.
        </p>
        <a href="/contact" class="text-cyan-600 hover:text-cyan-800 font-medium">
          Demander un devis personnalisé →
        </a>
      </div>
      
      <!-- Statistiques de visibilité -->
      <!--<div class="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 class="text-xl font-bold mb-6 text-center">Notre audience</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div class="text-3xl font-bold text-cyan-600 mb-2">25 000+</div>
            <p class="text-gray-600">Visiteurs uniques par mois</p>
          </div>
          <div>
            <div class="text-3xl font-bold text-cyan-600 mb-2">4:30</div>
            <p class="text-gray-600">Durée moyenne des visites</p>
          </div>
          <div>
            <div class="text-3xl font-bold text-cyan-600 mb-2">78%</div>
            <p class="text-gray-600">Investisseurs immobiliers</p>
          </div>
        </div>
      </div>-->
    </div> 
    
    <!-- Emplacements publicitaires -->
    <div v-if="!loading && !error">
      <h2 class="text-2xl font-bold text-center mb-8">Nos emplacements publicitaires</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16 max-w-7xl mx-auto">        <!-- Publicité items dynamiques -->
        <div 
          v-for="pub in publicites" 
          :key="pub.id"
          class="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
        >
          <!-- Bloc d'affichage d'image -->
          <div class="relative h-48 bg-gray-100">
              <template v-if="pub.image">
                <NuxtLink 
                  :to="`/acheter-forfait/${pub.id}`">
                    <img 
                      :src="getImageUrl(pub.image)" 
                      :alt="pub.nom"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    />
                </NuxtLink>  
              </template>
              <div v-else class="flex items-center justify-center h-full bg-cyan-50">
                  <div class="text-center p-4">
                      <svg class="w-12 h-12 text-cyan-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p class="text-cyan-500 font-medium">{{ getDimensions(pub.emplacement) }}</p>
                  </div>
              </div>
              
              <div class="absolute top-0 left-0 bg-cyan-500 text-white px-2 py-1 text-xs font-semibold">
                  {{ getLocation(pub.emplacement) }}
              </div>
          </div>
          
          <div class="p-5 flex-grow">
            <h3 class="text-xl text-center font-bold mb-2">{{ pub.nom }}</h3>
            
            <div class="mb-4 flex justify-between items-baseline">
              <span class="text-2xl font-bold text-gray-800">{{ formatPrice(pub.prix) }} €</span>
              <span class="text-gray-700 text-md flex items-center">
                <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {{ pub.duree_jours }} jours
              </span>
            </div>
            
            <div class="text-gray-600 mb-6 text-sm" v-html="getFormattedDescription(pub)"></div>
            
            <div class="space-y-3 mb-4">
              <!-- Les statistiques sont temporairement désactivées
              <div class="flex items-center text-sm">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>{{ getImpressions(pub.emplacement) }} impressions estimées</span>
              </div>
              <div class="flex items-center text-sm">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>{{ getCTR(pub.emplacement) }}% de taux de clic moyen</span>
              </div>
              <div class="flex items-center text-sm">
                <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Statistiques détaillées</span>
              </div>
              -->
            </div>
          </div>
          
          <div class="p-5 pt-0 mt-auto">
            <NuxtLink 
              :to="`/acheter-forfait/${pub.id}`"
              class="block w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors"
            >
              Réserver cet espace
            </NuxtLink>
          </div>
        </div>
        
        <!-- Fallback si aucune publicité n'est trouvée -->
        <div 
          v-if="publicites.length === 0"
          class="bg-white rounded-lg shadow-md overflow-hidden md:col-span-2 lg:col-span-3 p-8 text-center"
        >
          <p class="text-gray-600 mb-4">Aucun emplacement publicitaire n'est actuellement disponible.</p>
          <p class="text-gray-500">Veuillez nous contacter pour plus d'informations sur nos futures disponibilités.</p>
          <a 
            href="/contact?sujet=publicite" 
            class="inline-block mt-4 py-2 px-6 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </div>
    
    <!-- Comment ça marche -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-center mb-8">Comment ça marche</h2>
      
      <div class="max-w-4xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Étape 1 -->
          <div class="bg-white rounded-lg shadow-md p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-400 text-white text-xl font-bold mb-4">1</div>
            <h3 class="text-lg font-semibold mb-2">Choisissez votre emplacement</h3>
            <p class="text-gray-600">Sélectionnez l'emplacement qui correspond le mieux à vos objectifs et à votre budget.</p>
          </div>
          
          <!-- Étape 2 -->
          <div class="bg-white rounded-lg shadow-md p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-400 text-white text-xl font-bold mb-4">2</div>
            <h3 class="text-lg font-semibold mb-2">Fournissez votre visuel</h3>
            <p class="text-gray-600">Envoyez-nous votre bannière publicitaire aux dimensions requises et votre URL de destination.</p>
          </div>
          
          <!-- Étape 3 -->
          <div class="bg-white rounded-lg shadow-md p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-400 text-white text-xl font-bold mb-4">3</div>
            <h3 class="text-lg font-semibold mb-2">Suivez vos performances</h3>
            <p class="text-gray-600">Accédez à votre tableau de bord pour suivre les performances de votre campagne en temps réel.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- FAQ -->
    <div>
      <h2 class="text-2xl font-bold text-center mb-8">Questions fréquentes</h2>
      
      <div class="max-w-3xl mx-auto space-y-4">
        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-lg font-semibold mb-2">Quels formats de fichiers acceptez-vous ?</h3>
          <p class="text-gray-600">Nous acceptons les formats JPG, PNG et GIF (statiques ou animés) pour vos bannières publicitaires. La taille du fichier ne doit pas dépasser 250 Ko.</p>
        </div>
        
        <!-- <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-lg font-semibold mb-2">Puis-je cibler une zone géographique spécifique ?</h3>
          <p class="text-gray-600">Oui, nous proposons des options de ciblage géographique par région ou département. Contactez notre équipe commerciale pour en savoir plus sur les options de ciblage avancées.</p>
        </div> -->
        
        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-lg font-semibold mb-2">Comment sont calculées les impressions ?</h3>
          <p class="text-gray-600">Les impressions correspondent au nombre de fois où votre publicité est affichée sur notre site. Une impression est comptabilisée chaque fois qu'un utilisateur charge une page contenant votre bannière.</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-lg font-semibold mb-2">Proposez-vous des remises pour les campagnes longue durée ?</h3>
          <p class="text-gray-600">Oui, nous proposons des tarifs dégressifs pour les campagnes de plus de 90 jours. <a href="/contact" class="text-cyan-600 hover:text-cyan-700 font-black">Contactez-nous pour obtenir un devis personnalisé.</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const error = ref(null);
const publicites = ref([]);

// Format price to 2 decimal places
const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(2) : '0.00';
};

// Obtenir les dimensions de la bannière en fonction de l'emplacement
const getDimensions = (emplacement) => {
  const dimensions = {
    'home_top': '980×250',
    'home_footer': '980×120',
    'inside_footer': '980×120',
    'article_right_top': '300×250',
    'article_right_bottom': '300×250',
    'annonce_sidebar_top': '300×250',
    'annonce_sidebar_bottom': '300×600'
  };

  const emplacementKey = emplacement?.toLowerCase().replace(/[^a-z0-9_]/g, '_') || '';
  return dimensions[emplacementKey] || '300×250';
};

// Obtenir le nom convivial de l'emplacement
const getLocation = (emplacement) => {
  const locations = {
    'home_top': 'Accueil (Haut)',
    'home_footer': 'Accueil (Bas)',
    'inside_footer': 'Pied de page',
    'article_right_top': 'Article (Côté Haut)',
    'article_right_bottom': 'Article (Côté Bas)',
    'annonce_sidebar_top': 'Annonces (Sidebar Haut)',
    'annonce_sidebar_bottom': 'Annonces (Sidebar Bas)'
  };

  const emplacementKey = emplacement?.toLowerCase().replace(/[^a-z0-9_]/g, '_') || '';
  return locations[emplacementKey] || emplacement || 'Emplacement';
};

// Nettoyer et formater la description sans supprimer le HTML
const getFormattedDescription = (pub) => {
  if (!pub.description) {
    return getDefaultDescription(pub.emplacement);
  }
  
  // Retourner la description avec son HTML
  return pub.description || getDefaultDescription(pub.emplacement);
};

// Obtenir une description par défaut si aucune n'est fournie
const getDefaultDescription = (emplacement) => {
  const descriptions = {
    'home_top': 'Emplacement premium en haut de la page d\'accueil, visible par tous les visiteurs du site.',
    'home_footer': 'Bannière en bas de la page d\'accueil, idéal pour augmenter votre visibilité.',
    'inside_footer': 'Présent sur toutes les pages intérieures du site, pour une exposition régulière.',
    'article_right_top': 'Situé en haut de la colonne latérale des pages d\'article, attirant l\'attention des lecteurs.',
    'article_right_bottom': 'Placé en bas de la colonne latérale des articles, pour une visibilité prolongée.',
    'annonce_sidebar_top': 'En haut de la barre latérale des pages d\'annonces, ciblant les acheteurs potentiels.',
    'annonce_sidebar_bottom': 'Grand format en bas de la barre latérale des annonces pour un impact maximal.'
  };

  const emplacementKey = emplacement?.toLowerCase().replace(/[^a-z0-9_]/g, '_') || '';
  return descriptions[emplacementKey] || 'Emplacement publicitaire stratégique pour promouvoir votre marque auprès d\'investisseurs immobiliers.';
};

// Obtenir une estimation des impressions
const getImpressions = (emplacement) => {
  const impressions = {
    'home_top': '790',
    'home_footer': '590',
    'inside_footer': '390',
    'article_right_top': '278',
    'article_right_bottom': '298',
    'annonce_sidebar_top': '310',
    'annonce_sidebar_bottom': '330'
  };

  const emplacementKey = emplacement?.toLowerCase().replace(/[^a-z0-9_]/g, '_') || '';
  return impressions[emplacementKey] || '10 000';
};

// Obtenir une estimation du taux de clic
const getCTR = (emplacement) => {
  const ctrs = {
    'home_top': '2.8',
    'home_footer': '1.9',
    'inside_footer': '1.6',
    'article_right_top': '2.2',
    'article_right_bottom': '1.8',
    'annonce_sidebar_top': '2.4',
    'annonce_sidebar_bottom': '2.1'
  };

  const emplacementKey = emplacement?.toLowerCase().replace(/[^a-z0-9_]/g, '_') || '';
  return ctrs[emplacementKey] || '2.0';
};

// Fonction améliorée pour construire l'URL de l'image
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // Vérifier si le chemin contient déjà une extension
  if (imagePath.match(/\.(jpg|jpeg|png|avif|webp|gif)$/i)) {
    return `/uploads/${imagePath}`;
  }
  
  // Par défaut, essayer sans extension d'abord (Directus pourrait stocker le nom sans extension)
  return `/uploads/${imagePath}`;
};

// Gestion des erreurs d'image améliorée
const handleImageError = (event) => {
  const img = event.target;
  const src = img.src;
  const baseSrc = src.substring(0, src.lastIndexOf('.') > 0 ? src.lastIndexOf('.') : src.length);
  
  // Essayer différentes extensions dans cet ordre
  const extensions = ['.jpg', '.jpeg', '.png', '.avif', '.webp'];
  let currentExtIndex = extensions.findIndex(ext => src.toLowerCase().endsWith(ext.toLowerCase()));
  
  if (currentExtIndex === -1) {
    // Si pas d'extension ou extension non reconnue, essayer jpg
    img.src = `${baseSrc}.jpg`;
  } else if (currentExtIndex < extensions.length - 1) {
    // Essayer l'extension suivante dans la liste
    img.src = `${baseSrc}${extensions[currentExtIndex + 1]}`;
  } else {
    // Si toutes les extensions ont été essayées, charger l'image par défaut
    img.src = '/placeholder.jpg';
    // Empêcher les boucles infinies
    img.onerror = null;
  }
};

onMounted(async () => {
  try {
    // Récupérer tous les produits de type publicité
    const response = await fetch('/api/directus/items/produits?fields=*&filter[status][_eq]=published&filter[type_produit][_eq]=publicite');
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des produits: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Produits publicitaires récupérés:', data);
    
    if (data.data && data.data.length > 0) {
      // Trier les produits par id 
      publicites.value = data.data.sort((a, b) => a.id - b.id);
    } else {
      // Si aucun produit n'est trouvé, créer des exemples de produits
      console.log('Aucun produit publicitaire trouvé, création d\'exemples');
      publicites.value = [
        {
          id: 1,
          nom: 'Pub HOME TOP',
          emplacement: 'home_top',
          prix: 790,
          duree_jours: 90,
          description: 'Emplacement premium en haut de la page d\'accueil, visible par tous les visiteurs du site.'
        },
        {
          id: 2,
          nom: 'Pub HOME FOOTER',
          emplacement: 'home_footer',
          prix: 590,
          duree_jours: 90,
          description: 'Bannière en bas de la page d\'accueil, idéal pour augmenter votre visibilité.'
        },
        {
          id: 3,
          nom: 'Pub INSIDE FOOTER',
          emplacement: 'inside_footer',
          prix: 390,
          duree_jours: 90,
          description: 'Présent sur toutes les pages intérieures du site, pour une exposition régulière.'
        },
        {
          id: 4,
          nom: 'Pub ARTICLE RIGHT TOP',
          emplacement: 'article_right_top',
          prix: 278,
          duree_jours: 90,
          description: 'Situé en haut de la colonne latérale des pages d\'article, attirant l\'attention des lecteurs.'
        },
        {
          id: 5,
          nom: 'Pub ARTICLE RIGHT BOTTOM',
          emplacement: 'article_right_bottom',
          prix: 298,
          duree_jours: 90,
          description: 'Placé en bas de la colonne latérale des articles, pour une visibilité prolongée.'
        },
        {
          id: 6,
          nom: 'Pub ANNONCE SIDEBAR TOP',
          emplacement: 'annonce_sidebar_top',
          prix: 310,
          duree_jours: 90,
          description: 'En haut de la barre latérale des pages d\'annonces, ciblant les acheteurs potentiels.'
        },
        {
          id: 7,
          nom: 'Pub ANNONCE SIDEBAR BOTTOM',
          emplacement: 'annonce_sidebar_bottom',
          prix: 330,
          duree_jours: 90,
          description: 'Grand format en bas de la barre latérale des annonces pour un impact maximal.'
        }
      ];
    }
  } catch (err) {
    console.error('Erreur complète:', err);
    error.value = `Impossible de charger les emplacements publicitaires: ${err.message}`;
    
    // En cas d'erreur, afficher des exemples de produits
    publicites.value = [
      {
        id: 1,
        nom: 'Pub HOME TOP',
        emplacement: 'home_top',
        prix: 790,
        duree_jours: 90,
        description: 'Emplacement premium en haut de la page d\'accueil, visible par tous les visiteurs du site.'
      },
      {
        id: 2,
        nom: 'Pub HOME FOOTER',
        emplacement: 'home_footer',
        prix: 590,
        duree_jours: 90,
        description: 'Bannière en bas de la page d\'accueil, idéal pour augmenter votre visibilité.'
      },
      {
        id: 3,
        nom: 'Pub INSIDE FOOTER',
        emplacement: 'inside_footer',
        prix: 390,
        duree_jours: 90,
        description: 'Présent sur toutes les pages intérieures du site, pour une exposition régulière.'
      },
      {
        id: 4,
        nom: 'Pub ARTICLE RIGHT TOP',
        emplacement: 'article_right_top',
        prix: 278,
        duree_jours: 90,
        description: 'Situé en haut de la colonne latérale des pages d\'article, attirant l\'attention des lecteurs.'
      },
      {
        id: 5,
        nom: 'Pub ARTICLE RIGHT BOTTOM',
        emplacement: 'article_right_bottom',
        prix: 298,
        duree_jours: 90,
        description: 'Placé en bas de la colonne latérale des articles, pour une visibilité prolongée.'
      },
      {
        id: 6,
        nom: 'Pub ANNONCE SIDEBAR TOP',
        emplacement: 'annonce_sidebar_top',
        prix: 310,
        duree_jours: 90,
        description: 'En haut de la barre latérale des pages d\'annonces, ciblant les acheteurs potentiels.'
      },
      {
        id: 7,
        nom: 'Pub ANNONCE SIDEBAR BOTTOM',
        emplacement: 'annonce_sidebar_bottom',
        prix: 330,
        duree_jours: 90,
        description: 'Grand format en bas de la barre latérale des annonces pour un impact maximal.'
      }
    ];
  } finally {
    loading.value = false;
  }
});
</script>

<script>
export default {
  head() {
    return {
      title: 'Espaces publicitaires - Ma Maison Rapporte',
      meta: [
        { hid: 'description', name: 'description', content: 'Découvrez nos espaces publicitaires pour atteindre une audience ciblée d\'investisseurs et d\'acheteurs immobiliers.' }
      ]
    }
  }
}
</script>