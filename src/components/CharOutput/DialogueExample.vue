<template>
  <div class="content-panel-body space-y-4 md:space-y-5 h-full flex flex-col">
    <div class="content-panel-header -mx-4 md:-mx-5 -mt-4 md:-mt-5 mb-5">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon
          icon="ph:chats-teardrop-duotone"
          class="text-xl text-accent-500 dark:text-accent-400"
        />
        对话示例
      </h3>
    </div>
    <div class="flex-grow px-1 flex">
      <el-input
        type="textarea"
        v-model="localMesExample"
        :autosize="{ minRows: 5, maxRows: 12 }"
        placeholder="请输入对话示例 (例如角色可能会说的话，或与角色的对话片段)"
        class="flex-grow"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick } from "vue";
import { Icon } from "@iconify/vue";

interface DialogueExampleFormData {
  mes_example: string;
  data?: { mes_example?: string; [key: string]: any };
}
interface Props {
  form: DialogueExampleFormData;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:form"]);

const localMesExample = ref<string>("");
let internalUpdateFlag_Dial = false;

watch(
  () => props.form.mes_example,
  (newVal) => {
    const currentPropVal = newVal || "";
    if (currentPropVal !== localMesExample.value) {
      // console.log('DialogueExample: Prop updated. Updating local to:', currentPropVal);
      internalUpdateFlag_Dial = true;
      localMesExample.value = currentPropVal;
      nextTick(() => {
        internalUpdateFlag_Dial = false;
      });
    }
  },
  { immediate: true }
);

watch(localMesExample, (newVal) => {
  if (internalUpdateFlag_Dial) {
    // console.log('DialogueExample: Emit blocked for prop-driven update.');
    return;
  }
  if (newVal !== (props.form.mes_example || "")) {
    // console.log('DialogueExample: Local changed. Emitting:', newVal);
    emit("update:form", {
      mes_example: newVal,
      data: { ...(props.form.data || {}), mes_example: newVal },
    });
  }
});
</script>
