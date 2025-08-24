import { ElMessage } from 'element-plus';
import { cleanObject } from '@/utils/objectUtils';
import type { Project, EnhancedLandmark, EnhancedForce } from '@/types/world-editor';
import type { Ref } from 'vue';

type WorldEditorItem = Project | EnhancedLandmark | EnhancedForce;

export function useFileSystem(
    selectedItem: Ref<WorldEditorItem | null>,
    updateSelectedItem: (data: any) => void
) {
  const sanitizeItem = (item: any) => {
    return cleanObject(item, ['id', 'imageUrl', 'createdAt', 'updatedAt', 'version'], ['_']);
  };

  const handleSaveToFile = () => {
    if (!selectedItem.value) return;
    const cleanItem = sanitizeItem(selectedItem.value);
    const dataStr = JSON.stringify(cleanItem, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedItem.value.name || 'world-item'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    ElMessage.success('已导出为 JSON 文件 ');
  };

  const handleLoadFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result;
            if (typeof content === 'string') {
              const importedData = JSON.parse(content);
              updateSelectedItem(importedData);
            }
          } catch (error) {
            ElMessage.error('无法解析JSON文件，请检查文件格式 ');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return {
    handleSaveToFile,
    handleLoadFromFile,
  };
}