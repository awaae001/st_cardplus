import { ElMessage } from 'element-plus';
import { write as writePngCard } from '@/utils/pngCardMetadata';
import type { CharacterCardV3 } from '@/types/character-card-v3';
import type { Ref } from 'vue';

export function useCardExport(
  characterData: Ref<CharacterCardV3>,
  characterImageFile: Ref<File | null>
) {
  const handleSave = async () => {
    if (!characterImageFile.value) {
      console.warn('useCardExport: No image file available for saving');
      ElMessage.warning('请先加载或选择一张图片作为角色卡背景');
      return;
    }

    try {
      const imageBuffer = new Uint8Array(await characterImageFile.value.arrayBuffer());
      const jsonDataString = JSON.stringify(characterData.value, null, 2);
      const newImageBuffer = writePngCard(imageBuffer, jsonDataString);
      const properBuffer = new Uint8Array(newImageBuffer);
      const blob = new Blob([properBuffer], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const fileName = characterData.value.name ? `${characterData.value.name}.png` : 'character.png';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      ElMessage.success('角色卡已成功导出为PNG！');
    } catch (error) {
      console.error('useCardExport: Failed to save character card:', error);
      ElMessage.error(`导出失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return {
    handleSave,
  };
}