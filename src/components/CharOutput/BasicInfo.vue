<template>
  <div class="content-panel-body space-y-4 md:space-y-5 h-full flex flex-col">
    <div class="content-panel-header -mx-4 md:-mx-5 -mt-4 md:-mt-5 mb-5">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon
          icon="ph:info-duotone"
          class="text-xl text-accent-500 dark:text-accent-400"
        />
        基本信息
      </h3>
    </div>

    <div class="flex-grow space-y-4 px-1">
      <el-form-item>
        <template #label><span class="form-label-adv">角色名称</span></template>
        <el-input v-model="localForm.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item>
        <template #label
          ><span class="form-label-adv">头像 (文件名或标识)</span></template
        >
        <el-input
          v-model="localForm.avatar"
          disabled
          placeholder="例如: char_avatar.png 或 none"
        />
      </el-form-item>
      <el-form-item>
        <template #label
          ><span class="form-label-adv">第一条消息</span></template
        >
        <el-input
          type="textarea"
          v-model="localForm.first_mes"
          :autosize="{ minRows: 3, maxRows: 8 }"
          placeholder="请输入第一条消息"
        />
      </el-form-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, defineProps, defineEmits, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import type {
  ICharacterMetadata,
  ICharacterOutputSettings,
} from "@character/types/character.types";

interface BasicInfoFormData {
  /** Corresponds to ICharacterMetadata['name'] */
  name: ICharacterMetadata["name"];
  /** Corresponds to ICharacterMetadata['avatarUrl'], with "none" as a common value */
  avatar: string;
  /** Corresponds to ICharacterOutputSettings['greeting'] */
  first_mes: string;
  data?: { [key: string]: any }; // To carry over other data fields
}
interface Props {
  form: BasicInfoFormData;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:form"]);

const localForm = reactive<Omit<BasicInfoFormData, "data">>({
  name: "",
  avatar: "",
  first_mes: "",
});
let internalUpdateFlag_BasicInfo = false;

watch(
  () => [props.form.name, props.form.avatar, props.form.first_mes],
  ([newName, newAvatar, newFirstMes]) => {
    let changed = false;
    const pName = newName || "";
    const pAvatar = newAvatar || "none";
    const pFirstMes = newFirstMes || "";

    if (pName !== localForm.name) {
      localForm.name = pName;
      changed = true;
    }
    if (pAvatar !== localForm.avatar) {
      localForm.avatar = pAvatar;
      changed = true;
    }
    if (pFirstMes !== localForm.first_mes) {
      localForm.first_mes = pFirstMes;
      changed = true;
    }

    if (changed) {
      // console.log('BasicInfo: Props updated localForm', JSON.parse(JSON.stringify(localForm)));
      internalUpdateFlag_BasicInfo = true;
      nextTick(() => {
        internalUpdateFlag_BasicInfo = false;
      });
    }
  },
  { immediate: true }
);

watch(
  localForm,
  (newVal) => {
    if (internalUpdateFlag_BasicInfo) {
      // console.log('BasicInfo: Emit blocked by internalUpdateFlag');
      return;
    }
    // Compare with props before emitting
    if (
      newVal.name !== (props.form.name || "") ||
      newVal.avatar !== (props.form.avatar || "none") ||
      newVal.first_mes !== (props.form.first_mes || "")
    ) {
      // console.log('BasicInfo: Emitting update:form', JSON.parse(JSON.stringify(newVal)));
      emit("update:form", {
        name: newVal.name,
        avatar: newVal.avatar,
        first_mes: newVal.first_mes,
        // Also sync to data object for consistency with original save structure
        data: {
          ...(props.form.data || {}), // Preserve other data fields
          name: newVal.name,
          first_mes: newVal.first_mes,
          // avatar is not typically in data, but if it was, add it here
        },
      });
    }
  },
  { deep: true }
);
</script>
