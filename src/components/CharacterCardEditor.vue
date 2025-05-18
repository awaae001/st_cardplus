<template>
  <div
    class="character-card-editor p-3 md:p-5 h-full flex flex-col print:p-0 print:bg-white print:text-black"
  >
    <header
      class="flex justify-between items-center mb-4 md:mb-6 print:hidden flex-shrink-0 px-1"
    >
      <h1
        class="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-100"
      >
        角色卡编辑器
      </h1>
      <CharacterCardButtons
        @saveCharacterCard="saveCharacterCard"
        @loadCharacterCard="loadCharacterCard"
        @resetForm="resetForm"
        @copyToClipboard="copyToClipboard"
        @importFromClipboard="importFromClipboard"
        :safe-mode-level="appSettings.safeModeLevel"
        class="flex flex-wrap items-center gap-2 md:gap-3"
      ></CharacterCardButtons>
    </header>

    <el-scrollbar
      class="flex-grow"
      :class="scrollbarClass"
      view-class="p-1 print:p-0"
    >
      <div class="space-y-5 md:space-y-8">
        <div
          class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-stretch"
        >
          <CardContainer>
            <BasicInfo
              :form="form"
              @update:form="handleFormUpdate"
              class="flex flex-col h-full"
            ></BasicInfo>
          </CardContainer>
          <CardContainer>
            <BackgroundStory
              :form="form"
              @update:form="handleFormUpdate"
              class="flex flex-col h-full"
            ></BackgroundStory>
          </CardContainer>
        </div>

        <CardContainer>
          <AppearanceFeatures
            :form="form"
            @update:form="handleFormUpdate"
            @remove-custom-field="handleRemoveCustomField"
            class="flex flex-col h-full"
          ></AppearanceFeatures>
        </CardContainer>

        <CardContainer>
          <AttireSettings
            :form="form"
            :addAttire="addAttire"
            :removeAttire="removeAttireById"
            :exportAttires="exportAttires"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          ></AttireSettings>
        </CardContainer>

        <CardContainer>
          <PersonalityTraits
            :form="form"
            :addTrait="addTrait"
            :removeTrait="removeTraitById"
            :exportTraits="exportTraits"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          ></PersonalityTraits>
        </CardContainer>

        <CardContainer>
          <Relationships
            :form="form"
            :addRelationship="addRelationship"
            :removeRelationship="removeRelationshipById"
            :exportRelationships="exportRelationships"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          ></Relationships>
        </CardContainer>

        <CardContainer>
          <SkillsEditor
            :form="form"
            :addSkill="addSkill"
            :removeSkill="removeSkillById"
            :exportSkills="exportSkills"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          ></SkillsEditor>
        </CardContainer>

        <CardContainer>
          <LikesDislikesRoutine
            :form="form"
            @update:form="handleFormUpdate"
            class="flex flex-col h-full"
          ></LikesDislikesRoutine>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { ElMessage, ElScrollbar } from "element-plus";
import { saveAs } from "file-saver";
import { nanoid } from "nanoid";
import { useAppSettingsStore } from "@core/store/appSettings.store";
import { performSafeAction } from "@core/utils/safeAction.utils";
import CardContainer from "@core/components/ui/CardContainer.vue";

import CharacterCardButtons from "./charcard/CharacterCardButtons.vue";
import BasicInfo from "./charcard/BasicInfo.vue";
import BackgroundStory from "./charcard/BackgroundStory.vue";
import AppearanceFeatures from "./charcard/AppearanceFeatures.vue";
import AttireSettings from "./charcard/AttireSettings.vue";
import PersonalityTraits from "./charcard/PersonalityTraits.vue";
import Relationships from "./charcard/Relationships.vue";
import LikesDislikesRoutine from "./charcard/LikesDislikesRoutine.vue";
import SkillsEditor from "./charcard/SkillsEditor.vue";

import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  initAutoSave,
  clearAutoSave,
} from "@core/utils/localStorage.utils";
import type {
  IEditorCharacterCard,
  IEditorAppearance,
  IEditorAttire,
  IEditorTrait,
  IEditorRelationship,
  IEditorDailyRoutine,
  IEditorSkill,
} from "@character/types/character.types";

const appSettings = useAppSettingsStore();

const createDefaultCharacterCard = (): IEditorCharacterCard => ({
  chineseName: "",
  japaneseName: "",
  gender: "",
  customGender: "",
  age: 0,
  identity: "",
  background: "",
  appearance: {
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
  } as IEditorAppearance,
  attires: [] as IEditorAttire[],
  mbti: "",
  traits: [] as IEditorTrait[],
  relationships: [] as IEditorRelationship[],
  likes: "",
  dislikes: "",
  dailyRoutine: {
    earlyMorning: "",
    morning: "",
    afternoon: "",
    evening: "",
    night: "",
    lateNight: "",
  } as IEditorDailyRoutine,
  skills: [] as IEditorSkill[],
});

const form = ref<IEditorCharacterCard>(createDefaultCharacterCard());
let autoSaveTimer: number | null = null;

const scrollbarClass = computed(() => ["main-content-scrollbar"]);

onMounted(() => {
  const loadedData = loadFromLocalStorage(
    "characterCardData",
    processLoadedData
  );
  if (loadedData) {
    form.value = loadedData;
  }
  if (appSettings.isAutoSaveEnabled) {
    autoSaveTimer = initAutoSave(
      () => saveToLocalStorage(form.value),
      () => !!(form.value.chineseName || form.value.name)
    );
  }
});

onBeforeUnmount(() => {
  if (autoSaveTimer) clearAutoSave(autoSaveTimer);
});

watch(
  () => appSettings.isAutoSaveEnabled,
  (newValue) => {
    if (newValue) {
      if (!autoSaveTimer) {
        autoSaveTimer = initAutoSave(
          () => saveToLocalStorage(form.value),
          () => !!(form.value.chineseName || form.value.name)
        );
        ElMessage.info("自动保存已开启");
      }
    } else {
      if (autoSaveTimer) {
        clearAutoSave(autoSaveTimer);
        autoSaveTimer = null;
        ElMessage.info("自动保存已关闭");
      }
    }
  }
);

const handleFormUpdate = (updatedPart: Partial<IEditorCharacterCard>) => {
  form.value = { ...form.value, ...updatedPart };
};

const ensureArrayExists = <K extends keyof IEditorCharacterCard>(arrayKey: K) => {
  if (!(form.value[arrayKey] && Array.isArray(form.value[arrayKey]))) {
    (form.value[arrayKey] as any) = [];
  }
};

const addTrait = (): void => {
  ensureArrayExists("traits");
  const newTrait = {
    id: nanoid(),
    name: `新特质 ${form.value.traits.length + 1}`,
    description: "",
    dialogueExamples: [""],
    behaviorExamples: [""],
  };
  form.value.traits.push(newTrait);
};
const removeTraitById = async (traitId: string): Promise<void> => {
  ensureArrayExists("traits");
  const index = form.value.traits.findIndex((t) => t.id === traitId);
  if (index === -1) return;
  const traitName = form.value.traits[index].name || "该特质";
  await performSafeAction(
    appSettings.safeModeLevel,
    "移除特质",
    traitName,
    () => {
      const currentIndex = form.value.traits.findIndex((t) => t.id === traitId);
      if (currentIndex !== -1) {
        form.value.traits.splice(currentIndex, 1);
      }
    }
  ).catch((err: unknown) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("移除特质操作未成功完成:", err);
  });
};

const addSkill = (): void => {
  ensureArrayExists("skills");
  const newSkill = {
    id: nanoid(),
    name: `新技能 ${form.value.skills.length + 1}`,
    description: "",
    dialogExample: "",
    behaviorExample: "",
  };
  form.value.skills.push(newSkill);
};
const removeSkillById = async (skillId: string): Promise<void> => {
  ensureArrayExists("skills");
  const index = form.value.skills.findIndex((s) => s.id === skillId);
  if (index === -1) return;
  const skillName = form.value.skills[index].name || "该技能";
  await performSafeAction(
    appSettings.safeModeLevel,
    "移除技能",
    skillName,
    () => {
      const currentIndex = form.value.skills.findIndex((s) => s.id === skillId);
      if (currentIndex !== -1) {
        form.value.skills.splice(currentIndex, 1);
      }
    }
  ).catch((err: unknown) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("移除技能操作未成功完成:", err);
  });
};

const addRelationship = (): void => {
  ensureArrayExists("relationships");
  const newRelationship = {
    id: nanoid(),
    name: `新关系对象 ${form.value.relationships.length + 1}`,
    description: "",
    features: "",
    dialogueExamples: [""],
  };
  form.value.relationships.push(newRelationship);
};
const removeRelationshipById = async (
  relationshipId: string
): Promise<void> => {
  ensureArrayExists("relationships");
  const index = form.value.relationships.findIndex(
    (r) => r.id === relationshipId
  );
  if (index === -1) return;
  const relationshipName = form.value.relationships[index].name || "该关系";
  await performSafeAction(
    appSettings.safeModeLevel,
    "移除关系",
    relationshipName,
    () => {
      const currentIndex = form.value.relationships.findIndex(
        (r) => r.id === relationshipId
      );
      if (currentIndex !== -1) {
        form.value.relationships.splice(currentIndex, 1);
      }
    }
  ).catch((err: unknown) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("移除关系操作未成功完成:", err);
  });
};

const addAttire = (): void => {
  ensureArrayExists("attires");
  const newAttire = {
    id: nanoid(),
    name: `新套装 ${form.value.attires.length + 1}`,
    description: "",
    tops: "",
    bottoms: "",
    shoes: "",
    socks: "",
    underwears: "",
    accessories: "",
  };
  form.value.attires.push(newAttire);
};
const removeAttireById = async (attireId: string): Promise<void> => {
  ensureArrayExists("attires");
  const index = form.value.attires.findIndex((a) => a.id === attireId);
  if (index === -1) return;
  const attireName = form.value.attires[index].name || "该套装";
  await performSafeAction(
    appSettings.safeModeLevel,
    "移除套装",
    attireName,
    () => {
      const currentIndex = form.value.attires.findIndex(
        (a) => a.id === attireId
      );
      if (currentIndex !== -1) {
        form.value.attires.splice(currentIndex, 1);
      }
    }
  ).catch((err: unknown) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("移除套装操作未成功完成:", err);
  });
};

const handleRemoveCustomField = async (fieldLabel: string) => {
  await performSafeAction(
    appSettings.safeModeLevel,
    "移除自定义外观字段",
    fieldLabel,
    () => {
      if (
        form.value.appearance &&
        Object.prototype.hasOwnProperty.call(form.value.appearance, fieldLabel)
      ) {
        delete form.value.appearance[fieldLabel];
      } else {
        console.warn(
          `Attempted to remove non-existent custom field via safe action: ${fieldLabel}`
        );
        throw new Error("字段未找到。");
      }
    }
  ).catch((err: unknown) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("移除自定义字段操作未成功完成:", err);
  });
};

const processTextToArray = (text: string | undefined): string[] =>
  text ? text.split("\n").filter((line) => line.trim() !== "") : [];
const arrayToText = (arr: string[] | undefined): string =>
  arr && Array.isArray(arr) ? arr.join("\n") : "";
const filterEmptyValues = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    const filteredArray = obj
      .map(filterEmptyValues)
      .filter((item) => item !== null && item !== "");
    return filteredArray.length > 0 ? filteredArray : null;
  }
  if (typeof obj === "object") {
    const filteredObject: any = {};
    let hasValues = false;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (key === "age" && typeof value === "number") {
          filteredObject[key] = value;
          hasValues = true;
          continue;
        }
        const filteredValue = filterEmptyValues(value);
        if (filteredValue !== null && filteredValue !== "") {
          filteredObject[key] = filteredValue;
          hasValues = true;
        }
      }
    }
    return hasValues ? filteredObject : null;
  }
  if (obj === "") return null;
  return obj;
};

const stripIdsFromArray = <T extends { id: string }>(
  arr: T[]
): Omit<T, "id">[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    const { id, ...rest } = item;
    return rest;
  });
};

const getDataForExport = (): any => {
  const dataToSerialize = {
    ...form.value,
    identity: processTextToArray(form.value.identity),
    background: processTextToArray(form.value.background),
    likes: processTextToArray(form.value.likes),
    dislikes: processTextToArray(form.value.dislikes),
    attires: form.value.attires.map((attire) => ({
      ...attire,
      accessories: processTextToArray(attire.accessories),
    })),
  };

  const dataWithStrippedIds = {
    ...dataToSerialize,
    attires: stripIdsFromArray(dataToSerialize.attires),
    traits: stripIdsFromArray(form.value.traits),
    relationships: stripIdsFromArray(form.value.relationships),
    skills: stripIdsFromArray(form.value.skills),
  };
  return filterEmptyValues(dataWithStrippedIds);
};

const saveCharacterCard = async (): Promise<void> => {
  try {
    const dataToSave = getDataForExport();
    if (!dataToSave || Object.keys(dataToSave).length === 0) {
      ElMessage.warning("没有可保存的数据。");
      return;
    }
    const jsonData = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const characterNameForFile = (
      form.value.chineseName ||
      form.value.name ||
      "角色卡"
    ).replace(/[<>:"/\\|?*]+/g, "_");
    const filename = `${characterNameForFile}_${Date.now()}.json`;
    saveAs(blob, filename);
    ElMessage.success({ message: "角色卡已成功保存！", duration: 2000 });
    saveToLocalStorage(form.value);
  } catch (error) {
    ElMessage.error("保存角色卡失败。");
    console.error("保存角色卡时出错:", error);
  }
};

const processLoadedData = (parsedData: any): IEditorCharacterCard => {
  const defaultCard = createDefaultCharacterCard();
  const tempForm: IEditorCharacterCard = { ...defaultCard };

  const assignField = <K extends keyof IEditorCharacterCard>(
    key: K,
    defaultValue: IEditorCharacterCard[K],
    processor?: (val: any) => IEditorCharacterCard[K]
  ) => {
    const valueFromParsed = parsedData[key];
    const valueToProcess =
      valueFromParsed !== undefined ? valueFromParsed : defaultValue;
    if (
      Object.prototype.hasOwnProperty.call(tempForm, key) ||
      key === "appearance"
    ) {
      tempForm[key] = processor ? processor(valueToProcess) : valueToProcess;
    } else if (key === "name" && !tempForm.name && valueToProcess) {
      tempForm.name = String(valueToProcess);
    }
  };

  const processArrayWithId = <TItem extends { id?: string }>(
    parsedArray: any[] | undefined,
    defaultItemStructure: Omit<TItem, "id">,
    itemProcessor?: (item: any) => Partial<Omit<TItem, "id">>
  ): TItem[] => {
    if (!Array.isArray(parsedArray)) return [];
    return parsedArray.map((item: any) => {
      const validItem = item || {};
      const processedItemSpecifics = itemProcessor
        ? itemProcessor(validItem)
        : validItem;
      return {
        ...defaultItemStructure,
        ...processedItemSpecifics,
        id: validItem.id || nanoid(),
      } as TItem;
    });
  };

  assignField("chineseName", defaultCard.chineseName);
  assignField("name", defaultCard.name);
  assignField("japaneseName", defaultCard.japaneseName);
  assignField("gender", defaultCard.gender);
  assignField("customGender", defaultCard.customGender);
  assignField("age", defaultCard.age, (v) => Number(v) || 0);
  assignField("identity", defaultCard.identity, (v) =>
    Array.isArray(v) ? arrayToText(v) : typeof v === "string" ? v : ""
  );
  assignField("background", defaultCard.background, (v) =>
    Array.isArray(v) ? arrayToText(v) : typeof v === "string" ? v : ""
  );
  assignField("mbti", defaultCard.mbti);
  assignField("likes", defaultCard.likes, (v) =>
    Array.isArray(v) ? arrayToText(v) : typeof v === "string" ? v : ""
  );
  assignField("dislikes", defaultCard.dislikes, (v) =>
    Array.isArray(v) ? arrayToText(v) : typeof v === "string" ? v : ""
  );

  tempForm.appearance = {
    ...defaultCard.appearance,
    ...(parsedData.appearance || {}),
  };
  if ((tempForm.appearance as any).thihes && !tempForm.appearance.thighs) {
    tempForm.appearance.thighs = (tempForm.appearance as any).thihes;
    delete (tempForm.appearance as any).thihes;
  }

  tempForm.attires = processArrayWithId<IEditorAttire>(
    parsedData.attires,
    {
      name: "",
      description: "",
      tops: "",
      bottoms: "",
      shoes: "",
      socks: "",
      underwears: "",
      accessories: "",
    },
    (item) => ({
      ...item,
      accessories: Array.isArray(item.accessories)
        ? arrayToText(item.accessories)
        : typeof item.accessories === "string"
        ? item.accessories
        : "",
    })
  );
  tempForm.traits = processArrayWithId<IEditorTrait>(
    parsedData.traits,
    {
      name: "",
      description: "",
      dialogueExamples: [""],
      behaviorExamples: [""],
    },
    (item) => ({
      ...item,
      dialogueExamples: Array.isArray(item.dialogueExamples)
        ? item.dialogueExamples.map(String)
        : [""],
      behaviorExamples: Array.isArray(item.behaviorExamples)
        ? item.behaviorExamples.map(String)
        : [""],
    })
  );
  tempForm.relationships = processArrayWithId<IEditorRelationship>(
    parsedData.relationships,
    { name: "", description: "", features: "", dialogueExamples: [""] },
    (item) => ({
      ...item,
      dialogueExamples: Array.isArray(item.dialogueExamples)
        ? item.dialogueExamples.map(String)
        : [""],
    })
  );
  tempForm.skills = processArrayWithId<IEditorSkill>(parsedData.skills, {
    name: "",
    description: "",
    dialogExample: "",
    behaviorExample: "",
  });

  tempForm.dailyRoutine = {
    ...defaultCard.dailyRoutine,
    ...(parsedData.dailyRoutine || {}),
  } as IEditorDailyRoutine;

  return tempForm;
};

const loadCharacterCard = async (): Promise<void> => {
  await performSafeAction(
    appSettings.safeModeLevel,
    "加载角色卡",
    "此操作将覆盖当前内容",
    async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      await new Promise<void>((resolve, reject) => {
        input.onchange = async (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) {
            reject("cancel");
            return;
          }
          try {
            const content = await file.text();
            if (!content.trim()) {
              throw new Error("文件内容为空。");
            }
            const parsedData = JSON.parse(content);
            if (!parsedData || typeof parsedData !== "object") {
              throw new Error("无效的角色卡文件格式。");
            }
            form.value = processLoadedData(parsedData);
            saveToLocalStorage(form.value);
            resolve();
          } catch (error) {
            console.error("Load error:", error);
            reject(error);
          }
        };
        input.addEventListener("cancel", () => reject("cancel"));
        input.click();
      });
    }
  ).catch((err: unknown) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("加载角色卡操作未成功完成:", err);
  });
};

const resetForm = async (): Promise<void> => {
  await performSafeAction(appSettings.safeModeLevel, "重置表单", "", () => {
    clearLocalStorage("characterCardData");
    form.value = createDefaultCharacterCard();
  }).catch((err: unknown) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("重置表单操作未成功完成:", err);
  });
};

const copyToClipboard = async (): Promise<void> => {
  try {
    const dataToCopy = getDataForExport();
    if (!dataToCopy || Object.keys(dataToCopy).length === 0) {
      ElMessage.warning("没有可复制的数据。");
      return;
    }
    const jsonData = JSON.stringify(dataToCopy, null, 2);
    await navigator.clipboard.writeText(jsonData);
    ElMessage.success({
      message: "角色卡数据已复制到剪贴板 (列表项无ID)！",
      duration: 2000,
    });
  } catch (error) {
    ElMessage.error("复制失败");
    console.error("复制到剪贴板时出错:", error);
  }
};

const importFromClipboard = async (data: string): Promise<void> => {
  if (!data.trim()) {
    ElMessage.warning("剪贴板数据为空。");
    return;
  }
  await performSafeAction(
    appSettings.safeModeLevel,
    "从剪贴板导入",
    "此操作将覆盖当前内容",
    () => {
      try {
        const parsedData = JSON.parse(data);
        if (!parsedData || typeof parsedData !== "object") {
          throw new Error("剪贴板数据不是有效的角色卡JSON格式。");
        }
        form.value = processLoadedData(parsedData);
        saveToLocalStorage(form.value);
      } catch (error) {
        throw new Error(
          `导入处理失败：${error instanceof Error ? error.message : "未知错误"}`
        );
      }
    }
  ).catch((err: unknown) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("从剪贴板导入操作未成功完成:", err);
  });
};

const exportAttires = async (): Promise<void> => {
  ensureArrayExists("attires");
  if (!form.value.attires || form.value.attires.length === 0) {
    ElMessage.warning("没有服装数据可导出。");
    return;
  }
  const attireDataToExport = form.value.attires.map((a) => {
    const { id, ...rest } = a;
    return { ...rest, accessories: processTextToArray(a.accessories) };
  });
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(attireDataToExport, null, 2)
    );
    ElMessage.success("服装数据已复制到剪贴板 (无ID)！");
  } catch (err) {
    ElMessage.error("复制服装数据失败。");
  }
};
const exportSkills = async (): Promise<void> => {
  ensureArrayExists("skills");
  if (!form.value.skills || form.value.skills.length === 0) {
    ElMessage.warning("没有技能数据可导出。");
    return;
  }
  const skillsToExport = stripIdsFromArray(form.value.skills);
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(skillsToExport, null, 2)
    );
    ElMessage.success("技能数据已复制到剪贴板 (无ID)！");
  } catch (err) {
    ElMessage.error("复制技能数据失败。");
  }
};
const exportTraits = async (): Promise<void> => {
  ensureArrayExists("traits");
  if (!form.value.traits || form.value.traits.length === 0) {
    ElMessage.warning("没有特质数据可导出。");
    return;
  }
  const traitsToExport = stripIdsFromArray(form.value.traits);
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(traitsToExport, null, 2)
    );
    ElMessage.success("性格特质数据已复制到剪贴板 (无ID)！");
  } catch (err) {
    ElMessage.error("复制特质数据失败。");
  }
};
const exportRelationships = async (): Promise<void> => {
  ensureArrayExists("relationships");
  if (!form.value.relationships || form.value.relationships.length === 0) {
    ElMessage.warning("没有人际关系数据可导出。");
    return;
  }
  const relationshipsToExport = stripIdsFromArray(form.value.relationships);
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(relationshipsToExport, null, 2)
    );
    ElMessage.success("人际关系数据已复制到剪贴板 (无ID)！");
  } catch (err) {
    ElMessage.error("复制关系数据失败。");
  }
};
</script>
