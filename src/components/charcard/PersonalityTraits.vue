<template>
  <el-card class="mb-4">
    <div class="title-Btn-add">
      <h2 class="text-xl font-semibold mb-4">性格特质</h2>
      <div style="display: flex; gap: 8px;">
        <el-button type="primary" @click="addTrait" class="w-full" style="margin-left: 16px;">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加特质（卡片）
        </el-button>
        <el-button type="success" @click="exportTraits" title="导出性格特质">
          <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
        </el-button>
      </div>
    </div>
    <el-row :gutter="16">
      <el-col v-for="(trait, index) in form.traits" :key="index" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="mb-4 trait-card">
          <el-input v-model="trait.name" placeholder="特质名称" class="mb-2" />
          <el-input v-model="trait.description" type="textarea" :rows="2" placeholder="描述" class="mb-2" />
          <el-input v-model="trait.dialogueExamples" type="textarea" :rows="2" placeholder="对话示例" class="mb-2" />
          <el-input v-model="trait.behaviorExamples" type="textarea" :rows="2" placeholder="行为示例" class="mb-2" />
          <div style="margin: 4px;"></div>
          <el-button type="danger" @click="removeTrait(index)" class="w-full">
            <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
            删除特质
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
    traits: {
      name: string;
      description: string;
      dialogueExamples: string;
      behaviorExamples: string;
    }[];
  };
  addTrait: () => void;
  removeTrait: (index: number) => void;
  exportTraits: () => Promise<void>;
}

const props = defineProps<Props>();
const form = ref(props.form);

watch(() => props.form, (newVal) => {
  form.value = newVal;
}, { deep: true });
</script>

<style scoped>
/* 使用 Tailwind CSS 进行样式控制 */
.section-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-container>* {
  flex: 1;
}

.ps-text {
  font-style: italic;
  color: #373737;
  font-weight: 300;
}

.title-Btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.title-Btn-add {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
