<template>
  <div class="about-section">
    <h2>关于应用 <span v-if="isDevDomain" style="color: #e6a23c; font-size: 12px;">滚动测试版本</span></h2>
    <p>这是一个用于创建和管理 SillyTavern 角色卡的在线应用程序 </p>
    <p style="display: flex;align-items: center;gap: 8px;">你可以访问
      <Icon icon="qlementine-icons:discord-fill-16" width="16" height="16" /><a href="https://discord.gg/2wKPQHCydk"
        target="_blank" style="color: #409eff;">discord 频道</a> 发送反馈或者访问我的 GitHub 页面获取更多信息或贡献代码：
    </p>
    <p>
      开发版本：
      <b v-if="appCommitCount === '1'">在线版_{{ appVersion }}</b>
      <b v-else>dev_{{ appVersion }}({{ appCommitCount }})</b>
      [0.1.6]
    </p>
  </div>

  <div class="changelog-section">
    <h3>更新日志</h3>
    <div v-for="(log, index) in gitLogs" :key="index" class="commit-item">
      <div class="commit-header" @click="log.expanded = !log.expanded">
        <span class="commit-message">{{ log.message }}</span>
        <div class="commit-meta">
          <a :href="log.html_url" target="_blank" class="commit-id">#{{ log.sha.substring(0, 7) }}</a>
          <span class="commit-date">{{ new Date(log.date).toLocaleDateString() }}</span>
        </div>
      </div>
      <transition name="slide-fade">
        <div v-if="log.expanded" class="commit-details">
          <pre>{{ log.fullMessage }}</pre>
        </div>
      </transition>
    </div>
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
import { computed, onMounted, ref } from 'vue';

const appVersion = __APP_VERSION__;
const appCommitCount = __APP_COMMIT_COUNT__;
const gitLogs = ref<any[]>([]);

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  html_url: string;
}

onMounted(async () => {
  try {
    const branch = isMainDomain.value ? 'main' : 'dev';
    const response = await fetch(`https://api.github.com/repos/awaae001/st_cardplus/commits?sha=${branch}&per_page=10`);
    if (response.ok) {
      const commits: Commit[] = await response.json();
      gitLogs.value = commits.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message.split('\n')[0],
        fullMessage: commit.commit.message,
        date: commit.commit.author.date,
        html_url: commit.html_url,
        expanded: false,
      }));
    } else {
      gitLogs.value = [{ message: '无法加载更新日志', sha: '', date: '', html_url: '' }];
    }
  } catch (error) {
    console.error('Error fetching git logs:', error);
    gitLogs.value = [{ message: '加载更新日志时出错', sha: '', date: '', html_url: '' }];
  }
});


const isMainDomain = computed(() => {
  return window.location.hostname === 'cardplus.jiuci.top';
});

const isDevDomain = computed(() => {
  return window.location.hostname === 'dev.st-cardplus-1kl.pages.dev';
});
</script>

<style scoped>
.changelog-section {
  margin: 24px 0;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  max-height: 50vh;
  overflow: auto;
}

.changelog-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.commit-item {
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 8px 0;
}

.commit-item:last-child {
  border-bottom: none;
}

.commit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.commit-message {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.commit-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.commit-id {
  font-family: monospace;
  color: var(--el-color-primary);
  text-decoration: none;
}
.commit-id:hover {
  text-decoration: underline;
}

.commit-details {
  margin-top: 8px;
  padding: 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.commit-details pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

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