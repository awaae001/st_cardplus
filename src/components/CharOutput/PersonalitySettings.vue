<template>
  <div class="content-panel-body space-y-4 md:space-y-5 h-full flex flex-col">
    <div class="content-panel-header -mx-4 md:-mx-5 -mt-4 md:-mt-5 mb-5">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon
          icon="ph:smiley-sticker-duotone"
          class="text-xl text-accent-500 dark:text-accent-400"
        />
        个性设定
      </h3>
    </div>
    <div class="flex-grow px-1 flex">
      <el-input
        type="textarea"
        v-model="localPersonality"
        :autosize="{ minRows: 5, maxRows: 12 }"
        placeholder="描述角色的性格特点、价值观、行为模式等"
        class="flex-grow"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import type { IPersonalityTraits } from "@character/types/character.types";

interface PersonalitySettingsFormData {
  /** Corresponds to IPersonalityTraits['summary'] */
  personality: string; // Kept as string, component logic handles undefined/null to ""
  data?: { personality?: string; [key: string]: any };
}
interface Props {
  form: PersonalitySettingsFormData;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:form"]);

const localPersonality = ref<string>("");
let internalUpdateFlag_Pers = false;

watch(
  () => props.form.personality,
  (newVal) => {
    const currentPropVal = newVal || "";
    if (currentPropVal !== localPersonality.value) {
      // console.log('PersonalitySettings: Prop updated. Updating local to:', currentPropVal);
      internalUpdateFlag_Pers = true;
      localPersonality.value = currentPropVal;
      nextTick(() => {
        internalUpdateFlag_Pers = false;
      });
    }
  },
  { immediate: true }
);

watch(localPersonality, (newVal) => {
  if (internalUpdateFlag_Pers) {
    // console.log('PersonalitySettings: Emit blocked for prop-driven update.');
    return;
  }
  if (newVal !== (props.form.personality || "")) {
    // console.log('PersonalitySettings: Local changed. Emitting:', newVal);
    emit("update:form", {
      personality: newVal,
      data: { ...(props.form.data || {}), personality: newVal },
    });
  }
});
</script>
