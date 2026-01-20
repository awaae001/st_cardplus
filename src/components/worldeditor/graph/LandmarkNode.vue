<template>
  <div class="landmark-node" :class="nodeSizeClass(data.type)">
    <div v-if="data.forces.length > 0" class="landmark-forces-badge" title="势力">
      <Icon icon="ph:users-three" class="landmark-forces-icon" />
      <span class="landmark-forces-count">{{ data.forces.length }}</span>
    </div>
    <span class="landmark-region-tail" :style="{ backgroundColor: data.regionColor || 'transparent' }"></span>
    <div class="landmark-node-header">
      <Icon :icon="iconForType(data.type)" class="landmark-node-icon" />
      <div class="landmark-node-title">{{ data.name }}</div>
    </div>
    <el-tooltip v-if="data.region" :content="data.region" placement="top">
      <span class="landmark-region-dot" :style="{ backgroundColor: data.regionColor }"></span>
    </el-tooltip>
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

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { Icon } from '@iconify/vue';
import { ElTooltip } from 'element-plus';
import { getLandmarkTypeIcon } from '@/utils/worldeditor/landmarkMeta';

interface LandmarkNodeForce {
  id: string;
  name: string;
  role: string;
}

interface LandmarkNodeData {
  id: string;
  name: string;
  region?: string;
  regionColor?: string;
  forces: LandmarkNodeForce[];
  type?: string;
}

defineProps<{
  data: LandmarkNodeData;
}>();

const iconForType = (type?: string) => getLandmarkTypeIcon(type);

const nodeSizeClass = (type?: string) => {
  if (type === 'natural') return 'is-large';
  if (type && (type === 'chasm' || type === 'canyon' || type.includes('天堑'))) {
    return 'is-large';
  }
  return '';
};
</script>

<style scoped>
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
  position: relative;
}

.landmark-node.is-large {
  min-width: 240px;
  max-width: 280px;
  padding: 14px 16px;
}

.landmark-forces-badge {
  position: absolute;
  top: -12px;
  left: -12px;
  background: #ffffff;
  border: 1px solid #dfe3ea;
  border-radius: 999px;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.12);
  z-index: 2;
}

.landmark-forces-icon {
  font-size: 14px;
  color: #2563eb;
}

.landmark-forces-count {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}

.landmark-node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
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

.landmark-region-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  position: absolute;
  top: 8px;
  right: 8px;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7);
}

.landmark-handle {
  width: 10px;
  height: 10px;
  background: #2563eb;
  border: 2px solid #ffffff;
}

.landmark-region-tail {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32px;
  height: 100%;
  border-radius: 0 0 10px 0;
  opacity: 0.9;
  pointer-events: none;
}
</style>
