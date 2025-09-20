<template>
  <div class="image-panel-container">
    <el-image :src="previewUrl" fit="contain" class="character-image">
      <template #error>
        <div class="image-placeholder">
          <span>暂无图片</span>
        </div>
      </template>
    </el-image>
    <el-upload
      action="#"
      :show-file-list="false"
      :auto-upload="false"
      @change="handleImageChange"
      accept="image/png, image/jpeg, image/webp"
      class="upload-button"
    >
      <el-button type="primary">选择图片</el-button>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ElImage, ElUpload, ElButton } from 'element-plus';
import type { UploadFile } from 'element-plus';

defineProps<{
  previewUrl?: string;
}>();

const emit = defineEmits<{
  (e: 'image-change', file: File): void;
}>();

const handleImageChange = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    emit('image-change', uploadFile.raw);
  }
};
</script>

<style scoped>
.image-panel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.character-image {
  width: 100%;
  height: calc(100% - 50px); /* 留出按钮空间 */
  border-radius: 6px;
  background-color: var(--el-fill-color-light);
  border: 1px dashed var(--el-border-color);
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.upload-button {
  margin-top: 10px;
}
</style>