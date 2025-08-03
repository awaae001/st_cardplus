<template>
  <div class="variable-tree-node">
    <div 
      class="node-content"
      :class="{ 
        'is-leaf': !node.children,
        'is-selectable': !node.children 
      }"
      @click="handleClick"
    >
      <div class="node-left">
        <el-icon v-if="node.children" class="expand-icon">
          <ArrowRight v-if="!isExpanded" />
          <ArrowDown v-else />
        </el-icon>
        <el-icon v-else class="leaf-icon">
          <Document />
        </el-icon>
        <span class="node-label">{{ node.key }}</span>
      </div>
      
      <div class="node-right">
        <el-tag v-if="!node.children" size="small" type="info">
          {{ formatValue(node.value) }}
        </el-tag>
        <el-tooltip 
          v-if="node.description" 
          :content="node.description" 
          placement="top"
        >
          <el-icon class="description-icon">
            <InfoFilled />
          </el-icon>
        </el-tooltip>
      </div>
    </div>
    
    <!-- 递归渲染子节点 -->
    <div v-if="node.children && isExpanded" class="child-nodes">
      <VariableTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        @select-variable="$emit('select-variable', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight, ArrowDown, Document, InfoFilled } from '@element-plus/icons-vue'
import type { VariableNode } from '@/stores/ejsEditor'

interface Props {
  node: VariableNode
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'select-variable': [node: VariableNode]
}>()

const isExpanded = ref(false)

function handleClick() {
  if (props.node.children) {
    isExpanded.value = !isExpanded.value
  } else {
    emit('select-variable', props.node)
  }
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return 'null'
  }
  if (typeof value === 'string') {
    return `"${value}"`
  }
  return String(value)
}
</script>

<style scoped>
.variable-tree-node {
  font-size: 12px;
}

.node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.node-content:hover {
  background-color: var(--el-fill-color-light);
}

.node-content.is-selectable:hover {
  background-color: var(--el-color-primary-light-8);
}

.node-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.expand-icon,
.leaf-icon {
  width: 14px;
  height: 14px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.node-label {
  color: var(--el-text-color-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.description-icon {
  width: 12px;
  height: 12px;
  color: var(--el-color-info);
  cursor: help;
}

.child-nodes {
  margin-left: 18px;
  border-left: 1px dashed var(--el-border-color-lighter);
  padding-left: 8px;
}

.el-tag {
  font-size: 10px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>