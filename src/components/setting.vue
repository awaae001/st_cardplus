<template>
  <div class="about-page">
    <div class="title-container">
      <h1>关于与设置</h1>
      <p class="subtitle">管理自己的自定义设置</p>
    </div>
    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="设置" name="settings">
        <div class="settings-section">
          <AppSettings />
          <div style="margin: 16px;"></div>
          <DataManagement />
        </div>
      </el-tab-pane>
      <el-tab-pane label="WebDAV 同步" name="webdav">
        <WebDAVSettings />
      </el-tab-pane>
      <el-tab-pane label="关于" name="about">
        <AboutSection />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppSettings from './settingPage/AppSettings.vue';
import DataManagement from './settingPage/DataManagement.vue';
import WebDAVSettings from './settingPage/WebDAVSettings.vue';
import AboutSection from './settingPage/AboutSection.vue';

const activeTab = ref('settings');
</script>

<style scoped>
.about-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.title-container {
  text-align: left;
  margin-bottom: 20px;
}

.title-container h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0;
}

.title-container .subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.settings-tabs {
  margin-top: 20px;
}

:deep(.el-tabs__header) {
  margin: 0 0 25px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--el-color-primary);
}

.settings-section {
  text-align: left;
}
</style>
