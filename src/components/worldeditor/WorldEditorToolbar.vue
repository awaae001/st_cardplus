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
        <el-tooltip content="新增势力" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
          <button @click="emit('add', 'force')" class="btn-primary-adv action-button">
            <Icon icon="ph:flag-duotone" />
          </button>
        </el-tooltip>
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
        <el-input
          v-model="searchQuery"
          placeholder="搜索地标或势力..."
          clearable
          :prefix-icon="Search"
        />
      </div>
    </div>

    <!-- Tree List -->
    <el-scrollbar class="toolbar-list-scrollbar">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        node-key="id"
        :key="treeKey"
        :default-expanded-keys="['landmarks-root', 'forces-root']"
        :current-node-key="currentNodeKey"
        highlight-current
        @node-click="handleNodeClick"
        class="world-editor-tree"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <div class="node-main">
              <Icon :icon="data.icon" class="node-icon" />
              <span class="node-label">{{ node.label }}</span>
            </div>
            <div class="node-actions" v-if="data.isEntry">
               <el-tooltip content="删除" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
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
import { ref, computed, watch } from 'vue';
import { ElScrollbar, ElTooltip, ElTree, ElInput } from 'element-plus';
import { Icon } from '@iconify/vue';
import { Search } from '@element-plus/icons-vue';
import type { EnhancedLandmark, EnhancedForce } from '../../types/world-editor';

type SelectableItem = EnhancedLandmark | EnhancedForce;

interface Props {
  landmarks: EnhancedLandmark[];
  forces: EnhancedForce[];
  selectedItem: SelectableItem | null;
  canUndo: boolean;
  canRedo: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'select', item: SelectableItem): void;
  (e: 'add', type: 'landmark' | 'force'): void;
  (e: 'delete', item: SelectableItem): void;
  (e: 'undo'): void;
  (e: 'redo'): void;
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
  return [
    {
      id: 'landmarks-root',
      label: `地标 (${props.landmarks.length})`,
      icon: 'ph:map-trifold-duotone',
      isEntry: false,
      children: props.landmarks.map(landmark => ({
        id: landmark.id,
        label: landmark.name,
        icon: 'ph:map-pin-line-duotone',
        isEntry: true,
        type: 'landmark',
        raw: landmark,
      })),
    },
    {
      id: 'forces-root',
      label: `势力 (${props.forces.length})`,
      icon: 'ph:users-three-duotone',
      isEntry: false,
      children: props.forces.map(force => ({
        id: force.id,
        label: force.name,
        icon: 'ph:flag-duotone',
        isEntry: true,
        type: 'force',
        raw: force,
      })),
    }
  ];
});

const currentNodeKey = computed(() => {
  return props.selectedItem?.id;
});

const handleNodeClick = (data: any) => {
  if (data.isEntry) {
    emit('select', data.raw);
  }
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
  flex-grow: 1;
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
</style>