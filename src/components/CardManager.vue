<template>
  <div class="card-manager-container">
    <!-- 统一的标签页布局 -->
    <div class="card-manager-layout">
      <!-- 顶部标签栏 -->
      <CharacterCardTabs :tabs="tabs" :active-tab-id="activeTabId" @switch-tab="handleTabSwitch"
        @close-tab="handleTabClose" @reorder-tabs="handleTabReorder" />

      <!-- 内容区域 -->
      <div class="tab-content-area">
        <!-- 主页 -->
        <div v-if="currentTab?.type === 'home'" class="tab-content-panel">
          <CharacterCardHome :collection="characterCardCollection" @open-card="handleOpenCardFromHome"
            @create-new="handleCreateNewCard" @rename-card="handleRenameCard" @delete-card="handleDeleteCard"
            @export-card="handleExportCard" @export-all="handleExportAllCards" @import-file="handleImportFromFile"
            @clear-all="handleClearAllCards" />
        </div>

        <!-- 角色卡编辑器 -->
        <div v-else-if="currentTab?.type === 'character-card'" class="tab-content-panel">
          <div class="card-manager-panel-editor">
            <div class="content-panel-header">
              <h2 class="content-panel-title">
                <Icon :icon="headerIcon" class="content-panel-icon" />
                {{ headerTitle }}
                <span v-if="rightEditorTab === 'card' && currentCardInTab" class="content-panel-text-highlight">
                  - {{ currentCardInTab.name || '未命名角色' }}
                </span>
                <span v-else-if="rightEditorTab === 'worldbook' && worldbookPanelRef?.hasWorldBook"
                  class="content-panel-text-highlight">
                  - {{ worldbookPanelRef?.currentWorldBookName }}
                </span>
              </h2>
              <div class="header-actions" v-if="rightEditorTab === 'card'">
                <CharacterCardActions context="editor" :has-active-card="!!currentCardInTab" :save-status="saveStatus"
                  :auto-save-mode="autoSaveMode" @toggle-mode="toggleAutoSaveMode" @save-card="handleSaveCurrentAsNew"
                  @save-as-new="handleSaveAsNewCard" @update-card="handleUpdateActiveCard"
                  @export-current="handleExportCurrentCard" />
                <el-divider direction="vertical" />
                <el-button type="primary" @click="triggerFileInput" size="small" :loading="isUploading"
                  :disabled="isUploading">
                  <Icon icon="ph:upload-duotone" v-if="!isUploading" />
                  <span class="button-text">{{ isUploading ? uploadProgress : '加载PNG' }}</span>
                </el-button>
                <el-button type="success" @click="handleSave" size="small">
                  <Icon icon="ph:export-duotone" />
                  <span class="button-text">导出PNG</span>
                </el-button>
              </div>
              <!-- 世界书操作按钮 -->
              <div class="header-actions" v-else-if="rightEditorTab === 'worldbook'">
                <el-tooltip content="将当前世界书添加到世界书数据库，不影响角色卡" placement="bottom">
                  <el-button size="small" @click="handleAddWorldBookToDB" :disabled="!worldbookPanelRef?.hasWorldBook">
                    <Icon icon="ph:database-duotone" />
                    <span class="button-text">添加到 DB</span>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="用世界书数据库中的世界书替换当前世界书" placement="bottom">
                  <el-button size="small" @click="handleReplaceWorldBookFromDB"
                    :disabled="!worldbookPanelRef?.hasWorldBook">
                    <Icon icon="ph:arrows-counter-clockwise-duotone" />
                    <span class="button-text">从 DB 替换</span>
                  </el-button>
                </el-tooltip>
              </div>
              <!-- 正则面板操作按钮 -->
              <div class="header-actions" v-else-if="rightEditorTab === 'regex'">
                <el-tooltip content="创建一个新的空白正则脚本" placement="bottom">
                  <el-button size="small" @click="handleRegexCreateNew" :disabled="!currentCardInTab">
                    <Icon icon="ph:file-plus-duotone" />
                    <span class="button-text">创建新脚本</span>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="从正则脚本库中选择并添加脚本" placement="bottom">
                  <el-button size="small" @click="handleRegexAddFromLibrary" :disabled="!currentCardInTab">
                    <Icon icon="ph:books-duotone" />
                    <span class="button-text">从正则库添加</span>
                  </el-button>
                </el-tooltip>
                <el-divider direction="vertical" />
                <el-tooltip content="将角色卡的正则脚本发送到正则编辑器（副本），之后完全独立" placement="bottom">
                  <el-button size="small" @click="handleRegexSendToEditor" :disabled="!hasRegexScripts">
                    <Icon icon="ph:upload-duotone" />
                    <span class="button-text">发送到编辑器</span>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="用正则编辑器中的脚本替换角色卡的所有正则脚本" placement="bottom">
                  <el-button size="small" @click="handleRegexReplaceFromEditor" :disabled="!currentCardInTab">
                    <Icon icon="ph:arrow-counter-clockwise-duotone" />
                    <span class="button-text">从编辑器替换</span>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            <el-tabs v-model="rightEditorTab" tab-position="right" class="bookmark-tabs" stretch>
              <el-tab-pane name="card">
                <template #label>
                  <span class="bookmark-tab-label">
                    <Icon icon="ph:note-pencil-duotone" class="bookmark-tab-icon" />
                    <span class="bookmark-tab-text">角色卡</span>
                  </span>
                </template>
                <div class="tab-full-content">
                  <CardEditor v-if="currentCardInTab" :character="characterData" :image-preview-url="imagePreviewUrl"
                    :all-tags="allTags" v-model:advanced-options-visible="advancedOptionsVisible"
                    @image-change="handleImageUpdate" />
                </div>
              </el-tab-pane>

              <el-tab-pane name="worldbook" style="height: 100%;">
                <template #label>
                  <span class="bookmark-tab-label">
                    <Icon icon="ph:books-duotone" class="bookmark-tab-icon" />
                    <span class="bookmark-tab-text">世界书</span>
                  </span>
                </template>
                <div class="tab-full-content">
                  <CardWorldBookPanel ref="worldbookPanelRef" :character="characterData"
                    @worldbookChanged="handleWorldBookChanged" />
                </div>
              </el-tab-pane>

              <el-tab-pane name="regex">
                <template #label>
                  <span class="bookmark-tab-label">
                    <Icon icon="ph:brackets-curly-duotone" class="bookmark-tab-icon" />
                    <span class="bookmark-tab-text">正则</span>
                  </span>
                </template>
                <div class="tab-full-content">
                  <CardRegexPanel ref="regexPanelRef" :character="characterData" @regexChanged="handleRegexChanged" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>

    <input ref="fileInput" type="file" accept="image/png" style="display: none" @change="handleFileSelected" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import { ElButton, ElMessage, ElTabs, ElTabPane, ElDivider } from 'element-plus';
import { Icon } from '@iconify/vue';

import CharacterCardActions from '@/components/cardManager/components/CharacterCardActions.vue';
import CharacterCardTabs from '@/components/cardManager/components/CharacterCardTabs.vue';
import CharacterCardHome from '@/components/cardManager/components/CharacterCardHome.vue';
import CardEditor from '@/components/cardManager/CardEditor.vue';
import CardWorldBookPanel from '@/components/cardManager/panel/CardWorldBookPanel.vue';
import CardRegexPanel from '@/components/cardManager/panel/CardRegexPanel.vue';

import { useV3CharacterCard } from '@/composables/characterCard/useV3CharacterCard';
import { useCharacterCardCollection } from '@/composables/characterCard/useCharacterCardCollection';
import { useCardImport } from '@/composables/characterCard/useCardImport';
import { useCardExport } from '@/composables/characterCard/useCardExport';
import { useTabManager } from '@/composables/characterCard/useTabManager';
import { useCharacterCardAutoSave, type AutoSaveMode } from '@/composables/characterCard/useCharacterCardAutoSave';
import { getSetting } from '@/utils/localStorageUtils';

const { characterData, isLoadingData, loadCharacter, resetCharacter } = useV3CharacterCard();

// 标签页管理
const {
  tabs,
  activeTabId,
  openCharacterCardTab,
  closeTab,
  switchToTab,
  updateTabLabel,
  closeCharacterCardTab,
  reorderTabs,
  getActiveTab,
} = useTabManager();

// 角色卡集合管理
const {
  characterCardCollection,
  activeCardId,
  activeCard,
  allTags,
  isLoading,
  handleSelectCard,
  handleSaveCurrentCard,
  handleUpdateCard,
  handleRenameCard: handleRenameCardOriginal,
  handleDeleteCard: handleDeleteCardOriginal,
  handleImportFromFile,
  handleExportCard,
  handleExportAllCards,
  handleClearAllCards,
  handleCreateNewCard: handleCreateNewCardFromCollection,
} = useCharacterCardCollection();

// 自动保存模式
const autoSaveMode = ref<AutoSaveMode>('watch');

// 自动保存逻辑
const {
  saveStatus,
  manualSave,
  resetSaveState,
  updateSavedSnapshot,
  cleanup: cleanupAutoSave,
} = useCharacterCardAutoSave({
  characterData,
  activeCardId,
  isLoadingData,
  autoSaveMode,
  onSave: async (cardId, data) => {
    // 自动保存时跳过本地更新，避免触发响应式循环
    await handleUpdateCard(cardId, data, true, true); // silent = true, skipLocalUpdate = true
  },
});

// 切换自动保存模式
const toggleAutoSaveMode = () => {
  const modes: AutoSaveMode[] = ['auto', 'watch', 'manual'];
  const currentIndex = modes.indexOf(autoSaveMode.value);
  const nextIndex = (currentIndex + 1) % modes.length;
  autoSaveMode.value = modes[nextIndex];

  const intervalSeconds = Math.max(1, Math.round(getSetting('autoSaveInterval')));
  const debounceSeconds = Math.max(0.1, Math.round(getSetting('autoSaveDebounce') * 10) / 10);
  const messages = {
    auto: `已切换到自动保存模式：每 ${intervalSeconds} 秒自动保存`,
    watch: `已切换到监听模式：检测到修改后 ${debounceSeconds} 秒自动保存`,
    manual: '已切换到手动模式：自动保存已禁用'
  };

  ElMessage.info(messages[autoSaveMode.value]);
};

// UI 状态
const activeTab = ref('editor');
const rightEditorTab = ref<'card' | 'worldbook' | 'regex'>('card');
const headerTitle = computed(() => {
  if (rightEditorTab.value === 'worldbook') return '世界书';
  if (rightEditorTab.value === 'regex') return '正则编辑器';
  return '角色卡编辑器';
});
const headerIcon = computed(() => {
  if (rightEditorTab.value === 'worldbook') return 'ph:books-duotone';
  if (rightEditorTab.value === 'regex') return 'ph:brackets-curly-duotone';
  return 'ph:note-pencil-duotone';
});
const advancedOptionsVisible = ref(false);

// 标签页相关计算属性
const currentTab = computed(() => getActiveTab());
const currentCardInTab = computed(() => {
  const tab = currentTab.value;
  if (tab?.type === 'character-card' && tab.cardId) {
    return characterCardCollection.value.cards[tab.cardId];
  }
  return null;
});

// 图片处理
const characterImageFile = ref<File | null>(null);
const handleImageUpdate = (file: File) => {
  characterImageFile.value = file;
};
const imagePreviewUrl = computed(() => {
  if (characterImageFile.value) {
    return URL.createObjectURL(characterImageFile.value);
  }
  return undefined;
});

// 文件导入与导出
const { isUploading, uploadProgress,triggerFileInput, handleFileSelected } = useCardImport(
  (card) => {
    loadCharacter(card);
    activeTab.value = 'editor';
    rightEditorTab.value = 'card';
  },
  handleImageUpdate
);
const { handleSave } = useCardExport(characterData, characterImageFile);


// 角色卡内正则变更后触发手动保存
const handleRegexChanged = async () => {
  if (activeCard.value && activeCardId.value) {
    try {
      await manualSave();
    } catch (error) {
      console.error('保存正则更改失败:', error);
      ElMessage.warning('正则脚本已更新，但保存到数据库失败。请手动保存角色卡。');
    }
  } else {
    ElMessage.info('正则脚本已更新。请保存角色卡以将更改持久化。');
  }
};



// 监听 activeCardId 的变化,自动加载或重置编辑器
// 注意：只监听 activeCardId，不监听 activeCard，避免因 activeCard 对象变化导致循环
watch([isLoading, activeCardId], ([loading, cardId], [, prevCardId]) => {
  // 等待数据加载完成
  if (loading) return;

  // activeCardId 发生变化
  if (cardId !== prevCardId) {
    if (cardId) {
      // 有新的活动卡片 ID,从 collection 中获取并加载
      const card = characterCardCollection.value.cards[cardId];
      if (card) {
        loadCharacter(card);
        characterImageFile.value = null;
        // 加载完成后，更新自动保存的快照
        setTimeout(() => {
          updateSavedSnapshot();
        }, 100);
      }
    } else {
      // 没有活动卡片(删除后或清空后),重置编辑器
      resetCharacter();
      characterImageFile.value = null;
      resetSaveState();
    }
  }
}, { immediate: true });

// --- 角色卡管理事件处理 ---
const handleSaveCurrentAsNew = async () => {
  await handleSaveCurrentCard(characterData.value);
};

const handleSaveAsNewCard = async () => {
  await handleSaveCurrentCard(characterData.value);
};

const handleUpdateActiveCard = async () => {
  if (activeCard.value) {
    await handleUpdateCard(activeCard.value.id, characterData.value);
  }
};

const handleExportCurrentCard = async () => {
  if (activeCard.value) {
    await handleExportCard(activeCard.value.id);
  }
};

const handleCreateNewCard = async () => {
  const cardId = await handleCreateNewCardFromCollection();
  if (cardId) {
    const newCard = characterCardCollection.value.cards[cardId];
    if (newCard) {
      characterImageFile.value = null;
      loadCharacter(newCard);
      activeTab.value = 'editor';
      rightEditorTab.value = 'card';
      // 在新的标签页系统中打开
      openCharacterCardTab(cardId, newCard.name || '未命名角色');
    }
  }
};

const handleOpenCardFromHome = (cardId: string, cardName: string) => {
  openCharacterCardTab(cardId, cardName);
  const card = characterCardCollection.value.cards[cardId];
  if (card) {
    characterImageFile.value = null;
    loadCharacter(card);
    handleSelectCard(cardId);
  }
};

const handleTabSwitch = (tabId: string) => {
  switchToTab(tabId);

  // 如果切换到角色卡标签页，加载对应的角色卡
  const tab = tabs.value.find((t) => t.id === tabId);
  if (tab?.type === 'character-card' && tab.cardId) {
    const card = characterCardCollection.value.cards[tab.cardId];
    if (card) {
      characterImageFile.value = null;
      loadCharacter(card);
      handleSelectCard(tab.cardId);
    }
  } else if (tab?.type === 'home') {
    handleSelectCard(null);
    resetCharacter();
    characterImageFile.value = null;
  }
};

// 关闭标签页
const handleTabClose = (tabId: string) => {
  closeTab(tabId);
};

// 重新排序标签页
const handleTabReorder = (newTabs: any[]) => {
  reorderTabs(newTabs);
};

// 重命名角色卡（同时更新标签页标题）
const handleRenameCard = async (cardId: string) => {
  await handleRenameCardOriginal(cardId);
  // 更新标签页标题
  const card = characterCardCollection.value.cards[cardId];
  if (card) {
    updateTabLabel(cardId, card.name || '未命名角色');
  }
};

const handleDeleteCard = async (cardId: string) => {
  await handleDeleteCardOriginal(cardId);
  closeCharacterCardTab(cardId);
};
const handleWorldBookChanged = async () => {
  if (activeCard.value && activeCardId.value) {
    try {
      await manualSave();
    } catch (error) {
      console.error('保存世界书更改失败:', error);
      ElMessage.warning('世界书已更新，但保存到数据库失败。请手动保存角色卡。');
    }
  } else {
    ElMessage.info('世界书已更新。请保存角色卡以将更改持久化。');
  }
};

// 世界书面板引用
const worldbookPanelRef = ref<InstanceType<typeof CardWorldBookPanel>>();

// 添加世界书到数据库
const handleAddWorldBookToDB = () => {
  worldbookPanelRef.value?.handleAddToDB();
};

// 从数据库替换世界书
const handleReplaceWorldBookFromDB = () => {
  worldbookPanelRef.value?.handleReplaceFromDB();
};

// 正则面板引用
const regexPanelRef = ref<InstanceType<typeof CardRegexPanel>>();

// 计算属性：是否有正则脚本
const hasRegexScripts = computed(() => {
  const scripts = characterData.value.data.extensions?.regex_scripts;
  return scripts && scripts.length > 0;
});

// 创建新正则脚本
const handleRegexCreateNew = () => {
  regexPanelRef.value?.handleCreateNew();
};

// 从正则库添加脚本
const handleRegexAddFromLibrary = () => {
  regexPanelRef.value?.handleAddFromLibrary();
};

// 发送到正则编辑器（副本）
const handleRegexSendToEditor = () => {
  regexPanelRef.value?.handleSendToRegexEditor();
};

// 从正则编辑器替换
const handleRegexReplaceFromEditor = () => {
  regexPanelRef.value?.handleReplaceFromRegexEditor();
};

// 清理资源
onUnmounted(() => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }
  cleanupAutoSave();
});
</script>

<style scoped>
/* 容器样式 */
.card-manager-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-page);
}

/* 统一的布局 */
.card-manager-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.tab-content-area {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.tab-content-panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-manager-panel-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color);
}

/* 内容面板头部 */
.content-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color-overlay);
  flex-shrink: 0;
  margin-bottom: 0px;
}

.content-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content-panel-icon {
  font-size: 18px;
}

.content-panel-text-highlight {
  color: var(--el-color-primary);
  font-weight: 500;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 编辑器内容 */
/* 右侧书签式标签页样式 */
.bookmark-tabs {
  flex: 1;
  min-height: 0;
  overflow: auto;
  height: 100%;
}

.bookmark-tabs :deep(.el-tabs__content) {
  height: 100%;
  overflow: auto;
}

.bookmark-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.bookmark-tabs :deep(.el-tabs__nav-wrap) {
  padding: 8px 0;
}

.bookmark-tab-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  writing-mode: horizontal-tb;
}

.bookmark-tab-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.bookmark-tab-text {
  font-size: 14px;
  font-weight: 500;
}

.tab-full-content {
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* 移动端响应式调整 */
@media (max-width: 768px) {
  .content-panel-header {
    height: auto;
    padding: 10px 12px;
  }

  .content-panel-title {
    font-size: 15px;
    gap: 6px;
  }

  .content-panel-icon {
    font-size: 16px;
  }

  .content-panel-text-highlight {
    display: none;
    /* 移动端隐藏角色名/世界书名 */
  }

  .header-actions {
    gap: 6px;
  }

  .button-text {
    display: none;
    /* 移动端隐藏按钮文字，只显示图标 */
  }

  /* 移动端书签样式调整 */
  .bookmark-tabs :deep(.el-tabs__nav-wrap) {
    padding: 4px 0;
  }

  .bookmark-tab-label {
    gap: 6px;
    padding: 2px 0;
  }

  .bookmark-tab-icon {
    font-size: 16px;
  }

  .bookmark-tab-text {
    font-size: 13px;
  }
}

</style>
