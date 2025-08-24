<template>
  <div>
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
          将所有应用内数据导出到一个 JSON 文件进行备份，或从备份文件导入以恢复状态。
        </p>
      </div>
    </div>
    <div class="setting-card">
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">清除本地缓存</span>
            <Icon icon="mdi:delete-variant" width="20" height="20" style="margin-left: 8px; color: var(--el-color-danger);" />
          </div>
          <div>
            <el-button @click="clearLocalStorage" type="danger" plain>
              <Icon icon="mdi:delete-empty" width="20" height="20" style="margin-right: 8px;" />
              立即清除
            </el-button>
          </div>
        </div>
        <p class="setting-description">
          此操作将清除所有本地存储的应用数据，包括所有设置和角色卡。这是一个高危操作，请谨慎使用。
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
          此操作将移除所有未被识别的本地缓存条目，以释放空间并可能解决一些问题。此操作仅保留核心数据，请谨慎使用。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const exportData = () => {
  try {
    const data: { [key: string]: any } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
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
          '这将用导入文件中的数据覆盖所有现有本地数据。此操作无法撤销。您确定要继续吗？',
          '警告',
          {
            confirmButtonText: '确认导入',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
          .then(() => {
            localStorage.clear();
            for (const key in data) {
              if (Object.prototype.hasOwnProperty.call(data, key)) {
                localStorage.setItem(key, data[key]);
              }
            }
            ElMessage({
              type: 'success',
              message: '数据已成功导入。应用将重新加载以应用更改。',
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          })
          .catch(() => {
            ElMessage({
              type: 'info',
              message: '导入操作已取消',
            });
          });
      } catch (error) {
        console.error('导入数据失败:', error);
        ElMessage({
          type: 'error',
          message: '导入数据失败，文件格式可能不正确。',
        });
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

const clearLocalStorage = () => {
  ElMessageBox.confirm(
    '您确定要清除所有本地缓存吗？此操作将删除所有角色卡和设置，且无法撤销。',
    '高危操作警告',
    {
      confirmButtonText: '确认清除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      localStorage.clear();
      ElMessage({
        type: 'success',
        message: '本地缓存已清除。应用将重新加载。',
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '操作已取消',
      });
    });
};

const clearInvalidLocalStorage = () => {
  const whitelist = [
    'characterCardData',
    'characterManagerData',
    'ejs-editor-projects',
    'settings',
    'vueuse-color-scheme',
    'webdavConfig',
    'world-editor-data',
    'worldBookManagerData'
  ];

  ElMessageBox.confirm(
    '您确定要清理无效的本地缓存吗？此操作将删除所有不在白名单中的本地存储条目。',
    '清理确认',
    {
      confirmButtonText: '确认清理',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
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

      ElMessage({
        type: 'success',
        message: `已成功清理 ${removedCount} 个无效缓存条目。应用将重新加载。`,
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '操作已取消',
      });
    });
};
</script>

<style scoped>
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
</style>