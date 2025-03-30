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

    <draggable 
      v-model="form.skills" 
      handle=".drag-handle" 
      item-key="index"
      animation="200"
      ghost-class="ghost"
      chosen-class="chosen"
      style="display: flex;flex-wrap: wrap;"
    >
      <template #item="{ element: skill, index }">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="drag-handle" style="cursor: move; margin-bottom: 8px;">
            <Icon icon="material-symbols:drag-handle" width="20" height="20" />
          </div>
          <el-card class="mb-4 skill-card">
            <el-input v-model="skill.name" placeholder="技能名称" class="mb-2" />
            <el-input v-model="skill.description" type="textarea" :rows="2" placeholder="描述" class="mb极2" />
            <el-input v-model="skill.dialogExample" type="textarea" :rows="2" placeholder="对话示例" class="mb-2" />
            <el-input v-model="skill.behaviorExample" type="textarea" :rows="2" placeholder="行为示例" class="mb-2" />
            <div style="margin: 4px;"></div>
            <el-button type="danger" @click="removeSkill(index)" class="w-full">
              <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
              删除技能
            </el-button>
          </el-card>
        </el-col>
      </template>
    </draggable>

  </el-card>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { Icon } from "@iconify/vue";
import draggable from 'vuedraggable';

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
.ghost {
  opacity: 0.5;
  background: var(--el-color-primary-light-9);
}

.chosen {
  transform: scale(1.02);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

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
