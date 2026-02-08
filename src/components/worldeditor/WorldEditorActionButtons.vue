<template>
  <div class="action-buttons-container">
    <div class="button-group">
      <el-button
        type="success"
        @click="emit('loadFromFile')"
      >
        <Icon
          icon="material-symbols:folder-open-outline-sharp"
          width="18"
          height="18"
          style="margin-right: 4px"
        />
        导入 JSON
      </el-button>
      <el-button
        type="primary"
        @click="emit('saveToFile')"
      >
        <Icon
          icon="material-symbols:file-save-outline"
          width="18"
          height="18"
          style="margin-right: 4px"
        />
        导出 JSON
      </el-button>
    </div>
    <div class="button-group">
      <el-button
        type="info"
        @click="emit('copyToClipboard')"
        title="复制到剪贴板"
      >
        <Icon
          icon="material-symbols:content-copy-outline"
          width="18"
          height="18"
        />
      </el-button>
      <el-button
        type="warning"
        @click="showImportDialog"
        title="从剪贴板导入"
      >
        <Icon
          icon="material-symbols:content-paste-go-rounded"
          width="18"
          height="18"
        />
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ElMessageBox } from 'element-plus';

const emit = defineEmits<{
  (e: 'saveToFile'): void;
  (e: 'loadFromFile'): void;
  (e: 'copyToClipboard'): void;
  (e: 'importFromClipboard', data: string): void;
}>();

const showImportDialog = () => {
  ElMessageBox.prompt('请粘贴要导入的JSON数据', '从剪贴板导入', {
    confirmButtonText: '导入',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '在此处粘贴JSON数据',
    inputValidator: (value) => {
      if (!value) {
        return '导入的数据不能为空 ';
      }
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return '请输入有效的JSON格式 ';
      }
    },
  })
    .then((result) => {
      const { value } = result as { value: string };
      emit('importFromClipboard', value);
    })
    .catch(() => {
      // 用户取消操作，无需处理
    });
};
</script>

<style scoped>
.action-buttons-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.button-group {
  display: flex;
  gap: 8px;
}
</style>
