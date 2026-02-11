<template>
  <div class="card-regex-panel">
    <!-- 提示条 -->
    <div class="panel-notice">
      <Icon icon="ph:info-duotone" />
      <span>正在编辑角色卡「{{ character.name }}」的正则脚本</span>
    </div>

    <!-- 空状态 -->
    <div
      v-if="regexScripts.length === 0"
      class="empty-state"
    >
      <el-empty description="当前角色卡未包含正则脚本">
        <div class="empty-actions">
          <el-button
            type="primary"
            @click="handleAddFromLibrary"
          >
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
    <div
      v-else
      class="regex-editor-wrapper"
    >
      <!-- 桌面端 -->
      <div class="regex-layout regex-layout-desktop">
        <Splitpanes class="default-theme">
          <!-- 左侧：脚本列表 -->
          <Pane
            size="20"
            min-size="15"
            max-size="30"
          >
            <div class="scripts-list-panel">
              <div class="scripts-list-header">
                <div class="scripts-count">
                  <Icon icon="ph:list-bullets-duotone" />
                  共 {{ regexScripts.length }} 个脚本
                </div>
              </div>

              <el-scrollbar class="scripts-scrollbar">
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
          <Pane
            size="80"
            min-size="70"
          >
            <div class="script-editor-panel">
              <div
                v-if="selectedScriptIndex === null"
                class="editor-empty-state"
              >
                <el-empty
                  description="请选择一个脚本进行编辑"
                  :image-size="100"
                />
              </div>
              <div
                v-else
                class="editor-content"
              >
                <div class="content-panel-header">
                  <h2 class="content-panel-title">
                    <Icon
                      icon="ph:code-duotone"
                      class="content-panel-icon"
                    />
                    编辑:
                    <span class="content-panel-text-highlight">
                      {{ currentScriptRequired.scriptName || '未命名脚本' }}
                    </span>
                  </h2>
                  <div class="editor-actions">
                    <el-button-group size="small">
                      <el-button
                        type="danger"
                        @click="handleDeleteScript(selectedScriptIndex)"
                      >
                        <Icon icon="ph:trash-duotone" />
                        删除
                      </el-button>
                    </el-button-group>
                  </div>
                </div>

                <el-scrollbar class="editor-scrollbar">
                  <div class="editor-form">
                    <el-form
                      :model="currentScriptRequired"
                      label-position="top"
                    >
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

      <!-- 移动端：标签页布局 -->
      <div class="regex-layout regex-layout-mobile">
        <el-tabs
          v-model="mobileActiveTab"
          type="border-card"
          class="regex-mobile-tabs"
        >
          <el-tab-pane
            name="list"
            label="脚本列表"
          >
            <div class="scripts-list-panel-mobile">
              <el-scrollbar class="scripts-scrollbar">
                <div class="scripts-list">
                  <div
                    v-for="(script, index) in regexScripts"
                    :key="script.id"
                    class="script-item-mobile"
                    :class="{ 'is-active': selectedScriptIndex === index, 'is-disabled': script.disabled }"
                    @click="handleMobileSelectScript(index)"
                  >
                    <div class="script-item-content">
                      <Icon
                        :icon="script.disabled ? 'ph:prohibit-duotone' : 'ph:code-duotone'"
                        class="script-icon"
                      />
                      <div class="script-info">
                        <div class="script-name">{{ script.scriptName || `脚本 ${index + 1}` }}</div>
                        <div class="script-find-regex">{{ truncateRegex(script.findRegex, 40) }}</div>
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
          </el-tab-pane>
          <el-tab-pane
            name="editor"
            :label="selectedScriptIndex !== null ? currentScriptRequired.scriptName || '编辑中' : '编辑器'"
          >
            <div class="script-editor-panel-mobile">
              <div
                v-if="selectedScriptIndex === null"
                class="editor-empty-state"
              >
                <el-empty
                  description="请从脚本列表中选择一个脚本"
                  :image-size="80"
                />
              </div>
              <div
                v-else
                class="editor-content-mobile"
              >
                <div class="content-panel-header-mobile">
                  <h2 class="content-panel-title-mobile">
                    <Icon
                      icon="ph:code-duotone"
                      class="content-panel-icon"
                    />
                    {{ currentScriptRequired.scriptName || '未命名脚本' }}
                  </h2>
                  <div class="editor-actions-mobile">
                    <el-button
                      type="danger"
                      size="small"
                      @click="handleDeleteScript(selectedScriptIndex)"
                    >
                      <Icon icon="ph:trash-duotone" />
                      删除
                    </el-button>
                  </div>
                </div>

                <el-scrollbar class="editor-scrollbar-mobile">
                  <div class="editor-form">
                    <el-form
                      :model="currentScriptRequired"
                      label-position="top"
                    >
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
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 正则脚本选择对话框（从库添加） -->
    <RegexScriptSelectorDialog
      v-model="showRegexSelector"
      :default-selected-ids="selectedScriptIds"
      @confirm="handleAddScriptsFromLibrary"
    />

    <!-- 正则脚本选择对话框（替换） -->
    <RegexScriptSelectorDialog
      v-model="showReplaceSelector"
      @confirm="handleReplaceScriptsFromLibrary"
    />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import {
  ElButton,
  ElButtonGroup,
  ElDivider,
  ElEmpty,
  ElForm,
  ElMessage,
  ElMessageBox,
  ElScrollbar,
  ElTabPane,
  ElTabs,
} from 'element-plus';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { computed, ref, watch } from 'vue';

import RegexAdvancedSettings from '@/components/regex/RegexAdvancedSettings.vue';
import RegexEditorCore from '@/components/regex/RegexEditorCore.vue';
import RegexSimulatorPanel from '@/components/regex/RegexSimulatorPanel.vue';
import type { SillyTavernRegexScript } from '@/composables/regex/types';
import { SUBSTITUTE_FIND_REGEX, type RegexScript } from '@/composables/regex/types';
import { useRegexCollection } from '@/composables/regex/useRegexCollection';
import { useRegexSimulator } from '@/composables/regex/useRegexSimulator';
import type { CharacterCardV3 } from '@/types/character-card-v3';
import { v4 as uuidv4 } from 'uuid';
import RegexScriptSelectorDialog from '../components/RegexScriptSelectorDialog.vue';

interface Props {
  character: CharacterCardV3;
}

interface Emits {
  (e: 'regexChanged'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showRegexSelector = ref(false);
const showReplaceSelector = ref(false);
const selectedScriptIndex = ref<number | null>(null);

// 移动端状态
const mobileActiveTab = ref<'list' | 'editor'>('list');

// 移动端选择脚本
const handleMobileSelectScript = (index: number) => {
  selectedScriptIndex.value = index;
  mobileActiveTab.value = 'editor';
};

// 正则脚本库管理
const { handleImportFromCharacterCard } = useRegexCollection();

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
      currentScript.value.trimStrings = value.split('\n').filter((s) => s.trim() !== '');
      emit('regexChanged');
    }
  },
});

// 已选中的脚本 ID（用于选择对话框）
const selectedScriptIds = computed(() => {
  return regexScripts.value.map((s) => s.id);
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
watch(simTestString, (val) => {
  testString.value = val;
});
watch(testString, (val) => {
  simTestString.value = val;
});

// 方法
const selectScript = (index: number) => {
  selectedScriptIndex.value = index;
};

const truncateRegex = (regex: string, maxLength: number = 40) => {
  if (regex.length > maxLength) {
    return regex.substring(0, maxLength) + '...';
  }
  return regex;
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
  const clones = scripts.map(
    (s) =>
      ({
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
      }) as SillyTavernRegexScript
  );

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

// 发送到正则编辑器（副本）
const handleSendToRegexEditor = async () => {
  if (regexScripts.value.length === 0) {
    ElMessage.warning('当前角色卡没有正则脚本');
    return;
  }

  const characterId = props.character.id || 'unknown';
  const characterName = props.character.data.name || '未命名角色';

  try {
    const categoryId = await handleImportFromCharacterCard(regexScripts.value, characterId, characterName);

    if (categoryId) {
      ElMessage.success({
        message: `正则脚本已成功发送到正则编辑器！`,
        duration: 3000,
      });
    }
  } catch (error) {
    console.error('发送正则脚本失败:', error);
    ElMessage.error(`发送失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 从正则编辑器替换
const handleReplaceFromRegexEditor = () => {
  showReplaceSelector.value = true;
};

// 处理从正则编辑器替换脚本（完全替换）
const handleReplaceScriptsFromLibrary = async (scripts: SillyTavernRegexScript[]) => {
  if (scripts.length === 0) {
    ElMessage.warning('请至少选择一个脚本');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要用选中的 ${scripts.length} 个脚本替换当前所有内嵌正则脚本吗？此操作将清空当前的 ${regexScripts.value.length} 个脚本。`,
      '确认替换',
      {
        confirmButtonText: '确定替换',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 深拷贝并移除 categoryId
    const clones = scripts.map(
      (s) =>
        ({
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
        }) as SillyTavernRegexScript
    );

    // 完全替换
    regexScripts.value.splice(0, regexScripts.value.length, ...clones);

    // 选中第一个脚本
    if (regexScripts.value.length > 0) {
      selectedScriptIndex.value = 0;
    } else {
      selectedScriptIndex.value = null;
    }

    ElMessage.success(`已替换为 ${clones.length} 个脚本`);
    emit('regexChanged');
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

// 导出方法供父组件调用
defineExpose({
  handleCreateNew,
  handleAddFromLibrary,
  handleSendToRegexEditor,
  handleReplaceFromRegexEditor,
});
</script>

<style scoped>
@import '@/css/card-manager-panels.css';

.card-regex-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

@media (max-width: 1023px) {
  .empty-actions {
    flex-direction: column;
  }

  .empty-actions > .el-button + .el-button {
    margin-left: 0;
  }
}

.regex-editor-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 布局容器 */
.regex-layout {
  flex: 1;
  overflow: hidden;
  height: 100%;
  min-height: 0;
}

/* 桌面端布局 */
.regex-layout-desktop {
  display: flex;
  flex-direction: column;
}

.regex-layout-mobile {
  display: none;
}

@media (max-width: 1023px) {
  .regex-layout-desktop {
    display: none;
  }

  .regex-layout-mobile {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

.regex-editor-wrapper :deep(.splitpanes) {
  height: 100%;
}

.regex-editor-wrapper :deep(.splitpanes__pane) {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 移动端标签页 */
.regex-mobile-tabs {
  height: 100%;
}

.regex-mobile-tabs :deep(.el-tabs__content) {
  height: calc(100% - 48px);
  overflow: hidden;
}

.regex-mobile-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
}

/* 移动端脚本列表面板 */
.scripts-list-panel-mobile {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

/* 移动端脚本条目 */
.script-item-mobile {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background: var(--el-fill-color-extra-light);
  margin-bottom: 8px;
}

.script-item-mobile:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color);
}

.script-item-mobile.is-active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.script-item-mobile.is-disabled {
  opacity: 0.6;
}

/* 移动端编辑器面板 */
.script-editor-panel-mobile {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  overflow: hidden;
}

.editor-content-mobile {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-scrollbar-mobile {
  flex: 1;
  min-height: 0;
}

.scripts-list-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--el-bg-color);
  overflow: hidden;
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
  min-height: 0;
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
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  overflow: hidden;
}

.editor-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-scrollbar {
  flex: 1;
  min-height: 0;
}

.editor-form {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}
</style>
