<template>
  <div class="greetings-panel-container">
    <el-scrollbar>
      <div v-for="(greeting, index) in model" :key="index" class="greeting-item">
        <el-input
          :model-value="greeting"
          @update:model-value="updateGreeting(index, $event)"
          type="textarea"
          :rows="3"
          placeholder="请输入开场白"
        />
        <el-button type="danger" :icon="Delete" circle @click="removeGreeting(index)" class="delete-button" />
      </div>
    </el-scrollbar>
    <el-button type="primary" @click="addGreeting" class="add-button">添加开场白</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElScrollbar, ElInput, ElButton } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';

const model = defineModel<string[]>({ required: true });

const addGreeting = () => {
  model.value = [...model.value, ''];
};

const removeGreeting = (index: number) => {
  const newGreetings = [...model.value];
  newGreetings.splice(index, 1);
  model.value = newGreetings;
};

const updateGreeting = (index: number, value: string) => {
  const newGreetings = [...model.value];
  newGreetings[index] = value;
  model.value = newGreetings;
};
</script>

<style scoped>
.greetings-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.el-scrollbar {
  flex-grow: 1;
  margin-bottom: 16px;
}

.greeting-item {
  position: relative;
  margin-bottom: 12px;
}

.delete-button {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0.8;
}

.greeting-item:hover .delete-button {
  opacity: 1;
}

.add-button {
  width: 100%;
}
</style>