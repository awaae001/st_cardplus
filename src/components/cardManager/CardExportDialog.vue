<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`导出角色卡 - ${cardName}`"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="export-config-container">
      <!-- 当前正则状态 -->
      <div class="regex-status-info">
        <Icon icon="ph:info-duotone" class="info-icon" />
        <el-text type="info" size="small">
          当前角色卡包含 <strong>{{ currentRegexCount }}</strong> 个正则脚本
        </el-text>
      </div>

      <!-- 导出选项 -->
      <div class="export-options-section">
        <el-text class="section-title">请选择正则处理方式：</el-text>

        <el-radio-group v-model="selectedOption" class="export-options">
          <el-radio value="bind-new" class="export-option">
            <div class="option-content">
              <Icon icon="ph:link-duotone" class="option-icon" />
              <div class="option-text">
                <span class="option-label">绑定新正则</span>
                <span class="option-description">从正则库中选择要导出的脚本</span>
              </div>
            </div>
          </el-radio>

          <el-radio value="use-builtin" :disabled="currentRegexCount === 0" class="export-option">
            <div class="option-content">
              <Icon icon="ph:archive-duotone" class="option-icon" />
              <div class="option-text">
                <span class="option-label">使用内置正则</span>
                <span class="option-description">
                  {{ currentRegexCount === 0 ? '当前卡片没有正则脚本' : '保持卡片现有的正则脚本' }}
                </span>
              </div>
            </div>
          </el-radio>

          <el-radio value="no-update" class="export-option">
            <div class="option-content">
              <Icon icon="ph:equals-duotone" class="option-icon" />
              <div class="option-text">
                <span class="option-label">不更新正则</span>
                <span class="option-description">保持卡片现有状态不变</span>
              </div>
            </div>
          </el-radio>

          <el-radio value="no-regex" class="export-option">
            <div class="option-content">
              <Icon icon="ph:x-circle-duotone" class="option-icon" />
              <div class="option-text">
                <span class="option-label">不带正则导出</span>
                <span class="option-description">移除所有正则脚本后导出</span>
              </div>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 正则选择区域（仅在选择"绑定新正则"时显示） -->
      <el-collapse-transition>
        <div v-show="selectedOption === 'bind-new'" class="regex-selector-section">
          <el-divider />
          <RegexScriptSelectorContent
            v-model:selected-ids="selectedRegexIds"
            :default-selected-ids="defaultSelectedRegexIds"
          />
        </div>
      </el-collapse-transition>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="isConfirmDisabled"
          @click="handleConfirm"
        >
          <Icon icon="ph:export-duotone" />
          确认导出
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElDialog, ElRadioGroup, ElRadio, ElButton, ElText, ElDivider, ElCollapseTransition } from 'element-plus';
import { Icon } from '@iconify/vue';
import RegexScriptSelectorContent from './RegexScriptSelectorContent.vue';
import type { CharacterCardV3 } from '@/types/character-card-v3';
import type { SillyTavernRegexScript } from '@/composables/regex/types';

export type ExportRegexOption = 'bind-new' | 'use-builtin' | 'no-update' | 'no-regex';

interface Props {
  modelValue: boolean;
  characterData: CharacterCardV3;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', option: ExportRegexOption, selectedScripts?: SillyTavernRegexScript[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 角色卡名称
const cardName = computed(() => {
  return props.characterData.data?.name || props.characterData.name || '未命名角色';
});

// 当前正则脚本数量
const currentRegexCount = computed(() => {
  const scripts = props.characterData.data?.extensions?.regex_scripts || [];
  return scripts.length;
});

// 默认选中的正则脚本ID
const defaultSelectedRegexIds = computed(() => {
  const scripts = props.characterData.data?.extensions?.regex_scripts || [];
  return scripts.map((s: SillyTavernRegexScript) => s.id);
});

// 选中的导出选项
const selectedOption = ref<ExportRegexOption>('use-builtin');
const selectedRegexIds = ref<string[]>([]);

// 确认按钮是否禁用
const isConfirmDisabled = computed(() => {
  // 如果选择"绑定新正则"但没有选择任何脚本，则禁用
  if (selectedOption.value === 'bind-new' && selectedRegexIds.value.length === 0) {
    return true;
  }
  return false;
});

// 确认导出
const handleConfirm = () => {
  if (selectedOption.value === 'bind-new') {
    // 需要返回选中的脚本，由父组件去正则库查询完整数据
    emit('confirm', selectedOption.value, selectedRegexIds.value as any);
  } else {
    emit('confirm', selectedOption.value);
  }
  handleClose();
};

// 关闭对话框
const handleClose = () => {
  emit('update:modelValue', false);
};

// 监听对话框打开，初始化选项
watch(dialogVisible, (newValue) => {
  if (newValue) {
    // 智能预选：如果有正则就默认使用内置，否则默认绑定新正则
    selectedOption.value = currentRegexCount.value > 0 ? 'use-builtin' : 'bind-new';
    selectedRegexIds.value = [...defaultSelectedRegexIds.value];
  }
});
</script>

<style scoped>
.export-config-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.regex-status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: var(--el-fill-color-extra-light);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.info-icon {
  font-size: 20px;
  color: var(--el-color-info);
  flex-shrink: 0;
}

.export-options-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.export-option {
  width: 100%;
  margin: 0;
  padding: 30px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background-color: var(--el-fill-color-blank);
  transition: all 0.2s;
}

.export-option:hover:not(.is-disabled) {
  border-color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}

.export-option.is-checked {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.export-option.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.option-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.option-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.option-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.regex-selector-section {
  padding: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .export-option {
    padding: 30px;
  }

  .option-icon {
    font-size: 20px;
  }

  .option-label {
    font-size: 13px;
  }

  .option-description {
    font-size: 11px;
  }
}
</style>
