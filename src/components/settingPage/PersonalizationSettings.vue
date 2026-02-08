<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div class="setting-card">
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">允许页面滚动</span>
            <Icon
              icon="ph:scroll"
              width="20"
              height="20"
              :style="{ marginLeft: '8px', color: 'var(--el-color-primary)' }"
            />
          </div>
          <el-switch
            v-model="allowBodyScroll"
            @change="onAllowBodyScrollToggle"
            size="large"
          />
        </div>
        <p class="setting-description">
          默认情况下，为了确保布局稳定，页面主体是禁止滚动的
          <br />
          如果您需要滚动整个页面，请打开此开关
        </p>
      </div>
    </div>

    <!-- 导航栏管理组件 -->
    <SidebarManagement />
  </div>
</template>

<script setup lang="ts">
import { usePersonalization } from '@/composables/usePersonalization';
import { Icon } from '@iconify/vue';
import SidebarManagement from './SidebarManagement.vue';

const { allowBodyScroll, onAllowBodyScrollToggle } = usePersonalization();
</script>
<style scoped>
/* 使用全局 settings.css 中定义的通用样式 */
</style>
