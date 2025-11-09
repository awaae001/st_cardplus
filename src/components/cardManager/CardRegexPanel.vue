<template>
  <div class="card-regex-panel">
    <!-- 提示条 -->
    <div class="panel-notice">
      <Icon icon="ph:info-duotone" />
      <span>正在编辑角色卡「{{ character.name }}」的正则脚本</span>
    </div>

    <!-- 空状态 -->
    <div v-if="regexScripts.length === 0" class="empty-state">
      <el-empty description="当前角色卡未包含正则脚本">
        <div class="empty-actions">
          <el-button type="primary" @click="handleAddFromLibrary">
            <Icon icon="ph:plus-circle-duotone" />
            从正则库添加
          </el-button>
          <el-button @click="handleCreateNew">
            <Icon icon="ph:file-plus-duotone" />
            创建新脚本
          </el-button>
        </div>
      </el-empty>
    </div>

    <!-- 正则编辑器 -->
    <div v-else class="regex-editor-wrapper">
      <Splitpanes class="default-theme">
        <!-- 左侧：脚本列表 -->
        <Pane size="30" min-size="20" max-size="50">
          <div class="scripts-list-panel">
            <div class="scripts-list-header">
              <div class="scripts-count">
                <Icon icon="ph:list-bullets-duotone" />
                共 {{ regexScripts.length }} 个脚本
              </div>
              <el-dropdown @command="handleAddCommand">
                <el-button type="primary" size="small">
                  <Icon icon="ph:plus-bold" />
                  添加
                  <Icon icon="ph:caret-down-bold" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="new">创建新脚本</el-dropdown-item>
                    <el-dropdown-item command="library">从正则库添加</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <el-scrollbar class="scripts-scrollbar" max-height="calc(100vh - 250px)">
              <div class="scripts-list">
                <div
                  v-for="(script, index) in regexScripts"
                  :key="script.id"
                  class="script-item"
                  :class="{ 'is-active': selectedScriptIndex === index, 'is-disabled': script.disabled }"
                  @click="selectScript(index)"
                >
                  <div class="script-item-content">
                    <Icon
                      :icon="script.disabled ? 'ph:prohibit-duotone' : 'ph:code-duotone'"
                      class="script-icon"
                    />
                    <div class="script-info">
                      <div class="script-name">{{ script.scriptName || `脚本 ${index + 1}` }}</div>
                      <div class="script-find-regex">{{ truncateRegex(script.findRegex) }}</div>
                    </div>
                  </div>
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click.stop="handleDeleteScript(index)"
                  >
                    <Icon icon="ph:trash-duotone" />
                  </el-button>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </Pane>

        <!-- 右侧：脚本编辑器 -->
        <Pane size="70" min-size="50">
          <div class="script-editor-panel">
            <div v-if="selectedScriptIndex === null" class="editor-empty-state">
              <el-empty description="请选择一个脚本进行编辑" :image-size="100" />
            </div>
            <div v-else class="editor-content">
              <div class="content-panel-header">
                <h2 class="content-panel-title">
                  <Icon icon="ph:code-duotone" class="content-panel-icon" />
                  编辑: <span class="content-panel-text-highlight">{{ currentScriptRequired.scriptName || "未命名脚本" }}</span>
                </h2>
                <div class="editor-actions">
                  <el-button-group size="small">
                    <el-button type="danger" @click="handleDeleteScript(selectedScriptIndex)">
                      <Icon icon="ph:trash-duotone" />
                      删除
                    </el-button>
                  </el-button-group>
                </div>
              </div>

              <el-scrollbar class="editor-scrollbar" max-height="calc(100vh - 280px)">
                <div class="editor-form">
                  <el-form :model="currentScriptRequired" label-position="top">
                    <RegexEditorCore
                      v-model:script-name="currentScriptRequired.scriptName"
                      v-model:find-regex="currentScriptRequired.findRegex"
                      v-model:replace-string="currentScriptRequired.replaceString"
                      v-model:trim-strings="trimStringsText"
                      v-model:substitute-regex="currentScriptRequired.substituteRegex"
                    />

                    <RegexAdvancedSettings v-model="currentScriptRequired" />

                    <el-divider />

                    <!-- 测试面板 -->
                    <RegexSimulatorPanel
                      v-model:test-string="testString"
                      v-model:render-html="renderHtml"
                      v-model:user-macro-value="userMacroValue"
                      v-model:char-macro-value="charMacroValue"
                      :simulated-result="simulatedResult"
                    />
                  </el-form>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </Pane>
      </Splitpanes>
    </div>

    <!-- 正则脚本选择对话框 -->
    <RegexScriptSelectorDialog
      v-model="showRegexSelector"
      :default-selected-ids="selectedScriptIds"
      @confirm="handleAddScriptsFromLibrary"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElButton, ElEmpty, ElDropdown, ElDropdownMenu, ElDropdownItem, ElScrollbar, ElButtonGroup, ElForm, ElDivider, ElMessage, ElMessageBox } from 'element-plus';
import { Icon } from '@iconify/vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

import type { CharacterCardV3 } from '@/types/character-card-v3';
import type { SillyTavernRegexScript } from '@/composables/regex/types';
import RegexEditorCore from '@/components/regex/RegexEditorCore.vue';
import RegexAdvancedSettings from '@/components/regex/RegexAdvancedSettings.vue';
import RegexSimulatorPanel from '@/components/regex/RegexSimulatorPanel.vue';
import RegexScriptSelectorDialog from './RegexScriptSelectorDialog.vue';
import { useRegexSimulator } from '@/composables/regex/useRegexSimulator';
import { SUBSTITUTE_FIND_REGEX, type RegexScript } from '@/composables/regex/types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  character: CharacterCardV3;
}

interface Emits {
  (e: 'regexChanged'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showRegexSelector = ref(false);
const selectedScriptIndex = ref<number | null>(null);

// 模拟器状态
const testString = ref('测试文本');
const renderHtml = ref(false);
const userMacroValue = ref('User');
const charMacroValue = ref('Character');

// 计算属性：正则脚本列表
const regexScripts = computed(() => {
  if (!props.character.data.extensions) {
    props.character.data.extensions = {};
  }
  if (!props.character.data.extensions.regex_scripts) {
    props.character.data.extensions.regex_scripts = [];
  }
  return props.character.data.extensions.regex_scripts as SillyTavernRegexScript[];
});

// 当前选中的脚本（可空）
const currentScript = computed(() => {
  if (selectedScriptIndex.value === null) return null;
  return regexScripts.value[selectedScriptIndex.value] || null;
});

// 非空断言版本（用于模板绑定，模板层已保证 selectedScriptIndex !== null）
const currentScriptRequired = computed(() => {
  return (currentScript.value || ({} as SillyTavernRegexScript)) as SillyTavernRegexScript;
});

// trimStrings 的文本表示
const trimStringsText = computed({
  get: () => {
    if (!currentScript.value?.trimStrings) return '';
    return currentScript.value.trimStrings.join('\n');
  },
  set: (value: string) => {
    if (currentScript.value) {
      currentScript.value.trimStrings = value.split('\n').filter(s => s.trim() !== '');
      emit('regexChanged');
    }
  },
});

// 已选中的脚本 ID（用于选择对话框）
const selectedScriptIds = computed(() => {
  return regexScripts.value.map(s => s.id);
});

// 使用正则模拟器（新签名：单一脚本对象）
const simulatorScript = computed<RegexScript>(() => ({
  findRegex: currentScript.value?.findRegex || '',
  replaceString: currentScript.value?.replaceString || '',
  trimStrings: currentScript.value?.trimStrings || [],
  macros: {
    '{{user}}': userMacroValue.value,
    '{{char}}': charMacroValue.value,
  },
  substituteRegex: currentScript.value?.substituteRegex ?? SUBSTITUTE_FIND_REGEX.NONE,
}));

const { testString: simTestString, simulatedResult } = useRegexSimulator(simulatorScript);
// 将 testString 代理到外层使用的变量
watch(simTestString, (val) => { testString.value = val; });
watch(testString, (val) => { simTestString.value = val; });

// 方法
const selectScript = (index: number) => {
  selectedScriptIndex.value = index;
};

const truncateRegex = (regex: string) => {
  if (regex.length > 40) {
    return regex.substring(0, 40) + '...';
  }
  return regex;
};

const handleAddCommand = (command: string) => {
  if (command === 'new') {
    handleCreateNew();
  } else if (command === 'library') {
    handleAddFromLibrary();
  }
};

const handleCreateNew = () => {
  const newScript: SillyTavernRegexScript = {
    id: uuidv4(),
    scriptName: '新建脚本',
    findRegex: '',
    replaceString: '',
    trimStrings: [],
    placement: [],
    disabled: false,
  };

  regexScripts.value.push(newScript);
  selectedScriptIndex.value = regexScripts.value.length - 1;
  emit('regexChanged');

  ElMessage.success('新建脚本成功');
};

const handleAddFromLibrary = () => {
  showRegexSelector.value = true;
};

const handleAddScriptsFromLibrary = (scripts: SillyTavernRegexScript[]) => {
  // 深拷贝并移除 categoryId，追加到当前角色卡脚本列表
  const clones = scripts.map(s => ({
    id: s.id,
    scriptName: s.scriptName,
    findRegex: s.findRegex,
    replaceString: s.replaceString,
    trimStrings: s.trimStrings ?? [],
    placement: s.placement ?? [],
    disabled: s.disabled ?? false,
    markdownOnly: s.markdownOnly ?? false,
    promptOnly: s.promptOnly ?? false,
    runOnEdit: s.runOnEdit ?? false,
    substituteRegex: s.substituteRegex ?? SUBSTITUTE_FIND_REGEX.NONE,
    minDepth: s.minDepth ?? null,
    maxDepth: s.maxDepth ?? null,
  } as SillyTavernRegexScript));

  regexScripts.value.push(...clones);
  if (regexScripts.value.length > 0) {
    selectedScriptIndex.value = regexScripts.value.length - 1;
  }
  ElMessage.success(`已添加 ${clones.length} 个脚本`);
  emit('regexChanged');
};

const handleDeleteScript = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个脚本吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    regexScripts.value.splice(index, 1);
    if (selectedScriptIndex.value === index) {
      selectedScriptIndex.value = null;
    } else if (selectedScriptIndex.value !== null && selectedScriptIndex.value > index) {
      selectedScriptIndex.value--;
    }
    emit('regexChanged');
    ElMessage.success('删除成功');
  } catch {
    // 用户取消
  }
};

// 监听当前脚本的变化，触发保存
watch(
  () => currentScript.value,
  () => {
    if (currentScript.value) {
      emit('regexChanged');
    }
  },
  { deep: true }
);
</script>

<style scoped>
.card-regex-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.panel-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-color-primary-light-7);
  color: var(--el-color-primary);
  font-size: 14px;
  flex-shrink: 0;
}

.panel-notice .iconify {
  font-size: 18px;
}

.panel-notice span {
  flex: 1;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.regex-editor-wrapper {
  flex: 1;
  overflow: hidden;
}

.scripts-list-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
}

.scripts-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}

.scripts-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.scripts-scrollbar {
  flex: 1;
  padding: 8px;
}

.scripts-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.script-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background: var(--el-fill-color-extra-light);
}

.script-item:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color);
}

.script-item.is-active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.script-item.is-disabled {
  opacity: 0.6;
}

.script-item-content {
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.script-icon {
  font-size: 18px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.script-info {
  flex: 1;
  min-width: 0;
}

.script-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.script-find-regex {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.script-editor-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.editor-empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-extra-light);
  flex-shrink: 0;
}

.content-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.content-panel-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

.content-panel-text-highlight {
  color: var(--el-color-primary);
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.editor-scrollbar {
  flex: 1;
}

.editor-form {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}
</style>
