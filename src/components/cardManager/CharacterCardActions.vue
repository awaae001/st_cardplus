<template>
  <div class="character-card-actions" v-if="context === 'list'">
    <el-tooltip content="从文件导入角色卡" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
      <el-upload action="#" :before-upload="handleFileUpload" :show-file-list="false" accept=".json">
        <button class="btn-primary-adv character-card-action-button-text">
          <Icon icon="ph:upload-duotone" width="16" height="16" class="character-card-action-button-icon" />
          <span class="character-card-action-text-short">导入</span>
          <span class="character-card-action-text-long">从文件导入</span>
        </button>
      </el-upload>
    </el-tooltip>

    <el-tooltip content="导出所有角色卡" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
      <button @click="$emit('export-all')" class="btn-success-adv character-card-action-button-text">
        <Icon icon="ph:export-duotone" width="16" height="16" class="character-card-action-button-icon" />
        <span class="character-card-action-text-short">导出</span>
        <span class="character-card-action-text-long">导出全部</span>
      </button>
    </el-tooltip>

    <span class="character-card-action-divider"></span>

    <el-tooltip content="清空所有角色卡" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
      <button @click="$emit('clear-all')" class="btn-danger-adv character-card-action-button-text">
        <Icon icon="ph:trash-simple-duotone" width="16" height="16" class="character-card-action-button-icon" />
        <span class="character-card-action-text-short">清空</span>
        <span class="character-card-action-text-long">清空所有</span>
      </button>
    </el-tooltip>
  </div>

  <!-- Editor Actions -->
  <div v-if="context === 'editor'" class="character-card-editor-actions">
    <el-tooltip content="保存角色卡" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
      <button @click="$emit('save-card')" class="btn-primary-adv character-card-editor-button" aria-label="保存角色卡">
        <Icon icon="ph:floppy-disk-duotone" class="character-card-editor-button-icon" />
      </button>
    </el-tooltip>

    <el-tooltip content="另存为新角色卡" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
      <button @click="$emit('save-as-new')" class="btn-secondary-adv character-card-editor-button" aria-label="另存为新角色卡">
        <Icon icon="ph:copy-simple-duotone" class="character-card-editor-button-icon" />
      </button>
    </el-tooltip>

    <el-tooltip v-if="hasActiveCard" content="更新当前角色卡" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
      <button @click="$emit('update-card')" class="btn-warning-adv character-card-editor-button" aria-label="更新当前角色卡">
        <Icon icon="ph:arrow-clockwise-duotone" class="character-card-editor-button-icon" />
      </button>
    </el-tooltip>

    <el-tooltip content="导出当前角色卡" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
      <button @click="$emit('export-current')" class="btn-success-adv character-card-editor-button" aria-label="导出当前角色卡">
        <Icon icon="ph:export-duotone" class="character-card-editor-button-icon" />
      </button>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ElTooltip, ElUpload } from 'element-plus';
import { Icon } from '@iconify/vue';

interface Props {
  context: 'list' | 'editor';
  hasActiveCard?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'import-file', file: File): void;
  (e: 'export-all'): void;
  (e: 'clear-all'): void;
  (e: 'save-card'): void;
  (e: 'save-as-new'): void;
  (e: 'update-card'): void;
  (e: 'export-current'): void;
}>();

const handleFileUpload = (file: File): boolean => {
  emit('import-file', file);
  return false; // 阻止 el-upload 的默认行为
};
</script>

<style scoped>
.character-card-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.character-card-action-button-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 28px;
}

.character-card-action-button-icon {
  flex-shrink: 0;
}

.character-card-action-text-short {
  display: none;
}

.character-card-action-text-long {
  display: inline;
}

.character-card-action-divider {
  width: 1px;
  height: 20px;
  background-color: var(--el-border-color);
  margin: 0 4px;
}

.character-card-editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.character-card-editor-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.character-card-editor-button-icon {
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .character-card-action-text-short {
    display: inline;
  }

  .character-card-action-text-long {
    display: none;
  }

  .character-card-action-button-text {
    padding: 4px 6px;
    font-size: 11px;
  }
}

/* 按钮样式变体 */
.btn-primary-adv {
  background-color: var(--el-color-primary);
  color: white;
  border: 1px solid var(--el-color-primary);
}

.btn-primary-adv:hover {
  background-color: var(--el-color-primary-light-3);
  border-color: var(--el-color-primary-light-3);
}

.btn-secondary-adv {
  background-color: var(--el-color-info);
  color: white;
  border: 1px solid var(--el-color-info);
}

.btn-secondary-adv:hover {
  background-color: var(--el-color-info-light-3);
  border-color: var(--el-color-info-light-3);
}

.btn-success-adv {
  background-color: var(--el-color-success);
  color: white;
  border: 1px solid var(--el-color-success);
}

.btn-success-adv:hover {
  background-color: var(--el-color-success-light-3);
  border-color: var(--el-color-success-light-3);
}

.btn-warning-adv {
  background-color: var(--el-color-warning);
  color: white;
  border: 1px solid var(--el-color-warning);
}

.btn-warning-adv:hover {
  background-color: var(--el-color-warning-light-3);
  border-color: var(--el-color-warning-light-3);
}

.btn-danger-adv {
  background-color: var(--el-color-danger);
  color: white;
  border: 1px solid var(--el-color-danger);
}

.btn-danger-adv:hover {
  background-color: var(--el-color-danger-light-3);
  border-color: var(--el-color-danger-light-3);
}

/* Upload 组件内部按钮样式重置 */
:deep(.el-upload) {
  display: inline-block;
}

:deep(.el-upload .el-upload__input) {
  display: none;
}
</style>