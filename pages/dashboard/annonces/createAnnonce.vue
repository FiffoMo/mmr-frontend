<!-- pages/dashboard/annonces/createAnnonce.vue -->
<template>
  <div class="bg-gray-100 min-h-screen pb-12">
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ isEditMode ? 'Modifier l\'annonce' : 'Publier une nouvelle annonce' }}</h1>
        <NuxtLink 
          to="/settings?tab=listings" 
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Retour
        </NuxtLink>
      </div>

      <div v-if="loading" class="bg-white shadow-md rounded-lg p-6 mb-6 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
        <p class="mt-4 text-sm text-gray-500">{{ isEditMode ? 'Chargement de l\'annonce...' : 'Chargement des forfaits...' }}</p>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md mb-6">
        <div class="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-medium">{{ error }}</p>
            <button @click="retryLoading" class="text-red-700 underline mt-2">Réessayer</button>
          </div>
        </div>
      </div>

      <div v-else-if="noForfaits && !isEditMode" class="bg-amber-100 border border-amber-300 text-amber-700 p-4 rounded-md mb-6">
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

      <form v-if="(!noForfaits || isEditMode) && !loading && !error" @submit.prevent="submitForm" class="bg-white shadow-md rounded-lg p-6 mb-6">
        <!-- Alerte pour les champs obligatoires -->
        <div class="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm">Les champs marqués d'un astérisque (<span class="text-red-600 font-bold">*</span>) sont obligatoires.</p>
            </div>
          </div>
        </div>
        <!-- Affichage du forfait (en mode édition) -->
        <div v-if="isEditMode && forfaitsDisponibles.length > 0" class="mb-6">
          <div class="border p-4 rounded-md bg-gray-50">
            <h2 class="text-lg font-semibold mb-2">Forfait associé à cette annonce</h2>
            <div class="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 class="font-medium text-gray-900">
                  {{ forfaitsDisponibles[0].nom }} 
                  <span class="ml-2 text-sm text-gray-500">
                    Réf: {{ forfaitsDisponibles[0].reference || `ORD-${forfaitsDisponibles[0].id.substring(0, 4)}` }}
                  </span>
                </h3>
                <p class="text-sm text-gray-500">
                  Utilisation: {{ forfaitsDisponibles[0].utilisees || 0 }} / {{ forfaitsDisponibles[0].total || '∞' }} annonces
                  <span v-if="forfaitsDisponibles[0].date_fin"> - Jusqu'au {{ formatDate(forfaitsDisponibles[0].date_fin) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sélection du forfait (en mode création) -->
        <div v-else-if="!isEditMode && forfaitsDisponibles.length > 0" class="mb-6">
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
              <label for="titre" class="block text-gray-700 font-medium mb-1 required">Titre de l'annonce</label>

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
              <label for="prix_vente" class="block text-gray-700 font-medium mb-1 required">Prix de vente</label>
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
              <label for="categorie" class="block text-gray-700 font-medium mb-1 required">Catégorie</label>
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
              <label for="localisation" class="block text-gray-700 font-medium mb-1 required">Localisation</label>
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
              <label for="surface" class="block text-gray-700 font-medium mb-1 required">Surface habitable (m²)</label>
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
              <label for="pieces" class="block text-gray-700 font-medium mb-1 required">Nombre de pièces</label>
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
              <label for="chambres" class="block text-gray-700 font-medium mb-1 required">Nombre de chambres</label>
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
              <label for="etat" class="block text-gray-700 font-medium mb-1 required">État général</label>
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
              <label for="exposition" class="block text-gray-700 font-medium mb-1 required">Exposition</label>
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
              <label for="dpe" class="block text-gray-700 font-medium mb-1 required">DPE (Performance énergétique)</label>
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
              <label for="ges" class="block text-gray-700 font-medium mb-1 required">GES (Émission de gaz)</label>
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
            <label for="description" class="block text-gray-700 font-medium mb-1 required">Description complète</label>
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
                <div v-for="(label, value) in equipementsLocationOptions" :key="`loc-${value}`" class="flex items-center">
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
            <label class="block text-gray-700 font-medium mb-2 required">Photo principale</label>
            <FileUpload 
              v-model="files.image_principale" 
              field="image_principale"
              :required="!isEditMode || !files.image_principale?.id"
              @update="updateFile('image_principale', $event)"
              @delete="deleteFile('image_principale')"
              :preview-url="getImagePreviewUrl('image_principale')"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div v-for="i in 9" :key="`photo-${i+1}`">
              <label class="block text-gray-700 font-medium mb-2">Photo {{ i+1 }}</label>
              <FileUpload 
                v-model="files[`image_${i+1}`]" 
                :field="`image_${i+1}`"
                @update="updateFile(`image_${i+1}`, $event)"
                @delete="deleteFile(`image_${i+1}`)"
                :preview-url="getImagePreviewUrl(`image_${i+1}`)"
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
                  @delete="deleteFile(`image_location_${i}`)"
                  :preview-url="getImagePreviewUrl(`image_location_${i}`)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Conditions et envoi -->
        <div class="border-t pt-6">
          <!-- Conditions d'utilisation (uniquement en mode création) -->
          <div v-if="!isEditMode" class="flex items-start mb-6">
            <input 
              type="checkbox" 
              id="conditions" 
              v-model="formData.conditions_acceptees"
              required
              class="mt-1 mr-2"
            >
            <label for="conditions" class="text-gray-700 required">
              J'accepte les conditions générales et je certifie que les informations fournies sont exactes *
            </label>
          </div>
          <!-- En mode édition, on présume que les conditions ont déjà été acceptées -->
          <div v-else class="hidden">
            <input type="hidden" v-model="formData.conditions_acceptees">
          </div>

          <!-- Message d'erreur pour les champs obligatoires -->
          <div v-if="formSubmitted && hasEmptyRequiredFields" class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">Certains champs obligatoires n'ont pas été remplis</p>
                <p class="text-sm mt-1">Veuillez remplir tous les champs marqués d'un astérisque avant de soumettre le formulaire.</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button 
              type="submit" 
              class="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-md"
              :disabled="submitLoading"
            >
              <span v-if="submitLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isEditMode ? 'Mise à jour en cours...' : 'Publication en cours...' }}
              </span>
              <span v-else>{{ isEditMode ? 'Mettre à jour l\'annonce' : 'Publier l\'annonce' }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineComponent, h, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/useAuthStore';
import { useDirectusSDK } from '~/composables/useDirectusSDK';
import FileUpload from '~/components/common/FileUpload.vue';

// Route, Auth, SDK
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const directusSDK = useDirectusSDK();

// État du composant
const loading = ref(false);
const submitLoading = ref(false);
const error = ref(null);
const noForfaits = ref(false);
const showLocativeSection = ref(true);
const selectedForfait = ref(null);
const forfaitsDisponibles = ref([]);
const formSubmitted = ref(false); // Variable manquante ajoutée

// Mode édition
const isEditMode = ref(false);
const annonceId = ref(null);

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
  status: 'published' // L'annonce est publiée par défaut
});

// Propriété calculée pour vérifier les champs obligatoires
const hasEmptyRequiredFields = computed(() => {
  return !formData.Titre ||
    !formData.prix_vente ||
    !formData.categorie_annonce ||
    !formData.localisation ||
    !formData.surface_habitable ||
    !formData.pieces ||
    !formData.chambres ||
    !formData.etat_general ||
    !formData.exposition ||
    !formData.Description ||
    (!isEditMode.value && !formData.conditions_acceptees);
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
  ascenseur: 'Ascenseur',
  balcon: 'Balcon',
  buanderie: 'Buanderie',
  cave: 'Cave',
  cellier: 'Cellier',
  cheminee: 'Cheminée',
  cuisine_amenagee: 'Cuisine aménagée',
  garage: 'Garage',
  internet: 'Internet',
  jardin: 'Jardin',
  meuble: 'Meublé',
  panneaux_solaires: 'Panneaux solaires',
  parking: 'Parking',
  pas_de_vis_a_vis: 'Sans vis-à-vis',
  piscine: 'Piscine',
  rangement: 'Rangement',
  rangements: 'Rangements',
  salle_d_eau: 'Salle d\'eau',
  sdb: 'Salle de bain',
  terrasse: 'Terrasse',
  veranda: 'Véranda',
  wc_separes: 'WC séparés'
};

// Pour la partie locative - liste réduite des 8 options spécifiques
const equipementsLocationOptions = {
  balcon: 'Balcon',
  compteur_independant: 'Compteur indépendant',
  garage: 'Garage',
  jardin: 'Jardin',
  meuble: 'Meublé',
  parking: 'Parking',
  salle_d_eau: 'Salle d\'eau',
  sdb: 'Salle de bain'
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

// Gestion des images via le middleware serveur
// À ajouter dans createAnnonce.vue

const config = useRuntimeConfig();
const directusUrl = config.public.directusUrl || 'http://localhost:8055';

const getImagePreviewUrl = (field) => {
  if (!files[field] || !files[field].id) return null;
  console.log(`Générer URL de prévisualisation pour ${field}: ${directusUrl}/assets/${files[field].id}`);
  return `${directusUrl}/assets/${files[field].id}?width=300&height=200&fit=cover`;
};

const getAssetUrl = (assetId) => {
  if (!assetId) return null;
  console.log(`Générer URL d'asset pour ${assetId}: ${directusUrl}/assets/${assetId}`);
  return `${directusUrl}/assets/${assetId}`;
};

// Alternative en utilisant le proxy API si la solution directe ne fonctionne pas
/*
const getImagePreviewUrl = (field) => {
  if (!files[field] || !files[field].id) return null;
  return `/api/directus/assets/${files[field].id}?width=300&height=200&fit=cover`;
};

const getAssetUrl = (assetId) => {
  if (!assetId) return null;
  return `/api/directus/assets/${assetId}`;
};
*/


// Mettre à jour un fichier
const updateFile = (field, data) => {
  console.log(`Mise à jour du fichier ${field}:`, data);
  if (data && data.file) {
    files[field] = data.file;
    console.log(`Fichier ${field} mis à jour:`, files[field]);
  }
};

// Tableau pour suivre les fichiers supprimés
const filesToDelete = ref([]);

// Fonction améliorée pour supprimer un fichier
const deleteFile = (field) => {
  console.log(`Suppression du fichier ${field}`);
  
  // Réinitialiser le fichier dans l'état local immédiatement
  const fileIdToRemove = files[field]?.id;
  files[field] = null;
  
  // Ajouter ce champ à la liste des fichiers à supprimer lors de la soumission
  filesToDelete.value.push(field);
  
  console.log(`Champ ${field} ajouté à la liste des fichiers à supprimer`);
};

// Nettoyer le HTML et convertir les entités HTML - CORRIGÉ
const cleanHTML = (html) => {
  if (!html) return '';
  
  // Supprimer les balises HTML mais conserver les sauts de ligne
  let text = html.replace(/<br\s*\/?>/gi, "\n")  // Remplacer <br> par sauts de ligne
              .replace(/<p>/gi, "")             // Supprimer les balises <p> ouvrantes
              .replace(/<\/p>/gi, "\n\n")       // Remplacer les balises </p> par deux sauts de ligne
              .replace(/<div>/gi, "")           // Supprimer les balises <div> ouvrantes
              .replace(/<\/div>/gi, "\n")       // Remplacer les balises </div> par un saut de ligne
              .replace(/<li>/gi, "• ")          // Remplacer <li> par des puces
              .replace(/<\/li>/gi, "\n")        // Remplacer </li> par un saut de ligne
              .replace(/<[^>]*>/g, "");         // Supprimer toutes les autres balises HTML
  
  // Convertir les entités HTML courantes
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#039;/g, "'")
             .replace(/&eacute;/g, 'é')
             .replace(/&egrave;/g, 'è')
             .replace(/&ecirc;/g, 'ê')
             .replace(/&agrave;/g, 'à')
             .replace(/&acirc;/g, 'â')
             .replace(/&icirc;/g, 'î')
             .replace(/&ocirc;/g, 'ô')
             .replace(/&ucirc;/g, 'û')
             .replace(/&ccedil;/g, 'ç')
             .replace(/&rsquo;/g, "'")
             .replace(/&laquo;/g, "«")
             .replace(/&raquo;/g, "»")
             .replace(/&euml;/g, "ë")
             .replace(/&iuml;/g, "ï")
             .replace(/&uuml;/g, "ü")
             .replace(/&ndash;/g, "-")
             .replace(/&mdash;/g, "—")
             .replace(/&bull;/g, "•")
             .replace(/&hellip;/g, "...")
             .replace(/&copy;/g, "©")
             .replace(/&reg;/g, "®")
             .replace(/&trade;/g, "™")
             .replace(/&deg;/g, "°")
             .replace(/&plusmn;/g, "±")
             .replace(/&times;/g, "×")
             .replace(/&divide;/g, "÷")
             .replace(/&frac14;/g, "¼")
             .replace(/&frac12;/g, "½")
             .replace(/&frac34;/g, "¾")
             .replace(/&sup1;/g, "¹")
             .replace(/&sup2;/g, "²")
             .replace(/&sup3;/g, "³");
  
  // Convertir les entités numériques
  text = text.replace(/&#(\d+);/g, function(match, dec) {
    return String.fromCharCode(dec);
  });
  
  // Nettoyer les sauts de ligne multiples (mais en conserver au moins un)
  text = text.replace(/\n{3,}/g, "\n\n");
  
  // Supprimer les espaces en début et fin
  text = text.trim();
  
  return text;
};

// Fonction pour retenter le chargement
const retryLoading = () => {
  error.value = null;
  
  if (isEditMode.value) {
    loadAnnonceData(annonceId.value);
  } else {
    loadForfaits();
  }
};

// Chargement des forfaits disponibles
const loadForfaits = async (specificForfaitId = null) => {
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    noForfaits.value = true;
    return;
  }
  
  loading.value = true;
  
  try {
    const userId = authStore.user.id;
    console.log("Chargement des forfaits pour l'utilisateur:", userId);
    
    if (specificForfaitId) {
      console.log("Tentative de chargement du forfait spécifique:", specificForfaitId);
      
      // Récupérer les informations du forfait spécifié
      const response = await fetch(`/api/directus/items/commandes/${specificForfaitId}?fields=*,produit.*`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error("Erreur lors de la récupération du forfait:", response.status);
        throw new Error(`Forfait introuvable: ${response.statusText}`);
      }
      
      const result = await response.json();
      const forfaitData = result.data;
      
      if (!forfaitData) {
        console.error("Forfait introuvable dans les données de réponse");
        throw new Error("Forfait introuvable");
      }
      
      console.log("Forfait récupéré:", forfaitData);
      
      // Vérifier si le forfait appartient à l'utilisateur courant
      if (forfaitData.client_id !== userId) {
        console.error("Ce forfait n'appartient pas à l'utilisateur courant");
        noForfaits.value = true;
        return;
      }
      
      // Vérifier si le forfait est actif (non expiré)
      if (forfaitData.date_fin) {
        const dateExpiration = new Date(forfaitData.date_fin);
        const now = new Date();
        
        if (dateExpiration < now) {
          console.error("Ce forfait est expiré");
          noForfaits.value = true;
          return;
        }
      }
      
      // Compter les annonces déjà créées pour ce forfait
      const annonceResponse = await fetch(`/api/directus/items/Annonces?filter[commande_id][_eq]=${forfaitData.id}&aggregate[count]=id`, {
        credentials: 'include'
      });
      
      let annoncesUtilisees = 0;
      if (annonceResponse.ok) {
        const annonceResult = await annonceResponse.json();
        annoncesUtilisees = annonceResult?.data?.[0]?.count?.id || 0;
      }
      
      // Déterminer le nombre total d'annonces autorisées en fonction du type de forfait
      let annoncesTotal = 0;
      if (forfaitData.produit && forfaitData.produit.nom) {
        const nomForfait = forfaitData.produit.nom.toUpperCase();
        if (nomForfait.includes('BASIC')) {
          annoncesTotal = 1;
        } else if (nomForfait.includes('DIXIT')) {
          annoncesTotal = 10;
        } else if (nomForfait.includes('PREMIUM')) {
          annoncesTotal = 25;
        } else {
          // Essayer de récupérer depuis les propriétés
          annoncesTotal = forfaitData.produit?.nombre_annonces || 
                         forfaitData.produit?.limite_annonces || 
                         forfaitData.nombre_annonces_total || 
                         forfaitData.limite_annonces || 
                         10; // Valeur par défaut raisonnable au lieu de Infinity
        }
      }
      
      // Vérifier s'il reste de la place
      if (annoncesUtilisees >= annoncesTotal) {
        console.error("Ce forfait a atteint sa limite d'annonces");
        noForfaits.value = true;
        return;
      }
      
      // Créer un objet forfait formaté avec la référence incluse dans le nom
      forfaitsDisponibles.value = [{
        id: forfaitData.id,
        nom: `${forfaitData.produit?.nom || "Forfait"} (Réf: ${forfaitData.reference || `ORD-${forfaitData.id.substring(0, 4)}`})`,
        reference: forfaitData.reference || `ORD-${forfaitData.id.substring(0, 4)}`,
        date_fin: forfaitData.date_fin,
        annonces_restantes: annoncesTotal - annoncesUtilisees
      }];
      
      console.log("Forfait disponible:", forfaitsDisponibles.value[0]);
      
      // Sélectionner ce forfait
      selectedForfait.value = forfaitData.id;
      noForfaits.value = false;
      
      return;
    }
    
    // Si on n'a pas spécifié de forfait, continuer avec le code existant
    // pour charger tous les forfaits disponibles
    const response = await fetch(`/api/directus/items/commandes?filter[client_id][_eq]=${userId}&filter[date_fin][_gt]=${new Date().toISOString()}&fields=id,date_fin,produit.*,reference`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error("Erreur lors de la récupération des commandes:", response.status);
      throw new Error(`Erreur API: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.data || result.data.length === 0) {
      console.log("Aucune commande active trouvée");
      noForfaits.value = true;
      return;
    }
    
    // Filtrer les commandes pour ne garder que celles avec un produit qui permet les annonces
    const commandesValides = result.data.filter(commande => {
      // Vérifier d'abord si c'est un forfait d'annonces
      const typeProduit = commande.type_produit || '';
      const nomProduit = (commande.produit?.nom || '').toLowerCase();
      
      // Inclure explicitement les forfaits d'Annonces
      if (typeProduit === 'Annonces' || typeProduit === 'annonces') {
        return true;
      }
      
      // Inclure si le nom contient des mots-clés d'annonces
      if (nomProduit.includes('annonce') || nomProduit.includes('basic') || 
          nomProduit.includes('premium') || nomProduit.includes('dixit')) {
        return true;
      }
      
      // Exclure explicitement mise en avant et publicité
      if (typeProduit.includes('mise') || typeProduit.includes('pub') ||
          nomProduit.includes('mise en avant') || nomProduit.includes('pub')) {
        return false;
      }
      
      // Par défaut, inclure si type_produit est vide (compatibilité)
      return typeProduit === '' && commande.produit;
    });
    
    console.log("Commandes valides après filtrage:", commandesValides);
    
    if (commandesValides.length === 0) {
      console.log("Aucune commande avec forfait d'annonces trouvée");
      noForfaits.value = true;
      return;
    }
    
    // Pour chaque commande, compter les annonces déjà créées
    const forfaitsPromises = commandesValides.map(async commande => {
      try {
        // Compter les annonces associées à cette commande
        const annonceResponse = await fetch(`/api/directus/items/Annonces?filter[commande_id][_eq]=${commande.id}&aggregate[count]=id`, {
          credentials: 'include'
        });
        
        if (!annonceResponse.ok) {
          return {
            id: commande.id,
            nom: `${commande.produit?.nom || 'Forfait'} (Réf: ${commande.reference || `ORD-${commande.id.substring(0, 4)}`})`,
            reference: commande.reference || `ORD-${commande.id.substring(0, 4)}`,
            date_fin: commande.date_fin,
            annonces_restantes: commande.produit?.nombre_annonces || 0
          };
        }
        
        const annonceResult = await annonceResponse.json();
        const annoncesUtilisees = annonceResult?.data?.[0]?.count?.id || 0;
        
        // Déterminer le nombre total d'annonces autorisées en fonction du type de forfait
        let annoncesTotal = 0;
        if (commande.produit && commande.produit.nom) {
          const nomForfait = commande.produit.nom.toUpperCase();
          if (nomForfait.includes('BASIC')) {
            annoncesTotal = 1;
          } else if (nomForfait.includes('DIXIT')) {
            annoncesTotal = 10;
          } else if (nomForfait.includes('PREMIUM')) {
            annoncesTotal = 25;
          } else {
            // Essayer de récupérer depuis les propriétés
            annoncesTotal = commande.produit?.nombre_annonces || 
                           commande.produit?.limite_annonces || 
                           commande.nombre_annonces_total || 
                           commande.limite_annonces || 
                           10; // Valeur par défaut raisonnable
          }
        }
        
        const annoncesRestantes = Math.max(0, annoncesTotal - annoncesUtilisees);
        
        return {
          id: commande.id,
          nom: `${commande.produit?.nom || 'Forfait'} (Réf: ${commande.reference || `ORD-${commande.id.substring(0, 4)}`})`,
          reference: commande.reference || `ORD-${commande.id.substring(0, 4)}`,
          date_fin: commande.date_fin,
          annonces_restantes: annoncesRestantes
        };
      } catch (err) {
        console.error(`Erreur lors du comptage des annonces pour la commande ${commande.id}:`, err);
        return null;
      }
    });
    
    // Attendre toutes les requêtes de comptage
    const forfaits = (await Promise.all(forfaitsPromises)).filter(f => f !== null && f.annonces_restantes > 0);
    
    console.log("Forfaits disponibles après vérification:", forfaits);
    
    if (forfaits.length > 0) {
      forfaitsDisponibles.value = forfaits;
      selectedForfait.value = forfaits[0].id;
      noForfaits.value = false;
    } else {
      noForfaits.value = true;
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des forfaits:', err);
    error.value = err.message;
    noForfaits.value = true;
  } finally {
    loading.value = false;
  }
};


// Chargement des informations du forfait
const loadForfaitInfo = async (forfaitId) => {
  try {
    const response = await fetch(`/api/directus/items/commandes/${forfaitId}?fields=id,date_fin,reference,produit.*`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    const forfaitData = result.data;
    
    if (forfaitData) {
      // Compter les annonces associées à cette commande
      const annonceResponse = await fetch(`/api/directus/items/Annonces?filter[commande_id][_eq]=${forfaitData.id}&aggregate[count]=id`, {
        credentials: 'include'
      });
      
      let annoncesUtilisees = 0;
      let annoncesTotal = forfaitData.produit?.nombre_annonces || forfaitData.produit?.limite_annonces || 0;
      
      if (annonceResponse.ok) {
        const annonceResult = await annonceResponse.json();
        annoncesUtilisees = annonceResult?.data?.[0]?.count?.id || 0;
      }
      
      forfaitsDisponibles.value = [{
        id: forfaitData.id,
        nom: forfaitData.produit?.nom || 'Forfait',
        reference: forfaitData.reference,
        date_fin: forfaitData.date_fin,
        utilisees: annoncesUtilisees,
        total: annoncesTotal,
        annonces_restantes: 1 // En mode édition, on garde toujours 1 pour l'annonce actuelle
      }];
      
      // Sélectionner automatiquement ce forfait
      selectedForfait.value = forfaitData.id;
    }
  } catch (err) {
    console.error('Erreur lors du chargement des informations du forfait:', err);
  }
};

// Chargement des données de l'annonce à modifier
const loadAnnonceData = async (id) => {
  try {
    loading.value = true;
    
    // Appel API pour récupérer les données de l'annonce
    const response = await fetch(`/api/directus/items/Annonces/${id}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    const annonceData = result.data;
    
    if (!annonceData) {
      throw new Error('Annonce non trouvée');
    }
    
    console.log('Données brutes de l\'annonce:', annonceData);
    console.log('Catégorie:', annonceData.categorie_annonce);
    console.log('Exposition:', annonceData.exposition);
    console.log('DPE:', annonceData.DPE);
    console.log('GES:', annonceData.GES);
    
    // Mettre à jour le forfait sélectionné
    if (annonceData.commande_id) {
      selectedForfait.value = annonceData.commande_id;
      
      // Charger les informations du forfait
      await loadForfaitInfo(annonceData.commande_id);
    }
    
    console.log('Données de l\'annonce à modifier:', annonceData);
    
    // Remplir le formulaire avec les données de l'annonce
    for (const key in formData) {
      if (annonceData[key] !== undefined && annonceData[key] !== null) {
        // Traiter certains champs spécifiquement
        if (key === 'Description' || key === 'description_location') {
          formData[key] = cleanHTML(annonceData[key]);
        } else {
          formData[key] = annonceData[key];
        }
      }
    }
    
    // Normaliser la catégorie (supprimer le "s" si présent)
    if (annonceData.categorie_annonce === 'maisons') {
      formData.categorie_annonce = 'maison';
    }
    
    // Normaliser l'exposition
    if (annonceData.exposition) {
      // Convertir "Sud Ouest" en "sud-ouest" etc.
      const expositionMapping = {
        'Nord': 'nord',
        'Sud': 'sud',
        'Est': 'est',
        'Ouest': 'ouest',
        'Nord Est': 'nord-est',
        'Nord Ouest': 'nord-ouest',
        'Sud Est': 'sud-est',
        'Sud Ouest': 'sud-ouest'
      };
      
      // Chercher si une correspondance existe
      for (const [original, normalized] of Object.entries(expositionMapping)) {
        if (annonceData.exposition.toUpperCase() === original.toUpperCase() || 
            annonceData.exposition.toUpperCase() === original.toUpperCase().replace(' ', '-') ||
            annonceData.exposition.toUpperCase() === original.toUpperCase().replace(' ', '')) {
          formData.exposition = normalized;
          break;
        }
      }
    }
    
    // Normaliser DPE et GES (convertir en majuscule)
    if (annonceData.DPE) {
      formData.DPE = annonceData.DPE.toUpperCase();
    }
    
    if (annonceData.GES) {
      formData.GES = annonceData.GES.toUpperCase();
    }
    
    console.log('FormData après chargement:', formData);
    console.log('Valeurs chargées dans le formulaire:');
    console.log('Catégorie:', formData.categorie_annonce);
    console.log('Exposition:', formData.exposition);
    console.log('DPE:', formData.DPE);
    console.log('GES:', formData.GES);
    
    // Charger les équipements
    // Dans la fonction loadAnnonceData, pour les équipements principaux :
    if (annonceData.equipements) {
      try {
        let parsed;
        if (typeof annonceData.equipements === 'string') {
          parsed = JSON.parse(annonceData.equipements);
        } else {
          parsed = annonceData.equipements;
        }
        
        console.log('Équipements principaux parsés:', parsed);
        
        // S'assurer que c'est bien un tableau ou un objet
        if (Array.isArray(parsed)) {
          // Filtrer pour garder uniquement les valeurs qui existent dans equipementsOptions
          equipementsSelected.value = parsed.filter(item => 
            Object.keys(equipementsOptions).includes(item)
          );
        } else if (typeof parsed === 'object') {
          equipementsSelected.value = Object.keys(parsed)
            .filter(key => parsed[key] && Object.keys(equipementsOptions).includes(key));
        }
        
        console.log('Équipements principaux sélectionnés:', equipementsSelected.value);
      } catch (e) {
        console.error('Erreur lors du parsing des équipements principaux:', e);
        equipementsSelected.value = [];
      }
    }

    // Pour les équipements de la partie locative :
    if (annonceData.equipements_location) {
      try {
        let parsed;
        if (typeof annonceData.equipements_location === 'string') {
          parsed = JSON.parse(annonceData.equipements_location);
        } else {
          parsed = annonceData.equipements_location;
        }
        
        console.log('Équipements location parsés:', parsed);
        
        // Utiliser la liste correcte des équipements
        const correctEquipements = ['balcon', 'compteur_independant', 'garage', 'jardin', 'meuble', 'parking', 'salle_d_eau', 'sdb'];
        
        // Si on a des données, on les utilise, sinon on utilise la liste fixe
        if (Array.isArray(parsed) && parsed.length > 0) {
          equipementsLocationSelected.value = parsed.filter(item => correctEquipements.includes(item));
        } else if (parsed && typeof parsed === 'object') {
          equipementsLocationSelected.value = correctEquipements.filter(item => parsed[item]);
        } else {
          // Si pas de données ou erreur, on utilise directement la liste fixe
          equipementsLocationSelected.value = ['balcon', 'compteur_independant', 'garage', 'jardin', 'meuble', 'parking', 'salle_d_eau', 'sdb'];
        }
        
        showLocativeSection.value = true;
      } catch (e) {
        console.error('Erreur lors du parsing des équipements location:', e);
        // En cas d'erreur, on utilise la liste fixe
        equipementsLocationSelected.value = ['balcon', 'compteur_independant', 'garage', 'jardin', 'meuble', 'parking', 'salle_d_eau', 'sdb'];
        showLocativeSection.value = true;
      }
    }
    
    // Charger les aperçus des images
    for (const key in files) {
      if (annonceData[key]) {
        // Stocker l'ID de l'image
        files[key] = { id: annonceData[key] };
      }
    }
    
    // Forcer l'affichage de la section locative quand on est en mode édition
    showLocativeSection.value = true;
    console.log("Section locative forcée à visible");

    // Vérifier si des images de la partie locative existent
    console.log("Images locatives:");
    for (let i = 1; i <= 5; i++) {
      const field = `image_location_${i}`;
      console.log(`${field}:`, annonceData[field]);
      if (annonceData[field]) {
        files[field] = { id: annonceData[field] };
        console.log(`Image locative ${i} trouvée:`, annonceData[field]);
      }
    }
    
    // Définir les conditions comme acceptées en mode édition
    formData.conditions_acceptees = true;
    
    // Désactiver l'affichage du message "pas de forfaits"
    noForfaits.value = false;
    
  } catch (err) {
    console.error('Erreur lors du chargement des données de l\'annonce:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Initialisation au chargement du composant
onMounted(async () => {
  // Récupérer l'ID de l'annonce et le forfait depuis l'URL si présents
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const forfaitId = urlParams.get('forfait');
  
  if (id) {
    // Mode édition
    annonceId.value = id;
    isEditMode.value = true;
    await loadAnnonceData(id);
  } else if (forfaitId) {
    // Mode création avec forfait spécifié
    console.log(`Chargement spécifique du forfait: ${forfaitId}`);
    await loadForfaits(forfaitId);
  } else {
    // Mode création sans forfait spécifié
    await loadForfaits();
  }
});

// Soumettre le formulaire
const submitForm = async () => {
  // Marquer le formulaire comme soumis pour activer les validations visuelles
  formSubmitted.value = true;
  
  // Si les champs obligatoires ne sont pas remplis, arrêter la soumission
  if (hasEmptyRequiredFields.value) {
    submitLoading.value = false;
    // Scroll vers le haut pour montrer les erreurs
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  if (!selectedForfait.value) {
    alert('Veuillez sélectionner un forfait');
    return;
  }
  
  submitLoading.value = true;
  
  try {
    // Préparer les données pour l'annonce
    const annonceData = { ...formData };

    // Ajouter les champs client_id et commande_id
    annonceData.client_id = authStore.user.id;
    annonceData.commande_id = selectedForfait.value;

    // S'assurer que les champs d'images supprimés sont explicitement null
    filesToDelete.value.forEach(field => {
      console.log(`Définition explicite de ${field} à null`);
      annonceData[field] = null;
    });

    // Réinitialiser le tableau après utilisation
    filesToDelete.value = [];

    // Statut publié et date de début en mode création
    if (!isEditMode.value) {
      annonceData.status = 'published';
      annonceData.date_debut = new Date().toISOString();
    }

    // Ajouter les équipements en JSON
    annonceData.equipements = JSON.stringify(equipementsSelected.value)
    if (equipementsLocationSelected.value.length > 0) {
      annonceData.equipements_location = JSON.stringify(equipementsLocationSelected.value);
    }
    
    // Calculer le prix au m²
    if (annonceData.prix_vente && annonceData.surface_habitable) {
      annonceData.prix_au_m_carre = annonceData.prix_vente / annonceData.surface_habitable;
    }
    
    console.log('Données de l\'annonce à envoyer:', annonceData);
    
    let createdAnnonce;
    
    if (isEditMode.value) {
      console.log('Mode édition: mise à jour de l\'annonce', annonceId.value);
      
      try {
        // Essayer d'abord avec l'API Directus SDK
        console.log('Tentative de mise à jour avec SDK');
        console.log('Données à envoyer:', annonceData);
        
        const sdkResult = await directusSDK.updateItem('Annonces', annonceId.value, annonceData);
        console.log('Résultat SDK:', sdkResult);
        createdAnnonce = sdkResult;
      } catch (sdkError) {
        console.error('Erreur avec SDK:', sdkError);
        
        // Si ça échoue, essayer avec fetch directement
        console.log('Tentative avec fetch direct');
        
        try {
          const response = await fetch(`/api/directus/items/Annonces/${annonceId.value}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(annonceData)
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur détaillée:', errorText);
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          const fetchResult = await response.json();
          console.log('Résultat fetch:', fetchResult);
          createdAnnonce = fetchResult;
        } catch (fetchError) {
          console.error('Erreur avec fetch:', fetchError);
          throw new Error('Échec de la mise à jour de l\'annonce. Veuillez réessayer.');
        }
      }
      
      console.log('Annonce mise à jour avec succès:', createdAnnonce);
    } else {
      // Mode création: créer une nouvelle annonce
      try {
        // Essayer d'abord avec l'API Directus SDK
        createdAnnonce = await directusSDK.createItem('Annonces', annonceData);
        console.log('Annonce créée avec succès:', createdAnnonce);
        
        // Vérifier si ça a fonctionné
        if (!createdAnnonce || !createdAnnonce.data) {
          // Essayer avec fetch directement comme fallback
          console.log('SDK a échoué, tentative avec fetch direct');
          const response = await fetch('/api/directus/items/Annonces', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(annonceData)
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur détaillée:', errorText);
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          const fetchResult = await response.json();
          console.log('Résultat fetch:', fetchResult);
          createdAnnonce = fetchResult;
        }
      } catch (sdkError) {
        console.error('Erreur avec SDK:', sdkError);
        
        // Si ça échoue, essayer avec fetch directement
        console.log('Tentative avec fetch direct après erreur SDK');
        const response = await fetch('/api/directus/items/Annonces', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(annonceData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erreur détaillée:', errorText);
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const fetchResult = await response.json();
        console.log('Résultat fetch:', fetchResult);
        createdAnnonce = fetchResult;
      }
    }
    
    if (!createdAnnonce) {
      throw new Error('Erreur lors de la création/mise à jour de l\'annonce');
    }
    
    // Récupérer l'ID de l'annonce (existante ou nouvelle)
    const finalAnnonceId = isEditMode.value ? annonceId.value : (createdAnnonce.data?.id || createdAnnonce.id);
    
    if (!finalAnnonceId) {
      throw new Error('ID de l\'annonce introuvable après création/mise à jour');
    }
    
    // Version corrigée finale de la fonction d'upload
    const uploadFiles = async () => {
      console.log("Tentative d'upload simplifiée");
      let uploadSuccess = false;
      let fileCount = 0;
      let successCount = 0;
      
      for (const [field, file] of Object.entries(files)) {
        // Ignorer les champs vides ou null, ou les fichiers déjà uploadés (qui ont un ID)
        if (!file || typeof file === 'object' && file.id) {
          continue;
        }
        
        // Ignorer tout ce qui n'est pas un File
        if (!(file instanceof File)) {
          continue;
        }
        
        fileCount++;
        
        try {
          // Créer un FormData
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', file.type || 'image/jpeg');
          formData.append('title', file.name);
          formData.append('filename_download', file.name);
          formData.append('storage', 'local');
          
          // Upload direct
          const uploadResponse = await fetch('http://localhost:8055/files', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer Qqq_txN484Kd4C8_pQajEDBl4xqmG3vr`
            },
            body: formData
          });
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`Erreur ${uploadResponse.status}:`, errorText);
            continue;
          }
          
          const result = await uploadResponse.json();
          
          if (result.data && result.data.id) {
            const fileId = result.data.id;
            
            // Associer le fichier à l'annonce
            const updateResponse = await fetch(`/api/directus/items/Annonces/${finalAnnonceId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ [field]: fileId })
            });
            
            if (updateResponse.ok) {
              console.log(`Association réussie pour ${field}`);
              successCount++;
              uploadSuccess = true;
            } else {
              console.error(`Erreur lors de l'association:`, await updateResponse.text());
            }
          }
        } catch (error) {
          console.error(`Erreur complète pour ${field}:`, error);
        }
      }
      
      console.log(`Upload terminé: ${successCount}/${fileCount} fichiers traités avec succès`);
      
      // Considérer comme un succès si aucun fichier n'a été téléchargé
      // (cela évite le message d'erreur lorsqu'il n'y a pas de nouvelles images)
      return fileCount === 0 || uploadSuccess;
    };
    
    // Appeler la fonction d'upload des fichiers
    const filesUploaded = await uploadFiles();

    // Afficher UN SEUL message de succès en fonction du résultat
    if (filesUploaded) {
      alert(isEditMode.value ? 'Annonce mise à jour avec succès !' : 'Annonce créée avec succès !');
    } else {
      // Les données textuelles ont été sauvegardées mais pas les images
      alert(isEditMode.value 
        ? 'Annonce mise à jour avec succès, mais certaines images n\'ont pas pu être téléchargées.' 
        : 'Annonce créée avec succès, mais certaines images n\'ont pas pu être téléchargées.');
    }

    // UNE SEULE redirection
    setTimeout(() => {
      router.push(`/annonces/detail-${finalAnnonceId}`);
    }, 1000);
        
  } catch (err) {
    console.error('Erreur lors de la soumission du formulaire:', err);
    error.value = err.message || 'Une erreur est survenue lors de la création/modification de l\'annonce';
    alert(`Erreur: ${error.value}`);
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style scoped>
/* Styles pour champs obligatoires */
label[for]:after {
  content: "";
}

label[for] + input[required] + label[for],
label[for] + select[required] + label[for],
label[for] + textarea[required] + label[for] {
  content: " *";
  color: #dc2626;
}

/* Surbrillance des champs obligatoires non remplis après tentative de soumission */
input[required]:invalid,
select[required]:invalid,
textarea[required]:invalid {
  border-color: #dc2626;
  background-color: rgba(220, 38, 38, 0.05);
}

/* Astérisque rouge pour les champs obligatoires */
label.required:after {
  content: " *";
  color: #dc2626;
}
/* Styles pour les champs spécifiques non remplis */
#etat:invalid,
#categorie:invalid,
#exposition:invalid, 
#dpe:invalid,
#ges:invalid {
  border-color: #dc2626;
  background-color: rgba(220, 38, 38, 0.05);
}

/* Effet de focus pour les champs obligatoires */
#etat:focus:invalid,
#categorie:focus:invalid,
#exposition:focus:invalid,
#dpe:focus:invalid,
#ges:focus:invalid {
  outline: none;
  ring-color: rgba(220, 38, 38, 0.5);
  border-color: #dc2626;
}

</style>