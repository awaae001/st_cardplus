import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { extractAndDecodeCcv3, extractAndDecodeV2Card } from '@/utils/metadataSeparator';
import type { CharacterCardV3 } from '@/types/character-card-v3';

export function useCardImport(
  loadCharacter: (character: CharacterCardV3) => void,
  handleImportCard: (character: CharacterCardV3) => Promise<string | null>,
  handleImageUpdate: (file: File) => void
) {
  const isUploading = ref(false);
  const uploadProgress = ref('');
  const fileInput = ref<HTMLInputElement | null>(null);

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileSelected = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || !target.files[0]) {
      console.warn('useCardImport: No file selected');
      return;
    }

    const file = target.files[0];

    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择有效的图片文件');
      target.value = '';
      return;
    }

    if (!file.type.includes('png')) {
      ElMessage.error('智能导入功能仅支持PNG文件');
      target.value = '';
      return;
    }

    isUploading.value = true;
    uploadProgress.value = '正在分析图片...';

    try {
      let characterCardData: CharacterCardV3 | null = null;
      let hasMetadata = false;

      uploadProgress.value = '正在检测角色卡数据...';

      try {
        characterCardData = await extractAndDecodeCcv3(file);
        if (characterCardData) {
          hasMetadata = true;
          console.log('检测到 ccv3 格式角色卡数据');
        }
      } catch (error) {
        console.log('未检测到 ccv3 格式数据');
      }

      if (!characterCardData) {
        try {
          characterCardData = await extractAndDecodeV2Card(file);
          if (characterCardData) {
            hasMetadata = true;
            console.log('检测到 TavernAI v2 格式角色卡数据');
          }
        } catch (error) {
          console.log('未检测到 v2 格式数据');
        }
      }

      if (hasMetadata && characterCardData) {
        uploadProgress.value = '正在保存角色卡...';
        const cardId = await handleImportCard(characterCardData);

        if (cardId) {
          loadCharacter(characterCardData);
          handleImageUpdate(file);
          ElMessage.success(`角色卡"${characterCardData.name || (characterCardData.data as any)?.name || '未命名'}"已成功导入！`);
        }
      } else {
        uploadProgress.value = '正在创建角色卡...';
        const templateCardData: CharacterCardV3 = {
          spec: 'chara_card_v3' as const,
          spec_version: '3.0' as const,
          name: file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          personality: '',
          scenario: '',
          first_mes: '',
          mes_example: '',
          creatorcomment: '',
          avatar: 'none',
          talkativeness: 0.5,
          fav: false,
          tags: [],
          data: {
            name: file.name.replace(/\.[^/.]+$/, ''),
            description: '',
            personality: '',
            scenario: '',
            first_mes: '',
            alternate_greetings: [],
            mes_example: '',
            creator_notes: '',
            system_prompt: '',
            tags: [],
            creator: '',
            character_version: '',
            post_history_instructions: '',
            extensions: {},
          },
        };

        const cardId = await handleImportCard(templateCardData);

        if (cardId) {
          loadCharacter(templateCardData);
          handleImageUpdate(file);
          ElMessage.success(`已创建角色卡模板，请填写角色信息！`);
        }
      }
    } catch (error) {
      console.error('useCardImport: Error in smart import:', error);
      ElMessage.error(`导入失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      isUploading.value = false;
      uploadProgress.value = '';
      if (target) {
        target.value = '';
      }
    }
  };

  return {
    isUploading,
    uploadProgress,
    fileInput,
    triggerFileInput,
    handleFileSelected,
  };
}