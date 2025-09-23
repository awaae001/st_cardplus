<template>
  <el-form :model="character.data" label-position="top" class="basic-info-form">
    <el-form-item label="角色名">
      <el-input v-model="character.data.name" placeholder="请输入角色名" />
    </el-form-item>

    <el-form-item label="角色描述">
      <el-input v-model="character.data.description" type="textarea" :rows="5" placeholder="角色的详细描述" />
    </el-form-item>

    <el-form-item label="开场白">
      <el-input v-model="character.data.first_mes" type="textarea" :rows="3" placeholder="角色的第一句话" />
    </el-form-item>

    <el-collapse v-model="activeNames">
      <el-collapse-item title="高级设定" name="1">
        <div class="collapsed-form-items">
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
            <el-input v-model="character.data.post_history_instructions" type="textarea" :rows="4" placeholder="在生成回复时追加到历史记录后的指令" />
          </el-form-item>
          
          <el-form-item label="作者注">
            <el-input v-model="character.data.creator_notes" type="textarea" :rows="3" placeholder="创作者的内部备注" />
          </el-form-item>

          <el-form-item label="作者">
            <el-input v-model="character.data.creator" placeholder="请输入作者名" />
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
            />
          </el-form-item>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElSelect, ElCollapse, ElCollapseItem } from 'element-plus';
import type { CharacterCardV3 } from '@/types/character-card-v3';

defineProps<{
  character: CharacterCardV3;
}>();

const activeNames = ref([]);
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

.collapsed-form-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
}
</style>