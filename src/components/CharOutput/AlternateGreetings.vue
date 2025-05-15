<template>
  <div class="content-panel-body space-y-4 md:space-y-5 h-full flex flex-col">
    <div class="content-panel-header -mx-4 md:-mx-5 -mt-4 md:-mt-5 mb-5">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon
          icon="ph:chats-bold"
          class="text-xl text-accent-500 dark:text-accent-400"
        />
        备用问候语
      </h3>
      <div class="flex gap-x-3 ml-auto">
        <button
          @click="handleAddGreeting"
          class="btn-primary-adv text-sm !py-1.5 !px-3 whitespace-nowrap"
          title="添加新的备用问候语"
        >
          <Icon
            icon="material-symbols:add-comment-outline-rounded"
            width="18"
            height="18"
            class="mr-1.5 -ml-0.5"
          />
          添加问候语
        </button>
      </div>
    </div>
    <div class="flex-grow px-1">
      <draggable
        v-if="localGreetings && localGreetings.length > 0"
        v-model="localGreetings"
        item-key="id"
        animation="200"
        ghost-class="greeting-ghost"
        chosen-class="greeting-chosen"
        handle=".greeting-drag-handle"
        class="space-y-3"
        @change="handleDraggableChange"
      >
        <template #item="{ element: greeting }">
          <div :key="greeting.id" class="greeting-item-card-outer-wrapper">
            <div
              class="greeting-item-card bg-white dark:bg-neutral-800 rounded-md shadow dark:shadow-black/10 border border-neutral-200 dark:border-neutral-700 flex items-start p-2.5 gap-x-2.5 transition-all duration-150 ease-in-out hover:shadow-md dark:hover:border-neutral-600"
            >
              <div class="flex flex-col items-center pt-1 flex-shrink-0">
                <button
                  title="按住拖拽排序"
                  class="greeting-drag-handle cursor-move text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1 mb-1.5"
                >
                  <Icon
                    icon="material-symbols:drag-indicator-rounded"
                    width="20"
                    height="20"
                  />
                </button>
                <button
                  @click="() => handleRemoveGreeting(greeting.id)"
                  class="btn-danger-adv !p-1.5 !rounded-full !text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  title="删除此问候语"
                  :disabled="appSettings.safeModeLevel === 'forbidden'"
                >
                  <Icon icon="ph:x-bold" width="12" height="12" />
                </button>
              </div>
              <div class="flex-grow min-w-0">
                <el-input
                  type="textarea"
                  v-model="greeting.text"
                  :autosize="{ minRows: 2, maxRows: 6 }"
                  placeholder="请输入备用问候语（支持换行）"
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </template>
      </draggable>
      <div
        v-else
        class="text-center py-10 border-2 border-dashed border-neutral-300/70 dark:border-neutral-700/70 rounded-lg bg-neutral-50 dark:bg-neutral-800/30"
      >
        <Icon
          icon="ph:chat-circle-dots-duotone"
          class="text-5xl text-neutral-400 dark:text-neutral-600 mx-auto mb-3"
        />
        <p class="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
          暂无备用问候语
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
          点击“添加问候语”开始吧！
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";
import { nanoid } from "nanoid";
import { ElInput } from "element-plus";
import { useAppSettingsStore } from "../../stores/appSettings";
import { performSafeAction } from "@/utils/safeAction";

interface GreetingItem {
  id: string;
  text: string;
}
interface AlternateGreetingsFormData {
  data: { alternate_greetings: string[]; [key: string]: any };
}
interface Props {
  form: AlternateGreetingsFormData;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:form"]);
const appSettings = useAppSettingsStore();

const localGreetings = ref<GreetingItem[]>([]);
let internalUpdateFlag_Greetings = false;

const stringArrayToGreetingItems = (arr: string[] = []): GreetingItem[] => {
  return Array.isArray(arr)
    ? arr.map((text) => ({ id: nanoid(), text: text || "" }))
    : [];
};
const greetingItemsToStringArray = (items: GreetingItem[]): string[] => {
  return Array.isArray(items) ? items.map((item) => item.text || "") : [];
};

watch(
  () => props.form.data.alternate_greetings,
  (newValArray) => {
    const propGreetingsTexts = Array.isArray(newValArray) ? newValArray : [];
    const localGreetingsTexts = greetingItemsToStringArray(
      localGreetings.value
    );

    if (
      JSON.stringify(propGreetingsTexts) !== JSON.stringify(localGreetingsTexts)
    ) {
      internalUpdateFlag_Greetings = true;
      localGreetings.value = stringArrayToGreetingItems(propGreetingsTexts);
      nextTick(() => {
        internalUpdateFlag_Greetings = false;
      });
    }
  },
  { deep: true, immediate: true }
);

const emitUpdate = () => {
  if (internalUpdateFlag_Greetings) {
    return;
  }
  const newStringArray = greetingItemsToStringArray(localGreetings.value);
  const currentPropStringArray = Array.isArray(
    props.form.data.alternate_greetings
  )
    ? props.form.data.alternate_greetings
    : [];

  if (
    JSON.stringify(newStringArray) !== JSON.stringify(currentPropStringArray)
  ) {
    emit("update:form", {
      data: {
        ...props.form.data,
        alternate_greetings: newStringArray,
      },
    });
  }
};

watch(localGreetings, emitUpdate, { deep: true });

const handleAddGreeting = () => {
  localGreetings.value.push({ id: nanoid(), text: "" });
};

const handleRemoveGreeting = async (idToRemove: string) => {
  const index = localGreetings.value.findIndex((g) => g.id === idToRemove);
  if (index === -1) return;
  // Truncate long greeting text for confirmation message if needed
  const greetingTextPreview =
    localGreetings.value[index].text.length > 20
      ? localGreetings.value[index].text.substring(0, 17) + "..."
      : localGreetings.value[index].text;
  const itemName =
    greetingTextPreview || `该问候语 (ID: ${idToRemove.substring(0, 4)})`;

  await performSafeAction(
    appSettings.safeModeLevel,
    "移除问候语",
    itemName,
    () => {
      const currentIndex = localGreetings.value.findIndex(
        (g) => g.id === idToRemove
      );
      if (currentIndex !== -1) {
        localGreetings.value.splice(currentIndex, 1);
      } else {
        // Should not happen if index was found initially, but good practice
        throw new Error("问候语未找到，可能已被移除。");
      }
    }
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("移除问候语操作未成功完成:", err);
  });
};

const handleDraggableChange = () => {
  emitUpdate();
};
</script>

<style scoped>
.greeting-ghost {
  opacity: 0.6;
  border-radius: var(--radius-md);
  background-color: var(--color-sky-100);
  outline: 2px dashed var(--color-sky-400);
  box-shadow: none;
}
:where(.dark, .dark *) .greeting-ghost {
  background-color: oklch(from var(--color-sky-800) l c h / 0.4);
}
.greeting-chosen .greeting-item-card {
  --chosen-ring-width: 2px;
  --chosen-ring-offset-width: 1px;
  --chosen-ring-color-light: var(--color-accent-500);
  --chosen-ring-offset-color-light: var(--color-white);
  --chosen-ring-color-dark: var(--color-accent-400);
  --chosen-ring-offset-color-dark: var(--color-neutral-850);
  box-shadow: 0 0 0 var(--chosen-ring-offset-width)
      var(--chosen-ring-offset-color-light),
    0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width))
      var(--chosen-ring-color-light),
    var(--shadow-lg);
  transform: scale(1.01);
  z-index: 10;
}
:where(.dark, .dark *) .greeting-chosen .greeting-item-card {
  box-shadow: 0 0 0 var(--chosen-ring-offset-width)
      var(--chosen-ring-offset-color-dark),
    0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width))
      var(--chosen-ring-color-dark),
    var(--shadow-lg);
}
.greeting-item-card :deep(.el-textarea__inner) {
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
