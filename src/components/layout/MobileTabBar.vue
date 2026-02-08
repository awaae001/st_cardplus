<template>
  <nav
    class="mobile-tab-bar"
    v-if="isMobile"
  >
    <router-link
      v-for="item in tabBarItems"
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
import { useNavigation } from '@/composables/useNavigation';
import { ElIcon } from 'element-plus';

// 使用导航上下文
const { isMobile, tabBarItems, isActive } = useNavigation();
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
