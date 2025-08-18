<template>
  <div class="about-page">
    <h1>设置与关于</h1>

    <div class="settings-section">
      <h2>应用设置</h2>
      <AppSettings />
      <DataManagement />
      <WebDAVSettings />
    </div>

    <AboutSection />
  </div>
</template>

<script setup lang="ts">
import AppSettings from './settingPage/AppSettings.vue';
import DataManagement from './settingPage/DataManagement.vue';
import WebDAVSettings from './settingPage/WebDAVSettings.vue';
import AboutSection from './settingPage/AboutSection.vue';
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

.settings-section {
  margin: 24px 0;
  padding: 24px;
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  text-align: left;
}

.settings-section:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.settings-section h2 {
  margin: 0 0 20px 0;
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid var(--el-color-primary);
  padding-bottom: 8px;
  display: inline-block;
}

@media (max-width: 768px) {
  .about-page {
    padding: 16px;
  }

  .about-page h1 {
    font-size: 28px;
  }

  .settings-section {
    padding: 20px;
    margin: 20px 0;
  }

  .settings-section h2 {
    font-size: 18px;
  }
}
</style>
