<template>
  <div v-if="showBanner" class="survey-banner">
    <span>我们有一个新年调查，去填写一下？</span>
    <a href="https://tally.so/r/kdeaLo" target="_blank" rel="noopener noreferrer">填写调查</a>
    <button v-if="props.dismissible" @click="dismissBanner">不再显示</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = withDefaults(defineProps<{
  dismissible?: boolean;
}>(), {
  dismissible: true,
});

const showBanner = ref(false);

onMounted(() => {
  if (props.dismissible) {
    if (!localStorage.getItem('surveyBannerDismissed')) {
      showBanner.value = true;
    }
  } else {
    showBanner.value = true;
  }
});

const dismissBanner = () => {
  showBanner.value = false;
  localStorage.setItem('surveyBannerDismissed', 'true');
};
</script>

<style scoped>
.survey-banner {
  background-color: #f0f8ff;
  color: #333;
  padding: 10px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.survey-banner a {
  color: #007bff;
  text-decoration: none;
}

.survey-banner button {
  background: none;
  border: 1px solid #ccc;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>