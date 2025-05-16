<template>
  <el-form-item :class="['styled-form-item', { 'is-required-custom': required && showRequiredAsterisk }]" :prop="prop">
    <template #label>
      <label v-if="label" :for="labelFor" class="form-label-adv">
        <slot name="label">
          {{ label }}
          <span
            v-if="required && showRequiredAsterisk"
            class="required-marker"
            aria-hidden="true"
            >*</span
          >
        </slot>
      </label>
    </template>
    <slot></slot>
    <div v-if="helpText || $slots.help" class="form-help-text">
      <slot name="help">{{ helpText }}</slot>
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
import { defineProps, withDefaults } from 'vue';
import { ElFormItem } from 'element-plus';

/**
 * @component StyledFormItem
 * @description 一个封装了 Element Plus ElFormItem 的自定义样式表单项组件。
 *              提供了统一的标签、帮助文本样式，并可自定义必填星号显示。
 *
 * @prop {string} [label=''] - 表单项的标签文本。如果提供了 `label` 插槽，此 prop 会被忽略。
 * @prop {string} [prop] - `el-form-item` 的 `prop` 属性，用于表单验证。
 * @prop {boolean} [required=false] - 当前表单项是否为必填。主要用于控制星号的显示。
 * @prop {string} [helpText=''] - 显示在表单控件下方的帮助性文本。如果提供了 `help` 插槽，此 prop 会被忽略。
 * @prop {string} [labelFor] - 标签 `for` 属性所关联的输入元素的 ID。
 * @prop {boolean} [showRequiredAsterisk=true] - 当 `required` 为 `true` 时，是否显示必填星号。
 *
 * @slot default - 表单项的主体内容，通常是输入控件 (例如 `el-input`, `el-select` 等)。
 * @slot label - 自定义标签内容，会覆盖 `label` prop。
 * @slot help - 自定义帮助文本内容，会覆盖 `helpText` prop。
 */
interface Props {
  /** 表单项的标签文本。如果提供了 `label` 插槽，此 prop 会被忽略。 */
  label?: string;
  /** `el-form-item` 的 `prop` 属性，用于表单验证。 */
  prop?: string;
  /** 当前表单项是否为必填。主要用于控制星号的显示。 */
  required?: boolean;
  /** 显示在表单控件下方的帮助性文本。如果提供了 `help` 插槽，此 prop 会被忽略。 */
  helpText?: string;
  /** 标签 `for` 属性所关联的输入元素的 ID。 */
  labelFor?: string;
  /** 当 `required` 为 `true` 时，是否显示必填星号。 */
  showRequiredAsterisk?: boolean;
}

withDefaults(defineProps<Props>(), {
  label: '',
  prop: undefined,
  required: false,
  helpText: '',
  labelFor: undefined,
  showRequiredAsterisk: true, // By default, show asterisk if required is true
});
</script>

<style scoped>
@reference "../../../../style.css";
/* src/modules/core/components/forms/StyledFormItem.vue */
.styled-form-item {
  @apply mb-0; /* Default to no bottom margin, can be overridden by parent grid/flex gap */
}

.form-label-adv {
  @apply text-sm font-medium text-neutral-700 dark:text-neutral-300 pb-1 block;
  /* Matches .form-label-adv from BasicInfo.vue, but made more generic */
}

.required-marker {
  @apply text-red-500 dark:text-red-400 ml-1;
}

.form-help-text {
  @apply text-xs text-neutral-500 dark:text-neutral-400 mt-1.5;
  /* Matches .form-help-text from BasicInfo.vue */
}

/* If el-form-item already adds its own asterisk for required props,
   we might not need .is-required-custom and the span.required-marker.
   However, this custom asterisk gives us more control over styling if needed.
   If ElFormItem handles required marking visually when `prop` is set and rules define it,
   then the `required` prop here is mainly for the visual asterisk via `showRequiredAsterisk`.
*/
</style>