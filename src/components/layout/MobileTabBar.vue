<template>
  <nav
    class="mobile-tab-bar"
    v-if="isMobile"
  >
    <router-link
      v-for="item in tabItems"
      :key="item.index"
      :to="item.index"
      class="tab-item"
      :class="{ active: isActive(item.index) }"
    >
      <el-icon :size="22">
        <component :is="item.icon" />
      </el-icon>
      <span class="tab-label">{{ item.title }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import type { MenuItemConfig } from '@/config/menuConfig';
import { getIconComponent } from '@/config/menuConfig';
import { ElIcon } from 'element-plus';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// Props
const props = defineProps<{
  menuItems: MenuItemConfig[];
  isMobile: boolean;
}>();

// 路由
const route = useRoute();

// 底部标签栏显示的项目（最多5个核心功能）
const tabItems = computed(() => {
  // 优先显示的核心功能 ID
  const priorityIds = ['home', 'cardmanager', 'cardinfo', 'world', 'toolbox'];

  return props.menuItems
    .filter((item) => item.visible && priorityIds.includes(item.id))
    .sort((a, b) => priorityIds.indexOf(a.id) - priorityIds.indexOf(b.id))
    .slice(0, 5)
    .map((item) => ({
      ...item,
      index: item.route,
      icon: getIconComponent(item.icon),
    }));
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

/* 底部标签栏容器 */
.mobile-tab-bar {
  @apply flex items-center justify-around fixed bottom-0 left-0 right-0 h-14 z-100;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* 标签项 */
.tab-item {
  @apply flex flex-col items-center justify-center flex-1 h-full no-underline gap-0.5 transition-all duration-200;
  color: var(--el-text-color-secondary);
}

.tab-item:active {
  @apply scale-95;
}

.tab-item.active {
  color: var(--el-color-primary);
}

.tab-item.active .el-icon {
  @apply scale-110;
}

/* 标签文字 */
.tab-label {
  @apply text-[10px] whitespace-nowrap;
}
</style>
