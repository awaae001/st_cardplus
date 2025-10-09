<template>
  <div class="regex-script-list-container">
    <div class="regex-script-list-header">
      <h3 class="regex-script-list-title">我的正则脚本</h3>
      <el-tooltip content="创建新脚本" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="emit('create-script')" class="btn-primary-adv regex-script-list-add-button" aria-label="创建新脚本">
          <Icon icon="ph:plus-bold" class="regex-script-list-add-icon" />
        </button>
      </el-tooltip>
    </div>
    <el-scrollbar class="regex-script-list-scrollbar">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        node-key="id"
        :current-node-key="currentNodeKey"
        highlight-current
        @node-click="handleNodeClick"
        class="regex-script-tree"
        :expand-on-click-node="true"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <div class="node-main">
              <Icon :icon="data.icon" class="node-icon" />
              <span class="node-label">{{ node.label }}</span>
            </div>
            <div class="node-actions">
              <el-tooltip content="导出" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('export-script', data.id)" class="script-item-action-button">
                  <Icon icon="ph:export-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="重命名" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('rename-script', data.id)" class="script-item-action-button">
                  <Icon icon="ph:pencil-simple-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('delete-script', data.id)" class="script-item-action-button is-danger">
                  <Icon icon="ph:trash-duotone" />
                </button>
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElScrollbar, ElTooltip, ElTree } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { SillyTavernRegexScript } from '@/composables/regex/types';

const props = defineProps<{
  scripts: SillyTavernRegexScript[];
  modelValue: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', id: string): void;
  (e: 'create-script'): void;
  (e: 'export-script', id: string): void;
  (e: 'rename-script', id: string): void;
  (e: 'delete-script', id: string): void;
}>();

const treeRef = ref<InstanceType<typeof ElTree> | null>(null);

const treeProps = {
  label: 'scriptName',
};

const treeData = computed(() => {
  return props.scripts.map(script => ({
    ...script,
    icon: 'ph:file-code-duotone',
  }));
});

const currentNodeKey = computed(() => props.modelValue ?? undefined);

const handleNodeClick = (data: SillyTavernRegexScript) => {
  emit('update:modelValue', data.id);
};
</script>

<style scoped>
.regex-script-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
}

.regex-script-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.regex-script-list-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.regex-script-list-add-button {
  font-size: 16px;
}

.regex-script-list-scrollbar {
  flex-grow: 1;
}

.regex-script-tree {
  background-color: transparent;
  padding: 8px;
}

.regex-script-tree :deep(.el-tree-node__content) {
  padding: 4px 0;
  height: auto;
  min-height: 32px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
}

.node-main {
  display: flex;
  align-items: center;
  overflow: hidden;
}

.node-icon {
  font-size: 16px;
  margin-right: 8px;
  flex-shrink: 0;
}

.node-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.node-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.el-tree-node__content:hover .node-actions {
  opacity: 1;
}

.script-item-action-button {
  background: none;
  border: none;
  padding: 4px;
  margin-left: 4px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.script-item-action-button:hover {
  background-color: var(--el-fill-color);
  color: var(--el-text-color-primary);
}

.script-item-action-button.is-danger:hover {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}
</style>