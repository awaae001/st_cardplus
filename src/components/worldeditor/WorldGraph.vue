<template>
  <div class="world-graph">
    <div class="graph-canvas">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :fit-view-on-init="true"
        :delete-key-code="['Backspace', 'Delete']"
        :connection-mode="ConnectionMode.Strict"
        :min-zoom="0.2"
        :max-zoom="2"
        @node-drag-stop="handleNodeDragStop"
        @connect="handleConnect"
        @edges-change="handleEdgesChange"
        @node-click="handleNodeClick"
      >
        <Background :gap="18" :size="1" color="#c9ced6" />
        <Controls position="bottom-right" />
        <template #node-landmark="{ data }">
          <div class="landmark-node" :class="nodeSizeClass(data.type)">
            <div class="landmark-node-header">
              <Icon :icon="iconForType(data.type)" class="landmark-node-icon" />
              <div class="landmark-node-title">{{ data.name }}</div>
            </div>
            <div class="landmark-node-subtitle" v-if="data.region">{{ data.region }}</div>
            <div class="landmark-node-forces" v-if="data.forces.length > 0">
              <div
                v-for="force in data.forces.slice(0, 3)"
                :key="force.id"
                class="landmark-node-force"
              >
                <span class="force-name">{{ force.name }}</span>
                <span class="force-role">{{ force.role }}</span>
              </div>
              <div v-if="data.forces.length > 3" class="landmark-node-more">
                +{{ data.forces.length - 3 }} 更多势力
              </div>
            </div>
            <Handle type="source" :position="Position.Right" id="sr" class="landmark-handle" />
            <Handle type="target" :position="Position.Right" id="tr" class="landmark-handle" />
            <Handle type="source" :position="Position.Left" id="sl" class="landmark-handle" />
            <Handle type="target" :position="Position.Left" id="tl" class="landmark-handle" />
            <Handle type="source" :position="Position.Top" id="st" class="landmark-handle" />
            <Handle type="target" :position="Position.Top" id="tt" class="landmark-handle" />
            <Handle type="source" :position="Position.Bottom" id="sb" class="landmark-handle" />
            <Handle type="target" :position="Position.Bottom" id="tb" class="landmark-handle" />
          </div>
        </template>
      </VueFlow>
    </div>
    <div class="graph-inspector">
      <div class="graph-inspector-header">
        <div class="graph-inspector-title">节点信息</div>
        <div class="graph-inspector-subtitle">拖拽节点调整位置，拖拽连线连接道路</div>
      </div>
      <div v-if="selectedLandmark" class="graph-inspector-body">
        <div class="inspector-field">
          <label class="inspector-label">名称</label>
          <el-input v-model="selectedLandmark.name" placeholder="节点名称" />
        </div>
        <div class="inspector-field">
          <label class="inspector-label">类型</label>
          <el-select
            v-model="selectedLandmark.type"
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入类型"
          >
            <el-option
              v-for="type in landmarkTypes"
              :key="type"
              :label="localizeLandmarkType(type)"
              :value="type"
            />
          </el-select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">区域</label>
          <el-input v-model="selectedLandmark.region" placeholder="所属区域" />
        </div>
        <div class="inspector-field">
          <label class="inspector-label">道路连接</label>
          <div class="inspector-list">
            <div v-if="selectedConnections.length === 0" class="inspector-empty">
              暂无连接
            </div>
            <div v-for="item in selectedConnections" :key="item.id" class="inspector-list-item">
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
        <div class="inspector-actions">
          <el-button type="primary" @click="emitEditSelected">打开详细编辑</el-button>
          <el-button @click="clearSelection">清除选择</el-button>
        </div>
      </div>
      <div v-else class="graph-inspector-empty">
        点击地图中的地标查看详情
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { VueFlow, Handle, Position, ConnectionMode, type Edge, type Node } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { Icon } from '@iconify/vue';
import { ElInput, ElButton, ElSelect, ElOption } from 'element-plus';
import type { Project, EnhancedLandmark, EnhancedForce, RoadConnection } from '@/types/world-editor';
import { LandmarkType } from '@/types/world-editor';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/controls/dist/style.css';

interface Props {
  projects: Project[];
  landmarks: EnhancedLandmark[];
  forces: EnhancedForce[];
  activeProjectId?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'edit-item', item: EnhancedLandmark): void;
}>();

const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
const selectedLandmarkId = ref<string | null>(null);
const landmarkTypes = Object.values(LandmarkType);

const localizeLandmarkType = (type: string): string => {
  const map: Record<string, string> = {
    [LandmarkType.CITY]: '城市',
    [LandmarkType.TOWN]: '城镇',
    [LandmarkType.VILLAGE]: '村庄',
    [LandmarkType.FORTRESS]: '要塞',
    [LandmarkType.RUINS]: '遗迹',
    [LandmarkType.DUNGEON]: '地下城',
    [LandmarkType.TEMPLE]: '神殿',
    [LandmarkType.ACADEMY]: '学院',
    [LandmarkType.HARBOR]: '港口',
    [LandmarkType.MARKET]: '市场',
    [LandmarkType.NATURAL]: '自然景观',
    [LandmarkType.OCEAN]: '海洋',
    [LandmarkType.MYSTICAL]: '神秘地点',
    [LandmarkType.CUSTOM]: '自定义',
  };
  return map[type] || type;
};

const activeProjectId = computed(() => {
  if (props.activeProjectId) return props.activeProjectId;
  return props.projects[0]?.id || null;
});

const projectLandmarks = computed(() => {
  if (!activeProjectId.value) return [];
  return props.landmarks.filter(l => l.projectId === activeProjectId.value);
});

const projectForces = computed(() => {
  if (!activeProjectId.value) return [];
  return props.forces.filter(f => f.projectId === activeProjectId.value);
});

const selectedLandmark = computed(() => {
  if (!selectedLandmarkId.value) return null;
  return projectLandmarks.value.find(l => l.id === selectedLandmarkId.value) || null;
});

const selectedConnections = computed(() => {
  if (!selectedLandmark.value) return [];
  const related = selectedLandmark.value.relatedLandmarks || [];
  return related
    .map(id => projectLandmarks.value.find(l => l.id === id))
    .filter((item): item is EnhancedLandmark => Boolean(item));
});

const createDefaultPosition = (index: number) => {
  const columns = 4;
  const spacingX = 220;
  const spacingY = 160;
  return {
    x: (index % columns) * spacingX,
    y: Math.floor(index / columns) * spacingY,
  };
};

const forceRoleAtLandmark = (force: EnhancedForce, landmark: EnhancedLandmark) => {
  if (force.headquarters === landmark.id || force.headquarters === landmark.name) {
    return '总部';
  }
  if (force.branchLocations?.some(branch => branch.locationId === landmark.id)) {
    return '分部';
  }
  return null;
};

const buildNodes = () => {
  const list = projectLandmarks.value;
  nodes.value = list.map((landmark, index) => {
    if (!landmark.position) {
      landmark.position = createDefaultPosition(index);
    }
    const forcesAt = projectForces.value
      .map(force => ({ force, role: forceRoleAtLandmark(force, landmark) }))
      .filter(item => item.role !== null)
      .map(item => ({
        id: item.force.id,
        name: item.force.name,
        role: item.role as string,
      }));

    return {
      id: landmark.id,
      type: 'landmark',
      position: landmark.position,
      data: {
        id: landmark.id,
        name: landmark.name,
        region: landmark.region,
        forces: forcesAt,
        type: landmark.type,
      },
    };
  });
};

const iconForType = (type?: string) => {
  switch (type) {
    case 'city':
      return 'ph:buildings-duotone';
    case 'town':
      return 'ph:house-line-duotone';
    case 'village':
      return 'ph:house-duotone';
    case 'fortress':
      return 'ph:castle-turret-duotone';
    case 'ruins':
      return 'ph:skull-duotone';
    case 'dungeon':
      return 'ph:spiral-duotone';
    case 'temple':
      return 'ph:bank-duotone';
    case 'academy':
      return 'ph:graduation-cap-duotone';
    case 'harbor':
      return 'ph:anchor-duotone';
    case 'market':
      return 'ph:storefront-duotone';
    case 'natural':
      return 'ph:leaf-duotone';
    case 'ocean':
      return 'ph:waves-duotone';
    case 'mystical':
      return 'ph:sparkle-duotone';
    default:
      return 'ph:map-pin-duotone';
  }
};

const nodeSizeClass = (type?: string) => {
  if (type === 'natural') return 'is-large';
  if (type && (type === 'chasm' || type === 'canyon' || type.includes('天堑'))) {
    return 'is-large';
  }
  return '';
};

const getRoadConnection = (landmark: EnhancedLandmark, targetId: string): RoadConnection | null => {
  if (!landmark.roadConnections) return null;
  return landmark.roadConnections.find(conn => conn.targetId === targetId) || null;
};

const buildEdges = () => {
  const list = projectLandmarks.value;
  const existing = new Set<string>();
  const edgeList: Edge[] = [];

  const addEdge = (a: string, b: string) => {
    if (a === b) return;
    const ids = [a, b].sort();
    const key = `${ids[0]}--${ids[1]}`;
    if (existing.has(key)) return;
    existing.add(key);

    const source = ids[0];
    const target = ids[1];
    const sourceLandmark = list.find(item => item.id === source);
    const targetLandmark = list.find(item => item.id === target);
    const connection = sourceLandmark ? getRoadConnection(sourceLandmark, target) : null;
    const fallbackConnection = targetLandmark ? getRoadConnection(targetLandmark, source) : null;
    const sourceHandle = connection?.handle ?? fallbackConnection?.targetHandle;
    const targetHandle = connection?.targetHandle ?? fallbackConnection?.handle;

    edgeList.push({
      id: `edge-${key}`,
      source,
      target,
      sourceHandle,
      targetHandle,
      type: 'default',
    });
  };

  list.forEach(landmark => {
    (landmark.relatedLandmarks || []).forEach(relatedId => {
      const exists = list.some(item => item.id === relatedId);
      if (exists) {
        addEdge(landmark.id, relatedId);
      }
    });
  });

  edges.value = edgeList;
};

watch([projectLandmarks, projectForces], () => {
  buildNodes();
  buildEdges();
}, { deep: true, immediate: true });

watch(activeProjectId, () => {
  selectedLandmarkId.value = null;
});

const handleNodeDragStop = (event: unknown, node?: Node) => {
  const resolvedNode = node ?? (event as { node?: Node })?.node;
  if (!resolvedNode?.id) return;
  const target = projectLandmarks.value.find(item => item.id === resolvedNode.id);
  if (target) {
    target.position = { x: resolvedNode.position.x, y: resolvedNode.position.y };
    recalcRelativePositions();
  }
};

const upsertRoadConnection = (
  landmark: EnhancedLandmark,
  targetId: string,
  handle?: string,
  targetHandle?: string
) => {
  if (!landmark.roadConnections) {
    landmark.roadConnections = [];
  }
  const existing = landmark.roadConnections.find(conn => conn.targetId === targetId);
  if (existing) {
    existing.handle = handle;
    existing.targetHandle = targetHandle;
  } else {
    landmark.roadConnections.push({ targetId, handle, targetHandle });
  }
};

const handleConnect = (params: { source?: string; target?: string; sourceHandle?: string; targetHandle?: string }) => {
  const source = params.source;
  const target = params.target;
  if (!source || !target || source === target) return;


  const sourceLandmark = projectLandmarks.value.find(item => item.id === source);
  const targetLandmark = projectLandmarks.value.find(item => item.id === target);
  if (!sourceLandmark || !targetLandmark) return;

  if (!sourceLandmark.relatedLandmarks) {
    sourceLandmark.relatedLandmarks = [];
  }
  if (!targetLandmark.relatedLandmarks) {
    targetLandmark.relatedLandmarks = [];
  }
  if (!sourceLandmark.relatedLandmarks.includes(target)) {
    sourceLandmark.relatedLandmarks.push(target);
  }
  if (!targetLandmark.relatedLandmarks.includes(source)) {
    targetLandmark.relatedLandmarks.push(source);
  }
  upsertRoadConnection(sourceLandmark, target, params.sourceHandle, params.targetHandle);
  upsertRoadConnection(targetLandmark, source, params.targetHandle, params.sourceHandle);
  buildEdges();
};

const handleEdgesChange = (changes: { id: string; type: string }[]) => {
  const removed = changes.filter(change => change.type === 'remove');
  if (removed.length === 0) return;

  removed.forEach(change => {
    const edge = edges.value.find(item => item.id === change.id);
    if (!edge) return;
    const source = edge.source;
    const target = edge.target;
    const sourceLandmark = projectLandmarks.value.find(item => item.id === source);
    const targetLandmark = projectLandmarks.value.find(item => item.id === target);
    if (sourceLandmark) {
      sourceLandmark.relatedLandmarks = (sourceLandmark.relatedLandmarks || []).filter(id => id !== target);
      sourceLandmark.roadConnections = (sourceLandmark.roadConnections || []).filter(conn => conn.targetId !== target);
    }
    if (targetLandmark) {
      targetLandmark.relatedLandmarks = (targetLandmark.relatedLandmarks || []).filter(id => id !== source);
      targetLandmark.roadConnections = (targetLandmark.roadConnections || []).filter(conn => conn.targetId !== source);
    }
  });
  buildEdges();
};

const handleNodeClick = (event: unknown, node?: Node) => {
  const resolvedNode = node ?? (event as { node?: Node })?.node;
  if (!resolvedNode?.id) return;
  selectedLandmarkId.value = resolvedNode.id;
};

const recalcRelativePositions = () => {
  const list = projectLandmarks.value.filter(item => item.position);
  list.forEach(landmark => {
    const position = landmark.position;
    if (!position) return;
    const closest = {
      north: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
      south: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
      east: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
      west: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
    };

    list.forEach(other => {
      if (other.id === landmark.id || !other.position) return;
      const dx = other.position.x - position.x;
      const dy = other.position.y - position.y;
      const dist = dx * dx + dy * dy;

      if (dy < 0 && Math.abs(dy) >= Math.abs(dx) && dist < closest.north.dist) {
        closest.north = { id: other.id, dist };
      } else if (dy > 0 && Math.abs(dy) >= Math.abs(dx) && dist < closest.south.dist) {
        closest.south = { id: other.id, dist };
      } else if (dx > 0 && Math.abs(dx) >= Math.abs(dy) && dist < closest.east.dist) {
        closest.east = { id: other.id, dist };
      } else if (dx < 0 && Math.abs(dx) >= Math.abs(dy) && dist < closest.west.dist) {
        closest.west = { id: other.id, dist };
      }
    });

    if (!landmark.relativePosition) {
      landmark.relativePosition = {};
    }
    const singleSelection = (id?: string) => (id ? [id] : []);
    landmark.relativePosition.north = singleSelection(closest.north.id);
    landmark.relativePosition.south = singleSelection(closest.south.id);
    landmark.relativePosition.east = singleSelection(closest.east.id);
    landmark.relativePosition.west = singleSelection(closest.west.id);
  });
};

const emitEditSelected = () => {
  if (selectedLandmark.value) {
    emit('edit-item', selectedLandmark.value);
  }
};

const clearSelection = () => {
  selectedLandmarkId.value = null;
};
</script>

<style scoped>
.world-graph {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
  height: 100%;
}

.graph-canvas {
  position: relative;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: linear-gradient(135deg, #f6f2ea 0%, #edf1f7 100%);
  overflow: hidden;
}

.graph-inspector {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color);
  padding: 16px;
  overflow: hidden;
}

.graph-inspector-header {
  margin-bottom: 12px;
}

.graph-inspector-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.graph-inspector-subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.graph-inspector-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.graph-inspector-empty {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  padding-top: 16px;
}

.inspector-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inspector-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.inspector-list {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 8px;
  max-height: 160px;
  overflow-y: auto;
  background: var(--el-fill-color-light);
}

.inspector-list-item {
  font-size: 13px;
  color: var(--el-text-color-regular);
  padding: 4px 0;
}

.inspector-empty {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.inspector-actions {
  display: flex;
  gap: 8px;
}

.landmark-node {
  min-width: 180px;
  max-width: 220px;
  background: #ffffff;
  border: 1px solid #dfe3ea;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.landmark-node.is-large {
  min-width: 240px;
  max-width: 280px;
  padding: 14px 16px;
}

.landmark-node-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.landmark-node-icon {
  font-size: 18px;
  color: #2563eb;
}

.landmark-node-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.landmark-node-subtitle {
  font-size: 12px;
  color: #64748b;
}

.landmark-node-forces {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.landmark-node-force {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #334155;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 3px 6px;
}

.force-name {
  font-weight: 600;
}

.force-role {
  color: #2563eb;
}

.landmark-node-more {
  font-size: 11px;
  color: #64748b;
}

.landmark-handle {
  width: 10px;
  height: 10px;
  background: #2563eb;
  border: 2px solid #ffffff;
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
