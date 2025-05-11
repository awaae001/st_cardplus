<template>
  <div class="character-card-editor p-3 md:p-5 h-full flex flex-col
              bg-neutral-100 dark:bg-gradient-to-br dark:from-neutral-900 dark:to-neutral-800
              text-neutral-800 dark:text-neutral-300 print:p-0 print:bg-white print:text-black">

    
    <header class="flex justify-between items-center mb-4 md:mb-6 print:hidden flex-shrink-0 px-1">
      <h1 class="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-100">
        角色卡编辑器
      </h1>
      <CharacterCardButtons
        @saveCharacterCard="saveCharacterCard"
        @loadCharacterCard="loadCharacterCard"
        @resetForm="resetForm"
        @copyToClipboard="copyToClipboard"
        @importFromClipboard="importFromClipboard"
        class="flex flex-wrap items-center gap-2 md:gap-3"
      ></CharacterCardButtons> 
    </header>

    
    <el-scrollbar class="flex-grow" :class="scrollbarClass" view-class="p-1 print:p-0">
      <div class="space-y-5 md:space-y-8">
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-stretch">
          <div :class="panelClasses">
            <BasicInfo :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full"></BasicInfo>
          </div>
          <div :class="panelClasses">
            <BackgroundStory :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full"></BackgroundStory>
          </div>
        </div>

        <div :class="panelClasses">
          <AppearanceFeatures :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full"></AppearanceFeatures>
        </div>

        <div :class="panelClasses">
          <AttireSettings
            :form="form"
            :addAttire="addAttire"
            :removeAttire="removeAttireById"
            :exportAttires="exportAttires"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          ></AttireSettings>
        </div>

        <div :class="panelClasses">
          <PersonalityTraits
            :form="form"
            :addTrait="addTrait"
            :removeTrait="removeTraitById"
            :exportTraits="exportTraits"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          ></PersonalityTraits>
        </div>

        <div :class="panelClasses">
          <Relationships
            :form="form"
            :addRelationship="addRelationship"
            :removeRelationship="removeRelationshipById"
            :exportRelationships="exportRelationships"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          ></Relationships>
        </div>

        <div :class="panelClasses">
          <SkillsEditor
            :form="form"
            :addSkill="addSkill"
            :removeSkill="removeSkillById"
            :exportSkills="exportSkills"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          ></SkillsEditor>
        </div>

        <div :class="panelClasses">
          <LikesDislikesRoutine :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full"></LikesDislikesRoutine>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { ElMessage, ElMessageBox, ElScrollbar } from 'element-plus';
import { saveAs } from 'file-saver';
import { nanoid } from 'nanoid'; // 导入 nanoid 用于生成唯一ID

// 导入子组件
import CharacterCardButtons from './charcard/CharacterCardButtons.vue';
import BasicInfo from './charcard/BasicInfo.vue';
import BackgroundStory from './charcard/BackgroundStory.vue';
import AppearanceFeatures from './charcard/AppearanceFeatures.vue';
import AttireSettings from './charcard/AttireSettings.vue';
import PersonalityTraits from './charcard/PersonalityTraits.vue';
import Relationships from './charcard/Relationships.vue';
import LikesDislikesRoutine from './charcard/LikesDislikesRoutine.vue';
import SkillsEditor from './charcard/SkillsEditor.vue';

// 导入本地存储工具函数
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  initAutoSave,
  clearAutoSave
} from '../utils/localStorageUtils';

// --- TypeScript 接口定义 ---
interface Appearance { height: string; hairColor: string; hairstyle: string; eyes: string; nose: string; lips: string; skin: string; body: string; bust: string; waist: string; hips: string; breasts: string; genitals: string; anus: string; pubes: string; thighs: string; butt: string; feet: string; [key: string]: string; }
interface Attire { id: string; name: string; description: string; tops: string; bottoms: string; shoes: string; socks: string; underwears: string; accessories: string; }
interface Trait { id: string; name: string; description: string; dialogueExamples: string[]; behaviorExamples: string[]; }
interface Relationship { id: string; name: string; description: string; features: string; dialogueExamples: string[]; }
interface DailyRoutine { earlyMorning: string; morning: string; afternoon: string; evening: string; night: string; lateNight: string; }
interface Skill { id: string; name: string; description: string; dialogExample: string; behaviorExample: string; }

interface CharacterCard {
  name?: string; // 旧版兼容字段
  chineseName: string; japaneseName: string; gender: string; customGender: string; age: number; identity: string; background: string;
  appearance: Appearance;
  attires: Attire[];
  mbti: string;
  traits: Trait[];
  relationships: Relationship[];
  likes: string; dislikes: string;
  dailyRoutine: DailyRoutine;
  skills: Skill[];
}

// 创建默认角色卡数据的函数
const createDefaultCharacterCard = (): CharacterCard => ({
  chineseName: '', japaneseName: '', gender: '', customGender: '', age: 0, identity: '', background: '',
  appearance: { height: '', hairColor: '', hairstyle: '', eyes: '', nose: '', lips: '', skin: '', body: '', bust: '', waist: '', hips: '', breasts: '', genitals: '', anus: '', pubes: '', thighs: '', butt: '', feet: '' },
  attires: [], mbti: '', traits: [], relationships: [], likes: '', dislikes: '',
  dailyRoutine: { earlyMorning: '', morning: '', afternoon: '', evening: '', night: '', lateNight: '' },
  skills: [],
});

// 表单主数据
const form = ref<CharacterCard>(createDefaultCharacterCard());
let autoSaveTimer: number | null = null;

// 面板通用样式类
const panelClasses = computed(() => [
  'bg-white dark:bg-neutral-850',
  'rounded-xl shadow-lg dark:shadow-black/30',
  'border border-neutral-200 dark:border-neutral-750',
  'overflow-hidden',
  'transition-all duration-300 ease-out',
  'hover:shadow-xl dark:hover:shadow-black/50 hover:-translate-y-1' // 恢复悬停效果
]);
const scrollbarClass = computed(() => ['main-content-scrollbar']);

// 组件挂载时的操作
onMounted(() => {
  const loadedData = loadFromLocalStorage('characterCardData', processLoadedData);
  if (loadedData) { form.value = loadedData; }
  autoSaveTimer = initAutoSave(() => saveToLocalStorage(form.value), () => !!(form.value.chineseName || form.value.name));
});

// 组件卸载前的操作
onBeforeUnmount(() => { if (autoSaveTimer) clearAutoSave(autoSaveTimer); });

// 处理子组件表单更新的通用方法
const handleFormUpdate = (updatedPart: Partial<CharacterCard>) => {
  form.value = { ...form.value, ...updatedPart };
};

// --- 数组操作方法 (确保ID生成和数组初始化) ---
const ensureArrayExists = <K extends keyof CharacterCard>(arrayKey: K) => {
  if (!(form.value[arrayKey] && Array.isArray(form.value[arrayKey]))) {
    (form.value[arrayKey] as any) = [];
    // console.warn(`Array form.value.${String(arrayKey)} was not initialized. Initialized now.`);
  }
};

const addTrait = (): void => {
  ensureArrayExists('traits');
  const newTrait = { id: nanoid(), name: `新特质 ${form.value.traits.length + 1}`, description: '', dialogueExamples: [''], behaviorExamples: [''] };
  form.value.traits.push(newTrait);
  // console.log('[CCE] Added Trait, traits are now:', JSON.parse(JSON.stringify(form.value.traits)));
};
const removeTraitById = (traitId: string): void => { ensureArrayExists('traits'); const index = form.value.traits.findIndex(t => t.id === traitId); if (index !== -1) { form.value.traits.splice(index, 1); }};

const addSkill = (): void => {
  ensureArrayExists('skills');
  const newSkill = { id: nanoid(), name: `新技能 ${form.value.skills.length + 1}`, description: '', dialogExample: '', behaviorExample: '' };
  form.value.skills.push(newSkill);
  // console.log('[CCE] Added Skill, skills are now:', JSON.parse(JSON.stringify(form.value.skills)));
};
const removeSkillById = (skillId: string): void => { ensureArrayExists('skills'); const index = form.value.skills.findIndex(s => s.id === skillId); if (index !== -1) { form.value.skills.splice(index, 1); }};

const addRelationship = (): void => {
  ensureArrayExists('relationships');
  const newRelationship = { id: nanoid(), name: `新关系对象 ${form.value.relationships.length + 1}`, description: '', features: '', dialogueExamples: [''] };
  form.value.relationships.push(newRelationship);
  // console.log('[CCE] Added Relationship, relationships are now:', JSON.parse(JSON.stringify(form.value.relationships)));
};
const removeRelationshipById = (relationshipId: string): void => { ensureArrayExists('relationships'); const index = form.value.relationships.findIndex(r => r.id === relationshipId); if (index !== -1) { form.value.relationships.splice(index, 1); }};

const addAttire = (): void => {
  ensureArrayExists('attires');
  const newAttire = { id: nanoid(), name: `新套装 ${form.value.attires.length + 1}`, description: '', tops: '', bottoms: '', shoes: '', socks: '', underwears: '', accessories: '' };
  form.value.attires.push(newAttire);
  // console.log('[CCE] Added Attire, attires are now:', JSON.parse(JSON.stringify(form.value.attires)));
};
const removeAttireById = (attireId: string): void => { ensureArrayExists('attires'); const index = form.value.attires.findIndex(a => a.id === attireId); if (index !== -1) { form.value.attires.splice(index, 1); }};

// --- 数据处理工具函数 ---
const processTextToArray = (text: string | undefined): string[] => text ? text.split('\n').filter(line => line.trim() !== '') : [];
const arrayToText = (arr: string[] | undefined): string => (arr && Array.isArray(arr) ? arr.join('\n') : '');
const filterEmptyValues = (obj: any): any => { if (obj === null || obj === undefined) return null; if (Array.isArray(obj)) { const filteredArray = obj.map(filterEmptyValues).filter(item => item !== null && item !== ''); return filteredArray.length > 0 ? filteredArray : null; } if (typeof obj === 'object') { const filteredObject: any = {}; let hasValues = false; for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { const value = obj[key]; if (key === 'age' && typeof value === 'number') { filteredObject[key] = value; hasValues = true; continue; } const filteredValue = filterEmptyValues(value); if (filteredValue !== null && filteredValue !== '') { filteredObject[key] = filteredValue; hasValues = true; } } } return hasValues ? filteredObject : null; } if (obj === '') return null; return obj; };

// --- 核心功能方法 ---
const saveCharacterCard = async (): Promise<void> => { /* ... (与上一版相同，保持其逻辑) ... */ try { const dataToSerialize = { ...form.value, identity: processTextToArray(form.value.identity), background: processTextToArray(form.value.background), likes: processTextToArray(form.value.likes), dislikes: processTextToArray(form.value.dislikes), attires: form.value.attires.map(attire => ({ ...attire, accessories: processTextToArray(attire.accessories) })) }; const dataToSave = filterEmptyValues(dataToSerialize); if (!dataToSave || Object.keys(dataToSave).length === 0) { ElMessage.warning('没有可保存的数据。'); return; } const jsonData = JSON.stringify(dataToSave, null, 2); const blob = new Blob([jsonData], { type: 'application/json' }); const characterNameForFile = (form.value.chineseName || form.value.name || '角色卡').replace(/[<>:"/\\|?*]+/g, '_'); const filename = `${characterNameForFile}_${Date.now()}.json`; saveAs(blob, filename); ElMessage.success({ message: '角色卡已成功保存！', duration: 2000 }); } catch (error) { ElMessage.error("保存角色卡失败。"); console.error('保存角色卡时出错:', error); }};

const processLoadedData = (parsedData: any): CharacterCard => { 
  // console.log('[CCE] processLoadedData - Input:', JSON.parse(JSON.stringify(parsedData)));
  const defaultCard = createDefaultCharacterCard(); 
  const tempForm: CharacterCard = { ...defaultCard }; 
  
  const assignField = <K extends keyof CharacterCard>(key: K, defaultValue: CharacterCard[K], processor?: (val: any) => CharacterCard[K]) => {
    const valueFromParsed = parsedData[key];
    const valueToProcess = valueFromParsed !== undefined ? valueFromParsed : defaultValue;
    // 确保 tempForm 上有这个 key 才赋值，或者它是 appearance 这种已知对象
    if (Object.prototype.hasOwnProperty.call(tempForm, key) || key === 'appearance') {
        tempForm[key] = processor ? processor(valueToProcess) : valueToProcess;
    } else if (key === 'name' && !tempForm.name && valueToProcess) { // 旧版 name 字段兼容
        tempForm.name = String(valueToProcess);
    }
  };
  
  const processArrayWithId = <TItem extends { id?: string }>( // 类型 TItem 必须可以有 id 属性
    parsedArray: any[] | undefined, 
    defaultItemStructure: Omit<TItem, 'id'>, // 提供不含 id 的默认结构
    itemProcessor?: (item: any) => Partial<Omit<TItem, 'id'>> 
  ): TItem[] => {
    if (!Array.isArray(parsedArray)) return []; // 如果传入的不是数组，返回空数组
    return parsedArray.map((item: any) => {
      const validItem = item || {}; // 防止 item 是 null 或 undefined
      const processedItemSpecifics = itemProcessor ? itemProcessor(validItem) : validItem;
      return {
        ...defaultItemStructure, 
        ...processedItemSpecifics, 
        id: validItem.id || nanoid(), // 核心：确保ID存在且是字符串
      } as TItem; 
    });
  };

  assignField('chineseName', defaultCard.chineseName); 
  assignField('name', defaultCard.name); 
  assignField('japaneseName', defaultCard.japaneseName); 
  assignField('gender', defaultCard.gender); 
  assignField('customGender', defaultCard.customGender); 
  assignField('age', defaultCard.age, (v) => Number(v) || 0); 
  assignField('identity', defaultCard.identity, (v) => Array.isArray(v) ? arrayToText(v) : (typeof v === 'string' ? v : '')); 
  assignField('background', defaultCard.background, (v) => Array.isArray(v) ? arrayToText(v) : (typeof v === 'string' ? v : '')); 
  assignField('mbti', defaultCard.mbti); 
  assignField('likes', defaultCard.likes, (v) => Array.isArray(v) ? arrayToText(v) : (typeof v === 'string' ? v : '')); 
  assignField('dislikes', defaultCard.dislikes, (v) => Array.isArray(v) ? arrayToText(v) : (typeof v === 'string' ? v : '')); 
  
  tempForm.appearance = { ...defaultCard.appearance, ...(parsedData.appearance || {}) }; 
  if ((tempForm.appearance as any).thihes && !tempForm.appearance.thighs) { 
    tempForm.appearance.thighs = (tempForm.appearance as any).thihes; 
    delete (tempForm.appearance as any).thihes; 
  }
  
  tempForm.attires = processArrayWithId<Attire>(parsedData.attires, { name: '', description: '', tops: '', bottoms: '', shoes: '', socks: '', underwears: '', accessories: '' }, item => ({
    ...item, // 先展开 item，以防 itemProcessor 依赖 item 的其他属性
    accessories: Array.isArray(item.accessories) ? arrayToText(item.accessories) : (typeof item.accessories === 'string' ? item.accessories : '')
  }));
  tempForm.traits = processArrayWithId<Trait>(parsedData.traits, { name: '', description: '', dialogueExamples: [''], behaviorExamples: [''] }, item => ({
    ...item,
    dialogueExamples: Array.isArray(item.dialogueExamples) ? item.dialogueExamples.map(String) : [''],
    behaviorExamples: Array.isArray(item.behaviorExamples) ? item.behaviorExamples.map(String) : ['']
  }));
  tempForm.relationships = processArrayWithId<Relationship>(parsedData.relationships, { name: '', description: '', features: '', dialogueExamples: ['']}, item => ({
    ...item,
    dialogueExamples: Array.isArray(item.dialogueExamples) ? item.dialogueExamples.map(String) : ['']
  }));
  tempForm.skills = processArrayWithId<Skill>(parsedData.skills, { name: '', description: '', dialogExample: '', behaviorExample: '' });
  
  tempForm.dailyRoutine = { ...defaultCard.dailyRoutine, ...(parsedData.dailyRoutine || {}) }; 
  
  // console.log('[CCE] processLoadedData - Output:', JSON.parse(JSON.stringify(tempForm)));
  return tempForm; 
};

const loadCharacterCard = async (): Promise<void> => { /* ... (与上一版相同) ... */ try { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json'; input.onchange = async (event) => { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; try { const content = await file.text(); if (!content.trim()) { throw new Error('文件内容为空。'); } const parsedData = JSON.parse(content); if (!parsedData || (typeof parsedData !== 'object')) { throw new Error('无效的角色卡文件格式。'); } form.value = processLoadedData(parsedData); ElMessage.success({ message: '角色卡加载成功！', duration: 2000 }); } catch (error) { ElMessage.error(`加载文件失败：${error instanceof Error ? error.message : '未知错误'}`); console.error("Load error:", error); } }; input.click(); } catch (error) { ElMessage.error(`操作失败：${error instanceof Error ? error.message : '未知错误'}`); }};
const resetForm = (): void => { /* ... (与上一版相同) ... */ ElMessageBox.confirm('确定要重置所有数据吗？这将清除所有已输入的内容，并从本地存储中删除自动保存的数据。', '警告', { confirmButtonText: '确定重置', cancelButtonText: '取消', type: 'warning', draggable: true, customClass: 'app-dialog' }).then(() => { clearLocalStorage('characterCardData'); form.value = createDefaultCharacterCard(); ElMessage.success({ message: '表单已重置。', duration: 2000 }); }).catch(() => ElMessage.info({ message: '已取消重置。', duration: 1500 })); };
const copyToClipboard = async (): Promise<void> => { /* ... (与上一版相同) ... */ try { const dataToCopy = { ...form.value, identity: processTextToArray(form.value.identity), background: processTextToArray(form.value.background), likes: processTextToArray(form.value.likes), dislikes: processTextToArray(form.value.dislikes), attires: form.value.attires.map(attire => ({ ...attire, accessories: processTextToArray(attire.accessories) })) }; const filteredData = filterEmptyValues(dataToCopy); if (!filteredData || Object.keys(filteredData).length === 0) { ElMessage.warning('没有可复制的数据。'); return; } const jsonData = JSON.stringify(filteredData, null, 2); await navigator.clipboard.writeText(jsonData); ElMessage.success({ message: '角色卡数据已复制到剪贴板！', duration: 2000 }); } catch (error) { ElMessage.error("复制失败"); console.error('复制到剪贴板时出错:', error); }};
const importFromClipboard = async (data: string): Promise<void> => { /* ... (与上一版相同) ... */ try { if(!data.trim()) { ElMessage.warning("剪贴板数据为空。"); return; } const parsedData = JSON.parse(data); if (!parsedData || (typeof parsedData !== 'object')) { throw new Error('剪贴板数据不是有效的角色卡JSON格式。'); } form.value = processLoadedData(parsedData); ElMessage.success({ message: '从剪贴板导入成功！', duration: 2000 }); } catch (error) { ElMessage.error(`从剪贴板导入失败：${error instanceof Error ? error.message : '未知错误'}`); console.error('从剪贴板导入时出错:', error); }};
const exportAttires = async (): Promise<void> => { /* ... (与上一版相同) ... */ ensureArrayExists('attires'); if (!form.value.attires || form.value.attires.length === 0) { ElMessage.warning('没有服装数据可导出。'); return; } const attireDataToExport = form.value.attires.map(a => ({...a, accessories: processTextToArray(a.accessories)})); try { await navigator.clipboard.writeText(JSON.stringify(attireDataToExport, null, 2)); ElMessage.success('服装数据已复制到剪贴板！'); } catch (err) { ElMessage.error('复制服装数据失败。'); }};
const exportSkills = async (): Promise<void> => { /* ... (与上一版相同) ... */ ensureArrayExists('skills'); if (!form.value.skills || form.value.skills.length === 0) { ElMessage.warning('没有技能数据可导出。'); return; } try { await navigator.clipboard.writeText(JSON.stringify(form.value.skills, null, 2)); ElMessage.success('技能数据已复制到剪贴板！'); } catch (err) { ElMessage.error('复制技能数据失败。'); }};
const exportTraits = async (): Promise<void> => { /* ... (与上一版相同) ... */ ensureArrayExists('traits'); if (!form.value.traits || form.value.traits.length === 0) { ElMessage.warning('没有特质数据可导出。'); return; } try { await navigator.clipboard.writeText(JSON.stringify(form.value.traits, null, 2)); ElMessage.success('性格特质数据已复制到剪贴板！'); } catch (err) { ElMessage.error('复制特质数据失败。'); }};
const exportRelationships = async (): Promise<void> => { /* ... (与上一版相同) ... */ ensureArrayExists('relationships'); if (!form.value.relationships || form.value.relationships.length === 0) { ElMessage.warning('没有人际关系数据可导出。'); return; } try { await navigator.clipboard.writeText(JSON.stringify(form.value.relationships, null, 2)); ElMessage.success('人际关系数据已复制到剪贴板！'); } catch (err) { ElMessage.error('复制关系数据失败。'); }};

</script>

<style scoped>
.character-card-editor {}
:deep(.main-content-scrollbar .el-scrollbar__wrap) {}
:deep(.main-content-scrollbar .el-scrollbar__view) {}
</style>