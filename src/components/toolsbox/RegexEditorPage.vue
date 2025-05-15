<template>
  <div
    class="regex-editor-page p-3 md:p-5 h-full flex flex-col bg-neutral-100 dark:bg-neutral-900"
  >
    <header
      class="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 md:mb-6"
    >
      <h1
        class="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-100"
      >
        正则表达式编辑器
      </h1>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <el-tooltip
          content="保存当前脚本"
          placement="bottom"
          :show-arrow="false"
          :offset="8"
          :hide-after="0"
        >
          <button
            @click="
              (e) => {
                e.preventDefault();
                saveCurrentScript();
              }
            "
            :disabled="!editableScript.id && !editableScript.scriptName.trim()"
            class="btn-primary-adv !p-1.5 sm:!p-2 aspect-square group"
            aria-label="保存当前脚本"
          >
            <Icon
              icon="ph:floppy-disk-duotone"
              class="text-md sm:text-lg group-hover:scale-110 transition-transform"
            />
          </button>
        </el-tooltip>
        <el-tooltip
          content="清空编辑器以新建"
          placement="bottom"
          :show-arrow="false"
          :offset="8"
          :hide-after="0"
        >
          <button
            @click="() => prepareNewScript()"
            class="btn-success-adv !p-1.5 sm:!p-2 aspect-square group"
            aria-label="新建脚本"
          >
            <Icon
              icon="ph:plus-circle-duotone"
              class="text-md sm:text-lg group-hover:scale-110 transition-transform"
            />
          </button>
        </el-tooltip>
      </div>
    </header>

    <div class="md:hidden h-full flex flex-col">
      <el-tabs
        v-model="mobileActiveTab"
        type="border-card"
        class="flex-grow flex flex-col regex-main-tabs-mobile"
      >
        <el-tab-pane name="list" class="flex-grow flex flex-col !p-0">
          <template #label
            ><span class="flex items-center gap-1.5 px-2 py-1"
              ><Icon
                icon="ph:list-bullets-duotone"
                class="text-base shrink-0"
              />脚本列表</span
            ></template
          >
          <ScriptListManager
            v-model:scripts="savedScripts"
            :selectedId="selectedScriptId"
            :checkedScriptIds="checkedScriptIds"
            @load="loadScriptToEdit"
            @delete="deleteScript"
            @update:checkedScriptIds="(val) => (checkedScriptIds = val)"
            @exportAll="exportAllScripts"
            @import="handleImportFromJsonFile"
            @clearAll="clearAllScripts"
            @updateScriptOrder="updateScriptOrder"
          />
        </el-tab-pane>
        <el-tab-pane
          name="editor"
          class="flex-grow flex flex-col !p-0"
          :disabled="
            !selectedScriptId && !editableScript.scriptName && !isCreatingNew
          "
        >
          <template #label
            ><span class="flex items-center gap-1.5 px-2 py-1"
              ><Icon
                icon="ph:note-pencil-duotone"
                class="text-base shrink-0"
              /><span class="truncate max-w-[80px]">{{
                editableScript.scriptName || (isCreatingNew ? "新建" : "编辑")
              }}</span></span
            ></template
          >
          <EditorForm
            v-model:editableScript="editableScript"
            v-model:trimStringsInput="trimStringsInput"
          />
        </el-tab-pane>
        <el-tab-pane name="tester" class="flex-grow flex flex-col !p-0">
          <template #label
            ><span class="flex items-center gap-1.5 px-2 py-1"
              ><Icon
                icon="ph:text-aa-duotone"
                class="text-base shrink-0"
              />测试区</span
            ></template
          >
          <TestRunner
            :currentEditableScript="editableScript"
            :selectedScriptsForTesting="selectedScriptsForTesting"
            :isMobile="true"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-scrollbar class="hidden md:block flex-grow -mx-1" view-class="p-1">
      <div class="flex flex-col gap-4 md:gap-6">
        <div
          class="grid md:grid-cols-[minmax(320px,1.2fr)_minmax(0,1.8fr)] gap-4 md:gap-6 flex-shrink-0"
          style="height: clamp(420px, 50vh, 550px)"
        >
          <div class="col-span-1 flex flex-col content-panel h-full">
            <ScriptListManager
              v-model:scripts="savedScripts"
              :selectedId="selectedScriptId"
              :checkedScriptIds="checkedScriptIds"
              @load="loadScriptToEdit"
              @delete="deleteScript"
              @update:checkedScriptIds="(val) => (checkedScriptIds = val)"
              @exportAll="exportAllScripts"
              @import="handleImportFromJsonFile"
              @clearAll="clearAllScripts"
              @updateScriptOrder="updateScriptOrder"
            />
          </div>
          <div
            class="col-span-1 flex flex-col content-panel h-full overflow-hidden"
          >
            <EditorForm
              v-model:editableScript="editableScript"
              v-model:trimStringsInput="trimStringsInput"
            />
          </div>
        </div>
        <div class="content-panel flex flex-col">
          <TestRunner
            :currentEditableScript="editableScript"
            :selectedScriptsForTesting="selectedScriptsForTesting"
            :isMobile="false"
          />
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  h,
  defineComponent,
} from "vue";
import type { PropType, VNodeChild } from "vue";
import {
  ElInput,
  ElForm,
  ElFormItem,
  ElAlert,
  ElButton,
  ElScrollbar,
  ElMessage,
  ElSelect,
  ElOption,
  ElSwitch,
  ElInputNumber,
  ElTooltip,
  ElEmpty,
  ElUpload,
  ElTabs,
  ElTabPane,
  ElCheckbox as ElCheckboxComp,
  ElDivider,
  ElRadioGroup,
  ElRadioButton,
  ElMenuItem,
} from "element-plus";
import { Icon } from "@iconify/vue";
import { saveAs } from "file-saver";
import { VueDraggableNext as draggable } from "vue-draggable-next";
import MarkdownIt from "markdown-it";
import { useAppSettingsStore } from "../../stores/appSettings";
import { performSafeAction } from "@/utils/safeAction";

interface RegexScript {
  id: string;
  order: number;
  scriptName: string;
  findRegex: string;
  replaceString: string;
  regexFlags: string;
  trimStrings: string[];
  placement: number[];
  disabled: boolean;
  markdownOnly: boolean;
  promptOnly: boolean;
  runOnEdit: boolean;
  substituteRegex: number;
  minDepth: number | null;
  maxDepth: number | null;
}
const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== "string") return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const ScriptListManager = defineComponent({
  props: {
    scripts: { type: Array as PropType<RegexScript[]>, required: true },
    selectedId: { type: String as PropType<string | null>, default: null },
    checkedScriptIds: { type: Array as PropType<string[]>, required: true },
  },
  emits: [
    "load",
    "delete",
    "update:checkedScriptIds",
    "exportAll",
    "import",
    "clearAll",
    "updateScriptOrder",
    "update:scripts",
  ],
  components: { draggable },
  setup(props, { emit }) {
    const appSettings = useAppSettingsStore();
    const editingOrderId = ref<string | null>(null);
    const tempOrder = ref(0);

    watch(
      () => props.scripts,
      (newVal) => {
        console.log(
          "[ScriptListManager] props.scripts received. Length:",
          newVal?.length,
          "Is Array:",
          Array.isArray(newVal)
        );
        if (Array.isArray(newVal) && newVal.length > 0) {
          console.log(
            "[ScriptListManager] First script:",
            JSON.parse(JSON.stringify(newVal[0]))
          );
          newVal.forEach((item, index) => {
            if (
              !item ||
              typeof item.id !== "string" ||
              item.id === "" ||
              typeof item.order !== "number"
            ) {
              console.error(
                `[ScriptListManager] Invalid script at index ${index} in props.scripts:`,
                JSON.parse(JSON.stringify(item))
              );
            }
          });
        }
      },
      { deep: true, immediate: true }
    );

    const handleOrderInput = (scriptId: string, currentOrder: number) => {
      editingOrderId.value = scriptId;
      tempOrder.value = currentOrder;
      nextTick(() => {
        const inputEl = document.getElementById(
          `order-input-${scriptId}`
        ) as HTMLInputElement;
        inputEl?.focus();
        inputEl?.select();
      });
    };
    const submitOrderChange = (scriptId: string) => {
      if (editingOrderId.value === scriptId) {
        emit("updateScriptOrder", scriptId, tempOrder.value);
        editingOrderId.value = null;
      }
    };
    const cancelOrderEdit = () => {
      editingOrderId.value = null;
    };
    const onDragEnd = (event: any) => {
      const { oldIndex, newIndex } = event;
      if (
        oldIndex === undefined ||
        newIndex === undefined ||
        oldIndex === newIndex
      )
        return;

      const currentScripts = [...props.scripts]; // Work with a copy
      const [movedItem] = currentScripts.splice(oldIndex, 1);
      currentScripts.splice(newIndex, 0, movedItem);

      const finalScripts = currentScripts.map((script, index) => ({
        ...script,
        order: index,
      }));
      emit("update:scripts", finalScripts);
    };
    return () => [
      h("div", { class: "content-panel-header" }, [
        h("h2", { class: "content-panel-title flex items-center gap-2" }, [
          h(Icon, {
            icon: "ph:list-bullets-duotone",
            class: "text-xl text-accent-500 dark:text-accent-400",
          }),
          "脚本列表",
        ]),
      ]),
      h(ElScrollbar, { class: "flex-grow" }, () => {
        if (!props.scripts || !props.scripts.length)
          return h(ElEmpty, {
            description: "暂无已保存脚本",
            imageSize: 80,
            class: "p-6 text-center",
          });
        return h(
          draggable as any,
          {
            list: props.scripts,
            itemKey: "id",
            animation: 200,
            ghostClass: "ghost-item",
            class: "entry-menu !border-none !bg-transparent py-1 el-menu",
            tag: "ul",
            onEnd: onDragEnd,
          },
          {
            item: ({ element: script }: { element: RegexScript }) => {
              if (
                !script ||
                typeof script.id !== "string" ||
                script.id.trim() === ""
              ) {
                console.error(
                  "[ScriptListManager Render] Skipping rendering of invalid script:",
                  script
                );
                return null; // Do not render if script or ID is invalid
              }
              return h(
                ElMenuItem,
                {
                  index: script.id,
                  onClick: () => emit("load", script),
                  class:
                    "!h-auto !px-3 !py-2.5 !leading-normal group flex items-center cursor-grab" +
                    (props.selectedId === script.id ? " is-active" : ""),
                },
                () => [
                  h(ElCheckboxComp, {
                    modelValue: props.checkedScriptIds.includes(script.id),
                    "onUpdate:modelValue": (val: string | number | boolean) => {
                      const checked = Boolean(val);
                      const newIds = [...props.checkedScriptIds];
                      if (checked) {
                        if (!newIds.includes(script.id)) newIds.push(script.id);
                      } else {
                        const idx = newIds.indexOf(script.id);
                        if (idx > -1) newIds.splice(idx, 1);
                      }
                      emit("update:checkedScriptIds", newIds);
                    },
                    onClick: (e: Event) => e.stopPropagation(),
                    class: "mr-2 shrink-0",
                  }),
                  h("div", { class: "flex-grow overflow-hidden w-full" }, [
                    h(
                      "div",
                      {
                        class:
                          "text-sm font-medium text-neutral-700 dark:text-neutral-100 group-[.is-active]:text-accent-600 dark:group-[.is-active]:text-white truncate",
                        title: script.scriptName || "未命名脚本",
                      },
                      script.scriptName || "未命名脚本"
                    ),
                    h(
                      "p",
                      {
                        class:
                          "text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate group-[.is-active]:text-accent-500 dark:group-[.is-active]:text-accent-300/90",
                        title: script.findRegex,
                      },
                      script.findRegex || "空模式"
                    ),
                  ]),
                  h(
                    "div",
                    {
                      class:
                        "w-10 text-center text-xs text-neutral-400 dark:text-neutral-500 shrink-0 ml-2 select-none flex items-center justify-center",
                      title: `顺序: ${script.order}`,
                      onDblclick: (e: Event) => {
                        e.stopPropagation();
                        handleOrderInput(script.id, script.order);
                      },
                    },
                    editingOrderId.value === script.id
                      ? h(ElInput, {
                          id: `order-input-${script.id}`,
                          modelValue: tempOrder.value,
                          "onUpdate:modelValue": (val: string | number) =>
                            (tempOrder.value = Number(val)),
                          type: "number",
                          size: "small",
                          class: "!w-10 text-center hide-arrows",
                          onClick: (e: Event) => e.stopPropagation(),
                          onBlur: () => submitOrderChange(script.id),
                          onKeydown: (e: Event | KeyboardEvent) => {
                            if (e instanceof KeyboardEvent) {
                              if (e.key === "Enter")
                                submitOrderChange(script.id);
                              if (e.key === "Escape") cancelOrderEdit();
                              e.stopPropagation();
                            }
                          },
                        })
                      : h(
                          "span",
                          { class: "cursor-text" },
                          `#${script.order ?? "N/A"}`
                        ) // Display N/A if order is missing
                  ),
                  h(
                    ElTooltip,
                    {
                      content: "删除此脚本",
                      placement: "left",
                      showArrow: false,
                      offset: 8,
                      hideAfter: 0,
                    },
                    () =>
                      h(
                        "button",
                        {
                          class:
                            "btn-danger-adv !p-1 !aspect-square group/btn shrink-0 ml-1 opacity-0 group-hover:opacity-100 !shadow-none",
                          ariaLabel: "删除脚本",
                          onClick: (e: Event) => {
                            e.stopPropagation();
                            emit("delete", script.id);
                          },
                        },
                        h(Icon, {
                          icon: "ph:trash-duotone",
                          class:
                            "text-sm group-hover/btn:scale-110 transition-transform",
                        })
                      )
                  ),
                ]
              );
            },
          }
        );
      }),
      h(
        "div",
        { class: "content-panel-header !border-t !border-b-0" },
        h(
          "div",
          {
            class: "flex flex-wrap items-center gap-1.5 sm:gap-2 justify-start",
          },
          [
            h(
              ElTooltip,
              {
                content: "导出所有脚本为JSON",
                placement: "top",
                showArrow: false,
                offset: 8,
                hideAfter: 0,
              },
              () =>
                h(
                  "button",
                  {
                    class:
                      "btn-secondary-adv !p-1.5 sm:!p-2 aspect-square group",
                    disabled: !props.scripts.length,
                    onClick: () => emit("exportAll"),
                  },
                  h(Icon, {
                    icon: "ph:export-duotone",
                    class:
                      "text-md sm:text-lg group-hover:scale-110 transition-transform",
                  })
                )
            ),
            h(
              ElTooltip,
              {
                content: "从JSON导入脚本 (将替换现有)",
                placement: "top",
                showArrow: false,
                offset: 8,
                hideAfter: 0,
              },
              () =>
                h(
                  ElUpload,
                  {
                    action: "#",
                    beforeUpload: (file: File) => {
                      emit("import", file);
                      return false;
                    },
                    showFileList: false,
                    accept: ".json",
                    disabled: appSettings.safeModeLevel === "forbidden",
                  },
                  () =>
                    h(
                      "button",
                      {
                        class:
                          "btn-warning-adv !p-1.5 sm:!p-2 aspect-square group",
                        disabled: appSettings.safeModeLevel === "forbidden",
                      },
                      h(Icon, {
                        icon: "ph:download-simple-duotone",
                        class:
                          "text-md sm:text-lg group-hover:scale-110 transition-transform",
                      })
                    )
                )
            ),
            h(
              ElTooltip,
              {
                content: "清空所有脚本",
                placement: "top",
                showArrow: false,
                offset: 8,
                hideAfter: 0,
              },
              () =>
                h(
                  "button",
                  {
                    class: "btn-danger-adv !p-1.5 sm:!p-2 aspect-square group",
                    disabled:
                      !props.scripts.length ||
                      appSettings.safeModeLevel === "forbidden",
                    onClick: () => emit("clearAll"),
                  },
                  h(Icon, {
                    icon: "ph:trash-simple-duotone",
                    class:
                      "text-md sm:text-lg group-hover:rotate-[15deg] transition-transform",
                  })
                )
            ),
          ]
        )
      ),
    ];
  },
});

const EditorForm = defineComponent({
  props: {
    editableScript: { type: Object as PropType<RegexScript>, required: true },
    trimStringsInput: { type: String, required: true },
  },
  emits: ["update:editableScript", "update:trimStringsInput"],
  setup(props, { emit }) {
    const formRef = ref<InstanceType<typeof ElForm> | null>(null);
    const updateScriptField = (field: keyof RegexScript, value: any) => {
      emit("update:editableScript", {
        ...props.editableScript,
        [field]: value,
      });
    };
    const createFormItem = (
      label: string | (() => VNodeChild),
      content: () => VNodeChild,
      helpText?: string | null,
      itemClass: string = "mb-4"
    ) => {
      const labelVNode =
        typeof label === "string"
          ? h("label", { class: "form-label" }, label)
          : h("div", {}, label);
      const children = [content()];
      if (helpText)
        children.push(h("p", { class: "form-help-text" }, helpText));
      return h(
        ElFormItem,
        { class: itemClass },
        { label: () => labelVNode, default: () => children }
      );
    };
    return () => {
      if (!props.editableScript || !props.editableScript.id)
        // Check for valid editable script
        return h("div", { class: "p-4 text-center content-panel-title" }, [
          h(Icon, {
            icon: "ph:pencil-simple-line-duotone",
            class: "text-xl text-accent-500 dark:text-accent-400",
          }),
          "编辑脚本 (请选择或新建一个脚本)",
        ]);
      return [
        h("div", { class: "content-panel-header" }, [
          h("h2", { class: "content-panel-title flex items-center gap-2" }, [
            h(Icon, {
              icon: "ph:pencil-simple-line-duotone",
              class: "text-xl text-accent-500 dark:text-accent-400",
            }),
            "编辑脚本配置",
          ]),
        ]),
        h(ElScrollbar, { class: "flex-grow" }, () =>
          h(
            ElForm,
            {
              model: props.editableScript,
              labelPosition: "top",
              ref: formRef,
              class: "p-4 space-y-0",
              onSubmit: (e: Event) => e.preventDefault(),
            },
            () => [
              h("section", { class: "mb-5" }, [
                h("h3", { class: "form-section-title !pt-0" }, [
                  h(Icon, { icon: "ph:text-aa-duotone", class: "text-lg" }),
                  "核心规则",
                ]),
                createFormItem("脚本名称", () =>
                  h(ElInput, {
                    modelValue: props.editableScript.scriptName,
                    "onUpdate:modelValue": (val: string) =>
                      updateScriptField("scriptName", val),
                    placeholder: "脚本的描述性名称",
                    clearable: true,
                  })
                ),
                createFormItem("查找模式", () =>
                  h(ElInput, {
                    modelValue: props.editableScript.findRegex,
                    "onUpdate:modelValue": (val: string) =>
                      updateScriptField("findRegex", val),
                    placeholder: "/pattern/flags 或 pattern",
                    clearable: true,
                    rows: 3,
                    type: "textarea",
                    resize: "vertical",
                  })
                ),
                createFormItem(
                  "标志",
                  () =>
                    h(ElInput, {
                      modelValue: props.editableScript.regexFlags,
                      "onUpdate:modelValue": (val: string) =>
                        updateScriptField("regexFlags", val),
                      placeholder: "gmi",
                      clearable: true,
                    }),
                  "若查找模式含flags，此处无效。"
                ),
                createFormItem("替换为", () =>
                  h(ElInput, {
                    modelValue: props.editableScript.replaceString,
                    "onUpdate:modelValue": (val: string) =>
                      updateScriptField("replaceString", val),
                    placeholder: "替换文本, $&, $1...",
                    clearable: true,
                    rows: 3,
                    type: "textarea",
                    resize: "vertical",
                  })
                ),
                createFormItem(
                  () =>
                    h("div", [
                      h("span", { class: "form-label !mb-0" }, "预移除内容"),
                      h(
                        "span",
                        {
                          class:
                            "text-xs text-neutral-400 dark:text-neutral-500 ml-1",
                        },
                        "(每行一个)"
                      ),
                    ]),
                  () =>
                    h(ElInput, {
                      modelValue: props.trimStringsInput,
                      "onUpdate:modelValue": (val: string) =>
                        emit("update:trimStringsInput", val),
                      type: "textarea",
                      autosize: { minRows: 2, maxRows: 4 },
                      placeholder: "要移除的文本或正则",
                    }),
                  null,
                  "!mb-0"
                ),
              ]),
              h(ElDivider, { class: "!my-5" }),
              h("section", { class: "mb-5" }, [
                h("h3", { class: "form-section-title" }, [
                  h(Icon, { icon: "ph:target-duotone", class: "text-lg" }),
                  "作用范围与条件",
                ]),
                h(
                  "div",
                  { class: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4" },
                  [
                    createFormItem(
                      "应用于",
                      () =>
                        h(
                          ElSelect,
                          {
                            modelValue: props.editableScript.placement,
                            "onUpdate:modelValue": (val: number[]) =>
                              updateScriptField("placement", val),
                            multiple: true,
                            placeholder: "选择文本源",
                            class: "w-full",
                          },
                          () => [
                            h(ElOption, { label: "用户输入", value: 1 }),
                            h(ElOption, { label: "AI 回复", value: 2 }),
                            h(ElOption, { label: "斜杠命令", value: 3 }),
                            h(ElOption, { label: "世界信息", value: 5 }),
                            h(ElOption, { label: "推理过程", value: 6 }),
                          ]
                        ),
                      null,
                      "!mb-0"
                    ),
                    createFormItem(
                      "宏替换方式",
                      () =>
                        h(
                          ElSelect,
                          {
                            modelValue: props.editableScript.substituteRegex,
                            "onUpdate:modelValue": (val: number) =>
                              updateScriptField("substituteRegex", val),
                            placeholder: "选择宏替换",
                            class: "w-full",
                          },
                          () => [
                            h(ElOption, { label: "不替换", value: 0 }),
                            h(ElOption, { label: "原始值", value: 1 }),
                            h(ElOption, { label: "转义值", value: 2 }),
                          ]
                        ),
                      null,
                      "!mb-0"
                    ),
                    createFormItem(
                      "编辑时运行",
                      () =>
                        h(ElSwitch, {
                          modelValue: props.editableScript.runOnEdit,
                          "onUpdate:modelValue": (
                            val: string | number | boolean
                          ) => updateScriptField("runOnEdit", Boolean(val)),
                        }),
                      null,
                      "flex flex-col items-start !mb-0"
                    ),
                    createFormItem(
                      "禁用脚本",
                      () =>
                        h(ElSwitch, {
                          modelValue: props.editableScript.disabled,
                          "onUpdate:modelValue": (
                            val: string | number | boolean
                          ) => updateScriptField("disabled", Boolean(val)),
                        }),
                      null,
                      "flex flex-col items-start !mb-0"
                    ),
                  ]
                ),
              ]),
              h(ElDivider, { class: "!my-5" }),
              h("section", { class: "mb-5" }, [
                h("h3", { class: "form-section-title" }, [
                  h(Icon, { icon: "ph:eye-slash-duotone", class: "text-lg" }),
                  "临时性/效果",
                ]),
                h(
                  "div",
                  { class: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4" },
                  [
                    createFormItem(
                      "仅格式化显示",
                      () =>
                        h(ElSwitch, {
                          modelValue: props.editableScript.markdownOnly,
                          "onUpdate:modelValue": (
                            val: string | number | boolean
                          ) => updateScriptField("markdownOnly", Boolean(val)),
                        }),
                      "修改仅影响聊天显示。",
                      "flex flex-col items-start !mb-0"
                    ),
                    createFormItem(
                      "仅格式化提示词",
                      () =>
                        h(ElSwitch, {
                          modelValue: props.editableScript.promptOnly,
                          "onUpdate:modelValue": (
                            val: string | number | boolean
                          ) => updateScriptField("promptOnly", Boolean(val)),
                        }),
                      "修改仅影响发送给AI的提示。",
                      "flex flex-col items-start !mb-0"
                    ),
                  ]
                ),
                h(
                  "p",
                  { class: "form-help-text mt-3 text-sm" },
                  "提示: 两者都不勾选，则修改会写入聊天文件。两者都勾选，则影响显示和提示，但不写入文件。"
                ),
              ]),
              h(ElDivider, { class: "!my-5" }),
              h("section", { class: "" }, [
                h("h3", { class: "form-section-title" }, [
                  h(Icon, {
                    icon: "ph:stack-overflow-logo-duotone",
                    class: "text-lg",
                  }),
                  "消息深度",
                ]),
                h(
                  "div",
                  { class: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4" },
                  [
                    createFormItem(
                      "最小深度",
                      () =>
                        h(ElInputNumber, {
                          modelValue:
                            props.editableScript.minDepth ?? undefined,
                          "onUpdate:modelValue": (val: number | undefined) =>
                            updateScriptField(
                              "minDepth",
                              val === undefined ? null : val
                            ),
                          min: -1,
                          placeholder: "无限制",
                          controlsPosition: "right",
                          class: "w-full",
                        }),
                      "0=最后消息, -1=无限制",
                      "!mb-0"
                    ),
                    createFormItem(
                      "最大深度",
                      () =>
                        h(ElInputNumber, {
                          modelValue:
                            props.editableScript.maxDepth ?? undefined,
                          "onUpdate:modelValue": (val: number | undefined) =>
                            updateScriptField(
                              "maxDepth",
                              val === undefined ? null : val
                            ),
                          min: 0,
                          placeholder: "无限制",
                          controlsPosition: "right",
                          class: "w-full",
                        }),
                      "需大于等于最小深度",
                      "!mb-0"
                    ),
                  ]
                ),
              ]),
            ]
          )
        ),
      ];
    };
  },
});

interface TestUnitResult {
  id: string;
  scriptName: string;
  inputTextForStep: string;
  output: string;
  matches: { index: number; length: number; text: string; groups: string[] }[];
  error?: string;
}
interface TestRun {
  id: number;
  originalText: string;
  finalOutput: string;
  steps: TestUnitResult[];
}
const TestRunner = defineComponent({
  props: {
    currentEditableScript: {
      type: Object as PropType<RegexScript>,
      required: true,
    },
    selectedScriptsForTesting: {
      type: Array as PropType<RegexScript[]>,
      required: true,
    },
    isMobile: { type: Boolean, default: false },
  },
  setup(props) {
    const inputText = ref(
      `To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles
And by opposing end them. To die – to sleep,
No more; and by a sleep to say we end
The heart-ache and the thousand natural shocks
That flesh is heir to: 'tis a consummation
Devoutly to be wished. To die, to sleep;
To sleep, perchance to dream – ay, there's the rub:
For in that sleep of death what dreams may come,
When we have shuffled off this mortal coil,
Must give us pause – there's the respect
That makes calamity of so long life.
For who would bear the whips and scorns of time,
Th'oppressor's wrong, the proud man's contumely,
The pangs of disprized love, the law's delay,
The insolence of office, and the spurns
That patient merit of th'unworthy takes,
When he himself might his quietus make
With a bare bodkin? Who would fardels bear,
To grunt and sweat under a weary life,
But that the dread of something after death,
The undiscovered country, from whose bourn
No traveller returns, puzzles the will,
And makes us rather bear those ills we have
Than fly to others that we know not of?
Thus conscience does make cowards of us all,
And thus the native hue of resolution
Is sicklied o'er with the pale cast of thought,
And enterprises of great pitch and moment
With this regard their currents turn awry
And lose the name of action.
> This is a first level quote.
>> This is a second level quote.
>>> This is a third level quote.
> Back to first level.
>> Second again.
`
    );
    const testRuns = ref<TestRun[]>([]);
    const renderHtmlInOutput = ref(false);
    const renderMarkdownInOutput = ref(true);
    const resultDisplayMode = ref<"replace" | "highlight">("replace");
    const testMode = ref<"current" | "selectedSequential">("current");
    const testInProgress = ref(false);

    const executeRegexOnText = (
      text: string,
      script: RegexScript
    ): Omit<TestUnitResult, "id" | "scriptName" | "inputTextForStep"> => {
      let err: string | undefined;
      let p = script.findRegex;
      let f = script.regexFlags;
      const lm = p.match(/^\/(.+)\/([gimdsuy]*)$/);
      if (lm) {
        p = lm[1];
        f = lm[2] || script.regexFlags || "";
      }
      let regex: RegExp | null = null;
      try {
        if (!p && f && p !== "") {
          err = "模式空(字面量)";
        } else if (!p && !f) {
          regex = new RegExp("");
        } else {
          regex = new RegExp(p, f);
        }
      } catch (e: any) {
        err = `编译: ${e.message}`;
      }
      if (err || !regex)
        return { output: text, matches: [], error: err || "无法编译" };
      const collectedMatches: TestUnitResult["matches"] = [];
      let outputText = text;
      try {
        const allMatchesIterator = text.matchAll(regex);
        for (const match of allMatchesIterator) {
          collectedMatches.push({
            index: match.index!,
            length: match[0].length,
            text: match[0],
            groups: Array.from(match)
              .slice(1)
              .map((g) => (g === undefined ? "" : String(g))),
          });
        }
        if (script.replaceString !== undefined) {
          outputText = text.replace(regex, (matchStr, ...args) => {
            let currentMatchText = matchStr;
            if (script.trimStrings?.length) {
              script.trimStrings.forEach((ts) => {
                if (ts) {
                  const esc = ts.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                  try {
                    currentMatchText = currentMatchText.replace(
                      new RegExp(esc, "g"),
                      ""
                    );
                  } catch (e) {
                    console.warn(`Trim regex error: ${e}`);
                  }
                }
              });
            }
            let replacement = script.replaceString.replace(
              /\$&/g,
              currentMatchText
            );
            const captureGroups = args.slice(0, -2);
            for (let i = 0; i < captureGroups.length; i++) {
              replacement = replacement.replace(
                new RegExp(`\\$${i + 1}`, "g"),
                captureGroups[i] === undefined ? "" : String(captureGroups[i])
              );
            }
            return replacement;
          });
        }
      } catch (e: any) {
        err = (err ? err + "; " : "") + `替换: ${e.message}`;
        outputText = text;
      }
      return { output: outputText, matches: collectedMatches, error: err };
    };
    const runAllTests = async (forceRun = false) => {
      if (testInProgress.value && !forceRun) return;
      testInProgress.value = true;
      if (!forceRun) testRuns.value = [];
      await nextTick();
      const currentTestInput = inputText.value;
      const isEmptyScriptAndNoText =
        testMode.value === "current" &&
        !props.currentEditableScript.findRegex &&
        !props.currentEditableScript.scriptName &&
        !(
          props.currentEditableScript.findRegex &&
          props.currentEditableScript.findRegex.startsWith("/")
        ) &&
        !currentTestInput.trim();
      const isEmptyInputNoForce = !currentTestInput.trim() && !forceRun;
      if (isEmptyScriptAndNoText) {
        testInProgress.value = false;
        if (
          !forceRun &&
          !(
            props.currentEditableScript.findRegex === "" &&
            props.currentEditableScript.replaceString !== undefined
          )
        )
          ElMessage.info("当前脚本和测试文本均为空。");
        return;
      } else if (isEmptyInputNoForce) {
        ElMessage.info("请输入测试文本。");
        testInProgress.value = false;
        return;
      }
      let scriptsToRun: RegexScript[] = [];
      if (testMode.value === "current") {
        if (
          !props.currentEditableScript ||
          !props.currentEditableScript.id || // Also check for valid ID
          (!props.currentEditableScript.findRegex &&
            !props.currentEditableScript.scriptName &&
            !(
              props.currentEditableScript.findRegex &&
              props.currentEditableScript.findRegex.startsWith("/")
            ))
        ) {
          if (!forceRun) ElMessage.info("当前编辑脚本为空或无效。");
          testInProgress.value = false;
          return;
        }
        scriptsToRun = [props.currentEditableScript];
      } else {
        if (props.selectedScriptsForTesting.length === 0) {
          if (!forceRun) ElMessage.info("请在左侧勾选脚本。");
          testInProgress.value = false;
          return;
        }
        scriptsToRun = props.selectedScriptsForTesting;
      }
      if (
        scriptsToRun.length === 0 ||
        scriptsToRun.every(
          (s) =>
            !s ||
            !s.id || // Ensure script and ID are valid
            (!s.findRegex &&
              !s.scriptName &&
              !(s.findRegex && s.findRegex.startsWith("/")))
        )
      ) {
        if (!forceRun) ElMessage.warning("无有效脚本测试。");
        testInProgress.value = false;
        return;
      }
      const newTestRun: TestRun = {
        id: Date.now(),
        originalText: currentTestInput,
        finalOutput: currentTestInput,
        steps: [],
      };
      let textForNextStep = currentTestInput;
      for (const script of scriptsToRun) {
        if (
          !script ||
          !script.id ||
          (!script.findRegex &&
            !script.scriptName &&
            !(script.findRegex && script.findRegex.startsWith("/")))
        )
          continue;
        const result = executeRegexOnText(textForNextStep, script);
        newTestRun.steps.push({
          id: script.id,
          scriptName: script.scriptName || "当前编辑",
          inputTextForStep: textForNextStep,
          output: result.output,
          matches: result.matches,
          error: result.error,
        });
        textForNextStep = result.output;
        if (scriptsToRun.length > 1 && !props.isMobile)
          await new Promise((r) => setTimeout(r, 0));
      }
      newTestRun.finalOutput = textForNextStep;
      testRuns.value = [newTestRun];
      testInProgress.value = false;
      if (
        newTestRun.steps.length === 0 &&
        currentTestInput &&
        !forceRun &&
        !(
          props.currentEditableScript.findRegex === "" &&
          props.currentEditableScript.replaceString !== undefined
        )
      )
        ElMessage.warning("测试未执行任何有效脚本步骤。");
    };
    let runTestsDebounced: Function | null = null;
    onMounted(() => {
      runTestsDebounced = (() => {
        let timeout: number;
        return (force: boolean = false) => {
          clearTimeout(timeout);
          timeout = window.setTimeout(() => runAllTests(force), 350);
        };
      })();
      if (inputText.value.trim()) runTestsDebounced(true);
    });
    watch(
      () =>
        testMode.value === "current"
          ? props.currentEditableScript
          : props.selectedScriptsForTesting,
      () => {
        if (inputText.value.trim() && runTestsDebounced)
          runTestsDebounced(true);
      },
      { deep: true }
    );
    watch(inputText, () => {
      if (inputText.value.trim() === "") testRuns.value = [];
      else if (runTestsDebounced) runTestsDebounced(true);
    });

    const getHighlightedText = (
      text: string,
      matches: TestUnitResult["matches"]
    ) => {
      if (typeof text !== "string") return "";
      if (!matches || matches.length === 0) return escapeHtml(text);
      let lastIndex = 0;
      const parts: string[] = [];
      [...matches]
        .sort((a, b) => a.index - b.index)
        .forEach((match) => {
          if (match.index === undefined || match.index < lastIndex) return;
          parts.push(escapeHtml(text.substring(lastIndex, match.index)));
          parts.push(
            `<mark class="bg-accent-400/30 dark:bg-accent-500/40 text-accent-700 dark:text-accent-300 px-0.5 rounded">${escapeHtml(
              match.text
            )}</mark>`
          );
          lastIndex = match.index + match.length;
        });
      parts.push(escapeHtml(text.substring(lastIndex)));
      return parts.join("");
    };

    return () =>
      h("div", { class: "flex flex-col h-full" }, [
        h(
          "div",
          {
            class:
              "content-panel-header !py-3 !px-4 !border-b flex-wrap gap-y-2",
          },
          [
            h(
              "h3",
              {
                class:
                  "content-panel-title flex items-center gap-2 text-base sm:text-lg mr-auto",
              },
              [
                h(Icon, {
                  icon: "ph:text-aa-duotone",
                  class: "text-xl text-accent-500 dark:text-accent-400",
                }),
                "测试区",
              ]
            ),
            h("div", { class: "flex items-center gap-2 sm:gap-3" }, [
              h(
                ElRadioGroup,
                {
                  modelValue: testMode.value,
                  "onUpdate:modelValue": (
                    val: string | number | boolean | undefined
                  ) => {
                    if (val === "current" || val === "selectedSequential")
                      testMode.value = val as any;
                  },
                  size: "small",
                },
                () => [
                  h(
                    ElRadioButton,
                    { value: "current", label: "current" },
                    () => "测试当前"
                  ),
                  h(
                    ElRadioButton,
                    {
                      value: "selectedSequential",
                      label: "selectedSequential",
                      disabled: props.selectedScriptsForTesting.length === 0,
                    },
                    () => "顺序测试选中"
                  ),
                ]
              ),
              h(
                ElRadioGroup,
                {
                  modelValue: resultDisplayMode.value,
                  "onUpdate:modelValue": (
                    val: string | number | boolean | undefined
                  ) => {
                    if (val === "replace" || val === "highlight")
                      resultDisplayMode.value = val as any;
                  },
                  size: "small",
                  class: "ml-2",
                },
                () => [
                  h(
                    ElRadioButton,
                    { value: "replace", label: "replace" },
                    () => "显示替换"
                  ),
                  h(
                    ElRadioButton,
                    { value: "highlight", label: "highlight" },
                    () => "仅高亮"
                  ),
                ]
              ),
              h(
                ElTooltip,
                {
                  content:
                    "是否将结果中的HTML标签直接渲染 (优先级高于Markdown渲染)",
                  placement: "top",
                },
                () =>
                  h(ElCheckboxComp, {
                    modelValue: renderHtmlInOutput.value,
                    "onUpdate:modelValue": (val: string | number | boolean) =>
                      (renderHtmlInOutput.value = Boolean(val)),
                    label: "渲染HTML",
                    size: "small",
                  })
              ),
              h(
                ElTooltip,
                {
                  content:
                    "是否将结果中的Markdown格式化后渲染 (当不渲染HTML时生效)",
                  placement: "top",
                },
                () =>
                  h(ElCheckboxComp, {
                    modelValue: renderMarkdownInOutput.value,
                    "onUpdate:modelValue": (val: string | number | boolean) =>
                      (renderMarkdownInOutput.value = Boolean(val)),
                    label: "渲染Markdown",
                    size: "small",
                    disabled: renderHtmlInOutput.value,
                  })
              ),
            ]),
          ]
        ),
        h(
          "div",
          {
            class: `p-4 flex-grow flex flex-col gap-4 ${
              props.isMobile ? "" : "min-h-[400px]"
            }`,
          },
          [
            h(
              "div",
              {
                class: `flex flex-col flex-shrink-0 ${
                  props.isMobile
                    ? "min-h-[150px] h-[35vh] mb-4"
                    : "min-h-[200px]"
                }`,
              },
              [
                h(
                  "div",
                  { class: "flex justify-between items-center mb-1.5" },
                  [
                    h("label", { class: "form-label !mb-0" }, "输入测试文本"),
                    h(
                      ElButton,
                      {
                        type: "primary",
                        size: "small",
                        onClick: () => runAllTests(true),
                        loading: testInProgress.value,
                        disabled:
                          testMode.value === "selectedSequential" &&
                          props.selectedScriptsForTesting.length === 0,
                      },
                      () => [
                        h(Icon, { icon: "ph:play-duotone", class: "mr-1" }),
                        "运行测试",
                      ]
                    ),
                  ]
                ),
                h(ElInput, {
                  modelValue: inputText.value,
                  "onUpdate:modelValue": (val: string) =>
                    (inputText.value = val),
                  type: "textarea",
                  placeholder: "在此输入整个测试文本块...",
                  class:
                    "flex-grow custom-textarea !border !border-neutral-300 dark:!border-neutral-600 rounded-md",
                  autosize: { minRows: props.isMobile ? 5 : 10, maxRows: 35 },
                  inputStyle: { height: "100%" },
                }),
              ]
            ),
            h(
              "div",
              {
                class: `flex flex-col flex-grow min-h-0 ${
                  props.isMobile ? "h-[calc(65vh - 220px)]" : ""
                }`,
              },
              [
                h("label", { class: "form-label mb-1.5" }, "测试结果"),
                h(
                  ElScrollbar,
                  {
                    class:
                      "result-display-area border border-neutral-300 dark:border-neutral-600 rounded-md flex-grow bg-neutral-50 dark:bg-neutral-900/50",
                    always: true,
                  },
                  () => {
                    if (testInProgress.value)
                      return h(ElEmpty, {
                        description: "测试中...",
                        imageSize: 50,
                        class: "py-6",
                      });
                    if (
                      !testRuns.value.length &&
                      inputText.value.trim() !== ""
                    ) {
                      return h(ElEmpty, {
                        description:
                          testMode.value === "selectedSequential" &&
                          props.selectedScriptsForTesting.length === 0
                            ? "请勾选脚本"
                            : "无结果或未运行",
                        imageSize: 50,
                        class: "py-6",
                      });
                    }
                    if (!testRuns.value.length && !inputText.value.trim()) {
                      return h(ElEmpty, {
                        description: "输入文本并运行测试",
                        imageSize: 50,
                        class: "py-6",
                      });
                    }
                    return h(
                      "div",
                      { class: "p-2 space-y-4" },
                      testRuns.value.map((run) =>
                        h(
                          "div",
                          {
                            key: run.id,
                            class:
                              "test-run-card p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm",
                          },
                          [
                            h(
                              "div",
                              {
                                class:
                                  "mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-600",
                              },
                              [
                                h(
                                  "strong",
                                  {
                                    class:
                                      "text-sm text-neutral-600 dark:text-neutral-300 block mb-1",
                                  },
                                  "原始输入文本:"
                                ),
                                h(
                                  "pre",
                                  {
                                    class:
                                      "whitespace-pre-wrap break-all p-2 bg-neutral-100 dark:bg-neutral-750 rounded text-sm",
                                  },
                                  run.originalText
                                ),
                              ]
                            ),
                            ...run.steps.map((step, idx) => {
                              let outputDisplayContent: VNodeChild;
                              const outputDivBaseClass =
                                "p-1 bg-neutral-100 dark:bg-neutral-750 rounded text-xs whitespace-pre-wrap break-all";
                              if (resultDisplayMode.value === "highlight") {
                                outputDisplayContent = h("div", {
                                  class: `${outputDivBaseClass} result-html-render`,
                                  innerHTML: getHighlightedText(
                                    step.inputTextForStep,
                                    step.matches
                                  ),
                                });
                              } else {
                                const textToShow = step.output;
                                if (renderHtmlInOutput.value) {
                                  outputDisplayContent = h("div", {
                                    class: `${outputDivBaseClass} result-html-render`,
                                    innerHTML: textToShow,
                                  });
                                } else if (renderMarkdownInOutput.value) {
                                  outputDisplayContent = h("div", {
                                    class: `${outputDivBaseClass} prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-blockquote:my-1 prose-pre:my-1 prose-headings:my-1.5`,
                                    innerHTML: mdParser.render(textToShow),
                                  });
                                } else {
                                  outputDisplayContent = h(
                                    "pre",
                                    { class: outputDivBaseClass },
                                    textToShow
                                  );
                                }
                              }
                              return h(
                                "div",
                                {
                                  key: step.id + idx,
                                  class:
                                    "step-result py-2" +
                                    (idx < run.steps.length - 1
                                      ? " border-b border-dashed border-neutral-300 dark:border-neutral-600 mb-2"
                                      : ""),
                                },
                                [
                                  testMode.value === "selectedSequential" ||
                                  run.steps.length > 1
                                    ? h(
                                        "p",
                                        {
                                          class:
                                            "text-sm font-semibold text-accent-600 dark:text-accent-400 mb-1.5 flex items-center gap-1.5",
                                        },
                                        [
                                          h(Icon, {
                                            icon:
                                              idx === 0 && run.steps.length > 1
                                                ? "ph:arrow-down-duotone"
                                                : idx > 0
                                                ? "ph:arrow-elbow-right-down-duotone"
                                                : run.steps.length === 1
                                                ? "ph:arrow-right-duotone"
                                                : "",
                                            class: "text-base",
                                          }),
                                          h("span", step.scriptName),
                                        ]
                                      )
                                    : null,
                                  h(
                                    "div",
                                    {
                                      class:
                                        "grid grid-cols-[auto_1fr] gap-x-3 items-start text-xs mb-1",
                                    },
                                    [
                                      h(
                                        "strong",
                                        {
                                          class:
                                            "text-neutral-500 dark:text-neutral-400 justify-self-end py-1",
                                        },
                                        resultDisplayMode.value === "highlight"
                                          ? "高亮预览:"
                                          : "输出:"
                                      ),
                                      outputDisplayContent,
                                      h(
                                        "strong",
                                        {
                                          class:
                                            "text-neutral-500 dark:text-neutral-400 justify-self-end",
                                        },
                                        "匹配:"
                                      ),
                                      h(
                                        "span",
                                        { class: "py-1" },
                                        `${step.matches.length} 个`
                                      ),
                                    ]
                                  ),
                                  step.matches.length > 0 &&
                                  resultDisplayMode.value === "replace"
                                    ? h("details", { class: "text-xs mt-1" }, [
                                        h(
                                          "summary",
                                          {
                                            class:
                                              "cursor-pointer text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
                                          },
                                          `查看 ${step.matches.length} 个匹配详情 (基于替换前)`
                                        ),
                                        h(
                                          "ul",
                                          {
                                            class:
                                              "list-disc pl-5 mt-1 space-y-0.5 text-neutral-600 dark:text-neutral-400",
                                          },
                                          step.matches.map((m, i) =>
                                            h(
                                              "li",
                                              ` #${i + 1}: "${m.text}" (索引 ${
                                                m.index
                                              }, 长度 ${m.length})${
                                                m.groups.length > 0
                                                  ? ", 捕获组: " +
                                                    m.groups
                                                      .map(
                                                        (g, gi) =>
                                                          `$${gi + 1}="${g}"`
                                                      )
                                                      .join(", ")
                                                  : ""
                                              }`
                                            )
                                          )
                                        ),
                                      ])
                                    : null,
                                  step.error
                                    ? h(ElAlert, {
                                        title: step.error,
                                        type: "error",
                                        showIcon: true,
                                        closable: false,
                                        class:
                                          "mt-1.5 !p-1 !py-0.5 text-xxs !leading-tight compact-alert",
                                      })
                                    : null,
                                ]
                              );
                            }),
                            testMode.value === "selectedSequential" &&
                            run.steps.length > 1
                              ? h(
                                  "div",
                                  {
                                    class:
                                      "mt-3 pt-2 border-t border-neutral-300 dark:border-neutral-600",
                                  },
                                  [
                                    h(
                                      "strong",
                                      {
                                        class:
                                          "text-xs text-neutral-500 dark:text-neutral-400 block mb-1",
                                      },
                                      "最终输出:"
                                    ),
                                    renderHtmlInOutput.value
                                      ? h("div", {
                                          class:
                                            "text-sm p-2 bg-neutral-100 dark:bg-neutral-750 rounded whitespace-pre-wrap break-all result-html-render",
                                          innerHTML: run.finalOutput,
                                        })
                                      : renderMarkdownInOutput.value
                                      ? h("div", {
                                          class:
                                            "text-sm p-2 bg-neutral-100 dark:bg-neutral-750 rounded whitespace-pre-wrap break-all prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-blockquote:my-1 prose-pre:my-1 prose-headings:my-1.5",
                                          innerHTML: mdParser.render(
                                            run.finalOutput
                                          ),
                                        })
                                      : h(
                                          "pre",
                                          {
                                            class:
                                              "text-sm p-2 bg-neutral-100 dark:bg-neutral-750 rounded whitespace-pre-wrap break-all",
                                          },
                                          run.finalOutput
                                        ),
                                  ]
                                )
                              : null,
                          ].filter(Boolean)
                        )
                      )
                    );
                  }
                ),
              ]
            ),
          ]
        ),
      ]);
  },
});

const LOCAL_STORAGE_KEY_REGEX_SCRIPTS_V5 = "regexEditorScripts_v5";
const appSettings = useAppSettingsStore();
const savedScripts = ref<RegexScript[]>([]);
const selectedScriptId = ref<string | null>(null);
const checkedScriptIds = ref<string[]>([]);
const mobileActiveTab = ref("list");
const isCreatingNew = ref(false);

watch(
  savedScripts,
  (newValue, oldValue) => {
    console.log("[PARENT] savedScripts changed. Length:", newValue.length);
    // console.log('[PARENT] savedScripts changed. Length:', newValue.length, 'Content:', JSON.parse(JSON.stringify(newValue)));
    newValue.forEach((item, index) => {
      if (
        !item ||
        typeof item.id !== "string" ||
        item.id === "" ||
        typeof item.order !== "number"
      ) {
        console.error(
          `[PARENT] Invalid script at index ${index} in savedScripts:`,
          JSON.parse(JSON.stringify(item))
        );
      }
    });
  },
  { deep: true, immediate: true }
);

const createDefaultScriptData = (id?: string, order?: number): RegexScript => {
  const newId =
    id || Date.now().toString() + Math.random().toString(36).substring(2, 7);
  const newOrder = typeof order === "number" && !isNaN(order) ? order : 0;
  // console.log(`[createDefaultScriptData] ID: ${newId}, Order: ${newOrder}`);
  return {
    id: newId,
    order: newOrder,
    scriptName: "",
    findRegex: "",
    replaceString: "",
    regexFlags: "g",
    trimStrings: [],
    placement: [2], // Default to AI Reply
    disabled: false,
    markdownOnly: false,
    promptOnly: false,
    runOnEdit: true,
    substituteRegex: 0,
    minDepth: null,
    maxDepth: null,
  };
};
const editableScript = ref<RegexScript>(createDefaultScriptData()); // Initialize with a default valid script
const trimStringsInput = ref("");

watch(
  () => editableScript.value.trimStrings,
  (newVal = []) => {
    trimStringsInput.value = newVal.join("\n");
  },
  { deep: true, immediate: true }
);
watch(trimStringsInput, (newVal = "") => {
  if (editableScript.value) {
    editableScript.value.trimStrings = newVal
      .split("\n")
      .filter((s) => s.trim() !== "");
  }
});

const sortedSavedScripts = computed(() =>
  [...savedScripts.value].sort((a, b) => a.order - b.order)
);

const selectedScriptsForTesting = computed(() => {
  return checkedScriptIds.value
    .map((id) => savedScripts.value.find((s) => s.id === id))
    .filter((s): s is RegexScript => !!s)
    .sort((a, b) => a.order - b.order);
});

const loadScriptsFromLocalStorage = () => {
  const key = LOCAL_STORAGE_KEY_REGEX_SCRIPTS_V5;
  let newScripts: RegexScript[] = [];
  try {
    const storedData = localStorage.getItem(key);
    console.log("[loadScripts] Raw storedData from localStorage:", storedData);

    if (storedData) {
      const parsed = JSON.parse(storedData);
      if (Array.isArray(parsed)) {
        console.log(
          "[loadScripts] Parsed data is array. Length:",
          parsed.length
        );
        let tempScripts = parsed.map((s: any, idx: number) => {
          // 使用 tempScripts 临时存储
          let currentId =
            s && typeof s.id === "string" && s.id.trim() !== ""
              ? s.id.trim()
              : "";
          if (!currentId) {
            console.warn(
              `[loadScripts] Script at index ${idx} (Loaded Name: ${s?.scriptName}) had missing/empty ID. Generating new one.`
            );
            currentId =
              Date.now().toString() +
              Math.random().toString(36).substring(2, 7) +
              `_load${idx}`;
          }

          // 如果文件中存在有效的 order，则使用它；否则使用索引作为初步的排序依据
          let preliminaryOrder =
            s && typeof s.order === "number" && !isNaN(s.order) ? s.order : idx;

          const defaultData = createDefaultScriptData(
            currentId,
            preliminaryOrder
          );
          const loadedScript = {
            ...defaultData,
            ...s,
            id: currentId,
            order: preliminaryOrder, //暂时保留初步的 order
          };
          return loadedScript;
        });

        // 根据 ID 去重
        const idMap = new Map<string, RegexScript>();
        tempScripts.forEach((script) => {
          if (!script.id) {
            console.error(
              "[loadScripts] Deduplication: Found script with no ID:",
              script
            );
            return;
          }
          if (!idMap.has(script.id)) {
            idMap.set(script.id, script);
          } else {
            const existing = idMap.get(script.id)!;
            if (script.order < existing.order) {
              // 使用 preliminaryOrder 进行比较
              idMap.set(script.id, script);
            }
          }
        });
        tempScripts = Array.from(idMap.values());

        // 根据 'order' 属性（即 preliminaryOrder）排序
        tempScripts.sort((a, b) => a.order - b.order);

        // 现在，基于排序后的数组位置，重新分配连续的 'order' 属性
        newScripts = tempScripts.map((s, i) => {
          // console.log(`[loadScripts Mapping] Script: ${s.scriptName}, Original Order: ${s.order}, New Order: ${i}`);
          return { ...s, order: i };
        });
      } else {
        console.error("[loadScripts] Stored data is not an array:", parsed);
        ElMessage.error("存储的脚本数据格式错误。");
      }
    } else {
      console.log("[loadScripts] No data in localStorage for key:", key);
    }
  } catch (e: any) {
    console.error("[loadScripts] Failed to load or parse scripts:", e);
    ElMessage.error(`加载脚本失败: ${e.message}`);
  }
  savedScripts.value = newScripts;
  console.log(
    "[loadScripts] Final savedScripts.value assigned. Length:",
    savedScripts.value.length
  );
  if (savedScripts.value.length > 0) {
    console.log(
      "[loadScripts] First final script:",
      JSON.parse(JSON.stringify(savedScripts.value[0]))
    );
    if (savedScripts.value.length > 1) {
      console.log(
        "[loadScripts] Second final script:",
        JSON.parse(JSON.stringify(savedScripts.value[1]))
      );
    }
  }
};

const saveScriptsToLocalStorage = () => {
  const key = LOCAL_STORAGE_KEY_REGEX_SCRIPTS_V5;
  try {
    // Ensure all scripts have valid IDs and orders before saving
    const scriptsToSave = savedScripts.value.map((s, idx) => ({
      ...createDefaultScriptData(s.id, s.order), // Ensure all fields present
      ...s, // Override with actual data
      id:
        s.id ||
        Date.now().toString() +
          Math.random().toString(36).substring(2, 7) +
          `_save${idx}`, // Re-ensure ID
      order: typeof s.order === "number" ? s.order : idx, // Re-ensure order
    }));
    localStorage.setItem(key, JSON.stringify(scriptsToSave));
    console.log("[saveToStorage] Scripts saved. Count:", scriptsToSave.length);
  } catch (e) {
    console.error("[saveToStorage] Error saving scripts to localStorage:", e);
    ElMessage.error("保存脚本到本地存储失败。");
  }
};

onMounted(() => {
  console.log(
    "[PARENT onMounted] Component mounted. Attempting to load scripts..."
  );
  loadScriptsFromLocalStorage();
  console.log(
    "[PARENT onMounted] After loadScriptsFromLocalStorage, savedScripts.length:",
    savedScripts.value.length
  );
  // console.log('[PARENT onMounted] After loadScriptsFromLocalStorage, Content:', JSON.parse(JSON.stringify(savedScripts.value)));

  if (sortedSavedScripts.value.length > 0) {
    console.log(
      "[PARENT onMounted] Scripts found, loading first one to editor:",
      sortedSavedScripts.value[0].id
    );
    loadScriptToEdit(sortedSavedScripts.value[0]);
  } else {
    console.log(
      "[PARENT onMounted] No scripts found, preparing new script editor."
    );
    prepareNewScript(false); // Pass false to avoid "prepared new" message if it's initial load
  }

  watch(
    () => appSettings.isAutoSaveEnabled,
    (nv, ov) => {
      if (nv === true && ov === false) {
        ElMessage.success("自动保存已开启");
        if (editableScript.value.id || editableScript.value.scriptName)
          saveCurrentScript(true);
      } else if (nv === false && ov === true) ElMessage.info("自动保存已关闭");
    }
    // { immediate: true } // Removed immediate: true to avoid message on initial load if already enabled
  );
});

const autoSaveScript = () => {
  if (
    appSettings.isAutoSaveEnabled === true &&
    (editableScript.value.id || editableScript.value.scriptName.trim() !== "")
  )
    saveCurrentScript(true);
};

let autoSaveDebounceTimer: number;
watch(
  editableScript,
  () => {
    clearTimeout(autoSaveDebounceTimer);
    autoSaveDebounceTimer = window.setTimeout(autoSaveScript, 1500);
  },
  { deep: true }
);

const prepareNewScript = (showMessage = true) => {
  console.log(
    "[prepareNewScript] Called. Current savedScripts count:",
    savedScripts.value.length
  );
  const newOrder =
    savedScripts.value.length > 0
      ? Math.max(0, ...savedScripts.value.map((s) => s.order)) + 1
      : 0;
  editableScript.value = createDefaultScriptData(undefined, newOrder); // ID will be generated by createDefaultScriptData
  console.log(
    "[prepareNewScript] New editableScript prepared:",
    JSON.parse(JSON.stringify(editableScript.value))
  );
  trimStringsInput.value = "";
  selectedScriptId.value = null; // No script is selected from the list
  isCreatingNew.value = true;
  if (showMessage) ElMessage.success("已准备新建脚本");
  // Ensure mobile tab switches if editor becomes "empty"
  if (
    mobileActiveTab.value === "editor" &&
    !editableScript.value.id &&
    !editableScript.value.scriptName.trim()
  ) {
    mobileActiveTab.value = "list";
  }
};

const saveCurrentScript = async (isAutoSave = false) => {
  console.log(
    "[saveCurrentScript] Attempting to save:",
    JSON.parse(JSON.stringify(editableScript.value))
  );
  if (!editableScript.value.scriptName.trim()) {
    if (!isAutoSave) ElMessage.error("脚本名称不能为空！");
    return;
  }

  const scriptToSave = JSON.parse(JSON.stringify(editableScript.value));

  // Ensure ID if it's somehow missing (e.g. if prepareNewScript wasn't called correctly or id was cleared)
  if (!scriptToSave.id) {
    scriptToSave.id =
      Date.now().toString() +
      Math.random().toString(36).substring(2, 7) +
      "_save_ensure";
    console.warn(
      "[saveCurrentScript] editableScript had no ID, generated new one:",
      scriptToSave.id
    );
  }

  const existingScriptIndex = savedScripts.value.findIndex(
    (s) => s.id === scriptToSave.id
  );

  if (existingScriptIndex > -1) {
    // Update existing script
    // Ensure order is preserved or correctly updated if necessary
    scriptToSave.order = savedScripts.value[existingScriptIndex].order; // Keep original order unless specifically changed
    savedScripts.value[existingScriptIndex] = scriptToSave;
    console.log(
      `[saveCurrentScript] Updated script ID ${scriptToSave.id} at index ${existingScriptIndex}`
    );
  } else {
    // Add new script
    // Assign a new order if not set or if it conflicts
    if (
      scriptToSave.order === undefined ||
      savedScripts.value.some((s) => s.order === scriptToSave.order)
    ) {
      scriptToSave.order =
        savedScripts.value.length > 0
          ? Math.max(0, ...savedScripts.value.map((s) => s.order)) + 1
          : 0;
    }
    savedScripts.value.push(scriptToSave);
    console.log(
      `[saveCurrentScript] Added new script ID ${scriptToSave.id} with order ${scriptToSave.order}`
    );
  }

  // Sort by order after any addition or if orders might have been manually changed
  // This ensures the visual list matches the 'order' property if draggable isn't the only source of reordering.
  // savedScripts.value.sort((a, b) => a.order - b.order); // This might be too aggressive if order is meant to be stable unless dragged.

  selectedScriptId.value = scriptToSave.id; // Select the saved/updated script
  isCreatingNew.value = false;
  saveScriptsToLocalStorage();

  if (!isAutoSave) {
    ElMessage.success({
      message: `脚本 "${scriptToSave.scriptName}" ${
        existingScriptIndex > -1 ? "更新" : "保存"
      }！`,
      duration: 2000,
    });
  }
};

const loadScriptToEdit = (script: RegexScript) => {
  if (!script || !script.id) {
    console.error(
      "[loadScriptToEdit] Attempted to load invalid script:",
      script
    );
    ElMessage.error("无法加载脚本：脚本数据无效。");
    prepareNewScript(false); // Fallback to new script state
    return;
  }
  console.log(
    "[loadScriptToEdit] Loading script to editor:",
    JSON.parse(JSON.stringify(script))
  );
  editableScript.value = JSON.parse(JSON.stringify(script)); // Deep copy
  selectedScriptId.value = script.id;
  mobileActiveTab.value = "editor";
  isCreatingNew.value = false;
  nextTick(() => {
    console.log("[loadScriptToEdit] Editor updated and DOM refreshed.");
  });
};

const deleteScript = async (id: string) => {
  const script = savedScripts.value.find((s) => s.id === id);
  if (!script) return;
  await performSafeAction(
    appSettings.safeModeLevel,
    "删除脚本",
    script.scriptName || "未命名",
    () => {
      savedScripts.value = savedScripts.value.filter((s) => s.id !== id);
      console.log(
        `[deleteScript] Deleted script ID ${id}. Remaining: ${savedScripts.value.length}`
      );
      if (selectedScriptId.value === id) {
        console.log(
          "[deleteScript] Deleted script was selected. Preparing new or loading next."
        );
        if (sortedSavedScripts.value.length > 0) {
          loadScriptToEdit(sortedSavedScripts.value[0]);
        } else {
          prepareNewScript(false);
        }
      }
      saveScriptsToLocalStorage();
      ElMessage.success(`脚本 "${script.scriptName || "未命名"}" 已删除。`);
      checkedScriptIds.value = checkedScriptIds.value.filter(
        (checkedId) => checkedId !== id
      );
    }
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden") console.warn(err);
  });
};

const exportAllScripts = () => {
  if (!sortedSavedScripts.value.length) {
    ElMessage.warning("无脚本可导出。");
    return;
  }
  const data = JSON.stringify(sortedSavedScripts.value, null, 2);
  const blob = new Blob([data], { type: "application/json;charset=utf-8" });
  saveAs(blob, "regex_scripts.json");
  ElMessage.success("所有脚本已导出。");
};

const handleImportFromJsonFile = (file: File): boolean => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const fileContent = e.target?.result as string;
      if (!fileContent) {
        ElMessage.error("文件内容为空。");
        return;
      }
      const data = JSON.parse(fileContent);
      if (
        !Array.isArray(data) ||
        !data.every(
          // Basic check, more thorough validation in loadScriptsFromLocalStorage
          (i: any) =>
            typeof i === "object" && i.id && i.scriptName !== undefined
        )
      ) {
        ElMessage.error("文件格式不正确。应为脚本对象数组。");
        return;
      }
      await performSafeAction(
        appSettings.safeModeLevel,
        `从文件导入 ${data.length} 个脚本`,
        "这将替换当前所有条目",
        async () => {
          // Use the robust loading logic by temporarily setting localStorage
          // This is a bit of a hack but reuses the validation.
          // A better way would be to refactor loadScripts to accept data.
          const oldStorage = localStorage.getItem(
            LOCAL_STORAGE_KEY_REGEX_SCRIPTS_V5
          );
          localStorage.setItem(
            LOCAL_STORAGE_KEY_REGEX_SCRIPTS_V5,
            JSON.stringify(data)
          );
          loadScriptsFromLocalStorage(); // This will process 'data'
          if (oldStorage)
            localStorage.setItem(
              LOCAL_STORAGE_KEY_REGEX_SCRIPTS_V5,
              oldStorage
            );
          // Restore if needed, though we usually replace
          else localStorage.removeItem(LOCAL_STORAGE_KEY_REGEX_SCRIPTS_V5); // Or clear if it was empty

          console.log(
            `[handleImport] Imported ${savedScripts.value.length} scripts from file.`
          );
          if (savedScripts.value.length > 0) {
            loadScriptToEdit(sortedSavedScripts.value[0]);
          } else {
            prepareNewScript(false);
          }
          saveScriptsToLocalStorage(); // Save the newly processed imported scripts
          ElMessage.success(
            `成功导入 ${data.length} 个脚本 (处理后 ${savedScripts.value.length} 个)。`
          );
        }
      );
    } catch (err: any) {
      if (err !== "cancel" && err !== "forbidden") {
        ElMessage.error(`导入失败: ${err.message || "未知错误"}`);
        console.error("Import error:", err);
      }
    }
  };
  reader.onerror = () => ElMessage.error("文件读取失败。");
  reader.readAsText(file);
  return false;
};

const clearAllScripts = async () => {
  if (!savedScripts.value.length) {
    ElMessage.info("无脚本可清空。");
    return;
  }
  await performSafeAction(
    appSettings.safeModeLevel,
    `清空所有 ${savedScripts.value.length} 个脚本`,
    "此操作不可恢复！",
    () => {
      savedScripts.value = [];
      console.log("[clearAllScripts] All scripts cleared.");
      prepareNewScript(false);
      saveScriptsToLocalStorage(); // This will save an empty array
      ElMessage.success("所有脚本已清空。");
      checkedScriptIds.value = [];
    }
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden") console.warn(err);
  });
};

const updateScriptOrder = (scriptId: string, newOrderInput: number) => {
  const scriptsCopy = [...savedScripts.value];
  const targetScriptIndex = scriptsCopy.findIndex((s) => s.id === scriptId);

  if (targetScriptIndex === -1) {
    console.error(`[updateScriptOrder] Script ID ${scriptId} not found.`);
    return;
  }

  const scriptToMove = scriptsCopy.splice(targetScriptIndex, 1)[0];

  // newOrderInput is the desired *order value*, not necessarily the target index.
  // We should insert based on this desired order value relative to others.
  // For simplicity if draggable handles visual reordering and then calls this
  // with an index-like newOrderInput, we can treat it as a target index.
  // But the draggable onEnd already provides newIndex.
  // This function is more for the manual input field.

  // Let's assume newOrderInput is the desired final 'order' property.
  // We'll re-sort and re-assign all orders.
  scriptToMove.order = newOrderInput;

  // Add it back, then sort all by 'order', then re-index 'order'
  scriptsCopy.push(scriptToMove);
  scriptsCopy.sort((a, b) => a.order - b.order);

  savedScripts.value = scriptsCopy.map((script, index) => ({
    ...script,
    order: index, // Re-assign sequential order properties
  }));

  console.log(
    `[updateScriptOrder] Script ID ${scriptId} order updated. New list order assigned.`
  );
  saveScriptsToLocalStorage();
  ElMessage.success(`脚本顺序已更新。`);
};

watch(
  [
    selectedScriptId,
    isCreatingNew,
    () => editableScript.value.scriptName,
    () => editableScript.value.id,
  ],
  ([newSelectedId, newIsCreating, newName, newEditableId]) => {
    if (
      mobileActiveTab.value === "editor" &&
      !newSelectedId && // No script is selected from the list
      !newIsCreating && // Not in the process of creating a new one (i.e. form was not cleared by prepareNewScript)
      (!newEditableId || !newName.trim()) // And the editor form is effectively empty or for a non-existent script
    ) {
      console.log(
        "[MobileTabWatch] Switching to list tab due to empty editor state."
      );
      mobileActiveTab.value = "list";
    }
  }
);
</script>

<style scoped>
.custom-textarea :deep(.el-textarea__inner) {
  height: 100% !important;
  flex-grow: 1;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
    monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
}
.custom-textarea.el-textarea {
  --el-input-border-color: transparent;
  --el-input-hover-border-color: transparent;
  --el-input-focus-border-color: transparent;
  box-shadow: none !important;
}
.result-area {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
    monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}
.content-panel {
  background-color: var(--color-white, #ffffff);
  border-radius: var(--radius-xl, 0.75rem);
  border: 1px solid var(--color-neutral-200, #e5e7eb);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}
.dark .content-panel {
  background-color: var(--color-neutral-850, #1f2937);
  border-color: var(--color-neutral-750, #374151);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -4px rgba(0, 0, 0, 0.3);
}
.content-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--color-neutral-200, #e5e7eb);
}
.dark .content-panel-header {
  border-color: var(--color-neutral-700, #374151);
}
.content-panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-neutral-800, #1f2937);
}
.dark .content-panel-title {
  color: var(--color-neutral-200, #e5e7eb);
}
.content-panel-body {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
:deep(.entry-menu.el-menu) {
  background-color: transparent !important;
  border: none !important;
}
:deep(.entry-menu .el-menu-item) {
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
  height: auto !important;
  padding: 0.625rem 0.75rem !important;
  line-height: normal !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
:deep(.entry-menu .el-menu-item.is-active) {
  background-color: var(--color-accent-50, #eff6ff) !important;
  color: var(--color-accent-600, #2563eb) !important;
  position: relative;
}
.dark :deep(.entry-menu .el-menu-item.is-active) {
  background-color: var(--color-dark-active-menu-bg, #374151) !important;
  color: var(--color-dark-active-menu-text, #f9fafb) !important;
}
:deep(.entry-menu .el-menu-item.is-active::before) {
  content: "";
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  background-color: var(--color-accent-500, #3b82f6);
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}
.dark :deep(.entry-menu .el-menu-item.is-active::before) {
  background-color: var(
    --color-dark-active-menu-indicator,
    var(--color-accent-400, #60a5fa)
  );
}
.form-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-neutral-700, #374151);
  margin-bottom: 0.375rem;
}
.dark .form-label {
  color: var(--color-neutral-300, #d1d5db);
}
.form-help-text {
  font-size: 0.75rem;
  color: var(--color-neutral-500, #6b7280);
  margin-top: 0.375rem;
}
.dark .form-help-text {
  color: var(--color-neutral-400, #9ca3af);
}
:deep(
    .regex-main-tabs-mobile.el-tabs--border-card
      > .el-tabs__header
      .el-tabs__item
  ) {
  padding: 0;
}
:deep(.regex-main-tabs-mobile.el-tabs--border-card > .el-tabs__content) {
  padding: 0;
  flex-grow: 1;
  display: flex;
}
.regex-main-tabs-mobile .el-tab-pane {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.regex-main-tabs-mobile .el-tab-pane > .el-scrollbar {
  flex-grow: 1;
  height: 0;
}
.el-form-item {
  margin-bottom: 1.25rem;
}
.el-form-item:last-child {
  margin-bottom: 0;
}
.form-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-neutral-200);
  display: flex;
  align-items: center;
}
.dark .form-section-title {
  color: var(--color-neutral-300);
  border-color: var(--color-neutral-600);
}
.text-xxs {
  font-size: 0.6875rem;
  line-height: 0.875rem;
}
:deep(.compact-alert .el-alert__content) {
  padding: 2px 8px 2px 0px !important;
  display: flex;
  align-items: center;
}
:deep(.compact-alert .el-alert__title) {
  font-size: 0.7rem !important;
  line-height: 1rem !important;
}
:deep(.compact-alert .el-alert__icon) {
  font-size: 12px !important;
  width: 12px !important;
  margin-right: 4px;
}
.result-display-area :deep(.el-table .el-table__cell) {
  padding: 2px 0;
}
.test-case-card {
  transition: box-shadow 0.2s ease-in-out;
}
.test-case-card:hover {
  box-shadow: var(--el-box-shadow-light);
}
.dark .test-case-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
.original-text pre,
.step-result pre,
.step-result div.result-html-render {
  max-height: 120px;
  overflow-y: auto;
  background-color: var(--color-neutral-100, #f9fafb);
  padding: 0.375rem 0.5rem;
  border-radius: var(--radius-md, 0.25rem);
  font-size: 0.8125rem;
  line-height: 1.4;
}
.dark .original-text pre,
.dark .step-result pre,
.dark .step-result div.result-html-render {
  background-color: var(--color-neutral-750, #374151);
}
.hide-arrows::-webkit-outer-spin-button,
.hide-arrows::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.hide-arrows[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
.ghost-item {
  opacity: 0.5;
  background: var(--color-accent-100, #dbeafe);
  border: 1px dashed var(--color-accent-500, #3b82f6);
}

.prose :deep(p:first-child),
.prose :deep(p:last-child) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4),
.prose :deep(h5),
.prose :deep(h6) {
  margin-top: 0.8em;
  margin-bottom: 0.4em;
  line-height: 1.2;
}
.prose :deep(pre) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  padding: 0.5em;
  background-color: var(--color-neutral-200, #e5e7eb) !important;
}
.dark .prose :deep(pre) {
  background-color: var(--color-neutral-700, #374151) !important;
}
.prose :deep(ul),
.prose :deep(ol) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  padding-left: 1.5em;
}
.prose :deep(li) {
  margin-top: 0.1em;
  margin-bottom: 0.1em;
}
.prose :deep(blockquote) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  padding-left: 1em;
  border-left-width: 0.25rem;
  border-left-color: var(--color-neutral-300, #d1d5db);
}
.dark .prose :deep(blockquote) {
  border-left-color: var(--color-neutral-600, #4b5563);
}
.prose :deep(blockquote blockquote) {
  margin-left: 1em;
  padding-left: 0.75em;
  border-left-color: var(--color-accent-500, #3b82f6);
}
.dark .prose :deep(blockquote blockquote) {
  border-left-color: var(--color-accent-400, #60a5fa);
}
.prose :deep(blockquote blockquote blockquote) {
  margin-left: 1em;
  padding-left: 0.5em;
  border-left-color: var(--color-green-500, #22c55e);
}
.dark .prose :deep(blockquote blockquote blockquote) {
  border-left-color: var(--color-green-400, #4ade80);
}
</style>
