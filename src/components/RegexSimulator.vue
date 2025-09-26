<template>
  <div class="regex-simulator-container">
    <RegexHeader @import="handleFileImport" @export="handleExport" />

    <RegexScriptSelector
      v-if="importedScripts.length > 1"
      v-model="selectedScriptId"
      :scripts="importedScripts"
      @update:model-value="loadSelectedScript"
    />

    <el-form :model="formState" label-width="120px" label-position="top">
      <RegexEditorCore
        v-model:script-name="formState.scriptName"
        v-model:find-regex="formState.findRegex"
        v-model:replace-string="formState.replaceString"
        v-model:trim-strings="trimStrings"
      />

      <SmartRegexGenerator
        v-model:input-text="smartInputText"
        @regex-generated="handleSmartRegexGenerated"
      />

      <RegexSimulatorPanel
        v-model:test-string="testString"
        v-model:render-html="renderHtml"
        v-model:user-macro-value="userMacroValue"
        v-model:char-macro-value="charMacroValue"
        :simulated-result="simulatedResult"
      />

      <RegexAdvancedSettings v-model="formState" />
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRegexSimulator } from '@/composables/regex/useRegexSimulator';
import { type SillyTavernRegexScript } from '@/composables/regex/types';
import { useRegexPersistence } from '@/composables/regex/useRegexPersistence';

import RegexHeader from './regex/RegexHeader.vue';
import RegexScriptSelector from './regex/RegexScriptSelector.vue';
import RegexEditorCore from './regex/RegexEditorCore.vue';
import SmartRegexGenerator from './regex/SmartRegexGenerator.vue';
import RegexSimulatorPanel from './regex/RegexSimulatorPanel.vue';
import RegexAdvancedSettings from './regex/RegexAdvancedSettings.vue';

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
  const scripts = Array.isArray(jsonData) ? jsonData : [jsonData];

  importedScripts.value = scripts.map((script: any, index: number) => ({
    ...createDefaultScript(),
    ...script,
    id: script.id || `imported-script-${index}`,
    scriptName: script.scriptName || `未命名规则 ${index + 1}`,
  }));

  if (importedScripts.value.length > 0) {
    selectedScriptId.value = importedScripts.value[0].id;
    loadSelectedScript();
    const message = importedScripts.value.length === 1
      ? '成功导入1条规则'
      : `成功导入 ${importedScripts.value.length} 条规则，已加载第一条 `;
    ElMessage.success(message);
  } else {
    ElMessage.warning('JSON文件不包含有效规则 ');
  }
};

const loadSelectedScript = () => {
  if (!selectedScriptId.value) return;
  const script = importedScripts.value.find(s => s.id === selectedScriptId.value);
  if (script) {
    Object.assign(formState.value, createDefaultScript(), script);
    trimStrings.value = (script.trimStrings || []).join('\n');
  }
};

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
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>