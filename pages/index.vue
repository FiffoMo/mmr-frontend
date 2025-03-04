<template>
  <div>
    <!-- Hero Slider -->
    <HeroSlider />
    
    <!-- Barre de recherche -->
    <div class="container mx-auto">
      <SearchBar />
    </div>
    
    <!-- Présentation du concept MMR -->
    <section class="py-16 container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Bienvenue sur Ma Maison Rapporte</h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Le premier portail immobilier dédié aux biens avec potentiel locatif.
          Vendez votre bien en valorisant son rendement potentiel et attirez des investisseurs sérieux.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div class="text-center p-6 bg-white rounded-lg shadow-md">
          <div class="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Visibilité maximale</h3>
          <p class="text-gray-600">
            Touchez une audience ciblée d'investisseurs à la recherche de biens avec un potentiel de rendement locatif.
          </p>
        </div>
        
        <div class="text-center p-6 bg-white rounded-lg shadow-md">
          <div class="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Vente plus rapide</h3>
          <p class="text-gray-600">
            En mettant en avant le potentiel locatif, vous attirerez des acheteurs décidés et réduirez le temps de vente.
          </p>
        </div>
        
        <div class="text-center p-6 bg-white rounded-lg shadow-md">
          <div class="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Outils spécialisés</h3>
          <p class="text-gray-600">
            Nos outils vous permettent de mettre en valeur le potentiel de rendement de votre bien pour attirer les bons acheteurs.
          </p>
        </div>
      </div>
    </section>
    
    <!-- Catégories -->
    <CategorySection />
    
    <!-- Annonces récentes -->
    <RecentAnnonces />
    
    <!-- Forfaits -->
    <PricingSection />

    <!-- Témoignages -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8 text-center">Ils ont vendu grâce à MMR</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex items-center mb-4">
              <div class="text-yellow-400 flex">
                <svg v-for="i in 5" :key="i" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span class="ml-2 text-gray-600">il y a 2 mois</span>
            </div>
            <p class="text-gray-700 mb-4">
              "J'ai vendu mon appartement en moins de 3 semaines grâce à MMR. Les acheteurs étaient particulièrement intéressés par l'analyse de rentabilité que j'ai pu présenter."
            </p>
            <div class="flex items-center">
              <span class="font-semibold">Marie D.</span>
              <span class="mx-2">•</span>
              <span class="text-gray-600">Propriétaire à Lyon</span>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex items-center mb-4">
              <div class="text-yellow-400 flex">
                <svg v-for="i in 5" :key="i" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span class="ml-2 text-gray-600">il y a 1 mois</span>
            </div>
            <p class="text-gray-700 mb-4">
              "Étant agent immobilier, j'utilise régulièrement MMR pour mes biens à fort potentiel locatif. La qualité des contacts est nettement supérieure aux autres portails."
            </p>
            <div class="flex items-center">
              <span class="font-semibold">Pierre M.</span>
              <span class="mx-2">•</span>
              <span class="text-gray-600">Agent immobilier à Paris</span>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex items-center mb-4">
              <div class="text-yellow-400 flex">
                <svg v-for="i in 5" :key="i" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span class="ml-2 text-gray-600">il y a 3 mois</span>
            </div>
            <p class="text-gray-700 mb-4">
              "MMR m'a permis de valoriser mon immeuble de rapport auprès d'investisseurs. Le forfait Premium a vraiment fait la différence avec une visibilité optimale."
            </p>
            <div class="flex items-center">
              <span class="font-semibold">Sophie B.</span>
              <span class="mx-2">•</span>
              <span class="text-gray-600">Propriétaire à Bordeaux</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call-to-action -->
    <section class="py-16 bg-blue-600 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">Prêt à vendre votre bien avec son potentiel locatif ?</h2>
        <p class="text-xl mb-8 max-w-3xl mx-auto">
          Rejoignez les milliers de vendeurs qui ont trouvé leur acheteur sur Ma Maison Rapporte.
        </p>
        <NuxtLink 
          to="/annonces/ajouter" 
          class="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-md text-lg font-medium inline-block"
        >
          Déposer mon annonce
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import HeroSlider from '~/components/home/HeroSlider.vue';
import SearchBar from '~/components/home/SearchBar.vue';
import CategorySection from '~/components/home/CategorySection.vue';
import RecentAnnonces from '~/components/home/RecentAnnonces.vue';
import PricingSection from '~/components/home/PricingSection.vue';
</script>