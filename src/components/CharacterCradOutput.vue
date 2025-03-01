<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <!-- Title and Buttons -->
    <div id="tiltleMain">
      <h1 class="text-2xl font-bold">角色卡本地编辑</h1>
      <div class="btnSL">
        <el-button @click="loadData" type="primary">载入数据</el-button>
        <el-button @click="saveData" type="success">保存数据</el-button>
        <el-button @click="resetData" plain>重置数据</el-button>
      </div>
    </div>

    <!-- Individual Cards -->
    <div style="display: flex;">
      <el-card style="width: 45%;">
        <template #header>
          <span>基本信息</span>
        </template>
        <span>角色名称
          <el-input v-model="characterData.name" placeholder="请输入角色名称" /></span>
        <span>头像
          <el-input v-model="characterData.avatar" placeholder="请输入头像地址" /></span>
        <span>第一条消息</span>
        <el-input type="textarea" v-model="characterData.first_mes" :rows="6" placeholder="请输入第一条消息" />
      </el-card>

      <el-card style="width: 55%;">
        <template #header>
          <span>角色描述</span>
        </template>
        <el-input type="textarea" v-model="characterData.description" :rows="12" placeholder="请输入角色描述" />
      </el-card>
    </div>

    <el-card class="mb-4">
      <template #header>
        <span>备用问候语</span>
      </template>
      <div v-for="(greeting, index) in characterData.data.alternate_greetings" :key="index" class="mb-2">
        <el-input type="textarea" v-model="characterData.data.alternate_greetings[index]" :rows="3"
          placeholder="请输入备用问候语（支持换行）">
          <template #append>
            <el-button @click="removeGreeting(index)" type="danger" :icon="Delete" />
          </template>
        </el-input>
      </div>
      <el-button @click="addGreeting" type="primary" plain>添加问候语</el-button>
    </el-card>
    
    <el-card class="mb-4">
      <template #header>
        <span>个性设定</span>
      </template>
      <el-input type="textarea" v-model="characterData.personality" :rows="3" placeholder="请输入个性设定" />
    </el-card>

    <el-card class="mb-4">
      <template #header>
        <span>情景设定</span>
      </template>
      <el-input type="textarea" v-model="characterData.scenario" :rows="3" placeholder="请输入情景设定（可选）" />
    </el-card>

    <el-card class="mb-4">
      <template #header>
        <span>对话示例</span>
      </template>
      <el-input type="textarea" v-model="characterData.mes_example" :rows="3" placeholder="请输入对话示例" />
    </el-card>

    <el-card class="mb-4">
      <template #header>
        <span>发言频率</span>
      </template>
      <el-slider v-model="characterData.talkativeness" :min="0" :max="1" :step="0.1" show-input />
    </el-card>

    <el-card class="mb-4">
      <template #header>
        <span>是否收藏</span>
      </template>
      <el-switch v-model="characterData.fav" />
    </el-card>

    <el-card class="mb-4">
      <template #header>
        <span>标签</span>
      </template>
      <el-select v-model="characterData.tags" multiple allow-create filterable placeholder="请选择或输入标签" class="w-full" />
    </el-card>

    <el-card class="mb-4">
      <span>角色备注</span>
      <el-input type="textarea" v-model="characterData.data.extensions.depth_prompt.prompt" :rows="2"
        placeholder="请输入角色备注" />
      <span>备注深度</span>
      <el-input-number v-model="characterData.data.extensions.depth_prompt.depth" :min="0" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'

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

// Load data from a JSON file
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
.container {
  max-width: 800px;
}

#tiltleMain {
  display: flex;
  justify-content: space-between;
}

.btnSL {
  display: flex;
  align-items: center;
  margin-right: 48px;
}
</style>
