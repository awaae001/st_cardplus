<template>
  <div class="about-page">
    <h1>设置与关于</h1>

    <!-- 设置区域 -->
    <div class="settings-section">
      <h2>应用设置</h2>

      <div class="setting-group">
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">显示测试版功能</span>
            <Icon icon="material-symbols:experiment-outline" width="20" height="20"
              style="margin-left: 8px; color: var(--el-color-warning);" />
          </div>
          <el-switch v-model="betaFeaturesEnabled" @change="onBetaFeaturesToggle"
            :active-text="betaFeaturesEnabled ? '开启' : ''" :inactive-text="!betaFeaturesEnabled ? '关闭' : ''"
            size="large" />
        </div>
        <p class="setting-description">
          开启后将在侧边栏显示测试版功能，包括 EJS 模板编辑器和世界书功能
        </p>
      </div>

      <div class="setting-group">
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">umami匿名遥测</span>
            <Icon icon="material-symbols:analytics-outline" width="20" height="20"
              style="margin-left: 8px; color: var(--el-color-info);" />
          </div>
          <el-switch v-model="umamiEnabled" @change="onUmamiToggle" :active-text="umamiEnabled ? '开启' : ''"
            :inactive-text="!umamiEnabled ? '关闭' : ''" size="large" />
        </div>
        <p class="setting-description">
          开启后将收集匿名使用数据以帮助改进应用，不会收集任何个人信息或角色卡内容
        </p>
      </div>

      <div class="setting-group">
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">自动保存间隔</span>
            <Icon icon="material-symbols:save-outline" width="20" height="20"
              style="margin-left: 8px; color: var(--el-color-success);" />
          </div>
          <div class="interval-control">
            <el-input-number v-model="autoSaveInterval" @change="onAutoSaveIntervalChange" :min="1" :max="60" :step="1"
              size="large" style="width: 120px;" />
            <span class="interval-unit">秒</span>
          </div>
        </div>
        <p class="setting-description">
          设置编辑器中内容的自动保存间隔，范围：1-60秒
        </p>
      </div>

      <div class="setting-group">
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">数据迁移</span>
            <Icon icon="material-symbols:cloud-sync-outline" width="20" height="20"
              style="margin-left: 8px; color: var(--el-color-primary);" />
          </div>
          <div>
            <el-button @click="exportData" type="primary" plain>
              <Icon icon="material-symbols:download" width="20" height="20" style="margin-right: 8px;" />
              导出数据
            </el-button>
            <el-button @click="importData" type="success" plain>
              <Icon icon="material-symbols:upload" width="20" height="20" style="margin-right: 8px;" />
              导入数据
            </el-button>
          </div>
        </div>
        <p class="setting-description">
          导出所有本地数据到一个 JSON 文件，或从一个 JSON 文件导入数据来恢复状态。
        </p>
      </div>
    </div>

    <!-- 关于区域 -->
    <div class="about-section">
      <h2>关于应用</h2>
      <p>这是一个用于创建和管理 SillyTavern 角色卡的在线应用程序。</p>
      <p>访问我们的 GitHub 页面获取更多信息或贡献代码：</p>
      <p>
        开发版本：
        <b v-if="appCommitCount === '1'">在线版_{{ appVersion }}</b>
        <b v-else>dev_{{ appVersion }}({{ appCommitCount }})</b>
      </p>
    </div>

    <a href="https://github.com/awaae001/st_cardplus" target="_blank" class="github-link">
      <Icon icon="mdi:github" width="24" height="24" style="margin-right: 4px;" />
      GitHub 仓库
    </a>
    <div style="margin: 6px; display: inline;"></div>
    <a href="https://autopatchcn.yuanshen.com/client_app/download/launcher/20241225164539_9oyGHAOXvzP4uaBW/mihoyo/yuanshen_setup_202412201736.exe"
      target="_blank" class="pro">
      <Icon icon="material-symbols:key-vertical-outline" width="24" height="24" style="margin-right: 4px;" />
      解锁高级版
    </a>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { getBetaFeaturesEnabled, setBetaFeaturesEnabled, getUmamiEnabled, setUmamiEnabled, getAutoSaveInterval, setAutoSaveInterval } from '@/utils/localStorageUtils';

const betaFeaturesEnabled = ref(false);
const umamiEnabled = ref(true);
const autoSaveInterval = ref(5);

const appVersion = __APP_VERSION__;
const appCommitCount = __APP_COMMIT_COUNT__;

const onBetaFeaturesToggle = (value: boolean) => {
  if (value) {
    ElMessageBox.confirm(
      `
          <div style="text-align: left;">
            <p>测试版功能尚在开发中，可能存在未知问题和不稳定性</p>
            <p>这些功能可能会在没有事先通知的情况下发生变化或被移除</p>
            <p>在一般情况下，测试版将会带来更多<b>破坏性更新</b>，这可能导致您的创意丢失或者难以寻回</p>
            <p><strong>使用测试版功能即表示您理解并接受这些风险</strong></p>
            <p>我鼓励您通过 <a href="https://github.com/awaae001/st_cardplus/issues" target="_blank" style="color: var(--el-color-primary);">GitHub Issues</a> 反馈问题，但请注意，我可能无法提供即时支持。</p>
          </div>
        `,
      '启用测试版功能',
      {
        confirmButtonText: '我理解并同意',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
      .then(() => {
        setBetaFeaturesEnabled(true);
        window.dispatchEvent(new CustomEvent('betaFeaturesToggle', { detail: true }));
        ElMessage({
          type: 'success',
          message: '测试版功能已开启',
        });
      })
      .catch(() => {
        betaFeaturesEnabled.value = false;
        ElMessage({
          type: 'info',
          message: '已取消开启测试版功能',
        });
      });
  } else {
    setBetaFeaturesEnabled(false);
    window.dispatchEvent(new CustomEvent('betaFeaturesToggle', { detail: false }));
  }
};

const onUmamiToggle = (value: boolean) => {
  if (!value) {
    ElMessageBox.confirm(
      `
          <div style="text-align: left;">
            <p>我依靠匿名遥测数据来了解功能的使用情况、发现问题并指导应用的未来发展。</p>
            <p>关闭遥测将使我更难改进您和其他用户的使用体验</p>
            <p><strong>您确定要关闭匿名遥测吗？</strong></p>
            <p>我承诺，所有收集的数据都是完全匿名的，绝不包含任何个人身份信息或您的创作内容</p>
            <p>你可以通过 <a href="mailto:admin@awaae001.top" style="color: var(--el-color-primary);">📥 电子邮件</a> 发送邮件尝试要求删除你的数据（看我能不能找得到）</p>
          </div>
        `,
      '关闭匿名遥测',
      {
        confirmButtonText: '确认关闭',
        cancelButtonText: '保持开启',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }
    )
      .then(() => {
        setUmamiEnabled(false);
        toggleUmamiScript(false);
        ElMessage({
          type: 'success',
          message: '匿名遥测已关闭',
        });
      })
      .catch(() => {
        umamiEnabled.value = true;
        ElMessage({
          type: 'info',
          message: '已取消关闭匿名遥测',
        });
      });
  } else {
    setUmamiEnabled(true);
    toggleUmamiScript(true);
  }
};

const onAutoSaveIntervalChange = (value: number) => {
  setAutoSaveInterval(value);
  // 触发全局事件，通知其他组件自动保存间隔已变更
  window.dispatchEvent(new CustomEvent('autoSaveIntervalChange', { detail: value }));
};

const toggleUmamiScript = (enabled: boolean) => {
  const existingScript = document.querySelector('script[data-website-id="6685fde6-dad1-49c1-b952-3a487d6991da"]');

  if (enabled && !existingScript) {
    // 添加遥测脚本
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://umami.awaae001.top/script.js';
    script.setAttribute('data-website-id', '6685fde6-dad1-49c1-b952-3a487d6991da');
    document.head.appendChild(script);
  } else if (!enabled && existingScript) {
    // 移除遥测脚本
    existingScript.remove();
  }
};

onMounted(() => {
  betaFeaturesEnabled.value = getBetaFeaturesEnabled();
  umamiEnabled.value = getUmamiEnabled();
  autoSaveInterval.value = getAutoSaveInterval();
  // 根据设置初始化遥测脚本
  toggleUmamiScript(umamiEnabled.value);
});

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
.about-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.about-page h1 {
  color: var(--el-text-color-primary);
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-success));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.settings-section,
.about-section {
  margin: 24px 0;
  padding: 24px;
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.settings-section:hover,
.about-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.settings-section {
  text-align: left;
}

.about-section {
  text-align: center;
}

.settings-section h2,
.about-section h2 {
  margin: 0 0 20px 0;
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid var(--el-color-primary);
  padding-bottom: 8px;
  display: inline-block;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group:last-child {
  margin-bottom: 0;
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

.about-section p {
  margin: 12px 0;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.about-section p:last-of-type {
  margin-bottom: 20px;
  font-weight: 500;
}

.github-link {
  display: inline-block;
  margin: 16px 8px 0 0;
  padding: 12px 20px;
  background-color: #24292e;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(36, 41, 46, 0.2);
}

.pro {
  display: inline-block;
  margin: 16px 0 0 8px;
  padding: 12px 20px;
  background-color: #37b466;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(55, 180, 102, 0.2);
}

.pro:hover {
  background-color: #2c9653;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(55, 180, 102, 0.3);
}

.github-link:hover {
  background-color: #444d56;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(36, 41, 46, 0.3);
}

@media (max-width: 768px) {
  .about-page {
    padding: 16px;
  }

  .about-page h1 {
    font-size: 28px;
  }

  .settings-section,
  .about-section {
    padding: 20px;
    margin: 20px 0;
  }

  .setting-item {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .setting-info {
    width: 100%;
  }

  .github-link,
  .pro {
    display: block;
    margin: 12px 0;
    text-align: center;
  }

  .settings-section h2,
  .about-section h2 {
    font-size: 18px;
  }

  .interval-control {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
}

.interval-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interval-unit {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}
</style>
