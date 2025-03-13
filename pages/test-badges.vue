<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-6">Test des badges</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SimpleCard title="Card 1" description="Testing badges visibility" />
      <SimpleCard title="Card 2" description="Another test card" />
      <SimpleCard title="Card 3" description="Third test card" />
    </div>
  </div>
</template>

<script setup>
import SimpleCard from '~/components/test/SimpleCard.vue';
</script>