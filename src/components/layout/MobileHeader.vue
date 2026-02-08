<template>
  <header class="mobile-header">
    <!-- Logo 和标题 -->
    <div
      class="header-brand"
      @click="navigateTo('/')"
    >
      <img
        src="/image/logo.png"
        alt="Logo"
        class="brand-logo"
      />
      <span class="brand-text">ST CardPlus</span>
    </div>

    <!-- 右侧操作按钮 -->
    <div class="header-actions">
      <!-- 主题切换 -->
      <button
        class="action-btn"
        @click="toggleDark"
      >
        <el-icon :size="18">
          <Moon v-if="!isDark" />
          <Sunny v-else />
        </el-icon>
      </button>

      <!-- 菜单按钮 -->
      <button
        class="action-btn menu-btn"
        @click="$emit('toggle-drawer')"
      >
        <el-icon :size="20"><Operation /></el-icon>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation';
import { Moon, Operation, Sunny } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

defineEmits<{
  (e: 'toggle-drawer'): void;
}>();

const router = useRouter();
const { isDark, toggleDark } = useNavigation();

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<style scoped>
@reference "tailwindcss";

.mobile-header {
  @apply flex items-center justify-between px-3 shrink-0;
  height: 48px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

/* 品牌区域 */
.header-brand {
  @apply flex items-center gap-2 cursor-pointer;
}

.brand-logo {
  @apply w-7 h-7 rounded-md object-contain;
}

.brand-text {
  @apply text-base font-semibold;
  color: var(--el-text-color-primary);
}

/* 操作按钮区域 */
.header-actions {
  @apply flex items-center gap-1;
}

.action-btn {
  @apply flex items-center justify-center rounded-lg transition-colors;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--el-text-color-secondary);
}

.action-btn:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.action-btn:active {
  background: var(--el-fill-color);
}

.menu-btn {
  color: var(--el-text-color-primary);
}
</style>
