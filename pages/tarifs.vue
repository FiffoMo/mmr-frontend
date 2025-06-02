<!-- pages/tarifs.vue (partie template) -->
<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-center mb-2">Nos formules d'annonces</h1>
    <p class="text-xl text-center text-gray-600 mb-12">Choisissez l'offre qui correspond à vos besoins</p>
    
    <!-- Plans de tarification -->
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
    
    <div v-else-if="forfaits.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
      <div 
        v-for="forfait in forfaits" 
        :key="forfait.id"
        class="bg-white rounded-lg shadow-lg flex flex-col h-full overflow-hidden"
        :class="{ 'border-2 border-amber-500 transform md:scale-105 shadow-xl': forfait.recommended }"
      >
        <div v-if="forfait.recommended" class="p-1 bg-amber-500 text-white text-center text-sm font-medium">
          RECOMMANDÉ
        </div>
        
        <div class="p-6 bg-slate-100 pb-14">
          <h2 class="text-2xl font-bold mb-1 text-center">{{ forfait.nom }}</h2>
          <p class="text-gray-600 mb-4 text-center">{{ forfait.tagline || 'Pour vos besoins immobiliers' }}</p>
          <div class="text-3xl font-bold text-center">
            {{ formatPrice(forfait.prix) }} 
          </div>
        </div>
        
        <div class="p-6 flex-grow flex flex-col">
          <div class="border-b border-slate-300 py-4 mb-6 flex-grow">
            <div v-if="forfait.description" class="mb-4 text-gray-600">
              <div v-html="forfait.description"></div>
            </div>
              
            <ul class="space-y-3">
              <li 
                v-for="(feature, index) in getFeatures(forfait)" 
                :key="index"
                class="flex items-start"
              >
                <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-600">{{ feature }}</span>
              </li>
            </ul>
          </div>
          
          <NuxtLink 
            :to="`/acheter-forfait/${forfait.id}`" 
            class="block w-full py-2 px-4 text-white text-center rounded transition-colors mt-auto"
            :class="forfait.recommended ? 'bg-amber-500 hover:bg-amber-600' : 'bg-cyan-500 hover:bg-cyan-600'"
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
    
    <!-- Mise en avant -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-center mb-4">Mise en avant</h2>
      <p class="text-xl text-center text-gray-600 mb-12">Augmentez la visibilité de vos annonces avec notre option premium</p>
      
      <div v-if="loadingMiseEnAvant" class="flex justify-center">
        <div class="animate-pulse space-y-8 w-full max-w-5xl">
          <div class="bg-white rounded-lg shadow-md p-6 h-64"></div>
        </div>
      </div>
      
      <div v-else-if="errorMiseEnAvant" class="bg-red-100 p-4 rounded-lg text-red-700 max-w-3xl mx-auto">
        <p>{{ errorMiseEnAvant }}</p>
      </div>
      
      <div v-else-if="miseEnAvantOptions.length > 0" class="flex justify-center">
        <div 
          v-for="option in miseEnAvantOptions" 
          :key="option.id"
          class="bg-white rounded-lg shadow-md overflow-hidden border-2 border-amber-200 max-w-3xl"
        >
          <div class="p-1 bg-amber-500 text-white text-center text-sm font-medium">
            OPTION PREMIUM
          </div>
          
          <div class="p-6 bg-gray-50 text-center">
            <h2 class="text-2xl font-bold mb-1">{{ option.nom }}</h2>
            <p class="text-gray-600 mb-4">Visibilité optimale pour vos annonces</p>
            <div class="text-3xl font-bold">
              {{ formatPrice(option.prix) }} 
              <span class="text-base font-normal text-gray-500">
                / {{ option.duree_jours }} jours
              </span>
            </div>
          </div>
          
          <div class="p-6">
            <ul class="space-y-3 mb-6 max-w-md mx-auto text-left">
              <li class="flex items-start">
                <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>En première page du site "Coup de Coeur !"</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>En début de la catégorie choisie</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Affichage aléatoire dans la sidebar</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Visibilité garantie pendant {{ option.duree_jours }} jours</span>
              </li>
            </ul>
            
            <div class="flex gap-3 max-w-md mx-auto">
              <NuxtLink 
                :to="`/acheter-forfait/${option.id}`" 
                class="w-full flex items-center justify-center py-2 px-4 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
              >
                Acheter cette option
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="flex justify-center">
        <div class="max-w-3xl bg-white rounded-lg shadow-md overflow-hidden border-2 border-amber-200">
          <div class="p-1 bg-amber-500 text-white text-center text-sm font-medium">
            MISE EN AVANT
          </div>
          
          <div class="p-6 bg-gray-50 text-center">
            <h2 class="text-2xl font-bold mb-1">Mise en avant</h2>
            <p class="text-gray-600 mb-4">Visibilité optimale pour vos annonces</p>
            <div class="text-3xl font-bold">
              20,00 € 
              <span class="text-base font-normal text-gray-500">
                / 20 jours
              </span>
            </div>
          </div>
          
          <div class="p-6">
            <ul class="space-y-3 mb-6 max-w-md mx-auto text-left">
              <li class="flex items-start">
                <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>En première page du site "Coup de Coeur !"</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>En début de la catégorie choisie</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Affichage aléatoire dans la sidebar</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Visibilité garantie pendant 20 jours</span>
              </li>
            </ul>
            
            <div class="flex gap-3 max-w-md mx-auto">
              <NuxtLink 
                to="/acheter-forfait/mise-en-avant" 
                class="flex-1 flex items-center justify-center py-2 px-4 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
              >
                Acheter cette option
              </NuxtLink>
              <NuxtLink 
                to="/mes-annonces" 
                class="flex-1 block py-2 px-4 border border-amber-500 text-amber-600 text-center rounded hover:bg-amber-50 transition-colors"
              >
                Ajouter à mes annonces
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- FAQ -->
    <div>
      <h2 class="text-2xl font-bold text-center mb-8">Questions fréquentes</h2>
      
      <div class="max-w-3xl mx-auto space-y-4">
        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-lg font-semibold mb-2">Comment le calcul de rentabilité est-il effectué ?</h3>
          <p class="text-gray-600">Le calcul de rentabilité locative est basé sur une estimation des loyers moyens dans la zone géographique du bien, en tenant compte de sa surface, de son état et de ses caractéristiques. La rentabilité est exprimée en pourcentage annuel brut (loyer annuel / prix d'achat).</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-lg font-semibold mb-2">Puis-je modifier mon annonce après publication ?</h3>
          <p class="text-gray-600">Oui, vous pouvez modifier les détails de votre annonce à tout moment pendant sa durée de publication, sans frais supplémentaires.</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-lg font-semibold mb-2">Comment fonctionne l'option de mise en avant ?</h3>
          <p class="text-gray-600">L'option de mise en avant place votre annonce en première page du site comme "Coup de Cœur" et en début de sa catégorie. Elle apparaît également de manière aléatoire dans la barre latérale de la section Annonces, offrant ainsi une visibilité maximale pour attirer l'attention des visiteurs.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const error = ref(null);
const forfaits = ref([]);
const debugInfo = ref('');

const loadingMiseEnAvant = ref(true);
const errorMiseEnAvant = ref(null);
const miseEnAvantOptions = ref([]);

// Format price to currency format
const formatPrice = (price) => {
  if (!price && price !== 0) return 'Gratuit';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Extract features from product data
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
  if (nom.includes('basic') || nom.includes('essentiel')) return defaultFeatures.basic;
  if (nom.includes('dixit')) return defaultFeatures.dixit; // Retirer 'premium' de cette condition
  if (nom.includes('premium') || nom.includes('professionnel')) return defaultFeatures.premium;  
  return ['Forfait personnalisé'];
};

onMounted(async () => {
  try {
    // Récupérer tous les produits de type annonce
    console.log('Récupération des produits annonces...');
    const response = await fetch('/api/directus/items/produits?fields=*&filter[status][_eq]=published');
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des produits: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Produits récupérés:', data);
    
    // Ajouter info de débogage
    debugInfo.value = `Total produits: ${data.data?.length || 0}`;
    
    if (data.data && data.data.length > 0) {
      // Filtrer pour trouver les forfaits Basic, Dixit et Premium
      const filteredForfaits = data.data.filter(produit => {
        if (!produit.nom) return false;
        const nom = produit.nom.toLowerCase();
        return (nom.includes('forfait') && (nom.includes('basic') || nom.includes('dixit') || nom.includes('premium')));
      });
      
      // Ajouter info de débogage
      debugInfo.value += ` | Forfaits trouvés: ${filteredForfaits.length}`;
      
      if (filteredForfaits.length > 0) {
        // Déterminer le forfait recommandé (premium)
        const processedForfaits = filteredForfaits.map(forfait => {
          return {
            ...forfait,
            recommended: forfait.nom.toLowerCase().includes('dixit')
          };
        });
// Trier les forfaits dans l'ordre : Basic, Dixit, Premium
processedForfaits.sort((a, b) => {
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
        
        forfaits.value = processedForfaits;
        console.log('Forfaits filtrés et triés:', forfaits.value);
      } else {
        // Si aucun forfait n'est trouvé, créer des forfaits factices
        console.log('Aucun forfait trouvé, création de forfaits factices');
        forfaits.value = [
          {
            id: 'basic',
            nom: 'Forfait BASIC',
            prix: 19.90,
            tagline: 'Pour les petites annonces',
            description: 'Pour débuter avec l\'essentiel',
            recommended: false
          },
          {
            id: 'premium',
            nom: 'Forfait PREMIUM',
            prix: 39.90,
            tagline: 'Pour une visibilité optimale',
            description: 'Notre meilleure offre qualité-prix',
            recommended: true
          },
          {
            id: 'professionnel',
            nom: 'Forfait PROFESSIONNEL',
            prix: 79.90,
            tagline: 'Pour les agences immobilières',
            description: 'Pour une visibilité maximale',
            recommended: false
          }
        ];
      }
    } else {
      throw new Error('Aucun produit n\'a été trouvé');
    }
  } catch (err) {
    console.error('Erreur complète:', err);
    error.value = `Impossible de charger les forfaits: ${err.message}`;
    
    // Si une erreur se produit, afficher des forfaits par défaut
    forfaits.value = [
      {
        id: 'basic',
        nom: 'Forfait BASIC',
        prix: 19.90,
        tagline: 'Pour les petites annonces',
        description: 'Pour débuter avec l\'essentiel',
        recommended: false
      },
      {
        id: 'premium',
        nom: 'Forfait PREMIUM',
        prix: 39.90,
        tagline: 'Pour une visibilité optimale',
        description: 'Notre meilleure offre qualité-prix',
        recommended: true
      },
      {
        id: 'professionnel',
        nom: 'Forfait PROFESSIONNEL',
        prix: 79.90,
        tagline: 'Pour les agences immobilières',
        description: 'Pour une visibilité maximale',
        recommended: false
      }
    ];
  } finally {
    loading.value = false;
  }
  
  // Charger les options de mise en avant
  try {
    loadingMiseEnAvant.value = true;
    
    // Récupérer les produits de type mise en avant
    const miseEnAvantResponse = await fetch('/api/directus/items/produits?fields=*&filter[status][_eq]=published&filter[type_produit][_eq]=mise_en_avant');
    
    if (!miseEnAvantResponse.ok) {
      throw new Error(`Erreur lors de la récupération des options de mise en avant: ${miseEnAvantResponse.status}`);
    }
    
    const miseEnAvantData = await miseEnAvantResponse.json();
    
    if (miseEnAvantData.data && miseEnAvantData.data.length > 0) {
      miseEnAvantOptions.value = miseEnAvantData.data;
    }
  } catch (err) {
    console.error('Erreur lors du chargement des options de mise en avant:', err);
    errorMiseEnAvant.value = `Impossible de charger les options de mise en avant: ${err.message}`;
  } finally {
    loadingMiseEnAvant.value = false;
  }
});
</script>

<script>
export default {
  head() {
    return {
      title: 'Tarifs des annonces - Ma Maison Rapporte',
      meta: [
        { hid: 'description', name: 'description', content: 'Découvrez nos offres d\'annonces immobilières avec calcul de rentabilité locative. Forfaits adaptés à tous les besoins.' }
      ]
    }
  }
}
</script>



