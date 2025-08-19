<template>
  <div class="sidebar-container">
    <div class="sidebar-header">
      <h3 class="sidebar-title">角色列表</h3>
      <div>
        <el-tooltip content="从文件导入角色" placement="top">
          <button @click="triggerFileInput" class="btn-primary-adv sidebar-add-button">
            <Icon icon="ph:upload-simple-bold" />
          </button>
        </el-tooltip>
        <el-tooltip content="创建新角色" placement="top">
          <button @click="emit('create')" class="btn-primary-adv sidebar-add-button">
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
      </div>
    </div>
    <el-scrollbar class="sidebar-list-scrollbar">
      <div v-if="characters.length === 0" class="empty-list">
        <el-empty description="没有角色" :image-size="60" />
      </div>
      <ul v-else class="character-list">
        <li
          v-for="character in characters"
          :key="character.id"
          :class="['character-list-item', { 'is-active': character.id === activeCharacterId }]"
          @click="emit('select', character.id!)"
        >
          <span class="character-name">{{ character.chineseName || '未命名角色' }}</span>
          <el-tooltip content="删除角色" placement="top">
            <button
              @click.stop="emit('delete', character.id!)"
              class="delete-button"
            >
              <Icon icon="ph:trash-duotone" />
            </button>
          </el-tooltip>
        </li>
      </ul>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElScrollbar, ElTooltip, ElEmpty } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { CharacterCard } from '../../types/character';

interface Props {
  characters: CharacterCard[];
  activeCharacterId: string | null;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'create'): void;
  (e: 'delete', id: string): void;
  (e: 'import', file: File): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    emit('import', file);
    // Reset file input to allow importing the same file again
    target.value = '';
  }
};
</script>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
  /* width: 280px; Or any width you prefer */
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.sidebar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.sidebar-add-button {
  font-size: 16px;
}

.sidebar-header > div {
  display: flex;
  gap: 4px;
}

.sidebar-list-scrollbar {
  flex-grow: 1;
}

.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--el-text-color-secondary);
}

.character-list {
  list-style: none;
  padding: 8px;
  margin: 0;
}

.character-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-list-item:hover {
  background-color: var(--el-fill-color-light);
}

.character-list-item.is-active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}

.character-name {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-button {
  background: none;
  border: none;
  padding: 4px;
  margin-left: 8px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.character-list-item:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}
</style>