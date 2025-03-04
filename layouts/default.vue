<template>
  <div class="min-h-screen flex flex-col">
    <NavBar />
    <main class="flex-grow">
      <slot />
    </main>
    <FooterComponent />
  </div>
</template>

<script setup>
import NavBar from '~/components/layout/NavBar.vue';
import FooterComponent from '~/components/layout/Footer.vue';
</script>