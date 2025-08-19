import { onMounted, onBeforeUnmount, type Ref } from 'vue';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  initAutoSave,
  clearAutoSave
} from '../../utils/localStorageUtils';
import type { CharacterCard } from '../../types/character';

export function useCharacterCardLifecycle(form: Ref<CharacterCard>, processLoadedData: (data: any) => CharacterCard) {
  let autoSaveTimer: number | null = null;

  onMounted(() => {
    const loadedData = loadFromLocalStorage('characterCardData', processLoadedData);
    if (loadedData) {
      form.value = loadedData;
    }
    autoSaveTimer = initAutoSave(
      () => saveToLocalStorage(form.value),
      () => !!form.value.chineseName
    );
  });

  onBeforeUnmount(() => {
    if (autoSaveTimer) {
      clearAutoSave(autoSaveTimer);
    }
  });
}