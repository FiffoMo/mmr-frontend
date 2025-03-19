<template>
    <div class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Gestion des publicités</h2>
        <button 
          @click="showNewAdForm = true"
          class="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-700"
        >
          + Nouvelle publicité
        </button>
      </div>
      
      <!-- Chargement -->
      <div v-if="loading" class="py-10 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <p class="mt-2 text-gray-500">Chargement des publicités...</p>
      </div>
      
      <!-- Aucune publicité -->
      <div v-else-if="advertisements.length === 0" class="bg-gray-100 p-8 rounded-lg text-center">
        <p class="text-gray-500">Vous n'avez pas encore de publicités actives.</p>
        <button 
          @click="showNewAdForm = true" 
          class="mt-2 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-700"
        >
          Créer votre première publicité
        </button>
      </div>
      
      <!-- Liste des publicités -->
      <div v-else class="space-y-4">
        <div v-for="ad in advertisements" :key="ad.id" class="bg-gray-100 p-4 rounded-lg">
          <div class="flex flex-col md:flex-row">
            <img :src="ad.image" alt="Publicité" class="w-32 h-16 object-contain rounded-md" />
            <div class="md:ml-4 mt-2 md:mt-0 flex-grow">
              <div class="flex justify-between">
                <h3 class="font-medium">{{ ad.title }}</h3>
                <span 
                  :class="[
                    'text-xs px-2 py-1 rounded-full',
                    ad.status === 'active' ? 'bg-green-100 text-green-800' : 
                    ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ 
                    ad.status === 'active' ? 'Active' : 
                    ad.status === 'pending' ? 'En attente' : 
                    'Expirée' 
                  }}
                </span>
              </div>
              <p class="text-sm text-gray-600">
                Position: {{ ad.position }} - Format: {{ ad.format }}
              </p>
              <div class="mt-2 flex flex-wrap gap-2 text-sm">
                <span class="text-cyan-600 hover:text-cyan-900 hover:underline cursor-pointer" @click="editAd(ad)">
                  Modifier
                </span>
                <span class="text-cyan-600 hover:text-cyan-900 hover:underline cursor-pointer" @click="renewAd(ad.id)">
                  Renouveler
                </span>
                <span class="text-red-600 hover:text-red-900 hover:underline cursor-pointer" @click="deleteAd(ad.id)">
                  Supprimer
                </span>
                <span class="text-cyan-600 hover:text-cyan-900 hover:underline cursor-pointer" @click="showAdStats(ad)">
                  Statistiques
                </span>
              </div>
            </div>
            <div class="mt-3 md:mt-0 md:ml-4 text-right text-sm">
              <p>Impressions: {{ ad.impressions }}</p>
              <p>Clics: {{ ad.clicks }}</p>
              <p>CTR: {{ (ad.clicks / ad.impressions * 100 || 0).toFixed(2) }}%</p>
              <p>Expire le: {{ formatDate(ad.expiresAt) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Forfaits -->
      <div class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 mb-3">Mes forfaits publicitaires</h3>
        
        <!-- Chargement -->
        <div v-if="loadingPackages" class="py-4 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
          <p class="mt-2 text-gray-500">Chargement des forfaits...</p>
        </div>
        
        <!-- Pas de forfaits -->
        <div v-else-if="adPackages.length === 0" class="bg-gray-100 p-4 rounded-lg text-center">
          <p class="text-gray-500">Vous n'avez pas encore de forfait actif.</p>
          <button 
            @click="showPackages = true" 
            class="mt-2 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-700"
          >
            Voir les forfaits disponibles
          </button>
        </div>
        
        <!-- Liste des forfaits -->
        <div v-else class="bg-gray-100 p-4 rounded-lg">
          <div class="space-y-4">
            <div v-for="pkg in adPackages" :key="pkg.id" class="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div class="flex justify-between">
                <div>
                  <h4 class="font-medium">{{ pkg.name }}</h4>
                  <p class="text-sm text-gray-600">
                    {{ pkg.remainingCredits }} crédits restants
                  </p>
                  <p class="text-sm text-gray-600">Expire le {{ formatDate(pkg.expiresAt) }}</p>
                </div>
                <button 
                  @click="showNewAdForm = true" 
                  class="px-3 py-1.5 bg-cyan-500 text-white text-sm rounded-md hover:bg-cyan-700 self-start"
                >
                  Utiliser
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal des forfaits disponibles -->
      <div 
        v-if="showPackages" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Forfaits publicitaires disponibles</h3>
            <button @click="showPackages = false" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="grid gap-4 sm:grid-cols-2">
            <div 
              v-for="(pkg, index) in availablePackages" 
              :key="index" 
              class="border rounded-lg p-4 flex flex-col"
              :class="{'border-cyan-500 bg-cyan-50': pkg.recommended}"
            >
              <div class="mb-4">
                <div v-if="pkg.recommended" class="text-xs text-white bg-cyan-500 rounded-full px-2 py-1 inline-block mb-2">
                  Recommandé
                </div>
                <h4 class="text-lg font-medium">{{ pkg.name }}</h4>
                <p class="text-gray-600">{{ pkg.description }}</p>
              </div>
              
              <div class="mb-4">
                <p class="text-2xl font-bold">{{ formatPrice(pkg.price) }}</p>
                <p class="text-sm text-gray-500">{{ pkg.duration }}</p>
              </div>
              
              <ul class="mb-4 flex-grow">
                <li v-for="(feature, idx) in pkg.features" :key="idx" class="flex items-start mb-2">
                  <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{{ feature }}</span>
                </li>
              </ul>
              
              <button 
                @click="selectPackage(pkg)" 
                class="mt-auto w-full rounded-md py-2 px-4 text-center font-medium"
                :class="pkg.recommended ? 'bg-cyan-500 text-white hover:bg-cyan-700' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'"
              >
                Sélectionner
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal d'ajout/modification de publicité -->
      <div 
        v-if="showNewAdForm" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">{{ editMode ? 'Modifier la publicité' : 'Créer une nouvelle publicité' }}</h3>
            <button @click="closeAdForm" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-6">
            <div>
              <label for="adTitle" class="block text-sm font-medium text-gray-700 mb-1">Titre de la publicité *</label>
              <input 
                type="text" 
                id="adTitle" 
                v-model="adForm.title" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="Ex: Promotion exclusive de printemps"
              />
            </div>
            
            <div>
              <label for="adPosition" class="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <select 
                id="adPosition" 
                v-model="adForm.position" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              >
                <option value="" disabled>Sélectionnez une position</option>
                <option value="banner_top">Bannière haut de page</option>
                <option value="banner_bottom">Bannière bas de page</option>
                <option value="sidebar">Encart latéral</option>
                <option value="listing">Dans les annonces</option>
              </select>
            </div>
            
            <div v-if="adForm.position">
              <label for="adFormat" class="block text-sm font-medium text-gray-700 mb-1">Format *</label>
              <select 
                id="adFormat" 
                v-model="adForm.format" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              >
                <option value="" disabled>Sélectionnez un format</option>
                <option 
                  v-for="format in availableFormats[adForm.position]" 
                  :key="format.id" 
                  :value="format.id"
                >
                  {{ format.name }} ({{ format.dimensions }})
                </option>
              </select>
            </div>
            
            <div>
              <label for="adLink" class="block text-sm font-medium text-gray-700 mb-1">URL de destination *</label>
              <input 
                type="url" 
                id="adLink" 
                v-model="adForm.link" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="https://www.votresite.com/promotion"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Image publicitaire *</label>
              <div v-if="adForm.image" class="mb-2">
                <img :src="adForm.image" alt="Aperçu de la publicité" class="h-32 object-contain border rounded-md" />
              </div>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="file-upload" class="relative cursor-pointer rounded-md font-medium text-cyan-600 hover:text-cyan-500">
                      <span>Télécharger un fichier</span>
                      <input id="file-upload" name="file-upload" type="file" class="sr-only" @change="onFileChange" accept="image/*" />
                    </label>
                    <p class="pl-1">ou glisser-déposer</p>
                  </div>
                  <p class="text-xs text-gray-500">
                    PNG, JPG, GIF jusqu'à 2MB
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label for="adDuration" class="block text-sm font-medium text-gray-700 mb-1">Durée *</label>
              <select 
                id="adDuration" 
                v-model="adForm.duration" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
              >
                <option value="" disabled>Sélectionnez une durée</option>
                <option value="7">7 jours</option>
                <option value="15">15 jours</option>
                <option value="30">30 jours</option>
                <option value="90">3 mois</option>
              </select>
            </div>
            
            <div>
              <label for="adStartDate" class="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
              <input 
                type="date" 
                id="adStartDate" 
                v-model="adForm.startDate" 
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                :min="minStartDate"
              />
            </div>
            
            <div>
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  v-model="adForm.utm" 
                  class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Ajouter des paramètres UTM pour le suivi des performances</span>
              </label>
            </div>
            
            <div v-if="adForm.utm" class="ml-6 space-y-4">
              <div>
                <label for="adUtmSource" class="block text-sm font-medium text-gray-700 mb-1">Source (utm_source)</label>
                <input 
                  type="text" 
                  id="adUtmSource" 
                  v-model="adForm.utmSource" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="Ex: portail_immobilier"
                />
              </div>
              
              <div>
                <label for="adUtmMedium" class="block text-sm font-medium text-gray-700 mb-1">Support (utm_medium)</label>
                <input 
                  type="text" 
                  id="adUtmMedium" 
                  v-model="adForm.utmMedium" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="Ex: banner"
                />
              </div>
              
              <div>
                <label for="adUtmCampaign" class="block text-sm font-medium text-gray-700 mb-1">Campagne (utm_campaign)</label>
                <input 
                  type="text" 
                  id="adUtmCampaign" 
                  v-model="adForm.utmCampaign" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="Ex: promo_printemps_2025"
                />
              </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-md">
              <h4 class="font-medium text-gray-900 mb-2">Résumé</h4>
              <div class="space-y-1 text-sm">
                <p v-if="!hasPackage" class="text-red-600">
                  Vous n'avez pas de forfait publicitaire actif. Veuillez en acquérir un avant de publier cette annonce.
                </p>
                <p v-else>
                  Cette publicité <strong>{{ adForm.title }}</strong> consommera <strong>{{ getRequiredCredits() }} crédit(s)</strong> de votre forfait.
                </p>
                <p v-if="hasPackage && getRemainingCredits() < 0" class="text-red-600">
                  Crédit insuffisant! Il vous manque {{ Math.abs(getRemainingCredits()) }} crédit(s).
                </p>
                <p v-else-if="hasPackage">
                  Crédit restant après cette opération: {{ getRemainingCredits() }} crédit(s).
                </p>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button 
                type="button" 
                @click="closeAdForm" 
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                type="button" 
                @click="saveAd"
                :disabled="!isFormValid || saving || !hasPackage || getRemainingCredits() < 0"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="saving" class="animate-spin h-4 w-4 text-white inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ saving ? 'Enregistrement...' : 'Publier la publicité' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal de statistiques -->
      <div 
        v-if="showStatsModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Statistiques de la publicité</h3>
            <button @click="showStatsModal = false" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div v-if="loadingStats" class="py-10 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <p class="mt-2 text-gray-500">Chargement des statistiques...</p>
          </div>
          
          <div v-else>
            <div class="mb-4">
              <h4 class="font-medium text-gray-900">{{ selectedAd.title }}</h4>
              <p class="text-sm text-gray-500">{{ selectedAd.position }} - {{ selectedAd.format }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-gray-100 p-4 rounded-lg text-center">
                <p class="text-sm text-gray-500">Impressions</p>
                <p class="text-2xl font-bold text-gray-900">{{ selectedAd.impressions }}</p>
              </div>
              <div class="bg-gray-100 p-4 rounded-lg text-center">
                <p class="text-sm text-gray-500">Clics</p>
                <p class="text-2xl font-bold text-gray-900">{{ selectedAd.clicks }}</p>
              </div>
              <div class="bg-gray-100 p-4 rounded-lg text-center">
                <p class="text-sm text-gray-500">CTR</p>
                <p class="text-2xl font-bold text-gray-900">{{ (selectedAd.clicks / selectedAd.impressions * 100 || 0).toFixed(2) }}%</p>
              </div>
              <div class="bg-gray-100 p-4 rounded-lg text-center">
                <p class="text-sm text-gray-500">Coût par clic</p>
                <p class="text-2xl font-bold text-gray-900">{{ ((selectedAd.cost || 0) / selectedAd.clicks || 0).toFixed(2) }} €</p>
              </div>
            </div>
            
            <div class="mb-6">
              <h4 class="font-medium text-gray-900 mb-2">Performance dans le temps</h4>
              <div class="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p class="text-sm text-gray-500">Graphique de performance (données fictives)</p>
              </div>
            </div>
            
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Répartition par appareil</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appareil</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clics</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ordinateur</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">612</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">29</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4.74%</td>
                    </tr>
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Mobile</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">498</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">32</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">6.43%</td>
                    </tr>
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Tablette</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">138</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">6</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4.35%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

<script>
export default {
  name: 'AdsTab',
  
  data() {
    return {
      // États de chargement
      loading: false,
      loadingPackages: false,
      loadingStats: false,
      saving: false,
      
      // Données
      advertisements: [],
      adPackages: [],
      selectedAd: null,
      
      // Formulaire de publicité
      adForm: {
        title: '',
        position: '',
        format: '',
        link: '',
        image: '',
        duration: '',
        startDate: new Date().toISOString().split('T')[0],
        utm: false,
        utmSource: 'portail_immobilier',
        utmMedium: 'banner',
        utmCampaign: '',
      },
      
      // États des modals
      showPackages: false,
      showNewAdForm: false,
      showStatsModal: false,
      
      // Mode d'édition
      editMode: false,
      editAdId: null,
      
      // Formats disponibles par position
      availableFormats: {
        banner_top: [
          { id: 'leaderboard', name: 'Leaderboard', dimensions: '728x90' },
          { id: 'large_leaderboard', name: 'Grand Leaderboard', dimensions: '970x90' },
          { id: 'billboard', name: 'Billboard', dimensions: '970x250' }
        ],
        banner_bottom: [
          { id: 'leaderboard', name: 'Leaderboard', dimensions: '728x90' },
          { id: 'large_leaderboard', name: 'Grand Leaderboard', dimensions: '970x90' }
        ],
        sidebar: [
          { id: 'medium_rectangle', name: 'Rectangle Moyen', dimensions: '300x250' },
          { id: 'large_rectangle', name: 'Grand Rectangle', dimensions: '336x280' },
          { id: 'half_page', name: 'Demi-page', dimensions: '300x600' }
        ],
        listing: [
          { id: 'medium_rectangle', name: 'Rectangle Moyen', dimensions: '300x250' },
          { id: 'large_rectangle', name: 'Grand Rectangle', dimensions: '336x280' }
        ]
      },
      
      // Forfaits disponibles
      availablePackages: [
        {
          id: 'starter',
          name: 'Starter',
          description: 'Idéal pour tester',
          price: 49.99,
          duration: '30 jours',
          credits: 10,
          features: [
            '10 crédits publicitaires',
            'Toutes positions disponibles',
            'Statistiques de base',
            'Support par email'
          ]
        },
        {
          id: 'pro',
          name: 'Professionnel',
          description: 'Pour les professionnels',
          price: 129.99,
          duration: '90 jours',
          credits: 35,
          recommended: true,
          features: [
            '35 crédits publicitaires',
            'Positions premium',
            'Statistiques avancées',
            'Ciblage géographique',
            'Support prioritaire'
          ]
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'Visibilité maximale',
          price: 249.99,
          duration: '180 jours',
          credits: 80,
          features: [
            '80 crédits publicitaires',
            'Positions premium',
            'Statistiques détaillées',
            'Ciblage avancé',
            'Support dédié',
            'Assistance design'
          ]
        }
      ]
    };
  },
  
  computed: {
    // Date de début minimale (aujourd'hui)
    minStartDate() {
      return new Date().toISOString().split('T')[0];
    },
    
    // Vérifier si le formulaire est valide
    isFormValid() {
      return (
        this.adForm.title &&
        this.adForm.position &&
        this.adForm.format &&
        this.adForm.link &&
        this.adForm.image &&
        this.adForm.duration &&
        this.adForm.startDate
      );
    },
    
    // Vérifier si l'utilisateur a un forfait actif
    hasPackage() {
      return this.adPackages.length > 0 && this.getTotalRemainingCredits() > 0;
    }
  },
  
  created() {
    // Charger les publicités et les forfaits
    this.fetchAdvertisements();
    this.fetchPackages();
  },
  
  methods: {
    // Récupération des publicités
    async fetchAdvertisements() {
      this.loading = true;
      
      try {
        // Dans un cas réel, ce serait un appel API
        // const response = await api.getUserAdvertisements();
        // this.advertisements = response;
        
        // Pour l'exemple, nous utilisons des données fictives
        this.advertisements = [
          {
            id: 401,
            title: 'Promotion Agence XYZ',
            position: 'Banner haut',
            format: '728x90',
            status: 'active',
            impressions: 1248,
            clicks: 67,
            expiresAt: new Date('2025-05-20'),
            image: '/images/dummy/ad1.jpg',
            link: 'https://example.com/promo',
            cost: 50,
            positionId: 'banner_top',
            formatId: 'leaderboard'
          },
          {
            id: 402,
            title: 'Financement immobilier',
            position: 'Sidebar',
            format: '300x250',
            status: 'active',
            impressions: 2365,
            clicks: 124,
            expiresAt: new Date('2025-04-15'),
            image: '/images/dummy/ad2.jpg',
            link: 'https://example.com/financement',
            cost: 75,
            positionId: 'sidebar',
            formatId: 'medium_rectangle'
          }
        ];
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error('Erreur lors du chargement des publicités:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Récupération des forfaits
    async fetchPackages() {
      this.loadingPackages = true;
      
      try {
        // Dans un cas réel, ce serait un appel API
        // const response = await api.getUserAdPackages();
        // this.adPackages = response;
        
        // Pour l'exemple, nous utilisons des données fictives
        this.adPackages = [
          {
            id: 501,
            name: 'Forfait Publicité Premium',
            remainingCredits: 45,
            totalCredits: 80,
            expiresAt: new Date('2025-06-30')
          }
        ];
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        console.error('Erreur lors du chargement des forfaits:', error);
      } finally {
        this.loadingPackages = false;
      }
    },
    
    // Éditer une publicité
    editAd(ad) {
      this.editMode = true;
      this.editAdId = ad.id;
      
      // Remplir le formulaire avec les données de la publicité
      this.adForm = {
        title: ad.title,
        position: ad.positionId,
        format: ad.formatId,
        link: ad.link,
        image: ad.image,
        duration: '30', // Valeur par défaut, à adapter selon les données réelles
        startDate: new Date().toISOString().split('T')[0], // Date actuelle par défaut
        utm: false, // À adapter selon les données réelles
        utmSource: 'portail_immobilier',
        utmMedium: 'banner',
        utmCampaign: '',
      };
      
      // Afficher le formulaire
      this.showNewAdForm = true;
    },
    
    // Fermer le formulaire d'édition/création
    closeAdForm() {
      // Réinitialiser le formulaire
      this.adForm = {
        title: '',
        position: '',
        format: '',
        link: '',
        image: '',
        duration: '',
        startDate: new Date().toISOString().split('T')[0],
        utm: false,
        utmSource: 'portail_immobilier',
        utmMedium: 'banner',
        utmCampaign: '',
      };
      
      // Réinitialiser le mode d'édition
      this.editMode = false;
      this.editAdId = null;
      
      // Fermer le modal
      this.showNewAdForm = false;
    },
    
    // Enregistrer une publicité
    async saveAd() {
      if (!this.isFormValid) return;
      
      this.saving = true;
      
      try {
        // Construire l'URL avec les paramètres UTM si nécessaire
        let finalUrl = this.adForm.link;
        if (this.adForm.utm) {
          const url = new URL(this.adForm.link);
          url.searchParams.append('utm_source', this.adForm.utmSource);
          url.searchParams.append('utm_medium', this.adForm.utmMedium);
          url.searchParams.append('utm_campaign', this.adForm.utmCampaign || this.adForm.title.toLowerCase().replace(/\s+/g, '_'));
          finalUrl = url.toString();
        }
        
        // Préparer les données de la publicité
        const adData = {
          title: this.adForm.title,
          position: this.adForm.position,
          format: this.adForm.format,
          link: finalUrl,
          image: this.adForm.image,
          duration: parseInt(this.adForm.duration, 10),
          startDate: this.adForm.startDate
        };
        
        if (this.editMode) {
          // Dans un cas réel, ce serait un appel API
          // await api.updateAdvertisement(this.editAdId, adData);
          
          // Mettre à jour localement
          const index = this.advertisements.findIndex(ad => ad.id === this.editAdId);
          if (index !== -1) {
            this.advertisements[index] = {
              ...this.advertisements[index],
              title: adData.title,
              position: this.getPositionName(adData.position),
              format: this.getFormatDimensions(adData.position, adData.format),
              link: adData.link,
              image: adData.image,
              positionId: adData.position,
              formatId: adData.format
            };
          }
        } else {
          // Dans un cas réel, ce serait un appel API
          // const response = await api.createAdvertisement(adData);
          // const newAd = response.ad;
          
          // Créer localement
          const newAd = {
            id: Math.max(0, ...this.advertisements.map(ad => ad.id)) + 1,
            title: adData.title,
            position: this.getPositionName(adData.position),
            format: this.getFormatDimensions(adData.position, adData.format),
            status: 'pending',
            impressions: 0,
            clicks: 0,
            expiresAt: this.calculateExpiryDate(adData.startDate, adData.duration),
            image: adData.image,
            link: adData.link,
            cost: this.getRequiredCredits(),
            positionId: adData.position,
            formatId: adData.format
          };
          
          this.advertisements.push(newAd);
          
          // Mettre à jour les crédits restants
          const requiredCredits = this.getRequiredCredits();
          if (this.adPackages.length > 0) {
            this.adPackages[0].remainingCredits -= requiredCredits;
          }
        }
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fermer le formulaire
        this.closeAdForm();
        
        // Message de succès (dans un cas réel, utiliser un système de notification)
        alert(this.editMode ? 'Publicité mise à jour avec succès' : 'Publicité créée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la publicité:', error);
        alert('Une erreur est survenue lors de l\'enregistrement de la publicité');
      } finally {
        this.saving = false;
      }
    },
    
    // Renouveler une publicité
    async renewAd(id) {
      // Vérifier si l'utilisateur a suffisamment de crédits
      if (!this.hasPackage) {
        alert('Vous n\'avez pas de forfait actif ou de crédits suffisants. Veuillez acheter un forfait avant de renouveler cette publicité.');
        this.showPackages = true;
        return;
      }
      
      if (!confirm('Êtes-vous sûr de vouloir renouveler cette publicité ?')) {
        return;
      }
      
      try {
        // Trouver la publicité
        const ad = this.advertisements.find(a => a.id === id);
        if (!ad) return;
        
        // Calculer le coût en crédits
        const requiredCredits = this.calculateAdCredits(ad.positionId, ad.formatId, 30); // 30 jours par défaut
        
        // Vérifier si l'utilisateur a suffisamment de crédits
        if (this.getTotalRemainingCredits() < requiredCredits) {
          alert(`Vous n'avez pas assez de crédits. Il vous manque ${requiredCredits - this.getTotalRemainingCredits()} crédit(s).`);
          this.showPackages = true;
          return;
        }
        
        // Dans un cas réel, ce serait un appel API
        // await api.renewAdvertisement(id, { duration: 30 });
        
        // Mettre à jour localement
        const index = this.advertisements.findIndex(a => a.id === id);
        if (index !== -1) {
          const now = new Date();
          const expiryDate = new Date(now);
          expiryDate.setDate(expiryDate.getDate() + 30);
          
          this.advertisements[index] = {
            ...this.advertisements[index],
            status: 'active',
            expiresAt: expiryDate
          };
          
          // Déduire les crédits
          if (this.adPackages.length > 0) {
            this.adPackages[0].remainingCredits -= requiredCredits;
          }
        }
        
        // Message de succès
        alert('Publicité renouvelée avec succès');
      } catch (error) {
        console.error('Erreur lors du renouvellement de la publicité:', error);
        alert('Une erreur est survenue lors du renouvellement de la publicité');
      }
    },
    
    // Supprimer une publicité
    async deleteAd(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette publicité ?')) {
        return;
      }
      
      try {
        // Dans un cas réel, ce serait un appel API
        // await api.deleteAdvertisement(id);
        
        // Supprimer localement
        this.advertisements = this.advertisements.filter(ad => ad.id !== id);
        
        // Message de succès
        alert('Publicité supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression de la publicité:', error);
        alert('Une erreur est survenue lors de la suppression de la publicité');
      }
    },
    
    // Afficher les statistiques d'une publicité
    async showAdStats(ad) {
      this.selectedAd = ad;
      this.showStatsModal = true;
      this.loadingStats = true;
      
      try {
        // Dans un cas réel, ce serait un appel API
        // const stats = await api.getAdvertisementStats(ad.id);
        // this.selectedAd = { ...ad, ...stats };
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        this.loadingStats = false;
      }
    },
    
    // Sélectionner un forfait
    async selectPackage(pkg) {
      try {
        // Dans un cas réel, on redirigerait vers une page de paiement
        // window.location.href = `/payment?package=${pkg.id}`;
        
        // Pour l'exemple, simulation d'un achat réussi
        alert(`Vous allez être redirigé vers la page de paiement pour le forfait ${pkg.name}`);
        this.showPackages = false;
      } catch (error) {
        console.error('Erreur lors de la sélection du forfait:', error);
      }
    },
    
    // Gérer le changement de fichier
    onFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Vérifier le type de fichier
      if (!file.type.match('image.*')) {
        alert('Veuillez sélectionner une image');
        return;
      }
      
      // Vérifier la taille du fichier (2Mo max)
      if (file.size > 2 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 2Mo');
        return;
      }
      
      // Dans un cas réel, on utiliserait FileReader pour prévisualiser l'image
      // et on l'enverrait à un serveur pour stockage
      
      // Pour l'exemple, on utilise une URL fictive
      this.adForm.image = URL.createObjectURL(file);
    },
    
    // Calculer la date d'expiration
    calculateExpiryDate(startDate, duration) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + parseInt(duration, 10));
      return date;
    },
    
    // Obtenir le nom complet de la position
    getPositionName(positionId) {
      const positions = {
        banner_top: 'Banner haut de page',
        banner_bottom: 'Banner bas de page',
        sidebar: 'Encart latéral',
        listing: 'Dans les annonces'
      };
      
      return positions[positionId] || positionId;
    },
    
    // Obtenir les dimensions du format
    getFormatDimensions(positionId, formatId) {
      const formats = this.availableFormats[positionId] || [];
      const format = formats.find(f => f.id === formatId);
      return format ? format.dimensions : formatId;
    },
    
    // Calculer le nombre de crédits requis pour une publicité
    calculateAdCredits(position, format, duration) {
      // Base de calcul: position + format + durée
      let credits = 0;
      
      // Coût par position
      switch (position) {
        case 'banner_top':
          credits += 5;
          break;
        case 'banner_bottom':
          credits += 3;
          break;
        case 'sidebar':
          credits += 4;
          break;
        case 'listing':
          credits += 3;
          break;
        default:
          credits += 2;
      }
      
      // Coût par format (si grand format, coût supplémentaire)
      const largeFormats = ['billboard', 'large_leaderboard', 'half_page'];
      if (largeFormats.includes(format)) {
        credits += 2;
      }
      
      // Coût par durée (base: 1 crédit par semaine)
      credits += Math.ceil(duration / 7);
      
      return credits;
    },
    
    // Obtenir le nombre de crédits requis pour la publicité actuelle
    getRequiredCredits() {
      if (!this.adForm.position || !this.adForm.format || !this.adForm.duration) {
        return 0;
      }
      
      return this.calculateAdCredits(
        this.adForm.position,
        this.adForm.format,
        parseInt(this.adForm.duration, 10)
      );
    },
    
    // Obtenir le nombre total de crédits restants
    getTotalRemainingCredits() {
      return this.adPackages.reduce((total, pkg) => total + pkg.remainingCredits, 0);
    },
    
    // Calculer les crédits restants après l'opération actuelle
    getRemainingCredits() {
      const requiredCredits = this.getRequiredCredits();
      return this.getTotalRemainingCredits() - requiredCredits;
    },
    
    // Formater une date
    formatDate(date) {
      return new Intl.DateTimeFormat('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date);
    },
    
    // Formater un prix
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
    }
  }
};
</script>

<style scoped>
/* Animation de chargement */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>