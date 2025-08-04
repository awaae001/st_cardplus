import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import * as yaml from 'js-yaml'
import * as ejs from 'ejs'

// 类型定义
export interface VariableNode {
  key: string
  value: any
  description?: string
  children?: VariableNode[]
  path: string // Unique ID for a node
}

export interface Stage {
  id: string
  name: string
  conditions: Condition[]
  conjunction: 'and' | 'or'
  content: string
}

export interface Condition {
  id:string
  variableId: string // 内部唯一ID
  variablePath: string // 可读路径
  variableAlias: string
  type: 'less' | 'lessEqual' | 'equal' | 'greater' | 'greaterEqual' | 'range' | 'is' | 'isNot'
  value: any
  endValue?: any // 用于范围条件
}

export interface EditorError {
  type: 'yaml' | 'ejs' | 'stage'
  message: string
  line?: number
}

export const useEjsEditorStore = defineStore('ejsEditor', () => {
  // 基础状态
  const yamlInput = ref('')
  const variableTree = ref<VariableNode[]>([])
  
  // 阶段管理
  const stages = ref<Stage[]>([])
  const selectedStageId = ref('')
  const variableEditMode = ref<'yaml' | 'tree'>('yaml')
  
  // 编辑器状态
  const ejsTemplate = ref('')
  const previewCode = ref('')
  
  // 测试模拟
  const simulationValues = ref<Record<string, any>>({})
  const testResult = ref('')
  const errors = ref<EditorError[]>([])
  const isGenerating = ref(false)

  // 计算属性
  const selectedStage = computed(() => 
    stages.value.find(stage => stage.id === selectedStageId.value)
  )

  const hasErrors = computed(() => errors.value.length > 0)

  const testVariables = computed(() => {
    const variables = new Map<string, { readablePath: string; alias: string }>()
    stages.value.forEach(stage => {
      (stage.conditions || []).forEach(condition => {
        if (condition.variableId && !variables.has(condition.variableId)) {
          variables.set(condition.variableId, {
            readablePath: condition.variablePath,
            alias: condition.variableAlias || condition.variablePath
          })
        }
      })
    })
    return Array.from(variables, ([id, data]) => ({
      id,
      readablePath: data.readablePath,
      alias: data.alias
    }))
  })

  // --- YAML 和变量树转换 ---
  function parseYamlInput(yamlText: string): VariableNode[] {
    try {
      errors.value = errors.value.filter(e => e.type !== 'yaml')
      const parsed = yaml.load(yamlText) as any
      return parseObjectToVariableTree(parsed)
    } catch (error) {
      errors.value.push({
        type: 'yaml',
        message: `YAML解析错误: ${error instanceof Error ? error.message : '未知错误'}`
      })
      return []
    }
  }

  function parseObjectToVariableTree(obj: any, parentPath: string = ''): VariableNode[] {
    if (!obj || typeof obj !== 'object') return []
    
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key
      const node: VariableNode = {
        key,
        value: null,
        path: `${currentPath}_${Date.now()}_${Math.random()}` // Ensure unique path for keys
      }

      if (Array.isArray(value) && value.length <= 2) {
        node.value = value[0]
        node.description = value[1] || ''
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        node.children = parseObjectToVariableTree(value, currentPath)
      } else {
        node.value = value
      }
      return node
    })
  }

  function variableTreeToPlainObject(nodes: VariableNode[]): any {
    const obj: any = {}
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        obj[node.key] = variableTreeToPlainObject(node.children)
      } else {
        if (node.description) {
          obj[node.key] = [node.value, node.description]
        } else {
          obj[node.key] = node.value
        }
      }
    }
    return obj
  }

  function customYamlGenerate(obj: any, indent: number = 0): string {
    const spaces = '  '.repeat(indent)
    let result = ''
    
    for (const [key, value] of Object.entries(obj)) {
      result += `${spaces}${key}:`
      
      if (Array.isArray(value) && value.length <= 2) {
        // 数组格式：[值, 描述]
        result += ` [${value[0]}`
        if (value[1]) {
          result += `, ${value[1]}`
        }
        result += `]\n`
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 嵌套对象
        result += `\n${customYamlGenerate(value, indent + 1)}`
      } else {
        // 简单值
        result += ` ${value}\n`
      }
    }
    
    return result
  }

  function generateYamlFromTree() {
    try {
      const plainObject = variableTreeToPlainObject(variableTree.value)
      const yamlString = customYamlGenerate(plainObject)
      yamlInput.value = yamlString
    } catch (error) {
      errors.value.push({
        type: 'yaml',
        message: `YAML生成错误: ${error instanceof Error ? error.message : '未知错误'}`
      })
    }
  }

  // --- 核心业务逻辑 ---
  function importYamlVariables() {
    if (!yamlInput.value.trim()) {
      variableTree.value = []
      return
    }
    variableTree.value = parseYamlInput(yamlInput.value)
  }

  // --- 不可变更新 (Immutable Updates) ---
  function addNode(parentId: string | null = null) {
    const newNode: VariableNode = {
      key: '新节点',
      value: '新值',
      path: `new_${Date.now()}_${Math.random()}`,
      description: ''
    }

    if (!parentId) {
      variableTree.value = [...variableTree.value, newNode]
    } else {
      const addRec = (nodes: VariableNode[]): VariableNode[] => {
        return nodes.map(node => {
          if (node.path === parentId) {
            const newChildren = node.children ? [...node.children, newNode] : [newNode]
            return { ...node, children: newChildren }
          }
          if (node.children) {
            return { ...node, children: addRec(node.children) }
          }
          return node
        })
      }
      variableTree.value = addRec(variableTree.value)
    }
    generateYamlFromTree()
  }

  function removeNode(path: string) {
    const removeRec = (nodes: VariableNode[]): VariableNode[] => {
      return nodes
        .filter(node => node.path !== path)
        .map(node => {
          if (node.children) {
            return { ...node, children: removeRec(node.children) }
          }
          return node
        })
    }
    variableTree.value = removeRec(variableTree.value)
    generateYamlFromTree()
  }

  function updateNodeValue(path: string, newKey: string, newValue: any, newDescription?: string) {
    const updateRec = (nodes: VariableNode[]): VariableNode[] => {
      return nodes.map(node => {
        if (node.path === path) {
          return { ...node, key: newKey, value: newValue, description: newDescription }
        }
        if (node.children) {
          return { ...node, children: updateRec(node.children) }
        }
        return node
      })
    }
    variableTree.value = updateRec(variableTree.value)
    generateYamlFromTree()
  }

  // --- 其他方法 ---
  function getReadablePath(node: VariableNode, nodes: VariableNode[] = variableTree.value, parentPath: string = ''): string | null {
    for (const n of nodes) {
      const currentPath = parentPath ? `${parentPath}.${n.key}` : n.key;
      if (n.path === node.path) {
        return currentPath;
      }
      if (n.children) {
        const foundPath = getReadablePath(node, n.children, currentPath);
        if (foundPath) {
          return foundPath;
        }
      }
    }
    return null;
  }

  function findFirstLeafVariable(nodes: VariableNode[]): VariableNode | null {
    for (const node of nodes) {
      if (!node.children || node.children.length === 0) {
        if (node.value !== null && node.value !== undefined) {
          return node
        }
      } else {
        const found = findFirstLeafVariable(node.children)
        if (found) return found
      }
    }
    return null
  }

  function addStage() {
    const newStage: Stage = {
      id: `stage_${Date.now()}`,
      name: `阶段${stages.value.length + 1}`,
      conditions: [],
      conjunction: 'and',
      content: ''
    }
    stages.value.push(newStage)
    selectedStageId.value = newStage.id
    generateEjsTemplate()
  }

  function removeStage(stageId: string) {
    const index = stages.value.findIndex(stage => stage.id === stageId)
    if (index > -1) {
      stages.value.splice(index, 1)
      if (selectedStageId.value === stageId) {
        selectedStageId.value = stages.value.length > 0 ? stages.value[0].id : ''
      }
      generateEjsTemplate()
    }
  }

  function updateStage(stageId: string, updates: Partial<Stage>) {
    const index = stages.value.findIndex(stage => stage.id === stageId)
    if (index > -1) {
      stages.value[index] = { ...stages.value[index], ...updates }
      generateEjsTemplate()
    }
  }

  function generateEjsTemplate() {
    if (stages.value.length === 0) {
      ejsTemplate.value = ''
      previewCode.value = ''
      return
    }
    try {
      errors.value = errors.value.filter(e => e.type !== 'ejs')
      const sortedStages = [...stages.value].sort((a, b) => {
        const firstCondA = a.conditions?.[0]
        const firstCondB = b.conditions?.[0]
        if (!firstCondA || !firstCondB) return 0
        if (typeof firstCondA.value === 'number' && typeof firstCondB.value === 'number') {
          return firstCondA.value - firstCondB.value
        }
        return 0
      })
      let templateBody = ''
      sortedStages.forEach((stage, index) => {
        const condition = (stage.conditions || [])
          .map(cond => generateSingleCondition(cond))
          .join(` ${stage.conjunction === 'and' ? '&&' : '||'} `) || 'true'
        const content = stage.content || '// 空内容'
        const formattedContent = content.endsWith('\n') ? content : `${content}\n`
        if (index === 0) {
          templateBody += `<%_ if (${condition}) { _%>\n`
        } else {
          templateBody += `<%_ } else if (${condition}) { _%>\n`
        }
        templateBody += formattedContent
      })
      if (sortedStages.length > 0) {
        templateBody += `<%_ } else { _%>\n// 默认情况\n<%_ } _%>\n`
      }
      ejsTemplate.value = templateBody
      previewCode.value = templateBody
    } catch (error) {
      errors.value.push({
        type: 'ejs',
        message: `模板生成错误: ${error instanceof Error ? error.message : '未知错误'}`
      })
    }
  }

  function generateSingleCondition(condition: Condition): string {
    const varGetter = `getvar('${condition.variablePath}')` // 在模板中使用可读路径
    const value = !isNaN(parseFloat(condition.value)) && isFinite(condition.value)
      ? condition.value
      : `'${condition.value}'`
    switch (condition.type) {
      case 'less': return `${varGetter} < ${value}`
      case 'lessEqual': return `${varGetter} <= ${value}`
      case 'equal': return `${varGetter} == ${value}`
      case 'greater': return `${varGetter} > ${value}`
      case 'greaterEqual': return `${varGetter} >= ${value}`
      case 'range':
        const endValue = typeof condition.endValue === 'string' ? `'${condition.endValue}'` : condition.endValue
        return `${varGetter} >= ${value} && ${varGetter} < ${endValue}`
      case 'is': return `${varGetter} === ${value}`
      case 'isNot': return `${varGetter} !== ${value}`
      default: return 'true'
    }
  }

  function testSimulation() {
    // ... (此函数无需修改)
    if (!ejsTemplate.value) {
      testResult.value = ''
      return
    }
    try {
      const mockGetvar = (path: string) => {
        const variable = testVariables.value.find(v => v.readablePath === path)
        if (variable) {
          return simulationValues.value[variable.id]
        }
        return undefined
      }
      const result = ejs.render(ejsTemplate.value, { getvar: mockGetvar })
      testResult.value = result.trim()
    } catch (error) {
      testResult.value = `测试错误: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  function clearAll() {
    yamlInput.value = ''
    variableTree.value = []
    stages.value = []
    selectedStageId.value = ''
    ejsTemplate.value = ''
    previewCode.value = ''
    simulationValues.value = {}
    testResult.value = ''
    errors.value = []
  }

  function exportConfig() {
    return {
      yamlInput: yamlInput.value,
      stages: stages.value,
      timestamp: new Date().toISOString()
    }
  }

  function importConfig(config: any) {
    // ... (此函数无需修改)
    try {
      yamlInput.value = config.yamlInput || ''
      stages.value = config.stages || []
      if (config.yamlInput) {
        importYamlVariables()
      }
      if (stages.value.length > 0) {
        selectedStageId.value = stages.value[0].id
      }
      generateEjsTemplate()
    } catch (error) {
      errors.value.push({
        type: 'yaml',
        message: `导入配置错误: ${error instanceof Error ? error.message : '未知错误'}`
      })
    }
  }

  const flatVariables = computed(() => {
    const result: { id: string; readablePath: string; alias: string }[] = []
    function traverse(nodes: VariableNode[], parentPath: string = '') {
      for (const node of nodes) {
        const currentReadablePath = parentPath ? `${parentPath}.${node.key}` : node.key
        if (node.children && node.children.length > 0) {
          traverse(node.children, currentReadablePath)
        } else {
          result.push({
            id: node.path,
            readablePath: currentReadablePath,
            alias: node.key
          })
        }
      }
    }
    traverse(variableTree.value)
    return result
  })

  watch(simulationValues, testSimulation, { deep: true })

  return {
    // 状态
    // 状态
    yamlInput, variableTree, stages, selectedStageId,
    variableEditMode, ejsTemplate, previewCode, simulationValues, testResult,
    errors, isGenerating,
    selectedStage, hasErrors, testVariables, flatVariables,
    // 方法
    // 方法
    importYamlVariables, addStage, removeStage, updateStage, generateEjsTemplate,
    testSimulation, clearAll, exportConfig, importConfig,
    // 节点编辑方法
    addNode, removeNode, updateNodeValue, findFirstLeafVariable, getReadablePath
  }
})