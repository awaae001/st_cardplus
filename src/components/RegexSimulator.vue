<template>
  <div class="regex-simulator-container">
    <!-- Mobile Layout -->
    <div class="regex-mobile-layout">
      <el-tabs v-model="activeTab" type="border-card" class="regex-tabs-mobile">
        <el-tab-pane name="list" class="regex-tab-pane">
          <template #label>
            <span class="regex-tab-label">
              <Icon icon="ph:list-bullets-duotone" />
              <span>脚本列表</span>
            </span>
          </template>
          <RegexScriptList :scripts="importedScripts" v-model="selectedScriptId" @update:model-value="handleSelectScript"
            @create-script="handleCreateScript" @rename-script="handleRenameScript"
            @delete-script="handleDeleteScript" @export-script="handleExportScript" />
        </el-tab-pane>
        <el-tab-pane name="editor" class="regex-tab-pane" :disabled="!selectedScriptId">
          <template #label>
            <span class="regex-tab-label">
              <Icon icon="ph:note-pencil-duotone" />
              <span class="regex-tab-text-truncated">
                {{ formState.scriptName || '编辑脚本' }}
              </span>
            </span>
          </template>
          <div v-if="selectedScriptId" class="main-editor-panel">
            <RegexHeader @import="handleFileImport" @export="handleExport" />
            <div class="editor-content">
              <el-form :model="formState" label-width="120px" label-position="top">
                <RegexEditorCore v-model:script-name="formState.scriptName" v-model:find-regex="formState.findRegex"
                  v-model:replace-string="formState.replaceString" v-model:trim-strings="trimStrings" />
                <SmartRegexGenerator v-model:input-text="smartInputText"
                  @regex-generated="handleSmartRegexGenerated" />
                <RegexSimulatorPanel v-model:test-string="testString" v-model:render-html="renderHtml"
                  v-model:user-macro-value="userMacroValue" v-model:char-macro-value="charMacroValue"
                  :simulated-result="simulatedResult" />
                <RegexAdvancedSettings v-model="formState" />
              </el-form>
            </div>
          </div>
          <div v-else class="welcome-screen">
            <Icon icon="ph:files-duotone" class="welcome-icon" />
            <h2 class="welcome-title">欢迎使用正则编辑器</h2>
            <p class="welcome-text">从左侧列表选择一个脚本开始编辑，或创建一个新脚本。</p>
            <el-button type="primary" @click="handleCreateScript">
              <Icon icon="ph:plus-circle-duotone" style="margin-right: 8px;" />
              创建新脚本
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Desktop Layout -->
    <div class="regex-desktop-layout">
      <Splitpanes class="default-theme" push-other-panes style="height: 100%">
        <Pane size="20" min-size="15" max-size="35">
          <RegexScriptList :scripts="importedScripts" v-model="selectedScriptId"
            @update:model-value="loadSelectedScript" @create-script="handleCreateScript"
            @rename-script="handleRenameScript" @delete-script="handleDeleteScript"
            @export-script="handleExportScript" />
        </Pane>
        <Pane size="80" min-size="40">
          <div v-if="selectedScriptId" class="main-editor-panel">
            <RegexHeader @import="handleFileImport" @export="handleExport" />
            <div class="editor-content">
              <el-form :model="formState" label-width="120px" label-position="top">
                <RegexEditorCore v-model:script-name="formState.scriptName" v-model:find-regex="formState.findRegex"
                  v-model:replace-string="formState.replaceString" v-model:trim-strings="trimStrings"
                  v-model:substitute-regex="formState.substituteRegex" />
                <SmartRegexGenerator v-model:input-text="smartInputText"
                  @regex-generated="handleSmartRegexGenerated" />
                <RegexSimulatorPanel v-model:test-string="testString" v-model:render-html="renderHtml"
                  v-model:user-macro-value="userMacroValue" v-model:char-macro-value="charMacroValue"
                  :simulated-result="simulatedResult" />
                <RegexAdvancedSettings v-model="formState" />
              </el-form>
            </div>
          </div>
          <div v-else class="welcome-screen">
            <Icon icon="ph:files-duotone" class="welcome-icon" />
            <h2 class="welcome-title">欢迎使用正则编辑器</h2>
            <p class="welcome-text">从左侧列表选择一个脚本开始编辑，或创建一个新脚本。</p>
            <el-button type="primary" @click="handleCreateScript">
              <Icon icon="ph:plus-circle-duotone" style="margin-right: 8px;" />
              创建新脚本
            </el-button>
          </div>
        </Pane>
      </Splitpanes>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { ElMessage, ElForm, ElMessageBox, ElTabs, ElTabPane } from 'element-plus';
import { Icon } from '@iconify/vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useRegexSimulator } from '@/composables/regex/useRegexSimulator';
import { type SillyTavernRegexScript } from '@/composables/regex/types';
import { useRegexPersistence } from '@/composables/regex/useRegexPersistence';

import RegexHeader from './regex/RegexHeader.vue';
import RegexScriptList from './regex/RegexScriptList.vue';
import RegexEditorCore from './regex/RegexEditorCore.vue';
import SmartRegexGenerator from './regex/SmartRegexGenerator.vue';
import RegexSimulatorPanel from './regex/RegexSimulatorPanel.vue';
import RegexAdvancedSettings from './regex/RegexAdvancedSettings.vue';

const activeTab = ref('list');
const importedScripts = ref<SillyTavernRegexScript[]>([]);
const selectedScriptId = ref<string | null>(null);

const createDefaultScript = (): SillyTavernRegexScript => ({
  id: `new-script-${Date.now()}`,
  scriptName: '新规则',
  findRegex: '',
  replaceString: '',
  trimStrings: [],
  placement: [],
  disabled: false,
  markdownOnly: false,
  promptOnly: false,
  runOnEdit: false,
  substituteRegex: 0,
  minDepth: null,
  maxDepth: null,
});

const formState = ref<SillyTavernRegexScript>(createDefaultScript());
const trimStrings = ref('');
const smartInputText = ref('');
const renderHtml = ref(false);

const handleFileImport = (jsonData: any) => {
  const scriptsToParse = Array.isArray(jsonData) ? jsonData : [jsonData];

  const newScripts = scriptsToParse.map((script: any, index: number) => ({
    ...createDefaultScript(),
    ...script,
    // Always generate a new unique ID on import to avoid conflicts
    id: `imported-script-${Date.now()}-${index}`,
    scriptName: script.scriptName || `导入的规则 ${index + 1}`,
  }));

  if (newScripts.length > 0) {
    importedScripts.value.push(...newScripts);

    // Select the first of the newly imported scripts
    selectedScriptId.value = newScripts[0].id;
    loadSelectedScript();
    activeTab.value = 'editor';

    const message = newScripts.length === 1
      ? '成功追加导入1条规则'
      : `成功追加导入 ${newScripts.length} 条规则`;
    ElMessage.success(message);
  } else {
    ElMessage.warning('JSON文件不包含有效规则 ');
  }
};

const loadSelectedScript = () => {
  if (!selectedScriptId.value) {
    formState.value = createDefaultScript();
    trimStrings.value = '';
    activeTab.value = 'list';
    return;
  };
  const script = importedScripts.value.find(s => s.id === selectedScriptId.value);
  if (script) {
    Object.assign(formState.value, createDefaultScript(), script);
    trimStrings.value = (script.trimStrings || []).join('\n');
  }
};

const handleSelectScript = (scriptId: string) => {
  selectedScriptId.value = scriptId;
  loadSelectedScript();
  activeTab.value = 'editor';
}

const handleExport = () => {
  try {
    const scriptToExport = { ...formState.value };
    scriptToExport.trimStrings = trimStrings.value.split('\n').filter(s => s.length > 0);

    if (scriptToExport.minDepth === null) delete scriptToExport.minDepth;
    if (scriptToExport.maxDepth === null) delete scriptToExport.maxDepth;

    const jsonString = JSON.stringify(scriptToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formState.value.scriptName.replace(/[\s./\\?*]/g, '_') || 'regex-script'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功!');
  } catch (error) {
    ElMessage.error('导出失败!');
    console.error(error);
  }
};

const handleCreateScript = () => {
  const newScript = createDefaultScript();
  newScript.scriptName = `新规则 ${importedScripts.value.length + 1}`;
  importedScripts.value.push(newScript);
  selectedScriptId.value = newScript.id;
  loadSelectedScript();
  activeTab.value = 'editor';
  ElMessage.success('已创建新脚本');
};

const handleExportScript = (scriptId: string) => {
  const scriptToExport = importedScripts.value.find(s => s.id === scriptId);
  if (!scriptToExport) {
    ElMessage.error('找不到要导出的脚本');
    return;
  }

  try {
    // Create a clean copy for export
    const cleanScript = { ...scriptToExport };
    
    // Remove runtime properties if any (like the id we might not want to be static)
    // delete cleanScript.id;

    const jsonString = JSON.stringify(cleanScript, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanScript.scriptName.replace(/[\s./\\?*]/g, '_') || 'regex-script'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success(`脚本 "${cleanScript.scriptName}" 导出成功!`);
  } catch (error) {
    ElMessage.error('导出失败!');
    console.error(error);
  }
};

const handleRenameScript = async (scriptId: string) => {
  const script = importedScripts.value.find(s => s.id === scriptId);
  if (!script) return;

  try {
    const { value } = await ElMessageBox.prompt('请输入新的脚本名称', '重命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: script.scriptName,
      inputValidator: (val) => !!val || '名称不能为空',
    });
    script.scriptName = value;
    if (script.id === selectedScriptId.value) {
      formState.value.scriptName = value;
    }
    ElMessage.success('重命名成功');
  } catch {
    // Cancelled
  }
};

const handleDeleteScript = async (scriptId: string) => {
  const index = importedScripts.value.findIndex(s => s.id === scriptId);
  if (index === -1) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除脚本 "${importedScripts.value[index].scriptName}" 吗？此操作不可撤销。`,
      '警告',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    importedScripts.value.splice(index, 1);

    if (selectedScriptId.value === scriptId) {
      if (importedScripts.value.length > 0) {
        const newIndex = Math.max(0, index - 1);
        selectedScriptId.value = importedScripts.value[newIndex].id;
      } else {
        selectedScriptId.value = null;
        formState.value = createDefaultScript();
      }
      loadSelectedScript();
    }
    ElMessage.success('脚本已删除');
  } catch {
    // Cancelled
  }
};

const userMacroValue = ref('测试用户');
const charMacroValue = ref('测试角色');

const macros = computed(() => ({
  '{{user}}': userMacroValue.value,
  '{{char}}': charMacroValue.value,
}));

const regexScript = computed(() => ({
  findRegex: formState.value.findRegex,
  replaceString: formState.value.replaceString,
  macros: macros.value,
  trimStrings: trimStrings.value.split('\n').filter(s => s.length > 0),
  substituteRegex: formState.value.substituteRegex ?? 0,
}));

const { testString, simulatedResult } = useRegexSimulator(regexScript);

const handleSmartRegexGenerated = ({ regex, replaceString }: { regex: string, replaceString: string }) => {
  formState.value.findRegex = regex;
  formState.value.replaceString = replaceString;
  testString.value = smartInputText.value;
  ElMessage.success('已自动生成正则表达式和替换字符串！');
};

const { loadState } = useRegexPersistence(
  {
    formState,
    testString,
    smartInputText,
    userMacroValue,
    charMacroValue,
    renderHtml,
    trimStrings,
  },
  createDefaultScript
);

onMounted(() => {
  loadState();
});
</script>

<style scoped>
.regex-simulator-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.main-editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-page);
}

.editor-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.regex-mobile-layout {
  display: none;
}

.regex-desktop-layout {
  display: block;
  height: 100%;
}

.regex-tabs-mobile {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.regex-tabs-mobile :deep(.el-tabs__content) {
  flex-grow: 1;
  padding: 0;
}

.regex-tab-pane {
  height: 100%;
}

.regex-tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.regex-tab-text-truncated {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  vertical-align: middle;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-secondary);
  background-color: var(--el-bg-color-page);
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 24px;
  color: var(--el-text-color-placeholder);
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.welcome-text {
  font-size: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .regex-desktop-layout {
    display: none;
  }

  .regex-mobile-layout {
    display: block;
    height: 100%;
  }
}
</style>