<template>
  <div class="content-panel-wrapper">
    <div v-if="title || $slots.header" class="content-panel-header">
      <h3 class="content-panel-title">
        <Icon v-if="icon" :icon="icon" :class="['content-panel-icon', iconClass]" />
        <slot name="title">{{ title }}</slot>
      </h3>
      <div v-if="$slots.actions" class="content-panel-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="content-panel-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="content-panel-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { Icon } from '@iconify/vue';

/**
 * @component PanelSection
 * @description 一个通用的面板分段组件，提供头部、主体和可选的尾部插槽，以及标题和图标配置。
 *
 * @prop {string} [title=''] - 面板的标题文本。如果提供了 `title` 插槽，则此 prop 会被忽略。
 * @prop {string} [icon=''] - 显示在标题旁边的 Iconify 图标标识符。
 * @prop {string} [iconClass='text-xl text-accent-500 dark:text-accent-400'] - 应用于图标的 CSS 类。
 *
 * @slot default - 面板主体内容。
 * @slot title - 自定义标题内容，会覆盖 `title` prop。
 * @slot actions - 放置在面板头部右侧的操作区内容 (例如按钮组)。
 * @slot footer - 面板尾部内容。
 */
interface Props {
  /** 面板的标题文本。如果提供了 `title` 插槽，则此 prop 会被忽略。 */
  title?: string;
  /** 显示在标题旁边的 Iconify 图标标识符。 */
  icon?: string;
  /** 应用于图标的 CSS 类。 */
  iconClass?: string;
}

withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  iconClass: 'text-xl text-accent-500 dark:text-accent-400', // Default icon class
});
</script>

<style scoped>
@reference "../../../style.css";
/* src/modules/core/components/ui/PanelSection.vue */
.content-panel-wrapper {
  @apply bg-white dark:bg-neutral-850 rounded-xl shadow-lg dark:shadow-black/30 border border-neutral-200 dark:border-neutral-750 overflow-hidden transition-all duration-300 ease-out hover:shadow-xl dark:hover:shadow-black/50 hover:-translate-y-1 p-5 md:p-6;
}

.content-panel-header {
  @apply flex justify-between items-center pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-700;
  /* Adjusted margins from BasicInfo.vue, assuming panel padding handles outer spacing */
}

.content-panel-title {
  @apply text-lg md:text-xl font-semibold text-neutral-700 dark:text-neutral-100 flex items-center gap-2;
}

.content-panel-icon {
  /* Default class is applied via props, specific color/size can be overridden */
}

.content-panel-actions {
  /* Placeholder for action buttons in the header */
}

.content-panel-body {
  @apply space-y-5; /* Matches the space-y-5 from BasicInfo's outer div */
}

.content-panel-footer {
  @apply pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700;
}
</style>