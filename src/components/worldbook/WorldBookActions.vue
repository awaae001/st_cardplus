<template>
  <div class="worldbook-bottom-panel-buttons" v-if="context === 'list'">
      <el-tooltip content="复制整个世界书 (到剪贴板)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('copy-book')" class="btn-secondary-adv worldbook-bottom-button" aria-label="复制整个世界书">
          <Icon icon="ph:books-duotone" class="worldbook-bottom-button-icon" />
        </button>
      </el-tooltip>
      <el-tooltip content="从剪贴板导入整个世界书 (将替换现有)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('import-book')" class="btn-warning-adv worldbook-bottom-button worldbook-button-disabled" aria-label="从剪贴板导入整个世界书">
          <Icon icon="ph:clipboard-text-duotone" class="worldbook-bottom-button-icon" />
        </button>
      </el-tooltip>
      <span class="worldbook-button-divider"></span>
      <el-tooltip content="导出所有条目为JSON文件" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('export-json')" class="btn-success-adv worldbook-bottom-button-text">
          <Icon icon="ph:export-duotone" width="16" height="16" class="worldbook-button-text-icon" />
          <span class="worldbook-button-text-short">导出</span>
          <span class="worldbook-button-text-long">导出JSON</span>
        </button>
      </el-tooltip>
      <el-tooltip content="从JSON文件导入条目 (将替换现有)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
        <el-upload action="#" :before-upload="handleUpload" :show-file-list="false" accept=".json">
          <button class="btn-warning-adv worldbook-bottom-button-text worldbook-button-disabled">
            <Icon icon="ph:download-simple-duotone" width="16" height="16" class="worldbook-button-text-icon" />
            <span class="worldbook-button-text-short">导入</span>
            <span class="worldbook-button-text-long">导入JSON</span>
          </button>
        </el-upload>
      </el-tooltip>
      <el-tooltip content="清空所有条目" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('clear-all')" class="btn-danger-adv worldbook-bottom-button-text worldbook-button-disabled">
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
        <button @click="$emit('import-entry')" class="btn-warning-adv worldbook-editor-button worldbook-button-disabled" aria-label="从剪贴板粘贴为新条目">
          <Icon icon="ph:clipboard-text-duotone" class="worldbook-editor-button-icon" />
        </button>
      </el-tooltip>
      <el-tooltip v-if="hasSelection" content="保存当前条目" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('save-entry')" class="btn-primary-adv worldbook-editor-button" aria-label="保存当前条目">
          <Icon icon="ph:floppy-disk-duotone" class="worldbook-editor-button-icon" />
        </button>
      </el-tooltip>
      <el-tooltip v-if="hasSelection" content="删除当前条目" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('delete-entry')" class="btn-danger-adv worldbook-editor-button worldbook-button-disabled" aria-label="删除当前条目">
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
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'copy-book'): void;
  (e: 'import-book'): void;
  (e: 'export-json'): void;
  (e: 'import-json', file: File): void;
  (e: 'clear-all'): void;
  (e: 'copy-entry'): void;
  (e: 'import-entry'): void;
  (e: 'save-entry'): void;
  (e: 'delete-entry'): void;
}>();

const handleUpload = (file: File): boolean => {
  emit('import-json', file);
  return false; // Prevent el-upload's default behavior
};
</script>