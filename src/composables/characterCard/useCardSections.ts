import { toRefs } from 'vue';
import type { CharacterCard } from '../../types/character';
import { copyToClipboard as copyUtil } from '../../utils/clipboard';
import { ElMessage } from 'element-plus';

export function useCardSections(form: CharacterCard) {
  const { traits, skills, relationships, attires, notes } = toRefs(form);

  const addTrait = (): void => {
    traits.value.push({
      name: '',
      description: '',
      dialogueExamples: [''],
      behaviorExamples: ['']
    });
  };

  const removeTrait = (index: number): void => {
    traits.value.splice(index, 1);
  };

  const addSkill = (): void => {
    skills.value.push({
      name: '',
      description: '',
      dialogExample: '',
      behaviorExample: ''
    });
  };

  const removeSkill = (index: number): void => {
    skills.value.splice(index, 1);
  };

  const addRelationship = (): void => {
    relationships.value.push({
      name: '',
      description: '',
      features: '',
      dialogueExamples: ['']
    });
  };

  const removeRelationship = (index: number): void => {
    relationships.value.splice(index, 1);
  };

  const addNote = (): void => {
    notes.value.push({
      name: '',
      data: ['']
    });
  };

  const removeNote = (index: number): void => {
    notes.value.splice(index, 1);
  };

  const addAttire = (): void => {
    attires.value.push({
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

  const removeAttire = (index: number): void => {
    attires.value.splice(index, 1);
  };

  const exportAttires = async (): Promise<void> => {
    try {
      const processedAttires = attires.value.map(attire => ({
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

  const exportSkills = async (): Promise<void> => {
    const skillsData = skills.value;
    if (skillsData.length === 0) {
      ElMessage.warning('没有可导出的技能');
      return;
    }
    await copyUtil(JSON.stringify(skillsData, null, 2), '技能已复制到剪贴板！', '导出失败');
  };

  const exportTraits = async (): Promise<void> => {
    const traitsData = traits.value;
    if (traitsData.length === 0) {
      ElMessage.warning('没有可导出的性格特质');
      return;
    }
    await copyUtil(JSON.stringify(traitsData, null, 2), '性格特质已复制到剪贴板！', '导出失败');
  };

  const exportRelationships = async (): Promise<void> => {
    const relationshipsData = relationships.value;
    if (relationshipsData.length === 0) {
      ElMessage.warning('没有可导出的人际关系');
      return;
    }
    await copyUtil(JSON.stringify(relationshipsData, null, 2), '人际关系已复制到剪贴板！', '导出失败');
  };

  return {
    addTrait,
    removeTrait,
    addSkill,
    removeSkill,
    addRelationship,
    removeRelationship,
    addNote,
    removeNote,
    addAttire,
    removeAttire,
    exportAttires,
    exportSkills,
    exportTraits,
    exportRelationships,
  };
}