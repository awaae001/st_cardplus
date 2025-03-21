<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <div id="tiltleMain">
      <h1 class="text-2xl font-bold mb-4">地标编辑器</h1>
      <div class="btnSL">
        <div class="btnSL2">
          <el-button type="success" @click="loadWorld">
            <Icon icon="material-symbols:folder-open-outline-sharp" width="18" height="18" style="margin-right: 4px;" />
            加载 json
          </el-button>
          <el-button type="primary" @click="saveWorld">
            <Icon icon="material-symbols:file-save-outline-sharp" width="18" height="18" style="margin-right: 4px;" />
            保存 json
          </el-button>
          <el-button plain @click="resetForm">
            <Icon icon="material-symbols:refresh" width="18" height="18" style="margin-right: 4px;" />
            重置数据
          </el-button>
        </div>
        <div class="btnSL2">
          <el-button type="info" @click="copyToClipboard" title="复制到剪贴板">
            <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
          </el-button>
          <el-button type="warning" @click="showImportDialog" title="导入数据">
            <Icon icon="material-symbols:content-paste-go-rounded" width="18" height="18" />
          </el-button>
        </div>
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
        <div style="display: flex; gap: 8px;">
          <el-button type="primary" @click="addLandmark" class="w-full" style="margin-left: 16px;">
            <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
              style="margin-right: 4px;" />
            添加地标（卡片）
          </el-button>
          <el-button type="success" @click="exportLandmarks" title="导出地标">
            <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
          </el-button>
        </div>
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
        <div style="display: flex; gap: 8px;">
          <el-button type="primary" @click="addForce" class="w-full" style="margin-left: 16px;">
            <Icon icon="material-symbols:desktop-landscape-add-outline" width="18" height="18"
              style="margin-right: 4px;" />
            添加势力（卡片）
          </el-button>
          <el-button type="success" @click="exportForces" title="导出势力">
            <Icon icon="material-symbols:content-copy-outline" width="18" height="18" />
          </el-button>
        </div>
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
import { ElMessage, ElMessageBox } from 'element-plus'
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

const exportLandmarks = async () => {
  try {
    const landmarksData = form.value.landmarks;
    if (landmarksData.length === 0) {
      ElMessage.warning('没有可导出的地标');
      return;
    }
    await navigator.clipboard.writeText(JSON.stringify(landmarksData, null, 2));
    ElMessage.success('地标已复制到剪贴板！');
  } catch (error) {
    ElMessage.error("导出失败");
  }
};

const exportForces = async () => {
  try {
    const forcesData = form.value.forces;
    if (forcesData.length === 0) {
      ElMessage.warning('没有可导出的势力');
      return;
    }
    await navigator.clipboard.writeText(JSON.stringify(forcesData, null, 2));
    ElMessage.success('势力已复制到剪贴板！');
  } catch (error) {
    ElMessage.error("导出失败");
  }
};

const showImportDialog = () => {
  ElMessageBox.prompt('请输入要导入的JSON数据', '导入数据', {
    confirmButtonText: '导入',
    cancelButtonText: '取消',
    type: 'info',
    inputType: 'textarea',
    inputPlaceholder: '在此粘贴或输入JSON数据',
    inputValidator: (value) => {
      if (!value) {
        return '请输入要导入的数据';
      }
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return '请输入有效的JSON格式数据';
      }
    }
  }).then(({ value }) => {
    importFromClipboard(value);
  }).catch(() => {
    // 用户取消操作
  });
};

const importFromClipboard = async (data: string) => {
  try {
    const parsedData = JSON.parse(data);

    // 验证并转换数据格式
    form.value = {
      name: parsedData.name || '',
      space: parsedData.space || '',
      keywords: parsedData.keywords?.join('\n') || '',
      info: parsedData.info?.join('\n') || '',
      landmarks: parsedData.landmarks?.map((l: any) => ({
        name: l.name || '',
        description: l.description || ''
      })) || [],
      forces: parsedData.forces?.map((f: any) => ({
        name: f.name || '',
        members: f.members?.join('\n') || '',
        description: f.description || ''
      })) || []
    };

    ElMessage.success('从剪贴板导入成功！');
  } catch (error) {
    ElMessage.error(`导入失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};

const copyToClipboard = async () => {
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
    const jsonData = JSON.stringify(dataToSave, null, 2);
    await navigator.clipboard.writeText(jsonData);
    ElMessage.success('已复制到剪贴板！');
  } catch (error) {
    ElMessage.error("复制失败");
  }
};

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
    const generateRandomNumber = () => Math.floor(10000000 + Math.random() * 90000000);
    const jsonData = JSON.stringify(dataToSave, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    saveAs(blob, `${form.value.name || 'world'}_${generateRandomNumber()}.json`)
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
// 重置表单数据
const resetForm = () => {
  ElMessageBox.confirm('确定要重置所有数据吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    form.value = {
      name: '',
      space: '',
      keywords: '',
      info: '',
      landmarks: [],
      forces: []
    };
    ElMessage.success('数据已重置');
  }).catch(() => {
    ElMessage.info('取消重置');
  });
};

defineExpose({
  saveWorld,
  loadWorld,
  resetForm
})
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
  }

  .section-container>* {
    min-width: auto;
  }
}

#tiltleMain {
  justify-content: space-between;
}

.btnSL {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.btnSL2 {
  margin: 8px 4px 8px 0px;
  display: flex;
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

  .btnSL2 {
    display: flex;
  }

}
</style>
