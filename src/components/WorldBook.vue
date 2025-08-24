<template>
  <div class="worldbook-container">
    <el-alert v-if="showUpdateBanner" title="世界书功能重大更新" type="info"
      description="为了提升性能与稳定性，世界书的数据存储方式已从 localStorage 升级至 IndexedDB。这是一个重大的技术变更。如果您在本次更新后首次使用，且发现数据丢失，这可能是因为旧数据未能自动迁移"
      @close="showUpdateBanner = false" class="worldbook-update-banner" />

    <div class="worldbook-mobile-layout">
      <el-tabs v-model="activeTab" type="border-card" class="worldbook-tabs-mobile">
        <el-tab-pane name="list" class="worldbook-tab-pane">
          <template #label>
            <span class="worldbook-tab-label">
              <Icon icon="ph:list-bullets-duotone" class="worldbook-tab-icon" />
              <span class="worldbook-tab-text">条目列表</span>
            </span>
          </template>

          <div class="content-panel-header">
            <h2 class="content-panel-title">
              <Icon icon="ph:list-bullets-duotone" class="content-panel-icon" />
              <span class="content-panel-text">世界书条目</span>
            </h2>
            <el-tooltip content="新增条目" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
              <button @click="() => addNewEntry()" class="btn-primary-adv worldbook-add-button" aria-label="新增条目"
                :disabled="!activeBook">
                <Icon icon="ph:plus-circle-duotone" class="worldbook-add-icon" />
              </button>
            </el-tooltip>
          </div>
          <WorldBookList :collection="worldBookCollection" :active-book-id="activeBookId"
            @select-book="handleSelectBook" @create-book="handleCreateBook" @rename-book="handleRenameBook"
            @delete-book="handleDeleteBook" @select-entry="handleSelectEntry" @add-entry="addNewEntry"
            :selected-entry="selectedEntry" @copy-book="copyWorldBookToClipboard"
            @import-book="showImportWorldBookDialog" @export-json="exportToJson" @import-json="handleLoadFromJsonFile"
            @import-book-file="handleImportBookFile" @clear-all="clearAllEntries"
            :drag-drop-handlers="dragDropHandlers" />
        </el-tab-pane>

        <el-tab-pane name="editor" class="worldbook-tab-pane" :disabled="!selectedEntry">
          <template #label>
            <span class="worldbook-tab-label">
              <Icon icon="ph:note-pencil-duotone" class="worldbook-tab-icon" />
              <span class="worldbook-tab-text-truncated">{{
                selectedEntry ? selectedEntry.comment || "编辑中" : "编辑条目"
              }}</span>
            </span>
          </template>

          <div class="content-panel-header">
            <h2 class="content-panel-title">
              <Icon icon="ph:note-pencil-duotone" class="content-panel-icon" />
              <span class="content-panel-text-truncated">编辑:
                <span class="content-panel-text-highlight">{{
                  selectedEntry ? selectedEntry.comment || "新条目" : "未选择"
                }}</span></span>
            </h2>
            <WorldBookActions context="editor" :has-selection="!!selectedEntry" @copy-entry="copySelectedEntry"
              @import-entry="showImportEntryDialog" @save-entry="saveCurrentEntry"
              @delete-entry="deleteSelectedEntry" />
          </div>
          <WorldBookEditor :entry="selectedEntry" v-model="editableEntry" :all-keywords="allKeywords" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="worldbook-desktop-layout">
      <Splitpanes class="default-theme" push-other-panes style="height: 100%">
        <Pane size="15" min-size="15" max-size="35">
          <WorldBookList :collection="worldBookCollection" :active-book-id="activeBookId"
            @select-book="handleSelectBook" @create-book="handleCreateBook" @rename-book="handleRenameBook"
            @delete-book="handleDeleteBook" @select-entry="handleSelectEntry" @add-entry="addNewEntry"
            :selected-entry="selectedEntry" @copy-book="copyWorldBookToClipboard"
            @import-book="showImportWorldBookDialog" @export-json="exportToJson" @import-json="handleLoadFromJsonFile"
            @import-book-file="handleImportBookFile" @clear-all="clearAllEntries"
            :drag-drop-handlers="dragDropHandlers" />
        </Pane>
        <Pane size="85" min-size="40">
          <div class="worldbook-desktop-panel-right">
            <div class="content-panel-header">
              <h2 class="content-panel-title">
                <Icon icon="ph:note-pencil-duotone" class="content-panel-icon" />
                编辑:
                <span class="content-panel-text-highlight">{{
                  selectedEntry ? selectedEntry.comment || "新条目" : "未选择条目"
                }}</span>
              </h2>
              <WorldBookActions context="editor" :has-selection="!!selectedEntry" @copy-entry="copySelectedEntry"
                @import-entry="showImportEntryDialog" @save-entry="saveCurrentEntry"
                @delete-entry="deleteSelectedEntry" />
            </div>
            <WorldBookEditor :entry="selectedEntry" v-model="editableEntry" :all-keywords="allKeywords" />
          </div>
        </Pane>
      </Splitpanes>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElTabs, ElTabPane, ElTooltip, ElMessage, ElAlert } from "element-plus";
import { Icon } from "@iconify/vue";
import '../css/worldbook.css'
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

import WorldBookActions from "./worldbook/WorldBookActions.vue";
import WorldBookEditor from "./worldbook/WorldBookEditor.vue";
import WorldBookList from "./worldbook/WorldBookList.vue";
import { useWorldBookCollection } from "../composables/useWorldBookCollection";
import { useWorldBookEntry } from "../composables/useWorldBookEntry";
import { useWorldBookDragDrop } from "../composables/useWorldBookDragDrop";

import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useOverflowControl } from '../composables/useOverflowControl';

const showUpdateBanner = ref(true);

const { setOverflowHidden } = useOverflowControl();

onMounted(() => {
  setOverflowHidden(true);
});

onUnmounted(() => {
  setOverflowHidden(false);
});

// Manage the collection of world books
const {
  worldBookCollection,
  activeBookId,
  activeBook,
  handleSelectBook: selectBook,
  handleCreateBook,
  handleRenameBook,
  handleDeleteBook,
  handleImportBookFile,
  moveEntryBetweenBooks,
  updateBookEntries,
  updateBookOrder,
  handleUpdateEntry,
  handleAddEntry,
  handleDeleteEntry,
} = useWorldBookCollection();

// Manage entries of the active world book
const {
  selectedEntry,
  editableEntry,
  activeTab,
  addNewEntry: addEntry,
  handleSelectEntry: selectEntry,
  forceUpdateEntries,
  saveCurrentEntry,
  deleteSelectedEntry,
  copySelectedEntry,
  showImportEntryDialog,
  exportToJson,
  handleLoadFromJsonFile,
  copyWorldBookToClipboard,
  showImportWorldBookDialog,
  clearAllEntries,
} = useWorldBookEntry(activeBook, {
  updateEntries: (entries) => {
    if (!activeBook.value) return Promise.reject("No active book selected");
    return updateBookEntries(activeBook.value.id, entries);
  },
  updateEntry: handleUpdateEntry,
  addEntry: handleAddEntry,
  deleteEntry: handleDeleteEntry,
});

const allKeywords = computed(() => {
  if (!activeBook.value) {
    return [];
  }
  const allKeys = activeBook.value.entries.flatMap(entry => [...entry.key, ...entry.keysecondary]);
  return [...new Set(allKeys.filter(key => key))]; // 过滤掉空字符串或null/undefined
});

// Manage drag and drop logic, must be after other composables
const dragDropHandlers = useWorldBookDragDrop(
  worldBookCollection,
  moveEntryBetweenBooks,
  updateBookEntries,
  updateBookOrder,
  forceUpdateEntries
);

const handleSelectBook = (bookId: string) => {
  selectBook(bookId);
  nextTick(() => {
    if (activeBook.value && activeBook.value.entries.length > 0) {
      selectEntry('0');
      activeTab.value = 'editor';
    } else {
      selectEntry(null); // Clear selection
      activeTab.value = 'list';
    }
  });
};

const handleSelectEntry = (bookId: string, entryIndex: number) => {
  if (activeBookId.value !== bookId) {
    selectBook(bookId);
    nextTick(() => {
      selectEntry(String(entryIndex));
      activeTab.value = 'editor';
    });
  } else {
    selectEntry(String(entryIndex));
    activeTab.value = 'editor';
  }
};

const addNewEntry = (bookId?: string) => {
  const targetBookId = bookId || activeBookId.value;
  if (!targetBookId) {
    ElMessage.error("请先选择一个世界书 ");
    return;
  }
  if (activeBookId.value !== targetBookId) {
    selectBook(targetBookId);
    nextTick(() => {
      addEntry();
    });
  } else {
    addEntry();
  }
};
</script>