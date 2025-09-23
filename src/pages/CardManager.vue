<template>
  <div class="page-container">
    <div class="page-header">
      <h2>角色卡管理器</h2>
      <el-button type="primary" @click="triggerFileInput">📁 加载角色卡数据 (PNG)</el-button>
      <el-button type="success" @click="handleSave">💾 保存角色卡</el-button>
      <input ref="fileInput" type="file" accept="image/png" style="display: none" @change="handleFileSelected" />
      <div class="header-tips">
        <small style="color: #666;">💡 使用"加载角色卡数据"来导入包含角色信息的PNG文件，使用左侧"选择图片"来设置角色头像</small>
      </div>
    </div>
    <div class="card-manager-layout">
      <!-- 左侧列 -->
      <div class="left-column">
        <!-- 角色图片上传 -->
        <div class="panel image-panel">
          <h3>角色图片</h3>
          <ImagePanel :preview-url="imagePreviewUrl" @image-change="handleImageUpdate" />
        </div>
        <!-- 世界书管理 -->
        <div class="panel worldbook-panel">
          <h3>世界书</h3>
          <InfoDisplayPanel type="worldbook" :character="characterData" />
        </div>
      </div>

      <!-- 右侧列 -->
      <div class="right-column">
        <div class="top-panels-container">
          <!-- 基础信息面板 -->
          <div class="panel main-panel">
            <h3>基础信息</h3>
            <BasicInfoPanel :character="characterData" />
          </div>
          <!-- 多开场白面板 -->
          <div class="panel greetings-panel">
            <h3>多开场白</h3>
            <GreetingsPanel v-model="characterData.data.alternate_greetings" />
          </div>
        </div>
        <!-- 其他与正则内容 -->
        <div class="panel footer-panel">
          <h3>其他与正则</h3>
          <InfoDisplayPanel type="regex" :character="characterData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { ElButton, ElMessage } from 'element-plus';
import BasicInfoPanel from '@/components/cardManager/BasicInfoPanel.vue';
import ImagePanel from '@/components/cardManager/ImagePanel.vue';
import GreetingsPanel from '@/components/cardManager/GreetingsPanel.vue';
import InfoDisplayPanel from '@/components/cardManager/InfoDisplayPanel.vue';
import { useV3CharacterCard } from '@/composables/characterCard/useV3CharacterCard';
import { read as readPngCard, write as writePngCard } from '@/utils/pngCardMetadata';

const { characterData, loadCharacter } = useV3CharacterCard();

// --- 文件加载 ---
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择有效的图片文件');
      target.value = '';
      return;
    }

    try {
      const imageBuffer = new Uint8Array(await file.arrayBuffer());

      const jsonDataString = readPngCard(imageBuffer);

      const decodedData = JSON.parse(jsonDataString);
      loadCharacter(decodedData);

      handleImageUpdate(file);

      ElMessage.success('角色卡加载成功！');
    } catch (error) {
      console.error('CardManager: Error loading character card:', error);
      ElMessage.error(`加载失败：${error instanceof Error ? error.message : '无法找到或解析角色卡数据'}`);
    }
    target.value = '';
  } else {
    console.warn('CardManager: No file selected');
  }
};

// --- 保存功能 ---
const handleSave = async () => {

  if (!characterImageFile.value) {
    console.warn('CardManager: No image file available for saving');
    ElMessage.warning('请先加载或选择一张图片作为角色卡背景。');
    return;
  }


  try {
    const imageBuffer = new Uint8Array(await characterImageFile.value.arrayBuffer());

    const jsonDataString = JSON.stringify(characterData.value, null, 2);

    const newImageBuffer = writePngCard(imageBuffer, jsonDataString);

    // 创建具有正确 ArrayBuffer 类型的新 Uint8Array
    const properBuffer = new Uint8Array(newImageBuffer);
    const blob = new Blob([properBuffer], { type: 'image/png' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const fileName = characterData.value.name ? `${characterData.value.name}.png` : 'character.png';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    ElMessage.success('角色卡已成功保存！');
  } catch (error) {
    console.error('CardManager: Failed to save character card:', error);
    ElMessage.error(`保存失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// --- 图片处理 ---
const characterImageFile = ref<File | null>(null);

const imagePreviewUrl = computed(() => {
  if (characterImageFile.value) {
    return URL.createObjectURL(characterImageFile.value);
  }
  return undefined;
});

const handleImageUpdate = (file: File) => {
  characterImageFile.value = file;
};

onUnmounted(() => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
  overflow: auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.page-header h2 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.card-manager-layout {
  display: grid;
  grid-template-columns: 20% 1fr;
  gap: 16px;
  flex-grow: 1;
  overflow: hidden;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden; /* 防止子元素溢出 */
}

.top-panels-container {
  flex: 1; /* 占据可用空间 */
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  overflow: hidden; /* 防止子元素溢出 */
}

.footer-panel {
  flex-shrink: 0; /* 防止被挤压 */
  max-height: 30%; /* 或者一个你认为合适的最大高度 */
}

.panel {
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--el-box-shadow-light);
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.main-panel,
.greetings-panel {
  overflow: auto;
}

.image-panel {
  flex: 0 0 60%;
}

.worldbook-panel {
  flex: 1;
}


h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
  font-weight: 600;
  flex-shrink: 0;
}
</style>