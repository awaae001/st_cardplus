<template>
  <div class="main-container">
    <WelcomePage v-if="currentPage === 'welcome'" />
    <WorldEditor v-if="currentPage === 'world'" ref="worldEditorRef" />
    <CharacterCardEditor v-if="currentPage === 'character'" ref="characterEditorRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WorldEditor from './WorldEditor.vue'
import CharacterCardEditor from './CharacterCardEditor.vue'
import WelcomePage from './WelcomePage.vue'

const currentPage = ref<'world' | 'character' | 'welcome'>('welcome')
const characterEditorRef = ref<InstanceType<typeof CharacterCardEditor>>()
const worldEditorRef = ref<InstanceType<typeof WorldEditor>>()

function showPage(page: 'world' | 'character' | 'welcome') {
  currentPage.value = page
}

async function saveCharacterCard() {
  await characterEditorRef.value?.saveCharacterCard()
}

async function loadCharacterCard() {
  await characterEditorRef.value?.loadCharacterCard()
}

async function saveWorld() {
  await worldEditorRef.value?.saveWorld()
}

async function loadWorld() {
  await worldEditorRef.value?.loadWorld()
}

defineExpose({
  showPage,
  currentPage,
  saveCharacterCard,
  loadCharacterCard,
  saveWorld,
  loadWorld
})
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
}
</style>
