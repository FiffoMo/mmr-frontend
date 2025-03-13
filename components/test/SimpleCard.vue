<template>
  <div class="test-card relative bg-white border-2 border-gray-300 rounded-lg p-4 mb-4">
    <div style="position: absolute; top: 0; left: 0; background-color: red; color: white; font-weight: bold; padding: 10px; font-size: 20px; z-index: 9999;">
      TEST BADGE
    </div>
    <h3 class="text-xl mt-8">{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Test Title'
  },
  description: {
    type: String,
    default: 'Test description'
  }
});
</script>

<style scoped>
.test-card {
  min-height: 150px;
}
</style>