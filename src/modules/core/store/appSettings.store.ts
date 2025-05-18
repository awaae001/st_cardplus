// src/modules/core/store/appSettings.store.ts

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 定义安全模式的级别类型
/**
 * @type {SafeModeLevel} 安全模式的级别。
 * 'forbidden': 禁止关键操作。
 * 'double': 关键操作需要双重确认。
 * 'single': 关键操作需要单击确认 (此模式在当前 safeAction.utils 中可能直接执行，具体行为取决于 performSafeAction 实现)。
 */
export type SafeModeLevel = 'forbidden' | 'double' | 'single'

/**
 * @store useAppSettingsStore
 * @description 管理应用程序的全局设置，例如自动保存和安全模式。
 */
export const useAppSettingsStore = defineStore('appSettings', () => {
  // --- State ---
  /**
   * @state isAutoSaveEnabled
   * @description 是否启用自动保存功能。
   * @type {import('vue').Ref<boolean>}
   */
  const isAutoSaveEnabled = ref<boolean>(true)
  /**
   * @state safeModeLevel
   * @description 当前的安全模式级别。默认为 'forbidden' (禁止)。
   * @type {import('vue').Ref<SafeModeLevel>}
   */
  const safeModeLevel = ref<SafeModeLevel>('forbidden')

  // --- Getters ---
  /**
   * @getter isDeletionForbidden
   * @description 计算属性，判断当前是否处于禁止删除模式。
   * @returns {boolean} 如果安全模式为 'forbidden'，则返回 true。
   */
  const isDeletionForbidden = computed(() => safeModeLevel.value === 'forbidden')
  /**
   * @getter requiresDoubleConfirm
   * @description 计算属性，判断当前是否需要双重确认。
   * @returns {boolean} 如果安全模式为 'double'，则返回 true。
   */
  const requiresDoubleConfirm = computed(() => safeModeLevel.value === 'double')
  /**
   * @getter requiresSingleConfirm
   * @description 计算属性，判断当前是否需要单击确认。
   * @returns {boolean} 如果安全模式为 'single'，则返回 true。
   */
  const requiresSingleConfirm = computed(() => safeModeLevel.value === 'single')

  // --- Actions ---
  /**
   * @action toggleAutoSave
   * @description 切换自动保存的启用状态。
   */
  function toggleAutoSave() {
    isAutoSaveEnabled.value = !isAutoSaveEnabled.value
  }
  /**
   * @action setAutoSave
   * @description 设置自动保存的启用状态。
   * @param {boolean} value - true 表示启用，false 表示禁用。
   */
  function setAutoSave(value: boolean) {
    isAutoSaveEnabled.value = value
  }

  /**
   * @action cycleSafeMode
   * @description 循环切换安全模式级别：forbidden -> double -> single -> forbidden。
   */
  function cycleSafeMode() {
    if (safeModeLevel.value === 'forbidden') {
      safeModeLevel.value = 'double'
    } else if (safeModeLevel.value === 'double') {
      safeModeLevel.value = 'single'
    } else {
      safeModeLevel.value = 'forbidden'
    }
  }

  /**
   * @action setSafeModeLevel
   * @description 直接设置安全模式的级别。
   * @param {SafeModeLevel} level - 要设置的安全模式级别。
   */
  function setSafeModeLevel(level: SafeModeLevel) {
    safeModeLevel.value = level
  }

  // 返回所有 state, getters 和 actions
  return {
    isAutoSaveEnabled,
    safeModeLevel, // 导出新的状态
    isDeletionForbidden, // 导出 Getters
    requiresDoubleConfirm,
    requiresSingleConfirm,
    toggleAutoSave,
    setAutoSave,
    cycleSafeMode,     // 导出新的 Action
    setSafeModeLevel,  // 导出新的 Action
  }
})