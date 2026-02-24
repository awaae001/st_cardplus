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
          :multi-selected-node-keys="multiSelectedNodeKeys"
          :drag-drop-handlers="dragDropHandlers"
          @create-preset="createPreset"
          @create-blank="createBlankPreset"
          @rename-preset="handleRenamePreset"
          @delete-preset="handleDeletePreset"
          @select-preset="selectPreset"
          @select-header="selectHeader"
          @select-prompt="selectPrompt"
          @toggle-node-selection="handleToggleNodeSelection"
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
            <PresetPreviewPanel :active-preset="activePreset" />
          </el-tab-pane>
        </el-tabs>
      </pane>
    </splitpanes>
  </div>
</template>

<script setup lang="ts">
import PresetEditor, { type PresetEditorState, type PresetHeaderForm } from '@/components/preset/PresetEditor.vue';
import PresetList from '@/components/preset/PresetList.vue';
import PresetPreviewPanel from '@/components/preset/PresetPreviewPanel.vue';
import { usePresetAutoSave } from '@/composables/preset/usePresetAutoSave';
import { usePresetClipboard } from '@/composables/preset/usePresetClipboard';
import { usePresetStore, type PresetPrompt } from '@/composables/preset/usePresetStore';
import {
  buildPromptOrderList,
  getPromptOrderIdentifiers,
  upsertPromptOrderEntry,
} from '@/composables/preset/utils/presetPromptOrder';
import { getPromptNodeKey, resolvePromptIdentifier } from '@/composables/preset/utils/presetTree';
import { useDevice } from '@/composables/useDevice';
import { defaultOpenAIPreset } from '@/types/openai-preset';
import { getSessionStorageItem, setSessionStorageValue } from '@/utils/localStorageUtils';
import { cleanObject } from '@/utils/objectUtils';
import { ArrowDown, ArrowUp, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { AllowDropType, NodeDropType } from 'element-plus/es/components/tree/src/tree.type';
import { saveAs } from 'file-saver';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { v4 as uuidv4 } from 'uuid';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

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
// 上游约定：prompt_order 的目标 character_id 固定为 100001
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

const multiSelectedPresetIds = ref<string[]>([]);
const multiSelectedPromptPresetId = ref<string | null>(null);
const multiSelectedPromptIds = ref<string[]>([]);

const clearMultiSelection = () => {
  multiSelectedPresetIds.value = [];
  multiSelectedPromptPresetId.value = null;
  multiSelectedPromptIds.value = [];
};

const multiSelectedNodeKeys = computed(() => {
  const promptPresetId = multiSelectedPromptPresetId.value;
  const promptKeys =
    promptPresetId && multiSelectedPromptIds.value.length > 0
      ? multiSelectedPromptIds.value.map((id) => getPromptNodeKey(promptPresetId, id))
      : [];
  return [...multiSelectedPresetIds.value, ...promptKeys];
});

const togglePresetMultiSelection = (presetId: string) => {
  const index = multiSelectedPresetIds.value.indexOf(presetId);
  if (index === -1) {
    multiSelectedPresetIds.value.push(presetId);
    return;
  }
  multiSelectedPresetIds.value.splice(index, 1);
};

const togglePromptMultiSelection = (presetId: string, promptId: string) => {
  if (multiSelectedPromptPresetId.value !== presetId) {
    multiSelectedPromptPresetId.value = presetId;
    multiSelectedPromptIds.value = [promptId];
    return;
  }
  const index = multiSelectedPromptIds.value.indexOf(promptId);
  if (index === -1) {
    multiSelectedPromptIds.value.push(promptId);
    return;
  }
  multiSelectedPromptIds.value.splice(index, 1);
  if (multiSelectedPromptIds.value.length === 0) {
    multiSelectedPromptPresetId.value = null;
  }
};

const handleToggleNodeSelection = (data: any, additive: boolean) => {
  if (!additive) {
    clearMultiSelection();
    return;
  }

  if (data?.isPreset && typeof data.id === 'string') {
    multiSelectedPromptPresetId.value = null;
    multiSelectedPromptIds.value = [];
    togglePresetMultiSelection(data.id);
    return;
  }

  if (data?.isPrompt) {
    const identifier = getNodeIdentifier(data);
    if (!identifier || !data.presetId) return;
    multiSelectedPresetIds.value = [];
    togglePromptMultiSelection(data.presetId, identifier);
    return;
  }

  clearMultiSelection();
};

const getNodeIdentifier = (nodeData: any) => {
  const raw = nodeData?.raw;
  if (!raw) return null;
  return resolvePromptIdentifier(raw, nodeData.promptIndex ?? 0);
};

type PresetDropType = 'before' | 'after';

const getInsertIndexAfterRemoval = (
  fromIndex: number,
  toIndex: number,
  type: PresetDropType
) => {
  const normalizedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
  return type === 'before' ? normalizedToIndex : normalizedToIndex + 1;
};

const moveMultipleIdentifiers = (list: string[], movingIds: string[], anchorId: string, type: PresetDropType) => {
  const movingSet = new Set(movingIds);
  if (!movingSet.size || movingSet.has(anchorId)) return list.slice();

  const orderedMoving = list.filter((id) => movingSet.has(id));
  if (orderedMoving.length === 0) return list.slice();

  const rest = list.filter((id) => !movingSet.has(id));
  const anchorIndex = rest.indexOf(anchorId);
  if (anchorIndex === -1) return list.slice();

  const insertIndex = type === 'before' ? anchorIndex : anchorIndex + 1;
  rest.splice(insertIndex, 0, ...orderedMoving);
  return rest;
};

const moveSinglePreset = (currentOrder: string[], fromId: string, toId: string, type: PresetDropType) => {
  const fromIndex = currentOrder.indexOf(fromId);
  const toIndex = currentOrder.indexOf(toId);
  if (fromIndex === -1 || toIndex === -1) return currentOrder;
  const next = currentOrder.slice();
  next.splice(fromIndex, 1);
  const insertIndex = getInsertIndexAfterRemoval(fromIndex, toIndex, type);
  next.splice(insertIndex, 0, fromId);
  return next;
};

const getPromptDisplayIdentifiers = (preset: { data: { prompts?: Record<string, any>[]; prompt_order: any } }) => {
  const prompts = ((preset.data.prompts as Record<string, any>[]) || []).slice();
  const ordered = getPromptOrderIdentifiers(preset.data.prompt_order);
  const used = new Set<string>(ordered);
  const remaining = prompts
    .map((prompt, index) => resolvePromptIdentifier(prompt, index))
    .filter((identifier) => !used.has(identifier));
  return [...ordered, ...remaining];
};

const movePromptIdentifiers = (
  preset: { data: { prompts?: Record<string, any>[]; prompt_order: any } },
  movingIds: string[],
  anchorId: string,
  type: PresetDropType
) => {
  const currentOrder = getPromptOrderIdentifiers(preset.data.prompt_order);
  const displayOrder = getPromptDisplayIdentifiers(preset);
  const movingSet = new Set(movingIds);
  if (!movingSet.size || movingSet.has(anchorId)) return null;

  const orderedMoving = displayOrder.filter((id) => movingSet.has(id));
  if (!orderedMoving.length) return null;

  const anchorInOrder = currentOrder.includes(anchorId);
  const movingInOrder = orderedMoving.filter((id) => currentOrder.includes(id));

  if (!anchorInOrder) {
    if (!movingInOrder.length) return null;
    return currentOrder.filter((id) => !movingSet.has(id));
  }

  const rest = currentOrder.filter((id) => !movingSet.has(id));
  const anchorIndex = rest.indexOf(anchorId);
  if (anchorIndex === -1) return null;
  const insertIndex = type === 'before' ? anchorIndex : anchorIndex + 1;
  rest.splice(insertIndex, 0, ...orderedMoving);
  return rest;
};

const dragDropHandlers = {
  allowDrag: (draggingNode: any) => {
    const data = draggingNode?.data;
    if (data?.isPreset && typeof data.id === 'string' && !multiSelectedPresetIds.value.includes(data.id)) {
      multiSelectedPresetIds.value = [];
    }
    if (data?.isPrompt) {
      const promptId = getNodeIdentifier(data);
      if (
        !promptId ||
        multiSelectedPromptPresetId.value !== data.presetId ||
        !multiSelectedPromptIds.value.includes(promptId)
      ) {
        multiSelectedPromptPresetId.value = null;
        multiSelectedPromptIds.value = [];
      }
    }
    return Boolean(draggingNode?.data?.isPreset || draggingNode?.data?.isPrompt);
  },
  allowDrop: (draggingNode: any, dropNode: any, type: AllowDropType) => {
    if (!draggingNode?.data || !dropNode?.data) return false;
    if (draggingNode.data.isPreset) {
      return dropNode.data.isPreset && (type === 'prev' || type === 'next');
    }
    if (draggingNode.data.isPrompt) {
      return (
        dropNode.data.isPrompt &&
        draggingNode.data.presetId === dropNode.data.presetId &&
        (type === 'prev' || type === 'next')
      );
    }
    return false;
  },
  handleNodeDrop: (draggingNode: any, dropNode: any, type: Exclude<NodeDropType, 'none'>) => {
    if (!draggingNode?.data || !dropNode?.data) return false;
    if (type === 'inner') return false;
    if (draggingNode.data.isPreset) {
      const currentOrder = presets.value
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((p) => p.id);
      const movingPresetIds = multiSelectedPresetIds.value.includes(draggingNode.data.id)
        ? currentOrder.filter((id) => multiSelectedPresetIds.value.includes(id))
        : [draggingNode.data.id];
      if (!movingPresetIds.length) return false;

      const nextOrder =
        movingPresetIds.length === 1
          ? moveSinglePreset(currentOrder, movingPresetIds[0], dropNode.data.id, type)
          : moveMultipleIdentifiers(currentOrder, movingPresetIds, dropNode.data.id, type);
      if (nextOrder.join('|') === currentOrder.join('|')) return false;

      reorderPresets(nextOrder);
      return true;
    }
    if (draggingNode.data.isPrompt) {
      const presetId = draggingNode.data.presetId;
      const preset = presets.value.find((p) => p.id === presetId);
      if (!preset) return false;
      const fromId = getNodeIdentifier(draggingNode.data);
      const toId = getNodeIdentifier(dropNode.data);
      if (!fromId || !toId) return false;

      const movingIds =
        multiSelectedPromptPresetId.value === presetId && multiSelectedPromptIds.value.includes(fromId)
          ? multiSelectedPromptIds.value.slice()
          : [fromId];
      const identifiers = getPromptOrderIdentifiers(preset.data.prompt_order);
      const next = movePromptIdentifiers(preset, movingIds, toId, type);
      if (!next) return false;
      if (next.join('|') === identifiers.join('|')) return false;
      updatePromptOrder(presetId, next);
      return true;
    }
    return false;
  },
};

watch(
  presets,
  (nextPresets) => {
    const presetIdSet = new Set(nextPresets.map((preset) => preset.id));
    multiSelectedPresetIds.value = multiSelectedPresetIds.value.filter((id) => presetIdSet.has(id));

    const selectedPromptPresetId = multiSelectedPromptPresetId.value;
    if (!selectedPromptPresetId || !presetIdSet.has(selectedPromptPresetId)) {
      multiSelectedPromptPresetId.value = null;
      multiSelectedPromptIds.value = [];
      return;
    }

    const preset = nextPresets.find((item) => item.id === selectedPromptPresetId);
    if (!preset) {
      multiSelectedPromptPresetId.value = null;
      multiSelectedPromptIds.value = [];
      return;
    }

    const promptIds = new Set(
      ((preset.data.prompts as Record<string, any>[]) || []).map((prompt, index) => resolvePromptIdentifier(prompt, index))
    );
    multiSelectedPromptIds.value = multiSelectedPromptIds.value.filter((id) => promptIds.has(id));
    if (multiSelectedPromptIds.value.length === 0) {
      multiSelectedPromptPresetId.value = null;
    }
  },
  { deep: true }
);

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
  const existingOrder = getPromptOrderIdentifiers(activePreset.value.data.prompt_order);
  const promptOrder =
    existingOrder.length > 0
      ? JSON.parse(JSON.stringify(activePreset.value.data.prompt_order))
      : upsertPromptOrderEntry(activePreset.value.data.prompt_order, buildPromptOrderList(prompts));
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

.clipboard-panel .panel-header {
  display: flex;
  gap: 12px;
  padding: 0 8px;
  margin-bottom: 12px;
}

.right-panel-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 8px;
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

</style>
