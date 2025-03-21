<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Icon } from '@iconify/vue'
import { Menu } from '@element-plus/icons-vue'
import { ElLoading } from 'element-plus'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const isSidebarOpen = ref(false)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const openGithub = () => {
  window.open('https://github.com/awaae001/st_cardplus', '_blank')
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
    <!-- Mobile toggle button -->
    <button class="mobile-toggle" @click="toggleSidebar">
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
      <div style="flex-grow: 1"></div>
      <div style="display: flex; align-items: center; padding: 16px;">
        <el-button type="primary" circle @click="openGithub" style="margin-right: 6px;">
          <Icon icon="devicon:github" width="16" height="16" />
        </el-button>
        <p class="whatYouwant">dev_0.1.3-1145</p>
      </div>
    </el-menu>
    <div class="content-container" style="overflow: hidden;    margin-top: 16vh;">
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

.content-container {
  margin-left: 200px;
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

@media (max-width: 768px) {
  .menu-bar {
    width: 250px;
    transform: translateX(-100%);
  }

  .menu-bar.mobile-open {
    transform: translateX(0);
  }

  .content-container {
    margin-left: 0;
  }

  .mobile-toggle {
    display: block;
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
