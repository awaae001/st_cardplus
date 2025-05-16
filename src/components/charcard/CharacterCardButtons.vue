<template>
  <StandardActionButtons
    :safe-mode-level="props.safeModeLevel"
    entity-name="角色卡"
    confirm-import-text="请粘贴JSON格式的角色卡数据到下方文本框："
    @load="emit('loadCharacterCard')"
    @save="emit('saveCharacterCard')"
    @reset="emit('resetForm')"
    @copy="emit('copyToClipboard')"
    @import="(data) => emit('importFromClipboard', data)"
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
  (e: "saveCharacterCard"): void;
  (e: "loadCharacterCard"): void;
  (e: "resetForm"): void;
  (e: "copyToClipboard"): void;
  (e: "importFromClipboard", data: string): void;
}>();
</script>
