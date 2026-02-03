import { ref, computed, watch, onMounted } from "vue";
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

  const ensureCharacterOrder = () => {
    const characters = { ...characterCollection.value.characters };
    const values = Object.values(characters);
    const hasAnyOrder = values.some((character) => typeof character.order === 'number');

    if (!hasAnyOrder) {
      const starredCharacters = values.filter((character) => !!character.starred);
      const regularCharacters = values.filter((character) => !character.starred);
      starredCharacters.forEach((character, index) => {
        if (!character.id) return;
        characters[character.id] = {
          ...character,
          order: index,
          starred: typeof character.starred === 'boolean' ? character.starred : false,
        };
      });
      regularCharacters.forEach((character, index) => {
        if (!character.id) return;
        characters[character.id] = {
          ...character,
          order: index,
          starred: typeof character.starred === 'boolean' ? character.starred : false,
        };
      });
    } else {
      let maxStarredOrder = values
        .filter((character) => !!character.starred)
        .reduce((max, character) => {
          const currentOrder = typeof character.order === 'number' ? character.order : -1;
          return Math.max(max, currentOrder);
        }, -1);
      let maxRegularOrder = values
        .filter((character) => !character.starred)
        .reduce((max, character) => {
          const currentOrder = typeof character.order === 'number' ? character.order : -1;
          return Math.max(max, currentOrder);
        }, -1);

      values.forEach((character) => {
        if (!character.id) return;
        if (typeof character.starred !== 'boolean') {
          characters[character.id] = {
            ...character,
            starred: false,
          };
        }
        if (typeof character.order === 'number') return;
        if (character.starred) {
          maxStarredOrder += 1;
          characters[character.id] = {
            ...character,
            order: maxStarredOrder,
            starred: true,
          };
          return;
        }
        maxRegularOrder += 1;
        characters[character.id] = {
          ...character,
          order: maxRegularOrder,
          starred: false,
        };
      });
    }

    characterCollection.value = {
      ...characterCollection.value,
      characters,
    };
  };

  const getNextOrder = (starred: boolean) => {
    const orders = Object.values(characterCollection.value.characters)
      .filter((character) => !!character.starred === starred)
      .map((character) => character.order)
      .filter((order): order is number => typeof order === 'number');
    return orders.length > 0 ? Math.max(...orders) + 1 : 0;
  };

  onMounted(() => {
    const loadedData = loadFromLS(LOCAL_STORAGE_KEY_CHARACTER_MANAGER);
    if (loadedData && typeof loadedData === 'object' && loadedData.characters) {
      characterCollection.value = loadedData as CharacterCollection;
      ensureCharacterOrder();
    } else {
      // Initialize with a default character if none exist
      const newId = uuidv4();
      const defaultCharacter = {
        ...createDefaultCharacterCard(),
        id: newId,
        order: 0,
        starred: false,
        chineseName: "默认角色",
      };
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
      // 立即保存，确保数据持久化
      saveCharactersToLocalStorage();
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
      const createCharacterResult = await ElMessageBox.prompt(
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
      const { value: characterName } = createCharacterResult as { value: string };

      const newId = uuidv4();
      const newCharacter: CharacterCard = {
        ...createDefaultCharacterCard(),
        id: newId,
        order: getNextOrder(false),
        starred: false,
        chineseName: characterName,
      };

      // 立即更新characterCollection，避免时序问题
      characterCollection.value = {
        ...characterCollection.value,
        characters: {
          ...characterCollection.value.characters,
          [newId]: newCharacter
        },
        activeCharacterId: newId
      };

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

      // 立即更新characterCollection，避免时序问题
      characterCollection.value = {
        ...characterCollection.value,
        characters: remainingCharacters,
        activeCharacterId: newActiveId
      };

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
          order: getNextOrder(false),
          starred: typeof processedData.starred === 'boolean' ? processedData.starred : false,
        };
        
        // 如果没有中文名，但有英文名或日文名，则使用它们
        if (!newCharacter.chineseName) {
          newCharacter.chineseName = importedData.name || newCharacter.japaneseName || '未命名角色';
        }

        // 立即更新characterCollection，避免时序问题
        characterCollection.value = {
          ...characterCollection.value,
          characters: {
            ...characterCollection.value.characters,
            [newId]: newCharacter,
          },
          activeCharacterId: newId,
        };

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
      // 使用整体替换来确保Vue能正确检测到变化
      const updatedCharacters = {
        ...characterCollection.value.characters,
        [characterId]: JSON.parse(JSON.stringify(updatedData))
      };

      characterCollection.value = {
        ...characterCollection.value,
        characters: updatedCharacters
      };

      // 强制触发保存，确保数据持久化
      saveCharactersToLocalStorage();
    } else {
      console.error('updateCharacter: 角色不存在', characterId, '当前角色:', Object.keys(characterCollection.value.characters));
    }
  };

  const setCharacterStar = (characterId: string, starred: boolean) => {
    const character = characterCollection.value.characters[characterId];
    if (!character) return;

    if (!!character.starred === starred) return;

    const updatedCharacter = {
      ...character,
      starred,
      order: getNextOrder(starred),
    };

    characterCollection.value = {
      ...characterCollection.value,
      characters: {
        ...characterCollection.value.characters,
        [characterId]: updatedCharacter,
      },
    };
  };

  const reorderCharacters = (orderedIds: string[]) => {
    const updatedCharacters = { ...characterCollection.value.characters };
    let starredIndex = 0;
    let regularIndex = 0;
    orderedIds.forEach((id) => {
      if (!updatedCharacters[id]) return;
      if (updatedCharacters[id].starred) {
        updatedCharacters[id] = {
          ...updatedCharacters[id],
          order: starredIndex,
        };
        starredIndex += 1;
        return;
      }
      updatedCharacters[id] = {
        ...updatedCharacters[id],
        order: regularIndex,
      };
      regularIndex += 1;
    });

    characterCollection.value = {
      ...characterCollection.value,
      characters: updatedCharacters,
    };
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
    setCharacterStar,
    reorderCharacters,
  };
}
