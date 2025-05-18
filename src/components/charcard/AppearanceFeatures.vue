<template>
  <CardContainer title="外貌特征" icon="ph:person-duotone">
    <InfoAlert message="当输入框留空时，该位置不会被导出，即：“不用全部填写”。" />

    <el-form
      :model="localForm.appearance"
      :label-width="labelWidth"
      label-position="top"
      class="space-y-1 mt-4"
    >
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-4"
      >
        <StyledFormItem label="身高">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.height"
            placeholder="例如：测量值 175cm"
          />
        </StyledFormItem>
        <StyledFormItem label="发色">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.hairColor"
            placeholder="例如：深棕色，接近Pantone 19-1118 TPX"
          />
        </StyledFormItem>
        <StyledFormItem label="发型">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.hairstyle"
            placeholder="例如：自然垂顺，长度至肩胛骨下缘"
          />
        </StyledFormItem>
        <StyledFormItem label="眼睛">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.eyes"
            placeholder="例如：虹膜呈浅褐色，瞳孔对光反射正常"
          />
        </StyledFormItem>
        <StyledFormItem label="鼻子">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.nose"
            placeholder="例如：鼻梁直，鼻翼对称，无明显偏曲"
          />
        </StyledFormItem>
        <StyledFormItem label="嘴唇">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.lips"
            placeholder="例如：唇红缘清晰，厚度适中"
          />
        </StyledFormItem>
        <StyledFormItem label="皮肤">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.skin"
            placeholder="例如：Fitzpatrick皮肤分型II型，无明显瘢痕或色素沉着"
          />
        </StyledFormItem>
        <StyledFormItem label="身材">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.body"
            placeholder="例如：体型匀称，肌肉组织发育良好"
          />
        </StyledFormItem>
        <StyledFormItem label="胸部">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.breasts"
            placeholder="例如：乳腺组织发育对称，Tanner分期V期"
          />
        </StyledFormItem>
        <StyledFormItem label="生殖器">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.genitals"
            placeholder="例如：外生殖器发育正常，符合生理性别特征"
          />
        </StyledFormItem>
        <StyledFormItem label="肛门">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.anus"
            placeholder="例如：肛周皮肤完整，无异常赘生物"
          />
        </StyledFormItem>
        <StyledFormItem label="阴毛">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.pubes"
            placeholder="例如：耻骨联合区毛发分布呈倒三角形"
          />
        </StyledFormItem>
        <StyledFormItem label="胸围">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.bust"
            placeholder="例如：经乳头点水平周长90cm"
          />
        </StyledFormItem>
        <StyledFormItem label="腰围">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.waist"
            placeholder="例如：脐水平周长60cm"
          />
        </StyledFormItem>
        <StyledFormItem label="臀围">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.hips"
            placeholder="例如：臀部最突出点水平周长90cm"
          />
        </StyledFormItem>
        <StyledFormItem label="大腿">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.thighs"
            placeholder="例如：股四头肌轮廓清晰，无萎缩"
          />
        </StyledFormItem>
        <StyledFormItem label="屁股">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.butt"
            placeholder="例如：臀大肌饱满，形态圆隆"
          />
        </StyledFormItem>
        <StyledFormItem label="足部">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.feet"
            placeholder="例如：双足对称，足弓形态正常，无畸形"
          />
        </StyledFormItem>

        <StyledFormItem
          v-for="(field, index) in customFields"
          :key="field.label + '-' + index"
          :label="field.label"
          class="col-span-1"
        >
          <div class="flex items-center gap-2">
            <el-input
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              v-model="field.value"
              :placeholder="`请输入 ${field.label} 特征`"
              class="flex-grow"
            />
            <TooltipIconButton
              tooltip-content="移除此字段"
              icon="ph:trash-simple-duotone"
              :label-text="`移除字段 ${field.label}`"
              button-class="btn-danger-adv !p-1.5 !aspect-square shrink-0"
              icon-class="text-base"
              :disabled="appSettings.safeModeLevel === 'forbidden'"
              @click.prevent="requestRemoveCustomField(index)"
            />
          </div>
        </StyledFormItem>
      </div>
    </el-form>

    <div class="mt-6">
      <el-button
        @click="addCustomField"
        class="btn-secondary-adv !py-1.5 !px-3 text-xs"
      >
        <Icon icon="ph:plus-circle-duotone" class="mr-1.5 text-base" />
        添加自定义外貌字段
      </el-button>
    </div>
  </CardContainer>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  defineProps,
  defineEmits,
  computed,
} from "vue";
import {
  ElInput,
  ElForm,
  ElMessageBox,
  ElMessage,
  ElButton, // Added ElButton
} from "element-plus";
import { Icon } from "@iconify/vue";
import { useAppSettingsStore } from "@core/store/appSettings.store";
import { performSafeAction } from "@core/utils/safeAction.utils";

import CardContainer from "@core/components/ui/CardContainer.vue";
import StyledFormItem from "@core/components/forms/StyledFormItem.vue";
import InfoAlert from "@core/components/ui/InfoAlert.vue";
import TooltipIconButton from "@core/components/ui/TooltipIconButton.vue";
import type {
  IEditorCharacterCard,
  IEditorAppearance,
} from "@character/types/character.types";

interface CustomField {
  label: string;
  value: string;
}

// The prop 'form' will be the entire character card, but this component only manages the 'appearance' part.
const props = defineProps<{ form: IEditorCharacterCard }>();
const emit = defineEmits(["update:form", "remove-custom-field"]);
const appSettings = useAppSettingsStore();

const defaultAppearance: IEditorAppearance = {
  height: "",
  hairColor: "",
  hairstyle: "",
>>>>>>> REPLACE
<<<<<<< SEARCH
:start_line:279
-------
const localForm = ref<AppearanceForm>({
  appearance: {
    ...defaultAppearance,
    ...(props.form.appearance || {}),
  },
});

const customFields = ref<CustomField[]>([]);
=======
const localForm = ref<{ appearance: IEditorAppearance }>({
  appearance: {
    ...defaultAppearance,
    ...(props.form.appearance || {}), // Initialize with appearance from IEditorCharacterCard
  },
});

const customFields = ref<CustomField[]>([]);
>>>>>>> REPLACE
<<<<<<< SEARCH
:start_line:304
-------
  appearanceData: AppearanceForm["appearance"] | undefined
) => {
  const newCustomFields: CustomField[] = [];
=======
  appearanceData: IEditorAppearance | undefined
) => {
  const newCustomFields: CustomField[] = [];
  eyes: "",
  nose: "",
  lips: "",
  skin: "",
  body: "",
  bust: "",
  waist: "",
  hips: "",
  breasts: "",
  genitals: "",
  anus: "",
  pubes: "",
  thighs: "",
  butt: "",
  feet: "",
};

const localForm = ref<AppearanceForm>({
  appearance: {
    ...defaultAppearance,
    ...(props.form.appearance || {}),
  },
});

const customFields = ref<CustomField[]>([]);
const screenWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 769
);

const labelWidth = computed(() => (screenWidth.value > 768 ? "0px" : "auto"));

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

const STANDARD_APPEARANCE_KEYS = new Set([
  "height", "hairColor", "hairstyle", "eyes", "nose", "lips", "skin",
  "body", "bust", "waist", "hips", "breasts", "genitals", "anus",
  "pubes", "thighs", "butt", "feet",
]);

const initializeCustomFields = (
  appearanceData: AppearanceForm["appearance"] | undefined
) => {
  const newCustomFields: CustomField[] = [];
  if (appearanceData) {
    for (const key in appearanceData) {
      if (
        Object.prototype.hasOwnProperty.call(appearanceData, key) &&
        !STANDARD_APPEARANCE_KEYS.has(key)
      ) {
        newCustomFields.push({ label: key, value: appearanceData[key] });
      }
    }
  }
  customFields.value = newCustomFields;
};

watch(
  () => props.form.appearance,
  (newAppearance) => {
    const currentLocalAppearanceJson = JSON.stringify(
      localForm.value.appearance || {}
    );
    const newAppearanceJson = JSON.stringify(newAppearance || {});

    if (newAppearanceJson !== currentLocalAppearanceJson) {
      localForm.value.appearance = {
        ...defaultAppearance,
        ...(newAppearance || {}),
      };
    }
    initializeCustomFields(newAppearance);
  },
  { deep: true, immediate: true }
);

watch(
  () => localForm.value.appearance,
  (newVal, oldVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      const standardFieldsUpdate: Record<string, string> = {};
      for (const key in newVal) {
        if (
          STANDARD_APPEARANCE_KEYS.has(key) ||
          !customFields.value.find((cf) => cf.label === key)
        ) {
          standardFieldsUpdate[key] = newVal[key];
        }
      }
      customFields.value.forEach((cf) => {
        standardFieldsUpdate[cf.label] = cf.value;
      });

      const propsAppearanceJson = JSON.stringify(props.form.appearance || {});
      const effectiveLocalAppearanceJson = JSON.stringify(standardFieldsUpdate);

      if (effectiveLocalAppearanceJson !== propsAppearanceJson) {
        emit("update:form", { appearance: { ...standardFieldsUpdate } });
      }
    }
  },
  { deep: true }
);

watch(
  customFields,
  (newCustomFields) => {
    let changed = false;
    const newLocalAppearance = { ...localForm.value.appearance };

    newCustomFields.forEach((field) => {
      if (newLocalAppearance[field.label] !== field.value) {
        newLocalAppearance[field.label] = field.value;
        changed = true;
      }
    });

    const newCustomLabels = new Set(newCustomFields.map((f) => f.label));
    for (const key in newLocalAppearance) {
      if (!STANDARD_APPEARANCE_KEYS.has(key) && !newCustomLabels.has(key)) {
        delete newLocalAppearance[key];
        changed = true;
      }
    }

    if (changed) {
      if (
        JSON.stringify(localForm.value.appearance) !==
        JSON.stringify(newLocalAppearance)
      ) {
        localForm.value.appearance = newLocalAppearance;
        // The watch on localForm.value.appearance will handle emitting the update
      }
    }
  },
  { deep: true }
);

// Removed the direct watch on localForm for emitting, as the combined watch on
// localForm.value.appearance should cover updates from both standard and custom fields.

const addCustomField = async () => {
  try {
    const { value: inputText } = await ElMessageBox.prompt(
      '<b>请输入自定义字段，每行一个</b><br>格式："字段名:字段描述"<br>例如：<br>体表:左肩胛区可见一约2cm陈旧性线状瘢痕<br>牙齿:上颌右侧第一前磨牙缺失',
      "添加自定义外貌字段",
      {
        confirmButtonText: "确认添加",
        cancelButtonText: "取消",
        inputType: "textarea",
        inputPlaceholder: "字段名1:描述1\n字段名2:描述2",
        customClass: "app-dialog break-all",
        inputValidator: (value) => {
          if (!value) return true;
          const lines = value.split("\n").filter((line) => line.trim());
          for (const line of lines) {
            if (
              !line.includes(":") ||
              line.split(":").length < 2 ||
              !line.split(":")[0].trim()
            ) {
              return `格式错误: "${line}"。每行必须是“字段名:描述”，且字段名不能为空。`;
            }
          }
          return true;
        },
        dangerouslyUseHTMLString: true,
      }
    );

    if (inputText) {
      const lines = inputText.split("\n").filter((line) => line.trim());
      let addedCount = 0;
      const newFieldsToAdd: CustomField[] = [];

      for (const line of lines) {
        const [fieldName, ...fieldValueParts] = line.split(":");
        const trimmedName = fieldName.trim();
        const fieldValue = fieldValueParts.join(":").trim();

        if (!trimmedName) continue;

        if (
          STANDARD_APPEARANCE_KEYS.has(trimmedName) ||
          customFields.value.some((field) => field.label === trimmedName)
        ) {
          ElMessageBox.alert(
            `字段 "${trimmedName}" 是预设字段或已存在，将跳过。`,
            "提示",
            { confirmButtonText: "好的", customClass: "app-dialog" }
          );
          continue;
        }
        newFieldsToAdd.push({ label: trimmedName, value: fieldValue });
        addedCount++;
      }
      if (newFieldsToAdd.length > 0) {
        customFields.value.push(...newFieldsToAdd);
      }
      if (addedCount > 0) {
        ElMessage.success(`成功添加 ${addedCount} 个自定义字段。`);
      }
    }
  } catch (e: unknown) { // Updated to unknown
    if (typeof e === 'string' && e.toLowerCase() === 'cancel') {
        ElMessage.info("已取消添加");
    } else if (e instanceof Error && e.message.toLowerCase().includes('cancel')) {
        ElMessage.info("已取消添加");
    } else if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message: string }).message === 'string' && (e as { message: string }).message.toLowerCase().includes('cancel')) {
        ElMessage.info("已取消添加");
    } else if (e) {
        console.error("添加自定义字段时出错:", e);
        ElMessage.error(`添加自定义字段操作失败: ${e instanceof Error ? e.message : String(e)}`);
    }
    // If not a cancel, the error is re-thrown by performSafeAction or handled here if not wrapped
  }
};

const requestRemoveCustomField = async (index: number) => {
  const fieldToRemove = customFields.value[index];
  if (!fieldToRemove) return;
  const fieldLabel = fieldToRemove.label;

  try {
    await performSafeAction(
      appSettings.safeModeLevel,
      "移除自定义字段",
      fieldLabel,
      () => {
        // The actual removal is handled by the parent component via the emitted event.
        // The parent component will then update the `form.appearance` prop,
        // which in turn will trigger the `watch` on `props.form.appearance`
        // and `initializeCustomFields` to update `customFields.value`.
        // This also means the `performSafeAction` might show "success" before
        // the UI fully reflects the change if the parent handles the emit asynchronously.
        // Alternatively, we could directly manipulate customFields.value here IF
        // performSafeAction confirms the action.
        // For now, we rely on the event emission.
        emit("remove-custom-field", fieldLabel);
      }
    );
    // No need for ElMessage.success here, as performSafeAction handles it if actionFn doesn't throw.
  } catch (err: unknown) {
    // performSafeAction's internal handleError already shows messages for 'cancel' or other errors.
    // We only log if it's an unexpected error not handled as 'cancel' or 'forbidden' by performSafeAction.
    if (err !== 'cancel' && err !== 'forbidden') {
      console.warn("移除自定义字段操作未成功完成或被取消:", err);
    }
  }
};

onMounted(() => {
  window.addEventListener("resize", updateScreenWidth);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScreenWidth);
});
</script>

<style scoped>
.el-form-item :deep(.el-textarea__inner) {
  font-size: 0.8125rem; /* 13px */
  line-height: 1.5;
  padding-top: 4px;
  padding-bottom: 4px;
  resize: none;
  border-radius: var(--el-input-border-radius, var(--radius-base));
}
</style>
