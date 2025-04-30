// 自动保存间隔(毫秒)
const AUTO_SAVE_INTERVAL = 5000;

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
 * @param interval - 保存间隔，默认为AUTO_SAVE_INTERVAL
 * @returns 定时器ID
 */
export const initAutoSave = (
  saveFn: () => void,
  conditionFn: () => boolean,
  interval = AUTO_SAVE_INTERVAL
) => {
  return window.setInterval(() => {
    if (conditionFn()) {
      saveFn();
    }
  }, interval);
};

/**
 * 清除自动保存定时器
 * @param timerId - 定时器ID
 */
export const clearAutoSave = (timerId: number) => {
  clearInterval(timerId);
};
