<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <!-- Title and Buttons -->
    <div id="tiltleMain">
      <h1 class="text-2xl font-bold">角色卡本地编辑</h1>
      <div class="btnSL">
        <el-button @click="loadData" type="primary">
          <Icon icon="material-symbols:folder-open-outline-sharp" width="18" height="18" style="margin-right: 4px;" />
          载入数据
        </el-button>
        <el-button @click="saveData" type="success">
          <Icon icon="material-symbols:file-save-outline" width="18" height="18" style="margin-right: 4px;" />
          保存数据
        </el-button>
        <el-button @click="resetData" plain>
          <Icon icon="material-symbols:cycle" width="18" height="18" style="margin-right: 4px;" />
          重置数据
        </el-button>
      </div>
    </div>

    <!-- Individual Cards -->
    <div class="section-container">
      <el-card style="width: 45%;">
        <h2 class="text-xl font-semibold mb-4">基本信息</h2>
        <span style="margin:8px;">角色名称
          <el-input v-model="characterData.name" placeholder="请输入角色名称" /></span>
        <span style="margin:8px;">头像
          <el-input v-model="characterData.avatar" disabled placeholder="请输入头像地址" /></span>
        <span style="margin:8px;">第一条消息</span>
        <el-input type="textarea" v-model="characterData.first_mes" :rows="6" placeholder="请输入第一条消息" />
      </el-card>
      <el-card style="width: 55%;">
        <div class="title-Btn-add">
          <h2 class="text-xl font-semibold mb-4">角色描述</h2>
          <el-button @click="OpenCharacterDescription" type="primary" style="margin-left: 16px;">
            <Icon icon="material-symbols:file-open-outline" width="18" height="18" style="margin-right: 4px;" />
            打开导入
          </el-button>
        </div>
        <el-input type="textarea" v-model="characterData.description" :rows="12" placeholder="请输入角色描述" />
      </el-card>
    </div>


    <div class="section-container">
      <el-card class="mb-4" style="width: 45%;">
        <div class="title-Btn-add">
          <h2 class="text-xl font-semibold mb-4">备用问候语</h2>
          <el-button @click="addGreeting" type="primary" style="margin-left: 16px;">
            <Icon icon="material-symbols:add-comment-outline" width="18" height="18" style="margin-right: 4px;" />
            添加问候语
          </el-button>
        </div>
        <div v-for="(greeting, index) in characterData.data.alternate_greetings" :key="index" class="mb-2">
          <el-input type="textarea" v-model="characterData.data.alternate_greetings[index]" :rows="4"
            placeholder="请输入备用问候语（支持换行）">
            <template #append>
              <el-button @click="removeGreeting(index)" type="danger" :icon="Delete" />
            </template>
          </el-input>
        </div>
      </el-card>

      <el-card class="mb-4" style="width: 55%;">
        <div class="title-Btn-add">
          <h2 class="text-xl font-semibold mb-4">角色备注</h2>
          <el-button @click="handleFileUpload" type="primary" style="margin-left: 16px;">
            <Icon icon="material-symbols:file-open-outline" width="18" height="18" style="margin-right: 4px;" />
            打开导入
          </el-button>
        </div>
        <div style="margin-bottom: 8px;">
          <span>备注深度</span>
          <el-input-number v-model="characterData.data.extensions.depth_prompt.depth" :min="0"
            style="margin-left: 8px;" />
        </div>
        <el-input type="textarea" v-model="characterData.data.extensions.depth_prompt.prompt" :rows="5"
          placeholder="请输入角色备注" />
        <div class="flex items-center gap-4">
          <div>
            <span style="
          display: flex;
          align-items: center;
          margin-top: 8px;
          ">角色
              <el-select v-model="characterData.data.extensions.depth_prompt.role" placeholder="请选择角色" style="
              width: 50%;
              margin-left: 8px;
              ">
                <el-option label="系统 ⚙️ | System" value="system" />
                <el-option label="用户 👤 | User" value="user" />
                <el-option label="助手 🤖 | Assistant" value="assistant" />
              </el-select>
            </span>
          </div>
        </div>
      </el-card>
    </div>

    <div style="margin: 8px;"></div>

    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-4">个性设定</h2>
      <el-input type="textarea" v-model="characterData.personality" :rows="3" placeholder="请输入个性设定" />
    </el-card>

    <div style="margin: 8px;"></div>

    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-4">情景设定</h2>
      <el-input type="textarea" v-model="characterData.scenario" :rows="3" placeholder="请输入情景设定（可选）" />
    </el-card>

    <div style="margin: 8px;"></div>

    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-4"> 对话示例</h2>
      <el-input type="textarea" v-model="characterData.mes_example" :rows="3" placeholder="请输入对话示例" />
    </el-card>

    <div style="margin: 8px;"></div>

    <div class="section-container">
      <el-card class="mb-4" style="width: 50%;">
        <h2 class="text-xl font-semibold mb-4">其他设置</h2>
        <span>发言频率</span>
        <el-slider v-model="characterData.talkativeness" :min="0" :max="1" :step="0.1" show-input />
        <span>是否收藏</span>
        <el-switch v-model="characterData.fav" />
      </el-card>

      <div style="margin: 8px;"></div>

      <el-card class="mb-4" style="width: 50%;">
        <h2 class="text-xl font-semibold mb-4">标签设置</h2>
        <el-select v-model="characterData.tags" multiple allow-create disabled filterable placeholder="未完成逻辑"
          class="w-full" />
      </el-card>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
// import { Delete } from '@element-plus/icons-vue'
import { Icon } from "@iconify/vue";

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

const loadData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
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
    margin-right: 48px;
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
  margin-right: 48px;
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
    margin-right: 48px;
    flex-direction: row;
  }
}
</style>
