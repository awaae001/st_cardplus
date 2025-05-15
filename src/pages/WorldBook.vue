// src/pages/WorldBook.vue
<template>
  <div class="world-page">
    <WorldBookEditor />
  </div>
</template>

<script setup lang="ts">
import WorldBookEditor from "../components/WorldBookEditor.vue";
</script>

<style scoped>
.world-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.world-page > :deep(.world-book-editor-container) {
  flex-grow: 1;
  overflow-y: auto; /* 如果内容超出，允许滚动 */
}
</style>
