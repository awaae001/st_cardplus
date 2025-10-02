<template>
  <div class="worldbook-bottom-panel-buttons" v-if="context === 'list'">
      <el-tooltip content="复制整个世界书 (到剪贴板)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('copy-book')" class="btn-secondary-adv worldbook-bottom-button" aria-label="复制整个世界书">
          <Icon icon="ph:books-duotone" class="worldbook-bottom-button-icon" />
        </button>
      </el-tooltip>
      <el-tooltip content="从剪贴板导入条目 (将替换当前世界书)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
               <button @click="$emit('import-book')" class="btn-warning-adv worldbook-bottom-button" aria-label="从剪贴板导入条目">
                 <Icon icon="ph:clipboard-text-duotone" class="worldbook-bottom-button-icon" />
               </button>
             </el-tooltip>
             <span class="worldbook-button-divider"></span>
             <el-tooltip content="导出当前世界书为JSON文件" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
               <button @click="$emit('export-json')" class="btn-success-adv worldbook-bottom-button-text">
                 <Icon icon="ph:export-duotone" width="16" height="16" class="worldbook-button-text-icon" />
                 <span class="worldbook-button-text-short">导出</span>
                 <span class="worldbook-button-text-long">导出本书</span>
               </button>
             </el-tooltip>
             <el-tooltip content="从文件导入条目 (将替换当前世界书)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
               <el-upload action="#" :before-upload="handleEntriesUpload" :show-file-list="false" accept=".json">
                 <button class="btn-warning-adv worldbook-bottom-button-text">
                   <Icon icon="ph:file-text-duotone" width="16" height="16" class="worldbook-button-text-icon" />
                   <span class="worldbook-button-text-short">导入</span>
                   <span class="worldbook-button-text-long">导入条目</span>
                 </button>
               </el-upload>
             </el-tooltip>
             <el-tooltip content="从文件导入为新世界书" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
              <el-upload action="#" :before-upload="handleBookUpload" :show-file-list="false" accept=".json">
                <button class="btn-primary-adv worldbook-bottom-button-text">
                  <Icon icon="ph:book-open-duotone" width="16" height="16" class="worldbook-button-text-icon" />
                  <span class="worldbook-button-text-short">导入</span>
                  <span class="worldbook-button-text-long">导入世界书</span>
                </button>
              </el-upload>
            </el-tooltip>
      <el-tooltip content="清空所有条目" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('clear-all')" class="btn-danger-adv worldbook-bottom-button-text">
          <Icon icon="ph:trash-simple-duotone" width="16" height="16" class="worldbook-button-text-icon" />
          <span class="worldbook-button-text-short">清空</span>
          <span class="worldbook-button-text-long">清空所有</span>
        </button>
      </el-tooltip>
    </div>

    <!-- Editor Actions -->
    <div v-if="context === 'editor'" class="worldbook-editor-buttons">
       <el-tooltip content="复制当前条目 (到剪贴板)" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('copy-entry')" :disabled="!hasSelection" class="btn-secondary-adv worldbook-editor-button" aria-label="复制当前条目">
          <Icon icon="ph:copy-simple-duotone" class="worldbook-editor-button-icon" />
        </button>
      </el-tooltip>
      <el-tooltip content="从剪贴板粘贴为新条目" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('import-entry')" class="btn-warning-adv worldbook-editor-button" aria-label="从剪贴板粘贴为新条目">
          <Icon icon="ph:clipboard-text-duotone" class="worldbook-editor-button-icon" />
        </button>
      </el-tooltip>
      <div v-if="hasSelection" class="save-button-group">
        <el-tooltip content="手动立即保存" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
          <button @click="$emit('save-entry')" class="btn-primary-adv worldbook-editor-button" aria-label="保存当前条目">
            <Icon icon="ph:floppy-disk-duotone" class="worldbook-editor-button-icon" />
          </button>
        </el-tooltip>
        <el-tooltip :content="getTooltipText()" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
          <div class="save-status-badge" :class="getBadgeClass()" @click="$emit('toggle-mode')">
            <Icon v-if="saveStatus === 'saving'" icon="eos-icons:loading" class="badge-icon spinning" />
            <Icon v-else-if="saveStatus === 'saved'" icon="ph:check-circle-fill" class="badge-icon" />
            <Icon v-else-if="saveStatus === 'error'" icon="ph:warning-circle-fill" class="badge-icon" />
            <Icon v-else :icon="getModeIcon()" class="badge-icon" />
            <span class="badge-text">{{ getBadgeText() }}</span>
          </div>
        </el-tooltip>
      </div>
      <el-tooltip v-if="hasSelection" content="删除当前条目" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('delete-entry')" class="btn-danger-adv worldbook-editor-button" aria-label="删除当前条目">
          <Icon icon="ph:trash-duotone" class="worldbook-editor-button-icon-delete" />
        </button>
      </el-tooltip>
    </div>
</template>

<script setup lang="ts">
import { ElTooltip, ElUpload } from 'element-plus';
import { Icon } from '@iconify/vue';

interface Props {
  context: 'list' | 'editor';
  hasSelection?: boolean;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  autoSaveMode?: 'auto' | 'watch' | 'manual';
}

const props = defineProps<Props>();

const getModeIcon = () => {
  switch (props.autoSaveMode) {
    case 'auto':
      return 'ph:clock-countdown-duotone';
    case 'watch':
      return 'ph:eye-duotone';
    case 'manual':
      return 'ph:hand-duotone';
    default:
      return 'ph:eye-duotone';
  }
};

const getBadgeText = () => {
  if (props.saveStatus === 'saving') return '保存中';
  if (props.saveStatus === 'saved') return '已保存';
  if (props.saveStatus === 'error') return '失败';

  switch (props.autoSaveMode) {
    case 'auto':
      return '自动保存';
    case 'watch':
      return '监听中';
    case 'manual':
      return '已禁用';
    default:
      return '监听中';
  }
};

const getBadgeClass = () => {
  if (props.saveStatus && props.saveStatus !== 'idle') {
    return `status-${props.saveStatus}`;
  }

  switch (props.autoSaveMode) {
    case 'auto':
      return 'status-auto';
    case 'watch':
      return 'status-watch';
    case 'manual':
      return 'status-manual';
    default:
      return 'status-watch';
  }
};

const getTooltipText = () => {
  switch (props.autoSaveMode) {
    case 'auto':
      return '点击切换到监听模式';
    case 'watch':
      return '点击切换到手动模式';
    case 'manual':
      return '点击切换到自动保存模式';
    default:
      return '点击切换保存模式';
  }
};

const emit = defineEmits<{
  (e: 'copy-book'): void;
  (e: 'import-book'): void;
  (e: 'export-json'): void;
  (e: 'import-json', file: File): void;
  (e: 'import-book-file', file: File): void;
  (e: 'clear-all'): void;
  (e: 'copy-entry'): void;
  (e: 'import-entry'): void;
  (e: 'save-entry'): void;
  (e: 'delete-entry'): void;
  (e: 'toggle-mode'): void;
}>();

const handleEntriesUpload = (file: File): boolean => {
  emit('import-json', file);
  return false; // Prevent el-upload's default behavior
};

const handleBookUpload = (file: File): boolean => {
  emit('import-book-file', file);
  return false; // Prevent el-upload's default behavior
};
</script>

<style scoped>
.save-button-group {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.save-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  user-select: none;
}

.save-status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.save-status-badge:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 自动保存模式 */
.save-status-badge.status-auto {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary-light-5);
}

/* 监听模式 */
.save-status-badge.status-watch {
  background-color: var(--el-fill-color);
  color: var(--el-text-color-secondary);
  border: 1px solid var(--el-border-color);
}

/* 手动模式 */
.save-status-badge.status-manual {
  background-color: var(--el-color-warning-light-9);
  color: var(--el-color-warning-dark-2);
  border: 1px solid var(--el-color-warning-light-5);
}

.save-status-badge.status-saving {
  background-color: var(--el-color-info-light-9);
  color: var(--el-color-info);
  border: 1px solid var(--el-color-info-light-5);
}

.save-status-badge.status-saved {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success-dark-2);
  border: 1px solid var(--el-color-success-light-5);
}

.save-status-badge.status-error {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
  border: 1px solid var(--el-color-danger-light-5);
}

.badge-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.badge-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.badge-text {
  line-height: 1;
}
</style>