<template>
  <section class="bg-white py-12">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-10">Parcourir par catégories</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Maisons -->
        <div class="category-card">
          <NuxtLink to="/annonces?category=maisons" class="block relative">
            <img src="~/assets/images/category-maisons.jpg" alt="Maisons" class="w-full h-80 object-cover rounded-t-lg">
            <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h3 class="text-white text-2xl font-bold">Maisons</h3>
            </div>
            <div class="absolute bottom-6 right-4 bg-cyan-600 text-white px-5 py-1 rounded-full text-sm flex items-center">
              Voir les annonces
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
        </div>
        
        <!-- Immeubles -->
        <div class="category-card">
          <NuxtLink to="/annonces?category=immeubles" class="block relative">
            <img src="~/assets/images/category-immeubles.jpg" alt="Immeubles" class="w-full h-80 object-cover rounded-t-lg">
            <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h3 class="text-white text-2xl font-bold">Immeubles</h3>
            </div>
            <div class="absolute bottom-6 right-4 bg-cyan-600 text-white px-5 py-1 rounded-full text-sm flex items-center">
              Voir les annonces
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
        </div>
        
        <!-- Constructions -->
        <div class="category-card">
         <NuxtLink to="/annonces?category=construction" class="block relative">
            <img src="~/assets/images/category-constructions.jpg" alt="Constructions" class="w-full h-80 object-cover rounded-t-lg">
            <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h3 class="text-white text-2xl font-bold">Constructions</h3>
            </div>
            <div class="absolute bottom-6 right-4 bg-cyan-600 text-white px-5 py-1 rounded-full text-sm flex items-center">
              Voir les annonces
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
        </div>
        
        <!-- Maisons d'hôte -->
        <div class="category-card">
          <NuxtLink to="/annonces?category=maisons_dhote" class="block relative">
            <img src="~/assets/images/category-maisons-hote.jpg" alt="Maisons d'hôte" class="w-full h-80 object-cover rounded-t-lg">
            <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h3 class="text-white text-2xl font-bold">Maisons d'hôte</h3>
            </div>
            <div class="absolute bottom-6 right-4 bg-cyan-600 text-white px-5 py-1 rounded-full text-sm flex items-center">
              Voir les annonces
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.category-card {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>