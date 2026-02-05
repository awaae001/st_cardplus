<template>
  <div class="editor-panel">
    <div class="panel-header">
      <h3>主要编辑区</h3>
      <div class="header-actions">
        <el-button :icon="CopyDocument" size="small" @click="$emit('add-clipboard')" :disabled="!selectedPrompt">
          加入剪贴板
        </el-button>
        <el-button type="primary" size="small" @click="$emit('save')" :disabled="!activePreset">
          保存
        </el-button>
      </div>
    </div>
    <div v-if="!activePreset" class="empty-state">
      <el-empty description="请先选择一个预设" :image-size="160" />
    </div>
    <div v-else class="panel-scroll editor-content">
      <el-tabs v-model="localActiveTab">
        <el-tab-pane label="头部设置" name="header">
          <el-form label-position="top">
            <el-form-item label="预设名称">
              <el-input v-model="localEditorState.presetName" placeholder="请输入预设名称" />
            </el-form-item>
            <el-form-item label="预设头部 JSON（不含 prompts）">
              <el-input
                v-model="localEditorState.headerJsonText"
                type="textarea"
                :rows="14"
                placeholder="JSON 格式"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="条目编辑" name="prompt" :disabled="!selectedPrompt">
          <el-form label-position="top">
            <el-alert
              v-if="lockedTip"
              :title="lockedTip"
              type="info"
              :closable="false"
              class="mb-2"
            />
            <el-form-item label="条目名称">
              <el-input v-model="localEditorState.promptName" placeholder="请输入条目名称" :disabled="isFullyLocked" />
            </el-form-item>
            <el-form-item label="Identifier">
              <el-input v-model="localEditorState.promptIdentifier" placeholder="identifier" :disabled="isFullyLocked" />
            </el-form-item>
            <el-form-item label="Role">
              <el-select v-model="localEditorState.promptRole" placeholder="角色" :disabled="isFullyLocked">
                <el-option label="system" value="system" />
                <el-option label="user" value="user" />
                <el-option label="assistant" value="assistant" />
              </el-select>
            </el-form-item>
            <el-form-item label="提示词内容">
              <el-input
                v-model="localEditorState.promptContent"
                type="textarea"
                :rows="10"
                :readonly="isContentLocked"
                :placeholder="contentPlaceholder"
              />
            </el-form-item>
            <el-form-item label="开关">
              <div class="switch-row">
                <el-tag type="info">system_prompt: {{ localEditorState.promptSystem ? 'true' : 'false' }}</el-tag>
                <el-switch v-model="localEditorState.promptMarker" active-text="marker" :disabled="isFullyLocked" />
                <el-switch v-model="localEditorState.promptEnabled" active-text="enabled" :disabled="isFullyLocked" />
              </div>
            </el-form-item>
            <el-form-item label="排序 order">
              <el-input-number v-model="localEditorState.promptOrder" :min="0" :disabled="isFullyLocked" />
            </el-form-item>
            <el-form-item label="扩展字段 JSON（除基础字段以外）">
              <el-input
                v-model="localEditorState.promptExtraJson"
                type="textarea"
                :rows="8"
                placeholder="JSON 格式"
                :readonly="isFullyLocked"
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CopyDocument } from '@element-plus/icons-vue';
import type { StoredPresetFile } from '@/database/db';
import type { PresetPrompt } from '@/composables/preset/usePresetStore';

export interface PresetEditorState {
  presetName: string;
  headerJsonText: string;
  promptName: string;
  promptIdentifier: string;
  promptRole: 'system' | 'user' | 'assistant';
  promptContent: string;
  promptSystem: boolean;
  promptMarker: boolean;
  promptEnabled: boolean;
  promptOrder: number | null;
  promptExtraJson: string;
}

interface Props {
  activePreset: StoredPresetFile | null;
  selectedPrompt: PresetPrompt | null;
  activeTab: 'header' | 'prompt';
  editorState: PresetEditorState;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:activeTab', value: 'header' | 'prompt'): void;
  (e: 'update:editorState', value: PresetEditorState): void;
  (e: 'save'): void;
  (e: 'add-clipboard'): void;
}>();

const localActiveTab = computed({
  get: () => props.activeTab,
  set: (value: 'header' | 'prompt') => emit('update:activeTab', value),
});

const localEditorState = computed({
  get: () => props.editorState,
  set: (value: PresetEditorState) => emit('update:editorState', value),
});

const lockedSourceMap: Record<string, string> = {
  worldInfoBefore: '来自 World Info (↑Char)',
  worldInfoAfter: '来自 World Info (↓Char)',
  personaDescription: '来自 用户描述设定',
  charDescription: '来自 角色描述',
  charPersonality: '来自 角色性格（角色设定摘要）',
  scenario: '来自 Character Scenario',
};

const fullyLockedIdentifiers = new Set(['dialogueExamples', 'chatHistory']);

const identifier = computed(() => props.selectedPrompt?.identifier || localEditorState.value.promptIdentifier);
const lockedTip = computed(() => {
  const id = identifier.value || '';
  if (lockedSourceMap[id]) return lockedSourceMap[id];
  if (fullyLockedIdentifiers.has(id)) return '此条目已锁定，不能编辑';
  return '';
});

const isContentLocked = computed(() => {
  const id = identifier.value || '';
  return Boolean(lockedSourceMap[id] || fullyLockedIdentifiers.has(id));
});

const isFullyLocked = computed(() => {
  const id = identifier.value || '';
  return Boolean(fullyLockedIdentifiers.has(id));
});

const contentPlaceholder = computed(() => {
  const id = identifier.value || '';
  if (lockedSourceMap[id]) return lockedSourceMap[id];
  if (fullyLockedIdentifiers.has(id)) return '此条目已锁定，不支持编辑';
  return '在此编辑提示词内容';
});
</script>

<style scoped>
.editor-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 6px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.panel-scroll {
  padding: 0 12px 12px;
}

.editor-content {
  padding: 0 12px 12px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-row {
  display: flex;
  gap: 16px;
}
</style>
