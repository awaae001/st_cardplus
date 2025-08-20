<template>
  <div class="form-row-responsive">
    <section class="form-section form-group-responsive">
      <h3 class="form-section-title">
        <Icon icon="ph:heart-duotone" class="form-section-icon" />喜好系统
      </h3>
      <div class="form-section-content">
        <el-input :model-value="form.likes" @update:model-value="$emit('update:form-likes', $event)" type="textarea" :rows="5" placeholder="请输入喜好（每行一条）" />
        <el-input :model-value="form.dislikes" @update:model-value="$emit('update:form-dislikes', $event)" type="textarea" :rows="5" placeholder="请输入厌恶（每行一条）"
          style="margin-top: 1rem;" />
      </div>
    </section>
    <section class="form-section form-group-responsive">
      <h3 class="form-section-title">
        <Icon icon="ph:clock-duotone" class="form-section-icon" />日常作息
      </h3>
      <div class="form-section-content">
        <div id="routine-form">
          <div v-for="(field, index) in displayRoutineFields" :key="field.key">
            <label class="form-label">{{ field.label }}</label>
            <div class="custom-field-container">
              <el-input type="textarea" :rows="1" v-model="field.value" :placeholder="`请输入 ${field.label} 内容`"
                @input="updateRoutineFormField(field.key, field.value)" />
              <el-button type="danger" size="small" @click="removeRoutineField(index)" class="remove-btn">
                <Icon icon="material-symbols:delete-outline" width="20" height="20" />
              </el-button>
            </div>
          </div>
        </div>
        <el-button type="primary" size="small" @click="addCustomRoutineField" style="margin-top: 1rem;">
          <Icon icon="material-symbols:add" width="20" height="20" />
          添加自定义字段
        </el-button>
      </div>
    </section>
  </div>
  <section class="form-section">
    <div class="title-Btn-add form-section-title">
      <h3 class="title-fixed">
        <Icon icon="ph:note-duotone" class="form-section-icon" />角色备注
      </h3>
      <div style="display: flex; gap: 8px; margin-left: 16px;">
        <el-button type="primary" @click="$emit('addNote')">
          <Icon icon="material-symbols:note-add-outline" width="18" height="18" style="margin-right: 4px;" />
          添加备注
        </el-button>
      </div>
    </div>
    <draggable :model-value="form.notes" @update:model-value="$emit('update:notes', $event)" handle=".drag-handle" item-key="index" animation="200" ghost-class="ghost"
      chosen-class="chosen" class="form-grid-4-col">
      <template #item="{ element: note, index: noteIndex }">
        <el-card class="draggable-card">
          <div class="drag-handle">
            <Icon icon="material-symbols:drag-handle" width="20" height="20" />
          </div>
          <el-form-item
            :prop="`notes.${noteIndex}.name`"
            :rules="{ required: true, message: '备注名称是必填项', trigger: 'blur' }"
            style="margin-bottom: 0"
          >
            <el-input v-model="note.name" placeholder="备注名称" />
          </el-form-item>
          <div v-for="( dataIndex) in note.data" :key="dataIndex" class="cardInput">
            <el-input v-model="note.data[dataIndex]" type="textarea" :rows="2"
              :placeholder="`备注内容 ${dataIndex + 1}`" />
            <el-button @click="removeNoteDataItem(noteIndex, dataIndex)" size="small">
              <Icon icon="material-symbols:delete-outline" width="18" height="18" />
            </el-button>
          </div>
          <el-button type="primary" @click="addNoteDataItem(noteIndex)" size="small"
            style="width: 100%; margin-top: 4px;">
            添加备注内容
          </el-button>
          <div></div>
          <el-button type="danger" @click="$emit('removeNote', noteIndex)" style="margin-top: 1rem; width: 100%;">
            <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
            删除备注
          </el-button>
        </el-card>
      </template>
    </draggable>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, toRefs } from 'vue';
import { ElInput, ElButton, ElCard, ElMessageBox, ElFormItem } from 'element-plus';
import { Icon } from '@iconify/vue';
import draggable from 'vuedraggable';

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  notes: {
    type: Array,
    required: true
  }
});

defineEmits([
  'update:form-likes',
  'update:form-dislikes',
  'addNote',
  'removeNote',
  'update:notes'
]);

const { form } = toRefs(props);

// Daily Routine
interface RoutineField {
  key: string;
  label: string;
  value: string;
}
const displayRoutineFields = ref<RoutineField[]>([]);
const standardRoutineFieldsMap: { [key: string]: string } = {
  'earlyMorning': '清晨', 'morning': '上午', 'afternoon': '下午', 'evening': '傍晚', 'night': '夜间', 'lateNight': '深夜'
};

const syncRoutineFields = () => {
  const newFields: RoutineField[] = [];
  if (form.value.dailyRoutine) {
    for (const key in form.value.dailyRoutine) {
      if (Object.prototype.hasOwnProperty.call(form.value.dailyRoutine, key)) {
        const label = standardRoutineFieldsMap[key] || key;
        newFields.push({ key: key, label: label, value: form.value.dailyRoutine[key] });
      }
    }
  }
  displayRoutineFields.value = newFields;
};

const updateRoutineFormField = (key: string, value: string) => {
  form.value.dailyRoutine[key] = value;
};

const addCustomRoutineField = async () => {
  try {
    const { value: inputText } = await ElMessageBox.prompt(
      '<b>请输入自定义作息，每行一个</b><br>格式为 "时间段:作息内容"<br>例如:<br>午休:在办公室沙发上睡一小时',
      '添加自定义作息',
      {
        confirmButtonText: '确认', cancelButtonText: '取消', inputType: 'textarea', inputPlaceholder: '时间段:作息内容',
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
        const labelExists = Object.values(standardRoutineFieldsMap).includes(trimmedName);
        if (keyExists || labelExists) {
          ElMessageBox.alert(`字段 "${trimmedName}" 已存在或为预设字段，请使用其他名称。`, '提示', { confirmButtonText: '确定' });
          continue;
        }
        form.value.dailyRoutine[trimmedName] = fieldValue;
        addedCount++;
      }
      if (addedCount > 0) {
        syncRoutineFields();
        ElMessageBox.alert(`成功添加 ${addedCount} 个自定义作息`, '成功', { confirmButtonText: '确定' });
      }
    }
  } catch (error) {
    // User cancelled
  }
};

const removeRoutineField = (index: number) => {
  const fieldToRemove = displayRoutineFields.value[index];
  if (fieldToRemove) {
    delete form.value.dailyRoutine[fieldToRemove.key];
    displayRoutineFields.value.splice(index, 1);
  }
};

// Character Notes
const addNoteDataItem = (noteIndex: number) => {
  form.value.notes[noteIndex].data.push('');
};
const removeNoteDataItem = (noteIndex: number, dataIndex: number) => {
  form.value.notes[noteIndex].data.splice(dataIndex, 1);
};


onMounted(() => {
  syncRoutineFields();
});

watch(() => form.value.dailyRoutine, () => {
  syncRoutineFields();
}, { deep: true, immediate: true });
</script>

<style scoped>
/* Styles from CharacterCardEditor.vue can be copied here if needed */
.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-fill-color-extra-light);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-extra-light);
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.form-section-icon {
  font-size: 18px;
  color: #409eff;
}

.form-row-responsive {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .form-row-responsive {
    flex-direction: row;
    gap: 24px;
  }
}

.form-group-responsive {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.custom-field-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-btn {
  flex-shrink: 0;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-Btn-add {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.form-grid-4-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .form-grid-4-col {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

.draggable-card {
  position: relative;
  transition: all 0.2s;
  border: 1px solid var(--el-border-color-lighter);
}

.draggable-card:hover {
  border-color: var(--el-border-color-hover);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: grab;
  color: var(--el-text-color-placeholder);
  transition: color 0.2s;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle:hover {
  color: var(--el-color-primary);
}

.drag-handle:active {
  cursor: grabbing;
}

.cardInput {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
}

.cardInput .el-button {
  flex-shrink: 0;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.ghost {
  opacity: 0.3;
  background-color: var(--el-color-primary-light-8);
  border: 2px dashed var(--el-color-primary);
}

.chosen {
  opacity: 0.8;
  transform: scale(1.02);
  background-color: var(--el-color-primary-light-9) !important;
  border-color: var(--el-color-primary) !important;
}

#routine-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  #routine-form {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (min-width: 1200px) {
  .form-grid-4-col {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    align-items: flex-start
  }
  #routine-form {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    align-items: flex-start
  }
}

.title-fixed {
  display: flex;
  padding: 4px;
  gap: 8px;
  align-items: center;
}
</style>