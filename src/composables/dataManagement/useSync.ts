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
  saveGistConfig
} from '@/utils/gist';
import type { GistConfig, BackupData } from '@/types/gist';
import { exportAllDatabases, importAllDatabases } from '@/database/utils';
import {
  getSessionStorageItem,
  removeSessionStorageItem,
  readSessionStorageJSON,
  writeSessionStorageJSON,
} from '@/utils/localStorageUtils';

interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

export function useSync() {
  // === State ===
  const webdavConfig = ref<WebDAVConfig>({ url: '', username: '', password: '' });
  const gistConfig = ref<GistConfig>({ token: '', gistId: '', lastSyncTime: undefined, autoSync: false });
  
  const snapshotAvailable = ref(false);
  const gistSnapshotAvailable = ref(false);
  const syncProgressActive = ref(false);
  const syncProgressPercent = ref(0);
  const syncProgressText = ref('');
  const syncProgressMode = ref<'determinate' | 'indeterminate'>('determinate');
  const syncCurrentAction = ref<'push' | 'pull' | 'test' | null>(null);

  type SyncProvider = 'webdav' | 'gist';
  const selectedProvider = ref<SyncProvider>('webdav');
  const providerOptions = [
    { label: 'WebDAV', value: 'webdav', icon: 'material-symbols:cloud' },
    { label: 'GitHub Gist', value: 'gist', icon: 'mdi:github' }
  ];
  const webdavBackupFileName = 'st-cardplus-webdav-backup.json';

  // === Computed ===
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
  watch(webdavConfig, (newConfig) => {
    localStorage.setItem('webdavConfig', JSON.stringify(newConfig));
  }, { deep: true });

  watch(gistConfig, (newConfig) => {
    saveGistConfig(newConfig);
  }, { deep: true });

  // === Methods ===
  const collectLocalStorage = (excludeKeys: string[] = []) => {
    const data: { [key: string]: any } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || excludeKeys.includes(key)) continue;
      data[key] = localStorage.getItem(key);
    }
    return data;
  };

  const formatErrorMessage = (error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback;

  const startDeterminateProgress = (action: 'push' | 'pull' | 'test', text: string) => {
    syncProgressActive.value = true;
    syncCurrentAction.value = action;
    syncProgressMode.value = 'determinate';
    syncProgressPercent.value = 0;
    syncProgressText.value = text;
  };

  const startIndeterminateProgress = (action: 'push' | 'pull' | 'test', text: string) => {
    syncProgressActive.value = true;
    syncCurrentAction.value = action;
    syncProgressMode.value = 'indeterminate';
    syncProgressPercent.value = 100;
    syncProgressText.value = text;
  };

  const setProgress = (percent: number, text?: string) => {
    if (!syncProgressActive.value && percent > 0) return;
    if (syncProgressMode.value === 'indeterminate') {
      if (text) syncProgressText.value = text;
      return;
    }
    syncProgressPercent.value = Math.max(0, Math.min(100, Math.round(percent)));
    if (text) syncProgressText.value = text;
  };

  const finishProgress = (text?: string) => {
    setProgress(100, text);
    setTimeout(() => {
      syncProgressActive.value = false;
      syncProgressPercent.value = 0;
      syncProgressText.value = '';
      syncProgressMode.value = 'determinate';
      syncCurrentAction.value = null;
    }, 2000);
  };

  const failProgress = (text?: string) => {
    if (text) syncProgressText.value = text;
    setTimeout(() => {
      syncProgressActive.value = false;
      syncProgressPercent.value = 0;
      syncProgressText.value = '';
      syncProgressMode.value = 'determinate';
      syncCurrentAction.value = null;
    }, 2000);
  };

  // --- Data Preparation ---
  const prepareBackupData = async (): Promise<BackupData> => {
    const localStorageData = collectLocalStorage(['gistConfig', 'webdavConfig']);
    setProgress(6, '正在整理本地数据...');
    const dbData = await exportAllDatabases();
    setProgress(10, '本地数据准备完成');
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      localStorage: localStorageData,
      databases: dbData as any,
    };
  };

  // --- Generic Sync Operations ---
  const genericPull = async (
    provider: SyncProvider,
    downloadFn: (onProgress?: (progress: number) => void) => Promise<any>,
    configKey: string,
    snapshotKey: string,
    snapshotAvailableRef: Ref<boolean>,
    onSuccess?: () => void
  ) => {
    try {
      startDeterminateProgress('pull', `正在从 ${provider} 拉取数据...`);
      setProgress(10, '正在准备下载...');
      ElMessage.info(`正在从 ${provider} 拉取数据...`);
      const result = await downloadFn((progress) => {
        setProgress(10 + progress * 90, `正在从 ${provider} 下载...`);
      });
      setProgress(92, '正在解析备份数据...');

      const backupData: BackupData | null = provider === 'webdav'
        ? JSON.parse(result) as BackupData
        : (result.success ? result.data as BackupData : null);

      if (!backupData) {
        ElMessage.error(provider === 'gist' ? result.message : '拉取失败或数据为空');
        failProgress('拉取失败');
        return;
      }

      await ElMessageBox.confirm(
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
      );


      try {
        setProgress(92, '正在应用云端数据...');
        const snapshotData = collectLocalStorage();
        const dbSnapshot = await exportAllDatabases();
        Object.assign(snapshotData, dbSnapshot);
        writeSessionStorageJSON(snapshotKey, snapshotData);
        snapshotAvailableRef.value = true;
        const flatData = { ...backupData.localStorage, ...backupData.databases };
        await importAllDatabases(flatData);
        const preservedConfig = localStorage.getItem(configKey);
        localStorage.clear();
        if (preservedConfig) localStorage.setItem(configKey, preservedConfig);
        for (const key in backupData.localStorage) {
          if (Object.prototype.hasOwnProperty.call(backupData.localStorage, key)) {
            localStorage.setItem(key, backupData.localStorage[key]);
          }
        }
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
  ) => {
    const snapshotData = readSessionStorageJSON<{ [key: string]: any }>(snapshotKey);
    if (!snapshotData) {
      ElMessage.error('没有可用的快照 请检查是否已执行拉取操作 ');
      return;
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
    } catch (error) {
      if (error === 'cancel') {
        ElMessage.info('操作已取消');
      } else {
        console.error(`恢复 ${provider} 快照失败:`, error);
        ElMessage.error('恢复快照失败，请检查控制台');
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
      startDeterminateProgress('push', '正在准备数据...');
      ElMessage.info('正在准备数据并上传...');
      const backupData = await prepareBackupData();
      const json = JSON.stringify(backupData, null, 2);
      startIndeterminateProgress('push', '推送中...');
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
      'webdavConfig',
      'webdav-snapshot',
      snapshotAvailable
    );
  };

  const revertPull = async () => {
    await genericRevert('webdav', 'webdav-snapshot', snapshotAvailable);
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
          ElMessage.info('未找到备份 Gist，请先推送数据或创建新 Gist');
          return;
        }
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
      ElMessage.error(`获取失败: ${formatErrorMessage(error, '未知错误')}`);
    }
  };

  const pushToGist = async () => {
    if (!gistConfig.value.token) {
      ElMessage.error('请输入 GitHub Personal Access Token');
      return;
    }
    try {
      startDeterminateProgress('push', '正在准备数据...');
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

      startIndeterminateProgress('push', '推送中...');
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
      'gistConfig',
      'gist-snapshot',
      gistSnapshotAvailable,
      () => {
        gistConfig.value.lastSyncTime = new Date().toISOString();
        saveGistConfig(gistConfig.value);
      }
    );
  };

  const revertGistPull = async () => {
    await genericRevert('gist', 'gist-snapshot', gistSnapshotAvailable);
  };

  // --- Unified Handlers ---
  const handleTestConnection = async () => {
    startIndeterminateProgress('test', '正在测试连接...');
    const ok = selectedProvider.value === 'webdav'
      ? await testWebDAV()
      : await testGist();
    if (ok) finishProgress('完成');
    else failProgress('连接失败');
  };

  const handlePush = async () => {
    ElMessageBox.confirm(
      '确定要将本地数据推送到云端吗？这将覆盖云端上已有的备份。',
      '确认推送',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(async () => {
      if (selectedProvider.value === 'webdav') {
        await pushToWebDAV();
      } else {
        await pushToGist();
      }
    }).catch(() => {
      ElMessage.info('推送操作已取消');
    });
  };

  const handlePull = async () => {
    if (selectedProvider.value === 'webdav') await pullFromWebDAV();
    else await pullFromGist();
  };

  const revertCurrentPull = async () => {
    if (snapshotAvailable.value) await revertPull();
    else if (gistSnapshotAvailable.value) await revertGistPull();
  };

  // --- Initialization ---
  const initSync = () => {
    const savedWebDAVConfig = localStorage.getItem('webdavConfig');
    if (savedWebDAVConfig) webdavConfig.value = JSON.parse(savedWebDAVConfig);

    if (getSessionStorageItem('webdav-snapshot')) snapshotAvailable.value = true;

    const savedGistConfig = loadGistConfig();
    if (savedGistConfig) gistConfig.value = savedGistConfig;

    if (getSessionStorageItem('gist-snapshot')) gistSnapshotAvailable.value = true;
  };

  return {
    webdavConfig,
    gistConfig,
    snapshotAvailable,
    gistSnapshotAvailable,
    syncProgressActive,
    syncProgressPercent,
    syncProgressText,
    syncProgressMode,
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
    formatSyncTime,
    openGistTokenHelp,
    listGists,
  };
}

export type SyncStore = ReturnType<typeof useSync>;
export const syncInjectionKey: InjectionKey<SyncStore> = Symbol('sync');
