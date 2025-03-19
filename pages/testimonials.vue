<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center">
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        Ce que nos clients disent
      </h1>
      <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
        Découvrez les témoignages de nos clients satisfaits qui ont trouvé leur bien immobilier idéal grâce à notre portail.
      </p>
    </div>

    <div class="mt-12 space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
      <div v-for="(testimonial, index) in testimonials" :key="index" class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <img class="h-12 w-12 rounded-full" :src="testimonial.avatar" alt="Avatar du client" />
            </div>
            <div class="ml-4">
              <div class="text-lg font-medium text-cyan-600 truncate">{{ testimonial.name }}</div>
              <div class="mt-1 flex items-center">
                <div class="flex items-center">
                  <span v-for="i in 5" :key="i" class="mr-1">
                    <svg v-if="i <= testimonial.rating" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg v-else class="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </span>
                </div>
                <span class="ml-2 text-sm text-gray-500">{{ testimonial.date }}</span>
              </div>
              <p class="mt-3 text-gray-700">{{ testimonial.text }}</p>
              <p class="mt-2 text-sm text-gray-500">{{ testimonial.property }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-12 text-center">
      <a href="#" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Voir plus de témoignages
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestimonialsPage',
  data() {
    return {
      testimonials: [
        {
          name: 'Jean Dupont',
          avatar: '/api/placeholder/64/64',
          rating: 5,
          date: '15 Février 2025',
          text: 'Grâce à ce portail, j\'ai trouvé ma maison idéale en moins de 2 semaines. L\'interface est intuitive et les filtres de recherche sont très efficaces.',
          property: 'Maison à Bordeaux'
        },
        {
          name: 'Marie Laurent',
          avatar: '/api/placeholder/64/64',
          rating: 5,
          date: '3 Mars 2025',
          text: 'Le processus de recherche était fluide et les photos des biens étaient de très haute qualité. J\'ai pu facilement comparer différentes options avant de faire mon choix.',
          property: 'Appartement à Lyon'
        },
        {
          name: 'Pierre Lefevre',
          avatar: '/api/placeholder/64/64',
          rating: 4,
          date: '27 Janvier 2025',
          text: 'Excellent service! Les descriptions des propriétés étaient précises et j\'ai pu contacter directement les agents immobiliers pour organiser des visites.',
          property: 'Villa à Nice'
        },
        {
          name: 'Sophie Martin',
          avatar: '/api/placeholder/64/64',
          rating: 5,
          date: '10 Février 2025',
          text: 'Interface moderne et réactive, j\'ai apprécié la possibilité de sauvegarder mes recherches préférées pour y revenir plus tard.',
          property: 'Loft à Paris'
        }
      ]
    }
  }
}
</script>