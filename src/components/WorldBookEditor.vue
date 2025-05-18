<template>
  <div class="h-full">
    <div class="md:hidden h-full flex flex-col">
      <el-tabs
        v-model="activeTab"
        type="border-card"
        class="flex-grow flex flex-col worldbook-tabs-mobile"
      >
        <el-tab-pane name="list" class="flex-grow flex flex-col !p-0">
          <template #label>
            <span class="flex items-center gap-1.5 px-2 py-1">
              <Icon icon="ph:list-bullets-duotone" class="text-base shrink-0" />
              <span class="truncate">条目列表</span>
            </span>
          </template>

          <div class="content-panel-header">
            <h2 class="content-panel-title flex items-center gap-2">
              <Icon
                icon="ph:list-bullets-duotone"
                class="text-xl text-accent-500 dark:text-accent-400 shrink-0"
              />
              <span class="truncate">世界书条目</span>
            </h2>
            <TooltipIconButton
              icon="ph:plus-circle-duotone"
              tooltipContent="新增条目"
              labelText="新增条目"
              tooltipPlacement="top"
              :tooltipOffset="8"
              :tooltipHideAfter="0"
              buttonClass="btn-primary-adv !p-1.5 sm:!p-2 shrink-0"
              iconClass="text-md sm:text-lg"
              @click="addNewEntry"
            />
          </div>
          <el-scrollbar class="flex-grow">
            <div v-if="!worldBookEntries.length" class="p-6 text-center">
              <el-empty description="暂无条目" :image-size="80"></el-empty>
            </div>
            <el-menu
              v-else
              :default-active="
                selectedEntryIndex !== null
                  ? String(selectedEntryIndex)
                  : undefined
              "
              @select="handleSelectEntry"
              class="entry-menu !border-none !bg-transparent py-1"
            >
              <el-menu-item
                v-for="(entry, index) in worldBookEntries"
                :key="entry.uid || index"
                :index="String(index)"
                class="!h-auto !px-3 !py-2.5 !leading-normal group"
              >
                <div class="flex-grow overflow-hidden w-full">
                  <div
                    class="text-sm font-medium text-neutral-700 dark:text-neutral-100 group-[.is-active]:text-accent-600 dark:group-[.is-active]:text-white truncate"
                  >
                    {{ entry.comment || `条目 ${index + 1}` }}
                  </div>
                  <div
                    class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center flex-wrap gap-1 group-[.is-active]:text-accent-500 dark:group-[.is-active]:text-accent-300/90"
                  >
                    <el-tag
                      v-if="entry.disable"
                      type="info"
                      size="small"
                      effect="dark"
                      >已禁用</el-tag
                    >
                    <el-tag
                      v-if="entry.constant"
                      type="success"
                      size="small"
                      effect="dark"
                      >常驻</el-tag
                    >
                    <span
                      v-if="!entry.disable && !entry.constant"
                      class="inline-block h-[18px]"
                    ></span>
                  </div>
                </div>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>

          <div class="content-panel-header !border-t !border-b-0 !py-2 !px-3">
            <div
              class="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-start"
            >
              <TooltipIconButton
                icon="ph:books-duotone"
                tooltipContent="复制整个世界书 (到剪贴板)"
                labelText="复制整个世界书"
                tooltipPlacement="top"
                :tooltipOffset="8"
                :tooltipHideAfter="0"
                buttonClass="btn-secondary-adv !p-1.5 sm:!p-2"
                iconClass="text-md sm:text-lg"
                @click="copyWorldBookToClipboard"
              />
              <TooltipIconButton
                icon="ph:clipboard-text-duotone"
                tooltipContent="从剪贴板导入整个世界书 (将替换现有)"
                labelText="从剪贴板导入整个世界书"
                tooltipPlacement="top"
                :tooltipOffset="8"
                :tooltipHideAfter="0"
                buttonClass="btn-warning-adv !p-1.5 sm:!p-2"
                iconClass="text-md sm:text-lg"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
                @click="showImportWorldBookDialog"
              />
              <span
                class="border-l border-neutral-300 dark:border-neutral-600 h-5 mx-0.5 sm:mx-1"
              ></span>
              <el-tooltip
                content="导出所有条目为JSON文件"
                placement="top"
                :show-arrow="false"
                :offset="8"
                :hide-after="0"
              >
                <button
                  @click="exportToJson"
                  class="btn-success-adv !py-1 !px-1.5 sm:!px-2 text-xs"
                >
                  <Icon
                    icon="ph:export-duotone"
                    width="16"
                    height="16"
                    class="mr-1 -ml-0.5 hidden sm:inline"
                  /><span class="sm:hidden">导出</span
                  ><span class="hidden sm:inline">导出JSON</span>
                </button>
              </el-tooltip>
              <el-tooltip
                content="从JSON文件导入条目 (将替换现有)"
                placement="top"
                :show-arrow="false"
                :offset="8"
                :hide-after="0"
              >
                <el-upload
                  action="#"
                  :before-upload="handleLoadFromJsonFile"
                  :show-file-list="false"
                  accept=".json"
                  :disabled="appSettings.safeModeLevel === 'forbidden'"
                >
                  <button
                    class="btn-warning-adv !py-1 !px-1.5 sm:!px-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="appSettings.safeModeLevel === 'forbidden'"
                  >
                    <Icon
                      icon="ph:download-simple-duotone"
                      width="16"
                      height="16"
                      class="mr-1 -ml-0.5 hidden sm:inline"
                    /><span class="sm:hidden">导入</span
                    ><span class="hidden sm:inline">导入JSON</span>
                  </button>
                </el-upload>
              </el-tooltip>
              <el-tooltip
                content="清空所有条目"
                placement="top"
                :show-arrow="false"
                :offset="8"
                :hide-after="0"
              >
                <button
                  @click="clearAllEntries"
                  class="btn-danger-adv !py-1 !px-1.5 sm:!px-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="appSettings.safeModeLevel === 'forbidden'"
                >
                  <Icon
                    icon="ph:trash-simple-duotone"
                    width="16"
                    height="16"
                    class="mr-1 -ml-0.5 hidden sm:inline"
                  /><span class="sm:hidden">清空</span
                  ><span class="hidden sm:inline">清空所有</span>
                </button>
              </el-tooltip>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane
          name="editor"
          class="flex-grow flex flex-col !p-0"
          :disabled="!selectedEntry"
        >
          <template #label>
            <span class="flex items-center gap-1.5 px-2 py-1">
              <Icon icon="ph:note-pencil-duotone" class="text-base shrink-0" />
              <span class="truncate max-w-[100px] sm:max-w-[120px]">{{
                selectedEntry ? selectedEntry.comment || "编辑中" : "编辑条目"
              }}</span>
            </span>
          </template>

          <div class="content-panel-header">
            <h2 class="content-panel-title flex items-center gap-2">
              <Icon
                icon="ph:note-pencil-duotone"
                class="text-xl text-accent-500 dark:text-accent-400 shrink-0"
              />
              <span
                class="truncate max-w-[calc(100vw-230px)] sm:max-w-[calc(100vw-280px)]"
                >编辑:
                <span class="text-accent-600 dark:text-accent-400">{{
                  selectedEntry ? selectedEntry.comment || "新条目" : "未选择"
                }}</span></span
              >
            </h2>
            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <TooltipIconButton
                icon="ph:copy-simple-duotone"
                tooltipContent="复制当前条目 (到剪贴板)"
                labelText="复制当前条目"
                tooltipPlacement="bottom"
                :tooltipOffset="8"
                :tooltipHideAfter="0"
                buttonClass="btn-secondary-adv !p-1.5 sm:!p-2"
                iconClass="text-md sm:text-lg"
                :disabled="!selectedEntry"
                @click="copySelectedEntry"
              />
              <TooltipIconButton
                icon="ph:clipboard-text-duotone"
                tooltipContent="从剪贴板粘贴为新条目"
                labelText="从剪贴板粘贴为新条目"
                tooltipPlacement="bottom"
                :tooltipOffset="8"
                :tooltipHideAfter="0"
                buttonClass="btn-warning-adv !p-1.5 sm:!p-2"
                iconClass="text-md sm:text-lg"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
                @click="showImportEntryDialog"
              />
              <TooltipIconButton
                v-if="selectedEntry"
                icon="ph:floppy-disk-duotone"
                tooltipContent="保存当前条目"
                labelText="保存当前条目"
                tooltipPlacement="bottom"
                :tooltipOffset="8"
                :tooltipHideAfter="0"
                buttonClass="btn-primary-adv !p-1.5 sm:!p-2"
                iconClass="text-md sm:text-lg"
                @click="saveCurrentEntry"
              />
              <TooltipIconButton
                v-if="selectedEntry"
                icon="ph:trash-duotone"
                tooltipContent="删除当前条目"
                labelText="删除当前条目"
                tooltipPlacement="bottom"
                :tooltipOffset="8"
                :tooltipHideAfter="0"
                buttonClass="btn-danger-adv !p-1.5 sm:!p-2"
                iconClass="text-md sm:text-lg group-hover:rotate-[15deg]"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
                @click="deleteSelectedEntry"
              />
            </div>
          </div>
          <el-scrollbar class="flex-grow">
            <div class="content-panel-body flex flex-col h-full">
              <div
                v-if="!selectedEntry"
                class="h-full flex flex-grow items-center justify-center p-4 text-center"
              >
                <el-empty
                  description="请在列表标签页中选择或新增一个条目进行编辑。"
                  :image-size="80"
                ></el-empty>
              </div>
              <el-form
                v-if="selectedEntry && editableEntry"
                :model="editableEntry"
                label-position="top"
                ref="entryFormRef"
                class="space-y-5 flex-grow p-3 sm:p-4"
              >
                <CardContainer
                  title="基本信息"
                  icon="ph:info-duotone"
                  headerClass="form-section-title flex items-center gap-2"
                  iconClass="text-lg text-inherit"
                >
                  <div class="space-y-5">
                    <div>
                      <label class="form-label">标题/备注 (Comment)</label
                      ><el-input
                        v-model="editableEntry.comment"
                        placeholder="给条目起个易于识别的名字"
                      />
                    </div>
                    <div>
                      <label class="form-label"
                        >主要关键词 (Key) -
                        <span
                          class="text-xs text-neutral-500 dark:text-neutral-400"
                          >逗号分隔, 支持 /regex/i</span
                        ></label
                      ><el-input
                        v-model="keysInput"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 4 }"
                        placeholder="例如: 角色名, /他说了什么/i, 地点A"
                      />
                      <p class="form-help-text">
                        提示: 普通文本关键词不要包含逗号，逗号被视作分隔符。
                      </p>
                    </div>
                    <div>
                      <label class="form-label">条目内容 (Content)</label
                      ><el-input
                        v-model="editableEntry.content"
                        type="textarea"
                        :autosize="{ minRows: 4, maxRows: 10 }"
                        placeholder="当条目激活时，这段文本会被插入到AI的提示中..."
                      />
                    </div>
                    <div class="pt-1">
                      <el-checkbox
                        v-model="editableEntry.addMemo"
                        label="插入时附带备注 (Add Memo)"
                      />
                    </div>
                  </div>
                </CardContainer>
                <CardContainer
                  title="触发与激活"
                  icon="ph:radio-button-duotone"
                  headerClass="form-section-title flex items-center gap-2"
                  iconClass="text-lg text-inherit"
                >
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <label class="form-label"
                        >次要关键词 (Optional Filter) -
                        <span
                          class="text-xs text-neutral-500 dark:text-neutral-400"
                          >逗号分隔</span
                        ></label
                      ><el-input
                        v-model="secondaryKeysInput"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 3 }"
                        placeholder="可选的过滤关键词"
                      />
                    </div>
                    <div>
                      <label class="form-label">次要关键词逻辑 (Logic)</label
                      ><el-select
                        v-model="editableEntry.selectiveLogic"
                        placeholder="选择逻辑"
                        class="w-full"
                        :disabled="!editableEntry.selective"
                        ><el-option label="与任意" :value="0" /><el-option
                          label="非所有"
                          :value="1" /><el-option
                          label="非任何"
                          :value="2" /><el-option
                          label="与所有"
                          :value="3" /></el-select
                      ><el-checkbox
                        v-model="editableEntry.selective"
                        label="启用次要逻辑"
                        class="mt-2.5"
                      />
                    </div>
                    <div class="flex flex-col">
                      <label class="form-label">常驻 (Constant)</label
                      ><el-switch v-model="editableEntry.constant" />
                    </div>
                    <div class="flex flex-col">
                      <label class="form-label">禁用 (Disable)</label
                      ><el-switch v-model="editableEntry.disable" />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="form-label">触发概率 (Probability %)</label>
                      <div class="flex items-center gap-3">
                        <el-slider
                          v-model="editableEntry.probability"
                          :min="0"
                          :max="100"
                          show-input
                          class="flex-grow"
                          :disabled="!editableEntry.useProbability"
                        /><el-checkbox
                          v-model="editableEntry.useProbability"
                          label="启用概率"
                          class="whitespace-nowrap"
                        />
                      </div>
                    </div>
                  </div>
                </CardContainer>
                <CardContainer
                  title="插入与顺序"
                  icon="ph:arrows-merge-duotone"
                  headerClass="form-section-title flex items-center gap-2"
                  iconClass="text-lg text-inherit"
                >
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-end"
                  >
                    <div>
                      <label class="form-label">插入顺序 (Order)</label
                      ><el-input-number
                        v-model="editableEntry.order"
                        :min="0"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="form-label">插入位置 (Position)</label
                      ><el-select
                        v-model="editableEntry.position"
                        placeholder="选择插入位置"
                        class="w-full"
                        ><el-option label="角色定义之前" :value="0" />
                        <el-option label="角色定义之后" :value="1" /><el-option
                          label="作者注释之前"
                          :value="2" />
                        <el-option label="作者注释之后" :value="3" /><el-option
                          label="@D"
                          :value="4" />
                        <el-option label="示例消息之前" :value="5" /><el-option
                          label="示例消息之后"
                          :value="6"
                      /></el-select>
                    </div>
                    <div v-if="editableEntry.position === 4">
                      <label class="form-label"
                        >深度角色 (Role for In-chat)</label
                      ><el-select
                        v-model="editableEntry.role"
                        placeholder="选择角色"
                        class="w-full"
                        ><el-option label="系统" :value="0" />
                        <el-option label="用户" :value="1" />
                        <el-option label="助手" :value="2"
                      /></el-select>
                    </div>
                  </div>
                </CardContainer>
                <CardContainer
                  title="扫描与匹配"
                  icon="ph:scan-duotone"
                  headerClass="form-section-title flex items-center gap-2"
                  iconClass="text-lg text-inherit"
                >
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-start"
                  >
                    <div>
                      <label class="form-label">扫描深度 (Scan Depth)</label
                      ><el-input-number
                        v-model="editableEntry.depth"
                        :min="0"
                        :max="999"
                        controls-position="right"
                        class="w-full"
                      />
                      <p class="form-help-text">0表示可能使用全局设置。</p>
                    </div>
                    <div class="flex flex-col items-start">
                      <label class="form-label">大小写敏感</label
                      ><el-switch v-model="editableEntry.caseSensitive" />
                    </div>
                    <div class="flex flex-col items-start">
                      <label class="form-label">匹配整个单词</label
                      ><el-switch v-model="editableEntry.matchWholeWords" />
                      <p class="form-help-text">非空格分词语言建议关闭。</p>
                    </div>
                    <div class="flex flex-col items-start">
                      <label class="form-label">启用向量匹配</label
                      ><el-switch v-model="editableEntry.vectorized" />
                    </div>
                  </div>
                </CardContainer>
                <CardContainer
                  title="递归与分组"
                  icon="ph:graph-duotone"
                  headerClass="form-section-title flex items-center gap-2"
                  iconClass="text-lg text-inherit"
                >
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-start"
                  >
                    <div class="flex flex-col">
                      <label class="form-label">排除递归激活</label
                      ><el-switch v-model="editableEntry.excludeRecursion" />
                    </div>
                    <div class="flex flex-col">
                      <label class="form-label">阻止后续递归</label
                      ><el-switch v-model="editableEntry.preventRecursion" />
                    </div>
                    <div class="flex flex-col">
                      <label class="form-label">仅在递归时激活</label
                      ><el-switch v-model="editableEntry.delayUntilRecursion" />
                    </div>
                    <div>
                      <label class="form-label">所属收录组 (Group)</label
                      ><el-input
                        v-model="editableEntry.group"
                        placeholder="组名, 多个用逗号分隔"
                      />
                    </div>
                    <div>
                      <label class="form-label">组内优先级/权重</label
                      ><el-input-number
                        v-model="editableEntry.groupPriority"
                        controls-position="right"
                        class="w-full"
                      />
                    </div>
                    <div class="flex flex-col items-start">
                      <label class="form-label">优先组内选择 (Prioritize)</label
                      ><el-switch v-model="editableEntry.groupOverride" />
                      <p class="form-help-text">开启后按Order选择</p>
                    </div>
                    <div class="flex flex-col items-start">
                      <label class="form-label">启用组内评分 (Scoring)</label
                      ><el-switch v-model="editableEntry.useGroupScoring" />
                      <p class="form-help-text">匹配关键词更多者优先</p>
                    </div>
                  </div>
                </CardContainer>
                <CardContainer
                  title="定时效果"
                  icon="ph:timer-duotone"
                  headerClass="form-section-title flex items-center gap-2"
                  iconClass="text-lg text-inherit"
                >
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-end"
                  >
                    <div>
                      <label class="form-label">粘滞回合数 (Sticky)</label
                      ><el-input-number
                        v-model="editableEntry.sticky"
                        :min="0"
                        controls-position="right"
                        class="w-full"
                      />
                      <p class="form-help-text">0表示不粘滞</p>
                    </div>
                    <div>
                      <label class="form-label">冷却回合数 (Cooldown)</label
                      ><el-input-number
                        v-model="editableEntry.cooldown"
                        :min="0"
                        controls-position="right"
                        class="w-full"
                      />
                      <p class="form-help-text">0表示无冷却</p>
                    </div>
                    <div>
                      <label class="form-label">延迟激活 (Delay)</label
                      ><el-input-number
                        v-model="editableEntry.delay"
                        :min="0"
                        controls-position="right"
                        class="w-full"
                      />
                      <p class="form-help-text">需N条消息后激活, 0无延迟</p>
                    </div>
                  </div>
                </CardContainer>
                <CardContainer
                  title="其他"
                  icon="ph:puzzle-piece-duotone"
                  headerClass="form-section-title flex items-center gap-2"
                  iconClass="text-lg text-inherit"
                >
                  <div>
                    <label class="form-label">自动化ID (Automation ID)</label
                    ><el-input
                      v-model="editableEntry.automationId"
                      placeholder="用于Quick Replies扩展"
                    />
                  </div>
                </CardContainer>
              </el-form>
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="hidden md:flex md:flex-row gap-4 md:gap-6 h-full">
      <div class="w-full md:w-1/3 lg:w-1/4 flex flex-col content-panel h-full">
        <div class="content-panel-header">
          <h2 class="content-panel-title flex items-center gap-2">
            <Icon
              icon="ph:list-bullets-duotone"
              class="text-xl text-accent-500 dark:text-accent-400"
            />
            世界书条目
          </h2>
          <el-tooltip
            content="新增条目"
            placement="top"
            :show-arrow="false"
            :offset="8"
            :hide-after="0"
          >
            <button
              @click="addNewEntry"
              class="btn-primary-adv !p-2 aspect-square group"
              aria-label="新增条目"
            >
              <Icon
                icon="ph:plus-circle-duotone"
                class="text-lg group-hover:scale-110 transition-transform"
              />
            </button>
          </el-tooltip>
        </div>
        <el-scrollbar class="flex-grow">
          <div v-if="!worldBookEntries.length" class="p-6 text-center">
            <el-empty description="暂无条目" :image-size="100"></el-empty>
          </div>
          <el-menu
            v-else
            :default-active="
              selectedEntryIndex !== null
                ? String(selectedEntryIndex)
                : undefined
            "
            @select="handleSelectEntry"
            class="entry-menu !border-none !bg-transparent py-1"
          >
            <el-menu-item
              v-for="(entry, index) in worldBookEntries"
              :key="entry.uid || index"
              :index="String(index)"
              class="!h-auto !px-3 !py-2.5 !leading-normal group"
            >
              <div class="flex-grow overflow-hidden w-full">
                <div
                  class="text-sm font-medium text-neutral-700 dark:text-neutral-100 group-[.is-active]:text-accent-600 dark:group-[.is-active]:text-white truncate"
                >
                  {{ entry.comment || `条目 ${index + 1}` }}
                </div>
                <div
                  class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center flex-wrap gap-1 group-[.is-active]:text-accent-500 dark:group-[.is-active]:text-accent-300/90"
                >
                  <el-tag
                    v-if="entry.disable"
                    type="info"
                    size="small"
                    effect="dark"
                    >已禁用</el-tag
                  >
                  <el-tag
                    v-if="entry.constant"
                    type="success"
                    size="small"
                    effect="dark"
                    >常驻</el-tag
                  >
                  <span
                    v-if="!entry.disable && !entry.constant"
                    class="inline-block h-[18px]"
                  ></span>
                </div>
              </div>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
        <div class="content-panel-header !border-t !border-b-0">
          <div class="flex flex-wrap items-center gap-2 md:gap-3 justify-start">
            <el-tooltip
              content="复制整个世界书 (到剪贴板)"
              placement="top"
              :show-arrow="false"
              :offset="8"
              :hide-after="0"
            >
              <button
                @click="copyWorldBookToClipboard"
                class="btn-secondary-adv !p-2.5 aspect-square group"
                aria-label="复制整个世界书"
              >
                <Icon
                  icon="ph:books-duotone"
                  class="text-lg group-hover:scale-110 transition-transform"
                />
              </button>
            </el-tooltip>
            <el-tooltip
              content="从剪贴板导入整个世界书 (将替换现有)"
              placement="top"
              :show-arrow="false"
              :offset="8"
              :hide-after="0"
            >
              <button
                @click="showImportWorldBookDialog"
                class="btn-warning-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="从剪贴板导入整个世界书"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
              >
                <Icon
                  icon="ph:clipboard-text-duotone"
                  class="text-lg group-hover:scale-110 transition-transform"
                />
              </button>
            </el-tooltip>
            <span
              class="border-l border-neutral-300 dark:border-neutral-600 h-6 mx-1 md:mx-2"
            ></span>
            <el-tooltip
              content="导出所有条目为JSON文件"
              placement="top"
              :show-arrow="false"
              :offset="8"
              :hide-after="0"
            >
              <button
                @click="exportToJson"
                class="btn-success-adv !p-2.5 aspect-square group"
                aria-label="导出所有条目为JSON文件"
              >
                <Icon
                  icon="ph:export-duotone"
                  class="text-lg group-hover:scale-110 transition-transform"
                />
              </button>
            </el-tooltip>
            <el-tooltip
              content="从JSON文件导入条目 (将替换现有)"
              placement="top"
              :show-arrow="false"
              :offset="8"
              :hide-after="0"
            >
              <el-upload
                action="#"
                :before-upload="handleLoadFromJsonFile"
                :show-file-list="false"
                accept=".json"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
              >
                <button
                  class="btn-warning-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="从JSON文件导入条目"
                  :disabled="appSettings.safeModeLevel === 'forbidden'"
                >
                  <Icon
                    icon="ph:download-simple-duotone"
                    class="text-lg group-hover:scale-110 transition-transform"
                  />
                </button>
              </el-upload>
            </el-tooltip>
            <el-tooltip
              content="清空所有条目"
              placement="top"
              :show-arrow="false"
              :offset="8"
              :hide-after="0"
            >
              <button
                @click="clearAllEntries"
                class="btn-danger-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="清空所有条目"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
              >
                <Icon
                  icon="ph:trash-simple-duotone"
                  class="text-lg group-hover:rotate-[15deg] transition-transform"
                />
              </button>
            </el-tooltip>
          </div>
        </div>
      </div>

      <div class="w-full md:w-2/3 lg:w-3/4 flex flex-col content-panel h-full">
        <div class="content-panel-header">
          <h2 class="content-panel-title flex items-center gap-2">
            <Icon
              icon="ph:note-pencil-duotone"
              class="text-xl text-accent-500 dark:text-accent-400"
            />
            编辑:
            <span class="text-accent-600 dark:text-accent-400">{{
              selectedEntry ? selectedEntry.comment || "新条目" : "未选择条目"
            }}</span>
          </h2>
          <div class="flex items-center gap-2 md:gap-3">
            <el-tooltip
              content="复制当前条目 (到剪贴板)"
              placement="bottom"
              :show-arrow="false"
              :offset="8"
              :hide-after="0"
            >
              <button
                @click="copySelectedEntry"
                :disabled="!selectedEntry"
                class="btn-secondary-adv !p-2.5 aspect-square group"
                aria-label="复制当前条目"
              >
                <Icon
                  icon="ph:copy-simple-duotone"
                  class="text-lg group-hover:scale-110 transition-transform"
                />
              </button>
            </el-tooltip>
            <el-tooltip
              content="从剪贴板粘贴为新条目"
              placement="bottom"
              :show-arrow="false"
              :offset="8"
              :hide-after="0"
            >
              <button
                @click="showImportEntryDialog"
                class="btn-warning-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="从剪贴板粘贴为新条目"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
              >
                <Icon
                  icon="ph:clipboard-text-duotone"
                  class="text-lg group-hover:scale-110 transition-transform"
                />
              </button>
            </el-tooltip>
            <el-tooltip
              v-if="selectedEntry"
              content="保存当前条目"
              placement="bottom"
              :show-arrow="false"
              :offset="8"
              :hide-after="0"
            >
              <button
                @click="saveCurrentEntry"
                class="btn-primary-adv !p-2.5 aspect-square group"
                aria-label="保存当前条目"
              >
                <Icon
                  icon="ph:floppy-disk-duotone"
                  class="text-lg group-hover:scale-110 transition-transform"
                />
              </button>
            </el-tooltip>
            <el-tooltip
              v-if="selectedEntry"
              content="删除当前条目"
              placement="bottom"
              :show-arrow="false"
              :offset="8"
              :hide-after="0"
            >
              <button
                @click="deleteSelectedEntry"
                class="btn-danger-adv !p-2.5 aspect-square group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="删除当前条目"
                :disabled="appSettings.safeModeLevel === 'forbidden'"
              >
                <Icon
                  icon="ph:trash-duotone"
                  class="text-lg group-hover:rotate-[15deg] transition-transform"
                />
              </button>
            </el-tooltip>
          </div>
        </div>
        <el-scrollbar class="flex-grow">
          <div class="content-panel-body flex flex-col h-full">
            <div
              v-if="!selectedEntry"
              class="h-full flex flex-grow items-center justify-center"
            >
              <el-empty
                description="请选择或新增条目进行编辑"
                :image-size="150"
              ></el-empty>
            </div>
            <el-form
              v-if="selectedEntry && editableEntry"
              :model="editableEntry"
              label-position="top"
              ref="entryFormRef"
              class="space-y-6 flex-grow"
            >
              <section class="form-section">
                <h3 class="form-section-title flex items-center gap-2">
                  <Icon
                    icon="ph:info-duotone"
                    class="text-lg text-inherit"
                  />基本信息
                </h3>
                <div class="space-y-5">
                  <div>
                    <label class="form-label">标题/备注 (Comment)</label
                    ><el-input
                      v-model="editableEntry.comment"
                      placeholder="给条目起个易于识别的名字"
                    />
                  </div>
                  <div>
                    <label class="form-label"
                      >主要关键词 (Key) -
                      <span
                        class="text-xs text-neutral-500 dark:text-neutral-400"
                        >逗号分隔, 支持 /regex/i</span
                      ></label
                    ><el-input
                      v-model="keysInput"
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 4 }"
                      placeholder="例如: 角色名, /他说了什么/i, 地点A"
                    />
                    <p class="form-help-text">
                      提示: 普通文本关键词不要包含逗号，逗号被视作分隔符。
                    </p>
                  </div>
                  <div>
                    <label class="form-label">条目内容 (Content)</label
                    ><el-input
                      v-model="editableEntry.content"
                      type="textarea"
                      :autosize="{ minRows: 5, maxRows: 12 }"
                      placeholder="当条目激活时，这段文本会被插入到AI的提示中..."
                    />
                  </div>
                  <div class="pt-1">
                    <el-checkbox
                      v-model="editableEntry.addMemo"
                      label="插入时附带备注 (Add Memo)"
                    />
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title flex items-center gap-2">
                  <Icon
                    icon="ph:radio-button-duotone"
                    class="text-lg text-inherit"
                  />触发与激活
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label class="form-label"
                      >次要关键词 (Optional Filter) -
                      <span
                        class="text-xs text-neutral-500 dark:text-neutral-400"
                        >逗号分隔</span
                      ></label
                    ><el-input
                      v-model="secondaryKeysInput"
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 3 }"
                      placeholder="可选的过滤关键词"
                    />
                  </div>
                  <div>
                    <label class="form-label">次要关键词逻辑 (Logic)</label
                    ><el-select
                      v-model="editableEntry.selectiveLogic"
                      placeholder="选择逻辑"
                      class="w-full"
                      :disabled="!editableEntry.selective"
                      ><el-option label="与任意" :value="0" /><el-option
                        label="非所有"
                        :value="1" /><el-option
                        label="非任何"
                        :value="2" /><el-option
                        label="与所有"
                        :value="3" /></el-select
                    ><el-checkbox
                      v-model="editableEntry.selective"
                      label="启用次要逻辑"
                      class="mt-2.5"
                    />
                  </div>
                  <div class="flex flex-col">
                    <label class="form-label">常驻 (Constant)</label
                    ><el-switch v-model="editableEntry.constant" />
                  </div>
                  <div class="flex flex-col">
                    <label class="form-label">禁用 (Disable)</label
                    ><el-switch v-model="editableEntry.disable" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="form-label">触发概率 (Probability %)</label>
                    <div class="flex items-center gap-3">
                      <el-slider
                        v-model="editableEntry.probability"
                        :min="0"
                        :max="100"
                        show-input
                        class="flex-grow"
                        :disabled="!editableEntry.useProbability"
                      /><el-checkbox
                        v-model="editableEntry.useProbability"
                        label="启用概率"
                        class="whitespace-nowrap"
                      />
                    </div>
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title flex items-center gap-2">
                  <Icon
                    icon="ph:arrows-merge-duotone"
                    class="text-lg text-inherit"
                  />插入与顺序
                </h3>
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-end"
                >
                  <div>
                    <label class="form-label">插入顺序 (Order)</label
                    ><el-input-number
                      v-model="editableEntry.order"
                      :min="0"
                      controls-position="right"
                      class="w-full"
                    />
                  </div>
                  <div>
                    <label class="form-label">插入位置 (Position)</label
                    ><el-select
                      v-model="editableEntry.position"
                      placeholder="选择插入位置"
                      class="w-full"
                      ><el-option label="角色定义之前" :value="0" />
                      <el-option label="角色定义之后" :value="1" /><el-option
                        label="作者注释之前"
                        :value="2" />
                      <el-option label="作者注释之后" :value="3" /><el-option
                        label="@D"
                        :value="4" />
                      <el-option label="示例消息之前" :value="5" /><el-option
                        label="示例消息之后"
                        :value="6"
                    /></el-select>
                  </div>
                  <div v-if="editableEntry.position === 4">
                    <label class="form-label">深度角色 (Role for In-chat)</label
                    ><el-select
                      v-model="editableEntry.role"
                      placeholder="选择角色"
                      class="w-full"
                      ><el-option label="系统" :value="0" />
                      <el-option label="用户" :value="1" />
                      <el-option label="助手" :value="2"
                    /></el-select>
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title flex items-center gap-2">
                  <Icon
                    icon="ph:scan-duotone"
                    class="text-lg text-inherit"
                  />扫描与匹配
                </h3>
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-start"
                >
                  <div>
                    <label class="form-label">扫描深度 (Scan Depth)</label
                    ><el-input-number
                      v-model="editableEntry.depth"
                      :min="0"
                      :max="999"
                      controls-position="right"
                      class="w-full"
                    />
                    <p class="form-help-text">0表示可能使用全局设置。</p>
                  </div>
                  <div class="flex flex-col items-start">
                    <label class="form-label">大小写敏感</label
                    ><el-switch v-model="editableEntry.caseSensitive" />
                  </div>
                  <div class="flex flex-col items-start">
                    <label class="form-label">匹配整个单词</label
                    ><el-switch v-model="editableEntry.matchWholeWords" />
                    <p class="form-help-text">非空格分词语言建议关闭。</p>
                  </div>
                  <div class="flex flex-col items-start">
                    <label class="form-label">启用向量匹配</label
                    ><el-switch v-model="editableEntry.vectorized" />
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title flex items-center gap-2">
                  <Icon
                    icon="ph:graph-duotone"
                    class="text-lg text-inherit"
                  />递归与分组
                </h3>
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-start"
                >
                  <div class="flex flex-col">
                    <label class="form-label">排除递归激活</label
                    ><el-switch v-model="editableEntry.excludeRecursion" />
                  </div>
                  <div class="flex flex-col">
                    <label class="form-label">阻止后续递归</label
                    ><el-switch v-model="editableEntry.preventRecursion" />
                  </div>
                  <div class="flex flex-col">
                    <label class="form-label">仅在递归时激活</label
                    ><el-switch v-model="editableEntry.delayUntilRecursion" />
                  </div>
                  <div>
                    <label class="form-label">所属收录组 (Group)</label
                    ><el-input
                      v-model="editableEntry.group"
                      placeholder="组名, 多个用逗号分隔"
                    />
                  </div>
                  <div>
                    <label class="form-label">组内优先级/权重</label
                    ><el-input-number
                      v-model="editableEntry.groupPriority"
                      controls-position="right"
                      class="w-full"
                    />
                  </div>
                  <div class="flex flex-col items-start">
                    <label class="form-label">优先组内选择 (Prioritize)</label
                    ><el-switch v-model="editableEntry.groupOverride" />
                    <p class="form-help-text">开启后按Order选择</p>
                  </div>
                  <div class="flex flex-col items-start">
                    <label class="form-label">启用组内评分 (Scoring)</label
                    ><el-switch v-model="editableEntry.useGroupScoring" />
                    <p class="form-help-text">匹配关键词更多者优先</p>
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title flex items-center gap-2">
                  <Icon
                    icon="ph:timer-duotone"
                    class="text-lg text-inherit"
                  />定时效果
                </h3>
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-end"
                >
                  <div>
                    <label class="form-label">粘滞回合数 (Sticky)</label
                    ><el-input-number
                      v-model="editableEntry.sticky"
                      :min="0"
                      controls-position="right"
                      class="w-full"
                    />
                    <p class="form-help-text">0表示不粘滞</p>
                  </div>
                  <div>
                    <label class="form-label">冷却回合数 (Cooldown)</label
                    ><el-input-number
                      v-model="editableEntry.cooldown"
                      :min="0"
                      controls-position="right"
                      class="w-full"
                    />
                    <p class="form-help-text">0表示无冷却</p>
                  </div>
                  <div>
                    <label class="form-label">延迟激活 (Delay)</label
                    ><el-input-number
                      v-model="editableEntry.delay"
                      :min="0"
                      controls-position="right"
                      class="w-full"
                    />
                    <p class="form-help-text">需N条消息后激活, 0无延迟</p>
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title flex items-center gap-2">
                  <Icon
                    icon="ph:puzzle-piece-duotone"
                    class="text-lg text-inherit"
                  />其他
                </h3>
                <div>
                  <label class="form-label">自动化ID (Automation ID)</label
                  ><el-input
                    v-model="editableEntry.automationId"
                    placeholder="用于Quick Replies扩展"
                  />
                </div>
              </section>
            </el-form>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import {
  ElMessage,
  ElMessageBox,
  ElForm,
  ElScrollbar,
  ElMenu,
  ElMenuItem,
  ElEmpty,
  ElInput,
  ElTag,
  ElSelect,
  ElOption,
  ElCheckbox,
  ElSwitch,
  ElSlider,
  ElInputNumber,
  ElUpload,
  ElTooltip,
  ElTabs,
  ElTabPane,
} from "element-plus";
import { Icon } from "@iconify/vue";
import CardContainer from "@core/components/ui/CardContainer.vue";
// import { saveAs } from 'file-saver';
import { useAppSettingsStore } from "@core/store/appSettings.store";
import {
  saveToLocalStorage as saveToLS,
  loadFromLocalStorage as loadFromLS,
  // clearLocalStorage as clearLS,
  initAutoSave as initWorldBookAutoSave,
  clearAutoSave as clearWorldBookAutoSave,
} from "@core/utils/localStorage.utils";
import { performSafeAction } from "@core/utils/safeAction.utils";
import type { IWorldBookEntry } from "../modules/world/types/world.types"; // Corrected path

const LOCAL_STORAGE_KEY_WORLDBOOK = "worldBookEditorData";
const appSettings = useAppSettingsStore();

const worldBookEntries = ref<IWorldBookEntry[]>([]);
const selectedEntryIndex = ref<number | null>(null);
const editableEntry = ref<Partial<IWorldBookEntry>>({});
const entryFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const activeTab = ref<"list" | "editor">("list");
let autoSaveTimer: number | null = null;

const selectedEntry = computed<IWorldBookEntry | null>(() => {
  if (
    selectedEntryIndex.value !== null &&
    worldBookEntries.value[selectedEntryIndex.value]
  ) {
    return worldBookEntries.value[selectedEntryIndex.value];
  }
  return null;
});

const keysInput = computed({
  get: () =>
    editableEntry.value?.key ? editableEntry.value.key.join(", ") : "",
  set: (value) => {
    if (editableEntry.value) {
      editableEntry.value.key = value
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);
    }
  },
});

const secondaryKeysInput = computed({
  get: () =>
    editableEntry.value?.keysecondary
      ? editableEntry.value.keysecondary.join(", ")
      : "",
  set: (value) => {
    if (editableEntry.value) {
      editableEntry.value.keysecondary = value
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);
    }
  },
});

watch(
  selectedEntry,
  (newEntry) => {
    if (newEntry) {
      const defaultFullEntry = createDefaultEntryData(
        newEntry.uid || Date.now()
      );
      editableEntry.value = {
        ...defaultFullEntry,
        ...JSON.parse(JSON.stringify(newEntry)),
      };
    } else {
      editableEntry.value = {};
    }
    nextTick(() => {
      entryFormRef.value?.clearValidate();
    });
  },
  { deep: true, immediate: true }
);

function createDefaultEntryData(uid: number): IWorldBookEntry {
  return {
    uid: uid,
    comment: "",
    key: [],
    content: "",
    addMemo: false,
    order: 0,
    constant: false,
    disable: false,
    keysecondary: [],
    selectiveLogic: 0,
    selective: false,
    excludeRecursion: false,
    preventRecursion: false,
    delayUntilRecursion: false,
    probability: 100,
    useProbability: false,
    position: 1,
    role: 0,
    depth: 0,
    caseSensitive: false,
    matchWholeWords: false,
    vectorized: false,
    group: "",
    groupPriority: 0,
    groupOverride: false,
    useGroupScoring: false,
    sticky: 0,
    cooldown: 0,
    delay: 0,
    automationId: "",
  };
}

const addNewEntry = () => {
  const newUid = Date.now();
  const newEntryData = createDefaultEntryData(newUid);
  newEntryData.comment = `新条目 ${worldBookEntries.value.length + 1}`;
  worldBookEntries.value.unshift(newEntryData);
  selectedEntryIndex.value = 0;
  activeTab.value = "editor";
};

const handleSelectEntry = (indexStr: string) => {
  const index = parseInt(indexStr, 10);
  if (index >= 0 && index < worldBookEntries.value.length) {
    selectedEntryIndex.value = index;
    activeTab.value = "editor";
  }
};

const saveCurrentEntry = () => {
  if (
    selectedEntryIndex.value !== null &&
    editableEntry.value &&
    editableEntry.value.uid !== undefined
  ) {
    const entryToSave = {
      ...createDefaultEntryData(editableEntry.value.uid),
      ...editableEntry.value,
    };
    entryToSave.key = Array.isArray(entryToSave.key) ? entryToSave.key : [];
    entryToSave.keysecondary = Array.isArray(entryToSave.keysecondary)
      ? entryToSave.keysecondary
      : [];
    worldBookEntries.value[selectedEntryIndex.value] = JSON.parse(
      JSON.stringify(entryToSave as IWorldBookEntry)
    );
    ElMessage.success("条目已保存！");
    saveWorldBookToLocalStorage();
  } else {
    ElMessage.error("无法保存条目，缺少UID或未选择条目。");
  }
};

const deleteSelectedEntry = async () => {
  if (selectedEntryIndex.value !== null && selectedEntry.value) {
    const entryName =
      selectedEntry.value.comment || `条目 (ID: ${selectedEntry.value.uid})`;
    await performSafeAction(
      appSettings.safeModeLevel,
      "删除条目",
      entryName,
      () => {
        worldBookEntries.value.splice(selectedEntryIndex.value!, 1);
        if (worldBookEntries.value.length > 0) {
          selectedEntryIndex.value = Math.max(0, selectedEntryIndex.value! - 1);
          if (selectedEntryIndex.value >= worldBookEntries.value.length) {
            selectedEntryIndex.value =
              worldBookEntries.value.length > 0
                ? worldBookEntries.value.length - 1
                : null;
          }
        } else {
          selectedEntryIndex.value = null;
          activeTab.value = "list";
        }
        saveWorldBookToLocalStorage();
      }
    ).catch((err) => {
      if (err !== "cancel" && err !== "forbidden")
        console.warn("删除条目操作未成功完成:", err);
    });
  }
};

const copySelectedEntry = async () => {
  if (!selectedEntry.value) {
    ElMessage.warning("请先选择一个条目进行复制。");
    return;
  }
  try {
    const entryToCopy = { ...selectedEntry.value };
    delete entryToCopy.uid;
    const jsonData = JSON.stringify(entryToCopy, null, 2);
    await navigator.clipboard.writeText(jsonData);
    ElMessage.success("当前条目数据已复制到剪贴板！");
  } catch (error) {
    ElMessage.error("复制失败: " + (error as Error).message);
  }
};

const showImportEntryDialog = async () => {
  if (appSettings.safeModeLevel === "forbidden") {
    ElMessage.warning(`当前处于禁止模式，无法从剪贴板粘贴新条目。`);
    return;
  }

  try {
    const { value } = await ElMessageBox.prompt(
      "请粘贴单个世界书条目的JSON数据到下方：",
      "粘贴为新条目",
      {
        confirmButtonText: "确认导入",
        cancelButtonText: "取消",
        inputType: "textarea",
        inputPlaceholder: "在此处粘贴条目JSON数据...",
        customClass: "app-dialog break-all app-messagebox-textarea-6",
        inputValidator: (val) => {
          if (!val || val.trim() === "") return "输入内容不能为空。";
          try {
            const parsed = JSON.parse(val);
            if (typeof parsed !== "object" || parsed === null)
              return "数据必须是一个JSON对象。";
            return true;
          } catch {
            return "数据格式无效，请输入正确的JSON。";
          }
        },
      }
    );

    await performSafeAction(
      appSettings.safeModeLevel,
      "从剪贴板粘贴新条目",
      "此操作将添加一个新条目",
      () => {
        const parsedEntryData = JSON.parse(value);
        const newUid = Date.now();
        const baseEntry = createDefaultEntryData(newUid);
        const newEntry: IWorldBookEntry = {
          ...baseEntry,
          ...parsedEntryData,
          uid: newUid,
          comment:
            parsedEntryData.comment ||
            `导入条目 ${worldBookEntries.value.length + 1}`,
          key: Array.isArray(parsedEntryData.key)
            ? parsedEntryData.key.map(String)
            : [],
          keysecondary: Array.isArray(parsedEntryData.keysecondary)
            ? parsedEntryData.keysecondary.map(String)
            : [],
        };
        worldBookEntries.value.unshift(newEntry);
        selectedEntryIndex.value = 0;
        activeTab.value = "editor";
        saveWorldBookToLocalStorage();
      }
    );
  } catch (error) {
    if (error !== "cancel" && error !== "forbidden") {
      console.warn("从剪贴板粘贴新条目操作未成功完成或被取消:", error);
    }
  }
};

const formatWorldBookForExport = (): {
  entries: Record<string, Omit<IWorldBookEntry, "uid">>;
} => {
  const exportData: { entries: Record<string, Omit<IWorldBookEntry, "uid">> } = {
    entries: {},
  };
  worldBookEntries.value.forEach((entry) => {
    const { uid, ...entryDataToExport } = entry;
    exportData.entries[String(entry.uid)] = entryDataToExport;
  });
  return exportData;
};

const processImportedWorldBookData = (
  jsonData: any
): IWorldBookEntry[] | null => {
  if (
    jsonData &&
    typeof jsonData.entries === "object" &&
    jsonData.entries !== null
  ) {
    const loadedEntries: IWorldBookEntry[] = [];
    let uidCounter = Date.now();
    Object.keys(jsonData.entries).forEach((entryKey) => {
      const entryFromFile = jsonData.entries[entryKey];
      let currentUid: number;
      const uidFromKey = parseInt(entryKey, 10);
      if (!isNaN(uidFromKey)) {
        currentUid = uidFromKey;
      } else if (entryFromFile.uid && typeof entryFromFile.uid === "number") {
        currentUid = entryFromFile.uid;
      } else {
        currentUid = uidCounter++;
      }

      const baseEntry = createDefaultEntryData(currentUid);
      const newEntry: IWorldBookEntry = {
        ...baseEntry,
        ...entryFromFile,
        uid: currentUid,
        key: Array.isArray(entryFromFile.key)
          ? entryFromFile.key.map(String)
          : baseEntry.key,
        keysecondary: Array.isArray(entryFromFile.keysecondary)
          ? entryFromFile.keysecondary.map(String)
          : baseEntry.keysecondary,
        addMemo:
          typeof entryFromFile.addMemo === "boolean"
            ? entryFromFile.addMemo
            : baseEntry.addMemo,
        constant:
          typeof entryFromFile.constant === "boolean"
            ? entryFromFile.constant
            : baseEntry.constant,
        disable:
          typeof entryFromFile.disable === "boolean"
            ? entryFromFile.disable
            : baseEntry.disable,
        selective:
          typeof entryFromFile.selective === "boolean"
            ? entryFromFile.selective
            : baseEntry.selective,
        excludeRecursion:
          typeof entryFromFile.excludeRecursion === "boolean"
            ? entryFromFile.excludeRecursion
            : baseEntry.excludeRecursion,
        preventRecursion:
          typeof entryFromFile.preventRecursion === "boolean"
            ? entryFromFile.preventRecursion
            : baseEntry.preventRecursion,
        delayUntilRecursion:
          typeof entryFromFile.delayUntilRecursion === "boolean"
            ? entryFromFile.delayUntilRecursion
            : baseEntry.delayUntilRecursion,
        useProbability:
          typeof entryFromFile.useProbability === "boolean"
            ? entryFromFile.useProbability
            : baseEntry.useProbability,
        caseSensitive:
          typeof entryFromFile.caseSensitive === "boolean"
            ? entryFromFile.caseSensitive
            : baseEntry.caseSensitive,
        matchWholeWords:
          typeof entryFromFile.matchWholeWords === "boolean"
            ? entryFromFile.matchWholeWords
            : baseEntry.matchWholeWords,
        vectorized:
          typeof entryFromFile.vectorized === "boolean"
            ? entryFromFile.vectorized
            : baseEntry.vectorized,
        groupOverride:
          typeof entryFromFile.groupOverride === "boolean"
            ? entryFromFile.groupOverride
            : baseEntry.groupOverride,
        useGroupScoring:
          typeof entryFromFile.useGroupScoring === "boolean"
            ? entryFromFile.useGroupScoring
            : baseEntry.useGroupScoring,
        order:
          typeof entryFromFile.order === "number"
            ? entryFromFile.order
            : baseEntry.order,
        selectiveLogic:
          typeof entryFromFile.selectiveLogic === "number"
            ? entryFromFile.selectiveLogic
            : baseEntry.selectiveLogic,
        probability:
          typeof entryFromFile.probability === "number"
            ? entryFromFile.probability
            : baseEntry.probability,
        position:
          typeof entryFromFile.position === "number"
            ? entryFromFile.position
            : baseEntry.position,
        role:
          typeof entryFromFile.role === "number"
            ? entryFromFile.role
            : baseEntry.role,
        depth:
          typeof entryFromFile.depth === "number"
            ? entryFromFile.depth
            : baseEntry.depth,
        groupPriority:
          typeof entryFromFile.groupPriority === "number"
            ? entryFromFile.groupPriority
            : baseEntry.groupPriority,
        sticky:
          typeof entryFromFile.sticky === "number"
            ? entryFromFile.sticky
            : baseEntry.sticky,
        cooldown:
          typeof entryFromFile.cooldown === "number"
            ? entryFromFile.cooldown
            : baseEntry.cooldown,
        delay:
          typeof entryFromFile.delay === "number"
            ? entryFromFile.delay
            : baseEntry.delay,
        comment:
          typeof entryFromFile.comment === "string"
            ? entryFromFile.comment
            : baseEntry.comment,
        content:
          typeof entryFromFile.content === "string"
            ? entryFromFile.content
            : baseEntry.content,
        group:
          typeof entryFromFile.group === "string"
            ? entryFromFile.group
            : baseEntry.group,
        automationId:
          typeof entryFromFile.automationId === "string"
            ? entryFromFile.automationId
            : baseEntry.automationId,
      };
      loadedEntries.push(newEntry);
    });
    return loadedEntries;
  }
  return null;
};

const exportToJson = () => {
  if (!worldBookEntries.value.length) {
    ElMessage.warning("没有条目可以导出。");
    return;
  }
  const exportData = formatWorldBookForExport();
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "world_info.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  ElMessage.success("已导出为 world_info.json");
  saveWorldBookToLocalStorage();
};

const handleLoadFromJsonFile = (file: File): boolean => {
  performSafeAction(
    appSettings.safeModeLevel,
    "从文件导入世界书",
    "此操作将替换当前所有条目",
    async () => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            const loadedEntries = processImportedWorldBookData(jsonData);
            if (loadedEntries) {
              worldBookEntries.value = loadedEntries;
              selectedEntryIndex.value = loadedEntries.length > 0 ? 0 : null;
              activeTab.value =
                loadedEntries.length > 0
                  ? selectedEntryIndex.value !== null
                    ? "editor"
                    : "list"
                  : "list";
              saveWorldBookToLocalStorage();
              resolve();
            } else {
              reject(
                new Error('JSON文件格式不正确: 根对象必须包含 "entries" 对象。')
              );
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("文件读取出错"));
        reader.readAsText(file);
      });
    }
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("从文件导入世界书操作未成功完成:", err);
  });
  return false;
};

const copyWorldBookToClipboard = async () => {
  if (!worldBookEntries.value.length) {
    ElMessage.warning("没有条目可以复制。");
    return;
  }
  try {
    const exportData = formatWorldBookForExport();
    const jsonString = JSON.stringify(exportData, null, 2);
    await navigator.clipboard.writeText(jsonString);
    ElMessage.success("整个世界书数据已复制到剪贴板！");
  } catch (error) {
    ElMessage.error("复制世界书失败: " + (error as Error).message);
  }
};

const showImportWorldBookDialog = async () => {
  if (appSettings.safeModeLevel === "forbidden") {
    ElMessage.warning(`当前处于禁止模式，无法从剪贴板导入整个世界书。`);
    return;
  }
  try {
    const { value } = await ElMessageBox.prompt(
      '请粘贴整个世界书的JSON数据 (包含 "entries" 对象) 到下方：',
      "从剪贴板导入整个世界书",
      {
        confirmButtonText: "确认导入",
        cancelButtonText: "取消",
        inputType: "textarea",
        inputPlaceholder: "在此处粘贴世界书JSON数据...",
        customClass: "app-dialog break-all app-messagebox-textarea-8",
        inputValidator: (val) => {
          if (!val || val.trim() === "") return "输入内容不能为空。";
          try {
            const parsed = JSON.parse(val);
            if (
              typeof parsed !== "object" ||
              parsed === null ||
              typeof parsed.entries !== "object" ||
              parsed.entries === null
            ) {
              return '数据格式无效，根对象必须包含 "entries" 对象。';
            }
            return true;
          } catch {
            return "数据格式无效，请输入正确的JSON。";
          }
        },
      }
    );

    await performSafeAction(
      appSettings.safeModeLevel,
      "从剪贴板导入整个世界书",
      "此操作将替换当前所有条目",
      () => {
        const jsonData = JSON.parse(value);
        const loadedEntries = processImportedWorldBookData(jsonData);
        if (loadedEntries) {
          worldBookEntries.value = loadedEntries;
          selectedEntryIndex.value = loadedEntries.length > 0 ? 0 : null;
          activeTab.value =
            loadedEntries.length > 0
              ? selectedEntryIndex.value !== null
                ? "editor"
                : "list"
              : "list";
          saveWorldBookToLocalStorage();
        } else {
          throw new Error("数据结构不符合预期。");
        }
      }
    );
  } catch (error) {
    if (error !== "cancel" && error !== "forbidden") {
      console.warn("从剪贴板导入整个世界书操作未成功完成或被取消:", error);
    }
  }
};

const clearAllEntries = async () => {
  await performSafeAction(
    appSettings.safeModeLevel,
    "清空所有条目",
    "此操作不可恢复！",
    () => {
      worldBookEntries.value = [];
      selectedEntryIndex.value = null;
      editableEntry.value = {};
      activeTab.value = "list";
      saveWorldBookToLocalStorage();
    }
  ).catch((err) => {
    if (err !== "cancel" && err !== "forbidden")
      console.warn("清空条目操作未成功完成:", err);
  });
};

const saveWorldBookToLocalStorage = () => {
  if (appSettings.isAutoSaveEnabled && autoSaveTimer) {
    saveToLS(formatWorldBookForExport(), LOCAL_STORAGE_KEY_WORLDBOOK);
  } else if (!appSettings.isAutoSaveEnabled) {
    saveToLS(formatWorldBookForExport(), LOCAL_STORAGE_KEY_WORLDBOOK);
  }
};

onMounted(() => {
  const loadedData = loadFromLS(LOCAL_STORAGE_KEY_WORLDBOOK);
  if (loadedData) {
    const processed = processImportedWorldBookData(loadedData);
    if (processed) {
      worldBookEntries.value = processed;
      if (worldBookEntries.value.length > 0) {
        selectedEntryIndex.value = 0;
        activeTab.value = "editor";
      }
    }
  }

  if (appSettings.isAutoSaveEnabled) {
    autoSaveTimer = initWorldBookAutoSave(
      () => saveToLS(formatWorldBookForExport(), LOCAL_STORAGE_KEY_WORLDBOOK),
      () => worldBookEntries.value.length > 0
    );
  }
});

onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearWorldBookAutoSave(autoSaveTimer);
  }
});

watch(
  () => appSettings.isAutoSaveEnabled,
  (newValue) => {
    if (newValue) {
      if (!autoSaveTimer) {
        autoSaveTimer = initWorldBookAutoSave(
          () =>
            saveToLS(formatWorldBookForExport(), LOCAL_STORAGE_KEY_WORLDBOOK),
          () => worldBookEntries.value.length > 0
        );
        ElMessage.info("世界书自动保存已开启");
      }
    } else {
      if (autoSaveTimer) {
        clearWorldBookAutoSave(autoSaveTimer);
        autoSaveTimer = null;
        ElMessage.info("世界书自动保存已关闭");
      }
    }
  }
);

watch(
  worldBookEntries,
  () => {
    saveWorldBookToLocalStorage();
  },
  { deep: true }
);
</script>

<style scoped>
:deep(
    .worldbook-tabs-mobile.el-tabs--border-card
      > .el-tabs__header
      .el-tabs__item
  ) {
  padding: 0;
}
:deep(.worldbook-tabs-mobile.el-tabs--border-card > .el-tabs__content) {
  padding: 0;
  flex-grow: 1;
  display: flex;
}

.worldbook-tabs-mobile .el-tab-pane {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.worldbook-tabs-mobile .el-tab-pane > .el-scrollbar {
  flex-grow: 1;
  height: 0;
}

.content-panel {
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-width: 1px;
  border-color: var(--color-neutral-200);
  overflow: hidden;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  display: flex;
  flex-direction: column;
}
.dark .content-panel {
  background-color: var(--color-neutral-850);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  border-color: var(--color-neutral-750);
}
.content-panel:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
.dark .content-panel:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5);
}
.content-panel-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom-width: 1px;
  border-color: var(--color-neutral-200);
}
.dark .content-panel-header {
  border-color: var(--color-neutral-700);
}
.content-panel-title {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 600;
  color: var(--color-neutral-800);
  margin-right: auto;
}
.dark .content-panel-title {
  color: var(--color-neutral-200);
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
}

:deep(.entry-menu .el-menu-item.is-active) {
  background-color: var(--color-accent-50) !important;
  color: var(--color-accent-600) !important;
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
  background-color: var(--color-accent-500);
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}
.dark :deep(.entry-menu .el-menu-item.is-active::before) {
  background-color: var(
    --color-dark-active-menu-indicator,
    var(--color-accent-400)
  );
}

.form-section {
  padding: 1.25rem;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  background-color: var(--color-neutral-50);
}
.dark .form-section {
  border-color: var(--color-neutral-700);
  background-color: var(--color-neutral-800);
}
.form-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-neutral-700);
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-neutral-200);
  display: flex;
  align-items: center;
}
.dark .form-section-title {
  color: var(--color-neutral-300);
  border-color: var(--color-neutral-600);
}
.form-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-neutral-700);
  margin-bottom: 0.375rem;
}
.dark .form-label {
  color: var(--color-neutral-300);
}
.form-help-text {
  font-size: 0.75rem;
  color: var(--color-neutral-500);
  margin-top: 0.375rem;
}
.dark .form-help-text {
  color: var(--color-neutral-400);
}

.app-messagebox-textarea-6 :deep(.el-message-box__input textarea) {
  min-height: 120px;
}
.app-messagebox-textarea-8 :deep(.el-message-box__input textarea) {
  min-height: 160px;
}
</style>
