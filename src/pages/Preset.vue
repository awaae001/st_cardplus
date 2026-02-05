<template>
  <div class="preset-page">
    <div v-if="isMobileOrTablet" class="mobile-block">
      <el-empty description="不支持移动端" :image-size="200" />
    </div>
    <splitpanes v-else class="default-theme preset-split" :horizontal="false">
      <pane min-size="18" size="22">
        <PresetList
          :presets="presets"
          :active-preset-id="activePresetId"
          :selected-prompt-index="selectedPromptIndex"
          :selected-is-header="selectedIsHeader"
          :drag-drop-handlers="dragDropHandlers"
          @create-preset="createPreset"
          @create-blank="createBlankPreset"
          @rename-preset="handleRenamePreset"
          @delete-preset="handleDeletePreset"
          @select-preset="selectPreset"
          @select-header="selectHeader"
          @select-prompt="selectPrompt"
          @add-prompt="addPrompt"
          @duplicate-prompt="duplicatePrompt"
          @delete-prompt="removePrompt"
          @export-preset="handleExportPreset"
          @import-preset="handleImportPreset"
        />
      </pane>

      <pane min-size="35" size="50">
        <PresetEditor
          v-model:active-tab="activeEditorTab"
          v-model:editor-state="editorState"
          :active-preset="activePreset"
          :selected-prompt="selectedPrompt"
          @save="saveCurrent"
          @add-clipboard="addEditorToClipboard"
        />
      </pane>

      <pane min-size="20" size="28">
        <div class="clipboard-panel">
          <div class="panel-header">
            <h3>剪贴板</h3>
            <div class="header-actions">
              <el-button size="small" @click="clearAll" :disabled="!hasItems">清空</el-button>
            </div>
          </div>
          <el-scrollbar class="panel-scroll">
            <div v-if="!hasItems" class="empty-state">
              <el-empty description="暂无内容" :image-size="120" />
            </div>
            <div v-else class="clipboard-list">
              <div v-for="(clip, index) in clipboardItems" :key="clip.id" class="clipboard-item">
                <div class="clipboard-header">
                  <span class="clipboard-title">{{ clip.title }}</span>
                  <span class="clipboard-actions">
                    <el-button :icon="ArrowUp" size="small" text @click="moveUp(index)" />
                    <el-button :icon="ArrowDown" size="small" text @click="moveDown(index)" />
                    <el-button :icon="Delete" size="small" text @click="removeClipboard(clip.id)" />
                  </span>
                </div>
                <div class="clipboard-content">{{ clip.content }}</div>
                <div class="clipboard-buttons">
                  <el-button size="small" @click="insertToEditor(clip.content)" :disabled="!selectedPrompt">
                    插入编辑器
                  </el-button>
                  <el-button size="small" @click="replaceEditor(clip.content)" :disabled="!selectedPrompt">
                    替换编辑器
                  </el-button>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </pane>
    </splitpanes>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useDevice } from '@/composables/useDevice';
import { usePresetStore, type PresetPrompt } from '@/composables/preset/usePresetStore';
import { usePresetClipboard } from '@/composables/preset/usePresetClipboard';
import PresetList from '@/components/preset/PresetList.vue';
import PresetEditor, { type PresetEditorState } from '@/components/preset/PresetEditor.vue';
import { v4 as uuidv4 } from 'uuid';
import { saveAs } from 'file-saver';
import { cleanObject, removeEmptyFields } from '@/utils/objectUtils';
import {
  Delete,
  ArrowUp,
  ArrowDown,
} from '@element-plus/icons-vue';

const { isMobileOrTablet } = useDevice();
const {
  presets,
  activePresetId,
  activePreset,
  selected,
  selectedPrompt,
  selectPreset,
  selectHeader,
  selectPrompt,
  createPreset,
  createBlankPreset,
  renamePreset,
  removePreset,
  addPrompt,
  importPreset,
  reorderPresets,
  reorderPrompts,
  duplicatePrompt,
  removePrompt,
  updateHeader,
  updatePrompt,
} = usePresetStore();

const {
  clipboardItems,
  hasItems,
  addItem,
  removeItem: removeClipboardItem,
  moveUp,
  moveDown,
  clearAll,
} = usePresetClipboard();

const activeEditorTab = ref<'header' | 'prompt'>('header');
const editorState = ref<PresetEditorState>({
  presetName: '',
  headerJsonText: '',
  promptName: '',
  promptIdentifier: '',
  promptRole: 'system',
  promptContent: '',
  promptSystem: false,
  promptMarker: false,
  promptEnabled: false,
  promptOrder: null,
  promptExtraJson: '{}',
});

const selectedIsHeader = computed(() => selected.value?.type === 'header');
const selectedPromptIndex = computed(() => selected.value?.type === 'prompt' ? (selected.value.promptIndex ?? null) : null);

const dragDropHandlers = {
  allowDrag: (draggingNode: any) => {
    return Boolean(draggingNode?.data?.isPreset || draggingNode?.data?.isPrompt);
  },
  allowDrop: (draggingNode: any, dropNode: any, type: any) => {
    if (!draggingNode?.data || !dropNode?.data) return false;
    if (draggingNode.data.isPreset) {
      return dropNode.data.isPreset && (type === 'prev' || type === 'next');
    }
    if (draggingNode.data.isPrompt) {
      return dropNode.data.isPrompt
        && draggingNode.data.presetId === dropNode.data.presetId
        && (type === 'prev' || type === 'next');
    }
    return false;
  },
  handleNodeDrop: (draggingNode: any, dropNode: any, type: any) => {
    if (!draggingNode?.data || !dropNode?.data) return false;
    if (draggingNode.data.isPreset) {
      const currentOrder = presets.value
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(p => p.id);
      const fromIndex = currentOrder.indexOf(draggingNode.data.id);
      const toIndex = currentOrder.indexOf(dropNode.data.id);
      if (fromIndex === -1 || toIndex === -1) return false;
      currentOrder.splice(fromIndex, 1);
      const insertIndex = type === 'prev' ? toIndex : toIndex + 1;
      currentOrder.splice(insertIndex, 0, draggingNode.data.id);
      reorderPresets(currentOrder);
      return true;
    }
    if (draggingNode.data.isPrompt) {
      const presetId = draggingNode.data.presetId;
      const preset = presets.value.find(p => p.id === presetId);
      if (!preset) return false;
      const prompts = (preset.data.prompts as Record<string, any>[]) || [];
      const indices = prompts.map((_, index) => index);
      const fromIndex = indices.indexOf(draggingNode.data.promptIndex);
      const toIndex = indices.indexOf(dropNode.data.promptIndex);
      if (fromIndex === -1 || toIndex === -1) return false;
      indices.splice(fromIndex, 1);
      const insertIndex = type === 'prev' ? toIndex : toIndex + 1;
      indices.splice(insertIndex, 0, draggingNode.data.promptIndex);
      reorderPrompts(presetId, indices);
      if (selected.value?.type === 'prompt') {
        const newIndex = indices.indexOf(selected.value.promptIndex ?? -1);
        if (newIndex >= 0) {
          selected.value.promptIndex = newIndex;
        }
      }
      return true;
    }
    return false;
  },
};

const handleRenamePreset = (id: string) => {
  const preset = presets.value.find(p => p.id === id);
  if (preset) renamePreset(preset);
};

const handleDeletePreset = (id: string) => {
  const preset = presets.value.find(p => p.id === id);
  if (preset) removePreset(preset);
};

const handleExportPreset = () => {
  if (!activePreset.value) {
    ElMessage.warning('请先选择一个预设');
    return;
  }
  const filename = `${activePreset.value.name || 'preset'}.json`;
  const prompts = (activePreset.value.data.prompts as Record<string, any>[]) || [];
  const orderList = buildSidebarOrder(prompts);
  const promptOrder = Array.isArray(activePreset.value.data.prompt_order)
    ? activePreset.value.data.prompt_order.map((entry: any) => ({
        ...entry,
        order: orderList,
      }))
    : [{ character_id: 100000, order: orderList }];
  const exportData = {
    ...activePreset.value.data,
    prompt_order: promptOrder,
  };
  const data = JSON.stringify(exportData, null, 2);
  const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
  saveAs(blob, filename);
  ElMessage.success('预设已导出');
};

const handleImportPreset = async (file: File) => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const nameFromFile = file.name.replace(/\.json$/i, '');
    const presetName = (parsed && typeof parsed.name === 'string' && parsed.name.trim())
      ? parsed.name.trim()
      : nameFromFile || '导入预设';
    await importPreset(presetName, parsed);
    ElMessage.success('预设导入成功');
  } catch (error) {
    ElMessage.error('导入失败：JSON 无效');
  }
};

const buildHeaderJson = () => {
  if (!activePreset.value) return '';
  const keysToRemove = ['prompts'];
  const header = cleanObject(activePreset.value.data as Record<string, any>, keysToRemove);
  const cleaned = removeEmptyFields(header) ?? {};
  return JSON.stringify(cleaned, null, 2);
};

const buildSidebarOrder = (prompts: Record<string, any>[]) => {
  const items = prompts
    .map((prompt, index) => ({
      prompt,
      index,
      order: typeof prompt.order === 'number' ? prompt.order : null,
      identifier: typeof prompt.identifier === 'string' ? prompt.identifier : null,
    }))
    .sort((a, b) => {
      if (a.order !== null && b.order !== null) return a.order - b.order;
      if (a.order !== null) return -1;
      if (b.order !== null) return 1;
      const aId = a.identifier ?? String(a.index);
      const bId = b.identifier ?? String(b.index);
      return aId.localeCompare(bId);
    });
  return items.map(({ prompt, index }) => ({
    identifier: prompt.identifier ?? `prompt-${index}`,
    enabled: typeof prompt.enabled === 'boolean' ? prompt.enabled : true,
  }));
};

const extractExtras = (prompt: PresetPrompt) => {
  const baseKeys = [
    'identifier',
    'name',
    'role',
    'content',
    'system_prompt',
    'marker',
    'enabled',
    'order',
  ];
  const extra: Record<string, any> = {};
  Object.entries(prompt || {}).forEach(([key, value]) => {
    if (!baseKeys.includes(key)) extra[key] = value;
  });
  return JSON.stringify(extra, null, 2);
};

watch(activePreset, (preset) => {
  if (!preset) {
    editorState.value = {
      ...editorState.value,
      presetName: '',
      headerJsonText: '',
    };
    return;
  }
  editorState.value = {
    ...editorState.value,
    presetName: preset.name,
    headerJsonText: buildHeaderJson(),
  };
}, { immediate: true });

watch(selectedPrompt, (prompt) => {
  if (!prompt) {
    editorState.value = {
      ...editorState.value,
      promptName: '',
      promptIdentifier: '',
      promptRole: 'system',
      promptContent: '',
      promptSystem: false,
      promptMarker: false,
      promptEnabled: false,
      promptOrder: null,
      promptExtraJson: '{}',
    };
    return;
  }
  editorState.value = {
    ...editorState.value,
    promptName: prompt.name || '',
    promptIdentifier: prompt.identifier || '',
    promptRole: (prompt.role as any) || 'system',
    promptContent: prompt.content || '',
    promptSystem: Boolean(prompt.system_prompt),
    promptMarker: Boolean(prompt.marker),
    promptEnabled: Boolean(prompt.enabled),
    promptOrder: typeof prompt.order === 'number' ? prompt.order : null,
    promptExtraJson: extractExtras(prompt),
  };
}, { immediate: true });

watch(selected, (val) => {
  if (val?.type === 'prompt') {
    activeEditorTab.value = 'prompt';
  } else {
    activeEditorTab.value = 'header';
  }
});

const addEditorToClipboard = () => {
  if (!selectedPrompt.value) return;
  addItem({
    id: uuidv4(),
    title: editorState.value.promptName || editorState.value.promptIdentifier || '未命名条目',
    content: editorState.value.promptContent || '',
  });
  ElMessage.success('已加入剪贴板');
};

const saveCurrent = async () => {
  if (!activePreset.value) return;
  try {
    const parsedHeader = editorState.value.headerJsonText ? JSON.parse(editorState.value.headerJsonText) : {};
    activePreset.value.name = editorState.value.presetName.trim() || activePreset.value.name;
    await updateHeader(parsedHeader);
    if (selectedPrompt.value && selectedPromptIndex.value !== null) {
      const extra = editorState.value.promptExtraJson ? JSON.parse(editorState.value.promptExtraJson) : {};
      const updatedPrompt: PresetPrompt = {
        ...extra,
        name: editorState.value.promptName || undefined,
        identifier: editorState.value.promptIdentifier || undefined,
        role: editorState.value.promptRole,
        content: editorState.value.promptContent,
        system_prompt: editorState.value.promptSystem,
        marker: editorState.value.promptMarker,
        enabled: editorState.value.promptEnabled,
        order: editorState.value.promptOrder ?? undefined,
      };
      await updatePrompt(selectedPromptIndex.value, updatedPrompt);
    }
    ElMessage.success('已保存');
  } catch {
    ElMessage.error('JSON 格式无效');
  }
};

const insertToEditor = (content: string) => {
  if (!selectedPrompt.value) return;
  if (!editorState.value.promptContent) {
    editorState.value = { ...editorState.value, promptContent: content };
    return;
  }
  editorState.value = { ...editorState.value, promptContent: `${editorState.value.promptContent}\n${content}` };
};

const replaceEditor = (content: string) => {
  if (!selectedPrompt.value) return;
  editorState.value = { ...editorState.value, promptContent: content };
};

const removeClipboard = (id: string) => removeClipboardItem(id);

onMounted(() => {
  if (isMobileOrTablet.value) {
    ElMessage.warning('不支持移动端');
  }
});
</script>

<style scoped>
.preset-page {
  width: 100%;
  height: 100%;
}

.preset-split {
  height: 100%;
}

.mobile-block {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clipboard-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
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
