<template>
  <CardContainer title="服装设定" icon="ph:person-simple-run-duotone">
    <template #actions>
      <div class="flex gap-x-3">
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
        <TooltipIconButton
          tooltip-content="导出所有服装配置 (JSON)"
          icon="material-symbols:ios-share-rounded"
          label-text="导出所有服装配置"
          button-class="btn-secondary-adv text-sm !py-1.5 !px-3"
          icon-class="text-[18px]"
          @click="props.exportAttires"
        />
      </div>
    </template>

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
                />
              </div>
              <TooltipIconButton
                tooltip-content="删除此套装"
                icon="ph:x-bold"
                :label-text="`删除套装 ${attire.name}`"
                button-class="btn-danger-adv !p-1 !aspect-square shrink-0 !rounded-full !text-xs ml-2"
                icon-class="text-[12px]"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
                @click="() => props.removeAttire(attire.id)"
              />
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
              />

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
                />
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
                />
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
                />
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
                />
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
              />
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
              />
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
  </CardContainer>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, reactive, nextTick } from "vue";
import { Icon } from "@iconify/vue"; // Icon is still used for "添加套装" button and empty state
import draggable from "vuedraggable";
import { ElInput } from "element-plus"; // ElTooltip removed, ElMessageBox might be needed by parent for removeAttire confirmation
import { useAppSettingsStore } from "@core/store/appSettings.store";
import CardContainer from "@core/components/ui/CardContainer.vue";
import TooltipIconButton from "@core/components/ui/TooltipIconButton.vue";
import type {
  IEditorCharacterCard,
  IEditorAttire,
} from "@character/types/character.types";

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

// Local interface that combines shared IEditorAttire with component-specific layout state
interface LocalAttireItemWithLayout extends IEditorAttire {
  _internalLayoutState: AttireInternalLayoutState;
}

interface Props {
  // Parent passes the attires part of the main form
  form: Pick<IEditorCharacterCard, "attires">;
  addAttire: () => void;
  removeAttire: (attireId: string) => void;
  exportAttires: () => Promise<void>;
}

const HEIGHT_THRESHOLD_FOR_STACKING = 75;

const props = defineProps<Props>();
const emit = defineEmits(["update:form"]);
const localAttiresReactive = ref<LocalAttireItemWithLayout[]>([]);
const appSettings = useAppSettingsStore();

const createDefaultLayoutState = (): AttireInternalLayoutState => ({
  fieldGroupMode: "grid",
  fieldHeights: reactive({
    name: 0, description: 0, tops: 0, bottoms: 0, shoes: 0,
    socks: 0, underwears: 0, accessories: 0,
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
            ? JSON.parse(JSON.stringify(newAttiresFromProp)) // Deep clone
            : []
        ).map((attireData: IEditorAttire) => { // attireData is now IEditorAttire
          const existingItem = localAttiresReactive.value.find(
            (item) => item.id === attireData.id
          );
          return {
            ...attireData, // Spread IEditorAttire fields
            _internalLayoutState: existingItem
              ? existingItem._internalLayoutState
              : reactive(createDefaultLayoutState()), // Add internal layout state
          };
        });
        localAttiresReactive.value = processedAttires as LocalAttireItemWithLayout[];
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
    await nextTick(); // Ensure DOM is updated
    const attireCardElement = document.querySelector(
      `.attire-item-card-outer-wrapper div[key="${attire.id}"] .attire-item-card`
    );
    if (attireCardElement) {
      const textareas = attireCardElement.querySelectorAll(
        ".expanding-textarea textarea, .attire-name-input-in-handle textarea"
      ) as NodeListOf<HTMLTextAreaElement>;
      textareas.forEach((textarea) => {
        if (textarea.value) { // Only update if there's content, to avoid issues with placeholders
          const placeholder = textarea.placeholder.toLowerCase();
          const isNameInput =
            textarea.classList.contains("el-textarea__inner") && // Check specific el-input textarea
            textarea.parentElement?.parentElement?.classList.contains("attire-name-input-in-handle");

          let fieldKey: LayoutFieldKey | OtherFieldKey | null = null;
          if (isNameInput || placeholder.includes("套装名称")) fieldKey = "name";
          else if (placeholder.includes("套装描述")) fieldKey = "description";
          else if (placeholder.includes("上衣")) fieldKey = "tops";
          else if (placeholder.includes("下装")) fieldKey = "bottoms";
          else if (placeholder.includes("鞋子")) fieldKey = "shoes";
          else if (placeholder.includes("袜子")) fieldKey = "socks";
          else if (placeholder.includes("内衣")) fieldKey = "underwears";
          else if (placeholder.includes("配饰")) fieldKey = "accessories";

          const isDynamicGroupMember = fieldKey ? ["tops", "bottoms", "shoes", "socks"].includes(fieldKey) : false;

          if (fieldKey) {
            updateFieldHeight(attire, fieldKey, textarea, isDynamicGroupMember);
          }
        }
      });
    }
  }
};

const updateFieldHeight = (
  attire: LocalAttireItemWithLayout,
  fieldKey: LayoutFieldKey | OtherFieldKey,
  textareaElement: HTMLTextAreaElement | null,
  partOfDynamicGroup: boolean = false
) => {
  if (!textareaElement) return;
  // Ensure the element calculates its scrollHeight correctly before reading it
  textareaElement.style.height = 'auto'; // Temporarily reset height
  const currentScrollHeight = textareaElement.scrollHeight;
  textareaElement.style.height = ''; // Restore original height behavior (or let :autosize handle it)

  if (attire._internalLayoutState.fieldHeights.hasOwnProperty(fieldKey)) {
    (attire._internalLayoutState.fieldHeights as any)[fieldKey] = currentScrollHeight;
  }

  if (partOfDynamicGroup) {
    const groupFields: LayoutFieldKey[] = ["tops", "bottoms", "shoes", "socks"];
    let shouldStack = false;
    for (const key of groupFields) {
      if ((attire._internalLayoutState.fieldHeights[key] || 0) > HEIGHT_THRESHOLD_FOR_STACKING) {
        shouldStack = true;
        break;
      }
    }
    attire._internalLayoutState.fieldGroupMode = shouldStack ? "stacked" : "grid";
  }
};

const getFieldGroupLayoutClass = (
  attire: LocalAttireItemWithLayout
): string => {
  return attire._internalLayoutState?.fieldGroupMode === "stacked"
    ? "grid grid-cols-1 gap-y-2.5"
    : "grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5";
};

const handleDraggableChange = () => {
  // This event can be used to persist the new order if needed,
  // but v-model on localAttiresReactive already updates the order.
  // The parent component will receive the updated order via the watch on localAttiresReactive.
};
</script>

<style scoped>
@reference "../../style.css";
.attire-ghost {
  @apply opacity-60 rounded-lg bg-sky-100 dark:bg-sky-800/40 outline-2 outline-dashed outline-sky-400 shadow-none;
}
.attire-chosen .attire-item-card {
  @apply ring-2 ring-accent-500 dark:ring-accent-400 ring-offset-2 ring-offset-white dark:ring-offset-neutral-850 shadow-xl;
  transform: scale(1.02);
  z-index: 10;
}

.attire-card-drag-handle:hover {
  @apply bg-neutral-200 dark:bg-neutral-600;
}

.attire-card-drag-handle :deep(.attire-name-input-in-handle.el-textarea .el-textarea__inner) {
  @apply bg-transparent border-none shadow-none p-0.5 text-center font-medium text-neutral-700 dark:text-neutral-300 resize-none;
  line-height: 1.4;
  font-size: 0.875rem; /* 14px */
}
.attire-card-drag-handle :deep(.attire-name-input-in-handle.el-textarea.is-focus .el-textarea__inner) {
  @apply bg-white dark:bg-neutral-700;
}

.attire-item-card .p-3 :deep(.expanding-textarea.el-textarea .el-textarea__inner) {
  @apply text-xs leading-normal py-1 resize-none rounded; /* Adjusted from 13px to text-xs for consistency */
}
.attire-item-card :deep(.grid .expanding-textarea.el-textarea) {
  width: 100%;
}
</style>
