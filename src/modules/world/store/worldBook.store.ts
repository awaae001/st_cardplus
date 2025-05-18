// src/modules/world/store/worldBook.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue'; // 导入 ref
// 预期的类型导入，待世界书相关类型定义完善后启用
// import type { IWorldBookEntry } from '@world/types/world.types';

/**
 * @store useWorldBookStore
 * @description 管理世界书条目、当前加载的世界以及相关操作。
 */
export const useWorldBookStore = defineStore('worldBook', () => {
  // --- State ---
  /**
   * @state entries
   * @description 当前加载的世界书中的所有条目。
   * @type {import('vue').Ref<IWorldBookEntry[]>}
   */
  // const entries = ref<IWorldBookEntry[]>([]);

  /**
   * @state currentWorldName
   * @description 当前加载的世界的名称或标识符。
   * @type {import('vue').Ref<string | null>}
   */
  // const currentWorldName = ref<string | null>(null);

  // --- Getters ---
  // 例如：
  /**
   * @getter getEntryById
   * @description 根据 ID 获取特定的世界书条目。
   * @param {string} entryId - 条目的 ID。
   * @returns {IWorldBookEntry | undefined} 对应的条目，如果未找到则返回 undefined。
   */
  // const getEntryById = computed(() => (entryId: string) => {
  //   return entries.value.find(entry => entry.id === entryId);
  // });

  // --- Actions ---
  /**
   * @action addEntry
   * @description 向当前世界书中添加一个新的条目。
   * @param {IWorldBookEntry} entry - 要添加的世界书条目。
   */
  // function addEntry(entry: IWorldBookEntry) {
  //   // entries.value.push(entry);
  // }

  /**
   * @action removeEntry
   * @description 从当前世界书中移除一个条目。
   * @param {string} entryId - 要移除条目的 ID。
   */
  // function removeEntry(entryId: string) {
  //   // entries.value = entries.value.filter(entry => entry.id !== entryId);
  // }

  /**
   * @action updateEntry
   * @description 更新现有世界书条目。
   * @param {string} entryId - 要更新条目的 ID。
   * @param {Partial<IWorldBookEntry>} updatedData - 更新的数据。
   */
  // function updateEntry(entryId: string, updatedData: Partial<IWorldBookEntry>) {
  //   // const index = entries.value.findIndex(entry => entry.id === entryId);
  //   // if (index !== -1) {
  //   //   entries.value[index] = { ...entries.value[index], ...updatedData };
  //   // }
  // }

  /**
   * @action loadWorldBook
   * @description 加载指定世界的世界书数据。
   * @param {string} worldName - 要加载的世界的名称。
   * @returns {Promise<void>}
   */
  // async function loadWorldBook(worldName: string) {
  //   // currentWorldName.value = worldName;
  //   // // 示例：此处应有从持久化存储（如 localStorage 或 API）加载数据的逻辑
  //   // const loadedEntries = []; // = await api.fetchWorldBook(worldName);
  //   // entries.value = loadedEntries;
  // }

  /**
   * @action saveWorldBook
   * @description 保存当前世界书数据到持久化存储。
   * @returns {Promise<void>}
   */
  // async function saveWorldBook() {
  //   // if (currentWorldName.value) {
  //   //   // 示例：此处应有将 entries.value 保存到持久化存储的逻辑
  //   //   // await api.saveWorldBook(currentWorldName.value, entries.value);
  //   // }
  // }

  return {
    // State
    // entries,
    // currentWorldName,
    // Getters
    // getEntryById,
    // Actions
    // addEntry,
    // removeEntry,
    // updateEntry,
    // loadWorldBook,
    // saveWorldBook,
  };
});