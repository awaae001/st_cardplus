import type { Ref } from 'vue';
import type { CharacterCard } from '../../types/character';
import { addItem, removeItem, exportSection } from './sectionHelpers';

export function useCardSections(form: Ref<CharacterCard>) {
  const addTrait = () =>
    addItem(form.value.traits, () => ({
      name: '',
      description: '',
      dialogueExamples: [''],
      behaviorExamples: [''],
    }));

  const removeTrait = (index: number) => removeItem(form.value.traits, index);

  const addSkill = () =>
    addItem(form.value.skills, () => ({
      name: '',
      type: '',
      description: '',
      dialogExample: '',
      behaviorExample: '',
    }));

  const removeSkill = (index: number) => removeItem(form.value.skills, index);

  const addRelationship = () =>
    addItem(form.value.relationships, () => ({
      name: '',
      description: '',
      features: '',
      dialogueExamples: [''],
    }));

  const removeRelationship = (index: number) => removeItem(form.value.relationships, index);

  // 4位数字ID生成器 (1000-9999)
  const generateNoteId = (): number => {
    const existingIds = new Set(form.value.notes.map((note) => note.id));
    let newId: number;
    do {
      newId = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    } while (existingIds.has(newId));
    return newId;
  };

  const addNote = () =>
    addItem(form.value.notes, () => ({
      id: generateNoteId(),
      name: '',
      data: [''],
    }));

  const removeNote = (id: number) => {
    const index = form.value.notes.findIndex((note) => note.id === id);
    removeItem(form.value.notes, index);
  };

  const addAttire = () =>
    addItem(form.value.attires, () => ({
      name: '',
      description: '',
      tops: '',
      bottoms: '',
      shoes: '',
      socks: '',
      underwears: '',
      accessories: '',
    }));

  const removeAttire = (index: number) => removeItem(form.value.attires, index);
  const exportAttires = () => {
    const processedAttires = form.value.attires.map((attire) => ({
      ...attire,
      accessories:
        typeof attire.accessories === 'string'
          ? attire.accessories.split('\n').filter((a) => a.trim() !== '')
          : attire.accessories || [],
    }));
    return exportSection(processedAttires, '服装套装');
  };

  const exportSkills = () => exportSection(form.value.skills, '技能');
  const exportTraits = () => exportSection(form.value.traits, '性格特质');
  const exportRelationships = () => exportSection(form.value.relationships, '人际关系');

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
