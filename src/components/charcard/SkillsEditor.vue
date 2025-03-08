<template>
  <el-card class="mb-4">
    <div class="title-Btn-add">
      <h2 class="text-xl font-semibold mb-4">角色技能</h2>
      <div style="display: flex; gap: 8px;">
        <el-button type="primary" @click="addSkill" class="w-full" style="margin-left: 16px;">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加技能（卡片）
        </el-button>
        <el-button type="success" @click="exportSkills" title="导出技能">
          <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
        </el-button>
      </div>
    </div>
    <el-row :gutter="16">
      <el-col v-for="(skill, index) in form.skills" :key="index" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="mb-4 skill-card">
          <el-input v-model="skill.name" placeholder="技能名称" class="mb-2" />
          <el-input v-model="skill.description" type="textarea" :rows="2" placeholder="描述" class="mb-2" />
          <el-input v-model="skill.dialogExample" type="textarea" :rows="2" placeholder="对话示例" class="mb-2" />
          <el-input v-model="skill.behaviorExample" type="textarea" :rows="2" placeholder="行为示例" class="mb-2" />
          <div style="margin: 4px;"></div>
          <el-button type="danger" @click="removeSkill(index)" class="w-full">
            <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
            删除技能
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { Icon } from "@iconify/vue";

interface Props {
  form: {
    skills: {
      name: string;
      description: string;
      dialogExample: string;
      behaviorExample: string;
    }[];
  };
  addSkill: () => void;
  removeSkill: (index: number) => void;
  exportSkills: () => Promise<void>;
}

const props = defineProps<Props>();
const form = ref(props.form);

watch(() => props.form, (newVal) => {
  form.value = newVal;
}, { deep: true });
</script>

<style scoped>
.skill-card {
  padding: 4px;
}

.title-Btn-add {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
}
</style>
