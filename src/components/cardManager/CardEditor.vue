<template>
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
          <ImagePanel :preview-url="imagePreviewUrl" @image-change="emit('imageChange', $event)" />
        </div>
        <div class="basic-info-container">
          <h4 class="sub-section-title">基础信息</h4>
          <BasicInfoPanel :character="character" :all-tags="props.allTags" />
        </div>
      </div>
    </section>

    <!-- 开场白 -->
    <section class="form-section">
      <h3 class="form-section-title">
        <Icon icon="ph:chat-teardrop-dots-duotone" class="form-section-icon" />多开场白
      </h3>
      <div class="form-section-content">
        <GreetingsPanel v-model="character.data.alternate_greetings" />
      </div>
    </section>

    <!-- 世界书 -->
    <section class="form-section">
      <h3 class="form-section-title">
        <Icon icon="ph:book-open-duotone" class="form-section-icon" />世界书
      </h3>
      <InfoDisplayPanel type="worldbook" :character="character" @worldbook-changed="emit('worldbookChanged')" />
    </section>

    <!-- 其他与正则 -->
    <section class="form-section">
      <h3 class="form-section-title">
        <Icon icon="ph:puzzle-piece-duotone" class="form-section-icon" />其他与正则
      </h3>
      <InfoDisplayPanel type="regex" :character="character" />
    </section>

    <!-- 高级选项 -->
    <div class="form-section-title advanced-options-toggle" @click="toggleAdvancedOptions">
      <Icon :icon="advancedOptionsVisible ? 'ph:caret-down-duotone' : 'ph:caret-right-duotone'" class="form-section-icon" />
      <span>高级设定</span>
      <span class="advanced-options-hint">{{ advancedOptionsVisible ? '点击折叠' : '点击展开' }}</span>
    </div>

    <el-collapse-transition>
      <div v-show="advancedOptionsVisible">
        <section class="form-section">
          <div class="form-section-content">
            <AdvancedInfoPanel :character="character" />
          </div>
        </section>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ElCollapseTransition } from 'element-plus';
import { Icon } from '@iconify/vue';
import BasicInfoPanel from '@/components/cardManager/main/BasicInfoPanel.vue';
import ImagePanel from '@/components/cardManager/main/ImagePanel.vue';
import GreetingsPanel from '@/components/cardManager/main/GreetingsPanel.vue';
import InfoDisplayPanel from '@/components/cardManager/main/InfoDisplayPanel.vue';
import AdvancedInfoPanel from '@/components/cardManager/main/AdvancedInfoPanel.vue';
import type { CharacterCardV3 } from '@/types/character-card-v3';

const props = defineProps<{
  character: CharacterCardV3;
  imagePreviewUrl?: string;
  advancedOptionsVisible: boolean;
  allTags?: string[];
}>();

const emit = defineEmits<{
  (e: 'imageChange', file: File): void;
  (e: 'worldbookChanged'): void;
  (e: 'update:advancedOptionsVisible', value: boolean): void;
}>();

const toggleAdvancedOptions = () => {
  emit('update:advancedOptionsVisible', !props.advancedOptionsVisible);
};
</script>

<style scoped>
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
  height: 100%;
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
</style>