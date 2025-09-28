// --- Settings Management ---

const SETTINGS_KEY = 'settings';

interface AppSettings {
  betaFeaturesEnabled: boolean;
  umamiEnabled: boolean;
  autoSaveInterval: number;
  useOldSidebar: boolean;
  useOldCharCardEditor: boolean;
  useOldWorldEditor: boolean;
  autoExpandSidebar: boolean;
  allowBodyScroll: boolean;
}

const defaultSettings: AppSettings = {
  betaFeaturesEnabled: false,
  umamiEnabled: true,
  autoSaveInterval: 5,
  useOldSidebar: true,
  useOldCharCardEditor: false,
  useOldWorldEditor: false,
  autoExpandSidebar: false,
  allowBodyScroll: false,
};

/**
 * 从本地存储加载设置
 * @returns AppSettings object
 */
const getSettings = (): AppSettings => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Merge with defaults to ensure all keys are present and handle migrations
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('从本地存储加载设置失败:', error);
  }
  // Return a copy of default settings
  return { ...defaultSettings };
};

/**
 * 保存部分或全部设置到本地存储
 * @param settings - a partial AppSettings object
 */
const saveSettings = (settings: Partial<AppSettings>) => {
  try {
    const currentSettings = getSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (error) {
    console.error('保存设置到本地存储失败:', error);
  }
};

/**
 * 获取测试版功能开关状态
 * @returns 测试版功能是否启用
 */
export const getBetaFeaturesEnabled = (): boolean => {
  return getSettings().betaFeaturesEnabled;
};

/**
 * 设置测试版功能开关状态
 * @param enabled - 是否启用测试版功能
 */
export const setBetaFeaturesEnabled = (enabled: boolean) => {
  saveSettings({ betaFeaturesEnabled: enabled });
  console.log('测试版功能设置已保存:', enabled);
};

/**
 * 获取遥测功能开关状态
 * @returns 遥测功能是否启用
 */
export const getUmamiEnabled = (): boolean => {
  return getSettings().umamiEnabled;
};

/**
 * 设置遥测功能开关状态
 * @param enabled - 是否启用遥测功能
 */
export const setUmamiEnabled = (enabled: boolean) => {
  saveSettings({ umamiEnabled: enabled });
  console.log('遥测设置已保存:', enabled);
};

/**
 * 获取自动保存间隔设置
 * @returns 自动保存间隔（秒）
 */
export const getAutoSaveInterval = (): number => {
    const interval = getSettings().autoSaveInterval;
    // 确保间隔在合理范围内（1-60秒）
    return Math.max(1, Math.min(60, interval));
};

/**
 * 设置自动保存间隔
 * @param interval - 自动保存间隔（秒）
 */
export const setAutoSaveInterval = (interval: number) => {
  // 确保间隔在合理范围内（1-60秒）
  const validInterval = Math.max(1, Math.min(60, interval));
  saveSettings({ autoSaveInterval: validInterval });
  console.log('自动保存间隔设置已保存:', validInterval + '秒');
};

/**
 * 获取是否使用旧版侧边栏的设置
 * @returns 是否使用旧版侧边栏
 */
export const getUseOldSidebar = (): boolean => {
  return getSettings().useOldSidebar;
};

/**
 * 设置是否使用旧版侧边栏
 * @param enabled - 是否使用旧版侧边栏
 */
export const setUseOldSidebar = (enabled: boolean) => {
  saveSettings({ useOldSidebar: enabled });
  console.log('旧版侧边栏设置已保存:', enabled);
};

/**
 * 获取是否使用旧版角色卡编辑器
 * @returns 是否使用旧版编辑器
 */
export const getUseOldCharCardEditor = (): boolean => {
  return getSettings().useOldCharCardEditor;
};

/**
 * 设置是否使用旧版角色卡编辑器
 * @param enabled - 是否使用旧版编辑器
 */
export const setUseOldCharCardEditor = (enabled: boolean) => {
  saveSettings({ useOldCharCardEditor: enabled });
  console.log('旧版编辑器设置已保存:', enabled);
};

/**
 * 获取是否使用旧版世界编辑器
 * @returns 是否使用旧版世界编辑器
 */
export const getUseOldWorldEditor = (): boolean => {
  return getSettings().useOldWorldEditor;
};

/**
 * 设置是否使用旧版世界编辑器
 * @param enabled - 是否使用旧版世界编辑器
 */
export const setUseOldWorldEditor = (enabled: boolean) => {
  saveSettings({ useOldWorldEditor: enabled });
  console.log('旧版世界编辑器设置已保存:', enabled);
};

/**
 * 获取侧边栏自动展开设置
 * @returns 侧边栏是否自动展开
 */
export const getAutoExpandSidebar = (): boolean => {
  return getSettings().autoExpandSidebar;
};

/**
 * 设置侧边栏自动展开
 * @param enabled - 是否启用
 */
export const setAutoExpandSidebar = (enabled: boolean) => {
  saveSettings({ autoExpandSidebar: enabled });
  console.log('侧边栏自动展开设置已保存:', enabled);
};

/**
 * 获取是否允许页面滚动
 * @returns 是否允许页面滚动
 */
export const getAllowBodyScroll = (): boolean => {
  return getSettings().allowBodyScroll;
};

/**
 * 设置是否允许页面滚动
 * @param enabled - 是否允许
 */
export const setAllowBodyScroll = (enabled: boolean) => {
  saveSettings({ allowBodyScroll: enabled });
  console.log('允许页面滚动设置已保存:', enabled);
};


// --- Data Management ---

/**
 * 保存数据到本地存储
 * @param data - 要保存的数据
 * @param key - 存储键名，默认为'characterCardData'
 */
export const saveToLocalStorage = (data: any, key = 'characterCardData') => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log('数据已保存到本地存储');
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
};

/**
 * 从本地存储加载数据
 * @param key - 存储键名，默认为'characterCardData'
 * @param processFn - 数据处理函数
 * @returns 加载并处理后的数据
 */
export const loadFromLocalStorage = (key = 'characterCardData', processFn?: (data: any) => any) => {
  try {
    const savedData = localStorage.getItem(key);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return processFn ? processFn(parsedData) : parsedData;
    }
  } catch (error) {
    console.error('从本地存储加载失败:', error);
  }
  return null;
};

/**
 * 清除本地存储的数据
 * @param key - 存储键名，默认为'characterCardData'
 */
export const clearLocalStorage = (key = 'characterCardData') => {
  localStorage.removeItem(key);
};

// --- Auto Save ---

/**
 * 初始化自动保存
 * @param saveFn - 保存函数
 * @param conditionFn - 保存条件函数
 * @param customInterval - 自定义保存间隔（毫秒），如果不提供则使用用户设置的间隔
 * @returns 定时器ID
 */
export const initAutoSave = (
  saveFn: () => void,
  conditionFn: () => boolean,
  customInterval?: number
) => {
  const intervalMs = customInterval || (getAutoSaveInterval() * 1000);
  return window.setInterval(() => {
    if (conditionFn()) {
      saveFn();
    }
  }, intervalMs);
};

/**
 * 清除自动保存定时器
 * @param timerId - 定时器ID
 */
export const clearAutoSave = (timerId: number) => {
  clearInterval(timerId);
};
