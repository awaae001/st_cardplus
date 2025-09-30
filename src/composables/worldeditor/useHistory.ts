import { ref, readonly, onMounted } from 'vue';
import type { HistoryEntry } from '@/types/world-editor';
import { v4 as uuidv4 } from 'uuid';

export function useHistory(storageKey: string, maxHistorySize = 100) {
  const history = ref<HistoryEntry[]>([]);
  const currentIndex = ref(-1);

  const canUndo = ref(false);
  const canRedo = ref(false);

  const saveToSession = () => {
    try {
      const state = {
        history: history.value,
        currentIndex: currentIndex.value,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save history to sessionStorage", e);
    }
  };

  onMounted(() => {
    try {
      const savedState = sessionStorage.getItem(storageKey);
      if (savedState) {
        const { history: savedHistory, currentIndex: savedIndex } = JSON.parse(savedState);
        history.value = savedHistory;
        currentIndex.value = savedIndex;
        updateUndoRedoState();
      }
    } catch (e) {
      console.error("Failed to load history from sessionStorage", e);
    }
  });

  const updateUndoRedoState = () => {
    canUndo.value = currentIndex.value > 0;
    canRedo.value = currentIndex.value < history.value.length - 1;
  };

  const add = (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    // If we are in the middle of history, truncate the future
    if (currentIndex.value < history.value.length - 1) {
      history.value.splice(currentIndex.value + 1);
    }

    const newEntry: HistoryEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };

    history.value.push(newEntry);

    // Limit history size
    if (history.value.length > maxHistorySize) {
      history.value.shift();
    }

    currentIndex.value = history.value.length - 1;
    updateUndoRedoState();
    saveToSession();
  };

  const undo = () => {
    if (canUndo.value) {
      currentIndex.value--;
      updateUndoRedoState();
      saveToSession();
      // Return a deep copy to prevent accidental mutation of history state
      return JSON.parse(JSON.stringify(history.value[currentIndex.value + 1].previousState));
    }
    return null;
  };

  const redo = () => {
    if (canRedo.value) {
      currentIndex.value++;
      updateUndoRedoState();
      saveToSession();
      // Return a deep copy
      return JSON.parse(JSON.stringify(history.value[currentIndex.value].newState));
    }
    return null;
  };

  const clear = () => {
    history.value = [];
    currentIndex.value = -1;
    updateUndoRedoState();
    sessionStorage.removeItem(storageKey);
  };

  return {
    history: readonly(history),
    canUndo: readonly(canUndo),
    canRedo: readonly(canRedo),
    add,
    undo,
    redo,
    clear,
  };
}