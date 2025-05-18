<template>
  <div :class="cardClasses">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * @component CardContainer
 * @description 一个通用的卡片容器组件，提供统一的背景、边框、阴影和悬停效果。
 *              此组件主要用于包裹内容块，赋予它们一致的卡片式外观。
 *              不包含内边距，内边距应由子组件或使用此组件的父组件通过插槽内容自行管理。
 *
 * @slot default - 卡片容器的主体内容。
 */

const cardClasses = computed(() => [
  'bg-white dark:bg-neutral-850',
  'rounded-xl shadow-lg dark:shadow-black/30',
  'border border-neutral-200 dark:border-neutral-750',
  'overflow-hidden', // 确保内部内容（如图片）不会溢出圆角
  'transition-all duration-300 ease-out', // 平滑的过渡效果
  'hover:shadow-xl dark:hover:shadow-black/50 hover:-translate-y-1', // 悬停效果
]);
</script>

<style scoped>
@reference "../../../style.css";
/* No specific styles needed here as Tailwind classes cover the appearance. */
</style>