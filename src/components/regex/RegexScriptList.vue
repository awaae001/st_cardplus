<template>
  <div class="regex-script-list-container">
    <div class="regex-script-list-header">
      <h3 class="regex-script-list-title">正则脚本库</h3>
      <el-tooltip content="创建新类别" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="emit('create-category')" class="btn-primary-adv regex-script-list-add-button" aria-label="创建新类别">
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
        :key="treeKey"
        :default-expanded-keys="expandedKeys"
        :current-node-key="currentNodeKey"
        highlight-current
        @node-click="handleNodeClick"
        class="regex-script-tree"
        :expand-on-click-node="false"
        draggable
        :allow-drag="props.dragDropHandlers.allowDrag"
        :allow-drop="props.dragDropHandlers.allowDrop"
        @node-drop="onNodeDrop"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node" :class="{ 'is-disabled': data.isScript && data.raw.disabled }">
            <div class="node-main">
              <Icon :icon="data.icon" class="node-icon" />
              <span class="node-label">{{ node.label }}</span>
            </div>
            <div class="node-actions" v-if="!data.isScript">
              <el-tooltip content="新增脚本" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('add-script', data.id)" class="script-item-action-button">
                  <Icon icon="ph:plus-circle-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="重命名" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('rename-category', data.id)" class="script-item-action-button">
                  <Icon icon="ph:pencil-simple-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('delete-category', data.id)" class="script-item-action-button is-danger">
                  <Icon icon="ph:trash-duotone" />
                </button>
              </el-tooltip>
            </div>
            <div class="node-actions" v-else>
              <el-tooltip content="导出" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('export-script', data.scriptId)" class="script-item-action-button">
                  <Icon icon="ph:export-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="重命名" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('rename-script', data.scriptId)" class="script-item-action-button">
                  <Icon icon="ph:pencil-simple-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('delete-script', data.scriptId)" class="script-item-action-button is-danger">
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
import { computed, ref, nextTick, watch } from 'vue';
import { ElScrollbar, ElTooltip, ElTree } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { RegexScriptCollection, SillyTavernRegexScript } from '@/composables/regex/types';

interface Props {
  collection: RegexScriptCollection;
  activeCategoryId: string | null;
  selectedScript: SillyTavernRegexScript | null;
  dragDropHandlers: {
    allowDrag: (draggingNode: any) => boolean;
    allowDrop: (draggingNode: any, dropNode: any, type: any) => boolean;
    handleNodeDrop: (draggingNode: any, dropNode: any, type: any) => boolean;
  };
}

const props = withDefaults(defineProps<Props>(), {});

const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
const treeKey = ref(0);
const expandedKeys = ref<string[]>([]);

// 监听 collection 变化，初始化时展开第一个分类
watch(
  () => props.collection.categories,
  (categories) => {
    if (expandedKeys.value.length === 0 && Object.keys(categories).length > 0) {
      const firstCategory = Object.values(categories)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
      
      if (firstCategory) {
        nextTick(() => {
          expandedKeys.value = [firstCategory.id];
        });
      }
    }
  },
  { immediate: true }
);

const onNodeDrop = async (draggingNode: any, dropNode: any, dropType: any) => {
  // Store currently expanded keys
  if (treeRef.value) {
    const nodes = Object.values(treeRef.value.store.nodesMap);
    expandedKeys.value = nodes
      .filter((node: any) => node.expanded)
      .map((node: any) => node.key);
  }

  const success = props.dragDropHandlers.handleNodeDrop(draggingNode, dropNode, dropType);

  if (success) {
    // Force re-render
    treeKey.value++;
    // Restore expanded keys after re-render
    await nextTick();
    if (treeRef.value) {
      treeRef.value.store.setDefaultExpandedKeys(expandedKeys.value);
    }
  }
};

const emit = defineEmits<{
  (e: 'select-category', id: string): void;
  (e: 'select-script', categoryId: string, scriptIndex: number): void;
  (e: 'create-category'): void;
  (e: 'rename-category', id: string): void;
  (e: 'delete-category', id: string): void;
  (e: 'add-script', categoryId: string): void;
  (e: 'export-script', id: string): void;
  (e: 'rename-script', id: string): void;
  (e: 'delete-script', id: string): void;
}>();

const treeProps = {
  children: 'children',
  label: 'label',
};

const treeData = computed(() => {
  return Object.values(props.collection.categories)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(category => ({
      id: category.id,
      label: category.name,
      icon: 'ph:folder-duotone',
      isScript: false,
      raw: category,
      children: category.scripts.map((script, index) => ({
        id: `${category.id}-${script.id}`,
        label: script.scriptName,
        icon: 'ph:file-code-duotone',
        isScript: true,
        categoryId: category.id,
        scriptIndex: index,
        scriptId: script.id,
        raw: script,
      })),
    }));
});

const currentNodeKey = computed(() => {
  if (props.selectedScript && props.activeCategoryId) {
    return `${props.activeCategoryId}-${props.selectedScript.id}`;
  }
  return props.activeCategoryId ?? undefined;
});

const handleNodeClick = (data: any) => {
  if (data.isScript) {
    emit('select-script', data.categoryId, data.scriptIndex);
  } else {
    emit('select-category', data.id);
  }
};

const handleNodeExpand = (data: any) => {
  if (data.id && !expandedKeys.value.includes(data.id)) {
    expandedKeys.value.push(data.id);
  }
};

const handleNodeCollapse = (data: any) => {
  if (data.id) {
    const index = expandedKeys.value.indexOf(data.id);
    if (index > -1) {
      expandedKeys.value.splice(index, 1);
    }
  }
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