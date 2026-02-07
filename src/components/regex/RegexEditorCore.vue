<template>
  <el-form-item label="规则名称 (scriptName)">
    <el-input
      :model-value="scriptName"
      @update:model-value="$emit('update:scriptName', $event)"
    />
  </el-form-item>
  <el-form-item label="查找 (findRegex)">
    <el-input
      :model-value="findRegex"
      @update:model-value="$emit('update:findRegex', $event)"
      type="textarea"
      :rows="3"
      placeholder="/pattern/flags"
    />
  </el-form-item>
  <el-form-item label="查找字符串宏替换模式">
    <el-select
      :model-value="substituteRegex"
      @update:model-value="$emit('update:substituteRegex', $event)"
      style="width: 100%"
    >
      <el-option
        :value="0"
        label="不替换 (NONE) - 使用原始正则表达式"
      />
      <el-option
        :value="1"
        label="原始替换 (RAW) - 替换宏但不转义"
      />
      <el-option
        :value="2"
        label="转义替换 (ESCAPED) - 替换宏并转义特殊字符"
      />
    </el-select>
    <template #label>
      <span>查找字符串宏替换模式</span>
      <el-tooltip
        placement="top"
        effect="dark"
      >
        <template #content>
          <div style="max-width: 300px">
            <p>
              <strong>NONE (0):</strong>
              不对查找字符串进行宏替换
            </p>
            <p>
              <strong>RAW (1):</strong>
              替换 {{ '{{' }}user}} 等宏，但不转义特殊字符
            </p>
            <p>
              <strong>ESCAPED (2):</strong>
              替换宏并转义正则特殊字符，适合匹配字面文本
            </p>
          </div>
        </template>
        <Icon
          icon="ph:question-duotone"
          style="margin-left: 4px; cursor: help"
        />
      </el-tooltip>
    </template>
  </el-form-item>
  <el-form-item label="替换 (replaceString)">
    <el-input
      :model-value="replaceString"
      @update:model-value="$emit('update:replaceString', $event)"
      type="textarea"
      :rows="5"
      placeholder="Hello, $1! 或 Hello, $<name>!"
    />
    <template #label>
      <span>替换 (replaceString)</span>
      <el-tooltip
        placement="top"
        effect="dark"
      >
        <template #content>
          <div style="max-width: 300px">
            <p>支持以下替换语法：</p>
            <p>
              •
              <strong>$0</strong>
              或
              <strong>{{ '{{' }}match}}</strong>
              - 完整匹配
            </p>
            <p>
              •
              <strong>$1, $2, ...</strong>
              - 数字捕获组
            </p>
            <p>
              •
              <strong>$&lt;name&gt;</strong>
              - 命名捕获组
            </p>
            <p>
              •
              <strong>{{ '{{' }}user}}, {{ '{{' }}char}}</strong>
              - 宏变量
            </p>
          </div>
        </template>
        <Icon
          icon="ph:question-duotone"
          style="margin-left: 4px; cursor: help"
        />
      </el-tooltip>
    </template>
  </el-form-item>
  <el-form-item label="移除字符 (trimStrings)">
    <el-input
      :model-value="trimStrings"
      @update:model-value="$emit('update:trimStrings', $event)"
      type="textarea"
      :rows="2"
      placeholder="每行一个需要移除的字符串"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ElTooltip } from 'element-plus';

withDefaults(
  defineProps<{
    scriptName: string;
    findRegex: string;
    replaceString: string;
    trimStrings: string;
    substituteRegex?: number;
  }>(),
  {
    substituteRegex: 0,
  }
);

defineEmits([
  'update:scriptName',
  'update:findRegex',
  'update:replaceString',
  'update:trimStrings',
  'update:substituteRegex',
]);
</script>
