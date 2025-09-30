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
            <span>核心数据库 (IndexedDB)</span>
            <el-progress :percentage="indexedDBUsage.percentage" :text-inside="true" :stroke-width="20" 
                         :status="getProgressStatus(indexedDBUsage.percentage)">
              <span>{{ indexedDBUsage.text }}</span>
            </el-progress>
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
          核心数据库用于存储世界书等大数据，容量大浏览器缓存用于存储角色卡、设置等轻量数据，容量较小<br/>
          存储大小由浏览器自动管理
        </p>
      </div>
    </div>
        <div class="setting-card">
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">WebDAV 同步</span>
            <Icon icon="material-symbols:cloud-sync-outline" width="20" height="20"
              style="margin-left: 8px; color: var(--el-color-primary);" />
          </div>
        </div>
        <div v-if="snapshotAvailable" class="snapshot-revert-container">
          <p>已从 WebDAV 获取新数据<br/>您可以在这里 <el-button type="primary" link @click="revertPull">撤销</el-button> 此操作，本次会话有效</p>
        </div>
        <div class="webdav-settings">
          <el-input v-model="webdavConfig.url" placeholder="WebDAV URL" />
          <el-input v-model="webdavConfig.username" placeholder="用户名" />
          <el-input v-model="webdavConfig.password" placeholder="密码" type="password" show-password />
          <div class="webdav-buttons">
            <el-button @click="testWebDAV">
              <Icon icon="material-symbols:add-link-rounded" style="margin-right: 8px;" />
              测试链接
            </el-button>
            <el-button @click="pushToWebDAV" type="primary" plain>
              <Icon icon="material-symbols:cloud-upload" style="margin-right: 8px;" />
              推送
            </el-button>
            <el-button @click="pullFromWebDAV" type="success" plain>
              <Icon icon="material-symbols:cloud-download-outline" style="margin-right: 8px;" />
              拉取
            </el-button>
          </div>
        </div>
        <p class="setting-description" style="margin-top: 12px;">
          将数据备份到你的 WebDAV 服务器 这将会上传一个包含所有设置、角色卡和项目的单一备份文件<br/>
          请注意前端该死的跨域问题，尽量使用自建服务
        </p>
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
import { worldBookService } from '@/database/worldBookService';
import { characterCardService } from '@/database/characterCardService';
import { ref, onMounted, watch } from 'vue';
import { uploadToWebDAV, downloadFromWebDAV, testWebDAVConnection } from '@/utils/webdav';

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

const indexedDBUsage = ref({
  percentage: 0,
  text: '加载中...'
});

const localStorageUsage = ref({
  percentage: 0,
  text: '加载中...'
});

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
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    if (estimate.usage !== undefined && estimate.quota !== undefined) {
      const quotaGB = estimate.quota / (1024 * 1024 * 1024); // 转换为GB
      
      let percentage: number;
      let displayText: string;
      
      if (quotaGB > 10) {
        // 大于10GB时，按10GB计算进度条
        const tenGB = 10 * 1024 * 1024 * 1024;
        percentage = estimate.usage > 0 ? (estimate.usage / tenGB) * 100 : 0;
        displayText = `${formatBytes(estimate.usage)} / 大于10GB`;
      } else {
        // 小于等于10GB时，正常显示
        percentage = estimate.quota > 0 ? (estimate.usage / estimate.quota) * 100 : 0;
        displayText = `${formatBytes(estimate.usage)} / ${formatBytes(estimate.quota)}`;
      }
      
      indexedDBUsage.value = {
        percentage: parseFloat(percentage.toFixed(2)),
        text: displayText
      };
    } else {
       indexedDBUsage.value.text = '无法获取使用情况';
    }
  } else {
    indexedDBUsage.value.text = '浏览器不支持 Storage API';
  }
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
});

watch(webdavConfig, (newConfig) => {
  localStorage.setItem('webdavConfig', JSON.stringify(newConfig));
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

    // 2. 导出世界书 IndexedDB 数据
    try {
      const worldBookExport = await worldBookService.exportDatabase();
      // 使用 JSON.stringify 将对象转换为字符串存入
      data['ST_CARDPLUS_WORLDBOOK_V1'] = JSON.stringify(worldBookExport);
    } catch (dbError) {
      console.error('导出世界书数据失败:', dbError);
      ElMessage.error('导出世界书数据失败，请检查控制台获取详细信息');
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
            // 1. 导入世界书数据 (如果存在)
            if (data['ST_CARDPLUS_WORLDBOOK_V1']) {
              const worldBookData = JSON.parse(data['ST_CARDPLUS_WORLDBOOK_V1']);
              await worldBookService.importDatabase(worldBookData);
              // 从数据对象中移除，以防被错误地写入 localStorage
              delete data['ST_CARDPLUS_WORLDBOOK_V1'];
            }

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
      // 1. 清除世界书数据库
      await worldBookService.clearDatabase();
      // 2. 清除角色卡数据库
      await characterCardService.clearDatabase();
      // 3. 清除 localStorage
      localStorage.clear();

      ElMessage({
        type: 'success',
        message: '所有本地数据已清除，应用将重新加载',
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
    const data: { [key: string]: any } = {};
    // 1. 备份 localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        if (key === 'webdavConfig') continue;
        data[key] = localStorage.getItem(key);
      }
    }

    // 2. 备份世界书 IndexedDB
    try {
      const worldBookExport = await worldBookService.exportDatabase();
      data['ST_CARDPLUS_WORLDBOOK_V1'] = JSON.stringify(worldBookExport);
    } catch (dbError) {
      console.error('备份世界书数据到 WebDAV 失败:', dbError);
      ElMessage.error('备份世界书数据失败，推送中止');
      return;
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
      '这将用服务器上的备份覆盖所有现有本地数据 此操作可能会丢失你没有保存的想法 您确定要继续吗？',
      '警告',
      {
        confirmButtonText: '确认覆盖',
        cancelButtonText: '取消',
        type: 'warning',
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
          const worldBookSnapshot = await worldBookService.exportDatabase();
          snapshotData['ST_CARDPLUS_WORLDBOOK_V1'] = JSON.stringify(worldBookSnapshot);
          sessionStorage.setItem('webdav-snapshot', JSON.stringify(snapshotData));

          // 2. 恢复世界书数据
          if (data['ST_CARDPLUS_WORLDBOOK_V1']) {
            const worldBookData = JSON.parse(data['ST_CARDPLUS_WORLDBOOK_V1']);
            await worldBookService.importDatabase(worldBookData);
            delete data['ST_CARDPLUS_WORLDBOOK_V1'];
          }

          // 3. 恢复 localStorage 数据
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

      // 1. 恢复世界书 IndexedDB
      if (data['ST_CARDPLUS_WORLDBOOK_V1']) {
        const worldBookData = JSON.parse(data['ST_CARDPLUS_WORLDBOOK_V1']);
        await worldBookService.importDatabase(worldBookData);
        delete data['ST_CARDPLUS_WORLDBOOK_V1'];
      }

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
</style>