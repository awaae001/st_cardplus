<template>
  <el-card class="mb-4">
    <h2 class="text-xl font-semibold mb-2">基础信息</h2>
    <el-form :model="form" label-width="120px">
      <el-form-item label="中文名">
        <el-input v-model="form.chineseName" placeholder="请输入中文名" />
      </el-form-item>
      <el-form-item label="日文名">
        <el-input v-model="form.japaneseName" disabled placeholder="逻辑未处理" />
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="form.gender" placeholder="请选择性别">
          <el-option label="女性" value="female" />
          <el-option label="男性" value="male" />
          <el-option label="秀吉（伪娘、正太）" value="秀吉（伪娘、正太）" />
          <el-option label="武装直升机" value="helicopter" />
          <el-option label="永雏塔菲" value="tiffany" />
          <el-option label="赛马娘" value="horse" />
          <el-option label="沃尔玛购物袋" value="walmartShopingBag" />
          <el-option label="其他(自定义)" value="other" />
        </el-select>
        <el-input
          v-if="form.gender === 'other'"
          v-model="form.customGender"
          placeholder="请输入角色的性别（other）"
          style="margin-top: 10px;"
        />
      </el-form-item>
      <el-form-item label="年龄">
        <el-input-number v-model="form.age" />
        <span class="ps-text" style="margin-left: 16px;">限制为数字，请勿输入其他字段</span>
      </el-form-item>
      <el-form-item label="身份">
        <el-input v-model="form.identity" type="textarea" :rows="5" placeholder="请输入身份 · 一行一条" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';

interface Props {
  form: {
    chineseName: string;
    japaneseName: string;
    gender: string;
    customGender: string;
    age: number;
    identity: string;
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
