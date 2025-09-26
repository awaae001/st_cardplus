<template>
  <div v-if="scripts.length > 1" class="script-selector">
    <el-select
      :model-value="modelValue"
      placeholder="请选择要加载的规则"
      @change="$emit('update:modelValue', $event)"
      style="width: 100%;"
    >
      <el-option
        v-for="script in scripts"
        :key="script.id"
        :label="script.scriptName"
        :value="script.id"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import type { SillyTavernRegexScript } from '@/composables/regex/types';

defineProps<{
  scripts: SillyTavernRegexScript[];
  modelValue: string | null;
}>();

defineEmits(['update:modelValue']);
</script>

<style scoped>
.script-selector {
  margin-bottom: 20px;
}
</style>