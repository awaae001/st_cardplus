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

    <!-- 使用 Tailwind grid 代替 #appearance-form 的 CSS grid -->
    <el-form :model="localForm.appearance" :label-width="labelWidth" label-position="top" class="space-y-1">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-4">
        
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">身高</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.height" placeholder="例如：175cm" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">发色</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.hairColor" placeholder="例如：黑色" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">发型</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.hairstyle" placeholder="例如：及肩短发" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">眼睛</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.eyes" placeholder="例如：深邃的蓝色眼眸" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">鼻子</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.nose" placeholder="例如：高挺的鼻梁" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">嘴唇</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.lips" placeholder="例如：薄而性感的双唇" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">皮肤</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.skin" placeholder="例如：白皙的皮肤" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">身材</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.body" placeholder="例如：匀称而富有力量" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">胸部</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.breasts" placeholder="例如：饱满的C罩杯" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">生殖器</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.genitals" placeholder="例如：尺寸可观" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">肛门</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.anus" placeholder="例如：紧致" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">阴毛</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.pubes" placeholder="例如：修剪整齐" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">胸围</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.bust" placeholder="例如：90cm" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">腰围</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.waist" placeholder="例如：60cm" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">臀围</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.hips" placeholder="例如：90cm" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">大腿</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.thighs" placeholder="例如：结实有力" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">屁股</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.butt" placeholder="例如：圆润挺翘" />
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">足部</span></template>
          <el-input type="textarea" :rows="1" v-model="localForm.appearance.feet" placeholder="例如：小巧玲珑的玉足" />
        </el-form-item>

        <!-- 自定义字段渲染 -->
        <el-form-item v-for="(field, index) in customFields" :key="field.label + '-' + index" class="mb-0 col-span-1">
          <template #label><span class="form-label-adv">{{ field.label }}</span></template>
          <div class="flex items-center gap-2">
            <el-input type="textarea" :rows="1" v-model="field.value" :placeholder="`请输入 ${field.label} 特征`" class="flex-grow"/>
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
import { ElInput, ElButton, ElFormItem, ElForm, ElMessageBox } from 'element-plus'; // Added ElForm, ElFormItem
import { Icon } from '@iconify/vue';

interface CustomField { label: string; value: string; }

// 定义 Props 接口，只包含 appearance 部分
interface AppearanceForm {
  appearance: {
    height: string; hairColor: string; hairstyle: string; eyes: string; nose: string; lips: string; skin: string; body: string; bust: string; waist: string; hips: string; breasts: string; genitals: string; anus: string; pubes: string; thighs: string; butt: string; feet: string;
    [key: string]: string; // 允许动态添加的自定义字段
  };
}

const props = defineProps<{ form: AppearanceForm }>();
const emit = defineEmits(['update:form']);

// 使用本地 ref 来管理 appearance 对象，避免直接修改 prop
// 确保 localForm.appearance 总是被初始化为一个对象
const localForm = ref<AppearanceForm>({ 
  appearance: { ...(props.form.appearance || {}) } 
});

const customFields = ref<CustomField[]>([]);
const screenWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 769); // Default to non-mobile for SSR safety

const labelWidth = computed(() => (screenWidth.value > 768 ? '0px' : 'auto')); // Using label-position="top", so width is less critical

const updateScreenWidth = () => { screenWidth.value = window.innerWidth; };

// 初始化自定义字段列表 (从 props.form.appearance 中提取)
const initializeCustomFields = (appearanceData: AppearanceForm['appearance']) => {
  customFields.value = []; // 清空
  if (!appearanceData) return;

  const standardKeys = ['height', 'hairColor', 'hairstyle', 'eyes', 'nose', 'lips', 'skin', 'body', 'bust', 'waist', 'hips', 'breasts', 'genitals', 'anus', 'pubes', 'thighs', 'butt', 'feet'];
  for (const key in appearanceData) {
    if (Object.prototype.hasOwnProperty.call(appearanceData, key) && !standardKeys.includes(key)) {
      customFields.value.push({ label: key, value: appearanceData[key] });
    }
  }
};

// 当外部 props.form.appearance 改变时，更新 localForm.appearance 和 customFields
watch(() => props.form.appearance, (newAppearance) => {
  if (newAppearance) {
    if (JSON.stringify(newAppearance) !== JSON.stringify(localForm.value.appearance)) {
      localForm.value.appearance = { ...newAppearance };
    }
    initializeCustomFields(newAppearance);
  } else {
    localForm.value.appearance = {}; // Or default appearance
    customFields.value = [];
  }
}, { deep: true, immediate: true }); // immediate: true to run on component mount

// 当 localForm.appearance (标准字段) 改变时，通知父组件
watch(() => localForm.value.appearance, (newAppearance) => {
  // 只 emit 'appearance' 部分的更新
  emit('update:form', { appearance: { ...newAppearance } });
}, { deep: true });


// 当 customFields 数组中的某个对象的 value 改变时，同步到 localForm.appearance 并 emit
watch(customFields, (newFields) => {
  let appearanceChanged = false;
  // 更新 localForm.appearance 中的自定义字段
  newFields.forEach(field => {
    if (localForm.value.appearance[field.label] !== field.value) {
      localForm.value.appearance[field.label] = field.value;
      appearanceChanged = true;
    }
  });
  // 移除在 customFields 中已不存在但在 localForm.appearance 中还存在的自定义字段
  const currentCustomLabels = new Set(newFields.map(f => f.label));
  const standardKeys = new Set(['height', /* ...all standard keys... */ 'feet']);
  for (const key in localForm.value.appearance) {
    if (!standardKeys.has(key) && !currentCustomLabels.has(key)) {
      delete localForm.value.appearance[key];
      appearanceChanged = true;
    }
  }

  if(appearanceChanged) {
     // emit('update:form', { appearance: { ...localForm.value.appearance } }); // 已经通过上面的 watch(()=>localForm.value.appearance) 处理了
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
          if (!value) return true; // 允许不输入直接确认（不添加）
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
      const standardKeys = new Set(['height', 'hairColor', 'hairstyle', 'eyes', 'nose', 'lips', 'skin', 'body', 'bust', 'waist', 'hips', 'breasts', 'genitals', 'anus', 'pubes', 'thighs', 'butt', 'feet']);

      for (const line of lines) {
        const [fieldName, ...fieldValueParts] = line.split(':');
        const trimmedName = fieldName.trim();
        const fieldValue = fieldValueParts.join(':').trim();

        if (!trimmedName) continue;

        if (standardKeys.has(trimmedName) || customFields.value.some(field => field.label === trimmedName)) {
          ElMessageBox.alert(`字段 "${trimmedName}" 是预设字段或已存在，将跳过。`, '提示', { confirmButtonText: '好的', customClass: 'app-dialog' });
          continue;
        }
        customFields.value.push({ label: trimmedName, value: fieldValue });
        // localForm.value.appearance[trimmedName] = fieldValue; // 这会触发上面的 watch(customFields)
        addedCount++;
      }
      if (addedCount > 0) {
        ElMessage.success(`成功添加 ${addedCount} 个自定义字段。`);
      }
    }
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') { // ElMessageBox.prompt 在取消时会 reject 'cancel'
        console.error("添加自定义字段时出错:", e);
        ElMessage.error('添加自定义字段操作失败。');
    }
  }
};

const removeCustomField = (index: number) => {
  const fieldToRemove = customFields.value[index];
  if (fieldToRemove) {
    delete localForm.value.appearance[fieldToRemove.label]; // 从 form 数据中移除
    customFields.value.splice(index, 1); // 从 UI 列表移除
    // emit('update:form', { appearance: { ...localForm.value.appearance } }); // 已由 watch(localForm.appearance) 处理
  }
};

onMounted(() => { window.addEventListener('resize', updateScreenWidth); });
onBeforeUnmount(() => { window.removeEventListener('resize', updateScreenWidth); });

</script>