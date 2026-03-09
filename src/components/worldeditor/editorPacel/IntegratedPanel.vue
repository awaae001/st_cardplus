<template>
  <div class="integrated-panel">
    <div class="panel-header">
      <h1 class="panel-title">{{ currentProject?.name }} - 内容整合</h1>
      <div class="header-actions">
        <el-button
          type="primary"
          @click="exportSelectedJSON"
          :disabled="selectedItems.length === 0"
        >
          <Icon icon="ph:export-duotone" />
          <span class="btn-label">导出选中JSON</span>
          ({{ selectedItems.length }})
        </el-button>
        <el-button
          type="success"
          @click="exportAllJSON"
        >
          <Icon icon="ph:file-text-duotone" />
          <span class="btn-label">导出全部JSON</span>
        </el-button>
      </div>
    </div>

    <!-- 快速选择区域 -->
    <div class="selection-section">
      <el-row :gutter="16">
        <!-- 地标选择 -->
        <el-col
          :xs="24"
          :sm="8"
        >
          <el-card>
            <template #header>
              <div class="card-header">
                <span>选择地标 ({{ selectedLandmarks.length }}/{{ projectLandmarks.length }})</span>
                <div class="header-actions-small">
                  <el-button
                    size="small"
                    @click="selectAll('landmarks')"
                  >
                    全选
                  </el-button>
                  <el-button
                    size="small"
                    @click="clearSelection('landmarks')"
                  >
                    清空
                  </el-button>
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
                  <Icon
                    icon="ph:map-pin-duotone"
                    class="item-icon"
                    :color="landmarkIconColorMap.get(landmark.id)"
                  />
                  <div class="item-info">
                    <div class="item-name">{{ landmark.name }}</div>
                    <div class="item-meta">
                      {{ getLandmarkTypeLabel(landmark.type) }} | 重要性: {{ landmark.importance }}星
                    </div>
                    <div
                      class="item-description"
                      v-if="landmark.description"
                    >
                      {{ landmark.description.slice(0, 50) }}{{ landmark.description.length > 50 ? '...' : '' }}
                    </div>
                    <div
                      class="item-relations"
                      v-if="getLandmarkParentName(landmark) || getLandmarkChildNames(landmark).length"
                    >
                      <span v-if="getLandmarkParentName(landmark)">属于: {{ getLandmarkParentName(landmark) }}</span>
                      <span v-if="getLandmarkChildNames(landmark).length">
                        包括: {{ getLandmarkChildNames(landmark).join('、') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="projectLandmarks.length === 0"
                class="empty-message"
              >
                暂无地标数据
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 势力选择 -->
        <el-col
          :xs="24"
          :sm="8"
        >
          <el-card>
            <template #header>
              <div class="card-header">
                <span>选择势力 ({{ selectedForces.length }}/{{ projectForces.length }})</span>
                <div class="header-actions-small">
                  <el-button
                    size="small"
                    @click="selectAll('forces')"
                  >
                    全选
                  </el-button>
                  <el-button
                    size="small"
                    @click="clearSelection('forces')"
                  >
                    清空
                  </el-button>
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
                  <Icon
                    icon="ph:flag-duotone"
                    class="item-icon force-icon"
                  />
                  <div class="item-info">
                    <div class="item-name">{{ force.name }}</div>
                    <div class="item-meta">{{ getForceTypeLabel(force.type) }} | 实力: {{ force.power }}星</div>
                    <div
                      class="item-description"
                      v-if="force.description"
                    >
                      {{ force.description.slice(0, 50) }}{{ force.description.length > 50 ? '...' : '' }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="projectForces.length === 0"
                class="empty-message"
              >
                暂无势力数据
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 区域选择 -->
        <el-col
          :xs="24"
          :sm="8"
        >
          <el-card>
            <template #header>
              <div class="card-header">
                <span>选择区域 ({{ selectedRegions.length }}/{{ projectRegions.length }})</span>
                <div class="header-actions-small">
                  <el-button
                    size="small"
                    @click="selectAll('regions')"
                  >
                    全选
                  </el-button>
                  <el-button
                    size="small"
                    @click="clearSelection('regions')"
                  >
                    清空
                  </el-button>
                </div>
              </div>
            </template>
            <div class="selection-list">
              <div
                v-for="region in projectRegions"
                :key="region.id"
                class="selection-item"
                :class="{ selected: selectedRegions.includes(region.id) }"
                @click="toggleRegionSelection(region.id)"
              >
                <el-checkbox
                  :model-value="selectedRegions.includes(region.id)"
                  @change="toggleRegionSelection(region.id)"
                />
                <div class="item-content">
                  <Icon
                    icon="ph:map-trifold-duotone"
                    class="item-icon"
                    :color="regionIconColorMap.get(region.id)"
                  />
                  <div class="item-info">
                    <div class="item-name">{{ region.name }}</div>
                    <div
                      class="item-description"
                      v-if="region.description"
                    >
                      {{ region.description.slice(0, 50) }}{{ region.description.length > 50 ? '...' : '' }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="projectRegions.length === 0"
                class="empty-message"
              >
                暂无区域数据
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 预览区域 -->
    <div
      class="preview-section"
      v-if="selectedItems.length > 0"
    >
      <el-card class="preview-config-card">
        <div class="preview-config-row">
          <span class="preview-config-label">长度单位</span>
          <el-input
            v-model="lengthUnit"
            placeholder="长度单位"
            class="preview-config-input"
          />
          <div class="preview-config-toggle">
            <span class="preview-config-label">过滤空字段</span>
            <el-switch v-model="filterEmptyFields" />
          </div>
        </div>
      </el-card>
      <el-card>
        <template #header>
          <div class="card-header">
            <span>JSON预览</span>
            <div class="preview-actions">
              <el-button
                type="primary"
                size="small"
                @click="copySelectedJSON"
              >
                <Icon icon="ph:copy-duotone" />
                复制JSON
              </el-button>
            </div>
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
import type {
  EnhancedForce,
  EnhancedLandmark,
  EnhancedRegion,
  Project,
} from '@/types/world-editor';
import { formatRoadLinkLabel, getRoadConnectionLengthText } from '@/composables/worldeditor/graph/worldGraphLinks';
import { cleanObject, removeEmptyFields } from '@/utils/objectUtils';
import { saveFile } from '@/utils/fileSave';
import { getParentLandmarkId } from '@/utils/worldeditor/landmarkHierarchy';
import { getLandmarkTypeLabel } from '@/utils/worldeditor/landmarkMeta';
import { Icon } from '@iconify/vue';
import { ElButton, ElCard, ElCheckbox, ElCol, ElInput, ElMessage, ElRow, ElSwitch } from 'element-plus';
import { computed, ref } from 'vue';

interface Props {
  currentProject: Project | null;
  landmarks: EnhancedLandmark[];
  regions: EnhancedRegion[];
  forces: EnhancedForce[];
}

const props = defineProps<Props>();

// 选择状态
const selectedLandmarks = ref<string[]>([]);
const selectedForces = ref<string[]>([]);
const selectedRegions = ref<string[]>([]);
const filterEmptyFields = ref(true);
const lengthUnit = ref('KM');

// 计算当前项目的地标和势力
const projectLandmarks = computed(() => {
  if (!props.currentProject) return [];
  return props.landmarks.filter((l) => l.projectId === props.currentProject!.id);
});

const projectForces = computed(() => {
  if (!props.currentProject) return [];
  return props.forces.filter((f) => f.projectId === props.currentProject!.id);
});

const projectRegions = computed(() => {
  if (!props.currentProject) return [];
  return props.regions.filter((r) => r.projectId === props.currentProject!.id);
});

const DEFAULT_ICON_COLORS = {
  region: 'var(--el-color-warning)',
} as const;

const normalizeColor = (value?: string) => {
  const normalized = value?.trim();
  return normalized || undefined;
};

const resolveIconColor = (preferredColor: string | undefined, fallbackColor: string) =>
  normalizeColor(preferredColor) || fallbackColor;

const regionColorMap = computed(
  () => new Map(projectRegions.value.map((region) => [region.id, region.color]))
);

const landmarkIconColorMap = computed(() => {
  return new Map(
    projectLandmarks.value.map((landmark) => [
      landmark.id,
      normalizeColor(landmark.regionId ? regionColorMap.value.get(landmark.regionId) : undefined),
    ])
  );
});

const regionIconColorMap = computed(() => {
  return new Map(
    projectRegions.value.map((region) => [region.id, resolveIconColor(region.color, DEFAULT_ICON_COLORS.region)])
  );
});

const landmarkIdToName = computed(
  () => new Map(projectLandmarks.value.map((landmark) => [landmark.id, landmark.name]))
);

const getLandmarkParentName = (landmark: EnhancedLandmark) => {
  const parentId = getParentLandmarkId(landmark);
  if (!parentId) return '';
  return landmarkIdToName.value.get(parentId) || '';
};

const getLandmarkChildNames = (landmark: EnhancedLandmark) => {
  const childIds = landmark.childLandmarkIds || [];
  return childIds.map((id) => landmarkIdToName.value.get(id)).filter(Boolean) as string[];
};

// 计算选中的所有项目
const selectedItems = computed(() => {
  const landmarks = projectLandmarks.value.filter((l) => selectedLandmarks.value.includes(l.id));
  const forces = projectForces.value.filter((f) => selectedForces.value.includes(f.id));
  const regions = projectRegions.value.filter((r) => selectedRegions.value.includes(r.id));
  return [...landmarks, ...forces, ...regions];
});

// 势力类型标签映射
const getForceTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
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
    custom: '自定义',
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

const toggleRegionSelection = (regionId: string) => {
  const index = selectedRegions.value.indexOf(regionId);
  if (index > -1) {
    selectedRegions.value.splice(index, 1);
  } else {
    selectedRegions.value.push(regionId);
  }
};

type SelectionType = 'landmarks' | 'forces' | 'regions';

const selectAll = (type: SelectionType) => {
  if (type === 'landmarks') {
    selectedLandmarks.value = projectLandmarks.value.map((item) => item.id);
    return;
  }
  if (type === 'forces') {
    selectedForces.value = projectForces.value.map((item) => item.id);
    return;
  }
  selectedRegions.value = projectRegions.value.map((item) => item.id);
};

const clearSelection = (type: SelectionType) => {
  if (type === 'landmarks') {
    selectedLandmarks.value = [];
    return;
  }
  if (type === 'forces') {
    selectedForces.value = [];
    return;
  }
  selectedRegions.value = [];
};

// 生成增强的、可读性强的JSON数据
const generateJSON = (items: (EnhancedLandmark | EnhancedForce | EnhancedRegion)[]): string => {
  if (items.length === 0) return '{}';

  // 创建ID到名称的映射，以便将UUID替换为可读的名称
  const landmarkIdToNameMap = new Map(props.landmarks.map((l) => [l.id, l.name]));
  const forceIdToNameMap = new Map(props.forces.map((f) => [f.id, f.name]));
  const regionIdToNameMap = new Map(props.regions.map((r) => [r.id, r.name]));

  const idToName = (id: string, map: Map<string, string>) => map.get(id) || id;
  const toNameList = (value?: string | string[], map?: Map<string, string>) => {
    if (!value) return [];
    const list = Array.isArray(value) ? value : [value];
    return list.map((id) => idToName(id, map || new Map()));
  };
  const toRoadLinkLabelList = (landmark: EnhancedLandmark) =>
    (landmark.roadConnections || []).map((conn) => {
      const targetName = idToName(conn.targetId, landmarkIdToNameMap);
      const targetLandmark = props.landmarks.find((item) => item.id === conn.targetId);
      const lengthText = getRoadConnectionLengthText(landmark, targetLandmark, lengthUnit.value);
      return formatRoadLinkLabel(targetName, lengthText, '与此地标的距离');
    });

  const landmarks = items
    .filter((item): item is EnhancedLandmark => 'importance' in item)
    .map((landmark) => {
      const relativePosition = landmark.relativePosition
        ? {
            north: toNameList(landmark.relativePosition.north, landmarkIdToNameMap),
            south: toNameList(landmark.relativePosition.south, landmarkIdToNameMap),
            east: toNameList(landmark.relativePosition.east, landmarkIdToNameMap),
            west: toNameList(landmark.relativePosition.west, landmarkIdToNameMap),
          }
        : undefined;
      const parentName = landmark.parentLandmarkIds?.[0]
        ? idToName(landmark.parentLandmarkIds[0], landmarkIdToNameMap)
        : undefined;
      const childNames = (landmark.childLandmarkIds || [])
        .map((id) => idToName(id, landmarkIdToNameMap))
        .filter(Boolean);
      const cleanedLandmark = {
        name: landmark.name,
        description: landmark.description,
        type: getLandmarkTypeLabel(landmark.type),
        importance: landmark.importance,
        tags: landmark.tags,
        region: landmark.regionId ? idToName(landmark.regionId, regionIdToNameMap) : undefined,
        relativePosition,
        belongs_to: parentName || undefined,
        includes: childNames.length > 0 ? childNames : undefined,
        // 将关联ID转换为名称
        controllingForces: landmark.controllingForces?.map((id) => idToName(id, forceIdToNameMap)),
        relatedLandmarks: toRoadLinkLabelList(landmark),
        climate: landmark.climate,
        terrain: landmark.terrain,
        population: landmark.population,
        resources: landmark.resources,
        notes: landmark.notes,
      };
      return cleanObject(cleanedLandmark);
    });

  const forces = items
    .filter((item): item is EnhancedForce => 'power' in item)
    .map((force) => {
      const cleanedForce = {
        name: force.name,
        description: force.description,
        type: getForceTypeLabel(force.type),
        power: force.power,
        leaders: force.leaders?.map((l) => `${l.title}: ${l.name}`.trim()),
        totalMembers: force.totalMembers,
        // 将关联ID转换为名称
        headquarters: force.headquarters ? idToName(force.headquarters, landmarkIdToNameMap) : undefined,
        branchLocations: force.branchLocations?.map((branch) => {
          const locationName = idToName(branch.locationId, landmarkIdToNameMap);
          const managerInfo = branch.manager ? ` (主理人: ${branch.manager})` : '';
          return `${branch.type}: ${locationName}${managerInfo}`;
        }),
        allies: force.allies?.map((id) => idToName(id, forceIdToNameMap)),
        enemies: force.enemies?.map((id) => idToName(id, forceIdToNameMap)),
        capabilities: force.capabilities,
        weaknesses: force.weaknesses,
        tags: force.tags,
        notes: force.notes,
      };
      return cleanObject(cleanedForce);
    });

  const regions = items
    .filter((item): item is EnhancedRegion => !('importance' in item) && !('power' in item))
    .map((region) => {
      const cleanedRegion = {
        name: region.name,
        description: region.description,
        notes: region.notes,
      };
      return cleanObject(cleanedRegion);
    });

  const exportData = {
    project: {
      name: props.currentProject?.name || '未命名项目',
      description: props.currentProject?.description || '',
    },
    landmarks,
    regions,
    forces,
    summary: {
      landmarkCount: landmarks.length,
      regionCount: regions.length,
      forceCount: forces.length,
      totalCount: items.length,
    },
  };

  const outputData = filterEmptyFields.value ? removeEmptyFields(exportData) : exportData;
  return JSON.stringify(outputData ?? {}, null, 2);
};

// 导出方法
const exportSelectedJSON = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要导出的内容');
    return;
  }

  const jsonData = generateJSON(selectedItems.value);
  const projectName = (props.currentProject?.name || '未命名项目').trim() || '未命名项目';
  const safeProjectName = projectName.replace(/[\\/:*?"<>|]/g, '-');

  try {
    await saveFile({
      data: new TextEncoder().encode(jsonData),
      fileName: `${safeProjectName}-selected.json`,
      mimeType: 'application/json;charset=utf-8',
    });
    ElMessage.success(`已导出 ${selectedItems.value.length} 项内容为 JSON 文件`);
  } catch (error) {
    ElMessage.error('导出 JSON 文件失败');
  }
};

const copySelectedJSON = async () => {
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
  const allItems = [...projectLandmarks.value, ...projectForces.value, ...projectRegions.value];
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
  padding: 12px;
  max-width: 100%;
  height: 100%;
  overflow-y: auto;
}

.integrated-panel > .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.integrated-panel > .panel-header > .panel-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.integrated-panel > .panel-header > .header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.integrated-panel > .selection-section {
  margin-bottom: 24px;
}

.preview-config-card {
  margin-bottom: 12px;
}

.preview-config-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-config-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.preview-config-input {
  max-width: 180px;
}

.preview-config-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.card-header > .header-actions-small {
  display: flex;
  gap: 8px;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.selection-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.selection-list > .selection-item {
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

.selection-list > .selection-item:hover {
  border-color: var(--el-color-primary-light-5);
  background-color: var(--el-color-primary-light-9);
}

.selection-list > .selection-item.selected {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-8);
}

.selection-item > .item-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.item-content > .item-icon {
  font-size: 20px;
  margin-top: 2px;
  flex-shrink: 0;
}

.item-content > .item-icon.force-icon {
  color: var(--el-color-success);
}

.item-content > .item-info {
  flex: 1;
  min-width: 0;
}

.item-info > .item-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.item-info > .item-meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.item-info > .item-description {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  word-break: break-word;
}

.item-info > .item-relations {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selection-list > .empty-message {
  text-align: center;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
  padding: 40px 20px;
}

.integrated-panel > .preview-section {
  margin-top: 24px;
}

.preview-content {
  height: 300px;
  min-height: 180px;
  min-width: 260px;
  max-width: 100%;
  resize: both;
  overflow: auto;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
  background-color: var(--el-fill-color-light);
  padding: 0;
  box-sizing: border-box;
}

.preview-content::-webkit-resizer {
  background: linear-gradient(
    135deg,
    transparent 45%,
    var(--el-border-color) 45%,
    var(--el-border-color) 55%,
    transparent 55%
  );
}

.preview-content:focus-within {
  border-color: var(--el-color-primary-light-5);
}

.preview-content > .preview-text {
  min-height: 100%;
  box-sizing: border-box;
  margin: 0;
  white-space: pre-wrap;
  font-family: 'SF Mono', Monaco, Menlo, 'Roboto Mono', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  background-color: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 6px;
  border: none;
  overflow-y: auto;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .integrated-panel {
    padding: 6px;
  }

  .integrated-panel > .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 14px;
    padding-bottom: 12px;
  }

  .integrated-panel > .panel-header > .panel-title {
    font-size: 16px;
  }

  .integrated-panel > .panel-header > .header-actions {
    width: 100%;
    gap: 8px;
  }

  .integrated-panel > .panel-header > .header-actions .btn-label {
    display: none;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .integrated-panel > .selection-section :deep(.el-col) {
    margin-bottom: 12px;
  }

  .integrated-panel > .selection-section :deep(.el-col:last-child) {
    margin-bottom: 0;
  }

  .selection-list {
    max-height: 250px;
  }

  .selection-list > .selection-item {
    padding: 8px;
    gap: 8px;
  }

  .selection-item > .item-content {
    gap: 8px;
  }

  .item-info > .item-name {
    font-size: 13px;
  }

  .item-info > .item-meta {
    font-size: 11px;
  }

  .item-info > .item-description {
    font-size: 12px;
  }

  .preview-content > .preview-text {
    padding: 10px;
    font-size: 12px;
  }
}
</style>
