<template>
  <div class="min-h-screen flex flex-col">
    <NavBar />
    <div class="flex-grow flex container mx-auto px-4 py-8">
      <aside class="w-64 pr-8 hidden md:block">
        <ClientSidebar />
      </aside>
      <main class="flex-grow">
        <slot />
      </main>
    </div>
    <FooterComponent />
  </div>
</template>

<script setup>
import NavBar from '~/components/layout/NavBar.vue';
import FooterComponent from '~/components/layout/Footer.vue';
import ClientSidebar from '~/components/layout/ClientSidebar.vue';
</script>