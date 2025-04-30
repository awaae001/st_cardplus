<template>
  <div class="p-2 md:p-4 bg-gray-100 min-h-screen">
    <CharacterCardButtons @saveCharacterCard="saveCharacterCard" @loadCharacterCard="loadCharacterCard"
      @resetForm="resetForm" @copyToClipboard="copyToClipboard"
      @importFromClipboard="(data) => importFromClipboard(data)" />

    <div class="section-container flex-col md:flex-row">
      <BasicInfo :form="form" />
      <BackgroundStory :form="form" />
    </div>

    <AppearanceFeatures :form="form" />

    <div style="margin-top: 4px;"></div>

    <AttireSettings :form="form" :addAttire="addAttire" :removeAttire="removeAttire" :exportAttires="exportAttires" />

    <PersonalityTraits :form="form" :addTrait="addTrait" :removeTrait="removeTrait" :exportTraits="exportTraits" />

    <div style="margin: 4px;"></div>

    <Relationships :form="form" :addRelationship="addRelationship" :removeRelationship="removeRelationship"
      :exportRelationships="exportRelationships" />

    <div style="margin: 4px;"></div>

    <SkillsEditor :form="form" :addSkill="addSkill" :removeSkill="removeSkill" :exportSkills="exportSkills" />

    <div style="margin: 4px;"></div>

    <LikesDislikesRoutine :form="form" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { saveAs } from 'file-saver';

// 导入组件
import CharacterCardButtons from './charcard/CharacterCardButtons.vue';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  initAutoSave,
  clearAutoSave
} from '../utils/localStorageUtils';
import BasicInfo from './charcard/BasicInfo.vue';
import BackgroundStory from './charcard/BackgroundStory.vue';
import AppearanceFeatures from './charcard/AppearanceFeatures.vue';
import AttireSettings from './charcard/AttireSettings.vue';
import PersonalityTraits from './charcard/PersonalityTraits.vue';
import Relationships from './charcard/Relationships.vue';
import LikesDislikesRoutine from './charcard/LikesDislikesRoutine.vue';
import SkillsEditor from './charcard/SkillsEditor.vue';

/**
 * 外观特征接口定义
 * 包含角色的所有外观相关属性
 */
interface Appearance {
  height: string;      // 身高
  hairColor: string;   // 发色
  hairstyle: string;   // 发型
  eyes: string;        // 眼睛
  nose: string;        // 鼻子
  lips: string;        // 嘴唇
  skin: string;        // 肤色
  body: string;        // 体型
  bust: string;        // 胸围
  waist: string;       // 腰围
  hips: string;        // 臀围
  breasts: string;     // 胸部
  genitals: string;    // 生殖器
  anus: string;        // 肛门
  pubes: string;       // 阴毛
  thighs: string;      // 大腿
  butt: string;        // 臀部
  feet: string;        // 脚
  [key: string]: string; // 支持动态属性
}

/**
 * 服装套装接口定义
 */
interface Attire {
  name: string;        // 套装名称
  description: string; // 套装描述
  tops: string;        // 上衣
  bottoms: string;     // 下装
  shoes: string;       // 鞋子
  socks: string;       // 袜子
  underwears: string;  // 内衣
  accessories: string; // 配饰，可以是多行文本
}

/**
 * 性格特质接口定义
 */
interface Trait {
  name: string;                // 特质名称
  description: string;         // 特质描述
  dialogueExamples: string[];  // 对话示例
  behaviorExamples: string[];  // 行为示例
}

/**
 * 人际关系接口定义
 */
interface Relationship {
  name: string;                // 关系人名称
  description: string;         // 关系描述
  features: string;            // 关系特点
  dialogueExamples: string[];  // 对话示例
}

/**
 * 日常作息接口定义
 */
interface DailyRoutine {
  earlyMorning: string;  // 早晨
  morning: string;       // 上午
  afternoon: string;     // 下午
  evening: string;       // 傍晚
  night: string;         // 夜晚
  lateNight: string;     // 深夜
}

/**
 * 技能接口定义
 */
interface Skill {
  name: string;           // 技能名称
  description: string;    // 技能描述
  dialogExample: string;  // 对话示例
  behaviorExample: string;// 行为示例
}

/**
 * 角色卡主接口定义
 * 包含角色的所有信息
 */
interface CharacterCard {
  chineseName: string;     // 中文名
  japaneseName: string;    // 日文名
  gender: string;          // 性别
  customGender: string;    // 自定义性别
  age: number;             // 年龄
  identity: string;        // 身份
  background: string;      // 背景故事
  appearance: Appearance;  // 外观特征
  attires: Attire[];       // 服装套装
  mbti: string;            // MBTI性格
  traits: Trait[];         // 性格特质
  relationships: Relationship[]; // 人际关系
  likes: string;           // 喜好
  dislikes: string;        // 厌恶
  dailyRoutine: DailyRoutine; // 日常作息
  skills: Skill[];         // 技能
}

/**
 * 创建默认的角色卡数据
 * 用于初始化表单和重置表单
 */
const createDefaultCharacterCard = (): CharacterCard => ({
  chineseName: '',
  japaneseName: '',
  gender: '',
  customGender: '',
  age: 0,
  identity: '',
  background: '',
  appearance: {
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
  },
  attires: [],
  mbti: '',
  traits: [],
  relationships: [],
  likes: '',
  dislikes: '',
  dailyRoutine: {
    earlyMorning: '',
    morning: '',
    afternoon: '',
    evening: '',
    night: '',
    lateNight: '',
  },
  skills: [],
});

// 角色卡表单数据
const form = ref<CharacterCard>(createDefaultCharacterCard());
let autoSaveTimer: number | null = null;

// 组件挂载时加载保存的数据
onMounted(() => {
  const loadedData = loadFromLocalStorage('characterCardData', processLoadedData);
  if (loadedData) {
    form.value = loadedData;
  }
  autoSaveTimer = initAutoSave(
    () => saveToLocalStorage(form.value),
    () => !!form.value.chineseName
  );
});

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearAutoSave(autoSaveTimer);
  }
});

/**
 * 添加性格特质
 * 向性格特质数组中添加一个新的空特质对象
 */
const addTrait = (): void => {
  form.value.traits.push({
    name: '',
    description: '',
    dialogueExamples: [''],
    behaviorExamples: ['']
  });
};

/**
 * 删除性格特质
 * @param index - 要删除的特质索引
 */
const removeTrait = (index: number): void => {
  form.value.traits.splice(index, 1);
};

/**
 * 添加技能
 * 向技能数组中添加一个新的空技能对象
 */
const addSkill = (): void => {
  form.value.skills.push({
    name: '',
    description: '',
    dialogExample: '',
    behaviorExample: ''
  });
};

/**
 * 删除技能
 * @param index - 要删除的技能索引
 */
const removeSkill = (index: number): void => {
  form.value.skills.splice(index, 1);
};

/**
 * 添加人际关系
 * 向人际关系数组中添加一个新的空关系对象
 */
const addRelationship = (): void => {
  form.value.relationships.push({
    name: '',
    description: '',
    features: '',
    dialogueExamples: ['']
  });
};

/**
 * 删除人际关系
 * @param index - 要删除的关系索引
 */
const removeRelationship = (index: number): void => {
  form.value.relationships.splice(index, 1);
};

/**
 * 处理文本字段，将多行文本转换为数组
 * @param text - 要处理的文本
 * @returns 处理后的字符串数组
 */
const processTextToArray = (text: string): string[] => {
  return text.split('\n').filter(line => line.trim() !== '');
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
 * 保存角色卡
 * 将当前表单数据处理后保存为JSON文件
 */
const saveCharacterCard = async (): Promise<void> => {
  try {
    // 处理服装数据
    const processedAttires = form.value.attires.map(attire => ({
      ...attire,
      accessories: processAccessories(attire.accessories)
    }));

    // 处理原始数据
    const rawData = {
      ...form.value,
      attires: processedAttires,
      gender: form.value.gender === 'other' ? form.value.customGender : form.value.gender,
      background: processTextToArray(form.value.background),
      likes: processTextToArray(form.value.likes),
      dislikes: processTextToArray(form.value.dislikes)
    };
    
    // 过滤空值
    const dataToSave = filterEmptyValues(rawData);

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
    ElMessage.error("保存失败");
    console.error('保存角色卡时出错:', error);
  }
};

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
 * 递归过滤空值
 * 过滤掉对象或数组中的空值
 * @param obj - 要过滤的对象或数组
 * @returns 过滤后的对象或数组
 */
const filterEmptyValues = (obj: any): any => {
  if (Array.isArray(obj)) {
    const filtered = obj
      .map(item => filterEmptyValues(item))
      .filter(item => item !== null && item !== undefined && item !== '');
    return filtered.length > 0 ? filtered : null;
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const key in obj) {
      const filtered = filterEmptyValues(obj[key]);
      if (filtered !== null && filtered !== undefined && filtered !== '') {
        result[key] = filtered;
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  }

  if (obj === '') return null;
  if (typeof obj === 'number' && obj === 0) return null;
  return obj;
};

/**
 * 处理加载的角色卡数据
 * @param parsedData - 解析后的JSON数据
 * @returns 转换后的角色卡数据
 */
const processLoadedData = (parsedData: any): CharacterCard => {
  
  // 处理外观数据，保留所有字段(包括自定义字段)
  const appearance: Appearance = {
    height: parsedData.appearance?.height || '',
    hairColor: parsedData.appearance?.hairColor || '',
    hairstyle: parsedData.appearance?.hairstyle || '',
    eyes: parsedData.appearance?.eyes || '',
    nose: parsedData.appearance?.nose || '',
    lips: parsedData.appearance?.lips || '',
    skin: parsedData.appearance?.skin || '',
    body: parsedData.appearance?.body || '',
    bust: parsedData.appearance?.bust || '',
    waist: parsedData.appearance?.waist || '',
    hips: parsedData.appearance?.hips || '',
    breasts: parsedData.appearance?.breasts || '',
    genitals: parsedData.appearance?.genitals || '',
    anus: parsedData.appearance?.anus || '',
    pubes: parsedData.appearance?.pubes || '',
    thighs: parsedData.appearance?.thighs || parsedData.appearance?.thihes || '', // 修复拼写错误
    butt: parsedData.appearance?.butt || '',
    feet: parsedData.appearance?.feet || '',
  };

  // 保留非标准字段(自定义字段)
  if (parsedData.appearance) {
    const standardFields = [
      'height', 'hairColor', 'hairstyle', 'eyes', 'nose', 'lips', 'skin', 'body',
      'bust', 'waist', 'hips', 'breasts', 'genitals', 'anus', 'pubes', 'thighs', 'butt', 'feet'
    ];
    
    for (const key in parsedData.appearance) {
      if (!standardFields.includes(key)) {
        appearance[key] = parsedData.appearance[key];
      }
    }
  }

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
            : ''
      }))
    : [];

  // 处理性格特质
  const traits: Trait[] = Array.isArray(parsedData.traits)
    ? parsedData.traits.map((trait: any) => ({
        name: trait.name || '',
        description: trait.description || '',
        dialogueExamples: Array.isArray(trait.dialogueExamples) ? trait.dialogueExamples : [''],
        behaviorExamples: Array.isArray(trait.behaviorExamples) ? trait.behaviorExamples : ['']
      }))
    : [];

  // 处理人际关系
  const relationships: Relationship[] = Array.isArray(parsedData.relationships)
    ? parsedData.relationships.map((rel: any) => ({
        name: rel.name || '',
        description: rel.description || '',
        features: rel.features || '',
        dialogueExamples: Array.isArray(rel.dialogueExamples) ? rel.dialogueExamples : ['']
      }))
    : [];

  // 处理技能
  const skills: Skill[] = Array.isArray(parsedData.skills)
    ? parsedData.skills.map((skill: any) => ({
        name: skill.name || '',
        description: skill.description || '',
        dialogExample: skill.dialogExample || '',
        behaviorExample: skill.behaviorExample || ''
      }))
    : [];

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
      lateNight: parsedData.dailyRoutine?.lateNight || ''
    },
    skills
  };
};

/**
 * 加载角色卡
 * 从JSON文件中加载角色卡数据
 */
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
        form.value = convertedData;
        
        ElMessage.success('角色卡加载成功！');
      } catch (error) {
        ElMessage.error(`加载失败：${error instanceof Error ? error.message : '未知错误'}`);
      }
    };
    input.click();
  } catch (error) {
    ElMessage.error(`加载失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};

/**
 * 重置表单数据
 * 弹出确认对话框，确认后重置表单
 */
const resetForm = (): void => {
  ElMessageBox.confirm('确定要重置所有数据吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
  // 清除本地存储的数据
  clearLocalStorage();
    // 完全重置表单数据，包括自定义字段
    const newForm = createDefaultCharacterCard();
    
    // 保留标准字段，清除所有自定义字段
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
      feet: ''
    };
    
    newForm.appearance = { ...standardFields };
    form.value = newForm;
    
    ElMessage.success('数据已重置，包括自定义字段');
  }).catch(() => {
    ElMessage.info('取消重置');
  });
};

/**
 * 添加服装套装
 * 向服装套装数组中添加一个新的空套装对象
 */
const addAttire = (): void => {
  form.value.attires.push({
    name: '',
    description: '',
    tops: '',
    bottoms: '',
    shoes: '',
    socks: '',
    underwears: '',
    accessories: ''
  });
};

/**
 * 删除服装套装
 * @param index - 要删除的套装索引
 */
const removeAttire = (index: number): void => {
  form.value.attires.splice(index, 1);
};

/**
 * 导出服装套装
 * 将服装套装数据复制到剪贴板
 */
const exportAttires = async (): Promise<void> => {
  try {
    const processedAttires = form.value.attires.map(attire => ({
      ...attire,
      accessories: typeof attire.accessories === 'string'
        ? attire.accessories.split('\n').filter(a => a.trim() !== '')
        : attire.accessories || []
    }));

    if (processedAttires.length === 0) {
      ElMessage.warning('没有可导出的服装套装');
      return;
    }
    await navigator.clipboard.writeText(JSON.stringify(processedAttires, null, 2));
    ElMessage.success('服装套装已复制到剪贴板！');
  } catch (error) {
    ElMessage.error("导出失败");
    console.error('导出服装套装时出错:', error);
  }
};

/**
 * 复制到剪贴板
 * 将当前表单数据处理后复制到剪贴板
 */
const copyToClipboard = async (): Promise<void> => {
  try {
    // 处理服装数据
    const processedAttires = form.value.attires.map(attire => ({
      ...attire,
      accessories: typeof attire.accessories === 'string'
        ? attire.accessories.split('\n').filter(a => a.trim() !== '')
        : attire.accessories || []
    }));

    // 处理原始数据
    const rawData = {
      ...form.value,
      attires: processedAttires,
      gender: form.value.gender === 'other' ? form.value.customGender : form.value.gender,
      identity: processTextToArray(form.value.identity),
      background: processTextToArray(form.value.background),
      likes: processTextToArray(form.value.likes),
      dislikes: processTextToArray(form.value.dislikes)
    };
    
    // 过滤空值
    const dataToSave = filterEmptyValues(rawData);

    // 验证数据
    if (!dataToSave || Object.keys(dataToSave).length === 0) {
      ElMessage.warning('没有可复制的数据，请先填写角色卡信息');
      return;
    }

    // 复制到剪贴板
    const jsonData = JSON.stringify(dataToSave, null, 2);
    await navigator.clipboard.writeText(jsonData);
    ElMessage.success('已复制到剪贴板！');
  } catch (error) {
    ElMessage.error("复制失败");
    console.error('复制到剪贴板时出错:', error);
  }
};

/**
 * 从剪贴板导入
 * 从剪贴板中导入角色卡数据
 * @param data - 剪贴板中的JSON数据
 */
const importFromClipboard = async (data: string): Promise<void> => {
  try {
    // 先重置表单
    form.value = createDefaultCharacterCard();
    
    const parsedData = JSON.parse(data);

    // 验证基本结构
    if (!parsedData.chineseName) {
      throw new Error('剪贴板内容不是有效的角色卡数据');
    }

    // 处理数据并更新表单
    const convertedData = processLoadedData(parsedData);
    form.value = convertedData;
    ElMessage.success('从剪贴板导入成功！');
  } catch (error) {
    ElMessage.error(`导入失败：${error instanceof Error ? error.message : '未知错误'}`);
    console.error('从剪贴板导入时出错:', error);
  }
};

/**
 * 导出技能
 * 将技能数据复制到剪贴板
 */
const exportSkills = async (): Promise<void> => {
  try {
    const skillsData = form.value.skills;
    if (skillsData.length === 0) {
      ElMessage.warning('没有可导出的技能');
      return;
    }
    await navigator.clipboard.writeText(JSON.stringify(skillsData, null, 2));
    ElMessage.success('技能已复制到剪贴板！');
  } catch (error) {
    ElMessage.error("导出失败");
    console.error('导出技能时出错:', error);
  }
};

/**
 * 导出性格特质
 * 将性格特质数据复制到剪贴板
 */
const exportTraits = async (): Promise<void> => {
  try {
    const traitsData = form.value.traits;
    if (traitsData.length === 0) {
      ElMessage.warning('没有可导出的性格特质');
      return;
    }
    await navigator.clipboard.writeText(JSON.stringify(traitsData, null, 2));
    ElMessage.success('性格特质已复制到剪贴板！');
  } catch (error) {
    ElMessage.error("导出失败");
    console.error('导出性格特质时出错:', error);
  }
};

/**
 * 导出人际关系
 * 将人际关系数据复制到剪贴板
 */
const exportRelationships = async (): Promise<void> => {
  try {
    const relationshipsData = form.value.relationships;
    if (relationshipsData.length === 0) {
      ElMessage.warning('没有可导出的人际关系');
      return;
    }
    await navigator.clipboard.writeText(JSON.stringify(relationshipsData, null, 2));
    ElMessage.success('人际关系已复制到剪贴板！');
  } catch (error) {
    ElMessage.error("导出失败");
    console.error('导出人际关系时出错:', error);
  }
};

/**
 * 暴露组件方法
 * 使父组件可以访问这些方法
 */
defineExpose({
  saveCharacterCard,
  loadCharacterCard,
  resetForm,
  addAttire,
  removeAttire,
  exportAttires,
  copyToClipboard,
  importFromClipboard,
  exportSkills,
  exportTraits,
  exportRelationships
});
</script>

<style scoped>
/* 使用 Tailwind CSS 进行样式控制 */
.section-container {
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.section-container>* {
  flex: 1;
  min-width: 100%;
}

@media (min-width: 768px) {
  .section-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .section-container>* {
    min-width: auto;
  }
}

.ps-text {
  font-style: italic;
  color: #373737;
  font-weight: 300;
}

.title-Btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.title-Btn-add {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
