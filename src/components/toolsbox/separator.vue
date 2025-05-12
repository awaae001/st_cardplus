<template>
  <div class="image-parser-page p-3 md:p-5 h-full flex flex-col">
    <header class="flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-6 flex-shrink-0 gap-y-3">
      <div class="flex items-center gap-3">
        <button @click="$router.push('/toolbox')" class="btn-secondary-adv !py-1.5 !px-3 text-sm">
          <Icon icon="ph:arrow-left-duotone" class="mr-1.5 -ml-0.5" />
          返回工具箱
        </button>
        <h1 class="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-100">
          图片元数据分离器
        </h1>
      </div>
    </header>

    <el-alert title="解析角色卡图片内嵌的JSON元数据并支持本地保存。" type="info" :closable="false" class="mb-4 md:mb-6 flex-shrink-0" />

    <div class="content-panel flex-grow flex flex-col min-h-0">
      <div class="content-panel-header">
        <h3 class="content-panel-title flex items-center gap-2">
          <Icon icon="ph:image-square-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
          上传与预览
        </h3>
      </div>
      <div class="content-panel-body flex-grow flex flex-col md:flex-row gap-4 md:gap-6">
        <div class="w-full md:w-1/3">
          <el-upload
            class="image-upload-area"
            drag
            action=""
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept="image/png, image/webp"
          >
            <div class="el-upload__icon text-6xl text-neutral-400 dark:text-neutral-500"><Icon icon="ph:upload-simple-duotone" /></div>
            <div class="el-upload__text text-neutral-600 dark:text-neutral-300">将图片拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                仅支持 PNG 和 WebP 格式的图片
              </div>
            </template>
          </el-upload>
        </div>

        <div class="w-full md:w-2/3 flex justify-center items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg min-h-[200px] p-4">
          <el-image
            v-if="imageUrl"
            :src="imageUrl"
            :preview-src-list="[imageUrl]"
            fit="contain"
            class="max-h-[300px] md:max-h-[400px] w-auto rounded-md shadow-md"
          />
          <el-empty v-else description="暂无图片预览" :image-size="100" />
        </div>
      </div>
    </div>

    <div class="content-panel mt-4 md:mt-6 flex-shrink-0" v-if="parsedData || characterData">
       <div class="content-panel-header">
        <h3 class="content-panel-title flex items-center gap-2">
          <Icon icon="ph:file-text-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
          解析结果
        </h3>
        <button v-if="characterData" @click="saveJson" class="btn-primary-adv !py-1.5 !px-3 text-sm">
            <Icon icon="ph:floppy-disk-duotone" class="mr-1.5 -ml-0.5" />保存JSON
        </button>
      </div>
      <div class="content-panel-body">
        <el-tabs type="border-card" class="custom-tabs">
          <el-tab-pane label="图片信息" v-if="parsedData" class="tab-pane-content">
            <pre class="metadata-pre">{{ parsedData }}</pre>
          </el-tab-pane>
          <el-tab-pane label="角色卡数据 (CCV3)" v-if="characterData" class="tab-pane-content">
            <div class="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 mb-2">
              <span>字符数: {{ charCount }}</span>
              <span>数据大小: {{ dataSize }} KB</span>
            </div>
            <pre class="json-data-pre">{{ characterData }}</pre>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { UploadFile } from 'element-plus';
import { Icon } from '@iconify/vue';
import { ElMessage, ElButton, ElAlert, ElUpload, ElImage, ElTabs, ElTabPane, ElEmpty, ElTooltip } from 'element-plus';
import { extractAndDecodeCcv3 } from '@/utils/metadataSeparator';

interface ParsedFileInfo {
    filename: string
    size?: number
    type: string
    lastModified: number
}

const imageUrl = ref('')
const parsedData = ref<ParsedFileInfo | null>(null)
const characterData = ref<any>(null)

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
    link.download = `character_card_v3_${characterData.value.name || randomNumber}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    ElMessage.success('角色卡JSON文件已保存')
}

const importImageAndExtract = async (file: File) => {
    try {
        const decodedData = await extractAndDecodeCcv3(file);
        if (decodedData) {
            characterData.value = decodedData;
            ElMessage.success('图片内嵌角色卡数据已成功加载！');
        } else {
            characterData.value = null;
            ElMessage.info('在图片中未找到有效的角色卡数据 (ccv3/chara)。');
        }
    } catch (error) {
        characterData.value = null;
        ElMessage.error('解析图片数据时发生错误。');
        console.error("Error extracting/decoding data:", error);
    }
};

const handleFileChange = (uploadFile: UploadFile) => {
    if (!uploadFile.raw) return

    imageUrl.value = URL.createObjectURL(uploadFile.raw)
    importImageAndExtract(uploadFile.raw)

    parsedData.value = {
        filename: uploadFile.name,
        size: uploadFile.size,
        type: uploadFile.raw.type,
        lastModified: uploadFile.raw.lastModified
    }
}
</script>

<style scoped>
.image-upload-area :deep(.el-upload-dragger) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px; /* Or adjust as needed */
  border-radius: var(--radius-lg);
  background-color: var(--color-neutral-50);
  border-color: var(--color-neutral-300);
}
.dark .image-upload-area :deep(.el-upload-dragger) {
  background-color: var(--color-neutral-800);
  border-color: var(--color-neutral-700);
}
.image-upload-area :deep(.el-upload-dragger:hover) {
  border-color: var(--color-accent-500);
}

.metadata-pre, .json-data-pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-800);
  padding: 10px 15px;
  border-radius: var(--radius-md);
  max-height: 400px;
  overflow: auto;
  font-size: 0.8125rem; /* 13px */
}
.dark .metadata-pre, .dark .json-data-pre {
  background-color: var(--color-neutral-850);
  color: var(--color-neutral-200);
}

.custom-tabs :deep(.el-tabs__content) {
  padding: 0;
}
.tab-pane-content {
  padding: 15px;
}
</style>