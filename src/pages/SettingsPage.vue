<template>
  <div class="settings-page">
    <!-- Tabs -->
    <el-tabs
      v-model="activeTab"
      class="settings-tabs"
    >
      <el-tab-pane
        label="应用设置"
        name="settings"
      >
        <div class="tab-content">
          <AppSettings />
        </div>
      </el-tab-pane>
      <el-tab-pane
        label="迁移与同步"
        name="data"
      >
        <div class="tab-content">
          <DataManagement />
        </div>
      </el-tab-pane>
      <el-tab-pane
        label="个性化"
        name="personalization"
      >
        <div class="tab-content">
          <PersonalizationSettings />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import AppSettings from '@/components/settingPage/AppSettings.vue';
import DataManagement from '@/components/settingPage/DataManagement.vue';
import PersonalizationSettings from '@/components/settingPage/PersonalizationSettings.vue';
import { ref } from 'vue';

const activeTab = ref('settings');
</script>

<style scoped>
@reference "tailwindcss";

.settings-page {
  @apply w-full min-h-full p-5 max-w-[800px] mx-auto;
}

/* Tabs 样式 */
.settings-tabs {
  @apply mt-0;
}

:deep(.el-tabs__header) {
  @apply mb-5 pb-0;
  border-bottom: 2px solid var(--el-border-color-lighter);
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__item) {
  @apply text-base font-medium px-5 py-3;
  color: var(--el-text-color-secondary);
  transition: all 0.2s ease;
}

:deep(.el-tabs__item:hover) {
  color: var(--el-color-primary);
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  @apply h-[3px] rounded-full;
  background: linear-gradient(90deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
}

.tab-content {
  @apply text-left;
}
</style>
