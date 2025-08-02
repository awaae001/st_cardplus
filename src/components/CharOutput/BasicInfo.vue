<template>
  <el-card style="width: 45%;">
    <h2  >基本信息</h2>
    <span style="margin:8px;">角色名称
      <el-input v-model="characterData.name" placeholder="请输入角色名称" /></span>
    <span style="margin:8px;">头像
      <el-input v-model="characterData.avatar" disabled placeholder="请输入头像地址" /></span>
    <span style="margin:8px;">第一条消息</span>
    <el-input type="textarea" v-model="characterData.first_mes" :rows="6" placeholder="请输入第一条消息" />
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
