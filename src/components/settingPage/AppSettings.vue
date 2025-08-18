<template>
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
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { getBetaFeaturesEnabled, setBetaFeaturesEnabled, getUmamiEnabled, setUmamiEnabled, getAutoSaveInterval, setAutoSaveInterval } from '@/utils/localStorageUtils';

const betaFeaturesEnabled = ref(false);
const umamiEnabled = ref(true);
const autoSaveInterval = ref(5);

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
  toggleUmamiScript(umamiEnabled.value);
});
</script>

<style scoped>
.setting-group {
  margin-bottom: 16px;
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