<template>
  <div class="content-panel-body space-y-5">
    <div class="content-panel-header -mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-6">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon icon="ph:person-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
        外貌特征
      </h3>
    </div>

    <div class="flex items-center gap-2 p-3 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs mb-4">
      <Icon icon="ph:info-duotone" class="text-lg shrink-0"/>
      <span>当输入框留空时，该位置不会被导出，即："不用全部填写"。</span>
    </div>

    <el-form :model="localForm.appearance" :label-width="labelWidth" label-position="top" class="space-y-1">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-4">
        
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">身高</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.height" placeholder="例如：175cm"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">发色</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.hairColor" placeholder="例如：黑色"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">发型</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.hairstyle" placeholder="例如：及肩短发"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">眼睛</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.eyes" placeholder="例如：深邃的蓝色眼眸"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">鼻子</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.nose" placeholder="例如：高挺的鼻梁"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">嘴唇</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.lips" placeholder="例如：薄而性感的双唇"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">皮肤</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.skin" placeholder="例如：白皙的皮肤"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">身材</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.body" placeholder="例如：匀称而富有力量"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">胸部</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.breasts" placeholder="例如：饱满的C罩杯"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">生殖器</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.genitals" placeholder="例如：尺寸可观"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">肛门</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.anus" placeholder="例如：紧致"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">阴毛</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.pubes" placeholder="例如：修剪整齐"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">胸围</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.bust" placeholder="例如：90cm"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">腰围</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.waist" placeholder="例如：60cm"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">臀围</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.hips" placeholder="例如：90cm"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">大腿</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.thighs" placeholder="例如：结实有力"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">屁股</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.butt" placeholder="例如：圆润挺翘"></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">足部</span></template>
          <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="localForm.appearance.feet" placeholder="例如：小巧玲珑的玉足"></el-input>
        </el-form-item>

        
        <el-form-item v-for="(field, index) in customFields" :key="field.label + '-' + index" class="mb-0 col-span-1">
          <template #label><span class="form-label-adv">{{ field.label }}</span></template>
          <div class="flex items-center gap-2">
            <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" v-model="field.value" :placeholder="`请输入 ${field.label} 特征`" class="flex-grow"></el-input>
            <button @click="removeCustomField(index)" class="btn-danger-adv !p-1.5 !aspect-square shrink-0" aria-label="移除此字段">
              <Icon icon="ph:trash-simple-duotone" class="text-base"/>
            </button>
          </div>
        </el-form-item>
      </div>
    </el-form>

    <div class="mt-4">
      <button @click="addCustomField" class="btn-secondary-adv !py-1.5 !px-3 text-xs">
        <Icon icon="ph:plus-circle-duotone" class="mr-1.5 text-base"/>
        添加自定义外貌字段
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, defineProps, defineEmits, computed } from 'vue';
import { ElInput, ElButton, ElFormItem, ElForm, ElMessageBox, ElMessage } from 'element-plus'; // Added ElMessage
import { Icon } from '@iconify/vue';

interface CustomField { label: string; value: string; }

interface AppearanceForm {
  appearance: {
    height: string; hairColor: string; hairstyle: string; eyes: string; nose: string; lips: string; skin: string; body: string; bust: string; waist: string; hips: string; breasts: string; genitals: string; anus: string; pubes: string; thighs: string; butt: string; feet: string;
    [key: string]: string; 
  };
}

const props = defineProps<{ form: AppearanceForm }>();
const emit = defineEmits(['update:form']);

const localForm = ref<AppearanceForm>({ 
  appearance: { ...(props.form.appearance || {}) } 
});

const customFields = ref<CustomField[]>([]);
const screenWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 769);

const labelWidth = computed(() => (screenWidth.value > 768 ? '0px' : 'auto'));

const updateScreenWidth = () => { screenWidth.value = window.innerWidth; };

const STANDARD_APPEARANCE_KEYS = new Set(['height', 'hairColor', 'hairstyle', 'eyes', 'nose', 'lips', 'skin', 'body', 'bust', 'waist', 'hips', 'breasts', 'genitals', 'anus', 'pubes', 'thighs', 'butt', 'feet']);

const initializeCustomFields = (appearanceData: AppearanceForm['appearance'] | undefined) => {
  const newCustomFields: CustomField[] = [];
  if (appearanceData) {
    for (const key in appearanceData) {
      if (Object.prototype.hasOwnProperty.call(appearanceData, key) && !STANDARD_APPEARANCE_KEYS.has(key)) {
        newCustomFields.push({ label: key, value: appearanceData[key] });
      }
    }
  }
  customFields.value = newCustomFields;
};

watch(() => props.form.appearance, (newAppearance) => {
  const currentLocalAppearanceJson = JSON.stringify(localForm.value.appearance || {});
  const newAppearanceJson = JSON.stringify(newAppearance || {});

  if (newAppearanceJson !== currentLocalAppearanceJson) {
    localForm.value.appearance = newAppearance ? { ...newAppearance } : {};
  }
  // Initialize custom fields regardless, as props could change custom fields too
  initializeCustomFields(newAppearance);

}, { deep: true, immediate: true });

// Watch localForm.appearance (standard fields) for changes and emit
watch(() => localForm.value.appearance, (newVal, oldVal) => {
  // We need to ensure this doesn't create an infinite loop with customFields watcher
  // This watcher is primarily for standard fields modified directly in localForm.appearance
  if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
     // Filter out custom fields that are managed by `customFields` ref from direct emission
    const standardFieldsUpdate: Record<string, string> = {};
    for (const key in newVal) {
      if (STANDARD_APPEARANCE_KEYS.has(key) || !customFields.value.find(cf => cf.label === key)) {
        standardFieldsUpdate[key] = newVal[key];
      }
    }
    // Also add custom fields from customFields ref
    customFields.value.forEach(cf => {
        standardFieldsUpdate[cf.label] = cf.value;
    });

    // Only emit if the effective data (standard + custom from customFields) has changed from props
    const propsAppearanceJson = JSON.stringify(props.form.appearance || {});
    const effectiveLocalAppearanceJson = JSON.stringify(standardFieldsUpdate);

    if (effectiveLocalAppearanceJson !== propsAppearanceJson) {
        emit('update:form', { appearance: { ...standardFieldsUpdate } });
    }
  }
}, { deep: true });

// Watch customFields array (for adding, removing, or changing value of custom fields)
watch(customFields, (newCustomFields, oldCustomFields) => {
  let changed = false;
  const newLocalAppearance = { ...localForm.value.appearance };

  // Update from new custom fields
  newCustomFields.forEach(field => {
    if (newLocalAppearance[field.label] !== field.value) {
      newLocalAppearance[field.label] = field.value;
      changed = true;
    }
  });

  // Remove old custom fields that are no longer in customFields list
  const newCustomLabels = new Set(newCustomFields.map(f => f.label));
  for (const key in newLocalAppearance) {
    if (!STANDARD_APPEARANCE_KEYS.has(key) && !newCustomLabels.has(key)) {
      delete newLocalAppearance[key];
      changed = true;
    }
  }
  
  if (changed) {
    // Update localForm.appearance, this will trigger the above watcher to emit
    // Compare before assigning to prevent loop if only order changed in customFields
    if (JSON.stringify(localForm.value.appearance) !== JSON.stringify(newLocalAppearance)) {
        localForm.value.appearance = newLocalAppearance;
    }
  }
}, { deep: true });


const addCustomField = async () => {
  try {
    const { value: inputText } = await ElMessageBox.prompt(
      '<b>请输入自定义字段，每行一个</b><br>格式："字段名:字段描述"<br>例如：<br>纹身:淡青色小龙纹身<br>角:一对黑曜石长角',
      '添加自定义外貌字段',
      {
        confirmButtonText: '确认添加', cancelButtonText: '取消', inputType: 'textarea',
        inputPlaceholder: '字段名1:描述1\n字段名2:描述2',
        customClass: 'app-dialog break-all', inputRows: 3,
        inputValidator: (value) => {
          if (!value) return true;
          const lines = value.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (!line.includes(':') || line.split(':').length < 2 || !line.split(':')[0].trim()) {
              return `格式错误: "${line}"。每行必须是“字段名:描述”，且字段名不能为空。`;
            }
          }
          return true;
        },
        dangerouslyUseHTMLString: true
      }
    );

    if (inputText) {
      const lines = inputText.split('\n').filter(line => line.trim());
      let addedCount = 0;
      
      const newFieldsToAdd: CustomField[] = [];

      for (const line of lines) {
        const [fieldName, ...fieldValueParts] = line.split(':');
        const trimmedName = fieldName.trim();
        const fieldValue = fieldValueParts.join(':').trim();

        if (!trimmedName) continue;

        if (STANDARD_APPEARANCE_KEYS.has(trimmedName) || customFields.value.some(field => field.label === trimmedName)) {
          ElMessageBox.alert(`字段 "${trimmedName}" 是预设字段或已存在，将跳过。`, '提示', { confirmButtonText: '好的', customClass: 'app-dialog' });
          continue;
        }
        newFieldsToAdd.push({ label: trimmedName, value: fieldValue });
        addedCount++;
      }
      if (newFieldsToAdd.length > 0) {
         customFields.value.push(...newFieldsToAdd); // This will trigger the watch on customFields
      }
      if (addedCount > 0) {
        ElMessage.success(`成功添加 ${addedCount} 个自定义字段。`);
      }
    }
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') {
        console.error("添加自定义字段时出错:", e);
        ElMessage.error('添加自定义字段操作失败。');
    }
  }
};

const removeCustomField = (index: number) => {
  if (customFields.value[index]) {
    customFields.value.splice(index, 1); // This will trigger the watch on customFields
  }
};

onMounted(() => { window.addEventListener('resize', updateScreenWidth); });
onBeforeUnmount(() => { window.removeEventListener('resize', updateScreenWidth); });

</script>

<style scoped>
/* Optional: if textareas in grid need specific styling adjustments */
.el-form-item :deep(.el-textarea__inner) {
  font-size: 0.8125rem; /* 13px if you want to match AttireSettings */
  line-height: 1.5; 
  padding-top: 4px; 
  padding-bottom: 4px;
  resize: none; 
  border-radius: var(--el-input-border-radius, var(--radius-base));
}
</style>