<template>
  <div class="world-page">
    <component :is="activeEditor" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue';
import { getUseOldWorldEditor } from '@/utils/localStorageUtils';
import NewWorldEditor from '../components/WorldEditor.vue';
import OldWorldEditor from '../components/old/WorldEditor.vue';

const useOldEditor = ref(false);
const activeEditor = shallowRef(NewWorldEditor);

onMounted(() => {
  useOldEditor.value = getUseOldWorldEditor();
  activeEditor.value = useOldEditor.value ? OldWorldEditor : NewWorldEditor;
});
</script>

<style scoped>
.world-page {
  width: 100%;
  height: 100%;
}
</style>
