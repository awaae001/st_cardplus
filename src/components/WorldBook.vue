<template>
  <div class="worldbook-container">
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
              <button @click="addNewEntry" class="btn-primary-adv worldbook-add-button" aria-label="新增条目">
                <Icon icon="ph:plus-circle-duotone" class="worldbook-add-icon" />
              </button>
            </el-tooltip>
          </div>
          <WorldBookEntryList 
            :entries="worldBookEntries" 
            :selected-index="selectedEntryIndex" 
            @select-entry="handleSelectEntry" 
          />

          <div class="content-panel-header worldbook-bottom-panel-header">
            <WorldBookActions 
              context="list" 
              @copy-book="copyWorldBookToClipboard"
              @import-book="showImportWorldBookDialog"
              @export-json="exportToJson"
              @import-json="handleLoadFromJsonFile"
              @clear-all="clearAllEntries"
            />
          </div>
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
            <WorldBookActions 
              context="editor"
              :has-selection="!!selectedEntry"
              @copy-entry="copySelectedEntry"
              @import-entry="showImportEntryDialog"
              @save-entry="saveCurrentEntry"
              @delete-entry="deleteSelectedEntry"
            />
          </div>
          <WorldBookEditor 
            :entry="selectedEntry" 
            v-model="editableEntry" 
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="worldbook-desktop-layout">
      <div class="worldbook-desktop-panel-left">
        <div class="content-panel-header">
          <h2 class="content-panel-title">
            <Icon icon="ph:list-bullets-duotone" class="content-panel-icon" />
            世界书条目
          </h2>
          <el-tooltip content="新增条目" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
            <button @click="addNewEntry" class="btn-primary-adv worldbook-add-button-desktop" aria-label="新增条目">
              <Icon icon="ph:plus-circle-duotone" class="worldbook-add-icon-desktop" />
            </button>
          </el-tooltip>
        </div>
        <WorldBookEntryList 
          :entries="worldBookEntries" 
          :selected-index="selectedEntryIndex" 
          @select-entry="handleSelectEntry" 
        />
        <div class="content-panel-header worldbook-bottom-panel-header-desktop">
          <WorldBookActions 
            context="list" 
            @copy-book="copyWorldBookToClipboard"
            @import-book="showImportWorldBookDialog"
            @export-json="exportToJson"
            @import-json="handleLoadFromJsonFile"
            @clear-all="clearAllEntries"
          />
        </div>
      </div>

      <div class="worldbook-desktop-panel-right">
        <div class="content-panel-header">
          <h2 class="content-panel-title">
            <Icon icon="ph:note-pencil-duotone" class="content-panel-icon" />
            编辑:
            <span class="content-panel-text-highlight">{{
              selectedEntry ? selectedEntry.comment || "新条目" : "未选择条目"
            }}</span>
          </h2>
          <WorldBookActions 
            context="editor"
            :has-selection="!!selectedEntry"
            @copy-entry="copySelectedEntry"
            @import-entry="showImportEntryDialog"
            @save-entry="saveCurrentEntry"
            @delete-entry="deleteSelectedEntry"
          />
        </div>
        <WorldBookEditor 
          :entry="selectedEntry" 
          v-model="editableEntry" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox, ElTabs, ElTabPane, ElTooltip } from "element-plus";
import { Icon } from "@iconify/vue";
import '../css/worldbook.css'
// import { saveAs } from 'file-saver';
import {
  saveToLocalStorage as saveToLS,
  loadFromLocalStorage as loadFromLS,
  // clearLocalStorage as clearLS,
  initAutoSave as initWorldBookAutoSave,
  clearAutoSave as clearWorldBookAutoSave,
} from "../utils/localStorageUtils";
import type { WorldBookEntry } from "./worldbook/types";

interface AppSettings {
  isAutoSaveEnabled: boolean;
  safeModeLevel: number;
}

interface ExportData {
  entries: Record<string, Omit<WorldBookEntry, "uid">>;
}
import WorldBookActions from "./worldbook/WorldBookActions.vue";
import WorldBookEditor from "./worldbook/WorldBookEditor.vue";
import WorldBookEntryList from "./worldbook/WorldBookEntryList.vue";

const LOCAL_STORAGE_KEY_WORLDBOOK = "worldBookEditorData";

const worldBookEntries = ref<WorldBookEntry[]>([]);
const selectedEntryIndex = ref<number | null>(null);
const editableEntry = ref<Partial<WorldBookEntry>>({});
const activeTab = ref<"list" | "editor">("list");
let autoSaveTimer: number | null = null;

const appSettings: AppSettings = {
  isAutoSaveEnabled: true,
  safeModeLevel: 0
};

const selectedEntry = computed<WorldBookEntry | null>(() => {
  if (
    selectedEntryIndex.value !== null &&
    worldBookEntries.value[selectedEntryIndex.value]
  ) {
    return worldBookEntries.value[selectedEntryIndex.value];
  }
  return null;
});

watch(
  selectedEntry,
  (newEntry) => {
    if (newEntry) {
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
  { deep: true, immediate: true }
);

const createDefaultEntryData = (uid: number): WorldBookEntry => ({
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

const addNewEntry = () => {
  const newUid = Date.now();
  const newEntryData = createDefaultEntryData(newUid);
  newEntryData.comment = `新条目 ${worldBookEntries.value.length + 1}`;
  worldBookEntries.value.unshift(newEntryData);
  selectedEntryIndex.value = 0;
  activeTab.value = "editor";
};

const handleSelectEntry = (indexStr: string) => {
  const index = parseInt(indexStr, 10);
  if (index >= 0 && index < worldBookEntries.value.length) {
    selectedEntryIndex.value = index;
    activeTab.value = "editor";
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
    worldBookEntries.value[selectedEntryIndex.value] = JSON.parse(
      JSON.stringify(entryToSave as WorldBookEntry)
    );
    ElMessage.success("条目已保存！");
    saveWorldBookToLocalStorage();
  } else {
    ElMessage.error("无法保存条目，缺少UID或未选择条目。");
  }
};

const deleteSelectedEntry = async (): Promise<void> => {
  if (selectedEntryIndex.value !== null && selectedEntry.value) {
    try {
      worldBookEntries.value.splice(selectedEntryIndex.value!, 1);
      if (worldBookEntries.value.length > 0) {
        selectedEntryIndex.value = Math.min(
          selectedEntryIndex.value,
          worldBookEntries.value.length - 1
        );
      } else {
        selectedEntryIndex.value = null;
        activeTab.value = "list";
      }
      saveWorldBookToLocalStorage();
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
  try {
    const entryToCopy = { ...selectedEntry.value };
    delete entryToCopy.uid;
    const jsonData = JSON.stringify(entryToCopy, null, 2);
    await navigator.clipboard.writeText(jsonData);
    ElMessage.success("当前条目数据已复制到剪贴板！");
  } catch (error) {
    ElMessage.error("复制失败: " + (error as Error).message);
  }
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
          `导入条目 ${worldBookEntries.value.length + 1}`,
        key: Array.isArray(parsedEntryData.key)
          ? parsedEntryData.key.map(String)
          : [],
        keysecondary: Array.isArray(parsedEntryData.keysecondary)
          ? parsedEntryData.keysecondary.map(String)
          : [],
      };
      worldBookEntries.value.unshift(newEntry);
      selectedEntryIndex.value = 0;
      activeTab.value = "editor";
      saveWorldBookToLocalStorage();
    } catch (error) {
      console.warn("从剪贴板粘贴新条目操作未成功完成:", error);
    }
  } catch (error) {
    console.warn("从剪贴板粘贴新条目操作未成功完成或被取消:", error);
  }
};

const formatWorldBookForExport = (): ExportData => {
  const exportData: ExportData = {
    entries: {},
  };
  worldBookEntries.value.forEach((entry) => {
    const { uid, ...entryDataToExport } = entry;
    exportData.entries[String(entry.uid)] = entryDataToExport;
  });
  return exportData;
};

const processImportedWorldBookData = (
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

const exportToJson = (): void => {
  if (!worldBookEntries.value.length) {
    ElMessage.warning("没有条目可以导出。");
    return;
  }
  const exportData = formatWorldBookForExport();
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "world_info.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  ElMessage.success("已导出为 world_info.json");
  saveWorldBookToLocalStorage();
};

const handleLoadFromJsonFile = (file: File): boolean => {
  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>): void => {
    try {
      const jsonData = JSON.parse(e.target?.result as string);
      const loadedEntries = processImportedWorldBookData(jsonData);

      if (loadedEntries && loadedEntries.length > 0) {
        worldBookEntries.value = loadedEntries;
        selectedEntryIndex.value = 0;
        activeTab.value = "editor";
        saveWorldBookToLocalStorage();
        ElMessage.success("世界书已成功从文件导入！");
      } else {
        throw new Error('JSON文件格式不正确: 根对象必须包含 "entries" 对象。');
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
  return false; // 保持原函数的返回值
};

const copyWorldBookToClipboard = async (): Promise<void> => {
  if (!worldBookEntries.value.length) {
    ElMessage.warning("没有条目可以复制。");
    return;
  }
  try {
    const exportData = formatWorldBookForExport();
    const jsonString = JSON.stringify(exportData, null, 2);
    await navigator.clipboard.writeText(jsonString);
    ElMessage.success("整个世界书数据已复制到剪贴板！");
  } catch (error) {
    ElMessage.error("复制世界书失败: " + (error as Error).message);
  }
};

const showImportWorldBookDialog = async (): Promise<void> => {
  try {
    const { value } = await ElMessageBox.prompt(
      '请粘贴整个世界书的JSON数据。警告：此操作将替换当前所有条目。', // 将警告信息整合到提示中
      "从剪贴板导入整个世界书",
      {
        confirmButtonText: "确认导入",
        cancelButtonText: "取消",
        inputType: "textarea",
        inputPlaceholder: "在此处粘贴世界书JSON数据...",
        customClass: "app-dialog break-all app-messagebox-textarea-8",
        inputValidator: (val) => {
          if (!val || val.trim() === "") return "输入内容不能为空。";
          try {
            const parsed = JSON.parse(val);
            if (
              typeof parsed !== "object" ||
              parsed === null ||
              typeof parsed.entries !== "object" ||
              parsed.entries === null
            ) {
              return '数据格式无效，根对象必须包含 "entries" 对象。';
            }
            return true;
          } catch {
            return "数据格式无效，请输入正确的JSON。";
          }
        },
      }
    );

    // 直接执行核心逻辑，不再需要 performSafeAction
    const jsonData = JSON.parse(value);
    const loadedEntries = processImportedWorldBookData(jsonData);

    if (loadedEntries && loadedEntries.length > 0) {
      worldBookEntries.value = loadedEntries;
      selectedEntryIndex.value = 0;
      activeTab.value = "editor";
      saveWorldBookToLocalStorage();
      ElMessage.success("世界书已成功从剪贴板导入！");
    } else {
      throw new Error("数据结构不符合预期。");
    }
  } catch (error) {
    // ElMessageBox 点击取消或关闭时会 reject 一个 "cancel" 字符串
    if (error !== "cancel") {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ElMessage.error(`导入失败: ${errorMessage}`);
      console.warn("从剪贴板导入整个世界书操作未成功完成:", error);
    }
  }
};

const clearAllEntries = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      "确定要清空所有条目吗？此操作不可恢复！",
      "清空所有条目",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    worldBookEntries.value = [];
    selectedEntryIndex.value = null;
    editableEntry.value = {};
    activeTab.value = "list";
    saveWorldBookToLocalStorage();
  } catch (err) {
    if (err !== "cancel")
      console.warn("清空条目操作未成功完成:", err);
  }
};

const saveWorldBookToLocalStorage = (): void => {
  if (appSettings.isAutoSaveEnabled || !autoSaveTimer) {
    saveToLS(formatWorldBookForExport(), LOCAL_STORAGE_KEY_WORLDBOOK);
  }
};

onMounted(() => {
  const loadedData = loadFromLS(LOCAL_STORAGE_KEY_WORLDBOOK);
  if (loadedData) {
    const processed = processImportedWorldBookData(loadedData);
    if (processed && processed.length > 0) {
      worldBookEntries.value = processed;
      selectedEntryIndex.value = 0;
      activeTab.value = "editor";
    }
  }

  if (appSettings.isAutoSaveEnabled) {
    autoSaveTimer = initWorldBookAutoSave(
      () => saveToLS(formatWorldBookForExport(), LOCAL_STORAGE_KEY_WORLDBOOK),
      () => worldBookEntries.value.length > 0
    );
  }
});

onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearWorldBookAutoSave(autoSaveTimer);
  }
});

watch(
  () => appSettings.isAutoSaveEnabled,
  (newValue) => {
    if (newValue) {
      if (!autoSaveTimer) {
        autoSaveTimer = initWorldBookAutoSave(
          () => saveToLS(formatWorldBookForExport(), LOCAL_STORAGE_KEY_WORLDBOOK),
          () => worldBookEntries.value.length > 0
        );
        ElMessage.info("世界书自动保存已开启");
      }
    } else {
      if (autoSaveTimer) {
        clearWorldBookAutoSave(autoSaveTimer);
        autoSaveTimer = null;
        ElMessage.info("世界书自动保存已关闭");
      }
    }
  }
);

watch(
  worldBookEntries,
  () => {
    saveWorldBookToLocalStorage();
  },
  { deep: true }
);
</script>