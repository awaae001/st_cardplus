import { computed, ref, watch } from 'vue';

export interface PresetClipboardItem {
  id: string;
  title: string;
  content: string;
}

const STORAGE_KEY = 'preset-clipboard';

function loadClipboard(): PresetClipboardItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveClipboard(items: PresetClipboardItem[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function usePresetClipboard() {
  const clipboardItems = ref<PresetClipboardItem[]>(loadClipboard());

  watch(clipboardItems, (val) => saveClipboard(val), { deep: true });

  const hasItems = computed(() => clipboardItems.value.length > 0);

  const addItem = (item: PresetClipboardItem) => {
    clipboardItems.value.push(item);
  };

  const removeItem = (id: string) => {
    clipboardItems.value = clipboardItems.value.filter(i => i.id !== id);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const items = [...clipboardItems.value];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    clipboardItems.value = items;
  };

  const moveDown = (index: number) => {
    if (index >= clipboardItems.value.length - 1) return;
    const items = [...clipboardItems.value];
    [items[index + 1], items[index]] = [items[index], items[index + 1]];
    clipboardItems.value = items;
  };

  const clearAll = () => {
    clipboardItems.value = [];
  };

  return {
    clipboardItems,
    hasItems,
    addItem,
    removeItem,
    moveUp,
    moveDown,
    clearAll,
  };
}
