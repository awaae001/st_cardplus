<template>
  <SidebarTreePanel
    title="角色列表"
    :tree-data="treeData"
    :tree-props="treeProps"
    :current-node-key="activeCharacterId ?? undefined"
    :draggable="true"
    :allow-drag="allowDrag"
    :allow-drop="allowDrop"
    :handle-node-drop="handleNodeDrop"
    @node-click="handleNodeClick"
  >
    <template #header-actions>
      <el-tooltip
        content="从文件导入角色"
        placement="top"
      >
        <button
          @click="triggerFileInput"
          class="btn-primary-adv sidebar-header-button"
        >
          <Icon icon="ph:upload-simple-bold" />
        </button>
      </el-tooltip>
      <el-tooltip
        content="创建新角色"
        placement="top"
      >
        <button
          @click="emit('create')"
          class="btn-primary-adv sidebar-header-button"
        >
          <Icon icon="ph:plus-bold" />
        </button>
      </el-tooltip>
      <input
        type="file"
        ref="fileInput"
        @change="handleFileImport"
        style="display: none"
        accept=".json"
      />
    </template>

    <template #node="{ node, data }">
      <div class="sidebar-tree-node">
        <div class="sidebar-tree-node-main">
          <Icon
            icon="ph:user-circle-duotone"
            class="sidebar-tree-node-icon"
          />
          <span class="sidebar-tree-node-label">{{ node.label }}</span>
        </div>
        <div class="sidebar-tree-node-star">
          <el-tooltip
            :content="data.raw.starred ? '取消星标' : '设为星标'"
            placement="top"
          >
            <button
              @click.stop="emit('toggle-star', data.id, !data.raw.starred)"
              class="sidebar-tree-node-action-button"
              :class="{ 'is-active': data.raw.starred }"
            >
              <Icon :icon="data.raw.starred ? 'ph:star-fill' : 'ph:star'" />
            </button>
          </el-tooltip>
        </div>
        <div class="sidebar-tree-node-actions">
          <el-tooltip
            content="删除角色"
            placement="top"
          >
            <button
              @click.stop="emit('delete', data.id)"
              class="sidebar-tree-node-action-button is-danger"
            >
              <Icon icon="ph:trash-duotone" />
            </button>
          </el-tooltip>
        </div>
      </div>
    </template>
  </SidebarTreePanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElTooltip } from 'element-plus';
import { Icon } from '@iconify/vue';
import SidebarTreePanel from '../common/SidebarTreePanel.vue';
import type { CharacterCard } from '../../types/character';

interface Props {
  characters: CharacterCard[];
  activeCharacterId: string | null;
}

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'create'): void;
  (e: 'delete', id: string): void;
  (e: 'import', file: File): void;
  (e: 'reorder', orderedIds: string[]): void;
  (e: 'toggle-star', id: string, starred: boolean): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const props = defineProps<Props>();

const treeProps = {
  children: 'children',
  label: 'label',
};

const treeData = computed(() => {
  return props.characters
    .filter((character) => !!character.id)
    .map((character) => ({
      id: character.id as string,
      label: character.chineseName || '未命名角色',
      raw: character,
    }));
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    emit('import', file);
    target.value = '';
  }
};

const allowDrag = (draggingNode: any) => {
  return !!draggingNode?.data?.id;
};

const allowDrop = (draggingNode: any, dropNode: any, type: any) => {
  if (!draggingNode?.data || !dropNode?.data) return false;
  if (type === 'inner') return false;
  return Boolean(draggingNode.data.raw?.starred) === Boolean(dropNode.data.raw?.starred);
};

const handleNodeDrop = (draggingNode: any, dropNode: any, type: any) => {
  if (!draggingNode?.data || !dropNode?.data) return false;
  if (type === 'inner') return false;

  const draggingId = draggingNode.data.id as string | undefined;
  const dropId = dropNode.data.id as string | undefined;
  if (!draggingId || !dropId) return false;

  const currentIds = props.characters.map((character) => character.id).filter((id): id is string => !!id);

  const fromIndex = currentIds.indexOf(draggingId);
  const toIndex = currentIds.indexOf(dropId);
  if (fromIndex === -1 || toIndex === -1) return false;

  currentIds.splice(fromIndex, 1);
  const normalizedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
  const insertIndex = type === 'prev' ? normalizedToIndex : normalizedToIndex + 1;
  currentIds.splice(insertIndex, 0, draggingId);

  emit('reorder', currentIds);
  return true;
};

const handleNodeClick = (data: any) => {
  if (data?.id) {
    emit('select', data.id);
  }
};
</script>

<style scoped>
.sidebar-tree-node-star {
  display: flex;
  align-items: center;
  margin-right: 4px;
}

.sidebar-tree-node-action-button.is-active {
  color: var(--el-color-warning);
}
</style>
