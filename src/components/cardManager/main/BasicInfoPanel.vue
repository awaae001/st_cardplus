<template>
  <el-form
    :model="character.data"
    label-position="top"
    class="basic-info-form"
  >
    <el-form-item label="角色名">
      <el-input
        v-model="character.data.name"
        placeholder="请输入角色名"
      />
    </el-form-item>

    <el-form-item label="标签">
      <el-select
        v-model="character.data.tags"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="输入或选择标签"
        class="full-width"
      >
        <el-option
          v-for="tag in allTags"
          :key="tag"
          :label="tag"
          :value="tag"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="角色描述">
      <el-input
        v-model="character.data.description"
        type="textarea"
        :rows="10"
        placeholder="角色的详细描述"
      />
    </el-form-item>

    <el-form-item label="开场白">
      <el-input
        v-model="character.data.first_mes"
        type="textarea"
        :rows="8"
        placeholder="角色的第一句话"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus';
import type { CharacterCardV3 } from '@/types/character-card-v3';

defineProps<{
  character: CharacterCardV3;
  allTags?: string[];
}>();
</script>

<style scoped>
.basic-info-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
}

.full-width {
  width: 100%;
}
</style>
