<template>
  <div class="setting-card">
    <div class="setting-content">
      <div class="setting-header">
        <div class="setting-info">
          <span class="setting-label">清理无效本地缓存</span>
          <Icon icon="mdi:broom" width="20" height="20"
            style="margin-left: 8px; color: var(--el-color-warning);" />
        </div>
        <div>
          <el-button @click="clearInvalidLocalStorage" type="warning" plain>
            <Icon icon="mdi:auto-fix" width="20" height="20" style="margin-right: 8px;" />
            立即清理
          </el-button>
        </div>
      </div>
      <p class="setting-description">
        此操作将移除所有未被识别的本地缓存条目，以释放空间并可能解决一些问题 此操作仅保留核心数据，请谨慎使用 
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useLocalData } from '@/composables/dataManagement/useLocalData';

const mockUpdateStorageInfo = async () => {};
const { clearInvalidLocalStorage } = useLocalData(mockUpdateStorageInfo);
</script>