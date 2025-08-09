<template>
    <div class="stage-editor">
        <!-- 阶段名称 -->
        <div class="form-item">
            <label>阶段名称</label>
            <el-input :model-value="stage.name" @input="updateStageName" placeholder="输入阶段名称" />
        </div>

        <!-- 条件设置 -->
        <div class="form-item">
            <label>触发条件</label>
            <div class="condition-groups-container">
                <div v-for="(group, groupIndex) in stage.conditionGroups" :key="group.id" class="condition-group">
                    <div class="condition-group-header">
                        <span class="condition-group-title">条件组 {{ groupIndex + 1 }} (AND)</span>
                        <el-button v-if="stage.conditionGroups.length > 1" type="danger" :icon="Delete" circle
                            size="small" @click="removeConditionGroup(group.id)" />
                    </div>

                    <div v-for="(condition) in group.conditions" :key="condition.id" class="condition-builder"
                        :class="{ 'mobile-condition-builder': isMobile }">
                        <el-select :model-value="condition.variableId"
                            @change="(val: string) => updateCondition(group.id, condition.id, { variableId: val })"
                            placeholder="选择变量" :style="isMobile ? 'width: 100%; margin-bottom: 8px;' : 'width: 150px'"
                            filterable>
                            <el-option v-for="variable in store.flatVariables" :key="variable.id"
                                :label="variable.readablePath" :value="variable.id" />
                        </el-select>

                        <div class="condition-row" :class="{ 'mobile-condition-row': isMobile }">
                            <el-select :model-value="condition.type"
                                @change="(val: Condition['type']) => updateCondition(group.id, condition.id, { type: val })"
                                :style="isMobile ? 'width: 80px;' : 'width: 120px;'">
                                <el-option label="<" value="less" />
                                <el-option label="<=" value="lessEqual" />
                                <el-option label="==" value="equal" />
                                <el-option label=">" value="greater" />
                                <el-option label=">=" value="greaterEqual" />
                                <el-option label="范围" value="range" />
                                <el-option label="是" value="is" />
                                <el-option label="不是" value="isNot" />
                            </el-select>

                            <el-input :model-value="condition.value"
                                @input="(val: string) => updateCondition(group.id, condition.id, { value: val })"
                                :style="isMobile ? 'width: 80px;' : 'width: 100px;'" placeholder="值" />

                            <template v-if="condition.type === 'range'">
                                <span class="range-separator">到</span>
                                <el-input :model-value="condition.endValue"
                                    @input="(val: string) => updateCondition(group.id, condition.id, { endValue: val })"
                                    :style="isMobile ? 'width: 80px;' : 'width: 100px;'" placeholder="结束值" />
                            </template>

                            <el-button type="danger" :icon="Delete" circle :size="isMobile ? 'small' : 'small'"
                                @click="removeCondition(group.id, condition.id)" />
                        </div>
                    </div>
                    <el-button :icon="Plus" @click="addCondition(group.id)" size="small" class="mt-2">
                        添加条件
                    </el-button>

                    <div v-if="groupIndex < stage.conditionGroups.length - 1" class="group-separator">
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
                    <el-icon class="help-icon">
                        <QuestionFilled />
                    </el-icon>
                </el-tooltip>
            </label>
            <el-input v-model="localContent" type="textarea" :rows="8" placeholder="输入该阶段对应的内容（YAML格式）..."
                class="content-textarea" />
        </div>

        <!-- 预览当前阶段 -->
        <div class="form-item">
            <label>内容预览</label>
            <div class="content-preview">
                <pre>{{ stage.content || '(空内容)' }}</pre>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps } from 'vue'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import type { Stage, Condition, ConditionGroup } from '@/types/ejs-editor'
import { Plus, Delete, QuestionFilled } from '@element-plus/icons-vue'
import { useDevice } from '@/composables/useDevice'

const props = defineProps<{
    stage: Stage,
    logicBlockId: string
}>()

const store = useEjsEditorStore()
const { isMobile } = useDevice()
const localContent = ref(props.stage.content)

// 当外部stage内容变化时，同步到本地
watch(() => props.stage.content, (newVal) => {
    if (newVal !== localContent.value) {
        localContent.value = newVal
    }
})

// 使用防抖更新store中的内容
let debounceTimer: NodeJS.Timeout
watch(localContent, (newValue) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        if (newValue !== props.stage.content) {
            store.updateStage(props.logicBlockId, props.stage.id, { content: newValue })
        }
    }, 50)
})

function updateStageName(value: string) {
    store.updateStage(props.logicBlockId, props.stage.id, { name: value })
}

function addConditionGroup() {
    const newGroup: ConditionGroup = {
        id: `group_${Date.now()}`,
        conditions: [],
    };
    const conditionGroups = [...props.stage.conditionGroups, newGroup];
    store.updateStage(props.logicBlockId, props.stage.id, { conditionGroups });
}

function removeConditionGroup(groupId: string) {
    const conditionGroups = props.stage.conditionGroups.filter(g => g.id !== groupId);
    store.updateStage(props.logicBlockId, props.stage.id, { conditionGroups });
}

function addCondition(groupId: string) {
    const newCondition: Condition = {
        id: `cond_${Date.now()}`,
        variableId: '',
        variablePath: '',
        variableAlias: '',
        type: 'equal',
        value: ''
    }

    const conditionGroups = props.stage.conditionGroups.map(group => {
        if (group.id === groupId) {
            return { ...group, conditions: [...group.conditions, newCondition] };
        }
        return group;
    });

    store.updateStage(props.logicBlockId, props.stage.id, { conditionGroups });
}

function removeCondition(groupId: string, conditionId: string) {
    const conditionGroups = props.stage.conditionGroups.map(group => {
        if (group.id === groupId) {
            const conditions = group.conditions.filter(c => c.id !== conditionId);
            return { ...group, conditions };
        }
        return group;
    });

    store.updateStage(props.logicBlockId, props.stage.id, { conditionGroups });
}

function updateCondition(groupId: string, conditionId: string, updates: Partial<Condition>) {
    const conditionGroups = props.stage.conditionGroups.map(group => {
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

    store.updateStage(props.logicBlockId, props.stage.id, { conditionGroups });
}
</script>

<style scoped>

.stage-editor {
    padding: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-bg-color-page);
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

.help-icon {
    color: var(--el-color-info);
    cursor: help;
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

.condition-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

@media (max-width: 768px) {
    .stage-editor {
        padding: 12px 8px;
    }

    .mobile-condition-builder {
        flex-direction: column;
        align-items: stretch;
        background: var(--el-fill-color-extra-light);
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .mobile-condition-row {
        flex-wrap: wrap;
    }

    .mobile-condition-row .el-select,
    .mobile-condition-row .el-input {
        flex: 1;
        min-width: 60px;
    }
}
</style>