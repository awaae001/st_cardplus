<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择要导出的正则脚本"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="regex-selector-container">
      <RegexScriptSelectorContent
        v-model:selected-ids="selectedScriptIds"
        :default-selected-ids="props.defaultSelectedIds"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="selectedScriptIds.length === 0"
          @click="handleConfirm"
        >
          确认选择 ({{ selectedScriptIds.length }})
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElDialog, ElButton } from 'element-plus';
import { useRegexCollection } from '@/composables/regex/useRegexCollection';
import RegexScriptSelectorContent from './RegexScriptSelectorContent.vue';
import type { SillyTavernRegexScript } from '@/composables/regex/types';

interface Props {
  modelValue: boolean;
  defaultSelectedIds?: string[]; // 默认选中的脚本ID列表
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', scripts: SillyTavernRegexScript[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  defaultSelectedIds: () => []
});

const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const { regexCollection } = useRegexCollection();
const selectedScriptIds = ref<string[]>([]);

// 确认选择
const handleConfirm = () => {
  // 根据选中的ID找到对应的脚本对象
  const selectedScripts: SillyTavernRegexScript[] = [];

  // 获取所有分类列表
  const categories = Object.values(regexCollection.value.categories)
    .filter(cat => cat.scripts.length > 0);

  for (const category of categories) {
    for (const script of category.scripts) {
      if (selectedScriptIds.value.includes(script.id)) {
        // 创建副本，移除 categoryId
        const { categoryId, ...scriptWithoutCategoryId } = script;
        selectedScripts.push(scriptWithoutCategoryId as SillyTavernRegexScript);
      }
    }
  }

  emit('confirm', selectedScripts);
  handleClose();
};

// 关闭对话框
const handleClose = () => {
  emit('update:modelValue', false);
};

// 监听对话框打开，初始化选中状态
watch(dialogVisible, (newValue) => {
  if (newValue) {
    // 使用默认选中的ID或者初始化为空数组
    selectedScriptIds.value = [...props.defaultSelectedIds];
  }
});
</script>

<style scoped>
.regex-selector-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>