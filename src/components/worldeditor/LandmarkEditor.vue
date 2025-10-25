<template>
  <el-scrollbar class="worldbook-editor-scrollbar">
    <div class="content-panel-body">
      <div v-if="!landmark" class="worldbook-editor-empty-state">
        <el-empty description="请在列表中选择或新增一个地标进行编辑 " :image-size="80"></el-empty>
      </div>
      <el-form v-if="landmark" :model="landmark" label-position="top" class="worldbook-editor-form">
        <!-- 基础信息 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:info-duotone" class="form-section-icon" />基础信息
          </h3>
          <div class="form-section-content">
            <div>
              <label class="form-label">名称</label>
              <el-input v-model="landmark.name" placeholder="例如：风语者山峰" />
              <p v-if="errors.name" class="error-message">{{ errors.name }}</p>
            </div>
            <div>
              <label class="form-label">描述</label>
              <el-input v-model="landmark.description" type="textarea" :rows="5" placeholder="关于这个地标的详细描述..." />
              <p v-if="errors.description" class="error-message">{{ errors.description }}</p>
            </div>
          </div>
        </section>

        <!-- 分类属性 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:tag-duotone" class="form-section-icon" />分类属性
          </h3>
          <div class="form-grid-3-col">
            <div>
              <label class="form-label">类型</label>
              <el-select v-model="landmark.type" class="form-full-width">
                <el-option v-for="type in landmarkTypes" :key="type" :label="localizeLandmarkType(type)" :value="type" />
              </el-select>
            </div>
             <div v-if="landmark.type === 'custom'">
               <label class="form-label">自定义类型</label>
               <el-input v-model="landmark.customType" placeholder="输入自定义类型" />
             </div>
            <div class="form-grid-span-2">
              <label class="form-label">重要性 (1-5)</label>
              <el-slider v-model.number="landmark.importance" :min="1" :max="5" show-stops />
            </div>
            <div class="form-grid-span-3">
              <label class="form-label">标签</label>
              <el-select v-model="landmark.tags" multiple filterable allow-create default-first-option placeholder="例如：山脉, 险峻, 神秘" class="form-full-width">
                <el-option v-for="tag in props.allTags" :key="tag" :label="tag" :value="tag" />
              </el-select>
            </div>
          </div>
        </section>

        <!-- 位置信息 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:map-pin-duotone" class="form-section-icon" />位置与关系
          </h3>
          <div class="form-section-content form-grid-2-col">
            <div class="form-section-content">
              <div>
                <label class="form-label">所属区域</label>
                <el-input v-model="landmark.region" placeholder="例如：北境" />
              </div>
              <div>
                <label class="form-label">重要地标</label>
                <el-select v-model="landmark.keyLandmarkId" clearable filterable placeholder="选择一个重要地标" class="form-full-width">
                  <el-option v-for="item in filteredLandmarks" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </div>
            </div>
            <div v-if="landmark.relativePosition" class="form-grid-4-col">
              <div>
                <label class="form-label">北</label>
                <el-select v-model="landmark.relativePosition.north" clearable filterable placeholder="选择北方地标" class="form-full-width">
                  <el-option v-for="item in filteredLandmarks" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </div>
              <div>
                <label class="form-label">南</label>
                <el-select v-model="landmark.relativePosition.south" clearable filterable placeholder="选择南方地标" class="form-full-width">
                  <el-option v-for="item in filteredLandmarks" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </div>
              <div>
                <label class="form-label">东</label>
                <el-select v-model="landmark.relativePosition.east" clearable filterable placeholder="选择东方地标" class="form-full-width">
                  <el-option v-for="item in filteredLandmarks" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </div>
              <div>
                <label class="form-label">西</label>
                <el-select v-model="landmark.relativePosition.west" clearable filterable placeholder="选择西方地标" class="form-full-width">
                  <el-option v-for="item in filteredLandmarks" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </div>
            </div>
          </div>
        </section>

        <!-- 扩展属性 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:leaf-duotone" class="form-section-icon" />扩展属性
          </h3>
          <div class="form-grid-3-col">
            <div>
              <label class="form-label">气候</label>
              <el-select v-model="landmark.climate" filterable allow-create default-first-option placeholder="例如：寒带苔原" class="form-full-width">
                <el-option v-for="item in commonClimates" :key="item.name" :label="item.name" :value="item.name">
                  <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span>{{ item.name }}</span>
                    <el-tooltip :content="item.description" placement="right">
                      <Icon icon="ph:info-duotone" style="margin-left: 8px; color: var(--el-text-color-secondary);" />
                    </el-tooltip>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div>
              <label class="form-label">地形</label>
              <el-select v-model="landmark.terrain" filterable allow-create default-first-option placeholder="例如：山地, 森林" class="form-full-width">
                <el-option v-for="terrain in commonTerrains" :key="terrain" :label="terrain" :value="terrain" />
              </el-select>
            </div>
            <div>
              <label class="form-label">人口</label>
              <el-input-number v-model.number="landmark.population" controls-position="right" class="form-full-width" />
            </div>
             <div>
              <label class="form-label">防御等级</label>
              <el-input-number v-model.number="landmark.defenseLevel" controls-position="right" class="form-full-width" />
            </div>
            <div class="form-grid-span-3">
              <label class="form-label">资源</label>
              <el-select v-model="landmark.resources" multiple filterable allow-create default-first-option placeholder="例如：铁矿, 魔法水晶" class="form-full-width">
              </el-select>
            </div>
          </div>
        </section>

        <!-- 元数据 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:note-pencil-duotone" class="form-section-icon" />元数据
          </h3>
          <div>
            <label class="form-label">备注</label>
            <el-input v-model="landmark.notes" type="textarea" :rows="3" placeholder="内部备注或额外信息..." />
          </div>
        </section>
      </el-form>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { defineProps, watch, computed } from 'vue';
import { ElScrollbar, ElForm, ElInput, ElSelect, ElOption, ElSlider, ElInputNumber, ElEmpty, ElTooltip } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { EnhancedLandmark } from '@/types/world-editor';
import { LandmarkType } from '@/types/world-editor';
import { useValidation } from '@/composables/worldeditor/useValidation';
import '@/css/worldbook.css';

interface Props {
  landmark: EnhancedLandmark | null;
  allLandmarks?: EnhancedLandmark[];
  allTags?: string[];
}

const props = defineProps<Props>();

// 虽然WorldBookEditor中没有直接使用，但考虑到LandmarkEditor原有功能，暂时保留校验逻辑
// 如果父组件统一处理，则可以移除
const { errors } = useValidation();

const landmarkTypes = Object.values(LandmarkType);

const commonClimates = [
  { name: '热带雨林', description: '全年高温多雨，物种丰富' },
  { name: '热带草原', description: '有明显的干湿两季，广阔的草原和稀疏的树木' },
  { name: '热带季风', description: '全年高温，分旱雨两季，雨季降水集中' },
  { name: '沙漠', description: '极端干旱，温差大，植被稀少' },
  { name: '亚热带季风', description: '夏季高温多雨，冬季温和少雨' },
  { name: '地中海', description: '夏季炎热干燥，冬季温和多雨' },
  { name: '温带海洋性', description: '全年温和湿润，气温年较差小' },
  { name: '温带大陆性', description: '冬冷夏热，年温差大，降水集中在夏季' },
  { name: '温带季风', description: '夏季高温多雨，冬季寒冷干燥' },
  { name: '亚寒带针叶林', description: '冬季漫长严寒，夏季短暂凉爽，以针叶林为主' },
  { name: '苔原', description: '全年低温，土壤冻结，只有苔藓、地衣等低等植物' },
  { name: '冰原', description: '终年严寒，地面覆盖厚厚的冰雪' },
  { name: '高原山地', description: '海拔高，气温随海拔升高而降低，气候垂直变化显著' },
  { name: '沼泽', description: '地表过湿或有薄层积水，生长着湿生和水生植物' },
  { name: '火山', description: '受火山活动影响，地热资源丰富，土壤肥沃' },
  { name: '魔法/虚空', description: '受魔法或异常能量影响的超自然气候' }
];

const commonTerrains = [
  '平原', '丘陵', '山地', '高原', '盆地',
  '森林', '草原', '沙漠', '沼泽', '海岸',
  '岛屿', '火山', '冰川', '河流', '湖泊'
];

const localizeLandmarkType = (type: LandmarkType): string => {
  const map: Record<LandmarkType, string> = {
    [LandmarkType.CITY]: '城市',
    [LandmarkType.TOWN]: '城镇',
    [LandmarkType.VILLAGE]: '村庄',
    [LandmarkType.FORTRESS]: '要塞',
    [LandmarkType.RUINS]: '遗迹',
    [LandmarkType.DUNGEON]: '地下城',
    [LandmarkType.TEMPLE]: '神殿',
    [LandmarkType.ACADEMY]: '学院',
    [LandmarkType.HARBOR]: '港口',
    [LandmarkType.MARKET]: '市场',
    [LandmarkType.NATURAL]: '自然景观',
    [LandmarkType.MYSTICAL]: '神秘地点',
    [LandmarkType.CUSTOM]: '自定义',
  };
  return map[type] || type;
};

// 过滤掉当前正在编辑的地标，用于相对位置选择
const filteredLandmarks = computed(() => {
  if (!props.allLandmarks || !props.landmark) {
    return [];
  }
  return props.allLandmarks.filter(item => item.id !== props.landmark!.id);
});

// 确保 relativePosition 对象存在
watch(() => props.landmark, (newLandmark) => {
  if (newLandmark && !newLandmark.relativePosition) {
    newLandmark.relativePosition = {};
  }
}, { immediate: true });

</script>
