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
          :drag-drop-handlers="dragDropHandlers"
        />
      </div>
      <div class="main-panel-container">
        <WorldEditorMainPanel :selected-item="selectedItem" :all-tags="allTags" />
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
import { watch } from 'vue';
import type { Project, EnhancedLandmark, EnhancedForce } from '@/types/world-editor';
import { ActionType } from '@/types/world-editor';
import WorldEditorToolbar from './worldeditor/WorldEditorToolbar.vue';
import WorldEditorMainPanel from './worldeditor/WorldEditorMainPanel.vue';
import ProjectModal from './worldeditor/ProjectModal.vue';
import { useHistory } from '@/composables/worldeditor/useHistory';
import { useWorldEditor } from '@/composables/worldeditor/useWorldEditor';
import { useWorldEditorUI } from '@/composables/worldeditor/useWorldEditorUI';
import { useDragAndDrop } from '@/composables/worldeditor/useDragAndDrop';

// Core Logic
const {
  projects,
  landmarks,
  forces,
  selectedItem,
  allTags,
  handleSelection,
  handleAdd: handleAddEntity,
  handleDelete,
  handleCopy,
  handleProjectSubmit
} = useWorldEditor();

// UI Logic
const {
  isModalVisible,
  editingProject,
  handleAddProject,
  handleEdit: handleEditProject,
  handleModalSubmit
} = useWorldEditorUI(handleProjectSubmit);

// Drag and Drop Logic
const dragDropHandlers = useDragAndDrop(landmarks, forces);

// History Management
const { canUndo, canRedo, add, undo, redo } = useHistory('world-editor-history');

// Event Handlers
const handleAdd = (type: 'project' | 'landmark' | 'force') => {
  if (type === 'project') {
    handleAddProject();
  } else {
    handleAddEntity(type);
  }
};

const handleEdit = (item: Project | EnhancedLandmark | EnhancedForce) => {
  if ('createdAt' in item && !('projectId' in item)) { // Is a Project
    handleEditProject(item);
  } else {
    // Selecting is the "edit" action for landmarks and forces
    handleSelection(item);
  }
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

// Watch for changes in the selected item to add to history
watch(
  () => selectedItem.value ? JSON.stringify(selectedItem.value) : '',
  (newJson, oldJson) => {
    if (oldJson && newJson) {
      const oldState = JSON.parse(oldJson);
      const newState = JSON.parse(newJson);

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
  width: 300px;
  flex-shrink: 0;
}

.main-panel-container {
  flex-grow: 1;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
}
</style>