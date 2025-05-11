<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 print:hidden">
    
    <div class="flex items-center gap-2 md:gap-3">
      <el-tooltip content="加载角色卡 (Ctrl+O)" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="loadCharacterCard" class="btn-secondary-adv !p-2.5 aspect-square group" aria-label="加载角色卡">
          <Icon icon="ph:folder-open-duotone" class="text-lg group-hover:scale-110 transition-transform"/>
        </button>
      </el-tooltip>
      <el-tooltip content="保存角色卡 (Ctrl+S)" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="saveCharacterCard" class="btn-primary-adv !p-2.5 aspect-square group" aria-label="保存角色卡">
          <Icon icon="ph:floppy-disk-duotone" class="text-lg group-hover:scale-110 transition-transform"/>
        </button>
      </el-tooltip>
      <el-tooltip content="重置表单" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="resetForm" class="btn-danger-adv !p-2.5 aspect-square group" aria-label="重置表单">
          <Icon icon="ph:arrow-counter-clockwise-duotone" class="text-lg group-hover:rotate-[30deg] transition-transform"/>
        </button>
      </el-tooltip>
    </div>

    
    <div class="flex items-center gap-2 md:gap-3">
      <el-tooltip content="复制到剪贴板 (Ctrl+C)" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="copyToClipboard" class="btn-secondary-adv !p-2.5 aspect-square group" aria-label="复制到剪贴板">
          <Icon icon="ph:copy-simple-duotone" class="text-lg group-hover:scale-110 transition-transform"/>
        </button>
      </el-tooltip>
      <el-tooltip content="从剪贴板粘贴 (Ctrl+V)" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
        <button @click="showImportDialog" class="btn-secondary-adv !p-2.5 aspect-square group" aria-label="从剪贴板粘贴">
          <Icon icon="ph:clipboard-text-duotone" class="text-lg group-hover:scale-110 transition-transform"/>
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
// ... Script 部分与你提供的 CharacterCardButtons.vue 保持一致 (包含 emit 和方法)
import { defineEmits } from 'vue';
import { Icon } from "@iconify/vue";
import { ElMessageBox, ElTooltip } from 'element-plus';

const emit = defineEmits<{
  (e: 'saveCharacterCard'): void;
  (e: 'loadCharacterCard'): void;
  (e: 'resetForm'): void;
  (e: 'copyToClipboard'): void;
  (e: 'importFromClipboard', data: string): void;
}>();

const saveCharacterCard = () => { emit('saveCharacterCard'); };
const loadCharacterCard = () => { emit('loadCharacterCard'); };
const resetForm = () => { emit('resetForm'); };
const copyToClipboard = () => { emit('copyToClipboard'); };

const showImportDialog = () => {
  ElMessageBox.prompt('请粘贴JSON格式的角色卡数据到下方文本框：', '从剪贴板导入数据', {
    confirmButtonText: '确认导入',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '在此处粘贴JSON数据...',
    customClass: 'app-dialog break-all',
    inputRows: 6,
    inputValidator: (value) => {
      if (!value || value.trim() === '') return '输入内容不能为空。';
      try { JSON.parse(value); return true; }
      catch (e) { return '数据格式无效，请输入正确的JSON。'; }
    },
  }).then(({ value }) => {
    emit('importFromClipboard', value);
  }).catch(() => { /* User cancelled */ });
};
</script>

