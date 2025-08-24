<template>
  <div class="ejs-editor-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h1 class="page-title">EJS 模板编辑器</h1>
        <el-text type="info" size="small">可视化创建动态模板</el-text>
      </div>
      <div class="toolbar-right">
        <el-button @click="toggleCenterPanel" :icon="centerPanelVisible ? 'ArrowRightBold' : 'ArrowLeftBold'" size="small">
          {{ centerPanelVisible ? '隐藏编辑器' : '显示编辑器' }}
        </el-button>
        <el-button-group>
          <el-button :icon="DocumentAdd" @click="handleImportConfig" size="small">
            导入配置
          </el-button>
          <el-button :icon="Download" @click="handleExportConfig" size="small">
            导出配置
          </el-button>
          <el-button :icon="RefreshLeft" @click="handleClearAll" size="small" type="warning">
            清空
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="store.hasErrors" class="error-banner">
      <el-alert v-for="error in store.errors" :key="error.message" :title="error.message" type="error" :closable="false"
        class="mb-2" />
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 移动端布局 -->
      <div v-if="isMobileOrTablet" class="mobile-layout">
        <!-- 移动端导航 -->
        <div class="mobile-nav">
          <el-segmented v-model="mobileActivePanel" :options="[
            { label: '项目', value: 'projects' },
            { label: '变量', value: 'variables' },
            { label: '阶段', value: 'stages' },
            { label: '编辑', value: 'editor' },
            { label: '预览', value: 'preview' }
          ]" size="small" />
        </div>
        <!-- 移动端面板内容 -->
        <div class="mobile-panel-content">
          <div v-show="mobileActivePanel === 'projects'" class="mobile-panel">
            <ProjectManager />
          </div>
          <div v-show="mobileActivePanel === 'variables'" class="mobile-panel">
            <VariablePanel />
          </div>
          <div v-show="mobileActivePanel === 'stages'" class="mobile-panel">
            <LogicBlockPanel />
          </div>
          <div v-show="mobileActivePanel === 'editor'" class="mobile-panel">
            <div class="panel-header">
              <h3>模板编辑器</h3>
              <div class="header-actions">
                <el-button :icon="CopyDocument" @click="copyToClipboard" size="small" type="primary">
                  复制
                </el-button>
                <el-button :icon="RefreshRight" @click="store.generateEjsTemplate" size="small">
                  生成
                </el-button>
              </div>
            </div>
            <TemplateEditor />
          </div>
          <div v-show="mobileActivePanel === 'preview'" class="mobile-panel">
            <el-tabs v-model="activeRightTab" class="h-full">
              <el-tab-pane label="代码预览" name="preview" class="h-full">
                <PreviewPanel />
              </el-tab-pane>
              <el-tab-pane label="模拟测试" name="simulation" class="h-full">
                <SimulationPanel />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
      
      <!-- 桌面端布局 -->
      <splitpanes v-else class="default-theme" :horizontal="false">
        <!-- 项目和方案管理侧边栏 -->
        <pane min-size="15" size="20">
          <div class="sidebar-panel">
            <el-tabs v-model="activeSidebarTab" class="h-full">
              <el-tab-pane label="项目管理" name="projects" class="h-full">
                <ProjectManager />
              </el-tab-pane>
            </el-tabs>
          </div>
        </pane>
        <!-- 左侧面板 -->
        <pane min-size="20" size="50">
          <div class="left-panel">
            <el-tabs v-model="activeLeftTab" class="h-full">
              <el-tab-pane label="变量配置" name="variables" class="h-full">
                <VariablePanel />
              </el-tab-pane>
              <el-tab-pane label="阶段管理" name="stages" class="h-full">
                <LogicBlockPanel />
              </el-tab-pane>
            </el-tabs>
          </div>
        </pane>
        <pane v-if="centerPanelVisible" min-size="30">
          <div class="center-panel">
            <div class="panel-header">
              <h3>模板编辑器</h3>
              <div class="header-actions">
                <el-button :icon="CopyDocument" @click="copyToClipboard" size="small" type="primary">
                  复制代码
                </el-button>
                <el-button :icon="RefreshRight" @click="store.generateEjsTemplate" size="small">
                  重新生成
                </el-button>
              </div>
            </div>
            <TemplateEditor />
          </div>
        </pane>
        <pane min-size="20" size="30">
          <div class="right-panel">
            <el-tabs v-model="activeRightTab" class="h-full">
              <el-tab-pane label="代码预览" name="preview" class="h-full">
                <PreviewPanel />
              </el-tab-pane>
              <el-tab-pane label="模拟测试" name="simulation" class="h-full">
                <SimulationPanel />
              </el-tab-pane>
            </el-tabs>
          </div>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOverflowControl } from '@/composables/useOverflowControl';
import {
  DocumentAdd,
  Download,
  RefreshLeft,
  RefreshRight,
  CopyDocument
} from '@element-plus/icons-vue'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import { saveAs } from 'file-saver'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { useDevice } from '@/composables/useDevice'

// 组件导入
import ProjectManager from '@/components/ejseditor/ProjectManager.vue'
import VariablePanel from '@/components/ejseditor/VariablePanel.vue'
import LogicBlockPanel from '@/components/ejseditor/LogicBlockPanel.vue'
import TemplateEditor from '@/components/ejseditor/TemplateEditor.vue'
import PreviewPanel from '@/components/ejseditor/PreviewPanel.vue'
import SimulationPanel from '@/components/ejseditor/SimulationPanel.vue'

const { setOverflowHidden } = useOverflowControl();
const store = useEjsEditorStore()
const { isMobileOrTablet } = useDevice()
const activeSidebarTab = ref('projects')
const activeLeftTab = ref('variables')
const activeRightTab = ref('preview')
const centerPanelVisible = ref(false)
const mobileActivePanel = ref('projects')

function toggleCenterPanel() {
  centerPanelVisible.value = !centerPanelVisible.value
}

// 工具栏操作
async function handleImportConfig() {
  try {
    const { value: file } = await ElMessageBox.prompt(
      '请粘贴配置文件内容 (JSON格式)',
      '导入配置',
      {
        inputType: 'textarea',
        inputPlaceholder: '粘贴JSON配置...'
      }
    )

    if (file) {
      const config = JSON.parse(file)
      
      // 如果有现有项目，询问用户导入方式
      if (store.projects.length > 0) {
        const importType = await ElMessageBox.confirm(
          '选择导入方式：',
          '导入配置',
          {
            confirmButtonText: '创建新项目',
            cancelButtonText: '替换当前项目',
            distinguishCancelAndClose: true,
            type: 'info'
          }
        ).then(() => 'new')
          .catch((action: string) => action === 'cancel' ? 'replace' : null)
        
        if (importType === 'new') {
          const { value: projectName } = await ElMessageBox.prompt(
            '请输入新项目的名称',
            '新建项目',
            {
              inputPlaceholder: '项目名称...'
            }
          )
          store.importConfig(config, false, projectName)
        } else if (importType === 'replace') {
          store.importConfig(config, true)
        } else {
          return // 用户取消
        }
      } else {
        // 没有现有项目时直接导入
        store.importConfig(config)
      }
      
      ElMessage.success('配置导入成功')
    }
  } catch (error) {
    ElMessage.error('配置格式错误，请检查JSON格式')
  }
}

function handleExportConfig() {
  const config = store.exportConfig()
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json'
  })
  const fileName = `ejs-template-${new Date().toISOString().slice(0, 10)}.json`
  saveAs(blob, fileName)
  ElMessage.success('配置导出成功')
}

async function handleClearAll() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有内容吗？此操作不可恢复 ',
      '确认清空',
      {
        type: 'warning'
      }
    )
    store.clearAll()
    ElMessage.success('已清空所有内容')
  } catch {
    // 用户取消
  }
}

async function copyToClipboard() {
  if (!store.ejsTemplate) {
    ElMessage.warning('没有可复制的代码')
    return
  }

  try {
    await navigator.clipboard.writeText(store.ejsTemplate)
    ElMessage.success('代码已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 页面加载时的初始化
onMounted(() => {
  // 初始化项目管理
  store.initializeStore()
  setOverflowHidden(true);
  // 可以在这里加载本地存储的数据
  const saved = localStorage.getItem('ejs-editor-projects')
  if (saved) {
    try {
      const savedData = JSON.parse(saved)
      if (savedData.projects && Array.isArray(savedData.projects)) {
        store.projects = savedData.projects
        if (savedData.currentProjectId) {
          store.currentProjectId = savedData.currentProjectId
          const project = store.projects.find(p => p.id === savedData.currentProjectId)
          if (project) {
            store.loadProjectState(project)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load saved projects:', error)
    }
  }
})

onUnmounted(() => {
  setOverflowHidden(false);
});

// 监听状态变化，自动保存到本地存储
import { watch } from 'vue'
let saveStateTimer: NodeJS.Timeout | null = null

// 监听项目状态变化，自动保存到本地存储
watch(
  [
    () => store.projects.length,
    () => store.currentProjectId,
    () => store.projects.map(p => `${p.id}-${p.name}-${p.updatedAt}`).join(',')
  ],
  () => {
    if (saveStateTimer) clearTimeout(saveStateTimer)
    saveStateTimer = setTimeout(() => {
      try {
        const saveData = {
          projects: store.projects,
          currentProjectId: store.currentProjectId,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('ejs-editor-projects', JSON.stringify(saveData))
      } catch (error) {
        console.warn('保存项目失败:', error)
      }
      saveStateTimer = null
    }, 1000) // 1秒防抖，减少保存频率
  },
  { deep: true }
)
</script>

<style scoped>
.ejs-editor-page {
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

.error-banner {
  padding: 16px 24px;
  background: var(--el-color-error-light-9);
}

.main-content {
  flex: 1;
  min-height: 0;
}

.sidebar-panel, .left-panel, .right-panel, .center-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  overflow: hidden;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.center-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  order: -1; /* 确保 header 在最前面 */
  flex-shrink: 0; /* 防止压缩 */
}

.center-panel .panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* Element Plus 标签页样式覆盖 */
:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  padding: 0;
  min-height: 0;
}

:deep(.el-tab-pane) {
  height: 100%;
}

:deep(.el-tabs__header) {
  margin: 0;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 16px;
}

:deep(.el-tabs__nav-wrap) {
  padding: 8px 0;
}

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
  flex-direction: column;
}

.mobile-panel {
  height: 100%;
  overflow-y: auto;
  background: var(--el-bg-color);
  -webkit-overflow-scrolling: touch;
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