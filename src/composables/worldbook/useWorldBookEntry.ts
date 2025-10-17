import { ref, computed, watch, onMounted, onBeforeUnmount, type Ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { copyToClipboard } from "../../utils/clipboard";
import { initAutoSave, clearAutoSave } from "../../utils/localStorageUtils";
import { watchDebounced } from "@vueuse/core";
import type { WorldBookEntry, WorldBook } from "../../components/worldbook/types";

export const createDefaultEntryData = (uid: number): WorldBookEntry => ({
  uid: uid,
  comment: "",
  key: [],
  content: "",
  addMemo: true,
  order: 100,
  constant: false,
  disable: false,
  keysecondary: [],
  selectiveLogic: 0,
  selective: true,
  excludeRecursion: false,
  preventRecursion: false,
  delayUntilRecursion: false,
  probability: 100,
  useProbability: true,
  position: 1,
  role: null,
  depth: 4,
  caseSensitive: null,
  matchWholeWords: null,
  vectorized: false,
  group: "",
  groupPriority: 0,
  groupOverride: false,
  useGroupScoring: null,
  sticky: 0,
  cooldown: 0,
  delay: 0,
  automationId: "",
  // 扫描匹配选项默认值
  scanDepth: null,
  matchPersonaDescription: false,
  matchCharacterDescription: false,
  matchCharacterPersonality: false,
  matchCharacterDepthPrompt: false,
  matchScenario: false,
  matchCreatorNotes: false,
});

export const processImportedWorldBookData = (
  jsonData: unknown
): WorldBookEntry[] | null => {
  if (
    jsonData &&
    typeof jsonData === "object" &&
    jsonData !== null &&
    "entries" in jsonData &&
    typeof (jsonData as { entries: unknown }).entries === "object" &&
    (jsonData as { entries: unknown }).entries !== null
  ) {
    const data = jsonData as { entries: Record<string, any> };
    const entriesFromFile = Object.values(data.entries);
    const loadedEntries: WorldBookEntry[] = [];

    entriesFromFile.forEach((entryFromFile, index) => {
      const newUid = Date.now() + index;
      const baseEntry = createDefaultEntryData(newUid);

      const newEntry: WorldBookEntry = {
        ...baseEntry,
        ...entryFromFile,
        uid: newUid,
        key: Array.isArray(entryFromFile.key)
          ? entryFromFile.key.map(String)
          : baseEntry.key,
        keysecondary: Array.isArray(entryFromFile.keysecondary)
          ? entryFromFile.keysecondary.map(String)
          : baseEntry.keysecondary,
      };
      delete newEntry.id;
      loadedEntries.push(newEntry);
    });

    return loadedEntries;
  }
  return null;
};

type EntryCallbacks = {
  updateEntries: (entries: WorldBookEntry[]) => Promise<void>;
  updateEntry: (entry: WorldBookEntry) => Promise<void>;
  addEntry: (entry: WorldBookEntry) => Promise<WorldBookEntry | null>;
  deleteEntry: (entryId: number) => Promise<void>;
};

export function useWorldBookEntry(
  activeBook: Ref<WorldBook | null>,
  callbacks: EntryCallbacks
) {
  const selectedEntryIndex = ref<number | null>(null);
  const editableEntry = ref<Partial<WorldBookEntry>>({});
  const activeTab = ref<"list" | "editor">("list");
  let autoSaveTimer: number | null = null;
  const isAutoSaving = ref(false);
  const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const lastSaveTime = ref<Date | null>(null);
  const hasUnsavedChanges = ref(false);
  let lastSavedData = ref<string>('');

  // 自动保存模式：'auto' | 'watch' | 'manual'
  // auto: 定时自动保存（不管有没有修改）
  // watch: 监听修改，检测到修改就保存（使用防抖）
  // manual: 完全禁用自动保存
  const autoSaveMode = ref<'auto' | 'watch' | 'manual'>('watch'); // 默认监听模式

  const activeBookEntries = computed<WorldBookEntry[]>(() => {
    return activeBook.value ? activeBook.value.entries : [];
  });

  const selectedEntry = computed<WorldBookEntry | null>(() => {
    const index = selectedEntryIndex.value;
    if (index === null) return null;
    return activeBookEntries.value[index] || null;
  });

  watch(
    activeBook,
    (newBook, oldBook) => {
      if (newBook?.id !== oldBook?.id) {
        selectedEntryIndex.value = null;
        editableEntry.value = {};
        activeTab.value = newBook && newBook.entries.length > 0 ? 'editor' : 'list';
      }
    },
    { deep: true }
  );

  watch(
    selectedEntryIndex,
    (newIndex) => {
      if (newIndex !== null && activeBookEntries.value[newIndex]) {
        const newEntry = activeBookEntries.value[newIndex];
        editableEntry.value = JSON.parse(JSON.stringify(newEntry));
        // 记录当前数据状态
        lastSavedData.value = JSON.stringify(editableEntry.value);
        hasUnsavedChanges.value = false;
      } else {
        editableEntry.value = {};
        lastSavedData.value = '';
        hasUnsavedChanges.value = false;
      }
    },
    { immediate: true }
  );

  // 监听 editableEntry 的变化，标记为有未保存的修改
  watch(
    editableEntry,
    () => {
      const currentData = JSON.stringify(editableEntry.value);
      hasUnsavedChanges.value = currentData !== lastSavedData.value;
    },
    { deep: true }
  );

  const addNewEntry = async () => {
    if (!activeBook.value) {
      ElMessage.error("没有活动的世界书，无法添加新条目");
      return;
    }
    const newUid = Date.now();
    const newEntryData = createDefaultEntryData(newUid);
    newEntryData.comment = `新条目 ${activeBook.value.entries.length + 1}`;

    const addedEntry = await callbacks.addEntry(newEntryData);

    if (addedEntry) {
      // The local state `activeBook.value.entries` is already updated in `handleAddEntry`
      // We just need to select the new entry.
      selectedEntryIndex.value = 0;
      activeTab.value = "editor";
    }
  };

  const handleSelectEntry = (indexStr: string | null) => {
    if (indexStr === null) {
      selectedEntryIndex.value = null;
      return;
    }
    const index = parseInt(indexStr, 10);
    if (index >= 0 && index < activeBookEntries.value.length) {
      selectedEntryIndex.value = index;
      activeTab.value = "editor";
    }
  };

  const handleReorderEntries = async (newOrder: WorldBookEntry[]) => {
    if (activeBook.value) {
      activeBook.value.entries = newOrder;
      await callbacks.updateEntries(newOrder);
      ElMessage.success("条目顺序已更新！");
    }
  };

  const saveCurrentEntry = async () => {
    if (selectedEntry.value && editableEntry.value.uid) {
      const entryToSave = JSON.parse(JSON.stringify(editableEntry.value)) as WorldBookEntry;

      const targetIndex = activeBookEntries.value.findIndex(e => e.uid === entryToSave.uid);
      if (targetIndex !== -1) {
        activeBookEntries.value[targetIndex] = entryToSave;
      }

      await callbacks.updateEntry(entryToSave);

      // 更新保存状态
      lastSavedData.value = JSON.stringify(entryToSave);
      hasUnsavedChanges.value = false;

      ElMessage.success("条目已保存！");
    } else {
      console.error('[useWorldBookEntry] 保存失败：缺少必要数据');
      ElMessage.error("无法保存条目，缺少UID或未选择条目");
    }
  };

  const deleteSelectedEntry = async (): Promise<void> => {
    const entryToDelete = selectedEntry.value;

    // 添加详细的调试信息
    console.log("尝试删除条目:", {
      entryToDelete,
      hasEntry: !!entryToDelete,
      entryId: entryToDelete?.id,
      entryUid: entryToDelete?.uid,
      hasActiveBook: !!activeBook.value
    });

    if (!entryToDelete) {
      ElMessage.error("无法删除条目：未选择任何条目");
      return;
    }

    if (!activeBook.value) {
      ElMessage.error("无法删除条目：没有活动的世界书");
      return;
    }

    if (entryToDelete.id === undefined) {
      ElMessage.error("无法删除条目：条目缺少数据库ID，请刷新页面重试");
      console.error("条目缺少数据库ID:", entryToDelete);
      return;
    }

    try {
      await callbacks.deleteEntry(entryToDelete.id);

      // The local state is updated in `handleDeleteEntry`.
      // Now, adjust the selection.
      if (activeBook.value.entries.length > 0) {
        // If the deleted item was not the last one, keep the index, otherwise select the new last one
        const newIndex = Math.min(
          selectedEntryIndex.value ?? 0,
          activeBook.value.entries.length - 1
        );
        selectedEntryIndex.value = newIndex;
      } else {
        selectedEntryIndex.value = null;
        activeTab.value = "list";
      }

      ElMessage.success("条目已成功删除");
    } catch (error) {
      console.error("删除条目时发生错误:", error);
      ElMessage.error(`删除条目失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const copySelectedEntry = async (): Promise<void> => {
    if (!selectedEntry.value) {
      ElMessage.warning("请先选择一个条目进行复制");
      return;
    }
    const entryToCopy = { ...selectedEntry.value };
    delete entryToCopy.uid;
    delete entryToCopy.id;
    const jsonData = JSON.stringify(entryToCopy, null, 2);
    await copyToClipboard(jsonData, "当前条目数据已复制到剪贴板！");
  };

  const showImportEntryDialog = async (): Promise<void> => {
    try {
      const { value } = await ElMessageBox.prompt(
        "请粘贴单个世界书条目的JSON数据到下方：", "粘贴为新条目",
        { confirmButtonText: "确认导入", cancelButtonText: "取消", inputType: "textarea" }
      );
      if (!activeBook.value) { ElMessage.error("没有活动的世界书，无法导入条目"); return; }

      const parsedEntryData = JSON.parse(value);
      const newUid = Date.now();
      const newEntry: WorldBookEntry = {
        ...createDefaultEntryData(newUid), ...parsedEntryData, uid: newUid,
      };

      // Use the new single-add mechanism
      const addedEntry = await callbacks.addEntry(newEntry);
      if (addedEntry) {
        selectedEntryIndex.value = 0;
      }
      activeTab.value = "editor";
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') { ElMessage.error("导入失败"); }
    }
  };

  const formatWorldBookForExport = (): { entries: Record<string, WorldBookEntry> } => {
    const exportData: { entries: Record<string, WorldBookEntry> } = { entries: {} };
    activeBookEntries.value.forEach((entry, index) => {
      const entryToExport = { ...entry };
      delete entryToExport.id;
      exportData.entries[String(index)] = { ...entryToExport, uid: index };
    });
    return exportData;
  };

  const exportToJson = (): void => {
    if (!activeBookEntries.value.length) {
      ElMessage.warning("当前世界书没有条目可以导出");
      return;
    }
    const exportData = formatWorldBookForExport();
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fileName = activeBook.value ? `${activeBook.value.name}.world.json` : "world_info.json";
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    ElMessage.success(`已导出为 ${fileName}`);
  };

  const handleLoadFromJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        if (!activeBook.value) throw new Error("没有活动的世界书");
        const jsonData = JSON.parse(e.target?.result as string);
        const loadedEntries = processImportedWorldBookData(jsonData);

        if (loadedEntries) {
          activeBook.value.entries = loadedEntries;
          await callbacks.updateEntries(loadedEntries);
          ElMessage.success(`条目已成功导入并替换当前世界书: ${activeBook.value.name}`);
        } else {
          throw new Error('JSON文件格式不正确或无法处理');
        }
      } catch (error) {
        ElMessage.error(`导入失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    reader.readAsText(file);
  };

  const copyWorldBookToClipboard = async (): Promise<void> => {
    if (!activeBookEntries.value.length) {
      ElMessage.warning("当前世界书没有条目可以复制");
      return;
    }
    const exportData = formatWorldBookForExport();
    const jsonString = JSON.stringify(exportData, null, 2);
    await copyToClipboard(jsonString, "整个世界书数据已复制到剪贴板！");
  };

  const showImportWorldBookDialog = async (): Promise<void> => {
    try {
      const { value } = await ElMessageBox.prompt(
        '请粘贴世界书条目的JSON数据 警告：此操作将替换当前活动世界书的所有条目', '从剪贴板导入条目',
        { confirmButtonText: "确认导入", cancelButtonText: "取消", inputType: "textarea" }
      );
      if (!activeBook.value) throw new Error("没有活动的世界书");

      const jsonData = JSON.parse(value);
      const loadedEntries = processImportedWorldBookData(jsonData);

      if (loadedEntries) {
        // This is a replace operation, so updateEntries is correct here.
        activeBook.value.entries = loadedEntries;
        await callbacks.updateEntries(loadedEntries);
        ElMessage.success(`条目已成功从剪贴板导入`);
      } else {
        throw new Error("数据结构不符合预期");
      }
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.error(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
  };

  const clearAllEntries = async (): Promise<void> => {
    if (!activeBook.value) {
      ElMessage.warning("没有活动的世界书可供清空");
      return;
    }
    try {
      await ElMessageBox.confirm(
        `确定要清空世界书 "${activeBook.value.name}" 中的所有条目吗？此操作不可恢复！`, '清空当前世界书',
        { confirmButtonText: "确认清空", cancelButtonText: "取消", type: "warning" }
      );
      if (activeBook.value) {
        activeBook.value.entries = [];
        await callbacks.updateEntries([]);
      }
      selectedEntryIndex.value = null;
      editableEntry.value = {};
      activeTab.value = "list";
    } catch (err) {
      if (err !== "cancel" && err !== "close")
        ElMessage.info("清空操作已取消");
    }
  };

  const forceUpdateEntries = () => {
    if (activeBook.value) {
      activeBook.value.entries = [...activeBook.value.entries];
    }
  };

  // 切换自动保存模式
  const toggleAutoSaveMode = () => {
    const modes: Array<'auto' | 'watch' | 'manual'> = ['auto', 'watch', 'manual'];
    const currentIndex = modes.indexOf(autoSaveMode.value);
    const nextIndex = (currentIndex + 1) % modes.length;
    autoSaveMode.value = modes[nextIndex];

    const messages = {
      auto: '已切换到自动保存模式：每 5 秒自动保存',
      watch: '已切换到监听模式：检测到修改后 1.5 秒自动保存',
      manual: '已切换到手动模式：自动保存已禁用'
    };

    ElMessage.info(messages[autoSaveMode.value]);
  };

  // 自动保存函数（静默保存，不显示成功提示）
  const autoSaveCurrentEntry = async () => {
    // 如果是手动模式，完全禁用自动保存
    if (autoSaveMode.value === 'manual') {
      return;
    }

    if (!selectedEntry.value || !editableEntry.value.uid) {
      return;
    }

    // 检查是否有未保存的修改
    if (!hasUnsavedChanges.value) {
      return;
    }

    // 防止重复保存
    if (isAutoSaving.value) {
      return;
    }

    isAutoSaving.value = true;
    saveStatus.value = 'saving';

    try {
      const entryToSave = JSON.parse(JSON.stringify(editableEntry.value)) as WorldBookEntry;
      const targetIndex = activeBookEntries.value.findIndex(e => e.uid === entryToSave.uid);

      if (targetIndex !== -1) {
        activeBookEntries.value[targetIndex] = entryToSave;
      }

      await callbacks.updateEntry(entryToSave);

      // 更新最后保存的数据状态
      lastSavedData.value = JSON.stringify(entryToSave);
      hasUnsavedChanges.value = false;

      saveStatus.value = 'saved';
      lastSaveTime.value = new Date();

      // 2秒后隐藏"已保存"提示
      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle';
        }
      }, 2000);
    } catch (error) {
      console.error('[useWorldBookEntry] 自动保存失败:', error);
      saveStatus.value = 'error';
      // 5秒后隐藏错误提示
      setTimeout(() => {
        if (saveStatus.value === 'error') {
          saveStatus.value = 'idle';
        }
      }, 5000);
    } finally {
      isAutoSaving.value = false;
    }
  };

  // 使用防抖监听 editableEntry 的变化（监听模式专用）
  // 用户停止编辑 0.5 秒后自动保存
  watchDebounced(
    editableEntry,
    () => {
      if (autoSaveMode.value === 'watch') {
        autoSaveCurrentEntry();
      }
    },
    { debounce: 500, deep: true }
  );

  // 启动定时自动保存（自动模式专用）
  onMounted(() => {
    autoSaveTimer = initAutoSave(
      () => {
        if (autoSaveMode.value === 'auto') {
          autoSaveCurrentEntry();
        }
      },
      () => !!selectedEntry.value && !!editableEntry.value.uid
    );
  });

  // 清理定时器
  onBeforeUnmount(() => {
    if (autoSaveTimer) {
      clearAutoSave(autoSaveTimer);
    }
  });

  return {
    activeBookEntries,
    selectedEntryIndex,
    selectedEntry,
    editableEntry,
    activeTab,
    addNewEntry,
    handleSelectEntry,
    handleReorderEntries,
    saveCurrentEntry,
    deleteSelectedEntry,
    copySelectedEntry,
    showImportEntryDialog,
    exportToJson,
    handleLoadFromJsonFile,
    copyWorldBookToClipboard,
    showImportWorldBookDialog,
    clearAllEntries,
    forceUpdateEntries,
    saveStatus,
    lastSaveTime,
    autoSaveMode,
    toggleAutoSaveMode,
  };
}