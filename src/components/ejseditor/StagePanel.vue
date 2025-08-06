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
        <draggable
          v-model="dragStages"
          item-key="id"
          handle=".drag-handle"
          animation="200"
          ghost-class="ghost"
          chosen-class="chosen"
          class="stage-list"
        >
          <template #item="{ element: stage, index }">
            <div
              class="stage-item"
              :class="{ 'is-selected': stage.id === store.selectedStageId }"
              @click="selectStage(stage.id)"
            >
              <div class="stage-header">
                <div class="stage-info">
                  <el-icon class="drag-handle"><Menu /></el-icon>
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
          </template>
        </draggable>
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
          <div class="condition-groups-container">
            <div
              v-for="(group, groupIndex) in store.selectedStage.conditionGroups"
              :key="group.id"
              class="condition-group"
            >
              <div class="condition-group-header">
                <span class="condition-group-title">条件组 {{ groupIndex + 1 }} (AND)</span>
                 <el-button
                  v-if="store.selectedStage.conditionGroups.length > 1"
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  @click="removeConditionGroup(group.id)"
                />
              </div>

              <div v-for="(condition) in group.conditions" :key="condition.id" class="condition-builder">
                <el-select
                  :model-value="condition.variableId"
                  @change="(val: string) => updateCondition(group.id, condition.id, { variableId: val })"
                  placeholder="选择变量"
                  style="width: 150px"
                  filterable
                >
                  <el-option
                    v-for="variable in store.flatVariables"
                    :key="variable.id"
                    :label="variable.readablePath"
                    :value="variable.id"
                  />
                </el-select>

                <el-select
                  :model-value="condition.type"
                  @change="(val: Condition['type']) => updateCondition(group.id, condition.id, { type: val })"
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
                  @input="(val: string) => updateCondition(group.id, condition.id, { value: val })"
                  style="width: 100px"
                  placeholder="值"
                />

                <template v-if="condition.type === 'range'">
                  <span class="range-separator">到</span>
                  <el-input
                    :model-value="condition.endValue"
                    @input="(val: string) => updateCondition(group.id, condition.id, { endValue: val })"
                    style="width: 100px"
                    placeholder="结束值"
                  />
                </template>

                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  @click="removeCondition(group.id, condition.id)"
                />
              </div>
              <el-button :icon="Plus" @click="addCondition(group.id)" size="small" class="mt-2">
                添加条件
              </el-button>

              <div v-if="groupIndex < store.selectedStage.conditionGroups.length - 1" class="group-separator">
                <span>OR</span>
              </div>
            </div>

            <el-button @click="addConditionGroup" :icon="Plus" class="mt-4">
              添加条件组 (OR)
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
          <el-button size="small" @click="clearAllStages" type="danger">
            清空所有阶段
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, QuestionFilled, Menu } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import type { Stage, Condition, ConditionGroup } from '@/stores/ejsEditor'

const store = useEjsEditorStore()
const localContent = ref('')

const dragStages = computed({
  get() {
    return store.stages
  },
  set(newStages) {
    store.stages = newStages
    store.generateEjsTemplate()
  }
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

function addConditionGroup() {
  if (!store.selectedStage) return;
  const newGroup: ConditionGroup = {
    id: `group_${Date.now()}`,
    conditions: [],
  };
  const conditionGroups = [...store.selectedStage.conditionGroups, newGroup];
  store.updateStage(store.selectedStageId, { conditionGroups });
}

function removeConditionGroup(groupId: string) {
  if (!store.selectedStage) return;
  const conditionGroups = store.selectedStage.conditionGroups.filter(g => g.id !== groupId);
  store.updateStage(store.selectedStageId, { conditionGroups });
}

function addCondition(groupId: string) {
  if (!store.selectedStage) return
  const newCondition: Condition = {
    id: `cond_${Date.now()}`,
    variableId: '',
    variablePath: '',
    variableAlias: '',
    type: 'equal',
    value: ''
  }
  
  const conditionGroups = store.selectedStage.conditionGroups.map(group => {
    if (group.id === groupId) {
      return { ...group, conditions: [...group.conditions, newCondition] };
    }
    return group;
  });

  store.updateStage(store.selectedStageId, { conditionGroups });
}

function removeCondition(groupId: string, conditionId: string) {
  if (!store.selectedStage) return
  
  const conditionGroups = store.selectedStage.conditionGroups.map(group => {
    if (group.id === groupId) {
      const conditions = group.conditions.filter(c => c.id !== conditionId);
      return { ...group, conditions };
    }
    return group;
  });

  store.updateStage(store.selectedStageId, { conditionGroups });
}

function updateCondition(groupId: string, conditionId: string, updates: Partial<Condition>) {
  if (!store.selectedStage) return
  
  const conditionGroups = store.selectedStage.conditionGroups.map(group => {
    if (group.id === groupId) {
      const conditions = group.conditions.map(c => {
        if (c.id === conditionId) {
          const updatedCondition = { ...c, ...updates };
          if (updates.variableId) {
            const foundVar = store.flatVariables.find(v => v.id === updates.variableId);
            if (foundVar) {
              updatedCondition.variablePath = foundVar.readablePath;
              updatedCondition.variableAlias = foundVar.alias;
            }
          }
          return updatedCondition;
        }
        return c;
      });
      return { ...group, conditions };
    }
    return group;
  });
  
  store.updateStage(store.selectedStageId, { conditionGroups });
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
  if (!stage.conditionGroups || stage.conditionGroups.length === 0) {
    return '无条件 (始终激活)';
  }

  const groupStrings = stage.conditionGroups
    .map(group => {
      if (!group.conditions || group.conditions.length === 0) {
        return null;
      }
      const conditionStrings = group.conditions.map(formatSingleCondition).join(' AND ');
      return `(${conditionStrings})`;
    })
    .filter(Boolean); // 过滤掉空的组

  if (groupStrings.length === 0) {
    return '无条件 (始终激活)';
  }

  return groupStrings.join(' OR ');
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

.drag-handle {
  cursor: grab;
  color: var(--el-text-color-secondary);
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

.ghost {
  opacity: 0.5;
  background: var(--el-color-primary-light-9);
}

.chosen {
  transform: scale(1.02);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
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
  margin-bottom: 8px;
}

.condition-groups-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.condition-group {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 12px;
  background-color: var(--el-bg-color-page);
}

.condition-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.condition-group-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.group-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: bold;
}

.group-separator span {
  background-color: var(--el-bg-color-page);
  padding: 0 8px;
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