<template>
  <el-form-item label="规则名称 (scriptName)">
    <el-input :model-value="scriptName" @update:model-value="$emit('update:scriptName', $event)" />
  </el-form-item>
  <el-form-item label="查找 (findRegex)">
    <el-input :model-value="findRegex" @update:model-value="$emit('update:findRegex', $event)" type="textarea" :rows="3" placeholder="/pattern/flags" />
  </el-form-item>
  <el-form-item label="替换 (replaceString)">
    <el-input :model-value="replaceString" @update:model-value="$emit('update:replaceString', $event)" type="textarea" :rows="5" placeholder="Hello, $1!" />
  </el-form-item>
  <el-form-item label="移除字符 (trimStrings)">
    <el-input :model-value="trimStrings" @update:model-value="$emit('update:trimStrings', $event)" type="textarea" :rows="2" placeholder="每行一个需要移除的字符串" />
  </el-form-item>
</template>

<script setup lang="ts">
defineProps<{
  scriptName: string;
  findRegex: string;
  replaceString: string;
  trimStrings: string;
}>();

defineEmits([
  'update:scriptName',
  'update:findRegex',
  'update:replaceString',
  'update:trimStrings',
]);
</script>