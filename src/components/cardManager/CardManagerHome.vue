<template>
  <div class="card-manager-home">
    <div class="home-header">
      <h2 class="home-title">
        <Icon icon="ph:house-duotone" class="home-title-icon" />
        角色卡导航与管理
      </h2>
      <div class="home-actions">
        <el-button type="primary" size="small" @click="$emit('create-new')">
          <Icon icon="ph:plus-circle-duotone" />
          新建角色
        </el-button>
        <el-button size="small" @click="$emit('trigger-import')">
          <Icon icon="ph:upload-duotone" />
          导入PNG
        </el-button>
        <el-button size="small" @click="$emit('export-all')">
          <Icon icon="ph:export-duotone" />
          导出全部
        </el-button>
        <el-button size="small" type="danger" @click="$emit('clear-all')">
          <Icon icon="ph:trash-duotone" />
          清空库
        </el-button>
      </div>
    </div>

    <div class="home-content">
      <CharacterCardList
        v-if="isMobile"
        :collection="collection"
        :active-card-id="activeCardId"
        :has-current-card="hasCurrentCard"
        @select-card="(id) => $emit('select-card', id)"
        @create-new="$emit('create-new')"
        @save-current="$emit('save-current')"
        @rename-card="(id) => $emit('rename-card', id)"
        @delete-card="(id) => $emit('delete-card', id)"
        @export-card="(id) => $emit('export-card', id)"
        @export-all="$emit('export-all')"
        @import-file="(file) => $emit('import-file', file)"
        @clear-all="$emit('clear-all')"
      />

      <div v-else class="card-grid">
        <div
          v-for="card in sortedCards"
          :key="card.id"
          class="card-tile"
          :class="{ 'is-active': card.id === activeCardId }"
          @click="$emit('select-card', card.id)"
        >
          <div class="tile-header">
            <div class="tile-avatar">
              <img v-if="card.avatar && card.avatar !== 'none'" :src="card.avatar" :alt="card.name" />
              <Icon v-else icon="ph:user-circle-duotone" class="tile-avatar-icon" />
            </div>
            <div class="tile-title">{{ card.name || '未命名角色' }}</div>
          </div>
          <div class="tile-desc">{{ card.description || '暂无描述' }}</div>

          <div v-if="card.tags && card.tags.length" class="tile-tags">
            <el-tag
              v-for="tag in card.tags.slice(0, 3)"
              :key="tag"
              type="info"
              size="small"
              effect="plain"
              class="tile-tag"
            >
              {{ tag }}
            </el-tag>
            <span v-if="card.tags.length > 3" class="tile-tag-more">+{{ card.tags.length - 3 }}</span>
          </div>

          <div class="tile-footer">
            <span class="tile-time">{{ formatTime(card.updatedAt) }}</span>
            <div class="tile-actions" @click.stop>
              <el-tooltip content="重命名" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click="$emit('rename-card', card.id)" class="tile-action-button">
                  <Icon icon="ph:pencil-simple-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="导出" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click="$emit('export-card', card.id)" class="tile-action-button">
                  <Icon icon="ph:export-duotone" />
                </button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click="$emit('delete-card', card.id)" class="tile-action-button is-danger">
                  <Icon icon="ph:trash-duotone" />
                </button>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
      <div v-if="sortedCards.length === 0" class="empty-hint">
        <Icon icon="ph:cards-duotone" class="empty-icon" />
        <p>还没有保存的角色卡，点击“新建角色”开始创建吧</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { ElButton, ElTooltip, ElTag } from 'element-plus';
import CharacterCardList from './CharacterCardList.vue';
import type { CharacterCardCollection } from '@/types/character-card-collection';
import { useDevice } from '@/composables/useDevice';

interface Props {
  collection: CharacterCardCollection;
  activeCardId: string | null;
  hasCurrentCard?: boolean;
}

const props = defineProps<Props>();
defineEmits([
  'trigger-import',
  'create-new',
  'save-current',
  'select-card',
  'rename-card',
  'delete-card',
  'export-card',
  'export-all',
  'import-file',
  'clear-all',
]);

const sortedCards = computed(() => {
  const list = Object.values(props.collection.cards || {});
  const toMs = (v: unknown) => typeof v === 'string' ? Date.parse(v) || 0 : (typeof v === 'number' ? v : 0);
  return list.sort((a: any, b: any) => toMs(b?.updatedAt) - toMs(a?.updatedAt));
});

const { isMobile } = useDevice();

const formatTime = (timestamp?: number | string) => {
  try {
    if (!timestamp) return '未知时间';
    const now = new Date();
    const date = new Date(typeof timestamp === 'string' ? Date.parse(timestamp) : timestamp);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

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
.card-manager-home {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-page);
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
}

.home-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.home-title-icon {
  font-size: 18px;
}

.home-actions { display: flex; gap: 8px; }

.home-content { flex: 1; min-height: 0; overflow: auto; }

.card-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
}

.card-tile {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background-color: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 148px;
}
.card-tile:hover { border-color: var(--el-color-primary); box-shadow: var(--el-box-shadow-lighter); }
.card-tile.is-active { border-color: var(--el-color-primary); background-color: var(--el-color-primary-light-9); }

.tile-header { display: flex; align-items: center; gap: 10px; }
.tile-avatar { width: 42px; height: 42px; border-radius: 8px; overflow: hidden; background: var(--el-fill-color-light); display:flex; align-items:center; justify-content:center; }
.tile-avatar img { width: 100%; height: 100%; object-fit: cover; }
.tile-avatar-icon { font-size: 32px; opacity: 0.6; }
.tile-title { font-weight: 600; color: var(--el-text-color-primary); font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tile-desc { margin-top: 8px; font-size: 13px; color: var(--el-text-color-regular); height: 38px; overflow: hidden; }

.tile-tags { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.tile-tag { }
.tile-tag-more { font-size: 12px; color: var(--el-text-color-secondary); }

.tile-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; }
.tile-time { font-size: 12px; color: var(--el-text-color-secondary); }
.tile-actions { display: flex; gap: 6px; }
.tile-action-button { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; border:1px solid var(--el-border-color-lighter); background: var(--el-bg-color); color: var(--el-text-color-regular); }
.tile-action-button:hover { border-color: var(--el-color-primary); color: var(--el-color-primary); }
.tile-action-button.is-danger:hover { border-color: var(--el-color-danger); color: var(--el-color-danger); }

.empty-hint { padding: 40px 20px; text-align: center; color: var(--el-text-color-secondary); }
.empty-icon { font-size: 48px; margin-bottom: 12px; opacity: 0.6; }
</style>
