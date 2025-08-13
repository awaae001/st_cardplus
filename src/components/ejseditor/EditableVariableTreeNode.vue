<template>
  <div class="editable-variable-tree-node">
    <div class="node-content" :class="{ 'is-leaf': !isParentNode, 'is-root': depth === 0 }">
      <div class="node-main">
        <el-icon v-if="isParentNode" @click="toggleExpand" class="expand-icon">
          <ArrowRight v-if="!isExpanded" />
          <ArrowDown v-else />
        </el-icon>
        <el-input v-model="editableNode.key" placeholder="键" size="small" @change="updateNode" class="node-key-input"/>
        <span v-if="!isParentNode" class="separator">:</span>
        <el-input v-if="!isParentNode" v-model="editableNode.value" placeholder="值" size="small" @change="updateNode" class="node-value-input"/>
        <el-input v-if="!isParentNode" v-model="editableNode.description" placeholder="描述 (可选)" size="small" @change="updateNode" class="node-desc-input"/>
      </div>
      <div class="node-actions">
        <el-tooltip content="添加子节点" placement="top">
          <el-button :icon="Plus" size="small" circle @click="addChildNode" />
        </el-tooltip>
        <el-tooltip content="删除节点" placement="top">
          <el-button :icon="Delete" size="small" circle danger @click="deleteNode" />
        </el-tooltip>
      </div>
    </div>

    <div v-if="isParentNode" v-show="isExpanded" class="child-nodes">
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
import { ref, computed, watch } from 'vue'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import type { VariableNode } from '@/types/ejs-editor'
import { Plus, Delete, ArrowDown, ArrowRight } from '@element-plus/icons-vue'

interface Props {
  node: VariableNode
  depth?: number
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
})

const store = useEjsEditorStore()

const isExpanded = ref(false)

const editableNode = ref({
  key: props.node.key,
  value: props.node.value,
  description: props.node.description || ''
})

watch(() => props.node, (newNode) => {
  editableNode.value.key = newNode.key
  editableNode.value.value = newNode.value
  editableNode.value.description = newNode.description || ''
}, { deep: true })

const isParentNode = computed(() => props.node.children !== undefined)

function toggleExpand() {
  if (isParentNode.value) {
    isExpanded.value = !isExpanded.value
  }
}

function updateNode() {
  store.updateNodeValue(
    props.node.path,
    editableNode.value.key,
    editableNode.value.value,
    editableNode.value.description
  )
}
function addChildNode() {
  store.addNode(props.node.path)
  isExpanded.value = true // Auto-expand when adding a new child
}

function deleteNode() {
  store.removeNode(props.node.path)
}
</script>

<style scoped>
.editable-variable-tree-node {
  font-size: 12px;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.expand-icon {
  cursor: pointer;
  color: var(--el-text-color-secondary);
}

.node-main {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-grow: 1;
}

.node-key-input {
  width: 120px;
}
.node-value-input {
  width: 100px;
}
.node-desc-input {
  flex-grow: 1;
}

.separator {
  margin: 0 4px;
}

.node-actions {
  display: flex;
  gap: 4px;
}

.child-nodes {
  margin-left: 24px;
  border-left: 1px dashed var(--el-border-color-lighter);
  padding-left: 8px;
}
</style>