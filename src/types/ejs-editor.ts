export interface VariableNode {
  key: string
  value: any
  description?: string
  children?: VariableNode[]
  path: string // Unique ID for a node
}

export interface Condition {
  id: string
  variableId: string
  variablePath: string
  variableAlias: string
  type: 'less' | 'lessEqual' | 'equal' | 'greater' | 'greaterEqual' | 'range' | 'is' | 'isNot'
  value: any
  endValue?: any
}

export interface ConditionGroup {
  id: string;
  conditions: Condition[];
}

export interface Stage {
  id: string
  name: string
  conditionGroups: ConditionGroup[]
  content: string
}

export interface LogicBlock {
  id: string;
  name: string;
  stages: Stage[];
  defaultStageContent: string;
  enabled: boolean;
}

export interface EditorError {
  type: 'yaml' | 'ejs' | 'stage'
  message: string
  line?: number
}

export interface StageScheme {
  id: string
  name: string
  logicBlocks: LogicBlock[]
  createdAt: string
  description?: string
}

export interface Project {
  id: string
  name: string
  yamlInput: string
  logicBlocks: LogicBlock[]
  createdAt: string
  updatedAt: string
  stageSchemes?: StageScheme[]
  currentSchemeId?: string
}