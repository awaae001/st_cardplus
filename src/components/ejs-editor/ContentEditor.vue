<template>
  <div class="content-editor h-full flex flex-col">
    <div class="header mb-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            内容编辑器
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            为选中的阶段编写 YAML 格式的角色描述内容
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <el-button 
            size="small" 
            @click="formatContent"
            :disabled="!selectedStage"
          >
            <i class="iconify mdi:code-format mr-1"></i>
            格式化
          </el-button>
          <el-button 
            size="small" 
            @click="insertTemplate"
            :disabled="!selectedStage"
          >
            <i class="iconify mdi:plus-box mr-1"></i>
            插入模板
          </el-button>
        </div>
      </div>
    </div>

    <!-- 阶段选择器 -->
    <div v-if="!selectedStage" class="stage-selector">
      <div class="text-center py-12">
        <i class="iconify mdi:cursor-text text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          选择阶段开始编辑
        </h4>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          在左侧阶段管理中点击阶段，或者在下方选择要编辑的阶段
        </p>
        
        <div v-if="availableStages.length > 0" class="stage-quick-select">
          <div class="max-w-md mx-auto">
            <el-select
              v-model="quickSelectedStageId"
              placeholder="选择要编辑的阶段"
              @change="handleQuickSelect"
              class="w-full"
            >
              <el-option
                v-for="stage in availableStages"
                :key="stage.id"
                :label="`${stage.order + 1}. ${stage.name || '未命名阶段'}`"
                :value="stage.id"
              />
            </el-select>
          </div>
        </div>
        
        <div v-else class="mt-4">
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            还没有阶段，请先在阶段管理中添加阶段
          </p>
        </div>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div v-else class="editor-area flex-1 flex flex-col">
      <!-- 当前编辑阶段信息 -->
      <div class="current-stage-info mb-3">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="stage-number bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                {{ selectedStage.order + 1 }}
              </div>
              <div>
                <div class="font-medium text-blue-900 dark:text-blue-100">
                  {{ selectedStage.name || '未命名阶段' }}
                </div>
                <div class="text-sm text-blue-700 dark:text-blue-300">
                  {{ generateConditionText(selectedStage) }}
                </div>
              </div>
            </div>
            <div class="text-right text-sm text-blue-700 dark:text-blue-300">
              <div>{{ contentStats.lines }} 行</div>
              <div>{{ contentStats.characters }} 字符</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monaco Editor -->
      <div class="editor-container flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div ref="editorContainer" class="w-full h-full"></div>
      </div>

      <!-- 编辑器工具栏 -->
      <div class="editor-toolbar mt-3">
        <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-center space-x-4">
            <span>语言: YAML</span>
            <span>编码: UTF-8</span>
            <span v-if="hasUnsavedChanges" class="text-yellow-600">
              <i class="iconify mdi:circle-small mr-1"></i>
              未保存
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <el-button size="small" text @click="undoChanges" :disabled="!hasUnsavedChanges">
              撤销
            </el-button>
            <el-button size="small" text @click="redoChanges">
              重做
            </el-button>
            <el-button size="small" type="primary" @click="saveContent" :disabled="!hasUnsavedChanges">
              保存
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板选择对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      title="选择内容模板"
      width="600px"
    >
      <div class="template-list space-y-3">
        <div
          v-for="template in contentTemplates"
          :key="template.id"
          class="template-item cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
          @click="applyTemplate(template)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-medium text-gray-900 dark:text-white">
                {{ template.name }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ template.description }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {{ template.content.split('\n').length }} 行 · {{ template.category }}
              </div>
            </div>
            <i class="iconify mdi:chevron-right text-gray-400"></i>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElButton, ElSelect, ElOption, ElDialog, ElMessage } from 'element-plus'
import * as monaco from 'monaco-editor'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import type { Stage } from './types'

// Store
const ejsStore = useEjsEditorStore()

// 响应式数据
const editorContainer = ref<HTMLElement>()
const quickSelectedStageId = ref<string>('')
const templateDialogVisible = ref(false)
const hasUnsavedChanges = ref(false)

let editor: monaco.editor.IStandaloneCodeEditor | null = null
let originalContent = ''

// 计算属性
const selectedStage = computed(() => ejsStore.selectedStage)
const availableStages = computed(() => ejsStore.sortedStages)

const contentStats = computed(() => {
  const content = selectedStage.value?.content || ''
  return {
    lines: content.split('\n').length,
    characters: content.length
  }
})

// 内容模板
const contentTemplates = ref([
  {
    id: 'basic_stage',
    name: '基础阶段模板',
    description: '包含行为指导和变化倾向的标准阶段模板',
    category: '通用',
    content: `阶段名称:
  行为指导:
    - "角色在此阶段的具体行为描述1"
    - "角色在此阶段的具体行为描述2"
    - "角色在此阶段的具体行为描述3"
  变化倾向:
    - "向下一阶段过渡时的行为变化1"
    - "向下一阶段过渡时的行为变化2"`
  },
  {
    id: 'relationship_stage',
    name: '关系阶段模板',
    description: '专门用于描述角色关系变化的模板',
    category: '关系',
    content: `关系阶段:
  当前关系: "陌生人/朋友/恋人等"
  互动方式:
    - "日常对话的特点和风格"
    - "肢体接触的接受程度"
    - "情感表达的方式"
  态度变化:
    - "对用户态度的具体表现"
    - "主动性的变化程度"`
  },
  {
    id: 'mood_stage',
    name: '情绪阶段模板',
    description: '用于描述角色情绪状态的模板',
    category: '情绪',
    content: `情绪状态:
  主要情绪: "当前的主导情绪"
  表现特征:
    - "情绪的外在表现方式"
    - "语言风格的变化"
    - "行为模式的调整"
  触发条件:
    - "导致情绪变化的因素"
    - "情绪恢复的方式"`
  },
  {
    id: 'dialogue_stage',
    name: '对话风格模板',
    description: '专注于角色对话风格变化的模板',
    category: '对话',
    content: `对话风格:
  语言特点:
    - "用词习惯和语气特征"
    - "句式结构的偏好"
    - "口头禅或特殊表达"
  话题偏好:
    - "乐于讨论的话题类型"
    - "避免或敏感的话题"
  互动深度:
    - "愿意分享的个人信息程度"
    - "主动发起对话的频率"`
  }
])

// 方法
const initializeEditor = async () => {
  if (!editorContainer.value) return

  try {
    // 设置 Monaco Editor 主题
    monaco.editor.defineTheme('ejs-theme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#333333'
      }
    })

    monaco.editor.defineTheme('ejs-theme-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1f2937',
        'editor.foreground': '#e5e7eb'
      }
    })

    // 创建编辑器实例
    editor = monaco.editor.create(editorContainer.value, {
      language: 'yaml',
      theme: document.documentElement.classList.contains('dark') ? 'ejs-theme-dark' : 'ejs-theme',
      value: selectedStage.value?.content || '',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Monaco, "Courier New", monospace',
      renderWhitespace: 'selection',
      bracketPairColorization: {
        enabled: true
      }
    })

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      const currentContent = editor?.getValue() || ''
      hasUnsavedChanges.value = currentContent !== originalContent
    })

    // 设置初始内容
    updateEditorContent()

  } catch (error) {
    console.error('Failed to initialize Monaco Editor:', error)
    ElMessage.error('编辑器初始化失败')
  }
}

const updateEditorContent = () => {
  if (!editor || !selectedStage.value) return

  const content = selectedStage.value.content || ''
  originalContent = content
  
  if (editor.getValue() !== content) {
    editor.setValue(content)
  }
  
  hasUnsavedChanges.value = false
}

const saveContent = () => {
  if (!editor || !selectedStage.value) return

  const content = editor.getValue()
  ejsStore.updateStage(selectedStage.value.id, { content })
  originalContent = content
  hasUnsavedChanges.value = false
  
  ElMessage.success('内容已保存')
}

const formatContent = () => {
  if (!editor) return

  editor.getAction('editor.action.formatDocument')?.run()
  ElMessage.success('内容已格式化')
}

const insertTemplate = () => {
  templateDialogVisible.value = true
}

const applyTemplate = (template: typeof contentTemplates.value[0]) => {
  if (!editor) return

  const currentContent = editor.getValue()
  const newContent = currentContent + (currentContent ? '\n\n' : '') + template.content
  
  editor.setValue(newContent)
  templateDialogVisible.value = false
  
  ElMessage.success(`已插入模板: ${template.name}`)
}

const undoChanges = () => {
  if (!editor) return
  editor.trigger('source', 'undo', null)
}

const redoChanges = () => {
  if (!editor) return
  editor.trigger('source', 'redo', null)
}

const handleQuickSelect = (stageId: string) => {
  ejsStore.selectStage(stageId)
  quickSelectedStageId.value = ''
}

const generateConditionText = (stage: Stage): string => {
  const alias = ejsStore.variableConfig.alias || '变量'
  const { condition } = stage
  
  switch (condition.operator) {
    case '<':
      return `当 ${alias} < ${condition.value} 时`
    case '<=':
      return `当 ${alias} <= ${condition.value} 时`
    case '==':
      return `当 ${alias} == ${condition.value} 时`
    case '>':
      return `当 ${alias} > ${condition.value} 时`
    case '>=':
      return `当 ${alias} >= ${condition.value} 时`
    case 'range':
      return `当 ${condition.value} <= ${alias} < ${condition.maxValue || '∞'} 时`
    default:
      return '条件未定义'
  }
}

// 生命周期和监听器
onMounted(async () => {
  await nextTick()
  await initializeEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

// 监听选中阶段变化
watch(selectedStage, (newStage) => {
  if (newStage && editor) {
    updateEditorContent()
  }
}, { immediate: true })

// 监听主题变化
watch(
  () => document.documentElement.classList.contains('dark'),
  (isDark) => {
    if (editor) {
      monaco.editor.setTheme(isDark ? 'ejs-theme-dark' : 'ejs-theme')
    }
  }
)

// 自动保存（可选）
watch(
  () => editor?.getValue(),
  () => {
    // 可以在这里实现自动保存逻辑
  }
)
</script>

<style scoped>
.content-editor {
  height: 100%;
}

.stage-selector {
  height: 100%;
  display: flex;
  align-items: center;
}

.editor-container {
  min-height: 300px;
}

.template-item {
  transition: all 0.2s ease-in-out;
}

.template-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.iconify {
  width: 1em;
  height: 1em;
}

:deep(.monaco-editor) {
  border-radius: 0.5rem;
}

:deep(.monaco-editor .margin) {
  background-color: transparent;
}

/* 自定义滚动条 */
:deep(.monaco-scrollable-element > .scrollbar) {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

:deep(.monaco-scrollable-element > .scrollbar > .slider) {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
}
</style>