/**
 * @file localStorage 及自动保存相关的工具函数
 */

/**
 * @constant AUTO_SAVE_INTERVAL
 * @description 默认的自动保存时间间隔（单位：毫秒）。
 * @type {number}
 */
const AUTO_SAVE_INTERVAL = 5000;

/**
 * @function saveToLocalStorage
 * @description 将数据序列化后保存到浏览器的 localStorage 中。
 * @param {any} data - 需要保存的数据对象。
 * @param {string} [key='characterCardData'] - 在 localStorage 中存储数据时使用的键名。默认为 'characterCardData'，请根据实际应用场景调整或传入特定键名。
 * @returns {void}
 */
export const saveToLocalStorage = (data: any, key = 'characterCardData'): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log('数据已保存到本地存储, key:', key);
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
};

/**
 * @function loadFromLocalStorage
 * @description 从浏览器的 localStorage 中加载数据并可选地进行处理。
 * @param {string} [key='characterCardData'] - 从 localStorage 中读取数据时使用的键名。默认为 'characterCardData'。
 * @param {(data: any) => any} [processFn] - 可选的回调函数，用于在返回数据前对其进行处理或转换。
 * @returns {any | null} 加载并解析（如果提供了 processFn，则处理）后的数据。如果未找到对应键名的数据或解析/处理过程中发生错误，则返回 `null`。
 */
export const loadFromLocalStorage = (key = 'characterCardData', processFn?: (data: any) => any): any | null => {
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
 * @function clearLocalStorage
 * @description 从浏览器的 localStorage 中移除指定键名的数据。
 * @param {string} [key='characterCardData'] - 需要从 localStorage 中移除数据的键名。默认为 'characterCardData'。
 * @returns {void}
 */
export const clearLocalStorage = (key = 'characterCardData'): void => {
  try {
    localStorage.removeItem(key);
    console.log('本地存储数据已清除, key:', key);
  } catch (error) {
    console.error('清除本地存储数据失败:', error);
  }
};

/**
 * @function initAutoSave
 * @description 初始化一个定时器，用于周期性地执行自动保存操作。
 * @param {() => void} saveFn - 执行实际保存操作的函数。
 * @param {() => boolean} conditionFn - 一个返回布尔值的函数，用于判断当前是否满足自动保存的条件。只有当此函数返回 `true` 时，`saveFn` 才会被调用。
 * @param {number} [interval=AUTO_SAVE_INTERVAL] - 自动保存的时间间隔（单位：毫秒）。默认为 `AUTO_SAVE_INTERVAL`。
 * @returns {number} 返回定时器的 ID，可用于后续通过 `clearAutoSave` 清除此定时器。
 */
export const initAutoSave = (
  saveFn: () => void,
  conditionFn: () => boolean,
  interval = AUTO_SAVE_INTERVAL
): number => {
  return window.setInterval(() => {
    if (conditionFn()) {
      saveFn();
    }
  }, interval);
};

/**
 * @function clearAutoSave
 * @description 清除由 `initAutoSave` 创建的自动保存定时器。
 * @param {number | null | undefined} timerId - `initAutoSave` 函数返回的定时器 ID。如果传入 `null` 或 `undefined`，函数将不执行任何操作。
 * @returns {void}
 */
export const clearAutoSave = (timerId: number | null | undefined): void => {
  if (timerId) {
    clearInterval(timerId);
  }
};