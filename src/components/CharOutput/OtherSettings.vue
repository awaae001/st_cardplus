<template>
  <div class="content-panel-body space-y-4 md:space-y-5 h-full flex flex-col">
    <div class="content-panel-header -mx-4 md:-mx-5 -mt-4 md:-mt-5 mb-5">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon icon="ph:gear-six-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
        其他设置
      </h3>
    </div>
    <div class="flex-grow space-y-5 px-1">
      <el-form-item class="other-settings-form-item">
        <template #label><span class="form-label-adv">发言频率 (Talkativeness)</span></template>
        <div class="slider-control-wrapper"> 
          <el-slider v-model="localOtherSettings.talkativeness" :min="0" :max="1" :step="0.01" show-input class="other-settings-slider" :show-tooltip="false" :debounce="300"/>
        </div>
      </el-form-item>
      <el-form-item class="other-settings-form-item">
        <template #label><span class="form-label-adv">是否收藏 (Favorite)</span></template>
        <el-switch v-model="localOtherSettings.fav" inline-prompt :active-icon="CheckIcon" :inactive-icon="CloseIcon" active-text="是" inactive-text="否" class="form-item-switch-control"/>
      </el-form-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, defineProps, defineEmits, nextTick } from 'vue';
import { Icon } from "@iconify/vue";
import { Check as CheckIcon, Close as CloseIcon } from '@element-plus/icons-vue';
import type { ElSlider, ElSwitch, ElFormItem } from 'element-plus';

interface OtherSettingsData {
  talkativeness: number; fav: boolean;
  data?: { extensions?: { talkativeness?: string; fav?: boolean; [key: string]: any; }; [key: string]: any; };
}
interface Props { form: OtherSettingsData; }

const props = defineProps<Props>();
const emit = defineEmits(['update:form']);

const localOtherSettings = reactive({ talkativeness: 0.5, fav: false });
let internalUpdateFlag_Other = false;

watch(() => [props.form.talkativeness, props.form.fav], 
  ([propTalk, propFav]) => {
    const pTalk = propTalk === undefined ? 0.5 : propTalk;
    const pFav = propFav === undefined ? false : propFav;
    let changed = false;
    if (pTalk !== localOtherSettings.talkativeness) { localOtherSettings.talkativeness = pTalk; changed = true; }
    if (pFav !== localOtherSettings.fav) { localOtherSettings.fav = pFav; changed = true; }

    if (changed) {
      // console.log('OtherSettings: Props updated localOtherSettings', JSON.parse(JSON.stringify(localOtherSettings)));
      internalUpdateFlag_Other = true;
      nextTick(() => { internalUpdateFlag_Other = false; });
    }
  }, { immediate: true }
);

watch(localOtherSettings, (newVal) => {
  if (internalUpdateFlag_Other) {
    // console.log('OtherSettings: Emit blocked for prop-driven update.');
    return;
  }
  const pTalk = props.form.talkativeness === undefined ? 0.5 : props.form.talkativeness;
  const pFav = props.form.fav === undefined ? false : props.form.fav;

  if (newVal.talkativeness !== pTalk || newVal.fav !== pFav) {
    // console.log('OtherSettings: Local changed. Emitting:', JSON.parse(JSON.stringify(newVal)));
    emit('update:form', {
      talkativeness: newVal.talkativeness,
      fav: newVal.fav,
      data: { 
        ...(props.form.data || {}), 
        extensions: { ...(props.form.data?.extensions || {}), talkativeness: String(newVal.talkativeness), fav: newVal.fav }
      }
    });
  }
}, { deep: true });
</script>

<style scoped>
.other-settings-form-item { display: flex; flex-direction: column; }
.other-settings-form-item :deep(.el-form-item__label) { text-align: left; line-height: 1.5; padding-bottom: 0.375rem; flex-shrink: 0; }
.other-settings-form-item :deep(.el-form-item__content) { margin-left: 0 !important; display: flex; flex-grow: 1; }
.slider-control-wrapper { width: 100%; display: flex; align-items: center; }
.other-settings-slider { flex-grow: 1; min-width: 0; }
.other-settings-slider :deep(.el-slider__runway) { flex: 1 1 auto; min-width: 40px; margin-right: 1rem; }
.other-settings-slider :deep(.el-slider__input) { flex: 0 0 auto; width: 6.5rem; }
.form-item-switch-control { margin-top: 0.25rem; }
@media (min-width: 768px) {
  .other-settings-form-item { flex-direction: row; align-items: center; }
  .other-settings-form-item :deep(.el-form-item__label) { padding-right: 0.75rem; padding-bottom: 0; }
  .form-item-switch-control { margin-top: 0; }
}
@media (max-width: 420px) {
  .other-settings-slider :deep(.el-slider__input) { width: 5rem !important; }
  .other-settings-slider :deep(.el-slider__runway) { margin-right: 0.5rem !important; }
}
.form-label-adv { font-size: var(--el-font-size-base); color: var(--el-text-color-regular); display: block; line-height: 1.5; }
</style>