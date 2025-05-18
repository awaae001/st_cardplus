<template>
  <section class="form-section">
    <h3 v-if="title || $slots.title" class="form-section-title">
      <Icon v-if="icon" :icon="icon" :class="iconClassInternal" />
      <slot name="title">{{ title }}</slot>
    </h3>
    <div class="form-section-body">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

/**
 * @component FormSection
 * @description 一个用于表单的简单分段组件，带有可选的标题和图标。
 *
 * @prop {string} [title=''] - 区块的标题。
 * @prop {string} [icon=''] - 标题的 Iconify 图标标识符。
 * @prop {string} [iconClass='text-lg text-inherit'] - 应用于图标的 CSS 类。
 *
 * @slot default - 区块的主要内容。
 * @slot title - 自定义标题内容，会覆盖 `title` prop。
 */
interface Props {
  title?: string;
  icon?: string;
  iconClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  iconClass: 'text-lg text-inherit',
});

// 内部计算属性以确保图标总有 class
const iconClassInternal = computed(() => props.iconClass);

</script>

<style scoped>
@reference "../../../style.css"; /* 确保 @apply 可以工作 */

.form-section {
  @apply py-4;
}

.form-section:not(:last-child) {
  @apply border-b border-neutral-200 dark:border-neutral-700;
}

.form-section-title {
  @apply text-base font-medium text-neutral-600 dark:text-neutral-300 mb-3 flex items-center gap-2;
}

.form-section-body {
  /* 内容的特定布局（如 space-y-5）由父组件通过插槽内容自行定义 */
}
</style>