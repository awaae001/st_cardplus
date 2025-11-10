<template>
  <div class="card-manager-container">
    <!-- 移动端布局（新的标签页模式） -->
    <div class="card-manager-mobile-layout">
      <!-- 顶部标签栏 -->
      <CharacterCardTabs
        :tabs="tabs"
        :active-tab-id="activeTabId"
        @switch-tab="handleTabSwitch"
        @close-tab="handleTabClose"
        @reorder-tabs="handleTabReorder"
      />

      <!-- 内容区域 -->
      <div class="tab-content-area-mobile">
        <!-- 主页 -->
        <div v-if="currentTab?.type === 'home'" class="tab-content-panel-mobile">
          <CharacterCardHome
            :collection="characterCardCollection"
            @open-card="handleOpenCardFromHome"
            @create-new="handleCreateNewCard"
            @rename-card="handleRenameCard"
            @delete-card="handleDeleteCard"
            @export-card="handleExportCard"
            @export-all="handleExportAllCards"
            @import-file="handleImportFromFile"
            @clear-all="handleClearAllCards"
          />
        </div>

        <!-- 角色卡编辑器 -->
        <div v-else-if="currentTab?.type === 'character-card'" class="tab-content-panel-mobile">
          <div class="card-manager-mobile-panel-editor">
            <div class="content-panel-header-mobile">
              <h2 class="content-panel-title-mobile">
                <Icon :icon="headerIcon" class="content-panel-icon" />
                {{ headerTitle }}
              </h2>
              <div class="header-actions-mobile" v-if="rightEditorTab === 'card'">
                <el-button type="primary" @click="triggerFileInput" size="small" :loading="isUploading" :disabled="isUploading">
                  <Icon icon="ph:upload-duotone" v-if="!isUploading" />
                </el-button>
                <el-button type="success" @click="handleSave" size="small">
                  <Icon icon="ph:export-duotone" />
                </el-button>
              </div>
            </div>
            <el-tabs
              v-model="rightEditorTab"
              tab-position="top"
              class="bookmark-tabs-mobile"
            >
              <el-tab-pane name="card">
                <template #label>
                  <span class="bookmark-tab-label-mobile">
                    <Icon icon="ph:note-pencil-duotone" class="bookmark-tab-icon" />
                    <span class="bookmark-tab-text">角色卡</span>
                  </span>
                </template>
                <el-scrollbar class="card-editor-content-mobile">
                  <CardEditor
                    v-if="currentCardInTab"
                    :character="characterData"
                    :image-preview-url="imagePreviewUrl"
                    :all-tags="allTags"
                    v-model:advanced-options-visible="advancedOptionsVisible"
                    @image-change="handleImageUpdate"
                    @worldbook-changed="handleWorldBookChanged"
                  />
                </el-scrollbar>
              </el-tab-pane>

              <el-tab-pane name="worldbook">
                <template #label>
                  <span class="bookmark-tab-label-mobile">
                    <Icon icon="ph:books-duotone" class="bookmark-tab-icon" />
                    <span class="bookmark-tab-text">世界书</span>
                  </span>
                </template>
                <div class="tab-full-content-mobile">
                  <CardWorldBookPanel :character="characterData" @worldbookChanged="handleWorldBookChanged" />
                </div>
              </el-tab-pane>

              <el-tab-pane name="regex">
                <template #label>
                  <span class="bookmark-tab-label-mobile">
                    <Icon icon="ph:brackets-curly-duotone" class="bookmark-tab-icon" />
                    <span class="bookmark-tab-text">正则</span>
                  </span>
                </template>
                <div class="tab-full-content-mobile">
                  <CardRegexPanel :character="characterData" @regexChanged="handleRegexChanged" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端布局（新的标签页模式） -->
    <div class="card-manager-desktop-layout">
      <!-- 顶部标签栏 -->
      <CharacterCardTabs
        :tabs="tabs"
        :active-tab-id="activeTabId"
        @switch-tab="handleTabSwitch"
        @close-tab="handleTabClose"
        @reorder-tabs="handleTabReorder"
      />

      <!-- 内容区域 -->
      <div class="tab-content-area">
        <!-- 主页 -->
        <div v-if="currentTab?.type === 'home'" class="tab-content-panel">
          <CharacterCardHome
            :collection="characterCardCollection"
            @open-card="handleOpenCardFromHome"
            @create-new="handleCreateNewCard"
            @rename-card="handleRenameCard"
            @delete-card="handleDeleteCard"
            @export-card="handleExportCard"
            @export-all="handleExportAllCards"
            @import-file="handleImportFromFile"
            @clear-all="handleClearAllCards"
          />
        </div>

        <!-- 角色卡编辑器 -->
        <div v-else-if="currentTab?.type === 'character-card'" class="tab-content-panel">
          <div class="card-manager-desktop-panel-right">
            <div class="content-panel-header">
              <h2 class="content-panel-title">
                <Icon :icon="headerIcon" class="content-panel-icon" />
                {{ headerTitle }}
                <span v-if="rightEditorTab === 'card' && currentCardInTab" class="content-panel-text-highlight">
                  - {{ currentCardInTab.name || '未命名角色' }}
                </span>
              </h2>
              <div class="header-actions" v-if="rightEditorTab === 'card'">
                <CharacterCardActions
                  context="editor"
                  :has-active-card="!!currentCardInTab"
                  :save-status="saveStatus"
                  :auto-save-mode="autoSaveMode"
                  @toggle-mode="toggleAutoSaveMode"
                  @save-card="handleSaveCurrentAsNew"
                  @save-as-new="handleSaveAsNewCard"
                  @update-card="handleUpdateActiveCard"
                  @export-current="handleExportCurrentCard"
                />
                <el-divider direction="vertical" />
                <el-button type="primary" @click="triggerFileInput" size="small" :loading="isUploading" :disabled="isUploading">
                  <Icon icon="ph:upload-duotone" v-if="!isUploading" />
                  {{ isUploading ? uploadProgress : '加载PNG' }}
                </el-button>
                <el-button type="success" @click="handleExportWithRegexSelection" size="small">
                  <Icon icon="ph:export-duotone" />
                  导出PNG
                </el-button>
              </div>
            </div>
            <el-tabs
              v-model="rightEditorTab"
              tab-position="right"
              class="bookmark-tabs"
              stretch
            >
              <el-tab-pane name="card">
                <template #label>
                  <span class="bookmark-tab-label">
                    <Icon icon="ph:note-pencil-duotone" class="bookmark-tab-icon" />
                    <span class="bookmark-tab-text">角色卡</span>
                  </span>
                </template>
                <el-scrollbar class="card-editor-content">
                  <CardEditor
                    v-if="currentCardInTab"
                    :character="characterData"
                    :image-preview-url="imagePreviewUrl"
                    :all-tags="allTags"
                    v-model:advanced-options-visible="advancedOptionsVisible"
                    @image-change="handleImageUpdate"
                    @worldbook-changed="handleWorldBookChanged"
                  />
                </el-scrollbar>
              </el-tab-pane>

              <el-tab-pane name="worldbook" style="height: 100%; width: 100%;">
                <template #label>
                  <span class="bookmark-tab-label">
                    <Icon icon="ph:books-duotone" class="bookmark-tab-icon" />
                    <span class="bookmark-tab-text">世界书</span>
                  </span>
                </template>
                <div class="tab-full-content">
                  <CardWorldBookPanel :character="characterData" @worldbookChanged="handleWorldBookChanged" />
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
                  <CardRegexPanel :character="characterData" @regexChanged="handleRegexChanged" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>

    <input ref="fileInput" type="file" accept="image/png" style="display: none" @change="handleFileSelected" />

    <!-- 重构提示弹窗 -->
    <el-dialog v-model="showRefactorDialog" title="🚧 角色卡管理器重构通知" width="500px" :close-on-click-modal="false"
      :close-on-press-escape="false" :show-close="false" center>
      <div class="refactor-notice">
        <div class="notice-icon">
          <Icon icon="ph:wrench-duotone" />
        </div>
        <div class="notice-content">
          <h3>功能重构中</h3>
          <p>角色卡管理器刚刚进行了重大重构，新增了侧边栏角色库、持久化存储等功能。</p>
          <p><strong>⚠️ 重要提醒：</strong></p>
          <ul>
            <li>新功能可能存在各种 bug</li>
            <li>请保持耐心，坐和放宽</li>
            <li>遇到问题可以反馈或等待修复</li>
            <li>建议先在测试数据上尝试功能</li>
          </ul>
          <p class="notice-thanks">感谢您的理解与支持！</p>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dismissRefactorDialog(false)">知道了</el-button>
          <el-button type="primary" @click="dismissRefactorDialog(true)">今天内不再提醒</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 正则脚本选择对话框 -->
    <RegexScriptSelectorDialog
      v-model="showRegexSelectorDialog"
      :default-selected-ids="defaultSelectedRegexIds"
      @confirm="handleRegexScriptsSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted, watch } from 'vue';
import { ElButton, ElMessage, ElTabs, ElTabPane, ElDivider, ElDialog, ElScrollbar } from 'element-plus';
import { Icon } from '@iconify/vue';
import { watchDebounced } from '@vueuse/core';

import CharacterCardList from '@/components/cardManager/CharacterCardList.vue';
import CharacterCardActions from '@/components/cardManager/CharacterCardActions.vue';
import CharacterCardTabs from '@/components/cardManager/CharacterCardTabs.vue';
import CharacterCardHome from '@/components/cardManager/CharacterCardHome.vue';
import CardEditor from '@/components/cardManager/CardEditor.vue';
import WelcomeScreen from '@/components/cardManager/WelcomeScreen.vue';
import RegexScriptSelectorDialog from '@/components/cardManager/RegexScriptSelectorDialog.vue';
import CardWorldBookPanel from '@/components/cardManager/CardWorldBookPanel.vue';
import CardRegexPanel from '@/components/cardManager/CardRegexPanel.vue';

import { useV3CharacterCard } from '@/composables/characterCard/useV3CharacterCard';
import type { SillyTavernRegexScript } from '@/composables/regex/types';
import { useCharacterCardCollection } from '@/composables/characterCard/useCharacterCardCollection';
import { useCardImport } from '@/composables/characterCard/useCardImport';
import { useCardExport } from '@/composables/characterCard/useCardExport';
import { useTabManager } from '@/composables/characterCard/useTabManager';

const { characterData, loadCharacter, resetCharacter } = useV3CharacterCard();

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
  handleImportCard,
  handleImportFromFile,
  handleExportCard,
  handleExportAllCards,
  handleClearAllCards,
  handleCreateNewCard: handleCreateNewCardFromCollection,
  // 自动保存相关
  saveStatus,
  autoSaveMode,
  toggleAutoSaveMode,
  autoSaveCard,
} = useCharacterCardCollection();

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
const hasUnsavedChanges = computed(() => {
  return characterData.value.name !== '' || characterData.value.description !== '';
});

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
const { isUploading, uploadProgress, fileInput, triggerFileInput, handleFileSelected } = useCardImport(
  (card) => {
    loadCharacter(card);
    activeTab.value = 'editor';
    rightEditorTab.value = 'card';
  },
  handleImportCard,
  handleImageUpdate
);
const { handleSave } = useCardExport(characterData, characterImageFile);

// 正则脚本选择对话框
const showRegexSelectorDialog = ref(false);
const defaultSelectedRegexIds = computed(() => {
  const scripts = characterData.value.data.extensions?.regex_scripts || [];
  return scripts.map((s: SillyTavernRegexScript) => s.id);
});

// 处理带正则选择的导出
const handleExportWithRegexSelection = () => {
  showRegexSelectorDialog.value = true;
};

// 处理正则脚本选择完成
const handleRegexScriptsSelected = (selectedScripts: SillyTavernRegexScript[]) => {
  // 更新角色卡的正则脚本
  if (!characterData.value.data.extensions) {
    characterData.value.data.extensions = {};
  }
  characterData.value.data.extensions.regex_scripts = selectedScripts;
  
  // 执行导出
  handleSave();
};

// 角色卡内正则变更后自动保存
const handleRegexChanged = async () => {
  if (activeCard.value && activeCardId.value) {
    try {
      autoSaveCard(characterData.value);
    } catch (error) {
      console.error('自动保存正则更改失败:', error);
      ElMessage.warning('正则脚本已更新，但保存到数据库失败。请手动保存角色卡。');
    }
  } else {
    ElMessage.info('正则脚本已更新。请保存角色卡以将更改持久化。');
  }
};


// 重构提示弹窗
const showRefactorDialog = ref(false);
const REFACTOR_NOTICE_KEY = 'cardmanager_refactor_notice_dismissed';
const TODAY_DATE = new Date().toDateString();

onMounted(() => {
  const dismissedData = localStorage.getItem(REFACTOR_NOTICE_KEY);
  if (!dismissedData) {
    showRefactorDialog.value = true;
  } else {
    try {
      const { date } = JSON.parse(dismissedData);
      if (date !== TODAY_DATE) {
        showRefactorDialog.value = true;
      }
    } catch {
      showRefactorDialog.value = true;
    }
  }
});

const dismissRefactorDialog = (dontShowToday = false) => {
  showRefactorDialog.value = false;
  if (dontShowToday) {
    localStorage.setItem(REFACTOR_NOTICE_KEY, JSON.stringify({
      date: TODAY_DATE,
      dismissed: true
    }));
  }
};

// 监听 activeCard 的变化,自动加载或重置编辑器
watch([isLoading, activeCard], ([loading, card], [, prevCard]) => {
  // 等待数据加载完成
  if (loading) return;

  // activeCard 发生变化
  if (card !== prevCard) {
    if (card) {
      // 有新的活动卡片,加载它
      loadCharacter(card);
      characterImageFile.value = null;
    } else {
      // 没有活动卡片(删除后或清空后),重置编辑器
      resetCharacter();
      characterImageFile.value = null;
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

const handleSelectCardWithLoad = (cardId: string) => {
  characterImageFile.value = null; // 切换卡片时重置图片
  handleSelectCard(cardId);
  const selectedCard = characterCardCollection.value.cards[cardId];
  if (selectedCard) {
    loadCharacter(selectedCard);
    activeTab.value = 'editor';
    rightEditorTab.value = 'card';
    ElMessage.success(`已切换到角色卡: ${selectedCard.name || '未命名角色'}`);
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

// ===== 新增标签页事件处理函数 =====

// 从主页打开角色卡
const handleOpenCardFromHome = (cardId: string, cardName: string) => {
  openCharacterCardTab(cardId, cardName);
  // 加载角色卡数据到编辑器
  const card = characterCardCollection.value.cards[cardId];
  if (card) {
    characterImageFile.value = null;
    loadCharacter(card);
    handleSelectCard(cardId);
  }
};

// 标签页切换
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
    // 切换到主页时，重置编辑器
    resetCharacter();
    characterImageFile.value = null;
    handleSelectCard('');
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

// 删除角色卡（同时关闭标签页）
const handleDeleteCard = async (cardId: string) => {
  await handleDeleteCardOriginal(cardId);
  // 关闭对应的标签页
  closeCharacterCardTab(cardId);
};

// 世界书更改后自动保存
const handleWorldBookChanged = async () => {
  if (activeCard.value && activeCardId.value) {
    try {
      autoSaveCard(characterData.value);
    } catch (error) {
      console.error('自动保存世界书更改失败:', error);
      ElMessage.warning('世界书已更新，但保存到数据库失败。请手动保存角色卡。');
    }
  } else {
    ElMessage.info('世界书已更新。请保存角色卡以将更改持久化。');
  }
};

// 使用防抖监听 characterData 的变化（监听模式专用）
// 用户停止编辑 1.5 秒后自动保存
watchDebounced(
  characterData,
  () => {
    if (autoSaveMode.value === 'watch' && activeCard.value && activeCardId.value) {
      autoSaveCard(characterData.value);
    }
  },
  { debounce: 1500, deep: true }
);

// 定时自动保存（自动模式专用）
// 每 5 秒自动保存一次
let autoSaveInterval: number | null = null;
onMounted(() => {
  autoSaveInterval = window.setInterval(() => {
    if (autoSaveMode.value === 'auto' && activeCard.value && activeCardId.value) {
      autoSaveCard(characterData.value);
    }
  }, 5000);
});

onUnmounted(() => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
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

/* 移动端布局（新的标签页模式） */
.card-manager-mobile-layout {
  display: none;
}

@media (max-width: 1023px) {
  .card-manager-mobile-layout {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .card-manager-desktop-layout {
    display: none !important;
  }
}

.tab-content-area-mobile {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.tab-content-panel-mobile {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease-in-out;
}

.card-manager-mobile-panel-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color);
}

.content-panel-header-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color-overlay);
  flex-shrink: 0;
}

.content-panel-title-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-actions-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.bookmark-tabs-mobile {
  flex: 1;
  overflow: hidden;
}

.bookmark-tabs-mobile :deep(.el-tabs__content) {
  height: calc(100% - 40px);
  overflow: hidden;
}

.bookmark-tab-label-mobile {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.card-editor-content-mobile {
  height: 100%;
  overflow-y: auto;
}

.tab-full-content-mobile {
  height: 100%;
  overflow: hidden;
}

/* 桌面端布局（新的标签页模式） */
.card-manager-desktop-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.tab-content-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.tab-content-panel {
  flex: 1;
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

.card-manager-desktop-panel-right {
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
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color-overlay);
  flex-shrink: 0;
}

.content-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.content-panel-icon {
  font-size: 18px;
}

.content-panel-text-highlight {
  color: var(--el-color-primary);
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 编辑器内容 */
.card-editor-content {
  flex: 1;
  overflow: hidden;
}

/* 右侧书签式标签页样式 */
.bookmark-tabs {
  height: 100%;
}
.bookmark-tabs :deep(.el-tabs__content) {
  height: 100%;
}
.bookmark-tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.bookmark-tab-icon {
  font-size: 16px;
}
.bookmark-tab-text {
  font-size: 13px;
}
.tab-full-content {
  height: 100%;
  /* display: flex; */
}

/* 重构提示弹窗样式 */
.refactor-notice {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.notice-icon {
  font-size: 48px;
  color: var(--el-color-warning);
  flex-shrink: 0;
}

.notice-content h3 {
  margin: 0 0 12px 0;
  color: var(--el-color-warning);
  font-size: 18px;
  font-weight: 600;
}

.notice-content p {
  margin: 8px 0;
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

.notice-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.notice-content li {
  margin: 4px 0;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

.notice-thanks {
  margin-top: 16px;
  font-weight: 500;
  color: var(--el-color-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
