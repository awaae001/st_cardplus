<template>
  <div
    v-if="showBanner"
    class="system-banner"
  >
    <span class="banner-message">{{ bannerMessage }}</span>
    <div class="banner-actions">
      <a
        v-if="bannerLink"
        :href="bannerLink"
        target="_blank"
        rel="noopener noreferrer"
        class="banner-link"
      >
        {{ bannerLinkText }}
      </a>
      <button
        v-if="props.dismissible"
        class="banner-dismiss"
        @click="dismissBanner"
      >
        不再显示
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    dismissible?: boolean;
    bannerId: string;
    startDate: string;
    endDate: string;
    message: string;
    link?: string;
    linkText?: string;
  }>(),
  {
    dismissible: true,
    link: '',
    linkText: '了解更多',
  }
);

const showBanner = ref(false);
const bannerMessage = ref(props.message);
const bannerLink = ref(props.link);
const bannerLinkText = ref(props.linkText);

const BANNER_START_DATE = new Date(props.startDate);
const BANNER_END_DATE = new Date(props.endDate);

const DISMISSED_KEY = 'systemBannerDismissed';

onMounted(() => {
  const now = new Date();

  if (now >= BANNER_START_DATE && now < BANNER_END_DATE) {
    if (props.dismissible) {
      const dismissedBannersRaw = localStorage.getItem(DISMISSED_KEY);
      const dismissedBanners = dismissedBannersRaw ? JSON.parse(dismissedBannersRaw) : {};
      const dismissedTimestamp = dismissedBanners[props.bannerId];

      if (dismissedTimestamp) {
        const dismissedTime = new Date(parseInt(dismissedTimestamp, 10));
        if (dismissedTime < BANNER_START_DATE) {
          showBanner.value = true;
        }
      } else {
        showBanner.value = true;
      }
    } else {
      showBanner.value = true;
    }
  }
});

const dismissBanner = () => {
  showBanner.value = false;
  const dismissedBannersRaw = localStorage.getItem(DISMISSED_KEY);
  const dismissedBanners = dismissedBannersRaw ? JSON.parse(dismissedBannersRaw) : {};
  dismissedBanners[props.bannerId] = Date.now();
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissedBanners));
};
</script>

<style scoped>
@reference "tailwindcss";

.system-banner {
  @apply flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 text-sm;
  background-color: #f0f8ff;
  color: #333;
}

.banner-message {
  @apply text-center;
}

.banner-actions {
  @apply flex items-center gap-3 flex-shrink-0;
}

.banner-link {
  color: #007bff;
  text-decoration: none;
}

.banner-link:hover {
  text-decoration: underline;
}

.banner-dismiss {
  @apply px-2 py-0.5 rounded cursor-pointer;
  background: none;
  border: 1px solid #ccc;
}

.banner-dismiss:hover {
  background-color: #e9ecef;
}

/* 移动端优化 - 垂直堆叠 */
@media (max-width: 640px) {
  .system-banner {
    @apply flex-col gap-2 py-3;
  }

  .banner-message {
    @apply text-center w-full;
  }

  .banner-actions {
    @apply w-full justify-center;
  }
}

/* 暗色模式 */
:global(.dark) .system-banner {
  background-color: #1a365d;
  color: #e2e8f0;
}

:global(.dark) .banner-link {
  color: #63b3ed;
}

:global(.dark) .banner-dismiss {
  border-color: #4a5568;
  color: #a0aec0;
}

:global(.dark) .banner-dismiss:hover {
  background-color: #2d3748;
}
</style>
