<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Icon } from '@iconify/vue'
import { Menu as IconMenu, Moon, Sunny, ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
import { ElLoading, ElMenu, ElMenuItem, ElIcon } from 'element-plus'
import { useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

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

const isSidebarOpen = ref(true) // 初始状态
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (isMobileView.value && isSidebarOpen.value) {
    const sidebar = document.querySelector('.menu-bar-container') // 检查是否应该指向 ElMenu
    const toggleButton = document.querySelector('.mobile-toggle')
    const target = event.target as HTMLElement
    if (sidebar && !sidebar.contains(target) && toggleButton && !toggleButton.contains(target)) {
      isSidebarOpen.value = false
    }
  }
}

watch(isMobileView, (newIsMobile, oldIsMobile) => {
  if (newIsMobile === false && (oldIsMobile === true || oldIsMobile === undefined)) {
     isSidebarOpen.value = true; // PC端默认展开
  } else if (newIsMobile && (oldIsMobile === false || oldIsMobile === undefined)) {
     isSidebarOpen.value = false; // 移动端默认折叠
  }
})

onMounted(() => {
  updateScreenWidth()
  if (isMobileView.value) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('resize', updateScreenWidth)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('resize', updateScreenWidth)
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

// 计算属性：判断当前是否应视为“折叠”状态（用于隐藏文本等）
const isEffectivelyCollapsed = computed(() => {
  if (isMobileView.value) {
    return !isSidebarOpen.value; // 移动端时，如果侧边栏没打开，就是折叠
  }
  return !isSidebarOpen.value; // PC端时，如果侧边栏没打开，就是折叠
});

</script>

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
             transform transition-transform duration-300 ease-in-out"
      :class="{
        '-translate-x-full': !isSidebarOpen && isMobileView, // 移动端折叠
        'translate-x-0': isSidebarOpen || !isMobileView,    // 移动端展开或任何PC状态
        'shadow-xl lg:shadow-none': isSidebarOpen && isMobileView,
      }"
    >
      <ElMenu
        :default-active="$route.path"
        class="menu-bar h-full flex flex-col 
               bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700
               overflow-x-hidden transition-[width] duration-300 ease-in-out"
        :class="{
          'w-[57px]': !isSidebarOpen && !isMobileView, // PC端折叠宽度
          'w-60': isSidebarOpen || isMobileView       // PC端展开或任何移动端状态 (移动端展开时也是 w-60)
        }"
        mode="vertical"
        :router="true"
        :title="isEffectivelyCollapsed ? 'Menu' : ''" 
      >
        <div class="p-4 text-center text-lg font-semibold text-gray-700 dark:text-gray-200 flex-shrink-0 h-[56px] flex items-center justify-center overflow-hidden whitespace-nowrap">
          <span
            class="transition-all duration-200 ease-in-out"
            :class="{
              'opacity-0 scale-90 w-0 pointer-events-none': isEffectivelyCollapsed,
              'opacity-100 scale-100 w-auto delay-100': !isEffectivelyCollapsed,
            }"
          >ST CardPlus</span>
        </div>

        <div class="flex-grow overflow-y-auto">
          <ElMenuItem index="/" :title="isEffectivelyCollapsed ? '首页' : ''">
            <ElIcon :size="20"><Icon icon="material-symbols:home-outline" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'hidden-text-collapsed': isEffectivelyCollapsed && !isMobileView}">首页</span>
            </template>
          </ElMenuItem>

          <ElMenuItem index="/card" :title="isEffectivelyCollapsed ? '角色卡编辑器' : ''">
            <ElIcon :size="20"><Icon icon="material-symbols:person-edit-outline-sharp" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'hidden-text-collapsed': isEffectivelyCollapsed && !isMobileView}">角色卡编辑器</span>
            </template>
          </ElMenuItem>

          <ElMenuItem index="/world" :title="isEffectivelyCollapsed ? '地标编辑器' : ''">
            <ElIcon :size="20"><Icon icon="material-symbols:edit-location-alt-outline-rounded" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'hidden-text-collapsed': isEffectivelyCollapsed && !isMobileView}">地标编辑器</span>
            </template>
          </ElMenuItem>

          <ElMenuItem index="/cardoutput" :title="isEffectivelyCollapsed ? '角色卡快搭' : ''">
            <ElIcon :size="20"><Icon icon="material-symbols:id-card-outline" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'hidden-text-collapsed': isEffectivelyCollapsed && !isMobileView}">角色卡快搭</span>
            </template>
          </ElMenuItem>

          <ElMenuItem index="/toolbox" :title="isEffectivelyCollapsed ? '工具箱' : ''">
            <ElIcon :size="20"><Icon icon="material-symbols:construction" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'hidden-text-collapsed': isEffectivelyCollapsed && !isMobileView}">工具箱</span>
            </template>
          </ElMenuItem>

          <ElMenuItem index="/worldbook" :title="isEffectivelyCollapsed ? '世界书编辑' : ''">
            <ElIcon :size="20"><Icon icon="material-symbols:book-2-outline" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'hidden-text-collapsed': isEffectivelyCollapsed && !isMobileView}">世界书编辑</span>
            </template>
          </ElMenuItem>
        </div>

        <div class="mt-auto flex-shrink-0 border-t border-gray-200 dark:border-neutral-700">
          <ElMenuItem @click="toggleDark()" :title="isEffectivelyCollapsed ? (isDark ? '浅色模式' : '暗黑模式') : ''">
            <ElIcon :size="20">
              <Moon v-if="!isDark" />
              <Sunny v-else />
            </ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'hidden-text-collapsed': isEffectivelyCollapsed && !isMobileView}">{{ isDark ? '浅色模式' : '暗黑模式' }}</span>
            </template>
          </ElMenuItem>
          <ElMenuItem index="/about" :title="isEffectivelyCollapsed ? '关于' : ''">
            <ElIcon :size="20"><Icon icon="material-symbols:info-outline-rounded" /></ElIcon>
            <template #title>
                <span class="menu-item-text" :class="{'hidden-text-collapsed': isEffectivelyCollapsed && !isMobileView}">关于</span>
            </template>
          </ElMenuItem>

          <div
            class="hidden lg:flex items-center justify-center h-[56px] sticky bottom-0 bg-inherit"
          >
            <button
              @click="toggleSidebar"
              class="pc-toggle p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-150"
            >
              <ElIcon :size="24">
                <ArrowLeftBold v-if="isSidebarOpen" />
                <ArrowRightBold v-else />
              </ElIcon>
            </button>
          </div>
        </div>
      </ElMenu>
    </div>

    <main
      class="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
      :class="{
        'lg:pl-60': isSidebarOpen && !isMobileView,    // PC 展开
        'lg:pl-[57px]': !isSidebarOpen && !isMobileView, // PC 折叠
        'pt-14 lg:pt-0': true 
      }"
    >
      <div class="flex-1 p-4 md:p-6 overflow-y-auto">
        <div class="mx-auto w-full max-w-7xl">
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
      @click="toggleSidebar"
      class="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-sm lg:hidden
             transition-opacity duration-300 ease-in-out"
      :class="{'opacity-100': isSidebarOpen, 'opacity-0 pointer-events-none': !isSidebarOpen}"
      aria-hidden="true"
    ></div>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 基本菜单项样式 */
.menu-bar .el-menu-item,
.menu-bar .el-sub-menu__title {
  height: var(--el-menu-item-height, 48px);
  display: flex;
  align-items: center;
  padding-left: 20px; /* 展开时的内边距 */
  padding-right: 20px;
  /* 文本的过渡效果 */
  /* transition: all 0.3s ease;  <-- 这个可能会干扰其他过渡 */
}

/* PC端折叠时，图标和文本的处理 */
.menu-bar.w-\[57px\] .el-menu-item, /* 针对 PC 折叠状态 (width 57px) */
.menu-bar.w-\[57px\] .el-sub-menu__title {
  justify-content: center;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.menu-bar .el-menu-item .el-icon,
.menu-bar .el-sub-menu__title .el-icon {
  margin-right: 10px;
  font-size: 20px;
  transition: margin-right 0.3s ease-in-out; /* 图标边距过渡 */
}

.menu-bar.w-\[57px\] .el-menu-item .el-icon,
.menu-bar.w-\[57px\] .el-sub-menu__title .el-icon {
  margin-right: 0;
}

/* 文本显隐的动画和样式 */
.menu-item-text {
  display: inline-block;
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.2s ease-in-out 0.1s, transform 0.2s ease-in-out 0.1s, max-width 0.2s ease-in-out 0.1s, visibility 0s linear 0.2s;
  white-space: nowrap;
  overflow: hidden;
  max-width: 150px; /* 足够容纳文本 */
  vertical-align: middle; /* 与图标对齐 */
}

.hidden-text-collapsed {
  opacity: 0 !important;
  transform: translateX(-10px) !important;
  max-width: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
  margin-left: 0 !important; /* 确保不占位 */
  transition-delay: 0s !important; /* 折叠时立即隐藏 */
}


.el-menu--collapse .el-sub-menu__icon-arrow, /* 虽然没用子菜单，以防万一 */
.menu-bar .el-sub-menu__icon-arrow {
  display: none;
}

</style>