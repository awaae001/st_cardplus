<template>
  <div class="content-panel-body space-y-4 md:space-y-5 h-full flex flex-col">
    <div class="content-panel-header -mx-4 md:-mx-5 -mt-4 md:-mt-5 mb-5">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon icon="ph:scroll-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
        角色描述
      </h3>
      <div class="ml-auto">
        <button @click="handleOpenImport" class="btn-primary-adv text-sm !py-1.5 !px-3 whitespace-nowrap" title="从文件导入角色描述">
          <Icon icon="material-symbols:file-open-outline-rounded" width="18" height="18" class="mr-1.5 -ml-0.5" />
          导入描述
        </button>
      </div>
    </div>
    <div class="flex-grow px-1 flex">
      <el-input type="textarea" v-model="localDescription" :autosize="{ minRows: 8, maxRows: 15 }" placeholder="请输入角色描述" class="flex-grow"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick } from 'vue';
import { Icon } from "@iconify/vue";
import type { ElInput } from 'element-plus';

interface CharacterDescriptionFormData {
  description: string;
  data?: { description?: string; [key: string]: any; };
}
interface Props { form: CharacterDescriptionFormData; }

const props = defineProps<Props>();
const emit = defineEmits(['update:form', 'openCharacterDescriptionImport']);

const localDescription = ref<string>('');
let internalUpdateFlag_Desc = false;

watch(() => props.form.description, (newVal) => {
  const currentPropVal = newVal || '';
  if (currentPropVal !== localDescription.value) {
    // console.log('CharacterDescription: Prop updated. Updating local to:', currentPropVal);
    internalUpdateFlag_Desc = true;
    localDescription.value = currentPropVal;
    nextTick(() => { internalUpdateFlag_Desc = false; });
  }
}, { immediate: true });

watch(localDescription, (newVal) => {
  if (internalUpdateFlag_Desc) {
    // console.log('CharacterDescription: Emit blocked for prop-driven update.');
    return;
  }
  if (newVal !== (props.form.description || '')) {
    // console.log('CharacterDescription: Local changed. Emitting:', newVal);
    emit('update:form', { 
      description: newVal,
      data: { ...(props.form.data || {}), description: newVal }
    });
  }
});

const handleOpenImport = () => emit('openCharacterDescriptionImport');
</script>