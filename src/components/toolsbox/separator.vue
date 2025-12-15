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

           <div class="result-area" v-if="characterData">
               <el-tabs type="border-card">
                   <el-tab-pane label="元数据">
                       <div class="data-header">
                           <el-button type="primary" @click="saveJson" size="small">
                               <Icon icon="material-symbols:save" class="icon-left" />
                               保存JSON
                           </el-button>
                       </div>
                       <pre class="json-data">{{ characterData }}</pre>
                   </el-tab-pane>
               </el-tabs>
           </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { UploadFile } from 'element-plus';
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';
import { read } from '@/utils/pngCardMetadata';

const imageUrl = ref('');
const characterData = ref('');
const uploadedImageName = ref('');

const handleFileChange = (file: UploadFile) => {
    if (!file.raw || file.raw.type !== 'image/png') {
        ElMessage.error('请选择一个有效的 PNG 文件 (.png)');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const image = new Uint8Array(arrayBuffer);
            const jsonData = read(image);
            
            characterData.value = JSON.stringify(JSON.parse(jsonData), null, 2);
            imageUrl.value = URL.createObjectURL(file.raw as Blob);
            uploadedImageName.value = file.name.replace('.png', '');
            ElMessage.success(`成功解析图片: ${file.name}`);
        } catch (error: any) {
            characterData.value = '';
            imageUrl.value = '';
            ElMessage.error(`解析失败: ${error.message}`);
        }
    };
    reader.readAsArrayBuffer(file.raw);
};

const saveJson = () => {
    if (!characterData.value) return;

    const jsonStr = characterData.value;
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${uploadedImageName.value}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    ElMessage.success('JSON文件已保存');
};
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

.result-area {
   margin-top: 20px;
}

.data-header {
   display: flex;
   justify-content: flex-end;
   margin-bottom: 10px;
}

.icon-left {
   margin-right: 4px;
}

.json-data {
   white-space: pre-wrap;
   word-wrap: break-word;
   overflow: auto;
   background-color: var(--el-fill-color-lighter);
   padding: 10px;
   border-radius: 4px;
}
</style>
