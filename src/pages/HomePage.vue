<template>
  <div class="welcome-container">
    <img
      src="/image/logo.png"
      alt="ST CardPlus"
      class="logo"
    />
    <h1 class="title">欢迎使用 ST CardPlus</h1>
    <p class="subtitle">你今天要创造些什么？</p>
    <p class="hint">请从顶部导航栏选择要编辑的内容</p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 16vh;
}

.logo {
  width: 7.5rem;
  border-radius: 1rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--el-text-color-primary);
}

.subtitle {
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: var(--el-text-color-secondary);
}

.hint {
  font-size: 1rem;
  line-height: 1.5rem;
  margin-top: 1rem;
  color: var(--el-text-color-regular);
}
</style>
