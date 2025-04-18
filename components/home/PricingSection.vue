<!-- components/home/PricingSection.vue -->
<template>
  <section class="py-16 bg-gray-200">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Nos forfaits</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Choisissez le forfait qui correspond le mieux à vos besoins pour mettre en valeur votre bien immobilier.
        </p>
      </div>
      
      <div v-if="loading" class="flex justify-center">
        <div class="animate-pulse space-y-8 w-full max-w-5xl">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="i in 3" :key="i" class="bg-white rounded-lg shadow-md p-6 h-96"></div>
          </div>
        </div>
      </div>
      
      <div v-else-if="error" class="bg-red-100 p-4 rounded-lg text-red-700 max-w-3xl mx-auto">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="forfaits.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div 
          v-for="forfait in forfaits" 
          :key="forfait.id"
          class="bg-white rounded-lg shadow-md flex flex-col h-full"
          :class="{ 'border-4 border-amber-500 relative': forfait.nom && forfait.nom.toLowerCase().includes('dixit') }"
        >
          <!-- Badge "le plus populaire" pour le forfait DIXIT -->
          <div 
            v-if="forfait.nom && forfait.nom.toLowerCase().includes('dixit')" 
            class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold"
          >
            Le plus populaire
          </div>
          
          <!-- Contenu principal -->
          <div class="p-6 flex-grow">
            <h3 class="text-xl font-bold mb-2 text-center">{{ forfait.nom || 'Forfait' }}</h3>
            
            <div class="text-center my-6">
              <span class="text-4xl font-bold text-gray-800">{{ formatPrice(forfait.prix) }}</span>
            </div>
            
            <div class="border-t border-b border-gray-200 py-4 mb-6">
              <div v-if="forfait.description" class="mb-4 text-gray-600">
                <div v-html="forfait.description"></div>
              </div>
              
              <ul class="space-y-3">
                <li 
                  v-for="(feature, index) in getFeatures(forfait)" 
                  :key="index"
                  class="flex items-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-600">{{ feature }}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Bouton en bas de la carte - MODIFICATION ICI -->
          <div class="px-6 pb-6 mt-auto">
            <NuxtLink
              :to="forfait.lien_achat || `/acheter-forfait/${forfait.id}`"
              class="block w-full text-center py-3 px-4 rounded-md font-medium transition-colors"
              :class="forfait.nom && forfait.nom.toLowerCase().includes('dixit') 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-cyan-500 hover:bg-cyan-600 text-white'"
            >
              Choisir ce forfait
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center text-gray-500">
        Aucun forfait disponible pour le moment.
        <p v-if="debugInfo" class="mt-2 text-xs text-gray-400">
          {{ debugInfo }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDirectusSDK } from '~/composables/useDirectusSDK';

const directusSDK = useDirectusSDK();
const forfaits = ref([]);
const loading = ref(true);
const error = ref(null);
const debugInfo = ref('');

onMounted(async () => {
  // Configuration du timeout
  const timeout = setTimeout(() => {
    if (loading.value) {
      loading.value = false;
      error.value = "La requête a pris trop de temps à s'exécuter";
    }
  }, 5000);
  
  try {
    loading.value = true;
    
    console.log('Récupération des produits...');
    debugInfo.value = 'Tentative de récupération via SDK...';
    
    // Approche 1: Tentative avec le SDK
    try {
      const produits = await directusSDK.getItems('produits', {
        fields: '*',
        filter: {
          status: {
            _eq: 'published'
          }
        }
      });
      
      if (produits && produits.length > 0) {
        debugInfo.value = `Produits récupérés via SDK: ${produits.length}`;
        processProducts(produits);
        return;
      } else {
        debugInfo.value += ' | SDK retourne vide';
      }
    } catch (sdkError) {
      console.warn('Échec de récupération des produits via SDK:', sdkError);
      debugInfo.value += ` | Erreur SDK: ${sdkError.message}`;
    }
    
    // Approche 2: Fetch direct URL encodée correctement
    debugInfo.value += ' | Tentative via fetch direct...';
    
    const response = await fetch('/api/directus/items/produits?fields=*&filter[status][_eq]=published');
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    debugInfo.value += ` | Fetch réussi: ${data.data?.length || 0} produits`;
    
    if (data.data && data.data.length > 0) {
      processProducts(data.data);
    } else {
      debugInfo.value += ' | Aucun produit trouvé dans la réponse';
      // Utiliser des forfaits par défaut
      useFallbackProducts();
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des forfaits:', err);
    error.value = `Impossible de charger les forfaits: ${err.message}`;
    debugInfo.value += ` | Erreur finale: ${err.message}`;
    
    // Si une erreur se produit, afficher des forfaits par défaut
    useFallbackProducts();
  } finally {
    clearTimeout(timeout);
    loading.value = false;
  }
});

// Traiter les produits récupérés de l'API
const processProducts = (products) => {
  // Filtrer pour trouver les forfaits Basic, Dixit et Premium
  const filteredForfaits = products.filter(produit => {
    if (!produit.nom) return false;
    const nom = produit.nom.toLowerCase();
    return (nom.includes('forfait') && (nom.includes('basic') || nom.includes('dixit') || nom.includes('premium')));
  });
  
  debugInfo.value += ` | Forfaits trouvés: ${filteredForfaits.length}`;
  
  if (filteredForfaits.length > 0) {
    // Trier les forfaits dans l'ordre : Basic, Dixit, Premium
    filteredForfaits.sort((a, b) => {
      const order = { 'basic': 1, 'dixit': 2, 'premium': 3 };
      const nameA = (a.nom || '').toLowerCase();
      const nameB = (b.nom || '').toLowerCase();
      
      // Déterminer l'ordre pour chaque forfait
      let orderA = 99, orderB = 99;
      for (const [key, value] of Object.entries(order)) {
        if (nameA.includes(key)) orderA = value;
        if (nameB.includes(key)) orderB = value;
      }
      
      return orderA - orderB;
    });
    
    forfaits.value = filteredForfaits;
    console.log('Forfaits filtrés et triés:', forfaits.value);
  } else {
    debugInfo.value += ' | Utilisation des forfaits par défaut';
    useFallbackProducts();
  }
};

// Utiliser des forfaits par défaut
const useFallbackProducts = () => {
  console.log('Utilisation des forfaits par défaut');
  forfaits.value = [
    {
      id: 'basic',
      nom: 'Forfait BASIC',
      prix: 14.90,
      description: 'Pour débuter avec l\'essentiel'
    },
    {
      id: 'dixit',
      nom: 'Forfait DIXIT',
      prix: 69.90,
      description: 'Notre meilleure offre qualité-prix'
    },
    {
      id: 'premium',
      nom: 'Forfait PREMIUM',
      prix: 99.90,
      description: 'Pour une visibilité maximale'
    }
  ];
};

// Formatter le prix
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Gratuit';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Extraire les caractéristiques du forfait
const getFeatures = (forfait) => {
  // Si le forfait a un champ features qui est un tableau ou une chaîne JSON
  if (forfait.features) {
    try {
      if (typeof forfait.features === 'string') {
        return JSON.parse(forfait.features);
      }
      if (Array.isArray(forfait.features)) {
        return forfait.features;
      }
    } catch (err) {
      console.error('Erreur lors du parsing des caractéristiques:', err);
    }
  }
  
  // Déterminer le type de forfait d'après le nom
  const nom = (forfait.nom || '').toLowerCase();
  
  // Repli sur des caractéristiques basées sur le type de forfait
  const defaultFeatures = {
    'basic': [
      '1 annonce',
      'Visible pendant 60 jours',
      'Jusqu\'à 15 photos',
      'Affichage du potentiel locatif',
      'Renouvellement facile'
    ],
    'dixit': [
      '10 annonces',
      'Visible pendant 60 jours',
      'Jusqu\'à 15 photos',
      'Affichage du potentiel locatif',
      'Renouvellement facile'
    ],
    'premium': [
      '25 annonces',
      'Visible pendant 60 jours',
      'Jusqu\'à 15 photos',
      'Affichage du potentiel locatif',
      'Renouvellement facile'
    ]
  };
  
  if (nom.includes('basic')) return defaultFeatures.basic;
  if (nom.includes('dixit')) return defaultFeatures.dixit;
  if (nom.includes('premium')) return defaultFeatures.premium;
  
  return ['Forfait personnalisé'];
};
</script>