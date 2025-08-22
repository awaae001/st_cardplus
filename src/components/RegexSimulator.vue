<template>
  <div class="regex-simulator-container">
    <div class="header">
      <h2>SillyTavern 正则表达式编辑器</h2>
      <div>
        <el-button @click="triggerFileInput" type="primary">导入JSON</el-button>
        <el-button @click="handleExport" type="success">导出JSON</el-button>
        <input type="file" ref="fileInput" @change="handleFileImport" style="display: none" accept=".json" />
      </div>
    </div>

    <div v-if="importedScripts.length > 1" class="script-selector">
      <el-select v-model="selectedScriptId" placeholder="请选择要加载的规则" @change="loadSelectedScript" style="width: 100%;">
        <el-option
          v-for="script in importedScripts"
          :key="script.id"
          :label="script.scriptName"
          :value="script.id">
        </el-option>
      </el-select>
    </div>

    <el-form :model="formState" label-width="120px" label-position="top">
      <el-form-item label="规则名称 (scriptName)">
        <el-input v-model="formState.scriptName" />
      </el-form-item>
      <el-form-item label="查找 (findRegex)">
        <el-input v-model="formState.findRegex" type="textarea" :rows="3" placeholder="/pattern/flags" />
      </el-form-item>
      <el-form-item label="替换 (replaceString)">
        <el-input v-model="formState.replaceString" type="textarea" :rows="5" placeholder="Hello, $1!" />
      </el-form-item>
      <el-form-item label="移除字符 (trimStrings)">
        <el-input v-model="trimStrings" type="textarea" :rows="2" placeholder="每行一个需要移除的字符串" />
      </el-form-item>

      <el-divider><h3>模拟器</h3></el-divider>
      <el-form-item label="测试字符串 (Test String)">
        <el-input v-model="testString" type="textarea" :rows="5" />
      </el-form-item>
      <el-form-item label="结果 (Result)">
        <pre class="result-box">{{ simulatedResult }}</pre>
      </el-form-item>
      <el-form-item label="宏测试 (Macros)">
        <div class="macro-grid">
            <el-input v-model="userMacroValue"><template #prepend>{{user}}</template></el-input>
            <el-input v-model="charMacroValue"><template #prepend>{{char}}</template></el-input>
        </div>
      </el-form-item>

      <el-divider><h3>高级配置</h3></el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="应用位置 (placement)">
            <el-checkbox-group v-model="formState.placement">
              <el-checkbox v-for="(value, key) in REGEX_PLACEMENT" :key="value" :label="value">{{ key }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="替换模式 (substituteRegex)">
            <el-select v-model="formState.substituteRegex">
              <el-option v-for="(value, key) in SUBSTITUTE_FIND_REGEX" :key="value" :label="key" :value="value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="最小深度 (minDepth)">
            <el-input-number v-model="formState.minDepth" :controls="false" placeholder="无限制" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="最大深度 (maxDepth)">
            <el-input-number v-model="formState.maxDepth" :controls="false" placeholder="无限制" style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="选项">
        <el-checkbox v-model="formState.disabled" label="禁用 (disabled)"></el-checkbox>
        <el-checkbox v-model="formState.markdownOnly" label="仅Markdown (markdownOnly)"></el-checkbox>
        <el-checkbox v-model="formState.promptOnly" label="仅Prompt (promptOnly)"></el-checkbox>
        <el-checkbox v-model="formState.runOnEdit" label="编辑时运行 (runOnEdit)"></el-checkbox>
      </el-form-item>

    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRegexSimulator } from '@/composables/regex/useRegexSimulator';
import { REGEX_PLACEMENT, SUBSTITUTE_FIND_REGEX, type SillyTavernRegexScript } from '@/composables/regex/types';

const fileInput = ref<HTMLInputElement | null>(null);
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

const formState = reactive<SillyTavernRegexScript>(createDefaultScript());
const trimStrings = ref('');

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const content = e.target?.result;
      if (typeof content !== 'string') throw new Error('File content is not a string.');
      const jsonData = JSON.parse(content);
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
          : `成功导入 ${importedScripts.value.length} 条规则，已加载第一条。`;
        ElMessage.success(message);
      } else {
        ElMessage.warning('JSON文件不包含有效规则。');
      }

    } catch (error) {
      console.error('Failed to parse JSON:', error);
      ElMessage.error('导入失败，无效的JSON文件。');
    }
  };

  reader.onerror = () => { ElMessage.error('读取文件失败。'); };
  reader.readAsText(file);
  target.value = '';
};

const loadSelectedScript = () => {
  if (!selectedScriptId.value) return;
  const script = importedScripts.value.find(s => s.id === selectedScriptId.value);
  if (script) {
    // Reset form to default before assigning new values
    Object.assign(formState, createDefaultScript(), script);
    trimStrings.value = (script.trimStrings || []).join('\n');
  }
};

const handleExport = () => {
  try {
    const scriptToExport = { ...formState };
    scriptToExport.trimStrings = trimStrings.value.split('\n').filter(s => s.length > 0);
    
    // Clean up properties that are null or at default values
    if (scriptToExport.minDepth === null) delete scriptToExport.minDepth;
    if (scriptToExport.maxDepth === null) delete scriptToExport.maxDepth;

    const jsonString = JSON.stringify(scriptToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formState.scriptName.replace(/[\s./\\?*]/g, '_') || 'regex-script'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功!');
  } catch (error) {
    ElMessage.error('导出失败!');
    console.error(error);
  }
};

const user = '{{user}}';
const char = '{{char}}';

const userMacroValue = ref('测试用户');
const charMacroValue = ref('测试角色');

const macros = computed(() => ({
  '{{user}}': userMacroValue.value,
  '{{char}}': charMacroValue.value,
}));

const regexScript = computed(() => ({
  findRegex: formState.findRegex,
  replaceString: formState.replaceString,
  macros: macros.value,
  trimStrings: trimStrings.value.split('\n').filter(s => s.length > 0),
}));

const { testString, simulatedResult } = useRegexSimulator(regexScript);

</script>

<style scoped>
.regex-simulator-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.script-selector {
  margin-bottom: 20px;
}
.macro-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}
.result-box {
  background-color: var(--el-fill-color-light);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
  width: 100%;
  min-height: 100px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>