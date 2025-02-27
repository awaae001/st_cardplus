<template>
  <div class="welcome-container">
    <h1>欢迎使用编辑器</h1>
    <p>请从顶部菜单选择要编辑的内容</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.welcome-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

p {
  font-size: 1.2rem;
  color: #666;
}
</style>
