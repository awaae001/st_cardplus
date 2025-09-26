import { watch } from 'vue';
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils/localStorageUtils';
import type { SillyTavernRegexScript } from './types';
import type { Ref } from 'vue';

const REGEX_SIMULATOR_STATE_KEY = 'regexSimulatorState';

// 定义需要持久化的状态的接口
interface PersistentRegexState {
  formState: SillyTavernRegexScript;
  testString: string;
  smartInputText: string;
  userMacroValue: string;
  charMacroValue: string;
  renderHtml: boolean;
  trimStrings: string;
}

/**
 * 一个 Vue Composable，用于将正则表达式模拟器的状态持久化到本地存储。
 * @param stateRefs 包含组件中所有需要持久化的状态的 Ref 对象的字典。
 * @param createDefaultScript 一个函数，用于创建默认的脚本状态。
 */
export function useRegexPersistence(
  stateRefs: {
    formState: Ref<SillyTavernRegexScript>;
    testString: Ref<string>;
    smartInputText: Ref<string>;
    userMacroValue: Ref<string>;
    charMacroValue: Ref<string>;
    renderHtml: Ref<boolean>;
    trimStrings: Ref<string>;
  },
  createDefaultScript: () => SillyTavernRegexScript
) {
  let saveStateTimer: number | null = null;

  /**
   * 从本地存储加载状态并应用到组件的 Ref 中。
   */
  const loadState = () => {
    const savedState = loadFromLocalStorage(REGEX_SIMULATOR_STATE_KEY) as Partial<PersistentRegexState>;

    const defaultScript = createDefaultScript();
    
    if (savedState) {
      // 合并加载的状态和默认脚本，以确保所有字段都存在
      const loadedFormState = { ...defaultScript, ...(savedState.formState || {}) };
      
      // 逐个赋值以保持响应性
      Object.assign(stateRefs.formState.value, loadedFormState);
      
      stateRefs.testString.value = savedState.testString ?? '';
      stateRefs.smartInputText.value = savedState.smartInputText ?? '';
      stateRefs.userMacroValue.value = savedState.userMacroValue ?? '测试用户';
      stateRefs.charMacroValue.value = savedState.charMacroValue ?? '测试角色';
      stateRefs.renderHtml.value = savedState.renderHtml ?? false;
      stateRefs.trimStrings.value = savedState.trimStrings ?? '';
    }
  };

  /**
   * 将当前状态保存到本地存储。
   */
  const saveState = () => {
    const currentState: PersistentRegexState = {
      formState: stateRefs.formState.value,
      testString: stateRefs.testString.value,
      smartInputText: stateRefs.smartInputText.value,
      userMacroValue: stateRefs.userMacroValue.value,
      charMacroValue: stateRefs.charMacroValue.value,
      renderHtml: stateRefs.renderHtml.value,
      trimStrings: stateRefs.trimStrings.value,
    };
    saveToLocalStorage(currentState, REGEX_SIMULATOR_STATE_KEY);
  };

  // 使用 setTimeout 实现防抖
  const debouncedSave = () => {
    if (saveStateTimer) {
      clearTimeout(saveStateTimer);
    }
    saveStateTimer = window.setTimeout(() => {
      saveState();
    }, 50); // 50ms 延迟
  };

  // 监听所有相关状态的变化，并在变化时触发防抖保存
  watch(
    [
      stateRefs.formState,
      stateRefs.testString,
      stateRefs.smartInputText,
      stateRefs.userMacroValue,
      stateRefs.charMacroValue,
      stateRefs.renderHtml,
      stateRefs.trimStrings,
    ],
    debouncedSave,
    { deep: true }
  );

  // 返回加载函数，以便在组件挂载时调用
  return {
    loadState,
  };
}