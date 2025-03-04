<template>
  <section class="py-12 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-8 text-center">Explorez nos catégories</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <NuxtLink :to="category.link" class="block">
            <div class="h-48 overflow-hidden">
              <img 
                :src="category.image" 
                :alt="category.title" 
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div class="p-4">
              <h3 class="text-xl font-semibold">{{ category.title }}</h3>
              <p class="text-gray-600 mt-2">{{ category.description }}</p>
              <div class="mt-4 flex justify-between items-center">
                <span class="text-blue-600 font-medium">{{ category.count }} annonces</span>
                <span class="text-blue-600 hover:text-blue-800">
                  Voir tout
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const categories = [
  {
    id: 1,
    title: 'Maisons',
    description: 'Maisons individuelles et villas avec rendement locatif',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    count: 345,
    link: '/annonces/maisons'
  },
  {
    id: 2,
    title: 'Appartements',
    description: 'Appartements et studios idéaux pour l\'investissement',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    count: 520,
    link: '/annonces/appartements'
  },
  {
    id: 3,
    title: 'Immeubles',
    description: 'Immeubles de rapport et multi-logements',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    count: 128,
    link: '/annonces/immeubles'
  },
  {
    id: 4,
    title: 'Constructions',
    description: 'Terrains et projets de construction rentables',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    count: 97,
    link: '/annonces/constructions'
  }
];
</script>