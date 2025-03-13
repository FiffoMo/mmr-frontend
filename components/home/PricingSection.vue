<template>
  <section class="py-12 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold mb-2 text-center">Nos forfaits</h2>
      <p class="text-gray-600 mb-8 text-center">Choisissez le forfait qui correspond à vos besoins</p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="plan in plans" 
          :key="plan.id" 
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          :class="{ 'border-2 border-cyan-500': plan.popular }"
        >
          <div 
            v-if="plan.popular" 
            class="bg-cyan-500 text-white py-1 text-center text-sm font-semibold"
          >
            Le plus populaire
          </div>
          
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">{{ plan.name }}</h3>
            <p class="text-gray-600 mb-4">{{ plan.description }}</p>
            
            <div class="mb-4">
              <span class="text-3xl font-bold">{{ plan.price }}€</span>
              <span class="text-gray-600">/forfait</span>
            </div>
            
            <ul class="mb-6 space-y-2">
              <li 
                v-for="(feature, index) in plan.features" 
                :key="index"
                class="flex items-start"
              >
                <svg class="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>
            
            <button 
              class="w-full py-2 px-4 rounded-md transition-colors"
              :class="plan.popular ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'"
            >
              Choisir ce forfait
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const plans = [
  {
    id: 1,
    name: 'Forfait Basic',
    description: 'Idéal pour les petits propriétaires',
    price: 29,
    features: [
      '5 annonces',
      'Visibilité 60 jours',
      'Photos HD',
      'Mise en avant du rendement locatif'
    ],
    popular: false
  },
  {
    id: 2,
    name: 'Forfait Standard',
    description: 'Notre offre la plus populaire',
    price: 49,
    features: [
      '10 annonces',
      'Visibilité 60 jours',
      'Photos HD',
      'Mise en avant du rendement locatif',
      'Statistiques de consultation',
      '1 mise en avant offerte'
    ],
    popular: true
  },
  {
    id: 3,
    name: 'Forfait Premium',
    description: 'Pour les professionnels',
    price: 79,
    features: [
      '25 annonces',
      'Visibilité 60 jours',
      'Photos HD',
      'Mise en avant du rendement locatif',
      'Statistiques détaillées',
      '3 mises en avant offertes',
      'Support prioritaire'
    ],
    popular: false
  }
];
</script>