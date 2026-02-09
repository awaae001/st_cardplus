<template>
  <div class="app-layout">
    <!-- 桌面端 -->
    <template v-if="!isMobile">
      <AppSidebar />

      <main
        class="desktop-main"
        :class="{ 'overflow-hidden': isOverflowHidden }"
      >
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
    </template>

    <!-- 移动端 -->
    <template v-else>
      <MobileDrawer v-model="drawerVisible" />

      <main class="mobile-main">
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

      <MobileTabBar @toggle-drawer="drawerVisible = true" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import AppSidebar from '@/components/layout/AppSidebar.vue';
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

// 动态生成菜单项
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

const { isMobile } = provideNavigation(mainMenuItems);

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

.app-layout {
  @apply h-screen flex;
  background: var(--el-bg-color-page);
}

.desktop-main {
  @apply flex-1 flex flex-col overflow-auto;
  min-height: 0;
  min-width: 0;
  width: 0;
}

.desktop-main.overflow-hidden {
  @apply overflow-hidden;
}

@media (max-width: 1023px) {
  .app-layout {
    @apply flex-col;
  }
}

.mobile-main {
  @apply flex-1 overflow-auto;
  padding-bottom: calc(48px + env(safe-area-inset-bottom, 0)); /* 48px = 混合式 TabBar 高度 */
}
</style>

<style>
@reference "tailwindcss";

.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-200 ease-out;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
</style>
