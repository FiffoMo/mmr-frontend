<template>
  <div class="border-r border-gray-200 h-full">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold">Mon compte</h2>
    </div>
    <nav class="p-4">
      <ul class="space-y-2">
        <li>
          <NuxtLink to="/mon-compte" class="block p-2 rounded hover:bg-gray-100" exact-active-class="bg-blue-100 text-blue-700">
            Tableau de bord
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/mon-compte/annonces" class="block p-2 rounded hover:bg-gray-100" active-class="bg-blue-100 text-blue-700">
            Mes annonces
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/mon-compte/publicites" class="block p-2 rounded hover:bg-gray-100" active-class="bg-blue-100 text-blue-700">
            Mes publicités
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/mon-compte/commandes" class="block p-2 rounded hover:bg-gray-100" active-class="bg-blue-100 text-blue-700">
            Mes commandes
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/mon-compte/messages" class="block p-2 rounded hover:bg-gray-100" active-class="bg-blue-100 text-blue-700">
            Messages
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/mon-compte/parametres" class="block p-2 rounded hover:bg-gray-100" active-class="bg-blue-100 text-blue-700">
            Paramètres
          </NuxtLink>
        </li>
        <li class="pt-4 border-t border-gray-200 mt-4">
          <button class="block w-full text-left p-2 rounded text-red-600 hover:bg-red-50">
            Déconnexion
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>