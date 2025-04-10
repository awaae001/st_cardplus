<template>
  <el-card class="mb-4">
    <div class="title-Btn-add">
      <h2 class="text-xl font-semibold mb-4">服装设定</h2>
      <div style="display: flex; gap: 8px;">
        <el-button type="primary" @click="addAttire" class="w-full" style="margin-left: 16px;">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加套装（卡片）
        </el-button>
        <el-button type="success" @click="exportAttires" title="导出服装设定">
          <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
        </el-button>
      </div>
    </div>

    <draggable 
      v-model="form.attires" 
      handle=".drag-handle" 
      item-key="index"
      animation="200"
      ghost-class="ghost"
      chosen-class="chosen"
      style="display: flex;flex-wrap: wrap;"
    >
      <template #item="{ element: attire, index }">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="drag-handle" style="cursor: move; margin-bottom: 8px;">
            <Icon icon="material-symbols:drag-handle" width="20" height="20" />
          </div>
          <el-card class="mb-4 attire-card">
            <el-input v-model="attire.name" placeholder="套装名称" class="mb-2" />
            <el-input v-model="attire.description" type="textarea" :rows="2" placeholder="套装描述" class="mb-2" />
            <el-input v-model="attire.tops" placeholder="上衣" class="mb-2" />
            <el-input v-model="attire.bottoms" placeholder="下装" class="mb-2" />
            <el-input v-model="attire.shoes" placeholder="鞋子" class="mb-2" />
            <el-input v-model="attire.socks" placeholder="袜子" class="mb-2" />
            <el-input v-model="attire.underwears" placeholder="内衣" class="mb-2" />
            <el-input type="textarea" :rows="5" v-model="attire.accessories" placeholder="配饰 · 自动分组，一行一条" class="mb-2" />
            <div style="margin: 4px;"></div>
            <el-button type="danger" @click="removeAttire(index)" class="w-full">
              <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
              删除套装
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
    attires: {
      name: string;
      description: string;
      tops: string;
      bottoms: string;
      shoes: string;
      socks: string;
      underwears: string;
      accessories: string;
    }[];
  };
  addAttire: () => void;
  removeAttire: (index: number) => void;
  exportAttires: () => Promise<void>;
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
