<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-bold mb-4">世界书编辑器</h1>

    <!-- 基本信息 -->
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-2">基本信息</h2>
      <el-form :model="form" label-width="120px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入世界名称" />
        </el-form-item>
        <el-form-item label="所属空间">
          <el-input v-model="form.space" placeholder="请输入所属空间" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 关键词 -->
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-2">关键词（每行一条）</h2>
      <el-input
        v-model="form.keywords"
        type="textarea"
        :rows="3"
        placeholder="请输入关键词"
      />
    </el-card>

    <!-- 介绍 -->
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-2">介绍（每行一段）</h2>
      <el-input
        v-model="form.info"
        type="textarea"
        :rows="4"
        placeholder="请输入介绍"
      />
    </el-card>

    <!-- 地标 -->
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-2">地标</h2>
      <div v-for="(landmark, index) in form.landmarks" :key="index" class="mb-2">
        <el-input 
          v-model="form.landmarks[index]" 
          :placeholder="`地标 #${index + 1}`" 
          @change="ElMessage.success(`已更新地标: ${landmark}`)"
        />
      </div>
      <el-button type="primary" @click="addLandmark">+ 添加地标</el-button>
    </el-card>

    <!-- 势力 -->
    <el-card class="mb-4">
      <h2 class="text-xl font-semibold mb-2">势力</h2>
      <div v-for="(force, index) in form.forces" :key="index" class="mb-4">
        <el-input v-model="force.name" placeholder="势力名称" class="mb-2" />
        <el-input
          v-model="force.members"
          type="textarea"
          :rows="2"
          placeholder="成员（每行一个）"
          class="mb-2"
        />
        <el-input
          v-model="force.description"
          type="textarea"
          :rows="2"
          placeholder="势力描述"
          class="mb-2"
        />
        <el-button type="danger" @click="removeForce(index)">删除势力</el-button>
      </div>
      <el-button type="primary" @click="addForce">+ 添加势力</el-button>
    </el-card>

    <!-- 操作按钮 -->
    <div class="flex gap-4">
      <el-button type="primary" @click="saveWorld">保存世界书</el-button>
      <el-button type="success" @click="loadWorld">加载世界书</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { saveAs } from 'file-saver'

interface Force {
  name: string
  members: string
  description: string
}

interface WorldForm {
  name: string
  space: string
  keywords: string
  info: string
  landmarks: string[]
  forces: Force[]
}

const form = ref<WorldForm>({
  name: '',
  space: '',
  keywords: '',
  info: '',
  landmarks: [],
  forces: []
})

const addLandmark = () => {
  form.value.landmarks.push('')
  ElMessage.success('已添加新地标')
}

const addForce = () => {
  form.value.forces.push({
    name: '',
    members: '',
    description: ''
  })
}

const removeForce = (index: number) => {
  form.value.forces.splice(index, 1)
}

const saveWorld = async () => {
  try {
    const jsonData = JSON.stringify(form.value, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    saveAs(blob, 'world.json')
    ElMessage.success('世界书保存成功！')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const loadWorld = async () => {
  try {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          form.value = JSON.parse(content)
          ElMessage.success('世界书加载成功！')
        }
        reader.readAsText(file)
      }
    }
    input.click()
  } catch (error) {
    ElMessage.error('加载失败')
  }
}
defineExpose({
  saveWorld,
  loadWorld
})
</script>

<style scoped>
/* 使用 Tailwind CSS 进行样式控制 */
</style>
