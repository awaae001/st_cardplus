<template>
  <div class="card-worldbook-panel">
    <!-- 提示条 -->
    <div class="panel-notice">
      <Icon icon="ph:info-duotone" />
      <span>正在编辑角色卡「{{ character.name }}」的世界书</span>
    </div>

    <!-- 未绑定世界书的提示 -->
    <div v-if="!hasWorldBook" class="empty-state">
      <el-empty description="当前角色卡未绑定世界书">
        <div class="empty-actions">
          <el-button type="primary" @click="handleCreateNewWorldBook">
            <Icon icon="ph:plus-circle-duotone" />
            创建新世界书
          </el-button>
          <el-button @click="handleBindExistingWorldBook">
            <Icon icon="ph:link-duotone" />
            绑定已有世界书
          </el-button>
        </div>
      </el-empty>
    </div>

    <!-- 世界书编辑器 -->
    <div v-else class="worldbook-editor-wrapper">
      <div class="worldbook-layout">
        <Splitpanes class="default-theme">
          <Pane size="15" min-size="10" max-size="30">
            <WorldBookList
              :collection="mockCollection"
              :active-book-id="mockActiveBookId"
              @select-entry="onListSelectEntry"
              @add-entry="onListAddEntry"
              @duplicate-entry="onListDuplicateEntry"
              @delete-entry="onListDeleteEntry"
              :selected-entry="selectedEntry"
              :drag-drop-handlers="dragDropHandlers"
              :hide-book-selector="true"
            />
          </Pane>
          <Pane size="85" min-size="70">
            <div class="worldbook-editor-panel">
              <div class="content-panel-header">
                <h2 class="content-panel-title">
                  <Icon icon="ph:note-pencil-duotone" class="content-panel-icon" />
                  编辑: <span class="content-panel-text-highlight">{{ selectedEntry ? selectedEntry.comment || "新条目" : "未选择条目" }}</span>
                </h2>
                <div class="editor-actions">
                  <el-tooltip content="保存状态" placement="top">
                    <el-tag :type="saveStatusType" size="small">{{ saveStatusText }}</el-tag>
                  </el-tooltip>
                  <el-button-group size="small">
                    <el-button @click="toggleAutoSaveMode">
                      <Icon :icon="autoSaveMode === 'auto' ? 'ph:floppy-disk-duotone' : 'ph:hand-eye-duotone'" />
                      {{ autoSaveMode === 'auto' ? '自动保存' : '监听模式' }}
                    </el-button>
                    <el-button v-if="selectedEntry" @click="saveCurrentEntry" :disabled="saveStatus === 'saved'">
                      <Icon icon="ph:floppy-disk-duotone" />
                      保存
                    </el-button>
                    <el-button v-if="selectedEntry" type="danger" @click="deleteSelectedEntry">
                      <Icon icon="ph:trash-duotone" />
                      删除
                    </el-button>
                  </el-button-group>
                </div>
              </div>
              <WorldBookEditor
                v-if="selectedEntry"
                :entry="selectedEntry"
                v-model="editableEntry"
                :all-keywords="allKeywords"
                :current-entry-index="currentEntryIndex"
                :total-entries="totalEntries"
                @go-to-previous="goToPreviousEntry"
                @go-to-next="goToNextEntry"
                :is-next-entry-in-different-book="false"
                :is-previous-entry-in-different-book="false"
                :save-status="saveStatus"
              />
              <div v-else class="editor-empty-state">
                <el-empty description="请选择一个条目进行编辑" :image-size="100" />
              </div>
            </div>
          </Pane>
        </Splitpanes>
      </div>
    </div>

    <!-- 世界书选择对话框 -->
    <WorldBookSelectorDialog
      v-model="showWorldBookSelector"
      @confirm="handleBindWorldBook"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElButton, ElEmpty, ElTag, ElTooltip, ElButtonGroup, ElMessage, ElMessageBox } from 'element-plus';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import '../../css/worldbook.css'

import type { CharacterCardV3 } from '@/types/character-card-v3';
import type { WorldBook, WorldBookEntry, WorldBookCollection } from '@/types/types';
import WorldBookEditor from '@/components/worldbook/WorldBookEditor.vue';
import WorldBookList from '@/components/worldbook/WorldBookList.vue';
import WorldBookSelectorDialog from './WorldBookSelectorDialog.vue';
import { worldBookService } from '@/database/worldBookService';
import { useWorldBookEntry } from '@/composables/worldbook/useWorldBookEntry';
import { useWorldBookDragDrop } from '@/composables/worldbook/useWorldBookDragDrop';

interface Props {
  character: CharacterCardV3;
}

interface Emits {
  (e: 'worldbookChanged'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const router = useRouter();

const showWorldBookSelector = ref(false);

// 计算属性：是否有世界书
const hasWorldBook = computed(() => {
  const book = props.character.data.character_book;
  return !!(book && !Array.isArray(book) && book.entries && book.entries.length >= 0);
});

// 将角色卡的 character_book 转换为 WorldBook 格式
const mockActiveBook = computed<WorldBook | null>(() => {
  if (!hasWorldBook.value) return null;

  const book = props.character.data.character_book;
  if (!book || Array.isArray(book)) return null;

  return {
    id: 'character-book',
    name: book.name || `${props.character.name}的世界书`,
    entries: book.entries || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: 0,
  };
});

const mockActiveBookId = 'character-book';

// 创建一个模拟的 collection，只包含当前角色卡的世界书
const mockCollection = computed<WorldBookCollection>(() => {
  if (!mockActiveBook.value) {
    return {
      books: {} as Record<string, WorldBook>,
      activeBookId: null,
    } as WorldBookCollection;
  }

  return {
    books: {
      'character-book': mockActiveBook.value,
    },
    activeBookId: mockActiveBookId,
  };
});

// 使用 useWorldBookEntry 管理条目编辑
const {
  selectedEntry,
  editableEntry,
  // activeTab,
  addNewEntry: addEntry,
  handleSelectEntry: selectEntry,
  saveCurrentEntry: saveEntry,
  deleteSelectedEntry: deleteEntry,
  duplicateEntry: duplicateEntryAction,
  saveStatus,
  autoSaveMode,
  hasUnsavedChanges,
  toggleAutoSaveMode,
} = useWorldBookEntry(mockActiveBook, {
  updateEntries: async (entries: WorldBookEntry[]) => {
    // 更新角色卡的世界书条目
    const book = props.character.data.character_book;
    if (book && !Array.isArray(book)) {
      book.entries = entries;
      emit('worldbookChanged');
    }
  },
  updateEntry: async (entry: WorldBookEntry) => {
    // 更新单个条目
    const book = props.character.data.character_book;
    if (book && !Array.isArray(book) && book.entries) {
      const index = book.entries.findIndex(e => e.uid === entry.uid);
      if (index !== -1) {
        book.entries[index] = entry;
        emit('worldbookChanged');
      }
    }
  },
  addEntry: async (entry: WorldBookEntry) => {
    // 添加新条目
    const book = props.character.data.character_book;
    if (book && !Array.isArray(book)) {
      if (!book.entries) book.entries = [];
      book.entries.push(entry);
      emit('worldbookChanged');
      return entry;
    }
    return null;
  },
  deleteEntry: async (entryId: number) => {
    // 删除条目
    const book = props.character.data.character_book;
    if (book && !Array.isArray(book) && book.entries) {
      const index = book.entries.findIndex(e => e.uid === entryId);
      if (index !== -1) {
        book.entries.splice(index, 1);
        emit('worldbookChanged');
        return true;
      }
    }
    return false;
  },
});

// 拖拽功能（仅针对当前角色的内嵌世界书）
const dragDropHandlers = useWorldBookDragDrop(
  mockCollection as any,
  // moveEntryBetweenBooks
  (
    _entryToMove: WorldBookEntry,
    _fromBookId: string,
    _toBookId: string,
    _insertIndex: number
  ) => {
    // 只有一个世界书，不支持跨书移动
    return;
  },
  // updateBookEntries
  (bookId: string, entries: WorldBookEntry[]) => {
    const book = props.character.data.character_book;
    if (book && !Array.isArray(book)) {
      book.entries = entries;
      emit('worldbookChanged');
    }
  },
  // updateBookOrder（无实际作用，单本书）
  (_orderedBookIds: string[]) => {
    // no-op
  },
  // forceUpdateEntries（单本书无需额外强刷）
  () => {
    // no-op
  }
);

// 计算属性
const allKeywords = computed(() => {
  if (!mockActiveBook.value) return [];
  const keywords = new Set<string>();
  mockActiveBook.value.entries.forEach(entry => {
    entry.key.forEach(k => keywords.add(k));
    entry.keysecondary.forEach(k => keywords.add(k));
  });
  return Array.from(keywords);
});

const currentEntryIndex = computed(() => {
  if (!mockActiveBook.value || !selectedEntry.value) return -1;
  return mockActiveBook.value.entries.findIndex(e => e.uid === selectedEntry.value!.uid);
});

const totalEntries = computed(() => {
  return mockActiveBook.value?.entries.length || 0;
});

const saveStatusType = computed(() => {
  // 未保存时给出提示色
  if (hasUnsavedChanges.value) return 'danger';
  switch (saveStatus.value) {
    case 'saved': return 'success';
    case 'saving': return 'warning';
    case 'error': return 'danger';
    default: return 'info';
  }
});

const saveStatusText = computed(() => {
  if (hasUnsavedChanges.value) return '未保存';
  switch (saveStatus.value) {
    case 'saved': return '已保存';
    case 'saving': return '保存中...';
    case 'error': return '保存失败';
    default: return '空闲';
  }
});

// 方法
const addNewEntry = () => {
  addEntry();
};

const onListAddEntry = (_bookId: string) => {
  addEntry();
};

// WorldBookList 事件适配：入参为 (bookId, entryIndex)
const onListSelectEntry = (_bookId: string, entryIndex: number) => {
  selectEntry(String(entryIndex));
};

const saveCurrentEntry = () => {
  saveEntry();
};

const deleteSelectedEntry = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个条目吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await deleteEntry();
  } catch {
    // 用户取消
  }
};

const onListDuplicateEntry = (_bookId: string, entryIndex: number) => {
  duplicateEntryAction(entryIndex);
};

const onListDeleteEntry = async (_bookId: string, entryIndex: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个条目吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    selectEntry(String(entryIndex));
    await deleteEntry();
  } catch {
    // 用户取消
  }
};

const goToPreviousEntry = () => {
  if (currentEntryIndex.value > 0 && mockActiveBook.value) {
    const prevIndex = currentEntryIndex.value - 1;
    selectEntry(String(prevIndex));
  }
};

const goToNextEntry = () => {
  if (mockActiveBook.value && currentEntryIndex.value < mockActiveBook.value.entries.length - 1) {
    const nextIndex = currentEntryIndex.value + 1;
    selectEntry(String(nextIndex));
  }
};

const handleCreateNewWorldBook = () => {
  props.character.data.character_book = {
    name: `${props.character.name}的世界书`,
    entries: [],
  };
  emit('worldbookChanged');
  ElMessage.success('已创建新世界书');
};

const handleBindExistingWorldBook = () => {
  showWorldBookSelector.value = true;
};

const handleBindWorldBook = async (bookId: string) => {
  try {
    const collection = await worldBookService.getFullWorldBookCollection();
    const book = collection.books[bookId];
    if (book) {
      props.character.data.character_book = {
        name: book.name,
        entries: book.entries,
      };
      emit('worldbookChanged');
      ElMessage.success(`已绑定世界书: ${book.name}`);
    } else {
      ElMessage.error('未找到选中的世界书');
    }
  } catch (error) {
    console.error('绑定世界书失败:', error);
    ElMessage.error('绑定世界书失败');
  }
};

const handleOpenInEditor = () => {
  router.push('/worldbook');
};
</script>

<style scoped>
.card-worldbook-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.panel-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-color-primary-light-7);
  color: var(--el-color-primary);
  font-size: 14px;
  flex-shrink: 0;
}

.panel-notice .iconify {
  font-size: 18px;
}

.panel-notice span {
  flex: 1;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.worldbook-editor-wrapper {
  flex: 1;
  /* overflow: hidden; */
}

.worldbook-layout {
  height: 100%;
}

.worldbook-editor-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-extra-light);
  flex-shrink: 0;
}

.content-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.content-panel-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

.content-panel-text-highlight {
  color: var(--el-color-primary);
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
