import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  EjsTemplateConfig,
  VariableConfig,
  Stage,
  EditorState,
  SimulationResult,
  ValidationResult,
  CodeGenerationOptions,
  ExportConfig
} from '@/components/ejs-editor/types'

import {
  DEFAULT_TEMPLATE_CONFIG,
  DEFAULT_CODE_OPTIONS
} from '@/components/ejs-editor/types'

export const useEjsEditorStore = defineStore('ejsEditor', () => {
  // 状态
  const config = ref<EjsTemplateConfig>({ ...DEFAULT_TEMPLATE_CONFIG })
  const editorState = ref<EditorState>({
    selectedStageId: null,
    activeTab: 'variable',
    isDirty: false,
    lastSaved: null
  })
  const codeOptions = ref<CodeGenerationOptions>({ ...DEFAULT_CODE_OPTIONS })
  const generatedCode = ref<string>('')
  const simulationResult = ref<SimulationResult | null>(null)

  // Getters (computed)
  const variableConfig = computed(() => config.value.variableConfig)
  const stages = computed(() => config.value.stages)
  const selectedStage = computed(() => 
    stages.value.find(stage => stage.id === editorState.value.selectedStageId) || null
  )
  const isConfigValid = computed(() => {
    return !!(
      config.value.variableConfig.path &&
      config.value.variableConfig.alias &&
      config.value.stages.length > 0
    )
  })
  const sortedStages = computed(() => 
    [...stages.value].sort((a, b) => a.order - b.order)
  )

  // Actions
  const updateVariableConfig = (newConfig: Partial<VariableConfig>) => {
    config.value.variableConfig = { ...config.value.variableConfig, ...newConfig }
    markDirty()
  }

  const addStage = (stage: Omit<Stage, 'id' | 'order'>) => {
    const newStage: Stage = {
      ...stage,
      id: generateId(),
      order: config.value.stages.length
    }
    config.value.stages.push(newStage)
    markDirty()
    return newStage.id
  }

  const updateStage = (stageId: string, updates: Partial<Stage>) => {
    const index = config.value.stages.findIndex(stage => stage.id === stageId)
    if (index !== -1) {
      config.value.stages[index] = { ...config.value.stages[index], ...updates }
      markDirty()
    }
  }

  const removeStage = (stageId: string) => {
    const index = config.value.stages.findIndex(stage => stage.id === stageId)
    if (index !== -1) {
      config.value.stages.splice(index, 1)
      // 重新排序
      config.value.stages.forEach((stage, idx) => {
        stage.order = idx
      })
      // 如果删除的是当前选中的阶段，清除选择
      if (editorState.value.selectedStageId === stageId) {
        editorState.value.selectedStageId = null
      }
      markDirty()
    }
  }

  const reorderStages = (fromIndex: number, toIndex: number) => {
    const stage = config.value.stages.splice(fromIndex, 1)[0]
    config.value.stages.splice(toIndex, 0, stage)
    // 重新设置 order
    config.value.stages.forEach((stage, index) => {
      stage.order = index
    })
    markDirty()
  }

  const selectStage = (stageId: string | null) => {
    editorState.value.selectedStageId = stageId
  }

  const setActiveTab = (tab: string) => {
    editorState.value.activeTab = tab
  }

  const markDirty = () => {
    editorState.value.isDirty = true
    config.value.metadata.updatedAt = new Date().toISOString()
  }

  const markClean = () => {
    editorState.value.isDirty = false
    editorState.value.lastSaved = new Date().toISOString()
  }

  // EJS 代码生成
  const generateEjsCode = (): string => {
    if (!isConfigValid.value) {
      throw new Error('配置不完整，无法生成代码')
    }

    const { variableConfig, stages } = config.value
    const sortedStages = [...stages].sort((a, b) => a.order - b.order)
    
    let code = ''
    
    // 添加变量声明
    if (codeOptions.value.includeComments) {
      code += `<%_ // 变量: ${variableConfig.alias} (${variableConfig.path}) _%>\n`
    }
    code += `<%_ const ${variableConfig.alias} = getvar('${variableConfig.path}'); _%>\n`
    
    // 生成条件判断
    sortedStages.forEach((stage, index) => {
      const condition = generateConditionCode(stage, variableConfig.alias)
      
      if (index === 0) {
        code += `<%_ if (${condition}) { _%>\n`
      } else {
        code += `<%_ } else if (${condition}) { _%>\n`
      }
      
      // 添加阶段内容
      if (stage.content.trim()) {
        const lines = stage.content.split('\n')
        lines.forEach(line => {
          code += line + '\n'
        })
      } else {
        code += `${stage.name}:\n  # TODO: 添加阶段内容\n`
      }
    })
    
    // 添加 else 和错误处理
    code += `<%_ } else { _%>\n`
    code += `<%_ toastr.error('变量值超出预期范围: ${variableConfig.alias} = ' + ${variableConfig.alias}); _%>\n`
    code += `<%_ } _%>\n`
    
    generatedCode.value = code
    return code
  }

  // 条件代码生成
  const generateConditionCode = (stage: Stage, variableName: string): string => {
    const { condition } = stage
    
    switch (condition.operator) {
      case '<':
        return `${variableName} < ${condition.value}`
      case '<=':
        return `${variableName} <= ${condition.value}`
      case '==':
        return `${variableName} == ${condition.value}`
      case '>':
        return `${variableName} > ${condition.value}`
      case '>=':
        return `${variableName} >= ${condition.value}`
      case 'range':
        return `${variableName} >= ${condition.value} && ${variableName} < ${condition.maxValue}`
      default:
        throw new Error(`不支持的条件操作符: ${condition.operator}`)
    }
  }

  // 模拟测试
  const simulateValue = (inputValue: number): SimulationResult => {
    try {
      const matchedStage = findMatchingStage(inputValue)
      const result: SimulationResult = {
        inputValue,
        matchedStage,
        matchedCondition: matchedStage ? generateConditionCode(matchedStage, variableConfig.value.alias) : '无匹配',
        generatedOutput: matchedStage ? matchedStage.content : '',
        isValid: true
      }
      simulationResult.value = result
      return result
    } catch (error) {
      const errorResult: SimulationResult = {
        inputValue,
        matchedStage: null,
        matchedCondition: '错误',
        generatedOutput: '',
        isValid: false,
        error: (error as Error).message
      }
      simulationResult.value = errorResult
      return errorResult
    }
  }

  const findMatchingStage = (value: number): Stage | null => {
    const sortedStages = [...stages.value].sort((a, b) => a.order - b.order)
    
    for (const stage of sortedStages) {
      if (matchesCondition(value, stage.condition)) {
        return stage
      }
    }
    return null
  }

  const matchesCondition = (value: number, condition: Stage['condition']): boolean => {
    switch (condition.operator) {
      case '<':
        return value < condition.value
      case '<=':
        return value <= condition.value
      case '==':
        return value == condition.value
      case '>':
        return value > condition.value
      case '>=':
        return value >= condition.value
      case 'range':
        return value >= condition.value && condition.maxValue !== undefined && value < condition.maxValue
      default:
        return false
    }
  }

  // 验证配置
  const validateConfig = (): ValidationResult => {
    const errors: ValidationResult['errors'] = []
    const warnings: ValidationResult['warnings'] = []

    // 验证变量配置
    if (!variableConfig.value.path) {
      errors.push({ field: 'variableConfig.path', message: '变量路径不能为空', severity: 'error' })
    }
    if (!variableConfig.value.alias) {
      errors.push({ field: 'variableConfig.alias', message: '变量别名不能为空', severity: 'error' })
    }

    // 验证阶段
    if (stages.value.length === 0) {
      errors.push({ field: 'stages', message: '至少需要一个阶段', severity: 'error' })
    }

    stages.value.forEach((stage, index) => {
      if (!stage.name) {
        errors.push({ field: `stages[${index}].name`, message: '阶段名称不能为空', severity: 'error' })
      }
      if (!stage.content.trim()) {
        warnings.push({ field: `stages[${index}].content`, message: '阶段内容为空', suggestion: '建议添加阶段描述内容' })
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 导入导出
  const exportConfig = (): ExportConfig => {
    return {
      config: { ...config.value },
      generatedCode: generatedCode.value,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0.0'
    }
  }

  const importConfig = (importedConfig: ExportConfig | EjsTemplateConfig) => {
    if ('config' in importedConfig) {
      // ExportConfig 格式
      config.value = { ...importedConfig.config }
      generatedCode.value = importedConfig.generatedCode || ''
    } else {
      // EjsTemplateConfig 格式
      config.value = { ...importedConfig }
    }
    
    editorState.value.selectedStageId = null
    editorState.value.isDirty = false
    markClean()
  }

  const resetConfig = () => {
    config.value = { ...DEFAULT_TEMPLATE_CONFIG }
    editorState.value.selectedStageId = null
    editorState.value.isDirty = false
    generatedCode.value = ''
    simulationResult.value = null
  }

  // 工具函数
  const generateId = (): string => {
    return `stage_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  return {
    // 状态
    config,
    editorState,
    codeOptions,
    generatedCode,
    simulationResult,
    
    // Getters
    variableConfig,
    stages,
    selectedStage,
    isConfigValid,
    sortedStages,
    
    // Actions
    updateVariableConfig,
    addStage,
    updateStage,
    removeStage,
    reorderStages,
    selectStage,
    setActiveTab,
    markDirty,
    markClean,
    generateEjsCode,
    simulateValue,
    validateConfig,
    exportConfig,
    importConfig,
    resetConfig
  }
})