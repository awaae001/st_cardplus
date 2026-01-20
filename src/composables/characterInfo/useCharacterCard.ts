import { ref } from 'vue';
import type { CharacterCard } from '../../types/character';

/**
 * 创建默认的角色卡数据
 * 用于初始化表单和重置表单
 * @param id - 可选的角色ID，如果提供则包含在返回的对象中
 */
export const createDefaultCharacterCard = (id?: string): CharacterCard => {
  const card: CharacterCard = {
    chineseName: '',
    japaneseName: '',
    starred: false,
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
  };

  // 如果提供了ID，则添加到返回对象中
  if (id) {
    card.id = id;
  }

  return card;
};

export function useCharacterCard() {
  const form = ref<CharacterCard>(createDefaultCharacterCard());
  return {
    form,
  };
}
