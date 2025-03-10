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

      <draggable v-model="form.traits" handle=".drag-handle" item-key="index" 
      style="display: flex;flex-wrap: wrap;">
        <template #item="{ element: trait, index }">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="drag-handle" style="cursor: move; margin-bottom: 8px;">
              <Icon icon="material-symbols:drag-handle" width="20" height="20" />
            </div>
            <el-card class="mb-4 trait-card">
              <el-input v-model="trait.name" placeholder="特质名称" class="mb-2" />
              <el-input v-model="trait.description" type="textarea" :rows="4" placeholder="描述" class="mb-2" />

              <div style="margin-top: 4px;"></div>

              <div v-for="(_, i) in trait.dialogueExamples" :key="i" class="cardInput">
                <el-input v-model="trait.dialogueExamples[i]" type="textarea" :rows="2"
                  :placeholder="`对话示例 ${i + 1}`" />
                <el-button @click="removeDialogueExample(index, i)" size="small" class="mt-1">
                  <Icon icon="material-symbols:delete-outline" width="18" height="18" />
                </el-button>
              </div>
              <el-button type="primary" @click="addDialogueExample(index)" size="small" class="mb-4"
                style="width: 100%; margin-top: 4px;">
                添加对话示例
              </el-button>

              <el-divider border-style="dashed" />

              <div v-for="(_, i) in trait.behaviorExamples" :key="i" class="cardInput">
                <el-input v-model="trait.behaviorExamples[i]" type="textarea" :rows="2"
                  :placeholder="`行为示例 ${i + 1}`" />
                <el-button @click="removeBehaviorExample(index, i)" size="small" class="mt-1">
                  <Icon icon="material-symbols:delete-outline" width="18" height="18" />
                </el-button>
              </div>
              <el-button type="primary" @click="addBehaviorExample(index)" size="small" class="mb-4"
                style="width: 100%; margin-top: 4px;">
                添加行为示例
              </el-button>

              <div style="margin: 4px;"></div>
              <el-button type="danger" @click="removeTrait(index)" class="w-full">
                <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
                删除特质
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
    traits: {
      name: string;
      description: string;
      dialogueExamples: string[];
      behaviorExamples: string[];
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

const addDialogueExample = (traitIndex: number) => {
  form.value.traits[traitIndex].dialogueExamples.push('');
};

const removeDialogueExample = (traitIndex: number, exampleIndex: number) => {
  form.value.traits[traitIndex].dialogueExamples.splice(exampleIndex, 1);
};

const addBehaviorExample = (traitIndex: number) => {
  form.value.traits[traitIndex].behaviorExamples.push('');
};

const removeBehaviorExample = (traitIndex: number, exampleIndex: number) => {
  form.value.traits[traitIndex].behaviorExamples.splice(exampleIndex, 1);
};
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

.cardInput {
  display: flex;
  align-items: flex-start;
}
</style>
