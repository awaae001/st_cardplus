import { ref } from 'vue';
import type { V2CharData } from '@/types/character-card-v2';

// 默认的角色卡数据结构，用于初始化和重置
const getDefaultCharacterData = (): V2CharData => ({
  name: '',
  description: '',
  character_version: '2.0',
  personality: '',
  scenario: '',
  first_mes: '',
  mes_example: '',
  creator_notes: '',
  tags: [],
  system_prompt: '',
  post_history_instructions: '',
  creator: '',
  alternate_greetings: [],
  character_book: {
    name: '',
    entries: [],
  },
  extensions: {
    talkativeness: 0.5,
    fav: false,
    world: '',
    depth_prompt: {
      depth: 0,
      prompt: '',
      role: 'system',
    },
    regex_scripts: [],
  },
});

export function useV2CharacterCard() {
  // 使用 ref 创建响应式的角色数据状态
  const characterData = ref<V2CharData>(getDefaultCharacterData());

  // 用于加载新数据的函数
  const loadCharacter = (newData: V2CharData) => {
    characterData.value = { ...getDefaultCharacterData(), ...newData };
  };

  // 用于重置为默认空状态的函数
  const resetCharacter = () => {
    characterData.value = getDefaultCharacterData();
  };

  return {
    characterData,
    loadCharacter,
    resetCharacter,
  };
}