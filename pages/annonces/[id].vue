<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <p class="text-gray-500">Chargement de l'annonce...</p>
    </div>
    
    <div v-else-if="error" class="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      <p>{{ error }}</p>
    </div>
    
    <template v-else-if="annonce">
      <!-- Fil d'Ariane -->
      <div class="text-sm text-gray-500 mb-6">
        <NuxtLink to="/" class="hover:text-cyan-600">Accueil</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink to="/annonces" class="hover:text-cyan-600">Annonces</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink 
          :to="`/annonces/${annonce.categorie_annonce}`" 
          class="hover:text-cyan-600"
        >
          {{ getCategoryLabel(annonce.categorie_annonce) }}
        </NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700">{{ annonce.Titre }}</span>
      </div>
      
      <!-- Titre et badge -->
      <div class="flex items-start justify-between mb-6">
        <h1 class="text-3xl font-bold">{{ annonce.Titre }}</h1>
        <div 
          v-if="isCoupDeCoeur(annonce.id)"
          class="bg-amber-600 text-white px-3 py-1 rounded font-medium"
        >
          Coup de cœur
        </div>
      </div>
      
      <!-- Galerie d'images et informations principales -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <!-- Galerie d'images (2/3 de l'écran) -->
        <div class="lg:col-span-2">
          <div class="bg-gray-200 h-96 rounded-lg mb-4">
            <img 
              v-if="annonce.image_principale" 
              :src="`http://localhost:8055/assets/${annonce.image_principale}`"
              :alt="annonce.Titre" 
              class="w-full h-full object-cover rounded-lg"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="text-gray-400">Pas d'image</span>
            </div>
          </div>
          
          <!-- Miniatures -->
          <div class="grid grid-cols-6 gap-2">
            <div 
              v-for="i in 6" 
              :key="i"
              class="h-20 bg-gray-200 rounded cursor-pointer"
            >
              <img 
                v-if="annonce[`image_${i+1}`]" 
                :src="`http://localhost:8055/assets/${annonce[`image_${i+1}`]}`"
                :alt="`Image ${i+1}`" 
                class="w-full h-full object-cover rounded"
              />
              <div v-else class="w-full h-full"></div>
            </div>
          </div>
        </div>
        
        <!-- Informations principales (1/3 de l'écran) -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="text-3xl font-bold text-cyan-600 mb-4">
            {{ formatPrice(annonce.prix_vente) }}
          </div>
          
          <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2">Localisation</h3>
            <p>{{ annonce.localisation }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 class="font-semibold text-gray-700 mb-1">Surface</h3>
              <p>{{ annonce.surface_habitable }} m²</p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-700 mb-1">Terrain</h3>
              <p>{{ annonce.terrain_m2 ? `${annonce.terrain_m2} m²` : 'Non spécifié' }}</p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-700 mb-1">Pièces</h3>
              <p>{{ annonce.pieces }}</p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-700 mb-1">Chambres</h3>
              <p>{{ annonce.chambres }}</p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-700 mb-1">Étage</h3>
              <p>{{ annonce.etage || 'Non spécifié' }}</p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-700 mb-1">DPE / GES</h3>
              <p>{{ annonce.DPE || '?' }} / {{ annonce.GES || '?' }}</p>
            </div>
          </div>
          
          <!-- Informations de rentabilité (à enrichir selon vos besoins) -->
          <div class="bg-amber-100 p-4 rounded-lg mb-6">
            <h3 class="font-semibold text-amber-800 mb-2">Potentiel locatif</h3>
            
            <div v-if="annonce.prix_location">
              <p class="font-medium">Loyer mensuel estimé: {{ formatPrice(annonce.prix_location) }}</p>
              <p class="mt-1">Rendement brut: {{ calculateYield(annonce.prix_vente, annonce.prix_location) }}%</p>
            </div>
            <div v-else>
              <p>Contactez-nous pour une estimation du potentiel locatif de ce bien.</p>
            </div>
          </div>
          
          <!-- Bouton de contact -->
          <button class="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-md font-medium">
            Contacter le vendeur
          </button>
        </div>
      </div>
      
      <!-- Description détaillée -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-10">
        <h2 class="text-2xl font-bold mb-4">Description</h2>
        <div v-html="annonce.Description" class="prose max-w-none"></div>
      </div>
      
      <!-- Partie locative (si applicable) -->
      <div v-if="annonce.description_location" class="bg-white rounded-lg shadow-md p-6 mb-10">
        <h2 class="text-2xl font-bold mb-4">Partie locative</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h3 class="font-semibold text-gray-700 mb-1">Surface locative</h3>
            <p>{{ annonce.surface_location || 'Non spécifié' }} m²</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 mb-1">Nombre de pièces</h3>
            <p>{{ annonce.pieces_location || 'Non spécifié' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 mb-1">Nombre de chambres</h3>
            <p>{{ annonce.chambres_location || 'Non spécifié' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 mb-1">Loyer mensuel</h3>
            <p>{{ annonce.prix_location ? formatPrice(annonce.prix_location) : 'Non spécifié' }}</p>
          </div>
        </div>
        <div v-html="annonce.description_location" class="prose max-w-none"></div>
        
        <!-- Images de la partie locative -->
        <div v-if="hasLocationImages" class="mt-6">
          <h3 class="font-semibold text-gray-700 mb-3">Photos de la partie locative</h3>
          <div class="grid grid-cols-4 gap-2">
            <div 
              v-for="i in 5" 
              :key="`loc-${i}`"
              v-if="annonce[`image_location_${i}`]"
              class="h-24 bg-gray-200 rounded"
            >
              <img 
                :src="`http://localhost:8055/assets/${annonce[`image_location_${i}`]}`"
                :alt="`Image location ${i}`" 
                class="w-full h-full object-cover rounded"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Équipements -->
      <div v-if="hasEquipements" class="bg-white rounded-lg shadow-md p-6 mb-10">
        <h2 class="text-2xl font-bold mb-4">Équipements</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div v-for="(equipement, index) in annonce.equipements" :key="index" class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ formatEquipement(equipement) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Informations supplémentaires -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold mb-4">Informations supplémentaires</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold text-gray-700 mb-1">État général</h3>
            <p>{{ formatEtat(annonce.etat_general) || 'Non spécifié' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 mb-1">Type de chauffage</h3>
            <p>{{ annonce.chauffage || 'Non spécifié' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 mb-1">Exposition</h3>
            <p>{{ annonce.exposition || 'Non spécifiée' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 mb-1">Taxe foncière</h3>
            <p>{{ annonce.taxe_fonciere ? `${annonce.taxe_fonciere} €/an` : 'Non spécifiée' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 mb-1">Charges mensuelles</h3>
            <p>{{ annonce.charge_mensuelles_euros ? `${annonce.charge_mensuelles_euros} €/mois` : 'Non spécifiées' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 mb-1">Date de publication</h3>
            <p>{{ formatDate(annonce.date_created) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAnnonces } from '~/composables/useAnnonces';

// Récupérer l'ID depuis l'URL
const route = useRoute();
const id = route.params.id;

// Logs pour débogage
console.log("Page détail - ID de l'annonce:", id);

// État local pour suivre le chargement des données
const { annonceDetail, loading, error, fetchAnnonceById, isCoupDeCoeur } = useAnnonces();

// Récupérer les données de l'annonce
onMounted(async () => {
  await fetchAnnonceById(id);
  console.log("Données de l'annonce chargées:", annonceDetail.value);
});

// Annonce courante 
// const annonce = computed(() => annonceDetail.value);

const testData = {
  id: 9,
  Titre: "Test Annonce Injectée",
  prix_vente: 450000,
  localisation: "Lyon, France",
  surface_habitable: 120,
  pieces: 4,
  chambres: 2,
  Description: "<p>Ceci est une annonce de test pour déboguer l'affichage.</p>",
  categorie_annonce: "appartements"
};

const annonce = computed(() => annonceDetail.value || testData);

// Vérifier si l'annonce a des images pour la partie locative
const hasLocationImages = computed(() => {
  if (!annonce.value) return false;
  
  return ['image_location_1', 'image_location_2', 'image_location_3', 'image_location_4', 'image_location_5']
    .some(key => !!annonce.value[key]);
});

// Vérifier si l'annonce a des équipements
const hasEquipements = computed(() => {
  return annonce.value?.equipements && annonce.value.equipements.length > 0;
});

// Formatter le prix
const formatPrice = (price) => {
  if (!price) return 'Prix non défini';
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price);
};

// Calculer le rendement brut
const calculateYield = (price, monthlyRent) => {
  if (!price || !monthlyRent || price === 0) return '0';
  const annualRent = monthlyRent * 12;
  const yieldPercent = (annualRent / price) * 100;
  return yieldPercent.toFixed(2);
};

// Obtenir le libellé d'une catégorie
const getCategoryLabel = (category) => {
  const categories = {
    'maisons': 'Maison',
    'appartements': 'Appartement',
    'immeubles': 'Immeuble',
    'construction': 'Construction',
    'maisons_dhote': 'Maison d\'hôte'
  };
  
  return categories[category] || category || 'Non catégorisé';
};

// Formatter l'état général
const formatEtat = (etat) => {
  const etats = {
    'neuf': 'Neuf',
    'renove': 'Rénové',
    'bon': 'Bon état',
    'moyen': 'État moyen',
    'travaux': 'À rénover'
  };
  
  return etats[etat] || etat;
};

// Formatter un équipement
const formatEquipement = (equipement) => {
  const equipements = {
    'cave': 'Cave',
    'cheminee': 'Cheminée',
    'cuisine_amenagee': 'Cuisine aménagée',
    'garage': 'Garage',
    'internet': 'Internet',
    'jardin': 'Jardin',
    'parking': 'Parking',
    'pas_de_vis_a_vis': 'Sans vis-à-vis',
    'sdb': 'Salle de bain',
    'terrasse': 'Terrasse',
    'veranda': 'Véranda',
    'wc_separes': 'WC séparés',
    'buanderie': 'Buanderie',
    'salle_d_eau': 'Salle d\'eau',
    'rangements': 'Rangements',
    'piscine': 'Piscine',
    'balcon': 'Balcon',
    'panneaux_solaires': 'Panneaux solaires',
    'cellier': 'Cellier',
    'meuble': 'Meublé',
    'compteur_independant': 'Compteur indépendant'
  };
  
  return equipements[equipement] || equipement;
};

// Formatter une date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
};
</script>