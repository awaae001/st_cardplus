<template>
  <div class="migration-page">
    <DatabaseMigrationHelper />
  </div>
</template>

<script setup lang="ts">
import DatabaseMigrationHelper from '@/components/toolsbox/DatabaseMigrationHelper.vue';
</script>

<style scoped>
.migration-page {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
}
</style>