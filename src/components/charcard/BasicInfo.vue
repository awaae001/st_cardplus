<template>
  <CardContainer title="基础信息" icon="ph:identification-card-duotone">
    <el-form :model="localForm" label-position="top" class="space-y-1">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <StyledFormItem label="中文名" :required="true" prop="chineseName">
          <el-input
            v-model="localForm.chineseName"
            placeholder="角色的中文名称"
            clearable
          />
        </StyledFormItem>

        <StyledFormItem label="日文名 (可选)" prop="japaneseName">
          <el-input
            v-model="localForm.japaneseName"
            placeholder="角色的日文名称"
            clearable
          />
        </StyledFormItem>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 items-start">
        <StyledFormItem label="性别" prop="gender">
          <el-select
            v-model="localForm.gender"
            placeholder="请选择性别"
            class="w-full"
          >
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="秀吉（伪娘、正太）" value="秀吉（伪娘、正太）" />
            <el-option label="武装直升机" value="helicopter" />
            <el-option label="永雏塔菲" value="tiffany" />
            <el-option label="赛马娘" value="horse" />
            <el-option label="沃尔玛购物袋" value="walmartShopingBag" />
            <el-option label="其他(自定义)" value="other" />
            <el-option label="无" value="none" />
          </el-select>
        </StyledFormItem>

        <StyledFormItem
          v-if="localForm.gender === 'other'"
          label="自定义性别"
          prop="customGender"
          class="sm:mt-[33px]"
          :show-required-asterisk="false"
        >
          <template #label>
            <span class="form-label-adv sm:opacity-0 sm:pointer-events-none"
              >自定义性别</span
            >
          </template>
          <el-input
            v-model="localForm.customGender"
            placeholder="输入自定义性别"
          />
        </StyledFormItem>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <StyledFormItem label="年龄" prop="age" help-text="请输入整数。">
          <el-input-number
            v-model="localForm.age"
            controls-position="right"
            :min="-Infinity"
            :max="Infinity"
            :precision="0"
            class="w-full"
            placeholder="角色年龄"
          />
        </StyledFormItem>

        <StyledFormItem
          label="MBTI 性格 (可选)"
          prop="mbti"
          v-if="'mbti' in localForm && localForm.mbti !== undefined"
        >
          <el-input
            v-model="localForm.mbti"
            placeholder="例如：INFJ, ENTP"
            clearable
          />
        </StyledFormItem>
      </div>

      <StyledFormItem label="身份/称呼" prop="identity" help-text="可以使用 {{user}} (用户) 和 {{char}} (角色自身) 占位符。">
        <el-input
          v-model="localForm.identity"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 6 }"
          placeholder="角色的主要身份、职业或他人对TA的称呼。例如：学生, 老师, {{user}}。一行一条。"
        />
      </StyledFormItem>
    </el-form>
  </CardContainer>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";
import {
  ElInput,
  ElSelect,
  ElOption,
  ElInputNumber,
  ElForm,
  // ElFormItem, // No longer directly used in template
} from "element-plus";
// import { Icon } from "@iconify/vue"; // Icon is now handled by CardContainer

import CardContainer from "@core/components/ui/CardContainer.vue";
import StyledFormItem from "@core/components/forms/StyledFormItem.vue";
import type { IEditorCharacterCard } from "@character/types/character.types";

type LocalBasicInfoForm = Pick<
  IEditorCharacterCard,
  | "chineseName"
  | "japaneseName"
  | "gender"
  | "customGender"
  | "age"
  | "identity"
  | "mbti"
>;

const props = defineProps<{
  form: IEditorCharacterCard; // Parent passes the whole character card form
}>();

const emit = defineEmits(["update:form"]);

// Initialize localForm with only the relevant fields from the prop
const getLocalFormFromProps = (
  formProps: IEditorCharacterCard
): LocalBasicInfoForm => ({
  chineseName: formProps.chineseName,
  japaneseName: formProps.japaneseName,
  gender: formProps.gender,
  customGender: formProps.customGender,
  age: formProps.age,
  identity: formProps.identity,
  mbti: formProps.mbti,
});

const localForm = ref<LocalBasicInfoForm>(getLocalFormFromProps(props.form));

watch(
  () => props.form,
  (newVal) => {
    const newLocalData = getLocalFormFromProps(newVal);
    // Compare only the relevant subset of data
    if (JSON.stringify(newLocalData) !== JSON.stringify(localForm.value)) {
      localForm.value = newLocalData;
    }
  },
  { deep: true }
);

watch(
  localForm,
  (newVal) => {
    emit("update:form", { ...newVal });
  },
  { deep: true }
);
</script>
