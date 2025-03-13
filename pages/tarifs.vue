<!-- pages/tarifs.vue -->
<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-center mb-2">Nos formules d'annonces</h1>
    <p class="text-xl text-center text-gray-600 mb-12">Choisissez l'offre qui correspond à vos besoins</p>
    
    <!-- Plans de tarification -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      <!-- Plan Essentiel -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6 bg-gray-50">
          <h2 class="text-2xl font-bold mb-1">Essentiel</h2>
          <p class="text-gray-600 mb-4">Pour les petites annonces</p>
          <div class="text-3xl font-bold">
            19,90€ <span class="text-base font-normal text-gray-500">/ annonce</span>
          </div>
        </div>
        
        <div class="p-6">
          <ul class="space-y-3 mb-6">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Publication 30 jours</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Jusqu'à 5 photos</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Calcul de rentabilité locative</span>
            </li>
            <li class="flex items-start text-gray-400">
              <svg class="w-5 h-5 text-gray-300 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span>Mise en avant</span>
            </li>
            <li class="flex items-start text-gray-400">
              <svg class="w-5 h-5 text-gray-300 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span>Statistiques de visites</span>
            </li>
            <li class="flex items-start text-gray-400">
              <svg class="w-5 h-5 text-gray-300 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span>Support prioritaire</span>
            </li>
          </ul>
          
          <NuxtLink to="/stripe-simple" class="block w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
            Choisir ce forfait
          </NuxtLink>
        </div>
      </div>
      
      <!-- Plan Premium -->
      <div class="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-cyan-500 transform md:scale-105">
        <div class="p-1 bg-cyan-500 text-white text-center text-sm font-medium">
          RECOMMANDÉ
        </div>
        <div class="p-6 bg-gray-50">
          <h2 class="text-2xl font-bold mb-1">Premium</h2>
          <p class="text-gray-600 mb-4">Pour une visibilité optimale</p>
          <div class="text-3xl font-bold">
            39,90€ <span class="text-base font-normal text-gray-500">/ annonce</span>
          </div>
        </div>
        
        <div class="p-6">
          <ul class="space-y-3 mb-6">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Publication 60 jours</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Jusqu'à 15 photos</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Calcul de rentabilité locative</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Mise en avant pendant 7 jours</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Statistiques de visites</span>
            </li>
            <li class="flex items-start text-gray-400">
              <svg class="w-5 h-5 text-gray-300 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span>Support prioritaire</span>
            </li>
          </ul>
          
          <NuxtLink to="/stripe-simple" class="block w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
            Choisir ce forfait
          </NuxtLink>
        </div>
      </div>
      
      <!-- Plan Professionnel -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6 bg-gray-50">
          <h2 class="text-2xl font-bold mb-1">Professionnel</h2>
          <p class="text-gray-600 mb-4">Pour les agences immobilières</p>
          <div class="text-3xl font-bold">
            79,90€ <span class="text-base font-normal text-gray-500">/ mois</span>
          </div>
        </div>
        
        <div class="p-6">
          <ul class="space-y-3 mb-6">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>10 annonces simultanées</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Jusqu'à 25 photos par annonce</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Calcul de rentabilité locative</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>1 annonce mise en avant par semaine</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Statistiques de visites avancées</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Support prioritaire</span>
            </li>
          </ul>
          
          <NuxtLink to="/stripe-simple" class="block w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
            Choisir ce forfait
          </NuxtLink>
        </div>
      </div>
    </div>
    
    <!-- Options de mise en avant -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-center mb-12">Options de mise en avant</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Option 1 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-5 border-b">
            <h3 class="text-xl font-semibold">Annonce en tête</h3>
            <p class="text-gray-600 text-sm">7 jours</p>
          </div>
          <div class="p-5">
            <p class="text-2xl font-bold mb-4">9,90€</p>
            <p class="text-sm text-gray-600 mb-5">Votre annonce apparaît en tête des résultats de recherche pendant 7 jours.</p>
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Ajouter
            </button>
          </div>
        </div>
        
        <!-- Option 2 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-5 border-b">
            <h3 class="text-xl font-semibold">Annonce coup de cœur</h3>
            <p class="text-gray-600 text-sm">15 jours</p>
          </div>
          <div class="p-5">
            <p class="text-2xl font-bold mb-4">14,90€</p>
            <p class="text-sm text-gray-600 mb-5">Votre annonce est mise en avant comme "Coup de cœur" pendant 15 jours.</p>
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Ajouter
            </button>
          </div>
        </div>
        
        <!-- Option 3 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-5 border-b">
            <h3 class="text-xl font-semibold">Photos supplémentaires</h3>
            <p class="text-gray-600 text-sm">Permanent</p>
          </div>
          <div class="p-5">
            <p class="text-2xl font-bold mb-4">4,90€</p>
            <p class="text-sm text-gray-600 mb-5">+10 photos supplémentaires pour mieux présenter votre bien.</p>
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Ajouter
            </button>
          </div>
        </div>
        
        <!-- Option 4 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-5 border-b">
            <h3 class="text-xl font-semibold">Extension de durée</h3>
            <p class="text-gray-600 text-sm">+30 jours</p>
          </div>
          <div class="p-5">
            <p class="text-2xl font-bold mb-4">7,90€</p>
            <p class="text-sm text-gray-600 mb-5">Prolongez la durée de publication de votre annonce de 30 jours.</p>
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Ajouter
            </button>
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
          <h3 class="text-lg font-semibold mb-2">Comment fonctionnent les options de mise en avant ?</h3>
          <p class="text-gray-600">Les options de mise en avant permettent à votre annonce d'être plus visible pour les acheteurs potentiels. L'option "En tête" place votre annonce en haut des résultats de recherche, tandis que l'option "Coup de cœur" la met en évidence avec un badge distinctif.</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-5">
          <h3 class="text-lg font-semibold mb-2">Les prix incluent-ils la TVA ?</h3>
          <p class="text-gray-600">Oui, tous les prix affichés incluent la TVA au taux en vigueur.</p>
        </div>
      </div>
    </div>
  </div>
</template>

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