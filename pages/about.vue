<template>
    <div class="container mx-auto px-4 py-8">
      <!-- Hero section -->
      <div class="relative bg-cyan-500 rounded-lg overflow-hidden mb-12">
        <div class="relative py-16 px-6 sm:py-24 lg:py-32">
          <h1 class="text-4xl font-bold text-white sm:text-5xl">À propos de nous</h1>
          <p class="mt-6 text-xl text-white max-w-3xl">
            Notre expertise en immobilier au service de votre projet, avec une approche innovante et personnalisée.
          </p>
        </div>
      </div>
  
      <!-- Mission section -->
      <div class="mb-16">
        <div class="text-center">
          <h2 class="text-base font-semibold text-cyan-600 tracking-wide uppercase">Notre mission</h2>
          <p class="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
            Simplifier l'immobilier pour tous
          </p>
          <p class="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Notre mission est de rendre la recherche et l'achat de biens immobiliers aussi simple et transparent que possible, en offrant les meilleurs outils et informations à nos utilisateurs.
          </p>
        </div>
      </div>
  
      <!-- Values section -->
      <div class="bg-slate-100 rounded-lg p-8 mb-16">
        <div class="lg:grid lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 class="text-3xl font-extrabold text-gray-900">
              Nos valeurs
            </h2>
            <p class="mt-4 text-lg text-gray-500">
              Ces principes fondamentaux guident toutes nos actions et décisions, de la conception de notre plateforme à notre relation avec nos clients et partenaires.
            </p>
          </div>
          <div class="mt-12 lg:mt-0">
            <dl class="space-y-10">
              <div v-for="(value, index) in values" :key="index" class="relative">
                <dt>
                  <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-cyan-500 text-white">
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="value.icon" />
                    </svg>
                  </div>
                  <p class="ml-16 text-lg leading-6 font-medium text-gray-900">{{ value.name }}</p>
                </dt>
                <dd class="mt-2 ml-16 text-base text-gray-500">{{ value.description }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
  
      <!-- Experience section -->
      <div class="mb-16">
        <div class="lg:grid lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 class="text-3xl font-extrabold tracking-tight text-gray-900">
              Notre expertise
            </h2>
            <p class="mt-4 text-lg text-gray-500">
              MMR est une jeune entreprise portée par une équipe dynamique qui cumule plus de 30 ans d'expérience dans l'immobilier et les services digitaux immobiliers.
            </p>
            <p class="mt-4 text-lg text-gray-500">
              Notre connaissance approfondie du marché local, combinée à notre maîtrise des outils numériques, nous permet d'offrir un service optimal aux vendeurs et aux acquéreurs.
            </p>
            <p class="mt-4 text-lg text-gray-500">
              Notre objectif est de vous accompagner dans toutes les étapes de votre projet immobilier, en vous offrant des conseils personnalisés et un suivi de qualité.
            </p>
          </div>
          <div class="mt-12 lg:mt-0 flex flex-col justify-center">
            <div class="bg-amber-50 rounded-lg p-6 border border-amber-200">
              <span class="text-2xl font-bold text-amber-600">+30</span>
              <p class="text-lg text-gray-700 mt-2">Années d'expérience cumulées</p>
            </div>
            <div class="bg-cyan-50 rounded-lg p-6 mt-4 border border-cyan-200">
              <span class="text-2xl font-bold text-cyan-600">100%</span>
              <p class="text-lg text-gray-700 mt-2">Satisfaction client</p>
            </div>
            <div class="bg-amber-50 rounded-lg p-6 mt-4 border border-amber-200">
              <span class="text-2xl font-bold text-amber-600">3</span>
              <p class="text-lg text-gray-700 mt-2">Experts à votre service</p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Team section -->
      <div class="bg-slate-100 rounded-lg p-8 mb-16">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold tracking-tight sm:text-4xl">Notre équipe</h2>
          <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
            Des professionnels passionnés qui travaillent chaque jour pour améliorer votre expérience immobilière.
          </p>
        </div>
        <div class="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
                    
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="h-20 w-20 rounded-full bg-cyan-500 flex items-center justify-center">
                  <span class="text-xl font-bold text-white">YC</span>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Yann Casanova</h3>
                  <p class="text-sm text-cyan-600">Directeur des ventes MMR</p>
                  <p class="text-sm text-gray-500">Agent immobilier indépendant</p>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <a href="#" class="text-gray-400 hover:text-cyan-500">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="h-20 w-20 rounded-full bg-cyan-500 flex items-center justify-center">
                  <span class="text-xl font-bold text-white">RC</span>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Ruth Casanova</h3>
                  <p class="text-sm text-cyan-600">Directrice de la communication MMR</p>
                  <p class="text-sm text-gray-500">Community Manager</p>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <a href="#" class="text-gray-400 hover:text-cyan-500">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-6">
              <div class="flex items-center">
                <div class="h-20 w-20 rounded-full bg-cyan-500 flex items-center justify-center">
                  <span class="text-xl font-bold text-white">PM</span>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Philippe Morselli</h3>
                  <p class="text-sm text-cyan-600">Directeur administratif MMR</p>
                  <p class="text-sm text-gray-500">Développeur web et Graphiste</p>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <a href="#" class="text-gray-400 hover:text-cyan-500">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clip-rule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- CTA section -->
      <div class="bg-cyan-500 rounded-lg mb-16">
        <div class="max-w-2xl mx-auto text-center py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-extrabold text-white sm:text-3xl">
            <span class="block">Prêt à trouver votre prochain chez-vous ?</span>
          </h2>
          <p class="mt-4 text-lg leading-6 text-cyan-100">
            Explorez notre sélection de biens immobiliers et trouvez celui qui correspond parfaitement à vos besoins.
          </p>
          <a href="/annonces" class="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-cyan-600 bg-white hover:bg-cyan-50 sm:w-auto">
            Voir les annonces
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AboutPage',
    data() {
      return {
        values: [
          {
            name: 'Transparence',
            description: 'Nous croyons en une communication claire et honnête avec nos utilisateurs et partenaires.',
            icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
          },
          {
            name: 'Expertise',
            description: 'Notre équipe cumule plus de 30 ans d\'expérience dans l\'immobilier et les services digitaux en immobilier.',
            icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
          },
          {
            name: 'Qualité',
            description: 'Nous nous engageons à offrir un service de haute qualité et des informations fiables.',
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
          },
          {
            name: 'Accessibilité',
            description: 'Nous travaillons pour rendre l\'immobilier accessible à tous, quels que soient leurs moyens ou leurs connaissances.',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
          }
        ]
      }
    }
  }
  </script>