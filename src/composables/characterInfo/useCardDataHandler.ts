import type { Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { saveAs } from 'file-saver';
import { copyToClipboard as copyUtil } from '../../utils/clipboard';
import { clearLocalStorage } from '../../utils/localStorageUtils';
import { createDefaultCharacterCard } from './useCharacterCard';
import type { CharacterCard, Attire, Appearance, Trait, Relationship, Skill, Note } from '../../types/character';
import { removeEmptyFields } from '../../utils/objectUtils';

/**
 * 将数组转换为多行文本
 * @param arr - 要转换的数组
 * @returns 转换后的多行文本
 */
const arrayToText = (arr: string[] | undefined): string => {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.join('\n');
};

/**
 * 处理文本字段，将多行文本转换为数组
 * @param text - 要处理的文本
 * @returns 处理后的字符串数组
 */
const processTextToArray = (text: string): string[] => {
  return text.split('\n').filter((line) => line.trim() !== '');
};

/**
 * 处理服装配饰，将字符串转换为数组
 * @param accessories - 配饰字符串或数组
 * @returns 处理后的配饰数组
 */
const processAccessories = (accessories: string | string[]): string[] => {
  if (typeof accessories === 'string') {
    return processTextToArray(accessories);
  }
  return accessories || [];
};

/**
 * 处理加载的角色卡数据
 * @param parsedData - 解析后的JSON数据
 * @returns 转换后的角色卡数据
 */
export const processLoadedData = (parsedData: any): CharacterCard => {
  // 简化外观数据处理逻辑
  // 直接使用导入文件中的 appearance 对象，如果不存在则为空对象
  const appearance: Appearance = parsedData.appearance || {};

  // 处理服装数据
  const attires: Attire[] = Array.isArray(parsedData.attires)
    ? parsedData.attires.map((attire: any) => ({
        name: attire.name || '',
        description: attire.description || '',
        tops: attire.tops || '',
        bottoms: attire.bottoms || '',
        shoes: attire.shoes || '',
        socks: attire.socks || '',
        underwears: attire.underwears || '',
        // 处理配饰：数组转为多行文本
        accessories: Array.isArray(attire.accessories)
          ? attire.accessories.join('\n')
          : typeof attire.accessories === 'string'
            ? attire.accessories
            : '',
      }))
    : [];

  // 处理性格特质
  const traits: Trait[] = Array.isArray(parsedData.traits)
    ? parsedData.traits.map((trait: any) => ({
        name: trait.name || '',
        description: trait.description || '',
        dialogueExamples: Array.isArray(trait.dialogueExamples) ? trait.dialogueExamples : [''],
        behaviorExamples: Array.isArray(trait.behaviorExamples) ? trait.behaviorExamples : [''],
      }))
    : [];

  // 处理人际关系
  const relationships: Relationship[] = Array.isArray(parsedData.relationships)
    ? parsedData.relationships.map((rel: any) => ({
        name: rel.name || '',
        description: rel.description || '',
        features: rel.features || '',
        dialogueExamples: Array.isArray(rel.dialogueExamples) ? rel.dialogueExamples : [''],
      }))
    : [];

  // 处理技能
  const skills: Skill[] = Array.isArray(parsedData.skills)
    ? parsedData.skills.map((skill: any) => ({
        name: skill.name || '',
        description: skill.description || '',
        dialogExample: skill.dialogExample || '',
        behaviorExample: skill.behaviorExample || '',
      }))
    : [];

  // 4位数字ID生成器 (1000-9999)
  const generateNoteId = (): number => {
    const existingIds = new Set(notes.map((note) => note.id));
    let newId: number;
    do {
      newId = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    } while (existingIds.has(newId));
    return newId;
  };

  // 处理角色备注
  let notes: Note[] = [];
  if (parsedData.notes) {
    if (Array.isArray(parsedData.notes)) {
      notes = parsedData.notes.map((note: any) => ({
        id: note.id || generateNoteId(),
        name: note.name || '',
        data: Array.isArray(note.data) ? note.data : [''],
      }));
    } else if (typeof parsedData.notes === 'object') {
      notes = Object.entries(parsedData.notes).map(([key, note]: [string, any]) => {
        const id = note.id ? Number(note.id) : isNaN(Number(key)) ? generateNoteId() : Number(key);
        return {
          id: id,
          name: note.name || '',
          data: Array.isArray(note.data) ? note.data : [''],
        };
      });
    }
  }

  // 返回转换后的数据
  return {
    chineseName: parsedData.chineseName || '',
    japaneseName: parsedData.japaneseName || '',
    gender: parsedData.gender || '',
    customGender: parsedData.customGender || '',
    age: Number(parsedData.age) || 0,
    identity: Array.isArray(parsedData.identity) ? arrayToText(parsedData.identity) : parsedData.identity || '',
    background: Array.isArray(parsedData.background) ? arrayToText(parsedData.background) : parsedData.background || '',
    appearance,
    attires,
    mbti: parsedData.mbti || '',
    traits,
    relationships,
    likes: Array.isArray(parsedData.likes) ? arrayToText(parsedData.likes) : parsedData.likes || '',
    dislikes: Array.isArray(parsedData.dislikes) ? arrayToText(parsedData.dislikes) : parsedData.dislikes || '',
    dailyRoutine: {
      earlyMorning: parsedData.dailyRoutine?.earlyMorning || '',
      morning: parsedData.dailyRoutine?.morning || '',
      afternoon: parsedData.dailyRoutine?.afternoon || '',
      evening: parsedData.dailyRoutine?.evening || '',
      night: parsedData.dailyRoutine?.night || '',
      lateNight: parsedData.dailyRoutine?.lateNight || '',
    },
    skills,
    notes,
  };
};

/**
 * 准备用于导出的角色卡数据，移除内部使用的字段（如 id）
 * @param character - 原始角色卡数据
 * @returns 清理后的角色卡数据
 */
const prepareForExport = (character: CharacterCard): Partial<CharacterCard> => {
  const exportData = { ...character };
  delete exportData.id;
  return exportData;
};

export function useCardDataHandler(form: Ref<CharacterCard>) {
  const saveCharacterCard = async (): Promise<void> => {
    try {
      // 准备导出数据
      const characterToExport = prepareForExport(form.value);

      // 处理服装数据
      const processedAttires =
        characterToExport.attires?.map((attire: Attire) => ({
          ...attire,
          accessories: processAccessories(attire.accessories),
        })) || [];

      // 处理原始数据
      const processedNotes =
        characterToExport.notes?.reduce(
          (acc: Record<string, { name: string; data: string[] }>, note: Note) => {
            if (note.name) {
              acc[note.id.toString()] = {
                name: note.name,
                data: note.data.filter((d: string) => d.trim() !== ''),
              };
            }
            return acc;
          },
          {} as Record<string, { name: string; data: string[] }>
        ) || {};

      const rawData = {
        ...characterToExport,
        attires: processedAttires,
        gender: characterToExport.gender === 'other' ? characterToExport.customGender : characterToExport.gender,
        background: processTextToArray(characterToExport.background || ''),
        likes: processTextToArray(characterToExport.likes || ''),
        dislikes: processTextToArray(characterToExport.dislikes || ''),
        notes: processedNotes,
      };

      // 过滤空值
      const dataToSave = removeEmptyFields(rawData);

      // 验证数据
      if (!dataToSave || Object.keys(dataToSave).length === 0) {
        ElMessage.warning('没有可保存的数据，请先填写角色卡信息');
        return;
      }

      // 生成随机数作为文件名的一部分
      const generateRandomNumber = (): number => Math.floor(10000000 + Math.random() * 90000000);

      // 创建并保存文件
      const jsonData = JSON.stringify(dataToSave, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      saveAs(blob, `${form.value.chineseName || 'character_card'}_${generateRandomNumber()}.json`);

      ElMessage.success('角色卡保存成功！');
    } catch (error) {
      ElMessage.error('保存失败');
      console.error('保存角色卡时出错:', error);
    }
  };

  const loadCharacterCard = async (): Promise<void> => {
    try {
      // 创建文件输入元素
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      // 设置文件选择事件处理
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          // 读取并解析文件内容
          const content = await file.text();
          const parsedData = JSON.parse(content);

          // 验证基本结构
          if (!parsedData.chineseName) {
            throw new Error('无效的角色卡文件格式');
          }

          // 处理数据并更新表单
          const convertedData = processLoadedData(parsedData);

          // 保留当前角色的 ID，确保导入数据能正确更新现有角色
          const currentId = form.value.id;
          convertedData.id = currentId;

          form.value = convertedData;

          ElMessage.success('角色卡加载成功！');
        } catch (error) {
          console.error('JSON文件导入失败:', error);
          ElMessage.error(`加载失败：${error instanceof Error ? error.message : '未知错误'}`);
        }
      };
      input.click();
    } catch (error) {
      console.error('JSON文件导入外层错误:', error);
      ElMessage.error(`加载失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const resetForm = (): void => {
    ElMessageBox.confirm('确定要重置所有数据吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        // 清除本地存储的数据
        clearLocalStorage();
        // 完全重置表单数据，包括自定义字段
        const newForm = createDefaultCharacterCard();
        const standardFields = {
          height: '',
          hairColor: '',
          hairstyle: '',
          eyes: '',
          nose: '',
          lips: '',
          skin: '',
          body: '',
          bust: '',
          waist: '',
          hips: '',
          breasts: '',
          genitals: '',
          anus: '',
          pubes: '',
          thighs: '',
          butt: '',
          feet: '',
        };

        newForm.appearance = { ...standardFields };
        form.value = newForm;

        ElMessage.success('数据已重置，包括自定义字段');
      })
      .catch(() => {
        ElMessage.info('取消重置');
      });
  };

  const copyToClipboard = async (): Promise<void> => {
    // 准备导出数据
    const characterToExport = prepareForExport(form.value);

    // 处理服装数据
    const processedAttires =
      characterToExport.attires?.map((attire: Attire) => ({
        ...attire,
        accessories:
          typeof attire.accessories === 'string'
            ? attire.accessories.split('\n').filter((a: string) => a.trim() !== '')
            : attire.accessories || [],
      })) || [];

    // 处理原始数据
    const processedNotes =
      characterToExport.notes?.reduce(
        (acc: Record<string, { name: string; data: string[] }>, note: Note) => {
          if (note.name) {
            acc[note.id.toString()] = {
              name: note.name,
              data: note.data.filter((d: string) => d.trim() !== ''),
            };
          }
          return acc;
        },
        {} as Record<string, { name: string; data: string[] }>
      ) || {};

    const rawData = {
      ...characterToExport,
      attires: processedAttires,
      gender: characterToExport.gender === 'other' ? characterToExport.customGender : characterToExport.gender,
      identity: processTextToArray(characterToExport.identity || ''),
      background: processTextToArray(characterToExport.background || ''),
      likes: processTextToArray(characterToExport.likes || ''),
      dislikes: processTextToArray(characterToExport.dislikes || ''),
      notes: processedNotes,
    };

    // 过滤空值
    const dataToSave = removeEmptyFields(rawData);

    // 验证数据
    if (!dataToSave || Object.keys(dataToSave).length === 0) {
      ElMessage.warning('没有可复制的数据，请先填写角色卡信息');
      return;
    }

    // 复制到剪贴板
    const jsonData = JSON.stringify(dataToSave, null, 2);
    await copyUtil(jsonData, '已复制到剪贴板！', '复制失败');
  };

  const importFromClipboard = async (data: string): Promise<void> => {
    try {
      // 保存当前角色的 ID
      const currentId = form.value.id;

      // 先重置表单
      form.value = createDefaultCharacterCard();

      const parsedData = JSON.parse(data);

      // 验证基本结构
      if (!parsedData.chineseName) {
        throw new Error('剪贴板内容不是有效的角色卡数据');
      }

      // 处理数据并更新表单
      const convertedData = processLoadedData(parsedData);

      // 保留当前角色的 ID，确保导入数据能正确更新现有角色
      convertedData.id = currentId;

      form.value = convertedData;

      ElMessage.success('从剪贴板导入成功！');
    } catch (error) {
      console.error('剪贴板导入失败:', error);
      ElMessage.error(`导入失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  return {
    saveCharacterCard,
    loadCharacterCard,
    resetForm,
    copyToClipboard,
    importFromClipboard,
    processLoadedData,
  };
}
