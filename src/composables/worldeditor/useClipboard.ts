import { ElMessage } from 'element-plus';
import { cleanObject } from '@/utils/objectUtils';
import type { Project, EnhancedLandmark, EnhancedForce } from '@/types/world-editor';
import type { Ref } from 'vue';

type WorldEditorItem = Project | EnhancedLandmark | EnhancedForce;

export function useClipboard(
  selectedItem: Ref<WorldEditorItem | null>,
  updateSelectedItem: (data: any) => void
) {
  const sanitizeItem = (item: any) => {
    return cleanObject(item, ['id', 'imageUrl', 'createdAt', 'updatedAt', 'version'], ['_']);
  };

  const handleCopyToClipboard = async () => {
    if (!selectedItem.value) return;
    try {
      const cleanItem = sanitizeItem(selectedItem.value);
      const dataStr = JSON.stringify(cleanItem, null, 2);
      await navigator.clipboard.writeText(dataStr);
      ElMessage.success('已复制到剪贴板 ');
    } catch (err) {
      ElMessage.error('复制失败 ');
    }
  };

  const handleImportFromClipboard = (data: string) => {
    try {
      const importedData = JSON.parse(data);
      updateSelectedItem(importedData);
    } catch (error) {
      ElMessage.error('无效的JSON格式 ');
    }
  };

  return {
    handleCopyToClipboard,
    handleImportFromClipboard,
  };
}