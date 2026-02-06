import { ElMessage } from "element-plus";
import { copyToClipboard } from "../../../utils/clipboard";
import type { WorldBookEntry, WorldBook } from "../../../types/types";
import type { Ref } from "vue";

type EntryState = {
  activeBook: Ref<WorldBook | null>;
  activeBookEntries: Ref<WorldBookEntry[]>;
};

export function useWorldBookEntryIO(state: EntryState) {
  const { activeBook, activeBookEntries } = state;

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

  const copyWorldBookToClipboard = async (): Promise<void> => {
    if (!activeBookEntries.value.length) {
      ElMessage.warning("当前世界书没有条目可以复制");
      return;
    }
    const exportData = formatWorldBookForExport();
    const jsonString = JSON.stringify(exportData, null, 2);
    await copyToClipboard(jsonString, "整个世界书数据已复制到剪贴板！");
  };

  return {
    exportToJson,
    copyWorldBookToClipboard,
  };
}
