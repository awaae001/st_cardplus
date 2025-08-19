import { ref } from 'vue';
import type { CharacterCard } from '../../types/character';

/**
 * 创建默认的角色卡数据
 * 用于初始化表单和重置表单
 */
export const createDefaultCharacterCard = (): CharacterCard => ({
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
  notes: [],
});

export function useCharacterCard() {
  const form = ref<CharacterCard>(createDefaultCharacterCard());
  return {
    form,
  };
}