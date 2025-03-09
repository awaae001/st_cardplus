<template>
  <el-card class="mb-4">
    <div class="title-Btn-add">
      <h2 class="text-xl font-semibold mb-4">人际关系</h2>
      <div style="display: flex; gap: 8px;">
        <el-button type="primary" @click="addRelationship" class="w-full" style="margin-left: 16px;">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加关系（卡片）
        </el-button>
        <el-button type="success" @click="exportRelationships" title="导出人际关系">
          <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
        </el-button>
      </div>
    </div>
    <el-row :gutter="16">
      <el-col v-for="(relationship, index) in form.relationships" :key="index" :xs="24" :sm="12" :md="8" :lg="6">
        <el-card class="mb-4 relationship-card">
          <el-input v-model="relationship.name" placeholder="角色名称" class="mb-2" />
          <el-input v-model="relationship.description" type="textarea" :rows="2" placeholder="关系描述" class="mb-2" />
          <el-input v-model="relationship.features" type="textarea" :rows="2" placeholder="人物特征" class="mb-2" />
          <div style="margin-top: 6px;"></div>
          <div v-for="(_, i) in relationship.dialogueExamples" :key="i" class="mb-2">
            <div class="flex gap-2">
              <el-divider border-style="dashed" />
              <el-input v-model="relationship.dialogueExamples[i]" type="textarea" :rows="3"
                :placeholder="`对话示例 ${i + 1}`" class="flex-1" />
              <div style="margin-top: 4px;"></div>
              <el-popconfirm title="删除此示例？" confirm-button-text="确定" cancel-button-text="取消" icon-color="red"
                @confirm="relationship.dialogueExamples.splice(i, 1)">
                <template #reference>
                  <el-button title="删除此对话示例" style="margin-bottom: 4px; width: 100%;">
                    <Icon icon="material-symbols:delete-outline" width="18" height="18" />
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 4px;">
            <el-popconfirm title="删除此关系？" confirm-button-text="确定" cancel-button-text="取消"
              icon-color="red" @confirm="removeRelationship(index)">
              <template #reference>
                <el-button type="danger" class="w-full">
                  <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
                  删除关系
                </el-button>
              </template>
            </el-popconfirm>
            <el-button @click="relationship.dialogueExamples.push('')" class="w-full mb-2">
              <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18" />
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';
import { Icon } from "@iconify/vue";

interface Props {
  readonly form: {
    readonly relationships: {
      name: string;
      description: string;
      features: string;
      dialogueExamples: string[];
    }[];
  };
  readonly addRelationship: () => void;
  readonly removeRelationship: (index: number) => void;
  readonly exportRelationships: () => Promise<void>;
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
