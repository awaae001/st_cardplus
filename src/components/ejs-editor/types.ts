/**
 * EJS 模板编辑器类型定义
 */

// 条件操作符类型
export type ConditionOperator = '<' | '<=' | '==' | '>' | '>=' | 'range'

// 阶段条件配置
export interface StageCondition {
  operator: ConditionOperator
  value: number
  maxValue?: number // 用于 range 类型
}

// 阶段定义
export interface Stage {
  id: string
  name: string // 阶段名称，如 "疏远警惕"
  condition: StageCondition
  content: string // YAML 格式的内容
  order: number // 排序
}

// 变量配置
export interface VariableConfig {
  path: string // 变量路径，如 "stat_data.理.好感度"
  alias: string // 变量别名，如 "好感度"
  description?: string // 变量描述
}

// EJS 模板配置
export interface EjsTemplateConfig {
  variableConfig: VariableConfig
  stages: Stage[]
  metadata: {
    name: string // 模板名称
    description: string // 模板描述
    createdAt: string
    updatedAt: string
    version: string
  }
}

// 代码生成选项
export interface CodeGenerationOptions {
  useStrictMode: boolean // 是否使用严格模式
  includeComments: boolean // 是否包含注释
  indentSize: number // 缩进大小
  formatStyle: 'compact' | 'readable' // 格式化风格
}

// 模拟测试结果
export interface SimulationResult {
  inputValue: number
  matchedStage: Stage | null
  matchedCondition: string
  generatedOutput: string
  isValid: boolean
  error?: string
}

// 编辑器状态
export interface EditorState {
  selectedStageId: string | null
  activeTab: string
  isDirty: boolean // 是否有未保存的更改
  lastSaved: string | null
}

// 导出/导入配置
export interface ExportConfig {
  config: EjsTemplateConfig
  generatedCode: string
  exportedAt: string
  exportVersion: string
}

// 验证结果
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// 阶段范围类型 (用于验证和解析)
export interface StageRange {
  min: number
  max: number
  inclusive: boolean
}

// 常量定义
export const DEFAULT_VARIABLE_CONFIG: VariableConfig = {
  path: '',
  alias: '',
  description: ''
}

export const DEFAULT_STAGE: Omit<Stage, 'id'> = {
  name: '',
  condition: {
    operator: '<',
    value: 0
  },
  content: '',
  order: 0
}

export const DEFAULT_TEMPLATE_CONFIG: EjsTemplateConfig = {
  variableConfig: DEFAULT_VARIABLE_CONFIG,
  stages: [],
  metadata: {
    name: '新建模板',
    description: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0'
  }
}

export const DEFAULT_CODE_OPTIONS: CodeGenerationOptions = {
  useStrictMode: true,
  includeComments: true,
  indentSize: 2,
  formatStyle: 'readable'
}

// 工具函数类型
export type StageValidator = (stage: Stage, allStages: Stage[]) => ValidationResult
export type CodeGenerator = (config: EjsTemplateConfig, options?: CodeGenerationOptions) => string
export type ConditionParser = (condition: StageCondition) => string
export type ValueMatcher = (value: number, condition: StageCondition) => boolean