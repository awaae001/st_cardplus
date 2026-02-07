<template>
  <div class="preset-page">
    <div
      v-if="isMobileOrTablet"
      class="mobile-block"
    >
      <el-empty
        description="不支持移动端"
        :image-size="200"
      />
    </div>
    <splitpanes
      v-else
      class="default-theme preset-split"
      :horizontal="false"
    >
      <pane
        min-size="18"
        size="22"
      >
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

      <pane
        min-size="35"
        size="50"
      >
        <PresetEditor
          v-model:active-tab="activeEditorTab"
          v-model:editor-state="editorState"
          :active-preset="activePreset"
          :selected-prompt="selectedPrompt"
          :save-status="presetAutoSave.saveStatus.value"
          :auto-save-mode="presetAutoSave.autoSaveMode.value"
          @save="handleManualSave"
          @toggle-mode="presetAutoSave.toggleAutoSaveMode"
          @add-clipboard="addEditorToClipboard"
        />
      </pane>

      <pane
        min-size="20"
        size="28"
      >
        <el-tabs
          v-model="rightPanelTab"
          class="right-panel-tabs"
        >
          <el-tab-pane
            label="剪贴板"
            name="clipboard"
          >
            <div class="clipboard-panel">
              <div class="panel-header">
                <h3>剪贴板</h3>
                <div class="header-actions">
                  <el-button
                    size="small"
                    @click="clearAll"
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
                    v-for="(clip, index) in clipboardItems"
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
                          @click="moveUp(index)"
                        />
                        <el-button
                          :icon="ArrowDown"
                          size="small"
                          text
                          @click="moveDown(index)"
                        />
                        <el-button
                          :icon="Delete"
                          size="small"
                          text
                          @click="removeClipboard(clip.id)"
                        />
                      </span>
                    </div>
                    <div class="clipboard-content">{{ clip.content }}</div>
                    <div class="clipboard-buttons">
                      <el-button
                        size="small"
                        @click="insertToEditor(clip.content)"
                        :disabled="!selectedPrompt"
                      >
                        插入编辑器
                      </el-button>
                      <el-button
                        size="small"
                        @click="replaceEditor(clip.content)"
                        :disabled="!selectedPrompt"
                      >
                        替换编辑器
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-tab-pane>
          <el-tab-pane
            label="预设预览"
            name="preview"
          >
            <div class="preview-panel">
              <div class="panel-header">
                <h3>预设预览</h3>
                <div class="header-actions">
                  <el-tag
                    v-if="activePreset"
                    type="info"
                    effect="plain"
                  >
                    {{ activePreset.name || '未命名预设' }} · {{ previewPrompts.length }} 条目
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
                  v-else-if="previewPrompts.length === 0"
                  class="empty-state"
                >
                  <el-empty
                    description="暂无条目"
                    :image-size="120"
                  />
                </div>
                <div
                  v-else
                  class="preview-list"
                >
                  <pre
                    v-for="item in previewPrompts"
                    :key="item.key"
                    class="preview-content"
                    >{{ item.text }}</pre
                  >
                </div>
              </el-scrollbar>
            </div>
          </el-tab-pane>
        </el-tabs>
      </pane>
    </splitpanes>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useDevice } from '@/composables/useDevice';
import { usePresetStore, type PresetPrompt } from '@/composables/preset/usePresetStore';
import { usePresetClipboard } from '@/composables/preset/usePresetClipboard';
import { usePresetAutoSave } from '@/composables/preset/usePresetAutoSave';
import PresetList from '@/components/preset/PresetList.vue';
import PresetEditor, { type PresetEditorState, type PresetHeaderForm } from '@/components/preset/PresetEditor.vue';
import { v4 as uuidv4 } from 'uuid';
import { saveAs } from 'file-saver';
import { cleanObject } from '@/utils/objectUtils';
import { getSessionStorageItem, setSessionStorageValue } from '@/utils/localStorageUtils';
import { defaultOpenAIPreset } from '@/types/openai-preset';
import { getPromptOrderIdentifiers, upsertPromptOrderEntry } from '@/composables/preset/utils/presetPromptOrder';
import { resolvePromptIdentifier } from '@/composables/preset/utils/presetTree';
import { Delete, ArrowUp, ArrowDown } from '@element-plus/icons-vue';

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
  updatePromptOrder,
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
const rightPanelTab = ref<'clipboard' | 'preview'>('clipboard');
const BETA_NOTICE_KEY = 'preset-editor-beta-notice-session-v1';
const isLoadingData = ref(false);
const normalizeNumber = (value: any, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const buildHeaderForm = (data?: Record<string, any>): PresetHeaderForm => {
  const source = { ...defaultOpenAIPreset, ...(data || {}) } as Record<string, any>;
  return {
    openai_max_context: normalizeNumber(source.openai_max_context, defaultOpenAIPreset.openai_max_context),
    openai_max_tokens: normalizeNumber(source.openai_max_tokens, defaultOpenAIPreset.openai_max_tokens),
    n: Math.max(1, normalizeNumber(source.n, defaultOpenAIPreset.n)),
    temperature: normalizeNumber(source.temperature, defaultOpenAIPreset.temperature),
    frequency_penalty: normalizeNumber(source.frequency_penalty, defaultOpenAIPreset.frequency_penalty),
    presence_penalty: normalizeNumber(source.presence_penalty, defaultOpenAIPreset.presence_penalty),
    top_p: normalizeNumber(source.top_p, defaultOpenAIPreset.top_p),
    impersonation_prompt: source.impersonation_prompt ?? defaultOpenAIPreset.impersonation_prompt ?? '',
    wi_format: source.wi_format ?? defaultOpenAIPreset.wi_format ?? '{0}',
    scenario_format: source.scenario_format ?? defaultOpenAIPreset.scenario_format ?? '{{scenario}}',
    personality_format: source.personality_format ?? defaultOpenAIPreset.personality_format ?? '{{personality}}',
    group_nudge_prompt: source.group_nudge_prompt ?? defaultOpenAIPreset.group_nudge_prompt ?? '',
    new_chat_prompt: source.new_chat_prompt ?? defaultOpenAIPreset.new_chat_prompt ?? '',
    new_group_chat_prompt: source.new_group_chat_prompt ?? defaultOpenAIPreset.new_group_chat_prompt ?? '',
    new_example_chat_prompt: source.new_example_chat_prompt ?? defaultOpenAIPreset.new_example_chat_prompt ?? '',
    continue_nudge_prompt: source.continue_nudge_prompt ?? defaultOpenAIPreset.continue_nudge_prompt ?? '',
    send_if_empty: source.send_if_empty ?? defaultOpenAIPreset.send_if_empty ?? '',
    seed: normalizeNumber(source.seed, defaultOpenAIPreset.seed),
    names_behavior: normalizeNumber(source.names_behavior, defaultOpenAIPreset.names_behavior),
    continue_postfix: source.continue_postfix ?? defaultOpenAIPreset.continue_postfix ?? ' ',
    continue_prefill: Boolean(source.continue_prefill),
    squash_system_messages: Boolean(source.squash_system_messages),
    function_calling: Boolean(source.function_calling),
    media_inlining: Boolean(source.media_inlining),
    inline_image_quality: source.inline_image_quality ?? defaultOpenAIPreset.inline_image_quality ?? 'auto',
    show_thoughts: Boolean(source.show_thoughts),
    reasoning_effort: source.reasoning_effort ?? defaultOpenAIPreset.reasoning_effort ?? 'auto',
    verbosity: source.verbosity ?? defaultOpenAIPreset.verbosity ?? 'auto',
  };
};

const editorState = ref<PresetEditorState>({
  presetName: '',
  headerForm: buildHeaderForm(),
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
const selectedPromptIndex = computed(() =>
  selected.value?.type === 'prompt' ? (selected.value.promptIndex ?? null) : null
);

const getNodeIdentifier = (nodeData: any) => {
  const raw = nodeData?.raw;
  if (!raw) return null;
  return resolvePromptIdentifier(raw, nodeData.promptIndex ?? 0);
};

const moveIdentifier = (list: string[], fromId: string, toId: string, type: 'prev' | 'next') => {
  const next = list.slice();
  const fromIndex = next.indexOf(fromId);
  const toIndex = next.indexOf(toId);
  if (fromIndex === -1 || toIndex === -1) return next;
  next.splice(fromIndex, 1);
  const insertIndex = type === 'prev' ? toIndex : toIndex + 1;
  next.splice(insertIndex, 0, fromId);
  return next;
};

const insertBeforeOrAfter = (list: string[], id: string, anchorId: string, type: 'prev' | 'next') => {
  if (list.includes(id)) return list;
  const next = list.slice();
  const anchorIndex = next.indexOf(anchorId);
  if (anchorIndex === -1) return next;
  const insertIndex = type === 'prev' ? anchorIndex : anchorIndex + 1;
  next.splice(insertIndex, 0, id);
  return next;
};

const removeFromList = (list: string[], id: string) => list.filter((item) => item !== id);

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
      return dropNode.data.isPrompt && draggingNode.data.presetId === dropNode.data.presetId && (type === 'prev' || type === 'next');
    }
    return false;
  },
  handleNodeDrop: (draggingNode: any, dropNode: any, type: any) => {
    if (!draggingNode?.data || !dropNode?.data) return false;
    if (draggingNode.data.isPreset) {
      const currentOrder = presets.value
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((p) => p.id);
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
      const preset = presets.value.find((p) => p.id === presetId);
      if (!preset) return false;
      const fromId = getNodeIdentifier(draggingNode.data);
      const toId = getNodeIdentifier(dropNode.data);
      if (!fromId || !toId) return false;
      const identifiers = getPromptOrderIdentifiers(preset.data.prompt_order);
      const fromInOrder = identifiers.includes(fromId);
      const toInOrder = identifiers.includes(toId);
      let next = identifiers;
      if (fromInOrder && toInOrder) {
        next = moveIdentifier(identifiers, fromId, toId, type);
      } else if (fromInOrder && !toInOrder) {
        next = removeFromList(identifiers, fromId);
      } else if (!fromInOrder && toInOrder) {
        next = insertBeforeOrAfter(identifiers, fromId, toId, type);
      } else {
        return false;
      }
      updatePromptOrder(presetId, next);
      return true;
    }
    return false;
  },
};

const handleRenamePreset = (id: string) => {
  const preset = presets.value.find((p) => p.id === id);
  if (preset) renamePreset(preset);
};

const handleDeletePreset = (id: string) => {
  const preset = presets.value.find((p) => p.id === id);
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
  const promptOrder = upsertPromptOrderEntry(activePreset.value.data.prompt_order, orderList);
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
    const presetName =
      parsed && typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : nameFromFile || '导入预设';
    await importPreset(presetName, parsed);
    ElMessage.success('预设导入成功');
  } catch (error) {
    ElMessage.error('导入失败：JSON 无效');
  }
};

const sortPrompts = (prompts: Record<string, any>[]) => {
  return prompts
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
};

const buildSidebarOrder = (prompts: Record<string, any>[]) => {
  const items = sortPrompts(prompts);
  return items.map(({ prompt, index }) => ({
    identifier: prompt.identifier ?? `prompt-${index}`,
    enabled: typeof prompt.enabled === 'boolean' ? prompt.enabled : true,
  }));
};

const previewPrompts = computed(() => {
  if (!activePreset.value) return [];
  const prompts = (activePreset.value.data.prompts as Record<string, any>[]) || [];
  return sortPrompts(prompts)
    .map(({ prompt, index }) => {
      const enabled = typeof prompt.enabled === 'boolean' ? prompt.enabled : true;
      if (!enabled) return null;
      const title = prompt.name || prompt.identifier || `条目 ${index + 1}`;
      const content = prompt.content || '';
      return {
        key: prompt.identifier ?? `prompt-${index}`,
        text: `---： ${title}\n${content}`,
      };
    })
    .filter((item): item is { key: string; text: string } => Boolean(item));
});

const extractExtras = (prompt: PresetPrompt) => {
  const baseKeys = ['identifier', 'name', 'role', 'content', 'system_prompt', 'marker', 'enabled', 'order'];
  const extra: Record<string, any> = {};
  Object.entries(prompt || {}).forEach(([key, value]) => {
    if (!baseKeys.includes(key)) extra[key] = value;
  });
  return JSON.stringify(extra, null, 2);
};

const saveCurrent = async (showToast = true) => {
  if (!activePreset.value) return;
  try {
    activePreset.value.name = editorState.value.presetName.trim() || activePreset.value.name;
    const headerBase = cleanObject(activePreset.value.data as Record<string, any>, ['prompts']);
    const nextHeader = { ...headerBase, ...editorState.value.headerForm };
    await updateHeader(nextHeader);
    if (selectedPrompt.value && selectedPromptIndex.value !== null) {
      let extra: Record<string, any> = {};
      if (editorState.value.promptExtraJson) {
        extra = JSON.parse(editorState.value.promptExtraJson);
      }
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
    if (showToast) {
      ElMessage.success('已保存');
    }
  } catch {
    if (showToast) {
      ElMessage.error('条目扩展 JSON 格式无效');
    }
    throw new Error('invalid-prompt-extra-json');
  }
};

const presetAutoSave = usePresetAutoSave({
  editorState,
  activePresetId,
  isLoadingData,
  onSave: () => saveCurrent(false),
});

const handleManualSave = async () => {
  try {
    await presetAutoSave.manualSave();
    ElMessage.success('已保存');
  } catch (error) {
    if (error instanceof Error && error.message === 'invalid-prompt-extra-json') {
      ElMessage.error('条目扩展 JSON 格式无效');
      return;
    }
    ElMessage.error('保存失败');
  }
};

watch(
  activePreset,
  (preset) => {
    if (!preset) {
      editorState.value = {
        ...editorState.value,
        presetName: '',
        headerForm: buildHeaderForm(),
      };
      nextTick(() => {
        presetAutoSave.updateSavedSnapshot();
        isLoadingData.value = false;
      });
      return;
    }
    isLoadingData.value = true;
    editorState.value = {
      ...editorState.value,
      presetName: preset.name,
      headerForm: buildHeaderForm(preset.data as Record<string, any>),
    };
    nextTick(() => {
      presetAutoSave.updateSavedSnapshot();
      isLoadingData.value = false;
    });
  },
  { immediate: true }
);

watch(
  selectedPrompt,
  (prompt) => {
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
      nextTick(() => {
        presetAutoSave.updateSavedSnapshot();
        isLoadingData.value = false;
      });
      return;
    }
    isLoadingData.value = true;
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
    nextTick(() => {
      presetAutoSave.updateSavedSnapshot();
      isLoadingData.value = false;
    });
  },
  { immediate: true }
);

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

const showBetaNotice = async () => {
  if (getSessionStorageItem(BETA_NOTICE_KEY)) return;
  try {
    await ElMessageBox.alert(
      '预设编辑器目前为测试版，功能仍在完善中。建议先备份重要预设再编辑，如遇问题请反馈。',
      '测试版提示',
      { confirmButtonText: '我知道了', type: 'warning' }
    );
  } finally {
    setSessionStorageValue(BETA_NOTICE_KEY, true);
  }
};

onMounted(() => {
  if (isMobileOrTablet.value) {
    ElMessage.warning('不支持移动端');
    return;
  }
  showBetaNotice();
});

onBeforeUnmount(() => {
  presetAutoSave.cleanup();
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

.preview-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.right-panel-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.right-panel-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.right-panel-tabs :deep(.el-tab-pane) {
  height: 100%;
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

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-content {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-family: var(--el-font-family);
}
</style>
