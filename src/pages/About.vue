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
      bannerId="newYearSurvey2026"
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
        <!-- 加载骨架占位 -->
        <template v-if="gitLogs.length === 0 && loading">
          <div
            v-for="i in 6"
            :key="'skeleton-' + i"
            class="commit-skeleton"
          >
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-meta"></div>
          </div>
        </template>

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
.about-page {
  padding: 1rem;
  margin-left: auto;
  margin-right: auto;
  max-width: 48rem;
  width: 100%;
  min-height: 100%;
}

.about-page > * + * {
  margin-top: 1rem;
}

/* 头部英雄卡片 */
.hero-card {
  border-radius: 0.25rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, var(--el-color-primary-light-9) 100%);
  border: 1px solid var(--el-color-primary-light-7);
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.hero-logo {
  width: 5rem;
  height: 5rem;
  border-radius: 0.25rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.hero-text {
  text-align: center;
}

.hero-title {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--el-text-color-primary);
}

.dev-badge {
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
  background: var(--el-color-warning);
  color: white;
}

.hero-description {
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0;
  margin-top: 0.5rem;
  color: var(--el-text-color-secondary);
}

.hero-version {
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin: 0;
  margin-top: 0.5rem;
  color: var(--el-text-color-regular);
}

.version-tag {
  margin-left: 0.25rem;
  opacity: 0.6;
}

@media (min-width: 768px) {
  .about-page {
    padding: 1.5rem;
  }

  .hero-card {
    padding: 2rem;
  }

  .hero-content {
    flex-direction: row;
  }

  .hero-logo {
    width: 6rem;
    height: 6rem;
  }

  .hero-text {
    text-align: left;
  }

  .hero-title {
    font-size: 1.875rem;
    line-height: 2.25rem;
    justify-content: flex-start;
  }
}

/* 链接卡片 */
.links-card {
  border-radius: 0.25rem;
  padding: 1.25rem;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.section-title {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  margin: 0;
  margin-bottom: 1rem;
  color: var(--el-text-color-primary);
}

.links-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.link-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  text-decoration-line: none;
  transition-property: all;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--el-border-color-lighter);
}

.link-item:hover {
  transform: translateY(-0.125rem);
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
  display: flex;
  flex-direction: column;
}

.link-title {
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.link-desc {
  font-size: 0.75rem;
  line-height: 1rem;
  opacity: 0.8;
}

/* 更新日志卡片 */
.changelog-card {
  border-radius: 0.25rem;
  padding: 1.25rem;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.changelog-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .changelog-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.branch-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.branch-label {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--el-text-color-secondary);
}

.branch-select {
  width: 10rem;
}

.commits-list {
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 0.25rem;
  min-height: 320px;
}

.commits-list > * + * {
  margin-top: 0.5rem;
}

/* 加载骨架样式 */
.commit-skeleton {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: var(--el-fill-color-light);
}

.commit-skeleton > * + * {
  margin-top: 0.5rem;
}

.skeleton-line {
  border-radius: 0.25rem;
  background: linear-gradient(
    90deg,
    var(--el-fill-color) 25%,
    var(--el-fill-color-lighter) 50%,
    var(--el-fill-color) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}

.skeleton-title {
  height: 1rem;
  width: 75%;
}

.skeleton-meta {
  height: 0.75rem;
  width: 33.333333%;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.commit-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--el-fill-color-light);
}

.commit-item:hover {
  background: var(--el-fill-color);
}

.commit-main {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .commit-main {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.commit-message {
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  flex: 1 1 0%;
  color: var(--el-text-color-primary);
}

.commit-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--el-text-color-secondary);
}

.commit-hash {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  text-decoration: none;
}

.commit-hash:hover {
  text-decoration: underline;
}

.commit-date {
  white-space: nowrap;
}

.commit-details {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.commit-details pre {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1rem;
  white-space: pre-wrap;
  color: var(--el-text-color-regular);
}

.load-more-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  transition-property: all;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
