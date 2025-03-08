<template>
  <div style="display: flex;">
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-2">喜好系统</h2>
      <el-input v-model="form.likes" type="textarea" :rows="5" placeholder="请输入喜好（每行一条）" class="mb-2" />
      <el-input v-model="form.dislikes" type="textarea" :rows="5" placeholder="请输入厌恶（每行一条）" />
    </el-card>
    <div style="margin: 4px;"></div>
    <el-card class="mb-4" style="width: 75%;">
      <h2 class="text-xl font-semibold mb-2">日常作息</h2>
      <el-form :model="form.dailyRoutine" label-width="120px">
        <el-form-item label="清晨">
          <el-input v-model="form.dailyRoutine.earlyMorning" placeholder="请输入清晨作息" />
        </el-form-item>
        <el-form-item label="上午">
          <el-input v-model="form.dailyRoutine.morning" placeholder="请输入上午作息" />
        </el-form-item>
        <el-form-item label="下午">
          <el-input v-model="form.dailyRoutine.afternoon" placeholder="请输入下午作息" />
        </el-form-item>
        <el-form-item label="傍晚">
          <el-input v-model="form.dailyRoutine.evening" placeholder="请输入傍晚作息" />
        </el-form-item>
        <el-form-item label="夜间">
          <el-input v-model="form.dailyRoutine.night" placeholder="请输入夜间作息" />
        </el-form-item>
        <el-form-item label="深夜">
          <el-input v-model="form.dailyRoutine.lateNight" placeholder="请输入深夜作息" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';

interface Props {
  form: {
    likes: string;
    dislikes: string;
    dailyRoutine: {
      earlyMorning: string;
      morning: string;
      afternoon: string;
      evening: string;
      night: string;
      lateNight: string;
    };
  };
}

const props = defineProps<Props>();
const form = ref(props.form);

watch(() => props.form, (newVal) => {
  form.value = newVal;
}, { deep: true });
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
</style>
