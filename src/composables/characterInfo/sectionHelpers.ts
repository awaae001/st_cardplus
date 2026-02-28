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

const hasMeaningfulContent = (value: unknown): boolean => {
  if (value == null) return false;

  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulContent(item));

  if (typeof value === 'object') {
    return Object.values(value).some((item) => hasMeaningfulContent(item));
  }

  return Boolean(value);
};

/**
 * 将任意结构数据作为JSON导出到剪贴板。
 * @param data 要导出的数据。
 * @param sectionName 用于用户消息的部分名称（例如，“技能”）。
 */
export async function exportSection(data: unknown, sectionName: string): Promise<void> {
  if (!hasMeaningfulContent(data)) {
    ElMessage.warning(`没有可导出的${sectionName}`);
    return;
  }

  await copyUtil(JSON.stringify(data, null, 2), `${sectionName}已复制到剪贴板！`, '导出失败');
}
