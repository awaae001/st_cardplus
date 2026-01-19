<template>
  <div class="world-editor-container">
    <div class="world-editor-mobile-layout">
      <el-tabs v-model="activeTab" type="border-card" class="world-editor-tabs-mobile">
        <el-tab-pane name="list" class="world-editor-tab-pane">
          <template #label>
            <span class="world-editor-tab-label">
              <Icon icon="ph:list-bullets-duotone" class="world-editor-tab-icon" />
              <span class="world-editor-tab-text">项目列表</span>
            </span>
          </template>
          <WorldEditorToolbar :projects="projects" :landmarks="landmarks" :forces="forces" :regions="regions" :selected-item="selectedItem"
            :can-undo="canUndo" :can-redo="canRedo" @select="handleSelection" @open-graph="handleOpenGraph"
            @add="handleAdd" @delete="handleDelete" @undo="handleUndo" @redo="handleRedo" @edit="handleEdit"
            @copy="handleCopy" :drag-drop-handlers="dragDropHandlers" />
        </el-tab-pane>
        <el-tab-pane name="editor" class="world-editor-tab-pane" :disabled="!selectedItem && !graphProjectId">
          <template #label>
            <span class="world-editor-tab-label">
              <Icon icon="ph:note-pencil-duotone" class="world-editor-tab-icon" />
              <span class="world-editor-tab-text-truncated">{{
                selectedItem ? selectedItem.name || "编辑中" : "编辑条目"
              }}</span>
            </span>
          </template>
          <WorldGraph
            v-if="graphProjectId"
            :projects="projects"
            :landmarks="landmarks"
            :forces="forces"
            :regions="regions"
            :active-project-id="graphProjectId || activeProjectId"
            @edit-item="handleEditFromGraph"
          />
          <WorldEditorMainPanel
            v-else
            :selected-item="selectedItem"
            :all-tags="allTags"
            :all-regions="allRegions"
            :landmarks="landmarks"
            :forces="forces"
            :regions="regions"
            :create-region="createRegion"
            :projects="projects"
            @update:selected-item="handleSelectionFromChild"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="world-editor-desktop-layout">
      <Splitpanes class="default-theme" style="height: 100%">
        <Pane size="15" min-size="12" max-size="30">
          <div class="toolbar-container">
            <WorldEditorToolbar :projects="projects" :landmarks="landmarks" :forces="forces" :regions="regions"
              :selected-item="selectedItem" :can-undo="canUndo" :can-redo="canRedo" @select="handleSelection"
              @open-graph="handleOpenGraph" @add="handleAdd" @delete="handleDelete" @undo="handleUndo"
              @redo="handleRedo" @edit="handleEdit" @copy="handleCopy" :drag-drop-handlers="dragDropHandlers" />
          </div>
        </Pane>
        <Pane size="85" min-size="70">
          <div class="main-panel-container">
            <WorldGraph
              v-if="graphProjectId"
              :projects="projects"
              :landmarks="landmarks"
              :forces="forces"
              :regions="regions"
              :active-project-id="graphProjectId || activeProjectId"
              @edit-item="handleEditFromGraph"
            />
            <WorldEditorMainPanel
              v-else
              :selected-item="selectedItem"
              :all-tags="allTags"
              :all-regions="allRegions"
              :landmarks="landmarks"
              :forces="forces"
              :regions="regions"
              :create-region="createRegion"
              :projects="projects"
              @update:selected-item="handleSelectionFromChild"
            />
          </div>
        </Pane>
      </Splitpanes>
    </div>
    <ProjectModal v-model:visible="isModalVisible" :project-data="editingProject" @submit="handleModalSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElTabs, ElTabPane } from "element-plus";
import { Icon } from "@iconify/vue";
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import '@/css/worldeditor.css';
import type { Project, EnhancedLandmark, EnhancedForce, EnhancedRegion, ProjectIntegration } from '@/types/world-editor';
import { ActionType } from '@/types/world-editor';
import WorldEditorToolbar from './worldeditor/WorldEditorToolbar.vue';
import WorldEditorMainPanel from './worldeditor/WorldEditorMainPanel.vue';
import WorldGraph from './worldeditor/WorldGraph.vue';
import ProjectModal from './worldeditor/ProjectModal.vue';
import { useHistory } from '@/composables/worldeditor/useHistory';
import { useWorldEditor } from '@/composables/worldeditor/useWorldEditor';
import { useWorldEditorUI } from '@/composables/worldeditor/useWorldEditorUI';
import { useDragAndDrop } from '@/composables/worldeditor/useDragAndDrop';

const activeTab = ref('list');
const graphProjectId = ref<string | null>(null);

// Core Logic
const {
  projects,
  landmarks,
  forces,
  regions,
  selectedItem,
  activeProjectId,
  allTags,
  allRegions,
  createRegion,
  handleSelection: coreHandleSelection,
  handleAdd: handleAddEntity,
  handleDelete,
  handleCopy,
  handleProjectSubmit
} = useWorldEditor();

const handleSelection = (item: Project | EnhancedLandmark | EnhancedForce | EnhancedRegion | ProjectIntegration) => {
  coreHandleSelection(item);
  activeTab.value = 'editor';
  graphProjectId.value = null;
};

const handleSelectionFromChild = (item: Project | EnhancedLandmark | EnhancedForce | EnhancedRegion | ProjectIntegration) => {
  coreHandleSelection(item);
  graphProjectId.value = null;
};

const handleEditFromGraph = (item: EnhancedLandmark) => {
  coreHandleSelection(item);
  graphProjectId.value = null;
  activeTab.value = 'editor';
};

const handleOpenGraph = (projectId: string) => {
  graphProjectId.value = projectId;
  activeTab.value = 'editor';
};

// UI Logic
const {
  isModalVisible,
  editingProject,
  handleAddProject,
  handleEdit: handleEditProject,
  handleModalSubmit
} = useWorldEditorUI(handleProjectSubmit);

// Drag and Drop Logic
const dragDropHandlers = useDragAndDrop(landmarks, forces, regions);

// History Management
const { canUndo, canRedo, add, undo, redo } = useHistory('world-editor-history');

// Event Handlers
const handleAdd = (type: 'project' | 'landmark' | 'force' | 'region') => {
  if (type === 'project') {
    handleAddProject();
  } else {
    handleAddEntity(type);
  }
};

const handleEdit = (item: Project | EnhancedLandmark | EnhancedForce | EnhancedRegion | ProjectIntegration) => {
  if ('createdAt' in item && !('projectId' in item)) { // Is a Project
    handleEditProject(item as Project);
  } else {
    // Selecting is the "edit" action for landmarks, forces, and integration
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

  if (!updateEntity(landmarks.value, restoredState) && !updateEntity(forces.value, restoredState) && !updateEntity(regions.value, restoredState)) {
    if ('importance' in restoredState) { // is landmark
      landmarks.value.push(restoredState as EnhancedLandmark);
    } else if ('power' in restoredState) { // is force
      forces.value.push(restoredState as EnhancedForce);
    } else { // is force
      regions.value.push(restoredState as EnhancedRegion);
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

  if (!updateEntity(landmarks.value, restoredState) && !updateEntity(forces.value, restoredState)) {
    updateEntity(regions.value, restoredState);
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
        let target: 'landmark' | 'force' | 'region' = 'force';
        if ('importance' in newState) {
          target = 'landmark';
        } else if ('power' in newState) {
          target = 'force';
        } else {
          target = 'region';
        }
        add({
          action: ActionType.UPDATE,
          target,
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
.world-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 4px;
  background-color: var(--el-bg-color-page);
  box-sizing: border-box;
}

.toolbar-container {
  height: 100%;
  overflow: hidden;
}

.main-panel-container {
  height: 100%;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  box-sizing: border-box;
  overflow: hidden;
}

</style>
