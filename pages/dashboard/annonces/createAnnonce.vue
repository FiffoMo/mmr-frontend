<!-- pages/dashboard/annonces/createAnnonce.vue -->
<template>
  <div class="bg-gray-100 min-h-screen pb-12">
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Publier une nouvelle annonce</h1>
        <NuxtLink 
          to="/dashboard/annonces" 
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Retour
        </NuxtLink>
      </div>

      <div v-if="noForfaits" class="bg-amber-100 border border-amber-300 text-amber-700 p-4 rounded-md mb-6">
        <div class="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="font-medium">Vous n'avez aucun forfait actif avec des annonces disponibles.</p>
            <NuxtLink to="/tarifs" class="text-cyan-600 hover:underline mt-2 inline-block">
              Acheter un forfait pour publier des annonces
            </NuxtLink>
          </div>
        </div>
      </div>

      <form v-if="!noForfaits" @submit.prevent="submitForm" class="bg-white shadow-md rounded-lg p-6 mb-6">
        <!-- Sélection du forfait -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4 border-b pb-2">Choisir un forfait</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="forfait in forfaitsDisponibles" 
              :key="forfait.id" 
              class="border p-4 rounded-md cursor-pointer"
              :class="{ 'border-cyan-500 bg-cyan-50': selectedForfait === forfait.id }"
              @click="selectedForfait = forfait.id"
            >
              <div class="flex justify-between mb-2">
                <h3 class="font-medium">{{ forfait.nom }}</h3>
                <span class="text-green-600 font-medium">
                  {{ forfait.annonces_restantes }} annonce(s) restante(s)
                </span>
              </div>
              <p class="text-gray-500 text-sm">
                Expire le {{ formatDate(forfait.date_fin) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Informations principales -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4 border-b pb-2">Informations principales</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <!-- Titre -->
            <div class="col-span-full">
              <label for="titre" class="block text-gray-700 font-medium mb-1">Titre de l'annonce *</label>
              <input 
                type="text" 
                id="titre" 
                v-model="formData.Titre" 
                class="w-full p-2 border border-gray-300 rounded-md" 
                required
                maxlength="255"
              >
            </div>

            <!-- Prix de vente et Catégorie -->
            <div>
              <label for="prix_vente" class="block text-gray-700 font-medium mb-1">Prix de vente *</label>
              <div class="flex items-center">
                <input 
                  type="number" 
                  id="prix_vente" 
                  v-model.number="formData.prix_vente" 
                  class="w-full p-2 border border-gray-300 rounded-md" 
                  required
                  min="0"
                  step="0.01"
                >
                <span class="ml-2">€</span>
              </div>
            </div>

            <div>
              <label for="categorie" class="block text-gray-700 font-medium mb-1">Catégorie *</label>
              <select 
                id="categorie" 
                v-model="formData.categorie_annonce" 
                class="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="appartement">Appartement</option>
                <option value="maison">Maison</option>
                <option value="immeuble">Immeuble</option>
                <option value="terrain">Terrain</option>
                <option value="parking">Parking</option>
                <option value="bureau">Bureau</option>
                <option value="commerce">Commerce</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <!-- Localisation -->
            <div class="col-span-full">
              <label for="localisation" class="block text-gray-700 font-medium mb-1">Localisation *</label>
              <input 
                type="text" 
                id="localisation" 
                v-model="formData.localisation" 
                class="w-full p-2 border border-gray-300 rounded-md" 
                required
                maxlength="255"
                placeholder="Ex: 12 rue de la Paix, 75002 Paris"
              >
            </div>

            <!-- Surface, Pièces, Chambres -->
            <div>
              <label for="surface" class="block text-gray-700 font-medium mb-1">Surface habitable (m²) *</label>
              <div class="flex items-center">
                <input 
                  type="number" 
                  id="surface" 
                  v-model.number="formData.surface_habitable" 
                  class="w-full p-2 border border-gray-300 rounded-md" 
                  required
                  min="0"
                  step="0.01"
                >
                <span class="ml-2">m²</span>
              </div>
            </div>

            <div>
              <label for="terrain" class="block text-gray-700 font-medium mb-1">Terrain (m²)</label>
              <div class="flex items-center">
                <input 
                  type="number" 
                  id="terrain" 
                  v-model.number="formData.terrain_m2" 
                  class="w-full p-2 border border-gray-300 rounded-md" 
                  min="0"
                  step="0.01"
                >
                <span class="ml-2">m²</span>
              </div>
            </div>

            <div>
              <label for="pieces" class="block text-gray-700 font-medium mb-1">Nombre de pièces *</label>
              <input 
                type="number" 
                id="pieces" 
                v-model.number="formData.pieces" 
                class="w-full p-2 border border-gray-300 rounded-md" 
                required
                min="1"
                max="100"
              >
            </div>

            <div>
              <label for="chambres" class="block text-gray-700 font-medium mb-1">Nombre de chambres *</label>
              <input 
                type="number" 
                id="chambres" 
                v-model.number="formData.chambres" 
                class="w-full p-2 border border-gray-300 rounded-md" 
                required
                min="0"
                max="50"
              >
            </div>
          </div>
        </div>

        <!-- État et caractéristiques du bien -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4 border-b pb-2">Caractéristiques du bien</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <!-- État général -->
            <div>
              <label for="etat" class="block text-gray-700 font-medium mb-1">État général *</label>
              <select 
                id="etat" 
                v-model="formData.etat_general" 
                class="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Sélectionner un état</option>
                <option value="neuf">Neuf</option>
                <option value="renove">Rénové</option>
                <option value="bon">Bon état</option>
                <option value="moyen">État moyen</option>
                <option value="travaux">À rénover</option>
              </select>
            </div>

            <!-- Chauffage -->
            <div>
              <label for="chauffage" class="block text-gray-700 font-medium mb-1">Type de chauffage</label>
              <input 
                type="text" 
                id="chauffage" 
                v-model="formData.chauffage" 
                class="w-full p-2 border border-gray-300 rounded-md" 
                maxlength="255"
                placeholder="Ex: Électrique, Gaz, Central"
              >
            </div>

            <!-- Exposition -->
            <div>
              <label for="exposition" class="block text-gray-700 font-medium mb-1">Exposition</label>
              <select 
                id="exposition" 
                v-model="formData.exposition" 
                class="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Sélectionner une exposition</option>
                <option value="nord">Nord</option>
                <option value="sud">Sud</option>
                <option value="est">Est</option>
                <option value="ouest">Ouest</option>
                <option value="nord-est">Nord-Est</option>
                <option value="nord-ouest">Nord-Ouest</option>
                <option value="sud-est">Sud-Est</option>
                <option value="sud-ouest">Sud-Ouest</option>
              </select>
            </div>

            <!-- Étage -->
            <div>
              <label for="etage" class="block text-gray-700 font-medium mb-1">Étage</label>
              <input 
                type="text" 
                id="etage" 
                v-model="formData.etage" 
                class="w-full p-2 border border-gray-300 rounded-md" 
                maxlength="255"
                placeholder="Ex: RDC, 1er, 2ème avec ascenseur"
              >
            </div>

            <!-- Taxe foncière -->
            <div>
              <label for="taxe" class="block text-gray-700 font-medium mb-1">Taxe foncière (€/an)</label>
              <div class="flex items-center">
                <input 
                  type="number" 
                  id="taxe" 
                  v-model.number="formData.taxe_fonciere" 
                  class="w-full p-2 border border-gray-300 rounded-md" 
                  min="0"
                >
                <span class="ml-2">€/an</span>
              </div>
            </div>

            <!-- Charges mensuelles -->
            <div>
              <label for="charges" class="block text-gray-700 font-medium mb-1">Charges mensuelles (€/mois)</label>
              <div class="flex items-center">
                <input 
                  type="text" 
                  id="charges" 
                  v-model="formData.charge_mensuelles_euros" 
                  class="w-full p-2 border border-gray-300 rounded-md" 
                  maxlength="255"
                  placeholder="Ex: 100"
                >
                <span class="ml-2">€/mois</span>
              </div>
            </div>

            <!-- DPE et GES -->
            <div>
              <label for="dpe" class="block text-gray-700 font-medium mb-1">DPE (Performance énergétique)</label>
              <select 
                id="dpe" 
                v-model="formData.DPE" 
                class="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Non spécifié</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
              </select>
            </div>

            <div>
              <label for="ges" class="block text-gray-700 font-medium mb-1">GES (Émission de gaz)</label>
              <select 
                id="ges" 
                v-model="formData.GES" 
                class="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Non spécifié</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Équipements -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4 border-b pb-2">Équipements</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div v-for="(label, value) in equipementsOptions" :key="value" class="flex items-center">
              <input 
                type="checkbox" 
                :id="value" 
                :value="value" 
                v-model="equipementsSelected"
                class="mr-2"
              >
              <label :for="value" class="text-gray-700">{{ label }}</label>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4 border-b pb-2">Description détaillée</h2>
          <div>
            <label for="description" class="block text-gray-700 font-medium mb-1">Description complète *</label>
            <textarea 
              id="description" 
              v-model="formData.Description" 
              class="w-full p-2 border border-gray-300 rounded-md" 
              rows="8"
              required
              placeholder="Décrivez votre bien immobilier en détail..."
            ></textarea>
          </div>
        </div>

        <!-- Partie locative (optionnelle) -->
        <div class="mb-6">
          <div class="border-b pb-2 mb-4 flex justify-between items-center">
            <h2 class="text-lg font-semibold">Partie locative (optionnel)</h2>
            <button 
              type="button" 
              @click="showLocativeSection = !showLocativeSection" 
              class="text-cyan-600 hover:text-cyan-800"
            >
              {{ showLocativeSection ? 'Masquer' : 'Afficher' }}
            </button>
          </div>
          
          <div v-if="showLocativeSection" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <!-- Prix location -->
            <div>
              <label for="prix_location" class="block text-gray-700 font-medium mb-1">Loyer mensuel (€)</label>
              <div class="flex items-center">
                <input 
                  type="number" 
                  id="prix_location" 
                  v-model.number="formData.prix_location" 
                  class="w-full p-2 border border-gray-300 rounded-md" 
                  min="0"
                  step="0.01"
                >
                <span class="ml-2">€/mois</span>
              </div>
            </div>

            <!-- Surface location -->
            <div>
              <label for="surface_location" class="block text-gray-700 font-medium mb-1">Surface locative (m²)</label>
              <div class="flex items-center">
                <input 
                  type="number" 
                  id="surface_location" 
                  v-model.number="formData.surface_location" 
                  class="w-full p-2 border border-gray-300 rounded-md" 
                  min="0"
                  step="0.01"
                >
                <span class="ml-2">m²</span>
              </div>
            </div>

            <!-- Pièces et chambres location -->
            <div>
              <label for="pieces_location" class="block text-gray-700 font-medium mb-1">Pièces (partie locative)</label>
              <input 
                type="number" 
                id="pieces_location" 
                v-model.number="formData.pieces_location" 
                class="w-full p-2 border border-gray-300 rounded-md" 
                min="1"
              >
            </div>

            <div>
              <label for="chambres_location" class="block text-gray-700 font-medium mb-1">Chambres (partie locative)</label>
              <input 
                type="number" 
                id="chambres_location" 
                v-model.number="formData.chambres_location" 
                class="w-full p-2 border border-gray-300 rounded-md" 
                min="0"
              >
            </div>

            <!-- Description location -->
            <div class="col-span-full">
              <label for="description_location" class="block text-gray-700 font-medium mb-1">Description de la partie locative</label>
              <textarea 
                id="description_location" 
                v-model="formData.description_location" 
                class="w-full p-2 border border-gray-300 rounded-md" 
                rows="4"
                placeholder="Décrivez la partie locative..."
              ></textarea>
            </div>

            <!-- Équipements location -->
            <div class="col-span-full">
              <label class="block text-gray-700 font-medium mb-2">Équipements de la partie locative</label>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div v-for="(label, value) in equipementsOptions" :key="`loc-${value}`" class="flex items-center">
                  <input 
                    type="checkbox" 
                    :id="`loc-${value}`" 
                    :value="value" 
                    v-model="equipementsLocationSelected"
                    class="mr-2"
                  >
                  <label :for="`loc-${value}`" class="text-gray-700">{{ label }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Photos -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4 border-b pb-2">Photos</h2>
          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">Photo principale *</label>
            <FileUpload 
              v-model="files.image_principale" 
              field="image_principale"
              :required="true"
              @update="updateFile('image_principale', $event)"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div v-for="i in 9" :key="`photo-${i+1}`">
              <label class="block text-gray-700 font-medium mb-2">Photo {{ i+1 }}</label>
              <FileUpload 
                v-model="files[`image_${i+1}`]" 
                :field="`image_${i+1}`"
                @update="updateFile(`image_${i+1}`, $event)"
              />
            </div>
          </div>

          <!-- Photos partie locative -->
          <div v-if="showLocativeSection">
            <h3 class="font-medium text-gray-700 mb-3 mt-6">Photos de la partie locative</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="i in 5" :key="`photo-loc-${i}`">
                <label class="block text-gray-700 mb-2">Photo locative {{ i }}</label>
                <FileUpload 
                  v-model="files[`image_location_${i}`]" 
                  :field="`image_location_${i}`"
                  @update="updateFile(`image_location_${i}`, $event)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Conditions et envoi -->
        <div class="border-t pt-6">
          <div class="flex items-start mb-6">
            <input 
              type="checkbox" 
              id="conditions" 
              v-model="formData.conditions_acceptees"
              required
              class="mt-1 mr-2"
            >
            <label for="conditions" class="text-gray-700">
              J'accepte les conditions générales et je certifie que les informations fournies sont exactes *
            </label>
          </div>

          <div class="flex justify-end">
            <button 
              type="submit" 
              class="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publication en cours...
              </span>
              <span v-else>Publier l'annonce</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineComponent, h, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/useAuthStore';
import { useDirectusSDK } from '~/composables/useDirectusSDK';
import FileUpload from '~/components/common/FileUpload.vue';

// Route, Auth, SDK
const router = useRouter();
const authStore = useAuthStore();
const directusSDK = useDirectusSDK();

// État du composant
const loading = ref(false);
const error = ref(null);
const noForfaits = ref(false);
const showLocativeSection = ref(false);
const selectedForfait = ref(null);
const forfaitsDisponibles = ref([]);

// Données du formulaire
const formData = reactive({
  Titre: '',
  Description: '',
  prix_vente: null,
  localisation: '',
  chambres: null,
  pieces: null,
  surface_habitable: null,
  etage: '',
  DPE: '',
  GES: '',
  terrain_m2: null,
  charge_mensuelles_euros: '',
  etat_general: '',
  chauffage: '',
  taxe_fonciere: null,
  exposition: '',
  prix_au_m_carre: null,
  prix_location: null,
  surface_location: null,
  pieces_location: null,
  chambres_location: null,
  description_location: '',
  conditions_acceptees: false,
  categorie_annonce: '',
  status: 'pending' // L'annonce doit être validée par un admin
});

// Fichiers à uploader
const files = reactive({
  image_principale: null,
  image_2: null,
  image_3: null,
  image_4: null,
  image_5: null,
  image_6: null,
  image_7: null,
  image_8: null,
  image_9: null,
  image_10: null,
  image_location_1: null,
  image_location_2: null,
  image_location_3: null,
  image_location_4: null,
  image_location_5: null
});

// Options pour les équipements
const equipementsOptions = {
  cave: 'Cave',
  cheminee: 'Cheminée',
  cuisine_amenagee: 'Cuisine aménagée',
  garage: 'Garage',
  internet: 'Internet',
  jardin: 'Jardin',
  parking: 'Parking',
  pas_de_vis_a_vis: 'Sans vis-à-vis',
  sdb: 'Salle de bain',
  terrasse: 'Terrasse',
  veranda: 'Véranda',
  wc_separes: 'WC séparés',
  buanderie: 'Buanderie',
  salle_d_eau: 'Salle d\'eau',
  rangements: 'Rangements',
  piscine: 'Piscine',
  balcon: 'Balcon',
  panneaux_solaires: 'Panneaux solaires',
  cellier: 'Cellier',
  meuble: 'Meublé',
  compteur_independant: 'Compteur indépendant'
};

// Équipements sélectionnés
const equipementsSelected = ref([]);
const equipementsLocationSelected = ref([]);

// Formater une date pour l'affichage
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Mettre à jour un fichier
const updateFile = (field, data) => {
  files[field] = data.file;
};

// Charger les forfaits disponibles
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    noForfaits.value = true;
    return;
  }
  
  try {
    // Récupérer les forfaits de l'utilisateur
    const result = await directusSDK.getItems('user_forfaits', {
      filter: {
        client_id: { _eq: authStore.user.id },
        date_fin: { _gt: new Date().toISOString() },
        annonces_restantes: { _gt: 0 }
      },
      fields: ['id', 'forfait.nom', 'date_fin', 'annonces_restantes']
    });
    
    if (result && result.length > 0) {
      forfaitsDisponibles.value = result.map(item => ({
        id: item.id,
        nom: item.forfait?.nom || 'Forfait',
        date_fin: item.date_fin,
        annonces_restantes: item.annonces_restantes
      }));
      
      if (forfaitsDisponibles.value.length > 0) {
        selectedForfait.value = forfaitsDisponibles.value[0].id;
      }
    } else {
      noForfaits.value = true;
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des forfaits:', err);
    error.value = err.message;
    noForfaits.value = true;
  }
});

// Soumettre le formulaire
const submitForm = async () => {
  if (!selectedForfait.value) {
    alert('Veuillez sélectionner un forfait');
    return;
  }
  
  loading.value = true;
  
  try {
    // Préparer les données pour l'annonce
    const annonceData = { ...formData };
    
    // Ajouter les champs client_id et commande_id
    annonceData.client_id = authStore.user.id;
    annonceData.commande_id = selectedForfait.value;
    
    // Ajouter les équipements en JSON
    annonceData.equipements = JSON.stringify(equipementsSelected.value);
    if (equipementsLocationSelected.value.length > 0) {
      annonceData.equipements_location = JSON.stringify(equipementsLocationSelected.value);
    }
    
    // Calculer le prix au m²
    if (annonceData.prix_vente && annonceData.surface_habitable) {
      annonceData.prix_au_m_carre = annonceData.prix_vente / annonceData.surface_habitable;
    }
    
    // Étape 1: Créer l'annonce
    const createdAnnonce = await directusSDK.createItem('Annonces', annonceData);
    
    if (!createdAnnonce || !createdAnnonce.id) {
      throw new Error('Erreur lors de la création de l\'annonce');
    }
    
    // Étape 2: Télécharger les images et les associer à l'annonce
    const uploadPromises = [];
    
    for (const [field, file] of Object.entries(files)) {
      if (file) {
        // Créer un FormData pour télécharger le fichier
        const formData = new FormData();
        formData.append('file', file);
        
        // Télécharger le fichier
        try {
          const uploadedFile = await directusSDK.uploadFile(formData);
          
          if (uploadedFile && uploadedFile.id) {
            // Associer l'image à l'annonce
            uploadPromises.push(
              directusSDK.updateItem('Annonces', createdAnnonce.id, {
                [field]: uploadedFile.id
              })
            );
          }
        } catch (uploadErr) {
          console.error(`Erreur lors du téléchargement de ${field}:`, uploadErr);
        }
      }
    }
    
    // Attendre que toutes les images soient téléchargées et associées
    await Promise.all(uploadPromises);
    
    // Étape 3: Mettre à jour le forfait (décrémenter annonces_restantes)
    const forfait = forfaitsDisponibles.value.find(f => f.id === selectedForfait.value);
    if (forfait) {
      await directusSDK.updateItem('user_forfaits', selectedForfait.value, {
        annonces_restantes: forfait.annonces_restantes - 1
      });
    }
    
    // Redirection vers le tableau de bord des annonces
    router.push('/dashboard/annonces');
    
  } catch (err) {
    console.error('Erreur lors de la soumission du formulaire:', err);
    error.value = err.message || 'Une erreur est survenue lors de la création de l\'annonce';
    alert(`Erreur: ${error.value}`);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Styles spécifiques à cette page si nécessaire */
</style>