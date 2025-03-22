<template>
  <el-card class="mb-4">
    <!-- <h2 class="text-xl font-semibold mb-4"> 对话示例</h2> -->
    <el-input type="textarea" v-model="characterData.mes_example" :rows="3" placeholder="请输入对话示例" />
  </el-card>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  characterData: {
    type: Object,
    required: true
  }
});
</script>
