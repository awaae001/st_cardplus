<template>
  <div class="clipboard-panel">
    <div class="panel-header">
      <h3>剪贴板</h3>
      <div class="header-actions">
        <el-button
          size="small"
          @click="$emit('clear-all')"
          :disabled="!hasItems"
        >
          清空
        </el-button>
      </div>
    </div>
    <el-scrollbar class="panel-scroll">
      <div
        v-if="!hasItems"
        class="empty-state"
      >
        <el-empty
          description="暂无内容"
          :image-size="120"
        />
      </div>
      <div
        v-else
        class="clipboard-list"
      >
        <div
          v-for="(clip, index) in items"
          :key="clip.id"
          class="clipboard-item"
        >
          <div class="clipboard-header">
            <span class="clipboard-title">{{ clip.title }}</span>
            <span class="clipboard-actions">
              <el-button
                :icon="ArrowUp"
                size="small"
                text
                @click="$emit('move-up', index)"
              />
              <el-button
                :icon="ArrowDown"
                size="small"
                text
                @click="$emit('move-down', index)"
              />
              <el-button
                :icon="Delete"
                size="small"
                text
                @click="$emit('remove', clip.id)"
              />
            </span>
          </div>
          <div class="clipboard-content">{{ clip.content }}</div>
          <div class="clipboard-buttons">
            <el-button
              size="small"
              @click="$emit('insert', clip.content)"
              :disabled="!canEdit"
            >
              插入编辑器
            </el-button>
            <el-button
              size="small"
              @click="$emit('replace', clip.content)"
              :disabled="!canEdit"
            >
              替换编辑器
            </el-button>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import type { PresetClipboardItem } from '@/composables/preset/usePresetClipboard';
import { ArrowDown, ArrowUp, Delete } from '@element-plus/icons-vue';

interface Props {
  items: PresetClipboardItem[];
  hasItems: boolean;
  canEdit: boolean;
}

defineProps<Props>();
defineEmits<{
  (e: 'clear-all'): void;
  (e: 'move-up', index: number): void;
  (e: 'move-down', index: number): void;
  (e: 'remove', id: string): void;
  (e: 'insert', content: string): void;
  (e: 'replace', content: string): void;
}>();
</script>

<style scoped>
.clipboard-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  gap: 12px;
  padding: 0 8px;
  margin-bottom: 12px;
}

.panel-scroll {
  padding: 0 12px 12px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clipboard-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.clipboard-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 10px;
  padding: 10px;
  background: var(--el-fill-color-blank);
}

.clipboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.clipboard-title {
  font-weight: 600;
}

.clipboard-content {
  font-size: 12px;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  margin-bottom: 8px;
}

.clipboard-buttons {
  display: flex;
  gap: 6px;
}
</style>
