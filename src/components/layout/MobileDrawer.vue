s
<template>
  <el-drawer
    v-model="visible"
    direction="rtl"
    :with-header="false"
    size="300px"
    class="mobile-drawer"
  >
    <div class="drawer-container">
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
            @click="handleMenuClick('/settings')"
          >
            <el-icon :size="20"><Setting /></el-icon>
            <span>设置</span>
          </div>
          <div
            class="action-item"
            @click="handleMenuClick('/about')"
          >
            <el-icon :size="20"><InfoFilled /></el-icon>
            <span>关于</span>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { useNavigation } from '@/composables/useNavigation';
import { InfoFilled, Moon, Setting, Sunny } from '@element-plus/icons-vue';
import { ElDrawer, ElIcon } from 'element-plus';

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
