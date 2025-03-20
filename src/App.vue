<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Icon } from '@iconify/vue'
import { Edit, DataAnalysis, User, Fold, Expand } from '@element-plus/icons-vue'
import { ElLoading } from 'element-plus'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const openGithub = () => {
  window.open('https://github.com/awaae001/st_cardplus', '_blank')
}

const isSidebarOpen = ref(false)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const router = useRouter()
let loadingInstance: ReturnType<typeof ElLoading.service>

// 路由切换前显示加载动画
router.beforeEach(() => {
  loadingInstance = ElLoading.service({
    lock: true,
    text: '加载中...',
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
    <div class="toggle-button" @click="toggleSidebar">
      <el-icon>
        <component :is="isSidebarOpen ? Fold : Expand" />
      </el-icon>
    </div>
    <el-menu
      class="menu-bar"
      :class="{ 'collapsed': !isSidebarOpen }"
      mode="vertical"
      :router="true"
    >
      <el-menu-item index="/">
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/card">
        <el-icon><Edit /></el-icon>
        <span>角色卡编辑器</span>
      </el-menu-item>
      <el-menu-item index="/world">
        <el-icon><DataAnalysis /></el-icon>
        <span>地标编辑器</span>
      </el-menu-item>
      <el-menu-item index="/cardoutput">
        <el-icon><User /></el-icon>
        <span>角色卡快搭</span>
      </el-menu-item>
      <div style="flex-grow: 1"></div>
      <div style="display: flex; align-items: center; padding: 16px;">
        <el-button type="primary" circle @click="openGithub" style="margin-right: 6px;">
          <Icon icon="devicon:github" width="16" height="16" />
        </el-button>
      </div>
    </el-menu>
    <div class="content-container">
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
  background-color: #f0f0f0;
  padding: 16px 0;
  border-right: 1px solid #ddd;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.menu-bar.collapsed {
  width: 64px;
  transform: none;
}

.menu-bar.collapsed .el-menu-item span {
  opacity: 0;
  width: 0;
  transition: all 0.3s;
}

.menu-bar.collapsed .el-menu-item {
  justify-content: center;
}

.content-container {
  margin-left: 200px;
  transition: margin-left 0.3s ease;
}

.menu-bar.collapsed + .content-container {
  margin-left: 64px;
}

/* 保持移动端滑动效果 */
@media (max-width: 768px) {
  .menu-bar.collapsed {
    width: 80%;
    transform: translateX(-100%);
  }
}

.toggle-button {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 1001;
  cursor: pointer;
  background-color: #fff;
  padding: 8px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .menu-bar {
    width: 80%;
    height: 100vh;
    position: fixed;
    transform: translateX(-100%);
    border-right: 1px solid #ddd;
  }
  
  .menu-bar.collapsed {
    transform: translateX(-100%);
  }
  
  .menu-bar:not(.collapsed) {
    transform: translateX(0);
  }
  
  .content-container {
    margin-left: 0;
  }
  
  .layout-container {
    flex-direction: column;
  }
  
  .toggle-button {
    display: block;
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
