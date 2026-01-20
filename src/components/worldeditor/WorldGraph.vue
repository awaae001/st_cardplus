<template>
  <div class="world-graph">
    <div class="graph-canvas">
      <VueFlow :nodes="nodes" :edges="edges" :fit-view-on-init="true" :delete-key-code="['Backspace', 'Delete']"
        :connection-mode="ConnectionMode.Strict" :min-zoom="0.2" :max-zoom="2" :edge-types="edgeTypes"
        @node-drag-stop="handleNodeDragStop" @connect="handleConnect" @edges-change="handleEdgesChange"
        @node-click="handleNodeClick">
        <Background :gap="18" :size="1" color="#c9ced6" />
        <Controls position="bottom-right" />
        <template #node-landmark="{ data }">
          <LandmarkNode :data="data" />
        </template>
      </VueFlow>
      <div class="graph-canvas-hint">WroldGraph · 连线表示道路链接</div>
    </div>

    <WorldGraphInspector
      v-if="selectedLandmark"
      :selected-landmark="selectedLandmark"
      :selected-forces="selectedForces"
      :project-regions="projectRegions"
      :inspector-style="inspectorStyle"
      :start-drag="startDrag"
      @close="clearSelection"
      @edit="emitEditSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { VueFlow, ConnectionMode } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import type { Project, EnhancedLandmark, EnhancedForce, EnhancedRegion } from '@/types/world-editor';
import { useWorldGraph } from '@/composables/worldeditor/useWorldGraph';
import LandmarkNode from './graph/LandmarkNode.vue';
import WorldGraphInspector from './graph/WorldGraphInspector.vue';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';

interface Props {
  projects: Project[];
  landmarks: EnhancedLandmark[];
  forces: EnhancedForce[];
  regions: EnhancedRegion[];
  activeProjectId?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'edit-item', item: EnhancedLandmark): void;
}>();

const {
  nodes,
  edges,
  edgeTypes,
  projectRegions,
  selectedLandmark,
  selectedForces,
  inspectorStyle,
  startDrag,
  handleNodeDragStop,
  handleConnect,
  handleEdgesChange,
  handleNodeClick,
  clearSelection,
} = useWorldGraph(props);

const emitEditSelected = () => {
  if (selectedLandmark.value) {
    emit('edit-item', selectedLandmark.value);
  }
};
</script>

<style scoped>
.world-graph {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  height: 100%;
  position: relative;
}

.graph-canvas {
  position: relative;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: linear-gradient(135deg, #f6f2ea 0%, #edf1f7 100%);
  overflow: hidden;
}

.graph-canvas-hint {
  position: absolute;
  left: 12px;
  bottom: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  pointer-events: none;
}

:deep(.vue-flow__edge-labels) {
  pointer-events: all;
}

:deep(.edge-remove-button:hover) {
  color: var(--el-color-danger);
  border-color: var(--el-color-danger);
}

@media (max-width: 900px) {
  .world-graph {
    grid-template-columns: 1fr;
  }

  .graph-inspector {
    order: -1;
  }
}
</style>
