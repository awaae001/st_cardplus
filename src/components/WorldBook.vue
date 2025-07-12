<template>
  <div class="worldbook-container">
    <div class="worldbook-mobile-layout">
      <el-tabs v-model="activeTab" type="border-card" class="worldbook-tabs-mobile">
        <el-tab-pane name="list" class="worldbook-tab-pane">
          <template #label>
            <span class="worldbook-tab-label">
              <Icon icon="ph:list-bullets-duotone" class="worldbook-tab-icon" />
              <span class="worldbook-tab-text">条目列表</span>
            </span>
          </template>

          <div class="content-panel-header">
            <h2 class="content-panel-title">
              <Icon icon="ph:list-bullets-duotone" class="content-panel-icon" />
              <span class="content-panel-text">世界书条目</span>
            </h2>
            <el-tooltip content="新增条目" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
              <button @click="addNewEntry" class="btn-primary-adv worldbook-add-button" aria-label="新增条目">
                <Icon icon="ph:plus-circle-duotone" class="worldbook-add-icon" />
              </button>
            </el-tooltip>
          </div>
          <el-scrollbar class="worldbook-entry-list-scrollbar">
            <div v-if="!worldBookEntries.length" class="worldbook-empty-list">
              <el-empty description="暂无条目" :image-size="80"></el-empty>
            </div>
            <el-menu v-else :default-active="selectedEntryIndex !== null
              ? String(selectedEntryIndex)
              : undefined
              " @select="handleSelectEntry" class="entry-menu">
              <el-menu-item v-for="(entry, index) in worldBookEntries" :key="entry.uid || index" :index="String(index)"
                class="entry-menu-item">
                <div class="entry-menu-item-content">
                  <div class="entry-menu-item-title">
                    {{ entry.comment || `条目 ${index + 1}` }}
                  </div>
                  <div class="entry-menu-item-tags">
                    <el-tag v-if="entry.disable" type="info" size="small" effect="dark">已禁用</el-tag>
                    <el-tag v-if="entry.constant" type="success" size="small" effect="dark">常驻</el-tag>
                    <span v-if="!entry.disable && !entry.constant" class="entry-menu-item-tag-placeholder"></span>
                  </div>
                </div>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>

          <div class="content-panel-header worldbook-bottom-panel-header">
            <div class="worldbook-bottom-panel-buttons">
              <el-tooltip content="复制整个世界书 (到剪贴板)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click="copyWorldBookToClipboard" class="btn-secondary-adv worldbook-bottom-button"
                  aria-label="复制整个世界书">
                  <Icon icon="ph:books-duotone" class="worldbook-bottom-button-icon" />
                </button>
              </el-tooltip>
              <el-tooltip content="从剪贴板导入整个世界书 (将替换现有)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click="showImportWorldBookDialog"
                  class="btn-warning-adv worldbook-bottom-button worldbook-button-disabled" aria-label="从剪贴板导入整个世界书">
                  <Icon icon="ph:clipboard-text-duotone" class="worldbook-bottom-button-icon" />
                </button>
              </el-tooltip>
              <span class="worldbook-button-divider"></span>
              <el-tooltip content="导出所有条目为JSON文件" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click="exportToJson" class="btn-success-adv worldbook-bottom-button-text">
                  <Icon icon="ph:export-duotone" width="16" height="16" class="worldbook-button-text-icon" /><span
                    class="worldbook-button-text-short">导出</span><span class="worldbook-button-text-long">导出JSON</span>
                </button>
              </el-tooltip>
              <el-tooltip content="从JSON文件导入条目 (将替换现有)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <el-upload action="#" :before-upload="handleLoadFromJsonFile" :show-file-list="false" accept=".json">
                  <button class="btn-warning-adv worldbook-bottom-button-text worldbook-button-disabled">
                    <Icon icon="ph:download-simple-duotone" width="16" height="16" class="worldbook-button-text-icon" />
                    <span class="worldbook-button-text-short">导入</span><span
                      class="worldbook-button-text-long">导入JSON</span>
                  </button>
                </el-upload>
              </el-tooltip>
              <el-tooltip content="清空所有条目" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click="clearAllEntries"
                  class="btn-danger-adv worldbook-bottom-button-text worldbook-button-disabled">
                  <Icon icon="ph:trash-simple-duotone" width="16" height="16" class="worldbook-button-text-icon" /><span
                    class="worldbook-button-text-short">清空</span><span class="worldbook-button-text-long">清空所有</span>
                </button>
              </el-tooltip>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="editor" class="worldbook-tab-pane" :disabled="!selectedEntry">
          <template #label>
            <span class="worldbook-tab-label">
              <Icon icon="ph:note-pencil-duotone" class="worldbook-tab-icon" />
              <span class="worldbook-tab-text-truncated">{{
                selectedEntry ? selectedEntry.comment || "编辑中" : "编辑条目"
              }}</span>
            </span>
          </template>

          <div class="content-panel-header">
            <h2 class="content-panel-title">
              <Icon icon="ph:note-pencil-duotone" class="content-panel-icon" />
              <span class="content-panel-text-truncated">编辑:
                <span class="content-panel-text-highlight">{{
                  selectedEntry ? selectedEntry.comment || "新条目" : "未选择"
                }}</span></span>
            </h2>
            <div class="worldbook-editor-buttons">
              <el-tooltip content="复制当前条目 (到剪贴板)" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click="copySelectedEntry" :disabled="!selectedEntry"
                  class="btn-secondary-adv worldbook-editor-button" aria-label="复制当前条目">
                  <Icon icon="ph:copy-simple-duotone" class="worldbook-editor-button-icon" />
                </button>
              </el-tooltip>
              <el-tooltip content="从剪贴板粘贴为新条目" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click="showImportEntryDialog"
                  class="btn-warning-adv worldbook-editor-button worldbook-button-disabled" aria-label="从剪贴板粘贴为新条目">
                  <Icon icon="ph:clipboard-text-duotone" class="worldbook-editor-button-icon" />
                </button>
              </el-tooltip>
              <el-tooltip v-if="selectedEntry" content="保存当前条目" placement="bottom" :show-arrow="false" :offset="8"
                :hide-after="0">
                <button @click="saveCurrentEntry" class="btn-primary-adv worldbook-editor-button" aria-label="保存当前条目">
                  <Icon icon="ph:floppy-disk-duotone" class="worldbook-editor-button-icon" />
                </button>
              </el-tooltip>
              <el-tooltip v-if="selectedEntry" content="删除当前条目" placement="bottom" :show-arrow="false" :offset="8"
                :hide-after="0">
                <button @click="deleteSelectedEntry"
                  class="btn-danger-adv worldbook-editor-button worldbook-button-disabled" aria-label="删除当前条目">
                  <Icon icon="ph:trash-duotone" class="worldbook-editor-button-icon-delete" />
                </button>
              </el-tooltip>
            </div>
          </div>
          <el-scrollbar class="worldbook-editor-scrollbar">
            <div class="content-panel-body">
              <div v-if="!selectedEntry" class="worldbook-editor-empty-state">
                <el-empty description="请在列表标签页中选择或新增一个条目进行编辑。" :image-size="80"></el-empty>
              </div>
              <el-form v-if="selectedEntry && editableEntry" :model="editableEntry" label-position="top"
                ref="entryFormRef" class="worldbook-editor-form">
                <section class="form-section">
                  <h3 class="form-section-title">
                    <Icon icon="ph:info-duotone" class="form-section-icon" />基本信息
                  </h3>
                  <div class="form-section-content">
                    <div>
                      <label class="form-label">标题/备注 (Comment)</label><el-input v-model="editableEntry.comment"
                        placeholder="给条目起个易于识别的名字" />
                    </div>
                    <div>
                      <label class="form-label">主要关键词 (Key) -
                        <span class="form-label-subtext">逗号分隔, 支持 /regex/i</span></label><el-input v-model="keysInput"
                        type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="例如: 角色名, /他说了什么/i, 地点A" />
                      <p class="form-help-text">
                        提示: 普通文本关键词不要包含逗号，逗号被视作分隔符。
                      </p>
                    </div>
                    <div>
                      <label class="form-label">条目内容 (Content)</label><el-input v-model="editableEntry.content"
                        type="textarea" :autosize="{ minRows: 4, maxRows: 10 }"
                        placeholder="当条目激活时，这段文本会被插入到AI的提示中..." />
                    </div>
                    <div class="form-checkbox-padding">
                      <el-checkbox v-model="editableEntry.addMemo" label="插入时附带备注 (Add Memo)" />
                    </div>
                  </div>
                </section>
                <section class="form-section">
                  <h3 class="form-section-title">
                    <Icon icon="ph:radio-button-duotone" class="form-section-icon" />触发与激活
                  </h3>
                  <div class="form-grid-2-col">
                    <div>
                      <label class="form-label">次要关键词 (Optional Filter) -
                        <span class="form-label-subtext">逗号分隔</span></label><el-input v-model="secondaryKeysInput"
                        type="textarea" :autosize="{ minRows: 2, maxRows: 3 }" placeholder="可选的过滤关键词" />
                    </div>
                    <div>
                      <label class="form-label">次要关键词逻辑 (Logic)</label><el-select v-model="editableEntry.selectiveLogic"
                        placeholder="选择逻辑" class="form-full-width" :disabled="!editableEntry.selective"><el-option
                          label="与任意" :value="0" /><el-option label="非所有" :value="1" /><el-option label="非任何"
                          :value="2" /><el-option label="与所有" :value="3" /></el-select><el-checkbox
                        v-model="editableEntry.selective" label="启用次要逻辑" class="form-checkbox-margin-top" />
                    </div>
                    <div class="form-flex-col">
                      <label class="form-label">常驻 (Constant)</label><el-switch v-model="editableEntry.constant" />
                    </div>
                    <div class="form-flex-col">
                      <label class="form-label">禁用 (Disable)</label><el-switch v-model="editableEntry.disable" />
                    </div>
                    <div class="form-grid-span-2">
                      <label class="form-label">触发概率 (Probability %)</label>
                      <div class="form-flex-row">
                        <el-slider v-model="editableEntry.probability" :min="0" :max="100" show-input
                          class="form-slider" :disabled="!editableEntry.useProbability" /><el-checkbox
                          v-model="editableEntry.useProbability" label="启用概率" class="form-checkbox-nowrap" />
                      </div>
                    </div>
                  </div>
                </section>
                <section class="form-section">
                  <h3 class="form-section-title">
                    <Icon icon="ph:arrows-merge-duotone" class="form-section-icon" />插入与顺序
                  </h3>
                  <div class="form-grid-3-col">
                    <div>
                      <label class="form-label">插入顺序 (Order)</label><el-input-number v-model="editableEntry.order"
                        :min="0" controls-position="right" class="form-full-width" />
                    </div>
                    <div>
                      <label class="form-label">插入位置 (Position)</label><el-select v-model="editableEntry.position"
                        placeholder="选择插入位置" class="form-full-width"><el-option label="角色定义之前" :value="0" />
                        <el-option label="角色定义之后" :value="1" /><el-option label="作者注释之前" :value="2" />
                        <el-option label="作者注释之后" :value="3" /><el-option label="@D" :value="4" />
                        <el-option label="示例消息之前" :value="5" /><el-option label="示例消息之后" :value="6" /></el-select>
                    </div>
                    <div v-if="editableEntry.position === 4">
                      <label class="form-label">深度角色 (Role for In-chat)</label><el-select v-model="editableEntry.role"
                        placeholder="选择角色" class="form-full-width"><el-option label="系统" :value="0" />
                        <el-option label="用户" :value="1" />
                        <el-option label="助手" :value="2" /></el-select>
                    </div>
                  </div>
                </section>
                <section class="form-section">
                  <h3 class="form-section-title">
                    <Icon icon="ph:scan-duotone" class="form-section-icon" />扫描与匹配
                  </h3>
                  <div class="form-grid-3-col-top-align">
                    <div>
                      <label class="form-label">扫描深度 (Scan Depth)</label><el-input-number v-model="editableEntry.depth"
                        :min="0" :max="999" controls-position="right" class="form-full-width" />
                      <p class="form-help-text">0表示可能使用全局设置。</p>
                    </div>
                    <div class="form-flex-col-start">
                      <label class="form-label">大小写敏感</label><el-switch v-model="editableEntry.caseSensitive" />
                    </div>
                    <div class="form-flex-col-start">
                      <label class="form-label">匹配整个单词</label><el-switch v-model="editableEntry.matchWholeWords" />
                      <p class="form-help-text">非空格分词语言建议关闭。</p>
                    </div>
                    <div class="form-flex-col-start">
                      <label class="form-label">启用向量匹配</label><el-switch v-model="editableEntry.vectorized" />
                    </div>
                  </div>
                </section>
                <section class="form-section">
                  <h3 class="form-section-title">
                    <Icon icon="ph:graph-duotone" class="form-section-icon" />递归与分组
                  </h3>
                  <div class="form-grid-3-col-top-align">
                    <div class="form-flex-col">
                      <label class="form-label">排除递归激活</label><el-switch v-model="editableEntry.excludeRecursion" />
                    </div>
                    <div class="form-flex-col">
                      <label class="form-label">阻止后续递归</label><el-switch v-model="editableEntry.preventRecursion" />
                    </div>
                    <div class="form-flex-col">
                      <label class="form-label">仅在递归时激活</label><el-switch v-model="editableEntry.delayUntilRecursion" />
                    </div>
                    <div>
                      <label class="form-label">所属收录组 (Group)</label><el-input v-model="editableEntry.group"
                        placeholder="组名, 多个用逗号分隔" />
                    </div>
                    <div>
                      <label class="form-label">组内优先级/权重</label><el-input-number v-model="editableEntry.groupPriority"
                        controls-position="right" class="form-full-width" />
                    </div>
                    <div class="form-flex-col-start">
                      <label class="form-label">优先组内选择 (Prioritize)</label><el-switch
                        v-model="editableEntry.groupOverride" />
                      <p class="form-help-text">开启后按Order选择</p>
                    </div>
                    <div class="form-flex-col-start">
                      <label class="form-label">启用组内评分 (Scoring)</label><el-switch
                        v-model="editableEntry.useGroupScoring" />
                      <p class="form-help-text">匹配关键词更多者优先</p>
                    </div>
                  </div>
                </section>
                <section class="form-section">
                  <h3 class="form-section-title">
                    <Icon icon="ph:timer-duotone" class="form-section-icon" />定时效果
                  </h3>
                  <div class="form-grid-3-col-end-align">
                    <div>
                      <label class="form-label">粘滞回合数 (Sticky)</label><el-input-number v-model="editableEntry.sticky"
                        :min="0" controls-position="right" class="form-full-width" />
                      <p class="form-help-text">0表示不粘滞</p>
                    </div>
                    <div>
                      <label class="form-label">冷却回合数 (Cooldown)</label><el-input-number
                        v-model="editableEntry.cooldown" :min="0" controls-position="right" class="form-full-width" />
                      <p class="form-help-text">0表示无冷却</p>
                    </div>
                    <div>
                      <label class="form-label">延迟激活 (Delay)</label><el-input-number v-model="editableEntry.delay"
                        :min="0" controls-position="right" class="form-full-width" />
                      <p class="form-help-text">需N条消息后激活, 0无延迟</p>
                    </div>
                  </div>
                </section>
                <section class="form-section">
                  <h3 class="form-section-title">
                    <Icon icon="ph:puzzle-piece-duotone" class="form-section-icon" />其他
                  </h3>
                  <div>
                    <label class="form-label">自动化ID (Automation ID)</label><el-input
                      v-model="editableEntry.automationId" placeholder="用于Quick Replies扩展" />
                  </div>
                </section>
              </el-form>
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="worldbook-desktop-layout">
      <div class="worldbook-desktop-panel-left">
        <div class="content-panel-header">
          <h2 class="content-panel-title">
            <Icon icon="ph:list-bullets-duotone" class="content-panel-icon" />
            世界书条目
          </h2>
          <el-tooltip content="新增条目" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
            <button @click="addNewEntry" class="btn-primary-adv worldbook-add-button-desktop" aria-label="新增条目">
              <Icon icon="ph:plus-circle-duotone" class="worldbook-add-icon-desktop" />
            </button>
          </el-tooltip>
        </div>
        <el-scrollbar class="worldbook-entry-list-scrollbar">
          <div v-if="!worldBookEntries.length" class="worldbook-empty-list-desktop">
            <el-empty description="暂无条目" :image-size="100"></el-empty>
          </div>
          <el-menu v-else :default-active="selectedEntryIndex !== null
            ? String(selectedEntryIndex)
            : undefined
            " @select="handleSelectEntry" class="entry-menu">
            <el-menu-item v-for="(entry, index) in worldBookEntries" :key="entry.uid || index" :index="String(index)"
              class="entry-menu-item">
              <div class="entry-menu-item-content">
                <div class="entry-menu-item-title">
                  {{ entry.comment || `条目 ${index + 1}` }}
                </div>
                <div class="entry-menu-item-tags">
                  <el-tag v-if="entry.disable" type="info" size="small" effect="dark">已禁用</el-tag>
                  <el-tag v-if="entry.constant" type="success" size="small" effect="dark">常驻</el-tag>
                  <span v-if="!entry.disable && !entry.constant" class="entry-menu-item-tag-placeholder"></span>
                </div>
              </div>
            </el-menu-item>
          </el-menu>
        </el-scrollbar>
        <div class="content-panel-header worldbook-bottom-panel-header-desktop">
          <div class="worldbook-bottom-panel-buttons-desktop">
            <el-tooltip content="复制整个世界书 (到剪贴板)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
              <button @click="copyWorldBookToClipboard" class="btn-secondary-adv worldbook-bottom-button-desktop"
                aria-label="复制整个世界书">
                <Icon icon="ph:books-duotone" class="worldbook-bottom-button-icon-desktop" />
              </button>
            </el-tooltip>
            <el-tooltip content="从剪贴板导入整个世界书 (将替换现有)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
              <button @click="showImportWorldBookDialog"
                class="btn-warning-adv worldbook-bottom-button-desktop worldbook-button-disabled"
                aria-label="从剪贴板导入整个世界书">
                <Icon icon="ph:clipboard-text-duotone" class="worldbook-bottom-button-icon-desktop" />
              </button>
            </el-tooltip>
            <span class="worldbook-button-divider-desktop"></span>
            <el-tooltip content="导出所有条目为JSON文件" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
              <button @click="exportToJson" class="btn-success-adv worldbook-bottom-button-desktop"
                aria-label="导出所有条目为JSON文件">
                <Icon icon="ph:export-duotone" class="worldbook-bottom-button-icon-desktop" />
              </button>
            </el-tooltip>
            <el-tooltip content="从JSON文件导入条目 (将替换现有)" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
              <el-upload action="#" :before-upload="handleLoadFromJsonFile" :show-file-list="false" accept=".json">
                <button class="btn-warning-adv worldbook-bottom-button-desktop worldbook-button-disabled"
                  aria-label="从JSON文件导入条目">
                  <Icon icon="ph:download-simple-duotone" class="worldbook-bottom-button-icon-desktop" />
                </button>
              </el-upload>
            </el-tooltip>
            <el-tooltip content="清空所有条目" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
              <button @click="clearAllEntries"
                class="btn-danger-adv worldbook-bottom-button-desktop worldbook-button-disabled" aria-label="清空所有条目">
                <Icon icon="ph:trash-simple-duotone" class="worldbook-bottom-button-icon-delete-desktop" />
              </button>
            </el-tooltip>
          </div>
        </div>
      </div>

      <div class="worldbook-desktop-panel-right">
        <div class="content-panel-header">
          <h2 class="content-panel-title">
            <Icon icon="ph:note-pencil-duotone" class="content-panel-icon" />
            编辑:
            <span class="content-panel-text-highlight">{{
              selectedEntry ? selectedEntry.comment || "新条目" : "未选择条目"
            }}</span>
          </h2>
          <div class="worldbook-editor-buttons-desktop">
            <el-tooltip content="复制当前条目 (到剪贴板)" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
              <button @click="copySelectedEntry" :disabled="!selectedEntry"
                class="btn-secondary-adv worldbook-editor-button-desktop" aria-label="复制当前条目">
                <Icon icon="ph:copy-simple-duotone" class="worldbook-editor-button-icon-desktop" />
              </button>
            </el-tooltip>
            <el-tooltip content="从剪贴板粘贴为新条目" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
              <button @click="showImportEntryDialog"
                class="btn-warning-adv worldbook-editor-button-desktop worldbook-button-disabled"
                aria-label="从剪贴板粘贴为新条目">
                <Icon icon="ph:clipboard-text-duotone" class="worldbook-editor-button-icon-desktop" />
              </button>
            </el-tooltip>
            <el-tooltip v-if="selectedEntry" content="保存当前条目" placement="bottom" :show-arrow="false" :offset="8"
              :hide-after="0">
              <button @click="saveCurrentEntry" class="btn-primary-adv worldbook-editor-button-desktop"
                aria-label="保存当前条目">
                <Icon icon="ph:floppy-disk-duotone" class="worldbook-editor-button-icon-desktop" />
              </button>
            </el-tooltip>
            <el-tooltip v-if="selectedEntry" content="删除当前条目" placement="bottom" :show-arrow="false" :offset="8"
              :hide-after="0">
              <button @click="deleteSelectedEntry"
                class="btn-danger-adv worldbook-editor-button-desktop worldbook-button-disabled" aria-label="删除当前条目">
                <Icon icon="ph:trash-duotone" class="worldbook-editor-button-icon-delete-desktop" />
              </button>
            </el-tooltip>
          </div>
        </div>
        <el-scrollbar class="worldbook-editor-scrollbar">
          <div class="content-panel-body">
            <div v-if="!selectedEntry" class="worldbook-editor-empty-state-desktop">
              <el-empty description="请选择或新增条目进行编辑" :image-size="150"></el-empty>
            </div>
            <el-form v-if="selectedEntry && editableEntry" :model="editableEntry" label-position="top"
              ref="entryFormRef" class="worldbook-editor-form-desktop">
              <section class="form-section">
                <h3 class="form-section-title">
                  <Icon icon="ph:info-duotone" class="form-section-icon" />基本信息
                </h3>
                <div class="form-section-content">
                  <div>
                    <label class="form-label">标题/备注 (Comment)</label><el-input v-model="editableEntry.comment"
                      placeholder="给条目起个易于识别的名字" />
                  </div>
                  <div>
                    <label class="form-label">主要关键词 (Key) -
                      <span class="form-label-subtext">逗号分隔, 支持 /regex/i</span></label><el-input v-model="keysInput"
                      type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="例如: 角色名, /他说了什么/i, 地点A" />
                    <p class="form-help-text">
                      提示: 普通文本关键词不要包含逗号，逗号被视作分隔符。
                    </p>
                  </div>
                  <div>
                    <label class="form-label">条目内容 (Content)</label><el-input v-model="editableEntry.content"
                      type="textarea" :autosize="{ minRows: 5, maxRows: 12 }" placeholder="当条目激活时，这段文本会被插入到AI的提示中..." />
                  </div>
                  <div class="form-checkbox-padding">
                    <el-checkbox v-model="editableEntry.addMemo" label="插入时附带备注 (Add Memo)" />
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title">
                  <Icon icon="ph:radio-button-duotone" class="form-section-icon" />触发与激活
                </h3>
                <div class="form-grid-2-col">
                  <div>
                    <label class="form-label">次要关键词 (Optional Filter) -
                      <span class="form-label-subtext">逗号分隔</span></label><el-input v-model="secondaryKeysInput"
                      type="textarea" :autosize="{ minRows: 2, maxRows: 3 }" placeholder="可选的过滤关键词" />
                  </div>
                  <div>
                    <label class="form-label">次要关键词逻辑 (Logic)</label><el-select v-model="editableEntry.selectiveLogic"
                      placeholder="选择逻辑" class="form-full-width" :disabled="!editableEntry.selective"><el-option
                        label="与任意" :value="0" /><el-option label="非所有" :value="1" /><el-option label="非任何"
                        :value="2" /><el-option label="与所有" :value="3" /></el-select><el-checkbox
                      v-model="editableEntry.selective" label="启用次要逻辑" class="form-checkbox-margin-top" />
                  </div>
                  <div class="form-flex-col">
                    <label class="form-label">常驻 (Constant)</label><el-switch v-model="editableEntry.constant" />
                  </div>
                  <div class="form-flex-col">
                    <label class="form-label">禁用 (Disable)</label><el-switch v-model="editableEntry.disable" />
                  </div>
                  <div class="form-grid-span-2">
                    <label class="form-label">触发概率 (Probability %)</label>
                    <div class="form-flex-row">
                      <el-slider v-model="editableEntry.probability" :min="0" :max="100" show-input class="form-slider"
                        :disabled="!editableEntry.useProbability" /><el-checkbox v-model="editableEntry.useProbability"
                        label="启用概率" class="form-checkbox-nowrap" />
                    </div>
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title">
                  <Icon icon="ph:arrows-merge-duotone" class="form-section-icon" />插入与顺序
                </h3>
                <div class="form-grid-3-col">
                  <div>
                    <label class="form-label">插入顺序 (Order)</label><el-input-number v-model="editableEntry.order"
                      :min="0" controls-position="right" class="form-full-width" />
                  </div>
                  <div>
                    <label class="form-label">插入位置 (Position)</label><el-select v-model="editableEntry.position"
                      placeholder="选择插入位置" class="form-full-width"><el-option label="角色定义之前" :value="0" />
                      <el-option label="角色定义之后" :value="1" /><el-option label="作者注释之前" :value="2" />
                      <el-option label="作者注释之后" :value="3" /><el-option label="@D" :value="4" />
                      <el-option label="示例消息之前" :value="5" /><el-option label="示例消息之后" :value="6" /></el-select>
                  </div>
                  <div v-if="editableEntry.position === 4">
                    <label class="form-label">深度角色 (Role for In-chat)</label><el-select v-model="editableEntry.role"
                      placeholder="选择角色" class="form-full-width"><el-option label="系统" :value="0" />
                      <el-option label="用户" :value="1" />
                      <el-option label="助手" :value="2" /></el-select>
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title">
                  <Icon icon="ph:scan-duotone" class="form-section-icon" />扫描与匹配
                </h3>
                <div class="form-grid-3-col-top-align">
                  <div>
                    <label class="form-label">扫描深度 (Scan Depth)</label><el-input-number v-model="editableEntry.depth"
                      :min="0" :max="999" controls-position="right" class="form-full-width" />
                    <p class="form-help-text">0表示可能使用全局设置。</p>
                  </div>
                  <div class="form-flex-col-start">
                    <label class="form-label">大小写敏感</label><el-switch v-model="editableEntry.caseSensitive" />
                  </div>
                  <div class="form-flex-col-start">
                    <label class="form-label">匹配整个单词</label><el-switch v-model="editableEntry.matchWholeWords" />
                    <p class="form-help-text">非空格分词语言建议关闭。</p>
                  </div>
                  <div class="form-flex-col-start">
                    <label class="form-label">启用向量匹配</label><el-switch v-model="editableEntry.vectorized" />
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title">
                  <Icon icon="ph:graph-duotone" class="form-section-icon" />递归与分组
                </h3>
                <div class="form-grid-3-col-top-align">
                  <div class="form-flex-col">
                    <label class="form-label">排除递归激活</label><el-switch v-model="editableEntry.excludeRecursion" />
                  </div>
                  <div class="form-flex-col">
                    <label class="form-label">阻止后续递归</label><el-switch v-model="editableEntry.preventRecursion" />
                  </div>
                  <div class="form-flex-col">
                    <label class="form-label">仅在递归时激活</label><el-switch v-model="editableEntry.delayUntilRecursion" />
                  </div>
                  <div>
                    <label class="form-label">所属收录组 (Group)</label><el-input v-model="editableEntry.group"
                      placeholder="组名, 多个用逗号分隔" />
                  </div>
                  <div>
                    <label class="form-label">组内优先级/权重</label><el-input-number v-model="editableEntry.groupPriority"
                      controls-position="right" class="form-full-width" />
                  </div>
                  <div class="form-flex-col-start">
                    <label class="form-label">优先组内选择 (Prioritize)</label><el-switch
                      v-model="editableEntry.groupOverride" />
                    <p class="form-help-text">开启后按Order选择</p>
                  </div>
                  <div class="form-flex-col-start">
                    <label class="form-label">启用组内评分 (Scoring)</label><el-switch
                      v-model="editableEntry.useGroupScoring" />
                    <p class="form-help-text">匹配关键词更多者优先</p>
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title">
                  <Icon icon="ph:timer-duotone" class="form-section-icon" />定时效果
                </h3>
                <div class="form-grid-3-col-end-align">
                  <div>
                    <label class="form-label">粘滞回合数 (Sticky)</label><el-input-number v-model="editableEntry.sticky"
                      :min="0" controls-position="right" class="form-full-width" />
                    <p class="form-help-text">0表示不粘滞</p>
                  </div>
                  <div>
                    <label class="form-label">冷却回合数 (Cooldown)</label><el-input-number v-model="editableEntry.cooldown"
                      :min="0" controls-position="right" class="form-full-width" />
                    <p class="form-help-text">0表示无冷却</p>
                  </div>
                  <div>
                    <label class="form-label">延迟激活 (Delay)</label><el-input-number v-model="editableEntry.delay"
                      :min="0" controls-position="right" class="form-full-width" />
                    <p class="form-help-text">需N条消息后激活, 0无延迟</p>
                  </div>
                </div>
              </section>
              <section class="form-section">
                <h3 class="form-section-title">
                  <Icon icon="ph:puzzle-piece-duotone" class="form-section-icon" />其他
                </h3>
                <div>
                  <label class="form-label">自动化ID (Automation ID)</label><el-input v-model="editableEntry.automationId"
                    placeholder="用于Quick Replies扩展" />
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
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, } from "vue";
import { ElMessage, ElMessageBox, ElForm, ElScrollbar, ElMenu, ElMenuItem, ElEmpty, ElInput, ElTag, ElSelect, ElOption, ElCheckbox, ElSwitch, ElSlider, ElInputNumber, ElUpload, ElTooltip, ElTabs, ElTabPane, } from "element-plus";
import { Icon } from "@iconify/vue";
// import { saveAs } from 'file-saver';
import {
  saveToLocalStorage as saveToLS,
  loadFromLocalStorage as loadFromLS,
  // clearLocalStorage as clearLS,
  initAutoSave as initWorldBookAutoSave,
  clearAutoSave as clearWorldBookAutoSave,
} from "../utils/localStorageUtils";

interface WorldBookEntry {
  uid?: number;
  comment: string;
  key: string[];
  content: string;
  addMemo: boolean;
  order: number;
  constant: boolean;
  disable: boolean;
  keysecondary: string[];
  selectiveLogic: number;
  selective: boolean;
  excludeRecursion: boolean;
  preventRecursion: boolean;
  delayUntilRecursion: boolean;
  probability: number;
  useProbability: boolean;
  position: number;
  role: number;
  depth: number;
  caseSensitive: boolean;
  matchWholeWords: boolean;
  vectorized: boolean;
  group: string;
  groupPriority: number;
  groupOverride: boolean;
  useGroupScoring: boolean;
  sticky: number;
  cooldown: number;
  delay: number;
  automationId: string;
}

const LOCAL_STORAGE_KEY_WORLDBOOK = "worldBookEditorData";

const worldBookEntries = ref<WorldBookEntry[]>([]);
const selectedEntryIndex = ref<number | null>(null);
const editableEntry = ref<Partial<WorldBookEntry>>({});
const entryFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const activeTab = ref<"list" | "editor">("list");
let autoSaveTimer: number | null = null;

const appSettings = {
  isAutoSaveEnabled: true,
  safeModeLevel: 0
};

const selectedEntry = computed<WorldBookEntry | null>(() => {
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

function createDefaultEntryData(uid: number): WorldBookEntry {
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
      JSON.stringify(entryToSave as WorldBookEntry)
    );
    ElMessage.success("条目已保存！");
    saveWorldBookToLocalStorage();
  } else {
    ElMessage.error("无法保存条目，缺少UID或未选择条目。");
  }
};

const deleteSelectedEntry = async () => {
  if (selectedEntryIndex.value !== null && selectedEntry.value) {
    selectedEntry.value.comment || `条目 (ID: ${selectedEntry.value.uid})`;
    try {
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
    } catch (err) {
      console.warn("删除条目操作未成功完成:", err);
    }
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

    try {
      const parsedEntryData = JSON.parse(value);
      const newUid = Date.now();
      const baseEntry = createDefaultEntryData(newUid);
      const newEntry: WorldBookEntry = {
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
    } catch (error) {
      console.warn("从剪贴板粘贴新条目操作未成功完成:", error);
    }
  } catch (error) {
    console.warn("从剪贴板粘贴新条目操作未成功完成或被取消:", error);
  }
};

const formatWorldBookForExport = (): {
  entries: Record<string, Omit<WorldBookEntry, "uid">>;
} => {
  const exportData: { entries: Record<string, Omit<WorldBookEntry, "uid">> } = {
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
): WorldBookEntry[] | null => {
  if (
    jsonData &&
    typeof jsonData.entries === "object" &&
    jsonData.entries !== null
  ) {
    const loadedEntries: WorldBookEntry[] = [];
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
      const newEntry: WorldBookEntry = {
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
        ElMessage.success("世界书已成功从文件导入！");
      } else {
        // 如果 processImportedWorldBookData 返回 null/undefined，则抛出错误
        throw new Error('JSON文件格式不正确: 根对象必须包含 "entries" 对象。');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ElMessage.error(`导入失败: ${errorMessage}`);
      console.warn("从文件导入世界书操作未成功完成:", error);
    }
  };

  reader.onerror = () => {
    const errorMsg = "文件读取出错";
    ElMessage.error(errorMsg);
    console.warn("从文件导入世界书操作未成功完成:", new Error(errorMsg));
  };

  reader.readAsText(file);
  return false; // 保持原函数的返回值
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
  try {
    const { value } = await ElMessageBox.prompt(
      '请粘贴整个世界书的JSON数据。警告：此操作将替换当前所有条目。', // 将警告信息整合到提示中
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

    // 直接执行核心逻辑，不再需要 performSafeAction
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
      ElMessage.success("世界书已成功从剪贴板导入！");
    } else {
      // 这种情况理论上会被 inputValidator 拦截，但作为最后的保险
      throw new Error("数据结构不符合预期。");
    }
  } catch (error) {
    // ElMessageBox 点击取消或关闭时会 reject 一个 "cancel" 字符串
    if (error !== "cancel") {
      const errorMessage = error instanceof Error ? error.message : String(error);
      ElMessage.error(`导入失败: ${errorMessage}`);
      console.warn("从剪贴板导入整个世界书操作未成功完成:", error);
    }
  }
};

const clearAllEntries = async () => {
  try {
    await ElMessageBox.confirm(
      "确定要清空所有条目吗？此操作不可恢复！",
      "清空所有条目",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    worldBookEntries.value = [];
    selectedEntryIndex.value = null;
    editableEntry.value = {};
    activeTab.value = "list";
    saveWorldBookToLocalStorage();
  } catch (err) {
    if (err !== "cancel")
      console.warn("清空条目操作未成功完成:", err);
  }
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
/* WorldBook组件 - 简洁Element Plus风格 */

/* 主容器 */
.worldbook-container {
  padding: 16px;
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  transition: background-color 0.3s;
}

/* 移动端布局 */
.worldbook-mobile-layout {
  display: block;
}

.worldbook-desktop-layout {
  display: none;
}

/* 标签页样式 */
.worldbook-tabs-mobile :deep(.el-tabs__content) {
  padding: 16px 0;
}

.worldbook-tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.worldbook-tab-icon {
  font-size: 16px;
}

.worldbook-tab-text {
  font-size: 14px;
}

.worldbook-tab-text-truncated {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 内容面板头部 */
.content-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;
}

.content-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.content-panel-icon {
  font-size: 20px;
  color: #409eff;
}

.content-panel-text-highlight {
  color: #409eff;
  font-weight: 500;
}

.content-panel-text-truncated {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 按钮样式 */
.btn-primary-adv {
  background: #409eff;
  border: 1px solid #409eff;
  color: white;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary-adv:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.btn-secondary-adv {
  background: #909399;
  border: 1px solid #909399;
  color: white;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary-adv:hover {
  background: #a6a9ad;
}

.btn-success-adv {
  background: #67c23a;
  border: 1px solid #67c23a;
  color: white;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-success-adv:hover {
  background: #85ce61;
}

.btn-warning-adv {
  background: #e6a23c;
  border: 1px solid #e6a23c;
  color: white;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-warning-adv:hover {
  background: #ebb563;
}

.btn-danger-adv {
  background: #f56c6c;
  border: 1px solid #f56c6c;
  color: white;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-danger-adv:hover {
  background: #f78989;
}

/* 禁用状态 */
.worldbook-button-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 添加按钮 */
.worldbook-add-button {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.worldbook-add-icon {
  font-size: 20px;
}

/* 条目列表 */
.worldbook-entry-list-scrollbar {
  height: 400px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: white;
}

.worldbook-empty-list {
  padding: 40px 20px;
}

.entry-menu {
  border: none;
}

.entry-menu-item {
  padding: 12px 16px;
  margin: 0;
  border-bottom: 1px solid #f0f2f5;
}

.entry-menu-item-content {
  width: 100%;
}

.entry-menu-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-menu-item-tags {
  display: flex;
  gap: 4px;
  align-items: center;
}

.entry-menu-item-tag-placeholder {
  height: 20px;
}

/* 底部面板 */
.worldbook-bottom-panel-header {
  margin-top: 16px;
  margin-bottom: 0;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  border-bottom: none;
}

.worldbook-bottom-panel-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.worldbook-bottom-button {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.worldbook-bottom-button-icon {
  font-size: 16px;
}

.worldbook-bottom-button-text {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
}

.worldbook-button-text-icon {
  font-size: 14px;
}

.worldbook-button-text-short {
  display: inline;
}

.worldbook-button-text-long {
  display: none;
}

.worldbook-button-divider {
  width: 1px;
  height: 20px;
  background: #e4e7ed;
  margin: 0 4px;
}

/* 编辑器按钮 */
.worldbook-editor-buttons {
  display: flex;
  gap: 8px;
}

.worldbook-editor-button {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.worldbook-editor-button-icon {
  font-size: 16px;
}

.worldbook-editor-button-icon-delete {
  font-size: 16px;
}

/* 编辑器滚动区域 */
.worldbook-editor-scrollbar {
  height: calc(100vh - 200px);
  min-height: 400px;
}

.worldbook-editor-empty-state {
  padding: 80px 20px;
  text-align: center;
}

/* 表单样式 */
.worldbook-editor-form {
  padding: 16px;
}

.content-panel-body {
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.form-section-icon {
  font-size: 18px;
  color: #409eff;
}

.form-section-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  display: block;
}

.form-label-subtext {
  font-weight: 400;
  color: #909399;
  font-size: 12px;
}

.form-help-text {
  font-size: 12px;
  color: #909399;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

/* 网格布局 */
.form-grid-2-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-grid-3-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-grid-3-col-top-align {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
}

.form-grid-3-col-end-align {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-grid-span-2 {
  grid-column: span 1;
}

/* 弹性布局 */
.form-flex-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-flex-col-start {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.form-flex-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 表单控件 */
.form-full-width {
  width: 100%;
}

.form-slider {
  flex: 1;
}

.form-checkbox-padding {
  padding-top: 8px;
}

.form-checkbox-margin-top {
  margin-top: 8px;
}

.form-checkbox-nowrap {
  white-space: nowrap;
}

/* 桌面端布局 */
@media (min-width: 768px) {
  .worldbook-mobile-layout {
    display: none;
  }
  
  .worldbook-desktop-layout {
    display: flex;
    gap: 16px;
    height: calc(100vh - 32px);
  }
  
  .worldbook-desktop-panel-left {
    width: 320px;
    background: white;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }
  
  .worldbook-desktop-panel-right {
    flex: 1;
    background: white;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }
  
  .worldbook-add-button-desktop {
    border-radius: 50%;
    width: 36px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .worldbook-add-icon-desktop {
    font-size: 20px;
  }
  
  .worldbook-empty-list-desktop {
    padding: 60px 20px;
    text-align: center;
  }
  
  .worldbook-bottom-panel-header-desktop {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid #e4e7ed;
  }
  
  .worldbook-bottom-panel-buttons-desktop {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .worldbook-bottom-button-desktop {
    border-radius: 50%;
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .worldbook-bottom-button-icon-desktop {
    font-size: 16px;
  }
  
  .worldbook-bottom-button-icon-delete-desktop {
    font-size: 16px;
  }
  
  .worldbook-button-divider-desktop {
    width: 1px;
    height: 20px;
    background: #e4e7ed;
    margin: 0 4px;
  }
  
  .worldbook-editor-buttons-desktop {
    display: flex;
    gap: 8px;
  }
  
  .worldbook-editor-button-desktop {
    border-radius: 50%;
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .worldbook-editor-button-icon-desktop {
    font-size: 16px;
  }
  
  .worldbook-editor-button-icon-delete-desktop {
    font-size: 16px;
  }
  
  .worldbook-editor-empty-state-desktop {
    padding: 100px 20px;
    text-align: center;
  }
  
  .worldbook-editor-form-desktop {
    padding: 16px;
  }
  
  /* 桌面端网格布局 */
  .form-grid-2-col {
    grid-template-columns: 1fr 1fr;
  }
  
  .form-grid-3-col {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .form-grid-3-col-top-align {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .form-grid-3-col-end-align {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .form-grid-span-2 {
    grid-column: span 2;
  }
  
  /* 桌面端按钮文本 */
  .worldbook-button-text-short {
    display: none;
  }
  
  .worldbook-button-text-long {
    display: inline;
  }
}

/* 响应式优化 */
@media (min-width: 1200px) {
  .worldbook-desktop-panel-left {
    width: 360px;
  }
}

/* 滚动条美化 */
:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.el-scrollbar__bar) {
  opacity: 0.6;
}

/* Element Plus组件微调 */
:deep(.el-tabs__item) {
  padding: 0 16px;
}

:deep(.el-menu-item) {
  height: auto;
  min-height: 56px;
  line-height: 1.4;
}

:deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: #409eff;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}
</style>
