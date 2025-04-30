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

            <div class="result-area" v-if="parsedData || characterData">
                <el-tabs type="border-card">
                    <el-tab-pane label="解析结果" v-if="parsedData">
                        <pre>{{ parsedData }}</pre>
                    </el-tab-pane>
                    <el-tab-pane label="CCV3数据" v-if="characterData">
                        <div class="data-stats">
                            <div class="stat-item">
                                <span>字符数: {{ charCount }}</span>
                            </div>
                            <div class="stat-item">
                                <span>大小: {{ dataSize }} KB</span>
                            </div>
                            <div class="save-button">
                                <el-button type="primary" @click="saveJson" style="float: right;">
                                    保存JSON
                                </el-button>
                            </div>
                        </div>
                        <el-divider border-style="dashed" />
                        <pre class="json-data">{{ characterData }}</pre>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { UploadFile } from 'element-plus';
import { Icon } from '@iconify/vue';
import { ElMessage } from 'element-plus';
import { extractAndDecodeCcv3 } from '@/utils/metadataSeparator'; // Import the new utility function

interface ParsedData {
    filename: string
    size?: number
    type: string
    lastModified: number
}

const imageUrl = ref('')
const parsedData = ref<ParsedData | null>(null)
const characterData = ref<any>(null)
const initialData = ref<any>({})

const charCount = computed(() => {
    if (!characterData.value) return 0
    return JSON.stringify(characterData.value).length
})

const dataSize = computed(() => {
    if (!characterData.value) return 0
    const size = new Blob([JSON.stringify(characterData.value)]).size
    return (size / 1024).toFixed(2)
})

const saveJson = () => {
    if (!characterData.value) return

    const generateRandomNumber = () =>
        Math.floor(10000000 + Math.random() * 90000000).toString()
    const randomNumber = generateRandomNumber()

    const jsonStr = JSON.stringify(characterData.value, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `character_card_${randomNumber}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    ElMessage.success('JSON文件已保存')
}

const importImage = async (file: File) => {
    const decodedData = await extractAndDecodeCcv3(file);

    if (decodedData) {
        // 成功解码，更新数据
        // 假设 extractAndDecodeCcv3 返回的是需要合并到 initialData 的部分或全部数据
        // 如果返回的是完整数据，可能不需要 ...initialData.value
        characterData.value = { ...initialData.value, ...decodedData };
        ElMessage.success('数据已成功加载');
    } else {
        // 解码失败或未找到 ccv3 标签
        ElMessage.error('无法从图片中加载数据，请检查图片是否包含有效的 ccv3 元数据');
        // 可选：根据需求决定是否重置 characterData
        // characterData.value = { ...initialData.value };
    }
};

const handleFileChange = (file: UploadFile) => {
    if (!file.raw) return

    // 生成预览URL
    imageUrl.value = URL.createObjectURL(file.raw)
    importImage(file.raw)

    parsedData.value = {
        filename: file.name,
        size: file.size,
        type: file.raw.type,
        lastModified: file.raw.lastModified
    }
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

.json-data {
    white-space: pre-wrap;
    /* 保留空白符序列，但会自动换行 */
    white-space: -moz-pre-wrap;
    /* Mozilla浏览器的兼容性 */
    white-space: -pre-wrap;
    /* 旧版浏览器的兼容性 */
    white-space: -o-pre-wrap;
    /* Opera浏览器的兼容性 */
    word-wrap: break-word;
    /* 强制长单词换行 */
    max-height: 300px;
    overflow: auto;
}

.data-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
    flex-direction: row;
    align-items: center;
}

.stat-item {
    font-size: 14px;
    color: var(--el-text-color-secondary);
}

.save-button {
    clear: both;
    margin-left: auto;
}
</style>
