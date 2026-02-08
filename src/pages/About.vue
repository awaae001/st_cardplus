<template>
  <div class="about-page">
    <!-- 头部信息卡片 -->
    <div class="hero-card">
      <div class="hero-content">
        <img
          src="/image/logo.png"
          alt="ST CardPlus Logo"
          class="hero-logo"
        />
        <div class="hero-text">
          <h1 class="hero-title">
            ST CardPlus
            <span
              v-if="isDevDomain"
              class="dev-badge"
            >
              DEV
            </span>
          </h1>
          <p class="hero-description">SillyTavern 角色卡编辑工具</p>
          <p class="hero-version">
            版本：
            <span v-if="appCommitCount === '1'">在线版_{{ appVersion }}</span>
            <span v-else>dev_{{ appVersion }} ({{ appCommitCount }})</span>
            <span class="version-tag">[0.1.13]</span>
          </p>
        </div>
      </div>
    </div>

    <!-- 公告横幅 -->
    <SystemBanner
      bannerId="newYearSurvey2026_about"
      startDate="2026-01-01"
      endDate="2026-03-01"
      message="我们有一个新年调查，去填写一下？"
      link="https://tally.so/r/kdeaLo"
      linkText="填写调查"
      :dismissible="false"
    />

    <!-- 快速链接卡片 -->
    <div class="links-card">
      <h2 class="section-title">快速链接</h2>
      <div class="links-grid">
        <a
          href="https://github.com/awaae001/st_cardplus"
          target="_blank"
          class="link-item github"
        >
          <Icon
            icon="mdi:github"
            width="28"
            height="28"
          />
          <div class="link-text">
            <span class="link-title">GitHub 仓库</span>
            <span class="link-desc">查看源码与贡献</span>
          </div>
        </a>
        <a
          href="https://discord.gg/KH6rHAGBXD"
          target="_blank"
          class="link-item discord"
        >
          <Icon
            icon="qlementine-icons:discord-fill-16"
            width="28"
            height="28"
          />
          <div class="link-text">
            <span class="link-title">Discord 频道</span>
            <span class="link-desc">获取帮助与反馈</span>
          </div>
        </a>
        <template v-if="isMainDomain">
          <a
            href="https://autopatchcn.yuanshen.com/client_app/download/launcher/20241225164539_9oyGHAOXvzP4uaBW/mihoyo/yuanshen_setup_202412201736.exe"
            target="_blank"
            class="link-item pro"
          >
            <Icon
              icon="material-symbols:key-vertical-outline"
              width="28"
              height="28"
            />
            <div class="link-text">
              <span class="link-title">解锁高级版</span>
              <span class="link-desc">获取更多功能</span>
            </div>
          </a>
          <a
            href="https://dev.st-cardplus-1kl.pages.dev/"
            target="_blank"
            class="link-item dev-test"
          >
            <Icon
              icon="material-symbols:build-circle-outline"
              width="28"
              height="28"
            />
            <div class="link-text">
              <span class="link-title">滚动测试版</span>
              <span class="link-desc">抢先体验新功能</span>
            </div>
          </a>
        </template>
      </div>
    </div>

    <!-- 更新日志卡片 -->
    <div class="changelog-card">
      <div class="changelog-header">
        <h2 class="section-title">更新日志</h2>
        <div class="branch-selector">
          <span class="branch-label">分支:</span>
          <el-select
            v-model="selectedBranch"
            placeholder="选择分支"
            size="small"
            class="branch-select"
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

      <div class="commits-list">
        <div
          v-for="(log, index) in gitLogs"
          :key="index"
          class="commit-item"
          @click="log.expanded = !log.expanded"
        >
          <div class="commit-main">
            <span class="commit-message">{{ log.message }}</span>
            <div class="commit-meta">
              <a
                :href="log.html_url"
                target="_blank"
                class="commit-hash"
                @click.stop
              >
                {{ log.sha.substring(0, 7) }}
              </a>
              <span class="commit-date">{{ new Date(log.date).toLocaleDateString() }}</span>
            </div>
          </div>
          <transition name="expand">
            <div
              v-if="log.expanded"
              class="commit-details"
            >
              <pre>{{ log.fullMessage }}</pre>
            </div>
          </transition>
        </div>
      </div>

      <button
        @click="() => loadMore()"
        :disabled="!hasMore || loading"
        class="load-more-btn"
        :class="{ 'is-loading': loading }"
      >
        <Icon
          v-if="loading"
          icon="eos-icons:loading"
          width="18"
          height="18"
          class="loading-icon"
        />
        <span>{{ loading ? '加载中...' : hasMore ? '加载更多' : '没有更多了' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import SystemBanner from '@/components/SystemBanner.vue';
import { Icon } from '@iconify/vue';
import { ElMessage, ElOption, ElSelect } from 'element-plus';
import { computed, onMounted, ref, watch } from 'vue';

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
    const commits: Commit[] = await response.json();

    if (commits.length < 10) {
      hasMore.value = false;
    }

    const newLogs = commits.map((commit) => {
      const lines = commit.commit.message.split('\n');
      return {
        sha: commit.sha,
        message: lines[0],
        fullMessage: commit.commit.message,
        date: commit.commit.author.date,
        html_url: commit.html_url,
        expanded: false,
      };
    });

    gitLogs.value = [...gitLogs.value, ...newLogs];
    page.value++;

    // 成功反馈
    if (!isBranchChange && newLogs.length > 0) {
      ElMessage.success(`已加载 ${newLogs.length} 条记录`);
    }
  } catch (error) {
    console.error('Failed to fetch git logs:', error);
    ElMessage.error('加载失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const fetchBranches = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/awaae001/st_cardplus/branches');
    branches.value = await response.json();
    if (branches.value.length > 0) {
      selectedBranch.value = branches.value.find((b: any) => b.name === 'main')?.name || branches.value[0].name;
    }
  } catch (error) {
    console.error('Failed to fetch branches:', error);
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
@reference "tailwindcss";

.about-page {
  @apply p-4 md:p-6 mx-auto max-w-3xl space-y-4;
}

/* 头部英雄卡片 */
.hero-card {
  @apply rounded-2xl p-6 md:p-8;
  background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, var(--el-color-primary-light-9) 100%);
  border: 1px solid var(--el-color-primary-light-7);
}

.hero-content {
  @apply flex flex-col md:flex-row items-center gap-5;
}

.hero-logo {
  @apply w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-lg;
}

.hero-text {
  @apply text-center md:text-left;
}

.hero-title {
  @apply text-2xl md:text-3xl font-bold m-0 flex items-center justify-center md:justify-start gap-2;
  color: var(--el-text-color-primary);
}

.dev-badge {
  @apply text-xs px-2 py-0.5 rounded-full font-medium;
  background: var(--el-color-warning);
  color: white;
}

.hero-description {
  @apply text-base m-0 mt-2;
  color: var(--el-text-color-secondary);
}

.hero-version {
  @apply text-sm m-0 mt-2;
  color: var(--el-text-color-regular);
}

.version-tag {
  @apply ml-1 opacity-60;
}

/* 链接卡片 */
.links-card {
  @apply rounded-xl p-5;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.section-title {
  @apply text-lg font-semibold m-0 mb-4;
  color: var(--el-text-color-primary);
}

.links-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-3;
}

.link-item {
  @apply flex items-center gap-3 p-4 rounded-xl no-underline transition-all duration-200;
  border: 1px solid var(--el-border-color-lighter);
}

.link-item:hover {
  @apply transform -translate-y-0.5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.link-item.github {
  background: linear-gradient(135deg, #24292e 0%, #444d56 100%);
  color: white;
  border-color: transparent;
}

.link-item.discord {
  background: linear-gradient(135deg, #5865f2 0%, #7289da 100%);
  color: white;
  border-color: transparent;
}

.link-item.pro {
  background: linear-gradient(135deg, #37b466 0%, #4ade80 100%);
  color: white;
  border-color: transparent;
}

.link-item.dev-test {
  background: linear-gradient(135deg, #dac44c 0%, #f0e68c 100%);
  color: #333;
  border-color: transparent;
}

.link-text {
  @apply flex flex-col;
}

.link-title {
  @apply font-medium text-sm;
}

.link-desc {
  @apply text-xs opacity-80;
}

/* 更新日志卡片 */
.changelog-card {
  @apply rounded-xl p-5;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.changelog-header {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4;
}

.branch-selector {
  @apply flex items-center gap-2;
}

.branch-label {
  @apply text-sm;
  color: var(--el-text-color-secondary);
}

.branch-select {
  @apply w-40;
}

.commits-list {
  @apply space-y-2 max-h-[50vh] overflow-y-auto pr-1;
}

.commit-item {
  @apply p-3 rounded-lg cursor-pointer transition-colors;
  background: var(--el-fill-color-light);
}

.commit-item:hover {
  background: var(--el-fill-color);
}

.commit-main {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2;
}

.commit-message {
  @apply font-medium text-sm flex-1;
  color: var(--el-text-color-primary);
}

.commit-meta {
  @apply flex items-center gap-3 text-xs;
  color: var(--el-text-color-secondary);
}

.commit-hash {
  @apply font-mono px-1.5 py-0.5 rounded;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  text-decoration: none;
}

.commit-hash:hover {
  text-decoration: underline;
}

.commit-date {
  @apply whitespace-nowrap;
}

.commit-details {
  @apply mt-3 p-3 rounded-lg;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.commit-details pre {
  @apply m-0 text-xs whitespace-pre-wrap;
  color: var(--el-text-color-regular);
}

.load-more-btn {
  @apply w-full mt-4 py-2.5 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  border: 1px solid var(--el-border-color);
}

.load-more-btn:hover:not(:disabled) {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-7);
}

.load-more-btn.is-loading {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-7);
}

.load-more-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.loading-icon {
  @apply animate-spin;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
