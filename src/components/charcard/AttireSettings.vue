<template>
  <el-card class="mb-4">
    <h2 class="text-xl font-semibold mb-2">服装设定</h2>
    <el-form :model="form.attire" label-width="120px">
      <el-form-item label="上衣">
        <el-input v-model="form.attire.tops" placeholder="请输入上衣" />
      </el-form-item>
      <el-form-item label="下装">
        <el-input v-model="form.attire.bottoms" placeholder="请输入下装" />
      </el-form-item>
      <el-form-item label="鞋子">
        <el-input v-model="form.attire.shoes" placeholder="请输入鞋子" />
      </el-form-item>
      <el-form-item label="袜子">
        <el-input v-model="form.attire.socks" placeholder="请输入袜子" />
      </el-form-item>
      <el-form-item label="内衣">
        <el-input v-model="form.attire.underwears" placeholder="请输入内衣" />
      </el-form-item>
      <el-form-item label="配饰">
        <el-input v-model="form.attire.accessories" placeholder="请输入配饰" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';

interface Props {
  form: {
    attire: {
      tops: string;
      bottoms: string;
      shoes: string;
      socks: string;
      underwears: string;
      accessories: string;
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
