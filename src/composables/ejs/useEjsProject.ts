import { computed, type Ref } from 'vue'
import type { Project, LogicBlock, StageScheme, EditorError } from '@/types/ejs-editor'

export function useEjsProject(
  projects: Ref<Project[]>,
  currentProjectId: Ref<string>,
  yamlInput: Ref<string>,
  logicBlocks: Ref<LogicBlock[]>,
  currentSchemeId: Ref<string>,
  selectedStageId: Ref<string>,
  importYamlVariables: () => void,
  generateEjsTemplate: () => void,
  loadSchemeState: (scheme: StageScheme) => void,
  saveCurrentSchemeState: () => void,
  createStageScheme: (name: string, description?: string) => string,
  switchStageScheme: (schemeId: string) => void,
  errors: Ref<EditorError[]>
) {
  const currentProject = computed(() =>
    projects.value.find(project => project.id === currentProjectId.value)
  )

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

  return {
    currentProject,
    createProject,
    switchProject,
    saveCurrentProjectState,
    loadProjectState,
    renameProject,
    deleteProject,
    importAsNewProject,
    exportConfig,
    importConfig,
    initializeStore,
  }
}