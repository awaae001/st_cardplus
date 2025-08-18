<template>
  <div class="setting-group">
    <div class="setting-item">
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
</script>

<style scoped>
.setting-group {
  margin-bottom: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 20px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.setting-item:hover {
  border-color: var(--el-color-primary-light-5);
  background-color: var(--el-color-primary-light-9);
  transform: translateY(-1px);
}

.setting-info {
  display: flex;
  align-items: center;
}

.setting-label {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.setting-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: left;
  margin: 8px 0 0 0;
  line-height: 1.5;
  background-color: var(--el-fill-color-light);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid var(--el-color-info);
}
</style>