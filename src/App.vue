<template>
  <div class="app-layout min-h-screen flex flex-col bg-(--el-bg-color-page)">
    <!-- 顶部导航栏 -->
    <AppHeader @toggle-drawer="drawerVisible = true" />

    <!-- 面包屑导航 -->
    <AppBreadcrumb />

    <!-- 移动端抽屉菜单 -->
    <MobileDrawer
      v-if="isMobile"
      v-model="drawerVisible"
    />

    <!-- 主内容区域 -->
    <main
      class="flex-1"
      :class="[isOverflowHidden ? 'overflow-hidden' : 'overflow-auto', isMobile ? 'pb-mobile-safe' : '']"
    >
      <!-- 全局公告 Banner：About 页面有独立 Banner，避免重复 -->
      <SystemBanner
        v-if="route.name !== 'about'"
        bannerId="newYearSurvey2026"
        startDate="2026-01-01"
        endDate="2026-03-01"
        message="我们有一个新年调查，去填写一下？"
        link="https://tally.so/r/kdeaLo"
        linkText="填写调查"
      />
      <RouterView v-slot="{ Component, route: currentRoute }">
        <transition
          name="fade"
          mode="out-in"
        >
          <component
            :is="Component"
            :key="currentRoute.path"
          />
        </transition>
      </RouterView>
    </main>

    <!-- 移动端底部标签栏 -->
    <MobileTabBar />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import MobileDrawer from '@/components/layout/MobileDrawer.vue';
import MobileTabBar from '@/components/layout/MobileTabBar.vue';
import SystemBanner from '@/components/SystemBanner.vue';

import { provideNavigation } from '@/composables/useNavigation';
import { provideOverflowControl } from '@/composables/useOverflowControl';
import { usePersonalization } from '@/composables/usePersonalization';

import { getSetting } from '@/utils/localStorageUtils';

// 溢出控制
const { isOverflowHidden, setOverflowHidden } = provideOverflowControl();

// 路由
const route = useRoute();

// 个性化设置
const { allowBodyScroll, sidebarConfig, refreshSidebarConfig } = usePersonalization();

// Beta 功能开关
const betaFeaturesEnabled = ref(false);

// 动态生成菜单项（过滤 Beta 功能并排序）
const mainMenuItems = computed(() => {
  return sidebarConfig.value.items
    .filter((item) => {
      // 必须是可见的
      if (!item.visible) return false;
      // 如果是 beta 功能，需要检查开关状态
      if (item.beta && !betaFeaturesEnabled.value) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);
});

// 提供导航上下文给所有子组件
const { isMobile } = provideNavigation(mainMenuItems);

// 抽屉状态
const drawerVisible = ref(false);

// 监听路由变化，控制溢出
watch(
  [() => route.path, isMobile],
  ([newPath, mobile]) => {
    if (mobile) {
      setOverflowHidden(false);
      return;
    }
    if (allowBodyScroll.value) {
      setOverflowHidden(false);
      return;
    }
    const overflowHiddenRoutes = ['/worldbook', '/ejs-editor', '/world', '/regex-editor'];
    if (overflowHiddenRoutes.includes(newPath)) {
      setOverflowHidden(true);
    } else {
      setOverflowHidden(false);
    }
  },
  { immediate: true }
);

// 事件处理
const handleBetaFeaturesToggle = (event: CustomEvent) => {
  betaFeaturesEnabled.value = event.detail;
};

const handleSidebarConfigChange = () => {
  refreshSidebarConfig();
};

onMounted(() => {
  betaFeaturesEnabled.value = getSetting('betaFeaturesEnabled');
  refreshSidebarConfig();
  window.addEventListener('betaFeaturesToggle', handleBetaFeaturesToggle as EventListener);
  window.addEventListener('sidebarConfigChange', handleSidebarConfigChange as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('betaFeaturesToggle', handleBetaFeaturesToggle as EventListener);
  window.removeEventListener('sidebarConfigChange', handleSidebarConfigChange as EventListener);
});
</script>

<style scoped>
@reference "tailwindcss";

/* 移动端底部安全区域填充 */
.pb-mobile-safe {
  padding-bottom: calc(56px + env(safe-area-inset-bottom, 0));
}
</style>

<style>
@reference "tailwindcss";

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-200 ease-out;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
</style>
