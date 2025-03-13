<template>
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
  
</template>

<script>
export default {

}
</script>

<style>

</style>