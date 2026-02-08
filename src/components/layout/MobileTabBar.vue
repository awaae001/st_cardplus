<template>
  <nav
    class="mobile-tab-bar"
    v-if="isMobile"
  >
    <!-- 左侧 Logo -->
    <router-link
      to="/"
      class="tab-logo"
    >
      <img
        src="/image/logo.png"
        alt="Logo"
        class="logo-img"
      />
    </router-link>

    <!-- 中间导航项 -->
    <div class="tab-items">
      <router-link
        v-for="item in tabBarItems"
        :key="item.index"
        :to="item.index"
        class="tab-item"
        :class="{ active: isActive(item.index) }"
      >
        <el-icon :size="20">
          <component :is="item.icon" />
        </el-icon>
        <span class="tab-label">{{ item.title }}</span>
      </router-link>
    </div>

    <!-- 右侧菜单按钮 -->
    <button
      class="menu-btn"
      @click="$emit('toggle-drawer')"
    >
      <el-icon :size="22">
        <Menu />
      </el-icon>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation';
import { Menu } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';

defineEmits<{
  'toggle-drawer': [];
}>();

// 使用导航上下文
const { isMobile, tabBarItems, isActive } = useNavigation();
</script>

<style scoped>
@reference "tailwindcss";

/* 底部标签栏容器 */
.mobile-tab-bar {
  @apply flex items-center fixed bottom-0 left-0 right-0 h-12 z-100;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* 左侧 Logo */
.tab-logo {
  @apply flex items-center justify-center w-12 h-full shrink-0;
}

.logo-img {
  @apply w-7 h-7 rounded-lg object-contain;
}

/* 中间导航项容器 */
.tab-items {
  @apply flex items-center justify-center flex-1 h-full gap-1;
}

/* 标签项 */
.tab-item {
  @apply flex flex-col items-center justify-center h-full px-3 no-underline gap-0.5 transition-all duration-200;
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

/* 右侧菜单按钮 */
.menu-btn {
  @apply flex items-center justify-center w-12 h-full shrink-0 border-none cursor-pointer;
  background: transparent;
  color: var(--el-text-color-secondary);
}

.menu-btn:active {
  color: var(--el-color-primary);
}
</style>
