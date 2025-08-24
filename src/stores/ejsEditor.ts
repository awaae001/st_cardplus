import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { useEjsVariables } from '@/composables/ejs/useEjsVariables'
import { useEjsLogic } from '@/composables/ejs/useEjsLogic'
import { useEjsTemplate } from '@/composables/ejs/useEjsTemplate'
import { useEjsSimulation } from '@/composables/ejs/useEjsSimulation'
import { useEjsProject } from '@/composables/ejs/useEjsProject'
import { useEjsScheme } from '@/composables/ejs/useEjsScheme'
import type { Project, LogicBlock } from '@/types/ejs-editor'

export const useEjsEditorStore = defineStore('ejsEditor', () => {
  //  Core State 
  const projects = ref<Project[]>([])
  const currentProjectId = ref('')
  const logicBlocks = ref<LogicBlock[]>([])
  const isGenerating = ref(false)

  //  Composables Integration 
  const {
    yamlInput,
    variableTree,
    variableEditMode,
    errors,
    currentStageVariables,
    flatVariables,
    importYamlVariables,
    addNode,
    removeNode,
    updateNodeValue,
    findFirstLeafVariable,
    getReadablePath,
  } = useEjsVariables()

  const {
    ejsTemplate,
    previewCode,
    generateEjsTemplate,
  } = useEjsTemplate(logicBlocks, errors)

  const {
    selectedStageId,
    selectedLogicBlockId,
    selectedStageInstanceId,
    selectedLogicBlock,
    selectedStage,
    addLogicBlock,
    removeLogicBlock,
    updateLogicBlock,
    addStage,
    removeStage,
    updateStage,
    updateStagesOrder,
  } = useEjsLogic(logicBlocks, generateEjsTemplate)

  const {
    simulationValues,
    testResult,
    testSimulation,
  } = useEjsSimulation(ejsTemplate, logicBlocks)

  const scheme = useEjsScheme(
    computed(() => projects.value.find(p => p.id === currentProjectId.value)),
    logicBlocks,
    selectedStageId,
    generateEjsTemplate
  )

  const project = useEjsProject(
    projects,
    currentProjectId,
    yamlInput,
    logicBlocks,
    scheme.currentSchemeId,
    selectedStageId,
    importYamlVariables,
    generateEjsTemplate,
    scheme.loadSchemeState,
    scheme.saveCurrentSchemeState,
    scheme.createStageScheme,
    scheme.switchStageScheme,
    errors
  )

  const {
    currentSchemeId,
    currentProjectSchemes,
    currentScheme,
    createStageScheme,
    switchStageScheme,
    saveCurrentSchemeState,
    loadSchemeState,
    saveCurrentAsNewScheme,
    renameStageScheme,
    deleteStageScheme,
    copyStageScheme,
  } = scheme

  const {
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
    exportCurrentProject,
    exportWorkspace,
    importProjectsFromFile,
  } = project
  
  const hasErrors = computed(() => errors.value.length > 0)
  
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

  //  Watchers 
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

  return {
    // State
    projects,
    currentProjectId,
    currentProject,
    yamlInput,
    variableTree,
    logicBlocks,
    selectedStageId,
    variableEditMode,
    ejsTemplate,
    previewCode,
    simulationValues,
    testResult,
    errors,
    isGenerating,
    selectedStage,
    hasErrors,
    flatVariables,
    currentStageVariables,
    selectedLogicBlock,
    selectedLogicBlockId,
    selectedStageInstanceId,
    currentSchemeId,
    currentProjectSchemes,
    currentScheme,

    // Methods
    initializeStore,
    createProject,
    switchProject,
    saveCurrentProjectState,
    loadProjectState,
    renameProject,
    deleteProject,
    importAsNewProject,
    importYamlVariables,
    generateEjsTemplate,
    testSimulation,
    clearAll,
    exportConfig,
    importConfig,
    addNode,
    removeNode,
    updateNodeValue,
    findFirstLeafVariable,
    getReadablePath,
    addLogicBlock,
    removeLogicBlock,
    updateLogicBlock,
    addStage,
    removeStage,
    updateStage,
    updateStagesOrder,
    createStageScheme,
    switchStageScheme,
    saveCurrentSchemeState,
    loadSchemeState,
    saveCurrentAsNewScheme,
    renameStageScheme,
    deleteStageScheme,
    copyStageScheme,
    exportCurrentProject,
    exportWorkspace,
    importProjectsFromFile,
  }
})