<template>
  <div class="setting-card">
    <div class="setting-content">
      <div class="setting-header">
        <div class="setting-info">
          <span class="setting-label">清除所有本地数据</span>
          <Icon icon="mdi:delete-variant" width="20" height="20" style="margin-left: 8px; color: var(--el-color-danger);" />
        </div>
        <div>
          <el-button @click="clearAllData" type="danger" plain>
            <Icon icon="mdi:delete-empty" width="20" height="20" style="margin-right: 8px;" />
            立即清除
          </el-button>
        </div>
      </div>
      <p class="setting-description">
        此操作将清除所有本地存储的应用数据，包括设置、角色卡以及所有世界书这是一个高危操作，请谨慎使用
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useLocalData } from '@/composables/dataManagement/useLocalData';

const mockUpdateStorageInfo = async () => {};
const { clearAllData } = useLocalData(mockUpdateStorageInfo);
</script>