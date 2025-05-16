<template>
  <StandardActionButtons
    :safe-mode-level="props.safeModeLevel"
    entity-name="角色输出配置"
    confirm-import-text="请粘贴JSON格式的角色输出配置数据："
    @load="emit('loadData')"
    @save="emit('saveData')"
    @reset="emit('resetData')"
    @copy="emit('copyData')"
    @import="(data) => emit('importData', data)"
  />
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import type { SafeModeLevel } from "@core/store/appSettings.store";
import StandardActionButtons from "@core/components/ui/StandardActionButtons.vue";

const props = defineProps<{
  safeModeLevel: SafeModeLevel;
}>();

const emit = defineEmits<{
  (e: "saveData"): void;
  (e: "loadData"): void;
  (e: "resetData"): void;
  (e: "copyData"): void;
  (e: "importData", data: string): void;
}>();
</script>
