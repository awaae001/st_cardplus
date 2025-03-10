<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <CharacterCardButtons @saveCharacterCard="saveCharacterCard" @loadCharacterCard="loadCharacterCard"
      @resetForm="resetForm" @copyToClipboard="copyToClipboard" />

    <div class="section-container">
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
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { saveAs } from 'file-saver';

// Import components
import CharacterCardButtons from './charcard/CharacterCardButtons.vue';
import BasicInfo from './charcard/BasicInfo.vue';
import BackgroundStory from './charcard/BackgroundStory.vue';
import AppearanceFeatures from './charcard/AppearanceFeatures.vue';
import AttireSettings from './charcard/AttireSettings.vue';
import PersonalityTraits from './charcard/PersonalityTraits.vue';
import Relationships from './charcard/Relationships.vue';
import LikesDislikesRoutine from './charcard/LikesDislikesRoutine.vue';
import SkillsEditor from './charcard/SkillsEditor.vue';

// 表单数据结构
interface CharacterCard {
  chineseName: string;
  japaneseName: string;
  gender: string;
  customGender: string;
  age: number;
  identity: string;
  background: string;
  appearance: {
    height: string;
    hairColor: string;
    hairstyle: string;
    eyes: string;
    nose: string;
    lips: string;
    skin: string;
    body: string;
    bust: string;
    waist: string;
    hips: string;
    breasts: string;
    genitals: string;
    anus: string;
    labia: string;
    thighs: string;
    butt: string;
    feet: string;
  };
  attires: {
    name: string;
    description: string;
    tops: string;
    bottoms: string;
    shoes: string;
    socks: string;
    underwears: string;
    accessories: string;
  }[];
  mbti: string;
  traits: {
    name: string;
    description: string;
    dialogueExamples: string;
    behaviorExamples: string;
  }[];
  relationships: {
    name: string;
    description: string;
    features: string;
    dialogueExamples: string[];
  }[];
  likes: string;
  dislikes: string;
  dailyRoutine: {
    earlyMorning: string;
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    lateNight: string;
  };
  skills: {
    name: string;
    description: string;
    dialogExample: string;
    behaviorExample: string;
  }[];
}

const form = ref<CharacterCard>({
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
    labia: '',
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

// 添加性格特质
// 添加技能
const addSkill = () => {
  form.value.skills.push({
    name: '',
    description: '',
    dialogExample: '',
    behaviorExample: ''
  });
};

const addTrait = () => {
  form.value.traits.push({
    name: '',
    description: '',
    dialogueExamples: '',
    behaviorExamples: '',
  });
};

// 删除性格特质
// 删除技能
const removeSkill = (index: number) => {
  form.value.skills.splice(index, 1);
};

const removeTrait = (index: number) => {
  form.value.traits.splice(index, 1);
};

// 添加人际关系
const addRelationship = () => {
  form.value.relationships.push({
    name: '',
    description: '',
    features: '',
    dialogueExamples: ['']
  });
};

// 删除人际关系
const removeRelationship = (index: number) => {
  form.value.relationships.splice(index, 1);
};

// 保存角色卡
// 导出技能
const exportSkills = async () => {
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
  }
};

const exportTraits = async () => {
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
  }
};

const exportRelationships = async () => {
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
  }
};

// 递归过滤空值
const filterEmptyValues = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj
      .map(item => filterEmptyValues(item))
      .filter(item => item !== null && item !== undefined && item !== '');
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

  return obj !== '' ? obj : null;
};

const copyToClipboard = async () => {
  try {
    const rawData = {
      ...form.value,
      gender: form.value.gender === 'other' ? form.value.customGender : form.value.gender,
      background: form.value.background.split('\n').filter(line => line.trim() !== ''),
      likes: form.value.likes.split('\n').filter(line => line.trim() !== ''),
      dislikes: form.value.dislikes.split('\n').filter(line => line.trim() !== '')
    };
    const dataToSave = filterEmptyValues(rawData);
    const jsonData = JSON.stringify(dataToSave, null, 2);
    await navigator.clipboard.writeText(jsonData);
    ElMessage.success('已复制到剪贴板！');
  } catch (error) {
    ElMessage.error("复制失败");
  }
};

const saveCharacterCard = async () => {
  try {
    const rawData = {
      ...form.value,
      gender: form.value.gender === 'other' ? form.value.customGender : form.value.gender,
      background: form.value.background.split('\n').filter(line => line.trim() !== ''),
      likes: form.value.likes.split('\n').filter(line => line.trim() !== ''),
      dislikes: form.value.dislikes.split('\n').filter(line => line.trim() !== '')
    };
    const dataToSave = filterEmptyValues(rawData);
    const generateRandomNumber = () => Math.floor(10000000 + Math.random() * 90000000);
    const jsonData = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    saveAs(blob, `${form.value.chineseName || 'character_card'}_${generateRandomNumber()}.json`);
    ElMessage.success('角色卡保存成功！');
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

// 加载角色卡
const loadCharacterCard = async () => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const content = await file.text();
        const parsedData = JSON.parse(content);

        // 转换字段格式
        const convertedData = {
          chineseName: parsedData.chineseName || '',
          japaneseName: parsedData.japaneseName || '',
          gender: parsedData.gender || '',
          customGender: parsedData.customGender || '',
          age: Number(parsedData.age) || 0,
          identity: parsedData.identity || '',
          background: Array.isArray(parsedData.background) ? parsedData.background.join('\n') : '',
          appearance: {
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
            labia: parsedData.appearance?.labia || '',
            thighs: parsedData.appearance?.thihes || '',
            butt:parsedData.appearance?.butt || '',
            feet: parsedData.appearance?.feet || '',
          },
          attires: Array.isArray(parsedData.attires) ? parsedData.attires.map((attire: {
            name: string;
            description: string;
            tops: string;
            bottoms: string;
            shoes: string;
            socks: string;
            underwears: string;
            accessories: string;
          }) => ({
            name: attire.name || '',
            description: attire.description || '',
            tops: attire.tops || '',
            bottoms: attire.bottoms || '',
            shoes: attire.shoes || '',
            socks: attire.socks || '',
            underwears: attire.underwears || '',
            accessories: attire.accessories || ''
          })) : [],
          mbti: parsedData.mbti || '',
          traits: Array.isArray(parsedData.traits) ? parsedData.traits.map((trait: {
            name: string;
            description: string;
            dialogueExamples: string;
            behaviorExamples: string;
          }) => ({
            name: trait.name || '',
            description: trait.description || '',
            dialogueExamples: trait.dialogueExamples || '',
            behaviorExamples: trait.behaviorExamples || ''
          })) : [],
          relationships: Array.isArray(parsedData.relationships) ? parsedData.relationships.map((rel: {
            name: string;
            description: string;
            features: string;
            dialogueExamples: string[];
          }) => ({
            name: rel.name || '',
            description: rel.description || '',
            features: rel.features || '',
            dialogueExamples: rel.dialogueExamples || ['']
          })) : [],
          likes: Array.isArray(parsedData.likes) ? parsedData.likes.join('\n') : '',
          dislikes: Array.isArray(parsedData.dislikes) ? parsedData.dislikes.join('\n') : '',
          dailyRoutine: {
            earlyMorning: parsedData.dailyRoutine?.earlyMorning || '',
            morning: parsedData.dailyRoutine?.morning || '',
            afternoon: parsedData.dailyRoutine?.afternoon || '',
            evening: parsedData.dailyRoutine?.evening || '',
            night: parsedData.dailyRoutine?.night || '',
            lateNight: parsedData.dailyRoutine?.lateNight || ''
          },
          skills: Array.isArray(parsedData.skills) ? parsedData.skills.map((skill: {
            name: string;
            description: string;
            dialogExample: string;
            behaviorExample: string;
          }) => ({
            name: skill.name || '',
            description: skill.description || '',
            dialogExample: skill.dialogExample || '',
            behaviorExample: skill.behaviorExample || ''
          })) : []
        };

        // 验证基本结构
        if (!convertedData.chineseName) {
          throw new Error('无效的角色卡文件格式');
        }

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

// 重置表单数据
const resetForm = () => {
  ElMessageBox.confirm('确定要重置所有数据吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    form.value = {
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
        labia: '',
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
      skills: []
    };
    ElMessage.success('数据已重置');
  }).catch(() => {
    ElMessage.info('取消重置');
  });
};

// 添加服装套装
const addAttire = () => {
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

// 删除服装套装
const removeAttire = (index: number) => {
  form.value.attires.splice(index, 1);
};

// 导出服装套装
const exportAttires = async () => {
  try {
    const attiresData = form.value.attires;
    if (attiresData.length === 0) {
      ElMessage.warning('没有可导出的服装套装');
      return;
    }
    await navigator.clipboard.writeText(JSON.stringify(attiresData, null, 2));
    ElMessage.success('服装套装已复制到剪贴板！');
  } catch (error) {
    ElMessage.error("导出失败");
  }
};

defineExpose({
  saveCharacterCard,
  loadCharacterCard,
  resetForm,
  addAttire,
  removeAttire,
  exportAttires
})
</script>

<style scoped>
/* 使用 Tailwind CSS 进行样式控制 */
.section-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-container>* {
  flex: 1;
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
