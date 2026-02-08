<template>
  <div class="settings-page">
    <!-- Hero 标题卡片 -->
    <div class="hero-card">
      <div class="hero-icon">
        <el-icon :size="32"><Setting /></el-icon>
      </div>
      <div class="hero-content">
        <h1>设置</h1>
        <p class="subtitle">管理自己的自定义设置</p>
      </div>
    </div>

    <!-- 现代 Tabs -->
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
import { Setting } from '@element-plus/icons-vue';
import { ref } from 'vue';

const activeTab = ref('settings');
</script>

<style scoped>
@reference "tailwindcss";

.settings-page {
  @apply w-full min-h-full p-5 max-w-[800px] mx-auto;
}

/* Hero 标题卡片 */
.hero-card {
  @apply flex items-center gap-4 p-5 rounded-xl mb-6;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-7) 100%);
  border: 1px solid var(--el-color-primary-light-5);
}

.hero-icon {
  @apply flex items-center justify-center w-14 h-14 rounded-xl;
  background: var(--el-color-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
}

.hero-content h1 {
  @apply text-2xl font-bold m-0;
  color: var(--el-text-color-primary);
}

.hero-content .subtitle {
  @apply text-sm mt-1 m-0;
  color: var(--el-text-color-secondary);
}

/* 现代 Tabs 样式 */
.settings-tabs {
  @apply mt-4;
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

/* 暗色模式适配 */
:global(.dark) .hero-card {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
  border-color: rgba(64, 158, 255, 0.2);
}

:global(.dark) .hero-icon {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}
</style>
