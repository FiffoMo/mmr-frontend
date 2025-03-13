<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ annonce.Titre }}</h1>
    
    <div v-if="loading" class="bg-white p-4 rounded shadow">
      Chargement en cours...
    </div>
    
    <div v-else-if="error" class="bg-red-100 p-4 rounded border border-red-400 text-red-700">
      Erreur: {{ error }}
    </div>
    
    <div v-else>
      <!-- Galerie d'images PRINCIPALE -->
      <div class="mb-8">
        <div class="bg-gray-200 h-65 rounded-lg mb-4">
          <img 
            v-if="currentImage" 
            :src="`http://localhost:8055/assets/${currentImage}`"
            :alt="annonce.Titre" 
            class="w-full h-full object-cover rounded-lg"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="text-gray-400">Pas d'image</span>
          </div>
        </div>
        
        <!-- Miniatures -->
        <div class="grid grid-cols-5 md:grid-cols-10 gap-2">
          <div 
            class="h-30 bg-gray-200 rounded cursor-pointer"
            @click="selectImage('image_principale')"
            :class="{'border-2 border-cyan-500': currentImage === annonce.image_principale}"
          >
            <img 
              v-if="annonce.image_principale" 
              :src="`http://localhost:8055/assets/${annonce.image_principale}`"
              alt="Image principale" 
              class="w-full h-full object-cover rounded"
            />
            <div v-else class="w-full h-full"></div>
          </div>
          
          <div 
            v-for="i in 10" 
            :key="i"
            class="h-30 bg-gray-200 rounded cursor-pointer"
            @click="selectImage(`image_${i}`)"
            :class="{'border-2 border-cyan-500': currentImage === annonce[`image_${i}`]}"
          >
            <img 
              v-if="annonce[`image_${i}`]" 
              :src="`http://localhost:8055/assets/${annonce[`image_${i}`]}`"
              :alt="`Image ${i}`" 
              class="w-full h-full object-cover rounded"
            />
            <div v-else class="w-full h-full"></div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Informations principales (2/3) -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <!-- Prix -->
          <div class="mb-6">
            <h2 class="text-3xl font-bold text-cyan-600">
              {{ formatPrice(annonce.prix_vente) }}
            </h2>
            <p v-if="annonce.prix_au_m_carre" class="text-gray-500">
              {{ formatPrice(annonce.prix_au_m_carre) }}/m²
            </p>
          </div>
          
          <!-- DPE / GES Étiquettes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- DPE -->
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold text-gray-700 mb-2">Performance énergétique</h3>
              <div class="flex items-center">
                <div class="mr-4">
                  <div 
                    class="w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl"
                    :class="getDPEColorClass(annonce.DPE)"
                  >
                    {{ annonce.DPE ? annonce.DPE.toUpperCase() : '?' }}
                  </div>
                </div>
                <div class="flex flex-col h-8">
                  <div class="h-2 w-24 bg-green-500 rounded-l"></div>
                  <div class="h-2 w-24 bg-lime-500"></div>
                  <div class="h-2 w-24 bg-yellow-400"></div>
                  <div class="h-2 w-24 bg-orange-400"></div>
                  <div class="h-2 w-24 bg-red-500 rounded-r"></div>
                </div>
              </div>
            </div>
            
            <!-- GES -->
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold text-gray-700 mb-2">Émissions de gaz à effet de serre</h3>
              <div class="flex items-center">
                <div class="mr-4">
                  <div 
                    class="w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl"
                    :class="getGESColorClass(annonce.GES)"
                  >
                    {{ annonce.GES ? annonce.GES.toUpperCase() : '?' }}
                  </div>
                </div>
                <div class="flex flex-col h-8">
                  <div class="h-2 w-24 bg-green-500 rounded-l"></div>
                  <div class="h-2 w-24 bg-lime-500"></div>
                  <div class="h-2 w-24 bg-yellow-400"></div>
                  <div class="h-2 w-24 bg-orange-400"></div>
                  <div class="h-2 w-24 bg-red-500 rounded-r"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Caractéristiques principales -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <h3 class="font-semibold text-gray-700">Surface</h3>
              <p>{{ annonce.surface_habitable || "?" }} m²</p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-700">Pièces</h3>
              <p>{{ annonce.pieces || "?" }}</p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-700">Chambres</h3>
              <p>{{ annonce.chambres || "?" }}</p>
            </div>
            <div v-if="annonce.terrain_m2">
              <h3 class="font-semibold text-gray-700">Terrain</h3>
              <p>{{ annonce.terrain_m2 }} m²</p>
            </div>
          </div>
          
          <!-- Description -->
          <div v-if="annonce.Description" class="mb-6">
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Description</h3>
            <div v-html="annonce.Description" class="prose max-w-none"></div>
          </div>
          
          <!-- Caractéristiques techniques -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div v-if="annonce.etat_general">
              <h3 class="font-semibold text-gray-700">État général</h3>
              <p>{{ formatEtat(annonce.etat_general) }}</p>
            </div>
            <div v-if="annonce.chauffage">
              <h3 class="font-semibold text-gray-700">Chauffage</h3>
              <p>{{ annonce.chauffage }}</p>
            </div>
            <div v-if="annonce.exposition">
              <h3 class="font-semibold text-gray-700">Exposition</h3>
              <p>{{ annonce.exposition }}</p>
            </div>
            <div v-if="annonce.etage">
              <h3 class="font-semibold text-gray-700">Étage</h3>
              <p>{{ annonce.etage }}</p>
            </div>
            <div v-if="annonce.taxe_fonciere">
              <h3 class="font-semibold text-gray-700">Taxe foncière</h3>
              <p>{{ annonce.taxe_fonciere }} €/an</p>
            </div>
            <div v-if="annonce.charge_mensuelles_euros">
              <h3 class="font-semibold text-gray-700">Charges mensuelles</h3>
              <p>{{ annonce.charge_mensuelles_euros }} €/mois</p>
            </div>
          </div>
          
          <!-- Équipements -->
          <div v-if="hasEquipements" class="mb-6">
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Équipements</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div v-for="(equip, index) in equipements" :key="index" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>{{ formatEquipement(equip) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Informations de contact (1/3) -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <!-- Localisation avec carte -->
          <div class="mb-6">
            <h3 class="text-xl font-semibold mb-2">Localisation</h3>
            <p class="mb-3">{{ annonce.localisation }}</p>
            <LocationMap :location="annonce.localisation" />
          </div>
          
          <h3 class="text-xl font-semibold mb-4">Nous contacter</h3>
          
          <div v-if="annonce.prix_location" class="bg-amber-100 p-4 rounded-lg mb-6">
            <div class="mb-2">
              <p class="font-medium">Loyer mensuel estimé:</p>
              <p class="text-xl font-bold">{{ formatPrice(annonce.prix_location) }}</p>
            </div>
            <p class="mt-1">Rendement brut: {{ calculateYield(annonce.prix_vente, annonce.prix_location) }}%</p>
          </div>
          <div v-else class="bg-amber-100 p-4 rounded-lg mb-6">
            <p>Contactez-nous pour une estimation du potentiel locatif de ce bien.</p>
          </div>
          
          <!-- Informations du vendeur -->
          <div class="mb-6 border-t pt-4">
            <h4 class="font-semibold text-gray-700 mb-3">Vendeur</h4>
            <div class="flex items-center mb-3">
              <div class="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-3">
                <!-- Placeholder pour le logo -->
                <div class="w-full h-full flex items-center justify-center text-gray-400">Logo</div>
              </div>
              <div>
                <p class="font-medium">Maison Ma Maison Rapporte</p>
                <a href="http://www.mmr.fr" class="text-cyan-600 hover:underline">www.mmr.fr</a>
              </div>
            </div>
            <div>
              <p class="font-medium">Comment nous contacter:</p>
              <p>info@mmr.fr | 01 23 45 67 89</p>
            </div>
          </div>
          
          <div class="mb-4">
            <h4 class="font-semibold text-gray-700 mb-2">Date de publication</h4>
            <p>{{ formatDate(annonce.date_created) }}</p>
          </div>
          
          <!-- Bouton de contact -->
          <button class="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-md font-medium mt-4">
            Contacter le vendeur
          </button>
        </div>
      </div>
      
      <!-- Partie locative (si applicable) -->
      <div v-if="annonce.description_location || hasLocationImages" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-bold mb-4">Partie locative</h2>
        
        <!-- Layout en deux colonnes pour la partie locative -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
          <!-- Galerie d'images LOCATIVE (2/3 de la largeur) -->
          <div class="lg:col-span-2" v-if="hasLocationImages">
            <div class="bg-gray-200 h-65 rounded-lg mb-4">
              <img 
                v-if="currentLocationImage" 
                :src="`http://localhost:8055/assets/${currentLocationImage}`"
                alt="Image locative" 
                class="w-full h-full object-cover rounded-lg"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-gray-400">Sélectionnez une image</span>
              </div>
            </div>
            
            <div class="grid grid-cols-5 gap-2">
              <div 
                v-for="i in 5" 
                :key="`loc-${i}`"
                class="h-30 bg-gray-200 rounded cursor-pointer"
                @click="selectLocationImage(`image_location_${i}`)"
                :class="{'border-2 border-cyan-500': currentLocationImage === annonce[`image_location_${i}`]}"
              >
                <img 
                  v-if="annonce[`image_location_${i}`]" 
                  :src="`http://localhost:8055/assets/${annonce[`image_location_${i}`]}`"
                  :alt="`Image location ${i}`" 
                  class="w-full h-full object-cover rounded"
                />
                <div v-else class="w-full h-full"></div>
              </div>
            </div>
          </div>
          
          <!-- Description partie locative (1/3 de la largeur) -->
          <div v-if="annonce.description_location" class="prose max-w-none">
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Description</h3>
            <div v-html="annonce.description_location"></div>
          </div>
        </div>
        
        <!-- Caractéristiques locatives en 4 colonnes -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-4">
          <!-- Colonne 1: Pièces et chambres -->
          <div>
            <div v-if="annonce.pieces_location" class="mb-3">
              <h3 class="font-semibold text-gray-700">Nombre de pièces</h3>
              <p>{{ annonce.pieces_location }}</p>
            </div>
            <div v-if="annonce.chambres_location">
              <h3 class="font-semibold text-gray-700">Nombre de chambres</h3>
              <p>{{ annonce.chambres_location }}</p>
            </div>
          </div>
          
          <!-- Colonne 2: Surface et loyer -->
          <div>
            <div v-if="annonce.surface_location" class="mb-3">
              <h3 class="font-semibold text-gray-700">Surface locative</h3>
              <p>{{ annonce.surface_location }} m²</p>
            </div>
            <div v-if="annonce.prix_location">
              <h3 class="font-semibold text-gray-700">Loyer mensuel</h3>
              <p>{{ formatPrice(annonce.prix_location) }}</p>
            </div>
          </div>
          
          <!-- Colonnes 3 et 4: Équipements de la partie locative -->
          <div class="md:col-span-2" v-if="hasLocEquipements">
            <h3 class="font-semibold text-gray-700 mb-2">Équipements</h3>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="(equip, index) in locEquipements" :key="index" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>{{ formatEquipement(equip) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import LocationMap from '~/components/common/LocationMap.vue';

// Récupérer l'ID depuis l'URL
const route = useRoute();
const id = route.params.id;

// État local
const annonce = ref({});
const loading = ref(true);
const error = ref(null);
const currentImage = ref('');
const currentLocationImage = ref('');

// Sélectionner une image principale
const selectImage = (imageKey) => {
  if (annonce.value && annonce.value[imageKey]) {
    currentImage.value = annonce.value[imageKey];
  }
};

// Sélectionner une image locative
const selectLocationImage = (imageKey) => {
  if (annonce.value && annonce.value[imageKey]) {
    currentLocationImage.value = annonce.value[imageKey];
  }
};

// Déterminer la classe de couleur pour le DPE
const getDPEColorClass = (dpe) => {
  if (!dpe) return 'bg-gray-300 text-white';
  
  const classes = {
    'A': 'bg-green-500 text-white',
    'B': 'bg-lime-500 text-white',
    'C': 'bg-yellow-400 text-black',
    'D': 'bg-yellow-500 text-black',
    'E': 'bg-orange-400 text-white',
    'F': 'bg-orange-600 text-white',
    'G': 'bg-red-500 text-white'
  };
  
  return classes[dpe.toUpperCase()] || 'bg-gray-300 text-white';
};

// Déterminer la classe de couleur pour le GES
const getGESColorClass = (ges) => {
  if (!ges) return 'bg-gray-300 text-white';
  
  const classes = {
    'A': 'bg-green-500 text-white',
    'B': 'bg-lime-500 text-white',
    'C': 'bg-yellow-400 text-black',
    'D': 'bg-yellow-500 text-black',
    'E': 'bg-orange-400 text-white',
    'F': 'bg-orange-600 text-white',
    'G': 'bg-red-500 text-white'
  };
  
  return classes[ges.toUpperCase()] || 'bg-gray-300 text-white';
};

// Extraire les équipements du JSON
const equipements = computed(() => {
  if (!annonce.value || !annonce.value.equipements) return [];
  
  try {
    if (typeof annonce.value.equipements === 'string') {
      return JSON.parse(annonce.value.equipements);
    }
    return annonce.value.equipements;
  } catch (e) {
    console.error('Erreur de parsing des équipements:', e);
    return [];
  }
});

// Vérifier si des équipements existent
const hasEquipements = computed(() => {
  return equipements.value && equipements.value.length > 0;
});

// Extraire les équipements de la partie locative
const locEquipements = computed(() => {
  if (!annonce.value || !annonce.value.equipements_location) return [];
  
  try {
    if (typeof annonce.value.equipements_location === 'string') {
      return JSON.parse(annonce.value.equipements_location);
    }
    return annonce.value.equipements_location;
  } catch (e) {
    console.error('Erreur de parsing des équipements location:', e);
    return [];
  }
});

// Vérifier si des équipements de location existent
const hasLocEquipements = computed(() => {
  return locEquipements.value && locEquipements.value.length > 0;
});

// Vérifier si l'annonce a des images pour la partie locative
const hasLocationImages = computed(() => {
  if (!annonce.value) return false;
  
  for (let i = 1; i <= 5; i++) {
    if (annonce.value[`image_location_${i}`]) return true;
  }
  return false;
});

// Charger les données via un proxy
onMounted(async () => {
  try {
    const response = await fetch(`/api/annonces/${id}`);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.annonce) {
      annonce.value = data.annonce;
      // Définir l'image principale comme image courante
      if (annonce.value.image_principale) {
        currentImage.value = annonce.value.image_principale;
      } else if (annonce.value.image_2) {
        currentImage.value = annonce.value.image_2;
      }
      
      // Définir la première image locative si disponible
      for (let i = 1; i <= 5; i++) {
        if (annonce.value[`image_location_${i}`]) {
          currentLocationImage.value = annonce.value[`image_location_${i}`];
          break;
        }
      }
    } else {
      throw new Error("Format de données invalide");
    }
  } catch (err) {
    console.error('Erreur:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
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