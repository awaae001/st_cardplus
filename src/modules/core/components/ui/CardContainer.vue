<template>
  <div :class="cardClassesInternal">
    <h3 v-if="title || $slots.title" :class="titleClassesInternal">
      <Icon v-if="icon" :icon="icon" :class="iconClassesInternal" />
      <slot name="title">{{ title }}</slot>
    </h3>
    <div :class="bodyClassesInternal">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

/**
 * @component CardContainer
 * @description 一个通用的卡片容器组件，提供统一的背景、边框、阴影和悬停效果，并支持可选的标题和图标。
 *              内边距已包含在此组件内。
 *
 * @prop {string} [title=''] - 卡片容器的标题。如果提供了 `title` 插槽，则此 prop 会被忽略。
 * @prop {string} [icon=''] - 显示在标题旁边的 Iconify 图标标识符。
 * @prop {string | Record<string, boolean> | Array<string | Record<string, boolean>>} [cardClass=''] - 应用于卡片根元素的额外CSS类。
 * @prop {string | Record<string, boolean> | Array<string | Record<string, boolean>>} [titleClass=''] - 应用于标题元素的额外CSS类。
 * @prop {string | Record<string, boolean> | Array<string | Record<string, boolean>>} [iconClass='text-lg'] - 应用于图标的CSS类。
 * @prop {string | Record<string, boolean> | Array<string | Record<string, boolean>>} [bodyClass=''] - 应用于卡片内容主体容器的额外CSS类。
 * @prop {boolean} [noTitlePadding=false] - 如果为 true，标题区域将不应用默认的下边距和下边框。
 * @prop {boolean} [noBodyPadding=false] - 如果为 true，内容主体区域将不应用默认的内边距。 (此属性当前未实现，默认主体无额外padding)
 *
 * @slot default - 卡片容器的主体内容。
 * @slot title - 自定义标题内容，会覆盖 `title` prop。
 */

interface Props {
  title?: string;
  icon?: string;
  cardClass?: string | Record<string, boolean> | Array<string | Record<string, boolean>>;
  titleClass?: string | Record<string, boolean> | Array<string | Record<string, boolean>>;
  iconClass?: string | Record<string, boolean> | Array<string | Record<string, boolean>>;
  bodyClass?: string | Record<string, boolean> | Array<string | Record<string, boolean>>;
  noTitlePadding?: boolean;
  // noBodyPadding?: boolean; // Future use
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  cardClass: '',
  titleClass: '',
  iconClass: 'text-lg', // 默认图标大小，颜色继承
  bodyClass: '',
  noTitlePadding: false,
  // noBodyPadding: false,
});

const cardClassesInternal = computed(() => [
  'bg-white dark:bg-neutral-850',
  'rounded-xl shadow-lg dark:shadow-black/30',
  'border border-neutral-200 dark:border-neutral-750',
  'overflow-hidden',
  'transition-all duration-300 ease-out',
  'hover:shadow-xl dark:hover:shadow-black/50 hover:-translate-y-1',
  'p-5', // Equivalent to 1.25rem padding
  props.cardClass
]);

const titleClassesInternal = computed(() => [
  'text-[0.9rem] font-semibold text-neutral-700 dark:text-neutral-300',
  'flex items-center gap-2', // For icon and title alignment
  {
    'mb-5 pb-2 border-b border-neutral-200 dark:border-neutral-600': !props.noTitlePadding,
  },
  props.titleClass,
]);

const iconClassesInternal = computed(() => [
  props.iconClass, // User-defined classes take precedence or add to defaults
]);

const bodyClassesInternal = computed(() => [
  props.bodyClass
]);

</script>

<style scoped>
@reference "../../../style.css";

/* Base styles are applied via Tailwind classes in computed properties */
.dark .form-section-title { /* Kept for direct reference if needed, but Tailwind handles dark mode for text and border */
  color: var(--color-neutral-300);
  border-color: var(--color-neutral-600);
}
</style>