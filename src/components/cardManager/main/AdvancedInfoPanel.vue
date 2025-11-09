<template>
  <div class="advanced-info-panel">
    <el-form-item label="性格">
      <el-input v-model="character.data.personality" type="textarea" :rows="4" placeholder="角色的性格特点" />
    </el-form-item>

    <el-form-item label="场景">
      <el-input v-model="character.data.scenario" type="textarea" :rows="4" placeholder="角色所处的场景或世界观" />
    </el-form-item>

    <el-form-item label="示例对话">
      <el-input v-model="character.data.mes_example" type="textarea" :rows="6" placeholder="示例对话，用于展示角色风格" />
    </el-form-item>

    <el-form-item label="系统提示">
      <el-input v-model="character.data.system_prompt" type="textarea" :rows="4" placeholder="用于指导 AI 的系统级提示" />
    </el-form-item>

    <el-form-item label="历史指令">
      <el-input v-model="character.data.post_history_instructions" type="textarea" :rows="4"
        placeholder="在生成回复时追加到历史记录后的指令" />
    </el-form-item>

    <el-form-item label="作者注">
      <el-input v-model="character.data.creator_notes" type="textarea" :rows="3" placeholder="创作者的内部备注" />
    </el-form-item>

    <el-form-item label="作者">
      <el-input v-model="character.data.creator" placeholder="请输入作者名" />
    </el-form-item>

  </div>
</template>

<script setup lang="ts">
import { ElFormItem, ElInput } from 'element-plus';
import type { CharacterCardV3 } from '@/types/character-card-v3';

defineProps<{
  character: CharacterCardV3;
}>();
</script>

<style scoped>
.advanced-info-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
}

.full-width {
  width: 100%;
}
</style>