<template>
  <div class="token-selector">
    <div class="selector-header">
      <h5>分词选择器</h5>
      <div class="controls">
        <el-select v-model="selectionType" size="small" style="width: 120px;">
          <el-option label="锚点" value="anchor" />
          <el-option label="变量" value="variable" />
          <el-option label="起始" value="start" />
          <el-option label="终止" value="end" />
        </el-select>
        <el-button
          size="small"
          type="danger"
          @click="clearSelection"
          :disabled="!hasSelection"
        >
          清除选择
        </el-button>
      </div>
    </div>

    <div class="token-container">
      <span
        v-for="(token, index) in tokens"
        :key="index"
        class="token"
        :class="{
          'selected-start': selectedStartIndex === index,
          'selected-end': selectedEndIndex === index,
          'in-range': isInSelectedRange(index),
          'selectable': true
        }"
        @click="handleTokenClick(index)"
      >
        {{ token.text }}
      </span>
    </div>

    <div class="selection-info" v-if="hasSelection">
      <div class="selected-text">
        <strong>已选择:</strong>
        <span class="highlight">{{ selectedText }}</span>
      </div>
      <div class="selection-details">
        <span>类型: {{ getSelectionTypeLabel(selectionType) }}</span>
        <span>位置: {{ selectionStartPos }} - {{ selectionEndPos }}</span>
        <span>长度: {{ selectedText.length }}</span>
      </div>
      <el-button
        type="primary"
        size="small"
        @click="confirmSelection"
        :disabled="!canConfirm"
      >
        确认选择
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TextSelection } from '@/composables/regex/useSmartRegexGenerator'

interface Token {
  text: string
  startIndex: number
  endIndex: number
}

const props = defineProps<{
  inputText: string
}>()

const emit = defineEmits<{
  selectionCreated: [selection: TextSelection]
}>()

// 响应式数据
const selectedStartIndex = ref<number | null>(null)
const selectedEndIndex = ref<number | null>(null)
const selectionType = ref<'anchor' | 'variable' | 'start' | 'end'>('variable')

// 分词算法
const tokenize = (text: string): Token[] => {
  const tokens: Token[] = []
  // 简单分词：每个字符作为一个token（适合您的例子 ABCDEFGHIJKLMN）
  // 也可以扩展为更复杂的分词算法
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char.trim()) { // 跳过纯空白字符
      tokens.push({
        text: char,
        startIndex: i,
        endIndex: i + 1
      })
    }
  }

  return tokens
}

// 计算属性
const tokens = computed(() => tokenize(props.inputText))

const hasSelection = computed(() =>
  selectedStartIndex.value !== null && selectedEndIndex.value !== null
)

const selectedRange = computed(() => {
  if (!hasSelection.value) return null

  const start = Math.min(selectedStartIndex.value!, selectedEndIndex.value!)
  const end = Math.max(selectedStartIndex.value!, selectedEndIndex.value!)

  return { start, end }
})

const selectedText = computed(() => {
  if (!selectedRange.value) return ''

  const { start, end } = selectedRange.value
  const startToken = tokens.value[start]
  const endToken = tokens.value[end]

  if (!startToken || !endToken) return ''

  return props.inputText.substring(startToken.startIndex, endToken.endIndex)
})

const selectionStartPos = computed(() => {
  if (!selectedRange.value) return 0
  return tokens.value[selectedRange.value.start]?.startIndex ?? 0
})

const selectionEndPos = computed(() => {
  if (!selectedRange.value) return 0
  return tokens.value[selectedRange.value.end]?.endIndex ?? 0
})

const canConfirm = computed(() => {
  return hasSelection.value && selectedText.value.length > 0
})

// 方法
const isInSelectedRange = (index: number): boolean => {
  if (!selectedRange.value) return false
  const { start, end } = selectedRange.value
  return index >= start && index <= end
}

const handleTokenClick = (index: number) => {
  if (selectedStartIndex.value === null) {
    // 第一次点击，设置起始位置
    selectedStartIndex.value = index
    selectedEndIndex.value = null
  } else if (selectedEndIndex.value === null) {
    // 第二次点击，设置结束位置
    selectedEndIndex.value = index
  } else {
    // 已有完整选择，重新开始
    selectedStartIndex.value = index
    selectedEndIndex.value = null
  }
}

const clearSelection = () => {
  selectedStartIndex.value = null
  selectedEndIndex.value = null
}

const confirmSelection = () => {
  if (!canConfirm.value) return

  const selection: TextSelection = {
    type: selectionType.value,
    text: selectedText.value,
    startIndex: selectionStartPos.value,
    endIndex: selectionEndPos.value
  }

  emit('selectionCreated', selection)
  clearSelection()
}

const getSelectionTypeLabel = (type: string): string => {
  const labels = {
    anchor: '锚点',
    variable: '变量',
    start: '起始',
    end: '终止'
  }
  return labels[type as keyof typeof labels] || type
}

// 监听输入文本变化，清除选择
watch(() => props.inputText, () => {
  clearSelection()
})
</script>

<style scoped>
.token-selector {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-bg-color-page);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.selector-header h5 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.token-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  min-height: 60px;
}

.token {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 28px;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.token.selectable:hover {
  background: var(--el-color-primary-light-7);
  border-color: var(--el-color-primary-light-5);
  transform: translateY(-1px);
}

.token.selected-start {
  background: var(--el-color-success);
  color: white;
  border-color: var(--el-color-success);
  font-weight: bold;
}

.token.selected-end {
  background: var(--el-color-warning);
  color: white;
  border-color: var(--el-color-warning);
  font-weight: bold;
}

.token.in-range {
  background: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
}

.selection-info {
  padding: 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.selected-text {
  margin-bottom: 8px;
  font-size: 14px;
}

.selected-text .highlight {
  background: var(--el-color-primary-light-8);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: var(--el-color-primary);
}

.selection-details {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.selection-details span {
  padding: 2px 8px;
  background: var(--el-fill-color-blank);
  border-radius: 3px;
  border: 1px solid var(--el-border-color-lighter);
}
</style>
