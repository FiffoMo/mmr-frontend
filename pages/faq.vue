<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Questions fréquentes
        </h1>
        <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Tout ce que vous devez savoir sur notre portail immobilier et nos services.
        </p>
      </div>
  
      <div class="mt-12">
        <dl class="space-y-8">
          <div v-for="(faq, index) in faqs" :key="index" class="bg-white shadow overflow-hidden rounded-lg">
            <dt class="px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer" @click="toggleFaq(index)">
              <span class="text-lg leading-6 font-medium text-gray-900">{{ faq.question }}</span>
              <span class="ml-6 h-7 flex items-center">
                <svg class="h-6 w-6 transform" :class="faq.isOpen ? '-rotate-180' : 'rotate-0'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </dt>
            <dd v-if="faq.isOpen" class="px-4 py-5 sm:px-6 bg-gray-100 text-base text-gray-700">
              <div v-if="faq.question === 'Comment puis-je publier une annonce immobilière ?'">
                <p>Si vous êtes un particulier ou une agence immobilière, vous pouvez publier une annonce sur notre plateforme. <span @click="goToLink('/tarifs')" class="text-cyan-600 hover:text-cyan-900 hover:underline cursor-pointer">Différentes formules</span> sont disponibles selon vos besoins.</p>
              </div>
              <div v-else-if="faq.question === 'Quels sont les frais associés à l\'utilisation de votre portail ?'">
                <p>La consultation des annonces est entièrement gratuite pour les utilisateurs à la recherche d'un bien. Pour les vendeurs et agences, nous proposons différentes formules tarifaires que vous pouvez consulter dans la section <span @click="goToLink('/publier-annonce')" class="text-cyan-600 hover:text-cyan-900 hover:underline cursor-pointer">Publier une annonce</span>.</p>
              </div>
              <p v-else>{{ faq.answer }}</p>
            </dd>
          </div>
        </dl>
      </div>
  
      <div class="mt-12 bg-gray-100 shadow overflow-hidden rounded-lg p-6 text-center">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Vous ne trouvez pas de réponse à votre question ?</h2>
        <p class="text-gray-700 mb-6">Contactez-nous directement et nous vous répondrons dans les plus brefs délais.</p>
        
        <button @click="goToLink('/contact')" class="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
          Nous contacter
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'FAQPage',
    data() {
      return {
        faqs: [
          {
            question: "Comment puis-je rechercher un bien immobilier ?",
            answer: "Vous pouvez utiliser notre barre de recherche en haut de la page d'accueil. Sélectionnez le type de bien (appartement, maison, etc.), la localisation et votre budget maximum pour affiner votre recherche.",
            isOpen: true
          },
          {
            question: "Comment contacter un agent immobilier pour une propriété ?",
            answer: "Sur chaque page de détail d'une annonce, vous trouverez un formulaire de contact ainsi que les coordonnées directes de l'agent en charge du bien. Vous pouvez également cliquer sur le bouton 'Contacter l'agent' pour envoyer un message directement depuis notre plateforme.",
            isOpen: false
          },
          {
            question: "Est-il possible de sauvegarder mes recherches préférées ?",
            answer: "Non, cette fonctionnalité est prévue dans nos développements futurs. Elle permettra aux utilisateurs enregistrés de sauvegarder leurs critères de recherche et de recevoir des alertes par email lorsque de nouvelles propriétés correspondantes seront publiées.",
            isOpen: false
          },
          {
            question: "Les prix affichés sont-ils négociables ?",
            answer: "Les prix sont fixés par les vendeurs ou les agences immobilières. Notre portail n'intervient pas dans la négociation des prix. Nous vous conseillons de contacter directement l'agent en charge du bien pour discuter d'éventuelles négociations.",
            isOpen: false
          },
          {
            question: "Comment puis-je publier une annonce immobilière ?",
            answer: "Si vous êtes un particulier ou une agence immobilière, vous pouvez publier une annonce sur notre plateforme. Différentes formules sont disponibles selon vos besoins.",
            isOpen: false
          },
          {
            question: "Quels sont les frais associés à l'utilisation de votre portail ?",
            answer: "La consultation des annonces est entièrement gratuite pour les utilisateurs à la recherche d'un bien. Pour les vendeurs et agences, nous proposons différentes formules tarifaires que vous pouvez consulter dans la section Publier une annonce.",
            isOpen: false
          }
        ]
      }
    },
    methods: {
      toggleFaq(index) {
        this.faqs[index].isOpen = !this.faqs[index].isOpen;
      },
      goToLink(url) {
        // Navigation par code JavaScript
        this.$router.push(url);
      }
    }
  }
  </script>