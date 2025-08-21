<template>
  <div class="world-editor-v2">
    <div class="editor-layout">
      <div class="toolbar-container">
        <WorldEditorToolbar
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
        />
      </div>
      <div class="main-panel-container">
        <WorldEditorMainPanel :selected-item="selectedItem" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { EnhancedLandmark, EnhancedForce } from '@/types/world-editor';
import { LandmarkType, ImportanceLevel, ForceType, PowerLevel, ActionType } from '@/types/world-editor';
import WorldEditorToolbar from './worldeditor/WorldEditorToolbar.vue';
import WorldEditorMainPanel from './worldeditor/WorldEditorMainPanel.vue';
import { v4 as uuidv4 } from 'uuid';
import { useHistory } from '@/composables/worldeditor/useHistory';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/localStorageUtils';

console.log('WorldEditorV2.vue loaded');

// Storage Keys
const LANDMARKS_STORAGE_KEY = 'world-editor-landmarks';
const FORCES_STORAGE_KEY = 'world-editor-forces';

// State Management
const landmarks = ref<EnhancedLandmark[]>([]);
const forces = ref<EnhancedForce[]>([]);
const selectedItem = ref<EnhancedLandmark | EnhancedForce | null>(null);

// History Management
const { canUndo, canRedo, add, undo, redo } = useHistory('world-editor-history');

// Watch for changes and save to local storage
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
  const savedLandmarks = loadFromLocalStorage(LANDMARKS_STORAGE_KEY);
  const savedForces = loadFromLocalStorage(FORCES_STORAGE_KEY);

  if (savedLandmarks && savedLandmarks.length > 0) {
    landmarks.value = savedLandmarks;
  } else {
    // Mock Data Generation for landmarks
    landmarks.value.push({
      id: uuidv4(),
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

  if (savedForces && savedForces.length > 0) {
    forces.value = savedForces;
  } else {
    // Mock Data Generation for forces
    forces.value.push({
      id: uuidv4(),
      name: '暗影兄弟会',
      description: '一个在大陆阴影中运作的秘密刺客组织，以其高效和无情而著称。',
      type: ForceType.CRIMINAL,
      power: PowerLevel.STRONG,
      structure: { hierarchy: ['导师', '刺客大师', '刺客'], decisionMaking: '独裁', recruitment: '选拔' },
      leaders: [{ name: '夜刃', title: '大导师' }],
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

  // Select the first landmark by default for demonstration
  if (!selectedItem.value) {
    selectedItem.value = landmarks.value[0] || forces.value[0] || null;
  }
});

const handleSelection = (item: EnhancedLandmark | EnhancedForce) => {
  selectedItem.value = item;
};
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


const createNewLandmark = (): EnhancedLandmark => ({
  id: uuidv4(),
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

const createNewForce = (): EnhancedForce => ({
    id: uuidv4(),
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
  if (type === 'landmark') {
    const newLandmark = createNewLandmark();
    landmarks.value.unshift(newLandmark);
    selectedItem.value = newLandmark;
    // Add create action to history
  } else {
    const newForce = createNewForce();
    forces.value.unshift(newForce);
    selectedItem.value = newForce;
    // Add create action to history
  }
};

const handleDelete = (item: EnhancedLandmark | EnhancedForce) => {
  if ('region' in item) { // is landmark
    const index = landmarks.value.findIndex(l => l.id === item.id);
    if (index > -1) {
      landmarks.value.splice(index, 1);
    }
  } else { // is force
    const index = forces.value.findIndex(f => f.id === item.id);
    if (index > -1) {
      forces.value.splice(index, 1);
    }
  }
  if (selectedItem.value?.id === item.id) {
    selectedItem.value = landmarks.value[0] || forces.value[0] || null;
  }
   // Add delete action to history
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
  margin-top: 1rem;
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