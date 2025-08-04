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

/**
 * 获取测试版功能开关状态
 * @returns 测试版功能是否启用
 */
export const getBetaFeaturesEnabled = (): boolean => {
  try {
    const enabled = localStorage.getItem('betaFeaturesEnabled');
    return enabled === 'true';
  } catch (error) {
    console.error('获取测试版功能设置失败:', error);
    return false; // 默认关闭
  }
};

/**
 * 设置测试版功能开关状态
 * @param enabled - 是否启用测试版功能
 */
export const setBetaFeaturesEnabled = (enabled: boolean) => {
  try {
    localStorage.setItem('betaFeaturesEnabled', enabled.toString());
    console.log('测试版功能设置已保存:', enabled);
  } catch (error) {
    console.error('保存测试版功能设置失败:', error);
  }
};

/**
 * 获取遥测功能开关状态
 * @returns 遥测功能是否启用
 */
export const getUmamiEnabled = (): boolean => {
  try {
    const enabled = localStorage.getItem('umamiEnabled');
    return enabled !== 'false'; // 默认开启，只有显式设置为false才关闭
  } catch (error) {
    console.error('获取遥测设置失败:', error);
    return true; // 默认开启
  }
};

/**
 * 设置遥测功能开关状态
 * @param enabled - 是否启用遥测功能
 */
export const setUmamiEnabled = (enabled: boolean) => {
  try {
    localStorage.setItem('umamiEnabled', enabled.toString());
    console.log('遥测设置已保存:', enabled);
  } catch (error) {
    console.error('保存遥测设置失败:', error);
  }
};

/**
 * 获取自动保存间隔设置
 * @returns 自动保存间隔（秒）
 */
export const getAutoSaveInterval = (): number => {
  try {
    const interval = localStorage.getItem('autoSaveInterval');
    const parsedInterval = interval ? parseInt(interval, 10) : 5;
    // 确保间隔在合理范围内（1-60秒）
    return Math.max(1, Math.min(60, parsedInterval));
  } catch (error) {
    console.error('获取自动保存间隔设置失败:', error);
    return 5; // 默认5秒
  }
};

/**
 * 设置自动保存间隔
 * @param interval - 自动保存间隔（秒）
 */
export const setAutoSaveInterval = (interval: number) => {
  try {
    // 确保间隔在合理范围内（1-60秒）
    const validInterval = Math.max(1, Math.min(60, interval));
    localStorage.setItem('autoSaveInterval', validInterval.toString());
    console.log('自动保存间隔设置已保存:', validInterval + '秒');
  } catch (error) {
    console.error('保存自动保存间隔设置失败:', error);
  }
};
