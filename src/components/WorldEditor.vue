<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <div id="tiltleMain">
      <h1 class="text-2xl font-bold mb-4">地标编辑器</h1>
      <div class="btnSL">
        <el-button type="success" @click="loadWorld">
          <Icon icon="material-symbols:folder-open-outline-sharp" width="18" height="18" style="margin-right: 4px;" />
          加载 json
        </el-button>
        <el-button type="primary" @click="saveWorld">
          <Icon icon="material-symbols:file-save-outline-sharp" width="18" height="18" style="margin-right: 4px;" />
          保存 json
        </el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="section-container">
      <div>
        <el-card>
          <h2 class="text-xl font-semibold mb-2">基本信息</h2>
          <el-form :model="form" label-width="80px">
            <el-form-item label="名称">
              <el-input v-model="form.name" placeholder="请输入地标名称" />
            </el-form-item>
            <el-form-item label="所属空间">
              <el-input v-model="form.space" placeholder="请输入所属空间" />
            </el-form-item>
          </el-form>
        </el-card>
        <el-card style="margin-top: 10px;">
          <h2 class="text-xl font-semibold mb-2">关键词（每行一条）</h2>
          <el-input v-model="form.keywords" type="textarea" :rows="3" placeholder="请输入关键词" />
        </el-card>
      </div>
      <el-card class="mb-4" style="width: 75%;">
        <h2 class="text-xl font-semibold mb-2">介绍（每行一段）</h2>
        <el-input v-model="form.info" type="textarea" :rows="12" placeholder="请输入介绍" />
      </el-card>
    </div>

    <div style="margin: 4px;"></div>

    <!-- 地标 -->
    <el-card class="mb-4">
      <div class="title-Btn-add">
        <h2 class="text-xl font-semibold mb-4">地标</h2>
        <el-button type="primary" @click="addLandmark" class="w-full" style="margin-left: 16px;">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加地标（卡片）
        </el-button>
      </div>
      <el-row :gutter="16">
        <el-col v-for="(landmark, index) in form.landmarks" :key="index" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="mb-4 landmark-card">
            <el-input v-model="landmark.name" placeholder="地标名称" class="mb-2" />
            <el-input v-model="landmark.description" type="textarea" :rows="3" placeholder="地标介绍" class="mb-2" />
            <div style="margin: 4px;"></div>
            <el-button type="danger" @click="removeLandmark(index)" class="w-full">
              <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
              删除地标
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <div style="margin: 4px;"></div>
    <!-- 势力 -->
    <el-card class="mb-4">
      <div class="title-Btn-add">
        <h2 class="text-xl font-semibold mb-4">势力</h2>
        <el-button type="primary" @click="addForce" class="w-full" style="margin-left: 16px;">
          <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
            style="margin-right: 4px;" />
          添加势力（卡片）
        </el-button>
      </div>
      <el-row :gutter="16">
        <el-col v-for="(force, index) in form.forces" :key="index" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="mb-4 force-card">
            <el-input v-model="force.name" placeholder="势力名称" class="mb-2" />
            <el-input v-model="force.members" type="textarea" :rows="2" placeholder="成员（每行一个）" class="mb-2" />
            <el-input v-model="force.description" type="textarea" :rows="2" placeholder="势力描述" class="mb-2" />
            <div style="margin: 4px;"></div>
            <el-button type="danger" @click="removeForce(index)" class="w-full">
              <Icon icon="material-symbols:delete-outline" width="18" height="18" style="margin-right: 4px;" />
              删除势力
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { saveAs } from 'file-saver'
import { Icon } from "@iconify/vue";

interface Landmark {
  name: string
  description: string
}

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
  landmarks: Landmark[]
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
  form.value.landmarks.push({
    name: '',
    description: ''
  })
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

const removeLandmark = (index: number) => {
  form.value.landmarks.splice(index, 1)
  ElMessage.warning('已删除地标')
}

const saveWorld = async () => {
  try {
    const dataToSave = {
      ...form.value,
      keywords: form.value.keywords.split('\n').filter(line => line.trim() !== ''),
      info: form.value.info.split('\n').filter(line => line.trim() !== ''),
      forces: form.value.forces.map(force => ({
        ...force,
        members: force.members.split('\n').filter(line => line.trim() !== '')
      }))
    };
    const jsonData = JSON.stringify(dataToSave, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    saveAs(blob, `${form.value.name || 'world'}.json`)
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
          try {
            const content = e.target?.result as string
            const data = JSON.parse(content)
            
            // 验证并转换数据格式
            form.value = {
              name: data.name || '',
              space: data.space || '',
              keywords: data.keywords?.join('\n') || '',
              info: data.info?.join('\n') || '',
              landmarks: data.landmarks?.map((l: any) => ({
                name: l.name || '',
                description: l.description || ''
              })) || [],
              forces: data.forces?.map((f: any) => ({
                name: f.name || '',
                members: f.members?.join('\n') || '',
                description: f.description || ''
              })) || []
            }
            
            ElMessage.success('世界书加载成功！')
          } catch (error) {
            ElMessage.error('文件格式错误，请检查文件内容')
          }
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

.section-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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

.title-Btn-add {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
</style>
