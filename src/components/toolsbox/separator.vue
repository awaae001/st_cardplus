<template>
    <div class="image-parser-container">
        <div class="header-top">
            <el-button type="primary" plain @click="$router.push('/toolbox')" class="back-button">
                <Icon icon="material-symbols:arrow-back" width="16" height="16" />
                返回工具箱
            </el-button>
            <el-alert title="解析角色卡自带的json并且本地保存，方便快捷" type="info" :closable="false"
                class="info-alert" />
        </div>
        <h3>元数据分离器</h3>
        <el-card shadow="hover">
            <el-upload class="upload-demo" drag action="" :auto-upload="false" :on-change="handleFileChange"
                :show-file-list="false">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                </div>
            </el-upload>

            <div class="preview-area" v-if="imageUrl">
                <el-image :src="imageUrl" :preview-src-list="[imageUrl]" fit="contain" style="max-height: 300px;" />
            </div>

            <el-divider></el-divider>

            <div class="io-grid">
                <div class="result-area" v-if="characterData">
                    <h4>元数据 (JSON)</h4>
                    <el-input v-model="characterData" type="textarea" :rows="18"
                        placeholder="JSON 数据将显示在这里，或在此处输入要写入的数据..." class="json-textarea" />
                </div>
                <div v-else class="placeholder-box">
                    <Icon icon="mdi:code-json" width="48" height="48" />
                    <p>从PNG读取的元数据将显示在此处</p>
                </div>
            </div>

            <div class="button-group">
                <el-button type="primary" @click="handleReadMetadata" :disabled="!uploadedImage">
                    <Icon icon="material-symbols:upload-file" class="icon-left" />
                    读取元数据
                </el-button>
                <el-button type="success" @click="handleWriteMetadata" :disabled="!uploadedImage || !characterData">
                    <Icon icon="material-symbols:download" class="icon-left" />
                    写入元数据并下载
                </el-button>
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { UploadFile } from 'element-plus';
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';
import { read, write } from '@/utils/pngCardMetadata';

const imageUrl = ref('');
const characterData = ref('');
const uploadedImage = ref<{ name: string; data: Uint8Array } | null>(null);

const handleFileChange = (file: UploadFile) => {
    if (!file.raw || file.raw.type !== 'image/png') {
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
            imageUrl.value = URL.createObjectURL(file.raw as Blob);
            ElMessage.success(`已成功加载图片: ${file.name}`);
            handleReadMetadata(); // 自动读取
        } catch (error) {
            ElMessage.error('读取文件时出错');
        }
    };
    reader.readAsArrayBuffer(file.raw);
};

function handleReadMetadata() {
    if (!uploadedImage.value) {
        return ElMessage.warning('请先上传一个 PNG 图片');
    }
    try {
        const jsonData = read(uploadedImage.value.data);
        characterData.value = JSON.stringify(JSON.parse(jsonData), null, 2);
        ElMessage.success('成功读取元数据！');
    } catch (error: any) {
        characterData.value = '';
        ElMessage.error(`读取失败: ${error.message}`);
    }
}

function handleWriteMetadata() {
    if (!uploadedImage.value) {
        return ElMessage.warning('请先上传一个 PNG 图片');
    }
    if (!characterData.value) {
        return ElMessage.warning('请输入要写入的 JSON 数据');
    }
    try {
        const parsedJson = JSON.parse(characterData.value);
        const jsonString = JSON.stringify(parsedJson); // 压缩JSON

        const newPngData = write(uploadedImage.value.data, jsonString);
        downloadPng(newPngData, uploadedImage.value.name);

    } catch (error: any) {
        ElMessage.error(`写入失败: ${error.message}`);
    }
}

function downloadPng(data: Uint8Array, fileName: string) {
    const blob = new Blob([data as any], { type: 'image/p' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ElMessage.success(`已开始下载: ${fileName}`);
}
</script>

<style scoped>
.header-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
}

.header-top .format-button {
    margin-right: auto;
}

.header-top .info-alert {
    flex: 1;
    margin: 0;
}

.image-parser-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.upload-demo {
    margin-bottom: 20px;
}

.preview-area {
    margin: 20px 0;
    display: flex;
    justify-content: center;
}

.result-area {
    margin-top: 20px;
}

.io-grid {
   display: grid;
   grid-template-columns: 1fr;
   gap: 20px;
   margin-top: 20px;
}

@media (min-width: 768px) {
   .io-grid {
       grid-template-columns: 1fr 1fr;
   }
   .preview-area {
       grid-column: 1 / 2;
   }
   .result-area, .placeholder-box {
       grid-column: 2 / 3;
   }
}

.result-area {
   display: flex;
   flex-direction: column;
}
.json-textarea {
   font-family: 'Courier New', Courier, monospace;
   flex-grow: 1;
}

.placeholder-box {
   border: 2px dashed var(--el-border-color);
   border-radius: 4px;
   padding: 20px;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   text-align: center;
   color: var(--el-text-color-secondary);
   height: 100%;
}

.button-group {
   margin-top: 20px;
   display: flex;
   gap: 10px;
   justify-content: center;
}
.icon-left {
   margin-right: 8px;
}
</style>
