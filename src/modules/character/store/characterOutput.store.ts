// src/modules/character/store/characterOutput.store.ts
import { defineStore } from 'pinia';
// import type { CharacterOutputForm } from '@character/types/characterOutput.types'; // 路径待确认和创建类型文件

export const useCharacterOutputStore = defineStore('characterOutput', () => {
  // --- State ---
  // const form = ref<CharacterOutputForm>(createDefaultOutputForm()); // 示例，后续实现

  // --- Getters ---
  // ...

  // --- Actions ---
  // function createDefaultOutputForm(): CharacterOutputForm { // 示例
  //   return { /* ... default data ... */ } as CharacterOutputForm;
  // }

  // function loadOutputData(data: any) {
  //   // ...
  // }

  // function resetOutputForm() {
  //   // form.value = createDefaultOutputForm();
  // }

  return {
    // form,
    // loadOutputData,
    // resetOutputForm,
  };
});