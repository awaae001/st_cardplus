// src/modules/core/utils/clipboard.utils.ts

/**
 * @file 剪贴板操作相关的工具函数
 */

import { ElMessage } from 'element-plus';

/**
 * @function copyTextToClipboard
 * @description 异步复制文本到用户剪贴板。
 * @param {string} text - 需要复制到剪贴板的文本内容。
 * @param {string} [successMessage='已复制到剪贴板'] - 复制成功时显示的提示消息。
 * @param {string} [errorMessage='复制失败，请检查浏览器权限或手动复制'] - 复制失败时显示的提示消息。
 * @returns {Promise<boolean>} 如果复制成功则 resolve true，否则 resolve false。
 */
export const copyTextToClipboard = async (
  text: string,
  successMessage: string = '已复制到剪贴板',
  errorMessage: string = '复制失败，请检查浏览器权限或手动复制'
): Promise<boolean> => {
  if (!navigator.clipboard) {
    ElMessage.error('当前浏览器不支持剪贴板 API');
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success(successMessage);
    return true;
  } catch (err) {
    console.error('复制到剪贴板失败:', err);
    ElMessage.error(errorMessage);
    return false;
  }
};