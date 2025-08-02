<template>
  <div class="variable-config">
    <div class="header mb-4">
      <h3 class="text-lg font-semibold">
        变量配置
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        配置用于驱动模板的变量路径和显示名称
      </p>
    </div>

    <el-form 
      :model="formData" 
      :rules="rules" 
      ref="formRef"
      label-width="120px"
      @submit.prevent
    >
      <el-form-item label="变量路径" prop="path" required>
        <el-input
          v-model="formData.path"
          placeholder="例如: stat_data.理.好感度"
          @blur="handlePathBlur"
          @input="handlePathInput"
        >
          <template #prefix>
            <i class="iconify mdi:variable text-gray-400"></i>
          </template>
        </el-input>
        <div class="mt-1 text-xs text-gray-500">
          完整的变量路径，用点号分隔层级关系
        </div>
      </el-form-item>

      <el-form-item label="变量别名" prop="alias" required>
        <el-input
          v-model="formData.alias"
          placeholder="例如: 好感度"
          @input="handleAliasInput"
        >
          <template #prefix>
            <i class="iconify mdi:tag-text text-gray-400"></i>
          </template>
        </el-input>
        <div class="mt-1 text-xs text-gray-500">
          在编辑器中显示的简短名称，用于提高可读性
        </div>
      </el-form-item>

      <el-form-item label="变量描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="可选：描述这个变量的用途和作用范围"
          resize="none"
        />
      </el-form-item>
    </el-form>

    <!-- 预览卡片 -->
    <div v-if="formData.path && formData.alias" class="preview-card mt-6">
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          配置预览
        </h4>
        <div class="space-y-2 text-sm">
          <div class="flex items-center">
            <span class="text-gray-600 dark:text-gray-400 w-16">路径:</span>
            <code class="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
              {{ formData.path }}
            </code>
          </div>
          <div class="flex items-center">
            <span class="text-gray-600 dark:text-gray-400 w-16">别名:</span>
            <span class="font-medium text-blue-800 dark:text-blue-200">{{ formData.alias }}</span>
          </div>
          <div v-if="formData.description" class="flex items-start">
            <span class="text-gray-600 dark:text-gray-400 w-16">描述:</span>
            <span class="text-gray-700 dark:text-gray-300 flex-1">{{ formData.description }}</span>
          </div>
        </div>
        
        <!-- 生成的 EJS 代码预览 -->
        <div class="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <div class="text-xs text-blue-700 dark:text-blue-300 mb-1">生成的 EJS 代码片段:</div>
          <code class="block bg-blue-100 dark:bg-blue-800 p-2 rounded text-xs text-blue-800 dark:text-blue-200 font-mono">
            &lt;%_ const {{ formData.alias }} = getvar('{{ formData.path }}'); _%&gt;
          </code>
        </div>
      </div>
    </div>

    <!-- 常用模板 -->
    <div class="templates mt-6">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
        常用变量模板
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="template in templates"
          :key="template.id"
          class="template-card cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
          @click="applyTemplate(template)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-medium text-sm text-gray-900 dark:text-white">
                {{ template.alias }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ template.path }}
              </div>
              <div v-if="template.description" class="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {{ template.description }}
              </div>
            </div>
            <i class="iconify mdi:chevron-right text-gray-400"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 验证状态 -->
    <div v-if="validationStatus" class="validation-status mt-4">
      <el-alert
        :type="validationStatus.type"
        :title="validationStatus.title"
        :description="validationStatus.message"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElForm, ElFormItem, ElInput, ElAlert, ElMessage } from 'element-plus'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import type { VariableConfig } from './types'

// Store
const ejsStore = useEjsEditorStore()

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>()

// 表单数据
const formData = reactive<VariableConfig>({
  path: '',
  alias: '',
  description: ''
})

// 表单验证规则
const rules = {
  path: [
    { required: true, message: '请输入变量路径', trigger: 'blur' },
    { pattern: /^[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*(\.[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*)*$/, message: '变量路径格式不正确', trigger: 'blur' }
  ],
  alias: [
    { required: true, message: '请输入变量别名', trigger: 'blur' },
    { pattern: /^[a-zA-Z\u4e00-\u9fa5_][a-zA-Z0-9\u4e00-\u9fa5_]*$/, message: '别名只能包含字母、汉字、数字和下划线', trigger: 'blur' }
  ]
}

// 常用模板
const templates = ref([
  {
    id: 'affection',
    path: 'stat_data.角色名.好感度',
    alias: '好感度',
    description: '角色对玩家的好感度数值'
  },
  {
    id: 'trust',
    path: 'stat_data.角色名.信任度',
    alias: '信任度',
    description: '角色对玩家的信任程度'
  },
  {
    id: 'intimacy',
    path: 'stat_data.角色名.亲密度',
    alias: '亲密度',
    description: '角色与玩家的亲密关系程度'
  },
  {
    id: 'relationship',
    path: 'stat_data.角色名.关系状态',
    alias: '关系状态',
    description: '角色与玩家的当前关系类型'
  },
  {
    id: 'mood',
    path: 'stat_data.角色名.心情',
    alias: '心情',
    description: '角色当前的情绪状态'
  },
  {
    id: 'corruption',
    path: 'stat_data.角色名.堕落度',
    alias: '堕落度',
    description: '角色的堕落程度'
  }
])

// 验证状态
const validationStatus = computed(() => {
  if (!formData.path && !formData.alias) return null
  
  if (!formData.path) {
    return { type: 'warning' as const, title: '提示', message: '请填写变量路径' }
  }
  
  if (!formData.alias) {
    return { type: 'warning' as const, title: '提示', message: '请填写变量别名' }
  }
  
  if (!/^[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*(\.[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*)*$/.test(formData.path)) {
    return { type: 'error' as const, title: '路径格式错误', message: '变量路径必须使用点号分隔，且每一级都要符合变量命名规则' }
  }
  
  if (!/^[a-zA-Z\u4e00-\u9fa5_][a-zA-Z0-9\u4e00-\u9fa5_]*$/.test(formData.alias)) {
    return { type: 'error' as const, title: '别名格式错误', message: '别名只能包含字母、汉字、数字和下划线，且不能以数字开头' }
  }
  
  return { type: 'success' as const, title: '配置有效', message: '变量配置格式正确' }
})

// 初始化表单数据
const initializeFormData = () => {
  const config = ejsStore.variableConfig
  formData.path = config.path
  formData.alias = config.alias
  formData.description = config.description || ''
}

// 事件处理
const handlePathInput = () => {
  updateStore()
  // 如果路径改变且别名为空，尝试自动生成别名
  if (formData.path && !formData.alias) {
    autoGenerateAlias()
  }
}

const handleAliasInput = () => {
  updateStore()
}

const handlePathBlur = () => {
  formRef.value?.validateField('path')
}

const autoGenerateAlias = () => {
  if (!formData.path) return
  
  // 从路径中提取最后一级作为别名
  const parts = formData.path.split('.')
  const lastPart = parts[parts.length - 1]
  
  // 移除常见的前缀/后缀
  let alias = lastPart
    .replace(/^(stat_|data_|var_)/, '')
    .replace(/(_stat|_data|_var)$/, '')
  
  formData.alias = alias
  updateStore()
}

const applyTemplate = (template: typeof templates.value[0]) => {
  formData.path = template.path
  formData.alias = template.alias
  formData.description = template.description
  updateStore()
  
  ElMessage.success(`已应用模板: ${template.alias}`)
}

const updateStore = () => {
  ejsStore.updateVariableConfig({
    path: formData.path,
    alias: formData.alias,
    description: formData.description
  })
}

// 监听 store 变化
watch(
  () => ejsStore.variableConfig,
  (newConfig) => {
    if (newConfig.path !== formData.path || 
        newConfig.alias !== formData.alias || 
        newConfig.description !== formData.description) {
      initializeFormData()
    }
  },
  { deep: true }
)

// 组件挂载时初始化
initializeFormData()
</script>

<style scoped>
.variable-config {
  max-width: 42rem; /* max-w-2xl */
}

.template-card {
  transition: all 0.2s ease-in-out;
}

.template-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.iconify {
  width: 1em;
  height: 1em;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: rgb(55 65 81);
}

.dark :deep(.el-form-item__label) {
  color: rgb(209 213 219);
}

:deep(.el-input__wrapper) {
  transition: box-shadow 0.15s ease-in-out;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

:deep(.el-textarea__inner) {
  resize: none;
}

.preview-card {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>