<template>
  <div class="preview-panel">
    <div class="panel-header">
      <h3>预设预览</h3>
      <div class="header-actions">
        <el-tag
          v-if="activePreset"
          type="info"
          effect="plain"
        >
          {{ activePreset.name || '未命名预设' }} · {{ activeEntries.length }} 条目
        </el-tag>
      </div>
    </div>
    <el-scrollbar class="panel-scroll">
      <div
        v-if="!activePreset"
        class="empty-state"
      >
        <el-empty
          description="请先选择一个预设"
          :image-size="120"
        />
      </div>
      <div
        v-else-if="activeEntries.length === 0"
        class="empty-state"
      >
        <el-empty
          description="暂无已激活且已插入的条目"
          :image-size="120"
        />
      </div>
      <div
        v-else
        class="preview-list"
      >
        <div
          v-for="entry in activeEntries"
          :key="entry.key"
          class="preview-entry"
        >
          <div class="preview-title">---： {{ entry.title }}</div>
          <pre class="preview-content">{{ entry.content }}</pre>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import type { StoredPresetFile } from '@/database/db';
import { getPromptOrderList, PROMPT_ORDER_CHARACTER_ID } from '@/composables/preset/utils/presetPromptOrder';
import { resolvePromptIdentifier } from '@/composables/preset/utils/presetTree';
import { computed } from 'vue';

interface Props {
  activePreset: StoredPresetFile | null;
}

const props = defineProps<Props>();

const activeEntries = computed(() => {
  if (!props.activePreset) return [];

  const prompts = (props.activePreset.data.prompts as Record<string, any>[]) || [];
  const promptByIdentifier = new Map<string, { prompt: Record<string, any>; index: number }>();

  prompts.forEach((prompt, index) => {
    const identifier = resolvePromptIdentifier(prompt, index);
    if (!identifier || promptByIdentifier.has(identifier)) return;
    promptByIdentifier.set(identifier, { prompt, index });
  });

  const promptOrderList = getPromptOrderList(props.activePreset.data.prompt_order, PROMPT_ORDER_CHARACTER_ID);

  return promptOrderList
    .map((orderItem) => {
      const matched = promptByIdentifier.get(orderItem.identifier);
      if (!matched) return null;
      const promptEnabled = typeof matched.prompt.enabled === 'boolean' ? matched.prompt.enabled : true;
      if (!promptEnabled) return null;

      return {
        key: `${orderItem.identifier}-${matched.index}`,
        title: matched.prompt.name || matched.prompt.identifier || `条目 ${matched.index + 1}`,
        content: String(matched.prompt.content ?? ''),
      };
    })
    .filter(
      (
        item
      ): item is {
        key: string;
        title: string;
        content: string;
      } => Boolean(item)
    );
});
</script>

<style scoped>
.preview-panel {
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

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-entry {
  margin: 0;
}

.preview-title {
  margin-bottom: 4px;
  color: var(--el-color-info);
  font-size: 12px;
  font-weight: 600;
}

.preview-content {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-family: var(--el-font-family);
}
</style>
