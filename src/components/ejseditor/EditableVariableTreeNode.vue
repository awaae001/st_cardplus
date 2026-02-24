<template>
  <div class="editable-variable-tree-node">
    <div
      class="node-content"
      :class="{ 'is-leaf': !isParentNode, 'is-root': depth === 0 }"
    >
      <div class="node-main">
        <el-icon
          v-if="isParentNode"
          @click="toggleExpand"
          class="expand-icon"
        >
          <ArrowRight v-if="!isExpanded" />
          <ArrowDown v-else />
        </el-icon>
        <el-input
          v-model="editableNode.key"
          placeholder="键"
          size="small"
          @change="updateNode"
          class="node-key-input"
        />
        <span
          v-if="!isParentNode"
          class="separator"
        >
          :
        </span>
        <el-input
          v-if="!isParentNode"
          v-model="editableNode.value"
          placeholder="值"
          size="small"
          @change="updateNode"
          class="node-value-input"
        />
        <el-input
          v-if="!isParentNode"
          v-model="editableNode.description"
          placeholder="描述 (可选)"
          size="small"
          @change="updateNode"
          class="node-desc-input"
        />
      </div>
      <div class="node-actions">
        <el-tooltip
          content="添加子节点"
          placement="top"
        >
          <el-button
            :icon="Plus"
            size="small"
            circle
            @click="addChildNode"
          />
        </el-tooltip>
        <el-tooltip
          content="删除节点"
          placement="top"
        >
          <el-button
            :icon="Delete"
            size="small"
            circle
            danger
            @click="deleteNode"
          />
        </el-tooltip>
      </div>
    </div>

    <div
      v-if="isParentNode"
      v-show="isExpanded"
      class="child-nodes"
    >
      <EditableVariableTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEjsEditorStore } from '@/composables/ejs/ejsEditor';
import type { VariableNode } from '@/types/ejs-editor';
import { ArrowDown, ArrowRight, Delete, Plus } from '@element-plus/icons-vue';
import { computed, ref, watch } from 'vue';

interface Props {
  node: VariableNode;
  depth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
});

const store = useEjsEditorStore();

const isExpanded = ref(false);

const editableNode = ref({
  key: props.node.key,
  value: props.node.value,
  description: props.node.description || '',
});

watch(
  () => props.node,
  (newNode) => {
    editableNode.value.key = newNode.key;
    editableNode.value.value = newNode.value;
    editableNode.value.description = newNode.description || '';
  },
  { deep: true }
);

const isParentNode = computed(() => props.node.children !== undefined);

function toggleExpand() {
  if (isParentNode.value) {
    isExpanded.value = !isExpanded.value;
  }
}

function updateNode() {
  store.updateNodeValue(
    props.node.path,
    editableNode.value.key,
    editableNode.value.value,
    editableNode.value.description
  );
}
function addChildNode() {
  store.addNode(props.node.path);
  isExpanded.value = true; // Auto-expand when adding a new child
}

function deleteNode() {
  store.removeNode(props.node.path);
}
</script>

<style scoped>
.editable-variable-tree-node {
  font-size: 12px;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  flex-wrap: wrap;
}

.expand-icon {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.node-main {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.node-key-input {
  width: 80px;
  min-width: 60px;
  flex-shrink: 1;
}

.node-value-input {
  width: 70px;
  min-width: 50px;
  flex-shrink: 1;
}

.node-desc-input {
  flex: 1;
  min-width: 80px;
}

.separator {
  margin: 0 2px;
  flex-shrink: 0;
}

.node-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.child-nodes {
  margin-left: 20px;
  border-left: 1px dashed var(--el-border-color-lighter);
  padding-left: 6px;
}

@media (max-width: 768px) {
  .child-nodes {
    margin-left: 16px;
  }
}
</style>
