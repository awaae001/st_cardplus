import { ref, computed, watch, type Ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { copyToClipboard } from "../utils/clipboard";
import type { WorldBookEntry, WorldBook } from "../components/worldbook/types";

export const createDefaultEntryData = (uid: number): WorldBookEntry => ({
  uid: uid,
  comment: "",
  key: [],
  content: "",
  addMemo: false,
  order: 0,
  constant: false,
  disable: false,
  keysecondary: [],
  selectiveLogic: 0,
  selective: false,
  excludeRecursion: false,
  preventRecursion: false,
  delayUntilRecursion: false,
  probability: 100,
  useProbability: false,
  position: 1,
  role: 0,
  depth: 0,
  caseSensitive: false,
  matchWholeWords: false,
  vectorized: false,
  group: "",
  groupPriority: 0,
  groupOverride: false,
  useGroupScoring: false,
  sticky: 0,
  cooldown: 0,
  delay: 0,
  automationId: "",
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
    const loadedEntries: WorldBookEntry[] = [];
    let uidCounter = Date.now();
    Object.keys(data.entries).forEach((entryKey) => {
      const entryFromFile = data.entries[entryKey];
      let currentUid: number;
      const uidFromKey = parseInt(entryKey, 10);
      if (!Number.isNaN(uidFromKey)) {
        currentUid = uidFromKey;
      } else if (entryFromFile.uid && typeof entryFromFile.uid === "number") {
        currentUid = entryFromFile.uid;
      } else {
        currentUid = uidCounter++;
      }

      const baseEntry = createDefaultEntryData(currentUid);
      const newEntry: WorldBookEntry = {
        ...baseEntry,
        ...entryFromFile,
        uid: currentUid,
        key: Array.isArray(entryFromFile.key)
          ? entryFromFile.key.map(String)
          : baseEntry.key,
        keysecondary: Array.isArray(entryFromFile.keysecondary)
          ? entryFromFile.keysecondary.map(String)
          : baseEntry.keysecondary,
        addMemo:
          typeof entryFromFile.addMemo === "boolean"
            ? entryFromFile.addMemo
            : baseEntry.addMemo,
        constant:
          typeof entryFromFile.constant === "boolean"
            ? entryFromFile.constant
            : baseEntry.constant,
        disable:
          typeof entryFromFile.disable === "boolean"
            ? entryFromFile.disable
            : baseEntry.disable,
        selective:
          typeof entryFromFile.selective === "boolean"
            ? entryFromFile.selective
            : baseEntry.selective,
        excludeRecursion:
          typeof entryFromFile.excludeRecursion === "boolean"
            ? entryFromFile.excludeRecursion
            : baseEntry.excludeRecursion,
        preventRecursion:
          typeof entryFromFile.preventRecursion === "boolean"
            ? entryFromFile.preventRecursion
            : baseEntry.preventRecursion,
        delayUntilRecursion:
          typeof entryFromFile.delayUntilRecursion === "boolean"
            ? entryFromFile.delayUntilRecursion
            : baseEntry.delayUntilRecursion,
        useProbability:
          typeof entryFromFile.useProbability === "boolean"
            ? entryFromFile.useProbability
            : baseEntry.useProbability,
        caseSensitive:
          typeof entryFromFile.caseSensitive === "boolean"
            ? entryFromFile.caseSensitive
            : baseEntry.caseSensitive,
        matchWholeWords:
          typeof entryFromFile.matchWholeWords === "boolean"
            ? entryFromFile.matchWholeWords
            : baseEntry.matchWholeWords,
        vectorized:
          typeof entryFromFile.vectorized === "boolean"
            ? entryFromFile.vectorized
            : baseEntry.vectorized,
        groupOverride:
          typeof entryFromFile.groupOverride === "boolean"
            ? entryFromFile.groupOverride
            : baseEntry.groupOverride,
        useGroupScoring:
          typeof entryFromFile.useGroupScoring === "boolean"
            ? entryFromFile.useGroupScoring
            : baseEntry.useGroupScoring,
        order:
          typeof entryFromFile.order === "number"
            ? entryFromFile.order
            : baseEntry.order,
        selectiveLogic:
          typeof entryFromFile.selectiveLogic === "number"
            ? entryFromFile.selectiveLogic
            : baseEntry.selectiveLogic,
        probability:
          typeof entryFromFile.probability === "number"
            ? entryFromFile.probability
            : baseEntry.probability,
        position:
          typeof entryFromFile.position === "number"
            ? entryFromFile.position
            : baseEntry.position,
        role:
          typeof entryFromFile.role === "number"
            ? entryFromFile.role
            : baseEntry.role,
        depth:
          typeof entryFromFile.depth === "number"
            ? entryFromFile.depth
            : baseEntry.depth,
        groupPriority:
          typeof entryFromFile.groupPriority === "number"
            ? entryFromFile.groupPriority
            : baseEntry.groupPriority,
        sticky:
          typeof entryFromFile.sticky === "number"
            ? entryFromFile.sticky
            : baseEntry.sticky,
        cooldown:
          typeof entryFromFile.cooldown === "number"
            ? entryFromFile.cooldown
            : baseEntry.cooldown,
        delay:
          typeof entryFromFile.delay === "number"
            ? entryFromFile.delay
            : baseEntry.delay,
        comment:
          typeof entryFromFile.comment === "string"
            ? entryFromFile.comment
            : baseEntry.comment,
        content:
          typeof entryFromFile.content === "string"
            ? entryFromFile.content
            : baseEntry.content,
        group:
          typeof entryFromFile.group === "string"
            ? entryFromFile.group
            : baseEntry.group,
        automationId:
          typeof entryFromFile.automationId === "string"
            ? entryFromFile.automationId
            : baseEntry.automationId,
      };
      loadedEntries.push(newEntry);
    });
    return loadedEntries;
  }
  return null;
};

export function useWorldBookEntry(
  activeBook: Ref<WorldBook | null>,
  saveCallback: () => void
) {
  const selectedEntryIndex = ref<number | null>(null);
  const editableEntry = ref<Partial<WorldBookEntry>>({});
  const activeTab = ref<"list" | "editor">("list");

  const activeBookEntries = computed<WorldBookEntry[]>(() => {
    return activeBook.value ? activeBook.value.entries : [];
  });

  const selectedEntry = computed<WorldBookEntry | null>(() => {
    if (
      selectedEntryIndex.value !== null &&
      activeBookEntries.value[selectedEntryIndex.value]
    ) {
      return activeBookEntries.value[selectedEntryIndex.value];
    }
    return null;
  });

  watch(
    selectedEntryIndex,
    (newIndex) => {
      if (newIndex !== null && activeBookEntries.value[newIndex]) {
        const newEntry = activeBookEntries.value[newIndex];
        const defaultFullEntry = createDefaultEntryData(
          newEntry.uid || Date.now()
        );
        editableEntry.value = {
          ...defaultFullEntry,
          ...JSON.parse(JSON.stringify(newEntry)),
        };
      } else {
        editableEntry.value = {};
      }
    },
    { immediate: true }
  );

  watch(
    editableEntry,
    (newVal) => {
      if (activeBook.value && selectedEntryIndex.value !== null && newVal && newVal.uid) {
        const targetIndex = activeBook.value.entries.findIndex(
          (e) => e.uid === newVal.uid
        );
        if (targetIndex !== -1) {
          activeBook.value.entries[targetIndex] = {
            ...activeBook.value.entries[targetIndex],
            ...newVal,
          };
        }
      }
    },
    { deep: true }
  );

  const addNewEntry = () => {
    const newUid = Date.now();
    const newEntryData = createDefaultEntryData(newUid);
    if (!activeBook.value) {
      ElMessage.error("没有活动的世界书，无法添加新条目。");
      return;
    }
    newEntryData.comment = `新条目 ${activeBook.value.entries.length + 1}`;
    activeBook.value.entries.unshift(newEntryData);
    selectedEntryIndex.value = 0;
    activeTab.value = "editor";
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

  const handleReorderEntries = (newOrder: WorldBookEntry[]) => {
    if (activeBook.value) {
      activeBook.value.entries = newOrder;
      saveCallback();
      ElMessage.success("条目顺序已更新！");
    }
  };

  const saveCurrentEntry = () => {
    if (
      selectedEntryIndex.value !== null &&
      editableEntry.value &&
      editableEntry.value.uid !== undefined
    ) {
      const entryToSave = {
        ...createDefaultEntryData(editableEntry.value.uid),
        ...editableEntry.value,
      };
      entryToSave.key = Array.isArray(entryToSave.key) ? entryToSave.key : [];
      entryToSave.keysecondary = Array.isArray(entryToSave.keysecondary)
        ? entryToSave.keysecondary
        : [];
      activeBookEntries.value[selectedEntryIndex.value] = JSON.parse(
        JSON.stringify(entryToSave as WorldBookEntry)
      );
      ElMessage.success("条目已保存！");
      saveCallback();
    } else {
      ElMessage.error("无法保存条目，缺少UID或未选择条目。");
    }
  };

  const deleteSelectedEntry = async (): Promise<void> => {
    if (selectedEntryIndex.value !== null && selectedEntry.value) {
      try {
        if (!activeBook.value) return;
        activeBook.value.entries.splice(selectedEntryIndex.value!, 1);
        if (activeBook.value.entries.length > 0) {
          selectedEntryIndex.value = Math.min(
            selectedEntryIndex.value,
            activeBook.value.entries.length - 1
          );
        } else {
          selectedEntryIndex.value = null;
          activeTab.value = "list";
        }
        saveCallback();
      } catch (err) {
        console.warn("删除条目操作未成功完成:", err);
      }
    }
  };

  const copySelectedEntry = async (): Promise<void> => {
    if (!selectedEntry.value) {
      ElMessage.warning("请先选择一个条目进行复制。");
      return;
    }
    const entryToCopy = { ...selectedEntry.value };
    delete entryToCopy.uid;
    const jsonData = JSON.stringify(entryToCopy, null, 2);
    await copyToClipboard(jsonData, "当前条目数据已复制到剪贴板！");
  };

  const showImportEntryDialog = async (): Promise<void> => {
    try {
      const { value } = await ElMessageBox.prompt(
        "请粘贴单个世界书条目的JSON数据到下方：",
        "粘贴为新条目",
        {
          confirmButtonText: "确认导入",
          cancelButtonText: "取消",
          inputType: "textarea",
          inputPlaceholder: "在此处粘贴条目JSON数据...",
          customClass: "app-dialog break-all app-messagebox-textarea-6",
          inputValidator: (val) => {
            if (!val || val.trim() === "") return "输入内容不能为空。";
            try {
              const parsed = JSON.parse(val);
              if (typeof parsed !== "object" || parsed === null)
                return "数据必须是一个JSON对象。";
              return true;
            } catch {
              return "数据格式无效，请输入正确的JSON。";
            }
          },
        }
      );

      try {
        const parsedEntryData = JSON.parse(value);
        const newUid = Date.now();
        const baseEntry = createDefaultEntryData(newUid);
        const newEntry: WorldBookEntry = {
          ...baseEntry,
          ...parsedEntryData,
          uid: newUid,
          comment:
            parsedEntryData.comment ||
            `导入条目 ${activeBookEntries.value.length + 1}`,
          key: Array.isArray(parsedEntryData.key)
            ? parsedEntryData.key.map(String)
            : [],
          keysecondary: Array.isArray(parsedEntryData.keysecondary)
            ? parsedEntryData.keysecondary.map(String)
            : [],
        };
        if (!activeBook.value) {
          ElMessage.error("没有活动的世界书，无法导入条目。");
          return;
        }
        activeBook.value.entries.unshift(newEntry);
        selectedEntryIndex.value = 0;
        activeTab.value = "editor";
        saveCallback();
      } catch (error) {
        console.warn("从剪贴板粘贴新条目操作未成功完成:", error);
      }
    } catch (error) {
      console.warn("从剪贴板粘贴新条目操作未成功完成或被取消:", error);
    }
  };

  const formatWorldBookForExport = (): { entries: Record<string, Omit<WorldBookEntry, "uid">> } => {
    const exportData: { entries: Record<string, Omit<WorldBookEntry, "uid">> } = {
      entries: {},
    };
    activeBookEntries.value.forEach((entry) => {
      const { uid, ...entryDataToExport } = entry;
      exportData.entries[String(entry.uid)] = entryDataToExport;
    });
    return exportData;
  };

  const exportToJson = (): void => {
    if (!activeBookEntries.value.length) {
      ElMessage.warning("当前世界书没有条目可以导出。");
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
    saveCallback();
  };

  const handleLoadFromJsonFile = (file: File): boolean => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>): void => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const loadedEntries = processImportedWorldBookData(jsonData);

        if (loadedEntries) {
          if (!activeBook.value) {
            ElMessage.error("没有活动的世界书，无法导入条目。");
            return;
          }
          activeBook.value.entries = loadedEntries;
          activeBook.value.updatedAt = new Date().toISOString();
          selectedEntryIndex.value = loadedEntries.length > 0 ? 0 : null;
          activeTab.value = loadedEntries.length > 0 ? "editor" : "list";
          saveCallback();
          ElMessage.success(`条目已成功导入并替换当前世界书: ${activeBook.value.name}`);
        } else {
          throw new Error('JSON文件格式不正确或无法处理。');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        ElMessage.error(`导入失败: ${errorMessage}`);
        console.warn("从文件导入世界书操作未成功完成:", error);
      }
    };

    reader.onerror = (): void => {
      const errorMsg = "文件读取出错";
      ElMessage.error(errorMsg);
      console.warn("从文件导入世界书操作未成功完成:", new Error(errorMsg));
    };

    reader.readAsText(file);
    return false;
  };

  const copyWorldBookToClipboard = async (): Promise<void> => {
    if (!activeBookEntries.value.length) {
      ElMessage.warning("当前世界书没有条目可以复制。");
      return;
    }
    const exportData = formatWorldBookForExport();
    const jsonString = JSON.stringify(exportData, null, 2);
    await copyToClipboard(jsonString, "整个世界书数据已复制到剪贴板！");
  };

  const showImportWorldBookDialog = async (): Promise<void> => {
    try {
      const { value } = await ElMessageBox.prompt(
        '请粘贴世界书条目的JSON数据。警告：此操作将替换当前活动世界书的所有条目。',
        "从剪贴板导入条目",
        {
          confirmButtonText: "确认导入",
          cancelButtonText: "取消",
          inputType: "textarea",
          inputPlaceholder: "在此处粘贴世界书条目JSON数据...",
          customClass: "app-dialog break-all app-messagebox-textarea-8",
          inputValidator: (val) => {
            if (!val || val.trim() === "") return "输入内容不能为空。";
            try {
              const parsed = JSON.parse(val);
              if (typeof parsed !== "object" || parsed === null) {
                return "数据格式无效，请输入正确的JSON。";
              }
              if (!('entries' in parsed)) {
                return '数据格式无效，根对象必须包含 "entries" 对象。';
              }
              return true;
            } catch {
              return "数据格式无效，请输入正确的JSON。";
            }
          },
        }
      );

      const jsonData = JSON.parse(value);
      const loadedEntries = processImportedWorldBookData(jsonData);

      if (loadedEntries) {
        if (!activeBook.value) {
          ElMessage.error("没有活动的世界书，无法导入条目。");
          return;
        }
        activeBook.value.entries = loadedEntries;
        activeBook.value.updatedAt = new Date().toISOString();
        selectedEntryIndex.value = loadedEntries.length > 0 ? 0 : null;
        activeTab.value = loadedEntries.length > 0 ? "editor" : "list";
        saveCallback();
        ElMessage.success(`条目已成功从剪贴板导入并替换当前世界书: ${activeBook.value.name}`);
      } else {
        throw new Error("数据结构不符合预期。");
      }
    } catch (error) {
      if (error !== "cancel") {
        const errorMessage = error instanceof Error ? error.message : String(error);
        ElMessage.error(`导入失败: ${errorMessage}`);
        console.warn("从剪贴板导入条目操作未成功完成:", error);
      }
    }
  };

  const clearAllEntries = async (): Promise<void> => {
    if (!activeBook.value) {
      ElMessage.warning("没有活动的世界书可供清空。");
      return;
    }
    try {
      await ElMessageBox.confirm(
        `确定要清空世界书 "${activeBook.value.name}" 中的所有条目吗？此操作不可恢复！`,
        "清空当前世界书",
        {
          confirmButtonText: "确认清空",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      if (activeBook.value) {
        activeBook.value.entries = [];
        activeBook.value.updatedAt = new Date().toISOString();
      }
      selectedEntryIndex.value = null;
      editableEntry.value = {};
      activeTab.value = "list";
      saveCallback();
    } catch (err) {
      if (err !== "cancel")
        console.warn("清空条目操作未成功完成:", err);
    }
  };

  const forceUpdateEntries = () => {
    if (activeBook.value) {
      // This is a trick to force re-evaluation of computed properties
      // that depend on the entries array.
      const newEntries = [...activeBook.value.entries];
      activeBook.value.entries = newEntries;
    }
  };

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
  };
}