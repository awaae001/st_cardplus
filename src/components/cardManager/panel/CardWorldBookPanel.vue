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
        <template #description>
          <div class="empty-description">
            <p>当前角色卡未绑定世界书</p>
            <p class="empty-hint">
              「创建」将为角色卡创建一个全新的空世界书；<br>
              「绑定」将从世界书数据库中选择一个现有世界书复制到角色卡中
            </p>
          </div>
        </template>
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
      <!-- 桌面端：分栏布局 -->
      <div class="worldbook-layout worldbook-layout-desktop">
        <Splitpanes class="default-theme">
          <Pane size="15" min-size="10" max-size="30">
            <WorldBookList :collection="mockCollection" :active-book-id="mockActiveBookId"
              @select-entry="onListSelectEntry" @add-entry="onListAddEntry" @duplicate-entry="onListDuplicateEntry"
              @delete-entry="onListDeleteEntry" :selected-entry="selectedEntry" :drag-drop-handlers="dragDropHandlers"
              :hide-book-selector="true" />
          </Pane>
          <Pane size="85" min-size="70">
            <div class="worldbook-editor-panel">
              <div class="content-panel-header">
                <h2 class="content-panel-title">
                  <Icon icon="ph:note-pencil-duotone" class="content-panel-icon" />
                  编辑: <span class="content-panel-text-highlight">{{ selectedEntry ? selectedEntry.comment || "新条目" :
                    "未选择条目"
                    }}</span>
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
              <div class="worldbook-editor-container">
                <WorldBookEditor v-if="selectedEntry" :entry="selectedEntry" v-model="editableEntry"
                  :all-keywords="allKeywords" :current-entry-index="currentEntryIndex" :total-entries="totalEntries"
                  @go-to-previous="goToPreviousEntry" @go-to-next="goToNextEntry"
                  :is-next-entry-in-different-book="false" :is-previous-entry-in-different-book="false"
                  :save-status="saveStatus" />
                <div v-else class="editor-empty-state">
                  <el-empty description="请选择一个条目进行编辑" :image-size="100" />
                </div>
              </div>
            </div>
          </Pane>
        </Splitpanes>
      </div>

      <!-- 移动端：标签页布局 -->
      <div class="worldbook-layout worldbook-layout-mobile">
        <el-tabs v-model="mobileActiveTab" type="border-card" class="worldbook-mobile-tabs">
          <el-tab-pane name="list" label="条目列表">
            <WorldBookList :collection="mockCollection" :active-book-id="mockActiveBookId"
              @select-entry="handleMobileSelectEntry" @add-entry="onListAddEntry"
              @duplicate-entry="onListDuplicateEntry" @delete-entry="onListDeleteEntry" :selected-entry="selectedEntry"
              :drag-drop-handlers="dragDropHandlers" :hide-book-selector="true" />
          </el-tab-pane>
          <el-tab-pane name="editor" :label="selectedEntry ? (selectedEntry.comment || '新条目') : '编辑器'">
            <div class="worldbook-editor-panel-mobile">
              <div class="content-panel-header-mobile">
                <h2 class="content-panel-title-mobile">
                  <Icon icon="ph:note-pencil-duotone" class="content-panel-icon" />
                  {{ selectedEntry ? selectedEntry.comment || "新条目" : "未选择条目" }}
                </h2>
                <div class="editor-actions-mobile">
                  <el-tag :type="saveStatusType" size="small">{{ saveStatusText }}</el-tag>
                  <el-dropdown @command="handleMobileActionCommand">
                    <el-button size="small">
                      <Icon icon="ph:dots-three-vertical-duotone" />
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="toggleAutoSave">
                          <Icon :icon="autoSaveMode === 'auto' ? 'ph:floppy-disk-duotone' : 'ph:hand-eye-duotone'" />
                          {{ autoSaveMode === 'auto' ? '自动保存' : '监听模式' }}
                        </el-dropdown-item>
                        <el-dropdown-item v-if="selectedEntry" command="save" :disabled="saveStatus === 'saved'">
                          <Icon icon="ph:floppy-disk-duotone" />
                          保存
                        </el-dropdown-item>
                        <el-dropdown-item v-if="selectedEntry" command="delete" divided>
                          <Icon icon="ph:trash-duotone" />
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
              <div class="worldbook-editor-container">
                <WorldBookEditor v-if="selectedEntry" :entry="selectedEntry" v-model="editableEntry"
                  :all-keywords="allKeywords" :current-entry-index="currentEntryIndex" :total-entries="totalEntries"
                  @go-to-previous="goToPreviousEntry" @go-to-next="goToNextEntry"
                  :is-next-entry-in-different-book="false" :is-previous-entry-in-different-book="false"
                  :save-status="saveStatus" />
                <div v-else class="editor-empty-state">
                  <el-empty description="请从左侧选择一个条目进行编辑" :image-size="80" />
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 世界书选择对话框 -->
    <WorldBookSelectorDialog v-model="showWorldBookSelector" @confirm="handleBindWorldBook" />

    <!-- 世界书选择对话框 (用于替换) -->
    <WorldBookSelectorDialog v-model="showReplaceWorldBookSelector" @confirm="handleConfirmReplace" />

    <!-- 确认对话框 -->
    <ConfirmDialog ref="confirmDialogRef" :title="confirmConfig.title" :message="confirmConfig.message"
      :type="confirmConfig.type" :confirm-text="confirmConfig.confirmText" :cancel-text="confirmConfig.cancelText"
      @confirm="confirmConfig.onConfirm" @cancel="confirmConfig.onCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElButton, ElEmpty, ElTag, ElTooltip, ElButtonGroup, ElMessage, ElMessageBox, ElTabs, ElTabPane, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { Icon } from '@iconify/vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import '../../../css/worldbook.css'

import type { CharacterCardV3 } from '@/types/character-card-v3';
import type { CharacterBook } from '@/types/character-book';
import type { WorldBook, WorldBookEntry, WorldBookCollection } from '@/types/types';
import WorldBookEditor from '@/components/worldbook/WorldBookEditor.vue';
import WorldBookList from '@/components/worldbook/WorldBookList.vue';
import WorldBookSelectorDialog from '../WorldBookSelectorDialog.vue';
import ConfirmDialog from '../ConfirmDialog.vue';
import { worldBookService } from '@/database/worldBookService';
import { useWorldBookEntry } from '@/composables/worldbook/useWorldBookEntry';
import { useWorldBookDragDrop } from '@/composables/worldbook/useWorldBookDragDrop';
import { convertCharacterBookToWorldBook, convertWorldBookToCharacterBook } from '@/utils/worldBookConverter';

// 移动端状态
const mobileActiveTab = ref<'list' | 'editor'>('list');

interface Props {
  character: CharacterCardV3;
}

interface Emits {
  (e: 'worldbookChanged'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showWorldBookSelector = ref(false);
const showReplaceWorldBookSelector = ref(false);
const confirmDialogRef = ref<InstanceType<typeof ConfirmDialog>>();

// 确认对话框配置
const confirmConfig = ref({
  title: '确认操作',
  message: '',
  type: 'info' as 'info' | 'warning' | 'danger',
  confirmText: '确认',
  cancelText: '取消',
  onConfirm: () => { },
  onCancel: () => { }
});

// 计算属性：是否有世界书
const hasWorldBook = computed(() => {
  const book = props.character.data.character_book;
  return !!(book && !Array.isArray(book) && book.entries && book.entries.length >= 0);
});

// 本地可编辑的 WorldBook 状态（从 character_book 转换而来）
const mockActiveBook = ref<WorldBook | null>(null);

// 同步：当角色卡内的 character_book 变化时，刷新本地 worldbook 状态
watch(
  () => props.character.data.character_book,
  (charBook) => {
    if (!charBook || Array.isArray(charBook)) {
      mockActiveBook.value = null;
      return;
    }
    // 使用转换器确保编辑器使用 WorldBookEntry 结构
    const wb = convertCharacterBookToWorldBook(charBook, 'character-book');
    mockActiveBook.value = wb;
  },
  { immediate: true, deep: true }
);

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
} = useWorldBookEntry(mockActiveBook as any, {
  updateEntries: async (entries: WorldBookEntry[]) => {
    // 更新本地 worldbook，再转换为 character_book 写回
    if (mockActiveBook.value) {
      mockActiveBook.value.entries = entries;
      const characterBook = convertWorldBookToCharacterBook(mockActiveBook.value);
      props.character.data.character_book = characterBook;
      emit('worldbookChanged');
    }
  },
  updateEntry: async (entry: WorldBookEntry) => {
    // 更新本地 worldbook 的单个条目，再写回 character_book
    if (mockActiveBook.value) {
      const idx = mockActiveBook.value.entries.findIndex(e => e.uid === entry.uid);
      if (idx !== -1) mockActiveBook.value.entries[idx] = entry;
      const characterBook = convertWorldBookToCharacterBook(mockActiveBook.value);
      props.character.data.character_book = characterBook;
      emit('worldbookChanged');
    }
  },
  addEntry: async (entry: WorldBookEntry) => {
    if (!mockActiveBook.value) return null;
    mockActiveBook.value.entries.push(entry);
    const characterBook = convertWorldBookToCharacterBook(mockActiveBook.value);
    props.character.data.character_book = characterBook;
    emit('worldbookChanged');
    return entry;
  },
  deleteEntry: async (entryId: number) => {
    if (!mockActiveBook.value) return false;
    const index = mockActiveBook.value.entries.findIndex(e => e.uid === entryId);
    if (index !== -1) {
      mockActiveBook.value.entries.splice(index, 1);
      const characterBook = convertWorldBookToCharacterBook(mockActiveBook.value);
      props.character.data.character_book = characterBook;
      emit('worldbookChanged');
      return true;
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
    if (mockActiveBook.value) {
      mockActiveBook.value.entries = entries;
      const characterBook = convertWorldBookToCharacterBook(mockActiveBook.value);
      props.character.data.character_book = characterBook;
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
    if (entry.key && Array.isArray(entry.key)) {
      entry.key.forEach(k => keywords.add(k));
    }
    if (entry.keysecondary && Array.isArray(entry.keysecondary)) {
      entry.keysecondary.forEach(k => keywords.add(k));
    }
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
    extensions: {}
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
      // 转换为 CharacterBook 写回角色卡
      const characterBook = convertWorldBookToCharacterBook(book);
      props.character.data.character_book = characterBook;
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

// 移动端选择条目后自动切换到编辑器标签页
const handleMobileSelectEntry = (bookId: string, entryIndex: number) => {
  onListSelectEntry(bookId, entryIndex);
  mobileActiveTab.value = 'editor';
};

// 移动端下拉菜单命令处理
const handleMobileActionCommand = (command: string) => {
  switch (command) {
    case 'toggleAutoSave':
      toggleAutoSaveMode();
      break;
    case 'save':
      saveCurrentEntry();
      break;
    case 'delete':
      deleteSelectedEntry();
      break;
  }
};

// 添加到 DB
const handleAddToDB = async () => {
  if (!mockActiveBook.value) {
    ElMessage.error('没有可添加的世界书');
    return;
  }

  const characterBook = props.character.data.character_book;
  // 类型守卫：确保 characterBook 不是数组且有 extensions 字段
  if (!characterBook || Array.isArray(characterBook)) {
    ElMessage.error('角色卡世界书数据格式不正确');
    return;
  }

  try {
    // 检查是否已存在同名世界书
    const collection = await worldBookService.getFullWorldBookCollection();
    const existingBook = Object.values(collection.books).find(
      book => book.name === mockActiveBook.value?.name
    );

    if (existingBook) {
      // 如果存在同名世界书，询问用户
      confirmConfig.value = {
        title: '世界书已存在',
        message: `数据库中已存在名为「${mockActiveBook.value.name}」的世界书。\n是否要更新该世界书的内容？`,
        type: 'warning',
        confirmText: '更新',
        cancelText: '取消',
        onConfirm: async () => {
          try {
            const charBook = props.character.data.character_book;
            if (mockActiveBook.value && charBook && !Array.isArray(charBook)) {
              // updateBookFromCharacterCard 只需要 bookId, characterBook, characterName 三个参数
              await worldBookService.updateBookFromCharacterCard(
                existingBook.id,
                charBook as CharacterBook,
                props.character.name
              );
              ElMessage.success('已更新世界书到数据库');
              confirmDialogRef.value?.close();
            }
          } catch (error) {
            console.error('更新世界书失败:', error);
            ElMessage.error('更新世界书失败');
          }
        },
        onCancel: () => {
          confirmDialogRef.value?.close();
        }
      };
      confirmDialogRef.value?.open();
    } else {
      // 不存在同名世界书，直接添加
      await worldBookService.addBookFromCharacterCard(
        characterBook as CharacterBook,
        props.character.id || '',
        props.character.name
      );
      ElMessage.success('已添加世界书到数据库');
    }
  } catch (error) {
    console.error('添加世界书到数据库失败:', error);
    ElMessage.error('添加世界书到数据库失败');
  }
};

// 从 DB 替换
const handleReplaceFromDB = () => {
  // 显示确认对话框
  confirmConfig.value = {
    title: '确认替换世界书',
    message: `此操作将用数据库中的世界书完全替换当前角色卡的世界书。\n当前世界书「${mockActiveBook.value?.name || '未命名世界书'}」的所有内容将被覆盖且无法恢复。\n\n确定要继续吗？`,
    type: 'danger',
    confirmText: '确认替换',
    cancelText: '取消',
    onConfirm: () => {
      // 打开世界书选择器
      showReplaceWorldBookSelector.value = true;
      confirmDialogRef.value?.close();
    },
    onCancel: () => {
      confirmDialogRef.value?.close();
    }
  };
  confirmDialogRef.value?.open();
};

// 确认替换世界书
const handleConfirmReplace = async (bookId: string) => {
  try {
    const collection = await worldBookService.getFullWorldBookCollection();
    const book = collection.books[bookId];
    if (book) {
      // 转换为 CharacterBook 写回角色卡
      const characterBook = convertWorldBookToCharacterBook(book);
      props.character.data.character_book = characterBook;
      emit('worldbookChanged');
      ElMessage.success(`已替换为世界书: ${book.name}`);
    } else {
      ElMessage.error('未找到选中的世界书');
    }
  } catch (error) {
    console.error('替换世界书失败:', error);
    ElMessage.error('替换世界书失败');
  }
};

// 暴露方法和属性给父组件
defineExpose({
  handleAddToDB,
  handleReplaceFromDB,
  currentWorldBookName: computed(() => mockActiveBook.value?.name || '未命名世界书'),
  hasWorldBook
});
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

.empty-description {
  text-align: center;
}

.empty-description p {
  margin: 8px 0;
}

.empty-hint {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin-top: 12px;
}

.empty-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.worldbook-editor-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.worldbook-layout {
  flex: 1;
  overflow: hidden;
  height: 100%;
  min-height: 0;
  /* 关键：允许 flex 子元素缩小 */
}

/* 桌面端布局 */
.worldbook-layout-desktop {
  display: flex;
  flex-direction: column;
}

/* Splitpanes 容器样式修复 */
.worldbook-layout-desktop :deep(.splitpanes) {
  height: 100%;
}

.worldbook-layout-desktop :deep(.splitpanes__pane) {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.worldbook-layout-mobile {
  display: none;
}

@media (max-width: 1023px) {
  .worldbook-layout-desktop {
    display: none;
  }

  .worldbook-layout-mobile {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

/* 移动端标签页 */
.worldbook-mobile-tabs {
  height: 100%;
}

.worldbook-mobile-tabs :deep(.el-tabs__content) {
  height: calc(100% - 48px);
  overflow: hidden;
}

.worldbook-mobile-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
}

.worldbook-editor-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  /* 关键：允许内容缩小 */
}

/* WorldBookEditor 容器 */
.worldbook-editor-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

/* WorldBookEditor 内部滚动条样式 */
.worldbook-editor-container :deep(.worldbook-editor-scrollbar) {
  height: 100%;
}

.worldbook-editor-container :deep(.el-scrollbar__wrap) {
  overflow-x: hidden !important;
}

.worldbook-editor-panel-mobile {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  overflow: hidden;
  min-height: 0;
}

.worldbook-editor-panel-mobile .worldbook-editor-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
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

/* 移动端头部 */
.content-panel-header-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-extra-light);
  flex-shrink: 0;
}

.content-panel-title-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor-actions-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
