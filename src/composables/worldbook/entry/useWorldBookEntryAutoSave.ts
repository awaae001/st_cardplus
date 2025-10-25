import { ref, onMounted, onBeforeUnmount, type Ref } from "vue";
import { ElMessage } from "element-plus";
import { initAutoSave, clearAutoSave } from "../../../utils/localStorageUtils";
import { watchDebounced } from "@vueuse/core";
import type { WorldBookEntry } from "../../../types/types";

type EntryCallbacks = {
  updateEntry: (entry: WorldBookEntry) => Promise<void>;
};

type EntryState = {
  selectedEntry: Ref<WorldBookEntry | null>;
  editableEntry: Ref<Partial<WorldBookEntry>>;
  hasUnsavedChanges: Ref<boolean>;
  lastSavedData: Ref<string>;
  saveStatus: Ref<'idle' | 'saving' | 'saved' | 'error'>;
  lastSaveTime: Ref<Date | null>;
  activeBookEntries: Ref<WorldBookEntry[]>;
};

export function useWorldBookEntryAutoSave(
  state: EntryState,
  callbacks: EntryCallbacks
) {
  const {
    selectedEntry,
    editableEntry,
    hasUnsavedChanges,
    lastSavedData,
    saveStatus,
    lastSaveTime,
    activeBookEntries,
  } = state;

  const autoSaveMode = ref<'auto' | 'watch' | 'manual'>('watch');
  const isAutoSaving = ref(false);
  let autoSaveTimer: number | null = null;

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

  const autoSaveCurrentEntry = async () => {
    if (autoSaveMode.value === 'manual') return;
    if (!selectedEntry.value || !editableEntry.value.uid) return;
    if (!hasUnsavedChanges.value) return;
    if (isAutoSaving.value) return;

    isAutoSaving.value = true;
    saveStatus.value = 'saving';

    try {
      const entryToSave = JSON.parse(JSON.stringify(editableEntry.value)) as WorldBookEntry;
      const targetIndex = activeBookEntries.value.findIndex(e => e.uid === entryToSave.uid);

      if (targetIndex !== -1) {
        activeBookEntries.value[targetIndex] = entryToSave;
      }

      await callbacks.updateEntry(entryToSave);

      lastSavedData.value = JSON.stringify(entryToSave);
      hasUnsavedChanges.value = false;
      saveStatus.value = 'saved';
      lastSaveTime.value = new Date();

      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle';
        }
      }, 2000);
    } catch (error) {
      console.error('[useWorldBookEntry] 自动保存失败:', error);
      saveStatus.value = 'error';
      setTimeout(() => {
        if (saveStatus.value === 'error') {
          saveStatus.value = 'idle';
        }
      }, 5000);
    } finally {
      isAutoSaving.value = false;
    }
  };

  watchDebounced(
    editableEntry,
    () => {
      if (autoSaveMode.value === 'watch') {
        autoSaveCurrentEntry();
      }
    },
    { debounce: 500, deep: true }
  );

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

  onBeforeUnmount(() => {
    if (autoSaveTimer) {
      clearAutoSave(autoSaveTimer);
    }
  });

  return {
    autoSaveMode,
    toggleAutoSaveMode,
  };
}