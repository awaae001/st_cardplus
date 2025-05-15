<template>
  <div class="content-panel-body space-y-4 md:space-y-5 h-full flex flex-col">
    <div class="content-panel-header -mx-4 md:-mx-5 -mt-4 md:-mt-5 mb-5">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon
          icon="ph:tag-duotone"
          class="text-xl text-accent-500 dark:text-accent-400"
        />
        标签设置
      </h3>
      <!-- 如果有对此模块的操作按钮，可以放在这里 -->
    </div>

    <div class="flex-grow px-1">
      <el-form-item class="w-full">
        <template #label>
          <span class="form-label-adv">标签 (按 Enter 创建新标签)</span>
        </template>
        <el-input-tag
          v-model="localTags"
          placeholder="输入标签后按 Enter"
          class="w-full custom-input-tag"
          :trigger="'Enter'"
          :max="20"
          :tag-type="'primary'"
          :tag-effect="'light'"
          draggable
          clearable
          save-on-blur
        />
      </el-form-item>
      <p class="form-help-text mt-1.5 px-1">
        可拖拽标签进行排序。最多可添加 20 个标签。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick } from "vue";
import { Icon } from "@iconify/vue";

interface TagSettingsFormData {
  tags: string[];
  data?: {
    tags?: string[];
    [key: string]: any;
  };
}

interface Props {
  form: TagSettingsFormData;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:form"]);

const localTags = ref<string[]>([]); // 确保初始值是数组
let internalUpdateFlag_Tags = false;

watch(
  () => props.form.tags,
  (newValFromProp) => {
    const currentPropVal = Array.isArray(newValFromProp) ? newValFromProp : []; // 确保是数组
    if (JSON.stringify(currentPropVal) !== JSON.stringify(localTags.value)) {
      // console.log('TagSettings: Props updated tags. Updating local to:', [...currentPropVal]);
      internalUpdateFlag_Tags = true;
      localTags.value = [...currentPropVal];
      nextTick(() => {
        internalUpdateFlag_Tags = false;
      });
    }
  },
  { deep: true, immediate: true }
);

watch(
  localTags,
  (newLocalValParam) => {
    // 重命名参数以示区分
    if (internalUpdateFlag_Tags) {
      // console.log('TagSettings: Emit blocked for prop-driven update.');
      return;
    }

    // 确保 newLocalVal 是一个数组，即使 el-input-tag 可能在清空时将其设为 null
    const newLocalVal = Array.isArray(newLocalValParam) ? newLocalValParam : []; // **** CRITICAL FIX ****

    const currentPropVal = Array.isArray(props.form.tags)
      ? props.form.tags
      : []; // 确保 props.form.tags 也是数组

    if (JSON.stringify(newLocalVal) !== JSON.stringify(currentPropVal)) {
      // console.log('TagSettings: Local tags changed. Emitting:', [...newLocalVal]);
      emit("update:form", {
        tags: [...newLocalVal], // newLocalVal 现在保证是数组
        data: {
          ...(props.form.data || {}),
          tags: [...newLocalVal], // newLocalVal 现在保证是数组
        },
      });
    }
  },
  { deep: true }
);
</script>
