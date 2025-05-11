<template>
  <div class="character-card-editor p-3 md:p-5 h-full flex flex-col 
              bg-neutral-100 dark:bg-gradient-to-br dark:from-neutral-900 dark:to-neutral-800 
              text-neutral-800 dark:text-neutral-300 print:p-0 print:bg-white print:text-black">

    <!-- 顶部操作按钮区域 -->
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
      />
    </header>

    <!-- 主要内容区域，允许垂直滚动 -->
    <el-scrollbar class="flex-grow" :class="scrollbarClass" view-class="p-1 print:p-0">
      <div class="space-y-5 md:space-y-8">
        <!-- 栅格布局包裹基础信息和背景故事 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-stretch"> <!-- 使用 items-stretch 使同列面板等高 -->
          <div :class="panelClasses">
            <BasicInfo :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full"/>
          </div>
          <div :class="panelClasses">
            <BackgroundStory :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full"/>
          </div>
        </div>

        <div :class="panelClasses">
          <AppearanceFeatures :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full"/>
        </div>

        <div :class="panelClasses">
          <AttireSettings
            :form="form"
            :addAttire="addAttire"
            :removeAttire="removeAttire"
            :exportAttires="exportAttires"
            @update:form="handleFormUpdate" 
            class="flex flex-col h-full"
          />
        </div>

        <div :class="panelClasses">
          <PersonalityTraits
            :form="form"
            :addTrait="addTrait"
            :removeTrait="removeTrait"
            :exportTraits="exportTraits"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          />
        </div>

        <div :class="panelClasses">
          <Relationships
            :form="form"
            :addRelationship="addRelationship"
            :removeRelationship="removeRelationship"
            :exportRelationships="exportRelationships"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          />
        </div>

        <div :class="panelClasses">
          <SkillsEditor
            :form="form"
            :addSkill="addSkill"
            :removeSkill="removeSkill"
            :exportSkills="exportSkills"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          />
        </div>

        <div :class="panelClasses">
          <LikesDislikesRoutine :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full"/>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
// --- JavaScript 部分与你上一个 CharacterCardEditor.vue 版本保持一致 ---
// 确保所有导入、接口、ref、计算属性、方法都存在。
// 我将只粘贴关键的脚本部分，其余部分假设与你上一个版本相同。

import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { ElMessage, ElMessageBox, ElScrollbar } from 'element-plus';
import { saveAs } from 'file-saver';

import CharacterCardButtons from './charcard/CharacterCardButtons.vue';
import BasicInfo from './charcard/BasicInfo.vue';
import BackgroundStory from './charcard/BackgroundStory.vue';
import AppearanceFeatures from './charcard/AppearanceFeatures.vue';
import AttireSettings from './charcard/AttireSettings.vue';
import PersonalityTraits from './charcard/PersonalityTraits.vue';
import Relationships from './charcard/Relationships.vue';
import LikesDislikesRoutine from './charcard/LikesDislikesRoutine.vue';
import SkillsEditor from './charcard/SkillsEditor.vue';

import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  initAutoSave,
  clearAutoSave
} from '../utils/localStorageUtils';

// --- TypeScript 接口定义 (与之前版本相同) ---
interface Appearance { height: string; hairColor: string; hairstyle: string; eyes: string; nose: string; lips: string; skin: string; body: string; bust: string; waist: string; hips: string; breasts: string; genitals: string; anus: string; pubes: string; thighs: string; butt: string; feet: string; [key: string]: string; }
interface Attire { name: string; description: string; tops: string; bottoms: string; shoes: string; socks: string; underwears: string; accessories: string; }
interface Trait { name: string; description: string; dialogueExamples: string[]; behaviorExamples: string[]; }
interface Relationship { name: string; description: string; features: string; dialogueExamples: string[]; }
interface DailyRoutine { earlyMorning: string; morning: string; afternoon: string; evening: string; night: string; lateNight: string; }
interface Skill { name: string; description: string; dialogExample: string; behaviorExample: string; }
interface CharacterCard {
  name?: string; 
  chineseName: string; japaneseName: string; gender: string; customGender: string; age: number; identity: string; background: string; appearance: Appearance; attires: Attire[]; mbti: string; traits: Trait[]; relationships: Relationship[]; likes: string; dislikes: string; dailyRoutine: DailyRoutine; skills: Skill[];
}

// --- 默认角色卡数据工厂函数 (与之前版本相同) ---
const createDefaultCharacterCard = (): CharacterCard => ({
  chineseName: '', japaneseName: '', gender: '', customGender: '', age: 0, identity: '', background: '',
  appearance: { height: '', hairColor: '', hairstyle: '', eyes: '', nose: '', lips: '', skin: '', body: '', bust: '', waist: '', hips: '', breasts: '', genitals: '', anus: '', pubes: '', thighs: '', butt: '', feet: '' },
  attires: [], mbti: '', traits: [], relationships: [], likes: '', dislikes: '',
  dailyRoutine: { earlyMorning: '', morning: '', afternoon: '', evening: '', night: '', lateNight: '' },
  skills: [],
});

const form = ref<CharacterCard>(createDefaultCharacterCard());
let autoSaveTimer: number | null = null;

// --- 动态类名 (与之前版本相同) ---
const panelClasses = computed(() => [
  'bg-white dark:bg-neutral-850',
  'rounded-xl shadow-lg dark:shadow-black/30',
  'border border-neutral-200 dark:border-neutral-750',
  'overflow-hidden',
  'transition-all duration-300 ease-out',
  'hover:shadow-xl dark:hover:shadow-black/50 hover:-translate-y-1' // 提升的阴影和位移效果
]);
const scrollbarClass = computed(() => ['main-content-scrollbar']);


// --- 生命周期钩子 (与之前版本相同) ---
onMounted(() => {
  const loadedData = loadFromLocalStorage('characterCardData', processLoadedData);
  if (loadedData) { form.value = loadedData; }
  autoSaveTimer = initAutoSave(() => saveToLocalStorage(form.value), () => !!(form.value.chineseName || form.value.name));
});
onBeforeUnmount(() => { if (autoSaveTimer) clearAutoSave(autoSaveTimer); });

// --- 表单更新处理 (与之前版本相同) ---
const handleFormUpdate = (updatedPart: Partial<CharacterCard>) => { form.value = { ...form.value, ...updatedPart }; };

// --- 数组操作方法 (与之前版本相同) ---
const addTrait = (): void => { form.value.traits.push({ name: '', description: '', dialogueExamples: [''], behaviorExamples: [''] }); };
const removeTrait = (index: number): void => { form.value.traits.splice(index, 1); };
const addSkill = (): void => { form.value.skills.push({ name: '', description: '', dialogExample: '', behaviorExample: '' }); };
const removeSkill = (index: number): void => { form.value.skills.splice(index, 1); };
const addRelationship = (): void => { form.value.relationships.push({ name: '', description: '', features: '', dialogueExamples: [''] }); };
const removeRelationship = (index: number): void => { form.value.relationships.splice(index, 1); };
const addAttire = (): void => { form.value.attires.push({ name: '', description: '', tops: '', bottoms: '', shoes: '', socks: '', underwears: '', accessories: '' }); };
const removeAttire = (index: number): void => { form.value.attires.splice(index, 1); };

// --- 数据处理工具函数 (与之前版本相同，确保健壮性) ---
const processTextToArray = (text: string | undefined): string[] => text ? text.split('\n').filter(line => line.trim() !== '') : [];
const arrayToText = (arr: string[] | undefined): string => (arr && Array.isArray(arr) ? arr.join('\n') : '');
const filterEmptyValues = (obj: any): any => { /* ... (使用上一个回答中提供的健壮版本) ... */ if (obj === null || obj === undefined) return null; if (Array.isArray(obj)) { const filteredArray = obj.map(filterEmptyValues).filter(item => item !== null); return filteredArray.length > 0 ? filteredArray : null; } if (typeof obj === 'object') { const filteredObject: any = {}; let hasValues = false; for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { const value = obj[key]; if (key === 'age' && typeof value === 'number') { filteredObject[key] = value; hasValues = true; continue; } const filteredValue = filterEmptyValues(value); if (filteredValue !== null) { filteredObject[key] = filteredValue; hasValues = true; } } } return hasValues ? filteredObject : null; } if (obj === '') return null; return obj; };

// --- 核心功能方法 (与之前版本相同，确保数据处理正确) ---
const saveCharacterCard = async (): Promise<void> => { /* ... (使用上一个回答中提供的健壮版本) ... */ try { const dataToSerialize = { ...form.value, identity: processTextToArray(form.value.identity), background: processTextToArray(form.value.background), likes: processTextToArray(form.value.likes), dislikes: processTextToArray(form.value.dislikes), attires: form.value.attires.map(attire => ({ ...attire, accessories: processTextToArray(attire.accessories) })) }; const dataToSave = filterEmptyValues(dataToSerialize); if (!dataToSave || Object.keys(dataToSave).length === 0) { ElMessage.warning('没有可保存的数据。'); return; } const jsonData = JSON.stringify(dataToSave, null, 2); const blob = new Blob([jsonData], { type: 'application/json' }); const characterNameForFile = (form.value.chineseName || form.value.name || '角色卡').replace(/[<>:"/\\|?*]+/g, '_'); const filename = `${characterNameForFile}_${Date.now()}.json`; saveAs(blob, filename); ElMessage.success({ message: '角色卡已成功保存！', duration: 2000 }); } catch (error) { ElMessage.error("保存角色卡失败。"); console.error('保存角色卡时出错:', error); } };
const processLoadedData = (parsedData: any): CharacterCard => { /* ... (使用上一个回答中提供的健壮版本) ... */ const defaultCard = createDefaultCharacterCard(); const tempForm: CharacterCard = { ...defaultCard }; const assign = <K extends keyof CharacterCard>(key: K, defaultValue: CharacterCard[K], processor?: (val: any) => CharacterCard[K]) => { const parsedValue = parsedData[key]; const valueToProcess = parsedValue !== undefined ? parsedValue : defaultValue; if (Object.prototype.hasOwnProperty.call(tempForm, key)) { tempForm[key] = processor ? processor(valueToProcess) : valueToProcess; } else if (processor && key === 'appearance') { (tempForm as any)[key] = processor(valueToProcess); } else if (key !== 'appearance'){ (tempForm as any)[key] = valueToProcess; } }; assign('chineseName', defaultCard.chineseName); assign('name', defaultCard.name); assign('japaneseName', defaultCard.japaneseName); assign('gender', defaultCard.gender); assign('customGender', defaultCard.customGender); assign('age', defaultCard.age, (v) => Number(v) || 0); assign('identity', defaultCard.identity, (v) => Array.isArray(v) ? arrayToText(v) : (typeof v === 'string' ? v : '')); assign('background', defaultCard.background, (v) => Array.isArray(v) ? arrayToText(v) : (typeof v === 'string' ? v : '')); assign('mbti', defaultCard.mbti); assign('likes', defaultCard.likes, (v) => Array.isArray(v) ? arrayToText(v) : (typeof v === 'string' ? v : '')); assign('dislikes', defaultCard.dislikes, (v) => Array.isArray(v) ? arrayToText(v) : (typeof v === 'string' ? v : '')); tempForm.appearance = { ...defaultCard.appearance }; if (parsedData.appearance && typeof parsedData.appearance === 'object') { for (const key_appearance in parsedData.appearance) { if (Object.prototype.hasOwnProperty.call(parsedData.appearance, key_appearance)) { (tempForm.appearance as any)[key_appearance] = parsedData.appearance[key_appearance] || ''; } } if (parsedData.appearance.thihes && !parsedData.appearance.thighs) { tempForm.appearance.thighs = parsedData.appearance.thihes; delete (tempForm.appearance as any).thihes; } } const defaultAttireBase = defaultCard.attires[0] || { name: '', description: '', tops: '', bottoms: '', shoes: '', socks: '', underwears: '', accessories: ''}; assign('attires', defaultCard.attires, (v_arr) => Array.isArray(v_arr) ? v_arr.map((att: any) => ({ ...defaultAttireBase, ...att, accessories: Array.isArray(att.accessories) ? arrayToText(att.accessories) : (typeof att.accessories === 'string' ? att.accessories : '') })) : []); const defaultTraitBase = defaultCard.traits[0] || { name: '', description: '', dialogueExamples: [''], behaviorExamples: [''] }; assign('traits', defaultCard.traits, (v_arr) => Array.isArray(v_arr) ? v_arr.map((tr: any) => ({ ...defaultTraitBase, ...tr, dialogueExamples: Array.isArray(tr.dialogueExamples) ? tr.dialogueExamples.map(String) : [''], behaviorExamples: Array.isArray(tr.behaviorExamples) ? tr.behaviorExamples.map(String) : [''] })) : []); const defaultRelationshipBase = defaultCard.relationships[0] || { name: '', description: '', features: '', dialogueExamples: ['']}; assign('relationships', defaultCard.relationships, (v_arr) => Array.isArray(v_arr) ? v_arr.map((rel: any) => ({ ...defaultRelationshipBase, ...rel, dialogueExamples: Array.isArray(rel.dialogueExamples) ? rel.dialogueExamples.map(String) : [''] })) : []); const defaultSkillBase = defaultCard.skills[0] || { name: '', description: '', dialogExample: '', behaviorExample: ''}; assign('skills', defaultCard.skills, (v_arr) => Array.isArray(v_arr) ? v_arr.map((sk: any) => ({ ...defaultSkillBase, ...sk })) : []); if (parsedData.dailyRoutine && typeof parsedData.dailyRoutine === 'object') { tempForm.dailyRoutine = { ...defaultCard.dailyRoutine, ...parsedData.dailyRoutine }; } else { tempForm.dailyRoutine = { ...defaultCard.dailyRoutine }; } return tempForm; };
const loadCharacterCard = async (): Promise<void> => { /* ... (与上一个版本相同) ... */ try { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json'; input.onchange = async (event) => { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; try { const content = await file.text(); if (!content.trim()) { throw new Error('文件内容为空。'); } const parsedData = JSON.parse(content); if (!parsedData || (typeof parsedData !== 'object')) { throw new Error('无效的角色卡文件格式。'); } form.value = processLoadedData(parsedData); ElMessage.success({ message: '角色卡加载成功！', duration: 2000 }); } catch (error) { ElMessage.error(`加载文件失败：${error instanceof Error ? error.message : '未知错误'}`); console.error("Load error:", error)} }; input.click(); } catch (error) { ElMessage.error(`操作失败：${error instanceof Error ? error.message : '未知错误'}`); } };
const resetForm = (): void => { /* ... (与上一个版本相同) ... */ ElMessageBox.confirm('确定要重置所有数据吗？这将清除所有已输入的内容，并从本地存储中删除自动保存的数据。', '警告', { confirmButtonText: '确定重置', cancelButtonText: '取消', type: 'warning', draggable: true, customClass: 'app-dialog' }).then(() => { clearLocalStorage('characterCardData'); form.value = createDefaultCharacterCard(); ElMessage.success({ message: '表单已重置。', duration: 2000 }); }).catch(() => ElMessage.info({ message: '已取消重置。', duration: 1500 })); };
const copyToClipboard = async (): Promise<void> => { /* ... (与上一个版本相同) ... */ try { const dataToCopy = { ...form.value, identity: processTextToArray(form.value.identity), background: processTextToArray(form.value.background), likes: processTextToArray(form.value.likes), dislikes: processTextToArray(form.value.dislikes), attires: form.value.attires.map(attire => ({ ...attire, accessories: processTextToArray(attire.accessories) })) }; const filteredData = filterEmptyValues(dataToCopy); if (!filteredData || Object.keys(filteredData).length === 0) { ElMessage.warning('没有可复制的数据。'); return; } const jsonData = JSON.stringify(filteredData, null, 2); await navigator.clipboard.writeText(jsonData); ElMessage.success({ message: '角色卡数据已复制到剪贴板！', duration: 2000 }); } catch (error) { ElMessage.error("复制失败"); console.error('复制到剪贴板时出错:', error); } };
const importFromClipboard = async (data: string): Promise<void> => { /* ... (与上一个版本相同) ... */ try { if(!data.trim()) { ElMessage.warning("剪贴板数据为空。"); return; } const parsedData = JSON.parse(data); if (!parsedData || (typeof parsedData !== 'object')) { throw new Error('剪贴板数据不是有效的角色卡JSON格式。'); } form.value = processLoadedData(parsedData); ElMessage.success({ message: '从剪贴板导入成功！', duration: 2000 }); } catch (error) { ElMessage.error(`从剪贴板导入失败：${error instanceof Error ? error.message : '未知错误'}`); console.error('从剪贴板导入时出错:', error); } };
const exportAttires = async (): Promise<void> => { if (!form.value.attires || form.value.attires.length === 0) { ElMessage.warning('没有服装数据可导出。'); return; } const attireDataToCopy = form.value.attires.map(a => ({...a, accessories: processTextToArray(a.accessories)})); try { await navigator.clipboard.writeText(JSON.stringify(attireDataToCopy, null, 2)); ElMessage.success('服装数据已复制到剪贴板！'); } catch (err) { ElMessage.error('复制服装数据失败。'); }};
const exportSkills = async (): Promise<void> => { if (!form.value.skills || form.value.skills.length === 0) { ElMessage.warning('没有技能数据可导出。'); return; } try { await navigator.clipboard.writeText(JSON.stringify(form.value.skills, null, 2)); ElMessage.success('技能数据已复制到剪贴板！'); } catch (err) { ElMessage.error('复制技能数据失败。'); }};
const exportTraits = async (): Promise<void> => { if (!form.value.traits || form.value.traits.length === 0) { ElMessage.warning('没有特质数据可导出。'); return; } try { await navigator.clipboard.writeText(JSON.stringify(form.value.traits, null, 2)); ElMessage.success('性格特质数据已复制到剪贴板！'); } catch (err) { ElMessage.error('复制特质数据失败。'); }};
const exportRelationships = async (): Promise<void> => { if (!form.value.relationships || form.value.relationships.length === 0) { ElMessage.warning('没有人际关系数据可导出。'); return; } try { await navigator.clipboard.writeText(JSON.stringify(form.value.relationships, null, 2)); ElMessage.success('人际关系数据已复制到剪贴板！'); } catch (err) { ElMessage.error('复制关系数据失败。'); }};

</script>