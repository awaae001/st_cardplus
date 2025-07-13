<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Icon } from '@iconify/vue'
import { Menu, Moon, Sunny } from '@element-plus/icons-vue'
import { ElLoading } from 'element-plus'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const isSidebarOpen = ref(false)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  const sidebar = document.querySelector('.menu-bar')
  const target = event.target as HTMLElement
  
  if (isSidebarOpen.value && sidebar && !sidebar.contains(target)) {
    isSidebarOpen.value = false
  }
}

const router = useRouter()
let loadingInstance: ReturnType<typeof ElLoading.service>

// 路由切换前显示加载动画
router.beforeEach(() => {
  loadingInstance = ElLoading.service({
    lock: true,
    text: '获取资源……请稍后',
    background: 'rgba(0, 0, 0, 0.7)',
  })
})

// 路由切换完成后隐藏加载动画
router.afterEach(() => {
  loadingInstance.close()
})
</script>

<template>
  <div class="layout-container">
    <!-- Mobile toggle button -->
    <button class="mobile-toggle" @click="toggleSidebar">
      <el-icon>
        <Menu />
      </el-icon>
    </button>
    <!-- PC toggle button -->
    <button class="pc-toggle" @click="toggleSidebar">
      <el-icon>
        <Menu />
      </el-icon>
    </button>

    <el-menu class="menu-bar" :class="{ 'mobile-open': isSidebarOpen }" mode="vertical" :router="true">
      <el-menu-item index="/">
        <Icon style="margin-right: 4px;" icon="material-symbols:home-outline" width="24" height="24" />
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/card">
        <Icon style="margin-right: 4px;" icon="material-symbols:person-edit-outline-sharp" width="24" height="24" />
        <span>角色卡编辑器</span>
      </el-menu-item>
      <el-menu-item index="/world">
        <Icon style="margin-right: 4px;" icon="material-symbols:edit-location-alt-outline-rounded" width="24"
          height="24" />
        <span>地标编辑器</span>
      </el-menu-item>
      <el-menu-item index="/cardoutput">
        <Icon style="margin-right: 4px;" icon="material-symbols:id-card-outline" width="24" height="24" />
        <span>角色卡快搭</span>
      </el-menu-item>
      <el-menu-item index="/toolbox">
        <Icon style="margin-right: 4px;" icon="material-symbols:construction" width="24" height="24" />
        <span>工具箱</span>
      </el-menu-item>
      <el-menu-item index="/worldbook">
        <Icon style="margin-right: 4px;" icon="material-symbols:book-2-outline" width="24" height="24" />
        <span>世界书 · 测试版</span>
      </el-menu-item>
    <div style="flex-grow: 1"></div>
    <el-menu-item @click="toggleDark()">
      <el-icon>
        <Moon v-if="!isDark" />
        <Sunny v-else />
      </el-icon>
      <span>{{ isDark ? '浅色模式' : '暗黑模式' }}</span>
    </el-menu-item>
    <el-menu-item index="/about">
        <Icon style="margin-right: 4px;" icon="material-symbols:info-outline-rounded" width="24" height="24" />
        <span>关于</span>
      </el-menu-item>
    </el-menu>
    <div class="content-container" style="overflow: hidden;" @click="handleClickOutside">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.content-container {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.menu-bar {
  width: 200px;
  background-color: var(--el-bg-color);
  padding: 16px 0;
  border-right: 1px solid #ddd;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  transition: width 0.3s ease;
  overflow-y: auto;
}

.menu-bar:not(.mobile-open) {
  width: 60px; /* Collapsed state for PC */
}

.menu-bar:not(.mobile-open) .el-menu-item span {
  display: none; /* Hide text in collapsed state */
}

.menu-bar:not(.mobile-open) .el-menu-item {
  justify-content: center; /* Center icons */
  padding: 0;
}

.menu-bar:not(.mobile-open) .whatYouwant {
  display: none; /* Hide version text in collapsed state */
}

.content-container {
  margin-left: 200px;
  transition: margin-left 0.3s ease;
}

.menu-bar:not(.mobile-open) ~ .content-container {
  margin-left: 60px;
}

.mobile-toggle {
  display: none;
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1001;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
}

.pc-toggle {
  display: block;
  position: fixed;
  bottom: 10px;
  left: 10px; /* Fixed at page's left edge */
  z-index: 1001;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .menu-bar {
    width: 250px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .menu-bar.mobile-open {
    transform: translateX(0);
    width: 250px;
  }

  .content-container {
    margin-left: 0;
  }

  .menu-bar:not(.mobile-open) ~ .content-container {
    margin-left: 0;
  }

  .mobile-toggle {
    display: block;
  }

  .pc-toggle {
    display: none; /* Hide PC toggle in mobile view */
  }

  .layout-container {
    flex-direction: column;
  }
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 8px;
}

.menu-item:hover {
  background-color: #e0e0e0;
  border-radius: 4px;
}
</style>
