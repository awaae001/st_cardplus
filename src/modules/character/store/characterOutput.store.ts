// src/modules/character/store/characterOutput.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue'; // 导入 ref
// 预期的类型导入，待角色卡输出相关类型定义完善后启用
// import type { ICharacterOutputSettings } from '@character/types/character.types'; // 假设类型也在 character.types.ts 或新的 output.types.ts

/**
 * @store useCharacterOutputStore
 * @description 管理角色卡输出相关的状态和操作。
 *              例如，输出格式设置、要包含的字段等。
 */
export const useCharacterOutputStore = defineStore('characterOutput', () => {
  // --- State ---
  /**
   * @state settings
   * @description 存储角色卡输出的配置项。
   *              类型将是 ICharacterOutputSettings (或类似的具体类型)。
   * @type {import('vue').Ref<ICharacterOutputSettings | null>} // 示例类型，待具体化
   */
  // const settings = ref<ICharacterOutputSettings | null>(null); // 示例：初始化为 null 或默认对象
  // 或者：
  // const settings = ref<ICharacterOutputSettings>(createDefaultOutputSettings()); // 示例：通过函数初始化

  // --- Getters ---
  // 例如：
  /**
   * @getter outputFormat
   * @description 计算属性，获取当前的输出格式 (例如 'json', 'text')。
   * @returns {string | undefined}
   */
  // const outputFormat = computed(() => settings.value?.format);

  // --- Actions ---
  /**
   * @action createDefaultOutputSettings
   * @description (示例) 创建一个默认的角色卡输出配置对象。
   * @returns {ICharacterOutputSettings} 一个新的角色卡输出配置对象。
   */
  // function createDefaultOutputSettings(): ICharacterOutputSettings {
  //   // return { /* ... 初始默认输出配置 ... */ } as ICharacterOutputSettings;
  //   return {} as ICharacterOutputSettings; // 占位
  // }

  /**
   * @action loadOutputSettings
   * @description 加载传入的输出配置。
   * @param {Partial<ICharacterOutputSettings>} data - 要加载的输出配置数据。
   */
  // function loadOutputSettings(data: Partial<ICharacterOutputSettings>) {
  //   // if (settings.value) {
  //   //   Object.assign(settings.value, data);
  //   // } else {
  //   //   settings.value = { ...createDefaultOutputSettings(), ...data };
  //   // }
  // }

  /**
   * @action resetOutputSettings
   * @description 重置角色卡输出配置为默认状态。
   */
  // function resetOutputSettings() {
  //   // settings.value = createDefaultOutputSettings();
  // }

  return {
    // State
    // settings,
    // Getters
    // outputFormat,
    // Actions
    // loadOutputSettings,
    // resetOutputSettings,
    // createDefaultOutputSettings, // 如果作为可外部调用的 action
  };
});