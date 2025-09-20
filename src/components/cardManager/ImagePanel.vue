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
      ref="uploadRef"
      action="#"
      :show-file-list="false"
      :auto-upload="false"
      @change="handleImageChange"
      @exceed="handleExceed"
      @error="handleError"
      accept="image/png, image/jpeg, image/webp"
      class="upload-button"
      :limit="1"
    >
      <el-button type="primary">🖼️ 选择角色头像</el-button>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElImage, ElUpload, ElButton, ElMessage } from 'element-plus';
import type { UploadFile, UploadFiles, UploadInstance } from 'element-plus';

defineProps<{
  previewUrl?: string;
}>();

const emit = defineEmits<{
  (e: 'image-change', file: File): void;
}>();

const uploadRef = ref<UploadInstance>();

const handleImageChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log('ImagePanel: handleImageChange called with:', uploadFile);
  console.log('ImagePanel: uploadFiles length:', uploadFiles.length);

  if (uploadFile.raw) {
    console.log('ImagePanel: Emitting image-change event with file:', uploadFile.raw.name, uploadFile.raw.size);
    emit('image-change', uploadFile.raw);

    // Clear the file list to ensure the same file can be selected again
    setTimeout(() => {
      uploadRef.value?.clearFiles();
    }, 100);
  } else {
    console.warn('ImagePanel: No raw file found in uploadFile');
  }
};

const handleExceed = (files: File[], uploadFiles: UploadFiles) => {
  console.warn('ImagePanel: File limit exceeded');
  ElMessage.warning('只能选择一个图片文件');
};

const handleError = (error: Error) => {
  console.error('ImagePanel: Upload error:', error);
  ElMessage.error('图片选择失败');
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