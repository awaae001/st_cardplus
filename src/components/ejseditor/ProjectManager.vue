<template>
  <div class="project-manager">
    <!-- 项目选择和基本操作 -->
    <div class="project-selector">
      <div class="selector-section">
        <label class="selector-label">当前项目</label>
        <el-select
          :model-value="store.currentProjectId"
          @change="handleProjectChange"
          placeholder="选择项目"
          class="project-select"
          style="width: 100%"
        >
          <el-option
            v-for="project in store.projects"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          >
            <div class="project-option">
              <span class="project-name">{{ project.name }}</span>
              <span class="project-date">{{ formatDate(project.updatedAt) }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      
      <div class="action-buttons">
        <el-button 
          :icon="Plus" 
          size="small" 
          @click="handleCreateProject"
          type="primary"
          style="width: 100%"
        >
          新建项目
        </el-button>
        <el-button 
          :icon="Setting" 
          size="small" 
          @click="showProjectDialog = true"
          :disabled="!store.currentProjectId"
          style="width: 100%"
        >
          项目管理
        </el-button>
      </div>
    </div>

    <!-- 当前项目信息显示 -->
    <div v-if="store.currentProject" class="project-info">
      <div class="project-title">
        <h4>{{ store.currentProject.name }}</h4>
        <el-tag size="small" type="info">
          {{ store.stages.length }} 个阶段
        </el-tag>
      </div>
      <div class="project-meta">
        <span>创建于: {{ formatDate(store.currentProject.createdAt) }}</span>
        <span>更新于: {{ formatDate(store.currentProject.updatedAt) }}</span>
      </div>
    </div>

    <!-- 项目管理对话框 -->
    <el-dialog
      v-model="showProjectDialog"
      title="项目管理"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="project-management">
        <!-- 当前项目编辑 -->
        <div v-if="store.currentProject" class="current-project-edit">
          <h5>当前项目</h5>
          <el-form :model="currentProjectForm" label-width="80px">
            <el-form-item label="项目名称">
              <el-input
                v-model="currentProjectForm.name"
                placeholder="输入项目名称"
                @blur="handleRenameCurrentProject"
              />
            </el-form-item>
            <el-form-item label="创建时间">
              <span>{{ formatDate(store.currentProject.createdAt) }}</span>
            </el-form-item>
            <el-form-item label="更新时间">
              <span>{{ formatDate(store.currentProject.updatedAt) }}</span>
            </el-form-item>
            <el-form-item>
              <el-button 
                type="danger" 
                @click="handleDeleteCurrentProject"
                :disabled="store.projects.length <= 1"
              >
                删除当前项目
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-divider />

        <!-- 所有项目列表 -->
        <div class="all-projects">
          <h5>所有项目</h5>
          <el-table :data="store.projects" style="width: 100%">
            <el-table-column prop="name" label="项目名称" min-width="120">
              <template #default="scope">
                <div class="project-name-cell">
                  <span>{{ scope.row.name }}</span>
                  <el-tag 
                    v-if="scope.row.id === store.currentProjectId" 
                    size="small" 
                    type="primary"
                  >
                    当前
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.updatedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button-group size="small">
                  <el-button
                    v-if="scope.row.id !== store.currentProjectId"
                    @click="handleSwitchProject(scope.row.id)"
                    size="small"
                  >
                    切换
                  </el-button>
                  <el-button
                    type="danger"
                    @click="handleDeleteProject(scope.row.id)"
                    :disabled="store.projects.length <= 1"
                    size="small"
                  >
                    删除
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="showProjectDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Setting } from '@element-plus/icons-vue'
import { useEjsEditorStore } from '@/stores/ejsEditor'

const store = useEjsEditorStore()
const showProjectDialog = ref(false)

// 当前项目编辑表单
const currentProjectForm = ref({
  name: ''
})

// 监听当前项目变化，更新表单
watch(
  () => store.currentProject,
  (project) => {
    if (project) {
      currentProjectForm.value.name = project.name
    }
  },
  { immediate: true }
)

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理项目切换
function handleProjectChange(projectId: string) {
  if (projectId && projectId !== store.currentProjectId) {
    handleSwitchProject(projectId)
  }
}

// 创建新项目
async function handleCreateProject() {
  try {
    const { value: projectName } = await ElMessageBox.prompt(
      '请输入新项目的名称',
      '新建项目',
      {
        inputPlaceholder: '项目名称...',
        inputValidator: (value) => {
          if (!value || value.trim().length === 0) {
            return '项目名称不能为空'
          }
          if (store.projects.some(p => p.name === value.trim())) {
            return '项目名称已存在'
          }
          return true
        }
      }
    )

    if (projectName) {
      store.createProject(projectName.trim())
      ElMessage.success('项目创建成功')
    }
  } catch {
    // 用户取消
  }
}

// 切换项目
async function handleSwitchProject(projectId: string) {
  try {
    await ElMessageBox.confirm(
      '切换项目会保存当前项目的更改，确定继续吗？',
      '确认切换项目',
      {
        type: 'info'
      }
    )
    
    store.switchProject(projectId)
    ElMessage.success('项目切换成功')
  } catch {
    // 用户取消
  }
}

// 重命名当前项目
function handleRenameCurrentProject() {
  if (store.currentProject && currentProjectForm.value.name !== store.currentProject.name) {
    const newName = currentProjectForm.value.name.trim()
    if (newName) {
      // 检查名称是否重复
      const isDuplicate = store.projects.some(
        p => p.id !== store.currentProjectId && p.name === newName
      )
      
      if (isDuplicate) {
        ElMessage.error('项目名称已存在')
        currentProjectForm.value.name = store.currentProject.name
        return
      }
      
      store.renameProject(store.currentProjectId, newName)
      ElMessage.success('项目名称已更新')
    } else {
      currentProjectForm.value.name = store.currentProject.name
    }
  }
}

// 删除当前项目
async function handleDeleteCurrentProject() {
  if (!store.currentProject) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${store.currentProject.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning'
      }
    )
    
    store.deleteProject(store.currentProjectId)
    ElMessage.success('项目已删除')
    showProjectDialog.value = false
  } catch {
    // 用户取消
  }
}

// 删除指定项目
async function handleDeleteProject(projectId: string) {
  const project = store.projects.find(p => p.id === projectId)
  if (!project) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning'
      }
    )
    
    store.deleteProject(projectId)
    ElMessage.success('项目已删除')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.project-manager {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.project-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selector-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selector-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.project-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.project-date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.project-info {
  padding: 8px 12px;
  background: var(--el-fill-color-extra-light);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.project-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.project-title h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.project-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.project-management {
  max-height: 500px;
  overflow-y: auto;
}

.current-project-edit h5,
.all-projects h5 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.project-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .project-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>