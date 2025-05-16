<template>
  <div
    class="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 print:hidden"
  >
    <div class="flex items-center gap-2 md:gap-3">
      <TooltipIconButton
        v-if="props.showLoadButton"
        :tooltip-content="`加载${props.entityName} (Ctrl+O)`"
        icon="ph:folder-open-duotone"
        :label-text="`加载${props.entityName}`"
        button-class="btn-success-adv !p-2.5 aspect-square"
        icon-class="text-lg group-hover:scale-110 transition-transform"
        :disabled="props.safeModeLevel === 'forbidden'"
        @click="emit('load')"
      />
      <TooltipIconButton
        vif="props.showSaveButton"
        :tooltip-content="`保存${props.entityName} (Ctrl+S)`"
        icon="ph:floppy-disk-duotone"
        :label-text="`保存${props.entityName}`"
        button-class="btn-primary-adv !p-2.5 aspect-square"
        icon-class="text-lg group-hover:scale-110 transition-transform"
        @click="emit('save')"
      />
      <TooltipIconButton
        vif="props.showResetButton"
        :tooltip-content="`重置${props.entityName}`"
        icon="ph:arrow-counter-clockwise-duotone"
        :label-text="`重置${props.entityName}`"
        button-class="btn-danger-adv !p-2.5 aspect-square"
        icon-class="text-lg group-hover:rotate-[30deg] transition-transform"
        :disabled="props.safeModeLevel === 'forbidden'"
        @click="emit('reset')"
      />
    </div>

    <div class="flex items-center gap-2 md:gap-3">
      <TooltipIconButton
        vif="props.showCopyButton"
        :tooltip-content="`复制${props.entityName}到剪贴板 (Ctrl+C)`"
        icon="ph:copy-simple-duotone"
        :label-text="`复制${props.entityName}到剪贴板`"
        button-class="btn-secondary-adv !p-2.5 aspect-square"
        icon-class="text-lg group-hover:scale-110 transition-transform"
        @click="emit('copy')"
      />
      <TooltipIconButton
        vif="props.showImportButton"
        :tooltip-content="`从剪贴板粘贴${props.entityName} (Ctrl+V)`"
        icon="ph:clipboard-text-duotone"
        :label-text="`从剪贴板粘贴${props.entityName}`"
        button-class="btn-warning-adv !p-2.5 aspect-square"
        icon-class="text-lg group-hover:scale-110 transition-transform"
        :disabled="props.safeModeLevel === 'forbidden'"
        @click="showImportDialog"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, withDefaults } from "vue";
import { ElMessageBox } from "element-plus";
import type { SafeModeLevel } from "@core/store/appSettings.store";
import TooltipIconButton from "@core/components/ui/TooltipIconButton.vue";

interface Props {
  safeModeLevel: SafeModeLevel;
  entityName: string;
  confirmImportText?: string;
  showLoadButton?: boolean;
  showSaveButton?: boolean;
  showResetButton?: boolean;
  showCopyButton?: boolean;
  showImportButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  confirmImportText: "",
  showLoadButton: true,
  showSaveButton: true,
  showResetButton: true,
  showCopyButton: true,
  showImportButton: true,
});

const emit = defineEmits<{
  (e: "save"): void;
  (e: "load"): void;
  (e: "reset"): void;
  (e: "copy"): void;
  (e: "import", data: string): void;
}>();

const showImportDialog = () => {
  if (props.safeModeLevel === "forbidden") {
    ElMessageBox.alert("当前处于禁止模式，无法从剪贴板导入。", "操作禁止", {
      confirmButtonText: "知道了",
      type: "warning",
      customClass: "app-dialog",
    });
    return;
  }

  const promptMessage =
    props.confirmImportText ||
    `请粘贴JSON格式的${props.entityName}数据到下方文本框：`;

  ElMessageBox.prompt(
    promptMessage,
    `从剪贴板导入${props.entityName}`,
    {
      confirmButtonText: "确认导入",
      cancelButtonText: "取消",
      inputType: "textarea",
      inputPlaceholder: "在此处粘贴JSON数据...",
      customClass: "app-dialog break-all",
      inputValidator: (value) => {
        if (!value || value.trim() === "") return "输入内容不能为空。";
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          return "数据格式无效，请输入正确的JSON。";
        }
      },
    }
  )
    .then(({ value }) => {
      emit("import", value);
    })
    .catch(() => {
      // 用户取消或关闭了对话框
    });
};
</script>