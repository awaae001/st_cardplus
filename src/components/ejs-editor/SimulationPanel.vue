<template>
  <div class="simulation-panel h-full flex flex-col">
    <div class="header mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        模拟测试
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        输入变量值测试阶段匹配逻辑和代码执行结果
      </p>
    </div>

    <!-- 配置检查 -->
    <div v-if="!isConfigValid" class="config-check mb-4">
      <el-alert
        type="warning"
        title="无法进行测试"
        :description="configStatusMessage"
        :closable="false"
        show-icon
      />
    </div>

    <div v-else class="simulation-content flex-1 flex flex-col">
      <!-- 测试输入区 -->
      <div class="test-input mb-6">
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
            <i class="iconify mdi:play-circle mr-1"></i>
            运行测试
          </h4>
          
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <label class="block text-sm text-blue-700 dark:text-blue-300 mb-2">
                {{ variableAlias || '变量' }} 的值:
              </label>
              <el-input-number
                v-model="testValue"
                :min="testValueRange.min"
                :max="testValueRange.max"
                :precision="0"
                :step="1"
                controls-position="right"
                class="w-full"
                @change="runSimulation"
              />
            </div>
            
            <div class="flex flex-col space-y-2">
              <el-button type="primary" @click="runSimulation" :loading="isSimulating">
                <i class="iconify mdi:play mr-1"></i>
                测试
              </el-button>
              <el-button @click="runBatchTest" size="small">
                批量测试
              </el-button>
            </div>
          </div>

          <!-- 快速测试值 -->
          <div class="quick-values mt-4">
            <div class="text-xs text-blue-700 dark:text-blue-300 mb-2">快速测试值:</div>
            <div class="flex flex-wrap gap-2">
              <el-tag
                v-for="value in suggestedTestValues"
                :key="value"
                size="small"
                class="cursor-pointer"
                @click="setTestValue(value)"
              >
                {{ value }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试结果区 -->
      <div v-if="simulationResult" class="test-result mb-6">
        <div 
          class="result-card rounded-lg p-4 border"
          :class="{
            'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800': simulationResult.isValid && simulationResult.matchedStage,
            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800': !simulationResult.isValid,
            'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800': simulationResult.isValid && !simulationResult.matchedStage
          }"
        >
          <div class="flex items-start justify-between mb-3">
            <h4 class="text-sm font-medium" :class="{
              'text-green-900 dark:text-green-100': simulationResult.isValid && simulationResult.matchedStage,
              'text-red-900 dark:text-red-100': !simulationResult.isValid,
              'text-yellow-900 dark:text-yellow-100': simulationResult.isValid && !simulationResult.matchedStage
            }">
              <i 
                class="iconify mr-1"
                :class="{
                  'mdi:check-circle': simulationResult.isValid && simulationResult.matchedStage,
                  'mdi:alert-circle': !simulationResult.isValid,
                  'mdi:help-circle': simulationResult.isValid && !simulationResult.matchedStage
                }"
              ></i>
              测试结果
            </h4>
            
            <div class="text-xs" :class="{
              'text-green-600 dark:text-green-400': simulationResult.isValid && simulationResult.matchedStage,
              'text-red-600 dark:text-red-400': !simulationResult.isValid,
              'text-yellow-600 dark:text-yellow-400': simulationResult.isValid && !simulationResult.matchedStage
            }">
              {{ formatTime(new Date()) }}
            </div>
          </div>

          <div class="result-details space-y-3">
            <!-- 输入值 -->
            <div class="detail-item">
              <span class="detail-label">输入值:</span>
              <code class="detail-value bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {{ variableAlias }} = {{ simulationResult.inputValue }}
              </code>
            </div>

            <!-- 匹配的阶段 -->
            <div class="detail-item">
              <span class="detail-label">匹配阶段:</span>
              <div v-if="simulationResult.matchedStage" class="matched-stage">
                <div class="flex items-center space-x-2">
                  <div class="stage-number bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    {{ simulationResult.matchedStage.order + 1 }}
                  </div>
                  <span class="font-medium">{{ simulationResult.matchedStage.name }}</span>
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  条件: {{ simulationResult.matchedCondition }}
                </div>
              </div>
              <span v-else class="text-yellow-600 dark:text-yellow-400">无匹配阶段</span>
            </div>

            <!-- 生成的输出 -->
            <div v-if="simulationResult.generatedOutput" class="detail-item">
              <span class="detail-label">生成内容:</span>
              <div class="generated-output bg-gray-100 dark:bg-gray-700 p-3 rounded mt-1">
                <pre class="text-xs whitespace-pre-wrap">{{ simulationResult.generatedOutput }}</pre>
              </div>
            </div>

            <!-- 错误信息 -->
            <div v-if="simulationResult.error" class="detail-item">
              <span class="detail-label text-red-600">错误:</span>
              <div class="error-message bg-red-100 dark:bg-red-900/30 p-2 rounded mt-1 text-sm text-red-700 dark:text-red-300">
                {{ simulationResult.error }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 批量测试结果 -->
      <div v-if="batchTestResults.length > 0" class="batch-results mb-6">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          <i class="iconify mdi:chart-line mr-1"></i>
          批量测试结果
        </h4>
        
        <div class="results-table bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div class="table-header bg-gray-50 dark:bg-gray-900 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-4 gap-4">
              <div>输入值</div>
              <div>匹配阶段</div>
              <div>条件</div>
              <div>状态</div>
            </div>
          </div>
          
          <div class="table-body max-h-64 overflow-y-auto">
            <div
              v-for="(result, index) in batchTestResults"
              :key="index"
              class="table-row px-4 py-2 text-xs border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div class="grid grid-cols-4 gap-4 items-center">
                <div class="font-mono">{{ result.inputValue }}</div>
                <div>
                  <span v-if="result.matchedStage" class="font-medium">
                    {{ result.matchedStage.name }}
                  </span>
                  <span v-else class="text-gray-400">无匹配</span>
                </div>
                <div class="font-mono text-gray-600 dark:text-gray-400">
                  {{ result.matchedCondition }}
                </div>
                <div>
                  <el-tag
                    :type="result.isValid ? (result.matchedStage ? 'success' : 'warning') : 'danger'"
                    size="small"
                  >
                    {{ result.isValid ? (result.matchedStage ? '成功' : '无匹配') : '错误' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 阶段覆盖分析 -->
      <div class="coverage-analysis">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          <i class="iconify mdi:chart-donut mr-1"></i>
          阶段覆盖分析
        </h4>
        
        <div class="coverage-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 阶段列表 -->
          <div class="stages-overview bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">当前阶段配置</div>
            <div class="space-y-2">
              <div
                v-for="stage in sortedStages"
                :key="stage.id"
                class="stage-item flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded text-xs"
              >
                <div class="flex items-center space-x-2">
                  <div class="stage-number bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {{ stage.order + 1 }}
                  </div>
                  <span class="font-medium">{{ stage.name || '未命名' }}</span>
                </div>
                <code class="text-gray-500">{{ generateConditionText(stage) }}</code>
              </div>
            </div>
          </div>

          <!-- 测试建议 -->
          <div class="test-suggestions bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div class="text-xs text-blue-700 dark:text-blue-300 mb-2">测试建议</div>
            <div class="space-y-2 text-xs">
              <div class="suggestion-item">
                <div class="font-medium text-blue-800 dark:text-blue-200">边界值测试</div>
                <div class="text-blue-600 dark:text-blue-400">
                  测试每个阶段的边界值，确保条件判断正确
                </div>
              </div>
              <div class="suggestion-item">
                <div class="font-medium text-blue-800 dark:text-blue-200">负值测试</div>
                <div class="text-blue-600 dark:text-blue-400">
                  测试负数或超出范围的值，验证错误处理
                </div>
              </div>
              <div class="suggestion-item">
                <div class="font-medium text-blue-800 dark:text-blue-200">覆盖测试</div>
                <div class="text-blue-600 dark:text-blue-400">
                  确保每个阶段都能被正确匹配
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElInputNumber, ElButton, ElAlert, ElTag, ElMessage } from 'element-plus'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import type { SimulationResult, Stage } from './types'

// Store
const ejsStore = useEjsEditorStore()

// 响应式数据
const testValue = ref<number>(0)
const isSimulating = ref(false)
const simulationResult = ref<SimulationResult | null>(null)
const batchTestResults = ref<SimulationResult[]>([])

// 计算属性
const isConfigValid = computed(() => ejsStore.isConfigValid)
const variableAlias = computed(() => ejsStore.variableConfig.alias)
const sortedStages = computed(() => ejsStore.sortedStages)

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

const testValueRange = computed(() => {
  if (sortedStages.value.length === 0) {
    return { min: 0, max: 100 }
  }
  
  const values = sortedStages.value.flatMap(stage => [
    stage.condition.value,
    stage.condition.maxValue || 0
  ]).filter(v => v !== undefined)
  
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 100)
  
  return { min: min - 10, max: max + 10 }
})

const suggestedTestValues = computed(() => {
  if (sortedStages.value.length === 0) return [0, 10, 50, 100]
  
  const values = new Set<number>()
  
  // 添加每个阶段的关键值
  sortedStages.value.forEach(stage => {
    const { condition } = stage
    values.add(condition.value)
    
    if (condition.maxValue !== undefined) {
      values.add(condition.maxValue)
    }
    
    // 添加边界值
    values.add(condition.value - 1)
    values.add(condition.value + 1)
    
    if (condition.maxValue !== undefined) {
      values.add(condition.maxValue - 1)
      values.add(condition.maxValue + 1)
    }
  })
  
  // 添加一些通用值
  values.add(0)
  values.add(-1)
  
  return Array.from(values)
    .filter(v => v >= testValueRange.value.min && v <= testValueRange.value.max)
    .sort((a, b) => a - b)
    .slice(0, 10) // 限制数量
})

// 方法
const runSimulation = async () => {
  if (!isConfigValid.value) {
    ElMessage.warning('配置不完整，无法进行测试')
    return
  }

  isSimulating.value = true
  
  try {
    const result = ejsStore.simulateValue(testValue.value)
    simulationResult.value = result
    
    if (result.isValid) {
      if (result.matchedStage) {
        ElMessage.success(`匹配到阶段: ${result.matchedStage.name}`)
      } else {
        ElMessage.warning('没有匹配的阶段')
      }
    } else {
      ElMessage.error('测试失败: ' + result.error)
    }
  } catch (error) {
    ElMessage.error('测试过程中发生错误: ' + (error as Error).message)
  } finally {
    isSimulating.value = false
  }
}

const runBatchTest = async () => {
  if (!isConfigValid.value) {
    ElMessage.warning('配置不完整，无法进行批量测试')
    return
  }

  const testValues = suggestedTestValues.value
  batchTestResults.value = []
  
  try {
    for (const value of testValues) {
      const result = ejsStore.simulateValue(value)
      batchTestResults.value.push(result)
    }
    
    const successCount = batchTestResults.value.filter(r => r.isValid && r.matchedStage).length
    const totalCount = batchTestResults.value.length
    
    ElMessage.success(`批量测试完成: ${successCount}/${totalCount} 个测试成功`)
  } catch (error) {
    ElMessage.error('批量测试失败: ' + (error as Error).message)
  }
}

const setTestValue = (value: number) => {
  testValue.value = value
  runSimulation()
}

const generateConditionText = (stage: Stage): string => {
  const alias = variableAlias.value || '变量'
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

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}
</script>

<style scoped>
.simulation-panel {
  height: 100%;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(75 85 99);
}

.dark .detail-label {
  color: rgb(156 163 175);
}

.detail-value {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
}

.matched-stage > * + * {
  margin-top: 0.25rem;
}

.stage-number {
  font-size: 10px;
}

.results-table {
  font-size: 13px;
}

.table-row:last-child {
  border-bottom: none;
}

.suggestion-item > * + * {
  margin-top: 0.25rem;
}

.iconify {
  width: 1em;
  height: 1em;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  padding-right: 50px;
}

.generated-output {
  max-height: 200px;
  overflow-y: auto;
}

.generated-output pre {
  margin: 0;
  font-family: 'JetBrains Mono', Monaco, 'Courier New', monospace;
}
</style>