<script setup lang="ts">
import { ref } from 'vue'
import MainPage from './components/MainPage.vue'

const mainPageRef = ref<InstanceType<typeof MainPage>>()

function handleMenuClick(action: string) {
  switch (action) {
    case 'character':
    case 'world':
      mainPageRef.value?.showPage(action)
      break
  }
}
</script>

<template>
  <div class="app-container">
    <div class="menu-bar">
      <div class="menu-item" @click="handleMenuClick('character')">角色卡编辑器</div>
      <div class="menu-item" @click="handleMenuClick('world')">世界书编辑器</div>
    </div>
    <MainPage ref="mainPageRef" />
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.menu-bar {
  height: 40px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
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
