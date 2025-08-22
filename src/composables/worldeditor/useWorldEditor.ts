import { ref, onMounted, watch, computed } from 'vue';
import type { Project, EnhancedLandmark, EnhancedForce, ProjectIntegration } from '@/types/world-editor';
import { LandmarkType, ImportanceLevel, ForceType, PowerLevel } from '@/types/world-editor';
import { v4 as uuidv4 } from 'uuid';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/localStorageUtils';

const WORLD_EDITOR_DATA_KEY = 'world-editor-data';

export function useWorldEditor() {
  // State Management
  const projects = ref<Project[]>([]);
  const landmarks = ref<EnhancedLandmark[]>([]);
  const forces = ref<EnhancedForce[]>([]);
  const selectedItem = ref<Project | EnhancedLandmark | EnhancedForce | ProjectIntegration | null>(null);

  // Data Persistence
  watch(
    [projects, landmarks, forces],
    ([newProjects, newLandmarks, newForces]) => {
      const dataToSave = {
        projects: newProjects,
        landmarks: newLandmarks,
        forces: newForces,
      };
      saveToLocalStorage(dataToSave, WORLD_EDITOR_DATA_KEY);
    },
    { deep: true }
  );
  
  // Computed properties
  const allTags = computed(() => {
    const tags = new Set<string>();
    landmarks.value.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    forces.value.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  });

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

  // Methods
  const handleSelection = (item: Project | EnhancedLandmark | EnhancedForce | ProjectIntegration) => {
    selectedItem.value = item;
  };

  const createNewLandmark = (projectId: string): EnhancedLandmark => ({
    id: uuidv4(),
    projectId: projectId,
    name: '新地标',
    description: '',
    type: LandmarkType.CUSTOM,
    importance: ImportanceLevel.NORMAL,
    tags: [],
    region: '',
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

  const handleAdd = (type: 'landmark' | 'force') => {
    const projectId = activeProjectId.value;
    if (!projectId) {
      console.error("No active project to add the item to.");
      return;
    }

    if (type === 'landmark') {
      const newLandmark = createNewLandmark(projectId);
      landmarks.value.unshift(newLandmark);
      selectedItem.value = newLandmark;
    } else {
      const newForce = createNewForce(projectId);
      forces.value.unshift(newForce);
      selectedItem.value = newForce;
    }
  };

  const handleDelete = (item: Project | EnhancedLandmark | EnhancedForce | ProjectIntegration) => {
      // ProjectIntegration cannot be deleted, it's a virtual node
      if ('type' in item && item.type === 'integration') {
          console.warn("Integration nodes cannot be deleted.");
          return;
      }
      
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
          if (projects.value.length <= 1) {
              console.warn("Cannot delete the last project.");
              return;
          }
          const index = projects.value.findIndex(p => p.id === project.id);
          if (index > -1) {
              landmarks.value = landmarks.value.filter(l => l.projectId !== project.id);
              forces.value = forces.value.filter(f => f.projectId !== project.id);
              projects.value.splice(index, 1);
          }
      }

      if (selectedItem.value?.id === item.id) {
          selectedItem.value = projects.value[0] || landmarks.value[0] || forces.value[0] || null;
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

  const handleProjectSubmit = (projectData: Project, editingProject: Project | null) => {
      if (editingProject) {
          const index = projects.value.findIndex(p => p.id === editingProject.id);
          if (index !== -1) {
              projects.value[index] = { ...projects.value[index], ...projectData, updatedAt: new Date().toISOString() };
          }
      } else {
          const newProject = {
              ...projectData,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
          };
          projects.value.unshift(newProject);
          selectedItem.value = newProject;
      }
  };

  // Data Loading and Mock Data Generation
  onMounted(() => {
    const savedData = loadFromLocalStorage(WORLD_EDITOR_DATA_KEY);

    if (savedData && savedData.projects && savedData.projects.length > 0) {
      projects.value = savedData.projects;
      landmarks.value = savedData.landmarks || [];
      forces.value = savedData.forces || [];
    } else {
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

    if (savedData && savedData.landmarks && savedData.landmarks.length > 0) {
      landmarks.value = savedData.landmarks;
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

    if (savedData && savedData.forces && savedData.forces.length > 0) {
      forces.value = savedData.forces;
    } else {
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

    if (!selectedItem.value) {
      selectedItem.value = landmarks.value[0] || forces.value[0] || null;
    }
  });

  return {
    projects,
    landmarks,
    forces,
    selectedItem,
    allTags,
    handleSelection,
    handleAdd,
    handleDelete,
    handleCopy,
    handleProjectSubmit
  };
}