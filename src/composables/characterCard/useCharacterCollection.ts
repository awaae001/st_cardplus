import { ref, computed, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  saveToLocalStorage as saveToLS,
  loadFromLocalStorage as loadFromLS,
} from "../../utils/localStorageUtils";
import type { CharacterCard } from '../../types/character';
import { v4 as uuidv4 } from 'uuid';
import { createDefaultCharacterCard } from "./useCharacterCard";

const LOCAL_STORAGE_KEY_MANAGER = "characterCardManagerData";
const LOCAL_STORAGE_KEY_LEGACY = "characterCardData";

export interface Character {
  id: string;
  name: string;
  data: CharacterCard;
  createdAt: string;
  updatedAt: string;
  order: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CharacterCollection {
  characters: Record<string, Character>;
  activeCharacterId: string | null;
  settings?: Record<string, any>;
}

export function useCharacterCollection() {
  const characterCollection = ref<CharacterCollection>({
    characters: {},
    activeCharacterId: null,
  });

  const activeCharacterId = computed(() => characterCollection.value.activeCharacterId);

  const activeCharacter = computed<Character | null>(() => {
    if (activeCharacterId.value && characterCollection.value.characters[activeCharacterId.value]) {
      return characterCollection.value.characters[activeCharacterId.value];
    }
    return null;
  });
  
  const saveCollectionToLocalStorage = (): void => {
    saveToLS(characterCollection.value, LOCAL_STORAGE_KEY_MANAGER);
  };

  onMounted(() => {
    const loadAndMigrateData = () => {
      const newFormatData = loadFromLS(LOCAL_STORAGE_KEY_MANAGER);

      if (newFormatData && typeof newFormatData === 'object' && newFormatData.characters) {
        characterCollection.value = newFormatData as CharacterCollection;
        
        Object.values(characterCollection.value.characters).forEach((char) => {
          if (typeof char.order !== 'number') {
            char.order = new Date(char.createdAt).getTime();
          }
        });

      } else {
        const legacyData = loadFromLS(LOCAL_STORAGE_KEY_LEGACY);
        const newCollection: CharacterCollection = {
          characters: {},
          activeCharacterId: null,
        };

        if (legacyData && typeof legacyData.chineseName === 'string') {
          const newCharId = uuidv4();
          const now = new Date().toISOString();
          newCollection.characters[newCharId] = {
            id: newCharId,
            name: legacyData.chineseName || "默认角色 (迁移)",
            data: legacyData,
            createdAt: now,
            updatedAt: now,
            description: "这是从旧版本自动迁移的角色卡。",
            order: 0,
          };
          newCollection.activeCharacterId = newCharId;
          ElMessage.success("旧的角色卡数据已成功迁移！");
        }

        if (Object.keys(newCollection.characters).length === 0) {
          const newCharId = uuidv4();
          const now = new Date().toISOString();
          newCollection.characters[newCharId] = {
            id: newCharId,
            name: "我的第一个角色",
            data: createDefaultCharacterCard(),
            createdAt: now,
            updatedAt: now,
            description: "在这里开始你的创作吧！",
            order: 0,
          };
          newCollection.activeCharacterId = newCharId;
        }

        characterCollection.value = newCollection;
        saveCollectionToLocalStorage();
      }
    };

    loadAndMigrateData();
  });

  watch(
    characterCollection,
    () => {
      saveCollectionToLocalStorage();
    },
    { deep: true }
  );

  const handleSelectCharacter = (charId: string) => {
    if (characterCollection.value.characters[charId]) {
      characterCollection.value.activeCharacterId = charId;
    }
  };

  const handleCreateCharacter = async () => {
    try {
      const { value: charName } = await ElMessageBox.prompt(
        '请输入新角色的名称：',
        '创建新角色',
        {
          confirmButtonText: '创建',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '名称不能为空',
        }
      );

      const newCharId = uuidv4();
      const now = new Date().toISOString();
      const existingOrders = Object.values(characterCollection.value.characters).map(c => c.order).filter(o => typeof o === 'number');
      const maxOrder = existingOrders.length > 0 ? Math.max(...existingOrders) : -1;

      const newChar: Character = {
        id: newCharId,
        name: charName,
        data: createDefaultCharacterCard(),
        createdAt: now,
        updatedAt: now,
        description: `创建于 ${new Date().toLocaleString()}`,
        order: maxOrder + 1,
      };
      
      newChar.data.chineseName = charName;

      characterCollection.value.characters[newCharId] = newChar;
      characterCollection.value.activeCharacterId = newCharId;
      ElMessage.success(`角色 "${charName}" 已创建！`);

    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.info('创建操作已取消');
      }
    }
  };

  const handleRenameCharacter = async (charId: string) => {
    const character = characterCollection.value.characters[charId];
    if (!character) return;

    try {
      const { value: newCharName } = await ElMessageBox.prompt(
        '请输入新的名称：',
        '重命名角色',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          inputValue: character.name,
          inputPattern: /.+/,
          inputErrorMessage: '名称不能为空',
        }
      );

      character.name = newCharName;
      character.data.chineseName = newCharName;
      character.updatedAt = new Date().toISOString();
      ElMessage.success('角色已重命名！');

    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.info('重命名操作已取消');
      }
    }
  };

  const handleDeleteCharacter = async (charId: string) => {
    const character = characterCollection.value.characters[charId];
    if (!character) return;

    if (Object.keys(characterCollection.value.characters).length <= 1) {
      ElMessage.warning('不能删除最后一个角色。');
      return;
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除角色 "${character.name}" 吗？此操作不可恢复！`,
        '删除角色',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      );

      delete characterCollection.value.characters[charId];

      if (characterCollection.value.activeCharacterId === charId) {
        characterCollection.value.activeCharacterId = Object.keys(characterCollection.value.characters)[0] || null;
      }

      ElMessage.success(`角色 "${character.name}" 已删除。`);

    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.info('删除操作已取消');
      }
    }
  };
  
  const updateCharacterOrder = (charIdsInOrder: string[]) => {
    charIdsInOrder.forEach((charId, index) => {
      const character = characterCollection.value.characters[charId];
      if (character) {
        character.order = index;
        character.updatedAt = new Date().toISOString();
      }
    });
    saveCollectionToLocalStorage();
  };


  return {
    characterCollection,
    activeCharacterId,
    activeCharacter,
    handleSelectCharacter,
    handleCreateCharacter,
    handleRenameCharacter,
    handleDeleteCharacter,
    saveCollectionToLocalStorage,
    updateCharacterOrder
  };
}