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
  const characterData = ref<CharacterCardV3>(getDefaultCharacterData());
  const isLoadingData = ref(false);

  const loadCharacter = (newData: any) => {
    isLoadingData.value = true;
    const defaultData = getDefaultCharacterData();
    const isV2 = !newData.spec || newData.spec !== 'chara_card_v3';
    const incomingTopLevel = newData || {};
    const incomingData = newData?.data && typeof newData.data === 'object' ? newData.data : {};
    const hasDataField = (key: string) => Object.prototype.hasOwnProperty.call(incomingData, key);
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

    // 如果是 V2 数据，需要进行字段提升
    if (isV2) {
      console.log('useV3CharacterCard: Processing V2 data conversion');
      const extensions = newData.data?.extensions || {};
      mergedData.talkativeness = extensions.talkativeness ?? newData.talkativeness ?? defaultData.talkativeness;
      mergedData.fav = extensions.fav ?? newData.fav ?? defaultData.fav;
      // V2 可能没有顶层 tags，从 data.tags 提取
      mergedData.tags = newData.tags ?? newData.data?.tags ?? defaultData.tags;
      console.log('useV3CharacterCard: V2 conversion completed');
    }
    mergedData.spec = 'chara_card_v3';
    mergedData.spec_version = '3.0';

    // data 层优先；仅在字段缺失(undefined/null)时才回退到顶层，保留空字符串
    mergedData.data.name = hasDataField('name')
      ? (incomingData.name ?? defaultData.data.name)
      : (incomingTopLevel.name ?? defaultData.data.name);
    mergedData.data.description = hasDataField('description')
      ? (incomingData.description ?? defaultData.data.description)
      : (incomingTopLevel.description ?? defaultData.data.description);
    mergedData.data.personality = hasDataField('personality')
      ? (incomingData.personality ?? defaultData.data.personality)
      : (incomingTopLevel.personality ?? defaultData.data.personality);
    mergedData.data.scenario = hasDataField('scenario')
      ? (incomingData.scenario ?? defaultData.data.scenario)
      : (incomingTopLevel.scenario ?? defaultData.data.scenario);
    mergedData.data.first_mes = hasDataField('first_mes')
      ? (incomingData.first_mes ?? defaultData.data.first_mes)
      : (incomingTopLevel.first_mes ?? defaultData.data.first_mes);
    mergedData.data.mes_example = hasDataField('mes_example')
      ? (incomingData.mes_example ?? defaultData.data.mes_example)
      : (incomingTopLevel.mes_example ?? defaultData.data.mes_example);
    const resolvedTags = hasDataField('tags') ? incomingData.tags : incomingTopLevel.tags;
    mergedData.data.tags = Array.isArray(resolvedTags) ? resolvedTags : defaultData.data.tags;

    // 2. 从 data 层同步到顶层（用于兼容性）
    mergedData.name = mergedData.data.name;
    mergedData.description = mergedData.data.description;
    mergedData.personality = mergedData.data.personality;
    mergedData.scenario = mergedData.data.scenario;
    mergedData.first_mes = mergedData.data.first_mes;
    mergedData.mes_example = mergedData.data.mes_example;
    mergedData.tags = mergedData.data.tags;
    // 使用 Object.assign 在原地更新对象，以确保响应性
    Object.assign(characterData.value, mergedData);

    setTimeout(() => {
      isLoadingData.value = false;
    }, 0);
  };

  // 用于重置为默认空状态的函数
  const resetCharacter = () => {
    isLoadingData.value = true;
    characterData.value = getDefaultCharacterData();
    setTimeout(() => {
      isLoadingData.value = false;
    }, 0);
  };

  return {
    characterData,
    isLoadingData,
    loadCharacter,
    resetCharacter,
  };
}
