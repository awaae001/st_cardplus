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
              <input ref="fileInput" type="file" accept="image/png" style="display: none"
                @change="handleFileSelected" />
            </div>
          </div>

          <!-- 编辑器内容 -->
          <el-scrollbar class="card-editor-content">
            <div class="card-editor-form">
              <!-- 角色图片 -->
              <section class="form-section">
                <h3 class="form-section-title">
                  <Icon icon="ph:image-duotone" class="form-section-icon" />角色图片
                </h3>
                <div class="form-section-content">
                  <p class="image-persistence-notice">注意：图片仅用于本次导出，不会随角色卡保存。</p>
                  <ImagePanel :preview-url="imagePreviewUrl" @image-change="handleImageUpdate" />
                </div>
              </section>

              <!-- 基础信息 -->
              <section class="form-section">
                <h3 class="form-section-title">
                  <Icon icon="ph:info-duotone" class="form-section-icon" />基础信息
                </h3>
                <div class="form-section-content">
                  <BasicInfoPanel :character="characterData" />
                </div>
              </section>

              <!-- 开场白 -->
              <section class="form-section">
                <h3 class="form-section-title">
                  <Icon icon="ph:chat-teardrop-dots-duotone" class="form-section-icon" />多开场白
                </h3>
                <div class="form-section-content">
                  <GreetingsPanel v-model="characterData.data.alternate_greetings" />
                </div>
              </section>

              <!-- 高级选项 -->
              <div class="form-section-title advanced-options-toggle"
                @click="advancedOptionsVisible = !advancedOptionsVisible">
                <Icon :icon="advancedOptionsVisible ? 'ph:caret-down-duotone' : 'ph:caret-right-duotone'"
                  class="form-section-icon" />
                <span>高级选项</span>
                <span class="advanced-options-hint">{{ advancedOptionsVisible ? '点击折叠' : '点击展开' }}</span>
              </div>

              <el-collapse-transition>
                <div v-show="advancedOptionsVisible">
                  <!-- 世界书 -->
                  <section class="form-section">
                    <h3 class="form-section-title">
                      <Icon icon="ph:book-open-duotone" class="form-section-icon" />世界书
                    </h3>
                    <InfoDisplayPanel type="worldbook" :character="characterData" />
                  </section>

                  <!-- 其他与正则 -->
                  <section class="form-section">
                    <h3 class="form-section-title">
                      <Icon icon="ph:puzzle-piece-duotone" class="form-section-icon" />其他与正则
                    </h3>
                    <InfoDisplayPanel type="regex" :character="characterData" />
                  </section>
                </div>
              </el-collapse-transition>
            </div>
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
                  @save-card="handleSaveCurrentAsNew" @save-as-new="handleSaveAsNewCard"
                  @update-card="handleUpdateActiveCard" @export-current="handleExportCurrentCard" />
                <el-divider direction="vertical" />
                <el-button type="primary" @click="triggerFileInput" size="small" :loading="isUploading"
                  :disabled="isUploading">
                  <Icon icon="ph:upload-duotone" v-if="!isUploading" />
                  {{ isUploading ? uploadProgress : '加载PNG' }}
                </el-button>
                <el-button type="success" @click="handleSave" size="small">
                  <Icon icon="ph:export-duotone" />
                  导出PNG
                </el-button>
                <input ref="fileInput" type="file" accept="image/png" style="display: none"
                  @change="handleFileSelected" />
              </div>
            </div>

            <!-- 编辑器内容 -->
            <el-scrollbar class="card-editor-content">
              <div class="card-editor-form">
                <!-- 基础信息与图片 -->
                <section class="form-section">
                  <h3 class="form-section-title">
                    <Icon icon="ph:user-circle-gear-duotone" class="form-section-icon" />核心设定
                  </h3>
                  <div class="form-section-content two-column">
                    <div class="image-panel-container">
                      <h4 class="sub-section-title">角色图片</h4>
                      <p class="image-persistence-notice">注意：图片仅用于本次导出，不会随角色卡保存。</p>
                      <ImagePanel :preview-url="imagePreviewUrl" @image-change="handleImageUpdate" />
                    </div>
                    <div class="basic-info-container">
                      <h4 class="sub-section-title">基础信息</h4>
                      <BasicInfoPanel :character="characterData" />
                    </div>
                  </div>
                </section>

                <!-- 开场白 -->
                <section class="form-section">
                  <h3 class="form-section-title">
                    <Icon icon="ph:chat-teardrop-dots-duotone" class="form-section-icon" />多开场白
                  </h3>
                  <div class="form-section-content">
                    <GreetingsPanel v-model="characterData.data.alternate_greetings" />
                  </div>
                </section>

                <!-- 高级选项 -->
                <div class="form-section-title advanced-options-toggle"
                  @click="advancedOptionsVisible = !advancedOptionsVisible">
                  <Icon :icon="advancedOptionsVisible ? 'ph:caret-down-duotone' : 'ph:caret-right-duotone'"
                    class="form-section-icon" />
                  <span>高级与扩展</span>
                  <span class="advanced-options-hint">{{ advancedOptionsVisible ? '点击折叠' : '点击展开' }}</span>
                </div>

                <el-collapse-transition>
                  <div v-show="advancedOptionsVisible">
                    <!-- 世界书 -->
                    <section class="form-section">
                      <h3 class="form-section-title">
                        <Icon icon="ph:book-open-duotone" class="form-section-icon" />世界书
                      </h3>
                      <InfoDisplayPanel type="worldbook" :character="characterData" />
                    </section>

                    <!-- 其他与正则 -->
                    <section class="form-section">
                      <h3 class="form-section-title">
                        <Icon icon="ph:puzzle-piece-duotone" class="form-section-icon" />其他与正则
                      </h3>
                      <InfoDisplayPanel type="regex" :character="characterData" />
                    </section>
                  </div>
                </el-collapse-transition>
              </div>
            </el-scrollbar>
          </div>
        </Pane>
      </Splitpanes>
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { ElButton, ElMessage, ElTabs, ElTabPane, ElDivider, ElDialog, ElScrollbar, ElCollapseTransition } from 'element-plus';
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
import { write as writePngCard } from '@/utils/pngCardMetadata';
import { extractAndDecodeCcv3, extractAndDecodeV2Card } from '@/utils/metadataSeparator';

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
  handleImportCard,
  handleImportFromFile,
  handleExportCard,
  handleExportAllCards,
  handleClearAllCards,
} = useCharacterCardCollection();

// UI 状态
const activeTab = ref('editor');
const isUploading = ref(false);
const uploadProgress = ref('');
const advancedOptionsVisible = ref(false);
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
  if (!target.files || !target.files[0]) {
    console.warn('CardManager: No file selected');
    return;
  }

  const file = target.files[0];

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择有效的图片文件');
    target.value = '';
    return;
  }

  // 只支持PNG文件的智能导入
  if (!file.type.includes('png')) {
    ElMessage.error('智能导入功能仅支持PNG文件');
    target.value = '';
    return;
  }

  isUploading.value = true;
  uploadProgress.value = '正在分析图片...';

  try {
    let characterCardData = null;
    let hasMetadata = false;

    // 尝试提取角色卡元数据
    uploadProgress.value = '正在检测角色卡数据...';

    // 首先尝试 ccv3 格式
    try {
      characterCardData = await extractAndDecodeCcv3(file);
      if (characterCardData) {
        hasMetadata = true;
        console.log('检测到 ccv3 格式角色卡数据');
      }
    } catch (error) {
      console.log('未检测到 ccv3 格式数据');
    }

    // 如果没有 ccv3，尝试 v2 格式
    if (!characterCardData) {
      try {
        characterCardData = await extractAndDecodeV2Card(file);
        if (characterCardData) {
          hasMetadata = true;
          console.log('检测到 TavernAI v2 格式角色卡数据');
        }
      } catch (error) {
        console.log('未检测到 v2 格式数据');
      }
    }

    if (hasMetadata && characterCardData) {
      // 有元数据：提取角色卡数据并保存
      uploadProgress.value = '正在保存角色卡...';

      // 保存角色卡到数据库
      const cardId = await handleImportCard(characterCardData);

      if (cardId) {
        // 加载到编辑器
        loadCharacter(characterCardData);
        handleImageUpdate(file);
        activeTab.value = 'editor';

        ElMessage.success(`角色卡"${characterCardData.name || characterCardData.data?.name || '未命名'}"已成功导入！`);
      }
    } else {
      // 无元数据：创建空角色卡模板
      uploadProgress.value = '正在创建角色卡...';

      // 创建一个基础的角色卡模板
      const templateCardData = {
        spec: 'chara_card_v3' as const,
        spec_version: '3.0' as const,
        name: file.name.replace(/\.[^/.]+$/, ''), // 使用文件名作为默认名称
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
          name: file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          personality: '',
          scenario: '',
          first_mes: '',
          alternate_greetings: [],
          mes_example: '',
          creator_notes: '',
          system_prompt: '',
          tags: [],
          creator: '',
          character_version: '',
          post_history_instructions: '',
          extensions: {},
        },
      };

      const cardId = await handleImportCard(templateCardData);

      if (cardId) {
        // 加载到编辑器
        loadCharacter(templateCardData);
        handleImageUpdate(file);
        activeTab.value = 'editor';

        ElMessage.success(`已创建角色卡模板，请填写角色信息！`);
      }
    }

  } catch (error) {
    console.error('CardManager: Error in smart import:', error);
    ElMessage.error(`导入失败：${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    isUploading.value = false;
    uploadProgress.value = '';
    target.value = '';
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
  // 切换卡片时重置图片，因为图片状态不持久化
  characterImageFile.value = null;

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
/* 编辑器内容 - 新增样式 */
.card-editor-content {
  flex: 1;
  overflow: hidden;
}

.card-editor-form {
  padding: 16px;
}

.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-fill-color-extra-light);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-extra-light);
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.form-section-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

.form-section-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section-content.two-column {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  align-items: start;
}

.image-panel-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.basic-info-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sub-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin: 0 0 12px 0;
}

.advanced-options-toggle {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.advanced-options-toggle:hover {
  background-color: var(--el-fill-color-light);
}

.advanced-options-hint {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-placeholder);
}

.image-persistence-notice {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
  margin-bottom: 8px;
  padding: 0;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .form-section-content.two-column {
    grid-template-columns: 1fr;
  }
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