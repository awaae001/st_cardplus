<template>
  <el-card>
    <div class="title-Btn-add">
      <h2>角色备注</h2>
      <div style="display: flex; gap: 8px;">
        <el-button type="primary" @click="addNote" style="margin-left: 16px;">
          <Icon icon="material-symbols:note-add-outline" width="18" height="18" style="margin-right: 4px;" />
          添加备注
        </el-button>
      </div>
    </div>

    <draggable
      v-model="form.notes"
      handle=".drag-handle"
      item-key="index"
      animation="200"
      ghost-class="ghost"
      chosen-class="chosen"
      style="display: flex; flex-wrap: wrap;"
    >
      <template #item="{ element: note, index: noteIndex }">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="drag-handle" style="cursor: move; margin-bottom: 8px; padding: 4px; border-radius: 4px;">
            <Icon icon="material-symbols:drag-handle" width="20" height="20" />
          </div>
          <el-card class="note-card">
            <el-input v-model="note.name" placeholder="备注名称" />
            
            <div style="margin-top: 4px;"></div>

            <div v-for="(item, dataIndex) in note.data" :key="dataIndex" class="cardInput">
              <el-input
                v-model="note.data[dataIndex]"
                type="textarea"
                :rows="2"
                :placeholder="`备注内容 ${dataIndex + 1}`"
              />
              <el-button @click="removeNoteDataItem(noteIndex, dataIndex)" size="small">
                <Icon icon="material-symbols:delete-outline" width="18" height="18" />
              </el-button>
            </div>
            <el-button type="primary" @click="addNoteDataItem(noteIndex)" size="small" style="width: 100%; margin-top: 4px;">
              添加备注内容
            </el-button>

            <div style="margin: 4px;"></div>
            <el-button type="danger" @click="removeNote(noteIndex)">
              <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
              删除备注
            </el-button>
          </el-card>
        </el-col>
      </template>
    </draggable>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';
import { Icon } from "@iconify/vue";
import draggable from 'vuedraggable';
import type { CharacterCard, Note } from '../../../../types/character';

const props = defineProps<{
  form: CharacterCard;
  addNote: () => void;
  removeNote: (index: number) => void;
}>();

const form = ref(props.form);

watch(() => props.form, (newVal) => {
  form.value = newVal;
}, { deep: true });

const addNoteDataItem = (noteIndex: number) => {
  form.value.notes[noteIndex].data.push('');
};

const removeNoteDataItem = (noteIndex: number, dataIndex: number) => {
  form.value.notes[noteIndex].data.splice(dataIndex, 1);
};
</script>

<style scoped>
.title-Btn-add {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1rem;
}
.cardInput {
  display: flex;
  align-items: flex-start;
  margin-bottom: 4px;
}
.ghost {
  opacity: 0.5;
  background: var(--el-color-primary-light-9);
}
.chosen {
  transform: scale(1.02);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
.note-card {
  margin: 8px;
}
</style>