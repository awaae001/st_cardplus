<template>
  <div class="app-settings">
    <div class="setting-card">
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">显示测试版功能</span>
            <Icon icon="material-symbols:experiment-outline" width="20" height="20"
              style="margin-left: 8px; color: var(--el-color-warning);" />
          </div>
          <el-switch v-model="betaFeaturesEnabled" @change="onBetaFeaturesToggle" size="large" />
        </div>
        <p class="setting-description">
          开启后将在侧边栏显示测试版功能，包括 EJS 模板编辑器和世界书功能。
        </p>
      </div>
    </div>

    <div class="setting-card">
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">使用旧版本侧边栏特性</span>
            <Icon icon="material-symbols:view-sidebar-outline" width="20" height="20"
              style="margin-left: 8px; color: var(--el-color-primary);" />
          </div>
          <el-switch v-model="useOldSidebar" @change="onUseOldSidebarToggle" size="large" />
        </div>
        <p class="setting-description">
          开启后将使用旧版本的侧边栏（缺乏维护），这可能解决一些新版本侧边栏在较老设备上的显示问题。
        </p>
      </div>
    </div>

    <div class="setting-card">
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">umami匿名遥测</span>
            <Icon icon="material-symbols:analytics-outline" width="20" height="20"
              style="margin-left: 8px; color: var(--el-color-info);" />
          </div>
          <el-switch v-model="umamiEnabled" @change="onUmamiToggle" size="large" />
        </div>
        <p class="setting-description">
          开启后将收集匿名使用数据以帮助改进应用，不会收集任何个人信息或角色卡内容。
        </p>
      </div>
    </div>

    <div class="setting-card">
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">自动保存间隔</span>
            <Icon icon="material-symbols:save-outline" width="20" height="20"
              style="margin-left: 8px; color: var(--el-color-success);" />
          </div>
          <div class="interval-control">
            <el-input-number v-model="autoSaveInterval" @change="onAutoSaveIntervalChange" :min="1" :max="60"
              :step="1" size="small" style="width: 100px;" />
            <span class="interval-unit">秒</span>
          </div>
        </div>
        <p class="setting-description">
          设置编辑器中内容的自动保存间隔，范围：1-60秒。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { getBetaFeaturesEnabled, setBetaFeaturesEnabled, getUmamiEnabled, setUmamiEnabled, getAutoSaveInterval, setAutoSaveInterval, getUseOldSidebar, setUseOldSidebar } from '@/utils/localStorageUtils';

const betaFeaturesEnabled = ref(false);
const umamiEnabled = ref(true);
const autoSaveInterval = ref(5);
const useOldSidebar = ref(true);

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
  window.dispatchEvent(new CustomEvent('autoSaveIntervalChange', { detail: value }));
};

const onUseOldSidebarToggle = (value: boolean) => {
  setUseOldSidebar(value);
  ElMessageBox.confirm(
    '此设置将在您下次刷新页面 (Ctrl+R) 后生效。',
    '提示',
    {
      confirmButtonText: '立即刷新',
      cancelButtonText: '稍后',
      type: 'info',
    }
  ).then(() => {
    window.location.reload();
  });
};

const toggleUmamiScript = (enabled: boolean) => {
  const existingScript = document.querySelector('script[data-website-id="6685fde6-dad1-49c1-b952-3a487d6991da"]');

  if (enabled && !existingScript) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://umami.awaae001.top/script.js';
    script.setAttribute('data-website-id', '6685fde6-dad1-49c1-b952-3a487d6991da');
    document.head.appendChild(script);
  } else if (!enabled && existingScript) {
    existingScript.remove();
  }
};

onMounted(() => {
  betaFeaturesEnabled.value = getBetaFeaturesEnabled();
  umamiEnabled.value = getUmamiEnabled();
  autoSaveInterval.value = getAutoSaveInterval();
  useOldSidebar.value = getUseOldSidebar();
  toggleUmamiScript(umamiEnabled.value);
});
</script>

<style scoped>
.app-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-card {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.3s ease;
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

.interval-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interval-unit {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>