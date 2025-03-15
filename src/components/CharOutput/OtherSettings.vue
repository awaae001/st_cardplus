<template>
  <el-card class="mb-4" style="width: 50%;">
    <h2 class="text-xl font-semibold mb-4">其他设置</h2>
    <span>发言频率</span>
    <el-slider v-model="characterData.talkativeness" :min="0" :max="1" :step="0.1" show-input />
    <span>是否收藏</span>
    <el-switch v-model="characterData.fav" />
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
