<template>
  <div class="settings-page">
    <Setting />
  </div>
</template>

<script setup lang="ts">
import Setting from '@/components/setting.vue';
</script>

<style scoped>
@reference "tailwindcss";

.settings-page {
  @apply w-full h-full;
}
</style>
