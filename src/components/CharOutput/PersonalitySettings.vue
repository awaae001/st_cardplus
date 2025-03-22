<template>
  <el-card class="mb-4">
    <!-- <h2 class="text-xl font-semibold mb-4">个性设定</h2> -->
    <el-input type="textarea" v-model="characterData.personality" :rows="3" placeholder="请输入个性设定" />
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
