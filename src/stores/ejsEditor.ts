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
  path: string
}

export interface Stage {
  id: string
  name: string
  condition: StageCondition
  content: string
}

export interface StageCondition {
  type: 'less' | 'lessEqual' | 'equal' | 'greater' | 'greaterEqual' | 'range'
  value: number
  endValue?: number // 用于范围条件
}

export interface EditorError {
  type: 'yaml' | 'ejs' | 'stage'
  message: string
  line?: number
}

export const useEjsEditorStore = defineStore('ejsEditor', () => {
  // 基础状态
  const variablePath = ref('')
  const variableAlias = ref('')
  const yamlInput = ref('')
  const variableTree = ref<VariableNode[]>([])
  
  // 阶段管理
  const stages = ref<Stage[]>([])
  const selectedStageId = ref('')
  
  // 编辑器状态
  const ejsTemplate = ref('')
  const previewCode = ref('')
  
  // 测试模拟
  const simulationValue = ref(0)
  const testResult = ref('')
  const errors = ref<EditorError[]>([])

  // 计算属性
  const selectedStage = computed(() => 
    stages.value.find(stage => stage.id === selectedStageId.value)
  )

  const hasErrors = computed(() => errors.value.length > 0)

  // 方法
  function parseYamlInput(yamlText: string): VariableNode[] {
    try {
      errors.value = errors.value.filter(e => e.type !== 'yaml')
      const parsed = yaml.load(yamlText) as any
      return parseObjectToVariableTree(parsed, '', new Set())
    } catch (error) {
      errors.value.push({
        type: 'yaml',
        message: `YAML解析错误: ${error instanceof Error ? error.message : '未知错误'}`
      })
      return []
    }
  }

  function parseObjectToVariableTree(obj: any, parentPath: string, visited = new Set<string>()): VariableNode[] {
    const result: VariableNode[] = []
    
    // 防止循环引用
    const currentKey = parentPath || 'root'
    if (visited.has(currentKey)) {
      return result
    }
    visited.add(currentKey)
    
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key
      
      if (Array.isArray(value) && value.length === 2) {
        // 处理 [值, 描述] 格式
        result.push({
          key,
          value: value[0],
          description: value[1],
          path: currentPath
        })
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 处理嵌套对象
        const children = parseObjectToVariableTree(value, currentPath, visited)
        result.push({
          key,
          value: null,
          children,
          path: currentPath
        })
      } else {
        // 处理普通值
        result.push({
          key,
          value,
          path: currentPath
        })
      }
    }
    
    return result
  }

  function importYamlVariables() {
    if (!yamlInput.value.trim()) return
    
    const parsed = parseYamlInput(yamlInput.value)
    variableTree.value = parsed
    
    // 如果没有设置变量路径，尝试从第一个变量生成
    if (!variablePath.value && parsed.length > 0) {
      const firstVar = findFirstLeafVariable(parsed)
      if (firstVar) {
        variablePath.value = firstVar.path
        variableAlias.value = firstVar.key
      }
    }
    
    // 如果有阶段，手动触发模板生成
    if (stages.value.length > 0) {
      generateEjsTemplate()
    }
  }

  function findFirstLeafVariable(nodes: VariableNode[], visited = new Set<string>()): VariableNode | null {
    for (const node of nodes) {
      // 防止无限递归
      if (visited.has(node.path)) {
        continue
      }
      visited.add(node.path)
      
      if (node.children && node.children.length > 0) {
        const found = findFirstLeafVariable(node.children, visited)
        if (found) return found
      } else {
        // 确保这是一个有效的叶子节点
        if (node.value !== null && node.value !== undefined) {
          return node
        }
      }
    }
    return null
  }

  function addStage() {
    const newStage: Stage = {
      id: `stage_${Date.now()}`,
      name: `阶段${stages.value.length + 1}`,
      condition: {
        type: 'greater',
        value: 0
      },
      content: ''
    }
    stages.value.push(newStage)
    selectedStageId.value = newStage.id
    generateEjsTemplate() // 手动触发模板生成
  }

  function removeStage(stageId: string) {
    const index = stages.value.findIndex(stage => stage.id === stageId)
    if (index > -1) {
      stages.value.splice(index, 1)
      if (selectedStageId.value === stageId) {
        selectedStageId.value = stages.value.length > 0 ? stages.value[0].id : ''
      }
      generateEjsTemplate() // 手动触发模板生成
    }
  }

  // 优化防抖模板生成，避免不必要的更新
  let isGenerating = ref(false)
  function updateStage(stageId: string, updates: Partial<Stage>) {
    const index = stages.value.findIndex(stage => stage.id === stageId)
    if (index > -1) {
      stages.value[index] = { ...stages.value[index], ...updates }
      generateEjsTemplate() // 直接生成模板，确保实时性
    }
  }

  function generateEjsTemplate() {
    if (!variablePath.value || !variableAlias.value || stages.value.length === 0) {
      const newTemplate = ''
      const newPreview = ''
      
      // 只有在值真正发生变化时才更新
      if (ejsTemplate.value !== newTemplate) {
        ejsTemplate.value = newTemplate
        previewCode.value = newPreview
      }
      return
    }

    try {
      errors.value = errors.value.filter(e => e.type !== 'ejs')
      
      let template = `<%_ const ${variableAlias.value} = getvar('${variablePath.value}'); _%>\n`
      
      // 按阶段条件值排序，确保逻辑正确
      const sortedStages = [...stages.value].sort((a, b) => {
        if (a.condition.type === 'range' && b.condition.type === 'range') {
          return a.condition.value - b.condition.value
        }
        if (a.condition.type === 'range') return -1
        if (b.condition.type === 'range') return 1
        return a.condition.value - b.condition.value
      })
      
      sortedStages.forEach((stage, index) => {
        const condition = generateCondition(stage.condition, variableAlias.value)
        const prefix = index === 0 ? 'if' : 'else if'
        
        template += `<%_ ${prefix} (${condition}) { _%>\n`
        // 确保内容不为空且正确格式化
        const content = stage.content || '// 空内容'
        template += content
        if (!content.endsWith('\n')) template += '\n'
        template += `<%_ } _%>\n`
      })
      
      // 在所有阶段后添加 else 分支
      if (sortedStages.length > 0) {
        template += `<%_ else { _%>\n// 默认情况\n<%_ } _%>\n`
      }

      // 只有在模板内容真正发生变化时才更新
      if (ejsTemplate.value !== template) {
        ejsTemplate.value = template
        previewCode.value = template
      }
    } catch (error) {
      errors.value.push({
        type: 'ejs',
        message: `模板生成错误: ${error instanceof Error ? error.message : '未知错误'}`
      })
    }
  }

  function generateCondition(condition: StageCondition, variableName: string): string {
    switch (condition.type) {
      case 'less':
        return `${variableName} < ${condition.value}`
      case 'lessEqual':
        return `${variableName} <= ${condition.value}`
      case 'equal':
        return `${variableName} == ${condition.value}`
      case 'greater':
        return `${variableName} > ${condition.value}`
      case 'greaterEqual':
        return `${variableName} >= ${condition.value}`
      case 'range':
        return `${variableName} >= ${condition.value} && ${variableName} < ${condition.endValue}`
      default:
        return `${variableName} > 0`
    }
  }

  function testSimulation() {
    if (!ejsTemplate.value || simulationValue.value === undefined) {
      testResult.value = ''
      return
    }

    try {
      // 模拟 getvar 函数
      const mockGetvar = (path: string) => {
        if (path === variablePath.value) {
          return simulationValue.value
        }
        return 0
      }

      // 使用EJS渲染模板
      const result = ejs.render(ejsTemplate.value, { getvar: mockGetvar })
      testResult.value = result.trim()
      
      // 找到匹配的阶段
      const matchedStage = stages.value.find(stage => {
        const condition = stage.condition
        const value = simulationValue.value
        
        switch (condition.type) {
          case 'less': return value < condition.value
          case 'lessEqual': return value <= condition.value
          case 'equal': return value === condition.value
          case 'greater': return value > condition.value
          case 'greaterEqual': return value >= condition.value
          case 'range': return value >= condition.value && value < (condition.endValue || 0)
          default: return false
        }
      })

      if (matchedStage) {
        testResult.value = `匹配阶段: ${matchedStage.name}\n\n${testResult.value}`
      }
    } catch (error) {
      testResult.value = `测试错误: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  function clearAll() {
    variablePath.value = ''
    variableAlias.value = ''
    yamlInput.value = ''
    variableTree.value = []
    stages.value = []
    selectedStageId.value = ''
    ejsTemplate.value = ''
    previewCode.value = ''
    simulationValue.value = 0
    testResult.value = ''
    errors.value = []
  }

  function exportConfig() {
    return {
      variablePath: variablePath.value,
      variableAlias: variableAlias.value,
      yamlInput: yamlInput.value,
      stages: stages.value,
      timestamp: new Date().toISOString()
    }
  }

  function importConfig(config: any) {
    try {
      variablePath.value = config.variablePath || ''
      variableAlias.value = config.variableAlias || ''
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

  // 移除自动监听器，改为手动触发模板生成以避免递归触发
  // 这样可以防止: Store watch → generateEjsTemplate → ejsTemplate更新 → 编辑器更新 的循环

  let simulationTimer: NodeJS.Timeout | null = null
  watch(simulationValue, () => {
    if (simulationTimer) clearTimeout(simulationTimer)
    simulationTimer = setTimeout(() => {
      try {
        if (ejsTemplate.value) {
          testSimulation()
        }
      } catch (error) {
        console.error('模拟测试监听器错误:', error)
      } finally {
        simulationTimer = null
      }
    }, 300) // 统一300ms防抖
  })

  return {
    // 状态
    variablePath,
    variableAlias,
    yamlInput,
    variableTree,
    stages,
    selectedStageId,
    ejsTemplate,
    previewCode,
    simulationValue,
    testResult,
    errors,
    isGenerating,
    
    // 计算属性
    selectedStage,
    hasErrors,
    
    // 方法
    importYamlVariables,
    addStage,
    removeStage,
    updateStage,
    generateEjsTemplate,
    testSimulation,
    clearAll,
    exportConfig,
    importConfig
  }
})