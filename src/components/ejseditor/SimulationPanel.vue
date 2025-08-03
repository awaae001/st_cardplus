<template>
  <div class="simulation-panel">
    <div class="panel-content">
      <!-- 模拟头部 -->
      <div class="simulation-header">
        <h4 class="section-title">模拟测试</h4>
        <el-tooltip content="通过输入不同的变量值来测试模板输出" placement="top">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>

      <!-- 模拟控制 -->
      <div class="simulation-controls">
        <div class="form-item">
          <label>
            {{ store.variableAlias || '变量' }} 值
            <el-text v-if="store.variablePath" type="info" size="small">
              ({{ store.variablePath }})
            </el-text>
          </label>
          <el-input-number
            v-model="store.simulationValue"
            :min="0"
            :max="1000"
            :step="1"
            style="width: 100%"
            controls-position="right"
            placeholder="输入测试值"
          />
        </div>

        <div class="quick-values">
          <label>快速设置:</label>
          <div class="value-buttons">
            <el-button
              v-for="value in quickValues"
              :key="value"
              size="small"
              @click="store.simulationValue = value"
              :type="store.simulationValue === value ? 'primary' : 'default'"
            >
              {{ value }}
            </el-button>
          </div>
        </div>

        <el-button
          type="primary"
          @click="store.testSimulation"
          :disabled="!store.ejsTemplate"
          :icon="VideoPlay"
          style="width: 100%"
        >
          运行测试
        </el-button>
      </div>

      <!-- 匹配的阶段显示 -->
      <div v-if="matchedStage" class="matched-stage">
        <h5>匹配阶段</h5>
        <el-card class="stage-card" shadow="never">
          <div class="stage-header">
            <el-tag type="success" size="small">
              {{ matchedStage.name }}
            </el-tag>
            <el-tag type="info" size="small">
              {{ formatCondition(matchedStage.condition) }}
            </el-tag>
          </div>
          <div class="stage-description">
            条件: <code>{{ store.variableAlias || '变量' }} {{ formatCondition(matchedStage.condition) }}</code>
          </div>
        </el-card>
      </div>

      <!-- 测试结果 -->
      <div class="test-result">
        <h5>输出结果</h5>
        <div class="result-container">
          <div v-if="!store.testResult && !store.ejsTemplate" class="empty-result">
            <el-empty description="请先配置模板" :image-size="60">
              <el-text type="info">
                需要先设置变量路径和阶段，生成模板后才能进行测试
              </el-text>
            </el-empty>
          </div>
          
          <div v-else-if="!store.testResult" class="no-result">
            <el-text type="info">
              点击"运行测试"查看输出结果
            </el-text>
          </div>
          
          <div v-else class="result-content">
            <pre>{{ store.testResult }}</pre>
          </div>
        </div>
      </div>

      <!-- 阶段对比表 -->
      <div v-if="store.stages.length > 0" class="stage-comparison">
        <h5>所有阶段一览</h5>
        <div class="comparison-table">
          <div
            v-for="(stage, index) in store.stages"
            :key="stage.id"
            class="comparison-row"
            :class="{ 
              'is-matched': matchedStage?.id === stage.id,
              'is-active': isValueInStageRange(stage)
            }"
          >
            <div class="row-index">{{ index + 1 }}</div>
            <div class="row-name">{{ stage.name }}</div>
            <div class="row-condition">{{ formatCondition(stage.condition) }}</div>
            <div class="row-status">
              <el-tag
                v-if="matchedStage?.id === stage.id"
                type="success"
                size="small"
              >
                匹配
              </el-tag>
              <el-tag
                v-else-if="isValueInStageRange(stage)"
                type="warning"
                size="small"
              >
                范围内
              </el-tag>
              <el-tag
                v-else
                type="info"
                size="small"
              >
                未匹配
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试建议 -->
      <div v-if="store.stages.length > 0" class="test-suggestions">
        <h5>测试建议</h5>
        <div class="suggestions-list">
          <div
            v-for="suggestion in testSuggestions"
            :key="suggestion.value"
            class="suggestion-item"
            @click="store.simulationValue = suggestion.value"
          >
            <div class="suggestion-value">{{ suggestion.value }}</div>
            <div class="suggestion-desc">{{ suggestion.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QuestionFilled, VideoPlay } from '@element-plus/icons-vue'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import type { Stage, StageCondition } from '@/stores/ejsEditor'

const store = useEjsEditorStore()

// 快速值设置
const quickValues = [0, 10, 25, 50, 75, 100]

// 计算匹配的阶段
const matchedStage = computed(() => {
  if (!store.stages.length) return null
  
  return store.stages.find(stage => {
    return isValueInStageRange(stage, store.simulationValue)
  })
})

// 计算测试建议
const testSuggestions = computed(() => {
  if (!store.stages.length) return []
  
  const suggestions: Array<{ value: number; description: string }> = []
  
  // 为每个阶段生成测试建议
  store.stages.forEach(stage => {
    const condition = stage.condition
    
    switch (condition.type) {
      case 'less':
        suggestions.push({
          value: Math.max(0, condition.value - 1),
          description: `测试 ${stage.name} (< ${condition.value})`
        })
        break
      case 'lessEqual':
        suggestions.push({
          value: condition.value,
          description: `测试 ${stage.name} (<= ${condition.value})`
        })
        break
      case 'equal':
        suggestions.push({
          value: condition.value,
          description: `测试 ${stage.name} (= ${condition.value})`
        })
        break
      case 'greater':
        suggestions.push({
          value: condition.value + 1,
          description: `测试 ${stage.name} (> ${condition.value})`
        })
        break
      case 'greaterEqual':
        suggestions.push({
          value: condition.value,
          description: `测试 ${stage.name} (>= ${condition.value})`
        })
        break
      case 'range':
        const midValue = Math.floor((condition.value + (condition.endValue || condition.value + 10)) / 2)
        suggestions.push({
          value: midValue,
          description: `测试 ${stage.name} (${condition.value}-${condition.endValue})`
        })
        break
    }
  })
  
  // 去重并排序
  const uniqueSuggestions = suggestions
    .filter((item, index, arr) => 
      arr.findIndex(other => other.value === item.value) === index
    )
    .sort((a, b) => a.value - b.value)
  
  return uniqueSuggestions
})

// 方法
function formatCondition(condition: StageCondition): string {
  const { type, value, endValue } = condition
  
  switch (type) {
    case 'less':
      return `< ${value}`
    case 'lessEqual':
      return `<= ${value}`
    case 'equal':
      return `= ${value}`
    case 'greater':
      return `> ${value}`
    case 'greaterEqual':
      return `>= ${value}`
    case 'range':
      return `${value} - ${endValue || value}`
    default:
      return '未知条件'
  }
}

function isValueInStageRange(stage: Stage, value: number = store.simulationValue): boolean {
  const { type, value: conditionValue, endValue } = stage.condition
  
  switch (type) {
    case 'less':
      return value < conditionValue
    case 'lessEqual':
      return value <= conditionValue
    case 'equal':
      return value === conditionValue
    case 'greater':
      return value > conditionValue
    case 'greaterEqual':
      return value >= conditionValue
    case 'range':
      return value >= conditionValue && value < (endValue || conditionValue)
    default:
      return false
  }
}
</script>

<style scoped>
.simulation-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.simulation-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0;
}

.help-icon {
  color: var(--el-color-info);
  cursor: help;
}

.simulation-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-values label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.value-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.matched-stage h5,
.test-result h5,
.stage-comparison h5,
.test-suggestions h5 {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.stage-card {
  border: 1px solid var(--el-color-success-light-5);
  background-color: var(--el-color-success-light-9);
}

.stage-header {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.stage-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.stage-description code {
  background-color: var(--el-fill-color-light);
  padding: 2px 4px;
  border-radius: 2px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.result-container {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  min-height: 100px;
  background-color: var(--el-bg-color-page);
}

.empty-result,
.no-result {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.result-content {
  padding: 12px;
}

.result-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.comparison-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comparison-row {
  display: grid;
  grid-template-columns: 30px 1fr 80px 60px;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s;
}

.comparison-row:hover {
  background-color: var(--el-fill-color-extra-light);
}

.comparison-row.is-matched {
  border-color: var(--el-color-success);
  background-color: var(--el-color-success-light-9);
}

.comparison-row.is-active {
  border-color: var(--el-color-warning);
  background-color: var(--el-color-warning-light-9);
}

.row-index {
  text-align: center;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.row-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-condition {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: var(--el-text-color-secondary);
}

.row-status {
  display: flex;
  justify-content: center;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.suggestion-item:hover {
  border-color: var(--el-color-primary-light-5);
  background-color: var(--el-color-primary-light-9);
}

.suggestion-value {
  font-weight: 500;
  color: var(--el-color-primary);
  min-width: 30px;
  text-align: center;
}

.suggestion-desc {
  color: var(--el-text-color-secondary);
  flex: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .panel-content {
    padding: 12px;
    gap: 16px;
  }
  
  .value-buttons {
    justify-content: center;
  }
  
  .comparison-row {
    grid-template-columns: 25px 1fr 70px 50px;
    gap: 4px;
    padding: 6px;
  }
  
  .suggestion-item {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}
</style>