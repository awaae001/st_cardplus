<template>
  <div class="section-container">
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-2">喜好系统</h2>
      <el-input v-model="form.likes" type="textarea" :rows="5" placeholder="请输入喜好（每行一条）" class="mb-2" />
      <el-input v-model="form.dislikes" type="textarea" :rows="5" placeholder="请输入厌恶（每行一条）" />
    </el-card>

    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-2">日常作息</h2>
      <el-form :model="form.dailyRoutine" label-width="120px">
        <div id="routine-form">
          <!-- 统一渲染所有字段 -->
          <el-form-item v-for="(field, index) in displayFields" :key="field.key" :label="field.label" style="display: flex;align-items: flex-start;">
            <div class="custom-field-container" style="display: flex;align-items: flex-start;">
              <el-input type="textarea" :rows="1" v-model="field.value" :placeholder="`请输入 ${field.label} 内容`" @input="updateFormField(field.key, field.value)" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, watch, onMounted, defineEmits } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessageBox } from 'element-plus';

// 统一字段接口
interface RoutineField {
  key: string;
  label: string;
  value: string;
}

interface Props {
  form: {
    likes: string;
    dislikes: string;
    dailyRoutine: {
      [key: string]: string;
    };
  };
}

const emit = defineEmits(['update:form']);
const props = defineProps<Props>();
const form = ref(props.form);

// 用于显示在UI上的所有字段
const displayFields = ref<RoutineField[]>([]);

// 预设字段的中英文映射
const standardFieldsMap: { [key: string]: string } = {
  'earlyMorning': '清晨',
  'morning': '上午',
  'afternoon': '下午',
  'evening': '傍晚',
  'night': '夜间',
  'lateNight': '深夜'
};

// 将 props.form.dailyRoutine 的数据同步到 displayFields
const syncFields = () => {
  const newFields: RoutineField[] = [];
  if (form.value.dailyRoutine) {
    for (const key in form.value.dailyRoutine) {
      if (Object.prototype.hasOwnProperty.call(form.value.dailyRoutine, key)) {
        const label = standardFieldsMap[key] || key;
        newFields.push({
          key: key,
          label: label,
          value: form.value.dailyRoutine[key]
        });
      }
    }
  }
  displayFields.value = newFields;
};

// 更新 form 对象中的值
const updateFormField = (key: string, value: string) => {
  form.value.dailyRoutine[key] = value;
  emit('update:form', form.value);
};

const addCustomField = async () => {
  try {
    const { value: inputText } = await ElMessageBox.prompt(
      '<b>请输入自定义作息，每行一个</b><br>格式为 "时间段:作息内容"<br>例如:<br>午休:在办公室沙发上睡一小时',
      '添加自定义作息',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '时间段:作息内容',
        inputValidator: (value) => {
          if (!value) return true;
          const lines = value.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (!line.includes(':')) {
              return `格式错误: "${line}" 每行必须包含冒号(:)分隔时间段和内容`;
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

        const keyExists = Object.keys(form.value.dailyRoutine).includes(trimmedName);
        const labelExists = Object.values(standardFieldsMap).includes(trimmedName);

        if (keyExists || labelExists) {
          ElMessageBox.alert(`字段 "${trimmedName}" 已存在或为预设字段，请使用其他名称。`, '提示', {
            confirmButtonText: '确定'
          });
          continue;
        }

        form.value.dailyRoutine[trimmedName] = fieldValue;
        addedCount++;
      }

      if (addedCount > 0) {
        syncFields();
        emit('update:form', form.value);
        ElMessageBox.alert(`成功添加 ${addedCount} 个自定义作息`, '成功', {
          confirmButtonText: '确定'
        });
      }
    }
  } catch (error) {
    // 用户取消输入
  }
};

// 通用的删除字段函数
const removeField = (index: number) => {
  const fieldToRemove = displayFields.value[index];
  if (fieldToRemove) {
    delete form.value.dailyRoutine[fieldToRemove.key];
    displayFields.value.splice(index, 1);
    emit('update:form', form.value);
  }
};

onMounted(() => {
  syncFields();
});

watch(() => props.form, (newVal) => {
  form.value = newVal;
  syncFields();
}, { deep: true, immediate: true });
</script>

<style scoped>
/* 使用 Tailwind CSS 进行样式控制 */
.section-container {
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.section-container>* {
  flex: 1;
  min-width: 100%;
}

@media (min-width: 768px) {
  .section-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .section-container>* {
    min-width: auto;
  }
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

#routine-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 1024px) {
  #routine-form {
    grid-template-columns: repeat(2, 1fr);
  }
}

.custom-field-container {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.custom-field-container .el-input {
  flex: 1;
}

.remove-btn {
  flex-shrink: 0;
}
</style>
