<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Icon } from '@iconify/vue'
import { Edit, DataAnalysis, User } from '@element-plus/icons-vue'
// import { useDark, useToggle } from '@vueuse/core'

const openGithub = () => {
  window.open('https://github.com/awaae001/st_cardplus', '_blank')
}

// // 暗夜模式切换
// const isDark = useDark()
// const toggleDark = useToggle(isDark)
</script>

<template>
  <div class="layout-container">
    <el-menu
      class="menu-bar"
      mode="horizontal"
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
      <div style="display: flex; align-items: center;">
        <!-- <el-switch
          v-model="isDark"
          @change="toggleDark"
          inline-prompt
          active-text="暗"
          inactive-text="亮"
          style="margin-right: 12px;"
        /> -->
        <el-button type="primary" circle @click="openGithub" style="margin-right: 6px;">
          <Icon icon="devicon:github" width="16" height="16" />
        </el-button>
        <p class="whatYouwant">dev_0.1.3-1056</p>
      </div>
    </el-menu>
    <slot />
  </div>
  <div class="app-container">
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
}

.layout-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-bar {
  height: 40px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #ddd;
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
