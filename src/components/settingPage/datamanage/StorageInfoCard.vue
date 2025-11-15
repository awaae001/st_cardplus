<template>
  <div class="setting-card">
    <div class="setting-content">
      <div class="setting-header">
        <div class="setting-info">
          <span class="setting-label">存储空间使用情况</span>
          <Icon icon="material-symbols:database-outline" width="20" height="20"
            style="margin-left: 8px; color: var(--el-color-primary);" />
        </div>
      </div>
      <div class="storage-info">
        <div class="storage-bar">
          <span>全局占用</span>
          <el-progress :percentage="indexedDBUsage.percentage" :text-inside="true" :stroke-width="20"
                       :status="getProgressStatus(indexedDBUsage.percentage)">
            <span>{{ indexedDBUsage.text }}</span>
          </el-progress>
          <div class="storage-details" v-if="worldBookStats && characterCardStats">
            <span>世界书：{{ worldBookStats.bookCount }} 本，{{ worldBookStats.entryCount }} 条目，约 {{ formatBytes(worldBookStats.approxBytes) }}</span>
            <span>角色卡：{{ characterCardStats.cardCount }} 张，约 {{ formatBytes(characterCardStats.approxBytes) }}</span>
          </div>
        </div>
        <div class="storage-bar">
          <span>浏览器缓存 (localStorage)</span>
          <el-progress :percentage="localStorageUsage.percentage" :text-inside="true" :stroke-width="20"
                       :status="getProgressStatus(localStorageUsage.percentage)">
            <span>{{ localStorageUsage.text }}</span>
          </el-progress>
        </div>
      </div>
       <p class="setting-description" style="margin-top: 12px;">
        核心数据库用于存储世界书等大数据，容量大<br/>浏览器缓存用于存储地标、设置等轻量数据，容量较小<br/>
        存储大小由浏览器自动管理
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted } from 'vue';
import { useStorageInfo } from '@/composables/dataManagement/useStorageInfo';

const {
  indexedDBUsage,
  localStorageUsage,
  worldBookStats,
  characterCardStats,
  formatBytes,
  getProgressStatus,
  updateStorageInfo,
} = useStorageInfo();

onMounted(updateStorageInfo);
</script>

<style scoped>
.storage-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.storage-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.storage-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.storage-bar span {
  font-size: 14px;
  color: var(--el-text-color-regular);
  text-align: left;
}
</style>