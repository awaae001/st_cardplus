<template>
  <div class="stage-manager">
    <div class="header mb-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">
            阶段管理
          </h3>
          <p class="text-sm mt-1">
            配置变量的不同数值阶段和对应的条件判断
          </p>
        </div>
        <el-button type="primary" @click="addNewStage" :disabled="!canAddStage">
          <i class="iconify mdi:plus mr-1"></i>
          添加阶段
        </el-button>
      </div>
    </div>

    <!-- 阶段列表 -->
    <div v-if="sortedStages.length > 0" class="stages-list">
      <draggable 
        v-model="sortedStages" 
        @end="handleDragEnd"
        item-key="id"
        class="space-y-3"
      >
        <template #item="{ element: stage, index }">
          <div 
            class="stage-item"
            :class="{
              'stage-selected': ejsStore.editorState.selectedStageId === stage.id,
              'stage-error': stageErrors[stage.id]
            }"
            @click="selectStage(stage.id)"
          >
            <!-- 拖拽手柄 -->
            <div class="drag-handle">
              <i class="iconify mdi:drag-vertical"></i>
            </div>

            <!-- 阶段编号 -->
            <div class="stage-number">
              {{ index + 1 }}
            </div>

            <!-- 阶段内容 -->
            <div class="stage-content flex-1">
              <div class="stage-header">
                <div class="stage-name">
                  <el-input
                    v-model="stage.name"
                    placeholder="阶段名称"
                    @input="() => updateStage(stage.id, { name: stage.name })"
                    @click.stop
                    size="small"
                    :class="{ 'error': !stage.name }"
                  />
                </div>
                <div class="stage-actions">
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click.stop="removeStage(stage.id)"
                  >
                    <i class="iconify mdi:delete text-red-500"></i>
                  </el-button>
                </div>
              </div>

              <div class="stage-condition mt-2">
                <div class="condition-builder">
                  <span class="condition-prefix">当 {{ variableAlias || '变量' }}</span>
                  
                  <el-select
                    v-model="stage.condition.operator"
                    @change="(val) => updateCondition(stage.id, { operator: val })"
                    @click.stop
                    size="small"
                    class="operator-select"
                  >
                    <el-option label="小于" value="<" />
                    <el-option label="小于等于" value="<=" />
                    <el-option label="等于" value="==" />
                    <el-option label="大于等于" value=">=" />
                    <el-option label="大于" value=">" />
                    <el-option label="范围" value="range" />
                  </el-select>

                  <el-input-number
                    v-model="stage.condition.value"
                    @change="(val) => updateCondition(stage.id, { value: val })"
                    @click.stop
                    size="small"
                    :min="0"
                    :max="9999"
                    controls-position="right"
                    class="value-input"
                  />

                  <template v-if="stage.condition.operator === 'range'">
                    <span class="range-separator">到</span>
                    <el-input-number
                      v-model="stage.condition.maxValue"
                      @change="(val) => updateCondition(stage.id, { maxValue: val })"
                      @click.stop
                      size="small"
                      :min="stage.condition.value || 0"
                      :max="9999"
                      controls-position="right"
                      class="value-input"
                    />
                  </template>

                  <span class="condition-suffix">时</span>
                </div>

                <!-- 条件预览 -->
                <div class="condition-preview mt-1">
                  <code class="text-xs px-2 py-1 rounded">
                    {{ generateConditionText(stage) }}
                  </code>
                </div>
              </div>

              <!-- 内容状态 -->
              <div class="content-status mt-2">
                <div class="flex items-center space-x-2 text-xs">
                  <span 
                    class="content-indicator"
                    :class="{
                      'has-content': stage.content && stage.content.trim(),
                      'no-content': !stage.content || !stage.content.trim()
                    }"
                  />
                  <span >
                    {{ stage.content && stage.content.trim() ? '已配置内容' : '未配置内容' }}
                  </span>
                  <span v-if="stage.content" >
                    ({{ stage.content.split('\n').length }} 行)
                  </span>
                </div>
              </div>
            </div>

            <!-- 选中指示器 -->
            <div 
              v-if="ejsStore.editorState.selectedStageId === stage.id"
              class="selected-indicator"
            >
              <i class="iconify mdi:check-circle text-blue-500"></i>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="text-center py-12">
        <i class="iconify mdi:timeline-text text-6xl"></i>
        <h4 class="text-lg font-medium">
          还没有阶段
        </h4>
        <p >
          添加第一个阶段来开始配置动态模板
        </p>
        <el-button type="primary" @click="addNewStage" :disabled="!canAddStage">
          <i class="iconify mdi:plus mr-1"></i>
          添加第一个阶段
        </el-button>
      </div>
    </div>

    <!-- 阶段统计 -->
    <div v-if="sortedStages.length > 0" class="stage-stats mt-6">
      <div class="0 rounded-lg p-4">
        <h4 class="text-sm font-medium mb-3">
          阶段统计
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="stat-item">
            <div class="stat-value text-lg font-semibold ">
              {{ sortedStages.length }}
            </div>
            <div class="stat-label">
              总阶段数
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-lg font-semibold text-green-600">
              {{ stagesWithContent }}
            </div>
            <div class="stat-label">
              已配置内容
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-lg font-semibold text-yellow-600">
              {{ stagesWithErrors }}
            </div>
            <div class="stat-label ">
              配置错误
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-lg font-semibold text-purple-600">
              {{ coverageRange }}
            </div>
            <div class="stat-label ">
              覆盖范围
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 验证错误提示 -->
    <div v-if="validationErrors.length > 0" class="validation-errors mt-4">
      <el-alert
        type="error"
        title="配置错误"
        :closable="false"
        show-icon
      >
        <div class="space-y-1">
          <div v-for="error in validationErrors" :key="error.field" class="text-sm">
            {{ error.message }}
          </div>
        </div>
      </el-alert>
    </div>

    <!-- 提示信息 -->
    <div v-if="!variableAlias" class="tip mt-4">
      <el-alert
        type="info"
        title="提示"
        description="请先在变量配置中设置变量路径和别名，然后再添加阶段"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElButton, ElInput, ElInputNumber, ElSelect, ElOption, ElAlert, ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import type { Stage, StageCondition } from './types'

// Store
const ejsStore = useEjsEditorStore()

// 响应式数据
const stageErrors = reactive<Record<string, boolean>>({})

// 计算属性
const sortedStages = computed({
  get: () => ejsStore.sortedStages,
  set: (newStages: Stage[]) => {
    // 更新阶段排序
    newStages.forEach((stage, index) => {
      if (stage.order !== index) {
        ejsStore.updateStage(stage.id, { order: index })
      }
    })
  }
})

const variableAlias = computed(() => ejsStore.variableConfig.alias)

const canAddStage = computed(() => {
  return !!(ejsStore.variableConfig.path && ejsStore.variableConfig.alias)
})

const stagesWithContent = computed(() => {
  return sortedStages.value.filter(stage => stage.content && stage.content.trim()).length
})

const stagesWithErrors = computed(() => {
  return Object.values(stageErrors).filter(hasError => hasError).length
})

const coverageRange = computed(() => {
  if (sortedStages.value.length === 0) return '0'
  
  const ranges = sortedStages.value.map(stage => {
    if (stage.condition.operator === 'range') {
      return `${stage.condition.value}-${stage.condition.maxValue || '∞'}`
    }
    return stage.condition.operator + stage.condition.value
  })
  
  return ranges.length > 3 ? `${ranges.length} 个条件` : ranges.join(', ')
})

const validationErrors = computed(() => {
  const errors: { field: string; message: string }[] = []
  
  sortedStages.value.forEach((stage, index) => {
    if (!stage.name) {
      errors.push({ field: `stage_${index}_name`, message: `阶段 ${index + 1} 缺少名称` })
    }
    
    if (stage.condition.operator === 'range' && (!stage.condition.maxValue || stage.condition.maxValue <= stage.condition.value)) {
      errors.push({ field: `stage_${index}_condition`, message: `阶段 ${index + 1} 范围条件无效` })
    }
  })
  
  return errors
})

// 方法
const addNewStage = () => {
  if (!canAddStage.value) {
    ElMessage.warning('请先配置变量路径和别名')
    return
  }

  const defaultCondition: StageCondition = {
    operator: '<',
    value: sortedStages.value.length * 20 // 自动递增的默认值
  }

  const stageId = ejsStore.addStage({
    name: `阶段${sortedStages.value.length + 1}`,
    condition: defaultCondition,
    content: ''
  })

  // 自动选中新添加的阶段
  ejsStore.selectStage(stageId)
  
  ElMessage.success('阶段添加成功')
}

const removeStage = (stageId: string) => {
  ejsStore.removeStage(stageId)
  delete stageErrors[stageId]
  ElMessage.success('阶段删除成功')
}

const selectStage = (stageId: string) => {
  ejsStore.selectStage(stageId)
  // 切换到内容编辑标签
  ejsStore.setActiveTab('content')
}

const updateStage = (stageId: string, updates: Partial<Stage>) => {
  ejsStore.updateStage(stageId, updates)
  validateStage(stageId)
}

const updateCondition = (stageId: string, conditionUpdates: Partial<StageCondition>) => {
  const stage = sortedStages.value.find(s => s.id === stageId)
  if (stage) {
    const newCondition = { ...stage.condition, ...conditionUpdates }
    ejsStore.updateStage(stageId, { condition: newCondition })
    validateStage(stageId)
  }
}

const validateStage = (stageId: string) => {
  const stage = sortedStages.value.find(s => s.id === stageId)
  if (!stage) return

  let hasError = false

  // 验证阶段名称
  if (!stage.name || !stage.name.trim()) {
    hasError = true
  }

  // 验证条件
  if (stage.condition.operator === 'range') {
    if (!stage.condition.maxValue || stage.condition.maxValue <= stage.condition.value) {
      hasError = true
    }
  }

  stageErrors[stageId] = hasError
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

const handleDragEnd = () => {
  ElMessage.success('阶段排序已更新')
}

// 初始化时验证所有阶段
sortedStages.value.forEach(stage => {
  validateStage(stage.id)
})
</script>

<style scoped>
.stage-item {
  background-color: white;
  border: 1px solid rgb(229 231 235);
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.dark .stage-item {
  background-color: rgb(31 41 55);
  border-color: rgb(55 65 81);
}

.stage-item:hover {
  border-color: rgb(147 197 253);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.dark .stage-item:hover {
  border-color: rgb(37 99 235);
}

.stage-selected {
  border-color: rgb(59 130 246);
  background-color: rgb(239 246 255);
}

.dark .stage-selected {
  border-color: rgb(59 130 246);
  background-color: rgb(30 58 138 / 0.2);
}

.stage-error {
  border-color: rgb(252 165 165);
  background-color: rgb(254 242 242);
}

.dark .stage-error {
  border-color: rgb(220 38 38);
  background-color: rgb(127 29 29 / 0.2);
}

.stage-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  cursor: move;
  color: rgb(156 163 175);
}

.drag-handle:hover {
  color: rgb(75 85 99);
}

.stage-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: rgb(219 234 254);
  color: rgb(37 99 235);
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
}

.dark .stage-number {
  background-color: rgb(30 58 138);
  color: rgb(96 165 250);
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stage-name {
  flex: 1;
  margin-right: 0.5rem;
}

.stage-name .error :deep(.el-input__wrapper) {
  border-color: rgb(252 165 165);
}

.dark .stage-name .error :deep(.el-input__wrapper) {
  border-color: rgb(220 38 38);
}

.condition-builder {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
}

.condition-prefix,
.condition-suffix,
.range-separator {
  color: rgb(55 65 81);
  white-space: nowrap;
}

.dark .condition-prefix,
.dark .condition-suffix,
.dark .range-separator {
  color: rgb(209 213 219);
}

.operator-select {
  min-width: 6rem;
}

.value-input {
  width: 5rem;
}

.condition-preview {
  font-size: 0.75rem;
}

.content-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
}

.content-indicator.has-content {
  background-color: rgb(34 197 94);
}

.content-indicator.no-content {
  background-color: rgb(209 213 219);
}

.dark .content-indicator.no-content {
  background-color: rgb(75 85 99);
}

.selected-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
}

.stage-stats .stat-item {
  text-align: center;
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
</style>