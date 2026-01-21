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

    <div v-if="childGraphVisible" class="child-graph-popup" :style="childGraphStyle">
      <div class="child-graph-header" @mousedown="startChildGraphDrag">
        <div class="child-graph-title">{{ childGraphTitle }}</div>
        <button @click="closeChildGraph" class="close-button">
          <Icon icon="ph:x" />
        </button>
      </div>
      <div class="child-graph-body">
        <div class="child-graph-canvas" :style="{ height: `${childGraphSize.height - 84}px` }">
          <VueFlow :nodes="childGraphNodesWithBridges" :edges="childGraphEdgesWithBridges" :fit-view-on-init="true"
            :delete-key-code="['Backspace', 'Delete']" :connection-mode="ConnectionMode.Strict" :min-zoom="0.2"
            :max-zoom="2" :edge-types="childEdgeTypes" @node-drag-stop="handleChildNodeDragStopProxy"
            @connect="handleChildConnectProxy" @edges-change="handleChildEdgesChangeProxy"
            @node-click="handleChildNodeClick">
            <Background :gap="18" :size="1" color="#c9ced6" />
            <Controls position="bottom-right" />
            <template #node-landmark="{ data }">
              <LandmarkNode :data="data" />
            </template>
            <template #node-bridge="{ data }">
              <BridgeNode :data="data" />
            </template>
          </VueFlow>
        </div>
      </div>
      <WorldGraphInspector
        v-if="childSelectedLandmark"
        :selected-landmark="childSelectedLandmark"
        :selected-forces="childSelectedForces"
        :project-regions="projectRegions"
        :inspector-style="childInspectorStyle"
        :start-drag="startChildInspectorDrag"
        @close="clearChildSelection"
        @edit="emitEditSelected"
      />
      <button class="child-graph-resizer" @mousedown.stop.prevent="startChildGraphResize" aria-label="调整窗口大小"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, type CSSProperties } from 'vue';
import { VueFlow, ConnectionMode } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { Icon } from '@iconify/vue';
import type { Project, EnhancedLandmark, EnhancedForce, EnhancedRegion } from '@/types/world-editor';
import { useWorldGraph } from '@/composables/worldeditor/useWorldGraph';
import { collectDescendantIds, getParentLandmarkId } from '@/utils/worldeditor/landmarkHierarchy';
import { readSessionStorageJSON, writeSessionStorageJSON, readLocalStorageJSON, writeLocalStorageJSON } from '@/utils/localStorageUtils';
import LandmarkNode from './graph/LandmarkNode.vue';
import BridgeNode from './graph/BridgeNode.vue';
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

const activeProjectId = computed(() => {
  if (props.activeProjectId) return props.activeProjectId;
  return props.projects[0]?.id || null;
});

const rootLandmarks = computed(() => {
  if (!activeProjectId.value) return [];
  return props.landmarks.filter(landmark =>
    landmark.projectId === activeProjectId.value && !getParentLandmarkId(landmark)
  );
});

const mainGraphState = useWorldGraph(props, { landmarkScope: rootLandmarks });

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
  handleNodeClick: selectNode,
  clearSelection,
} = mainGraphState;

const childGraphVisible = ref(false);
const childGraphParentId = ref<string | null>(null);
const childGraphPosition = ref({ x: 80, y: 80 });
const childGraphSize = ref({ width: 460, height: 360 });
const isChildDragging = ref(false);
const childDragStart = ref({ x: 0, y: 0 });
const isChildResizing = ref(false);
const childResizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });
const BRIDGE_POSITIONS_KEY = 'world-editor-bridge-positions';
const CHILD_GRAPH_SIZE_KEY = 'world-editor-child-graph-size';
const bridgePositions = ref<Record<string, { x: number; y: number }>>(
  readLocalStorageJSON<Record<string, { x: number; y: number }>>(BRIDGE_POSITIONS_KEY) || {}
);
const storedChildSize = readSessionStorageJSON<{ width: number; height: number }>(CHILD_GRAPH_SIZE_KEY);
if (storedChildSize?.width && storedChildSize?.height) {
  childGraphSize.value = storedChildSize;
}

const childGraphParent = computed(() => {
  if (!childGraphParentId.value) return null;
  return props.landmarks.find(landmark => landmark.id === childGraphParentId.value) || null;
});

const childGraphTitle = computed(() => {
  if (!childGraphParent.value) return '子地标节点图';
  return `${childGraphParent.value.name} · 子地标节点图`;
});

const childGraphLandmarks = computed(() => {
  if (!childGraphParent.value) return [];
  const descendantIds = collectDescendantIds(props.landmarks, childGraphParent.value.id);
  return props.landmarks.filter(landmark => descendantIds.has(landmark.id));
});

const childGraphLandmarkIdSet = computed(() => new Set(childGraphLandmarks.value.map(landmark => landmark.id)));

const positionToSide = (
  parent?: { x: number; y: number },
  external?: { x: number; y: number }
): 'left' | 'right' | 'top' | 'bottom' | null => {
  if (!parent || !external) return null;
  const dx = external.x - parent.x;
  const dy = external.y - parent.y;
  if (dx === 0 && dy === 0) return null;
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const normalized = (angle + 360) % 360;
  if (normalized >= 315 || normalized < 45) return 'top';
  if (normalized >= 45 && normalized < 135) return 'right';
  if (normalized >= 135 && normalized < 225) return 'bottom';
  return 'left';
};

const invertSide = (side: 'left' | 'right' | 'top' | 'bottom') => {
  switch (side) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    default:
      return side;
  }
};

const childGraphBridgeMeta = computed(() => {
  const meta = new Map<string, { nodeId: string; label: string; side: 'left' | 'right' | 'top' | 'bottom'; handleId: string; externalId: string; externalHandle?: string }>();
  if (!childGraphParent.value) return meta;
  const parent = childGraphParent.value;
  const externalIds = new Set<string>();

  (parent.relatedLandmarks || []).forEach(id => externalIds.add(id));
  (parent.roadConnections || []).forEach(conn => externalIds.add(conn.targetId));

  externalIds.forEach(externalId => {
    if (childGraphLandmarkIdSet.value.has(externalId)) return;
    if (externalId === parent.id) return;
    const external = props.landmarks.find(item => item.id === externalId);
    if (!external) return;
    const parentConn = parent.roadConnections?.find(conn => conn.targetId === externalId);
    const externalConn = external.roadConnections?.find(conn => conn.targetId === parent.id);
    const side = positionToSide(parent.position, external.position);
    if (!side) return;
    const nodeId = `bridge:${parent.id}:${externalId}`;
    meta.set(externalId, {
      nodeId,
      label: `来自 ${external.name} 的道路`,
      side,
      handleId: `bridge-${invertSide(side)}`,
      externalId,
      externalHandle: externalConn?.handle ?? parentConn?.targetHandle,
    });
  });

  return meta;
});

const getBridgeDefaults = () => {
  const positions: Record<string, { x: number; y: number }> = {};
  const sideCounts = { left: 0, right: 0, top: 0, bottom: 0 };
  const spacing = 70;
  const list = childGraphLandmarks.value;
  const columns = 4;
  const spacingX = 220;
  const spacingY = 160;
  const margin = 80;

  let minX = 0;
  let maxX = 400;
  let minY = 0;
  let maxY = 260;

  if (list.length > 0) {
    minX = Number.POSITIVE_INFINITY;
    minY = Number.POSITIVE_INFINITY;
    maxX = Number.NEGATIVE_INFINITY;
    maxY = Number.NEGATIVE_INFINITY;
    list.forEach((landmark, index) => {
      const fallback = {
        x: (index % columns) * spacingX,
        y: Math.floor(index / columns) * spacingY,
      };
      const position = landmark.position ?? fallback;
      minX = Math.min(minX, position.x);
      maxX = Math.max(maxX, position.x);
      minY = Math.min(minY, position.y);
      maxY = Math.max(maxY, position.y);
    });
  }

  childGraphBridgeMeta.value.forEach(meta => {
    const count = sideCounts[meta.side]++;
    let x = minX;
    let y = minY;
    if (meta.side === 'left') {
      x = minX - margin;
      y = minY + count * spacing;
    } else if (meta.side === 'right') {
      x = maxX + margin;
      y = minY + count * spacing;
    } else if (meta.side === 'top') {
      x = minX + count * spacing;
      y = minY - margin;
    } else if (meta.side === 'bottom') {
      x = minX + count * spacing;
      y = maxY + margin;
    }
    positions[meta.nodeId] = { x, y };
  });

  return positions;
};

const childGraphBridgeNodes = computed(() => {
  const nodes: any[] = [];
  const defaults = getBridgeDefaults();

  childGraphBridgeMeta.value.forEach(meta => {
    const stored = bridgePositions.value[meta.nodeId];
    const fallback = defaults[meta.nodeId] || { x: 0, y: 0 };
    nodes.push({
      id: meta.nodeId,
      type: 'bridge',
      position: stored ? { x: stored.x, y: stored.y } : { x: fallback.x, y: fallback.y },
      draggable: true,
      data: {
        label: meta.label,
        side: meta.side,
        handleSide: invertSide(meta.side),
        handleId: meta.handleId,
      },
    });
  });

  return nodes;
});

const childGraphNodesWithBridges = computed(() => {
  return [...childGraphNodes.value, ...childGraphBridgeNodes.value];
});

const removeBridgeConnection = (childId: string, externalId: string) => {
  const child = props.landmarks.find(item => item.id === childId);
  const external = props.landmarks.find(item => item.id === externalId);
  if (!child || !external) return;
  child.relatedLandmarks = (child.relatedLandmarks || []).filter(id => id !== externalId);
  external.relatedLandmarks = (external.relatedLandmarks || []).filter(id => id !== childId);
  child.roadConnections = (child.roadConnections || []).filter(conn => conn.targetId !== externalId);
  external.roadConnections = (external.roadConnections || []).filter(conn => conn.targetId !== childId);
};

const childGraphBridgeEdges = computed(() => {
  const edges: any[] = [];
  childGraphLandmarks.value.forEach(child => {
    (child.relatedLandmarks || []).forEach(externalId => {
      const meta = childGraphBridgeMeta.value.get(externalId);
      if (!meta) return;
      const childConn = child.roadConnections?.find(conn => conn.targetId === externalId);
      edges.push({
        id: `bridge-edge:${child.id}:${externalId}`,
        source: child.id,
        target: meta.nodeId,
        sourceHandle: childConn?.handle,
        targetHandle: meta.handleId,
        type: 'removable',
        data: {
          onRemove: () => removeBridgeConnection(child.id, externalId),
        },
      });
    });
  });
  return edges;
});

const childGraphEdgesWithBridges = computed(() => {
  return [...childGraphEdges.value, ...childGraphBridgeEdges.value];
});

const childGraphState = useWorldGraph(props, { landmarkScope: childGraphLandmarks });
const {
  nodes: childGraphNodes,
  edges: childGraphEdges,
  edgeTypes: childEdgeTypes,
  selectedLandmark: childSelectedLandmark,
  selectedForces: childSelectedForces,
  inspectorStyle: childInspectorStyle,
  startDrag: startChildInspectorDrag,
  handleNodeDragStop: handleChildNodeDragStop,
  handleConnect: handleChildConnect,
  handleEdgesChange: handleChildEdgesChange,
  handleNodeClick: handleChildNodeClick,
  clearSelection: clearChildSelection,
} = childGraphState;

const childGraphStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  left: `${childGraphPosition.value.x}px`,
  top: `${childGraphPosition.value.y}px`,
  width: `${childGraphSize.value.width}px`,
  zIndex: 12,
}));

const startChildGraphDrag = (event: MouseEvent) => {
  isChildDragging.value = true;
  childDragStart.value = {
    x: event.clientX - childGraphPosition.value.x,
    y: event.clientY - childGraphPosition.value.y,
  };
  document.addEventListener('mousemove', onChildGraphDrag);
  document.addEventListener('mouseup', stopChildGraphDrag);
};

const onChildGraphDrag = (event: MouseEvent) => {
  if (!isChildDragging.value) return;
  childGraphPosition.value = {
    x: event.clientX - childDragStart.value.x,
    y: event.clientY - childDragStart.value.y,
  };
};

const stopChildGraphDrag = () => {
  isChildDragging.value = false;
  document.removeEventListener('mousemove', onChildGraphDrag);
  document.removeEventListener('mouseup', stopChildGraphDrag);
};

const startChildGraphResize = (event: MouseEvent) => {
  isChildResizing.value = true;
  childResizeStart.value = {
    x: event.clientX,
    y: event.clientY,
    width: childGraphSize.value.width,
    height: childGraphSize.value.height,
  };
  document.addEventListener('mousemove', onChildGraphResize);
  document.addEventListener('mouseup', stopChildGraphResize);
};

const onChildGraphResize = (event: MouseEvent) => {
  if (!isChildResizing.value) return;
  const nextWidth = Math.max(320, childResizeStart.value.width + (event.clientX - childResizeStart.value.x));
  const nextHeight = Math.max(260, childResizeStart.value.height + (event.clientY - childResizeStart.value.y));
  childGraphSize.value = { width: nextWidth, height: nextHeight };
};

const stopChildGraphResize = () => {
  isChildResizing.value = false;
  writeSessionStorageJSON(CHILD_GRAPH_SIZE_KEY, childGraphSize.value);
  document.removeEventListener('mousemove', onChildGraphResize);
  document.removeEventListener('mouseup', stopChildGraphResize);
};

const linkLandmarks = (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
  const sourceLandmark = props.landmarks.find(item => item.id === sourceId);
  const targetLandmark = props.landmarks.find(item => item.id === targetId);
  if (!sourceLandmark || !targetLandmark) return;

  if (!sourceLandmark.relatedLandmarks) sourceLandmark.relatedLandmarks = [];
  if (!targetLandmark.relatedLandmarks) targetLandmark.relatedLandmarks = [];
  if (!sourceLandmark.relatedLandmarks.includes(targetId)) {
    sourceLandmark.relatedLandmarks.push(targetId);
  }
  if (!targetLandmark.relatedLandmarks.includes(sourceId)) {
    targetLandmark.relatedLandmarks.push(sourceId);
  }

  const upsertRoadConnection = (
    landmark: EnhancedLandmark,
    target: string,
    handle?: string,
    targetHandle?: string
  ) => {
    if (!landmark.roadConnections) {
      landmark.roadConnections = [];
    }
    const existing = landmark.roadConnections.find(conn => conn.targetId === target);
    if (existing) {
      existing.handle = handle;
      existing.targetHandle = targetHandle;
    } else {
      landmark.roadConnections.push({ targetId: target, handle, targetHandle });
    }
  };

  upsertRoadConnection(sourceLandmark, targetId, sourceHandle, targetHandle);
  upsertRoadConnection(targetLandmark, sourceId, targetHandle, sourceHandle);
};

const handleChildConnectProxy = (params: any) => {
  const source = params.source as string | null;
  const target = params.target as string | null;
  if (!source || !target) return;

  const isBridgeSource = source.startsWith('bridge:');
  const isBridgeTarget = target.startsWith('bridge:');

  if (isBridgeSource || isBridgeTarget) {
    const bridgeId = isBridgeSource ? source : target;
    const childId = isBridgeSource ? target : source;
    const externalId = bridgeId.split(':').slice(2).join(':');
    const meta = childGraphBridgeMeta.value.get(externalId);
    if (!meta) return;
    const childHandle = isBridgeSource ? params.targetHandle : params.sourceHandle;
    const externalHandle = meta.externalHandle;
    if (isBridgeSource) {
      linkLandmarks(externalId, childId, externalHandle, childHandle);
    } else {
      linkLandmarks(childId, externalId, childHandle, externalHandle);
    }
    return;
  }

  handleChildConnect(params);
};

const handleChildEdgesChangeProxy = (changes: any[]) => {
  const removed = changes.filter(change => change.type === 'remove' && typeof change.id === 'string');
  if (removed.length > 0) {
    removed.forEach(change => {
      const edgeId = change.id as string;
      if (edgeId.startsWith('bridge-edge:')) {
        const parts = edgeId.split(':');
        if (parts.length >= 3) {
          const childId = parts[1];
          const externalId = parts.slice(2).join(':');
          removeBridgeConnection(childId, externalId);
        }
      }
    });
  }
  const forwarded = changes.filter(change =>
    !(typeof change.id === 'string' && (change.id as string).startsWith('bridge-edge:'))
  );
  if (forwarded.length > 0) {
    handleChildEdgesChange(forwarded);
  }
};

const closeChildGraph = () => {
  childGraphVisible.value = false;
  clearChildSelection();
};

const handleChildNodeDragStopProxy = (event: unknown, node?: { id?: string; position?: { x: number; y: number } }) => {
  const resolvedNode = node ?? (event as { node?: { id?: string; position?: { x: number; y: number } } })?.node;
  if (!resolvedNode?.id) return;
  if (resolvedNode.id.startsWith('bridge:') && resolvedNode.position) {
    bridgePositions.value = {
      ...bridgePositions.value,
      [resolvedNode.id]: { x: resolvedNode.position.x, y: resolvedNode.position.y },
    };
    return;
  }
  handleChildNodeDragStop(event, node as any);
};

watch(bridgePositions, (value) => {
  writeLocalStorageJSON(BRIDGE_POSITIONS_KEY, value);
}, { deep: true });

watch(childGraphBridgeMeta, (meta) => {
  const validIds = new Set(Array.from(meta.values()).map(item => item.nodeId));
  const nextPositions: Record<string, { x: number; y: number }> = {};
  Object.entries(bridgePositions.value).forEach(([id, pos]) => {
    if (validIds.has(id)) {
      nextPositions[id] = pos;
    }
  });
  const defaults = getBridgeDefaults();
  let changed = false;
  validIds.forEach(id => {
    if (!nextPositions[id] && defaults[id]) {
      nextPositions[id] = defaults[id];
      changed = true;
    }
  });
  if (changed || Object.keys(nextPositions).length !== Object.keys(bridgePositions.value).length) {
    bridgePositions.value = nextPositions;
  }
}, { immediate: true });

const handleNodeClick = (event: unknown, node?: { id?: string }) => {
  selectNode(event, node as any);
  const resolvedId = node?.id ?? (event as { node?: { id?: string } })?.node?.id;
  if (!resolvedId) return;
  const descendantIds = collectDescendantIds(props.landmarks, resolvedId);
  if (descendantIds.size > 0) {
    childGraphParentId.value = resolvedId;
    childGraphVisible.value = true;
  }
};

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onChildGraphDrag);
  document.removeEventListener('mouseup', stopChildGraphDrag);
  document.removeEventListener('mousemove', onChildGraphResize);
  document.removeEventListener('mouseup', stopChildGraphResize);
});

const emitEditSelected = (item?: EnhancedLandmark) => {
  const target = item || selectedLandmark.value;
  if (target) {
    emit('edit-item', target);
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
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  pointer-events: none;
}

.child-graph-canvas {
  height: 320px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: linear-gradient(135deg, #f6f2ea 0%, #edf1f7 100%);
  overflow: hidden;
}

.child-graph-canvas :deep(.vue-flow__node-bridge) {
  z-index: 2;
}

.child-graph-popup {
  width: 460px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  position: relative;
}

.child-graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
}

.child-graph-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.child-graph-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.child-graph-resizer {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 16px;
  height: 16px;
  border: none;
  background: linear-gradient(135deg, transparent 45%, var(--el-border-color) 45%, var(--el-border-color) 55%, transparent 55%);
  cursor: se-resize;
  padding: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: var(--el-text-color-secondary);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
