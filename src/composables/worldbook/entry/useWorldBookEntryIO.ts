import { ElMessage, ElMessageBox } from "element-plus";
import { copyToClipboard } from "../../../utils/clipboard";
import { createDefaultEntryData, processImportedWorldBookData } from "./useWorldBookEntryData";
import type { WorldBookEntry, WorldBook } from "../../../types/types";
import type { Ref } from "vue";

type EntryCallbacks = {
  updateEntries: (entries: WorldBookEntry[]) => Promise<void>;
  addEntry: (entry: WorldBookEntry) => Promise<WorldBookEntry | null>;
};

type EntryState = {
  activeBook: Ref<WorldBook | null>;
  activeBookEntries: Ref<WorldBookEntry[]>;
  selectedEntryIndex: Ref<number | null>;
  activeTab: Ref<"list" | "editor">;
};

export function useWorldBookEntryIO(
  state: EntryState,
  callbacks: EntryCallbacks
) {
  const { activeBook, activeBookEntries, selectedEntryIndex, activeTab } = state;

  const showImportEntryDialog = async (): Promise<void> => {
    try {
      const importEntryResult = await ElMessageBox.prompt(
        "请粘贴单个世界书条目的JSON数据到下方：", "粘贴为新条目",
        { confirmButtonText: "确认导入", cancelButtonText: "取消", inputType: "textarea" }
      );
      const { value } = importEntryResult as { value: string };
      if (!activeBook.value) { ElMessage.error("没有活动的世界书，无法导入条目"); return; }

      const parsedEntryData = JSON.parse(value);
      const newUid = Date.now();
      const newEntry: WorldBookEntry = {
        ...createDefaultEntryData(newUid), ...parsedEntryData, uid: newUid,
      };

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
      const importBookResult = await ElMessageBox.prompt(
        '请粘贴世界书条目的JSON数据 警告：此操作将替换当前活动世界书的所有条目', '从剪贴板导入条目',
        { confirmButtonText: "确认导入", cancelButtonText: "取消", inputType: "textarea" }
      );
      const { value } = importBookResult as { value: string };
      if (!activeBook.value) throw new Error("没有活动的世界书");

      const jsonData = JSON.parse(value);
      const loadedEntries = processImportedWorldBookData(jsonData);

      if (loadedEntries) {
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

  return {
    showImportEntryDialog,
    exportToJson,
    handleLoadFromJsonFile,
    copyWorldBookToClipboard,
    showImportWorldBookDialog,
  };
}
