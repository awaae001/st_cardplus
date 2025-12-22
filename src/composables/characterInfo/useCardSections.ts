import type { Ref } from 'vue';
import type { CharacterCard } from '../../types/character';
import { copyToClipboard as copyUtil } from '../../utils/clipboard';
import { ElMessage } from 'element-plus';

export function useCardSections(form: Ref<CharacterCard>) {
  const addTrait = (): void => {
    form.value.traits.push({
      name: '',
      description: '',
      dialogueExamples: [''],
      behaviorExamples: ['']
    });
  };

  const removeTrait = (index: number): void => {
    form.value.traits.splice(index, 1);
  };

  const addSkill = (): void => {
    form.value.skills.push({
      name: '',
      type: '',
      description: '',
      dialogExample: '',
      behaviorExample: ''
    });
  };

  const removeSkill = (index: number): void => {
    form.value.skills.splice(index, 1);
  };

  const addRelationship = (): void => {
    form.value.relationships.push({
      name: '',
      description: '',
      features: '',
      dialogueExamples: ['']
    });
  };

  const removeRelationship = (index: number): void => {
    form.value.relationships.splice(index, 1);
  };

  // 4位数字ID生成器 (1000-9999)
  const generateNoteId = (): number => {
    const existingIds = new Set(form.value.notes.map(note => note.id));
    let newId: number;
    do {
      newId = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    } while (existingIds.has(newId));
    return newId;
  };

  const addNote = (): void => {
    form.value.notes.push({
      id: generateNoteId(),
      name: '',
      data: ['']
    });
  };

  const removeNote = (id: number): void => {
    const index = form.value.notes.findIndex(note => note.id === id);
    if (index !== -1) {
      form.value.notes.splice(index, 1);
    }
  };

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

  const removeAttire = (index: number): void => {
    form.value.attires.splice(index, 1);
  };

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

  const exportSkills = async (): Promise<void> => {
    const skillsData = form.value.skills;
    if (skillsData.length === 0) {
      ElMessage.warning('没有可导出的技能');
      return;
    }
    await copyUtil(JSON.stringify(skillsData, null, 2), '技能已复制到剪贴板！', '导出失败');
  };

  const exportTraits = async (): Promise<void> => {
    const traitsData = form.value.traits;
    if (traitsData.length === 0) {
      ElMessage.warning('没有可导出的性格特质');
      return;
    }
    await copyUtil(JSON.stringify(traitsData, null, 2), '性格特质已复制到剪贴板！', '导出失败');
  };

  const exportRelationships = async (): Promise<void> => {
    const relationshipsData = form.value.relationships;
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