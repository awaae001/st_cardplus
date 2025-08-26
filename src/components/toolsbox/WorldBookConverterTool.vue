<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { v4 as uuidv4 } from 'uuid';
import { convertCharacterBookToWorldBook, convertWorldBookToCharacterBook } from '../../utils/worldBookConverter';
import { cleanObject } from '../../utils/objectUtils';

const inputJson = ref('');
const outputJson = ref('');
const fileName = ref('');
const outputFileName = ref('converted.json');

/**
 * 从解析后的 JSON 数据中提取出 Book 对象，并确保其 entries 字段为数组。
 */
function extractAndNormalizeBookData(data: any): object | null {
  let bookData = null;

  if (data?.data?.character_book) {
    ElMessage.info('检测到角色卡文件，已自动提取 "character_book" 数据。');
    bookData = data.data.character_book;
  } else {
    bookData = data;
  }

  if (bookData && bookData.entries) {
    if (typeof bookData.entries === 'object' && !Array.isArray(bookData.entries)) {
      ElMessage.info('检测到对象格式的 "entries"，已自动转换为数组。');
      bookData.entries = Object.values(bookData.entries);
    }
    // 确保 bookData.name 存在，以便后续使用
    outputFileName.value = `${bookData.name || 'worldbook'}.json`;
    return bookData;
  }
  
  ElMessage.error('转换失败：无法在文件中找到有效的 "entries" 结构。');
  outputJson.value = '';
  return null;
}

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (file.type !== 'application/json') {
    ElMessage.error('请选择一个有效的 JSON 文件 (.json)');
    return;
  }

  fileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      inputJson.value = e.target?.result as string;
      ElMessage.success(`已成功加载文件: ${file.name}`);
      outputJson.value = '';
    } catch (error) {
      ElMessage.error('读取文件时出错');
    }
  };
  reader.readAsText(file);
}

function handleConvertToWorldBook() {
  if (!inputJson.value) return ElMessage.warning('请先加载一个 JSON 文件');
  try {
    const rawInput = JSON.parse(inputJson.value);
    const bookData = extractAndNormalizeBookData(rawInput);
    if (!bookData) return;

    const worldBook = convertCharacterBookToWorldBook(bookData as any, uuidv4());
    outputFileName.value = `${worldBook.name || 'worldbook'}.json`;
    outputJson.value = JSON.stringify(worldBook, null, 2);
    ElMessage.success('成功转换为世界书 (WorldBook) 格式!');
  } catch (error: any) {
    ElMessage.error(`转换失败: ${error.message}`);
  }
}

function handleConvertToCharacterBook() {
  if (!inputJson.value) return ElMessage.warning('请先加载一个 JSON 文件');
  try {
    const rawInput = JSON.parse(inputJson.value);
    const bookData = extractAndNormalizeBookData(rawInput);
    if (!bookData) return;
    
    const characterBook = convertWorldBookToCharacterBook(bookData as any);
    outputFileName.value = `${characterBook.name || 'characterbook'}.json`;
    
    // 使用 cleanObject 来移除最终导出 JSON 中的 name 和 id 字段
    const cleanedBook = cleanObject(characterBook, ['name', 'id']);
    
    outputJson.value = JSON.stringify(cleanedBook, null, 2);
    ElMessage.success('成功转换为角色卡世界书 (CharacterBook) 格式!');
  } catch (error: any) {
    ElMessage.error(`转换失败: ${error.message}`);
  }
}

function downloadJson() {
  if (!outputJson.value) {
    ElMessage.warning('没有可下载的内容');
    return;
  }
  const blob = new Blob([outputJson.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = outputFileName.value;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  ElMessage.success(`已开始下载: ${outputFileName.value}`);
}
</script>

<template>
  <div class="converter-container">
    <h1>世界书双向转换器</h1>
    <p>打开一个角色卡 (`.json`) 或独立的 `WorldBook` / `CharacterBook` (`.json`) 文件，然后选择要转换的目标格式。</p>
    
    <div class="io-grid">
      <div class="file-upload-area">
        <el-button type="primary" @click="($refs.fileInput as HTMLInputElement).click()">
          打开 JSON 文件
        </el-button>
        <input ref="fileInput" type="file" accept=".json" @change="handleFileChange" style="display: none;" />
        <p v-if="fileName" class="file-name">当前文件: {{ fileName }}</p>
        <p v-else class="placeholder">未选择文件</p>
      </div>
      <div class="output-area">
        <el-input
          v-model="outputJson"
          type="textarea"
          :rows="20"
          readonly
          placeholder="转换结果将显示在这里..."
          class="json-textarea"
        />
        <el-button v-if="outputJson" @click="downloadJson" class="download-btn">
          下载结果
        </el-button>
      </div>
    </div>

    <div class="button-group">
      <el-button type="primary" @click="handleConvertToWorldBook" :disabled="!inputJson">
        转换为世界书 (WorldBook)
      </el-button>
      <el-button type="success" @click="handleConvertToCharacterBook" :disabled="!inputJson">
        转换为角色卡世界书 (CharacterBook)
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.converter-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.io-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.file-upload-area {
  border: 2px dashed var(--el-border-color);
  border-radius: 4px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.output-area {
  position: relative;
}

.download-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.file-name {
  margin-top: 10px;
  color: var(--el-text-color-primary);
}

.placeholder {
  margin-top: 10px;
  color: var(--el-text-color-secondary);
}

.json-textarea {
  font-family: 'Courier New', Courier, monospace;
}

.button-group {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>