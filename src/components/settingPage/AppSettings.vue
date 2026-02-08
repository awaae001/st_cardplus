<template>
  <el-alert
    type="warning"
    show-icon
    :closable="false"
    style="margin-bottom: 20px"
  >
    <template #title>所有兼容性项目将在 0.2.0 新版本到来前被逐步移除</template>
    <template #default>0.2.0 将在所有页面完成重构后到来</template>
  </el-alert>
  <div class="app-settings">
    <div
      v-for="setting in settings"
      :key="setting.id"
      class="setting-card"
    >
      <div class="setting-content">
        <div class="setting-header">
          <div class="setting-info">
            <span class="setting-label">{{ setting.label }}</span>
            <Icon
              :icon="setting.icon"
              width="20"
              height="20"
              :style="{ marginLeft: '8px', color: setting.iconColor }"
            />
          </div>
          <template v-if="setting.type === 'switch'">
            <el-switch
              v-model="setting.model.value"
              @change="setting.handler"
              size="large"
              :disabled="setting.disabled"
            />
          </template>
          <template v-else-if="setting.type === 'numberInput'">
            <div class="interval-control">
              <el-input-number
                v-model="setting.model.value"
                @change="setting.handler"
                :min="setting.min"
                :max="setting.max"
                :step="setting.step"
                size="small"
                style="width: 100px"
              />
              <span class="interval-unit">{{ setting.unit }}</span>
            </div>
          </template>
        </div>
        <p class="setting-description">{{ setting.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAppSettings } from '@/composables/appSettings';
import { getSetting, setSetting } from '@/utils/localStorageUtils';
import { Icon } from '@iconify/vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, ref } from 'vue';

const betaFeaturesEnabled = ref(false);
const umamiEnabled = ref(true);
const autoSaveInterval = ref(5);
const autoSaveDebounce = ref(1.5);
const useOldSidebar = ref(false);
const useOldWorldEditor = ref(false);

const onBetaFeaturesToggle = (value: boolean) => {
  if (value) {
    ElMessageBox.confirm(
      `
          <div style="text-align: left;">
            <p>测试版功能尚在开发中，可能存在未知问题和不稳定性</p>
            <p>这些功能可能会在没有事先通知的情况下发生变化或被移除</p>
            <p>在一般情况下，测试版将会带来更多<b>破坏性更新</b>，这可能导致您的创意丢失或者难以寻回</p>
            <p><strong>使用测试版功能即表示您理解并接受这些风险</strong></p>
            <p>我鼓励您通过 <a href="https://github.com/awaae001/st_cardplus/issues" target="_blank" style="color: var(--el-color-primary);">GitHub Issues</a> 反馈问题，但请注意，我可能无法提供即时支持 </p>
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
        setSetting('betaFeaturesEnabled', true);
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
    setSetting('betaFeaturesEnabled', false);
    window.dispatchEvent(new CustomEvent('betaFeaturesToggle', { detail: false }));
  }
};

const onUmamiToggle = (value: boolean) => {
  if (!value) {
    ElMessageBox.confirm(
      `
          <div style="text-align: left;">
            <p>我依靠匿名遥测数据来了解功能的使用情况、发现问题并指导应用的未来发展 </p>
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
        setSetting('umamiEnabled', false);
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
    setSetting('umamiEnabled', true);
    toggleUmamiScript(true);
  }
};

const onAutoSaveIntervalChange = (value: number | undefined) => {
  if (value === undefined) return;
  setSetting('autoSaveInterval', value);
  window.dispatchEvent(new CustomEvent('autoSaveIntervalChange', { detail: value }));
};

const onAutoSaveDebounceChange = (value: number | undefined) => {
  if (value === undefined) return;
  setSetting('autoSaveDebounce', value);
  window.dispatchEvent(new CustomEvent('autoSaveDebounceChange', { detail: value }));
};

const onUseOldWorldEditorToggle = (value: boolean) => {
  setSetting('useOldWorldEditor', value);
  ElMessageBox.confirm('此设置将在您下次刷新页面 (Ctrl+R) 后生效 ', '提示', {
    confirmButtonText: '立即刷新',
    cancelButtonText: '稍后',
    type: 'info',
  }).then(() => {
    window.location.reload();
  });
};

const settings = computed(() =>
  getAppSettings(
    {
      betaFeaturesEnabled,
      useOldSidebar,
      useOldWorldEditor,
      umamiEnabled,
      autoSaveInterval,
      autoSaveDebounce,
    },
    {
      onBetaFeaturesToggle,
      onUseOldWorldEditorToggle,
      onUmamiToggle,
      onAutoSaveIntervalChange,
      onAutoSaveDebounceChange,
    }
  )
);

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
  betaFeaturesEnabled.value = getSetting('betaFeaturesEnabled');
  umamiEnabled.value = getSetting('umamiEnabled');
  autoSaveInterval.value = getSetting('autoSaveInterval');
  autoSaveDebounce.value = getSetting('autoSaveDebounce');
  useOldWorldEditor.value = getSetting('useOldWorldEditor');
  toggleUmamiScript(umamiEnabled.value);
});
</script>

<style scoped>
/* 使用全局 settings.css 中定义的通用样式 */
</style>
