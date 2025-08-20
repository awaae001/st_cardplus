import { ref, computed, type Ref } from 'vue'
import type { Project, LogicBlock, StageScheme } from '@/types/ejs-editor'

export function useEjsScheme(
  currentProject: Ref<Project | undefined>,
  logicBlocks: Ref<LogicBlock[]>,
  selectedStageId: Ref<string>,
  generateEjsTemplate: () => void
) {
  const currentSchemeId = ref('')

  const currentProjectSchemes = computed(() =>
    currentProject.value?.stageSchemes || []
  )

  const currentScheme = computed(() =>
    currentProjectSchemes.value.find(scheme => scheme.id === currentSchemeId.value)
  )

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

  return {
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
  }
}