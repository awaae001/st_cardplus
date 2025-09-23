<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { read, write } from '../../utils/pngCardMetadata';
import { Icon } from '@iconify/vue';

const inputJson = ref('');
const uploadedImage = ref<{ name: string; data: Uint8Array } | null>(null);
const outputFileName = ref('card.png');
const jsonInput = ref<HTMLInputElement | null>(null);

function triggerJsonUpload() {
 jsonInput.value?.click();
}

function handleJsonFileChange(event: Event) {
 const file = (event.target as HTMLInputElement).files?.[0];
 if (!file) return;

 if (file.type !== 'application/json') {
   ElMessage.error('请选择一个有效的 JSON 文件 (.json)');
   return;
 }

 const reader = new FileReader();
 reader.onload = (e) => {
   try {
     const text = e.target?.result as string;
     const parsed = JSON.parse(text);
     inputJson.value = JSON.stringify(parsed, null, 2);
     ElMessage.success(`已成功加载 JSON: ${file.name}`);
   } catch (error) {
     ElMessage.error('读取或解析 JSON 文件时出错');
   }
 };
 reader.readAsText(file, 'UTF-8');
}

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (file.type !== 'image/png') {
    ElMessage.error('请选择一个有效的 PNG 文件 (.png)');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      uploadedImage.value = {
        name: file.name,
        data: new Uint8Array(arrayBuffer),
      };
      outputFileName.value = file.name;
      ElMessage.success(`已成功加载图片: ${file.name}`);
    } catch (error) {
      ElMessage.error('读取文件时出错');
    }
  };
  reader.readAsArrayBuffer(file);
}

function handleReadMetadata() {
  if (!uploadedImage.value) {
    return ElMessage.warning('请先上传一个 PNG 图片');
  }
  try {
    const jsonData = read(uploadedImage.value.data);
    inputJson.value = JSON.stringify(JSON.parse(jsonData), null, 2);
    ElMessage.success('成功读取元数据！');
  } catch (error: any) {
    ElMessage.error(`读取失败: ${error.message}`);
  }
}

function handleWriteMetadata() {
  if (!uploadedImage.value) {
    return ElMessage.warning('请先上传一个 PNG 图片');
  }
  if (!inputJson.value) {
    return ElMessage.warning('请输入要写入的 JSON 数据');
  }
  try {
    // 验证JSON有效性
    const parsedJson = JSON.parse(inputJson.value);
    const jsonString = JSON.stringify(parsedJson);

    const newPngData = write(uploadedImage.value.data, jsonString);
    
    downloadPng(newPngData);

  } catch (error: any) {
    ElMessage.error(`写入失败: ${error.message}`);
  }
}

function downloadPng(data: Uint8Array) {
  const blob = new Blob([data as any], { type: 'image/png' });
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
    <div class="header">
        <el-button type="primary" plain @click="$router.push('/toolbox')" class="back-button">
            <Icon icon="material-symbols:arrow-back" width="16" height="16" />
            返回工具箱
        </el-button>
        <h1>PNG 元数据工具</h1>
    </div>
    <p>上传一个 PNG 图片，然后可以读取其中的 'chara'/'ccv3' 元数据，或者将新的 JSON 数据写入并下载。</p>
    
    <div class="io-grid">
      <div class="file-upload-area">
        <el-button type="primary" @click="($refs.fileInput as HTMLInputElement).click()">
          打开 PNG 图片
        </el-button>
        <input ref="fileInput" type="file" accept=".png" @change="handleFileChange" style="display: none;" />
        <p v-if="uploadedImage" class="file-name">当前图片: {{ uploadedImage.name }}</p>
        <p v-else class="placeholder">未选择图片</p>
      </div>
      <div class="input-area">
       <div class="input-header">
         <h4>JSON 数据</h4>
         <el-button @click="triggerJsonUpload" size="small">
           <Icon icon="material-symbols:upload-file-outline" class="icon-left" />
           上传 JSON
         </el-button>
       </div>
        <el-input
          v-model="inputJson"
          type="textarea"
          :rows="18"
          placeholder="JSON 数据将显示在这里，或在此处输入要写入的数据..."
          class="json-textarea"
        />
       <input ref="jsonInput" type="file" accept=".json" @change="handleJsonFileChange" style="display: none;" />
      </div>
    </div>

    <div class="button-group">
      <el-button type="primary" @click="handleReadMetadata" :disabled="!uploadedImage">
        读取元数据
      </el-button>
      <el-button type="success" @click="handleWriteMetadata" :disabled="!uploadedImage || !inputJson">
        写入元数据并下载
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
.header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 1rem;
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

.input-area {
  position: relative;
  display: flex;
  flex-direction: column;
}

.input-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 8px;
}

.input-header h4 {
 margin: 0;
 font-size: 1rem;
}

.icon-left {
 margin-right: 4px;
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
  height: 100%;
}

.button-group {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>