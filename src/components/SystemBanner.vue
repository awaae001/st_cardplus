<template>
  <div
    v-if="showBanner"
    class="system-banner"
  >
    <span>{{ bannerMessage }}</span>
    <a
      v-if="bannerLink"
      :href="bannerLink"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ bannerLinkText }}
    </a>
    <button
      v-if="props.dismissible"
      @click="dismissBanner"
    >
      不再显示
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

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
.system-banner {
  background-color: #f0f8ff;
  color: #333;
  padding: 10px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.system-banner a {
  color: #007bff;
  text-decoration: none;
}

.system-banner button {
  background: none;
  border: 1px solid #ccc;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
