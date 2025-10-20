import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { v4 as uuidv4 } from 'uuid';
import { initAutoSave, clearAutoSave } from '@/utils/localStorageUtils';
import type { CharacterCardV3 } from '@/types/character-card-v3';
import type { CharacterCardCollection, CharacterCardItem } from '@/types/character-card-collection';
import { characterCardService, type StoredCharacterCard } from '@/database/characterCardService';

export function useCharacterCardCollection() {
  const characterCardCollection = ref<CharacterCardCollection>({
    cards: {},
    activeCardId: null,
  });
  const isLoading = ref(true);

  // 自动保存相关状态
  const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveMode = ref<'auto' | 'watch' | 'manual'>('watch'); // 默认监听模式
  const lastSavedData = ref<string>('');
  const hasUnsavedChanges = ref(false);
  const isAutoSaving = ref(false);
  let autoSaveTimer: number | null = null;

  const activeCardId = computed(() => characterCardCollection.value.activeCardId);

  const activeCard = computed<CharacterCardItem | null>(() => {
    const cardId = activeCardId.value;
    if (!cardId) return null;
    return characterCardCollection.value.cards[cardId] || null;
  });

  const allTags = computed(() => {
    const tags = Object.values(characterCardCollection.value.cards).flatMap(
      (card) => card.data?.tags || []
    );
    return [...new Set(tags)];
  });

  const loadInitialData = async () => {
    isLoading.value = true;
    try {
      const collection = await characterCardService.getFullCharacterCardCollection();
      characterCardCollection.value = collection;
    } catch (error) {
      console.error('加载角色卡数据失败:', error);
      ElMessage.error('加载角色卡数据失败！');
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(loadInitialData);

  const handleSelectCard = (cardId: string) => {
    if (characterCardCollection.value.cards[cardId]) {
      characterCardCollection.value.activeCardId = cardId;
      characterCardService.setActiveCardId(cardId);
    }
  };

  const handleSaveCurrentCard = async (cardData: CharacterCardV3) => {
    if (!cardData.name && !cardData.data?.name) {
      ElMessage.warning('请先填写角色名称');
      return null;
    }

    try {
      const cardId = uuidv4();
      const now = new Date().toISOString();
      const existingOrders = Object.values(characterCardCollection.value.cards).map(c => c.order);
      const maxOrder = existingOrders.length > 0 ? Math.max(...existingOrders) : -1;

      const storedCard = characterCardService.createStoredCard(cardId, cardData, {
        order: maxOrder + 1,
      });

      await characterCardService.addCard(storedCard);

      // 更新本地状态
      const newCard: CharacterCardItem = {
        ...cardData,
        id: cardId,
        createdAt: now,
        updatedAt: now,
        order: storedCard.order,
      };

      characterCardCollection.value.cards[cardId] = newCard;
      characterCardCollection.value.activeCardId = cardId;
      characterCardService.setActiveCardId(cardId);

      ElMessage.success(`角色卡 "${storedCard.name}" 已保存！`);
      return cardId;
    } catch (error) {
      console.error('保存角色卡失败:', error);
      ElMessage.error('保存角色卡失败！');
      return null;
    }
  };

  const handleUpdateCard = async (cardId: string, cardData: CharacterCardV3, silent = false) => {
    const existingCard = characterCardCollection.value.cards[cardId];
    if (!existingCard) {
      ElMessage.error('角色卡不存在');
      return;
    }

    try {
      const now = new Date().toISOString();
      const storedCard: StoredCharacterCard = {
        id: cardId,
        name: cardData.name || cardData.data?.name || '未命名角色',
        description: cardData.description || cardData.data?.description || '',
        avatar: cardData.avatar !== 'none' ? cardData.avatar : undefined,
        cardData,
        createdAt: existingCard.createdAt,
        updatedAt: now,
        order: existingCard.order,
        tags: cardData.tags || cardData.data?.tags || [],
        metadata: {},
      };

      await characterCardService.updateCard(storedCard);

      // 更新本地状态
      characterCardCollection.value.cards[cardId] = {
        ...cardData,
        id: cardId,
        createdAt: existingCard.createdAt,
        updatedAt: now,
        order: existingCard.order,
      };

      if (!silent) {
        ElMessage.success('角色卡已更新！');
      }
    } catch (error) {
      console.error('更新角色卡失败:', error);
      if (!silent) {
        ElMessage.error('更新角色卡失败！');
      }
      throw error;
    }
  };

  const handleRenameCard = async (cardId: string) => {
    const card = characterCardCollection.value.cards[cardId];
    if (!card) return;

    try {
      const { value: newCardName } = await ElMessageBox.prompt(
        '请输入新的名称：',
        '重命名角色卡',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          inputValue: card.name,
          inputPattern: /.+/,
          inputErrorMessage: '名称不能为空',
        }
      );

      const updatedCardData = {
        ...card,
        name: newCardName,
        data: {
          ...card.data,
          name: newCardName,
        },
      };

      await handleUpdateCard(cardId, updatedCardData);
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.info('重命名操作已取消');
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const card = characterCardCollection.value.cards[cardId];
    if (!card) return;

    try {
      await ElMessageBox.confirm(
        `确定要删除角色卡 "${card.name}" 吗？此操作不可恢复！`,
        '删除角色卡',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      );

      await characterCardService.deleteCard(cardId);

      // 更新本地状态
      delete characterCardCollection.value.cards[cardId];
      if (characterCardCollection.value.activeCardId === cardId) {
        const cardIds = Object.keys(characterCardCollection.value.cards);
        const newActiveId = cardIds.length > 0 ? cardIds[0] : null;
        characterCardCollection.value.activeCardId = newActiveId;
        characterCardService.setActiveCardId(newActiveId);
      }

      ElMessage.success(`角色卡 "${card.name}" 已删除`);
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.info('删除操作已取消');
      }
    }
  };

  const handleImportCard = async (cardData: CharacterCardV3) => {
    if (!cardData.name && !cardData.data?.name) {
      ElMessage.error('导入的角色卡缺少名称');
      return null;
    }

    return await handleSaveCurrentCard(cardData);
  };

  const handleImportFromFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        if (!jsonData || typeof jsonData !== 'object') {
          throw new Error('无效的角色卡文件格式');
        }

        // 处理角色卡数据
        const cardId = await handleImportCard(jsonData);
        if (cardId) {
          ElMessage.success(`角色卡 "${jsonData.name || jsonData.data?.name || '未命名'}" 已成功导入！`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        ElMessage.error(`导入失败: ${errorMessage}`);
      }
    };

    reader.onerror = () => {
      ElMessage.error('读取文件时出错');
    };

    reader.readAsText(file);
  };

  const handleExportCard = async (cardId: string) => {
    const card = characterCardCollection.value.cards[cardId];
    if (!card) {
      ElMessage.error('角色卡不存在');
      return;
    }

    try {
      // 创建导出数据，移除管理字段
      const { id, createdAt, updatedAt, order, ...exportData } = card;
      const jsonDataString = JSON.stringify(exportData, null, 2);

      const blob = new Blob([jsonDataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${card.name || 'character'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      ElMessage.success('角色卡已成功导出！');
    } catch (error) {
      console.error('导出角色卡失败:', error);
      ElMessage.error('导出角色卡失败！');
    }
  };

  const handleExportAllCards = async () => {
    try {
      const exportData = await characterCardService.exportDatabase();
      const jsonDataString = JSON.stringify(exportData, null, 2);

      const blob = new Blob([jsonDataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `character-cards-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      ElMessage.success('所有角色卡已成功导出！');
    } catch (error) {
      console.error('导出失败:', error);
      ElMessage.error('导出失败！');
    }
  };

  const handleClearAllCards = async () => {
    try {
      await ElMessageBox.confirm(
        '确定要清空所有角色卡吗？此操作不可恢复！',
        '清空所有角色卡',
        {
          confirmButtonText: '确认清空',
          cancelButtonText: '取消',
          type: 'warning',
        }
      );

      await characterCardService.clearDatabase();
      characterCardCollection.value.cards = {};
      characterCardCollection.value.activeCardId = null;
      characterCardService.setActiveCardId(null);

      ElMessage.success('所有角色卡已清空');
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.info('清空操作已取消');
      }
    }
  };

  const handleCreateNewCard = async () => {
    try {
      const { value: cardName } = await ElMessageBox.prompt(
        '请输入新角色的名称：',
        '创建新角色卡',
        {
          confirmButtonText: '创建',
          cancelButtonText: '取消',
          inputValue: '新角色',
          inputPattern: /.+/,
          inputErrorMessage: '名称不能为空',
        }
      );

      // 创建默认的角色卡数据
      const defaultData: CharacterCardV3 = {
        spec: 'chara_card_v3',
        spec_version: '3.0',
        name: cardName,
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
          name: cardName,
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
      };

      const cardId = await handleSaveCurrentCard(defaultData);
      return cardId;
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        console.error('创建新角色卡失败:', error);
        ElMessage.error('创建新角色卡失败！');
      }
      return null;
    }
  };

  // 切换自动保存模式
  const toggleAutoSaveMode = () => {
    const modes: Array<'auto' | 'watch' | 'manual'> = ['auto', 'watch', 'manual'];
    const currentIndex = modes.indexOf(autoSaveMode.value);
    const nextIndex = (currentIndex + 1) % modes.length;
    autoSaveMode.value = modes[nextIndex];

    const messages = {
      auto: '已切换到自动保存模式：每 5 秒自动保存',
      watch: '已切换到监听模式：检测到修改后 1.5 秒自动保存',
      manual: '已切换到手动模式：自动保存已禁用'
    };

    ElMessage.info(messages[autoSaveMode.value]);
  };

  // 自动保存角色卡数据（用于接收 characterData）
  const autoSaveCard = async (characterData: CharacterCardV3) => {
    // 如果是手动模式，完全禁用自动保存
    if (autoSaveMode.value === 'manual') {
      return;
    }

    const currentCardId = activeCardId.value;
    if (!currentCardId) {
      return;
    }

    // 检查是否有未保存的修改
    const currentData = JSON.stringify(characterData);
    if (currentData === lastSavedData.value) {
      return;
    }

    // 防止重复保存
    if (isAutoSaving.value) {
      return;
    }

    isAutoSaving.value = true;
    saveStatus.value = 'saving';

    try {
      await handleUpdateCard(currentCardId, characterData, true);

      // 更新最后保存的数据状态
      lastSavedData.value = currentData;
      hasUnsavedChanges.value = false;

      saveStatus.value = 'saved';

      // 2秒后隐藏"已保存"提示
      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle';
        }
      }, 2000);
    } catch (error) {
      console.error('[useCharacterCardCollection] 自动保存失败:', error);
      saveStatus.value = 'error';
      // 5秒后隐藏错误提示
      setTimeout(() => {
        if (saveStatus.value === 'error') {
          saveStatus.value = 'idle';
        }
      }, 5000);
    } finally {
      isAutoSaving.value = false;
    }
  };

  // 启动定时自动保存（自动模式专用）
  onMounted(() => {
    autoSaveTimer = initAutoSave(
      () => {
        // 这里的自动保存将在 CardManager 中触发
        // 因为这里无法直接访问 characterData
      },
      () => !!activeCardId.value
    );
  });

  // 清理定时器
  onBeforeUnmount(() => {
    if (autoSaveTimer) {
      clearAutoSave(autoSaveTimer);
    }
  });

  return {
    characterCardCollection,
    activeCardId,
    activeCard,
    allTags,
    isLoading,
    handleSelectCard,
    handleSaveCurrentCard,
    handleUpdateCard,
    handleRenameCard,
    handleDeleteCard,
    handleImportCard,
    handleImportFromFile,
    handleExportCard,
    handleExportAllCards,
    handleClearAllCards,
    handleCreateNewCard,
    loadInitialData,
    // 自动保存相关
    saveStatus,
    autoSaveMode,
    toggleAutoSaveMode,
    autoSaveCard,
  };
}