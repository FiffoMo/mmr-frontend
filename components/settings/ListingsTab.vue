<template>
    <div class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Gestion des annonces</h2>
        <a 
          href="/publier-annonce" 
          class="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-700"
        >
          + Nouvelle annonce
        </a>
      </div>
      
      <!-- Chargement -->
      <div v-if="loading" class="py-10 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <p class="mt-2 text-gray-500">Chargement des annonces...</p>
      </div>
  
      <!-- Liste vide -->
      <div v-else-if="listings.length === 0" class="bg-gray-100 p-8 rounded-lg text-center">
        <p class="text-gray-500">Vous n'avez pas encore publié d'annonces.</p>
        <a href="/publier-annonce" class="mt-2 inline-block text-cyan-600 hover:text-cyan-900 hover:underline">
          Publier votre première annonce
        </a>
      </div>
      
      <!-- Liste des annonces -->
      <div v-else class="space-y-4">
        <div v-for="listing in listings" :key="listing.id" class="bg-gray-100 p-4 rounded-lg">
          <div class="flex flex-col md:flex-row">
            <img :src="listing.image" alt="Propriété" class="w-24 h-24 object-cover rounded-md" />
            <div class="md:ml-4 mt-2 md:mt-0 flex-grow">
              <div class="flex justify-between">
                <h3 class="font-medium">{{ listing.title }}</h3>
                <span 
                  :class="[
                    'text-xs px-2 py-1 rounded-full',
                    listing.status === 'active' ? 'bg-green-100 text-green-800' : 
                    listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  ]"
                >
                  {{ 
                    listing.status === 'active' ? 'Active' : 
                    listing.status === 'pending' ? 'En attente' : 
                    'Expirée' 
                  }}
                </span>
              </div>
              <p class="text-sm text-gray-600">
                {{ listing.type }} - {{ listing.location }} - {{ formatPrice(listing.price) }}
              </p>
              <div class="mt-2 flex flex-wrap gap-2 text-sm">
                <span class="text-cyan-600 hover:text-cyan-900 hover:underline cursor-pointer" @click="editListing(listing.id)">
                  Modifier
                </span>
                <span 
                  v-if="listing.status === 'expired'"
                  class="text-cyan-600 hover:text-cyan-900 hover:underline cursor-pointer" 
                  @click="renewListing(listing.id)"
                >
                  Renouveler
                </span>
                <span class="text-red-600 hover:text-red-900 hover:underline cursor-pointer" @click="deleteListing(listing.id)">
                  Supprimer
                </span>
                <a 
                  :href="`/annonces/detail-${listing.id}`" 
                  class="text-cyan-600 hover:text-cyan-900 hover:underline"
                >
                  Voir l'annonce
                </a>
              </div>
            </div>
            <div class="mt-3 md:mt-0 md:ml-4 text-right text-sm">
              <p>Vues: {{ listing.views }}</p>
              <p>Publiée le: {{ formatDate(listing.createdAt) }}</p>
              <p>Expire le: {{ formatDate(listing.expiresAt) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Forfaits d'annonces -->
      <div class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 mb-3">Mes forfaits d'annonces</h3>
        <div class="bg-gray-100 p-4 rounded-lg">
          <!-- Chargement -->
          <div v-if="loadingPackages" class="py-4 text-center">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
            <p class="mt-2 text-gray-500">Chargement des forfaits...</p>
          </div>
          
          <!-- Pas de forfaits -->
          <div v-else-if="listingPackages.length === 0" class="text-center py-4">
            <p class="text-gray-500">Vous n'avez pas encore de forfait actif.</p>
            <button 
              @click="showPackages = true" 
              class="mt-2 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-700"
            >
              Voir les forfaits disponibles
            </button>
          </div>
          
          <!-- Liste des forfaits -->
          <div v-else class="space-y-4">
            <div v-for="pkg in listingPackages" :key="pkg.id" class="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div class="flex justify-between">
                <div>
                  <h4 class="font-medium">{{ pkg.name }}</h4>
                  <p class="text-sm text-gray-600">
                    {{ pkg.remainingListings }} annonces restantes sur {{ pkg.totalListings }}
                  </p>
                  <p class="text-sm text-gray-600">Expire le {{ formatDate(pkg.expiresAt) }}</p>
                </div>
                <button 
                  v-if="pkg.remainingListings > 0" 
                  class="px-3 py-1.5 bg-cyan-500 text-white text-sm rounded-md hover:bg-cyan-700 self-start"
                  @click="() => window.location.href = '/publier-annonce'"
                >
                  Utiliser
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal pour afficher les forfaits disponibles -->
      <div v-if="showPackages" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg max-w-2xl w-full p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-medium text-gray-900">Forfaits disponibles</h3>
            <button @click="showPackages = false" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="grid gap-4 sm:grid-cols-2">
            <div 
              v-for="(pkg, index) in availablePackages" 
              :key="index" 
              class="border rounded-lg p-4 flex flex-col"
              :class="{'border-cyan-500 bg-cyan-50': pkg.recommended}"
            >
              <div class="mb-4">
                <div v-if="pkg.recommended" class="text-xs text-white bg-cyan-500 rounded-full px-2 py-1 inline-block mb-2">
                  Recommandé
                </div>
                <h4 class="text-lg font-medium">{{ pkg.name }}</h4>
                <p class="text-gray-600">{{ pkg.description }}</p>
              </div>
              
              <div class="mb-4">
                <p class="text-2xl font-bold">{{ formatPrice(pkg.price) }}</p>
                <p class="text-sm text-gray-500">{{ pkg.duration }}</p>
              </div>
              
              <ul class="mb-4 flex-grow">
                <li v-for="(feature, idx) in pkg.features" :key="idx" class="flex items-start mb-2">
                  <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{{ feature }}</span>
                </li>
              </ul>
              
              <button 
                @click="selectPackage(pkg)" 
                class="mt-auto w-full rounded-md py-2 px-4 text-center font-medium"
                :class="pkg.recommended ? 'bg-cyan-500 text-white hover:bg-cyan-700' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'"
              >
                Sélectionner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ListingsTab',
    
    data() {
      return {
        // Données des annonces
        listings: [],
        
        // Forfaits
        listingPackages: [],
        
        // États de chargement
        loading: false,
        loadingPackages: false,
        
        // Modal
        showPackages: false,
        
        // Forfaits disponibles
        availablePackages: [
          {
            id: 'basic',
            name: 'Forfait Basique',
            description: 'Idéal pour débuter',
            price: 29.99,
            duration: '1 mois',
            totalListings: 3,
            features: [
              '3 annonces simultanées',
              'Durée de 30 jours',
              'Photos HD illimitées',
              'Alertes par email'
            ]
          },
          {
            id: 'standard',
            name: 'Forfait Standard',
            description: 'Notre offre la plus populaire',
            price: 79.99,
            duration: '3 mois',
            totalListings: 5,
            recommended: true,
            features: [
              '5 annonces simultanées',
              'Durée de 90 jours',
              'Photos HD illimitées',
              'Mise en avant 7 jours',
              'Statistiques détaillées',
              'Support prioritaire'
            ]
          },
          {
            id: 'premium',
            name: 'Forfait Premium',
            description: 'Pour les professionnels',
            price: 149.99,
            duration: '6 mois',
            totalListings: 10,
            features: [
              '10 annonces simultanées',
              'Durée de 180 jours',
              'Photos HD illimitées',
              'Mise en avant 14 jours',
              'Statistiques détaillées',
              'Support prioritaire 24/7',
              'Visites virtuelles'
            ]
          },
          {
            id: 'pro',
            name: 'Forfait Pro',
            description: 'Usage intensif',
            price: 249.99,
            duration: '12 mois',
            totalListings: 25,
            features: [
              '25 annonces simultanées',
              'Durée de 365 jours',
              'Photos HD illimitées',
              'Mise en avant 30 jours',
              'Statistiques détaillées',
              'Support prioritaire 24/7',
              'Visites virtuelles',
              'Badge Pro sur les annonces',
              'Export des contacts'
            ]
          }
        ]
      };
    },
    
    created() {
      // Charger les annonces et les forfaits au montage du composant
      this.fetchListings();
      this.fetchPackages();
    },
    
    methods: {
      // Récupération des annonces
      async fetchListings() {
        this.loading = true;
        
        try {
          // Dans un cas réel, ce serait un appel API
          // const response = await api.getUserListings();
          // this.listings = response;
          
          // Pour l'exemple, nous utilisons des données fictives
          this.listings = [
            {
              id: 201,
              title: 'Appartement lumineux 4 pièces',
              type: 'Appartement',
              location: 'Lyon',
              price: 350000,
              status: 'active',
              views: 45,
              createdAt: new Date('2024-12-01'),
              expiresAt: new Date('2025-06-01'),
              image: '/images/dummy/apt2.jpg'
            },
            {
              id: 202,
              title: 'Maison de campagne rénovée',
              type: 'Maison',
              location: 'Aix-en-Provence',
              price: 520000,
              status: 'pending',
              views: 12,
              createdAt: new Date('2025-02-15'),
              expiresAt: new Date('2025-08-15'),
              image: '/images/dummy/house2.jpg'
            },
            {
              id: 203,
              title: 'Studio étudiant proche fac',
              type: 'Studio',
              location: 'Toulouse',
              price: 85000,
              status: 'expired',
              views: 102,
              createdAt: new Date('2024-09-10'),
              expiresAt: new Date('2025-03-10'),
              image: '/images/dummy/studio2.jpg'
            }
          ];
          
          // Simuler une latence
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Erreur lors du chargement des annonces:', error);
        } finally {
          this.loading = false;
        }
      },
      
      // Récupération des forfaits
      async fetchPackages() {
        this.loadingPackages = true;
        
        try {
          // Dans un cas réel, ce serait un appel API
          // const response = await api.getUserPackages();
          // this.listingPackages = response;
          
          // Pour l'exemple, nous utilisons des données fictives
          this.listingPackages = [
            {
              id: 301,
              name: 'Forfait Standard - 3 mois',
              totalListings: 5,
              remainingListings: 2,
              expiresAt: new Date('2025-06-15')
            }
          ];
          
          // Simuler une latence
          await new Promise(resolve => setTimeout(resolve, 700));
        } catch (error) {
          console.error('Erreur lors du chargement des forfaits:', error);
        } finally {
          this.loadingPackages = false;
        }
      },
      
      // Éditer une annonce
      editListing(id) {
        // Redirection vers la page d'édition
        window.location.href = `/publier-annonce?edit=${id}`;
      },
      
      // Renouveler une annonce
      async renewListing(id) {
        try {
          // Vérifier si l'utilisateur a des crédits disponibles
          const hasCredits = this.listingPackages.some(pkg => pkg.remainingListings > 0);
          
          if (hasCredits) {
            if (confirm('Voulez-vous utiliser un crédit de votre forfait pour renouveler cette annonce ?')) {
              // Dans un cas réel, ce serait un appel API
              // await api.renewListing(id);
              
              alert('Annonce renouvelée avec succès');
              this.fetchListings(); // Rafraîchir les annonces
              this.fetchPackages(); // Rafraîchir les forfaits
            }
          } else {
            // Proposer d'acheter un forfait
            if (confirm('Vous n\'avez pas de crédits disponibles. Souhaitez-vous voir les forfaits disponibles ?')) {
              this.showPackages = true;
            }
          }
        } catch (error) {
          console.error('Erreur lors du renouvellement de l\'annonce:', error);
          alert('Une erreur est survenue lors du renouvellement de l\'annonce');
        }
      },
      
      // Supprimer une annonce
      async deleteListing(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?')) {
          return;
        }
        
        try {
          // Dans un cas réel, ce serait un appel API
          // await api.deleteListing(id);
          
          // Simuler la suppression dans les données locales
          this.listings = this.listings.filter(listing => listing.id !== id);
          alert('Annonce supprimée avec succès');
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'annonce:', error);
          alert('Une erreur est survenue lors de la suppression de l\'annonce');
        }
      },
      
      // Sélectionner un forfait
      async selectPackage(pkg) {
        try {
          // Dans un cas réel, on redirigerait vers une page de paiement
          // window.location.href = `/payment?package=${pkg.id}`;
          
          // Pour l'exemple, nous simulons un achat réussi
          alert(`Vous allez être redirigé vers la page de paiement pour le forfait ${pkg.name}`);
          this.showPackages = false;
        } catch (error) {
          console.error('Erreur lors de la sélection du forfait:', error);
        }
      },
      
      // Formater un prix
      formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
      },
      
      // Formater une date
      formatDate(date) {
        return new Intl.DateTimeFormat('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }).format(date);
      }
    }
  };
  </script>