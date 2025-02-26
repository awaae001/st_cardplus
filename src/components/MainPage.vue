<template>
  <div class="main-container">
    <div class="menu-bar">
      <div class="menu-item" @click="handleMenuClick('character')">角色卡编辑器</div>
      <div class="menu-item" @click="handleMenuClick('world')">世界书编辑器</div>
      <div class="menu-item" @click="handleSave">保存</div>
      <div class="menu-item" @click="handleLoad">加载</div>
    </div>
    <div class="content">
      <WelcomePage v-if="currentPage === 'welcome'" />
      <WorldEditor v-if="currentPage === 'world'" ref="worldEditorRef" />
      <CharacterCardEditor v-if="currentPage === 'character'" ref="characterEditorRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import WorldEditor from './WorldEditor.vue'
import CharacterCardEditor from './CharacterCardEditor.vue'
import WelcomePage from './WelcomePage.vue'

const currentPage = ref<'world' | 'character' | 'welcome'>('welcome')
const characterEditorRef = ref<InstanceType<typeof CharacterCardEditor>>()
const worldEditorRef = ref<InstanceType<typeof WorldEditor>>()

function showPage(page: 'world' | 'character' | 'welcome') {
  currentPage.value = page
}

function handleMenuClick(action: string) {
  switch (action) {
    case 'character':
    case 'world':
      showPage(action)
      break
  }
}

async function handleSave() {
  if (!currentPage.value) {
    ElMessage.warning('请先选择一个页面')
    return
  }

  switch (currentPage.value) {
    case 'character':
      await saveCharacterCard()
      break
    case 'world':
      await saveWorld()
      break
  }
}

async function handleLoad() {
  if (!currentPage.value) {
    ElMessage.warning('请先选择一个页面')
    return
  }

  switch (currentPage.value) {
    case 'character':
      await loadCharacterCard()
      break
    case 'world':
      await loadWorld()
      break
  }
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
  display: flex;
  flex-direction: column;
}

.menu-bar {
  height: 40px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #ddd;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 8px;
}

.menu-item:hover {
  background-color: #e0e0e0;
  border-radius: 4px;
}

.content {
  flex: 1;
  overflow: auto;
}
</style>
