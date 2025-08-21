<template>
  <div class="world-editor-main-panel">
    <template v-if="props.selectedItem">
      <LandmarkEditor v-if="isLandmark(props.selectedItem)" :landmark="props.selectedItem" />
      <ForceEditor v-else-if="isForce(props.selectedItem)" :force="props.selectedItem" />
      <div v-else class="editor-placeholder">
        <p>未知项目类型</p>
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

interface Props {
  selectedItem: EnhancedLandmark | EnhancedForce | null;
}

const props = defineProps<Props>();

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
.world-editor-main-panel {
  height: 100%;
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