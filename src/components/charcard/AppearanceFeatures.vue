<template>
  <div class="content-panel-body space-y-5">
    <div class="content-panel-header -mx-5 md:-mx-6 -mt-5 md:-mt-6 mb-6">
      <h3 class="content-panel-title flex items-center gap-2">
        <Icon
          icon="ph:person-duotone"
          class="text-xl text-accent-500 dark:text-accent-400"
        />
        外貌特征
      </h3>
    </div>

    <div
      class="flex items-center gap-2 p-3 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs mb-4"
    >
      <Icon icon="ph:info-duotone" class="text-lg shrink-0" />
      <span>当输入框留空时，该位置不会被导出，即："不用全部填写"。</span>
    </div>

    <el-form
      :model="localForm.appearance"
      :label-width="labelWidth"
      label-position="top"
      class="space-y-1"
    >
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-4"
      >
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">身高</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.height"
            placeholder="例如：测量值 175cm"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">发色</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.hairColor"
            placeholder="例如：深棕色，接近Pantone 19-1118 TPX"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">发型</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.hairstyle"
            placeholder="例如：自然垂顺，长度至肩胛骨下缘"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">眼睛</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.eyes"
            placeholder="例如：虹膜呈浅褐色，瞳孔对光反射正常"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">鼻子</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.nose"
            placeholder="例如：鼻梁直，鼻翼对称，无明显偏曲"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">嘴唇</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.lips"
            placeholder="例如：唇红缘清晰，厚度适中"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">皮肤</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.skin"
            placeholder="例如：Fitzpatrick皮肤分型II型，无明显瘢痕或色素沉着"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">身材</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.body"
            placeholder="例如：体型匀称，肌肉组织发育良好"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">胸部</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.breasts"
            placeholder="例如：乳腺组织发育对称，Tanner分期V期"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">生殖器</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.genitals"
            placeholder="例如：外生殖器发育正常，符合生理性别特征"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">肛门</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.anus"
            placeholder="例如：肛周皮肤完整，无异常赘生物"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">阴毛</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.pubes"
            placeholder="例如：耻骨联合区毛发分布呈倒三角形"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">胸围</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.bust"
            placeholder="例如：经乳头点水平周长90cm"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">腰围</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.waist"
            placeholder="例如：脐水平周长60cm"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">臀围</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.hips"
            placeholder="例如：臀部最突出点水平周长90cm"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">大腿</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.thighs"
            placeholder="例如：股四头肌轮廓清晰，无萎缩"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">屁股</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.butt"
            placeholder="例如：臀大肌饱满，形态圆隆"
          ></el-input>
        </el-form-item>
        <el-form-item class="mb-0">
          <template #label><span class="form-label-adv">足部</span></template>
          <el-input
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            v-model="localForm.appearance.feet"
            placeholder="例如：双足对称，足弓形态正常，无畸形"
          ></el-input>
        </el-form-item>

        <el-form-item
          v-for="(field, index) in customFields"
          :key="field.label + '-' + index"
          class="mb-0 col-span-1"
        >
          <template #label
            ><span class="form-label-adv">{{ field.label }}</span></template
          >
          <div class="flex items-center gap-2">
            <el-input
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 5 }"
              v-model="field.value"
              :placeholder="`请输入 ${field.label} 特征`"
              class="flex-grow"
            ></el-input>
            <button
              @click.prevent="requestRemoveCustomField(index)"
              :disabled="appSettings.safeModeLevel === 'forbidden'"
              :class="{
                'opacity-50 cursor-not-allowed':
                  appSettings.safeModeLevel === 'forbidden',
              }"
              class="btn-danger-adv !p-1.5 !aspect-square shrink-0"
              aria-label="移除此字段"
            >
              <Icon icon="ph:trash-simple-duotone" class="text-base" />
            </button>
          </div>
        </el-form-item>
      </div>
    </el-form>

    <div class="mt-4">
      <button
        @click="addCustomField"
        class="btn-secondary-adv !py-1.5 !px-3 text-xs"
      >
        <Icon icon="ph:plus-circle-duotone" class="mr-1.5 text-base" />
        添加自定义外貌字段
      </button>
    </div>
  </div>
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
  ElFormItem,
  ElForm,
  ElMessageBox,
  ElMessage,
} from "element-plus";
import { Icon } from "@iconify/vue";
import { useAppSettingsStore } from "../../stores/appSettings";

interface CustomField {
  label: string;
  value: string;
}

interface AppearanceForm {
  appearance: {
    height: string;
    hairColor: string;
    hairstyle: string;
    eyes: string;
    nose: string;
    lips: string;
    skin: string;
    body: string;
    bust: string;
    waist: string;
    hips: string;
    breasts: string;
    genitals: string;
    anus: string;
    pubes: string;
    thighs: string;
    butt: string;
    feet: string;
    [key: string]: string;
  };
}

const props = defineProps<{ form: AppearanceForm }>();
const emit = defineEmits(["update:form", "remove-custom-field"]);
const appSettings = useAppSettingsStore();

const defaultAppearance: AppearanceForm["appearance"] = {
  height: "",
  hairColor: "",
  hairstyle: "",
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
  "height",
  "hairColor",
  "hairstyle",
  "eyes",
  "nose",
  "lips",
  "skin",
  "body",
  "bust",
  "waist",
  "hips",
  "breasts",
  "genitals",
  "anus",
  "pubes",
  "thighs",
  "butt",
  "feet",
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
      }
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
  } catch (e: any) {
    if (
      e === "cancel" ||
      (typeof e === "object" &&
        "message" in e &&
        e.message.includes("cancel")) ||
      (e instanceof Error && e.message === "cancel")
    ) {
      ElMessage.info("已取消添加");
    } else if (e) {
      console.error("添加自定义字段时出错:", e);
      ElMessage.error("添加自定义字段操作失败。");
    }
  }
};

const requestRemoveCustomField = async (index: number) => {
  const fieldToRemove = customFields.value[index];
  if (!fieldToRemove) return;

  const fieldLabel = fieldToRemove.label;

  if (appSettings.safeModeLevel === "forbidden") {
    ElMessage.warning({
      message: "当前处于禁止删除模式，无法移除字段。",
      duration: 2000,
    });
    return;
  }

  if (appSettings.safeModeLevel === "double") {
    try {
      await ElMessageBox.confirm(
        `确定要移除自定义字段 "${fieldLabel}" 吗？`,
        "确认删除",
        {
          confirmButtonText: "确定移除",
          cancelButtonText: "取消",
          type: "warning",
          draggable: true,
          customClass: "app-dialog",
        }
      );
      emit("remove-custom-field", fieldLabel);
    } catch (e: any) {
      if (
        e === "cancel" ||
        (typeof e === "object" &&
          "message" in e &&
          e.message.includes("cancel")) ||
        (e instanceof Error && e.message === "cancel")
      ) {
        ElMessage.info("已取消移除操作。");
      } else if (e) {
        console.error("请求移除自定义字段时出错 (double mode):", e);
        ElMessage.error("移除操作失败。");
      }
    }
  } else if (appSettings.safeModeLevel === "single") {
    try {
      emit("remove-custom-field", fieldLabel);
    } catch (e) {
      console.error("请求移除自定义字段时出错 (single mode):", e);
      ElMessage.error("请求移除字段失败。");
    }
  } else {
    console.warn(
      `Unhandled safeModeLevel: ${appSettings.safeModeLevel}. Requesting removal directly.`
    );
    emit("remove-custom-field", fieldLabel);
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
  font-size: 0.8125rem;
  line-height: 1.5;
  padding-top: 4px;
  padding-bottom: 4px;
  resize: none;
  border-radius: var(--el-input-border-radius, var(--radius-base));
}
</style>
