<template>
  <header class="app-header">
    <!-- Logo 区域 -->
    <div
      class="header-logo"
      @click="router.push('/')"
    >
      <img
        src="@/image/logo.png"
        alt="Logo"
        class="logo-img"
      />
      <span
        class="logo-text"
        v-if="!isMobile"
      >
        ST CardPlus
      </span>
    </div>

    <!-- PC 端导航菜单 -->
    <nav
      class="header-nav"
      v-if="!isMobile"
    >
      <!-- 主要菜单项 -->
      <el-tooltip
        v-for="item in mainNavItems"
        :key="item.index"
        :content="item.title + (item.beta ? ' (Beta)' : '')"
        placement="bottom"
        :show-after="300"
        :disabled="!isNarrowScreen"
      >
        <router-link
          :to="item.index"
          class="nav-item"
          :class="{ active: isActive(item.index) }"
        >
          <el-icon :size="18">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-text">{{ item.title }}</span>
          <span
            v-if="item.beta"
            class="beta-tag"
          >
            Beta
          </span>
        </router-link>
      </el-tooltip>

      <!-- 更多菜单（超出部分） -->
      <el-dropdown
        v-if="overflowItems.length > 0"
        trigger="click"
      >
        <div class="nav-item more-item">
          <el-icon :size="18"><MoreFilled /></el-icon>
          <span>更多</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in overflowItems"
              :key="item.index"
              @click="router.push(item.index)"
            >
              <el-icon :size="16">
                <component :is="item.icon" />
              </el-icon>
              <span style="margin-left: 8px">{{ item.title }}</span>
              <span
                v-if="item.beta"
                class="beta-tag"
                style="margin-left: 8px"
              >
                Beta
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 工具箱（始终显示） -->
      <el-tooltip
        v-if="toolboxItem"
        :content="toolboxItem.title"
        placement="bottom"
        :show-after="300"
        :disabled="!isNarrowScreen"
      >
        <router-link
          :to="toolboxItem.index"
          class="nav-item toolbox-item"
          :class="{ active: isActive(toolboxItem.index) }"
        >
          <el-icon :size="18">
            <component :is="toolboxItem.icon" />
          </el-icon>
          <span class="nav-text">{{ toolboxItem.title }}</span>
        </router-link>
      </el-tooltip>
    </nav>

    <!-- 右侧操作区 -->
    <div
      class="header-actions"
      :class="{ 'is-mobile': isMobile }"
    >
      <!-- 主题切换 -->
      <el-button
        :icon="isDark ? Sunny : Moon"
        circle
        @click="toggleDark()"
        class="action-btn"
      />
      <!-- 设置按钮 -->
      <el-button
        :icon="Setting"
        circle
        @click="router.push('/about')"
        class="action-btn"
      />
      <!-- 移动端汉堡菜单按钮 -->
      <el-button
        v-if="isMobile"
        :icon="Menu"
        circle
        @click="emit('toggle-drawer')"
        class="action-btn"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useDark, useToggle, useWindowSize } from '@vueuse/core';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { MenuItemConfig } from '@/config/menuConfig';
import { getIconComponent } from '@/config/menuConfig';

import { Menu, Moon, MoreFilled, Setting, Sunny } from '@element-plus/icons-vue';
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElIcon, ElTooltip } from 'element-plus';

// 窗口尺寸检测
const { width } = useWindowSize();
const isNarrowScreen = computed(() => width.value >= 1024 && width.value <= 1400);

// 顶栏最多显示的菜单项数量
const MAX_VISIBLE_ITEMS = 6;

// Props
const props = defineProps<{
  menuItems: MenuItemConfig[];
  isMobile: boolean;
}>();

// Emits
const emit = defineEmits<{
  'toggle-drawer': [];
}>();

// 路由
const router = useRouter();
const route = useRoute();

// 主题切换
const isDark = useDark();
const toggleDark = useToggle(isDark);

// 可见菜单项（不含工具箱）
const regularMenuItems = computed(() => {
  return props.menuItems
    .filter((item) => item.visible && item.id !== 'toolbox')
    .map((item) => ({
      ...item,
      index: item.route,
      icon: getIconComponent(item.icon),
    }));
});

// 工具箱菜单项（始终显示）
const toolboxItem = computed(() => {
  const item = props.menuItems.find((item) => item.id === 'toolbox' && item.visible);
  if (!item) return null;
  return {
    ...item,
    index: item.route,
    icon: getIconComponent(item.icon),
  };
});

// 主要导航项（顶栏直接显示）
const mainNavItems = computed(() => {
  return regularMenuItems.value.slice(0, MAX_VISIBLE_ITEMS);
});

// 溢出项（放入更多菜单，不含工具箱）
const overflowItems = computed(() => {
  return regularMenuItems.value.slice(MAX_VISIBLE_ITEMS);
});

// 判断是否激活
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};
</script>

<style scoped>
@reference "tailwindcss";

/* 顶部导航栏容器 */
.app-header {
  @apply flex items-center h-14 px-4 sticky top-0 z-100;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

/* Logo 区域 */
.header-logo {
  @apply flex items-center gap-2 cursor-pointer shrink-0;
}

.logo-img {
  @apply w-8 h-8 rounded-lg;
}

.logo-text {
  @apply text-base font-semibold;
  color: var(--el-text-color-primary);
}

/* 导航菜单区域 */
.header-nav {
  @apply flex items-center justify-center gap-1 ml-8 flex-1 overflow-x-auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.header-nav::-webkit-scrollbar {
  @apply hidden;
}

/* 导航项 */
.nav-item {
  @apply flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap no-underline transition-all duration-200;
  color: var(--el-text-color-regular);
}

.nav-item:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.nav-item.active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

/* 右侧操作区 */
.header-actions {
  @apply flex items-center gap-2 ml-auto;
}

/* 操作按钮 */
.action-btn {
  @apply w-10 h-10 border-none bg-transparent;
}

.action-btn :deep(.el-icon) {
  @apply text-xl;
}

.action-btn:hover {
  background: var(--el-fill-color-light);
}

/* Beta 标签 */
.beta-tag {
  @apply text-[10px] px-1 py-px rounded font-medium leading-tight;
  background: var(--el-color-warning-light-7);
  color: var(--el-color-warning-dark-2);
}

/* 更多菜单项 */
.more-item {
  @apply cursor-pointer;
}

/* 窄屏桌面端（1024px-1200px）：只显示图标 */
@media screen and (min-width: 1024px) and (max-width: 1200px) {
  .nav-item .nav-text,
  .nav-item .beta-tag {
    @apply hidden;
  }

  .nav-item {
    @apply p-2.5 rounded-xl;
  }

  .nav-item .el-icon {
    @apply text-xl;
  }

  .more-item > span {
    @apply hidden;
  }

  .header-nav {
    @apply gap-1;
  }

  .logo-text {
    @apply hidden;
  }
}
</style>
