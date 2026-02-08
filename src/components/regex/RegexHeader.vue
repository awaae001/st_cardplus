<template>
  <div class="header">
    <h2>SillyTavern 正则表达式编辑器</h2>
    <div>
      <el-button
        @click="triggerFileInput"
        type="primary"
      >
        导入JSON
      </el-button>
      <el-button
        @click="$emit('export')"
        type="success"
      >
        导出JSON
      </el-button>
      <input
        type="file"
        ref="fileInput"
        @change="handleFileImport"
        style="display: none"
        accept=".json"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const emit = defineEmits(['import', 'export']);

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const content = e.target?.result;
      if (typeof content !== 'string') throw new Error('File content is not a string.');
      const jsonData = JSON.parse(content);
      emit('import', jsonData);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      ElMessage.error('导入失败，无效的JSON文件 ');
    }
  };

  reader.onerror = () => {
    ElMessage.error('读取文件失败 ');
  };
  reader.readAsText(file);
  target.value = '';
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
