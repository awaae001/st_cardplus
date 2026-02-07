<template>
  <SidebarTreePanel
    title="预设列表"
    :tree-data="treeData"
    :tree-props="treeProps"
    :current-node-key="currentNodeKey"
    :draggable="true"
    :allow-drag="props.dragDropHandlers.allowDrag"
    :allow-drop="props.dragDropHandlers.allowDrop"
    :handle-node-drop="props.dragDropHandlers.handleNodeDrop"
    @node-click="handleNodeClick"
  >
    <template #header-actions>
      <el-tooltip
        content="创建新预设"
        placement="top"
        :show-arrow="false"
        :offset="8"
        :hide-after="0"
      >
        <button
          @click="$emit('create-preset')"
          class="btn-primary-adv sidebar-header-button"
          aria-label="创建新预设"
        >
          <Icon icon="ph:plus-bold" />
        </button>
      </el-tooltip>
      <el-tooltip
        content="新建空白模板"
        placement="top"
        :show-arrow="false"
        :offset="8"
        :hide-after="0"
      >
        <button
          @click="$emit('create-blank')"
          class="btn-secondary-adv sidebar-header-button"
          aria-label="新建空白模板"
        >
          <Icon icon="ph:file-dashed-duotone" />
        </button>
      </el-tooltip>
    </template>

    <template #node="{ node, data }">
      <div
        class="sidebar-tree-node"
        :class="{ 'is-header': data.isHeader, 'is-disabled': data.isPrompt && data.enabled === false }"
      >
        <div class="sidebar-tree-node-main">
          <Icon
            :icon="data.icon"
            class="sidebar-tree-node-icon"
          />
          <span class="sidebar-tree-node-label">{{ node.label }}</span>
        </div>
        <div
          class="sidebar-tree-node-actions"
          v-if="data.isPreset"
        >
          <el-tooltip
            content="新增条目"
            placement="top"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click.stop="$emit('add-prompt', data.id)"
              class="sidebar-tree-node-action-button"
            >
              <Icon icon="ph:plus-circle-duotone" />
            </button>
          </el-tooltip>
          <el-tooltip
            content="重命名"
            placement="top"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click.stop="$emit('rename-preset', data.id)"
              class="sidebar-tree-node-action-button"
            >
              <Icon icon="ph:pencil-simple-duotone" />
            </button>
          </el-tooltip>
          <el-tooltip
            content="删除"
            placement="top"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click.stop="$emit('delete-preset', data.id)"
              class="sidebar-tree-node-action-button is-danger"
            >
              <Icon icon="ph:trash-duotone" />
            </button>
          </el-tooltip>
        </div>
        <div
          class="sidebar-tree-node-actions"
          v-if="data.isPrompt"
        >
          <el-tooltip
            content="复制条目"
            placement="top"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click.stop="$emit('duplicate-prompt', data.presetId, data.promptIndex)"
              class="sidebar-tree-node-action-button"
            >
              <Icon icon="ph:copy-duotone" />
            </button>
          </el-tooltip>
          <el-tooltip
            v-if="!isProtectedPrompt(data.raw)"
            content="删除条目"
            placement="top"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click.stop="$emit('delete-prompt', data.presetId, data.promptIndex)"
              class="sidebar-tree-node-action-button is-danger"
            >
              <Icon icon="ph:trash-duotone" />
            </button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="preset-footer-actions">
        <el-tooltip
          content="导出当前预设"
          placement="top"
          :show-arrow="false"
          :offset="8"
          :hide-after="0"
        >
          <button
            class="btn-success-adv preset-bottom-button-text"
            @click="$emit('export-preset')"
          >
            <Icon
              icon="ph:export-duotone"
              width="16"
              height="16"
              class="preset-button-text-icon"
            />
            <span class="preset-button-text-short">导出</span>
            <span class="preset-button-text-long">导出预设</span>
          </button>
        </el-tooltip>
        <el-tooltip
          content="从文件导入预设"
          placement="top"
          :show-arrow="false"
          :offset="8"
          :hide-after="0"
        >
          <el-upload
            action="#"
            :before-upload="handleImportPreset"
            :show-file-list="false"
            accept=".json"
          >
            <button class="btn-warning-adv preset-bottom-button-text">
              <Icon
                icon="ph:file-text-duotone"
                width="16"
                height="16"
                class="preset-button-text-icon"
              />
              <span class="preset-button-text-short">导入</span>
              <span class="preset-button-text-long">input</span>
            </button>
          </el-upload>
        </el-tooltip>
      </div>
    </template>
  </SidebarTreePanel>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElTooltip, ElUpload } from 'element-plus';
import { Icon } from '@iconify/vue';
import SidebarTreePanel from '../common/SidebarTreePanel.vue';
import type { StoredPresetFile } from '@/database/db';

interface Props {
  presets: StoredPresetFile[];
  activePresetId: string | null;
  selectedPromptIndex: number | null;
  selectedIsHeader: boolean;
  dragDropHandlers: {
    allowDrag: (draggingNode: any) => boolean;
    allowDrop: (draggingNode: any, dropNode: any, type: any) => boolean;
    handleNodeDrop: (draggingNode: any, dropNode: any, type: any) => boolean;
  };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select-preset', id: string): void;
  (e: 'select-header', id: string): void;
  (e: 'select-prompt', presetId: string, promptIndex: number): void;
  (e: 'create-preset'): void;
  (e: 'create-blank'): void;
  (e: 'rename-preset', id: string): void;
  (e: 'delete-preset', id: string): void;
  (e: 'add-prompt', presetId: string): void;
  (e: 'duplicate-prompt', presetId: string, promptIndex: number): void;
  (e: 'delete-prompt', presetId: string, promptIndex: number): void;
  (e: 'import-preset', file: File): void;
  (e: 'export-preset'): void;
}>();

const treeProps = {
  children: 'children',
  label: 'label',
};

const treeData = computed(() => {
  return props.presets
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((preset) => ({
      id: preset.id,
      label: preset.name,
      icon: 'ph:folder-duotone',
      isPreset: true,
      children: [
        {
          id: `${preset.id}-header`,
          label: '头部设置',
          icon: 'ph:sliders-duotone',
          isHeader: true,
          presetId: preset.id,
        },
        ...((preset.data.prompts as Record<string, any>[]) || [])
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
          })
          .map(({ prompt, index }) => ({
            id: `${preset.id}-${prompt.identifier ?? index}`,
            label: prompt.name || prompt.identifier || `条目 ${index + 1}`,
            icon: 'ph:note-duotone',
            isPrompt: true,
            presetId: preset.id,
            promptIndex: index,
            raw: prompt,
            enabled: typeof prompt.enabled === 'boolean' ? prompt.enabled : true,
          })),
      ],
    }));
});

const currentNodeKey = computed(() => {
  if (!props.activePresetId) return undefined;
  if (props.selectedIsHeader) {
    return `${props.activePresetId}-header`;
  }
  if (props.selectedPromptIndex !== null && props.selectedPromptIndex !== undefined) {
    const preset = props.presets.find((p) => p.id === props.activePresetId);
    const prompt = preset?.data?.prompts?.[props.selectedPromptIndex] as Record<string, any> | undefined;
    return `${props.activePresetId}-${prompt?.identifier ?? props.selectedPromptIndex}`;
  }
  return props.activePresetId;
});

const handleNodeClick = (data: any) => {
  if (data.isHeader) {
    emit('select-header', data.presetId);
  } else if (data.isPrompt) {
    emit('select-prompt', data.presetId, data.promptIndex);
  } else {
    emit('select-preset', data.id);
  }
};

const handleImportPreset = (file: File): boolean => {
  emit('import-preset', file);
  return false;
};

const isProtectedPrompt = (prompt: Record<string, any> | undefined) => {
  if (!prompt) return false;
  return Boolean(prompt.system_prompt === true);
};
</script>

<style scoped>
.preset-footer-actions {
  display: flex;
  gap: 8px;
}

.preset-bottom-button-text {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}

.preset-button-text-icon {
  color: inherit;
}

.preset-button-text-short {
  display: none;
}

.preset-button-text-long {
  display: inline;
}

.sidebar-tree-node.is-header .sidebar-tree-node-label {
  font-weight: 500;
  color: var(--el-color-primary);
}

.sidebar-tree-node.is-disabled .sidebar-tree-node-label,
.sidebar-tree-node.is-disabled .sidebar-tree-node-icon {
  color: var(--el-text-color-disabled);
  opacity: 0.65;
}
</style>
