<template>
  <el-divider><h3>模拟器</h3></el-divider>
  <el-form-item label="测试字符串 (Test String)">
    <el-input :model-value="testString" @update:model-value="$emit('update:testString', $event)" type="textarea" :rows="5" />
  </el-form-item>
  <el-form-item label="结果 (Result)">
    <div class="result-controls">
      <el-switch
        :model-value="renderHtml"
        @update:model-value="$emit('update:renderHtml', $event)"
        active-text="渲染HTML"
        inactive-text="显示源码"
        size="small"
      />
    </div>
    <div v-if="renderHtml" class="result-box html-rendered" v-html="simulatedResult"></div>
    <pre v-else class="result-box">{{ simulatedResult }}</pre>
  </el-form-item>
  <el-form-item label="宏测试 (Macros)">
    <div class="macro-grid">
        <el-input :model-value="userMacroValue" @update:model-value="$emit('update:userMacroValue', $event)"><template #prepend>{{user}}</template></el-input>
        <el-input :model-value="charMacroValue" @update:model-value="$emit('update:charMacroValue', $event)"><template #prepend>{{char}}</template></el-input>
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
defineProps<{
  testString: string;
  simulatedResult: string;
  renderHtml: boolean;
  userMacroValue: string;
  charMacroValue: string;
}>();

defineEmits([
  'update:testString',
  'update:renderHtml',
  'update:userMacroValue',
  'update:charMacroValue',
]);

const user = '{{user}}';
const char = '{{char}}';
</script>

<style scoped>
.macro-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}
.result-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.result-box {
  background-color: var(--el-fill-color-light);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
  width: 100%;
  min-height: 100px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.result-box.html-rendered {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  white-space: normal;
}

.result-box.html-rendered * {
  max-width: 100%;
  word-wrap: break-word;
}
</style>