// src/modules/character/store/characterEditor.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue'; // 导入 ref
// 预期的类型导入，待角色卡类型定义完善后启用
// import type { ICharacterEditorForm } from '@character/types/character.types';

/**
 * @store useCharacterEditorStore
 * @description 管理角色卡编辑器相关的状态和操作。
 *              例如，角色卡表单数据、加载和重置表单等。
 */
export const useCharacterEditorStore = defineStore('characterEditor', () => {
  // --- State ---
  /**
   * @state form
   * @description 存储角色卡编辑器的表单数据。
   *              类型将是 ICharacterEditorForm (或类似的具体类型)。
   * @type {import('vue').Ref<ICharacterEditorForm | null>} // 示例类型，待具体化
   */
  // const form = ref<ICharacterEditorForm | null>(null); // 示例：初始化为 null 或默认对象
  // 或者：
  // const form = ref<ICharacterEditorForm>(createDefaultCharacterCard()); // 示例：通过函数初始化

  // --- Getters ---
  // 例如：
  /**
   * @getter isFormValid
   * @description 计算属性，判断当前表单数据是否有效。
   * @returns {boolean}
   */
  // const isFormValid = computed(() => { /* ... 校验逻辑 ... */ return true; });

  // --- Actions ---
  /**
   * @action createDefaultCharacterCard
   * @description (示例) 创建一个默认的角色卡数据对象。
   * @returns {ICharacterEditorForm} 一个新的角色卡表单对象。
   */
  // function createDefaultCharacterCard(): ICharacterEditorForm {
  //   // return { /* ... 初始默认角色数据 ... */ } as ICharacterEditorForm;
  //   return {} as ICharacterEditorForm; // 占位
  // }

  /**
   * @action loadCharacterData
   * @description 加载传入的角色数据到编辑器表单中。
   * @param {Partial<ICharacterEditorForm>} data - 要加载的角色卡数据。
   */
  // function loadCharacterData(data: Partial<ICharacterEditorForm>) {
  //   // if (form.value) {
  //   //   Object.assign(form.value, data);
  //   // } else {
  //   //   form.value = { ...createDefaultCharacterCard(), ...data };
  //   // }
  // }

  /**
   * @action resetCharacterForm
   * @description 重置角色卡编辑器表单为默认状态。
   */
  // function resetCharacterForm() {
  //   // form.value = createDefaultCharacterCard();
  // }

  return {
    // State
    // form,
    // Getters
    // isFormValid,
    // Actions
    // loadCharacterData,
    // resetCharacterForm,
    // createDefaultCharacterCard, // 如果作为可外部调用的 action
  };
});