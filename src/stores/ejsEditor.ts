import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import * as yaml from 'js-yaml'
import * as ejs from 'ejs'
import type {
  Project,
  VariableNode,
  LogicBlock,
  EditorError,
  StageScheme,
  Stage,
  Condition
} from '@/types/ejs-editor'

export const useEjsEditorStore = defineStore('ejsEditor', () => {
  //  State 
  const projects = ref<Project[]>([])
  const currentProjectId = ref('')
  const yamlInput = ref('')
  const variableTree = ref<VariableNode[]>([])
  const logicBlocks = ref<LogicBlock[]>([])
  const selectedStageId = ref('') // Format: "logicBlockId/stageId"
  const variableEditMode = ref<'yaml' | 'tree'>('yaml')
  const currentSchemeId = ref('')
  const ejsTemplate = ref('')
  const previewCode = ref('')
  const simulationValues = ref<Record<string, any>>({})
  const testResult = ref('')
  const errors = ref<EditorError[]>([])
  const isGenerating = ref(false)

  //  Computed 
  const currentProject = computed(() =>
    projects.value.find(project => project.id === currentProjectId.value)
  )
  const selectedLogicBlockId = computed(() => selectedStageId.value.split('/')[0])
  const selectedStageInstanceId = computed(() => selectedStageId.value.split('/')[1])
  const selectedLogicBlock = computed(() =>
    logicBlocks.value.find(block => block.id === selectedLogicBlockId.value)
  )
  const selectedStage = computed(() =>
    selectedLogicBlock.value?.stages.find(stage => stage.id === selectedStageInstanceId.value)
  )
  const currentProjectSchemes = computed(() =>
    currentProject.value?.stageSchemes || []
  )
  const currentScheme = computed(() =>
    currentProjectSchemes.value.find(scheme => scheme.id === currentSchemeId.value)
  )
  const currentStageVariables = computed(() => {
    return variableTree.value
  })
  const hasErrors = computed(() => errors.value.length > 0)
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
    traverse(currentStageVariables.value)
    return result
  })

  //  YAML and Variable Tree Conversion 
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
        path: currentPath
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
        result += ` [${value[0]}`
        if (value[1]) {
          result += `, ${value[1]}`
        }
        result += `]\n`
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result += `\n${customYamlGenerate(value, indent + 1)}`
      } else {
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

  function importYamlVariables() {
    if (!yamlInput.value.trim()) {
      variableTree.value = []
      return
    }
    variableTree.value = parseYamlInput(yamlInput.value)
  }

  //  Variable Node Editing 
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

  //  Logic Block Management 
  function addLogicBlock() {
    const newBlock: LogicBlock = {
      id: `block_${Date.now()}`,
      name: `逻辑块 ${logicBlocks.value.length + 1}`,
      stages: [],
      defaultStageContent: '// 默认情况',
      enabled: true,
    };
    logicBlocks.value.push(newBlock);
    generateEjsTemplate();
  }

  function removeLogicBlock(blockId: string) {
    logicBlocks.value = logicBlocks.value.filter(block => block.id !== blockId);
    if (selectedLogicBlockId.value === blockId) {
      selectedStageId.value = '';
    }
    generateEjsTemplate();
  }

  function updateLogicBlock(blockId: string, updates: Partial<LogicBlock>) {
    const block = logicBlocks.value.find(b => b.id === blockId);
    if (block) {
      Object.assign(block, updates);
      generateEjsTemplate();
    }
  }

  //  Stage Management 
  function addStage(blockId: string) {
    const block = logicBlocks.value.find(b => b.id === blockId);
    if (!block) return;

    const newStage: Stage = {
      id: `stage_${Date.now()}`,
      name: `阶段 ${block.stages.length + 1}`,
      conditionGroups: [{ id: `group_${Date.now()}`, conditions: [] }],
      content: '',
    };
    block.stages.push(newStage);
    selectedStageId.value = `${block.id}/${newStage.id}`;
    generateEjsTemplate();
  }

  function removeStage(blockId: string, stageId: string) {
    const block = logicBlocks.value.find(b => b.id === blockId);
    if (!block) return;

    block.stages = block.stages.filter(stage => stage.id !== stageId);
    if (selectedStageId.value === `${blockId}/${stageId}`) {
      selectedStageId.value = block.stages.length > 0 ? `${blockId}/${block.stages[0].id}` : '';
    }
    generateEjsTemplate();
  }

  function updateStage(blockId: string, stageId: string, updates: Partial<Stage>) {
    const block = logicBlocks.value.find(b => b.id === blockId);
    if (!block) return;

    const stage = block.stages.find(s => s.id === stageId);
    if (stage) {
      Object.assign(stage, updates);
      generateEjsTemplate();
    }
  }

  function updateStagesOrder(blockId: string, newStages: Stage[]) {
    const block = logicBlocks.value.find(b => b.id === blockId);
    if (block) {
      block.stages = newStages;
      generateEjsTemplate();
    }
  }

  //  EJS Template Generation 
  function generateEjsTemplate() {
    if (logicBlocks.value.length === 0) {
      ejsTemplate.value = '';
      previewCode.value = '';
      return;
    }
    try {
      errors.value = errors.value.filter(e => e.type !== 'ejs');
      let finalTemplate = '';

      logicBlocks.value.forEach(block => {
        if (!block.enabled || block.stages.length === 0) {
          return; // Skip disabled or empty blocks
        }

        let blockTemplate = '';
        block.stages.forEach((stage, index) => {
          const groupConditions = (stage.conditionGroups || [])
            .map(group => {
              const singleConditions = (group.conditions || [])
                .map(cond => generateSingleCondition(cond))
                .join(' && ');
              return singleConditions ? `(${singleConditions})` : '';
            })
            .filter(c => c)
            .join(' || ');

          const condition = groupConditions || 'true';
          const content = stage.content || '// 空内容';
          const formattedContent = content.endsWith('\n') ? content : `${content}\n`;

          if (index === 0) {
            blockTemplate += `<%_ if (${condition}) { _%>\n`;
          } else {
            blockTemplate += `<%_ } else if (${condition}) { _%>\n`;
          }
          blockTemplate += formattedContent;
        });

        if (block.stages.length > 0) {
          const defaultContent = block.defaultStageContent || '// 默认情况';
          blockTemplate += `<%_ } else { _%>\n${defaultContent}\n<%_ } _%>\n`;
        }

        finalTemplate += blockTemplate + '\n'; // Add newline between blocks
      });

      ejsTemplate.value = finalTemplate.trim();
      previewCode.value = finalTemplate.trim();
    } catch (error) {
      errors.value.push({
        type: 'ejs',
        message: `模板生成错误: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  }

  function generateSingleCondition(condition: Condition): string {
    const varGetter = `getvar('${condition.variablePath}')`
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

  //  Simulation 
  function testSimulation() {
    if (!ejsTemplate.value) {
      testResult.value = ''
      return
    }
    try {
      const mockGetvar = (path: string) => {
        return simulationValues.value[path]
      }
      const result = ejs.render(ejsTemplate.value, { getvar: mockGetvar })
      testResult.value = result.trim()
    } catch (error) {
      testResult.value = `测试错误: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  //  Legacy Data Conversion 
  function convertLegacyData(projectData: any): LogicBlock[] {
    if (projectData.logicBlocks) {
      return projectData.logicBlocks; // Already new format
    }
    if (projectData.stages && Array.isArray(projectData.stages)) {
      // Old format detected, convert it
      const defaultBlock: LogicBlock = {
        id: `block_legacy_${Date.now()}`,
        name: '默认逻辑块',
        stages: projectData.stages,
        defaultStageContent: projectData.defaultStageContent || '// 默认情况',
        enabled: true,
      };
      return [defaultBlock];
    }
    return []; // No stage data
  }

  //  Project Management 
  function createProject(name: string = `项目${projects.value.length + 1}`, copyFromCurrent: boolean = false): string {
    if (currentProjectId.value) {
      saveCurrentProjectState()
    }

    const newProject: Project = {
      id: `project_${Date.now()}`,
      name,
      yamlInput: copyFromCurrent ? yamlInput.value : '',
      logicBlocks: copyFromCurrent ? JSON.parse(JSON.stringify(logicBlocks.value)) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    projects.value.push(newProject)
    currentProjectId.value = newProject.id
    loadProjectState(newProject)

    return newProject.id
  }

  function switchProject(projectId: string) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) throw new Error(`项目 ${projectId} 不存在`)

    saveCurrentProjectState()
    currentProjectId.value = projectId
    loadProjectState(project)
  }

  function saveCurrentProjectState() {
    if (!currentProjectId.value) return

    const project = projects.value.find(p => p.id === currentProjectId.value)
    if (project) {
      project.yamlInput = yamlInput.value
      project.logicBlocks = JSON.parse(JSON.stringify(logicBlocks.value))
      project.currentSchemeId = currentSchemeId.value
      project.updatedAt = new Date().toISOString()
      saveCurrentSchemeState()
    }
  }

  function loadProjectState(project: Project) {
    yamlInput.value = project.yamlInput
    if (project.yamlInput) {
      importYamlVariables()
    }

    const loadedLogicBlocks = convertLegacyData(project);

    if (project.stageSchemes && project.stageSchemes.length > 0) {
      const targetSchemeId = project.currentSchemeId || project.stageSchemes[0].id
      const targetScheme = project.stageSchemes.find(s => s.id === targetSchemeId)

      if (targetScheme) {
        currentSchemeId.value = targetSchemeId
        loadSchemeState(targetScheme)
      } else {
        logicBlocks.value = loadedLogicBlocks
        currentSchemeId.value = ''
      }
    } else {
      logicBlocks.value = loadedLogicBlocks
      currentSchemeId.value = ''
    }

    if (logicBlocks.value.length > 0 && logicBlocks.value[0].stages.length > 0) {
      selectedStageId.value = `${logicBlocks.value[0].id}/${logicBlocks.value[0].stages[0].id}`
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
      if (currentProjectId.value === projectId) {
        if (projects.value.length > 0) {
          switchProject(projects.value[0].id)
        } else {
          createProject('默认项目')
        }
      }
    }
  }

  //  Import / Export 
  function importAsNewProject(config: any, name?: string) {
    const projectName = name || `导入项目_${new Date().toLocaleString()}`

    const newProject: Project = {
      id: `project_${Date.now()}`,
      name: projectName,
      yamlInput: config.yamlInput || '',
      logicBlocks: convertLegacyData(config),
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
    logicBlocks.value = []
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
      logicBlocks: logicBlocks.value,
      timestamp: new Date().toISOString()
    }
  }

  function importConfig(config: any, replaceCurrentProject: boolean = false, projectName?: string) {
    try {
      const importedLogicBlocks = convertLegacyData(config);

      if (replaceCurrentProject && currentProjectId.value) {
        const project = projects.value.find(p => p.id === currentProjectId.value)
        if (project) {
          project.yamlInput = config.yamlInput || ''
          project.logicBlocks = importedLogicBlocks
          project.updatedAt = new Date().toISOString()
          loadProjectState(project)
        }
      } else {
        if (projects.value.length > 0) {
          importAsNewProject(config, projectName)
        } else {
          yamlInput.value = config.yamlInput || ''
          logicBlocks.value = importedLogicBlocks
          if (config.yamlInput) importYamlVariables()
          if (logicBlocks.value.length > 0 && logicBlocks.value[0].stages.length > 0) {
            selectedStageId.value = `${logicBlocks.value[0].id}/${logicBlocks.value[0].stages[0].id}`
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

  //  Initialization & Watchers 
  function initializeStore() {
    if (projects.value.length === 0 && !currentProjectId.value) {
      const defaultProjectId = createProject('默认项目', false)
      const project = projects.value.find(p => p.id === defaultProjectId)
      if (project) {
        const defaultSchemeId = createStageScheme('默认方案', '初始阶段配置方案')
        switchStageScheme(defaultSchemeId)
      }
    }
  }

  let saveProjectTimer: NodeJS.Timeout | null = null
  watch([yamlInput, logicBlocks, currentSchemeId], () => {
    if (currentProjectId.value) {
      if (saveProjectTimer) clearTimeout(saveProjectTimer)
      saveProjectTimer = setTimeout(() => {
        saveCurrentProjectState()
        saveProjectTimer = null
      }, 500)
    }
  }, { deep: true })

  watch(simulationValues, testSimulation, { deep: true })

  //  Stage Scheme Management 
  function createStageScheme(name: string, description?: string): string {
    if (!currentProject.value) return ''

    const newScheme: StageScheme = {
      id: `scheme_${Date.now()}`,
      name,
      logicBlocks: JSON.parse(JSON.stringify(logicBlocks.value)),
      createdAt: new Date().toISOString(),
      description
    }

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

    saveCurrentSchemeState()
    currentSchemeId.value = schemeId
    project.currentSchemeId = schemeId
    loadSchemeState(scheme)
  }

  function saveCurrentSchemeState() {
    if (!currentSchemeId.value || !currentProject.value?.stageSchemes) return

    const scheme = currentProject.value.stageSchemes.find(s => s.id === currentSchemeId.value)
    if (scheme) {
      scheme.logicBlocks = JSON.parse(JSON.stringify(logicBlocks.value))
    }
  }

  function loadSchemeState(scheme: StageScheme) {
    logicBlocks.value = JSON.parse(JSON.stringify(scheme.logicBlocks))

    if (logicBlocks.value.length > 0 && logicBlocks.value[0].stages.length > 0) {
      selectedStageId.value = `${logicBlocks.value[0].id}/${logicBlocks.value[0].stages[0].id}`
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

      if (currentSchemeId.value === schemeId) {
        if (project.stageSchemes.length > 0) {
          switchStageScheme(project.stageSchemes[0].id)
        } else {
          currentSchemeId.value = ''
          project.currentSchemeId = ''
          logicBlocks.value = []
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
      logicBlocks: JSON.parse(JSON.stringify(sourceScheme.logicBlocks)),
      createdAt: new Date().toISOString(),
      description: sourceScheme.description
    }

    project.stageSchemes.push(newScheme)
    project.updatedAt = new Date().toISOString()

    return newScheme.id
  }

  //  Helper Methods 
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

  return {
    // State
    projects, currentProjectId, currentProject,
    yamlInput, variableTree, logicBlocks, selectedStageId,
    variableEditMode, ejsTemplate, previewCode, simulationValues, testResult,
    errors, isGenerating,
    selectedStage, hasErrors, flatVariables, currentStageVariables,
    selectedLogicBlock, selectedLogicBlockId,
    currentSchemeId, currentProjectSchemes, currentScheme,

    // Methods
    initializeStore, createProject, switchProject, saveCurrentProjectState, loadProjectState,
    renameProject, deleteProject, importAsNewProject,

    importYamlVariables, generateEjsTemplate,
    testSimulation, clearAll, exportConfig, importConfig,

    addNode, removeNode, updateNodeValue, findFirstLeafVariable, getReadablePath,

    addLogicBlock, removeLogicBlock, updateLogicBlock,
    addStage, removeStage, updateStage, updateStagesOrder,

    createStageScheme, switchStageScheme, saveCurrentSchemeState, loadSchemeState,
    saveCurrentAsNewScheme, renameStageScheme, deleteStageScheme, copyStageScheme
  }
})