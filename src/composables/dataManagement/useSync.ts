import { ref, computed, watch, type Ref, type InjectionKey } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { uploadToWebDAVWithProgress, downloadFromWebDAVWithProgress, testWebDAVConnection } from '@/utils/webdav';
import {
  testGistConnection,
  uploadToGist,
  downloadFromGistWithProgress,
  createBackupGist,
  listUserGists,
  loadGistConfig,
  saveGistConfig,
} from '@/utils/gist';
import { SYNC_EXCLUDED_KEYS } from '@/config/dataSyncConfig';
import type { GistConfig, BackupData } from '@/types/gist';
import { exportAllDatabases, importAllDatabases } from '@/database/utils';
import { getSessionStorageItem, removeSessionStorageItem, readSessionStorageJSON } from '@/utils/localStorageUtils';

interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

interface TransferProgress {
  loaded: number;
  total?: number;
  lengthComputable?: boolean;
}

export function useSync() {
  // === State ===
  const webdavConfig = ref<WebDAVConfig>({ url: '', username: '', password: '' });
  const gistConfig = ref<GistConfig>({ token: '', gistId: '', lastSyncTime: undefined, autoSync: false });

  const snapshotAvailable = ref(false);
  const syncProgressActive = ref(false);
  const syncProgressText = ref('');
  const syncCurrentAction = ref<'push' | 'pull' | 'test' | null>(null);

  type SyncProvider = 'webdav' | 'gist';
  const selectedProvider = ref<SyncProvider>('webdav');
  const providerOptions = [
    { label: 'WebDAV', value: 'webdav', icon: 'material-symbols:cloud' },
    { label: 'GitHub Gist', value: 'gist', icon: 'mdi:github' },
  ];
  const webdavBackupFileName = 'st-cardplus-webdav-backup.json';
  const snapshotSessionKey = 'sync-snapshot';

  const canPush = computed(() => {
    if (selectedProvider.value === 'webdav') {
      return !!webdavConfig.value.url;
    } else {
      return !!gistConfig.value.token;
    }
  });

  const canPull = computed(() => {
    if (selectedProvider.value === 'webdav') {
      return !!webdavConfig.value.url;
    } else {
      return !!gistConfig.value.token && !!gistConfig.value.gistId;
    }
  });

  // === Watchers ===
  watch(
    webdavConfig,
    (newConfig) => {
      localStorage.setItem('webdavConfig', JSON.stringify(newConfig));
    },
    { deep: true }
  );

  watch(
    gistConfig,
    (newConfig) => {
      saveGistConfig(newConfig);
    },
    { deep: true }
  );

  // === Methods ===
  const collectLocalStorage = () => {
    const data: { [key: string]: any } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || SYNC_EXCLUDED_KEYS.includes(key)) continue;
      data[key] = localStorage.getItem(key);
    }
    return data;
  };

  const formatErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

  const startProgress = (action: 'push' | 'pull' | 'test', text: string) => {
    syncProgressActive.value = true;
    syncCurrentAction.value = action;
    syncProgressText.value = text;
  };

  const setProgress = (text?: string) => {
    if (text) syncProgressText.value = text;
  };

  const trySaveSnapshot = async (snapshotKey: string, snapshotAvailableRef: Ref<boolean>) => {
    const snapshotData = collectLocalStorage();
    const dbSnapshot = await exportAllDatabases();
    Object.assign(snapshotData, dbSnapshot);
    try {
      const snapshotJson = JSON.stringify(snapshotData);
      sessionStorage.setItem(snapshotKey, snapshotJson);
      snapshotAvailableRef.value = true;
      return true;
    } catch (snapshotError) {
      console.error('保存撤销快照失败:', snapshotError);
      removeSessionStorageItem(snapshotKey);
      snapshotAvailableRef.value = false;
      return false;
    }
  };

  const finishProgress = (text?: string) => {
    setProgress(text);
    setTimeout(() => {
      syncProgressActive.value = false;
      syncProgressText.value = '';
      syncCurrentAction.value = null;
    }, 2000);
  };

  const failProgress = (text?: string) => {
    if (text) syncProgressText.value = text;
    setTimeout(() => {
      syncProgressActive.value = false;
      syncProgressText.value = '';
      syncCurrentAction.value = null;
    }, 2000);
  };

  const prepareBackupData = async (): Promise<BackupData> => {
    const localStorageData = collectLocalStorage();
    setProgress('正在整理本地数据...');
    const dbData = await exportAllDatabases();
    setProgress('本地数据准备完成');
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      localStorage: localStorageData,
      databases: dbData as any,
    };
  };

  const genericPull = async (
    provider: SyncProvider,
    downloadFn: (onProgress?: (progress: TransferProgress) => void) => Promise<any>,
    snapshotKey: string,
    snapshotAvailableRef: Ref<boolean>,
    onSuccess?: () => void
  ) => {
    try {
      startProgress('pull', `正在从 ${provider} 拉取数据...`);
      setProgress('下载中... · -- KB/S : -- KB');
      ElMessage.info(`正在从 ${provider} 拉取数据...`);
      let lastLoaded = 0;
      let lastTime = Date.now();

      const formatSpeedValue = (bytesPerSecond: number | null) => {
        if (!bytesPerSecond || !Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return '--';
        return (bytesPerSecond / 1024).toFixed(1);
      };

      const formatTotalSizeKB = (total?: number, lengthComputable?: boolean) => {
        if (!lengthComputable || !total || !Number.isFinite(total) || total <= 0) return '-- KB';
        return `${(total / 1024).toFixed(1)} KB`;
      };

      const result = await downloadFn((progress) => {
        const now = Date.now();
        const deltaBytes = Math.max(0, progress.loaded - lastLoaded);
        const deltaMs = Math.max(1, now - lastTime);
        const speed = (deltaBytes * 1000) / deltaMs;
        lastLoaded = progress.loaded;
        lastTime = now;

        const speedText = `·  ${formatSpeedValue(speed)} KB/S : ${formatTotalSizeKB(progress.total, progress.lengthComputable)}`;
        setProgress(`正在从 ${provider} 下载... ${speedText}`);
      });
      setProgress('正在解析备份数据...');

      const backupData: BackupData | null =
        provider === 'webdav'
          ? (JSON.parse(result) as BackupData)
          : result.success
            ? (result.data as BackupData)
            : null;

      if (!backupData) {
        ElMessage.error(provider === 'gist' ? result.message : '拉取失败或数据为空');
        failProgress('拉取失败');
        return;
      }

      removeSessionStorageItem(snapshotSessionKey);
      snapshotAvailable.value = false;
      const snapshotSaved = await trySaveSnapshot(snapshotKey, snapshotAvailableRef);
      const snapshotWarning = !snapshotSaved
        ? '<br/><span style="color: var(--el-color-danger);">缓存区域超限，无法保存撤销快照，本次无法撤销。</span>'
        : '';

      await ElMessageBox.confirm(
        `这将用服务器上的备份覆盖所有现有本地数据<br/>
        <strong>备份时间:</strong> ${new Date(backupData.timestamp).toLocaleString('zh-CN')}<br/>
        此操作可能会丢失你没有保存的更改 您确定要继续吗？${snapshotWarning}`,
        '警告',
        {
          confirmButtonText: '确认覆盖',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true,
        }
      );

      try {
        setProgress('正在应用云端数据...');
        const flatData = { ...backupData.localStorage, ...backupData.databases };
        await importAllDatabases(flatData);
        const webdavConfigPreserved = localStorage.getItem('webdavConfig');
        const gistConfigPreserved = localStorage.getItem('gistConfig');

        localStorage.clear();

        for (const key in backupData.localStorage) {
          if (Object.prototype.hasOwnProperty.call(backupData.localStorage, key)) {
            localStorage.setItem(key, backupData.localStorage[key]);
          }
        }
        if (webdavConfigPreserved) localStorage.setItem('webdavConfig', webdavConfigPreserved);
        if (gistConfigPreserved) localStorage.setItem('gistConfig', gistConfigPreserved);

        onSuccess?.();

        ElMessage.success(`数据已成功从 ${provider} 恢复，应用将重新加载`);
        finishProgress('完成');
        setTimeout(() => window.location.reload(), 2000);
      } catch (restoreError) {
        console.error(`从 ${provider} 恢复数据失败:`, restoreError);
        ElMessage.error('恢复数据时发生错误，操作已终止');
        failProgress('恢复失败');
      }
    } catch (error) {
      if (error === 'cancel') {
        ElMessage.info('操作已取消');
        removeSessionStorageItem(snapshotKey);
        snapshotAvailableRef.value = false;
        failProgress('已取消');
      } else {
        console.error(`从 ${provider} 拉取失败:`, error);
        ElMessage.error(`拉取失败: ${formatErrorMessage(error, '未知错误')}`);
        failProgress('拉取失败');
      }
    }
  };

  const genericRevert = async (
    provider: SyncProvider,
    snapshotKey: string,
    snapshotAvailableRef: Ref<boolean>
  ): Promise<boolean> => {
    const snapshotData = readSessionStorageJSON<{ [key: string]: any }>(snapshotKey);
    if (!snapshotData) {
      ElMessage.error('没有可用的快照 请检查是否已执行拉取操作 ');
      removeSessionStorageItem(snapshotKey);
      snapshotAvailableRef.value = false;
      return false;
    }

    try {
      const snapshotSize = new Blob([JSON.stringify(snapshotData)]).size;
      if (snapshotSize > 4500 * 1024) {
        await ElMessageBox.confirm(
          '当前 APP 数据内容已超出 浏览器 缓冲区有效容量，恢复系统运作可能运作不如意',
          '警告',
          { confirmButtonText: '仍然继续', cancelButtonText: '取消', type: 'warning' }
        );
      }

      await importAllDatabases(snapshotData);
      localStorage.clear();
      for (const key in snapshotData) {
        if (Object.prototype.hasOwnProperty.call(snapshotData, key)) {
          localStorage.setItem(key, snapshotData[key]);
        }
      }
      removeSessionStorageItem(snapshotKey);
      snapshotAvailableRef.value = false;
      ElMessage.success('操作已撤销，应用将重新加载');
      setTimeout(() => window.location.reload(), 1500);
      return true;
    } catch (error) {
      if (error === 'cancel') {
        ElMessage.info('操作已取消');
        return false;
      } else {
        console.error(`恢复 ${provider} 快照失败:`, error);
        ElMessage.error('恢复快照失败，请检查控制台');
        return false;
      }
    }
  };

  // --- WebDAV ---
  const testWebDAV = async (): Promise<boolean> => {
    if (!webdavConfig.value.url) {
      ElMessage.error('请输入 WebDAV URL');
      return false;
    }
    try {
      ElMessage.info('正在测试连接...');
      await testWebDAVConnection(webdavConfig.value);
      ElMessage.success('连接成功！');
      return true;
    } catch (error) {
      console.error('WebDAV 连接测试失败:', error);
      ElMessage.error(`连接失败: ${formatErrorMessage(error, '未知错误')}`);
      return false;
    }
  };

  const pushToWebDAV = async () => {
    if (!webdavConfig.value.url) {
      ElMessage.error('请输入 WebDAV URL');
      return;
    }
    try {
      startProgress('push', '正在准备数据...');
      ElMessage.info('正在准备数据并上传...');
      const backupData = await prepareBackupData();
      const json = JSON.stringify(backupData, null, 2);
      setProgress('推送中...');
      await uploadToWebDAVWithProgress(webdavConfig.value, webdavBackupFileName, json);
      ElMessage.success('数据已成功推送到 WebDAV 服务器');
      finishProgress('完成');
    } catch (error) {
      console.error('推送到 WebDAV 失败:', error);
      ElMessage.error(`推送失败: ${formatErrorMessage(error, '未知错误')}`);
      failProgress('推送失败');
    }
  };

  const pullFromWebDAV = async () => {
    if (!webdavConfig.value.url) {
      ElMessage.error('请输入 WebDAV URL');
      return;
    }
    await genericPull(
      'webdav',
      (onProgress) => downloadFromWebDAVWithProgress(webdavConfig.value, webdavBackupFileName, onProgress),
      snapshotSessionKey,
      snapshotAvailable
    );
  };

  const revertPull = async () => {
    return await genericRevert('webdav', snapshotSessionKey, snapshotAvailable);
  };

  // --- Gist ---
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

  const openGistTokenHelp = () => {
    window.open('https://github.com/settings/tokens/new?scopes=gist&description=ST-CardPlus-Sync', '_blank');
  };

  const testGist = async (): Promise<boolean> => {
    if (!gistConfig.value.token) {
      ElMessage.error('请输入 GitHub Personal Access Token');
      return false;
    }
    try {
      ElMessage.info('正在测试连接...');
      const result = await testGistConnection(gistConfig.value.token);
      if (result.success) {
        ElMessage.success(result.message);
        return true;
      } else {
        ElMessage.error(result.message);
        return false;
      }
    } catch (error) {
      console.error('测试 Gist 连接失败:', error);
      ElMessage.error(`连接失败: ${formatErrorMessage(error, '未知错误')}`);
      return false;
    }
  };

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
          ElMessage.info('未找到任何 Gist，您可以先推送创建一个新的');
          return;
        }

        const gistOptions = gists
          .map(
            (g: any) =>
              `<div style="margin-bottom: 10px; padding: 8px; background: var(--el-fill-color-light); border-radius: 4px; cursor: pointer;" onclick="this.querySelector('input').checked = true">
                <label style="display: flex; align-items: center; width: 100%; cursor: pointer;">
                  <input type="radio" name="gistSelection" value="${g.id}" style="margin-right: 10px;" ${
                g.id === gistConfig.value.gistId ? 'checked' : ''
              }>
                  <div>
                    <strong>ID:</strong> ${g.id}<br/>
                    <strong>描述:</strong> ${g.description || '无描述'}<br/>
                    <strong>更新:</strong> ${new Date(g.updated_at).toLocaleString('zh-CN')}
                  </div>
                </label>
              </div>`
          )
          .join('');

        ElMessageBox.confirm(
          `<div class="gist-selection-container" style="max-height: 400px; overflow-y: auto;">${gistOptions}</div>`,
          '选择一个 Gist 用于同步',
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '选定',
            cancelButtonText: '取消',
            beforeClose: (action, _instance, done) => {
              if (action === 'confirm') {
                const selectedRadio = document.querySelector(
                  '.gist-selection-container input[name="gistSelection"]:checked'
                );
                if (selectedRadio) {
                  const selectedGistId = (selectedRadio as HTMLInputElement).value;
                  gistConfig.value.gistId = selectedGistId;
                  ElMessage.success(`已选择 Gist: ${selectedGistId}`);
                  done();
                } else {
                  ElMessage.warning('您没有选择任何 Gist');
                  // Do not close the dialog
                }
              } else {
                done();
              }
            },
          }
        ).catch(() => {
          ElMessage.info('已取消选择');
        });
      } else {
        ElMessage.error(result.message);
      }
    } catch (error) {
      console.error('获取 Gist 列表失败:', error);
      ElMessage.error(`获取失败: ${formatErrorMessage(error, '未知错误')}`);
    }
  };

  const pushToGist = async () => {
    if (!gistConfig.value.token) {
      ElMessage.error('请输入 GitHub Personal Access Token');
      return;
    }
    try {
      startProgress('push', '正在准备数据...');
      ElMessage.info('正在准备数据并上传...');
      const backupData = await prepareBackupData();
      const backupSize = JSON.stringify(backupData).length;
      const backupSizeMB = (backupSize / (1024 * 1024)).toFixed(2);

      if (backupSize > 100 * 1024 * 1024) {
        ElMessage.warning(`备份文件过大 (${backupSizeMB}MB), 超过 Gist 单文件 100MB 限制，推送可能失败`);
        failProgress('文件过大');
        return;
      } else if (backupSize > 50 * 1024 * 1024) {
        ElMessage.warning(`备份文件较大 (${backupSizeMB}MB), 建议清理无用数据`);
      }

      setProgress('推送中...');
      let result;
      if (gistConfig.value.gistId) {
        result = await uploadToGist(gistConfig.value.token, gistConfig.value.gistId, backupData);
      } else {
        result = await createBackupGist(gistConfig.value.token, backupData);
        if (result.success && result.data?.gistId) {
          gistConfig.value.gistId = result.data.gistId;
        }
      }

      if (result.success) {
        gistConfig.value.lastSyncTime = new Date().toISOString();
        ElMessage.success(`${result.message} (大小: ${backupSizeMB}MB)`);
        finishProgress('完成');
      } else {
        ElMessage.error(result.message);
        failProgress('推送失败');
      }
    } catch (error) {
      console.error('[Gist Push] 推送失败:', error);
      ElMessage.error(`推送失败: ${formatErrorMessage(error, '未知错误')}`);
      failProgress('推送失败');
    }
  };

  const pullFromGist = async () => {
    if (!gistConfig.value.token || !gistConfig.value.gistId) {
      ElMessage.error('请输入 Token 和 Gist ID');
      return;
    }
    await genericPull(
      'gist',
      (onProgress) => downloadFromGistWithProgress(gistConfig.value.token!, gistConfig.value.gistId!, onProgress),
      snapshotSessionKey,
      snapshotAvailable,
      () => {
        gistConfig.value.lastSyncTime = new Date().toISOString();
        saveGistConfig(gistConfig.value);
      }
    );
  };

  // --- Unified Handlers ---
  const handleTestConnection = async () => {
    startProgress('test', '正在测试连接...');
    const ok = selectedProvider.value === 'webdav' ? await testWebDAV() : await testGist();
    if (ok) finishProgress('完成');
    else failProgress('连接失败');
  };

  const handlePush = async () => {
    ElMessageBox.confirm('确定要将本地数据推送到云端吗？这将覆盖云端上已有的备份。', '确认推送', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        if (selectedProvider.value === 'webdav') {
          await pushToWebDAV();
        } else {
          await pushToGist();
        }
      })
      .catch(() => {
        ElMessage.info('推送操作已取消');
      });
  };

  const handlePull = async () => {
    if (selectedProvider.value === 'webdav') await pullFromWebDAV();
    else await pullFromGist();
  };

  const revertCurrentPull = async () => {
    if (!snapshotAvailable.value) return false;
    const ok = await revertPull();
    if (ok) clearSnapshotNotice();
    return ok;
  };

  const clearSnapshotNotice = () => {
    removeSessionStorageItem(snapshotSessionKey);
    snapshotAvailable.value = false;
  };

  const initSync = () => {
    const savedWebDAVConfig = localStorage.getItem('webdavConfig');
    if (savedWebDAVConfig) webdavConfig.value = JSON.parse(savedWebDAVConfig);

    const snapshotData = getSessionStorageItem(snapshotSessionKey);
    if (snapshotData) {
      snapshotAvailable.value = true;
    } else {
      removeSessionStorageItem(snapshotSessionKey);
      snapshotAvailable.value = false;
    }

    const savedGistConfig = loadGistConfig();
    if (savedGistConfig) gistConfig.value = savedGistConfig;
  };

  return {
    webdavConfig,
    gistConfig,
    snapshotAvailable,
    syncProgressActive,
    syncProgressText,
    syncCurrentAction,
    selectedProvider,
    providerOptions,
    canPush,
    canPull,
    initSync,
    handleTestConnection,
    handlePush,
    handlePull,
    revertCurrentPull,
    clearSnapshotNotice,
    formatSyncTime,
    openGistTokenHelp,
    listGists,
  };
}

export type SyncStore = ReturnType<typeof useSync>;
export const syncInjectionKey: InjectionKey<SyncStore> = Symbol('sync');
