<template>
  <div class="project-editor">
    <el-form
      :model="props.project"
      label-position="top"
    >
      <el-form-item label="项目名称">
        <el-input
          v-model="props.project.name"
          placeholder="请输入项目名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="项目描述">
        <el-input
          type="textarea"
          :rows="4"
          v-model="props.project.description"
          placeholder="请输入项目描述"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types/world-editor';
import { ElForm, ElFormItem, ElInput } from 'element-plus';

interface Props {
  project: Project;
}

const props = defineProps<Props>();
</script>

<style scoped>
.project-editor {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}
</style>
