import { computed, onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { defaultOpenAIPreset, defaultPromptOrder } from '@/types/openai-preset';
import { presetService } from '@/database/presetService';
import type { StoredPresetFile } from '@/database/db';
import {
  buildPromptOrderListFromIdentifiers,
  getPromptOrderIdentifiers,
  removePromptOrderIdentifier,
  upsertPromptOrderEntry,
} from '@/composables/preset/utils/presetPromptOrder';

export type PresetPrompt = Record<string, any> & {
  identifier?: string;
  name?: string;
  role?: string;
  content?: string;
  system_prompt?: boolean;
  marker?: boolean;
  enabled?: boolean;
  order?: number;
};

export interface PresetSelection {
  type: 'header' | 'prompt';
  promptIndex?: number;
}

const getDefaultOrderIdentifiers = () => {
  const withPersona = defaultPromptOrder.find((entry) =>
    entry.order.some((item) => item.identifier === 'personaDescription')
  );
  const target = withPersona ?? defaultPromptOrder[0];
  return target.order.map((item) => item.identifier);
};

const orderPromptsByIdentifiers = (prompts: PresetPrompt[], identifiers: string[]) => {
  const map = new Map<string, PresetPrompt>();
  prompts.forEach((prompt) => {
    if (prompt.identifier) {
      map.set(prompt.identifier, prompt);
    }
  });
  const ordered: PresetPrompt[] = [];
  identifiers.forEach((id) => {
    const item = map.get(id);
    if (item) ordered.push(item);
  });
  prompts.forEach((prompt) => {
    if (!prompt.identifier || !identifiers.includes(prompt.identifier)) {
      ordered.push(prompt);
    }
  });
  return ordered;
};

  const buildPromptOrderList = (prompts: PresetPrompt[]) => {
    return prompts.map((prompt, index) => ({
      identifier: prompt.identifier ?? `prompt-${index}`,
      enabled: typeof prompt.enabled === 'boolean' ? prompt.enabled : true,
    }));
  };

export function usePresetStore() {
  const presets = ref<StoredPresetFile[]>([]);
  const activePresetId = ref<string | null>(null);
  const selected = ref<PresetSelection | null>(null);
  const isReady = ref(false);

  const activePreset = computed(() => presets.value.find((p) => p.id === activePresetId.value) || null);
  const activePrompts = computed<PresetPrompt[]>(() => {
    return (activePreset.value?.data?.prompts as PresetPrompt[]) || [];
  });
  const selectedPrompt = computed<PresetPrompt | null>(() => {
    if (!selected.value || selected.value.type !== 'prompt') return null;
    const index = selected.value.promptIndex ?? -1;
    return activePrompts.value[index] || null;
  });

  const loadPresets = async () => {
    const loaded = await presetService.getAllPresets();
    if (loaded.length === 0) {
      const now = new Date().toISOString();
      const preset: StoredPresetFile = {
        id: presetService.createPresetId(),
        name: '默认预设',
        order: 0,
        createdAt: now,
        updatedAt: now,
        data: presetService.createDefaultPresetData(defaultOpenAIPreset) as any,
      };
      await presetService.addPreset(preset);
      presets.value = [preset];
      activePresetId.value = preset.id;
      selected.value = { type: 'header' };
    } else {
      presets.value = loaded;
      const remembered = presetService.getActivePresetId();
      activePresetId.value =
        remembered && loaded.find((p) => p.id === remembered) ? remembered : (loaded[0]?.id ?? null);
      selected.value = { type: 'header' };
    }
    isReady.value = true;
  };

  onMounted(loadPresets);

  const selectPreset = (presetId: string) => {
    activePresetId.value = presetId;
    presetService.setActivePresetId(presetId);
    selected.value = { type: 'header' };
  };

  const selectHeader = (presetId: string) => {
    selectPreset(presetId);
    selected.value = { type: 'header' };
  };

  const selectPrompt = (presetId: string, promptIndex: number) => {
    selectPreset(presetId);
    selected.value = { type: 'prompt', promptIndex };
  };

  const createPreset = async () => {
    try {
      const result = await ElMessageBox.prompt('请输入新预设名称', '新建预设', {
        confirmButtonText: '创建',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '名称不能为空',
      });
      const { value: name } = result as { value: string };
      const now = new Date().toISOString();
      const order = presets.value.length;
      const preset: StoredPresetFile = {
        id: presetService.createPresetId(),
        name,
        order,
        createdAt: now,
        updatedAt: now,
        data: presetService.createDefaultPresetData(defaultOpenAIPreset) as any,
      };
      await presetService.addPreset(preset);
      presets.value.push(preset);
      activePresetId.value = preset.id;
      selected.value = { type: 'header' };
      ElMessage.success('预设已创建');
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.info('已取消创建');
      }
    }
  };

  const createBlankPreset = async () => {
    try {
      const result = await ElMessageBox.prompt('请输入新预设名称', '新建空白预设', {
        confirmButtonText: '创建',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '名称不能为空',
      });
      const { value: name } = result as { value: string };
      const now = new Date().toISOString();
      const order = presets.value.length;
      const data = presetService.createDefaultPresetData(defaultOpenAIPreset) as any;
      const identifiers = getDefaultOrderIdentifiers();
      const reorderedPrompts = orderPromptsByIdentifiers((data.prompts as PresetPrompt[]) || [], identifiers).map(
        (prompt: PresetPrompt, index: number) => ({
          ...prompt,
          content: '',
          order: index,
        })
      );
      data.prompts = reorderedPrompts;
      data.prompt_order = JSON.parse(JSON.stringify(defaultPromptOrder));
      const preset: StoredPresetFile = {
        id: presetService.createPresetId(),
        name,
        order,
        createdAt: now,
        updatedAt: now,
        data,
      };
      await presetService.addPreset(preset);
      presets.value.push(preset);
      activePresetId.value = preset.id;
      selected.value = { type: 'header' };
      ElMessage.success('空白预设已创建');
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.info('已取消创建');
      }
    }
  };

  const renamePreset = async (preset: StoredPresetFile) => {
    try {
      const result = await ElMessageBox.prompt('请输入新的名称', '重命名预设', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputValue: preset.name,
        inputPattern: /.+/,
        inputErrorMessage: '名称不能为空',
      });
      const { value: name } = result as { value: string };
      preset.name = name;
      preset.updatedAt = new Date().toISOString();
      await presetService.updatePreset(preset);
      ElMessage.success('预设已重命名');
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.info('已取消重命名');
      }
    }
  };

  const removePreset = async (preset: StoredPresetFile) => {
    try {
      await ElMessageBox.confirm(`确定删除预设 "${preset.name}" 吗？`, '删除预设', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await presetService.deletePreset(preset.id);
      presets.value = presets.value.filter((p) => p.id !== preset.id);
      activePresetId.value = presets.value[0]?.id ?? null;
      selected.value = { type: 'header' };
      ElMessage.success('预设已删除');
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.info('已取消删除');
      }
    }
  };

  const addPrompt = async (presetId: string) => {
    const preset = presets.value.find((p) => p.id === presetId);
    if (!preset) return;
    const now = new Date().toISOString();
    const prompts = (preset.data.prompts as PresetPrompt[]) || [];
    const newPrompt: PresetPrompt = {
      identifier: presetService.createPresetId(),
      name: '新条目',
      role: 'user',
      content: '',
      system_prompt: false,
      marker: false,
      enabled: true,
      order: prompts.length,
    };
    const updatedPrompts = [...prompts, newPrompt];
    preset.data.prompts = updatedPrompts as any;
    preset.updatedAt = now;
    await presetService.updatePreset(preset);
    ElMessage.success('条目已创建');
    selected.value = { type: 'prompt', promptIndex: updatedPrompts.length - 1 };
  };

  const addPrompts = async (presetId: string, incoming: PresetPrompt[]) => {
    const preset = presets.value.find((p) => p.id === presetId);
    if (!preset) return;
    const prompts = (preset.data.prompts as PresetPrompt[]) || [];
    const startOrder = prompts.length;
    const normalized = incoming.map((prompt, index) => ({
      ...prompt,
      identifier: prompt.identifier || presetService.createPresetId(),
      order: typeof prompt.order === 'number' ? prompt.order : startOrder + index,
    }));
    preset.data.prompts = [...prompts, ...normalized] as any;
    preset.updatedAt = new Date().toISOString();
    await presetService.updatePreset(preset);
  };

  const importPreset = async (presetName: string, data: Record<string, any>) => {
    const now = new Date().toISOString();
    const order = presets.value.length;
    const prompts = Array.isArray(data.prompts) ? data.prompts : [];
    const normalizedPrompts = prompts.map((prompt: PresetPrompt, index: number) => ({
      ...prompt,
      identifier: prompt.identifier || presetService.createPresetId(),
      order: typeof prompt.order === 'number' ? prompt.order : index,
    }));
    const preset: StoredPresetFile = {
      id: presetService.createPresetId(),
      name: presetName,
      order,
      createdAt: now,
      updatedAt: now,
      data: {
        ...data,
        prompts: normalizedPrompts,
      } as any,
    };
    await presetService.addPreset(preset);
    presets.value.push(preset);
    activePresetId.value = preset.id;
    selected.value = { type: 'header' };
  };

  const reorderPresets = async (orderedIds: string[]) => {
    const now = new Date().toISOString();
    const updated = orderedIds
      .map((id, index) => {
        const preset = presets.value.find((p) => p.id === id);
        if (!preset) return null;
        preset.order = index;
        preset.updatedAt = now;
        return preset;
      })
      .filter(Boolean) as StoredPresetFile[];
    presets.value = updated;
    await presetService.updatePresetOrder(
      updated.map((p) => ({
        id: p.id,
        order: p.order,
        updatedAt: p.updatedAt,
      }))
    );
  };

  const reorderPrompts = async (presetId: string, orderedIndices: number[]) => {
    const preset = presets.value.find((p) => p.id === presetId);
    if (!preset) return;
    const prompts = (preset.data.prompts as PresetPrompt[]) || [];
    const reordered = orderedIndices.map((index) => prompts[index]).filter(Boolean);
    reordered.forEach((prompt, index) => {
      prompt.order = index;
    });
    preset.data.prompts = reordered as any;
    const orderIdentifiers = getPromptOrderIdentifiers(preset.data.prompt_order);
    const orderSet = new Set(orderIdentifiers);
    const orderList =
      orderIdentifiers.length > 0
        ? reordered
            .filter((prompt) => typeof prompt.identifier === 'string' && orderSet.has(prompt.identifier))
            .map((prompt) => ({
              identifier: prompt.identifier as string,
              enabled: typeof prompt.enabled === 'boolean' ? prompt.enabled : true,
            }))
        : buildPromptOrderList(reordered);
    preset.data.prompt_order = upsertPromptOrderEntry(preset.data.prompt_order, orderList);
    preset.updatedAt = new Date().toISOString();
    await presetService.updatePreset(preset);
  };

  const duplicatePrompt = async (presetId: string, promptIndex: number) => {
    const preset = presets.value.find((p) => p.id === presetId);
    if (!preset) return;
    const prompts = (preset.data.prompts as PresetPrompt[]) || [];
    const source = prompts[promptIndex];
    if (!source) return;
    const cloned = JSON.parse(JSON.stringify(source)) as PresetPrompt;
    cloned.identifier = presetService.createPresetId();
    cloned.name = `${source.name || '条目'} - 副本`;
    const updatedPrompts = [...prompts, cloned];
    preset.data.prompts = updatedPrompts as any;
    preset.updatedAt = new Date().toISOString();
    await presetService.updatePreset(preset);
    ElMessage.success('条目已复制');
    selected.value = { type: 'prompt', promptIndex: updatedPrompts.length - 1 };
  };

  const removePrompt = async (presetId: string, promptIndex: number) => {
    const preset = presets.value.find((p) => p.id === presetId);
    if (!preset) return;
    const prompts = (preset.data.prompts as PresetPrompt[]) || [];
    const target = prompts[promptIndex];
    if (!target) return;
    const identifier = typeof target.identifier === 'string' ? target.identifier : '';
    const inOrder = identifier ? getPromptOrderIdentifiers(preset.data.prompt_order).includes(identifier) : false;
    try {
      const actionText = inOrder ? '移除' : '删除';
      const description = inOrder
        ? `确定移除条目 "${target.name || target.identifier || '未命名'}" 并移至未插入吗？`
        : `确定删除条目 "${target.name || target.identifier || '未命名'}" 吗？`;
      await ElMessageBox.confirm(description, '删除条目', {
        confirmButtonText: actionText,
        cancelButtonText: '取消',
        type: 'warning',
      });
      if (inOrder && identifier) {
        const { next, removed } = removePromptOrderIdentifier(preset.data.prompt_order, identifier);
        if (removed) {
          preset.data.prompt_order = next as any;
          preset.updatedAt = new Date().toISOString();
          await presetService.updatePreset(preset);
          ElMessage.success('条目已移至未插入');
          return;
        }
      }
      const updatedPrompts = prompts.filter((_, idx) => idx !== promptIndex);
      preset.data.prompts = updatedPrompts as any;
      preset.updatedAt = new Date().toISOString();
      await presetService.updatePreset(preset);
      ElMessage.success('条目已删除');
      selected.value = { type: 'header' };
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.info('已取消删除');
      }
    }
  };

  const updateHeader = async (header: Record<string, any>) => {
    if (!activePreset.value) return;
    const prompts = (activePreset.value.data.prompts as PresetPrompt[]) || [];
    activePreset.value.data = { ...header, prompts } as any;
    activePreset.value.updatedAt = new Date().toISOString();
    await presetService.updatePreset(activePreset.value);
  };

  const updatePrompt = async (promptIndex: number, updatedPrompt: PresetPrompt) => {
    if (!activePreset.value) return;
    const prompts = (activePreset.value.data.prompts as PresetPrompt[]) || [];
    if (!prompts[promptIndex]) return;
    const nextPrompts = [...prompts];
    nextPrompts[promptIndex] = updatedPrompt;
    activePreset.value.data.prompts = nextPrompts as any;
    activePreset.value.updatedAt = new Date().toISOString();
    await presetService.updatePreset(activePreset.value);
  };

  const updatePromptOrder = async (presetId: string, identifiers: string[]) => {
    const preset = presets.value.find((p) => p.id === presetId);
    if (!preset) return;
    const prompts = (preset.data.prompts as PresetPrompt[]) || [];
    const orderList = buildPromptOrderListFromIdentifiers(identifiers, prompts as any, preset.data.prompt_order);
    preset.data.prompt_order = upsertPromptOrderEntry(preset.data.prompt_order, orderList);
    preset.updatedAt = new Date().toISOString();
    await presetService.updatePreset(preset);
  };

  return {
    presets,
    activePresetId,
    activePreset,
    activePrompts,
    selected,
    selectedPrompt,
    isReady,
    selectPreset,
    selectHeader,
    selectPrompt,
    createPreset,
    createBlankPreset,
    renamePreset,
    removePreset,
    addPrompt,
    addPrompts,
    importPreset,
    reorderPresets,
    reorderPrompts,
    duplicatePrompt,
    removePrompt,
    updateHeader,
    updatePrompt,
    updatePromptOrder,
  };
}
