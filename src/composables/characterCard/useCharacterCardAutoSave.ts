import { ref, watch, type Ref } from 'vue';
import type { CharacterCardV3 } from '@/types/character-card-v3';
import { getSetting } from '@/utils/localStorageUtils';

export type AutoSaveMode = 'auto' | 'watch' | 'manual';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutoSaveOptions {
  // 角色卡数据（响应式）
  characterData: Ref<CharacterCardV3>;
  // 当前激活的角色卡 ID
  activeCardId: Ref<string | null>;
  // 是否正在加载数据（防止加载时触发保存）
  isLoadingData: Ref<boolean>;
  // 保存函数（由外部提供）
  onSave: (cardId: string, data: CharacterCardV3) => Promise<void>;
  // 自动保存模式
  autoSaveMode?: Ref<AutoSaveMode>;
  // 监听模式的防抖延迟（毫秒）
  watchDebounceMs?: number;
  // 自动模式的保存间隔（毫秒）
  autoSaveIntervalMs?: number;
}

/**
 * 角色卡自动保存 Composable
 *
 * 核心原则：
 * 1. 单一数据源：只监听 characterData
 * 2. 明确的保存时机：只在用户编辑后保存，数据加载时不保存
 * 3. 防止循环：使用 isLoadingData 标志防止加载时触发保存
 * 4. 状态管理：提供清晰的保存状态反馈
 */
export function useCharacterCardAutoSave(options: AutoSaveOptions) {
  const {
    characterData,
    activeCardId,
    isLoadingData,
    onSave,
    autoSaveMode = ref<AutoSaveMode>('watch'),
    watchDebounceMs,
    autoSaveIntervalMs,
  } = options;

  const intervalMs = ref<number>(
    typeof autoSaveIntervalMs === 'number' ? autoSaveIntervalMs : getSetting('autoSaveInterval') * 1000
  );
  const debounceMs = ref<number>(
    typeof watchDebounceMs === 'number' ? watchDebounceMs : getSetting('autoSaveDebounce') * 1000
  );

  // 保存状态
  const saveStatus = ref<SaveStatus>('idle');

  // 最后保存的数据快照（用于检测是否有变化）
  const lastSavedSnapshot = ref<string>('');

  // 是否正在保存中（防止并发保存）
  const isSaving = ref(false);

  /**
   * 执行保存操作
   */
  const performSave = async () => {
    // 1. 检查是否应该保存
    if (!shouldSave()) {
      console.log('[AutoSave] 跳过保存：条件不满足');
      return;
    }

    // 2. 检查数据是否有变化
    const currentSnapshot = JSON.stringify(characterData.value);
    if (currentSnapshot === lastSavedSnapshot.value) {
      console.log('[AutoSave] 跳过保存：数据无变化');
      return;
    }

    // 3. 防止并发保存
    if (isSaving.value) {
      console.log('[AutoSave] 跳过保存：正在保存中');
      return;
    }

    // 4. 数据验证：确保有有效的内容
    if (!hasValidContent(characterData.value)) {
      console.warn('[AutoSave] 跳过保存：数据无效或为空');
      return;
    }

    const cardId = activeCardId.value;
    if (!cardId) {
      console.log('[AutoSave] 跳过保存：没有激活的角色卡');
      return;
    }

    // 5. 执行保存
    console.log('[AutoSave] 开始保存角色卡:', cardId);
    console.log(
      '[AutoSave] 数据详情 - data.name:',
      characterData.value.data?.name,
      '顶层name:',
      characterData.value.name
    );
    isSaving.value = true;
    saveStatus.value = 'saving';

    try {
      await onSave(cardId, characterData.value);

      // 保存成功，更新快照
      lastSavedSnapshot.value = currentSnapshot;
      saveStatus.value = 'saved';
      console.log('[AutoSave] 保存成功！');

      // 2秒后隐藏"已保存"提示
      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle';
        }
      }, 2000);
    } catch (error) {
      console.error('[AutoSave] 保存失败:', error);
      saveStatus.value = 'error';

      // 5秒后隐藏错误提示
      setTimeout(() => {
        if (saveStatus.value === 'error') {
          saveStatus.value = 'idle';
        }
      }, 5000);
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * 检查是否应该执行保存
   */
  const shouldSave = (): boolean => {
    // 手动模式：完全禁用自动保存
    if (autoSaveMode.value === 'manual') {
      return false;
    }

    // 正在加载数据时不保存
    if (isLoadingData.value) {
      return false;
    }

    // 没有激活的角色卡时不保存
    if (!activeCardId.value) {
      return false;
    }

    return true;
  };

  /**
   * 验证角色卡数据是否有效
   */
  const hasValidContent = (data: CharacterCardV3): boolean => {
    const hasValidName = !!(data.name || data.data?.name);
    const hasAnyContent = !!(
      data.description ||
      data.personality ||
      data.scenario ||
      data.first_mes ||
      data.data?.description ||
      data.data?.personality ||
      data.data?.scenario ||
      data.data?.first_mes
    );

    return hasValidName || hasAnyContent;
  };

  /**
   * 手动触发保存（不受模式限制）
   */
  const manualSave = async () => {
    const cardId = activeCardId.value;
    if (!cardId) {
      console.warn('[AutoSave] 手动保存失败：没有激活的角色卡');
      return;
    }

    if (!hasValidContent(characterData.value)) {
      console.warn('[AutoSave] 手动保存失败：数据无效或为空');
      return;
    }

    isSaving.value = true;
    saveStatus.value = 'saving';

    try {
      await onSave(cardId, characterData.value);

      const currentSnapshot = JSON.stringify(characterData.value);
      lastSavedSnapshot.value = currentSnapshot;
      saveStatus.value = 'saved';

      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle';
        }
      }, 2000);
    } catch (error) {
      console.error('[AutoSave] 手动保存失败:', error);
      saveStatus.value = 'error';

      setTimeout(() => {
        if (saveStatus.value === 'error') {
          saveStatus.value = 'idle';
        }
      }, 5000);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  /**
   * 重置保存状态（在切换角色卡时调用）
   */
  const resetSaveState = () => {
    lastSavedSnapshot.value = '';
    saveStatus.value = 'idle';
    isSaving.value = false;
  };

  /**
   * 更新最后保存的快照（在加载角色卡后调用，防止误判为未保存）
   */
  const updateSavedSnapshot = () => {
    lastSavedSnapshot.value = JSON.stringify(characterData.value);
  };

  // 监听模式：用户停止编辑后自动保存
  let debounceTimer: number | null = null;
  const debouncedWatchSave = () => {
    if (autoSaveMode.value !== 'watch') return;
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = window.setTimeout(() => {
      performSave();
    }, debounceMs.value);
  };

  watch(characterData, debouncedWatchSave, { deep: true });

  // 自动模式：定时自动保存
  let autoSaveTimer: number | null = null;

  watch(
    autoSaveMode,
    (mode) => {
      // 清理旧的定时器
      if (autoSaveTimer !== null) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
      }

      // 如果是自动模式，启动定时器
      if (mode === 'auto') {
        autoSaveTimer = window.setInterval(() => {
          performSave();
        }, intervalMs.value);
      }
    },
    { immediate: true }
  );

  const handleIntervalChange = (event: Event) => {
    const detail = (event as CustomEvent<number>).detail;
    if (typeof detail !== 'number' || !Number.isFinite(detail)) return;
    intervalMs.value = detail * 1000;
    if (autoSaveMode.value === 'auto') {
      if (autoSaveTimer !== null) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
      }
      autoSaveTimer = window.setInterval(() => {
        performSave();
      }, intervalMs.value);
    }
  };

  window.addEventListener('autoSaveIntervalChange', handleIntervalChange);
  const handleDebounceChange = (event: Event) => {
    const detail = (event as CustomEvent<number>).detail;
    if (typeof detail !== 'number' || !Number.isFinite(detail)) return;
    debounceMs.value = detail * 1000;
  };
  window.addEventListener('autoSaveDebounceChange', handleDebounceChange);

  // 清理定时器
  const cleanup = () => {
    if (autoSaveTimer !== null) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    window.removeEventListener('autoSaveIntervalChange', handleIntervalChange);
    window.removeEventListener('autoSaveDebounceChange', handleDebounceChange);
  };

  return {
    saveStatus,
    manualSave,
    resetSaveState,
    updateSavedSnapshot,
    cleanup,
  };
}
