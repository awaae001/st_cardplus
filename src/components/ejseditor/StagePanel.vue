<template>
  <div class="stage-panel">
    <div class="panel-content">
      <!-- 阶段列表头部 -->
      <div class="section">
        <div class="section-header">
          <h4 class="section-title">阶段管理</h4>
          <el-button
            type="primary"
            size="small"
            :icon="Plus"
            @click="store.addStage"
          >
            添加阶段
          </el-button>
        </div>
        
        <div v-if="store.stages.length === 0" class="empty-state">
          <el-empty description="暂无阶段" :image-size="60">
            <el-button type="primary" @click="store.addStage">
              添加第一个阶段
            </el-button>
          </el-empty>
        </div>
      </div>

      <!-- 阶段列表 -->
      <div v-if="store.stages.length > 0" class="section">
        <div class="stage-list">
          <div
            v-for="(stage, index) in store.stages"
            :key="stage.id"
            class="stage-item"
            :class="{ 'is-selected': stage.id === store.selectedStageId }"
            @click="selectStage(stage.id)"
          >
            <div class="stage-header">
              <div class="stage-info">
                <span class="stage-index">{{ index + 1 }}</span>
                <span class="stage-name">{{ stage.name }}</span>
              </div>
              <div class="stage-actions">
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  circle
                  @click.stop="removeStage(stage.id)"
                />
              </div>
            </div>
            <div class="stage-condition">
              <el-tag size="small" type="info">
                {{ formatConditions(stage) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 阶段详情编辑 -->
      <div v-if="store.selectedStage" class="section">
        <h4 class="section-title">阶段详情</h4>
        
        <!-- 阶段名称 -->
        <div class="form-item">
          <label>阶段名称</label>
          <el-input
            :model-value="store.selectedStage.name"
            @input="updateStageName"
            placeholder="输入阶段名称"
          />
        </div>

        <!-- 条件设置 -->
        <div class="form-item">
          <label>触发条件</label>
          <div class="condition-group">
            <div class="conjunction-selector">
              <el-radio-group :model-value="store.selectedStage.conjunction" @change="updateConjunction" size="small">
                <el-radio-button label="and">与 (AND)</el-radio-button>
                <el-radio-button label="or">或 (OR)</el-radio-button>
              </el-radio-group>
            </div>

            <div v-for="(condition) in store.selectedStage.conditions" :key="condition.id" class="condition-builder">
              <el-select
                :model-value="condition.variablePath"
                @change="(val: string) => updateCondition(condition.id, { variablePath: val })"
                placeholder="选择变量"
                style="width: 150px"
                filterable
              >
                <el-option
                  v-for="variable in flatVariables"
                  :key="variable.path"
                  :label="variable.path"
                  :value="variable.path"
                />
              </el-select>

              <el-select
                :model-value="condition.type"
                @change="(val: Condition['type']) => updateCondition(condition.id, { type: val })"
                style="width: 120px"
              >
                <el-option label="<" value="less" />
                <el-option label="<=" value="lessEqual" />
                <el-option label="==" value="equal" />
                <el-option label=">" value="greater" />
                <el-option label=">=" value="greaterEqual" />
                <el-option label="范围" value="range" />
                <el-option label="是" value="is" />
                <el-option label="不是" value="isNot" />
              </el-select>

              <el-input
                :model-value="condition.value"
                @input="(val: string) => updateCondition(condition.id, { value: val })"
                style="width: 100px"
                placeholder="值"
              />

              <template v-if="condition.type === 'range'">
                <span class="range-separator">到</span>
                <el-input
                  :model-value="condition.endValue"
                  @input="(val: string) => updateCondition(condition.id, { endValue: val })"
                  style="width: 100px"
                  placeholder="结束值"
                />
              </template>

              <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click="removeCondition(condition.id)"
              />
            </div>

            <el-button :icon="Plus" @click="addCondition" class="mt-2">
              添加条件
            </el-button>
          </div>
        </div>

        <!-- 内容编辑 -->
        <div class="form-item">
          <label>
            阶段内容
            <el-tooltip content="支持YAML格式，内容将被嵌入到EJS模板中" placement="top">
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </label>
          <el-input
            v-model="localContent"
            type="textarea"
            :rows="8"
            placeholder="输入该阶段对应的内容（YAML格式）..."
            class="content-textarea"
          />
        </div>

        <!-- 预览当前阶段 -->
        <div class="form-item">
          <label>内容预览</label>
          <div class="content-preview">
            <pre>{{ store.selectedStage.content || '(空内容)' }}</pre>
          </div>
        </div>
      </div>

      <!-- 批量操作 -->
      <div v-if="store.stages.length > 0" class="section">
        <h4 class="section-title">批量操作</h4>
        <div class="batch-actions">
          <el-button-group>
            <el-button size="small" @click="sortStagesByCondition">
              按条件排序
            </el-button>
            <el-button size="small" @click="clearAllStages" type="danger">
              清空所有阶段
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, QuestionFilled } from '@element-plus/icons-vue'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import type { Stage, Condition, VariableNode } from '@/stores/ejsEditor'

const store = useEjsEditorStore()
const localContent = ref('')

const flatVariables = computed(() => {
  const result: { path: string; alias: string }[] = []
  function traverse(nodes: VariableNode[]) {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      } else {
        result.push({ path: node.path, alias: node.key })
      }
    }
  }
  traverse(store.variableTree)
  return result
})

// 当选择的阶段变化时，更新本地内容
watch(
  () => store.selectedStage,
  (newStage) => {
    if (newStage) {
      localContent.value = newStage.content
    } else {
      localContent.value = ''
    }
  },
  { immediate: true }
)

// 使用防抖更新store
let debounceTimer: NodeJS.Timeout
watch(localContent, (newValue) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (store.selectedStage && newValue !== store.selectedStage.content) {
      store.updateStage(store.selectedStageId, { content: newValue })
    }
  },  50)
})

function selectStage(stageId: string) {
  store.selectedStageId = stageId
}

async function removeStage(stageId: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个阶段吗？', '确认删除', {
      type: 'warning'
    })
    store.removeStage(stageId)
    ElMessage.success('阶段已删除')
  } catch {
    // 用户取消
  }
}

function updateStageName(value: string) {
  if (store.selectedStage) {
    store.updateStage(store.selectedStageId, { name: value })
  }
}

function updateConjunction(value: 'and' | 'or') {
  if (store.selectedStage) {
    store.updateStage(store.selectedStageId, { conjunction: value })
  }
}

function addCondition() {
  if (!store.selectedStage) return
  const newCondition: Condition = {
    id: `cond_${Date.now()}`,
    variablePath: '',
    variableAlias: '',
    type: 'equal',
    value: ''
  }
  const conditions = [...store.selectedStage.conditions, newCondition]
  store.updateStage(store.selectedStageId, { conditions })
}

function removeCondition(conditionId: string) {
  if (!store.selectedStage) return
  const conditions = store.selectedStage.conditions.filter(c => c.id !== conditionId)
  store.updateStage(store.selectedStageId, { conditions })
}

function updateCondition(conditionId: string, updates: Partial<Condition>) {
  if (!store.selectedStage) return
  
  const conditions = store.selectedStage.conditions.map(c => {
    if (c.id === conditionId) {
      const updatedCondition = { ...c, ...updates }
      // 如果更新了 variablePath，同步更新 variableAlias
      if (updates.variablePath) {
        const foundVar = flatVariables.value.find(v => v.path === updates.variablePath)
        updatedCondition.variableAlias = foundVar ? foundVar.alias : ''
      }
      return updatedCondition
    }
    return c
  })
  
  store.updateStage(store.selectedStageId, { conditions })
}

function formatSingleCondition(condition: Condition): string {
  const { variableAlias, type, value, endValue } = condition
  const valStr = typeof value === 'string' ? `'${value}'` : value

  switch (type) {
    case 'less':
      return `${variableAlias || '变量'} < ${valStr}`
    case 'lessEqual':
      return `${variableAlias || '变量'} <= ${valStr}`
    case 'equal':
      return `${variableAlias || '变量'} == ${valStr}`
    case 'greater':
      return `${variableAlias || '变量'} > ${valStr}`
    case 'greaterEqual':
      return `${variableAlias || '变量'} >= ${valStr}`
    case 'range':
      const endValStr = typeof endValue === 'string' ? `'${endValue}'` : endValue
      return `${variableAlias || '变量'} in [${valStr}, ${endValStr})`
    case 'is':
      return `${variableAlias || '变量'} is ${valStr}`
    case 'isNot':
      return `${variableAlias || '变量'} is not ${valStr}`
    default:
      return '未知条件'
  }
}

function formatConditions(stage: Stage): string {
  if (!stage.conditions || stage.conditions.length === 0) {
    return '无条件 (始终激活)'
  }
  const separator = stage.conjunction === 'and' ? ' AND ' : ' OR '
  return stage.conditions.map(formatSingleCondition).join(separator)
}

function sortStagesByCondition() {
  const sorted = [...store.stages].sort((a, b) => {
    const valA = a.conditions?.[0]?.value ?? 0
    const valB = b.conditions?.[0]?.value ?? 0
    if (typeof valA === 'number' && typeof valB === 'number') {
      return valA - valB
    }
    return 0
  })
  store.stages = sorted
  ElMessage.success('阶段已按第一个条件的值排序')
}

async function clearAllStages() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有阶段吗？此操作不可恢复。',
      '确认清空',
      { type: 'warning' }
    )
    store.stages = []
    store.selectedStageId = ''
    ElMessage.success('已清空所有阶段')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.stage-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.help-icon {
  color: var(--el-color-info);
  cursor: help;
}

.empty-state {
  text-align: center;
  padding: 20px;
}

.stage-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stage-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.stage-item:hover {
  border-color: var(--el-color-primary-light-5);
  background-color: var(--el-fill-color-extra-light);
}

.stage-item.is-selected {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stage-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 500;
}

.stage-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.stage-condition {
  margin-top: 4px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-item label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  display: flex;
  align-items: center;
  gap: 4px;
}

.condition-builder {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.range-separator {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.content-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.content-preview {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
  background-color: var(--el-bg-color-page);
  max-height: 150px;
  overflow-y: auto;
}

.content-preview pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .panel-content {
    padding: 12px;
  }
  
  .condition-builder {
    flex-direction: column;
    align-items: stretch;
  }
  
  .condition-builder .el-select,
  .condition-builder .el-input-number {
    width: 100% !important;
  }
  
  .batch-actions {
    flex-direction: column;
  }
  
  .batch-actions .el-button-group {
    width: 100%;
  }
  
  .batch-actions .el-button {
    flex: 1;
  }
}
</style>