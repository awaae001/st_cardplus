<template>
  <div class="about-section">
    <h2>关于应用 <span v-if="isDevDomain" style="color: #e6a23c; font-size: 12px;">滚动测试版本</span></h2>
    <p>这是一个用于创建和管理 SillyTavern 角色卡的在线应用程序。</p>
    <p style="display: flex;align-items: center;gap: 8px;">你可以访问
      <Icon icon="qlementine-icons:discord-fill-16" width="16" height="16" /><a href="https://discord.gg/2wKPQHCydk"
        target="_blank" style="color: #409eff;">discord 频道</a> 发送反馈或者访问我的 GitHub 页面获取更多信息或贡献代码：
    </p>
    <p>
      开发版本：
      <b v-if="appCommitCount === '1'">在线版_{{ appVersion }}</b>
      <b v-else>dev_{{ appVersion }}({{ appCommitCount }})</b>
      [0.1.5]
    </p>
  </div>

  <div style="display: flex;">
    <a href="https://github.com/awaae001/st_cardplus" target="_blank" class="github-link">
      <Icon icon="mdi:github" width="24" height="24" style="margin-right: 4px;" />
      GitHub 仓库
    </a>
    <template v-if="isMainDomain">
      <div style="margin: 6px; display: inline;"></div>
      <a href="https://autopatchcn.yuanshen.com/client_app/download/launcher/20241225164539_9oyGHAOXvzP4uaBW/mihoyo/yuanshen_setup_202412201736.exe"
        target="_blank" class="pro">
        <Icon icon="material-symbols:key-vertical-outline" width="24" height="24"
          style="margin-right: 4px; display: inline-block;" />
        解锁高级版
      </a>
      <div style="margin: 6px; display: inline;"></div>
      <a href="https://dev.st-cardplus-1kl.pages.dev/" style="background-color: rgb(218 204 76);" target="_blank"
        class="pro">
        <Icon icon="material-symbols:build-circle-outline" width="24" height="24" style="margin-right: 4px;" />
        访问滚动测试
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const appVersion = __APP_VERSION__;
const appCommitCount = __APP_COMMIT_COUNT__;

const isMainDomain = computed(() => {
  return window.location.hostname === 'cardplus.jiuci.top';
});

const isDevDomain = computed(() => {
  return window.location.hostname === 'dev.st-cardplus-1kl.pages.dev';
});
</script>

<style scoped>
.about-section {
  margin: 24px 0;
  transition: all 0.3s ease;
}

.about-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.about-section h2 {
  margin: 0 0 20px 0;
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid var(--el-color-primary);
  padding-bottom: 8px;
  display: inline-block;
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
  display: flex;
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
  display: flex;
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
</style>