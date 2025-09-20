<template>
  <el-form :model="character" label-position="top" class="basic-info-form">
    <el-form-item label="角色名">
      <el-input v-model="character.name" placeholder="请输入角色名" />
    </el-form-item>

    <el-form-item label="角色描述">
      <el-input v-model="character.description" type="textarea" :rows="5" placeholder="角色的详细描述" />
    </el-form-item>

    <el-form-item label="性格">
      <el-input v-model="character.personality" type="textarea" :rows="4" placeholder="角色的性格特点" />
    </el-form-item>

    <el-form-item label="场景">
      <el-input v-model="character.scenario" type="textarea" :rows="4" placeholder="角色所处的场景或世界观" />
    </el-form-item>

    <el-form-item label="开场白">
      <el-input v-model="character.first_mes" type="textarea" :rows="3" placeholder="角色的第一句话" />
    </el-form-item>

    <el-form-item label="示例对话">
      <el-input v-model="character.mes_example" type="textarea" :rows="6" placeholder="示例对话，用于展示角色风格" />
    </el-form-item>

    <el-form-item label="系统提示">
      <el-input v-model="character.system_prompt" type="textarea" :rows="4" placeholder="用于指导 AI 的系统级提示" />
    </el-form-item>

    <el-form-item label="历史指令">
      <el-input v-model="character.post_history_instructions" type="textarea" :rows="4" placeholder="在生成回复时追加到历史记录后的指令" />
    </el-form-item>
    
    <el-form-item label="作者注">
      <el-input v-model="character.creator_notes" type="textarea" :rows="3" placeholder="创作者的内部备注" />
    </el-form-item>

    <el-form-item label="作者">
      <el-input v-model="character.creator" placeholder="请输入作者名" />
    </el-form-item>

    <el-form-item label="标签">
      <el-select
        v-model="character.tags"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="输入或选择标签"
        class="full-width"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ElForm, ElFormItem, ElInput, ElSelect } from 'element-plus';
import type { V2CharData } from '@/types/character-card-v2';

defineProps<{
  character: V2CharData;
}>();
</script>

<style scoped>
.basic-info-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.full-width {
  width: 100%;
}
</style>