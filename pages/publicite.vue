<!-- pages/publicite.vue -->
<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-center mb-2">Espaces publicitaires</h1>
    <p class="text-xl text-center text-gray-600 mb-12">Attirez l'attention de notre audience d'investisseurs immobiliers</p>
    
    <!-- Statistiques du site -->
    <div class="bg-gray-50 rounded-lg p-8 mb-12">
      <h2 class="text-2xl font-bold mb-6 text-center">Notre audience</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="text-4xl font-bold text-cyan-600 mb-2">15 000+</div>
          <p class="text-gray-600">Visiteurs uniques par mois</p>
        </div>
        
        <div class="text-center">
          <div class="text-4xl font-bold text-cyan-600 mb-2">75%</div>
          <p class="text-gray-600">Sont des investisseurs ou futurs investisseurs</p>
        </div>
        
        <div class="text-center">
          <div class="text-4xl font-bold text-cyan-600 mb-2">8 min</div>
          <p class="text-gray-600">Temps moyen passé sur le site</p>
        </div>
      </div>
    </div>
    
    <!-- Emplacements publicitaires -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-center mb-8">Nos emplacements</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Emplacement 1 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="relative h-48 bg-gray-200">
            <div class="w-full h-full bg-gray-300 flex items-center justify-center">
                <span class="text-gray-600 font-medium">Image bannière header</span>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
              HEADER
            </div>
          </div>
          
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">Bannière header</h3>
            <p class="text-gray-600 mb-4">Bannière en haut de toutes les pages du site.</p>
            
            <div class="mb-4">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">Visibilité</span>
                <span class="text-sm font-medium">Très élevée</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-cyan-500 h-2 rounded-full" style="width: 95%"></div>
              </div>
            </div>
            
            <div class="mb-6">
              <div class="text-lg font-bold">
                999€ <span class="text-sm font-normal text-gray-500">/ mois</span>
              </div>
              <div class="text-sm text-gray-500">Dimensions: 728x90px</div>
            </div>
            
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Réserver cet espace
            </button>
          </div>
        </div>
        
        <!-- Emplacement 2 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="relative h-48 bg-gray-200">
            <div class="w-full h-full bg-gray-300 flex items-center justify-center">
                <span class="text-gray-600 font-medium">Image bannière header</span>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
              SIDEBAR
            </div>
          </div>
          
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">Encart sidebar</h3>
            <p class="text-gray-600 mb-4">Encart publicitaire dans la barre latérale des pages d'annonces.</p>
            
            <div class="mb-4">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">Visibilité</span>
                <span class="text-sm font-medium">Élevée</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-cyan-500 h-2 rounded-full" style="width: 80%"></div>
              </div>
            </div>
            
            <div class="mb-6">
              <div class="text-lg font-bold">
                699€ <span class="text-sm font-normal text-gray-500">/ mois</span>
              </div>
              <div class="text-sm text-gray-500">Dimensions: 300x250px</div>
            </div>
            
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Réserver cet espace
            </button>
          </div>
        </div>
        
        <!-- Emplacement 3 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="relative h-48 bg-gray-200">
            <div class="w-full h-full bg-gray-300 flex items-center justify-center">
                <span class="text-gray-600 font-medium">Image bannière header</span>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
              ARTICLE
            </div>
          </div>
          
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">Article sponsorisé</h3>
            <p class="text-gray-600 mb-4">Article rédigé par nos soins mettant en avant votre service ou produit.</p>
            
            <div class="mb-4">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">Visibilité</span>
                <span class="text-sm font-medium">Très élevée</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-cyan-500 h-2 rounded-full" style="width: 90%"></div>
              </div>
            </div>
            
            <div class="mb-6">
              <div class="text-lg font-bold">
                899€ <span class="text-sm font-normal text-gray-500">/ article</span>
              </div>
              <div class="text-sm text-gray-500">Article + promotion</div>
            </div>
            
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Réserver cet espace
            </button>
          </div>
        </div>
        
        <!-- Emplacement 4 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="relative h-48 bg-gray-200">
            <div class="w-full h-full bg-gray-300 flex items-center justify-center">
              <span class="text-gray-600 font-medium">Image bannière header</span>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
              NEWSLETTER
            </div>
          </div>
          
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">Bannière newsletter</h3>
            <p class="text-gray-600 mb-4">Votre publicité dans notre newsletter hebdomadaire envoyée à plus de 5000 abonnés.</p>
            
            <div class="mb-4">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">Visibilité</span>
                <span class="text-sm font-medium">Ciblée</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-cyan-500 h-2 rounded-full" style="width: 75%"></div>
              </div>
            </div>
            
            <div class="mb-6">
              <div class="text-lg font-bold">
                499€ <span class="text-sm font-normal text-gray-500">/ envoi</span>
              </div>
              <div class="text-sm text-gray-500">Dimensions: 600x150px</div>
            </div>
            
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Réserver cet espace
            </button>
          </div>
        </div>
        
        <!-- Emplacement 5 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="relative h-48 bg-gray-200">
            <div class="w-full h-full bg-gray-300 flex items-center justify-center">
                <span class="text-gray-600 font-medium">Image bannière header</span>
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
              FOOTER
            </div>
          </div>
          
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2">Bannière footer</h3>
            <p class="text-gray-600 mb-4">Bannière publicitaire située en bas de toutes les pages du site.</p>
            
            <div class="mb-4">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">Visibilité</span>
                <span class="text-sm font-medium">Moyenne</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-cyan-500 h-2 rounded-full" style="width: 60%"></div>
              </div>
            </div>
            
            <div class="mb-6">
              <div class="text-lg font-bold">
                399€ <span class="text-sm font-normal text-gray-500">/ mois</span>
              </div>
              <div class="text-sm text-gray-500">Dimensions: 728x90px</div>
            </div>
            
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Réserver cet espace
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Offres pack -->
    <div class="mb-16">
      <h2 class="text-2xl font-bold text-center mb-8">Nos packs publicitaires</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Pack 1 -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-cyan-200">
          <div class="p-6 bg-cyan-50">
            <h3 class="text-2xl font-bold mb-1">Pack Visibilité</h3>
            <p class="text-gray-600 mb-4">Idéal pour les campagnes courtes et intenses</p>
            <div class="text-2xl font-bold">
              1499€ <span class="text-base font-normal text-gray-500">/ mois</span>
            </div>
            <div class="text-sm text-gray-500">Économisez 25% par rapport aux tarifs individuels</div>
          </div>
          
          <div class="p-6">
            <ul class="space-y-3 mb-6">
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Bannière header (1 mois)</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Encart sidebar (1 mois)</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>1 Newsletter dédiée</span>
              </li>
            </ul>
            
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Acheter ce pack
            </button>
          </div>
        </div>
        
        <!-- Pack 2 -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-cyan-200">
          <div class="p-6 bg-cyan-50">
            <h3 class="text-2xl font-bold mb-1">Pack Prestige</h3>
            <p class="text-gray-600 mb-4">Une présence complète sur notre plateforme</p>
            <div class="text-2xl font-bold">
              2699€ <span class="text-base font-normal text-gray-500">/ trimestre</span>
            </div>
            <div class="text-sm text-gray-500">Économisez 35% par rapport aux tarifs individuels</div>
          </div>
          
          <div class="p-6">
            <ul class="space-y-3 mb-6">
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Bannière header (3 mois)</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Encart sidebar (3 mois)</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>1 Article sponsorisé</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>3 Newsletters dédiées</span>
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Publicité footer (3 mois)</span>
              </li>
            </ul>
            
            <button class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors">
              Acheter ce pack
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Formulaire de contact -->
    <div class="bg-gray-50 rounded-lg p-8">
      <h2 class="text-2xl font-bold text-center mb-8">Intéressé(e) par nos offres ?</h2>
      
      <form class="max-w-xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="name" class="block text-gray-700 mb-1">Nom</label>
            <input 
              type="text" 
              id="name" 
              class="w-full border rounded p-2" 
              placeholder="Votre nom"
            />
          </div>
          
          <div>
            <label for="email" class="block text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              id="email" 
              class="w-full border rounded p-2" 
              placeholder="Votre email"
            />
          </div>
        </div>
        
        <div class="mb-4">
          <label for="company" class="block text-gray-700 mb-1">Entreprise</label>
          <input 
            type="text" 
            id="company" 
            class="w-full border rounded p-2" 
            placeholder="Nom de votre entreprise"
          />
        </div>
        
        <div class="mb-4">
          <label for="interest" class="block text-gray-700 mb-1">Espace(s) publicitaire(s) qui vous intéresse(nt)</label>
          <select id="interest" class="w-full border rounded p-2">
            <option value="">Sélectionnez une option</option>
            <option value="header">Bannière header</option>
            <option value="sidebar">Encart sidebar</option>
            <option value="article">Article sponsorisé</option>
            <option value="newsletter">Bannière newsletter</option>
            <option value="footer">Bannière footer</option>
            <option value="pack1">Pack Visibilité</option>
            <option value="pack2">Pack Prestige</option>
            <option value="other">Autre / Je ne sais pas encore</option>
          </select>
        </div>
        
        <div class="mb-6">
          <label for="message" class="block text-gray-700 mb-1">Message</label>
          <textarea 
            id="message" 
            class="w-full border rounded p-2" 
            rows="4" 
            placeholder="Précisez votre demande ou vos questions"
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          class="w-full py-2 px-4 bg-cyan-500 text-white text-center rounded hover:bg-cyan-600 transition-colors"
        >
          Envoyer ma demande
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: 'Espaces publicitaires - Ma Maison Rapporte',
      meta: [
        { hid: 'description', name: 'description', content: 'Découvrez nos espaces publicitaires pour toucher une audience d\'investisseurs immobiliers. Bannières, articles sponsorisés et newsletters.' }
      ]
    }
  }
}
</script>