<template>
  <div class="about-page">
    <h1>关于 SillyTavern 角色卡编辑器</h1>
    <p>这是一个用于创建和管理 SillyTavern 角色卡的在线应用程序。</p>
    <p>访问我们的 GitHub 页面获取更多信息或贡献代码：</p>
    <p>开发版本：<b>dev_0.1.4(6-1851)</b></p>
    
    <!-- 测试版功能开关 -->
    <div class="beta-features-setting">
      <h3>设置</h3>
      <div class="setting-item">
        <span class="setting-label">显示测试版功能</span>
        <el-switch
          v-model="betaFeaturesEnabled"
          @change="onBetaFeaturesToggle"
          :active-text="betaFeaturesEnabled ? '开启' : ''"
          :inactive-text="!betaFeaturesEnabled ? '关闭' : ''"
        />
      </div>
      <p class="setting-description">
        开启后将在侧边栏显示测试版功能，包括 EJS 模板编辑器和世界书功能
      </p>
    </div>
    
    <a href="https://github.com/awaae001/st_cardplus" target="_blank" class="github-link">
      <Icon icon="mdi:github" width="24" height="24"  style="margin-right: 4px;"/>
      GitHub 仓库
    </a>
      <div style="margin: 6px; display: inline;"></div>
    <a href="https://autopatchcn.yuanshen.com/client_app/download/launcher/20241225164539_9oyGHAOXvzP4uaBW/mihoyo/yuanshen_setup_202412201736.exe" target="_blank" class="pro">
      <Icon icon="material-symbols:key-vertical-outline" width="24" height="24"  style="margin-right: 4px;"/>
      解锁高级版
    </a>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, onMounted } from 'vue';
import { getBetaFeaturesEnabled, setBetaFeaturesEnabled } from '@/utils/localStorageUtils';

const betaFeaturesEnabled = ref(false);

const onBetaFeaturesToggle = (value: boolean) => {
  setBetaFeaturesEnabled(value);
  // 触发全局事件，通知其他组件状态已变更
  window.dispatchEvent(new CustomEvent('betaFeaturesToggle', { detail: value }));
};

onMounted(() => {
  betaFeaturesEnabled.value = getBetaFeaturesEnabled();
});
</script>

<style scoped>
.about-page {
  padding: 20px;
  text-align: center;
}

.beta-features-setting {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background-color: var(--el-bg-color);
}

.beta-features-setting h3 {
  margin: 0 0 16px 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.setting-label {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.setting-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: left;
  margin: 0;
  line-height: 1.4;
}

.github-link {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #24292e;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.pro {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #37b466;
  color: rgb(0, 0, 0);
  text-decoration: none;
  border-radius: 4px;
}

.pro:hover {
  background-color: #2c6e2e;
}
.github-link:hover {
  background-color: #444d56;
}
</style>
