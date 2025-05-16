// src/modules/character/store/characterEditor.store.ts
import { defineStore } from 'pinia';
// import type { CharacterCard } from '@character/types/character.types'; // 路径待确认和创建类型文件

export const useCharacterEditorStore = defineStore('characterEditor', () => {
  // --- State ---
  // const form = ref<CharacterCard>(createDefaultCharacterCard()); // 示例，后续实现

  // --- Getters ---
  // ...

  // --- Actions ---
  // function createDefaultCharacterCard(): CharacterCard { // 示例
  //   return { /* ... default data ... */ } as CharacterCard;
  // }

  // function loadCharacterData(data: any) {
  //   // ...
  // }

  // function resetCharacterForm() {
  //   // form.value = createDefaultCharacterCard();
  // }

  return {
    // form,
    // loadCharacterData,
    // resetCharacterForm,
  };
});