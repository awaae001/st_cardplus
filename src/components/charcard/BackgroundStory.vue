<template>
  <CardContainer title="背景与性格" icon="ph:scroll-duotone">
    <el-form :model="localForm" label-position="top" class="space-y-5">
      <StyledFormItem label="背景故事" prop="background">
        <el-input
          v-model="localForm.background"
          type="textarea"
          :autosize="{ minRows: 8, maxRows: 15 }"
          placeholder="请输入角色的背景故事、世界观设定等（建议每行一个段落或关键信息）"
          class="flex-grow custom-textarea"
          :input-style="{ resize: 'none', height: '100%' }"
        />
      </StyledFormItem>

      <div> <!-- Wrapper for MBTI section -->
        <StyledFormItem prop="mbti" help-text="必须是有效的MBTI数值 (4个字母，如 INFJ) 或者是 'none'">
          <template #label>
            <div class="flex justify-between items-center w-full mb-1">
              <h4 class="text-base font-medium text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
                <Icon icon="ph:brain-duotone" class="text-lg text-sky-500 dark:text-sky-400" />
                MBTI 性格
                <span class="text-xs text-neutral-400 dark:text-neutral-500">(可选)</span>
              </h4>
              <el-button
                @click="validateMBTI"
                size="small"
                class="px-3 py-1 text-xs font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out bg-sky-600 hover:bg-sky-700 border border-sky-600 hover:border-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:border-sky-500 dark:hover:border-sky-400 dark:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
              >
                <Icon icon="material-symbols:question-exchange-rounded" width="16" height="16" class="mr-1" />
                验证
              </el-button>
            </div>
          </template>
          <el-input
            v-model="localForm.mbti"
            placeholder="请输入MBTI性格，例如：INFJ 或 none"
            clearable
          />
        </StyledFormItem>
      </div>
    </el-form>
  </CardContainer>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";
import { ElMessageBox, ElInput, ElButton, ElForm } from "element-plus"; // ElForm added
import { Icon } from "@iconify/vue";

import CardContainer from "@core/components/ui/CardContainer.vue";
import StyledFormItem from "@core/components/forms/StyledFormItem.vue";
import type { IEditorCharacterCard } from "@character/types/character.types";

type LocalBackgroundStoryForm = Pick<
  IEditorCharacterCard,
  "background" | "mbti"
>;

// This interface can be moved to a constants file or a dedicated MBTI utility if used elsewhere.
// For now, keeping it local as it's specific to the validation logic here.
interface MBTIDescriptions {
  [key: string]: string;
}

const props = defineProps<{
  form: IEditorCharacterCard; // Parent passes the whole character card form
}>();

const emit = defineEmits(["update:form"]);

const getLocalFormFromProps = (
  formProps: IEditorCharacterCard
): LocalBackgroundStoryForm => ({
  background: formProps.background,
  mbti: formProps.mbti,
});

const localForm = ref<LocalBackgroundStoryForm>(
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
    // Emit only the fields this component is responsible for
    emit("update:form", {
      background: newVal.background,
      mbti: newVal.mbti,
    });
  },
  { deep: true }
);

const isValidMBTI = (mbti: string): boolean => {
  if (!mbti) return false;
  const trimmedMbti = mbti.trim();
  return (
    trimmedMbti.toLowerCase() === "none" ||
    /^[EI][SN][TF][JP]$/i.test(trimmedMbti)
  );
};

const mbtiDescriptions: MBTIDescriptions = {
  INTP: "逻辑学家 (Architect)",
  INTJ: "战略家 (Mastermind)",
  ENTP: "辩论家 (Innovator)",
  ENTJ: "指挥官 (Commander)",
  INFP: "调停者 (Mediator)",
  INFJ: "提倡者 (Advocate)",
  ENFJ: "主人公 (Protagonist)",
  ENFP: "追梦人 (Campaigner)",
  ISTJ: "物流师 (Logistician)",
  ISFJ: "守卫者 (Defender)",
  ESTJ: "总经理 (Executive)",
  ESFJ: "执政官 (Consul)",
  ISTP: "鉴赏家 (Virtuoso)",
  ISFP: "探险家 (Adventurer)",
  ESTP: "企业家 (Dynamo)",
  ESFP: "表演者 (Entertainer)",
  NONE: "未指定或不适用",
};

const validateMBTI = () => {
  const currentMbti = localForm.value.mbti ? localForm.value.mbti.trim() : "";
  if (!currentMbti) {
    ElMessageBox.alert(
      '请输入MBTI类型进行验证，或输入 "none" 表示不指定。',
      "提示",
      { confirmButtonText: "好的", customClass: "app-dialog" }
    );
    return;
  }
  const type = currentMbti.toUpperCase();
  if (isValidMBTI(currentMbti)) {
    const descriptionKey = type === "NONE" ? "NONE" : type;
    const description =
      mbtiDescriptions[descriptionKey] || "此特定组合无官方描述，但格式正确。";
    ElMessageBox.alert(
      `MBTI格式有效！\n类型：${type}\n描述：${description}`,
      "验证成功",
      {
        confirmButtonText: "太棒了",
        type: "success",
        customClass: "app-dialog",
      }
    );
  } else {
    ElMessageBox.alert(
      `MBTI格式无效：“${currentMbti}”。\n\n请输入由 E/I, S/N, T/F, J/P (不区分大小写) 组成的4个字母，或输入 "none"。`,
      "验证失败",
      {
        confirmButtonText: "我知道了",
        type: "error",
        customClass: "app-dialog",
      }
    );
  }
};
</script>

<style scoped>
@reference "../../style.css";
/* Styles for .custom-textarea can be kept if still needed, or adapted */
.custom-textarea :deep(.el-textarea__inner) {
  height: 100% !important;
  /* Consider if this min-height is still appropriate or can be handled by :autosize */
  min-height: calc(theme("spacing.8") * 2 + theme("lineHeight.normal") * 8);
}
</style>
