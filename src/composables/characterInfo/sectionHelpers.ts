import { ElMessage } from 'element-plus';
import { copyToClipboard as copyUtil } from '../../utils/clipboard';

/**
 * 向列表中添加一个新项目。
 * @param list 要添加项目的数组。
 * @param itemFactory 一个创建新项目的函数。
 */
export function addItem<T>(list: T[], itemFactory: () => T): void {
  list.push(itemFactory());
}

/**
 * 按索引从列表中删除一个项目。
 * @param list 要从中删除项目的数组。
 * @param index 要删除的项目的索引。
 */
export function removeItem<T>(list: T[], index: number): void {
  if (index >= 0 && index < list.length) {
    list.splice(index, 1);
  }
}

/**
 * 将项目列表作为JSON导出到剪贴板。
 * @param data 要导出的数据。
 * @param sectionName 用于用户消息的部分名称（例如，“技能”）。
 */
export async function exportSection(data: any[], sectionName: string): Promise<void> {
  if (data.length === 0) {
    ElMessage.warning(`没有可导出的${sectionName}`);
    return;
  }
  await copyUtil(JSON.stringify(data, null, 2), `${sectionName}已复制到剪贴板！`, '导出失败');
}