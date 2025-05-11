<template>
  <div class="content-panel-body space-y-5">
    
    <div class="content-panel-header -mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-6">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon icon="ph:sword-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
        角色技能
      </h3>
      <div class="flex gap-x-3 ml-auto">
        <button
          @click="props.addSkill"
          class="btn-primary-adv text-sm !py-1.5 !px-3 whitespace-nowrap"
          title="添加新技能"
        >
          <Icon icon="material-symbols:add-circle-outline-rounded" width="18" height="18" class="mr-1.5 -ml-0.5" />
          添加技能
        </button>
        <button
          @click="props.exportSkills"
          title="导出所有技能 (JSON)"
          class="btn-secondary-adv text-sm !py-1.5 !px-3"
        >
          <Icon icon="material-symbols:ios-share-rounded" width="18" height="18" />
        </button>
      </div>
    </div>

    
    
    <draggable
      v-if="localSkills && localSkills.length > 0"
      v-model="localSkills"
      item-key="id" 
      animation="200"
      ghost-class="skill-ghost"
      chosen-class="skill-chosen"
      handle=".skill-card-drag-handle"
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5"
      @change="handleDraggableChange"
    >
      <template #item="{ element: skill }">
        
        <div :key="skill.id" class="skill-item-card-outer-wrapper"> 
          <div class="skill-item-card bg-white dark:bg-neutral-800 rounded-lg shadow-md dark:shadow-black/20 border border-neutral-200 dark:border-neutral-700 
                        flex flex-col relative transition-all duration-150 ease-in-out hover:shadow-lg dark:hover:border-neutral-600 overflow-hidden">
            
            
            <div 
              class="skill-card-drag-handle bg-neutral-100 dark:bg-neutral-700/50 px-3 py-1.5 cursor-move 
                     flex items-center justify-between text-neutral-500 dark:text-neutral-400
                     border-b border-neutral-200 dark:border-neutral-700 text-xs"
            >
              <div class="flex items-center gap-1.5 flex-grow min-w-0" title="按住拖拽排序">
                <Icon icon="material-symbols:drag-indicator-rounded" width="18" height="18"/>
                <el-input
                  v-model="skill.name"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  placeholder="技能名称"
                  size="small"
                  class="skill-name-input flex-grow min-w-0"
                ></el-input>
              </div>
              <button
                @click="() => props.removeSkill(skill.id)" 
                class="btn-danger-adv !p-1 !aspect-square shrink-0 !rounded-full !text-xs ml-2"
                title="删除此技能"
              >
                <Icon icon="ph:x-bold" width="12" height="12" />
              </button>
            </div>

            
            <div class="p-3 flex flex-col gap-y-3 flex-grow">
              <el-input 
                v-model="skill.description" 
                type="textarea" 
                :autosize="{ minRows: 2, maxRows: 6 }" 
                placeholder="技能描述 (效果、作用、学习条件等)"
                size="small"
              ></el-input>
              <el-input 
                v-model="skill.dialogExample" 
                type="textarea" 
                :autosize="{ minRows: 1, maxRows: 4 }" 
                placeholder="对话示例 (例如施法咒语, 技能宣言)"
                size="small"
              ></el-input>
               <el-input 
                v-model="skill.behaviorExample" 
                type="textarea" 
                :autosize="{ minRows: 1, maxRows: 4 }" 
                placeholder="行为示例 (例如技能施展的动作描述)"
                size="small"
              ></el-input>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    
    <div v-else class="mt-6 text-center py-10 border-2 border-dashed border-neutral-300/70 dark:border-neutral-700/70 rounded-lg bg-neutral-50 dark:bg-neutral-800/30">
      <Icon icon="ph:magic-wand-duotone" class="text-5xl text-neutral-400 dark:text-neutral-600 mx-auto mb-3" />
      <p class="text-neutral-600 dark:text-neutral-400 text-sm font-medium">暂无技能</p>
      <p class="text-xs text-neutral-500 dark:text-neutral-500 mt-1">点击“添加技能”来赋予角色强大的能力吧！</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { ElInput, ElButton } from 'element-plus'; // 移除了 ElCard, ElCol
import { Icon } from "@iconify/vue";
import draggable from 'vuedraggable';

// --- 接口定义 ---
interface Skill {
  id: string; // 技能的唯一标识符
  name: string;
  description: string;
  dialogExample: string; // 对话/咒语示例
  behaviorExample: string; // 行为/动作示例
}

interface Props {
  form: {
    skills: Skill[]; // 父组件确保这里的每个 skill 对象都有 id
  };
  addSkill: () => void;
  removeSkill: (skillId: string) => void; // 根据 ID 移除
  exportSkills: () => Promise<void>;
}

// --- Props, Emits, 本地状态 ---
const props = defineProps<Props>();
const emit = defineEmits(['update:form']);
const localSkills = ref<Skill[]>([]); // 本地副本

// --- 数据同步 Watchers ---
// 监听父组件传入的 skills 数据
watch(() => props.form.skills, (newSkillsFromProp) => {
  // 调试日志 (可选)
  // console.log('[SkillsEditor] PROPS WATCHER: newSkillsFromProp', JSON.parse(JSON.stringify(newSkillsFromProp)));
  // newSkillsFromProp?.forEach((item, index) => {
  //   if (!item || typeof item.id !== 'string' || item.id.trim() === '') {
  //     console.error(`[SkillsEditor] PROPS WATCHER: Item at index ${index} has invalid ID from props!`, item);
  //   }
  // });

  if (JSON.stringify(newSkillsFromProp) !== JSON.stringify(localSkills.value)) {
    try {
      localSkills.value = JSON.parse(JSON.stringify(newSkillsFromProp || []));
    } catch (e) {
      console.error('[SkillsEditor] Error cloning skills from props:', e);
      localSkills.value = [];
    }
  }
}, { deep: true, immediate: true });

// 监听本地 localSkills 的变化 (拖拽或内部编辑)
watch(localSkills, (newLocalState) => {
  // 调试日志 (可选)
  // console.log('[SkillsEditor] LOCAL WATCHER: newLocalState for emit', JSON.parse(JSON.stringify(newLocalState)));
  // newLocalState?.forEach((item, index) => {
  //   if (!item || typeof item.id !== 'string' || item.id.trim() === '') {
  //     console.error(`[SkillsEditor] LOCAL WATCHER: Item at index ${index} has invalid ID before emit!`, item);
  //   }
  // });

  if (JSON.stringify(newLocalState) !== JSON.stringify(props.form.skills || [])) {
    emit('update:form', { skills: newLocalState });
  }
}, { deep: true });

// --- 内部方法 (此组件比较简单，不需要动态添加/删除卡片内部的列表项) ---
const handleDraggableChange = (event: any) => {
  // v-model="localSkills" 已更新数组顺序
  // 上面的 watch(localSkills, ...) 会负责 emit 更新
  // console.log('[SkillsEditor] Draggable change event:', event);
};
</script>

<style scoped>
/* 样式与 PersonalityTraits.vue 和 Relationships.vue 类似，类名已更新 */
.skill-ghost { opacity: 0.6; border-radius: var(--radius-lg); background-color: var(--color-sky-100); outline: 2px dashed var(--color-sky-400); box-shadow: none; }
:where(.dark, .dark *) .skill-ghost { background-color: oklch(from var(--color-sky-800) l c h / 0.4); }

.skill-chosen .skill-item-card { 
  --chosen-ring-width: 2px; --chosen-ring-offset-width: 2px;
  --chosen-ring-color-light: var(--color-accent-500); --chosen-ring-offset-color-light: var(--color-white); 
  --chosen-ring-color-dark: var(--color-accent-400); --chosen-ring-offset-color-dark: var(--color-neutral-850); 
  box-shadow: 0 0 0 var(--chosen-ring-offset-width) var(--chosen-ring-offset-color-light), 0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width)) var(--chosen-ring-color-light), var(--shadow-xl); 
}
:where(.dark, .dark *) .skill-chosen .skill-item-card {
  box-shadow: 0 0 0 var(--chosen-ring-offset-width) var(--chosen-ring-offset-color-dark), 0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width)) var(--chosen-ring-color-dark), var(--shadow-xl); 
}
.skill-chosen { transform: scale(1.02); z-index: 10; }

.skill-card-drag-handle :deep(.skill-name-input.el-textarea .el-textarea__inner) { background-color: transparent; border: none; box-shadow: none; padding: 2px 4px; font-weight: 500; line-height: 1.4; font-size: 0.875rem; color: var(--color-neutral-700); resize: none; }
:where(.dark, .dark *) .skill-card-drag-handle :deep(.skill-name-input.el-textarea .el-textarea__inner) { color: var(--color-neutral-300); }
.skill-card-drag-handle :deep(.skill-name-input.el-textarea.is-focus .el-textarea__inner) { background-color: var(--color-white); }
:where(.dark, .dark *) .skill-card-drag-handle :deep(.skill-name-input.el-textarea.is-focus .el-textarea__inner) { background-color: var(--color-neutral-700); }

.skill-item-card :deep(.el-textarea__inner) { font-size: 0.8125rem; line-height: 1.5; padding-top: 4px; padding-bottom: 4px; resize: none; border-radius: var(--el-input-border-radius, var(--radius-base)); }
</style>