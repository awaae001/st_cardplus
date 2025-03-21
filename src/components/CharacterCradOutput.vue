<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <Buttons @loadData="loadData" @saveData="saveData" @resetData="resetData" @importImage="importImage" />

    <!-- Individual Cards -->
    <div class="section-container">
      <BasicInfo :characterData="characterData" />
      <CharacterDescription :characterData="characterData" @openCharacterDescription="OpenCharacterDescription" />
    </div>

    <div class="section-container">
      <AlternateGreetings :characterData="characterData" @addGreeting="addGreeting" @removeGreeting="removeGreeting" />
      <CharacterNotes :characterData="characterData" @handleFileUpload="handleFileUpload" />
    </div>

    <div style="margin: 8px;"></div>

    <el-collapse v-model="activeCollapse">
      <el-collapse-item title="个性设定" name="personality">
        <PersonalitySettings :characterData="characterData" />
      </el-collapse-item>

      <el-collapse-item title="情景设定" name="scenario">
        <ScenarioSettings :characterData="characterData" />
      </el-collapse-item>

      <el-collapse-item title="对话示例" name="dialogue">
        <DialogueExample :characterData="characterData" />
      </el-collapse-item>

      <el-collapse-item title="世界书" name="worldbook">
        <WordBook :charWorldBook="CharWorldBook" @unbind="unbindWorldBook" @bind="bindWorldBook" />
      </el-collapse-item>
    </el-collapse>

    <div style="margin: 8px;"></div>

    <div class="section-container">
      <OtherSettings :characterData="characterData" />
      <TagSettings :characterData="characterData" />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Icon } from "@iconify/vue";
import ExifReader from 'exifreader';
import { Base64 } from 'js-base64';
import BasicInfo from './CharOutput/BasicInfo.vue'
import CharacterDescription from './CharOutput/CharacterDescription.vue'
import AlternateGreetings from './CharOutput/AlternateGreetings.vue'
import CharacterNotes from './CharOutput/CharacterNotes.vue'
import PersonalitySettings from './CharOutput/PersonalitySettings.vue'
import ScenarioSettings from './CharOutput/ScenarioSettings.vue'
import DialogueExample from './CharOutput/DialogueExample.vue'
import OtherSettings from './CharOutput/OtherSettings.vue'
import TagSettings from './CharOutput/TagSettings.vue'
import Buttons from './CharOutput/Buttons.vue'
import WordBook from './CharOutput/WordBook.vue'

const CharWorldBook = ref([])

// Initial data structure
const initialData = {
  name: '',
  description: '',
  personality: '',
  scenario: '',
  first_mes: '',
  mes_example: '',
  avatar: 'none',
  talkativeness: 0.5,
  fav: false,
  tags: [],
  spec: 'chara_card_v3',
  spec_version: '3.0',
  data: {
    name: '',
    description: '',
    personality: '',
    scenario: '',
    first_mes: '',
    mes_example: '',
    tags: [],
    alternate_greetings: [],
    extensions: {
      talkativeness: '0.5',
      fav: false,
      depth_prompt: {
        prompt: '',
        depth: 4,
        role: 'system'
      },
      world: ''
    },
    group_only_greetings: [],
    character_book: [],
    creator_notes: '',
    system_prompt: '',
    post_history_instructions: '',
    creator: '',
    character_version: ''
  },
  creatorcomment: ''
}

const characterData = ref({ ...initialData })

// Add a new alternate greeting
const addGreeting = () => {
  characterData.value.data.alternate_greetings.push('')
}

// Remove an alternate greeting
const removeGreeting = (index) => {
  characterData.value.data.alternate_greetings.splice(index, 1)
}

// Reset all data to initial state
const resetData = () => {
  characterData.value = { ...initialData }
  ElMessage.success('数据已重置')
}

const importImage = () => {
  console.log('接到导入请求……开始处理');
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const tags = ExifReader.load(arrayBuffer);
      console.log('EXIF Data:', tags);

      // 解码ccv3字段
      if (tags.ccv3?.value) {
        try {
          const decoded = Base64.decode(tags.ccv3.value);
          console.log('Decoded ccv3:', JSON.parse(decoded));

          // 暂存解码数据
          const decodedData = JSON.parse(decoded);
          CharWorldBook.value = decodedData.data.character_book || [];
          console.log('Decoded character_book:', CharWorldBook.value);

          // 发送到 loadData
          characterData.value = { ...initialData, ...decodedData };
          ElMessage.success('数据已成功加载');

          // 询问用户是否继续
          const shouldContinue = window.confirm('数据已成功加载，是否要保存为JSON文件？');
          if (!shouldContinue) {
            return; // 用户取消操作
          }

          const generateRandomNumber = () =>
            Math.floor(10000000 + Math.random() * 90000000).toString();
          const randomNumber = generateRandomNumber();
          console.log('Random Number:', randomNumber);

          // 创建带随机数的文件名
          const blob = new Blob([decoded], { type: 'application/json' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `character_card_${randomNumber}.json`; // 插入随机数
          link.click();

          // 释放对象URL
          URL.revokeObjectURL(link.href);
        } catch (error) {
          console.error('Failed to decode ccv3:', error);
        }
      }
    }
  };
  input.click();
};

// Updated save logic
const saveData = () => {
  // Synchronize top-level fields with nested data object
  const syncedData = {
    ...characterData.value,
    data: {
      ...characterData.value.data,
      name: characterData.value.name,
      description: characterData.value.description,
      personality: characterData.value.personality,
      scenario: characterData.value.scenario,
      first_mes: characterData.value.first_mes,
      mes_example: characterData.value.mes_example,
      tags: characterData.value.tags,
      extensions: {
        ...characterData.value.data.extensions,
        talkativeness: characterData.value.talkativeness.toString(),
        fav: characterData.value.fav
      }
    }
  }

  // Convert to JSON and trigger download
  const jsonStr = JSON.stringify(syncedData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `character_${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('数据已保存为JSON文件')
}

// 处理文件上传
const handleFileUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt,.md,.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        characterData.value.data.extensions.depth_prompt.prompt = e.target.result
        ElMessage.success('备注文件已上传并自动填充')
      } catch (error) {
        ElMessage.error('文件读取失败，请选择有效的文本文件')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

const OpenCharacterDescription = () => {
  console.log('接到导入唤起，开始处理');
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt,.md,.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        characterData.value.description = e.target.result
        ElMessage.success('角色描述文件已上传并自动填充')
      } catch (error) {
        ElMessage.error('文件读取失败，请选择有效的文本文件')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

const bindWorldBook = ({ data, fileName }) => {
  CharWorldBook.value = data;
  characterData.value.data.character_book = data;
  const worldName = data.character_book?.name || fileName;
  characterData.value.data.extensions.world = worldName;
  ElMessage.success('世界书已绑定');
}

const unbindWorldBook = () => {
  CharWorldBook.value = [];
  characterData.value.data.character_book = [];
  ElMessage.success('世界书已解绑');
}

const loadData = () => {
  const input = document.createElement('input')
  console.log('接到json导入唤起，开始处理');
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        // Ensure talkativeness is a number
        if (data.talkativeness) {
          data.talkativeness = parseFloat(data.talkativeness)
        } else if (data.data?.extensions?.talkativeness) {
          data.talkativeness = parseFloat(data.data.extensions.talkativeness)
        }
        characterData.value = { ...initialData, ...data } // Merge with initial data to ensure structure
        ElMessage.success('数据导入成功')
      } catch (error) {
        ElMessage.error('文件格式错误，请选择有效的JSON文件')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}
</script>

<style scoped>
.title-Btn-add {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

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
  }

  .section-container>* {
    min-width: auto;
  }

  .btnSL {
    display: flex;
    align-items: center;
    flex-direction: row;
  }
}

.container {
  max-width: 800px;
}

#tiltleMain {
  justify-content: space-between;
}

.btnSL {
  display: flex;
  align-items: center;
  flex-direction: row;
}

@media (min-width: 768px) {
  #tiltleMain {
    display: flex;
    justify-content: space-between;
  }

  .btnSL {
    display: flex;
    align-items: center;
    flex-direction: row;
  }
}
</style>
