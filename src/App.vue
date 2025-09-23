<template>
  <div v-if="useOldSidebar">
    <App_old />
  </div>
  <div v-else>
    <el-container class="layout-container">
      <!-- Mobile Drawer -->
      <el-drawer v-if="isMobile" v-model="drawerVisible" direction="ltr" :with-header="false" size="250px">
        <el-menu :router="true" @select="drawerVisible = false" class="sidebar-menu">
          <template v-for="item in mainMenuItems" :key="item.index">
            <el-menu-item v-if="!item.beta || betaFeaturesEnabled" :index="item.index">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </template>
          <div class="flex-grow"></div>
          <el-menu-item @click="smoothToggleDark" class="theme-toggle-item">
            <el-icon class="theme-icon">
              <Moon v-if="!isDark" />
              <Sunny v-else />
            </el-icon>
            <span>{{ isDark ? '浅色模式' : '暗黑模式' }}</span>
          </el-menu-item>
          <el-menu-item index="/about">
            <el-icon>
              <InfoFilled />
            </el-icon>
            <span>设置与关于</span>
          </el-menu-item>
        </el-menu>
      </el-drawer>

      <!-- PC Sidebar -->
      <el-aside v-else :width="sidebarWidth" class="sidebar-transition" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <el-menu :collapse="isCollapse" :router="true" class="sidebar-menu">
          <template v-for="item in mainMenuItems" :key="item.index">
            <el-menu-item v-if="!item.beta || betaFeaturesEnabled" :index="item.index">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.title }}</span>
            </el-menu-item>
          </template>
          <div class="flex-grow"></div>
          <el-divider />
          <el-menu-item @click="smoothToggleDark" class="theme-toggle-item">
            <el-icon class="theme-icon">
              <Moon v-if="!isDark" />
              <Sunny v-else />
            </el-icon>
            <span>{{ isDark ? '浅色模式' : '暗黑模式' }}</span>
          </el-menu-item>
          <el-menu-item index="/about">
            <el-icon>
              <InfoFilled />
            </el-icon>
            <span>设置与关于</span>
          </el-menu-item>
          <el-menu-item @click="toggleSidebar">
            <el-icon>
              <IconMenu />
            </el-icon>
            <span>{{ !isCollapse ? '收起侧边栏' : '展开侧边栏' }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-button v-if="isMobile" class="toggle-button" @click="toggleSidebar" :icon="IconMenu" circle />
      <el-main class="content-container" :class="{ 'overflow-hidden': isOverflowHidden }">
        <RouterView />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import {
  Menu as IconMenu, Moon, Sunny, House, EditPen, Location, Postcard, Tools, DataLine, Collection, InfoFilled, Tickets
} from '@element-plus/icons-vue'
import { ElLoading, ElContainer, ElAside, ElMain, ElMenu, ElMenuItem, ElIcon, ElButton, ElDrawer ,ElDivider} from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useDark, useToggle, useWindowSize } from '@vueuse/core'
import { getBetaFeaturesEnabled, getUseOldSidebar } from '@/utils/localStorageUtils'
import App_old from '@/pages/App_old.vue'
import { provideOverflowControl } from '@/composables/useOverflowControl';
import { usePersonalization } from '@/composables/usePersonalization';

const { isOverflowHidden, setOverflowHidden } = provideOverflowControl();
const route = useRoute();
const isDark = useDark()
const toggleDark = useToggle(isDark)
const useOldSidebar = ref(true)
const { width } = useWindowSize()
const isCollapse = ref(false)
const userToggledCollapse = ref(false); // 新增：用于跟踪用户手动折叠的状态
const { autoExpandSidebar } = usePersonalization();
const mainMenuItems = ref([
  { index: '/', icon: House, title: '首页' },
  { index: '/cardinfo', icon: EditPen, title: '角色信息' },
  { index: '/world', icon: Location, title: '世界地标' },
  { index: '/cardmanager', icon: Postcard, title: '角色卡快搭' },
  { index: '/ejs-editor', icon: DataLine, title: 'EJS模板 · 测试版', beta: true },
  { index: '/worldbook', icon: Collection, title: '世界书 · 测试版', beta: true },
  { index: '/regex-editor', icon: Tickets, title: '正则编辑器 · 测试版', beta: true },
  { index: '/toolbox', icon: Tools, title: '工具箱' },
]);

const sidebarWidth = computed(() => (isCollapse.value ? '64px' : '200px'))
const drawerVisible = ref(false)
const isMobile = computed(() => width.value < 1024)
const toggleSidebar = () => {
  if (isMobile.value) {
    drawerVisible.value = !drawerVisible.value
  } else {
    userToggledCollapse.value = !userToggledCollapse.value;
    isCollapse.value = userToggledCollapse.value;
  }
}

// 新增：处理鼠标移入事件
const handleMouseEnter = () => {
  if (userToggledCollapse.value && !isMobile.value && autoExpandSidebar.value) {
    isCollapse.value = false;
  }
}

// 新增：处理鼠标移出事件
const handleMouseLeave = () => {
  if (userToggledCollapse.value && !isMobile.value && autoExpandSidebar.value) {
    isCollapse.value = true;
  }
}
const betaFeaturesEnabled = ref(false)
const router = useRouter()
let loadingInstance: ReturnType<typeof ElLoading.service>
const handleBetaFeaturesToggle = (event: CustomEvent) => {
  betaFeaturesEnabled.value = event.detail
}


watch([() => route.path, isMobile], ([newPath, mobile]) => {
  if (mobile) {
    setOverflowHidden(false);
    return;
  }
  const overflowHiddenRoutes = ['/worldbook', '/ejs-editor' , '/world'];
  if (overflowHiddenRoutes.includes(newPath)) {
    setOverflowHidden(true);
  } else {
    setOverflowHidden(false);
  }
}, { immediate: true });

// 平滑主题切换函数
const smoothToggleDark = () => {
  document.documentElement.classList.add('theme-transitioning')
  toggleDark()
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning')
  }, 500)
}

router.beforeEach(() => {
  loadingInstance = ElLoading.service({
    lock: true,
    text: '正在获取资源……请稍后',
    background: 'rgba(0, 0, 0, 0.7)',
  })
})

router.afterEach(() => {
  loadingInstance.close()
})


onMounted(() => {
  betaFeaturesEnabled.value = getBetaFeaturesEnabled()
  useOldSidebar.value = getUseOldSidebar()
  window.addEventListener('betaFeaturesToggle', handleBetaFeaturesToggle as EventListener)
  // 根据初始屏幕尺寸设置侧边栏状态
  // 根据初始屏幕尺寸设置侧边栏状态
  const initialCollapse = isMobile.value;
  isCollapse.value = initialCollapse;
  userToggledCollapse.value = initialCollapse;
})

onUnmounted(() => {
  window.removeEventListener('betaFeaturesToggle', handleBetaFeaturesToggle as EventListener)
})
</script>

<style scoped>
.layout-container {
  width: 100vw;
  height: 100vh;

}

.sidebar-transition {
  transition: width 0.3s ease;
  background-color: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

.sidebar-menu {
  flex-grow: 1;
  border-right: none;
  display: flex;
  flex-direction: column;
}

.sidebar-menu .el-menu-item {
  display: flex;
  align-items: center;
}

.sidebar-menu .el-menu-item>span {
  margin-left: 10px;
}

.sidebar-menu .flex-grow {
  flex-grow: 1;
}

.content-container {
  padding: 8px;
  position: relative;
  /* 为浮动按钮留出空间 */
  padding-top: 60px;
  margin-top: -54px;
}

.content-container.overflow-hidden {
  overflow: hidden;
}

.toggle-button {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1001;
}

.sidebar-toggle-button {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}



/* 主题切换按钮样式 */
.theme-toggle-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle-item:hover {
  background-color: var(--el-fill-color-light);
  transform: scale(1.02);
}

.theme-toggle-item:active {
  transform: scale(0.98);
}

.theme-icon {
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.theme-toggle-item:hover .theme-icon {
  transform: rotate(180deg);
}
</style>
