<template>
  <div class="content-panel-body space-y-5">
    
    <div class="content-panel-header -mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-6">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon icon="ph:users-three-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
        人际关系
      </h3>
      <div class="flex gap-x-3 ml-auto">
        <button
          @click="props.addRelationship"
          class="btn-primary-adv text-sm !py-1.5 !px-3 whitespace-nowrap"
          title="添加新的人际关系"
        >
          <Icon icon="material-symbols:add-circle-outline-rounded" width="18" height="18" class="mr-1.5 -ml-0.5" />
          添加关系
        </button>
        <button
          @click="props.exportRelationships"
          title="导出所有人际关系 (JSON)"
          class="btn-secondary-adv text-sm !py-1.5 !px-3"
        >
          <Icon icon="material-symbols:ios-share-rounded" width="18" height="18" />
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
        <div :key="relationship.id" class="relationship-item-card-outer-wrapper"> 
          <div class="relationship-item-card bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-black/20 border border-neutral-200 dark:border-neutral-700 
                        flex flex-col relative transition-all duration-150 ease-in-out hover:shadow-lg dark:hover:border-neutral-600 overflow-hidden">
            
            <div 
              class="relationship-card-drag-handle bg-neutral-100 dark:bg-neutral-700/50 px-3 py-1.5 cursor-move 
                     flex items-center justify-between text-neutral-500 dark:text-neutral-400
                     border-b border-neutral-200 dark:border-neutral-700 text-xs"
            >
              <div class="flex items-center gap-1.5 flex-grow min-w-0" title="按住拖拽排序">
                <Icon icon="material-symbols:drag-indicator-rounded" width="18" height="18"/>
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
                class="btn-danger-adv !p-1 !aspect-square shrink-0 !rounded-full !text-xs ml-2"
                title="删除此关系"
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
                <label class="form-label-adv text-xs block mb-1">对话示例</label>
                <div v-for="(dialogue, dialogueIndex) in relationship.dialogueExamples" :key="`dialogue-${relationship.id}-${dialogueIndex}`" class="flex items-start gap-x-2">
                  <el-input 
                    v-model="relationship.dialogueExamples[dialogueIndex]" 
                    type="textarea" 
                    :autosize="{minRows: 1, maxRows: 4}" 
                    :placeholder="`对话内容 ${dialogueIndex + 1}`"
                    size="small"
                    class="flex-grow"
                  ></el-input>
                  <el-popconfirm 
                    title="确定删除此对话示例吗？" 
                    confirm-button-text="删除" 
                    cancel-button-text="取消" 
                    icon-color="var(--color-red-500)"
                    @confirm="removeDialogueExample(relationshipIndex, dialogueIndex)"
                  >
                    <template #reference>
                      <button class="btn-danger-adv !p-1.5 !aspect-square shrink-0 !text-xs mt-0.5" title="移除此示例">
                         <Icon icon="ph:trash-simple-duotone" width="14" height="14" />
                      </button>
                    </template>
                  </el-popconfirm>
                </div>
                <button @click="addDialogueExample(relationshipIndex)" class="btn-secondary-adv w-full !py-1 !px-2 text-xs">
                  <Icon icon="ph:plus-circle-duotone" class="mr-1 text-sm"/> 添加对话示例
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <div v-else class="mt-6 text-center py-10 border-2 border-dashed border-neutral-300/70 dark:border-neutral-700/70 rounded-lg bg-neutral-50 dark:bg-neutral-800/30">
      <Icon icon="ph:users-four-duotone" class="text-5xl text-neutral-400 dark:text-neutral-600 mx-auto mb-3" />
      <p class="text-neutral-600 dark:text-neutral-400 text-sm font-medium">暂无人际关系</p>
      <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-1">点击“添加关系”来描绘角色的社交网络吧！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'; // 移除了 onUpdated 以简化
import { ElInput, ElButton, ElPopconfirm } from 'element-plus';
import { Icon } from "@iconify/vue";
import draggable from 'vuedraggable';

// --- 接口定义 ---
interface Relationship {
  id: string; // 必须：唯一ID
  name: string;
  description: string;
  features: string;
  dialogueExamples: string[];
}

interface Props {
  form: {
    relationships: Relationship[]; // 父组件务必确保这里的每个 relationship 对象都有有效的 id
  };
  addRelationship: () => void; // 父组件提供此方法，确保添加的 relationship 有 id
  removeRelationship: (relationshipId: string) => void; // 父组件提供此方法
  exportRelationships: () => Promise<void>; // 父组件提供此方法
}

// --- Props, Emits, 本地状态 ---
const props = defineProps<Props>();
const emit = defineEmits(['update:form']);

// 本地响应式副本，严格按照 AttireSettings 的模式
const localRelationships = ref<Relationship[]>([]); 

// --- 数据同步 Watchers ---
// 从父组件 props 更新本地 localRelationships
watch(() => props.form.relationships, (newRelationshipsFromProp) => {
  // 调试日志：检查传入的 props
  // console.log('[Relationships] PROPS WATCHER: newRelationshipsFromProp', JSON.parse(JSON.stringify(newRelationshipsFromProp)));
  // newRelationshipsFromProp?.forEach((item, index) => {
  //   if (!item || typeof item.id !== 'string' || item.id.trim() === '') {
  //     console.error(`[Relationships] PROPS WATCHER: Item at index ${index} has invalid ID from props!`, item);
  //   }
  // });

  if (JSON.stringify(newRelationshipsFromProp) !== JSON.stringify(localRelationships.value)) {
    try {
      // 直接深拷贝，父组件必须保证 id 的正确性
      localRelationships.value = JSON.parse(JSON.stringify(newRelationshipsFromProp || []));
    } catch (e) {
      console.error('[Relationships] Error cloning relationships from props:', e);
      localRelationships.value = [];
    }
  }
}, { deep: true, immediate: true });

// 监听本地 localRelationships 的变化 (例如拖拽、内部编辑)，通知父组件
watch(localRelationships, (newLocalState) => {
  // 调试日志：检查准备 emit 的数据
  // console.log('[Relationships] LOCAL WATCHER: newLocalState for emit', JSON.parse(JSON.stringify(newLocalState)));
  // newLocalState?.forEach((item, index) => {
  //   if (!item || typeof item.id !== 'string' || item.id.trim() === '') {
  //     console.error(`[Relationships] LOCAL WATCHER: Item at index ${index} has invalid ID before emit!`, item);
  //   }
  // });

  // 只有当本地副本与父组件的原始数据真正不同时才 emit，以避免不必要的循环
  if (JSON.stringify(newLocalState) !== JSON.stringify(props.form.relationships || [])) {
    emit('update:form', { relationships: newLocalState }); // 直接 emit 本地状态
  }
}, { deep: true });


// --- 内部方法 ---
const addDialogueExample = (relationshipIndex: number) => {
  const relationship = localRelationships.value[relationshipIndex];
  if (relationship) {
    if (!Array.isArray(relationship.dialogueExamples)) {
      relationship.dialogueExamples = []; // 防御性初始化
    }
    relationship.dialogueExamples.push('');
    // 不需要手动 emit，对 localRelationships 的修改会被 watcher 捕获
  }
};

const removeDialogueExample = (relationshipIndex: number, exampleIndex: number) => {
  const relationship = localRelationships.value[relationshipIndex];
  if (relationship?.dialogueExamples) {
    relationship.dialogueExamples.splice(exampleIndex, 1);
    // 不需要手动 emit
  }
};

const handleDraggableChange = (event: any) => {
  // v-model="localRelationships" 已经更新了数组的顺序。
  // localRelationships 的 watcher 会自动处理 emit。
  // console.log('[Relationships] Draggable change event:', event);
};
</script>

<style scoped>
/* 样式与上一版本基本一致，确保类名对应 */
.relationship-ghost { opacity: 0.6; border-radius: var(--radius-lg); background-color: var(--color-sky-100); outline: 2px dashed var(--color-sky-400); box-shadow: none; }
:where(.dark, .dark *) .relationship-ghost { background-color: oklch(from var(--color-sky-800) l c h / 0.4); }

.relationship-chosen .relationship-item-card { 
  --chosen-ring-width: 2px; --chosen-ring-offset-width: 2px;
  --chosen-ring-color-light: var(--color-accent-500); --chosen-ring-offset-color-light: var(--color-white); 
  --chosen-ring-color-dark: var(--color-accent-400); --chosen-ring-offset-color-dark: var(--color-neutral-850); 
  box-shadow: 0 0 0 var(--chosen-ring-offset-width) var(--chosen-ring-offset-color-light), 0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width)) var(--chosen-ring-color-light), var(--shadow-xl); 
}
:where(.dark, .dark *) .relationship-chosen .relationship-item-card {
  box-shadow: 0 0 0 var(--chosen-ring-offset-width) var(--chosen-ring-offset-color-dark), 0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width)) var(--chosen-ring-color-dark), var(--shadow-xl); 
}
.relationship-chosen { transform: scale(1.02); z-index: 10; }

.relationship-card-drag-handle :deep(.relationship-name-input.el-textarea .el-textarea__inner) { background-color: transparent; border: none; box-shadow: none; padding: 2px 4px; font-weight: 500; line-height: 1.4; font-size: 0.875rem; color: var(--color-neutral-700); resize: none; }
:where(.dark, .dark *) .relationship-card-drag-handle :deep(.relationship-name-input.el-textarea .el-textarea__inner) { color: var(--color-neutral-300); }
.relationship-card-drag-handle :deep(.relationship-name-input.el-textarea.is-focus .el-textarea__inner) { background-color: var(--color-white); }
:where(.dark, .dark *) .relationship-card-drag-handle :deep(.relationship-name-input.el-textarea.is-focus .el-textarea__inner) { background-color: var(--color-neutral-700); }

.relationship-item-card :deep(.el-textarea__inner) { font-size: 0.8125rem; line-height: 1.5; padding-top: 4px; padding-bottom: 4px; resize: none; border-radius: var(--el-input-border-radius, var(--radius-base)); }
</style>