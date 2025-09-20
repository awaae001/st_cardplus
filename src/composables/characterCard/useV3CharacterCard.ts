import { ref } from 'vue';
import type { CharacterCardV3 } from '@/types/character-card-v3';

// 默认的角色卡数据结构，用于初始化和重置
const getDefaultCharacterData = (): CharacterCardV3 => ({
  spec: 'chara_card_v3',
  spec_version: '3.0',
  name: '',
  description: '',
  personality: '',
  scenario: '',
  first_mes: '',
  mes_example: '',
  creatorcomment: '',
  avatar: 'none',
  talkativeness: 0.5,
  fav: false,
  tags: [],
  data: {
    name: '',
    description: '',
    personality: '',
    scenario: '',
    first_mes: '',
    mes_example: '',
    creator_notes: '',
    system_prompt: '',
    post_history_instructions: '',
    tags: [],
    creator: '',
    character_version: '',
    alternate_greetings: [],
    group_only_greetings: [],
    character_book: {
      name: '',
      entries: [],
    },
    extensions: {
      world: '',
      talkativeness: 0.5,
      fav: false,
      depth_prompt: {},
      regex_scripts: [],
    },
  },
});

export function useV3CharacterCard() {
  // 使用 ref 创建响应式的角色数据状态
  const characterData = ref<CharacterCardV3>(getDefaultCharacterData());

  // 用于加载新数据的函数
  // 用于加载新数据的函数，现在它会处理数据规范化
  const loadCharacter = (newData: any) => {
    console.log('useV3CharacterCard: loadCharacter called with data:', newData);
    console.log('useV3CharacterCard: newData keys:', Object.keys(newData));
    console.log('useV3CharacterCard: newData.name:', newData.name);
    console.log('useV3CharacterCard: newData.description:', newData.description);
    console.log('useV3CharacterCard: newData.data:', newData.data);

    const defaultData = getDefaultCharacterData();
    const isV2 = !newData.spec || newData.spec !== 'chara_card_v3';
    console.log('useV3CharacterCard: isV2 format:', isV2);

    // 基础合并，newData 覆盖 defaultData
    const mergedData: CharacterCardV3 = {
      ...defaultData,
      ...newData,
      data: {
        ...defaultData.data,
        ...(newData.data || {}),
        character_book: {
          ...(defaultData.data.character_book || {}),
          ...(newData.data?.character_book || {}),
        },
        extensions: {
          ...(defaultData.data.extensions || {}),
          ...(newData.data?.extensions || {}),
        },
      },
    };

    console.log('useV3CharacterCard: mergedData after initial merge:', mergedData);

    // 如果是 V2 数据，需要进行字段提升
    if (isV2) {
      console.log('useV3CharacterCard: Processing V2 data conversion');
      const extensions = newData.data?.extensions || {};
      mergedData.talkativeness = extensions.talkativeness ?? newData.talkativeness ?? defaultData.talkativeness;
      mergedData.fav = extensions.fav ?? newData.fav ?? defaultData.fav;
      // V2 可能没有顶层 tags，从 data.tags 提取
      mergedData.tags = newData.tags || newData.data?.tags || defaultData.tags;
      console.log('useV3CharacterCard: V2 conversion completed');
    }

    // 确保 spec 字段正确
    mergedData.spec = 'chara_card_v3';
    mergedData.spec_version = '3.0';

    // 数据同步：将顶层数据同步到 data 对象，确保 UI 响应
    mergedData.data.name = mergedData.name;
    mergedData.data.description = mergedData.description;
    mergedData.data.personality = mergedData.personality;
    mergedData.data.scenario = mergedData.scenario;
    mergedData.data.first_mes = mergedData.first_mes;
    mergedData.data.mes_example = mergedData.mes_example;
    mergedData.data.tags = mergedData.tags;

    console.log('useV3CharacterCard: Final mergedData before assignment:', mergedData);
    console.log('useV3CharacterCard: characterData.value before update:', characterData.value);

    // 使用 Object.assign 在原地更新对象，以确保响应性
    Object.assign(characterData.value, mergedData);

    console.log('useV3CharacterCard: characterData.value after update:', characterData.value);
    console.log('useV3CharacterCard: characterData.value.name:', characterData.value.name);
    console.log('useV3CharacterCard: characterData.value.data.name:', characterData.value.data.name);
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