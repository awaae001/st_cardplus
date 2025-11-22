<template>
  <div class="integrated-panel">
    <div class="panel-header">
      <h1 class="panel-title">{{ currentProject?.name }} - 内容整合</h1>
      <div class="header-actions">
        <el-button type="primary" @click="exportSelectedJSON" :disabled="selectedItems.length === 0">
          <Icon icon="ph:export-duotone" />
          导出选中JSON ({{ selectedItems.length }})
        </el-button>
        <el-button type="success" @click="exportAllJSON">
          <Icon icon="ph:file-text-duotone" />
          导出全部JSON
        </el-button>
      </div>
    </div>

    <!-- 快速选择区域 -->
    <div class="selection-section">
      <el-row :gutter="16">
        <!-- 地标选择 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>选择地标 ({{ selectedLandmarks.length }}/{{ projectLandmarks.length }})</span>
                <div class="header-actions-small">
                  <el-button size="small" @click="selectAllLandmarks">全选</el-button>
                  <el-button size="small" @click="clearLandmarkSelection">清空</el-button>
                </div>
              </div>
            </template>
            <div class="selection-list">
              <div 
                v-for="landmark in projectLandmarks" 
                :key="landmark.id"
                class="selection-item"
                :class="{ selected: selectedLandmarks.includes(landmark.id) }"
                @click="toggleLandmarkSelection(landmark.id)"
              >
                <el-checkbox 
                  :model-value="selectedLandmarks.includes(landmark.id)"
                  @change="toggleLandmarkSelection(landmark.id)"
                />
                <div class="item-content">
                  <Icon icon="ph:map-pin-duotone" class="item-icon landmark-icon" />
                  <div class="item-info">
                    <div class="item-name">{{ landmark.name }}</div>
                    <div class="item-meta">{{ getLandmarkTypeLabel(landmark.type) }} | 重要性: {{ landmark.importance }}星</div>
                    <div class="item-description" v-if="landmark.description">
                      {{ landmark.description.slice(0, 50) }}{{ landmark.description.length > 50 ? '...' : '' }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="projectLandmarks.length === 0" class="empty-message">
                暂无地标数据
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 势力选择 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>选择势力 ({{ selectedForces.length }}/{{ projectForces.length }})</span>
                <div class="header-actions-small">
                  <el-button size="small" @click="selectAllForces">全选</el-button>
                  <el-button size="small" @click="clearForceSelection">清空</el-button>
                </div>
              </div>
            </template>
            <div class="selection-list">
              <div 
                v-for="force in projectForces" 
                :key="force.id"
                class="selection-item"
                :class="{ selected: selectedForces.includes(force.id) }"
                @click="toggleForceSelection(force.id)"
              >
                <el-checkbox 
                  :model-value="selectedForces.includes(force.id)"
                  @change="toggleForceSelection(force.id)"
                />
                <div class="item-content">
                  <Icon icon="ph:flag-duotone" class="item-icon force-icon" />
                  <div class="item-info">
                    <div class="item-name">{{ force.name }}</div>
                    <div class="item-meta">{{ getForceTypeLabel(force.type) }} | 实力: {{ force.power }}星</div>
                    <div class="item-description" v-if="force.description">
                      {{ force.description.slice(0, 50) }}{{ force.description.length > 50 ? '...' : '' }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="projectForces.length === 0" class="empty-message">
                暂无势力数据
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 预览区域 -->
    <div class="preview-section" v-if="selectedItems.length > 0">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>JSON预览</span>
            <el-button type="primary" size="small" @click="exportSelectedJSON">
              <Icon icon="ph:copy-duotone" />
              复制JSON
            </el-button>
          </div>
        </template>
        <div class="preview-content">
          <div class="preview-text">{{ generateJSON(selectedItems) }}</div>
        </div>
      </el-card>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElCard, ElButton, ElRow, ElCol, ElCheckbox, ElMessage } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { Project, EnhancedLandmark, EnhancedForce, ProjectIntegration, LandmarkType, ForceType } from '@/types/world-editor';
import { cleanObject } from '@/utils/objectUtils';

interface Props {
  integration: ProjectIntegration;
  currentProject: Project | null;
  landmarks: EnhancedLandmark[];
  forces: EnhancedForce[];
}

const props = defineProps<Props>();

// 选择状态
const selectedLandmarks = ref<string[]>([]);
const selectedForces = ref<string[]>([]);

// 计算当前项目的地标和势力
const projectLandmarks = computed(() => {
  if (!props.currentProject) return [];
  return props.landmarks.filter(l => l.projectId === props.currentProject!.id);
});

const projectForces = computed(() => {
  if (!props.currentProject) return [];
  return props.forces.filter(f => f.projectId === props.currentProject!.id);
});

// 计算选中的所有项目
const selectedItems = computed(() => {
  const landmarks = projectLandmarks.value.filter(l => selectedLandmarks.value.includes(l.id));
  const forces = projectForces.value.filter(f => selectedForces.value.includes(f.id));
  return [...landmarks, ...forces];
});

// 地标类型标签映射
const getLandmarkTypeLabel = (type: LandmarkType): string => {
  const labels = {
    city: '城市',
    town: '城镇', 
    village: '村庄',
    fortress: '要塞',
    ruins: '遗迹',
    dungeon: '地下城',
    temple: '神殿',
    academy: '学院',
    harbor: '港口',
    market: '市场',
    natural: '自然景观',
    mystical: '神秘地点',
    custom: '自定义'
  };
  return labels[type] || type;
};

// 势力类型标签映射
const getForceTypeLabel = (type: ForceType): string => {
  const labels = {
    political: '政治组织',
    military: '军事组织',
    religious: '宗教组织',
    commercial: '商业组织',
    criminal: '犯罪组织',
    academic: '学术组织',
    magical: '魔法组织',
    tribal: '部族组织',
    guild: '行会',
    cult: '教派',
    custom: '自定义'
  };
  return labels[type] || type;
};

// 选择操作方法
const toggleLandmarkSelection = (landmarkId: string) => {
  const index = selectedLandmarks.value.indexOf(landmarkId);
  if (index > -1) {
    selectedLandmarks.value.splice(index, 1);
  } else {
    selectedLandmarks.value.push(landmarkId);
  }
};

const toggleForceSelection = (forceId: string) => {
  const index = selectedForces.value.indexOf(forceId);
  if (index > -1) {
    selectedForces.value.splice(index, 1);
  } else {
    selectedForces.value.push(forceId);
  }
};

const selectAllLandmarks = () => {
  selectedLandmarks.value = projectLandmarks.value.map(l => l.id);
};

const clearLandmarkSelection = () => {
  selectedLandmarks.value = [];
};

const selectAllForces = () => {
  selectedForces.value = projectForces.value.map(f => f.id);
};

const clearForceSelection = () => {
  selectedForces.value = [];
};

// 生成简化的JSON数据（只保留核心字段：名称、介绍、类型、笔记）
const generateJSON = (items: (EnhancedLandmark | EnhancedForce)[]): string => {
  if (items.length === 0) return '{}';
  
  const landmarks = items.filter((item): item is EnhancedLandmark => 'region' in item);
  const forces = items.filter((item): item is EnhancedForce => 'power' in item);
  
  const exportData = {
    project: {
      name: props.currentProject?.name || '未命名项目',
      description: props.currentProject?.description || ''
    },
    landmarks: landmarks.map(landmark => cleanObject({
      name: landmark.name,
      description: landmark.description,
      type: getLandmarkTypeLabel(landmark.type),
      notes: landmark.notes
    })),
    forces: forces.map(force => cleanObject({
      name: force.name,
      description: force.description,
      type: getForceTypeLabel(force.type),
      notes: force.notes
    })),
    summary: {
      landmarkCount: landmarks.length,
      forceCount: forces.length,
      totalCount: items.length
    }
  };
  
  return JSON.stringify(exportData, null, 2);
};

// 导出方法
const exportSelectedJSON = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要导出的内容');
    return;
  }
  
  const jsonData = generateJSON(selectedItems.value);
  try {
    await navigator.clipboard.writeText(jsonData);
    ElMessage.success(`已复制 ${selectedItems.value.length} 项内容的JSON到剪贴板`);
  } catch (error) {
    ElMessage.error('复制到剪贴板失败');
  }
};

const exportAllJSON = async () => {
  const allItems = [...projectLandmarks.value, ...projectForces.value];
  if (allItems.length === 0) {
    ElMessage.warning('当前项目没有可导出的内容');
    return;
  }
  
  const jsonData = generateJSON(allItems);
  try {
    await navigator.clipboard.writeText(jsonData);
    ElMessage.success(`已复制全部 ${allItems.length} 项内容的JSON到剪贴板`);
  } catch (error) {
    ElMessage.error('复制到剪贴板失败');
  }
};
</script>

<style scoped>
.integrated-panel {
  padding: 16px;
  max-width: 100%;
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.selection-section {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions-small {
  display: flex;
  gap: 8px;
}

.selection-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.selection-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.selection-item:hover {
  border-color: var(--el-color-primary-light-5);
  background-color: var(--el-color-primary-light-9);
}

.selection-item.selected {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-8);
}

.item-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.item-icon {
  font-size: 20px;
  margin-top: 2px;
  flex-shrink: 0;
}

.landmark-icon {
  color: var(--el-color-primary);
}

.force-icon {
  color: var(--el-color-success);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.item-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.item-description {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  word-break: break-word;
}

.empty-message {
  text-align: center;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
  padding: 40px 20px;
}

.preview-section {
  margin-top: 24px;
}

.preview-content {
  max-height: 300px;
  overflow-y: auto;
}

.preview-text {
  white-space: pre-wrap;
  font-family: 'SF Mono', Monaco, Menlo, 'Roboto Mono', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  background-color: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .selection-section .el-row {
    margin: 0;
  }

  .selection-section .el-col {
    margin-bottom: 16px;
  }

  .selection-list {
    max-height: 300px;
  }

  .item-content {
    flex-direction: column;
    gap: 8px;
  }

  .item-icon {
    align-self: flex-start;
  }
}
</style>