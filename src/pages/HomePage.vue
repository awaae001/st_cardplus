<template>
  <div class="welcome-container">
    <img
      src="../image/logo.png"
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
@reference "tailwindcss";

.welcome-container {
  @apply flex flex-col justify-center items-center mt-[16vh];
}

.logo {
  @apply w-30 rounded-2xl shadow-lg;
}

.title {
  @apply text-3xl font-bold mt-6 mb-2;
  color: var(--el-text-color-primary);
}

.subtitle {
  @apply text-lg;
  color: var(--el-text-color-secondary);
}

.hint {
  @apply text-base mt-4;
  color: var(--el-text-color-regular);
}
</style>
