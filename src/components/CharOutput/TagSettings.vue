<template>
  <el-card style="width: 50%;">
    <h2>标签设置</h2>
    <el-select v-model="characterData.tags" multiple allow-create disabled filterable placeholder="未完成逻辑" />
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
