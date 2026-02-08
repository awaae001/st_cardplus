<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <!-- 侧边栏默认展开 -->
    <div class="setting-card">
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">侧边栏默认展开</span>
            <Icon
              icon="ph:sidebar-simple"
              width="20"
              height="20"
              :style="{ marginLeft: '8px', color: 'var(--el-color-primary)' }"
            />
          </div>
          <el-switch
            v-model="autoExpandSidebar"
            @change="onAutoExpandSidebarToggle"
            size="large"
          />
        </div>
        <p class="setting-description">
          开启后，桌面端侧边栏将默认展开显示菜单文字
          <br />
          关闭后，侧边栏仅显示图标
        </p>
      </div>
    </div>

    <!-- 允许页面滚动 -->
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
import { getSetting, setSetting } from '@/utils/localStorageUtils';
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';
import SidebarManagement from './SidebarManagement.vue';

const { allowBodyScroll, onAllowBodyScrollToggle } = usePersonalization();

// 侧边栏展开设置（仅影响下次打开时的默认状态）
const autoExpandSidebar = ref(false);

onMounted(() => {
  autoExpandSidebar.value = getSetting('autoExpandSidebar');
});

const onAutoExpandSidebarToggle = (value: boolean) => {
  setSetting('autoExpandSidebar', value);
  // 仅保存设置，不实时改变当前侧边栏状态
};
</script>
<style scoped>
/* 使用全局 settings.css 中定义的通用样式 */
</style>
