<template>
  <el-scrollbar class="worldbook-editor-scrollbar">
    <div class="content-panel-body">
      <div v-if="!entry" class="worldbook-editor-empty-state">
        <el-empty description="请在列表标签页中选择或新增一个条目进行编辑。" :image-size="80"></el-empty>
      </div>
      <el-form v-if="entry && modelValue" :model="localModel" label-position="top" ref="entryFormRef"
        class="worldbook-editor-form">
        <section class="form-section">
          <h3 class="form-section-title">
            <Icon icon="ph:info-duotone" class="form-section-icon" />基本信息
          </h3>
          <div class="form-section-content">
            <div>
              <label class="form-label">标题/备注 (Comment)</label><el-input v-model="localModel.comment"
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
              <label class="form-label">条目内容 (Content)</label><el-input v-model="localModel.content" type="textarea"
                :autosize="{ minRows: 4, maxRows: 10 }" placeholder="当条目激活时，这段文本会被插入到AI的提示中..." />
            </div>
            <div class="form-checkbox-padding">
              <el-checkbox v-model="localModel.addMemo" label="插入时附带备注 (Add Memo)" />
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
              <label class="form-label">次要关键词逻辑 (Logic)</label><el-select v-model="localModel.selectiveLogic"
                placeholder="选择逻辑" class="form-full-width" :disabled="!localModel.selective"><el-option label="与任意"
                  :value="0" /><el-option label="非所有" :value="1" /><el-option label="非任何" :value="2" /><el-option
                  label="与所有" :value="3" /></el-select><el-checkbox v-model="localModel.selective" label="启用次要逻辑"
                class="form-checkbox-margin-top" />
            </div>
            <div class="form-flex-col">
              <label class="form-label">常驻 (Constant)</label><el-switch v-model="localModel.constant" />
            </div>
            <div class="form-flex-col">
              <label class="form-label">禁用 (Disable)</label><el-switch v-model="localModel.disable" />
            </div>
            <div class="form-grid-span-2">
              <label class="form-label">触发概率 (Probability %)</label>
              <div class="form-flex-row">
                <el-slider v-model="localModel.probability" :min="0" :max="100" show-input class="form-slider"
                  :disabled="!localModel.useProbability" /><el-checkbox v-model="localModel.useProbability" label="启用概率"
                  class="form-checkbox-nowrap" />
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
              <label class="form-label">插入顺序 (Order)</label><el-input-number v-model="localModel.order" :min="0"
                controls-position="right" class="form-full-width" />
            </div>
            <div>
              <label class="form-label">插入位置 (Position)</label><el-select v-model="localModel.position"
                placeholder="选择插入位置" class="form-full-width"><el-option label="角色定义之前" :value="0" />
                <el-option label="角色定义之后" :value="1" /><el-option label="作者注释之前" :value="2" />
                <el-option label="作者注释之后" :value="3" /><el-option label="@D" :value="4" />
                <el-option label="示例消息之前" :value="5" /><el-option label="示例消息之后" :value="6" /></el-select>
            </div>
            <div v-if="localModel.position === 4">
              <label class="form-label">深度角色 (Role for In-chat)</label><el-select v-model="localModel.role"
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
              <label class="form-label">扫描深度 (Scan Depth)</label><el-input-number v-model="localModel.depth" :min="0"
                :max="999" controls-position="right" class="form-full-width" :disabled="localModel.position !== 4" />
              <p class="form-help-text">0表示可能使用全局设置。</p>
            </div>
            <div class="form-flex-col-start">
              <label class="form-label">大小写敏感</label><el-switch v-model="localModel.caseSensitive" />
            </div>
            <div class="form-flex-col-start">
              <label class="form-label">匹配整个单词</label><el-switch v-model="localModel.matchWholeWords" />
              <p class="form-help-text">非空格分词语言建议关闭。</p>
            </div>
            <div class="form-flex-col-start">
              <label class="form-label">启用向量匹配</label><el-switch v-model="localModel.vectorized" />
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
              <label class="form-label">启用组内评分 (Scoring)</label><el-switch v-model="localModel.useGroupScoring" />
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
      </el-form>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElScrollbar, ElForm, ElInput, ElCheckbox, ElSelect, ElOption, ElSwitch, ElSlider, ElInputNumber, ElEmpty } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { WorldBookEntry } from './types';

const props = defineProps<{
  entry: WorldBookEntry | null;
  modelValue: Partial<WorldBookEntry>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<WorldBookEntry>): void;
}>();

const entryFormRef = ref<InstanceType<typeof ElForm> | null>(null);

const updateModel = (field: keyof WorldBookEntry, value: any) => {
  if (props.modelValue) {
    const newModelValue = { ...props.modelValue };
    (newModelValue as any)[field] = value;
    emit('update:modelValue', newModelValue);
  }
};

const localModel = computed({
  get: () => props.modelValue || {},
  set: (value) => emit('update:modelValue', value)
});

const keysInput = computed({
  get: () => props.modelValue?.key ? props.modelValue.key.join(', ') : '',
  set: (value) => {
    const keys = value.split(',').map(k => k.trim()).filter(k => k);
    updateModel('key', keys);
  },
});

const secondaryKeysInput = computed({
  get: () => props.modelValue?.keysecondary ? props.modelValue.keysecondary.join(', ') : '',
  set: (value) => {
    const keys = value.split(',').map(k => k.trim()).filter(k => k);
    updateModel('keysecondary', keys);
  },
});

watch(() => props.entry, () => {
  entryFormRef.value?.clearValidate();
});

</script>