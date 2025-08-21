<template>
  <el-scrollbar class="worldbook-editor-scrollbar">
    <div class="content-panel-body">
      <div v-if="!landmark" class="worldbook-editor-empty-state">
        <el-empty description="请在列表中选择或新增一个地标进行编辑。" :image-size="80"></el-empty>
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
            <div class="form-grid-span-2">
              <label class="form-label">重要性 (1-5)</label>
              <el-slider v-model.number="landmark.importance" :min="1" :max="5" show-stops />
            </div>
            <div class="form-grid-span-3">
              <label class="form-label">标签</label>
              <el-select v-model="landmark.tags" multiple filterable allow-create default-first-option placeholder="例如：山脉, 险峻, 神秘" class="form-full-width">
              </el-select>
            </div>
          </div>
        </section>

        <!-- 位置信息 -->
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:map-pin-duotone" class="form-section-icon" />位置信息
          </h3>
          <div v-if="landmark.coordinates" class="form-grid-3-col">
            <div>
              <label class="form-label">坐标 X</label>
              <el-input-number v-model.number="landmark.coordinates.x" controls-position="right" class="form-full-width" />
            </div>
            <div>
              <label class="form-label">坐标 Y</label>
              <el-input-number v-model.number="landmark.coordinates.y" controls-position="right" class="form-full-width" />
            </div>
            <div>
              <label class="form-label">所属区域</label>
              <el-input v-model="landmark.region" placeholder="例如：北境" />
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
              <el-input v-model="landmark.climate" placeholder="例如：寒带苔原" />
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
import { defineProps, watch } from 'vue';
import { ElScrollbar, ElForm, ElInput, ElSelect, ElOption, ElSlider, ElInputNumber, ElEmpty } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { EnhancedLandmark } from '@/types/world-editor';
import { LandmarkType } from '@/types/world-editor';
import { useValidation } from '@/composables/worldeditor/useValidation';
import '@/css/worldbook.css';

interface Props {
  landmark: EnhancedLandmark | null;
}

const props = defineProps<Props>();

// 虽然WorldBookEditor中没有直接使用，但考虑到LandmarkEditor原有功能，暂时保留校验逻辑
// 如果父组件统一处理，则可以移除
const { errors } = useValidation();

const landmarkTypes = Object.values(LandmarkType);

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

// 确保 coordinates 对象存在
watch(() => props.landmark, (newLandmark) => {
  if (newLandmark && !newLandmark.coordinates) {
    newLandmark.coordinates = { x: 0, y: 0 };
  }
}, { immediate: true });

</script>
