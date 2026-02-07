<template>
  <div class="about-section">
    <h2>
      关于应用
      <span
        v-if="isDevDomain"
        style="color: #e6a23c; font-size: 12px"
      >
        滚动测试版本
      </span>
    </h2>
    <p>这是一个用于创建和管理 SillyTavern 角色卡的在线应用程序</p>
    <p style="display: flex; align-items: center; gap: 8px">
      你可以访问
      <Icon
        icon="qlementine-icons:discord-fill-16"
        width="16"
        height="16"
      />
      <a
        href="https://discord.gg/KH6rHAGBXD"
        target="_blank"
        style="color: #409eff"
      >
        discord 频道
      </a>
      发送反馈或者访问我的 GitHub 页面获取更多信息或贡献代码：
    </p>
    <p>
      开发版本：
      <b v-if="appCommitCount === '1'">在线版_{{ appVersion }}</b>
      <b v-else>dev_{{ appVersion }}({{ appCommitCount }})</b>
      [0.1.12]
    </p>
    <SurveyBanner :dismissible="false" />
  </div>

  <div class="changelog-section">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
      <h3>更新日志</h3>
      <div class="branch-selector">
        <label
          for="branch-select"
          style="width: 50px"
        >
          分支:
        </label>
        <el-select
          v-model="selectedBranch"
          placeholder="选择分支"
          size="small"
        >
          <el-option
            v-for="branch in branches"
            :key="branch.name"
            :label="branch.name"
            :value="branch.name"
          />
        </el-select>
      </div>
    </div>
    <div
      v-for="(log, index) in gitLogs"
      :key="index"
      class="commit-item"
    >
      <div
        class="commit-header"
        @click="log.expanded = !log.expanded"
      >
        <span class="commit-message">{{ log.message }}</span>
        <div class="commit-meta">
          <a
            :href="log.html_url"
            target="_blank"
            class="commit-id"
          >
            #{{ log.sha.substring(0, 7) }}
          </a>
          <span class="commit-date">{{ new Date(log.date).toLocaleDateString() }}</span>
        </div>
      </div>
      <transition name="slide-fade">
        <div
          v-if="log.expanded"
          class="commit-details"
        >
          <pre>{{ log.fullMessage }}</pre>
        </div>
      </transition>
    </div>
    <div class="load-more-container">
      <button
        @click="() => loadMore()"
        :disabled="!hasMore || loading"
        class="load-more-button"
      >
        {{ loading ? '加载中...' : hasMore ? '加载更多' : '没有更多了' }}
      </button>
    </div>
  </div>

  <div style="display: flex">
    <a
      href="https://github.com/awaae001/st_cardplus"
      target="_blank"
      class="github-link"
    >
      <Icon
        icon="mdi:github"
        width="24"
        height="24"
        style="margin-right: 4px"
      />
      GitHub 仓库
    </a>
    <template v-if="isMainDomain">
      <div style="margin: 6px; display: inline"></div>
      <a
        href="https://autopatchcn.yuanshen.com/client_app/download/launcher/20241225164539_9oyGHAOXvzP4uaBW/mihoyo/yuanshen_setup_202412201736.exe"
        target="_blank"
        class="pro"
      >
        <Icon
          icon="material-symbols:key-vertical-outline"
          width="24"
          height="24"
          style="margin-right: 4px; display: inline-block"
        />
        解锁高级版
      </a>
      <div style="margin: 6px; display: inline"></div>
      <a
        href="https://dev.st-cardplus-1kl.pages.dev/"
        style="background-color: rgb(218 204 76)"
        target="_blank"
        class="pro"
      >
        <Icon
          icon="material-symbols:build-circle-outline"
          width="24"
          height="24"
          style="margin-right: 4px"
        />
        访问滚动测试
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref } from 'vue';
import SurveyBanner from '@/components/SurveyBanner.vue';
import { ElSelect, ElOption } from 'element-plus';

const appVersion = __APP_VERSION__;
const appCommitCount = __APP_COMMIT_COUNT__;
const gitLogs = ref<any[]>([]);
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);
const branches = ref<any[]>([]);
const selectedBranch = ref('');

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

import { watch } from 'vue';

const loadMore = async (isBranchChange = false) => {
  if ((!hasMore.value || loading.value) && !isBranchChange) return;

  loading.value = true;
  if (isBranchChange) {
    page.value = 1;
    gitLogs.value = [];
    hasMore.value = true;
  }

  try {
    if (!selectedBranch.value) return;
    const response = await fetch(
      `https://api.github.com/repos/awaae001/st_cardplus/commits?sha=${selectedBranch.value}&per_page=10&page=${page.value}`
    );
    if (response.ok) {
      const commits: Commit[] = await response.json();
      if (commits.length < 10) {
        hasMore.value = false;
      }
      const newLogs = commits.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message.split('\n')[0],
        fullMessage: commit.commit.message,
        date: commit.commit.author.date,
        html_url: commit.html_url,
        expanded: false,
      }));
      gitLogs.value.push(...newLogs);
      page.value++;
    } else {
      hasMore.value = false;
    }
  } catch (error) {
    console.error('Error fetching git logs:', error);
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};

const fetchBranches = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/awaae001/st_cardplus/branches');
    if (response.ok) {
      branches.value = await response.json();
      selectedBranch.value = isMainDomain.value ? 'main' : 'dev';
    }
  } catch (error) {
    console.error('Error fetching branches:', error);
  }
};

onMounted(() => {
  fetchBranches();
});

watch(selectedBranch, (newBranch) => {
  if (newBranch) {
    loadMore(true);
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
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.branch-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 242px;
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

.load-more-container {
  text-align: center;
  margin-top: 16px;
}

.load-more-button {
  padding: 8px 16px;
  border: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.load-more-button:hover:not(:disabled) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.load-more-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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
