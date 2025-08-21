<template>
  <div class="world-editor-v2">
    <div class="editor-layout">
      <div class="toolbar-container">
        <WorldEditorToolbar
          :projects="projects"
          :landmarks="landmarks"
          :forces="forces"
          :selected-item="selectedItem"
          :can-undo="canUndo"
          :can-redo="canRedo"
          @select="handleSelection"
          @add="handleAdd"
          @delete="handleDelete"
          @undo="handleUndo"
          @redo="handleRedo"
          @edit="handleEdit"
          @copy="handleCopy"
          @node-drop="() => {}"
          :drag-drop-handlers="dragDropHandlers"
        />
      </div>
      <div class="main-panel-container">
        <WorldEditorMainPanel :selected-item="selectedItem" />
      </div>
    </div>
    <ProjectModal
      v-model:visible="isModalVisible"
      :project-data="editingProject"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import type { Project, EnhancedLandmark, EnhancedForce } from '@/types/world-editor';
import { LandmarkType, ImportanceLevel, ForceType, PowerLevel, ActionType } from '@/types/world-editor';
import WorldEditorToolbar from './worldeditor/WorldEditorToolbar.vue';
import WorldEditorMainPanel from './worldeditor/WorldEditorMainPanel.vue';
import ProjectModal from './worldeditor/ProjectModal.vue';
import { v4 as uuidv4 } from 'uuid';
import { useHistory } from '@/composables/worldeditor/useHistory';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/localStorageUtils';

// Storage Keys
const PROJECTS_STORAGE_KEY = 'world-editor-projects';
const LANDMARKS_STORAGE_KEY = 'world-editor-landmarks';
const FORCES_STORAGE_KEY = 'world-editor-forces';

// State Management
const projects = ref<Project[]>([]);
const landmarks = ref<EnhancedLandmark[]>([]);
const forces = ref<EnhancedForce[]>([]);
const selectedItem = ref<Project | EnhancedLandmark | EnhancedForce | null>(null);

// Modal Management
const isModalVisible = ref(false);
const editingProject = ref<Project | null>(null);

// History Management
const { canUndo, canRedo, add, undo, redo } = useHistory('world-editor-history');

// Watch for changes and save to local storage
watch(projects, (newProjects) => {
    saveToLocalStorage(newProjects, PROJECTS_STORAGE_KEY);
}, { deep: true });

watch(landmarks, (newLandmarks) => {
  saveToLocalStorage(newLandmarks, LANDMARKS_STORAGE_KEY);
}, { deep: true });

watch(forces, (newForces) => {
  saveToLocalStorage(newForces, FORCES_STORAGE_KEY);
}, { deep: true });


// Watch for changes in the selected item to add to history
watch(
  () => selectedItem.value ? JSON.stringify(selectedItem.value) : '',
  (newJson, oldJson) => {
    if (oldJson && newJson) {
      const oldState = JSON.parse(oldJson);
      const newState = JSON.parse(newJson);

      // Only add to history if the ID is the same (i.e., it's an edit, not a selection change)
      if (oldState.id === newState.id) {
        add({
          action: ActionType.UPDATE,
          target: 'region' in newState ? 'landmark' : 'force',
          targetId: newState.id,
          previousState: oldState,
          newState: newState,
          description: `Updated ${newState.name}`,
        });
      }
    }
  },
  { deep: true }
);

// Load data or generate mock data on mount
onMounted(() => {
  const savedProjects = loadFromLocalStorage(PROJECTS_STORAGE_KEY);
  const savedLandmarks = loadFromLocalStorage(LANDMARKS_STORAGE_KEY);
  const savedForces = loadFromLocalStorage(FORCES_STORAGE_KEY);

  if (savedProjects && savedProjects.length > 0) {
    projects.value = savedProjects;
  } else {
    // Create a default project if none exists
    const defaultProject = {
      id: uuidv4(),
      name: '默认项目',
      description: '这是一个默认项目',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.value.push(defaultProject);
  }

  const defaultProjectId = projects.value[0]?.id;

  if (savedLandmarks && savedLandmarks.length > 0) {
    landmarks.value = savedLandmarks;
  } else {
    if (defaultProjectId) {
        landmarks.value.push({
      id: uuidv4(),
      projectId: defaultProjectId,
      name: '晨星城',
      description: '一座位于北境山脉中的坚固矮人城市，以其精湛的工艺和丰富的矿产而闻名。',
      type: LandmarkType.CITY,
      importance: ImportanceLevel.MAJOR,
      tags: ['矮人', '矿业', '山城'],
      coordinates: { x: 120, y: 350 },
      region: '北境',
      controllingForces: [],
      relatedLandmarks: [],
      climate: '寒带',
      population: 15000,
      resources: ['秘银', '精金', '黑铁'],
      defenseLevel: 9,
      notes: '城市的防御工事几乎坚不可摧。',
      imageUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    });
    }
  }

  if (savedForces && savedForces.length > 0) {
    forces.value = savedForces;
  } else {
    // Mock Data Generation for forces
    if (defaultProjectId) {
        forces.value.push({
      id: uuidv4(),
      projectId: defaultProjectId,
      name: '暗影兄弟会',
      description: '一个在大陆阴影中运作的秘密刺客组织，以其高效和无情而著称。',
      type: ForceType.CRIMINAL,
      power: PowerLevel.STRONG,
      structure: { hierarchy: ['导师', '刺客大师', '刺客'], decisionMaking: '独裁', recruitment: '选拔' },
      leaders: [{ id: uuidv4(), name: '夜刃', title: '大导师' }],
      members: [],
      totalMembers: 200,
      controlledTerritories: [],
      influenceAreas: [],
      allies: [],
      enemies: [],
      neutral: [],
      resources: [],
      capabilities: ['潜行', '毒药'],
      weaknesses: ['光明魔法'],
      history: [],
      tags: ['秘密', '刺客', '混乱中立'],
      notes: '他们的总部位置是一个严守的秘密。',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    });
    }
  }

  // Select the first landmark by default for demonstration
  if (!selectedItem.value) {
    selectedItem.value = landmarks.value[0] || forces.value[0] || null;
  }
});

const handleSelection = (item: Project | EnhancedLandmark | EnhancedForce) => {
  selectedItem.value = item;
};

const activeProjectId = computed(() => {
    if (!selectedItem.value) return projects.value[0]?.id;
    if ('projectId' in selectedItem.value) {
        return selectedItem.value.projectId;
    }
    // if selected item is a project
    if ('createdAt' in selectedItem.value) {
        return selectedItem.value.id;
    }
    return projects.value[0]?.id;
});

const handleUndo = () => {
  const restoredState = undo();
  if (!restoredState) return;

  const updateEntity = (collection: any[], updatedEntity: any) => {
    const index = collection.findIndex(e => e.id === updatedEntity.id);
    if (index !== -1) {
      collection[index] = updatedEntity;
      selectedItem.value = collection[index];
      return true;
    }
    return false;
  };

  if (!updateEntity(landmarks.value, restoredState) && !updateEntity(forces.value, restoredState)) {
    // If the entity wasn't in the list, it might have been deleted, so we add it back.
    if ('region' in restoredState) { // is landmark
        landmarks.value.push(restoredState as EnhancedLandmark);
    } else { // is force
        forces.value.push(restoredState as EnhancedForce);
    }
    selectedItem.value = restoredState;
  }
};

const handleRedo = () => {
  const restoredState = redo();
  if (!restoredState) return;
  
  const updateEntity = (collection: any[], updatedEntity: any) => {
    const index = collection.findIndex(e => e.id === updatedEntity.id);
    if (index !== -1) {
      collection[index] = updatedEntity;
      selectedItem.value = collection[index];
      return true;
    }
    return false;
  };

  if (!updateEntity(landmarks.value, restoredState)) {
    updateEntity(forces.value, restoredState);
  }
};


const createNewLandmark = (projectId: string): EnhancedLandmark => ({
  id: uuidv4(),
  projectId: projectId,
  name: '新地标',
  description: '',
  type: LandmarkType.CUSTOM,
  importance: ImportanceLevel.NORMAL,
  tags: [],
  region: '', // Add region to satisfy the type guard
  controllingForces: [],
  relatedLandmarks: [],
  resources: [],
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
});

const createNewForce = (projectId: string): EnhancedForce => ({
    id: uuidv4(),
    projectId: projectId,
    name: '新势力',
    description: '',
    type: ForceType.CUSTOM,
    power: PowerLevel.MODERATE,
    structure: { hierarchy: [], decisionMaking: '', recruitment: '' },
    leaders: [],
    members: [],
    totalMembers: 0,
    controlledTerritories: [],
    influenceAreas: [],
    allies: [],
    enemies: [],
    neutral: [],
    resources: [],
    capabilities: [],
    weaknesses: [],
    history: [],
    tags: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
});

const handleAdd = (type: 'project' | 'landmark' | 'force') => {
  if (type === 'project') {
    editingProject.value = null;
    isModalVisible.value = true;
    return;
  }

  const projectId = activeProjectId.value;
  if (!projectId) {
    console.error("No active project to add the item to.");
    return;
  }

  if (type === 'landmark') {
    const newLandmark = createNewLandmark(projectId);
    landmarks.value.unshift(newLandmark);
    selectedItem.value = newLandmark;
    // Add create action to history
  } else {
    const newForce = createNewForce(projectId);
    forces.value.unshift(newForce);
    selectedItem.value = newForce;
    // Add create action to history
  }
};

const handleDelete = (item: Project | EnhancedLandmark | EnhancedForce) => {
    if ('projectId' in item) { // Landmark or Force
        if ('region' in item) { // Landmark
            const index = landmarks.value.findIndex(l => l.id === item.id);
            if (index > -1) landmarks.value.splice(index, 1);
        } else { // Force
            const index = forces.value.findIndex(f => f.id === item.id);
            if (index > -1) forces.value.splice(index, 1);
        }
    } else if ('createdAt' in item) { // Project
        const project = item as Project;
        // Prevent deleting the last project
        if (projects.value.length <= 1) {
            console.warn("Cannot delete the last project.");
            // Optionally, show a user-facing message
            return;
        }
        const index = projects.value.findIndex(p => p.id === project.id);
        if (index > -1) {
            // Also delete associated landmarks and forces
            landmarks.value = landmarks.value.filter(l => l.projectId !== project.id);
            forces.value = forces.value.filter(f => f.projectId !== project.id);
            projects.value.splice(index, 1);
        }
    }

    if (selectedItem.value?.id === item.id) {
        selectedItem.value = projects.value[0] || landmarks.value[0] || forces.value[0] || null;
    }
    // Add delete action to history
};

const handleEdit = (item: Project | EnhancedLandmark | EnhancedForce) => {
   if ('projectId' in item) { // Is a Landmark or Force
       selectedItem.value = item;
   } else { // Is a Project
       editingProject.value = item;
       isModalVisible.value = true;
   }
};

const handleCopy = (item: EnhancedLandmark | EnhancedForce) => {
    if ('region' in item) {
        const landmarkItem = item as EnhancedLandmark;
        const newLandmark: EnhancedLandmark = {
            ...landmarkItem,
            id: uuidv4(),
            name: `${landmarkItem.name} (复制)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        landmarks.value.unshift(newLandmark);
        selectedItem.value = newLandmark;
    } else {
        const forceItem = item as EnhancedForce;
        const newForce: EnhancedForce = {
            ...forceItem,
            id: uuidv4(),
            name: `${forceItem.name} (复制)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        forces.value.unshift(newForce);
        selectedItem.value = newForce;
    }
};

const dragDropHandlers = {
    allowDrag: (draggingNode: any) => {
       const type = draggingNode.data.type;
       return type === 'landmark' || type === 'force';
   },
   allowDrop: (draggingNode: any, dropNode: any, type: any) => {
       const draggedType = draggingNode.data.type;
       const dropType = dropNode.data.type;
       const dropIsCategory = !dropNode.data.isEntry;

       // Cannot drop on itself
       if (draggingNode.data.id === dropNode.data.id) {
           return false;
       }

       // New Rule: Prevent dropping 'before' or 'after' a category folder
       if (dropIsCategory && type !== 'inner') {
           return false;
       }

       // 1. Drop into a project (or its category folders)
       if (dropType === 'project' && type === 'inner') return true;
       if (dropIsCategory && type === 'inner') {
            const dropParentType = dropNode.parent.data.type;
            // Allow dropping into the category folders directly under a project
            if (dropParentType === 'project') return true;
       }


       // 2. Sorting within the same category
       if (draggedType === dropType && (type === 'prev' || type === 'next')) {
           return true;
       }

       return false;
   },
   handleNodeDrop: (draggingNode: any, dropNode: any, dropType: any): boolean => {
       const draggedItem = draggingNode.data.raw;
       const dropItemRaw = dropNode.data.raw;

       if ('region' in draggedItem) { // Dragged item is a Landmark
           const list = landmarks.value;
           const fromIndex = list.findIndex(item => item.id === draggedItem.id);
           if (fromIndex === -1) return false;

           let newProjectId: string | null = null;
           if (dropNode.data.type === 'project') {
               newProjectId = dropNode.data.id;
           } else if (!dropNode.data.isEntry) { // Dropped on a category folder
               newProjectId = dropNode.parent.data.id;
           } else if ('projectId' in dropItemRaw && draggedItem.projectId !== dropItemRaw.projectId) {
               newProjectId = dropItemRaw.projectId;
           }

           if (newProjectId && draggedItem.projectId !== newProjectId) {
               draggedItem.projectId = newProjectId;
               const [item] = list.splice(fromIndex, 1);
               list.unshift(item);
               return true;
           }
           
           if (dropType === 'inner' || !('projectId' in dropItemRaw)) return false;
           
           const toIndex = list.findIndex(item => item.id === dropItemRaw.id);
           if (toIndex === -1) return false;

           const [item] = list.splice(fromIndex, 1);
           const insertIndex = dropType === 'before' ? toIndex : toIndex + 1;
           list.splice(insertIndex, 0, item);
           return true;

       } else { // Dragged item is a Force
           const list = forces.value;
           const fromIndex = list.findIndex(item => item.id === draggedItem.id);
           if (fromIndex === -1) return false;

           let newProjectId: string | null = null;
           if (dropNode.data.type === 'project') {
               newProjectId = dropNode.data.id;
           } else if (!dropNode.data.isEntry) { // Dropped on a category folder
               newProjectId = dropNode.parent.data.id;
           } else if ('projectId' in dropItemRaw && draggedItem.projectId !== dropItemRaw.projectId) {
               newProjectId = dropItemRaw.projectId;
           }

           if (newProjectId && draggedItem.projectId !== newProjectId) {
               draggedItem.projectId = newProjectId;
               const [item] = list.splice(fromIndex, 1);
               list.unshift(item);
               return true;
           }

           if (dropType === 'inner' || !('projectId' in dropItemRaw)) return false;

           const toIndex = list.findIndex(item => item.id === dropItemRaw.id);
           if (toIndex === -1) return false;

           const [item] = list.splice(fromIndex, 1);
           const insertIndex = dropType === 'before' ? toIndex : toIndex + 1;
           list.splice(insertIndex, 0, item);
           return true;
       }
   },
};

const handleModalSubmit = (projectData: Project) => {
    if (editingProject.value) {
        // Update existing project
        const index = projects.value.findIndex(p => p.id === editingProject.value!.id);
        if (index !== -1) {
            projects.value[index] = { ...projects.value[index], ...projectData, updatedAt: new Date().toISOString() };
        }
    } else {
        // Create new project
        const newProject = {
            ...projectData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        projects.value.unshift(newProject);
        selectedItem.value = newProject;
    }
    editingProject.value = null;
};
</script>

<style scoped>
.world-editor-v2 {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 4px;
  background-color: var(--el-bg-color-page);
  box-sizing: border-box;
}

.editor-layout {
  display: flex;
  flex-grow: 1;
  gap: 16px;
}

.toolbar-container {
  width: 300px; /* Adjusted width */
  flex-shrink: 0;
  /* Padding is removed, managed by toolbar internally */
}

.main-panel-container {
  flex-grow: 1;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
}
</style>