<template>
  <div class="info-display-container">
    <!-- 世界书信息展示 -->
    <div v-if="type === 'worldbook'">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="世界书名称">
          <el-tag v-if="!Array.isArray(character.data.character_book) && character.data.character_book?.name">{{ character.data.character_book.name }}</el-tag>
          <span v-else>未关联</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 正则脚本信息展示 -->
    <div v-else-if="type === 'regex'" class="regex-panel">
      <el-scrollbar>
        <div v-if="character.data.extensions?.regex_scripts?.length">
          <el-tag
            v-for="script in character.data.extensions.regex_scripts"
            :key="script.id"
            class="regex-script-tag"
          >
            {{ script.scriptName }}
          </el-tag>
        </div>
        <el-empty v-else description="无正则脚本" :image-size="60" />
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElDescriptions, ElDescriptionsItem, ElTag, ElScrollbar, ElEmpty } from 'element-plus';
import type { CharacterCardV3 } from '@/types/character-card-v3';

defineProps<{
  type: 'worldbook' | 'regex';
  character: CharacterCardV3;
}>();
</script>

<style scoped>
.info-display-container, .regex-panel, .el-scrollbar {
  height: 100%;
}
.regex-script-tag {
  margin: 4px;
}
</style>