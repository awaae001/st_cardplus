<template>
  <div>
    <div v-if="sync.snapshotAvailable || sync.gistSnapshotAvailable" class="snapshot-revert-container">
      <p>已从云端获取新数据<br/>您可以在这里 <el-button type="primary" link @click="sync.revertCurrentPull">撤销</el-button> 此操作，本次会话有效</p>
    </div>
    <StorageInfoCard />
    <SyncCard />
    <LocalDataCard />
    <ClearDataCard />
    <CleanCacheCard />
  </div>
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import StorageInfoCard from './datamanage/StorageInfoCard.vue';
import SyncCard from './datamanage/SyncCard.vue';
import LocalDataCard from './datamanage/LocalDataCard.vue';
import ClearDataCard from './datamanage/ClearDataCard.vue';
import CleanCacheCard from './datamanage/CleanCacheCard.vue';
import { useSync, syncInjectionKey } from '@/composables/dataManagement/useSync';

const sync = useSync();
provide(syncInjectionKey, sync);

onMounted(sync.initSync);
</script>

<style scoped>
/* 通用卡片样式 */
:deep(.setting-card) {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s ease;
  margin-bottom: 16px;
}

:deep(.setting-card:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.setting-content) {
  display: flex;
  flex-direction: column;
}

:deep(.setting-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

:deep(.setting-info) {
  display: flex;
  align-items: center;
}

:deep(.setting-label) {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

:deep(.setting-description) {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  margin: 0;
  text-align: left;
}

.snapshot-revert-container {
  padding: 8px 12px;
  background-color: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-5);
  border-radius: 4px;
  margin-bottom: 16px;
  color: var(--el-color-success-dark-2);
}
</style>
