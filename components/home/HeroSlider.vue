<template>
  <div class="relative">
    <!-- Slider principal -->
    <div class="relative h-[500px] overflow-hidden">
      <!-- Images du slider -->
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        class="absolute inset-0 transition-opacity duration-1000"
        :class="{ 'opacity-100': currentSlide === index, 'opacity-0': currentSlide !== index }"
      >
        <img 
          :src="slide.image" 
          alt="Propriété immobilière" 
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black opacity-30"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center text-white max-w-4xl px-4">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ slide.title }}</h1>
            <p class="text-xl md:text-2xl mb-8">{{ slide.description }}</p>
            <NuxtLink 
              :to="slide.buttonLink" 
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-lg font-medium inline-block"
            >
              {{ slide.buttonText }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Navigation du slider -->
      <div class="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        <button 
          v-for="(slide, index) in slides" 
          :key="`dot-${index}`"
          class="w-3 h-3 rounded-full transition-colors duration-300"
          :class="currentSlide === index ? 'bg-white' : 'bg-white/50'"
          @click="currentSlide = index"
          :aria-label="`Aller à la slide ${index + 1}`"
        ></button>
      </div>

      <!-- Boutons précédent/suivant -->
      <button 
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
        @click="prevSlide"
        aria-label="Slide précédente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
        @click="nextSlide"
        aria-label="Slide suivante"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    title: "Vendez votre bien immobilier",
    description: "Le premier portail spécialisé dans les biens avec potentiel locatif",
    buttonText: "Déposer une annonce",
    buttonLink: "/annonces/ajouter"
  },
  {
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    title: "Attirez les bons acheteurs",
    description: "Mettez en avant le potentiel locatif de votre propriété",
    buttonText: "Voir nos forfaits",
    buttonLink: "/tarifs"
  },
  {
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80',
    title: "Vendez plus rapidement",
    description: "Les investisseurs recherchent activement des biens à bon rendement",
    buttonText: "Découvrir nos solutions",
    buttonLink: "/tarifs"
  }
];

const currentSlide = ref(0);
let slideInterval = null;

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};

onMounted(() => {
  // Auto-changement de slide toutes les 5 secondes
  slideInterval = setInterval(nextSlide, 5000);
});

onBeforeUnmount(() => {
  // Nettoyage de l'intervalle lors de la destruction du composant
  if (slideInterval) {
    clearInterval(slideInterval);
  }
});
</script>