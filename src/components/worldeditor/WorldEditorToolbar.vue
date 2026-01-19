<template>
  <div class="toolbar-container">
    <!-- Header -->
    <div class="toolbar-header">
      <h3 class="toolbar-title">世界编辑器</h3>
      <div class="header-actions">
        <el-tooltip content="新增地标" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
          <button @click="emit('add', 'landmark')" class="btn-primary-adv action-button">
            <Icon icon="ph:map-pin-duotone" />
          </button>
        </el-tooltip>
        <el-dropdown trigger="click" placement="bottom-end" @command="handleAddCommand">
          <button class="btn-primary-adv action-button action-button-split">
            <Icon icon="ph:caret-down-duotone" />
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="project">
                <Icon icon="ph:folder-plus-duotone" class="dropdown-item-icon" />
                新增项目
              </el-dropdown-item>
              <el-dropdown-item command="landmark">
                <Icon icon="ph:map-pin-duotone" class="dropdown-item-icon" />
                新增地标
              </el-dropdown-item>
              <el-dropdown-item command="region">
                <Icon icon="ph:squares-four-duotone" class="dropdown-item-icon" />
                新增区域
              </el-dropdown-item>
              <el-dropdown-item command="force">
                <Icon icon="ph:flag-duotone" class="dropdown-item-icon" />
                新增势力
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- History and Search Controls -->
    <div class="controls-section">
      <div class="history-controls">
        <button @click="emit('undo')" :disabled="!canUndo">
          <Icon icon="ph:arrow-counter-clockwise-duotone" />
          <span>撤销</span>
        </button>
        <button @click="emit('redo')" :disabled="!canRedo">
          <Icon icon="ph:arrow-clockwise-duotone" />
          <span>重做</span>
        </button>
      </div>
      <div class="search-controls">
        <el-input v-model="searchQuery" placeholder="搜索地标、势力或区域..." clearable :prefix-icon="Search" />
      </div>
    </div>

    <!-- Tree List -->
    <el-scrollbar class="toolbar-list-scrollbar">
      <el-tree ref="treeRef" :data="treeData" :props="treeProps" node-key="id" :key="treeKey"
        :default-expanded-keys="expandedKeys" :current-node-key="currentNodeKey" highlight-current
        @node-click="handleNodeClick" @node-expand="handleNodeExpand" @node-collapse="handleNodeCollapse" class="world-editor-tree" :expand-on-click-node="false"
        :filter-node-method="filterNode" draggable :allow-drag="props.dragDropHandlers.allowDrag"
        :allow-drop="props.dragDropHandlers.allowDrop" @node-drop="handleNodeDrop">
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <div class="node-main">
              <Icon :icon="data.icon" class="node-icon" />
              <span
                v-if="data.type === 'region' || data.type === 'landmark'"
                class="region-color-dot"
                :class="{ 'is-empty': !data.regionColor && data.type === 'landmark' }"
                :style="{ backgroundColor: data.type === 'region' ? data.color : data.regionColor }"
              ></span>
              <span class="node-label">{{ node.label }}</span>
            </div>
            <div class="node-actions"
              v-if="data.isEntry && (data.type === 'project' || data.type === 'landmark' || data.type === 'force' || data.type === 'region')">
              <el-tooltip content="复制" placement="top" :show-arrow="false" :offset="8" :hide-after="0"
                v-if="data.type !== 'project' && data.type !== 'integration'">
                <button @click.stop="emit('copy', data.raw)" class="list-item-action-button">
                  <Icon icon="ph:copy-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="编辑" placement="top" :show-arrow="false" :offset="8" :hide-after="0"
                v-if="data.type !== 'integration'">
                <button @click.stop="emit('edit', data.raw)" class="list-item-action-button">
                  <Icon icon="ph:pencil-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :show-arrow="false" :offset="8" :hide-after="0"
                v-if="data.type !== 'integration'">
                <button @click.stop="emit('delete', data.raw)" class="list-item-action-button is-danger">
                  <Icon icon="ph:trash-duotone" />
                </button>
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { ElScrollbar, ElTooltip, ElTree, ElInput, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { Icon } from '@iconify/vue';
import { Search } from '@element-plus/icons-vue';
import type { Project, EnhancedLandmark, EnhancedForce, EnhancedRegion, ProjectIntegration } from '../../types/world-editor';

type SelectableItem = Project | EnhancedLandmark | EnhancedForce | EnhancedRegion | ProjectIntegration;

interface Props {
  projects: Project[];
  landmarks: EnhancedLandmark[];
  forces: EnhancedForce[];
  regions: EnhancedRegion[];
  selectedItem: SelectableItem | null;
  canUndo: boolean;
  canRedo: boolean;
  dragDropHandlers: {
    allowDrag: (draggingNode: any) => boolean;
    allowDrop: (draggingNode: any, dropNode: any, type: any) => boolean;
    handleNodeDrop: (draggingNode: any, dropNode: any, type: any, treeRef: any) => boolean;
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', item: SelectableItem): void;
  (e: 'open-graph', projectId: string): void;
  (e: 'add', type: 'project' | 'landmark' | 'force' | 'region'): void;
  (e: 'edit', item: Project | EnhancedLandmark | EnhancedForce | EnhancedRegion): void;
  (e: 'copy', item: EnhancedLandmark | EnhancedForce | EnhancedRegion): void;
  (e: 'delete', item: SelectableItem): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'node-drop'): void;
}>();

const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
const treeKey = ref(0);
const searchQuery = ref('');

watch(searchQuery, (val) => {
  treeRef.value?.filter(val);
});

const filterNode = (value: string, data: any): boolean => {
  if (!value) return true;
  if (!data.isEntry) return true; // Always show root nodes
  return data.label.toLowerCase().includes(value.toLowerCase());
};


const treeProps = {
  children: 'children',
  label: 'label',
};

const treeData = computed(() => {
  return props.projects.map(project => {
    const projectLandmarks = props.landmarks.filter(l => l.projectId === project.id);
    const projectRegions = props.regions.filter(r => r.projectId === project.id);
    const projectForces = props.forces.filter(f => f.projectId === project.id);
    const regionColorMap = new Map(projectRegions.map(region => [region.id, region.color]));

    // 创建整合节点数据
    const integrationNode: ProjectIntegration = {
      id: `${project.id}-integration`,
      projectId: project.id,
      type: 'integration',
      name: '整合'
    };

    return {
      id: project.id,
      label: project.name,
      icon: 'ph:folder-duotone',
      isEntry: true,
      type: 'project',
      raw: project,
      children: [
        {
          id: `${project.id}-landmarks`,
          label: `地标 (${projectLandmarks.length})`,
          icon: 'ph:map-trifold-duotone',
          isEntry: false,
          children: projectLandmarks.map(landmark => ({
            id: landmark.id,
            label: landmark.name,
            icon: iconForLandmarkType(landmark.type),
            isEntry: true,
            type: 'landmark',
            raw: landmark,
            regionColor: landmark.regionId ? regionColorMap.get(landmark.regionId) : '',
          })),
        },
        {
          id: `${project.id}-regions`,
          label: `区域 (${projectRegions.length})`,
          icon: 'ph:squares-four-duotone',
          isEntry: false,
          children: projectRegions.map(region => ({
            id: region.id,
            label: region.name,
            icon: 'ph:square-duotone',
            isEntry: true,
            type: 'region',
            raw: region,
            color: region.color,
          })),
        },
        {
          id: `${project.id}-forces`,
          label: `势力 (${projectForces.length})`,
          icon: 'ph:users-three-duotone',
          isEntry: false,
          children: projectForces.map(force => ({
            id: force.id,
            label: force.name,
            icon: 'ph:flag-duotone',
            isEntry: true,
            type: 'force',
            raw: force,
          })),
        },
        {
          id: `${project.id}-integration`,
          label: '整合',
          icon: 'ph:circles-four-duotone',
          isEntry: true,
          type: 'integration',
          raw: integrationNode,
        },
        {
          id: `${project.id}-graph`,
          label: '节点图',
          icon: 'ph:share-network-duotone',
          isEntry: true,
          type: 'graph',
          raw: { projectId: project.id },
        },
      ],
    };
  });
});

const expandedKeys = ref<(string | number)[]>([]);
// 默认展开新项目
watch(() => props.projects, (newProjects) => {
  if (newProjects) {
    newProjects.forEach(project => {
      if (!expandedKeys.value.includes(project.id)) {
        expandedKeys.value.push(project.id);
      }
    });
  }
}, { immediate: true });

watch(treeData, () => {
  nextTick(() => {
    const store = treeRef.value?.store;
    if (store && typeof store === 'object' && 'setDefaultExpandedKeys' in store) {
      (store as any).setDefaultExpandedKeys(expandedKeys.value);
    }
  });
});

const handleNodeExpand = (data: { id: string | number }) => {
  if (!expandedKeys.value.includes(data.id)) {
    expandedKeys.value.push(data.id);
  }
};

const handleNodeCollapse = (data: { id: string | number }) => {
  const index = expandedKeys.value.indexOf(data.id);
  if (index !== -1) {
    expandedKeys.value.splice(index, 1);
  }
};

const currentNodeKey = computed(() => {
  return props.selectedItem?.id;
});

const handleNodeClick = (data: any) => {
  if (data.isEntry) {
    if (data.type === 'graph') {
      emit('open-graph', data.raw.projectId);
      return;
    }
    emit('select', data.raw);
  }
};

const iconForLandmarkType = (type?: string) => {
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
      return 'ph:map-pin-line-duotone';
  }
};

const handleNodeDrop = (draggingNode: any, dropNode: any, dropType: any) => {
  if (props.dragDropHandlers.handleNodeDrop(draggingNode, dropNode, dropType, treeRef.value)) {
    emit('node-drop');
  }
};

const handleAddCommand = (command: 'project' | 'landmark' | 'region' | 'force') => {
  emit('add', command);
};
</script>

<style scoped>
.toolbar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
}

.toolbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.toolbar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  font-size: 16px;
}

.action-button-split {
  padding: 0 6px;
}

.dropdown-item-icon {
  margin-right: 8px;
  font-size: 16px;
}

.controls-section {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.history-controls {
  display: flex;
  gap: 8px;
}

.history-controls button {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  color: var(--el-text-color-regular);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-controls button:disabled {
  background: var(--el-button-disabled-bg-color);
  border-color: var(--el-button-disabled-border-color);
  color: var(--el-text-color-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.history-controls button:hover:not(:disabled) {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
}

.toolbar-list-scrollbar {
  flex: 1;
  min-height: 0;
}

.world-editor-tree {
  background-color: transparent;
  padding: 8px;
}

.world-editor-tree :deep(.el-tree-node__content) {
  padding: 4px 0;
  height: auto;
  min-height: 36px;
}

.world-editor-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-9);
}

.world-editor-tree :deep(.el-tree-node:focus > .el-tree-node__content) {
  background-color: var(--el-color-primary-light-9);
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
}

.node-main {
  display: flex;
  align-items: center;
  overflow: hidden;
}

.node-icon {
  font-size: 18px;
  margin-right: 8px;
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}

.world-editor-tree :deep(.el-tree-node.is-current > .el-tree-node__content .node-icon) {
  color: var(--el-color-primary);
}


.node-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.node-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.el-tree-node__content:hover .node-actions {
  opacity: 1;
}

.list-item-action-button {
  background: none;
  border: none;
  padding: 4px;
  margin-left: 4px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.list-item-action-button:hover {
  background-color: var(--el-fill-color);
  color: var(--el-text-color-primary);
}

.list-item-action-button.is-danger:hover {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.region-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-right: 8px;
  border: 1px solid var(--el-border-color);
  flex-shrink: 0;
}

.region-color-dot.is-empty {
  background-color: transparent;
}
</style>
