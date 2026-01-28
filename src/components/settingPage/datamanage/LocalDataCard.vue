<template>
  <div class="setting-card">
    <div class="setting-content">
      <div class="setting-header">
        <div class="setting-info">
          <span class="setting-label">本地数据迁移</span>
          <Icon icon="material-symbols:folder-open-outline" width="20" height="20"
            style="margin-left: 8px; color: var(--el-color-primary);" />
        </div>
        <div>
          <el-button @click="exportData" type="primary" plain>
            <Icon icon="material-symbols:upload" width="20" height="20" style="margin-right: 8px;" />
            导出到文件
          </el-button>
          <el-button @click="importData" type="success" plain>
            <Icon icon="material-symbols:download" width="20" height="20" style="margin-right: 8px;" />
            从文件导入
          </el-button>
        </div>
      </div>
      <p class="setting-description">
        将所有应用内数据导出到一个 JSON 文件进行备份，或从备份文件导入以恢复状态
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useLocalData } from '@/composables/dataManagement/useLocalData';

const mockUpdateStorageInfo = async () => {};

const { exportData, importData } = useLocalData(mockUpdateStorageInfo);
</script>
