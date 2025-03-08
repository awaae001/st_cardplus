<template>
  <el-card class="mb-4">
    <h2 class="text-xl font-semibold mb-2">外貌特征</h2>
    <el-form :model="form.appearance" label-width="120px">
      <el-form-item label="身高">
        <el-input v-model="form.appearance.height" placeholder="请输入身高" />
      </el-form-item>
      <el-form-item label="发色">
        <el-input v-model="form.appearance.hairColor" placeholder="请输入发色" />
      </el-form-item>
      <el-form-item label="发型">
        <el-input v-model="form.appearance.hairstyle" placeholder="请输入发型" />
      </el-form-item>
      <el-form-item label="眼睛">
        <el-input v-model="form.appearance.eyes" placeholder="请输入眼睛特征" />
      </el-form-item>
      <el-form-item label="鼻子">
        <el-input v-model="form.appearance.nose" placeholder="请输入鼻子特征" />
      </el-form-item>
      <el-form-item label="嘴唇">
        <el-input v-model="form.appearance.lips" placeholder="请输入嘴唇特征" />
      </el-form-item>
      <el-form-item label="皮肤">
        <el-input v-model="form.appearance.skin" placeholder="请输入皮肤特征" />
      </el-form-item>
      <el-form-item label="身材">
        <el-input v-model="form.appearance.body" placeholder="请输入身材特征" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';

interface Props {
  form: {
    appearance: {
      height: string;
      hairColor: string;
      hairstyle: string;
      eyes: string;
      nose: string;
      lips: string;
      skin: string;
      body: string;
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
