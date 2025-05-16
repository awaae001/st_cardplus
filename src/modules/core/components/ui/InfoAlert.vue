<template>
  <div
    :class="[
      'info-alert flex items-center gap-2 p-3 rounded-md border text-xs',
      alertTypeClass,
    ]"
    role="alert"
  >
    <Icon v-if="icon" :icon="icon" class="text-lg shrink-0" />
    <slot>
      <span>{{ message }}</span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, withDefaults } from 'vue';
import { Icon } from '@iconify/vue';

/**
 * @type AlertType
 * @description 定义了提示框的几种预设类型。
 */
type AlertType = 'info' | 'warning' | 'success' | 'danger';

/**
 * @component InfoAlert
 * @description 一个可定制的提示框组件，用于显示不同类型的消息。
 *
 * @prop {string} [message=''] - 提示框中显示的文本消息。如果提供了默认插槽内容，则此 prop 会被忽略。
 * @prop {string} [icon='ph:info-duotone'] - Iconify 图标的标识符。如果为空字符串，则不显示图标。
 * @prop {AlertType} [type='info'] - 提示框的类型，决定了其背景、边框和文本颜色。
 *
 * @slot default - 用于自定义提示框内部的内容，会覆盖 `message` prop。
 */
interface Props {
  /** 提示框中显示的文本消息。如果提供了默认插槽内容，则此 prop 会被忽略。 */
  message?: string;
  /** Iconify 图标的标识符。如果为空字符串，则不显示图标。 */
  icon?: string;
  /** 提示框的类型，决定了其背景、边框和文本颜色。 */
  type?: AlertType;
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  icon: 'ph:info-duotone', // Default icon
  type: 'info',
});

/**
 * @computed alertTypeClass
 * @description 根据 `props.type` 计算并返回对应的 Tailwind CSS 类名，用于设置提示框的样式。
 * @returns {string} 包含背景、边框和文本颜色的 CSS 类名。
 */
const alertTypeClass = computed(() => {
  switch (props.type) {
    case 'info':
      return 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300';
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300';
    case 'success':
      return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
    case 'danger':
      return 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300';
    default:
      return 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300';
  }
});
</script>

<style scoped>
/* src/modules/core/components/ui/InfoAlert.vue */
.info-alert {
  /* Basic styling is handled by Tailwind classes */
}
</style>