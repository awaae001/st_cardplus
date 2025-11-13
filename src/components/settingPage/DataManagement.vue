<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { worldBookService, type WorldBookStats } from '@/database/worldBookService';
import { characterCardService, type CharacterCardStats } from '@/database/characterCardService';
import { ref, computed, onMounted, watch } from 'vue';
import { uploadToWebDAV, downloadFromWebDAV, testWebDAVConnection } from '@/utils/webdav';
import { resetAppDatabase, exportAllDatabases, importAllDatabases } from '@/database/utils';
import {
  testGistConnection,
  uploadToGist,
  downloadFromGist,
  createBackupGist,
  listUserGists,
  loadGistConfig,
  saveGistConfig
} from '@/utils/gist';
import type { GistConfig, BackupData } from '@/types/gist';

interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

const webdavConfig = ref<WebDAVConfig>({
  url: '',
  username: '',
  password: '',
});
const webdavBackupFileName = 'st-cardplus-webdav-backup.json';
const snapshotAvailable = ref(false);

// GitHub Gist 配置
const gistConfig = ref<GistConfig>({
  token: '',
  gistId: '',
  lastSyncTime: undefined,
  autoSync: false,
});
const gistSnapshotAvailable = ref(false);

// 同步提供商选择
type SyncProvider = 'webdav' | 'gist';
const selectedProvider = ref<SyncProvider>('webdav');
const providerOptions = [
  { label: 'WebDAV', value: 'webdav', icon: 'material-symbols:cloud' },
  { label: 'GitHub Gist', value: 'gist', icon: 'mdi:github' }
];

// 计算属性: 是否可以推送
const canPush = computed(() => {
  if (selectedProvider.value === 'webdav') {
    return !!webdavConfig.value.url;
  } else {
    return !!gistConfig.value.token;
  }
});

// 计算属性: 是否可以拉取
const canPull = computed(() => {
  if (selectedProvider.value === 'webdav') {
    return !!webdavConfig.value.url;
  } else {
    return !!gistConfig.value.token && !!gistConfig.value.gistId;
  }
});

const indexedDBUsage = ref({
  percentage: 0,
  text: '加载中...'
});

const localStorageUsage = ref({
  percentage: 0,
  text: '加载中...'
});

const worldBookStats = ref<WorldBookStats | null>(null);
const characterCardStats = ref<CharacterCardStats | null>(null);

// 格式化字节大小
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


// 获取存储信息
const getStorageEstimate = async () => {
  const storageEstimatePromise = ('storage' in navigator && 'estimate' in navigator.storage)
    ? navigator.storage.estimate()
    : Promise.resolve<StorageEstimate | null>(null);

  const [worldStats, cardStats, estimate] = await Promise.all([
    worldBookService.getStats(),
    characterCardService.getStats(),
    storageEstimatePromise,
  ]);

  worldBookStats.value = worldStats;
  characterCardStats.value = cardStats;

  const totalApproxBytes = worldStats.approxBytes + cardStats.approxBytes;
  const quota = estimate?.quota ?? null;
  const reportedUsage = estimate?.usage ?? null;

  let percentage = 0;
  let displayText: string;

  if (quota && quota > 0) {
    const oneGB = 1024 * 1024 * 1024;
    // 如果配额大于 1GB，按 1GB 计算百分比和显示
    const effectiveQuota = quota > oneGB ? oneGB : quota;
    percentage = totalApproxBytes > 0 ? (totalApproxBytes / effectiveQuota) * 100 : 0;

    if (quota > oneGB) {
      displayText = `${formatBytes(totalApproxBytes)} / 1 GB+`;
    } else {
      displayText = `${formatBytes(totalApproxBytes)} / ${formatBytes(quota)}`;
    }
  } else if (reportedUsage && reportedUsage > 0) {
    displayText = `${formatBytes(totalApproxBytes)} · 浏览器总占用 ${formatBytes(reportedUsage)}`;
  } else {
    displayText = `约 ${formatBytes(totalApproxBytes)}`;
  }

  indexedDBUsage.value = {
    percentage: parseFloat(Math.min(percentage, 100).toFixed(2)),
    text: displayText,
  };
};

// 计算 LocalStorage 的大小
const getLocalStorageUsage = () => {
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        // JavaScript 字符串是 UTF-16 编码，每个字符大约 2 字节
        totalBytes += value.length * 2;
      }
    }
  }

  // localStorage 的总配额，默认显示为 5MB
  const quota = 5 * 1024 * 1024;
  const percentage = (totalBytes / quota) * 100;
  
  localStorageUsage.value = {
    percentage: parseFloat(percentage.toFixed(2)),
    text: `${formatBytes(totalBytes)} / 5 MB`
  };
};

// 根据使用率返回颜色状态
const getProgressStatus = (percentage: number): 'success' | 'warning' | 'exception' => {
  if (percentage >= 80) return 'exception';
  if (percentage >= 60) return 'warning';
  return 'success';
};

// 统一的存储信息更新函数
const updateStorageInfo = async () => {
  await getStorageEstimate();
  getLocalStorageUsage();
};

onMounted(() => {
  updateStorageInfo();
  const savedWebDAVConfig = localStorage.getItem('webdavConfig');
  if (savedWebDAVConfig) {
    webdavConfig.value = JSON.parse(savedWebDAVConfig);
  }

  const snapshot = sessionStorage.getItem('webdav-snapshot');
  if (snapshot) {
    snapshotAvailable.value = true;
  }

  // 加载 Gist 配置
  const savedGistConfig = loadGistConfig();
  if (savedGistConfig) {
    gistConfig.value = savedGistConfig;
  }

  // 检查 Gist 快照
  const gistSnapshot = sessionStorage.getItem('gist-snapshot');
  if (gistSnapshot) {
    gistSnapshotAvailable.value = true;
  }
});

watch(webdavConfig, (newConfig) => {
  localStorage.setItem('webdavConfig', JSON.stringify(newConfig));
}, { deep: true });

watch(gistConfig, (newConfig) => {
  saveGistConfig(newConfig);
}, { deep: true });

const exportData = async () => {
  try {
    const data: { [key: string]: any } = {};

    // 1. 导出所有 localStorage 数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }

    // 2. 导出所有 IndexedDB 数据库
    try {
      const dbData = await exportAllDatabases();
      Object.assign(data, dbData);
    } catch (error) {
      ElMessage.error(`${error instanceof Error ? error.message : '导出数据库失败'}，请检查控制台获取详细信息`);
      // 导出失败时不继续，避免生成不完整的备份
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `st-cardplus-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    ElMessage({
      type: 'success',
      message: '数据已成功导出',
    });
  } catch (error) {
    console.error('导出数据失败:', error);
    ElMessage({
      type: 'error',
      message: '导出数据失败',
    });
  }
};

const importData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);

        ElMessageBox.confirm(
          '这将用导入文件中的数据覆盖所有现有本地数据（包括世界书），此操作无法撤销您确定要继续吗？',
          '警告',
          {
            confirmButtonText: '确认导入',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).then(async () => {
          try {
            // 1. 导入所有 IndexedDB 数据库
            await importAllDatabases(data);

            // 2. 导入 localStorage 数据
            localStorage.clear();
            for (const key in data) {
              if (Object.prototype.hasOwnProperty.call(data, key)) {
                localStorage.setItem(key, data[key]);
              }
            }

            ElMessage({
              type: 'success',
              message: '数据已成功导入，应用将重新加载以应用更改',
            });
            // 立即更新存储显示信息
            await updateStorageInfo();
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } catch (importError) {
            console.error('导入处理失败:', importError);
            ElMessage.error('导入过程中发生错误，操作已终止');
          }
        }).catch(() => {
            ElMessage({
              type: 'info',
              message: '导入操作已取消',
            });
          });
      } catch (error) {
        console.error('导入数据失败:', error);
        ElMessage({
          type: 'error',
          message: '导入数据失败，文件格式可能不正确 ',
        });
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

const clearAllData = () => {
  ElMessageBox.confirm(
    '您确定要清除所有本地数据吗？此操作将删除所有角色卡、设置以及世界书，且无法撤销',
    '高危操作警告',
    {
      confirmButtonText: '确认清除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await resetAppDatabase();
      localStorage.clear();
      sessionStorage.removeItem('webdav-snapshot');
      webdavConfig.value = { url: '', username: '', password: '' };
      snapshotAvailable.value = false;

      ElMessage({
        type: 'success',
        message: '所有本地数据已清除并重建数据库，应用将重新加载',
      });
      // 立即更新存储显示信息
      await updateStorageInfo();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('清除所有数据失败:', error);
      ElMessage.error('清除数据时发生错误');
    }
  }).catch(() => {
      ElMessage({
        type: 'info',
        message: '操作已取消',
      });
    });
};

const clearInvalidLocalStorage = async () => {
  const whitelist = [
    'characterCardData',
    'characterManagerData',
    'ejs-editor-projects',
    'settings',
    'vueuse-color-scheme',
    'webdavConfig',
    'world-editor-data',
  ];

  ElMessageBox.confirm(
    '您确定要清理无效的本地缓存吗？此操作将删除所有不在白名单中的本地存储条目，以及所有角色卡数据库中的数据（世界书数据将被保留）',
    '清理确认',
    {
      confirmButtonText: '确认清理',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        // 1. 清理 localStorage 中的无效缓存
        let removedCount = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !whitelist.includes(key)) {
            localStorage.removeItem(key);
            removedCount++;
            // 因为移除了一个元素，所以需要将索引减一，以便下一次循环能正确获取到新的元素
            i--;
          }
        }

        // 2. 清除角色卡数据库
        await characterCardService.clearDatabase();

        ElMessage({
          type: 'success',
          message: `已成功清理 ${removedCount} 个无效缓存条目和角色卡数据库，应用将重新加载`,
        });

        // 立即更新存储显示信息
        await updateStorageInfo();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('清理缓存失败:', error);
        ElMessage.error('清理缓存时发生错误');
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '操作已取消',
      });
    });
};

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
    const backupData = await prepareBackupData();
    const json = JSON.stringify(backupData, null, 2);
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
    const backupData = JSON.parse(json) as BackupData;

    ElMessageBox.confirm(
      `这将用服务器上的备份覆盖所有现有本地数据<br/>
      <strong>备份时间:</strong> ${new Date(backupData.timestamp).toLocaleString('zh-CN')}<br/>
      此操作可能会丢失你没有保存的更改 您确定要继续吗？`,
      '警告',
      {
        confirmButtonText: '确认覆盖',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
      .then(async () => {
        try {
          // 1. 创建快照 (包含 localStorage 和 IndexedDB)
          const snapshotData: { [key: string]: any } = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              snapshotData[key] = localStorage.getItem(key);
            }
          }
          const dbSnapshot = await exportAllDatabases();
          Object.assign(snapshotData, dbSnapshot);
          sessionStorage.setItem('webdav-snapshot', JSON.stringify(snapshotData));

          // 2. 将结构化备份转为扁平格式并恢复 IndexedDB
          const flatData = {
            ...backupData.localStorage,
            ...backupData.databases,
          };
          await importAllDatabases(flatData);

          // 3. 恢复 localStorage 数据 (保留 WebDAV 配置)
          const preservedWebDAVConfig = localStorage.getItem('webdavConfig');
          localStorage.clear();
          if (preservedWebDAVConfig) {
            localStorage.setItem('webdavConfig', preservedWebDAVConfig);
          }
          for (const key in backupData.localStorage) {
            if (Object.prototype.hasOwnProperty.call(backupData.localStorage, key)) {
              localStorage.setItem(key, backupData.localStorage[key]);
            }
          }

          ElMessage.success('数据已成功从服务器恢复，应用将重新加载');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (restoreError) {
          console.error('从 WebDAV 恢复数据失败:', restoreError);
          ElMessage.error('恢复数据时发生错误，操作已终止');
        }
      })
      .catch(() => {
        ElMessage.info('操作已取消');
      });
  } catch (error) {
    console.error('从 WebDAV 拉取失败:', error);
    ElMessage.error(`拉取失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

const revertPull = async () => {
  const snapshot = sessionStorage.getItem('webdav-snapshot');
  if (snapshot) {
    try {
      const data = JSON.parse(snapshot);

      // 1. 恢复所有 IndexedDB 数据库
      await importAllDatabases(data);

      // 2. 恢复 localStorage
      localStorage.clear();
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          localStorage.setItem(key, data[key]);
        }
      }

      // 3. 清除快照并重新加载
      sessionStorage.removeItem('webdav-snapshot');
      ElMessage.success('操作已撤销，应用将重新加载');
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('恢复快照失败:', error);
      ElMessage.error('恢复快照失败，请检查控制台 ');
    }
  } else {
    ElMessage.error('没有可用的快照 请检查是否已执行拉取操作 ');
  }
  snapshotAvailable.value = false;
};

// ===== GitHub Gist 同步相关方法 =====

// 格式化同步时间
const formatSyncTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return date.toLocaleString('zh-CN');
};

// 打开 GitHub Token 帮助页面
const openGistTokenHelp = () => {
  window.open('https://github.com/settings/tokens/new?scopes=gist&description=ST-CardPlus-Sync', '_blank');
};

// 测试 Gist 连接
const testGist = async () => {
  if (!gistConfig.value.token) {
    ElMessage.error('请输入 GitHub Personal Access Token');
    return;
  }

  try {
    ElMessage.info('正在测试连接...');
    const result = await testGistConnection(gistConfig.value.token);

    if (result.success) {
      ElMessage.success(result.message);
    } else {
      ElMessage.error(result.message);
    }
  } catch (error) {
    console.error('测试 Gist 连接失败:', error);
    ElMessage.error(`连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 列出用户的所有 Gists
const listGists = async () => {
  if (!gistConfig.value.token) {
    ElMessage.error('请输入 GitHub Personal Access Token');
    return;
  }

  try {
    ElMessage.info('正在获取 Gist 列表...');
    const result = await listUserGists(gistConfig.value.token);

    if (result.success && result.data) {
      const gists = result.data;
      if (gists.length === 0) {
        ElMessage.info('未找到备份 Gist，请先推送数据或创建新 Gist');
        return;
      }

      // 显示选择对话框
      ElMessageBox.alert(
        gists.map((g: any) =>
          `<div style="margin-bottom: 10px; padding: 8px; background: var(--el-fill-color-light); border-radius: 4px;">
            <strong>ID:</strong> ${g.id}<br/>
            <strong>描述:</strong> ${g.description}<br/>
            <strong>更新:</strong> ${new Date(g.updated_at).toLocaleString('zh-CN')}
          </div>`
        ).join(''),
        '您的备份 Gists',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '关闭',
        }
      );
    } else {
      ElMessage.error(result.message);
    }
  } catch (error) {
    console.error('获取 Gist 列表失败:', error);
    ElMessage.error(`获取失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 准备备份数据 (统一的结构化格式)
const prepareBackupData = async (): Promise<BackupData> => {
  const localStorageData: { [key: string]: any } = {};

  // 1. 备份 localStorage (排除敏感配置)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key !== 'gistConfig' && key !== 'webdavConfig') {
      localStorageData[key] = localStorage.getItem(key);
    }
  }

  // 2. 备份所有 IndexedDB 数据库
  const dbData = await exportAllDatabases();

  return {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    localStorage: localStorageData,
    databases: dbData as any,
  };
};

// 推送到 Gist
const pushToGist = async () => {
  if (!gistConfig.value.token) {
    ElMessage.error('请输入 GitHub Personal Access Token');
    return;
  }

  try {
    ElMessage.info('正在准备数据并上传...');
    const backupData = await prepareBackupData();

    const backupSize = JSON.stringify(backupData).length;
    const backupSizeMB = (backupSize / (1024 * 1024)).toFixed(2);

    console.log('[Gist Push] 准备的备份数据:', {
      timestamp: backupData.timestamp,
      version: backupData.version,
      localStorageKeys: Object.keys(backupData.localStorage).length,
      databaseKeys: Object.keys(backupData.databases),
      totalSize: backupSize,
      sizeMB: backupSizeMB
    });

    // 检查文件大小限制
    if (backupSize > 100 * 1024 * 1024) {
      ElMessage.warning(`备份文件过大 (${backupSizeMB}MB), 超过 Gist 单文件 100MB 限制，推送可能失败`);
      return;
    } else if (backupSize > 50 * 1024 * 1024) {
      ElMessage.warning(`备份文件较大 (${backupSizeMB}MB), 建议清理无用数据`);
    }

    let result;
    if (gistConfig.value.gistId) {
      // 更新现有 Gist
      console.log('[Gist Push] 更新现有 Gist:', gistConfig.value.gistId);
      result = await uploadToGist(gistConfig.value.token, gistConfig.value.gistId, backupData);
    } else {
      // 创建新 Gist
      console.log('[Gist Push] 创建新 Gist');
      result = await createBackupGist(gistConfig.value.token, backupData);
      if (result.success && result.data?.gistId) {
        console.log('[Gist Push] 新 Gist ID:', result.data.gistId);
        gistConfig.value.gistId = result.data.gistId;
      }
    }

    console.log('[Gist Push] 推送结果:', result);

    if (result.success) {
      gistConfig.value.lastSyncTime = new Date().toISOString();
      ElMessage.success(`${result.message} (大小: ${backupSizeMB}MB)`);
    } else {
      ElMessage.error(result.message);
    }
  } catch (error) {
    console.error('[Gist Push] 推送失败:', error);
    ElMessage.error(`推送失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 从 Gist 拉取
const pullFromGist = async () => {
  if (!gistConfig.value.token || !gistConfig.value.gistId) {
    ElMessage.error('请输入 Token 和 Gist ID');
    return;
  }

  try {
    ElMessage.info('正在从 Gist 拉取数据...');
    const result = await downloadFromGist(gistConfig.value.token, gistConfig.value.gistId);

    console.log('[Gist Pull] 下载结果:', result);

    if (!result.success || !result.data) {
      console.error('[Gist Pull] 下载失败:', result.message);
      ElMessage.error(result.message);
      return;
    }

    const backupData = result.data as BackupData;
    console.log('[Gist Pull] 备份数据结构:', {
      hasTimestamp: !!backupData.timestamp,
      hasVersion: !!backupData.version,
      hasLocalStorage: !!backupData.localStorage,
      hasDatabases: !!backupData.databases,
      localStorageKeys: backupData.localStorage ? Object.keys(backupData.localStorage).length : 0,
      databaseKeys: backupData.databases ? Object.keys(backupData.databases) : []
    });

    ElMessageBox.confirm(
      `这将用 Gist 上的备份覆盖所有现有本地数据<br/>
      <strong>备份时间:</strong> ${new Date(backupData.timestamp).toLocaleString('zh-CN')}<br/>
      此操作可能会丢失你没有保存的更改 您确定要继续吗？`,
      '警告',
      {
        confirmButtonText: '确认覆盖',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
      .then(async () => {
        try {
          // 1. 创建快照
          const snapshotData: { [key: string]: any } = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              snapshotData[key] = localStorage.getItem(key);
            }
          }
          const dbSnapshot = await exportAllDatabases();
          Object.assign(snapshotData, dbSnapshot);
          sessionStorage.setItem('gist-snapshot', JSON.stringify(snapshotData));

          // 2. 将结构化备份数据转换为扁平格式 (兼容 importAllDatabases)
          const flatData: { [key: string]: any } = {
            ...backupData.localStorage,
            ...backupData.databases,
          };

          // 3. 恢复 IndexedDB 数据
          await importAllDatabases(flatData);

          // 4. 恢复 localStorage (保留 Gist 配置)
          const preservedGistConfig = localStorage.getItem('gistConfig');
          localStorage.clear();
          if (preservedGistConfig) {
            localStorage.setItem('gistConfig', preservedGistConfig);
          }

          for (const key in backupData.localStorage) {
            if (Object.prototype.hasOwnProperty.call(backupData.localStorage, key)) {
              localStorage.setItem(key, backupData.localStorage[key]);
            }
          }

          // 更新同步时间
          gistConfig.value.lastSyncTime = new Date().toISOString();
          saveGistConfig(gistConfig.value);

          ElMessage.success('数据已成功从 Gist 恢复，应用将重新加载');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (restoreError) {
          console.error('从 Gist 恢复数据失败:', restoreError);
          ElMessage.error('恢复数据时发生错误，操作已终止');
        }
      })
      .catch(() => {
        ElMessage.info('操作已取消');
      });
  } catch (error) {
    console.error('从 Gist 拉取失败:', error);
    ElMessage.error(`拉取失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 撤销 Gist 拉取
const revertGistPull = async () => {
  const snapshot = sessionStorage.getItem('gist-snapshot');
  if (snapshot) {
    try {
      const data = JSON.parse(snapshot);

      // 1. 恢复所有 IndexedDB 数据库
      await importAllDatabases(data);

      // 2. 恢复 localStorage
      localStorage.clear();
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          localStorage.setItem(key, data[key]);
        }
      }

      // 3. 清除快照并重新加载
      sessionStorage.removeItem('gist-snapshot');
      ElMessage.success('操作已撤销，应用将重新加载');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('恢复 Gist 快照失败:', error);
      ElMessage.error('恢复快照失败，请检查控制台');
    }
  } else {
    ElMessage.error('没有可用的快照 请检查是否已执行拉取操作');
  }
  gistSnapshotAvailable.value = false;
};

// ===== 统一的同步处理函数 =====

// 统一测试连接
const handleTestConnection = async () => {
  if (selectedProvider.value === 'webdav') {
    await testWebDAV();
  } else {
    await testGist();
  }
};

// 统一推送
const handlePush = async () => {
  if (selectedProvider.value === 'webdav') {
    await pushToWebDAV();
  } else {
    await pushToGist();
  }
};

// 统一拉取
const handlePull = async () => {
  if (selectedProvider.value === 'webdav') {
    await pullFromWebDAV();
  } else {
    await pullFromGist();
  }
};

// 统一撤销
const revertCurrentPull = async () => {
  if (snapshotAvailable.value) {
    await revertPull();
  } else if (gistSnapshotAvailable.value) {
    await revertGistPull();
  }
};
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
.setting-card {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s ease;
  margin-bottom: 16px;
}

.setting-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.setting-content {
  display: flex;
  flex-direction: column;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.setting-info {
  display: flex;
  align-items: center;
}

.setting-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.setting-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  margin: 0;
  text-align: left;
}
.webdav-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.webdav-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
.snapshot-revert-container {
  padding: 8px 12px;
  background-color: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-5);
  border-radius: 4px;
  margin-bottom: 15px;
  color: var(--el-color-success-dark-2);
}

.gist-sync-time {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: left;
  padding: 8px 0;
}

/* 同步提供商选择器 */
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

/* 同步配置容器 */
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

/* 同步时间显示 */
.sync-time-display {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  padding: 8px 0;
}

/* 统一操作按钮 */
.sync-action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
