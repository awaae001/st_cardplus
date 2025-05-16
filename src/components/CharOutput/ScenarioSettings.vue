<template>
  <div class="content-panel-body space-y-4 md:space-y-5 h-full flex flex-col">
    <div class="content-panel-header -mx-4 md:-mx-5 -mt-4 md:-mt-5 mb-5">
      <h3 class="content-panel-title flex items-center gap-2">
        <!-- MODIFIED: Added Icon -->
        <Icon
          icon="ph:map-trifold-duotone"
          class="text-xl text-accent-500 dark:text-accent-400"
        />
        情景设定
      </h3>
      <!-- 如果有对此模块的操作按钮，可以放在这里 -->
    </div>

    <div class="flex-grow px-1 flex">
      <el-input
        type="textarea"
        v-model="localScenario"
        :autosize="{ minRows: 5, maxRows: 12 }"
        placeholder="描述角色所处的环境、背景故事或特定情境（可选）"
        class="flex-grow"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick } from "vue";
import { Icon } from "@iconify/vue"; // Icon 已经导入
import type { ICharacterOutputSettings } from "@character/types/character.types";

interface ScenarioSettingsFormData {
  /** Corresponds to ICharacterOutputSettings['scenario'] */
  scenario: string; // Kept as string, component logic handles undefined/null to ""
  data?: { scenario?: string; [key: string]: any };
}
interface Props {
  form: ScenarioSettingsFormData;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:form"]);

const localScenario = ref<string>("");
let internalUpdateFlag_Scen = false;

watch(
  () => props.form.scenario,
  (newVal) => {
    const currentPropVal = newVal || "";
    if (currentPropVal !== localScenario.value) {
      internalUpdateFlag_Scen = true;
      localScenario.value = currentPropVal;
      nextTick(() => {
        internalUpdateFlag_Scen = false;
      });
    }
  },
  { immediate: true }
);

watch(localScenario, (newVal) => {
  if (internalUpdateFlag_Scen) {
    return;
  }
  if (newVal !== (props.form.scenario || "")) {
    emit("update:form", {
      scenario: newVal,
      data: { ...(props.form.data || {}), scenario: newVal },
    });
  }
});
</script>

<style scoped>
/* 通常不需要独立的 scoped CSS */
</style>
