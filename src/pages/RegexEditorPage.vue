<template>
  <div class="regex-editor-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h1 class="page-title">正则表达式编辑器</h1>
        <el-text type="info" size="small">可视化创建和测试正则表达式规则</el-text>
      </div>
      <div class="toolbar-right">
        <el-button @click="toggleEditorPanel" :icon="editorPanelVisible ? 'ArrowRightBold' : 'ArrowLeftBold'" size="small">
          {{ editorPanelVisible ? '隐藏测试器' : '显示测试器' }}
        </el-button>
        <el-button-group>
          <el-button :icon="DocumentAdd" @click="handleImportScript" size="small">
            导入脚本
          </el-button>
          <el-button :icon="Download" @click="handleExportScript" size="small" :disabled="!selectedScriptId">
            导出脚本
          </el-button>
          <el-button :icon="Plus" @click="handleCreateScript" size="small" type="primary">
            新建
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 移动端布局 -->
      <div v-if="isMobileOrTablet" class="mobile-layout">
        <!-- 移动端导航 -->
        <div class="mobile-nav">
          <el-segmented v-model="mobileActivePanel" :options="[
            { label: '脚本', value: 'scripts' },
            { label: '编辑', value: 'editor' },
            { label: '模拟', value: 'simulator' }
          ]" size="small" />
        </div>
        <!-- 移动端面板内容 -->
        <div class="mobile-panel-content">
          <div v-show="mobileActivePanel === 'scripts'" class="mobile-panel">
            <RegexScriptList
              :scripts="importedScripts"
              v-model="selectedScriptId"
              @update:model-value="handleSelectScript"
              @create-script="handleCreateScript"
              @rename-script="handleRenameScript"
              @delete-script="handleDeleteScript"
              @export-script="handleExportSingleScript"
            />
          </div>
          <div v-show="mobileActivePanel === 'editor'" class="mobile-panel">
            <div v-if="selectedScriptId" class="mobile-editor-content">
              <el-form :model="formState" label-position="top">
                <RegexEditorCore
                  v-model:script-name="formState.scriptName"
                  v-model:find-regex="formState.findRegex"
                  v-model:replace-string="formState.replaceString"
                  v-model:trim-strings="trimStrings"
                  v-model:substitute-regex="formState.substituteRegex"
                />
                <SmartRegexGenerator
                  v-model:input-text="smartInputText"
                  @regex-generated="handleSmartRegexGenerated"
                />
                <RegexAdvancedSettings v-model="formState" />
              </el-form>
            </div>
            <div v-else class="empty-state">
              <Icon icon="ph:note-pencil-duotone" class="empty-icon" />
              <p>请先选择或创建一个脚本</p>
            </div>
          </div>
          <div v-show="mobileActivePanel === 'simulator'" class="mobile-panel">
            <div v-if="selectedScriptId" class="mobile-simulator-content">
              <el-form label-position="top">
                <RegexSimulatorPanel
                  v-model:test-string="testString"
                  v-model:render-html="renderHtml"
                  v-model:user-macro-value="userMacroValue"
                  v-model:char-macro-value="charMacroValue"
                  :simulated-result="simulatedResult"
                />
              </el-form>
            </div>
            <div v-else class="empty-state">
              <Icon icon="ph:test-tube-duotone" class="empty-icon" />
              <p>请先选择或创建一个脚本</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 桌面端布局 -->
      <splitpanes v-else class="default-theme" :horizontal="false">
        <!-- 脚本列表侧边栏 -->
        <pane min-size="10" size="15">
          <div class="sidebar-panel">
            <RegexScriptList
              :scripts="importedScripts"
              v-model="selectedScriptId"
              @update:model-value="handleSelectScript"
              @create-script="handleCreateScript"
              @rename-script="handleRenameScript"
              @delete-script="handleDeleteScript"
              @export-script="handleExportSingleScript"
            />
          </div>
        </pane>

        <!-- 编辑器面板 -->
        <pane v-if="editorPanelVisible" min-size="40" size="60">
          <div class="editor-panel">
            <div v-if="selectedScriptId" class="panel-content">
              <div class="panel-header">
                <h3>规则编辑器</h3>
                <el-text type="info" size="small">{{ formState.scriptName || '未命名规则' }}</el-text>
              </div>
              <div class="panel-scroll">
                <el-form :model="formState" label-position="top" class="editor-form">
                  <RegexEditorCore
                    v-model:script-name="formState.scriptName"
                    v-model:find-regex="formState.findRegex"
                    v-model:replace-string="formState.replaceString"
                    v-model:trim-strings="trimStrings"
                    v-model:substitute-regex="formState.substituteRegex"
                  />
                  <el-divider content-position="left">智能生成</el-divider>
                  <SmartRegexGenerator
                    v-model:input-text="smartInputText"
                    @regex-generated="handleSmartRegexGenerated"
                  />
                  <el-divider content-position="left">高级设置</el-divider>
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
          </div>
        </pane>

        <!-- 模拟测试面板 -->
        <pane min-size="25" size="25">
          <div class="simulator-panel">
            <div v-if="selectedScriptId" class="panel-content">
              <div class="panel-header">
                <h3>模拟测试</h3>
                <el-text type="info" size="small">实时查看正则表达式的匹配和替换效果</el-text>
              </div>
              <div class="panel-scroll">
                <el-form label-position="top" class="simulator-form">
                  <RegexSimulatorPanel
                    v-model:test-string="testString"
                    v-model:render-html="renderHtml"
                    v-model:user-macro-value="userMacroValue"
                    v-model:char-macro-value="charMacroValue"
                    :simulated-result="simulatedResult"
                  />
                </el-form>
              </div>
            </div>
            <div v-else class="welcome-screen">
              <Icon icon="ph:test-tube-duotone" class="welcome-icon" />
              <h2 class="welcome-title">准备测试</h2>
              <p class="welcome-text">选择一个脚本后，您可以在此进行模拟测试。</p>
            </div>
          </div>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { DocumentAdd, Download, Plus } from '@element-plus/icons-vue';
import { Icon } from '@iconify/vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useDevice } from '@/composables/useDevice';
import { useRegexSimulator } from '@/composables/regex/useRegexSimulator';
import { type SillyTavernRegexScript } from '@/composables/regex/types';
import { useRegexPersistence } from '@/composables/regex/useRegexPersistence';

// 组件导入
import RegexScriptList from '@/components/regex/RegexScriptList.vue';
import RegexEditorCore from '@/components/regex/RegexEditorCore.vue';
import SmartRegexGenerator from '@/components/regex/SmartRegexGenerator.vue';
import RegexSimulatorPanel from '@/components/regex/RegexSimulatorPanel.vue';
import RegexAdvancedSettings from '@/components/regex/RegexAdvancedSettings.vue';

const { isMobileOrTablet } = useDevice();
const editorPanelVisible = ref(true);
const mobileActivePanel = ref('scripts');

// 脚本数据
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
const userMacroValue = ref('测试用户');
const charMacroValue = ref('测试角色');

// 工具栏操作
function toggleEditorPanel() {
  editorPanelVisible.value = !editorPanelVisible.value;
}

async function handleImportScript() {
  try {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const jsonData = JSON.parse(text);

        const scriptsToParse = Array.isArray(jsonData) ? jsonData : [jsonData];
        const newScripts = scriptsToParse.map((script: any, index: number) => ({
          ...createDefaultScript(),
          ...script,
          id: `imported-script-${Date.now()}-${index}`,
          scriptName: script.scriptName || `导入的规则 ${index + 1}`,
        }));

        if (newScripts.length > 0) {
          importedScripts.value.push(...newScripts);
          selectedScriptId.value = newScripts[0].id;
          loadSelectedScript();

          const message = newScripts.length === 1
            ? '成功导入 1 条规则'
            : `成功导入 ${newScripts.length} 条规则`;
          ElMessage.success(message);
        }
      } catch (error) {
        ElMessage.error('导入失败：文件格式错误');
      }
    };

    input.click();
  } catch (error) {
    ElMessage.error('导入失败');
  }
}

function handleExportScript() {
  if (!selectedScriptId.value) return;

  const script = importedScripts.value.find(s => s.id === selectedScriptId.value);
  if (!script) return;

  try {
    const scriptToExport = { ...script };
    scriptToExport.trimStrings = trimStrings.value.split('\n').filter(s => s.length > 0);

    if (scriptToExport.minDepth === null) delete scriptToExport.minDepth;
    if (scriptToExport.maxDepth === null) delete scriptToExport.maxDepth;

    const jsonString = JSON.stringify(scriptToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scriptToExport.scriptName.replace(/[\s./\\?*]/g, '_') || 'regex-script'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功!');
  } catch (error) {
    ElMessage.error('导出失败!');
  }
}

function handleExportSingleScript(scriptId: string) {
  const script = importedScripts.value.find(s => s.id === scriptId);
  if (!script) return;

  try {
    const cleanScript = { ...script };
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
  }
}

function handleCreateScript() {
  const newScript = createDefaultScript();
  newScript.scriptName = `新规则 ${importedScripts.value.length + 1}`;
  importedScripts.value.push(newScript);
  selectedScriptId.value = newScript.id;
  loadSelectedScript();
  mobileActivePanel.value = 'editor';
  ElMessage.success('已创建新脚本');
}

function handleSelectScript(scriptId: string) {
  selectedScriptId.value = scriptId;
  loadSelectedScript();
  mobileActivePanel.value = 'editor';
}

function loadSelectedScript() {
  if (!selectedScriptId.value) {
    formState.value = createDefaultScript();
    trimStrings.value = '';
    return;
  }

  const script = importedScripts.value.find(s => s.id === selectedScriptId.value);
  if (script) {
    Object.assign(formState.value, createDefaultScript(), script);
    trimStrings.value = (script.trimStrings || []).join('\n');
  }
}

async function handleRenameScript(scriptId: string) {
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
}

async function handleDeleteScript(scriptId: string) {
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
}

// 正则模拟
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

function handleSmartRegexGenerated({ regex, replaceString }: { regex: string; replaceString: string }) {
  formState.value.findRegex = regex;
  formState.value.replaceString = replaceString;
  testString.value = smartInputText.value;
  mobileActivePanel.value = 'simulator';
  ElMessage.success('已自动生成正则表达式和替换字符串！');
}

// 持久化
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

  // 加载保存的脚本列表
  const saved = localStorage.getItem('regex-editor-scripts');
  if (saved) {
    try {
      const savedData = JSON.parse(saved);
      if (savedData.scripts && Array.isArray(savedData.scripts)) {
        importedScripts.value = savedData.scripts;
        if (savedData.selectedScriptId) {
          selectedScriptId.value = savedData.selectedScriptId;
          loadSelectedScript();
        }
      }
    } catch (error) {
      console.warn('Failed to load saved scripts:', error);
    }
  }

  // 如果没有脚本，创建一个默认脚本
  if (importedScripts.value.length === 0) {
    handleCreateScript();
  }
});

// 监听脚本变化，自动保存
import { watch } from 'vue';
let saveTimer: NodeJS.Timeout | null = null;

watch(
  [
    () => importedScripts.value.length,
    () => selectedScriptId.value,
    () => importedScripts.value.map(s => `${s.id}-${s.scriptName}`).join(','),
    () => formState.value.scriptName,
    () => formState.value.findRegex,
    () => formState.value.replaceString,
  ],
  () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        // 更新当前编辑的脚本
        if (selectedScriptId.value) {
          const currentScript = importedScripts.value.find(s => s.id === selectedScriptId.value);
          if (currentScript) {
            Object.assign(currentScript, formState.value);
            currentScript.trimStrings = trimStrings.value.split('\n').filter(s => s.length > 0);
          }
        }

        const saveData = {
          scripts: importedScripts.value,
          selectedScriptId: selectedScriptId.value,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem('regex-editor-scripts', JSON.stringify(saveData));
      } catch (error) {
        console.warn('保存脚本失败:', error);
      }
      saveTimer = null;
    }, 1000);
  },
  { deep: true }
);
</script>

<style scoped>
.regex-editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.main-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sidebar-panel,
.editor-panel,
.simulator-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  overflow: hidden;
}

.panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
  background: var(--el-bg-color);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
}

.editor-form,
.simulator-form {
  max-width: 100%;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
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
  text-align: center;
}

/* Splitpanes 样式 */
:deep(.splitpanes__splitter) {
  background-color: var(--el-border-color-light);
  position: relative;
  z-index: 1;
}

:deep(.splitpanes__splitter:before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: var(--el-color-primary-light-5);
  opacity: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}

:deep(.splitpanes__splitter:hover:before) {
  opacity: 1;
}

/* 移动端样式 */
.mobile-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mobile-nav {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  flex-shrink: 0;
}

.mobile-panel-content {
  flex: 1;
  overflow: hidden;
}

.mobile-panel {
  height: 100%;
  overflow-y: auto;
  background: var(--el-bg-color);
  -webkit-overflow-scrolling: touch;
}

.mobile-editor-content,
.mobile-simulator-content {
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  color: var(--el-text-color-secondary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--el-text-color-placeholder);
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

/* 移动端工具栏优化 */
@media screen and (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    padding: 12px 16px;
    gap: 12px;
    align-items: stretch;
  }

  .toolbar-left {
    align-items: center;
    text-align: center;
  }

  .toolbar-right {
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  .page-title {
    font-size: 18px;
  }

  .el-button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .el-button-group .el-button {
    margin: 0;
    flex: 1;
    min-width: auto;
  }
}

/* 平板端样式调整 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .mobile-nav {
    padding: 16px 20px;
  }

  .mobile-panel {
    padding: 0 8px;
  }
}
</style>
