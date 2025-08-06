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

export interface ConditionGroup {
  id: string;
  conditions: Condition[];
}

export interface Stage {
  id: string
  name: string
  conditionGroups: ConditionGroup[]
  content: string
  conditions?: Condition[]
  conjunction?: 'and' | 'or'
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

export interface StageScheme {
  id: string
  name: string
  stages: Stage[]
  defaultStageContent: string
  createdAt: string
  description?: string
}

export interface Project {
  id: string
  name: string
  yamlInput: string
  stages: Stage[]
  defaultStageContent: string
  createdAt: string
  updatedAt: string
  stageSchemes?: StageScheme[]
  currentSchemeId?: string
}

export const useEjsEditorStore = defineStore('ejsEditor', () => {
  // 项目管理
  const projects = ref<Project[]>([])
  const currentProjectId = ref('')
  
  // 基础状态
  const yamlInput = ref('')
  const variableTree = ref<VariableNode[]>([])
  
  // 阶段管理
  const stages = ref<Stage[]>([])
  const selectedStageId = ref('')
  const defaultStageContent = ref('// 默认情况')
  const variableEditMode = ref<'yaml' | 'tree'>('yaml')
  
  // 阶段方案管理
  const currentSchemeId = ref('')
  
  // 编辑器状态
  const ejsTemplate = ref('')
  const previewCode = ref('')
  
  // 测试模拟
  const simulationValues = ref<Record<string, any>>({})
  const testResult = ref('')
  const errors = ref<EditorError[]>([])
  const isGenerating = ref(false)

  // 计算属性
  const currentProject = computed(() => 
    projects.value.find(project => project.id === currentProjectId.value)
  )

  const selectedStage = computed(() => 
    stages.value.find(stage => stage.id === selectedStageId.value)
  )

  // 当前项目的阶段方案
  const currentProjectSchemes = computed(() => 
    currentProject.value?.stageSchemes || []
  )

  const currentScheme = computed(() => 
    currentProjectSchemes.value.find(scheme => scheme.id === currentSchemeId.value)
  )

  // 获取当前阶段的有效变量配置
  const currentStageVariables = computed(() => {
    const stage = selectedStage.value
    if (!stage) return variableTree.value
    return variableTree.value
  })

  const hasErrors = computed(() => errors.value.length > 0)


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
        path: currentPath // The path itself is the unique ID
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
      conditionGroups: [
        { id: `group_${Date.now()}`, conditions: [] }
      ],
      content: '',
      conditions: [],
      conjunction: 'and'
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
      let templateBody = ''
      stages.value.forEach((stage, index) => {
        const groupConditions = (stage.conditionGroups || [])
          .map(group => {
            const singleConditions = (group.conditions || [])
              .map(cond => generateSingleCondition(cond))
              .join(' && '); // Conditions within a group are ANDed
            return singleConditions ? `(${singleConditions})` : '';
          })
          .filter(c => c) // Remove empty groups
          .join(' || '); // Groups are ORed

        const condition = groupConditions || 'true'
        
        const content = stage.content || '// 空内容'
        const formattedContent = content.endsWith('\n') ? content : `${content}\n`
        if (index === 0) {
          templateBody += `<%_ if (${condition}) { _%>\n`
        } else {
          templateBody += `<%_ } else if (${condition}) { _%>\n`
        }
        templateBody += formattedContent
      })
      if (stages.value.length > 0) {
        templateBody += `<%_ } else { _%>\n${defaultStageContent.value}\n<%_ } _%>\n`
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
        // The key of simulationValues is the variable's readablePath (which is its ID now)
        return simulationValues.value[path]
      }
      const result = ejs.render(ejsTemplate.value, { getvar: mockGetvar })
      testResult.value = result.trim()
    } catch (error) {
      testResult.value = `测试错误: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  // --- 项目管理 ---
  function createProject(name: string = `项目${projects.value.length + 1}`, copyFromCurrent: boolean = false): string {
    // 保存当前项目状态
    if (currentProjectId.value) {
      saveCurrentProjectState()
    }

    const newProject: Project = {
      id: `project_${Date.now()}`,
      name,
      yamlInput: copyFromCurrent ? yamlInput.value : '',
      stages: copyFromCurrent ? [...stages.value] : [],
      defaultStageContent: copyFromCurrent ? defaultStageContent.value : '// 默认情况',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    projects.value.push(newProject)
    
    // 切换到新项目
    currentProjectId.value = newProject.id
    loadProjectState(newProject)
    
    return newProject.id
  }

  function switchProject(projectId: string) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) {
      throw new Error(`项目 ${projectId} 不存在`)
    }
    
    // 保存当前项目状态
    saveCurrentProjectState()
    
    // 切换到新项目
    currentProjectId.value = projectId
    loadProjectState(project)
  }

  function saveCurrentProjectState() {
    if (!currentProjectId.value) return
    
    const currentProject = projects.value.find(p => p.id === currentProjectId.value)
    if (currentProject) {
      currentProject.yamlInput = yamlInput.value
      currentProject.stages = [...stages.value]
      currentProject.defaultStageContent = defaultStageContent.value
      currentProject.currentSchemeId = currentSchemeId.value
      currentProject.updatedAt = new Date().toISOString()
      
      // 保存当前方案状态
      saveCurrentSchemeState()
    }
  }

  function loadProjectState(project: Project) {
    yamlInput.value = project.yamlInput
    
    // 重新导入变量
    if (project.yamlInput) {
      importYamlVariables()
    }
    
    // 加载阶段方案
    if (project.stageSchemes && project.stageSchemes.length > 0) {
      // 如果有当前方案ID，加载对应方案；否则加载第一个方案
      const targetSchemeId = project.currentSchemeId || project.stageSchemes[0].id
      const targetScheme = project.stageSchemes.find(s => s.id === targetSchemeId)
      
      if (targetScheme) {
        currentSchemeId.value = targetSchemeId
        loadSchemeState(targetScheme)
      } else {
        // 如果找不到方案，加载项目直接的阶段数据（兼容旧数据）
        stages.value = [...project.stages]
        defaultStageContent.value = project.defaultStageContent
        currentSchemeId.value = ''
      }
    } else {
      // 没有方案时，直接加载项目的阶段数据
      stages.value = [...project.stages]
      defaultStageContent.value = project.defaultStageContent
      currentSchemeId.value = ''
    }
    
    // 设置选中的阶段
    if (stages.value.length > 0) {
      selectedStageId.value = stages.value[0].id
    } else {
      selectedStageId.value = ''
    }
    
    generateEjsTemplate()
  }

  function renameProject(projectId: string, newName: string) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.name = newName
      project.updatedAt = new Date().toISOString()
    }
  }

  function deleteProject(projectId: string) {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index > -1) {
      projects.value.splice(index, 1)
      
      // 如果删除的是当前项目，切换到第一个项目或创建新项目
      if (currentProjectId.value === projectId) {
        if (projects.value.length > 0) {
          switchProject(projects.value[0].id)
        } else {
          // 创建新的默认项目
          createProject('默认项目')
          clearAll() // 清空状态
        }
      }
    }
  }

  function importAsNewProject(config: any, name?: string) {
    const projectName = name || `导入项目_${new Date().toLocaleString()}`
    
    const newProject: Project = {
      id: `project_${Date.now()}`,
      name: projectName,
      yamlInput: config.yamlInput || '',
      stages: config.stages || [],
      defaultStageContent: config.defaultStageContent || '// 默认情况',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    projects.value.push(newProject)
    switchProject(newProject.id)
    return newProject.id
  }

  function clearAll() {
    yamlInput.value = ''
    variableTree.value = []
    stages.value = []
    selectedStageId.value = ''
    defaultStageContent.value = '// 默认情况'
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
      defaultStageContent: defaultStageContent.value,
      timestamp: new Date().toISOString()
    }
  }

  function importConfig(config: any, replaceCurrentProject: boolean = false, projectName?: string) {
    try {
      if (replaceCurrentProject && currentProjectId.value) {
        // 替换当前项目
        const currentProject = projects.value.find(p => p.id === currentProjectId.value)
        if (currentProject) {
          currentProject.yamlInput = config.yamlInput || ''
          currentProject.stages = config.stages || []
          currentProject.defaultStageContent = config.defaultStageContent || '// 默认情况'
          currentProject.updatedAt = new Date().toISOString()
          loadProjectState(currentProject)
        }
      } else {
        // 创建新项目或直接导入到当前状态
        if (projects.value.length > 0) {
          // 如果已有项目，则创建新项目
          importAsNewProject(config, projectName)
        } else {
          // 没有项目时，直接导入到当前状态
          yamlInput.value = config.yamlInput || ''
          stages.value = config.stages || []
          defaultStageContent.value = config.defaultStageContent || '// 默认情况'
          if (config.yamlInput) {
            importYamlVariables()
          }
          if (stages.value.length > 0) {
            selectedStageId.value = stages.value[0].id
          }
          generateEjsTemplate()
        }
      }
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
    // 使用当前阶段的有效变量配置
    traverse(currentStageVariables.value)
    return result
  })

  // 初始化逻辑
  function initializeStore() {
    // 如果没有项目，创建默认项目
    if (projects.value.length === 0 && !currentProjectId.value) {
      const defaultProjectId = createProject('默认项目', false) // 不复制当前状态
      
      // 为默认项目创建一个默认方案（创建一个空的初始方案）
      const project = projects.value.find(p => p.id === defaultProjectId)
      if (project) {
        const defaultSchemeId = createStageScheme('默认方案', '初始阶段配置方案')
        switchStageScheme(defaultSchemeId)
      }
    }
  }

  // 自动保存当前项目状态的 watcher（带防抖）
  let saveProjectTimer: NodeJS.Timeout | null = null
  watch([yamlInput, stages, defaultStageContent, currentSchemeId], () => {
    if (currentProjectId.value) {
      if (saveProjectTimer) clearTimeout(saveProjectTimer)
      saveProjectTimer = setTimeout(() => {
        saveCurrentProjectState()
        saveProjectTimer = null
      }, 500) // 500ms 防抖
    }
  }, { deep: true })

  watch(simulationValues, testSimulation, { deep: true })

  // --- 阶段方案管理 ---
  function createStageScheme(name: string, description?: string): string {
    if (!currentProject.value) return ''
    
    const newScheme: StageScheme = {
      id: `scheme_${Date.now()}`,
      name,
      stages: [...stages.value],
      defaultStageContent: defaultStageContent.value,
      createdAt: new Date().toISOString(),
      description
    }

    // 初始化项目的stageSchemes数组
    if (!currentProject.value.stageSchemes) {
      currentProject.value.stageSchemes = []
    }

    currentProject.value.stageSchemes.push(newScheme)
    currentProject.value.updatedAt = new Date().toISOString()
    
    return newScheme.id
  }

  function switchStageScheme(schemeId: string) {
    const project = currentProject.value
    if (!project || !project.stageSchemes) return

    const scheme = project.stageSchemes.find(s => s.id === schemeId)
    if (!scheme) return

    // 保存当前方案状态
    saveCurrentSchemeState()

    // 切换到新方案
    currentSchemeId.value = schemeId
    project.currentSchemeId = schemeId
    loadSchemeState(scheme)
  }

  function saveCurrentSchemeState() {
    if (!currentSchemeId.value || !currentProject.value?.stageSchemes) return

    const scheme = currentProject.value.stageSchemes.find(s => s.id === currentSchemeId.value)
    if (scheme) {
      scheme.stages = [...stages.value]
      scheme.defaultStageContent = defaultStageContent.value
    }
  }

  function loadSchemeState(scheme: StageScheme) {
    stages.value = [...scheme.stages]
    defaultStageContent.value = scheme.defaultStageContent

    // 设置选中的阶段
    if (stages.value.length > 0) {
      selectedStageId.value = stages.value[0].id
    } else {
      selectedStageId.value = ''
    }

    generateEjsTemplate()
  }

  function saveCurrentAsNewScheme(name: string, description?: string): string {
    if (!currentProject.value) return ''
    
    return createStageScheme(name, description)
  }

  function renameStageScheme(schemeId: string, newName: string) {
    const project = currentProject.value
    if (!project?.stageSchemes) return

    const scheme = project.stageSchemes.find(s => s.id === schemeId)
    if (scheme) {
      scheme.name = newName
      project.updatedAt = new Date().toISOString()
    }
  }

  function deleteStageScheme(schemeId: string) {
    const project = currentProject.value
    if (!project?.stageSchemes) return

    const index = project.stageSchemes.findIndex(s => s.id === schemeId)
    if (index > -1) {
      project.stageSchemes.splice(index, 1)
      project.updatedAt = new Date().toISOString()

      // 如果删除的是当前方案，切换到第一个方案或清空
      if (currentSchemeId.value === schemeId) {
        if (project.stageSchemes.length > 0) {
          switchStageScheme(project.stageSchemes[0].id)
        } else {
          currentSchemeId.value = ''
          project.currentSchemeId = ''
          stages.value = []
          selectedStageId.value = ''
          generateEjsTemplate()
        }
      }
    }
  }

  function copyStageScheme(schemeId: string, newName?: string): string {
    const project = currentProject.value
    if (!project?.stageSchemes) return ''

    const sourceScheme = project.stageSchemes.find(s => s.id === schemeId)
    if (!sourceScheme) return ''

    const copyName = newName || `${sourceScheme.name} 副本`
    const newScheme: StageScheme = {
      id: `scheme_${Date.now()}`,
      name: copyName,
      stages: [...sourceScheme.stages],
      defaultStageContent: sourceScheme.defaultStageContent,
      createdAt: new Date().toISOString(),
      description: sourceScheme.description
    }

    project.stageSchemes.push(newScheme)
    project.updatedAt = new Date().toISOString()

    return newScheme.id
  }

  watch(simulationValues, testSimulation, { deep: true })

  return {
    // 项目管理状态
    projects, currentProjectId, currentProject,
    // 基础状态
    yamlInput, variableTree, stages, selectedStageId, defaultStageContent,
    variableEditMode, ejsTemplate, previewCode, simulationValues, testResult,
    errors, isGenerating,
    selectedStage, hasErrors, flatVariables, currentStageVariables,
    // 阶段方案管理状态
    currentSchemeId, currentProjectSchemes, currentScheme,
    // 项目管理方法
    initializeStore, createProject, switchProject, saveCurrentProjectState, loadProjectState,
    renameProject, deleteProject, importAsNewProject,
    // 基础方法
    importYamlVariables, addStage, removeStage, updateStage, generateEjsTemplate,
    testSimulation, clearAll, exportConfig, importConfig,
    // 节点编辑方法
    addNode, removeNode, updateNodeValue, findFirstLeafVariable, getReadablePath,
    // 阶段方案管理方法
    createStageScheme, switchStageScheme, saveCurrentSchemeState, loadSchemeState,
    saveCurrentAsNewScheme, renameStageScheme, deleteStageScheme, copyStageScheme
  }
})