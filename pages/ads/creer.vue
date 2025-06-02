<template>
  <div>
    <!-- Redirection vers la page de modification sans ID = création -->
    <PubliciteModifier />
  </div>
</template>

<script>
import PubliciteModifier from './modifier.vue';

export default {
  name: 'PubliciteCreer',
  components: {
    PubliciteModifier
  }
}
</script>