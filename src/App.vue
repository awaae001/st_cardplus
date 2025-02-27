<script setup lang="ts">
import { RouterView } from 'vue-router'
import Layout from './components/Layout.vue'
</script>

<template>
  <div class="app-container">
    <Layout>
      <RouterView />
    </Layout>
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
}
</style>
