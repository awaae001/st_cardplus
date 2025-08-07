<template>
  <div class="simulation-panel">
    <div class="panel-content">
      <!-- 模拟头部 -->
      <div class="simulation-header" :class="{ 'mobile-header': isMobile }">
        <h4 class="section-title">模拟测试</h4>
        <el-tooltip content="通过输入不同的变量值来测试模板输出" placement="top">
          <el-icon class="help-icon"><QuestionFilled /></el-icon>
        </el-tooltip>
      </div>

      <!-- 模拟控制 -->
      <div class="simulation-controls">
        <div v-if="store.flatVariables.length === 0" class="empty-state">
          <el-text type="info">没有可模拟的变量</el-text>
          <el-text type="info" size="small">请先在“变量定义”中添加变量</el-text>
        </div>
        
        <div v-else v-for="variable in store.flatVariables" :key="variable.id" class="form-item">
          <label>
            {{ variable.alias || '变量' }}
            <el-text type="info" size="small">({{ variable.readablePath }})</el-text>
          </label>
          <el-input
            v-model="store.simulationValues[variable.readablePath]"
            style="width: 100%"
            :placeholder="`输入 ${variable.alias} 的测试值`"
          />
        </div>

        <el-button
          type="primary"
          @click="store.testSimulation"
          :disabled="!store.ejsTemplate"
          :icon="VideoPlay"
          :size="isMobile ? 'default' : 'default'"
          style="width: 100%"
        >
          {{ isMobile ? '运行测试' : '运行测试' }}
        </el-button>
      </div>

      <!-- 匹配的阶段显示 -->
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
            :class="{ 'is-matched': isStageMatched(stage) }"
          >
            <div class="row-index">{{ index + 1 }}</div>
            <div class="row-name">{{ stage.name }}</div>
            <div class="row-condition">{{ formatConditions(stage) }}</div>
            <div class="row-status">
              <el-tag v-if="isStageMatched(stage)" type="success" size="small">
                匹配
              </el-tag>
              <el-tag v-else type="info" size="small">
                未匹配
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
      <!-- 测试建议 -->
  </div>
</template>

<script setup lang="ts">
import { QuestionFilled, VideoPlay } from '@element-plus/icons-vue'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import { useDevice } from '@/composables/useDevice'
import type { Stage, Condition } from '@/stores/ejsEditor'

const store = useEjsEditorStore()
const { isMobile } = useDevice()

function formatSingleCondition(condition: Condition): string {
  const { variableAlias, type, value, endValue } = condition
  const valStr = typeof value === 'string' ? `'${value}'` : value

  switch (type) {
    case 'less': return `${variableAlias || '变量'} < ${valStr}`
    case 'lessEqual': return `${variableAlias || '变量'} <= ${valStr}`
    case 'equal': return `${variableAlias || '变量'} == ${valStr}`
    case 'greater': return `${variableAlias || '变量'} > ${valStr}`
    case 'greaterEqual': return `${variableAlias || '变量'} >= ${valStr}`
    case 'range':
      const endValStr = typeof endValue === 'string' ? `'${endValue}'` : endValue
      return `${variableAlias || '变量'} in [${valStr}, ${endValStr})`
    case 'is': return `${variableAlias || '变量'} is ${valStr}`
    case 'isNot': return `${variableAlias || '变量'} is not ${valStr}`
    default: return '未知条件'
  }
}

function formatConditions(stage: Stage): string {
  if (!stage.conditions || stage.conditions.length === 0) {
    return '无条件'
  }
  const separator = stage.conjunction === 'and' ? ' AND ' : ' OR '
  return stage.conditions.map(formatSingleCondition).join(separator)
}

function isStageMatched(stage: Stage): boolean {
  const check = (cond: Condition) => {
    const simValue = store.simulationValues[cond.variablePath] ?? 0
    const condValue = cond.value
    const condEndValue = cond.endValue

    const numSimValue = Number(simValue)
    const numCondValue = Number(condValue)
    const numCondEndValue = Number(condEndValue)

    if (!isNaN(numSimValue) && !isNaN(numCondValue)) {
      switch (cond.type) {
        case 'less': return numSimValue < numCondValue
        case 'lessEqual': return numSimValue <= numCondValue
        case 'equal': return numSimValue == numCondValue
        case 'greater': return numSimValue > numCondValue
        case 'greaterEqual': return numSimValue >= numCondValue
        case 'range': return numSimValue >= numCondValue && numSimValue < numCondEndValue
      }
    }

    switch (cond.type) {
      case 'equal': return String(simValue) == String(condValue)
      case 'is': return String(simValue) === String(condValue)
      case 'isNot': return String(simValue) !== String(condValue)
      default: return false
    }
  }

  if (!stage.conditions || stage.conditions.length === 0) return false
  if (stage.conjunction === 'and') return stage.conditions.every(check)
  return stage.conditions.some(check)
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

/* 移动端样式优化 */
@media (max-width: 768px) {
  .simulation-panel {
    padding: 8px 12px;
  }

  .panel-content {
    padding: 0;
    gap: 12px;
  }

  .mobile-header {
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .mobile-header .section-title {
    text-align: center;
  }

  .form-item label {
    font-size: 11px;
  }

  .form-item .el-input {
    font-size: 14px;
  }
  
  .value-buttons {
    justify-content: center;
    gap: 3px;
  }

  .value-buttons .el-button {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .comparison-row {
    grid-template-columns: 20px 1fr 60px 45px;
    gap: 3px;
    padding: 4px;
    font-size: 11px;
  }

  .row-name {
    font-size: 11px;
  }

  .row-condition {
    font-size: 10px;
  }
  
  .suggestion-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 8px;
    gap: 4px;
  }

  .suggestion-value {
    min-width: auto;
    font-size: 14px;
  }

  .suggestion-desc {
    font-size: 11px;
  }

  .result-container {
    min-height: 80px;
  }

  .result-content pre {
    font-size: 11px;
  }

  .empty-state {
    padding: 16px;
    text-align: center;
  }
}

/* 平板端优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .panel-content {
    padding: 12px;
  }

  .comparison-row {
    grid-template-columns: 25px 1fr 80px 55px;
  }
}
</style>