import { ElMessage } from 'element-plus';
import { cleanObject } from '@/utils/objectUtils';
import type { Project, EnhancedLandmark, EnhancedForce } from '@/types/world-editor';
import type { Ref } from 'vue';
import { saveFile } from '@/utils/fileSave';

type WorldEditorItem = Project | EnhancedLandmark | EnhancedForce;

export function useFileSystem(selectedItem: Ref<WorldEditorItem | null>, updateSelectedItem: (data: any) => void) {
  const sanitizeItem = (item: any) => {
    return cleanObject(item, ['id', 'imageUrl', 'createdAt', 'updatedAt', 'version'], ['_']);
  };

  const handleSaveToFile = async () => {
    if (!selectedItem.value) return;
    const cleanItem = sanitizeItem(selectedItem.value);
    const dataStr = JSON.stringify(cleanItem, null, 2);
    await saveFile({
      data: new TextEncoder().encode(dataStr),
      fileName: `${selectedItem.value.name || 'world-item'}.json`,
      mimeType: 'application/json',
    });
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
