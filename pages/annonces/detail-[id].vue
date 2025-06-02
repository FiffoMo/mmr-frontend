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
            <LocationMap :location="annonce.localisation || ''" />
          </div>
          
          <h3 class="text-xl font-semibold mb-4">Nous contacter</h3>
          
          <div class="bg-amber-100 p-4 rounded-lg mb-6">
            <p>Contactez-nous pour une estimation du potentiel locatif de ce bien.</p>
          </div>
          
          <!-- Informations du vendeur -->
          <div class="mb-6 border-t pt-4">
            <h4 class="font-semibold text-gray-700 mb-3">Vendeur</h4>
            <div class="flex items-center mb-3">
              <div class="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-3">
                <img 
                  v-if="proprietaireAvatar" 
                  :src="proprietaireAvatar"
                  :alt="`Avatar de ${proprietaireName}`"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <p class="font-medium">{{ proprietaireName }}</p>
                <p v-if="annonce.proprietaire?.company" class="text-sm text-gray-600">
                  {{ annonce.proprietaire.company }}
                </p>
                <a 
                  v-if="annonce.proprietaire?.website_url" 
                  :href="annonce.proprietaire.website_url" 
                  target="_blank"
                  class="text-cyan-600 hover:underline text-sm"
                >
                  {{ formatWebsiteUrl(annonce.proprietaire.website_url) }}
                </a>
              </div>
            </div>
            
            <!-- Informations de contact (selon les préférences de confidentialité) -->
            <div>
              <p class="font-medium mb-2">Comment nous contacter:</p>
              <div class="space-y-1">
                <!-- Email (si pas masqué) -->
                <p v-if="!annonce.proprietaire?.hide_email && annonce.proprietaire?.email">
                  <span class="inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.44a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ annonce.proprietaire.email }}
                  </span>
                </p>
                
                <!-- Téléphone (si pas masqué) -->
                <p v-if="!annonce.proprietaire?.hide_phone && annonce.proprietaire?.phone">
                  <span class="inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {{ annonce.proprietaire.phone }}
                  </span>
                </p>
                
                <!-- Instructions de contact personnalisées -->
                <p v-if="annonce.proprietaire?.contact_instructions" class="text-sm text-gray-600 mt-2">
                  {{ annonce.proprietaire.contact_instructions }}
                </p>
                
                <!-- Message par défaut si tout est masqué -->
                <p v-if="isContactInfoHidden" class="text-sm text-gray-600">
                  Utilisez le bouton "Contacter le vendeur" ci-dessous pour entrer en contact.
                </p>
              </div>
            </div>
          </div>
          <!-- AJOUTER LE BOUTON ICI -->
          <button 
            @click="openContactForm"
            class="w-full bg-cyan-600 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors font-medium flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.44a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contacter le vendeur
          </button>

          <p class="text-sm text-gray-500 text-center mt-2">
            Vos coordonnées seront transmises au vendeur
          </p>
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
    <!-- Modal du formulaire de contact -->
    <Teleport to="body">
      <div v-if="showContactForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-md w-full relative">
          <!-- Bouton de fermeture -->
          <button 
            @click="closeContactForm" 
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Fermer"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <!-- Formulaire de contact -->
          <ContactFormAnnonce 
            :annonce-id="id"
            :annonce-title="annonce.Titre || ''"
            :proprietaire-id="annonce.proprietaire?.id || ''"
            @close="closeContactForm"
            @message-sent="handleMessageSent"
          />
        </div>
      </div>
    </Teleport>

    <!-- Notification de succès (optionnelle, car déjà gérée dans le composant) -->
    <div 
      v-if="contactSuccess" 
      class="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50"
    >
      Message envoyé avec succès !
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import LocationMap from '~/components/common/LocationMap.vue';
import { useAnnonces } from '~/composables/useAnnonces';
import ContactFormAnnonce from '~/components/common/ContactFormAnnonce.vue';

// Déclarer que cette page utilise le layout "annonces"
definePageMeta({
  layout: 'annonces'
});

// Récupérer l'ID depuis l'URL
const route = useRoute();
const id = route.params.id;

// Utiliser le composable annonces
const { fetchAnnonceById, loading, error } = useAnnonces();

// État local
const annonce = ref({});
const currentImage = ref('');
const currentLocationImage = ref('');
const showContactForm = ref(false);
const contactSuccess = ref(false);

// Ouvrir le formulaire de contact
const openContactForm = () => {
  showContactForm.value = true;
};

// Fermer le formulaire de contact
const closeContactForm = () => {
  showContactForm.value = false;
};

// Gérer l'envoi de message
const handleMessageSent = (success) => {
  contactSuccess.value = success;
  if (success) {
    // Fermer le formulaire après un succès
    setTimeout(() => {
      closeContactForm();
      // Réinitialiser après fermeture
      setTimeout(() => {
        contactSuccess.value = false;
      }, 500);
    }, 3000);
  }
};

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

// Nom complet du propriétaire
const proprietaireName = computed(() => {
  if (!annonce.value?.proprietaire) return 'Propriétaire non disponible';
  
  const firstName = annonce.value.proprietaire.first_name || '';
  const lastName = annonce.value.proprietaire.last_name || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName || lastName) {
    return firstName || lastName;
  } else if (annonce.value.proprietaire.company) {
    return annonce.value.proprietaire.company;
  } else {
    return 'Propriétaire';
  }
});

// URL de l'avatar du propriétaire
const proprietaireAvatar = computed(() => {
  if (annonce.value?.proprietaire?.avatar?.id) {
    return `http://localhost:8055/assets/${annonce.value.proprietaire.avatar.id}`;
  }
  return null;
});

// Vérifier si toutes les infos de contact sont masquées
const isContactInfoHidden = computed(() => {
  const prop = annonce.value?.proprietaire;
  if (!prop) return true;
  
  const emailHidden = prop.hide_email || !prop.email;
  const phoneHidden = prop.hide_phone || !prop.phone;
  const noInstructions = !prop.contact_instructions;
  
  return emailHidden && phoneHidden && noInstructions;
});

// Formatter l'URL du site web pour l'affichage
const formatWebsiteUrl = (url) => {
  if (!url) return '';
  
  // Enlever le protocole pour l'affichage
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

// Charger les données via notre composable
onMounted(async () => {
  try {
    const result = await fetchAnnonceById(id);
    
    if (result.success && result.annonce) {
      annonce.value = result.annonce;
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
    // Pas besoin de définir error.value car il est déjà géré par le composable
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