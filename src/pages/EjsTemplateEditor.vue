<template>
  <el-container class="ejs-editor-container">
    <!-- 顶部标题栏 -->
    <el-header class="editor-header">
      <div class="header-content">
        <div class="title-area">
          <h1 class="main-title">MUV 动态模板 EJS 编辑器</h1>
          <p class="subtitle">
            将复杂的 EJS + YAML 编码转换为直观的可视化编辑，快速创建动态角色模板
          </p>
        </div>
        <div class="actions-area">
          <el-button type="primary" @click="exportTemplate">
            <i class="iconify mdi:download mr-1"></i>
            导出模板
          </el-button>
          <el-button @click="importTemplate">
            <i class="iconify mdi:upload mr-1"></i>
            导入配置
          </el-button>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="editor-main">
      <el-row :gutter="20" class="main-row">
        <!-- 左侧配置面板 -->
        <el-col :span="12" class="main-col">
          <el-card class="box-card" shadow="never">
            <el-tabs v-model="activeTab" class="editor-tabs">
              <el-tab-pane label="变量配置" name="variable">
                <div class="tab-content">
                  <VariableConfig />
                </div>
              </el-tab-pane>
              <el-tab-pane label="阶段管理" name="stages">
                <div class="tab-content">
                  <StageManager />
                </div>
              </el-tab-pane>
              <el-tab-pane label="内容编辑" name="content">
                <div class="tab-content">
                  <ContentEditor />
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

        <!-- 右侧预览和测试面板 -->
        <el-col :span="12" class="main-col">
          <el-card class="box-card" shadow="never">
            <el-tabs v-model="rightActiveTab" class="editor-tabs">
              <el-tab-pane label="代码预览" name="preview">
                <div class="tab-content">
                  <CodePreview />
                </div>
              </el-tab-pane>
              <el-tab-pane label="模拟测试" name="simulation">
                <div class="tab-content">
                  <SimulationPanel />
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </el-main>

    <!-- 状态栏 -->
    <el-footer class="editor-footer">
      <div class="footer-content">
        <div class="status-info">
          <span>变量: <strong>{{ variableDisplayName }}</strong></span>
          <span>阶段数: <strong>{{ stageCount }}</strong></span>
          <el-tag :type="editorStatus === '就绪' ? 'success' : 'warning'" size="small">
            {{ editorStatus }}
          </el-tag>
        </div>
        <div class="footer-actions">
          <el-button size="small" type="success" @click="generateCode">
            <i class="iconify mdi:code-tags mr-1"></i>
            生成代码
          </el-button>
        </div>
      </div>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  ElContainer, ElHeader, ElMain, ElFooter,
  ElRow, ElCol, ElCard,
  ElTabs, ElTabPane, ElButton, ElMessage, ElTag
} from 'element-plus'
import { useEjsEditorStore } from '@/stores/ejsEditor'

// 导入子组件
import VariableConfig from '@/components/ejs-editor/VariableConfig.vue'
import StageManager from '@/components/ejs-editor/StageManager.vue'
import ContentEditor from '@/components/ejs-editor/ContentEditor.vue'
import CodePreview from '@/components/ejs-editor/CodePreview.vue'
import SimulationPanel from '@/components/ejs-editor/SimulationPanel.vue'

// 响应式数据
const activeTab = ref('variable')
const rightActiveTab = ref('preview')

// Store
const ejsStore = useEjsEditorStore()

// 计算属性
const variableDisplayName = computed(() => 
  ejsStore.variableConfig.alias || ejsStore.variableConfig.path || '未设置'
)

const stageCount = computed(() => ejsStore.stages.length)

const editorStatus = computed(() => {
  if (!ejsStore.variableConfig.path) return '请配置变量'
  if (ejsStore.stages.length === 0) return '请添加阶段'
  return '就绪'
})

// 方法
const generateCode = () => {
  try {
    ejsStore.generateEjsCode()
    ElMessage.success('代码生成成功')
  } catch (error) {
    ElMessage.error('代码生成失败: ' + (error as Error).message)
  }
}

const exportTemplate = () => {
  try {
    const config = ejsStore.exportConfig()
    const blob = new Blob([JSON.stringify(config, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ejs-template-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('配置导出成功')
  } catch (error) {
    ElMessage.error('导出失败: ' + (error as Error).message)
  }
}

const importTemplate = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string)
        ejsStore.importConfig(config)
        ElMessage.success('配置导入成功')
      } catch (error) {
        ElMessage.error('导入失败: ' + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

// 数据持久化
const STORAGE_KEY = 'ejs-template-editor-config'

const saveToLocalStorage = () => {
  try {
    const data = {
      config: ejsStore.config,
      editorState: ejsStore.editorState,
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      if (data.config) {
        ejsStore.importConfig(data.config)
        ejsStore.editorState.selectedStageId = data.editorState?.selectedStageId || null
        ejsStore.markClean()
      }
    }
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
  }
}

// 自动保存
let autoSaveTimer: NodeJS.Timeout | null = null

const startAutoSave = () => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
  
  autoSaveTimer = setInterval(() => {
    if (ejsStore.editorState.isDirty) {
      saveToLocalStorage()
    }
  }, 30000) // 每30秒自动保存一次
}

const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

// 页面离开提示
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (ejsStore.editorState.isDirty) {
    const message = '您有未保存的更改，确定要离开吗？'
    e.preventDefault()
    e.returnValue = message
    return message
  }
}

// 生命周期
onMounted(() => {
  loadFromLocalStorage()
  startAutoSave()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  stopAutoSave()
  window.removeEventListener('beforeunload', handleBeforeUnload)
  // 在卸载时保存一次
  if (ejsStore.editorState.isDirty) {
    saveToLocalStorage()
  }
})

// 监听配置变化，进行自动保存
watch(
  [
    () => ejsStore.config,
    () => ejsStore.editorState.selectedStageId
  ],
  () => {
    // 延迟保存，避免频繁操作
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    autoSaveTimer = setTimeout(() => {
      saveToLocalStorage()
    }, 1000)
  },
  { deep: true }
)
</script>

<style scoped>
.ejs-editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-header {
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 20px;
  height: auto;
  background-color: var(--el-bg-color-page);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.main-title {
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.subtitle {
  font-size: 0.875rem; /* 14px */
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.editor-main {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  flex: 1;
  overflow: hidden;
}

.main-row, .main-col, .box-card {
  height: 100%;
}

.main-col {
  display: flex;
  flex-direction: column;
}

.box-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid var(--el-border-color-light);
}

:deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.editor-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__header) {
  padding: 0 20px;
  margin: 0;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

:deep(.el-tab-pane) {
  height: 100%;
}

.tab-content {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.editor-footer {
  border-top: 1px solid var(--el-border-color-light);
  padding: 0 20px;
  height: auto;
  background-color: var(--el-bg-color-page);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-info strong {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.iconify {
  width: 1em;
  height: 1em;
}
</style>