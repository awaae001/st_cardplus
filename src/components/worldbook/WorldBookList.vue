<template>
  <div class="worldbook-list-container">
    <div class="worldbook-list-header">
      <h3 class="worldbook-list-title">我的世界书</h3>
      <el-tooltip content="创建新世界书" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="emit('create-book')" class="btn-primary-adv worldbook-list-add-button" aria-label="创建新世界书">
          <Icon icon="ph:plus-bold" class="worldbook-list-add-icon" />
        </button>
      </el-tooltip>
    </div>
    <el-scrollbar class="worldbook-list-scrollbar">
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
        class="worldbook-tree"
        :expand-on-click-node="false"
        draggable
        :allow-drag="props.dragDropHandlers.allowDrag"
        :allow-drop="props.dragDropHandlers.allowDrop"
        @node-drop="onNodeDrop"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node" :class="{ 'is-disabled': data.isEntry && data.raw.disable }">
            <div class="node-main">
              <Icon :icon="data.icon" class="node-icon" />
              <el-tag v-if="data.isEntry && data.raw.constant" type="success" size="small" effect="dark" class="node-tag">常驻</el-tag>
              <span class="node-label">{{ node.label }}</span>
            </div>
            <div class="node-actions" v-if="!data.isEntry">
              <el-tooltip content="新增条目" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('add-entry', data.id)" class="worldbook-item-action-button">
                  <Icon icon="ph:plus-circle-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="重命名" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('rename-book', data.id)" class="worldbook-item-action-button">
                  <Icon icon="ph:pencil-simple-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('delete-book', data.id)" class="worldbook-item-action-button is-danger">
                  <Icon icon="ph:trash-duotone" />
                </button>
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>
    <div class="worldbook-list-footer">
      <WorldBookActions
        context="list"
        @copy-book="$emit('copy-book')"
        @import-book="$emit('import-book')"
        @export-json="$emit('export-json')"
        @import-json="(file) => $emit('import-json', file)"
        @import-book-file="(file) => $emit('import-book-file', file)"
        @clear-all="$emit('clear-all')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import { ElScrollbar, ElTooltip, ElTree, ElTag } from 'element-plus';
import { Icon } from '@iconify/vue';
import WorldBookActions from './WorldBookActions.vue';
import type { WorldBookCollection, WorldBookEntry } from './types';

interface Props {
  collection: WorldBookCollection;
  activeBookId: string | null;
  selectedEntry: WorldBookEntry | null;
  dragDropHandlers: {
    allowDrag: (draggingNode: any) => boolean;
    allowDrop: (draggingNode: any, dropNode: any, type: any) => boolean;
    handleNodeDrop: (draggingNode: any, dropNode: any, type: any) => boolean;
  };
}

const props = defineProps<Props>();

const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
const treeKey = ref(0);
const expandedKeys = ref<string[]>([]);

const onNodeDrop = async (draggingNode: any, dropNode: any, dropType: any) => {
  // 1. Store currently expanded keys
  if (treeRef.value) {
    // The `nodesMap` is likely an object used as a map { [key]: node }.
    // `Object.values` is the correct way to get an array of the node objects.
    const nodes = Object.values(treeRef.value.store.nodesMap);
    expandedKeys.value = nodes
      .filter((node: any) => node.expanded)
      .map((node: any) => node.key);
  }

  const success = props.dragDropHandlers.handleNodeDrop(draggingNode, dropNode, dropType);

  if (success) {
    // 2. Force re-render
    treeKey.value++;
    // 3. Restore expanded keys after re-render
    await nextTick();
    // Re-assign to ensure reactivity, though it should be restored by :default-expanded-keys
    // This is a safeguard.
    if (treeRef.value) {
      treeRef.value.store.setDefaultExpandedKeys(expandedKeys.value);
    }
  }
};

const emit = defineEmits<{
  (e: 'select-book', id: string): void;
  (e: 'select-entry', bookId: string, entryIndex: number): void;
  (e: 'create-book'): void;
  (e: 'rename-book', id: string): void;
  (e: 'delete-book', id: string): void;
  (e: 'add-entry', bookId: string): void;
  (e: 'copy-book'): void;
  (e: 'import-book'): void;
  (e: 'export-json'): void;
  (e: 'import-json', file: File): void;
  (e: 'import-book-file', file: File): void;
  (e: 'clear-all'): void;
}>();

const treeProps = {
  children: 'children',
  label: 'label',
};

const treeData = computed(() => {
  return Object.values(props.collection.books)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(book => ({
      id: book.id,
      label: book.name,
      icon: 'ph:book-duotone',
      isEntry: false,
      raw: book,
      children: book.entries.map((entry, index) => ({
        id: `${book.id}-${entry.uid}`,
        label: entry.comment || `条目 ${index + 1}`,
        icon: 'ph:note-duotone',
        isEntry: true,
        bookId: book.id,
        entryIndex: index,
        raw: entry,
      })),
    }));
});

const currentNodeKey = computed(() => {
  if (props.selectedEntry && props.activeBookId) {
    return `${props.activeBookId}-${props.selectedEntry.uid}`;
  }
  return props.activeBookId ?? undefined;
});

const handleNodeClick = (data: any) => {
  if (data.isEntry) {
    emit('select-entry', data.bookId, data.entryIndex);
  } else {
    emit('select-book', data.id);
  }
};
</script>

<style scoped>
.worldbook-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
}

.worldbook-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.worldbook-list-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.worldbook-list-add-button {
  width: 28px;
  height: 28px;
  font-size: 16px;
}

.worldbook-list-scrollbar {
  flex-grow: 1;
}

.worldbook-list-footer {
  padding: 8px;
  border-top: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.worldbook-tree {
  background-color: transparent;
  padding: 8px;
}

.worldbook-tree :deep(.el-tree-node__content) {
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

.node-tag {
  margin-right: 8px;
  flex-shrink: 0;
}

.custom-tree-node.is-disabled {
  color: var(--el-text-color-disabled);
  cursor: not-allowed;
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

.worldbook-item-action-button {
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

.worldbook-item-action-button:hover {
  background-color: var(--el-fill-color);
  color: var(--el-text-color-primary);
}

.worldbook-item-action-button.is-danger:hover {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}
</style>