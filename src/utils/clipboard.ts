import { ElMessage } from 'element-plus';

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @param successMessage 成功时显示的消息
 * @param errorMessage 失败时显示的消息
 */
export async function copyToClipboard(
  text: string,
  successMessage: string = '已复制到剪贴板',
  errorMessage: string = '复制失败'
) {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success(successMessage);
  } catch (error) {
    console.error('复制到剪贴板时出错:', error);
    ElMessage.error(errorMessage);
  }
}