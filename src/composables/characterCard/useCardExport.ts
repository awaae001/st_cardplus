import { ElMessage } from 'element-plus';
import { write as writePngCard } from '@/utils/pngCardMetadata';
import type { CharacterCardV3 } from '@/types/character-card-v3';
import type { SillyTavernRegexScript } from '@/composables/regex/types';
import type { Ref } from 'vue';

export type ExportRegexOption = 'bind-new' | 'use-builtin' | 'no-update' | 'no-regex';

export function useCardExport(
  characterData: Ref<CharacterCardV3>,
  characterImageFile: Ref<File | null>
) {
  /**
   * 处理正则脚本选项
   * @param exportData - 要导出的角色卡数据
   * @param option - 正则选项
   * @param selectedScripts - 选中的正则脚本（仅在 bind-new 时需要）
   */
  const applyRegexOption = (
    exportData: CharacterCardV3,
    option: ExportRegexOption,
    selectedScripts?: SillyTavernRegexScript[]
  ) => {
    // 确保 data 和 extensions 存在
    if (!exportData.data) {
      exportData.data = {} as any;
    }
    if (!exportData.data.extensions) {
      exportData.data.extensions = {} as any;
    }

    // 确保 extensions 不为 undefined
    const extensions = exportData.data.extensions;
    if (!extensions) return;

    switch (option) {
      case 'bind-new':
        // 使用用户从正则库选择的脚本
        extensions.regex_scripts = selectedScripts || [];
        break;
      case 'use-builtin':
        // 保持现有正则不变（什么都不做）
        break;
      case 'no-update':
        // 保持现有正则不变（与 use-builtin 相同）
        break;
      case 'no-regex':
        // 移除正则
        extensions.regex_scripts = [];
        break;
    }
  };

  /**
   * 导出角色卡（带正则选项）
   * @param option - 正则选项
   * @param selectedScripts - 选中的正则脚本（仅在 bind-new 时需要）
   */
  const handleExportWithRegexOptions = async (
    option: ExportRegexOption,
    selectedScripts?: SillyTavernRegexScript[]
  ) => {
    if (!characterImageFile.value) {
      console.warn('useCardExport: No image file available for saving');
      ElMessage.warning('请先加载或选择一张图片作为角色卡背景');
      return;
    }

    try {
      //深拷贝 characterData，避免修改原始数据
      const exportData = JSON.parse(JSON.stringify(characterData.value)) as CharacterCardV3;

      // 导出前从 data 层同步到顶层（确保导出的 JSON 兼容性）
      if (exportData.data) {
        exportData.name = exportData.data.name || exportData.name;
        exportData.description = exportData.data.description || exportData.description;
        exportData.personality = exportData.data.personality || exportData.personality;
        exportData.scenario = exportData.data.scenario || exportData.scenario;
        exportData.first_mes = exportData.data.first_mes || exportData.first_mes;
        exportData.mes_example = exportData.data.mes_example || exportData.mes_example;
        exportData.tags = exportData.data.tags || exportData.tags;
      }

      // 应用正则选项（现在是在拷贝上操作，不会影响原始数据）
      applyRegexOption(exportData, option, selectedScripts);

      const imageBuffer = new Uint8Array(await characterImageFile.value.arrayBuffer());
      const jsonDataString = JSON.stringify(exportData, null, 2);
      const newImageBuffer = writePngCard(imageBuffer, jsonDataString);
      const properBuffer = new Uint8Array(newImageBuffer);
      const blob = new Blob([properBuffer], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const fileName = exportData.data?.name || exportData.name || 'character.png';
      link.download = `${fileName}.png`;
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

  /**
   * 导出角色卡（保留旧接口，内部使用 use-builtin 选项）
   */
  const handleSave = async () => {
    await handleExportWithRegexOptions('use-builtin');
  };

  return {
    handleSave,
    handleExportWithRegexOptions,
  };
}