<template>
  <el-card class="mb-4 p-2 md:p-4">
    <div class="title-Btn">
      <h2>外貌特征</h2>
    </div>
    <div style="margin-top: 8px;"></div>
    <p class="whatYouwant">
      <Icon icon="material-symbols:info-outline" width="24" height="24" />
      <span style="margin-left: 4px;"></span>
      当你在输入框留空时留空的位置不会被导出，即："不用全部填写"
    </p>
    <el-form :model="form.appearance" :label-width="screenWidth > 768 ? '120px' : 'auto'">
      <div id="appearance-form">
        <!-- 统一渲染所有字段 -->
        <el-form-item v-for="(field, index) in displayFields" :key="field.key" :label="field.label" style="display: flex;align-items: flex-start;">
          <div class="custom-field-container" style="display: flex;align-items: flex-start;">
            <el-input type="textarea" :rows="1" v-model="field.value" :placeholder="`请输入 ${field.label} 特征`" @input="updateFormField(field.key, field.value)" />
            <el-button type="danger" size="small" @click="removeField(index)" class="remove-btn">
              <Icon icon="material-symbols:delete-outline" width="20" height="20" />
            </el-button>
          </div>
        </el-form-item>
      </div>
    </el-form>
    <el-button type="primary" size="small" @click="addCustomField">
      <Icon icon="material-symbols:add" width="20" height="20" />
      添加自定义字段
    </el-button>
  </el-card>
</template>

<script setup lang="ts">
import { ref, defineProps, watch, onMounted, onBeforeUnmount, defineEmits } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessageBox } from 'element-plus';

// 统一字段接口
interface AppearanceField {
  key: string;
  label: string;
  value: string;
}

interface Props {
  form: {
    appearance: {
      [key: string]: string;
    };
  };
}

const emit = defineEmits(['update:form']);
const props = defineProps<Props>();
const form = ref(props.form);
const screenWidth = ref(window.innerWidth);

// 用于显示在UI上的所有字段
const displayFields = ref<AppearanceField[]>([]);

// 预设字段的中英文映射
const standardFieldsMap: { [key: string]: string } = {
  'height': '身高',
  'hairColor': '发色',
  'hairstyle': '发型',
  'eyes': '眼睛',
  'nose': '鼻子',
  'lips': '嘴唇',
  'skin': '皮肤',
  'body': '身材',
  'breasts': '胸部',
  'genitals': '生殖器',
  'anus': '屁眼',
  'pubes': '阴毛',
  'bust': '胸围',
  'waist': '腰围',
  'hips': '臀围',
  'thighs': '大腿',
  'butt': '屁股',
  'feet': '足部'
};

// 将 props.form.appearance 的数据同步到 displayFields
const syncFields = () => {
  const newFields: AppearanceField[] = [];
  if (form.value.appearance) {
    for (const key in form.value.appearance) {
      if (Object.prototype.hasOwnProperty.call(form.value.appearance, key)) {
        const label = standardFieldsMap[key] || key;
        newFields.push({
          key: key,
          label: label,
          value: form.value.appearance[key]
        });
      }
    }
  }
  displayFields.value = newFields;
};

// 更新 form 对象中的值
const updateFormField = (key: string, value: string) => {
  form.value.appearance[key] = value;
  emit('update:form', form.value);
};

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

const addCustomField = async () => {
  try {
    const { value: inputText } = await ElMessageBox.prompt(
      '<b>请输入自定义字段，每行一个字段</b><br>格式为"字段名:字段描述"<br>例如:<br>纹身:淡青色纹身，一条小龙<br>右腿:断掉的右腿，只有裤腿在晃荡',
      '添加自定义字段',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '字段名:字段描述',
        inputValidator: (value) => {
          if (!value) return true;
          const lines = value.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (!line.includes(':')) {
              return `格式错误: "${line}"每行必须包含冒号(:)分隔字段名和描述`;
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

      for (const line of lines) {
        const [fieldName, ...fieldValueParts] = line.split(':');
        const trimmedName = fieldName.trim();
        const fieldValue = fieldValueParts.join(':').trim();

        if (!trimmedName) continue;

        // 检查字段是否已存在 (无论是 key 还是 label)
        const keyExists = Object.keys(form.value.appearance).includes(trimmedName);
        const labelExists = Object.values(standardFieldsMap).includes(trimmedName);

        if (keyExists || labelExists) {
          ElMessageBox.alert(`字段 "${trimmedName}" 已存在或为预设字段，请使用其他名称。`, '提示', {
            confirmButtonText: '确定'
          });
          continue;
        }

        // 添加到 form.appearance
        form.value.appearance[trimmedName] = fieldValue;
        addedCount++;
      }

      if (addedCount > 0) {
        syncFields(); // 同步到 displayFields
        emit('update:form', form.value);
        ElMessageBox.alert(`成功添加 ${addedCount} 个自定义字段`, '成功', {
          confirmButtonText: '确定'
        });
      }
    }
  } catch (error) {
    // 用户取消输入时会进入catch, 无需提示
  }
};

// 通用的删除字段函数
const removeField = (index: number) => {
  const fieldToRemove = displayFields.value[index];
  if (fieldToRemove) {
    // 从 form.appearance 中删除
    delete form.value.appearance[fieldToRemove.key];
    // 从 displayFields 中删除
    displayFields.value.splice(index, 1);
    // 通知父组件更新
    emit('update:form', form.value);
  }
};

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
  syncFields();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

// 监听 props.form 的变化，以便在外部更改时更新内部状态
watch(() => props.form, (newVal) => {
  form.value = newVal;
  syncFields();
}, { deep: true, immediate: true });
</script>

<style scoped>
/* 使用 Tailwind CSS 进行样式控制 */
.section-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-container>* {
  flex: 1;
}

.ps-text {
  font-style: italic;
  color: #373737;
  font-weight: 300;
}

.title-Btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.title-Btn-add {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

#appearance-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 744px) {
  #appearance-form {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1044px) {
  #appearance-form {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1444px) {
  #appearance-form {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1744px) {
  #appearance-form {
    grid-template-columns: repeat(5, 1fr);
  }
}

.whatYouwant {
  display: flex;
}

.custom-field-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-field-container .el-input {
  flex: 1;
}

.remove-btn {
  flex-shrink: 0;
}
</style>
