<template>
  <div class="content-panel-body space-y-5">
    <div class="content-panel-header -mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-6">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon
          icon="ph:users-three-duotone"
          class="text-xl text-accent-500 dark:text-accent-400"
        />
        人际关系
      </h3>
      <div class="flex gap-x-3 ml-auto">
        <button
          @click="props.addRelationship"
          class="btn-primary-adv text-sm !py-1.5 !px-3 whitespace-nowrap"
          title="添加新的人际关系"
        >
          <Icon
            icon="material-symbols:add-circle-outline-rounded"
            width="18"
            height="18"
            class="mr-1.5 -ml-0.5"
          />
          添加关系
        </button>
        <button
          @click="props.exportRelationships"
          title="导出所有人际关系 (JSON)"
          class="btn-secondary-adv text-sm !py-1.5 !px-3"
        >
          <Icon
            icon="material-symbols:ios-share-rounded"
            width="18"
            height="18"
          />
        </button>
      </div>
    </div>

    <draggable
      v-if="localRelationships && localRelationships.length > 0"
      v-model="localRelationships"
      item-key="id"
      animation="200"
      ghost-class="relationship-ghost"
      chosen-class="relationship-chosen"
      handle=".relationship-card-drag-handle"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5"
      @change="handleDraggableChange"
    >
      <template #item="{ element: relationship, index: relationshipIndex }">
        <div
          :key="relationship.id"
          class="relationship-item-card-outer-wrapper"
        >
          <div
            class="relationship-item-card bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-black/20 border border-neutral-200 dark:border-neutral-700 flex flex-col relative transition-all duration-150 ease-in-out hover:shadow-lg dark:hover:border-neutral-600 overflow-hidden"
          >
            <div
              class="relationship-card-drag-handle bg-neutral-100 dark:bg-neutral-700/50 px-3 py-1.5 cursor-move flex items-center justify-between text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700 text-xs"
            >
              <div
                class="flex items-center gap-1.5 flex-grow min-w-0"
                title="按住拖拽排序"
              >
                <Icon
                  icon="material-symbols:drag-indicator-rounded"
                  width="18"
                  height="18"
                />
                <el-input
                  v-model="relationship.name"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  placeholder="角色名称"
                  size="small"
                  class="relationship-name-input flex-grow min-w-0"
                ></el-input>
              </div>
              <button
                @click="() => props.removeRelationship(relationship.id)"
                class="btn-danger-adv !p-1 !aspect-square shrink-0 !rounded-full !text-xs ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="删除此关系"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
              >
                <Icon icon="ph:x-bold" width="12" height="12" />
              </button>
            </div>

            <div class="p-3 flex flex-col gap-y-3 flex-grow">
              <el-input
                v-model="relationship.description"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 5 }"
                placeholder="关系描述"
                size="small"
              ></el-input>
              <el-input
                v-model="relationship.features"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 4 }"
                placeholder="对方人物特征"
                size="small"
              ></el-input>

              <div class="space-y-2">
                <label class="form-label-adv text-xs block mb-1"
                  >对话示例</label
                >
                <div
                  v-for="(
                    _dialogue, dialogueIndex
                  ) in relationship.dialogueExamples"
                  :key="`dialogue-${relationship.id}-${dialogueIndex}`"
                  class="flex items-start gap-x-2"
                >
                  <el-input
                    v-model="relationship.dialogueExamples[dialogueIndex]"
                    type="textarea"
                    :autosize="{ minRows: 1, maxRows: 4 }"
                    :placeholder="`对话内容 ${dialogueIndex + 1}`"
                    size="small"
                    class="flex-grow"
                  ></el-input>
                  <button
                    @click="
                      removeDialogueExample(relationshipIndex, dialogueIndex)
                    "
                    class="btn-danger-adv !p-1.5 !aspect-square shrink-0 !text-xs mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="移除此示例"
                    :disabled="
                      ['forbidden', 'double'].includes(
                        appSettings.safeModeLevel
                      )
                    "
                  >
                    <Icon
                      icon="ph:trash-simple-duotone"
                      width="14"
                      height="14"
                    />
                  </button>
                </div>
                <button
                  @click="addDialogueExample(relationshipIndex)"
                  class="btn-secondary-adv w-full !py-1 !px-2 text-xs"
                >
                  <Icon icon="ph:plus-circle-duotone" class="mr-1 text-sm" />
                  添加对话示例
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <div
      v-else
      class="mt-6 text-center py-10 border-2 border-dashed border-neutral-300/70 dark:border-neutral-700/70 rounded-lg bg-neutral-50 dark:bg-neutral-800/30"
    >
      <Icon
        icon="ph:users-four-duotone"
        class="text-5xl text-neutral-400 dark:text-neutral-600 mx-auto mb-3"
      />
      <p class="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
        暂无人际关系
      </p>
      <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
        点击“添加关系”来描绘角色的社交网络吧！
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";
import { ElInput } from "element-plus"; // ElPopconfirm is no longer needed here
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";
import { useAppSettingsStore } from "@core/store/appSettings.store";
import { performSafeAction } from "@core/utils/safeAction.utils";
import type {
  IEditorCharacterCard,
  IEditorRelationship,
} from "@character/types/character.types";

interface Props {
  form: Pick<IEditorCharacterCard, "relationships">;
  addRelationship: () => void;
  removeRelationship: (relationshipId: string) => void;
  exportRelationships: () => Promise<void>;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:form"]);
const localRelationships = ref<IEditorRelationship[]>([]);
const appSettings = useAppSettingsStore();

watch(
  () => props.form.relationships,
  (newRelationshipsFromProp) => {
    if (
      JSON.stringify(newRelationshipsFromProp) !==
      JSON.stringify(localRelationships.value)
    ) {
      try {
        localRelationships.value = JSON.parse(
          JSON.stringify(newRelationshipsFromProp || [])
        );
      } catch (e) {
        console.error(
          "[Relationships] Error cloning relationships from props:",
          e
        );
        localRelationships.value = [];
      }
    }
  },
  { deep: true, immediate: true }
);

watch(
  localRelationships,
  (newLocalState) => {
    if (
      JSON.stringify(newLocalState) !==
      JSON.stringify(props.form.relationships || [])
    ) {
      emit("update:form", { relationships: newLocalState });
    }
  },
  { deep: true }
);

const addDialogueExample = (relationshipIndex: number) => {
  const relationship = localRelationships.value[relationshipIndex];
  if (relationship) {
    if (!Array.isArray(relationship.dialogueExamples)) {
      relationship.dialogueExamples = [];
    }
    relationship.dialogueExamples.push("");
  }
};

const removeDialogueExample = async (
  relationshipIndex: number,
  exampleIndex: number
) => {
  const relationship = localRelationships.value[relationshipIndex];
  if (
    !relationship ||
    !relationship.dialogueExamples ||
    exampleIndex < 0 ||
    exampleIndex >= relationship.dialogueExamples.length
  )
    return;

  const exampleText =
    relationship.dialogueExamples[exampleIndex].substring(0, 20) ||
    `对话示例 ${exampleIndex + 1}`;

  await performSafeAction(
    appSettings.safeModeLevel,
    "移除对话示例",
    exampleText,
    () => {
      const currentRelationship = localRelationships.value[relationshipIndex]; // Re-fetch for safety in async context
      if (
        currentRelationship?.dialogueExamples &&
        exampleIndex < currentRelationship.dialogueExamples.length
      ) {
        currentRelationship.dialogueExamples.splice(exampleIndex, 1);
      } else {
        // This case should ideally not be reached if initial checks are correct
        console.warn(
          "Attempted to remove a dialogue example that no longer exists or index is out of bounds."
        );
        throw new Error("对话示例未找到或索引无效。");
      }
    }
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("移除对话示例操作未成功完成:", err);
  });
};

const handleDraggableChange = (event: {
  moved?: { oldIndex: number; newIndex: number };
}) => {
  if (event.moved) {
    console.log(
      `关系 "${localRelationships.value[event.moved.newIndex].name}" 移动: ${
        event.moved.oldIndex
      } → ${event.moved.newIndex}`
    );
  }
};
</script>

<style scoped>
.relationship-ghost {
  opacity: 0.6;
  border-radius: var(--radius-lg);
  background-color: var(--color-sky-100);
  outline: 2px dashed var(--color-sky-400);
  box-shadow: none;
}

:where(.dark, .dark *) .relationship-ghost {
  background-color: oklch(from var(--color-sky-800) l c h / 0.4);
}

.relationship-chosen .relationship-item-card {
  --chosen-ring-width: 2px;
  --chosen-ring-offset-width: 2px;
  --chosen-ring-color-light: var(--color-accent-500);
  --chosen-ring-offset-color-light: var(--color-white);
  --chosen-ring-color-dark: var(--color-accent-400);
  --chosen-ring-offset-color-dark: var(--color-neutral-850);
  box-shadow: 0 0 0 var(--chosen-ring-offset-width)
      var(--chosen-ring-offset-color-light),
    0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width))
      var(--chosen-ring-color-light),
    var(--shadow-xl);
}

:where(.dark, .dark *) .relationship-chosen .relationship-item-card {
  box-shadow: 0 0 0 var(--chosen-ring-offset-width)
      var(--chosen-ring-offset-color-dark),
    0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width))
      var(--chosen-ring-color-dark),
    var(--shadow-xl);
}

.relationship-chosen {
  transform: scale(1.02);
  z-index: 10;
}

.relationship-card-drag-handle
  :deep(.relationship-name-input.el-textarea .el-textarea__inner) {
  background-color: transparent;
  border: none;
  box-shadow: none;
  padding: 2px 4px;
  font-weight: 500;
  line-height: 1.4;
  font-size: 0.875rem;
  color: var(--color-neutral-700);
  resize: none;
}

:where(.dark, .dark *)
  .relationship-card-drag-handle
  :deep(.relationship-name-input.el-textarea .el-textarea__inner) {
  color: var(--color-neutral-300);
}

.relationship-card-drag-handle
  :deep(.relationship-name-input.el-textarea.is-focus .el-textarea__inner) {
  background-color: var(--color-white);
}

:where(.dark, .dark *)
  .relationship-card-drag-handle
  :deep(.relationship-name-input.el-textarea.is-focus .el-textarea__inner) {
  background-color: var(--color-neutral-700);
}

.relationship-item-card :deep(.el-textarea__inner) {
  font-size: 0.8125rem;
  line-height: 1.5;
  padding-top: 4px;
  padding-bottom: 4px;
  resize: none;
  border-radius: var(--el-input-border-radius, var(--radius-base));
}
</style>
