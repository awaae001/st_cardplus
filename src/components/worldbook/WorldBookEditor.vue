<template>
  <el-scrollbar class="worldbook-editor-scrollbar">
    <div class="content-panel-body">
      <div v-if="!entry" class="worldbook-editor-empty-state">
        <el-empty description="请在列表标签页中选择或新增一个条目进行编辑 " :image-size="80"></el-empty>
      </div>
      <el-form v-if="entry && modelValue" :model="localModel" label-position="top" ref="entryFormRef"
        class="worldbook-editor-form">
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:info-duotone" class="form-section-icon" />基本信息
           <div class="entry-navigation-buttons">
               <el-button @click="emit('goToPrevious')" :disabled="props.currentEntryIndex <= 0 && !props.isPreviousEntryInDifferentBook" size="small">
                   <Icon icon="ph:arrow-left-bold" /> {{ props.isPreviousEntryInDifferentBook ? '上一本书' : '上一个条目' }}
               </el-button>
               <el-button @click="emit('goToNext')" :disabled="props.currentEntryIndex >= props.totalEntries - 1 && !props.isNextEntryInDifferentBook" size="small">
                   {{ props.isNextEntryInDifferentBook ? '下一本书' : '下一个条目' }} <Icon icon="ph:arrow-right-bold" />
               </el-button>
           </div>
          </h3>
          <div class="form-section-content">
            <div class="form-row-responsive">
              <div class="form-group-responsive">
                <label class="form-label">标题/备注 (Comment)</label>
                <el-input v-model="localModel.comment" placeholder="给条目起个易于识别的名字" />
              </div>
              <div class="form-group-responsive">
                <label class="form-label">主要关键词 (Key) - <span class="form-label-subtext">支持 /regex/i</span></label>
                <el-select
                  v-model="localModel.key"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="输入关键词后按回车键添加"
                  class="form-full-width"
                >
                  <el-option v-for="item in props.allKeywords" :key="item" :label="item" :value="item" />
                </el-select>
                <p class="form-help-text">
                  提示: 正则表达式需以 / 开头和结尾, 例如 /regex/i 
                </p>
              </div>
            </div>
            <div>
              <label class="form-label">条目内容 (Content)</label><el-input v-model="localModel.content" type="textarea" :rows="8"
                placeholder="当条目激活时，这段文本会被插入到AI的提示中..." />
            </div>
            <div class="form-checkbox-padding">
              <el-checkbox v-model="localModel.addMemo" label="插入时附带备注 (Add Memo)" />
            </div>
          </div>
        </section>
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:radio-button-duotone" class="form-section-icon" />触发, 激活, 插入与顺序
          </h3>
          <div class="form-grid-3-col">
            <div class="form-flex-col">
              <label class="form-label">常驻 (Constant)</label><el-switch v-model="localModel.constant" />
            </div>
            <div class="form-flex-col">
              <label class="form-label">禁用 (Disable)</label><el-switch v-model="localModel.disable" />
            </div>
            <div class="form-grid-span-3">
              <label class="form-label">触发概率 (Probability %)</label>
              <div class="form-flex-row">
                <el-slider v-model="localModel.probability" :min="0" :max="100" show-input class="form-slider"
                  :disabled="!localModel.useProbability" /><el-checkbox v-model="localModel.useProbability" label="启用概率"
                  class="form-checkbox-nowrap" />
              </div>
            </div>
            <div>
              <label class="form-label">顺序</label><el-input-number v-model="localModel.order" :min="100"
                controls-position="right" class="form-full-width" />
            </div>
            <div>
              <label class="form-label">插入位置 (Position)</label>
              <el-select v-model="combinedPosition" placeholder="选择插入位置" class="form-full-width">
                <el-option label="📌 角色定义之前" value="0" />
                <el-option label="📌 角色定义之后" value="1" />
                <el-option label="📌 作者注释之前" value="2" />
                <el-option label="📌 作者注释之后" value="3" />
                <el-option label="📌 示例消息之前" value="5" />
                <el-option label="📌 示例消息之后" value="6" />
                <el-option label="⚙️ @D 系统" value="4-0" />
                <el-option label="😋 @D 用户" value="4-1" />
                <el-option label="🤖 @D 助手" value="4-2" />
                <el-option label="💭 自定义出口 (Outlet)" value="7" />
              </el-select>
            </div>
            <div v-if="localModel.position === 7">
              <label class="form-label">出口名称 (Outlet Name)</label>
              <el-input v-model="localModel.outletName" placeholder="指定一个或多个出口名称,用逗号分隔" />
            </div>
            <div>
              <label class="form-label">插入深度 (Depth)</label>
              <el-input-number v-model="localModel.depth" :min="0" :max="999" controls-position="right" class="form-full-width" :disabled="localModel.position !== 4" />
            </div>
          </div>
        </section>

        <div class="form-section-title advanced-options-toggle" @click="advancedOptionsVisible = !advancedOptionsVisible">
          <Icon :icon="advancedOptionsVisible ? 'ph:caret-down-duotone' : 'ph:caret-right-duotone'" class="form-section-icon" />
          <span>高级选项</span>
          <span class="advanced-options-hint">{{ advancedOptionsVisible ? '点击折叠' : '点击展开' }}</span>
        </div>

        <el-collapse-transition>
          <div v-show="advancedOptionsVisible">
            <section class="form-section">
              <h3 class="form-section-title">
                <Icon icon="ph:scan-duotone" class="form-section-icon" />扫描与匹配
              </h3>
              <div class="form-grid-3-col-top-align">
                <div class="form-flex-col-start">
                  <label class="form-label">大小写敏感</label><el-switch :model-value="!!localModel.caseSensitive" @update:model-value="val => updateBooleanField('caseSensitive', !!val)" />
                </div>
                <div class="form-flex-col-start">
                  <label class="form-label">匹配整个单词</label><el-switch :model-value="!!localModel.matchWholeWords" @update:model-value="val => updateBooleanField('matchWholeWords', !!val)" />
                  <p class="form-help-text">非空格分词语言建议关闭 </p>
                </div>
                <div class="form-flex-col-start">
                  <label class="form-label">启用向量匹配</label><el-switch v-model="localModel.vectorized" />
                </div>
                <div>
                  <label class="form-label">扫描深度 (Scan Depth)</label>
                  <el-input-number v-model="localModel.scanDepth" :min="0" :max="1000" controls-position="right" class="form-full-width" placeholder="留空使用全局设置" />
                  <p class="form-help-text">0表示使用全局设置</p>
                </div>
                <div class="form-grid-span-3">
                  <label class="form-label">次要关键词 (Optional Filter)</label>
                  <el-select
                    v-model="localModel.keysecondary"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="输入关键词后按回车键添加"
                    class="form-full-width"
                  >
                    <el-option v-for="item in props.allKeywords" :key="item" :label="item" :value="item" />
                  </el-select>
                </div>
                <div>
                  <label class="form-label">次要关键词逻辑 (Logic)</label><el-select v-model="localModel.selectiveLogic"
                    placeholder="选择逻辑" class="form-full-width" :disabled="!localModel.selective"><el-option label="与任意"
                      :value="0" /><el-option label="非所有" :value="1" /><el-option label="非任何" :value="2" /><el-option
                      label="与所有" :value="3" /></el-select><el-checkbox v-model="localModel.selective" label="启用次要逻辑"
                    class="form-checkbox-margin-top" />
                </div>
              </div>
            </section>
            <section class="form-section">
              <h3 class="form-section-title">
                <Icon icon="ph:crosshair-duotone" class="form-section-icon" />扫描范围
              </h3>
              <div class="form-grid-3-col-top-align">
                <div class="form-grid-span-3">
                  <label class="form-label">扫描范围 (Scan Scope)</label>
                  <div class="form-grid-3-col">
                    <el-checkbox v-model="localModel.matchPersonaDescription" label="用户人设" />
                    <el-checkbox v-model="localModel.matchCharacterDescription" label="角色描述" />
                    <el-checkbox v-model="localModel.matchCharacterPersonality" label="角色性格" />
                    <el-checkbox v-model="localModel.matchCharacterDepthPrompt" label="角色笔记" />
                    <el-checkbox v-model="localModel.matchScenario" label="场景设定" />
                    <el-checkbox v-model="localModel.matchCreatorNotes" label="创作者备注" />
                  </div>
                  <p class="form-help-text">选择在哪些文本范围内匹配关键词（聊天消息之外的额外扫描范围）</p>
                </div>
              </div>
            </section>
            <section class="form-section">
              <h3 class="form-section-title">
                <Icon icon="ph:graph-duotone" class="form-section-icon" />递归与分组
              </h3>
              <div class="form-grid-3-col-top-align">
                <div class="form-flex-col">
                  <label class="form-label">排除递归激活</label><el-switch v-model="localModel.excludeRecursion" />
                </div>
                <div class="form-flex-col">
                  <label class="form-label">阻止后续递归</label><el-switch v-model="localModel.preventRecursion" />
                </div>
                <div class="form-flex-col">
                  <label class="form-label">仅在递归时激活</label><el-switch v-model="localModel.delayUntilRecursion" />
                </div>
                <div>
                  <label class="form-label">所属收录组 (Group)</label><el-input v-model="localModel.group"
                    placeholder="组名, 多个用逗号分隔" />
                </div>
                <div>
                  <label class="form-label">组内优先级/权重</label><el-input-number v-model="localModel.groupPriority"
                    controls-position="right" class="form-full-width" />
                </div>
                <div class="form-flex-col-start">
                  <label class="form-label">优先组内选择 (Prioritize)</label><el-switch v-model="localModel.groupOverride" />
                  <p class="form-help-text">开启后按Order选择</p>
                </div>
                <div class="form-flex-col-start">
                  <label class="form-label">启用组内评分 (Scoring)</label><el-switch :model-value="!!localModel.useGroupScoring" @update:model-value="val => updateBooleanField('useGroupScoring', !!val)" />
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
                  <label class="form-label">粘滞回合数 (Sticky)</label><el-input-number v-model="localModel.sticky" :min="0"
                    controls-position="right" class="form-full-width" />
                  <p class="form-help-text">0表示不粘滞</p>
                </div>
                <div>
                  <label class="form-label">冷却回合数 (Cooldown)</label><el-input-number v-model="localModel.cooldown" :min="0"
                    controls-position="right" class="form-full-width" />
                  <p class="form-help-text">0表示无冷却</p>
                </div>
                <div>
                  <label class="form-label">延迟激活 (Delay)</label><el-input-number v-model="localModel.delay" :min="0"
                    controls-position="right" class="form-full-width" />
                  <p class="form-help-text">需N条消息后激活, 0无延迟</p>
                </div>
              </div>
            </section>
            <section class="form-section">
              <h3 class="form-section-title">
                <Icon icon="ph:puzzle-piece-duotone" class="form-section-icon" />其他
              </h3>
              <div>
                <label class="form-label">自动化ID (Automation ID)</label><el-input v-model="localModel.automationId"
                  placeholder="用于Quick Replies扩展" />
              </div>
            </section>
          </div>
        </el-collapse-transition>
      </el-form>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElScrollbar, ElForm, ElInput, ElCheckbox, ElSelect, ElOption, ElSwitch, ElSlider, ElInputNumber, ElEmpty, ElCollapseTransition, ElButton } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { WorldBookEntry } from '../../types/types';

const props = defineProps<{
  entry: WorldBookEntry | null;
  modelValue: Partial<WorldBookEntry>;
  allKeywords?: string[];
  currentEntryIndex: number;
  totalEntries: number;
  isNextEntryInDifferentBook: boolean;
  isPreviousEntryInDifferentBook: boolean;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<WorldBookEntry>): void;
  (e: 'goToPrevious'): void;
  (e: 'goToNext'): void;
}>();

const entryFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const advancedOptionsVisible = ref(false);

const localModel = computed({
  get: () => props.modelValue || {},
  set: (value) => {
    console.log('[WorldBookEditor] localModel set 被触发:', {
      newValue: value,
      oldValue: props.modelValue
    });
    emit('update:modelValue', value);
  }
});

// Helper functions to handle boolean properties safely
const updateBooleanField = (field: keyof WorldBookEntry, value: boolean) => {
  const newModel = { ...localModel.value };
  (newModel as any)[field] = value;
  localModel.value = newModel;
};

const combinedPosition = computed({
  get: () => {
    if (localModel.value.position === 4) {
      return `4-${localModel.value.role}`;
    }
    return String(localModel.value.position);
  },
  set: (value) => {
    const newModel = { ...localModel.value };
    if (typeof value === 'string' && value.startsWith('4-')) {
      const role = parseInt(value.split('-')[1], 10);
      newModel.position = 4;
      newModel.role = role;
    } else {
      newModel.position = parseInt(String(value), 10);
    }
    localModel.value = newModel;
  }
});

watch(() => props.entry, () => {
  entryFormRef.value?.clearValidate();
});

</script>