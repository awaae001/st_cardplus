<template>
  <div
    class="bridge-node"
    :title="data.label"
  >
    <span class="bridge-dot"></span>
    <span class="bridge-label">{{ data.label }}</span>
    <Handle
      :id="data.handleId"
      type="source"
      :position="handlePosition"
      class="bridge-handle"
    />
    <Handle
      :id="data.handleId"
      type="target"
      :position="handlePosition"
      class="bridge-handle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import type { BridgeNodeData } from '@/types/worldeditor/worldGraphNodes';

const props = defineProps<{
  data: BridgeNodeData;
}>();

const handlePosition = computed(() => {
  const side = props.data.handleSide || props.data.side;
  switch (side) {
    case 'left':
      return Position.Left;
    case 'right':
      return Position.Right;
    case 'top':
      return Position.Top;
    case 'bottom':
      return Position.Bottom;
    default:
      return Position.Right;
  }
});
</script>

<style scoped>
.bridge-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 999px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  pointer-events: all;
}

.bridge-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--el-color-primary);
}

.bridge-label {
  white-space: nowrap;
}

.bridge-handle {
  width: 8px;
  height: 8px;
  background: var(--el-color-primary);
  border: 1px solid var(--el-color-primary);
}
</style>
