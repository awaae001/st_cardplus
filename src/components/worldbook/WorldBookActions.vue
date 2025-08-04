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
      <el-tooltip v-if="hasSelection" content="保存当前条目" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="$emit('save-entry')" class="btn-primary-adv worldbook-editor-button" aria-label="保存当前条目">
          <Icon icon="ph:floppy-disk-duotone" class="worldbook-editor-button-icon" />
        </button>
      </el-tooltip>
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
}

defineProps<Props>();

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