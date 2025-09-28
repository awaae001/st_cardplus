<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div class="app-settings">
      <div class="setting-card">
        <div class="setting-content">
          <div class="setting-header">
            <div class="setting-info">
              <span class="setting-label">PC端侧边栏自动展开</span>
              <Icon icon="fluent:sidebar-search-20-regular" width="20" height="20"
                :style="{ marginLeft: '8px', color: 'var(--el-color-primary)' }" />
            </div>
            <el-switch v-model="autoExpandSidebar" @change="onAutoExpandSidebarToggle" size="large" />
          </div>
          <p class="setting-description">在PC端，当侧边栏处于折叠状态时，鼠标移入时是否自动展开</p>
        </div>
      </div>
    </div>
    <div class="setting-card">
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">允许页面滚动</span>
            <Icon icon="ph:scroll" width="20" height="20"
              :style="{ marginLeft: '8px', color: 'var(--el-color-primary)' }" />
          </div>
          <el-switch v-model="allowBodyScroll" @change="onAllowBodyScrollToggle" size="large" />
        </div>
        <p class="setting-description">默认情况下，为了确保布局稳定，页面主体是禁止滚动的<br/>如果您需要滚动整个页面，请打开此开关</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { usePersonalization } from '@/composables/usePersonalization';

const { autoExpandSidebar, onAutoExpandSidebarToggle, allowBodyScroll, onAllowBodyScrollToggle } = usePersonalization();
</script>
<style scoped>
.app-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-card {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s ease;
}

.setting-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.setting-content {
  display: flex;
  flex-direction: column;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.setting-info {
  display: flex;
  align-items: center;
}

.setting-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.setting-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  margin: 0;
  text-align: left;
}

.interval-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interval-unit {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>