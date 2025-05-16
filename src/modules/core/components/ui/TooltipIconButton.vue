<template>
  <el-tooltip
    :content="tooltipContent"
    :placement="tooltipPlacement"
    :show-arrow="false"
    :offset="tooltipOffset"
    :hide-after="tooltipHideAfter"
  >
    <button
      type="button"
      :aria-label="labelText" <!-- Changed from ariaLabel to labelText -->
      :disabled="disabled"
      :class="['btn-base-icon-tooltip group', buttonClass, { 'opacity-50 cursor-not-allowed': disabled }]"
      @click="handleClick"
    >
      <Icon
        :icon="icon"
        :class="['group-hover:scale-110 transition-transform', iconClass]"
      />
    </button>
  </el-tooltip>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { ElTooltip } from 'element-plus';
import { Icon } from '@iconify/vue';

/**
 * @component TooltipIconButton
 * @description 一个带有图标和Element Plus Tooltip提示的按钮组件。
 *
 * @prop {string} icon - (必填) Iconify 图标的标识符 (例如: 'ph:folder-open-duotone').
 * @prop {string} tooltipContent - (必填) Tooltip 中显示的提示文字.
 * @prop {'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'} [tooltipPlacement='bottom'] - Tooltip 的显示位置.
 * @prop {string} labelText - (必填) 按钮的 `aria-label` 属性，用于可访问性.
 * @prop {boolean} [disabled=false] - 是否禁用按钮.
 * @prop {string} [buttonClass=''] - 应用于按钮元素的额外 CSS 类名.
 * @prop {string} [iconClass='text-lg'] - 应用于图标元素的额外 CSS 类名.
 * @prop {number} [tooltipHideAfter=0] - Tooltip 延迟隐藏的时间 (毫秒). 0 表示不自动隐藏.
 * @prop {number} [tooltipOffset=8] - Tooltip 相对于目标的偏移量 (像素).
 *
 * @emit click - 当按钮被点击时触发 (event: MouseEvent).
 */
interface Props {
  /** Iconify 图标的标识符 (例如: 'ph:folder-open-duotone') */
  icon: string;
  /** Tooltip 中显示的提示文字 */
  tooltipContent: string;
  /** Tooltip 的显示位置 */
  tooltipPlacement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
  /** 按钮的 `aria-label` 属性，用于可访问性 */
  labelText: string; // Changed from ariaLabel to labelText
  /** 是否禁用按钮 */
  disabled?: boolean;
  /** 应用于按钮元素的额外 CSS 类名 */
  buttonClass?: string;
  /** 应用于图标元素的额外 CSS 类名 */
  iconClass?: string;
  /** Tooltip 延迟隐藏的时间 (毫秒). 0 表示不自动隐藏. */
  tooltipHideAfter?: number;
  /** Tooltip 相对于目标的偏移量 (像素). */
  tooltipOffset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  tooltipPlacement: 'bottom',
  disabled: false,
  buttonClass: '',
  iconClass: 'text-lg',
  tooltipHideAfter: 0,
  tooltipOffset: 8,
});

const emit = defineEmits<{
  /**
   * 当按钮被点击时触发。
   * @param {MouseEvent} event - 鼠标事件对象。
   */
  (e: 'click', event: MouseEvent): void;
}>();

/**
 * 处理按钮点击事件。
 * 如果按钮未被禁用，则触发 'click' 事件。
 * @param {MouseEvent} event - 鼠标点击事件对象。
 */
const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<style scoped>
@reference "../../../style.css";
/* src/modules/core/components/ui/TooltipIconButton.vue */
.btn-base-icon-tooltip {
  @apply p-2.5 aspect-square flex items-center justify-center rounded-md
         focus:outline-none focus:ring-2 focus:ring-opacity-50
         transition-all duration-150 ease-in-out;
}
</style>