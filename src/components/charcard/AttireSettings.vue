<template>
  <div class="content-panel-body space-y-5">
    <div class="content-panel-header -mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-6">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon
          icon="ph:person-simple-run-duotone"
          class="text-xl text-accent-500 dark:text-accent-400"
        />
        服装设定
      </h3>
      <div class="flex gap-x-3 ml-auto">
        <button
          @click="props.addAttire"
          class="btn-primary-adv text-sm !py-1.5 !px-3 whitespace-nowrap"
          title="添加新的服装套装"
        >
          <Icon
            icon="material-symbols:add-circle-outline-rounded"
            width="18"
            height="18"
            class="mr-1.5 -ml-0.5"
          />
          添加套装
        </button>
        <button
          @click="props.exportAttires"
          title="导出所有服装配置 (JSON)"
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
      v-if="
        localAttiresReactive &&
        Array.isArray(localAttiresReactive) &&
        localAttiresReactive.length > 0
      "
      v-model="localAttiresReactive"
      item-key="id"
      animation="200"
      ghost-class="attire-ghost"
      chosen-class="attire-chosen"
      handle=".attire-card-drag-handle"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5"
      @change="handleDraggableChange"
    >
      <template #item="{ element: attire }">
        <div :key="attire.id" class="attire-item-card-outer-wrapper">
          <div
            class="attire-item-card bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-black/20 border border-neutral-200 dark:border-neutral-700 flex flex-col relative transition-all duration-150 ease-in-out hover:shadow-lg dark:hover:border-neutral-600 overflow-hidden"
          >
            <div
              class="attire-card-drag-handle bg-neutral-100 dark:bg-neutral-700/50 px-3 py-1.5 cursor-move flex items-center justify-between text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700 text-xs"
            >
              <div
                class="flex items-center gap-1.5 flex-grow min-w-0"
                title="按住拖拽排序"
              >
                <Icon
                  icon="material-symbols:drag-indicator-rounded"
                  width="18"
                  height="18"
                  class="flex-shrink-0"
                />
                <el-input
                  v-model="attire.name"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  placeholder="套装名称"
                  size="small"
                  class="attire-name-input-in-handle flex-grow min-w-0"
                  @input="
                    updateFieldHeight(
                      attire,
                      'name',
                      $event.target as HTMLTextAreaElement
                    )
                  "
                ></el-input>
              </div>
              <button
                @click="() => props.removeAttire(attire.id)"
                class="btn-danger-adv !p-1 !aspect-square shrink-0 !rounded-full !text-xs ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="删除此套装"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
              >
                <Icon icon="ph:x-bold" width="12" height="12" />
              </button>
            </div>

            <div class="p-3 flex flex-col gap-y-3 flex-grow">
              <el-input
                v-model="attire.description"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 5 }"
                placeholder="套装描述 (可选)"
                size="small"
                class="expanding-textarea"
                @input="
                  updateFieldHeight(
                    attire,
                    'description',
                    $event.target as HTMLTextAreaElement
                  )
                "
              ></el-input>

              <div :class="getFieldGroupLayoutClass(attire)">
                <el-input
                  v-model="attire.tops"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 5 }"
                  placeholder="上衣"
                  size="small"
                  class="expanding-textarea"
                  @input="
                    updateFieldHeight(
                      attire,
                      'tops',
                      $event.target as HTMLTextAreaElement,
                      true
                    )
                  "
                ></el-input>
                <el-input
                  v-model="attire.bottoms"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 5 }"
                  placeholder="下装"
                  size="small"
                  class="expanding-textarea"
                  @input="
                    updateFieldHeight(
                      attire,
                      'bottoms',
                      $event.target as HTMLTextAreaElement,
                      true
                    )
                  "
                ></el-input>
                <el-input
                  v-model="attire.shoes"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 5 }"
                  placeholder="鞋子"
                  size="small"
                  class="expanding-textarea"
                  @input="
                    updateFieldHeight(
                      attire,
                      'shoes',
                      $event.target as HTMLTextAreaElement,
                      true
                    )
                  "
                ></el-input>
                <el-input
                  v-model="attire.socks"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 5 }"
                  placeholder="袜子"
                  size="small"
                  class="expanding-textarea"
                  @input="
                    updateFieldHeight(
                      attire,
                      'socks',
                      $event.target as HTMLTextAreaElement,
                      true
                    )
                  "
                ></el-input>
              </div>

              <el-input
                v-model="attire.underwears"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 5 }"
                placeholder="内衣"
                size="small"
                class="expanding-textarea"
                @input="
                  updateFieldHeight(
                    attire,
                    'underwears',
                    $event.target as HTMLTextAreaElement
                  )
                "
              ></el-input>
              <el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 5 }"
                v-model="attire.accessories"
                placeholder="配饰 (一行一条)"
                size="small"
                class="expanding-textarea"
                @input="
                  updateFieldHeight(
                    attire,
                    'accessories',
                    $event.target as HTMLTextAreaElement
                  )
                "
              ></el-input>
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
        icon="ph:t-shirt-duotone"
        class="text-5xl text-neutral-400 dark:text-neutral-600 mx-auto mb-3"
      />
      <p class="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
        暂无服装设定
      </p>
      <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
        点击“添加套装”开始创建时尚造型吧！
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, reactive, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";
import { useAppSettingsStore } from "../../stores/appSettings";

type LayoutFieldKey = "tops" | "bottoms" | "shoes" | "socks";
type OtherFieldKey = "name" | "description" | "underwears" | "accessories";

interface FieldHeights {
  name?: number;
  description?: number;
  tops?: number;
  bottoms?: number;
  shoes?: number;
  socks?: number;
  underwears?: number;
  accessories?: number;
}
interface AttireInternalLayoutState {
  fieldGroupMode: "grid" | "stacked";
  fieldHeights: FieldHeights;
}

interface AttireItem {
  id: string;
  name: string;
  description: string;
  tops: string;
  bottoms: string;
  shoes: string;
  socks: string;
  underwears: string;
  accessories: string;
  _internalLayoutState: AttireInternalLayoutState;
}

interface Props {
  form: {
    attires: Omit<AttireItem, "_internalLayoutState">[];
  };
  addAttire: () => void;
  removeAttire: (attireId: string) => void;
  exportAttires: () => Promise<void>;
}

const HEIGHT_THRESHOLD_FOR_STACKING = 75;

const props = defineProps<Props>();
const emit = defineEmits(["update:form"]);
const localAttiresReactive = ref<AttireItem[]>([]);
const appSettings = useAppSettingsStore();

const createDefaultLayoutState = (): AttireInternalLayoutState => ({
  fieldGroupMode: "grid",
  fieldHeights: reactive({
    name: 0,
    description: 0,
    tops: 0,
    bottoms: 0,
    shoes: 0,
    socks: 0,
    underwears: 0,
    accessories: 0,
  }),
});

watch(
  () => props.form.attires,
  (newAttiresFromProp) => {
    const newAttiresJson = JSON.stringify(
      newAttiresFromProp.map((a) => ({ ...a, id: a.id || "" }))
    );
    const currentAttiresJson = JSON.stringify(
      localAttiresReactive.value.map((a) => {
        const { _internalLayoutState, ...rest } = a;
        return { ...rest, id: rest.id || "" };
      })
    );
    if (newAttiresJson !== currentAttiresJson) {
      try {
        const processedAttires = (
          newAttiresFromProp && Array.isArray(newAttiresFromProp)
            ? JSON.parse(JSON.stringify(newAttiresFromProp))
            : []
        ).map((attireData: Omit<AttireItem, "_internalLayoutState">) => {
          const existingItem = localAttiresReactive.value.find(
            (item) => item.id === attireData.id
          );
          return {
            ...attireData,
            _internalLayoutState: existingItem
              ? existingItem._internalLayoutState
              : reactive(createDefaultLayoutState()),
          };
        });
        localAttiresReactive.value = processedAttires;
        nextTick(async () => {
          await initializeAllTextareaLayouts();
        });
      } catch (e) {
        console.error(
          "[AttireSettings] Error processing attires from props:",
          e
        );
        localAttiresReactive.value = [];
      }
    }
  },
  { deep: true, immediate: true }
);

watch(
  localAttiresReactive,
  (newLocalAttires) => {
    const attiresToEmit = newLocalAttires.map((attire) => {
      const { _internalLayoutState, ...restOfAttire } = attire;
      return restOfAttire;
    });
    const currentPropAttiresForEmit = props.form.attires || [];
    if (
      JSON.stringify(attiresToEmit) !==
      JSON.stringify(currentPropAttiresForEmit)
    ) {
      emit("update:form", { attires: attiresToEmit });
    }
  },
  { deep: true }
);

const initializeAllTextareaLayouts = async () => {
  for (const attire of localAttiresReactive.value) {
    await nextTick();
    const attireCardElement = document.querySelector(
      `.attire-item-card-outer-wrapper div[key="${attire.id}"] .attire-item-card`
    );
    if (attireCardElement) {
      const textareas = attireCardElement.querySelectorAll(
        ".expanding-textarea textarea, .attire-name-input-in-handle textarea"
      ) as NodeListOf<HTMLTextAreaElement>;
      textareas.forEach((textarea) => {
        if (textarea.value) {
          const placeholder = textarea.placeholder.toLowerCase();
          const isNameInput =
            textarea.classList.contains("el-textarea__inner") &&
            textarea.parentElement?.parentElement?.classList.contains(
              "attire-name-input-in-handle"
            );

          let fieldKey: LayoutFieldKey | OtherFieldKey | null = null;
          if (isNameInput || placeholder.includes("套装名称"))
            fieldKey = "name";
          else if (placeholder.includes("套装描述")) fieldKey = "description";
          else if (placeholder.includes("上衣")) fieldKey = "tops";
          else if (placeholder.includes("下装")) fieldKey = "bottoms";
          else if (placeholder.includes("鞋子")) fieldKey = "shoes";
          else if (placeholder.includes("袜子")) fieldKey = "socks";
          else if (placeholder.includes("内衣")) fieldKey = "underwears";
          else if (placeholder.includes("配饰")) fieldKey = "accessories";

          const isDynamicGroupMember = fieldKey
            ? ["tops", "bottoms", "shoes", "socks"].includes(fieldKey)
            : false;

          if (fieldKey) {
            updateFieldHeight(attire, fieldKey, textarea, isDynamicGroupMember);
          }
        }
      });
    }
  }
};

const updateFieldHeight = (
  attire: AttireItem,
  fieldKey: LayoutFieldKey | OtherFieldKey,
  textareaElement: HTMLTextAreaElement | null,
  partOfDynamicGroup: boolean = false
) => {
  if (!textareaElement) return;
  const currentScrollHeight = textareaElement.scrollHeight;
  if (attire._internalLayoutState.fieldHeights.hasOwnProperty(fieldKey)) {
    (attire._internalLayoutState.fieldHeights as any)[fieldKey] =
      currentScrollHeight;
  }
  if (partOfDynamicGroup) {
    const groupFields: LayoutFieldKey[] = ["tops", "bottoms", "shoes", "socks"];
    let shouldStack = false;
    for (const key of groupFields) {
      if (
        (attire._internalLayoutState.fieldHeights[key] || 0) >
        HEIGHT_THRESHOLD_FOR_STACKING
      ) {
        shouldStack = true;
        break;
      }
    }
    if (shouldStack) {
      if (attire._internalLayoutState.fieldGroupMode !== "stacked")
        attire._internalLayoutState.fieldGroupMode = "stacked";
    } else {
      if (attire._internalLayoutState.fieldGroupMode !== "grid")
        attire._internalLayoutState.fieldGroupMode = "grid";
    }
  }
};

const getFieldGroupLayoutClass = (attire: AttireItem): string => {
  if (attire._internalLayoutState?.fieldGroupMode === "stacked")
    return "grid grid-cols-1 gap-y-2.5";
  return "grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5";
};

const handleDraggableChange = () => {};
</script>

<style scoped>
.attire-ghost {
  opacity: 0.6;
  border-radius: var(--radius-lg);
  background-color: var(--color-sky-100);
  outline: 2px dashed var(--color-sky-400);
  box-shadow: none;
}
:where(.dark, .dark *) .attire-ghost {
  background-color: oklch(from var(--color-sky-800) l c h / 0.4);
}
.attire-chosen .attire-item-card {
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
:where(.dark, .dark *) .attire-chosen .attire-item-card {
  box-shadow: 0 0 0 var(--chosen-ring-offset-width)
      var(--chosen-ring-offset-color-dark),
    0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width))
      var(--chosen-ring-color-dark),
    var(--shadow-xl);
}
.attire-chosen {
  transform: scale(1.02);
  z-index: 10;
}

.attire-card-drag-handle:hover {
  background-color: var(--color-neutral-200);
}
:where(.dark, .dark *) .attire-card-drag-handle:hover {
  background-color: var(--color-neutral-600);
}

.attire-card-drag-handle
  :deep(.attire-name-input-in-handle.el-textarea .el-textarea__inner) {
  background-color: transparent;
  border: none;
  box-shadow: none;
  padding: 2px 4px;
  font-weight: 500;
  line-height: 1.4;
  font-size: 0.875rem;
  color: var(--color-neutral-700);
  resize: none;
  text-align: center;
}
:where(.dark, .dark *)
  .attire-card-drag-handle
  :deep(.attire-name-input-in-handle.el-textarea .el-textarea__inner) {
  color: var(--color-neutral-300);
}
.attire-card-drag-handle
  :deep(.attire-name-input-in-handle.el-textarea.is-focus .el-textarea__inner) {
  background-color: var(--color-white);
}
:where(.dark, .dark *)
  .attire-card-drag-handle
  :deep(.attire-name-input-in-handle.el-textarea.is-focus .el-textarea__inner) {
  background-color: var(--color-neutral-700);
}

.attire-item-card
  .p-3
  :deep(.expanding-textarea.el-textarea .el-textarea__inner) {
  font-size: 0.8125rem;
  line-height: 1.5;
  padding-top: 4px;
  padding-bottom: 4px;
  resize: none;
  border-radius: var(--el-input-border-radius, var(--radius-base));
}
.attire-item-card :deep(.grid .expanding-textarea.el-textarea) {
  width: 100%;
}
</style>
