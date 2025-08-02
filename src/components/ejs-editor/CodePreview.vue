<template>
  <div class="code-preview h-full flex flex-col">
    <div class="header mb-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            代码预览
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            实时预览生成的 EJS 模板代码
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <el-button 
            size="small" 
            @click="refreshCode"
            :loading="isGenerating"
          >
            <i class="iconify mdi:refresh mr-1"></i>
            刷新
          </el-button>
          <el-button 
            size="small" 
            type="primary" 
            @click="copyCode"
            :disabled="!generatedCode"
          >
            <i class="iconify mdi:content-copy mr-1"></i>
            复制代码
          </el-button>
        </div>
      </div>
    </div>

    <!-- 配置状态检查 -->
    <div v-if="!isConfigValid" class="config-status mb-4">
      <el-alert
        type="warning"
        title="配置不完整"
        :description="configStatusMessage"
        :closable="false"
        show-icon
      />
    </div>

    <!-- 代码预览区域 -->
    <div v-else class="code-area flex-1 flex flex-col">
      <!-- 代码统计 -->
      <div class="code-stats mb-3">
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
            <span>{{ codeStats.lines }} 行</span>
            <span>{{ codeStats.characters }} 字符</span>
            <span>{{ codeStats.stages }} 个阶段</span>
          </div>
          <div class="flex items-center space-x-2">
            <el-tag size="small" type="info">EJS + YAML</el-tag>
            <el-tag 
              v-if="lastGenerated" 
              size="small" 
              type="success"
            >
              {{ formatTime(lastGenerated) }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- Monaco Editor 代码显示 -->
      <div class="code-container flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div ref="codeEditorContainer" class="w-full h-full"></div>
      </div>

      <!-- 代码操作工具栏 -->
      <div class="code-toolbar mt-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>语言: EJS</span>
            <span>模式: 只读</span>
            <el-tag 
              v-if="codeValidation.isValid" 
              size="small" 
              type="success"
            >
              代码有效
            </el-tag>
            <el-tag 
              v-else 
              size="small" 
              type="danger"
            >
              代码错误
            </el-tag>
          </div>
          
          <div class="flex items-center space-x-2">
            <el-button 
              size="small" 
              text 
              @click="downloadCode"
              :disabled="!generatedCode"
            >
              <i class="iconify mdi:download mr-1"></i>
              下载
            </el-button>
            <el-button 
              size="small" 
              text 
              @click="shareCode"
              :disabled="!generatedCode"
            >
              <i class="iconify mdi:share mr-1"></i>
              分享
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 代码结构分析 -->
    <div v-if="generatedCode && showAnalysis" class="code-analysis mt-4">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <i class="iconify mdi:code-tags mr-1"></i>
          代码结构分析
        </h4>
        
        <div class="space-y-3">
          <!-- 变量声明 -->
          <div class="analysis-item">
            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">变量声明</div>
            <code class="block bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs">
              const {{ ejsStore.variableConfig.alias }} = getvar('{{ ejsStore.variableConfig.path }}');
            </code>
          </div>

          <!-- 条件分支 -->
          <div class="analysis-item">
            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">条件分支 ({{ ejsStore.stages.length }} 个)</div>
            <div class="space-y-1">
              <div 
                v-for="(stage, index) in ejsStore.sortedStages" 
                :key="stage.id"
                class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs"
              >
                <span class="font-mono">
                  {{ index === 0 ? 'if' : 'else if' }} ({{ generateConditionCode(stage) }})
                </span>
                <span class="text-gray-500">
                  {{ stage.name }}
                </span>
              </div>
              <div class="flex items-center justify-between bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs">
                <span class="font-mono text-red-600">else (错误处理)</span>
                <span class="text-red-500">toastr.error</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 高亮显示对话框 -->
    <el-dialog
      v-model="highlightDialogVisible"
      title="高亮匹配的代码块"
      width="800px"
    >
      <div class="highlight-content">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          输入一个测试值，查看哪个代码块会被执行：
        </p>
        
        <div class="flex items-center space-x-3 mb-4">
          <el-input-number
            v-model="testValue"
            :min="0"
            :max="9999"
            placeholder="输入测试值"
            class="w-32"
          />
          <el-button type="primary" @click="highlightMatchingBlock">
            高亮匹配
          </el-button>
        </div>

        <div v-if="matchedStage" class="matched-result bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div class="text-sm font-medium text-green-800 dark:text-green-200">
            匹配结果: {{ matchedStage.name }}
          </div>
          <div class="text-xs text-green-600 dark:text-green-400 mt-1">
            条件: {{ generateConditionText(matchedStage) }}
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElButton, ElAlert, ElTag, ElDialog, ElInputNumber, ElMessage } from 'element-plus'
import * as monaco from 'monaco-editor'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import type { Stage } from './types'

// Store
const ejsStore = useEjsEditorStore()

// 响应式数据
const codeEditorContainer = ref<HTMLElement>()
const isGenerating = ref(false)
const lastGenerated = ref<Date | null>(null)
const showAnalysis = ref(true)
const highlightDialogVisible = ref(false)
const testValue = ref<number>(0)
const matchedStage = ref<Stage | null>(null)

let codeEditor: monaco.editor.IStandaloneCodeEditor | null = null

// 计算属性
const isConfigValid = computed(() => ejsStore.isConfigValid)

const configStatusMessage = computed(() => {
  if (!ejsStore.variableConfig.path) {
    return '请先配置变量路径'
  }
  if (!ejsStore.variableConfig.alias) {
    return '请先配置变量别名'
  }
  if (ejsStore.stages.length === 0) {
    return '请至少添加一个阶段'
  }
  return '配置不完整'
})

const generatedCode = computed(() => {
  if (!isConfigValid.value) return ''
  
  try {
    return ejsStore.generateEjsCode()
  } catch (error) {
    console.error('Code generation failed:', error)
    return `// 代码生成失败\n// 错误: ${(error as Error).message}`
  }
})

const codeStats = computed(() => {
  const code = generatedCode.value
  return {
    lines: code.split('\n').length,
    characters: code.length,
    stages: ejsStore.stages.length
  }
})

const codeValidation = computed(() => {
  return ejsStore.validateConfig()
})

// 方法
const initializeCodeEditor = async () => {
  if (!codeEditorContainer.value) return

  try {
    // 设置 EJS 语言支持
    monaco.languages.register({ id: 'ejs' })
    
    // 定义 EJS 语法高亮规则
    monaco.languages.setMonarchTokensProvider('ejs', {
      tokenizer: {
        root: [
          [/<%_.*?_%>/, 'ejs-tag'],
          [/<%.*?%>/, 'ejs-tag'],
          [/.*/, 'yaml-content']
        ]
      }
    })

    // 设置主题
    monaco.editor.defineTheme('ejs-preview-theme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'ejs-tag', foreground: '0066cc', fontStyle: 'bold' },
        { token: 'yaml-content', foreground: '333333' }
      ],
      colors: {
        'editor.background': '#f9fafb'
      }
    })

    monaco.editor.defineTheme('ejs-preview-theme-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'ejs-tag', foreground: '5dd9ff', fontStyle: 'bold' },
        { token: 'yaml-content', foreground: 'e5e7eb' }
      ],
      colors: {
        'editor.background': '#1f2937'
      }
    })

    // 创建编辑器
    codeEditor = monaco.editor.create(codeEditorContainer.value, {
      language: 'ejs',
      theme: document.documentElement.classList.contains('dark') ? 'ejs-preview-theme-dark' : 'ejs-preview-theme',
      value: generatedCode.value,
      readOnly: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      automaticLayout: true,
      fontSize: 13,
      fontFamily: 'JetBrains Mono, Monaco, "Courier New", monospace',
      renderWhitespace: 'selection'
    })

    updateCodeEditor()

  } catch (error) {
    console.error('Failed to initialize code editor:', error)
    ElMessage.error('代码预览初始化失败')
  }
}

const updateCodeEditor = () => {
  if (!codeEditor) return

  const code = generatedCode.value
  if (codeEditor.getValue() !== code) {
    codeEditor.setValue(code)
    lastGenerated.value = new Date()
  }
}

const refreshCode = async () => {
  isGenerating.value = true
  
  try {
    await nextTick()
    updateCodeEditor()
    ElMessage.success('代码已刷新')
  } catch (error) {
    ElMessage.error('刷新失败: ' + (error as Error).message)
  } finally {
    isGenerating.value = false
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const downloadCode = () => {
  try {
    const blob = new Blob([generatedCode.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ejs-template-${Date.now()}.ejs`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('代码已下载')
  } catch (error) {
    ElMessage.error('下载失败: ' + (error as Error).message)
  }
}

const shareCode = async () => {
  try {
    const shareData = {
      title: 'EJS 模板代码',
      text: `变量: ${ejsStore.variableConfig.alias}\n阶段数: ${ejsStore.stages.length}`,
      url: window.location.href
    }
    
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await copyCode()
      ElMessage.info('已复制代码，可以手动分享')
    }
  } catch (error) {
    ElMessage.error('分享失败')
  }
}

const generateConditionCode = (stage: Stage): string => {
  const alias = ejsStore.variableConfig.alias
  const { condition } = stage
  
  switch (condition.operator) {
    case '<':
      return `${alias} < ${condition.value}`
    case '<=':
      return `${alias} <= ${condition.value}`
    case '==':
      return `${alias} == ${condition.value}`
    case '>':
      return `${alias} > ${condition.value}`
    case '>=':
      return `${alias} >= ${condition.value}`
    case 'range':
      return `${alias} >= ${condition.value} && ${alias} < ${condition.maxValue}`
    default:
      return '无效条件'
  }
}

const generateConditionText = (stage: Stage): string => {
  const alias = ejsStore.variableConfig.alias
  const { condition } = stage
  
  switch (condition.operator) {
    case '<':
      return `${alias} < ${condition.value}`
    case '<=':
      return `${alias} <= ${condition.value}`
    case '==':
      return `${alias} == ${condition.value}`
    case '>':
      return `${alias} > ${condition.value}`
    case '>=':
      return `${alias} >= ${condition.value}`
    case 'range':
      return `${condition.value} <= ${alias} < ${condition.maxValue || '∞'}`
    default:
      return '无效条件'
  }
}

const highlightMatchingBlock = () => {
  const result = ejsStore.simulateValue(testValue.value)
  matchedStage.value = result.matchedStage
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}

// 生命周期和监听器
onMounted(async () => {
  await nextTick()
  await initializeCodeEditor()
})

onUnmounted(() => {
  if (codeEditor) {
    codeEditor.dispose()
    codeEditor = null
  }
})

// 监听配置变化，自动更新代码
watch(
  [
    () => ejsStore.variableConfig,
    () => ejsStore.stages,
    () => ejsStore.stages.map(s => s.content).join('|')
  ],
  () => {
    if (codeEditor && isConfigValid.value) {
      updateCodeEditor()
    }
  },
  { deep: true }
)

// 监听主题变化
watch(
  () => document.documentElement.classList.contains('dark'),
  (isDark) => {
    if (codeEditor) {
      monaco.editor.setTheme(isDark ? 'ejs-preview-theme-dark' : 'ejs-preview-theme')
    }
  }
)
</script>

<style scoped>
.code-preview {
  height: 100%;
}

.code-container {
  min-height: 400px;
}

.analysis-item > * + * {
  margin-top: 0.5rem; /* Equivalent to Tailwind's space-y-2 */
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

/* 自定义滚动条样式 */
:deep(.monaco-scrollable-element > .scrollbar) {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

:deep(.monaco-scrollable-element > .scrollbar > .slider) {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
}

/* 代码高亮样式 */
:deep(.ejs-tag) {
  color: #0066cc;
  font-weight: bold;
}

:deep(.yaml-content) {
  color: #333333;
}

.dark :deep(.ejs-tag) {
  color: #5dd9ff;
}

.dark :deep(.yaml-content) {
  color: #e5e7eb;
}
</style>