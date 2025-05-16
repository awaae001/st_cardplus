// src/modules/core/store/appSettings.store.ts

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 定义安全模式的级别类型
export type SafeModeLevel = 'forbidden' | 'double' | 'single'

export const useAppSettingsStore = defineStore('appSettings', () => {
  // --- State ---
  const isAutoSaveEnabled = ref<boolean>(true)
  // 将安全模式状态改为字符串类型，默认为 'forbidden' (禁止删除)
  const safeModeLevel = ref<SafeModeLevel>('forbidden')

  // --- Getters (可选，方便使用) ---
  const isDeletionForbidden = computed(() => safeModeLevel.value === 'forbidden')
  const requiresDoubleConfirm = computed(() => safeModeLevel.value === 'double')
  const requiresSingleConfirm = computed(() => safeModeLevel.value === 'single')

  // --- Actions ---
  // 自动保存 Actions
  function toggleAutoSave() {
    isAutoSaveEnabled.value = !isAutoSaveEnabled.value
  }
  function setAutoSave(value: boolean) {
    isAutoSaveEnabled.value = value
  }

  // 安全模式 Actions: 循环切换状态
  function cycleSafeMode() {
    if (safeModeLevel.value === 'forbidden') {
      safeModeLevel.value = 'double'
    } else if (safeModeLevel.value === 'double') {
      safeModeLevel.value = 'single'
    } else {
      safeModeLevel.value = 'forbidden'
    }
  }

  // (可选) 直接设置安全模式状态的函数
  function setSafeModeLevel(level: SafeModeLevel) {
    safeModeLevel.value = level
  }

  // 返回所有 state 和 actions
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