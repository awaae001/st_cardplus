<template>
  <div class="sidebar-panel">
    <div class="sidebar-panel-header">
      <h3 class="sidebar-panel-title">{{ title }}</h3>
      <div class="sidebar-panel-actions">
        <slot name="header-actions" />
      </div>
    </div>

    <el-scrollbar class="sidebar-panel-scrollbar">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        :node-key="nodeKey"
        :key="treeKey"
        :default-expanded-keys="expandedKeys"
        :current-node-key="currentNodeKey"
        :highlight-current="highlightCurrent"
        :expand-on-click-node="expandOnClickNode"
        :draggable="draggable"
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
        class="sidebar-tree"
        @node-click="handleNodeClick"
        @node-drop="handleNodeDrop"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
      >
        <template #default="{ node, data }">
          <slot name="node" :node="node" :data="data" />
        </template>
      </el-tree>
    </el-scrollbar>

    <div v-if="$slots.footer" class="sidebar-panel-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { ElScrollbar, ElTree } from 'element-plus';

interface Props {
  title: string;
  treeData: any[];
  treeProps?: Record<string, any>;
  nodeKey?: string;
  currentNodeKey?: string | number;
  highlightCurrent?: boolean;
  expandOnClickNode?: boolean;
  draggable?: boolean;
  allowDrag?: (draggingNode: any) => boolean;
  allowDrop?: (draggingNode: any, dropNode: any, type: any) => boolean;
  handleNodeDrop?: (draggingNode: any, dropNode: any, type: any) => boolean;
  autoExpandFirst?: boolean;
  defaultExpandedKeys?: Array<string | number>;
}

const props = withDefaults(defineProps<Props>(), {
  treeProps: () => ({ children: 'children', label: 'label' }),
  nodeKey: 'id',
  highlightCurrent: true,
  expandOnClickNode: false,
  draggable: false,
  autoExpandFirst: false,
  defaultExpandedKeys: () => [],
});

const emit = defineEmits<{
  (e: 'node-click', data: any): void;
}>();

const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
const treeKey = ref(0);
const expandedKeys = ref<Array<string | number>>([...props.defaultExpandedKeys]);

watch(
  () => props.defaultExpandedKeys,
  (nextKeys) => {
    expandedKeys.value = [...nextKeys];
  }
);

watch(
  () => props.treeData,
  (nextData) => {
    if (!props.autoExpandFirst) return;
    if (expandedKeys.value.length > 0) return;
    if (!Array.isArray(nextData) || nextData.length === 0) return;
    const first = nextData[0];
    if (first && props.nodeKey && first[props.nodeKey] !== undefined) {
      expandedKeys.value = [first[props.nodeKey]];
    }
  },
  { immediate: true }
);

const handleNodeDrop = async (draggingNode: any, dropNode: any, dropType: any) => {
  if (!props.handleNodeDrop) return;

  if (treeRef.value) {
    const nodes = Object.values(treeRef.value.store.nodesMap);
    expandedKeys.value = nodes
      .filter((node: any) => node.expanded)
      .map((node: any) => node.key);
  }

  const success = props.handleNodeDrop(draggingNode, dropNode, dropType);

  if (success) {
    treeKey.value += 1;
    await nextTick();
    if (treeRef.value) {
      treeRef.value.store.setDefaultExpandedKeys(expandedKeys.value);
    }
  }
};

const handleNodeClick = (data: any) => {
  emit('node-click', data);
};

const handleNodeExpand = (data: any) => {
  const key = data?.[props.nodeKey];
  if (key && !expandedKeys.value.includes(key)) {
    expandedKeys.value.push(key);
  }
};

const handleNodeCollapse = (data: any) => {
  const key = data?.[props.nodeKey];
  if (!key) return;
  const index = expandedKeys.value.indexOf(key);
  if (index > -1) {
    expandedKeys.value.splice(index, 1);
  }
};
</script>

<style>
.sidebar-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
}

.sidebar-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.sidebar-panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.sidebar-panel-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sidebar-header-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
}

.sidebar-panel-scrollbar {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.sidebar-panel-scrollbar .el-scrollbar__wrap {
  overflow-x: hidden !important;
}

.sidebar-panel-scrollbar .el-scrollbar__view {
  overflow-x: hidden;
}

.sidebar-panel-footer {
  padding: 8px;
  border-top: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.sidebar-tree {
  background-color: transparent;
  padding: 8px;
  width: 100%;
}

.sidebar-tree .el-tree-node__content {
  padding: 4px 0;
  height: auto;
  min-height: 32px;
}

.sidebar-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
  min-width: 0;
}

.sidebar-tree-node-main {
  display: flex;
  align-items: center;
  overflow: hidden;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.sidebar-tree-node-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.sidebar-tree-node-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.sidebar-tree-node-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  gap: 4px;
}

.sidebar-tree .el-tree-node__content:hover .sidebar-tree-node-actions {
  opacity: 1;
}

.sidebar-tree-node-action-button {
  background: none;
  border: none;
  padding: 4px;
  margin-left: 2px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.sidebar-tree-node-action-button:hover {
  background-color: var(--el-fill-color);
  color: var(--el-text-color-primary);
}

.sidebar-tree-node-action-button.is-danger:hover {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.sidebar-tree-node.is-disabled {
  color: var(--el-text-color-disabled);
  cursor: not-allowed;
}

.sidebar-tree-node-source-icon {
  margin-left: 8px;
  font-size: 16px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
</style>
