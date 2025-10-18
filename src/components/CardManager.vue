<template>
  <div class="card-manager-container">
    <!-- 移动端布局 -->
    <div class="card-manager-mobile-layout">
      <el-tabs v-model="activeTab" type="border-card" class="card-manager-tabs-mobile">
        <el-tab-pane name="library" class="card-manager-tab-pane">
          <template #label>
            <span class="card-manager-tab-label">
              <Icon icon="ph:cards-duotone" class="card-manager-tab-icon" />
              <span class="card-manager-tab-text">角色库</span>
            </span>
          </template>
          <CharacterCardList :collection="characterCardCollection" :active-card-id="activeCardId"
            :has-current-card="hasUnsavedChanges" @select-card="handleSelectCardWithLoad"
            @save-current="handleSaveCurrentAsNew" @rename-card="handleRenameCard" @delete-card="handleDeleteCard"
            @export-card="handleExportCard" @export-all="handleExportAllCards" @import-file="handleImportFromFile"
            @clear-all="handleClearAllCards" />
        </el-tab-pane>

        <el-tab-pane name="editor" class="card-manager-tab-pane">
          <template #label>
            <span class="card-manager-tab-label">
              <Icon icon="ph:note-pencil-duotone" class="card-manager-tab-icon" />
              <span class="card-manager-tab-text">编辑器</span>
            </span>
          </template>
          <div class="content-panel-header">
            <h2 class="content-panel-title">
              <Icon icon="ph:note-pencil-duotone" class="content-panel-icon" />
              <span class="content-panel-text">角色卡编辑</span>
            </h2>
            <div class="header-actions">
              <el-button type="primary" @click="triggerFileInput" size="small" :loading="isUploading"
                :disabled="isUploading">
                <Icon icon="ph:upload-duotone" v-if="!isUploading" />
                {{ isUploading ? uploadProgress : '加载PNG' }}
              </el-button>
              <el-button type="success" @click="handleSave" size="small">
                <Icon icon="ph:export-duotone" />
                导出PNG
              </el-button>
            </div>
          </div>
          <el-scrollbar class="card-editor-content">
            <WelcomeScreen v-if="!activeCard" :is-uploading="isUploading" :upload-progress="uploadProgress"
              @import-card="triggerFileInput" />
            <CardEditor v-else :character="characterData" :image-preview-url="imagePreviewUrl"
              :all-tags="allTags" v-model:advanced-options-visible="advancedOptionsVisible"
              @image-change="handleImageUpdate" @worldbook-changed="handleWorldBookChanged" />
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 桌面端布局 -->
    <div class="card-manager-desktop-layout">
      <Splitpanes class="default-theme" push-other-panes style="height: 100%">
        <Pane size="15" min-size="10" max-size="35">
          <CharacterCardList :collection="characterCardCollection" :active-card-id="activeCardId"
            :has-current-card="hasUnsavedChanges" @select-card="handleSelectCardWithLoad"
            @save-current="handleSaveCurrentAsNew" @rename-card="handleRenameCard" @delete-card="handleDeleteCard"
            @export-card="handleExportCard" @export-all="handleExportAllCards" @import-file="handleImportFromFile"
            @clear-all="handleClearAllCards" />
        </Pane>
        <Pane size="85" min-size="65">
          <div class="card-manager-desktop-panel-right">
            <div class="content-panel-header">
              <h2 class="content-panel-title">
                <Icon icon="ph:note-pencil-duotone" class="content-panel-icon" />
                角色卡编辑器
                <span v-if="activeCard" class="content-panel-text-highlight">
                  - {{ activeCard.name || '未命名角色' }}
                </span>
              </h2>
              <div class="header-actions">
                <CharacterCardActions context="editor" :has-active-card="!!activeCard"
                  :save-status="saveStatus" :auto-save-mode="autoSaveMode" @toggle-mode="toggleAutoSaveMode"
                  @save-card="handleSaveCurrentAsNew" @save-as-new="handleSaveAsNewCard"
                  @update-card="handleUpdateActiveCard" @export-current="handleExportCurrentCard" />
                <el-divider direction="vertical" />
                <el-button type="primary" @click="triggerFileInput" size="small" :loading="isUploading"
                  :disabled="isUploading">
                  <Icon icon="ph:upload-duotone" v-if="!isUploading" />
                  {{ isUploading ? uploadProgress : '加载PNG' }}
                </el-button>
                <el-button type="success" @click="handleExportWithRegexSelection" size="small">
                  <Icon icon="ph:export-duotone" />
                  导出PNG
                </el-button>
              </div>
            </div>
            <el-scrollbar class="card-editor-content">
              <WelcomeScreen v-if="!activeCard" :is-uploading="isUploading" :upload-progress="uploadProgress"
                @import-card="triggerFileInput" />
              <CardEditor v-else :character="characterData" :image-preview-url="imagePreviewUrl"
                :all-tags="allTags" v-model:advanced-options-visible="advancedOptionsVisible"
                @image-change="handleImageUpdate" @worldbook-changed="handleWorldBookChanged" />
            </el-scrollbar>
          </div>
        </Pane>
      </Splitpanes>
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
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { watchDebounced } from '@vueuse/core';

import CharacterCardList from '@/components/cardManager/CharacterCardList.vue';
import CharacterCardActions from '@/components/cardManager/CharacterCardActions.vue';
import CardEditor from '@/components/cardManager/CardEditor.vue';
import WelcomeScreen from '@/components/cardManager/WelcomeScreen.vue';
import RegexScriptSelectorDialog from '@/components/cardManager/RegexScriptSelectorDialog.vue';

import { useV3CharacterCard } from '@/composables/characterCard/useV3CharacterCard';
import type { SillyTavernRegexScript } from '@/composables/regex/types';
import { useCharacterCardCollection } from '@/composables/characterCard/useCharacterCardCollection';
import { useCardImport } from '@/composables/characterCard/useCardImport';
import { useCardExport } from '@/composables/characterCard/useCardExport';

const { characterData, loadCharacter } = useV3CharacterCard();

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
  handleRenameCard,
  handleDeleteCard,
  handleImportCard,
  handleImportFromFile,
  handleExportCard,
  handleExportAllCards,
  handleClearAllCards,
  // 自动保存相关
  saveStatus,
  autoSaveMode,
  toggleAutoSaveMode,
  autoSaveCard,
} = useCharacterCardCollection();

// UI 状态
const activeTab = ref('editor');
const advancedOptionsVisible = ref(false);
const hasUnsavedChanges = computed(() => {
  return characterData.value.name !== '' || characterData.value.description !== '';
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

// 自动加载上次编辑的角色卡
const hasAutoLoaded = ref(false);
watch([isLoading, activeCard], ([loading, card]) => {
  if (!loading && card && !hasAutoLoaded.value) {
    hasAutoLoaded.value = true;
    loadCharacter(card);
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
    ElMessage.success(`已切换到角色卡: ${selectedCard.name || '未命名角色'}`);
  }
};

// 世界书更改后自动保存
const handleWorldBookChanged = async () => {
  if (activeCard.value && activeCardId.value) {
    try {
      const plainCharacterData = JSON.parse(JSON.stringify(characterData.value));
      await handleUpdateCard(activeCardId.value, plainCharacterData);
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

/* 移动端布局 */
.card-manager-mobile-layout {
  display: none;
}

@media (max-width: 1023px) {
  .card-manager-mobile-layout {
    display: block;
    flex: 1;
  }

  .card-manager-desktop-layout {
    display: none !important;
  }
}

.card-manager-tabs-mobile {
  height: 100%;
}

.card-manager-tab-pane {
  height: 100%;
  overflow: hidden;
}

.card-manager-tab-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-manager-tab-icon {
  font-size: 16px;
}

.card-manager-tab-text {
  font-size: 14px;
}

/* 桌面端布局 */
.card-manager-desktop-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
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