<template>
  <div class="p-2 md:p-4 min-h-screen">
    <CharacterCardButtons @saveCharacterCard="saveCharacterCard" @loadCharacterCard="loadCharacterCard"
      @resetForm="resetForm" @copyToClipboard="copyToClipboard"
      @importFromClipboard="(data) => importFromClipboard(data)" />

    <div class="section-container flex-col md:flex-row">
      <BasicInfo :form="form" />
      <BackgroundStory :form="form" />
    </div>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="外观与服装" name="appearance">
        <AppearanceFeatures :form="form" />
        <div style="margin-top: 4px;"></div>
        <AttireSettings :form="form" :addAttire="addAttire" :removeAttire="removeAttire"
          :exportAttires="exportAttires" />
      </el-tab-pane>
      <el-tab-pane label="角色特质" name="traits">
        <PersonalityTraits :form="form" :addTrait="addTrait" :removeTrait="removeTrait" :exportTraits="exportTraits" />
        <div style="margin: 4px;"></div>
        <Relationships :form="form" :addRelationship="addRelationship" :removeRelationship="removeRelationship"
          :exportRelationships="exportRelationships" />
        <div style="margin: 4px;"></div>
        <SkillsEditor :form="form" :addSkill="addSkill" :removeSkill="removeSkill" :exportSkills="exportSkills" />
      </el-tab-pane>
      <el-tab-pane label="日常与笔记" name="notes">
        <LikesDislikesRoutine :form="form" />
        <div style="margin: 4px;"></div>
        <CharacterNotes :form="form" :addNote="addNote" :removeNote="removeNote" />
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CharacterCardButtons from './charcard/CharacterCardButtons.vue';
import BasicInfo from './charcard/BasicInfo.vue';
import BackgroundStory from './charcard/BackgroundStory.vue';
import AppearanceFeatures from './charcard/AppearanceFeatures.vue';
import AttireSettings from './charcard/AttireSettings.vue';
import PersonalityTraits from './charcard/PersonalityTraits.vue';
import Relationships from './charcard/Relationships.vue';
import LikesDislikesRoutine from './charcard/LikesDislikesRoutine.vue';
import SkillsEditor from './charcard/SkillsEditor.vue';
import CharacterNotes from './charcard/CharacterNotes.vue';

import { useCharacterCard } from '../composables/characterCard/useCharacterCard';
import { useCardDataHandler } from '../composables/characterCard/useCardDataHandler';
import { useCardSections } from '../composables/characterCard/useCardSections';
import { useCharacterCardLifecycle } from '../composables/characterCard/useCharacterCardLifecycle';

const activeTab = ref('appearance');

const { form } = useCharacterCard();
const {
  saveCharacterCard,
  loadCharacterCard,
  resetForm,
  copyToClipboard,
  importFromClipboard,
  processLoadedData,
} = useCardDataHandler(form);

const {
  addTrait,
  removeTrait,
  addSkill,
  removeSkill,
  addRelationship,
  removeRelationship,
  addNote,
  removeNote,
  addAttire,
  removeAttire,
  exportAttires,
  exportSkills,
  exportTraits,
  exportRelationships,
} = useCardSections(form.value);

useCharacterCardLifecycle(form, processLoadedData);


/**
 * 暴露组件方法
 * 使父组件可以访问这些方法
 */
defineExpose({
  saveCharacterCard,
  loadCharacterCard,
  resetForm,
  addAttire,
  removeAttire,
  exportAttires,
  copyToClipboard,
  importFromClipboard,
  exportSkills,
  exportTraits,
  exportRelationships
});
</script>

<style scoped>
/* 使用 Tailwind CSS 进行样式控制 */
.section-container {
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.section-container>* {
  flex: 1;
  min-width: 100%;
}

@media (min-width: 768px) {
  .section-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: flex-start;
  }

  .section-container>* {
    min-width: auto;
  }
}

.ps-text {
  font-style: italic;
  color: #373737;
  font-weight: 50;
}

.title-Btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.title-Btn-add {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.settings-tabs {
  margin-top: 20px;
}

:deep(.el-tabs__header) {
  margin: 0 0 25px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-tabs__item.is-active) {
  color: var(--el-color-primary);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--el-color-primary);
}
</style>
