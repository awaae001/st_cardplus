<template>
  <div
    class="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 print:hidden"
  >
    <div class="flex items-center gap-2 md:gap-3">
      <el-tooltip
        content="加载角色输出配置"
        placement="bottom"
        :show-arrow="false"
        :offset="8"
        :hide-after="0"
      >
        <button
          @click="emit('loadData')"
          class="btn-success-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="加载角色输出配置"
          :disabled="props.safeModeLevel === 'forbidden'"
        >
          <Icon
            icon="ph:folder-open-duotone"
            class="text-lg group-hover:scale-110 transition-transform"
          />
        </button>
      </el-tooltip>
      <el-tooltip
        content="保存角色输出配置"
        placement="bottom"
        :show-arrow="false"
        :offset="8"
        :hide-after="0"
      >
        <button
          @click="emit('saveData')"
          class="btn-primary-adv !p-2.5 aspect-square group"
          aria-label="保存角色输出配置"
        >
          <Icon
            icon="ph:floppy-disk-duotone"
            class="text-lg group-hover:scale-110 transition-transform"
          />
        </button>
      </el-tooltip>
      <el-tooltip
        content="重置所有输出设置"
        placement="bottom"
        :show-arrow="false"
        :offset="8"
        :hide-after="0"
      >
        <button
          @click="emit('resetData')"
          class="btn-danger-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="重置所有输出设置"
          :disabled="props.safeModeLevel === 'forbidden'"
        >
          <Icon
            icon="ph:arrow-counter-clockwise-duotone"
            class="text-lg group-hover:rotate-[30deg] transition-transform"
          />
        </button>
      </el-tooltip>
    </div>

    <div class="flex items-center gap-2 md:gap-3">
      <el-tooltip
        content="复制配置到剪贴板"
        placement="bottom"
        :show-arrow="false"
        :offset="8"
        :hide-after="0"
      >
        <button
          @click="emit('copyData')"
          class="btn-secondary-adv !p-2.5 aspect-square group"
          aria-label="复制配置到剪贴板"
        >
          <Icon
            icon="ph:copy-simple-duotone"
            class="text-lg group-hover:scale-110 transition-transform"
          />
        </button>
      </el-tooltip>
      <el-tooltip
        content="从剪贴板导入配置"
        placement="bottom"
        :show-arrow="false"
        :offset="8"
        :hide-after="0"
      >
        <button
          @click="showImportDialog"
          class="btn-warning-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="从剪贴板导入配置"
          :disabled="props.safeModeLevel === 'forbidden'"
        >
          <Icon
            icon="ph:clipboard-text-duotone"
            class="text-lg group-hover:scale-110 transition-transform"
          />
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import { Icon } from "@iconify/vue";
import { ElMessageBox, ElTooltip } from "element-plus";
import type { SafeModeLevel } from "../../stores/appSettings"; // 修正路径

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

const showImportDialog = () => {
  if (props.safeModeLevel === "forbidden") {
    ElMessageBox.alert("当前处于禁止模式，无法从剪贴板导入。", "操作禁止", {
      confirmButtonText: "知道了",
      type: "warning",
      customClass: "app-dialog",
    });
    return;
  }

  ElMessageBox.prompt(
    "请粘贴JSON格式的角色输出配置数据：",
    "从剪贴板导入配置",
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
      emit("importData", value);
    })
    .catch(() => {});
};
</script>
