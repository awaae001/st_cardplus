<template>
  <div class="flex h-screen overflow-hidden bg-gray-100 dark:bg-neutral-950">
    <header class="lg:hidden p-2 fixed top-0 left-0 z-[1002] bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-sm">
      <button
        @click="toggleSidebar"
        class="mobile-toggle p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-150"
      >
        <ElIcon :size="24"><IconMenu /></ElIcon>
      </button>
    </header>

    <div
      class="menu-bar-container flex-shrink-0 fixed lg:static inset-y-0 left-0 z-[1001]
             transform transition-transform lg:transition-[width] duration-300 ease-in-out"
      :class="{
        '-translate-x-full': !isSidebarOpen && isMobileView,
        'translate-x-0': isSidebarOpen || !isMobileView,
        'shadow-xl lg:shadow-none': isSidebarOpen && isMobileView,
        'w-[57px]': !isSidebarOpen && !isMobileView,
        'w-60': isSidebarOpen || isMobileView
      }"
    >
      <ElMenu
        :default-active="$route.path"
        class="menu-bar h-full flex flex-col
               bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700
               overflow-x-hidden transition-[width] duration-300 ease-in-out"
        :class="{
          'is-collapsed-Lg': !isSidebarOpen && !isMobileView,
          'is-expanded-Lg': isSidebarOpen && !isMobileView,
          'is-mobile-expanded': isSidebarOpen && isMobileView
        }"
        mode="vertical"
        :router="true"
        :title="isEffectivelyCollapsedForTitle ? 'Menu' : ''"
      >
        <div class="app-title-container p-4 text-center text-lg font-semibold text-gray-700 dark:text-gray-200 flex-shrink-0 h-[56px] flex items-center justify-center overflow-hidden whitespace-nowrap relative">
          <img
            src="@/image/logo.png"
            alt="Logo"
            class="app-logo"
            :class="{ 'logo-visible': isEffectivelyCollapsedForTextAnimation }"
          />
          <span
            class="app-title-text"
            :class="{ 'text-collapsed-style': isEffectivelyCollapsedForTextAnimation }"
          >ST CardPlus</span>
        </div>

        <div class="flex-grow overflow-y-auto menu-items-wrapper">
          <ElMenuItem index="/" :title="isEffectivelyCollapsedForTitle ? '首页' : ''">
            <ElIcon :size="22"><Icon icon="ph:house-light" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'text-collapsed-style': isEffectivelyCollapsedForTextAnimation}">首页</span>
            </template>
          </ElMenuItem>

          <ElMenuItem index="/card" :title="isEffectivelyCollapsedForTitle ? '角色卡编辑器' : ''">
            <ElIcon :size="22"><Icon icon="ph:user-circle-gear-light" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'text-collapsed-style': isEffectivelyCollapsedForTextAnimation}">角色卡编辑器</span>
            </template>
          </ElMenuItem>

          <ElMenuItem index="/world" :title="isEffectivelyCollapsedForTitle ? '地标编辑器' : ''">
            <ElIcon :size="22"><Icon icon="ph:map-trifold-light" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'text-collapsed-style': isEffectivelyCollapsedForTextAnimation}">地标编辑器</span>
            </template>
          </ElMenuItem>

          <ElMenuItem index="/cardoutput" :title="isEffectivelyCollapsedForTitle ? '角色卡快搭' : ''">
            <ElIcon :size="22"><Icon icon="ph:identification-card-light" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'text-collapsed-style': isEffectivelyCollapsedForTextAnimation}">角色卡快搭</span>
            </template>
          </ElMenuItem>

          <ElMenuItem index="/worldbook" :title="isEffectivelyCollapsedForTitle ? '世界书编辑' : ''">
            <ElIcon :size="22"><Icon icon="ph:book-open-text-light" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'text-collapsed-style': isEffectivelyCollapsedForTextAnimation}">世界书编辑</span>
            </template>
          </ElMenuItem>

          <ElMenuItem index="/toolbox" :title="isEffectivelyCollapsedForTitle ? '工具箱' : ''">
            <ElIcon :size="22"><Icon icon="ph:wrench-light" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'text-collapsed-style': isEffectivelyCollapsedForTextAnimation}">工具箱</span>
            </template>
          </ElMenuItem>
        </div>

        <div class="mt-auto flex-shrink-0 border-t border-gray-200 dark:border-neutral-700">

           <ElMenuItem @click="appSettings.toggleAutoSave()" :title="isEffectivelyCollapsedForTitle ? ('自动保存: ' + (appSettings.isAutoSaveEnabled ? '开启' : '关闭')) : ''">
             <ElIcon :size="22" class="text-blue-500">
               <Icon v-if="appSettings.isAutoSaveEnabled" icon="ph:floppy-disk-back-light" />
               <Icon v-else icon="ph:power-light" />
             </ElIcon>
             <template #title>
               <span class="menu-item-text" :class="{'text-collapsed-style': isEffectivelyCollapsedForTextAnimation}">
                 {{ appSettings.isAutoSaveEnabled ? '自动保存 开' : '自动保存 关' }}
               </span>
             </template>
           </ElMenuItem>

           <ElMenuItem @click="appSettings.cycleSafeMode()" :title="isEffectivelyCollapsedForTitle ? ('安全模式: ' + safeModeTitle(appSettings.safeModeLevel)) : ''">
             <ElIcon :size="22" class="text-orange-500">
               <Icon v-if="appSettings.safeModeLevel === 'forbidden'" icon="ph:shield-checkered-light" />
               <Icon v-else-if="appSettings.safeModeLevel === 'double'" icon="ph:shield-warning-light" />
               <Icon v-else icon="ph:shield-slash-light" />
             </ElIcon>
             <template #title>
               <span class="menu-item-text" :class="{'text-collapsed-style': isEffectivelyCollapsedForTextAnimation}">
                 {{ safeModeText(appSettings.safeModeLevel) }}
               </span>
             </template>
           </ElMenuItem>

           <ElMenuItem @click="toggleDark()" :title="isEffectivelyCollapsedForTitle ? (isDark ? '切换到浅色模式' : '切换到深色模式') : ''">
             <ElIcon :size="22">
               <Icon v-if="isDark" icon="ph:moon-light" />
               <Icon v-else icon="ph:sun-light" />
             </ElIcon>
             <template #title>
                 <span class="menu-item-text" :class="{'text-collapsed-style': isEffectivelyCollapsedForTextAnimation}">{{ isDark ? '深色模式' : '浅色模式' }}</span>
             </template>
           </ElMenuItem>

           <ElMenuItem index="/about" :title="isEffectivelyCollapsedForTitle ? '关于' : ''">
             <ElIcon :size="22"><Icon icon="ph:info-light" /></ElIcon>
             <template #title>
                 <span class="menu-item-text" :class="{'text-collapsed-style': isEffectivelyCollapsedForTextAnimation}">关于</span>
             </template>
           </ElMenuItem>

          <div
            class="pc-toggle-container hidden lg:flex items-center justify-center h-[var(--el-menu-item-height,48px)] sticky bottom-0 bg-inherit"
            v-if="!isMobileView"
          >
            <button
              @click="toggleSidebar"
              class="pc-toggle w-full h-full rounded-md text-gray-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500 transition-colors duration-150 flex items-center justify-center"
              aria-label="切换侧边栏"
            >
              <ElIcon :size="20">
                <ArrowLeftBold v-if="isSidebarOpen" />
                <ArrowRightBold v-else />
              </ElIcon>
            </button>
          </div>
        </div>
      </ElMenu>
    </div>

    <main
      class="flex-1 flex flex-col overflow-hidden"
      :class="{
        'pt-14 lg:pt-0': true
      }"
    >
      <div class="flex-1 p-4 md:p-6 overflow-y-auto">
        <div class="w-full h-full">
          <RouterView v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </RouterView>
        </div>
      </div>
    </main>

    <div
      v-if="isSidebarOpen && isMobileView"
      class="fixed inset-0 z-[1000] bg-black/30 dark:bg-black/40 backdrop-blur-sm lg:hidden
             transition-opacity duration-300 ease-in-out"
      :class="{'opacity-100': isSidebarOpen, 'opacity-0 pointer-events-none': !isSidebarOpen}"
      aria-hidden="true"
      @click="handleClickOutside"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { Menu as IconMenu, ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
import { ElLoading, ElMenu, ElMenuItem, ElIcon } from 'element-plus'
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { useAppSettingsStore, type SafeModeLevel } from '@/stores/appSettings';


const appSettings = useAppSettingsStore();

const screenWidth = ref(0)
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}
const isMobileView = computed(() => screenWidth.value <= 1024)

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark = useToggle(isDark)

const isSidebarOpen = ref(true)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (isMobileView.value && isSidebarOpen.value) {
    const sidebar = document.querySelector('.menu-bar-container')
    const toggleButton = document.querySelector('.mobile-toggle')
    const target = event.target as HTMLElement
    if (sidebar && !sidebar.contains(target) && toggleButton && !toggleButton.contains(target)) {
      isSidebarOpen.value = false
    }
  }
}

watch(isMobileView, (newIsMobile, oldIsMobile) => {
  if (newIsMobile === false && (oldIsMobile === true || oldIsMobile === undefined)) {
     isSidebarOpen.value = true;
  } else if (newIsMobile && (oldIsMobile === false || oldIsMobile === undefined)) {
     isSidebarOpen.value = false;
  }
}, { immediate: true })

onMounted(() => {
  updateScreenWidth()
  window.addEventListener('resize', updateScreenWidth)
  document.addEventListener('click', handleClickOutside, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenWidth)
  document.removeEventListener('click', handleClickOutside, true)
})

const router = useRouter()
let loadingInstance: any
router.beforeEach(() => {
  loadingInstance = ElLoading.service({
    lock: true,
    text: '获取资源……请稍后',
    background: 'rgba(0, 0, 0, 0.7)',
  })
})
router.afterEach(() => {
  if (loadingInstance) {
    loadingInstance.close()
  }
})

const isEffectivelyCollapsedForTitle = computed(() => {
  if (isMobileView.value) {
    return false;
  }
  return !isSidebarOpen.value;
});

const isEffectivelyCollapsedForTextAnimation = computed(() => {
  return !isMobileView.value && !isSidebarOpen.value;
});

const safeModeText = (level: SafeModeLevel): string => {
  switch (level) {
    case 'forbidden': return '禁止删除';
    case 'double': return '二次确认';
    case 'single': return '一次删除';
    default: return '安全模式';
  }
};

const safeModeTitle = (level: SafeModeLevel): string => {
  switch (level) {
    case 'forbidden': return '禁止删除';
    case 'double': return '删除需二次确认';
    case 'single': return '单击即可删除';
    default: return '';
  }
};

</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.menu-bar {
  transition-property: width;
}

.menu-bar .el-menu-item,
.menu-bar .el-sub-menu__title {
  height: var(--el-menu-item-height, 48px);
  display: flex;
  align-items: center;
  padding-left: 20px;
  padding-right: 20px;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-bar.is-collapsed-Lg .el-menu-item,
.menu-bar.is-collapsed-Lg .el-sub-menu__title {
  justify-content: center;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.menu-bar .el-menu-item .el-icon,
.menu-bar .el-sub-menu__title .el-icon {
  margin-right: 10px;
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}


.menu-bar .el-menu-item .el-icon .iconify,
.menu-bar .el-sub-menu__title .el-icon .iconify {
  vertical-align: middle;
}


.menu-bar.is-collapsed-Lg .el-menu-item .el-icon,
.menu-bar.is-collapsed-Lg .el-sub-menu__title .el-icon {
  margin-right: 0;
}

.menu-item-text {
  display: inline-block;
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.2s ease-in-out 0.1s, transform 0.2s ease-in-out 0.1s, max-width 0.2s ease-in-out 0.1s, visibility 0s linear 0.2s;
  white-space: nowrap;
  overflow: hidden;
  max-width: 150px;
  vertical-align: middle;
  font-size: var(--el-menu-item-font-size);
}

.menu-item-text.text-collapsed-style {
  opacity: 0;
  transform: translateX(-10px);
  max-width: 0;
  pointer-events: none;
  visibility: hidden;
  margin-left: 0;
  transition-delay: 0s;
}

.app-title-container {
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
}

.app-logo.logo-visible {
  opacity: 1;
  pointer-events: auto;
  transition-delay: 0.15s;
}

.app-title-text {
  display: inline-block;
  opacity: 1;
  transform: translateX(0) scale(1);
  width: auto;
  transition: opacity 0.2s ease-in-out 0.1s, transform 0.2s ease-in-out 0.1s, width 0.2s ease-in-out 0.1s, visibility 0s linear 0.2s;
  white-space: nowrap;
  overflow: hidden;
  vertical-align: middle;
}

.app-title-text.text-collapsed-style {
  opacity: 0;
  transform: translateX(-10px) scale(0.9);
  width: 0;
  pointer-events: none;
  visibility: hidden;
  transition-delay: 0s;
}

.el-menu--collapse .el-sub-menu__icon-arrow,
.menu-bar .el-sub-menu__icon-arrow {
  display: none;
}
</style>