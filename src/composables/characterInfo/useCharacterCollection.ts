import { ref, computed, watch, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  saveToLocalStorage as saveToLS,
  loadFromLocalStorage as loadFromLS,
} from "../../utils/localStorageUtils";
import type { CharacterCard } from '../../types/character';
import { v4 as uuidv4 } from 'uuid';
import { createDefaultCharacterCard } from "./useCharacterCard";
import { processLoadedData } from "./useCardDataHandler";

const LOCAL_STORAGE_KEY_CHARACTER_MANAGER = "characterManagerData";

export interface CharacterCollection {
  characters: { [id: string]: CharacterCard };
  activeCharacterId: string | null;
}

export function useCharacterCollection() {
  const characterCollection = ref<CharacterCollection>({
    characters: {},
    activeCharacterId: null,
  });

  const activeCharacterId = computed(() => characterCollection.value.activeCharacterId);

  const activeCharacter = computed<CharacterCard | null>(() => {
    if (activeCharacterId.value && characterCollection.value.characters[activeCharacterId.value]) {
      return characterCollection.value.characters[activeCharacterId.value];
    }
    return null;
  });

  const saveCharactersToLocalStorage = (): void => {
    saveToLS(characterCollection.value, LOCAL_STORAGE_KEY_CHARACTER_MANAGER);
  };

  onMounted(() => {
    const loadedData = loadFromLS(LOCAL_STORAGE_KEY_CHARACTER_MANAGER);
    if (loadedData && typeof loadedData === 'object' && loadedData.characters) {
      characterCollection.value = loadedData as CharacterCollection;
    } else {
      // Initialize with a default character if none exist
      const newId = uuidv4();
      const defaultCharacter = { ...createDefaultCharacterCard(), id: newId, chineseName: "默认角色" };
      characterCollection.value = {
        characters: { [newId]: defaultCharacter },
        activeCharacterId: newId,
      };
      saveCharactersToLocalStorage();
    }
  });

  watch(
    characterCollection,
    () => {
      // 使用nextTick延迟存储，避免阻塞响应式更新
      nextTick(() => {
        saveCharactersToLocalStorage();
      });
    },
    { deep: true }
  );

  const handleSelectCharacter = (characterId: string) => {
    if (characterCollection.value.characters[characterId]) {
      characterCollection.value.activeCharacterId = characterId;
    }
  };

  const handleCreateCharacter = async () => {
    try {
      const { value: characterName } = await ElMessageBox.prompt(
        '请输入新角色的名称：',
        '创建新角色',
        {
          confirmButtonText: '创建',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '名称不能为空',
          inputValue: '新角色',
        }
      );

      const newId = uuidv4();
      const newCharacter: CharacterCard = {
        ...createDefaultCharacterCard(),
        id: newId,
        chineseName: characterName,
      };

      // 使用响应式更新，确保UI立即更新
      nextTick(() => {
        characterCollection.value = {
          ...characterCollection.value,
          characters: {
            ...characterCollection.value.characters,
            [newId]: newCharacter
          },
          activeCharacterId: newId
        };
      });

      ElMessage.success(`角色 "${characterName}" 已创建！`);

    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.info('创建操作已取消');
      }
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    const character = characterCollection.value.characters[characterId];
    if (!character) return;

    if (Object.keys(characterCollection.value.characters).length <= 1) {
      ElMessage.warning('不能删除最后一个角色 ');
      return;
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除角色 "${character.chineseName}" 吗？此操作不可恢复！`,
        '删除角色',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      );

      // 使用响应式删除，确保UI立即更新
      const remainingCharacters = { ...characterCollection.value.characters };
      delete remainingCharacters[characterId];
      
      const newActiveId = characterCollection.value.activeCharacterId === characterId 
        ? Object.keys(remainingCharacters)[0] || null 
        : characterCollection.value.activeCharacterId;

      nextTick(() => {
        characterCollection.value = {
          ...characterCollection.value,
          characters: remainingCharacters,
          activeCharacterId: newActiveId
        };
      });

      ElMessage.success(`角色 "${character.chineseName}" 已删除 `);

    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.info('删除操作已取消');
      }
    }
  };

  const handleImportCharacter = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('无法读取文件内容 ');
        }

        const importedData = JSON.parse(result) as Partial<CharacterCard> & { name?: string };


        // 基本验证 (可以根据需要扩展)
        if (!importedData.chineseName && !importedData.japaneseName && !importedData.name) {
          throw new Error('导入的数据缺少角色名称 ');
        }

        const newId = uuidv4();
        const processedData = processLoadedData(importedData);
        const newCharacter: CharacterCard = {
          ...createDefaultCharacterCard(),
          ...processedData,
          id: newId, // 始终分配新ID以避免冲突
        };
        
        // 如果没有中文名，但有英文名或日文名，则使用它们
        if (!newCharacter.chineseName) {
          newCharacter.chineseName = importedData.name || newCharacter.japaneseName || '未命名角色';
        }

        // 使用响应式更新，确保UI立即更新
        nextTick(() => {
          characterCollection.value = {
            ...characterCollection.value,
            characters: {
              ...characterCollection.value.characters,
              [newId]: newCharacter,
            },
            activeCharacterId: newId,
          };
        });

        ElMessage.success(`角色 "${newCharacter.chineseName}" 已成功导入！`);
      } catch (error) {
        console.error("导入角色失败:", error);
        ElMessage.error(`导入失败: ${error instanceof Error ? error.message : '无效的文件格式 '}`);
      }
    };
    reader.onerror = () => {
      ElMessage.error('读取文件时发生错误 ');
    };
    reader.readAsText(file);
  };

  const updateCharacter = (characterId: string, updatedData: CharacterCard) => {
    if (characterCollection.value.characters[characterId]) {
      // 深度克隆更新数据，避免引用共享问题
      characterCollection.value.characters[characterId] = JSON.parse(JSON.stringify(updatedData));
    }
  };

  return {
    characterCollection,
    activeCharacterId,
    activeCharacter,
    handleSelectCharacter,
    handleCreateCharacter,
    handleDeleteCharacter,
    handleImportCharacter,
    updateCharacter,
  };
}