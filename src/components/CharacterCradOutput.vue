<template>
  <div class="character-output-editor p-3 md:p-5 h-full flex flex-col
print:p-0 print:bg-white print:text-black">

    <header class="flex justify-between items-center mb-4 md:mb-6 print:hidden flex-shrink-0 px-1">
      <h1 class="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-100">
        角色数据导出器
      </h1>
      <Buttons
        @saveData="saveData"
        @loadData="loadData"
        @resetData="resetData"
        :safe-mode-level="appSettings.safeModeLevel"
        class="flex flex-wrap items-center gap-2 md:gap-3"
      />
    </header>

    <el-scrollbar class="flex-grow main-content-scrollbar" view-class="p-1 print:p-0">
      <div class="space-y-5 md:space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-stretch">
          <div :class="panelClasses">
            <BasicInfo :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full" />
          </div>
          <div :class="panelClasses">
            <CharacterDescription
              :form="form"
              @update:form="handleFormUpdate"
              @openCharacterDescriptionImport="openCharacterDescriptionImport"
              :safe-mode-level="appSettings.safeModeLevel"
              class="flex flex-col h-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-stretch">
          <div :class="panelClasses">
            <AlternateGreetings
              :form="form"
              @update:form="handleFormUpdate"
              class="flex flex-col h-full"
            />
          </div>
          <div :class="panelClasses">
            <CharacterNotes
              :form="form"
              @update:form="handleFormUpdate"
              @handleFileUpload="handleCharacterNotesUpload"
              :safe-mode-level="appSettings.safeModeLevel"
              class="flex flex-col h-full"
            />
          </div>
        </div>

        <div :class="panelClasses">
          <PersonalitySettings :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full" />
        </div>

        <div :class="panelClasses">
          <ScenarioSettings :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full" />
        </div>

        <div :class="panelClasses">
          <DialogueExample :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full" />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-stretch">
          <div :class="panelClasses">
            <OtherSettings :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full" />
          </div>
          <div :class="panelClasses">
            <TagSettings :form="form" @update:form="handleFormUpdate" class="flex flex-col h-full" />
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { ElMessage, ElScrollbar } from 'element-plus';
import { saveAs } from 'file-saver';
import { useAppSettingsStore} from '../stores/appSettings';
import { performSafeAction } from '@/utils/safeAction';

import {
  saveToLocalStorage as saveToLS,
  loadFromLocalStorage as loadFromLS,
  clearLocalStorage as clearLS,
  initAutoSave,
  clearAutoSave
} from '../utils/localStorageUtils';

import Buttons from './CharOutput/Buttons.vue';
import BasicInfo from './CharOutput/BasicInfo.vue';
import CharacterDescription from './CharOutput/CharacterDescription.vue';
import AlternateGreetings from './CharOutput/AlternateGreetings.vue';
import CharacterNotes from './CharOutput/CharacterNotes.vue';
import PersonalitySettings from './CharOutput/PersonalitySettings.vue';
import ScenarioSettings from './CharOutput/ScenarioSettings.vue';
import DialogueExample from './CharOutput/DialogueExample.vue';
import OtherSettings from './CharOutput/OtherSettings.vue';
import TagSettings from './CharOutput/TagSettings.vue';

interface CharacterOutputDataExtensions {
  talkativeness: string;
  fav: boolean;
  depth_prompt: {
    prompt: string;
    depth: number;
    role: string;
  };
  world: string;
  [key: string]: any;
}

interface CharacterOutputDataNested {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  tags: string[];
  alternate_greetings: string[];
  extensions: CharacterOutputDataExtensions;
  group_only_greetings: string[];
  character_book: any[];
  creator_notes: string;
  system_prompt: string;
  post_history_instructions: string;
  creator: string;
  character_version: string;
  [key: string]: any;
}

interface CharacterOutputForm {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  avatar: string;
  talkativeness: number;
  fav: boolean;
  tags: string[];
  spec: string;
  spec_version: string;
  data: CharacterOutputDataNested;
  creatorcomment: string;
  [key: string]: any;
}

const LOCAL_STORAGE_KEY = 'characterOutputData';
const appSettings = useAppSettingsStore();

const createDefaultForm = (): CharacterOutputForm => ({
  name: '', description: '', personality: '', scenario: '', first_mes: '', mes_example: '',
  avatar: 'none', talkativeness: 0.5, fav: false, tags: [],
  spec: 'chara_card_v3', spec_version: '3.0',
  data: {
    name: '', description: '', personality: '', scenario: '', first_mes: '', mes_example: '',
    tags: [], alternate_greetings: [],
    extensions: {
      talkativeness: '0.5', fav: false,
      depth_prompt: { prompt: '', depth: 4, role: 'system' },
      world: ''
    },
    group_only_greetings: [], character_book: [], creator_notes: '', system_prompt: '',
    post_history_instructions: '', creator: '', character_version: ''
  },
  creatorcomment: ''
});

const form = ref<CharacterOutputForm>(createDefaultForm());
let autoSaveTimer: number | null = null;

const panelClasses = computed(() => [
  'bg-white dark:bg-neutral-850', 'rounded-xl shadow-lg dark:shadow-black/30',
  'border border-neutral-200 dark:border-neutral-750', 'overflow-hidden',
  'transition-all duration-300 ease-out',
  'hover:shadow-xl dark:hover:shadow-black/50 hover:-translate-y-1'
]);

onMounted(() => {
  const loadedData = loadFromLS(LOCAL_STORAGE_KEY, processLoadedData);
  if (loadedData) { form.value = loadedData; }
  if (appSettings.isAutoSaveEnabled) {
    autoSaveTimer = initAutoSave(
      () => saveToLS(form.value, LOCAL_STORAGE_KEY),
      () => !!(form.value.name || form.value.data.name)
    );
  }
});

onBeforeUnmount(() => { if (autoSaveTimer) clearAutoSave(autoSaveTimer); });

watch(() => appSettings.isAutoSaveEnabled, (newValue) => {
  if (newValue) {
    if (!autoSaveTimer) {
      autoSaveTimer = initAutoSave(
        () => saveToLS(form.value, LOCAL_STORAGE_KEY),
        () => !!(form.value.name || form.value.data.name)
      );
      ElMessage.info('自动保存已开启');
    }
  } else {
    if (autoSaveTimer) {
      clearAutoSave(autoSaveTimer);
      autoSaveTimer = null;
      ElMessage.info('自动保存已关闭');
    }
  }
});

const handleFormUpdate = (updatedPart: Partial<CharacterOutputForm>) => {
  const newFormState = { ...form.value };
  for (const key in updatedPart) {
    if (Object.prototype.hasOwnProperty.call(updatedPart, key)) {
      if (key === 'data' && typeof updatedPart.data === 'object' && updatedPart.data !== null) {
        newFormState.data = { ...newFormState.data, ...updatedPart.data };
        if (typeof updatedPart.data.extensions === 'object' && updatedPart.data.extensions !== null) {
          newFormState.data.extensions = { ...newFormState.data.extensions, ...updatedPart.data.extensions };
        }
      } else {
        (newFormState as any)[key] = (updatedPart as any)[key];
      }
    }
  }
  form.value = newFormState;
};

const processLoadedData = (parsedData: any): CharacterOutputForm => {
  const defaultForm = createDefaultForm();
  let processed: CharacterOutputForm = JSON.parse(JSON.stringify(defaultForm));

  const mergeDeep = (target: any, source: any) => {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
          }
          mergeDeep(target[key], source[key]);
        } else if (source[key] !== undefined) {
          target[key] = source[key];
        }
      }
    }
  };

  mergeDeep(processed, parsedData);

  if (parsedData.talkativeness !== undefined) {
    processed.talkativeness = Number(parsedData.talkativeness) || 0.5;
    processed.data.extensions.talkativeness = String(processed.talkativeness);
  } else if (parsedData.data?.extensions?.talkativeness !== undefined) {
    processed.talkativeness = Number(parsedData.data.extensions.talkativeness) || 0.5;
    processed.data.extensions.talkativeness = String(processed.talkativeness);
  } else {
     processed.talkativeness = defaultForm.talkativeness;
     processed.data.extensions.talkativeness = defaultForm.data.extensions.talkativeness;
  }

  if (parsedData.fav !== undefined) {
    processed.fav = Boolean(parsedData.fav);
    processed.data.extensions.fav = processed.fav;
  } else if (parsedData.data?.extensions?.fav !== undefined) {
    processed.fav = Boolean(parsedData.data.extensions.fav);
    processed.data.extensions.fav = processed.fav;
  } else {
    processed.fav = defaultForm.fav;
    processed.data.extensions.fav = defaultForm.data.extensions.fav;
  }

  const fieldsToEnsureArray = ['tags', 'alternate_greetings', 'group_only_greetings', 'character_book'];
  fieldsToEnsureArray.forEach(field => {
    if (field === 'tags') {
      processed.tags = Array.isArray(parsedData.tags) ? parsedData.tags : (Array.isArray(parsedData.data?.tags) ? parsedData.data.tags : []);
      processed.data.tags = processed.tags;
    } else if (Object.prototype.hasOwnProperty.call(processed.data, field)) {
       (processed.data as any)[field] = Array.isArray(parsedData.data?.[field]) ? parsedData.data[field] : [];
    }
  });

  return processed;
};

const resetData = async () => {
  await performSafeAction(appSettings.safeModeLevel, '重置数据', '此操作将清除所有内容并删除自动保存', () => {
      clearLS(LOCAL_STORAGE_KEY);
      form.value = createDefaultForm();
  }).catch(err => { if(err !== 'cancel' && err !== 'forbidden') console.warn('重置数据操作未成功完成:', err);});
};

const saveData = () => {
  const dataToSave: CharacterOutputForm = JSON.parse(JSON.stringify(form.value));
  dataToSave.data.name = dataToSave.name;
  dataToSave.data.description = dataToSave.description;
  dataToSave.data.personality = dataToSave.personality;
  dataToSave.data.scenario = dataToSave.scenario;
  dataToSave.data.first_mes = dataToSave.first_mes;
  dataToSave.data.mes_example = dataToSave.mes_example;
  dataToSave.data.tags = Array.isArray(dataToSave.tags) ? dataToSave.tags : [];
  dataToSave.data.extensions.talkativeness = String(dataToSave.talkativeness);
  dataToSave.data.extensions.fav = dataToSave.fav;

  const jsonStr = JSON.stringify(dataToSave, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const filename = `character_export_${(dataToSave.name || 'untitled').replace(/[<>:"/\\|?*]+/g, '_')}_${Date.now()}.json`;
  saveAs(blob, filename);
  ElMessage.success('数据已保存为JSON文件');
};

const loadData = async () => {
    await performSafeAction(appSettings.safeModeLevel, '加载角色数据', '此操作将覆盖当前内容', async () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      await new Promise<void>((resolve, reject) => {
          input.onchange = async (event) => {
              const file = (event.target as HTMLInputElement).files?.[0];
              if (!file) { reject('cancel'); return; }
              try {
                  const content = await file.text();
                  if (!content.trim()) { throw new Error('文件内容为空。'); }
                  const parsedData = JSON.parse(content);
                  if (!parsedData || (typeof parsedData !== 'object')) { throw new Error('无效的角色数据文件格式。'); }
                  form.value = processLoadedData(parsedData);
                  saveToLS(form.value, LOCAL_STORAGE_KEY);
                  resolve();
              } catch (error) {
                  console.error("Load error:", error);
                  reject(error);
              }
          };
          input.addEventListener('cancel', () => reject('cancel'));
          input.click();
      });
   }).catch(err => { if(err !== 'cancel' && err !== 'forbidden') console.warn('加载角色数据操作未成功完成:', err);});
};

const handleCharacterNotesUpload = async () => {
  await performSafeAction(appSettings.safeModeLevel, '导入角色备注', '此操作将覆盖当前备注', async () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.txt,.md';
    await new Promise<void>((resolve, reject) => {
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]; if (!file) { reject('cancel'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            if (!ev.target?.result || typeof ev.target.result !== 'string') throw new Error('无法读取或文件内容无效。');
            if (!form.value.data) form.value.data = createDefaultForm().data;
            if (!form.value.data.extensions) form.value.data.extensions = createDefaultForm().data.extensions;
            if (!form.value.data.extensions.depth_prompt) form.value.data.extensions.depth_prompt = createDefaultForm().data.extensions.depth_prompt;
            form.value.data.extensions.depth_prompt.prompt = ev.target.result;
            saveToLS(form.value, LOCAL_STORAGE_KEY);
            resolve();
          } catch (error) {
            console.error("Notes upload error:", error);
            reject(error);
          }
        };
        reader.onerror = (e) => reject(new Error('文件读取出错'));
        reader.readAsText(file);
      };
      input.addEventListener('cancel', () => reject('cancel'));
      input.click();
    });
  }).catch(err => { if(err !== 'cancel' && err !== 'forbidden') console.warn('导入角色备注操作未成功完成:', err);});
};

const openCharacterDescriptionImport = async () => {
  await performSafeAction(appSettings.safeModeLevel, '导入角色描述', '此操作将覆盖当前描述', async () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.txt,.md';
     await new Promise<void>((resolve, reject) => {
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]; if (!file) { reject('cancel'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            if (!ev.target?.result || typeof ev.target.result !== 'string') throw new Error('无法读取或文件内容无效。');
            form.value.description = ev.target.result;
            if(form.value.data) form.value.data.description = ev.target.result;
            saveToLS(form.value, LOCAL_STORAGE_KEY);
            resolve();
          } catch (error) {
             console.error("Description import error:", error);
             reject(error);
          }
        };
        reader.onerror = (e) => reject(new Error('文件读取出错'));
        reader.readAsText(file);
      };
      input.addEventListener('cancel', () => reject('cancel'));
      input.click();
     });
  }).catch(err => { if(err !== 'cancel' && err !== 'forbidden') console.warn('导入角色描述操作未成功完成:', err);});
};
</script>

<style scoped>
:deep(.main-content-scrollbar .el-scrollbar__wrap) {}
:deep(.main-content-scrollbar .el-scrollbar__view) {}
</style>