<!-- components/alertes/AlerteEmailTrigger.vue 
bouton flottant -->

<template>
  <div>
    <!-- Bouton flottant à droite avec texte vertical -->
    <button 
      @click="toggleForm" 
      class="fixed right-4 top-1/2 transform -translate-y-1/2 z-10 shadow-lg transition-all duration-300 flex flex-col items-center rounded-l-lg py-4 px-2"
      :class="[
        isFormVisible 
          ? 'right-[350px] bg-red-500 hover:bg-red-600' 
          : 'bg-cyan-500 hover:bg-cyan-600'
      ]"
    >
      <svg v-if="!isFormVisible" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      
      <!-- Texte vertical (uniquement affiché quand le formulaire est fermé) -->
      <div v-if="!isFormVisible" class="vertical-text hidden md:block mt-2 text-white">
        Alertes email
      </div>
    </button>
    
    <!-- Panneau coulissant -->
    <div 
      class="fixed right-0 top-0 h-full w-full md:w-[350px] bg-white shadow-xl z-10 transform transition-transform duration-300 overflow-y-auto"
      :class="isFormVisible ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-800">Créer une alerte</h2>
          <button 
            @click="toggleForm"
            class="p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <AlerteEmailForm @formSubmitted="handleFormSubmit" />
      </div>
    </div>
    
    <!-- Overlay -->
    <div 
      v-if="isFormVisible" 
      @click="toggleForm"
      class="fixed inset-0 bg-black bg-opacity-50 z-5 md:hidden"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AlerteEmailForm from './AlerteEmailForm.vue';

const isFormVisible = ref(false);

const toggleForm = () => {
  isFormVisible.value = !isFormVisible.value;
  
  if (isFormVisible.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const handleFormSubmit = () => {
  isFormVisible.value = false;
  document.body.style.overflow = '';
};
</script>

<style scoped>
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  letter-spacing: 1px;
  font-weight: 500;
}
</style>