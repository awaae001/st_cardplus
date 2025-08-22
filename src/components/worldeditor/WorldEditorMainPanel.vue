<template>
  <div class="world-editor-main-panel">
    <template v-if="props.selectedItem">
      <div class="editor-header">
        <h1 class="page-title">{{ isIntegration(props.selectedItem) ? '项目整合' : '编辑区域' }}</h1>
        <WorldEditorActionButtons
          @save-to-file="handleSaveToFile"
          @load-from-file="handleLoadFromFile"
          @copy-to-clipboard="handleCopyToClipboard"
          @import-from-clipboard="handleImportFromClipboard"
        />
      </div>
      <div class="editor-content">
        <ProjectEditor v-if="isProject(props.selectedItem)" :project="props.selectedItem" />
        <LandmarkEditor v-else-if="isLandmark(props.selectedItem)" :landmark="props.selectedItem" :all-tags="props.allTags" />
        <ForceEditor v-else-if="isForce(props.selectedItem)" :force="props.selectedItem" :all-tags="props.allTags" />
        <IntegratedPanel 
          v-else-if="isIntegration(props.selectedItem)" 
          :integration="props.selectedItem"
          :current-project="getCurrentProject(props.selectedItem)"
          :landmarks="props.landmarks || []"
          :forces="props.forces || []"
        />
        <div v-else class="editor-placeholder">
          <p>未知项目类型</p>
        </div>
      </div>
    </template>
    <div v-else class="editor-placeholder">
      <p>请从左侧列表选择一个项目进行编辑</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Project, EnhancedLandmark, EnhancedForce, ProjectIntegration } from '@/types/world-editor';
import ProjectEditor from './ProjectEditor.vue';
import LandmarkEditor from './LandmarkEditor.vue';
import ForceEditor from './ForceEditor.vue';
import IntegratedPanel from './IntegratedPanel.vue';
import WorldEditorActionButtons from './WorldEditorActionButtons.vue';
import { ElMessage } from 'element-plus';

interface Props {
  selectedItem: Project | EnhancedLandmark | EnhancedForce | ProjectIntegration | null;
  allTags?: string[];
  landmarks?: EnhancedLandmark[];
  forces?: EnhancedForce[];
  projects?: Project[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:selectedItem', item: Project | EnhancedLandmark | EnhancedForce): void;
}>();

const updateSelectedItem = (importedData: any) => {
  if (!props.selectedItem) return;
  const updatedItem = {
    ...props.selectedItem,
    ...importedData,
    id: props.selectedItem.id,
  };
  emit('update:selectedItem', updatedItem);
  ElMessage.success('导入成功！');
};

// 对于整合面板，我们需要特殊处理剪贴板和文件系统操作
const handleCopyToClipboard = () => {
  if (!props.selectedItem) return;
  
  if (isIntegration(props.selectedItem)) {
    // 整合面板：导出当前项目的完整数据
    const currentProject = getCurrentProject(props.selectedItem);
    if (currentProject) {
      const projectLandmarks = props.landmarks?.filter(l => l.projectId === currentProject.id) || [];
      const projectForces = props.forces?.filter(f => f.projectId === currentProject.id) || [];
      
      const exportData = {
        project: currentProject,
        landmarks: projectLandmarks,
        forces: projectForces
      };
      
      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
        .then(() => ElMessage.success('项目数据已复制到剪贴板'))
        .catch(() => ElMessage.error('复制失败'));
    }
  } else {
    // 非整合面板：使用原有逻辑
    const jsonData = JSON.stringify(props.selectedItem, null, 2);
    navigator.clipboard.writeText(jsonData)
      .then(() => ElMessage.success('数据已复制到剪贴板'))
      .catch(() => ElMessage.error('复制失败'));
  }
};

const handleImportFromClipboard = async () => {
  if (!props.selectedItem) return;
  
  try {
    const text = await navigator.clipboard.readText();
    const importedData = JSON.parse(text);
    
    if (isIntegration(props.selectedItem)) {
      // 整合面板：导入项目数据
      if (importedData.project) {
        emit('update:selectedItem', importedData.project);
      }
      // 这里可以添加导入地标和势力的逻辑
      ElMessage.success('项目数据导入成功');
    } else {
      // 非整合面板：使用原有逻辑
      updateSelectedItem(importedData);
    }
  } catch (error) {
    ElMessage.error('导入失败：数据格式错误');
  }
};

const handleSaveToFile = () => {
  if (!props.selectedItem) return;
  
  if (isIntegration(props.selectedItem)) {
    // 整合面板：保存项目完整数据
    const currentProject = getCurrentProject(props.selectedItem);
    if (currentProject) {
      const projectLandmarks = props.landmarks?.filter(l => l.projectId === currentProject.id) || [];
      const projectForces = props.forces?.filter(f => f.projectId === currentProject.id) || [];
      
      const exportData = {
        project: currentProject,
        landmarks: projectLandmarks,
        forces: projectForces
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name || 'project'}_complete.json`;
      a.click();
      URL.revokeObjectURL(url);
      ElMessage.success('项目数据已保存');
    }
  } else {
    // 非整合面板：保存单个项目数据
    const blob = new Blob([JSON.stringify(props.selectedItem, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(props.selectedItem as any).name || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('数据已保存');
  }
};

const handleLoadFromFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (isIntegration(props.selectedItem!)) {
            // 整合面板：加载项目数据
            if (data.project) {
              emit('update:selectedItem', data.project);
            }
            ElMessage.success('项目数据加载成功');
          } else {
            // 非整合面板：使用原有逻辑
            updateSelectedItem(data);
          }
        } catch (error) {
          ElMessage.error('文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const isProject = (item: any): item is Project => {
  return item && 'createdAt' in item && !('projectId' in item);
}

const isLandmark = (item: any): item is EnhancedLandmark => {
  return item && 'projectId' in item && 'region' in item;
};

const isForce = (item: any): item is EnhancedForce => {
  return item && 'projectId' in item && 'power' in item;
}

const isIntegration = (item: any): item is ProjectIntegration => {
  return item && item.type === 'integration';
}

const getCurrentProject = (integration: ProjectIntegration): Project | null => {
  if (!props.projects) return null;
  return props.projects.find(p => p.id === integration.projectId) || null;
}

</script>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.world-editor-main-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.editor-content {
  flex-grow: 1;
  overflow-y: auto;
}

.editor-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
}
</style>