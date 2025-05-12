<template>
  <div class="content-panel-body space-y-5">
    <div class="content-panel-header -mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-6">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon icon="ph:strategy-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
        性格特质
      </h3>
      <div class="flex gap-x-3 ml-auto">
        <button @click="props.addTrait" class="btn-primary-adv text-sm !py-1.5 !px-3 whitespace-nowrap" title="添加新的性格特质">
          <Icon icon="material-symbols:add-circle-outline-rounded" width="18" height="18" class="mr-1.5 -ml-0.5" />
          添加特质
        </button>
        <button @click="props.exportTraits" title="导出所有性格特质 (JSON)" class="btn-secondary-adv text-sm !py-1.5 !px-3" >
          <Icon icon="material-symbols:ios-share-rounded" width="18" height="18" />
        </button>
      </div>
    </div>

    <draggable
      v-if="localTraits && localTraits.length > 0"
      v-model="localTraits"
      item-key="id"
      animation="200"
      ghost-class="trait-ghost"
      chosen-class="trait-chosen"
      handle=".trait-card-drag-handle"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5"
      @change="handleDraggableChange"
    >
      <template #item="{ element: trait, index: traitIndex }">
        <div :key="trait.id" class="trait-item-card-outer-wrapper">
          <div class="trait-item-card bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-black/20 border border-neutral-200 dark:border-neutral-700
                        flex flex-col relative transition-all duration-150 ease-in-out hover:shadow-lg dark:hover:border-neutral-600 overflow-hidden">
            <div class="trait-card-drag-handle bg-neutral-100 dark:bg-neutral-700/50 px-3 py-1.5 cursor-move flex items-center justify-between text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700 text-xs">
              <div class="flex items-center gap-1.5 flex-grow min-w-0" title="按住拖拽排序">
                <Icon icon="material-symbols:drag-indicator-rounded" width="18" height="18"/>
                <el-input v-model="trait.name" type="textarea" :autosize="{ minRows: 1, maxRows: 2 }" placeholder="特质名称" size="small" class="trait-name-input flex-grow min-w-0"></el-input>
              </div>
              <button
                @click="() => props.removeTrait(trait.id)"
                class="btn-danger-adv !p-1 !aspect-square shrink-0 !rounded-full !text-xs ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="删除此特质"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
              >
                <Icon icon="ph:x-bold" width="12" height="12" />
              </button>
            </div>
            <div class="p-3 flex flex-col gap-y-3 flex-grow">
              <el-input v-model="trait.description" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" placeholder="特质描述 (详细说明该特质的表现和影响)" size="small"></el-input>
              <div class="space-y-2">
                <label class="form-label-adv text-xs block mb-1">对话示例</label>
                <div v-for="(dialogue, dialogueIndex) in trait.dialogueExamples" :key="`dialogue-${trait.id}-${dialogueIndex}`" class="flex items-start gap-x-2">
                  <el-input v-model="trait.dialogueExamples[dialogueIndex]" type="textarea" :autosize="{minRows: 1, maxRows: 4}" :placeholder="`示例 ${dialogueIndex + 1}`" size="small" class="flex-grow"></el-input>
                  <button @click="removeDialogueExample(traitIndex, dialogueIndex)" class="btn-danger-adv !p-1.5 !aspect-square shrink-0 !text-xs mt-0.5" title="移除此示例">
                     <Icon icon="ph:trash-simple-duotone" width="14" height="14" />
                  </button>
                </div>
                <button @click="addDialogueExample(traitIndex)" class="btn-secondary-adv w-full !py-1 !px-2 text-xs">
                  <Icon icon="ph:plus-circle-duotone" class="mr-1 text-sm"/> 添加对话示例
                </button>
              </div>
              <div class="space-y-2">
                <label class="form-label-adv text-xs block mb-1">行为示例</label>
                <div v-for="(behavior, behaviorIndex) in trait.behaviorExamples" :key="`behavior-${trait.id}-${behaviorIndex}`" class="flex items-start gap-x-2">
                  <el-input v-model="trait.behaviorExamples[behaviorIndex]" type="textarea" :autosize="{minRows: 1, maxRows: 4}" :placeholder="`示例 ${behaviorIndex + 1}`" size="small" class="flex-grow"></el-input>
                  <button @click="removeBehaviorExample(traitIndex, behaviorIndex)" class="btn-danger-adv !p-1.5 !aspect-square shrink-0 !text-xs mt-0.5" title="移除此示例">
                     <Icon icon="ph:trash-simple-duotone" width="14" height="14" />
                  </button>
                </div>
                <button @click="addBehaviorExample(traitIndex)" class="btn-secondary-adv w-full !py-1 !px-2 text-xs">
                  <Icon icon="ph:plus-circle-duotone" class="mr-1 text-sm"/> 添加行为示例
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <div v-else class="mt-6 text-center py-10 border-2 border-dashed border-neutral-300/70 dark:border-neutral-700/70 rounded-lg bg-neutral-50 dark:bg-neutral-800/30">
      <Icon icon="ph:smiley-blank-duotone" class="text-5xl text-neutral-400 dark:text-neutral-600 mx-auto mb-3" />
      <p class="text-neutral-600 dark:text-neutral-400 text-sm font-medium">暂无性格特质</p>
      <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-1">点击“添加特质”来塑造角色的独特个性吧！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { ElInput } from 'element-plus';
import { Icon } from "@iconify/vue";
import draggable from 'vuedraggable';
import { useAppSettingsStore } from '../../stores/appSettings'; // Corrected path

interface Trait {
  id: string;
  name: string;
  description: string;
  dialogueExamples: string[];
  behaviorExamples: string[];
}

interface Props {
  form: {
    traits: Trait[];
  };
  addTrait: () => void;
  removeTrait: (traitId: string) => void;
  exportTraits: () => Promise<void>;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:form']);
const localTraits = ref<Trait[]>([]);
const appSettings = useAppSettingsStore();

watch(() => props.form.traits, (newTraitsFromProp) => {
  if (JSON.stringify(newTraitsFromProp) !== JSON.stringify(localTraits.value)) {
    try {
      localTraits.value = JSON.parse(JSON.stringify(newTraitsFromProp || []));
    } catch (e) {
      console.error('[PersonalityTraits] Cloning traits from props failed:', e);
      localTraits.value = [];
    }
  }
}, { deep: true, immediate: true });

watch(localTraits, (newLocalTraitsState) => {
  if (JSON.stringify(newLocalTraitsState) !== JSON.stringify(props.form.traits || [])) {
    emit('update:form', { traits: newLocalTraitsState });
  }
}, { deep: true });

const addDialogueExample = (traitIndex: number) => {
  localTraits.value[traitIndex]?.dialogueExamples.push('');
};
const removeDialogueExample = (traitIndex: number, exampleIndex: number) => {
  localTraits.value[traitIndex]?.dialogueExamples.splice(exampleIndex, 1);
};
const addBehaviorExample = (traitIndex: number) => {
  localTraits.value[traitIndex]?.behaviorExamples.push('');
};
const removeBehaviorExample = (traitIndex: number, exampleIndex: number) => {
  localTraits.value[traitIndex]?.behaviorExamples.splice(exampleIndex, 1);
};
const handleDraggableChange = (event: any) => {};
</script>

<style scoped>
.trait-ghost { opacity: 0.6; border-radius: var(--radius-lg); background-color: var(--color-sky-100); outline: 2px dashed var(--color-sky-400); box-shadow: none; }
:where(.dark, .dark *) .trait-ghost { background-color: oklch(from var(--color-sky-800) l c h / 0.4); }

.trait-chosen .trait-item-card {
  --chosen-ring-width: 2px; --chosen-ring-offset-width: 2px;
  --chosen-ring-color-light: var(--color-accent-500); --chosen-ring-offset-color-light: var(--color-white);
  --chosen-ring-color-dark: var(--color-accent-400); --chosen-ring-offset-color-dark: var(--color-neutral-850);
  box-shadow: 0 0 0 var(--chosen-ring-offset-width) var(--chosen-ring-offset-color-light), 0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width)) var(--chosen-ring-color-light), var(--shadow-xl);
}
:where(.dark, .dark *) .trait-chosen .trait-item-card {
  box-shadow: 0 0 0 var(--chosen-ring-offset-width) var(--chosen-ring-offset-color-dark), 0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width)) var(--chosen-ring-color-dark), var(--shadow-xl);
}
.trait-chosen { transform: scale(1.02); z-index: 10; }

.trait-card-drag-handle :deep(.trait-name-input.el-textarea .el-textarea__inner) { background-color: transparent; border: none; box-shadow: none; padding: 2px 4px; font-weight: 500; line-height: 1.4; font-size: 0.875rem; color: var(--color-neutral-700); resize: none; }
:where(.dark, .dark *) .trait-card-drag-handle :deep(.trait-name-input.el-textarea .el-textarea__inner) { color: var(--color-neutral-300); }
.trait-card-drag-handle :deep(.trait-name-input.el-textarea.is-focus .el-textarea__inner) { background-color: var(--color-white); }
:where(.dark, .dark *) .trait-card-drag-handle :deep(.trait-name-input.el-textarea.is-focus .el-textarea__inner) { background-color: var(--color-neutral-700); }

.trait-item-card :deep(.el-textarea__inner) { font-size: 0.8125rem; line-height: 1.5; padding-top: 4px; padding-bottom: 4px; resize: none; border-radius: var(--el-input-border-radius, var(--radius-base)); }
</style>