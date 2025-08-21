<template>
  <div class="world-editor-main-panel">
    <template v-if="props.selectedItem">
      <div class="editor-header">
        <h1 class="page-title">编辑区域</h1>
        <WorldEditorActionButtons
          @save-to-file="handleSaveToFile"
          @load-from-file="handleLoadFromFile"
          @copy-to-clipboard="handleCopyToClipboard"
          @import-from-clipboard="handleImportFromClipboard"
        />
      </div>
      <div class="editor-content">
        <LandmarkEditor v-if="isLandmark(props.selectedItem)" :landmark="props.selectedItem" />
        <ForceEditor v-else-if="isForce(props.selectedItem)" :force="props.selectedItem" />
        <div v-else class="editor-placeholder">
          <p>未知项目类型</p>
        </div>
      </div>
    </template>
    <div v-else class="editor-placeholder">
      <p>请从左侧列表选择一个项目进行编辑</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EnhancedLandmark, EnhancedForce } from '@/types/world-editor';
import LandmarkEditor from './LandmarkEditor.vue';
import ForceEditor from './ForceEditor.vue';
import WorldEditorActionButtons from './WorldEditorActionButtons.vue';
import { ElMessage } from 'element-plus';
import { cleanObject } from '@/utils/objectUtils';

interface Props {
  selectedItem: EnhancedLandmark | EnhancedForce | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:selectedItem', item: EnhancedLandmark | EnhancedForce): void;
}>();

const sanitizeItem = (item: any) => {
  return cleanObject(item, ['id', 'imageUrl', 'createdAt', 'updatedAt', 'version'], ['_']);
};

const handleSaveToFile = () => {
  if (!props.selectedItem) return;
  const cleanItem = sanitizeItem(props.selectedItem);
  const dataStr = JSON.stringify(cleanItem, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.selectedItem.name || 'world-item'}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  ElMessage.success('已导出为 JSON 文件。');
};

const handleLoadFromFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const importedData = JSON.parse(content);
            updateSelectedItem(importedData);
          }
        } catch (error) {
          ElMessage.error('无法解析JSON文件，请检查文件格式。');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const handleCopyToClipboard = async () => {
  if (!props.selectedItem) return;
  try {
    const cleanItem = sanitizeItem(props.selectedItem);
    const dataStr = JSON.stringify(cleanItem, null, 2);
    await navigator.clipboard.writeText(dataStr);
    ElMessage.success('已复制到剪贴板。');
  } catch (err) {
    ElMessage.error('复制失败。');
  }
};

const handleImportFromClipboard = (data: string) => {
  try {
    const importedData = JSON.parse(data);
    updateSelectedItem(importedData);
  } catch (error) {
    ElMessage.error('无效的JSON格式。');
  }
};

const updateSelectedItem = (importedData: any) => {
  if (!props.selectedItem) return;
  // 保留原有的uuid和内部字段，只更新其他字段
  const updatedItem = {
    ...props.selectedItem,
    ...importedData,
    id: props.selectedItem.id,
  };
  emit('update:selectedItem', updatedItem);
  ElMessage.success('导入成功！');
};

// Type guard to check if the selected item is a Landmark
const isLandmark = (item: any): item is EnhancedLandmark => {
  return 'region' in item && 'importance' in item;
};

// Type guard to check if the selected item is a Force
const isForce = (item: any): item is EnhancedForce => {
  return 'power' in item && 'structure' in item;
}
</script>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.world-editor-main-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.editor-content {
  flex-grow: 1;
  overflow-y: auto; /* 如果内容超长，则显示滚动条 */
}

.editor-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
}
</style>