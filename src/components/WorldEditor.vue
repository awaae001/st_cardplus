<template>
  <div
    class="landmark-editor p-3 md:p-5 h-full flex flex-col print:p-0 print:bg-white print:text-black"
  >
    <header
      class="flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-6 print:hidden flex-shrink-0 px-1 gap-y-3"
    >
      <h1
        class="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-100"
      >
        地标编辑器
      </h1>
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3"
      >
        <div class="flex items-center gap-2 md:gap-3">
          <el-tooltip
            content="加载地标设定 (Ctrl+O)"
            placement="bottom"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click="loadWorld"
              class="btn-success-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="加载地标设定"
              :disabled="appSettings.safeModeLevel === 'forbidden'"
            >
              <Icon
                icon="ph:folder-open-duotone"
                class="text-lg group-hover:scale-110 transition-transform"
              />
            </button>
          </el-tooltip>
          <el-tooltip
            content="保存地标设定 (Ctrl+S)"
            placement="bottom"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click="saveWorld"
              class="btn-primary-adv !p-2.5 aspect-square group"
              aria-label="保存地标设定"
            >
              <Icon
                icon="ph:floppy-disk-duotone"
                class="text-lg group-hover:scale-110 transition-transform"
              />
            </button>
          </el-tooltip>
          <el-tooltip
            content="重置表单"
            placement="bottom"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click="resetForm"
              class="btn-danger-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="重置表单"
              :disabled="appSettings.safeModeLevel === 'forbidden'"
            >
              <Icon
                icon="ph:arrow-counter-clockwise-duotone"
                class="text-lg group-hover:rotate-[30deg] transition-transform"
              />
            </button>
          </el-tooltip>
        </div>

        <div class="flex items-center gap-2 md:gap-3">
          <el-tooltip
            content="复制JSON到剪贴板 (Ctrl+C)"
            placement="bottom"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click="copyToClipboard"
              class="btn-secondary-adv !p-2.5 aspect-square group"
              aria-label="复制JSON到剪贴板"
            >
              <Icon
                icon="ph:copy-simple-duotone"
                class="text-lg group-hover:scale-110 transition-transform"
              />
            </button>
          </el-tooltip>
          <el-tooltip
            content="从剪贴板导入JSON (Ctrl+V)"
            placement="bottom"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click="showImportDialog"
              class="btn-warning-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="从剪贴板导入JSON"
              :disabled="appSettings.safeModeLevel === 'forbidden'"
            >
              <Icon
                icon="ph:clipboard-text-duotone"
                class="text-lg group-hover:scale-110 transition-transform"
              />
            </button>
          </el-tooltip>
        </div>
      </div>
    </header>

    <el-scrollbar
      class="flex-grow main-content-scrollbar"
      view-class="p-1 print:p-0"
    >
      <div class="space-y-5 md:space-y-8">
        <div
          class="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8 items-stretch"
        >
          <CardContainer
            title="基本信息"
            icon="ph:info-duotone"
            class="lg:col-span-1"
          >
            <div class="space-y-4">
              <el-form :model="form" label-position="top">
                <StyledFormItem label="地标集合名称">
                  <el-input
                    v-model="form.name"
                    placeholder="例如：艾尔登法环地区设定"
                  />
                </StyledFormItem>
                <StyledFormItem label="所属空间/世界">
                  <el-input v-model="form.space" placeholder="例如：交界地" />
                </StyledFormItem>
              </el-form>
            </div>
          </CardContainer>

          <CardContainer
            title="描述与关键词"
            icon="ph:text-aa-duotone"
            class="lg:col-span-2"
          >
            <div class="space-y-4">
              <StyledFormItem label="介绍 (每行一段)">
                <el-input
                  v-model="form.info"
                  type="textarea"
                  :autosize="{ minRows: 5, maxRows: 15 }"
                  placeholder="关于这个地标集合的整体介绍..."
                />
              </StyledFormItem>
              <StyledFormItem label="关键词 (每行一条)">
                <el-input
                  v-model="form.keywords"
                  type="textarea"
                  :autosize="{ minRows: 3, maxRows: 8 }"
                  placeholder="相关的关键词，方便检索或生成..."
                />
              </StyledFormItem>
            </div>
          </CardContainer>
        </div>

        <CardContainer title="地标" icon="ph:map-pin-duotone">
          <template #actions>
            <div class="flex gap-x-3">
              <button
                @click="importLandmarks"
                title="导入地标 (JSON, 将替换现有地标)"
                class="btn-warning-adv text-sm !py-1.5 !px-3 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
              >
                <Icon
                  icon="material-symbols:upload-file-outline-rounded"
                  width="18"
                  height="18"
                  class="mr-1.5 -ml-0.5"
                />
                导入地标
              </button>
              <button
                @click="addLandmark"
                class="btn-primary-adv text-sm !py-1.5 !px-3 whitespace-nowrap"
              >
                <Icon
                  icon="material-symbols:add-circle-outline-rounded"
                  width="18"
                  height="18"
                  class="mr-1.5 -ml-0.5"
                />
                添加地标
              </button>
              <button
                @click="exportLandmarks"
                title="导出地标 (JSON)"
                class="btn-secondary-adv text-sm !py-1.5 !px-3"
              >
                <Icon
                  icon="material-symbols:ios-share-rounded"
                  width="18"
                  height="18"
                />
              </button>
            </div>
          </template>
          <draggable
            v-if="form.landmarks.length > 0"
            v-model="form.landmarks"
            item-key="id"
            animation="200"
            ghost-class="item-ghost"
            chosen-class="item-chosen"
            handle=".item-drag-handle"
            class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5"
          >
            <template #item="{ element: landmark }">
              <div class="item-card-outer-wrapper">
                <div class="item-card">
                  <div class="item-drag-handle">
                    <Icon
                      icon="material-symbols:drag-indicator-rounded"
                      class="text-lg flex-shrink-0"
                    />
                    <el-input
                      v-model="landmark.name"
                      placeholder="地标名称"
                      size="small"
                      class="item-name-input-in-handle flex-grow min-w-0"
                      :autosize="{ minRows: 1, maxRows: 2 }"
                      type="textarea"
                    />
                    <button
                      @click="removeLandmark(landmark.id)"
                      class="btn-danger-adv !p-1 !aspect-square shrink-0 !rounded-full !text-xs ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="删除此地标"
                      :disabled="appSettings.safeModeLevel === 'forbidden'"
                    >
                      <Icon icon="ph:x-bold" />
                    </button>
                  </div>
                  <div class="p-3 space-y-3">
                    <el-input
                      v-model="landmark.description"
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 6 }"
                      placeholder="地标介绍"
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </template>
          </draggable>
          <div v-else class="empty-state-placeholder">
            <Icon icon="ph:map-trifold-duotone" class="empty-state-icon" />
            <p class="empty-state-title">暂无地标</p>
            <p class="empty-state-description">点击“添加地标”开始创建。</p>
          </div>
        </CardContainer>

        <CardContainer title="势力" icon="ph:shield-checkered-duotone">
          <template #actions>
            <div class="flex gap-x-3">
              <button
                @click="importForces"
                title="导入势力 (JSON, 将替换现有势力)"
                class="btn-warning-adv text-sm !py-1.5 !px-3 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
              >
                <Icon
                  icon="material-symbols:upload-file-outline-rounded"
                  width="18"
                  height="18"
                  class="mr-1.5 -ml-0.5"
                />
                导入势力
              </button>
              <button
                @click="addForce"
                class="btn-primary-adv text-sm !py-1.5 !px-3 whitespace-nowrap"
              >
                <Icon
                  icon="material-symbols:add-circle-outline-rounded"
                  width="18"
                  height="18"
                  class="mr-1.5 -ml-0.5"
                />
                添加势力
              </button>
              <button
                @click="exportForces"
                title="导出势力 (JSON)"
                class="btn-secondary-adv text-sm !py-1.5 !px-3"
              >
                <Icon
                  icon="material-symbols:ios-share-rounded"
                  width="18"
                  height="18"
                />
              </button>
            </div>
          </template>
          <draggable
            v-if="form.forces.length > 0"
            v-model="form.forces"
            item-key="id"
            animation="200"
            ghost-class="item-ghost"
            chosen-class="item-chosen"
            handle=".item-drag-handle"
            class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5"
          >
            <template #item="{ element: force }">
              <div class="item-card-outer-wrapper">
                <div class="item-card">
                  <div class="item-drag-handle">
                    <Icon
                      icon="material-symbols:drag-indicator-rounded"
                      class="text-lg flex-shrink-0"
                    />
                    <el-input
                      v-model="force.name"
                      placeholder="势力名称"
                      size="small"
                      class="item-name-input-in-handle flex-grow min-w-0"
                      :autosize="{ minRows: 1, maxRows: 2 }"
                      type="textarea"
                    />
                    <button
                      @click="removeForce(force.id)"
                      class="btn-danger-adv !p-1 !aspect-square shrink-0 !rounded-full !text-xs ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="删除此势力"
                      :disabled="appSettings.safeModeLevel === 'forbidden'"
                    >
                      <Icon icon="ph:x-bold" />
                    </button>
                  </div>
                  <div class="p-3 space-y-3">
                    <el-input
                      v-model="force.members"
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 5 }"
                      placeholder="成员 (每行一个)"
                      size="small"
                    />
                    <el-input
                      v-model="force.description"
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 5 }"
                      placeholder="势力描述"
                      size="small"
                    />
                  </div>
                </div>
              </div>
            </template>
          </draggable>
          <div v-else class="empty-state-placeholder">
            <Icon icon="ph:users-three-duotone" class="empty-state-icon" />
            <p class="empty-state-title">暂无势力</p>
            <p class="empty-state-description">点击“添加势力”开始创建。</p>
          </div>
        </CardContainer>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import draggable from "vuedraggable";
import {
  ElMessage,
  ElMessageBox,
  ElScrollbar,
  ElTooltip,
  ElForm,
  ElFormItem,
  ElInput,
} from "element-plus";
import PanelSection from "@core/components/ui/PanelSection.vue"; // Will be removed if not used
import CardContainer from "@core/components/ui/CardContainer.vue";
import { saveAs } from "file-saver";
import { Icon } from "@iconify/vue";
import { nanoid } from "nanoid";
import { useAppSettingsStore } from "@core/store/appSettings.store";
import {
  saveToLocalStorage as saveToLS,
  loadFromLocalStorage as loadFromLS,
  clearLocalStorage as clearLS,
  initAutoSave,
  clearAutoSave,
} from "@core/utils/localStorage.utils";
import { performSafeAction } from "@core/utils/safeAction.utils";
// import PanelSection from "@core/components/ui/PanelSection.vue"; // PanelSection is replaced by CardContainer
import type {
  ILandmark,
  IForce,
  IWorldEditorForm,
} from "../modules/world/types/world.types";

const LOCAL_STORAGE_KEY = "worldEditorData_v2";
const appSettings = useAppSettingsStore();

const createDefaultWorldForm = (): IWorldEditorForm => ({
  name: "",
  space: "",
  keywords: "",
  info: "",
  landmarks: [],
  forces: [],
});

const form = ref<IWorldEditorForm>(createDefaultWorldForm());
let autoSaveTimer: number | null = null;

const textToArray = (text: string | undefined): string[] =>
  text
    ? text
        .split("\n")
        .map((s) => s.trim())
        .filter((line) => line !== "")
    : [];
const arrayToText = (arr: string[] | undefined): string =>
  arr && Array.isArray(arr) ? arr.join("\n") : "";

const processLoadedData = (parsedData: any): IWorldEditorForm => {
  const defaults = createDefaultWorldForm();
  if (typeof parsedData !== "object" || parsedData === null) {
    ElMessage.error("加载的数据格式无效，已使用默认值。");
    return defaults;
  }
  return {
    name: parsedData.name || defaults.name,
    space: parsedData.space || defaults.space,
    keywords: Array.isArray(parsedData.keywords)
      ? arrayToText(parsedData.keywords)
      : parsedData.keywords || defaults.keywords,
    info: Array.isArray(parsedData.info)
      ? arrayToText(parsedData.info)
      : parsedData.info || defaults.info,
    landmarks: Array.isArray(parsedData.landmarks)
      ? parsedData.landmarks
          .map((l: any) => ({
            id: l.id || nanoid(),
            name: l.name || "",
            description: l.description || "",
          }))
          .filter(Boolean)
      : defaults.landmarks,
    forces: Array.isArray(parsedData.forces)
      ? parsedData.forces
          .map((f: any) => ({
            id: f.id || nanoid(),
            name: f.name || "",
            members: Array.isArray(f.members)
              ? arrayToText(f.members)
              : f.members || "",
            description: f.description || "",
          }))
          .filter(Boolean)
      : defaults.forces,
  };
};

const getDataForStorage = (): object => {
  return {
    ...form.value,
    keywords: textToArray(form.value.keywords),
    info: textToArray(form.value.info),
    forces: form.value.forces.map((force) => ({
      ...force,
      members: textToArray(force.members),
    })),
  };
};

onMounted(() => {
  const loadedData = loadFromLS(LOCAL_STORAGE_KEY);
  if (loadedData) {
    form.value = processLoadedData(loadedData);
  }
  if (appSettings.isAutoSaveEnabled) {
    autoSaveTimer = initAutoSave(
      () => saveToLS(getDataForStorage(), LOCAL_STORAGE_KEY),
      () => !!form.value.name
    );
  }
});

onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearAutoSave(autoSaveTimer);
  }
});

watch(
  () => appSettings.isAutoSaveEnabled,
  (newValue) => {
    if (newValue) {
      if (!autoSaveTimer) {
        autoSaveTimer = initAutoSave(
          () => saveToLS(getDataForStorage(), LOCAL_STORAGE_KEY),
          () => !!form.value.name
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

const addLandmark = () => {
  form.value.landmarks.push({
    id: nanoid(),
    name: `新地标 ${form.value.landmarks.length + 1}`,
    description: "",
  });
};

const removeLandmark = async (id: string) => {
  const index = form.value.landmarks.findIndex((l) => l.id === id);
  if (index === -1) return;
  const landmarkName =
    form.value.landmarks[index].name || `地标 (ID: ${id.substring(0, 4)})`;
  await performSafeAction(
    appSettings.safeModeLevel,
    "移除地标",
    landmarkName,
    () => {
      const currentIndex = form.value.landmarks.findIndex((l) => l.id === id);
      if (currentIndex !== -1) {
        form.value.landmarks.splice(currentIndex, 1);
      } else {
        throw new Error("地标未找到，可能已被移除。");
      }
    }
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("移除地标操作未成功完成:", err);
  });
};

const addForce = () => {
  form.value.forces.push({
    id: nanoid(),
    name: `新势力 ${form.value.forces.length + 1}`,
    members: "",
    description: "",
  });
};

const removeForce = async (id: string) => {
  const index = form.value.forces.findIndex((f) => f.id === id);
  if (index === -1) return;
  const forceName =
    form.value.forces[index].name || `势力 (ID: ${id.substring(0, 4)})`;
  await performSafeAction(
    appSettings.safeModeLevel,
    "移除势力",
    forceName,
    () => {
      const currentIndex = form.value.forces.findIndex((f) => f.id === id);
      if (currentIndex !== -1) {
        form.value.forces.splice(currentIndex, 1);
      } else {
        throw new Error("势力未找到，可能已被移除。");
      }
    }
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("移除势力操作未成功完成:", err);
  });
};

const exportListAsJson = async (
  list: ILandmark[] | IForce[],
  listName: string
) => {
  if (!list || list.length === 0) {
    ElMessage.warning(`没有可导出的${listName}`);
    return;
  }
  try {
    let dataToExport = list;
    if (listName === "势力") {
      dataToExport = (list as IForce[]).map((f) => ({
        ...f,
        members: textToArray(f.members),
      }));
    }
    await navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2));
    ElMessage.success(`${listName}已复制到剪贴板！`);
  } catch (error) {
    ElMessage.error(`导出${listName}失败`);
  }
};

const exportLandmarks = () => exportListAsJson(form.value.landmarks, "地标");
const exportForces = () => exportListAsJson(form.value.forces, "势力");

const importListFromFile = async <T extends { id: string; name: string; description: string }>(
  listName: string,
  _unused: T[],
  itemProcessor: (item: any) => T,
  updateTargetArray: (newArray: T[]) => void
) => {
  await performSafeAction(
    appSettings.safeModeLevel,
    `导入${listName}`,
    `此操作将替换当前所有${listName}`,
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
            if (!Array.isArray(parsedData)) {
              throw new Error("无效的文件格式，需要包含一个JSON数组。");
            }

            const processedItems = parsedData
              .map(itemProcessor)
              .filter(Boolean) as T[];
            updateTargetArray(processedItems); // Use callback to update

            saveToLS(getDataForStorage(), LOCAL_STORAGE_KEY);
            resolve();
          } catch (error) {
            console.error(`Import ${listName} error:`, error);
            reject(error);
          }
        };
        input.addEventListener("cancel", () => reject("cancel"));
        input.click();
      });
    }
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn(`导入${listName}操作未成功完成:`, err);
  });
};

const importLandmarks = () => {
  importListFromFile<ILandmark>(
    "地标",
    form.value.landmarks,
    (item: any) => ({
      id: item.id || nanoid(),
      name: item.name || "",
      description: item.description || "",
    }),
    (newArray) => {
      form.value.landmarks = newArray;
    }
  );
};

const importForces = () => {
  importListFromFile<IForce>(
    "势力",
    form.value.forces,
    (item: any) => ({
      id: item.id || nanoid(),
      name: item.name || "",
      members: Array.isArray(item.members)
        ? arrayToText(item.members)
        : item.members || "",
      description: item.description || "",
    }),
    (newArray) => {
      form.value.forces = newArray;
    }
  );
};

const showImportDialog = async () => {
  if (appSettings.safeModeLevel === "forbidden") {
    ElMessageBox.alert("当前处于禁止模式，无法从剪贴板导入。", "操作禁止", {
      confirmButtonText: "知道了",
      type: "warning",
      customClass: "app-dialog",
    });
    return;
  }

  try {
    const { value } = await ElMessageBox.prompt(
      "粘贴JSON数据以导入整个地标设定",
      "导入数据",
      {
        confirmButtonText: "导入",
        cancelButtonText: "取消",
        inputType: "textarea",
        inputPlaceholder: "粘贴JSON数据...",
        customClass: "app-dialog import-dialog",
        inputValidator: (val) => {
          if (!val) return "请输入数据";
          try {
            JSON.parse(val);
            return true;
          } catch (e) {
            return "无效的JSON格式";
          }
        },
      }
    );

    await performSafeAction(
      appSettings.safeModeLevel,
      "从剪贴板导入",
      "此操作将覆盖当前所有地标设定",
      () => {
        const parsedData = JSON.parse(value);
        form.value = processLoadedData(parsedData);
        saveToLS(getDataForStorage(), LOCAL_STORAGE_KEY);
      }
    );
  } catch (error) {
    if (error !== "cancel" && error !== "forbidden") {
      console.warn("从剪贴板导入操作未成功完成或被取消:", error);
    }
  }
};

const copyToClipboard = async () => {
  try {
    const baseData = getDataForStorage();
    const dataForClipboard = JSON.parse(JSON.stringify(baseData));

    if (
      dataForClipboard.landmarks &&
      Array.isArray(dataForClipboard.landmarks)
    ) {
      dataForClipboard.landmarks = dataForClipboard.landmarks.map(
        (landmark: any) => {
          const { id, ...rest } = landmark;
          return rest;
        }
      );
    }

    if (dataForClipboard.forces && Array.isArray(dataForClipboard.forces)) {
      dataForClipboard.forces = dataForClipboard.forces.map((force: any) => {
        const { id, ...rest } = force;
        return rest;
      });
    }

    const jsonData = JSON.stringify(dataForClipboard, null, 2);
    await navigator.clipboard.writeText(jsonData);
    ElMessage.success("数据已复制到剪贴板 (地标/势力无ID)");
  } catch (error) {
    ElMessage.error("复制失败");
    console.error("Error copying to clipboard:", error);
  }
};

const saveWorld = async () => {
  try {
    const jsonData = JSON.stringify(getDataForStorage(), null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const filename = `${(form.value.name || "world_settings").replace(
      /[<>:"/\\|?*]+/g,
      "_"
    )}_${Date.now()}.json`;
    saveAs(blob, filename);
    ElMessage.success("地标设定保存成功！");
    saveToLS(getDataForStorage(), LOCAL_STORAGE_KEY);
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

const loadWorld = async () => {
  await performSafeAction(
    appSettings.safeModeLevel,
    "加载地标设定",
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
            if (!content.trim()) throw new Error("文件内容为空。");
            const parsedData = JSON.parse(content);
            form.value = processLoadedData(parsedData);
            saveToLS(getDataForStorage(), LOCAL_STORAGE_KEY);
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
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("加载地标设定操作未成功完成:", err);
  });
};

const resetForm = async () => {
  await performSafeAction(
    appSettings.safeModeLevel,
    "重置表单",
    "将清除已输入内容和本地存储",
    () => {
      clearLS(LOCAL_STORAGE_KEY);
      form.value = createDefaultWorldForm();
    }
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("重置表单操作未成功完成:", err);
  });
};

defineExpose({
  saveWorld,
  loadWorld,
  resetForm,
});
</script>

<style scoped>
.item-card {
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-width: 1px;
  border-color: var(--color-neutral-200);
  display: flex;
  flex-direction: column;
  position: relative;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  overflow: hidden;
}
.dark .item-card {
  background-color: var(--color-neutral-850);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  border-color: var(--color-neutral-750);
}
.item-card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
.dark .item-card:hover {
  border-color: var(--color-neutral-600);
}

.item-drag-handle {
  background-color: var(--color-neutral-100);
  padding: 0.375rem 0.75rem;
  cursor: move;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-neutral-600);
  border-bottom-width: 1px;
  border-color: var(--color-neutral-200);
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.dark .item-drag-handle {
  background-color: oklch(from var(--color-neutral-700) l c h / 0.5);
  color: var(--color-neutral-300);
  border-color: var(--color-neutral-700);
}
.item-drag-handle:hover {
  background-color: var(--color-neutral-200);
}
.dark .item-drag-handle:hover {
  background-color: var(--color-neutral-700);
}

.item-drag-handle
  :deep(.item-name-input-in-handle.el-textarea .el-textarea__inner) {
  background-color: transparent;
  border: none;
  box-shadow: none;
  padding: 2px 4px;
  font-weight: 500;
  line-height: 1.4;
  font-size: 0.875rem;
  color: var(--color-neutral-700);
  resize: none;
  text-align: left;
  height: auto !important;
  min-height: unset !important;
}
.dark
  .item-drag-handle
  :deep(.item-name-input-in-handle.el-textarea .el-textarea__inner) {
  color: var(--color-neutral-300);
}
.item-drag-handle
  :deep(.item-name-input-in-handle.el-textarea.is-focus .el-textarea__inner) {
  background-color: var(--color-white);
}
.dark
  .item-drag-handle
  :deep(.item-name-input-in-handle.el-textarea.is-focus .el-textarea__inner) {
  background-color: var(--color-neutral-700);
}

.item-ghost {
  opacity: 0.6;
  border-radius: var(--radius-lg);
  background-color: var(--color-sky-100);
  outline-width: 2px;
  outline-style: dashed;
  outline-color: var(--color-sky-400);
  box-shadow: none;
}
.dark .item-ghost {
  background-color: oklch(from var(--color-sky-800) l c h / 0.4);
  outline-color: var(--color-sky-600);
}

.item-chosen .item-card {
  --chosen-ring-width: 2px;
  --chosen-ring-offset-width: 1px;
  --chosen-ring-color-light: var(--color-accent-500);
  --chosen-ring-offset-color-light: var(--color-white);
  --chosen-ring-color-dark: var(--color-accent-400);
  --chosen-ring-offset-color-dark: var(--color-neutral-850);

  box-shadow: 0 0 0 var(--chosen-ring-offset-width)
      var(--chosen-ring-offset-color-light),
    0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width))
      var(--chosen-ring-color-light),
    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  transform: scale(1.02);
  z-index: 10;
}
.dark .item-chosen .item-card {
  box-shadow: 0 0 0 var(--chosen-ring-offset-width)
      var(--chosen-ring-offset-color-dark),
    0 0 0 calc(var(--chosen-ring-offset-width) + var(--chosen-ring-width))
      var(--chosen-ring-color-dark),
    0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3);
}

.empty-state-placeholder {
  margin-top: 1rem;
  text-align: center;
  padding: 2.5rem 1rem;
  border-width: 2px;
  border-style: dashed;
  border-color: oklch(from var(--color-neutral-300) l c h / 0.7);
  border-radius: var(--radius-lg);
  background-color: oklch(from var(--color-neutral-50) l c h / 0.3);
}
.dark .empty-state-placeholder {
  border-color: oklch(from var(--color-neutral-700) l c h / 0.7);
  background-color: oklch(from var(--color-neutral-800) l c h / 0.3);
}

.empty-state-icon {
  font-size: 3rem;
  line-height: 1;
  color: var(--color-neutral-400);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 0.75rem;
}
.dark .empty-state-icon {
  color: var(--color-neutral-600);
}

.empty-state-title {
  color: var(--color-neutral-600);
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
}
.dark .empty-state-title {
  color: var(--color-neutral-400);
}

.empty-state-description {
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--color-neutral-500);
  margin-top: 0.25rem;
}

:global(.el-form-item__label) {
  line-height: normal !important;
  padding-bottom: 0 !important;
}
</style>
