<template>
  <div class="space-y-6"> <!-- Existing root div for spacing between sections -->
    <PanelSection title="喜好与厌恶" icon="ph:heart-duotone">
      <el-form :model="localForm" label-position="top" class="space-y-4">
        <StyledFormItem
          label="喜欢的事物 / 人"
          prop="likes"
          help-text="每行记录一个喜欢的事物、概念或具体的人。"
        >
          <el-input
            v-model="localForm.likes"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 10 }"
            placeholder="请输入喜欢的事物或人，每行一条"
          />
        </StyledFormItem>

        <StyledFormItem
          label="厌恶的事物 / 人"
          prop="dislikes"
          help-text="每行记录一个厌恶的事物、概念或具体的人。"
        >
          <el-input
            v-model="localForm.dislikes"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 10 }"
            placeholder="请输入厌恶的事物或人，每行一条"
          />
        </StyledFormItem>
      </el-form>
    </PanelSection>

    <PanelSection title="日常作息" icon="ph:clock-countdown-duotone">
      <el-form
        :model="localForm.dailyRoutine"
        label-position="top"
        class="space-y-1"
      >
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4"
        >
          <StyledFormItem label="清晨 (Early Morning)" prop="dailyRoutine.earlyMorning">
            <el-input
              v-model="localForm.dailyRoutine.earlyMorning"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="例如：日出前冥想，晨跑"
            />
          </StyledFormItem>
          <StyledFormItem label="上午 (Morning)" prop="dailyRoutine.morning">
            <el-input
              v-model="localForm.dailyRoutine.morning"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="例如：处理工作/学习，阅读"
            />
          </StyledFormItem>
          <StyledFormItem label="下午 (Afternoon)" prop="dailyRoutine.afternoon">
            <el-input
              v-model="localForm.dailyRoutine.afternoon"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="例如：午休，进行爱好活动"
            />
          </StyledFormItem>
          <StyledFormItem label="傍晚 (Evening)" prop="dailyRoutine.evening">
            <el-input
              v-model="localForm.dailyRoutine.evening"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="例如：准备晚餐，与家人/朋友相处"
            />
          </StyledFormItem>
          <StyledFormItem label="夜间 (Night)" prop="dailyRoutine.night">
            <el-input
              v-model="localForm.dailyRoutine.night"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="例如：放松，看电影/书，睡前准备"
            />
          </StyledFormItem>
          <StyledFormItem label="深夜 (Late Night)" prop="dailyRoutine.lateNight">
            <el-input
              v-model="localForm.dailyRoutine.lateNight"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              placeholder="例如：深度睡眠，或进行特殊活动"
            />
          </StyledFormItem>
        </div>
      </el-form>
    </PanelSection>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";
import { ElInput, ElForm } from "element-plus"; // ElFormItem removed
// Icon removed as PanelSection handles its icon

import PanelSection from "@core/components/ui/PanelSection.vue";
import StyledFormItem from "@core/components/forms/StyledFormItem.vue";
import type {
  IEditorCharacterCard,
  IEditorDailyRoutine,
} from "@character/types/character.types";

type LocalLikesDislikesRoutineForm = Pick<
  IEditorCharacterCard,
  "likes" | "dislikes" | "dailyRoutine"
>;

const props = defineProps<{
  form: IEditorCharacterCard; // Parent passes the whole character card form
}>();

const emit = defineEmits(["update:form"]);

const getLocalFormFromProps = (
  formProps: IEditorCharacterCard
): LocalLikesDislikesRoutineForm => ({
  likes: formProps.likes,
  dislikes: formProps.dislikes,
  dailyRoutine: { ...(formProps.dailyRoutine || {} as IEditorDailyRoutine) }, // Ensure dailyRoutine is an object
});

const localForm = ref<LocalLikesDislikesRoutineForm>(
  getLocalFormFromProps(props.form)
);

watch(
  () => props.form,
  (newVal) => {
    const newLocalData = getLocalFormFromProps(newVal);
    if (JSON.stringify(newLocalData) !== JSON.stringify(localForm.value)) {
      localForm.value = newLocalData;
    }
  },
  { deep: true }
);

watch(
  localForm,
  (newVal) => {
    // Construct an object with only the fields this component manages for comparison
    const relevantPropsForm = {
      likes: props.form.likes,
      dislikes: props.form.dislikes,
      dailyRoutine: props.form.dailyRoutine,
    };
    if (JSON.stringify(newVal) !== JSON.stringify(relevantPropsForm)) {
      // Emit only the fields this component is responsible for
      emit("update:form", {
        likes: newVal.likes,
        dislikes: newVal.dislikes,
        dailyRoutine: { ...newVal.dailyRoutine },
      });
    }
  },
  { deep: true }
);
</script>

<style scoped>
/* Removed specific styles, relying on PanelSection and StyledFormItem */
:deep(.el-textarea__inner) {
  font-size: 0.875rem;
  line-height: 1.6;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  resize: none;
  border-radius: var(--el-input-border-radius, var(--radius-base));
}
</style>
