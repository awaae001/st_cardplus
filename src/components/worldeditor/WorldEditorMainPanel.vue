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
        <ProjectEditor v-if="isProject(props.selectedItem)" :project="props.selectedItem" />
        <LandmarkEditor v-else-if="isLandmark(props.selectedItem)" :landmark="props.selectedItem" :all-tags="props.allTags" />
        <ForceEditor v-else-if="isForce(props.selectedItem)" :force="props.selectedItem" :all-tags="props.allTags" />
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
import { toRef } from 'vue';
import type { Project, EnhancedLandmark, EnhancedForce } from '@/types/world-editor';
import ProjectEditor from './ProjectEditor.vue';
import LandmarkEditor from './LandmarkEditor.vue';
import ForceEditor from './ForceEditor.vue';
import WorldEditorActionButtons from './WorldEditorActionButtons.vue';
import { ElMessage } from 'element-plus';
import { useClipboard } from '@/composables/worldeditor/useClipboard';
import { useFileSystem } from '@/composables/worldeditor/useFileSystem';

interface Props {
  selectedItem: Project | EnhancedLandmark | EnhancedForce | null;
  allTags?: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:selectedItem', item: Project | EnhancedLandmark | EnhancedForce): void;
}>();

const selectedItemRef = toRef(props, 'selectedItem');

const updateSelectedItem = (importedData: any) => {
  if (!props.selectedItem) return;
  const updatedItem = {
    ...props.selectedItem,
    ...importedData,
    id: props.selectedItem.id,
  };
  emit('update:selectedItem', updatedItem);
  ElMessage.success('导入成功！');
};

const { handleCopyToClipboard, handleImportFromClipboard } = useClipboard(selectedItemRef, updateSelectedItem);
const { handleSaveToFile, handleLoadFromFile } = useFileSystem(selectedItemRef, updateSelectedItem);

const isProject = (item: any): item is Project => {
  return item && 'createdAt' in item && !('projectId' in item);
}

const isLandmark = (item: any): item is EnhancedLandmark => {
  return item && 'projectId' in item && 'region' in item;
};

const isForce = (item: any): item is EnhancedForce => {
  return item && 'projectId' in item && 'power' in item;
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

.editor-content {
  flex-grow: 1;
  overflow-y: auto;
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