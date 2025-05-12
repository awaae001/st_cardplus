<template>
  <div class="content-panel-body space-y-4 md:space-y-5 h-full flex flex-col">
    <div class="content-panel-header -mx-4 md:-mx-5 -mt-4 md:-mt-5 mb-5">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon icon="ph:note-pencil-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
        角色备注 (深度提示)
      </h3>
      <div class="ml-auto">
        <button @click="handleTriggerFileUpload" class="btn-primary-adv text-sm !py-1.5 !px-3 whitespace-nowrap" title="从文件导入备注内容">
          <Icon icon="material-symbols:file-open-outline-rounded" width="18" height="18" class="mr-1.5 -ml-0.5" />
          导入内容
        </button>
      </div>
    </div>
    <div class="flex-grow space-y-4 px-1">
      <el-form-item>
        <template #label><span class="form-label-adv">备注深度</span></template>
        <el-input-number v-model="localDepthPrompt.depth" :min="0" :max="10" controls-position="right" class="w-full sm:w-auto"/>
      </el-form-item>
      <el-form-item class="flex-grow flex flex-col">
        <template #label><span class="form-label-adv">备注内容 (Prompt)</span></template>
        <el-input type="textarea" v-model="localDepthPrompt.prompt" :autosize="{ minRows: 5, maxRows: 12 }" placeholder="请输入角色备注/深度提示内容" class="flex-grow"/>
      </el-form-item>
      <el-form-item>
        <template #label><span class="form-label-adv">应用角色 (Role)</span></template>
        <el-select v-model="localDepthPrompt.role" placeholder="请选择角色" class="w-full sm:w-auto">
          <el-option label="系统 ⚙️ | System" value="system" />
          <el-option label="用户 👤 | User" value="user" />
          <el-option label="助手 🤖 | Assistant" value="assistant" />
        </el-select>
      </el-form-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, defineProps, defineEmits, nextTick } from 'vue';
import { Icon } from "@iconify/vue";
import type { ElInputNumber, ElInput, ElSelect, ElOption, ElFormItem } from 'element-plus';

interface DepthPromptData { prompt: string; depth: number; role: string; }
interface CharacterNotesFormData { data: { extensions: { depth_prompt: DepthPromptData; [key: string]: any; }; [key: string]: any; }; }
interface Props { form: CharacterNotesFormData; }

const props = defineProps<Props>();
const emit = defineEmits(['update:form', 'handleFileUpload']);

const defaultDepthPrompt = (): DepthPromptData => ({ prompt: '', depth: 0, role: 'system' });
const localDepthPrompt = reactive<DepthPromptData>(defaultDepthPrompt());
let internalUpdateFlag_Notes = false;

watch(() => props.form.data.extensions.depth_prompt, (newVal) => {
  const propVal = newVal || defaultDepthPrompt();
  if (JSON.stringify(propVal) !== JSON.stringify(localDepthPrompt)) {
    // console.log('CharacterNotes: Props updated depth_prompt. Updating local.');
    internalUpdateFlag_Notes = true;
    Object.assign(localDepthPrompt, propVal); // Assign to existing reactive object
    nextTick(() => { internalUpdateFlag_Notes = false; });
  }
}, { deep: true, immediate: true });

watch(localDepthPrompt, (newVal) => {
  if (internalUpdateFlag_Notes) {
    // console.log('CharacterNotes: Emit blocked for prop-driven update.');
    return;
  }
  const currentPropVal = props.form.data.extensions.depth_prompt || defaultDepthPrompt();
  if (JSON.stringify(newVal) !== JSON.stringify(currentPropVal)) {
    // console.log('CharacterNotes: Local changed. Emitting depth_prompt:', JSON.parse(JSON.stringify(newVal)));
    emit('update:form', {
      data: { 
        ...props.form.data, 
        extensions: { ...props.form.data.extensions, depth_prompt: { ...newVal } }
      }
    });
  }
}, { deep: true });

const handleTriggerFileUpload = () => emit('handleFileUpload');
</script>