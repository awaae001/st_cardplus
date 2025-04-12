<script setup lang="ts">
import { ref } from 'vue'

// 工具箱卡片数据
const tools = ref([
  {
    title: 'JSON格式化',
    icon: 'material-symbols:code',
    description: '去除JSON中的换行和多余空格',
    route: '/tools/json-formatter'
  }
])
</script>

<template>
  <div class="toolbox-container">
    <h1>工具箱</h1>
    <div class="tools-grid">
      <el-card 
        v-for="(tool, index) in tools" 
        :key="index" 
        class="tool-card"
        shadow="hover"
        @click="$router.push(tool.route)"
      >
        <div class="card-content">
          <Icon :icon="tool.icon" width="48" height="48" />
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.description }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.toolbox-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.tool-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.tool-card:hover {
  transform: translateY(-5px);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.card-content h3 {
  margin: 10px 0;
}

.card-content p {
  color: var(--el-text-color-secondary);
}
</style>
