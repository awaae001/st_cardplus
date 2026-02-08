<template>
  <el-drawer
    v-model="visible"
    direction="rtl"
    :with-header="false"
    size="300px"
    class="mobile-drawer"
  >
    <div class="drawer-container">
      <!-- 头部区域 -->
      <div class="drawer-header">
        <div class="header-content">
          <img
            src="/image/logo.png"
            alt="Logo"
            class="drawer-logo"
          />
          <div class="header-text">
            <h2 class="app-name">ST CardPlus</h2>
            <p class="app-slogan">角色卡编辑工具</p>
          </div>
        </div>
        <el-button
          :icon="Close"
          circle
          class="close-btn"
          @click="visible = false"
        />
      </div>

      <!-- 菜单区域 -->
      <div class="drawer-menu">
        <div
          v-for="item in allMenuItems"
          :key="item.id"
          class="menu-item"
          :class="{ active: isActive(item.index) }"
          @click="handleMenuClick(item.index)"
        >
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>
          <span class="menu-text">{{ item.title }}</span>
          <span
            v-if="item.beta"
            class="beta-tag"
          >
            Beta
          </span>
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="drawer-footer">
        <div class="footer-actions">
          <div
            class="action-item"
            @click="toggleDark()"
          >
            <el-icon :size="20">
              <Moon v-if="!isDark" />
              <Sunny v-else />
            </el-icon>
            <span>{{ isDark ? '浅色模式' : '暗黑模式' }}</span>
          </div>
          <div
            class="action-item"
            @click="handleMenuClick('/about')"
          >
            <el-icon :size="20"><Setting /></el-icon>
            <span>设置与关于</span>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation';
import { Close, Moon, Setting, Sunny } from '@element-plus/icons-vue';
import { ElButton, ElDrawer, ElIcon } from 'element-plus';

// Model
const visible = defineModel<boolean>({ default: false });

// 使用导航上下文
const { allMenuItems, isDark, toggleDark, isActive, navigateTo } = useNavigation();

// 菜单点击
const handleMenuClick = (path: string) => {
  navigateTo(path);
  visible.value = false;
};
</script>

<style scoped>
@reference "tailwindcss";

/* 抽屉容器 */
.drawer-container {
  @apply flex flex-col h-full;
  background: var(--el-bg-color);
}

/* 头部区域 */
.drawer-header {
  @apply flex items-center justify-between p-5 pt-6 rounded-2xl;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-content {
  @apply flex items-center gap-3;
}

.drawer-logo {
  @apply w-12 h-12 rounded-xl shadow-lg;
}

.header-text {
  @apply flex flex-col gap-0.5;
}

.app-name {
  @apply m-0 text-lg font-semibold;
  color: var(--el-text-color-primary);
}

.app-slogan {
  @apply m-0 text-xs;
  color: var(--el-text-color-secondary);
}

/* 关闭按钮 */
.close-btn {
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-regular);
}

.close-btn:hover {
  background: var(--el-fill-color-dark);
  color: var(--el-text-color-primary);
}

/* 菜单区域 */
.drawer-menu {
  @apply flex-1 p-3 overflow-y-auto;
}

.menu-item {
  @apply flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer mb-1 transition-all duration-200;
  color: var(--el-text-color-regular);
}

.menu-item:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.menu-item:active {
  @apply scale-98;
}

.menu-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.menu-text {
  @apply flex-1 text-[15px];
}

/* Beta 标签 */
.beta-tag {
  @apply text-[10px] px-1.5 py-0.5 rounded font-medium;
  background: var(--el-color-warning-light-7);
  color: var(--el-color-warning-dark-2);
}

/* 底部区域 */
.drawer-footer {
  @apply p-4;
  border-top: 1px solid var(--el-border-color-lighter);
}

.footer-actions {
  @apply flex flex-col gap-2;
}

.action-item {
  @apply flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200;
  color: var(--el-text-color-secondary);
}

.action-item:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.action-item:active {
  @apply scale-98;
}
</style>
