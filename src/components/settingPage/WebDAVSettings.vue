<template>
  <div class="setting-group">
    <el-collapse v-model="activeCollapseNames">
      <el-collapse-item name="webdav">
        <template #title>
          <div class="setting-item-title">
            <span class="setting-label">WebDAV 同步</span>
            <Icon icon="material-symbols:cloud-sync-outline" width="20" height="20"
              style="margin-left: 8px; color: var(--el-color-warning);" />
          </div>
        </template>
        <p class="setting-description" style="margin-top: -10px; margin-bottom: 15px;">
          将数据备份到你的 WebDAV 服务器。这将会上传一个包含所有设置、角色卡和项目的单一备份文件。
        </p>
        <div class="webdav-settings">
          <el-input v-model="webdavConfig.url" placeholder="WebDAV URL" />
          <el-input v-model="webdavConfig.username" placeholder="用户名" />
          <el-input v-model="webdavConfig.password" placeholder="密码" type="password" show-password />
          <div class="webdav-buttons">
            <el-button @click="testWebDAV">
              <Icon icon="material-symbols:add-link-rounded" style="margin-right: 8px;" />
              测试链接
            </el-button>
            <el-button @click="pushToWebDAV" type="primary">
              <Icon icon="material-symbols:cloud-upload" style="margin-right: 8px;" />
              推送
            </el-button>
            <el-button @click="pullFromWebDAV" type="success">
              <Icon icon="material-symbols:cloud-download-outline" style="margin-right: 8px;" />
              拉取
            </el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { uploadToWebDAV, downloadFromWebDAV, testWebDAVConnection } from '@/utils/webdav';

interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

const activeCollapseNames = ref<string[]>([]);
const webdavConfig = ref<WebDAVConfig>({
  url: '',
  username: '',
  password: '',
});
const webdavBackupFileName = 'st-cardplus-webdav-backup.json';

onMounted(() => {
  const savedWebDAVConfig = localStorage.getItem('webdavConfig');
  if (savedWebDAVConfig) {
    webdavConfig.value = JSON.parse(savedWebDAVConfig);
  }
});

watch(webdavConfig, (newConfig) => {
  localStorage.setItem('webdavConfig', JSON.stringify(newConfig));
}, { deep: true });

const testWebDAV = async () => {
  if (!webdavConfig.value.url) {
    ElMessage.error('请输入 WebDAV URL');
    return;
  }
  try {
    ElMessage.info('正在测试连接...');
    await testWebDAVConnection(webdavConfig.value);
    ElMessage.success('连接成功！');
  } catch (error) {
    console.error('WebDAV 连接测试失败:', error);
    ElMessage.error(`连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

const pushToWebDAV = async () => {
  if (!webdavConfig.value.url) {
    ElMessage.error('请输入 WebDAV URL');
    return;
  }
  try {
    ElMessage.info('正在准备数据并上传...');
    const data: { [key: string]: any } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (key === 'webdavConfig') continue;
        data[key] = localStorage.getItem(key);
      }
    }

    const json = JSON.stringify(data, null, 2);
    await uploadToWebDAV(webdavConfig.value, webdavBackupFileName, json);

    ElMessage.success('数据已成功推送到 WebDAV 服务器');
  } catch (error) {
    console.error('推送到 WebDAV 失败:', error);
    ElMessage.error(`推送失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

const pullFromWebDAV = async () => {
  if (!webdavConfig.value.url) {
    ElMessage.error('请输入 WebDAV URL');
    return;
  }
  try {
    ElMessage.info('正在从服务器拉取数据...');
    const json = await downloadFromWebDAV(webdavConfig.value, webdavBackupFileName);
    const data = JSON.parse(json);

    ElMessageBox.confirm(
      '这将用服务器上的备份覆盖所有现有本地数据。此操作无法撤销。您确定要继续吗？',
      '警告',
      {
        confirmButtonText: '确认覆盖',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(() => {
        const preservedWebDAVConfig = localStorage.getItem('webdavConfig');
        localStorage.clear();
        if (preservedWebDAVConfig) {
          localStorage.setItem('webdavConfig', preservedWebDAVConfig);
        }

        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            localStorage.setItem(key, data[key]);
          }
        }
        ElMessage.success('数据已成功从服务器恢复。应用将重新加载以应用更改。');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch(() => {
        ElMessage.info('操作已取消');
      });
  } catch (error) {
    console.error('从 WebDAV 拉取失败:', error);
    ElMessage.error(`拉取失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};
</script>

<style scoped>
.setting-group {
  margin-bottom: 16px;
}

.setting-group :deep(.el-collapse-item__header) {
  padding: 10px 20px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  height: auto;
  line-height: normal;
}

.setting-group :deep(.el-collapse-item__header:hover) {
  border-color: var(--el-color-primary-light-5);
  background-color: var(--el-color-primary-light-9);
}

.setting-group :deep(.el-collapse-item__wrap) {
  background-color: transparent;
  border-bottom: none;
  padding: 16px 20px 10px;
}

.setting-group :deep(.el-collapse-item__content) {
  padding-bottom: 0;
}

.setting-item-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.webdav-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.webdav-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.setting-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: left;
  line-height: 1.5;
  background-color: var(--el-fill-color-light);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid var(--el-color-info);
}
</style>