<template>
  <div class="variable-panel">
    <div class="panel-content">
      <!-- 基础变量配置 -->
      <div class="section">
        <h4 class="section-title">基础配置</h4>
        <div class="form-grid">
          <div class="form-item">
            <label>变量路径</label>
            <el-input
              v-model="store.variablePath"
              placeholder="例如: 角色.狼蛛.好感度"
              clearable
            />
          </div>
          <div class="form-item">
            <label>变量别名</label>
            <el-input
              v-model="store.variableAlias"
              placeholder="例如: 好感度"
              clearable
            />
          </div>
        </div>
      </div>

      <!-- 变量定义 -->
      <div class="section">
        <div class="section-header">
          <h4 class="section-title">变量定义</h4>
          <el-radio-group v-model="store.variableEditMode" size="small">
            <el-radio-button label="yaml">YAML</el-radio-button>
            <el-radio-button label="tree">节点树</el-radio-button>
          </el-radio-group>
        </div>

        <!-- YAML 编辑模式 -->
        <div v-if="store.variableEditMode === 'yaml'">
          <div class="yaml-input-section">
            <el-input
              v-model="store.yamlInput"
              type="textarea"
              :rows="8"
              placeholder="粘贴YAML格式的变量定义...&#10;例如:&#10;世界:&#10;  日期: [0, '记录故事天数']&#10;角色:&#10;  狼蛛:&#10;    好感度: [0, '角色好感度']"
              class="yaml-textarea"
            />
            <div class="yaml-actions">
              <el-button 
                type="primary" 
                @click="store.importYamlVariables"
                :disabled="!store.yamlInput.trim()"
                size="small"
              >
                解析变量
              </el-button>
              <el-button @click="clearYaml" size="small">清空</el-button>
              <el-button @click="showExample" size="small" type="info">示例</el-button>
            </div>
          </div>
          <!-- 只读预览 -->
          <div v-if="store.variableTree.length > 0" class="variable-tree-readonly">
            <h5 class="subsection-title">解析结果预览</h5>
            <VariableTreeNode
              v-for="node in store.variableTree"
              :key="node.path"
              :node="node"
              @select-variable="selectVariable"
            />
          </div>
        </div>

        <!-- 节点树编辑模式 -->
        <div v-if="store.variableEditMode === 'tree'">
          <div class="tree-actions">
            <el-button @click="store.addNode(null)" size="small">添加根节点</el-button>
          </div>
          <div class="variable-tree-editable">
            <div v-if="store.variableTree.length === 0" class="empty-tree">
              <el-text type="info">没有变量，请点击上方按钮添加根节点。</el-text>
            </div>
            <EditableVariableTreeNode
              v-for="node in store.variableTree"
              :key="node.path"
              :node="node"
            />
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="section">
        <h4 class="section-title">快速操作</h4>
        <div class="quick-actions">
          <el-button-group>
            <el-button 
              size="small" 
              @click="generateFromFirstVariable"
              :disabled="store.variableTree.length === 0"
            >
              使用第一个变量
            </el-button>
            <el-button 
              size="small" 
              @click="generateExampleStages"
              :disabled="!store.variablePath || !store.variableAlias"
            >
              生成示例阶段
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import VariableTreeNode from './VariableTreeNode.vue'
import EditableVariableTreeNode from './EditableVariableTreeNode.vue'
import { watch } from 'vue'
import type { VariableNode } from '@/stores/ejsEditor'

const store = useEjsEditorStore()

watch(() => store.variableEditMode, (newMode) => {
  if (newMode === 'tree' && store.yamlInput.trim() && store.variableTree.length === 0) {
    store.importYamlVariables()
  }
})

function clearYaml() {
  store.yamlInput = ''
  store.variableTree = []
}

function showExample() {
  store.yamlInput = `世界:
  日期: [0, 记录故事从开局经过的天数]
  地点: [拉库拾, 字符串：记录当前的位置]
角色:
  狼蛛:
    好感度: [0, 数字：负责好感度]
剧情:
  剧情阶段: [0, 数字：0 为初始值，参考剧情条目更新]
  日常事件计数: [0]
  任务次数计数: [0]
  被摸耳朵计数: [0]
  被摸尾巴计数: [0]`
  store.importYamlVariables()
}

function selectVariable(node: VariableNode) {
  if (!node.children) {
    const readablePath = store.getReadablePath(node);
    if (readablePath) {
      const selectedVar = store.flatVariables.find(v => v.id === node.path);
      if (selectedVar) {
        store.variablePath = selectedVar.readablePath;
        store.variableAlias = selectedVar.alias;
        ElMessage.success(`已选择变量: ${selectedVar.alias}`);
      }
    }
  }
}

function generateFromFirstVariable() {
  const firstVar = store.findFirstLeafVariable(store.variableTree)
  if (firstVar) {
    const readablePath = store.getReadablePath(firstVar);
    if (readablePath) {
      const selectedVar = store.flatVariables.find(v => v.id === firstVar.path);
      if (selectedVar) {
        store.variablePath = selectedVar.readablePath;
        store.variableAlias = selectedVar.alias;
        ElMessage.success(`已使用变量: ${selectedVar.alias}`);
      }
    }
  }
}

function generateExampleStages() {
  store.stages = []
  
  const exampleStages = [
    {
      id: `stage_${Date.now()}_1`,
      name: '初始阶段',
      conditions: [{ id: `cond_${Date.now()}_1`, variableId: '', variablePath: store.variablePath, variableAlias: store.variableAlias, type: 'less' as const, value: 20 }],
      conjunction: 'and',
      content: `${store.variableAlias}_初始:\n  行为指导:\n    - "保持距离，表现冷淡"`
    },
    {
      id: `stage_${Date.now()}_2`,
      name: '发展阶段',
      conditions: [{ id: `cond_${Date.now()}_2`, variableId: '', variablePath: store.variablePath, variableAlias: store.variableAlias, type: 'range' as const, value: 20, endValue: 60 }],
      conjunction: 'and',
      content: `${store.variableAlias}_发展:\n  行为指导:\n    - "开始主动交流"`
    },
    {
      id: `stage_${Date.now()}_3`,
      name: '亲密阶段',
      conditions: [{ id: `cond_${Date.now()}_3`, variableId: '', variablePath: store.variablePath, variableAlias: store.variableAlias, type: 'greaterEqual' as const, value: 60 }],
      conjunction: 'and',
      content: `${store.variableAlias}_亲密:\n  行为指导:\n    - "表现出深度信任"`
    }
  ]
  
  store.stages = exampleStages as any
  if (exampleStages.length > 0) {
    store.selectedStageId = exampleStages[0].id
  }
  
  ElMessage.success('已生成示例阶段')
}
</script>

<style scoped>
.variable-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.help-icon {
  color: var(--el-color-info);
  cursor: help;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-item label {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.yaml-input-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.yaml-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.yaml-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.variable-tree-readonly {
  margin-top: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 8px;
  background: var(--el-bg-color-page);
  max-height: 200px;
  overflow-y: auto;
}

.subsection-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin: 0 0 8px 0;
}

.tree-actions {
  margin-bottom: 12px;
}

.variable-tree-editable {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
  background: var(--el-bg-color-page);
}

.empty-tree {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>