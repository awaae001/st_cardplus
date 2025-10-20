<template>
  <div class="welcome-screen">
    <div class="welcome-content">
      <Icon icon="ph:cards-duotone" class="welcome-icon" />
      <h2 class="welcome-title">欢迎来到角色卡编辑器</h2>
      <p class="welcome-description">创建一个新角色或导入已有的角色卡</p>
      <div class="welcome-actions">
        <el-button type="success" size="large" @click="emit('createNew')">
          <Icon icon="ph:plus-circle-duotone" />
          创建新角色
        </el-button>
        <div></div>
        <el-button type="primary" size="large" @click="emit('importCard')" :loading="isUploading">
          <Icon icon="ph:upload-duotone" v-if="!isUploading" />
          {{ isUploading ? uploadProgress : '导入角色卡' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from 'element-plus';
import { Icon } from '@iconify/vue';

defineProps<{
  isUploading: boolean;
  uploadProgress: string;
}>();

const emit = defineEmits<{
  (e: 'createNew'): void;
  (e: 'importCard'): void;
}>();
</script>

<style scoped>
.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  height: 100%;
  padding: 48px 24px;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
}

.welcome-icon {
  font-size: 80px;
  color: var(--el-color-primary);
  margin-bottom: 24px;
  opacity: 0.8;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
}

.welcome-description {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.welcome-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.welcome-actions .el-button {
  width: 100%;
}
</style>