<template>
  <div class="info-display-container">
    <!-- 正则脚本信息展示 -->
    <div v-if="type === 'regex'" class="regex-panel">
      <div v-if="character.data.extensions?.regex_scripts?.length" class="regex-content">
        <!-- 单个正则脚本时显示类似世界书的样式 -->
        <div v-if="character.data.extensions.regex_scripts.length === 1" class="regex-single-script">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="正则脚本">
              <el-tag type="success" size="large">
                {{ character.data.extensions.regex_scripts[0].scriptName }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <div class="regex-actions-section">
            <el-button
              type="primary"
              size="small"
              @click="handleSendToRegexEditor"
            >
              <Icon icon="ph:upload-duotone" style="margin-right: 4px;" />
              发送到正则编辑器
            </el-button>
          </div>
        </div>
        
        <!-- 多个正则脚本时显示列表 -->
        <div v-else class="regex-multiple-scripts">
          <el-scrollbar max-height="200px">
            <div class="regex-scripts-list">
              <el-tag
                v-for="script in character.data.extensions.regex_scripts"
                :key="script.id"
                class="regex-script-tag"
              >
                {{ script.scriptName }}
              </el-tag>
            </div>
          </el-scrollbar>
          <div class="regex-actions-section">
            <el-button
              type="primary"
              size="small"
              @click="handleSendToRegexEditor"
            >
              <Icon icon="ph:upload-duotone" style="margin-right: 4px;" />
              发送到正则编辑器
            </el-button>
          </div>
        </div>
      </div>
      <el-empty v-else description="无正则脚本" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElDescriptions, ElDescriptionsItem, ElTag, ElScrollbar, ElEmpty, ElButton, ElMessage } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { CharacterCardV3 } from '@/types/character-card-v3';
import { useRegexCollection } from '@/composables/regex/useRegexCollection';

const props = defineProps<{
  type: 'regex';
  character: CharacterCardV3;
}>();

// 正则脚本导入功能
const { handleImportFromCharacterCard } = useRegexCollection();

// 发送正则脚本到正则编辑器
const handleSendToRegexEditor = async () => {
  const scripts = props.character.data.extensions?.regex_scripts;
  
  if (!scripts || scripts.length === 0) {
    ElMessage.warning('当前角色卡没有正则脚本');
    return;
  }

  const characterId = props.character.id || 'unknown';
  const characterName = props.character.data.name || '未命名角色';

  try {
    const categoryId = await handleImportFromCharacterCard(
      scripts,
      characterId,
      characterName
    );

    if (categoryId) {
      ElMessage.success({
        message: `正则脚本已成功发送到正则编辑器！`,
        duration: 3000,
      });
    }
  } catch (error) {
    console.error('发送正则脚本失败:', error);
    ElMessage.error(`发送失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};
</script>

<style scoped>
.info-display-container {
  height: 100%;
}

.regex-panel {
  height: 100%;
}

.regex-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.regex-single-script,
.regex-multiple-scripts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.regex-scripts-list {
  padding: 8px;
}

.regex-script-tag {
  margin: 4px;
}

.regex-actions-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.el-scrollbar {
  height: 100%;
}
</style>
