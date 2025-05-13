<template>
<div
    class="about-page-container p-3 md:p-5 h-full flex flex-col items-center"
  >
    <el-scrollbar class="w-full max-w-3xl flex-grow" view-class="p-1">
      <div class="space-y-6 md:space-y-8">

        <div class="content-panel">
          <div class="content-panel-body text-center py-6">
            <img 
              ref="appLogo"
              @click="handleLogoClick"
              src="@/image/logo.png" 
              alt="ST CardPlus Logo" 
              class="app-logo-interactive w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full shadow-md cursor-pointer transition-transform duration-500 ease-out"
              :class="{ 'animate-spin-once': logoSpinning }"
            />
            <h1 class="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-100 mb-2">
              关于 ST CardPlus
            </h1>
            <p class="text-sm md:text-base text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
              这是一个用于创建和管理 SillyTavern 角色卡的在线应用程序。
            </p>
            <div class="flex flex-col sm:flex-row justify-center items-center gap-3">
              <a 
                href="https://github.com/awaae001/st_cardplus" 
                target="_blank" 
                class="btn-primary-adv w-full sm:w-auto"
              >
                <Icon icon="mdi:github" class="mr-1.5 text-lg -ml-0.5" />
                GitHub 仓库
              </a>
              <button 
                @click="handleUnlockPremium"
                class="btn-success-adv w-full sm:w-auto"
              >
                <Icon icon="material-symbols:key-vertical-outline" class="mr-1.5 text-lg -ml-0.5" /> 
                解锁高级版
              </button>
            </div>
          </div>
        </div>

        <div class="content-panel">
          <div class="content-panel-header">
            <h2 class="content-panel-title flex items-center gap-2">
              <Icon icon="ph:info-light" class="text-xl text-accent-500 dark:text-accent-400" />
              版本与技术
            </h2>
          </div>
          <div class="content-panel-body">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <h3 class="form-label-adv !text-xs !mb-0.5">当前版本</h3>
                <p class="text-base font-medium text-neutral-700 dark:text-neutral-200">{{ appVersion }}</p>
              </div>
              <div>
                <h3 class="form-label-adv !text-xs !mb-0.5">核心技术栈</h3>
                <ul class="text-sm text-neutral-600 dark:text-neutral-300 space-y-1.5">
                  <li class="flex items-center">
                    <span class="icon-wrapper mr-2 flex-shrink-0">
                      <Icon icon="logos:vue" class="tech-logo-icon"/>
                    </span>
                    Vue 3
                  </li>
                  <li class="flex items-center">
                    <span class="icon-wrapper mr-2 flex-shrink-0">
                      <Icon icon="logos:vitejs" class="tech-logo-icon"/>
                    </span>
                    Vite
                  </li>
                  <li class="flex items-center">
                    <span class="icon-wrapper mr-2 flex-shrink-0">
                      <Icon icon="logos:typescript-icon" class="tech-logo-icon"/>
                    </span>
                    TypeScript
                  </li>
                  <li class="flex items-center">
                    <span class="icon-wrapper mr-2 flex-shrink-0">
                       <ElIcon :size="18" class="tech-brand-icon element-plus-logo-icon">
                        <IconElementPlus />
                      </ElIcon>
                    </span>
                    Element Plus
                  </li>
                  <li class="flex items-center">
                    <span class="icon-wrapper mr-2 flex-shrink-0">
                      <Icon icon="logos:tailwindcss-icon" class="tech-logo-icon"/>
                    </span>
                    Tailwind CSS
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="content-panel">
          <div class="content-panel-header">
            <h2 class="content-panel-title flex items-center gap-2">
              <Icon icon="ph:users-three-light" class="text-xl text-accent-500 dark:text-accent-400" />
              贡献与鸣谢
            </h2>
          </div>
          <div class="content-panel-body">
            <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
               访问我们的 GitHub 页面获取更多信息或贡献代码：
            </p>
            
            <div 
              ref="ghostContributorCard"
              @click="handleGhostClick"
              class="ghost-card my-4 p-3 rounded-lg border transition-all duration-300 ease-out cursor-pointer select-none relative overflow-hidden group hover:shadow-pink-400/30"
              :class="{ 
                'animate-shake': isShaking,
                'bg-pink-500/5 dark:bg-pink-900/20 border-pink-400/40 dark:border-pink-700/40 shadow-md shadow-pink-500/10': true 
              }"
              style="min-height: 70px;"
            >
              <div 
                ref="flyingContent"
                class="flying-content-wrapper flex items-center gap-3 relative z-10"
                :class="{ 
                  'animate-fly-inside-box': isFlyingAway,
                  'opacity-0 pointer-events-none': animationStage >= 1 
                }"
              >
                <Icon 
                  icon="ph:ghost-light" 
                  class="text-3xl transition-all duration-300 ease-out text-pink-400 group-hover:text-pink-300 group-hover:scale-110 flex-shrink-0"
                  :class="{'transform group-hover:-translate-y-0.5 group-hover:rotate-[8deg]': !isFlyingAway}"
                /> 
                <div class="text-container flex-grow">
                  <h4 class="font-semibold text-sm text-pink-600 dark:text-pink-300 group-hover:text-pink-500 dark:group-hover:text-pink-200">特别鸣谢：qwerty</h4>
                  <p class="text-xs text-pink-500/80 dark:text-pink-400/80 group-hover:text-pink-500/90 dark:group-hover:text-pink-300/90">
                    为项目注入了无尽的智慧和幽默感，让开发过程充满乐趣！
                  </p>
                </div>
              </div>

              <div 
                v-if="showFlyAwayMessage" 
                class="falling-message absolute inset-0 flex flex-col items-center justify-center text-center px-2 py-1 z-20"
                :class="{ 'animate-fall-in': showFlyAwayMessage }"
              >
                <p class="text-base font-semibold text-pink-700 dark:text-pink-200">
                  qwerty 去探索新宇宙啦！🚀
                </p>
                <p class="text-xs text-pink-500/70 dark:text-pink-400/70 mt-1">
                  (感谢陪伴!)
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <footer class="text-center py-8 mt-8 text-xs text-neutral-500 dark:text-neutral-600">
          开发版本：<b>{{ appVersion }}</b> <br />
          © {{ new Date().getFullYear() }} ST CardPlus.
        </footer>

      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { ElScrollbar, ElMessageBox, ElMessage, ElIcon } from 'element-plus';
import { Icon } from '@iconify/vue';
import { ElementPlus as IconElementPlus } from '@element-plus/icons-vue';

const appVersion = ref(import.meta.env.PACKAGE_VERSION || '未知版本');

const ghostContributorCard = ref<HTMLElement | null>(null);
const flyingContent = ref<HTMLElement | null>(null);
const clickCount = ref(0);
const MAX_SHAKES_BEFORE_FLY = 3;
const isShaking = ref(false);
const isFlyingAway = ref(false);
const showFlyAwayMessage = ref(false); 
const animationStage = ref(0); 

let shakeTimeoutId: number | undefined;
let flyAwayMessageTimeoutId: number | undefined;

const handleGhostClick = () => {
  if (isFlyingAway.value || showFlyAwayMessage.value) return;
  clickCount.value++;
  isShaking.value = true;
  if (shakeTimeoutId) clearTimeout(shakeTimeoutId);
  shakeTimeoutId = window.setTimeout(() => {
    isShaking.value = false;
  }, 500);
  if (clickCount.value > MAX_SHAKES_BEFORE_FLY) {
    isFlyingAway.value = true; 
    animationStage.value = 1; 
    if (flyAwayMessageTimeoutId) clearTimeout(flyAwayMessageTimeoutId);
    flyAwayMessageTimeoutId = window.setTimeout(() => {
      showFlyAwayMessage.value = true; 
      animationStage.value = 2; 
    }, 800); 
  }
};

const appLogo = ref<HTMLImageElement | null>(null);
const logoSpinning = ref(false);
let logoSpinTimeoutId: number | undefined;

const handleLogoClick = () => {
  if (logoSpinning.value) return; 
  logoSpinning.value = true;
  if (logoSpinTimeoutId) clearTimeout(logoSpinTimeoutId);
  logoSpinTimeoutId = window.setTimeout(() => {
    logoSpinning.value = false;
  }, 500); 
};

const premiumUnlockUrl = "https://autopatchcn.yuanshen.com/client_app/download/launcher/20241225164539_9oyGHAOXvzP4uaBW/mihoyo/yuanshen_setup_202412201736.exe";

const handleUnlockPremium = async () => {
  try {
    await ElMessageBox.confirm(
      '您确定要“解锁高级版”吗？',
      '解锁高级版确认',
      {
        confirmButtonText: '确定前往',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'app-dialog', 
        draggable: true,
      }
    );
    ElMessage.success('正在跳转至目标页面...');
    window.open(premiumUnlockUrl, '_blank');
  } catch (action) {
    if (action === 'cancel') {
      ElMessage.info('已取消操作。');
    }
  }
};

onBeforeUnmount(() => {
  if (shakeTimeoutId) clearTimeout(shakeTimeoutId);
  if (flyAwayMessageTimeoutId) clearTimeout(flyAwayMessageTimeoutId);
  if (logoSpinTimeoutId) clearTimeout(logoSpinTimeoutId);
});

</script>

<style>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem; 
  height: 1.25rem;
}

.icon-wrapper > .iconify,
.icon-wrapper > .el-icon {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}
.element-plus-logo-icon svg {
}

.tech-logo-icon, .tech-brand-icon {
}
</style>