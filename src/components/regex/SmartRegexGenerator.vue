<template>
  <el-divider><h3>智能正则生成器</h3></el-divider>
  <el-form-item label="原始文本 (用于智能选择)">
    <el-input
      :model-value="inputText"
      @update:model-value="$emit('update:inputText', $event)"
      type="textarea"
      :rows="6"
      placeholder="在这里输入你要分析的原始文本..."
    />
  </el-form-item>
  <SmartTextSelector
    :input-text="inputText"
    @regex-generated="$emit('regex-generated', $event)"
  />
</template>

<script setup lang="ts">
import SmartTextSelector from '@/components/regex/SmartTextSelector.vue';

defineProps<{
  inputText: string;
}>();

defineEmits(['update:inputText', 'regex-generated']);
</script>