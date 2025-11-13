<template>
  <div class="setting-card">
    <div class="setting-content">
      <div class="setting-header">
        <div class="setting-info">
          <span class="setting-label">云同步</span>
          <Icon icon="material-symbols:cloud-sync-outline" width="20" height="20"
            style="margin-left: 8px; color: var(--el-color-primary);" />
        </div>
      </div>

      <!-- 撤销提示 -->
      <div v-if="snapshotAvailable || gistSnapshotAvailable" class="snapshot-revert-container">
        <p>已从云端获取新数据<br/>您可以在这里 <el-button type="primary" link @click="revertCurrentPull">撤销</el-button> 此操作，本次会话有效</p>
      </div>

      <!-- 同步提供商选择 -->
      <div class="sync-provider-selector">
        <span class="provider-label">同步提供商</span>
        <el-segmented v-model="selectedProvider" :options="providerOptions" size="default" />
      </div>

      <!-- WebDAV 配置 -->
      <div v-show="selectedProvider === 'webdav'" class="sync-config-container">
        <el-input v-model="webdavConfig.url" placeholder="WebDAV URL" />
        <el-input v-model="webdavConfig.username" placeholder="用户名" />
        <el-input v-model="webdavConfig.password" placeholder="密码" type="password" show-password />
        <p class="provider-description">
          将数据备份到你的 WebDAV 服务器<br/>
          <span style="color: var(--el-color-warning);">请注意前端该死的跨域问题，尽量使用自建服务</span>
        </p>
      </div>

      <!-- GitHub Gist 配置 -->
      <div v-show="selectedProvider === 'gist'" class="sync-config-container">
        <el-input v-model="gistConfig.token" placeholder="GitHub Personal Access Token" type="password" show-password>
          <template #append>
            <el-button @click="openGistTokenHelp">
              <Icon icon="material-symbols:help-outline" />
            </el-button>
          </template>
        </el-input>
        <el-input v-model="gistConfig.gistId" placeholder="Gist ID (可选，留空将创建新 Gist)">
          <template #append>
            <el-button @click="listGists" :disabled="!gistConfig.token">
              <Icon icon="material-symbols:list" />
            </el-button>
          </template>
        </el-input>
        <div class="sync-time-display" v-if="gistConfig.lastSyncTime">
          <Icon icon="material-symbols:schedule" style="margin-right: 4px;" />
          <span>上次同步: {{ formatSyncTime(gistConfig.lastSyncTime) }}</span>
        </div>
        <p class="provider-description">
          将数据备份到 GitHub Gist (私密 Gist)<br/>
          需要创建 Personal Access Token 并赋予 <code>gist</code> 权限
          <a href="https://github.com/settings/tokens/new?scopes=gist&description=ST-CardPlus-Sync" target="_blank" style="color: var(--el-color-primary);">创建 Token</a>
          <br/>
          <span style="color: var(--el-color-info); font-size: 12px;">
            💡 单文件最大 100MB, Gist 总计最大 1GB · 首次推送自动创建 Gist, 后续更新同一个 Gist
          </span>
        </p>
      </div>

      <!-- 统一操作按钮 -->
      <div class="sync-action-buttons">
        <el-button @click="handleTestConnection">
          <Icon icon="material-symbols:add-link-rounded" style="margin-right: 8px;" />
          测试连接
        </el-button>
        <el-button @click="handlePush" type="primary" plain :disabled="!canPush">
          <Icon icon="material-symbols:cloud-upload" style="margin-right: 8px;" />
          推送
        </el-button>
        <el-button @click="handlePull" type="success" plain :disabled="!canPull">
          <Icon icon="material-symbols:cloud-download-outline" style="margin-right: 8px;" />
          拉取
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted } from 'vue';
import { useSync } from '@/composables/dataManagement/useSync';

const {
  webdavConfig,
  gistConfig,
  snapshotAvailable,
  gistSnapshotAvailable,
  selectedProvider,
  providerOptions,
  canPush,
  canPull,
  initSync,
  handleTestConnection,
  handlePush,
  handlePull,
  revertCurrentPull,
  formatSyncTime,
  openGistTokenHelp,
  listGists,
} = useSync();

onMounted(initSync);
</script>

<style scoped>
.snapshot-revert-container {
  padding: 8px 12px;
  background-color: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-5);
  border-radius: 4px;
  margin-bottom: 15px;
  color: var(--el-color-success-dark-2);
}

.sync-provider-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.provider-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 500;
  min-width: 80px;
}

.sync-config-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.provider-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  margin: 8px 0 0 0;
  text-align: left;
}

.sync-time-display {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  padding: 8px 0;
}

.sync-action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>