<template>
  <div class="main-container">
    <WorldEditor v-if="currentPage === 'world'" />
    <CharacterCardEditor v-if="currentPage === 'character'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WorldEditor from './WorldEditor.vue'
import CharacterCardEditor from './CharacterCardEditor.vue'

const currentPage = ref<'world' | 'character'>('character')

function showPage(page: 'world' | 'character') {
  currentPage.value = page
}

defineExpose({
  showPage
})
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
}
</style>
