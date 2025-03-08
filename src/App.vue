<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Icon } from '@iconify/vue'

const openGithub = () => {
  window.open('https://github.com/awaae001/st_cardplus', '_blank')
}

</script>

<template>
  <div class="layout-container">
    <div class="menu-bar">
      <div style="display: flex;">
        <div class="menu-item" @click="$router.push('/')">主页</div>
        <div class="menu-item" @click="$router.push('/card')">角色信息编辑器</div>
        <div class="menu-item" @click="$router.push('/world')">地标编辑器</div>
        <div class="menu-item" @click="$router.push('/cardoutput')">角色卡快搭</div>
      </div>
      <div style="display: flex; align-items: center;">
        <el-button type="primary" circle @click="openGithub" style="margin-right: 6px;">
          <Icon icon="devicon:github" width="16" height="16" />
        </el-button>
        <p class="whatYouwant">dev_0.1.3</p>
      </div>
    </div>
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
