<template>
  <el-card>
    <!-- <h2  > 对话示例</h2> -->
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
