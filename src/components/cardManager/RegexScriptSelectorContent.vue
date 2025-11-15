<template>
  <div class="regex-selector-content">
    <div class="selector-header">
      <el-text type="info" size="small">
        从正则编辑器中选择要导出到角色卡的正则脚本
      </el-text>
      <div class="selector-actions">
        <el-button size="small" @click="handleSelectAll">全选</el-button>
        <el-button size="small" @click="handleDeselectAll">取消全选</el-button>
      </div>
    </div>

    <el-scrollbar v-loading="isLoading" max-height="300px">
      <el-empty v-if="!isLoading && categories.length === 0" description="暂无可用的正则脚本">
        <el-button type="primary" size="small" @click="handleGoToRegexEditor">
          前往正则编辑器
        </el-button>
      </el-empty>

      <div v-else class="regex-categories-list">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-section"
        >
          <div class="category-header">
            <div class="category-title">
              <Icon icon="ph:folder-duotone" class="category-icon" />
              <span class="category-name">{{ category.name }}</span>
              <el-tag v-if="category.metadata?.source === 'character-card'" size="small" type="primary">
                来自角色卡
              </el-tag>
            </div>
            <el-tag size="small">{{ category.scripts.length }} 个脚本</el-tag>
          </div>

          <el-checkbox-group v-model="internalSelectedIds" class="scripts-list">
            <el-checkbox
              v-for="script in category.scripts"
              :key="script.id"
              :label="script.id"
              class="script-checkbox"
            >
              <div class="script-item">
                <Icon icon="ph:file-code-duotone" class="script-icon" />
                <span class="script-name">{{ script.scriptName }}</span>
                <el-tag v-if="script.disabled" size="small" type="info">禁用</el-tag>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </el-scrollbar>

    <div class="selector-footer">
      <el-text size="small" type="info">
        已选择 {{ internalSelectedIds.length }} 个正则脚本
      </el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElScrollbar, ElButton, ElTag, ElEmpty, ElCheckbox, ElCheckboxGroup, ElText } from 'element-plus';
import { Icon } from '@iconify/vue';
import { useRegexCollection } from '@/composables/regex/useRegexCollection';
import { useRouter } from 'vue-router';
import type { RegexCategory } from '@/composables/regex/types';

interface Props {
  selectedIds?: string[]; // v-model 绑定的选中ID列表
  defaultSelectedIds?: string[]; // 默认选中的脚本ID列表
}

interface Emits {
  (e: 'update:selectedIds', value: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: () => [],
  defaultSelectedIds: () => []
});

const emit = defineEmits<Emits>();
const router = useRouter();

const { regexCollection } = useRegexCollection();
const isLoading = ref(false);

// 内部选中状态
const internalSelectedIds = computed({
  get: () => props.selectedIds,
  set: (value) => emit('update:selectedIds', value)
});

// 获取所有分类列表
const categories = computed<RegexCategory[]>(() => {
  return Object.values(regexCollection.value.categories)
    .filter(cat => cat.scripts.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

// 获取所有脚本的ID
const allScriptIds = computed(() => {
  return categories.value.flatMap(cat => cat.scripts.map(s => s.id));
});

// 全选
const handleSelectAll = () => {
  emit('update:selectedIds', [...allScriptIds.value]);
};

// 取消全选
const handleDeselectAll = () => {
  emit('update:selectedIds', []);
};

// 前往正则编辑器页面
const handleGoToRegexEditor = () => {
  router.push('/regex-editor');
};

// 初始化时设置默认选中
watch(() => props.defaultSelectedIds, (newIds) => {
  if (newIds.length > 0 && internalSelectedIds.value.length === 0) {
    emit('update:selectedIds', [...newIds]);
  }
}, { immediate: true });
</script>

<style scoped>
.regex-selector-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.selector-actions {
  display: flex;
  gap: 8px;
}

.regex-categories-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.category-section {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 12px;
  background-color: var(--el-fill-color-extra-light);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.scripts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.script-checkbox {
  width: 100%;
  margin: 0;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.script-checkbox:hover {
  background-color: var(--el-fill-color-light);
}

.script-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.script-icon {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.script-name {
  flex: 1;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.selector-footer {
  padding: 8px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  text-align: center;
}
</style>
