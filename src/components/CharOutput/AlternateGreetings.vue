<template>
  <el-card   style="width: 45%;">
    <div class="title-Btn-add">
      <h2  >备用问候语</h2>
      <el-button @click="addGreeting" type="primary" style="margin-left: 16px;">
        <Icon icon="material-symbols:add-comment-outline" width="18" height="18" style="margin-right: 4px;" />
        添加问候语
      </el-button>
    </div>
    <draggable v-model="characterData.data.alternate_greetings" item-key="index" handle=".drag-handle" @end="onDragEnd">
      <template #item="{ element, index }">
        <el-card   shadow="hover">
          <div class="card-content">
            <div
            style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            margin:0px -8px 0px 4px  ;"
            >
              <Icon icon="material-symbols:drag-handle" class="drag-handle" width="20" height="20" />
              <el-button @click="removeGreeting(index)"  :icon="Delete" />
            </div>
            <div>
              <el-input type="textarea" v-model="characterData.data.alternate_greetings[index]" :rows="4"
                placeholder="请输入备用问候语（支持换行）" style="width: 55vh;" />
            </div>
          </div>
        </el-card>
      </template>
    </draggable>
  </el-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { Icon } from "@iconify/vue";
import draggable from 'vuedraggable';
import { Delete } from '@element-plus/icons-vue'

defineProps({
  characterData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['addGreeting', 'removeGreeting', 'updateOrder']);

const addGreeting = () => {
  emit('addGreeting');
};

const removeGreeting = (index) => {
  emit('removeGreeting', index);
};

const onDragEnd = () => {
  emit('updateOrder', characterData.data.alternate_greetings);
};
</script>

<style scoped>
.card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.drag-handle {
  cursor: move;
  color: #999;
}

.card-content {
  display: flex;
}
</style>

<style type="text/css">
.title-Btn-add {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
