<template>
  <aside
    class="app-sidebar"
    :class="{ 'sidebar-expanded': sidebarExpanded }"
  >
    <!-- 顶部 Logo -->
    <div
      class="sidebar-logo"
      @click="navigateTo('/')"
    >
      <img
        src="/image/logo.png"
        alt="Logo"
        class="logo-img"
      />
      <span class="logo-text">ST CardPlus</span>
    </div>

    <!-- 主要导航项 -->
    <nav class="sidebar-nav">
      <el-tooltip
        v-for="item in mainNavItems"
        :key="item.index"
        :content="item.title + (item.beta ? ' (Beta)' : '')"
        placement="right"
        :show-after="200"
        :disabled="sidebarExpanded"
      >
        <router-link
          :to="item.index"
          class="nav-item"
          :class="{ active: isActive(item.index) }"
        >
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-text">{{ item.title }}</span>
          <span
            v-if="item.beta && sidebarExpanded"
            class="beta-tag"
          >
            Beta
          </span>
          <span
            v-if="item.beta && !sidebarExpanded"
            class="beta-dot"
          ></span>
        </router-link>
      </el-tooltip>
    </nav>

    <!-- 底部固定项 -->
    <div class="sidebar-footer">
      <!-- 工具箱 -->
      <el-tooltip
        v-if="toolboxItem"
        :content="toolboxItem.title"
        placement="right"
        :show-after="200"
        :disabled="sidebarExpanded"
      >
        <router-link
          :to="toolboxItem.index"
          class="nav-item"
          :class="{ active: isActive(toolboxItem.index) }"
        >
          <el-icon :size="20">
            <component :is="toolboxItem.icon" />
          </el-icon>
          <span class="nav-text">{{ toolboxItem.title }}</span>
        </router-link>
      </el-tooltip>

      <!-- 分隔线 -->
      <div class="sidebar-divider"></div>

      <!-- 主题切换 -->
      <el-tooltip
        :content="isDark ? '切换浅色模式' : '切换暗黑模式'"
        placement="right"
        :show-after="200"
        :disabled="sidebarExpanded"
      >
        <button
          class="nav-item theme-toggle"
          @click="toggleDark"
        >
          <el-icon :size="20">
            <Moon v-if="!isDark" />
            <Sunny v-else />
          </el-icon>
          <span class="nav-text">{{ isDark ? '浅色模式' : '暗黑模式' }}</span>
        </button>
      </el-tooltip>

      <!-- 设置 -->
      <el-tooltip
        content="设置"
        placement="right"
        :show-after="200"
        :disabled="sidebarExpanded"
      >
        <router-link
          to="/settings"
          class="nav-item"
          :class="{ active: isActive('/settings') }"
        >
          <el-icon :size="20"><Setting /></el-icon>
          <span class="nav-text">设置</span>
        </router-link>
      </el-tooltip>

      <!-- 关于 -->
      <el-tooltip
        content="关于"
        placement="right"
        :show-after="200"
        :disabled="sidebarExpanded"
      >
        <router-link
          to="/about"
          class="nav-item"
          :class="{ active: isActive('/about') }"
        >
          <el-icon :size="20"><InfoFilled /></el-icon>
          <span class="nav-text">关于</span>
        </router-link>
      </el-tooltip>

      <!-- 展开/折叠按钮 -->
      <el-tooltip
        :content="sidebarExpanded ? '收起侧边栏' : '展开侧边栏'"
        placement="right"
        :show-after="200"
        :disabled="sidebarExpanded"
      >
        <button
          class="nav-item toggle-btn"
          @click="toggleSidebar"
        >
          <el-icon :size="20">
            <DArrowLeft v-if="sidebarExpanded" />
            <DArrowRight v-else />
          </el-icon>
          <span class="nav-text">收起</span>
        </button>
      </el-tooltip>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation';
import { getSetting, setSetting } from '@/utils/localStorageUtils';
import { DArrowLeft, DArrowRight, InfoFilled, Moon, Setting, Sunny } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { mainNavItems, toolboxItem, isActive, isDark, toggleDark } = useNavigation();
const sidebarExpanded = ref(true);

const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value;
  setSetting('autoExpandSidebar', sidebarExpanded.value);
};

onMounted(() => {
  sidebarExpanded.value = getSetting('autoExpandSidebar') ?? true;
});

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<style scoped>
@reference "tailwindcss";

.app-sidebar {
  @apply flex flex-col items-center py-3 shrink-0 transition-all duration-300;
  width: 52px;
  height: 100%;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
}

.app-sidebar.sidebar-expanded {
  @apply items-start px-3;
  width: 200px;
}

/* Logo */
.sidebar-logo {
  @apply flex items-center cursor-pointer mb-3 w-full justify-center;
  height: 40px;
}

.sidebar-expanded .sidebar-logo {
  @apply justify-start px-2.5;
}

.logo-img {
  @apply w-8 h-8 object-contain rounded-lg shrink-0;
}

.logo-text {
  @apply text-sm font-semibold whitespace-nowrap transition-all duration-300;
  color: var(--el-text-color-primary);
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  margin-left: 0;
}

.sidebar-expanded .logo-text {
  opacity: 1;
  max-width: 150px;
  margin-left: 8px;
}

/* 主导航 */
.sidebar-nav {
  @apply flex flex-col gap-0.5 flex-1 w-full;
}

/* 导航项 */
.nav-item {
  @apply relative flex items-center justify-center rounded-lg transition-all duration-200 no-underline;
  width: 40px;
  height: 40px;
  margin: 0 auto;
  color: var(--el-text-color-secondary);
}

.sidebar-expanded .nav-item {
  @apply justify-start px-2.5 py-2 w-full gap-3;
  height: auto;
  margin: 0;
}

.nav-item:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.nav-item.active {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.nav-text {
  @apply text-sm whitespace-nowrap transition-all duration-300;
  opacity: 0;
  max-width: 0;
  overflow: hidden;
}

.sidebar-expanded .nav-text {
  opacity: 1;
  max-width: 150px;
}

/* Beta 标记 */
.beta-tag {
  @apply text-[10px] px-1 py-px rounded font-medium leading-tight ml-auto;
  background: var(--el-color-warning-light-7);
  color: var(--el-color-warning-dark-2);
}

.beta-dot {
  @apply absolute top-1.5 right-1.5 w-2 h-2 rounded-full;
  background: var(--el-color-warning);
}

/* 底部 */
.sidebar-footer {
  @apply flex flex-col gap-1 mt-auto w-full;
}

.sidebar-divider {
  @apply my-2 mx-auto;
  width: calc(100% - 16px);
  height: 1px;
  background: var(--el-border-color-lighter);
}

.theme-toggle,
.toggle-btn {
  @apply border-none cursor-pointer w-full;
  background: transparent;
}

:global(.dark) .app-sidebar {
  background: var(--el-bg-color);
}
</style>
