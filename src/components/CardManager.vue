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

          <div class="content-panel-header">
            <h2 class="content-panel-title">
              <Icon icon="ph:cards-duotone" class="content-panel-icon" />
              <span class="content-panel-text">角色卡库</span>
            </h2>
          </div>
          <CharacterCardList
            :collection="characterCardCollection"
            :active-card-id="activeCardId"
            :has-current-card="hasUnsavedChanges"
            @select-card="handleSelectCardWithLoad"
            @save-current="handleSaveCurrentAsNew"
            @rename-card="handleRenameCard"
            @delete-card="handleDeleteCard"
            @export-card="handleExportCard"
            @export-all="handleExportAllCards"
            @import-file="handleImportFromFile"
            @clear-all="handleClearAllCards"
          />
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
              <el-button type="primary" @click="triggerFileInput" size="small">
                <Icon icon="ph:upload-duotone" />
                加载PNG
              </el-button>
              <el-button type="success" @click="handleSave" size="small">
                <Icon icon="ph:export-duotone" />
                导出PNG
              </el-button>
              <input ref="fileInput" type="file" accept="image/png" style="display: none" @change="handleFileSelected" />
            </div>
          </div>

          <!-- 编辑器内容 -->
          <div class="card-editor-content">
            <div class="editor-panels-container">
              <!-- 角色图片上传 -->
              <div class="panel image-panel">
                <h3>角色图片</h3>
                <ImagePanel :preview-url="imagePreviewUrl" @image-change="handleImageUpdate" />
              </div>

              <!-- 基础信息面板 -->
              <div class="panel main-panel">
                <h3>基础信息</h3>
                <BasicInfoPanel :character="characterData" />
              </div>

              <!-- 多开场白面板 -->
              <div class="panel greetings-panel">
                <h3>多开场白</h3>
                <GreetingsPanel v-model="characterData.data.alternate_greetings" />
              </div>

              <!-- 世界书管理 -->
              <div class="panel worldbook-panel">
                <h3>世界书</h3>
                <InfoDisplayPanel type="worldbook" :character="characterData" />
              </div>

              <!-- 其他与正则内容 -->
              <div class="panel footer-panel">
                <h3>其他与正则</h3>
                <InfoDisplayPanel type="regex" :character="characterData" />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 桌面端布局 -->
    <div class="card-manager-desktop-layout">
      <Splitpanes class="default-theme" push-other-panes style="height: 100%">
        <Pane size="15" min-size="10" max-size="35">
          <CharacterCardList
            :collection="characterCardCollection"
            :active-card-id="activeCardId"
            :has-current-card="hasUnsavedChanges"
            @select-card="handleSelectCardWithLoad"
            @save-current="handleSaveCurrentAsNew"
            @rename-card="handleRenameCard"
            @delete-card="handleDeleteCard"
            @export-card="handleExportCard"
            @export-all="handleExportAllCards"
            @import-file="handleImportFromFile"
            @clear-all="handleClearAllCards"
          />
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
                <CharacterCardActions
                  context="editor"
                  :has-active-card="!!activeCard"
                  @save-card="handleSaveCurrentAsNew"
                  @save-as-new="handleSaveAsNewCard"
                  @update-card="handleUpdateActiveCard"
                  @export-current="handleExportCurrentCard"
                />
                <el-divider direction="vertical" />
                <el-button type="primary" @click="triggerFileInput" size="small">
                  <Icon icon="ph:upload-duotone" />
                  加载PNG
                </el-button>
                <el-button type="success" @click="handleSave" size="small">
                  <Icon icon="ph:export-duotone" />
                  导出PNG
                </el-button>
                <input ref="fileInput" type="file" accept="image/png" style="display: none" @change="handleFileSelected" />
              </div>
            </div>

            <!-- 编辑器内容 -->
            <div class="card-editor-content">
              <div class="card-manager-layout">
                <!-- 左侧列 -->
                <div class="left-column">
                  <!-- 角色图片上传 -->
                  <div class="panel image-panel">
                    <h3>角色图片</h3>
                    <ImagePanel :preview-url="imagePreviewUrl" @image-change="handleImageUpdate" />
                  </div>
                  <!-- 世界书管理 -->
                  <div class="panel worldbook-panel">
                    <h3>世界书</h3>
                    <InfoDisplayPanel type="worldbook" :character="characterData" />
                  </div>
                </div>

                <!-- 右侧列 -->
                <div class="right-column">
                  <div class="top-panels-container">
                    <!-- 基础信息面板 -->
                    <div class="panel main-panel">
                      <h3>基础信息</h3>
                      <BasicInfoPanel :character="characterData" />
                    </div>
                    <!-- 多开场白面板 -->
                    <div class="panel greetings-panel">
                      <h3>多开场白</h3>
                      <GreetingsPanel v-model="characterData.data.alternate_greetings" />
                    </div>
                  </div>
                  <!-- 其他与正则内容 -->
                  <div class="panel footer-panel">
                    <h3>其他与正则</h3>
                    <InfoDisplayPanel type="regex" :character="characterData" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Pane>
      </Splitpanes>
    </div>

    <!-- 重构提示弹窗 -->
    <el-dialog
      v-model="showRefactorDialog"
      title="🚧 角色卡管理器重构通知"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      center
    >
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { ElButton, ElMessage, ElTabs, ElTabPane, ElDivider, ElDialog } from 'element-plus';
import { Icon } from '@iconify/vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

import BasicInfoPanel from '@/components/cardManager/BasicInfoPanel.vue';
import ImagePanel from '@/components/cardManager/ImagePanel.vue';
import GreetingsPanel from '@/components/cardManager/GreetingsPanel.vue';
import InfoDisplayPanel from '@/components/cardManager/InfoDisplayPanel.vue';
import CharacterCardList from '@/components/cardManager/CharacterCardList.vue';
import CharacterCardActions from '@/components/cardManager/CharacterCardActions.vue';

import { useV3CharacterCard } from '@/composables/characterCard/useV3CharacterCard';
import { useCharacterCardCollection } from '@/composables/characterCard/useCharacterCardCollection';
import { read as readPngCard, write as writePngCard } from '@/utils/pngCardMetadata';

const { characterData, loadCharacter } = useV3CharacterCard();

// 角色卡集合管理
const {
  characterCardCollection,
  activeCardId,
  activeCard,
  handleSelectCard,
  handleSaveCurrentCard,
  handleUpdateCard,
  handleRenameCard,
  handleDeleteCard,
  handleImportFromFile,
  handleExportCard,
  handleExportAllCards,
  handleClearAllCards,
} = useCharacterCardCollection();

// UI 状态
const activeTab = ref('editor');
const hasUnsavedChanges = computed(() => {
  // 检查当前编辑的角色卡是否有未保存的更改
  return characterData.value.name !== '' || characterData.value.description !== '';
});

// 重构提示弹窗
const showRefactorDialog = ref(false);
const REFACTOR_NOTICE_KEY = 'cardmanager_refactor_notice_dismissed';
const TODAY_DATE = new Date().toDateString();

onMounted(() => {
  // 检查是否今天已经显示过提示
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

// --- 文件加载 ---
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择有效的图片文件');
      target.value = '';
      return;
    }

    try {
      const imageBuffer = new Uint8Array(await file.arrayBuffer());

      const jsonDataString = readPngCard(imageBuffer);

      const decodedData = JSON.parse(jsonDataString);
      loadCharacter(decodedData);

      handleImageUpdate(file);

      ElMessage.success('角色卡加载成功！');
    } catch (error) {
      console.error('CardManager: Error loading character card:', error);
      ElMessage.error(`加载失败：${error instanceof Error ? error.message : '无法找到或解析角色卡数据'}`);
    }
    target.value = '';
  } else {
    console.warn('CardManager: No file selected');
  }
};

// --- 保存功能 ---
const handleSave = async () => {

  if (!characterImageFile.value) {
    console.warn('CardManager: No image file available for saving');
    ElMessage.warning('请先加载或选择一张图片作为角色卡背景');
    return;
  }


  try {
    const imageBuffer = new Uint8Array(await characterImageFile.value.arrayBuffer());

    const jsonDataString = JSON.stringify(characterData.value, null, 2);

    const newImageBuffer = writePngCard(imageBuffer, jsonDataString);

    // 创建具有正确 ArrayBuffer 类型的新 Uint8Array
    const properBuffer = new Uint8Array(newImageBuffer);
    const blob = new Blob([properBuffer], { type: 'image/png' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const fileName = characterData.value.name ? `${characterData.value.name}.png` : 'character.png';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    ElMessage.success('角色卡已成功保存！');
  } catch (error) {
    console.error('CardManager: Failed to save character card:', error);
    ElMessage.error(`保存失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// --- 图片处理 ---
const characterImageFile = ref<File | null>(null);

const imagePreviewUrl = computed(() => {
  if (characterImageFile.value) {
    return URL.createObjectURL(characterImageFile.value);
  }
  return undefined;
});

const handleImageUpdate = (file: File) => {
  characterImageFile.value = file;
};

// --- 新增的角色卡管理事件处理函数 ---
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


// 当选择一个角色卡时，加载其数据到编辑器
const handleSelectCardWithLoad = (cardId: string) => {
  handleSelectCard(cardId);
  const selectedCard = characterCardCollection.value.cards[cardId];
  if (selectedCard) {
    // selectedCard 已经是展开后的角色卡数据，直接加载即可
    loadCharacter(selectedCard);
    activeTab.value = 'editor';

    console.log('加载角色卡数据到编辑器:', selectedCard.name);
    ElMessage.success(`已切换到角色卡: ${selectedCard.name || '未命名角色'}`);
  }
};

onUnmounted(() => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }
});
</script>

<style scoped>
/* 容器样式 */
.card-manager-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--el-bg-color-page);
}

/* 移动端布局 */
.card-manager-mobile-layout {
  display: none;
}

@media (max-width: 768px) {
  .card-manager-mobile-layout {
    display: flex;
    flex: 1;
  }

  .card-manager-desktop-layout {
    display: none;
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

.content-panel-text {
  font-size: 16px;
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
  overflow: auto;
  padding: 16px;
}

.editor-panels-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .editor-panels-container {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1200px) {
  .editor-panels-container {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

/* 保留原有的页面布局样式 */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
  overflow: auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.page-header h2 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.card-manager-layout {
  display: grid;
  grid-template-columns: 20% 1fr;
  gap: 16px;
  flex-grow: 1;
  overflow: hidden;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden; /* 防止子元素溢出 */
}

.top-panels-container {
  flex: 1; /* 占据可用空间 */
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  overflow: hidden; /* 防止子元素溢出 */
}

.footer-panel {
  flex-shrink: 0; /* 防止被挤压 */
  max-height: 30%; /* 或者一个你认为合适的最大高度 */
}

.panel {
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--el-box-shadow-light);
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.main-panel,
.greetings-panel {
  overflow: auto;
}

.image-panel {
  flex: 0 0 60%;
}

.worldbook-panel {
  flex: 1;
}


h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
  font-weight: 600;
  flex-shrink: 0;
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

.notice-content {
  flex: 1;
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

/* 覆盖 el-dialog 的一些样式 */
:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 12px;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>