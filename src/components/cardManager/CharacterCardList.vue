<template>
  <div class="character-card-list-container">
    <div class="character-card-list-header">
      <h3 class="character-card-list-title">我的角色卡</h3>
      <div class="character-card-list-actions">
        <el-tooltip content="创建新角色卡" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
          <button @click="emit('create-new')" class="btn-success-adv character-card-list-add-button" aria-label="创建新角色卡">
            <Icon icon="ph:plus-circle-duotone" class="character-card-list-add-icon" />
          </button>
        </el-tooltip>
        <el-tooltip content="保存当前角色卡" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
          <button @click="emit('save-current')" class="btn-primary-adv character-card-list-add-button" aria-label="保存当前角色卡" :disabled="!hasCurrentCard">
            <Icon icon="ph:floppy-disk-duotone" class="character-card-list-add-icon" />
          </button>
        </el-tooltip>
      </div>
    </div>
    <el-scrollbar class="character-card-list-scrollbar">
      <div class="character-card-list-content">
        <div v-if="Object.keys(collection.cards).length === 0" class="character-card-list-empty">
          <Icon icon="ph:cards-duotone" class="character-card-list-empty-icon" />
          <p class="character-card-list-empty-text">还没有保存的角色卡</p>
          <p class="character-card-list-empty-hint">点击上方按钮保存当前角色卡</p>
        </div>
        <div v-else class="character-card-list-items">
          <div
            v-for="card in sortedCards"
            :key="card.id"
            class="character-card-item"
            :class="{ 'is-active': card.id === activeCardId }"
            @click="handleCardClick(card.id)"
          >
            <div class="card-item-main">
              <div class="card-item-avatar">
                <img v-if="card.avatar && card.avatar !== 'none'" :src="card.avatar" :alt="card.name" class="card-item-avatar-img" />
                <Icon v-else icon="ph:user-circle-duotone" class="card-item-avatar-icon" />
              </div>
              <div class="card-item-info">
                <div class="card-item-name">{{ card.name || '未命名角色' }}</div>
                <div class="card-item-description">{{ card.description || '暂无描述' }}</div>
                <div class="card-item-meta">
                  <span class="card-item-time">{{ formatTime(card.updatedAt) }}</span>
                  <div v-if="card.tags && card.tags.length > 0" class="card-item-tags">
                    <el-tag
                      v-for="tag in card.tags.slice(0, 2)"
                      :key="tag"
                      type="info"
                      size="small"
                      effect="plain"
                      class="card-item-tag"
                    >
                      {{ tag }}
                    </el-tag>
                    <span v-if="card.tags.length > 2" class="card-item-tag-more">+{{ card.tags.length - 2 }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-item-actions">
              <el-tooltip content="重命名" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('rename-card', card.id)" class="character-card-action-button">
                  <Icon icon="ph:pencil-simple-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="导出" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('export-card', card.id)" class="character-card-action-button">
                  <Icon icon="ph:export-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="emit('delete-card', card.id)" class="character-card-action-button is-danger">
                  <Icon icon="ph:trash-duotone" />
                </button>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <div class="character-card-list-footer">
      <CharacterCardActions
        context="list"
        @export-all="$emit('export-all')"
        @import-file="(file: File) => $emit('import-file', file)"
        @clear-all="$emit('clear-all')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElScrollbar, ElTooltip, ElTag } from 'element-plus';
import { Icon } from '@iconify/vue';
import CharacterCardActions from './components/CharacterCardActions.vue';
import type { CharacterCardCollection } from '@/types/character-card-collection';

interface Props {
  collection: CharacterCardCollection;
  activeCardId: string | null;
  hasCurrentCard?: boolean; // 是否有当前正在编辑的角色卡
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select-card', cardId: string): void;
  (e: 'create-new'): void;
  (e: 'save-current'): void;
  (e: 'rename-card', cardId: string): void;
  (e: 'delete-card', cardId: string): void;
  (e: 'export-card', cardId: string): void;
  (e: 'export-all'): void;
  (e: 'import-file', file: File): void;
  (e: 'clear-all'): void;
}>();

const sortedCards = computed(() => {
  return Object.values(props.collection.cards)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

const handleCardClick = (cardId: string) => {
  emit('select-card', cardId);
};

const formatTime = (timeStr: string) => {
  try {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString();
    }
  } catch {
    return '未知时间';
  }
};
</script>

<style scoped>
.character-card-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-page);
  border-right: 1px solid var(--el-border-color-light);
}

.character-card-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.character-card-list-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.character-card-list-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.character-card-list-add-button {
  font-size: 16px;
}

.character-card-list-scrollbar {
  flex-grow: 1;
}

.character-card-list-content {
  padding: 8px;
}

.character-card-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--el-text-color-secondary);
}

.character-card-list-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.character-card-list-empty-text {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.character-card-list-empty-hint {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.character-card-list-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.character-card-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background-color: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.character-card-item:hover {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.character-card-item.is-active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-8);
}

.card-item-main {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.card-item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
  background-color: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-item-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-item-avatar-icon {
  font-size: 24px;
  color: var(--el-text-color-placeholder);
}

.card-item-info {
  flex: 1;
  min-width: 0;
}

.card-item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.card-item-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}

.card-item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-item-time {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.card-item-tags {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.card-item-tag {
  font-size: 10px;
  height: 18px;
  padding: 0 6px;
  line-height: 18px;
}

.card-item-tag-more {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
}

.card-item-actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-left: 8px;
}

.character-card-item:hover .card-item-actions {
  opacity: 1;
}

.character-card-action-button {
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
  transition: all 0.2s ease;
}

.character-card-action-button:hover {
  background-color: var(--el-fill-color);
  color: var(--el-text-color-primary);
}

.character-card-action-button.is-danger:hover {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.character-card-list-footer {
  padding: 8px;
  border-top: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}
</style>