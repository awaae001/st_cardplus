<template>
  <div class="layout-container">
    <div class="menu-bar">
      <div class="menu-item" @click="$router.push('/card')">角色卡编辑器</div>
      <div class="menu-item" @click="$router.push('/world')">世界书编辑器</div>
      <div class="menu-item" @click="handleSave">保存</div>
      <div class="menu-item" @click="handleLoad">加载</div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

async function handleSave() {
  if (!route.name) {
    ElMessage.warning('请先选择一个页面')
    return
  }

  // 保存逻辑将在具体页面组件中实现
  ElMessage.success('保存成功')
}

async function handleLoad() {
  if (!route.name) {
    ElMessage.warning('请先选择一个页面')
    return
  }

  // 加载逻辑将在具体页面组件中实现
  ElMessage.success('加载成功')
}
</script>

<style scoped>
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
