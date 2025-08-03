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

      <!-- YAML 快速导入 -->
      <div class="section">
        <h4 class="section-title">
          YAML 快速导入
          <el-tooltip content="支持格式: 变量名: [初始值, 描述]" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </h4>
        
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
            <el-button 
              @click="clearYaml"
              size="small"
            >
              清空
            </el-button>
            <el-button 
              @click="showExample"
              size="small"
              type="info"
            >
              示例
            </el-button>
          </div>
        </div>
      </div>

      <!-- 变量树状视图 -->
      <div v-if="store.variableTree.length > 0" class="section">
        <h4 class="section-title">解析结果</h4>
        <div class="variable-tree">
          <VariableTreeNode
            v-for="node in store.variableTree"
            :key="node.path"
            :node="node"
            @select-variable="selectVariable"
          />
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
import { QuestionFilled } from '@element-plus/icons-vue'
import { useEjsEditorStore } from '@/stores/ejsEditor'
import VariableTreeNode from './VariableTreeNode.vue'

const store = useEjsEditorStore()

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
}

function selectVariable(node: any) {
  if (!node.children) {
    store.variablePath = node.path
    store.variableAlias = node.key
    ElMessage.success(`已选择变量: ${node.key}`)
  }
}

function generateFromFirstVariable() {
  const firstVar = findFirstLeafVariable(store.variableTree)
  if (firstVar) {
    store.variablePath = firstVar.path
    store.variableAlias = firstVar.key
    ElMessage.success(`已使用变量: ${firstVar.key}`)
  }
}

function findFirstLeafVariable(nodes: any[], visited = new Set<string>()): any {
  for (const node of nodes) {
    // 防止无限递归
    if (visited.has(node.path)) {
      continue
    }
    visited.add(node.path)
    
    if (node.children && node.children.length > 0) {
      const found = findFirstLeafVariable(node.children, visited)
      if (found) return found
    } else {
      // 确保这是一个有效的叶子节点
      if (node.value !== null && node.value !== undefined) {
        return node
      }
    }
  }
  return null
}

function generateExampleStages() {
  // 清空现有阶段
  store.stages = []
  
  // 生成示例阶段
  const exampleStages = [
    {
      id: `stage_${Date.now()}_1`,
      name: '初始阶段',
      condition: { type: 'less' as const, value: 20 },
      content: `${store.variableAlias}_初始:
  行为指导:
    - "保持距离，表现冷淡"
    - "仅限于基本交流"
  变化倾向:
    - "逐渐开始关注对方"`
    },
    {
      id: `stage_${Date.now()}_2`,
      name: '发展阶段',
      condition: { type: 'range' as const, value: 20, endValue: 60 },
      content: `${store.variableAlias}_发展:
  行为指导:
    - "开始主动交流"
    - "表现出一定的关心"
  变化倾向:
    - "更多的互动机会"
    - "开始分享个人想法"`
    },
    {
      id: `stage_${Date.now()}_3`,
      name: '亲密阶段',
      condition: { type: 'greaterEqual' as const, value: 60 },
      content: `${store.variableAlias}_亲密:
  行为指导:
    - "表现出深度信任"
    - "愿意分享内心秘密"
  变化倾向:
    - "寻求更多独处时间"
    - "展现更真实的自己"`
    }
  ]
  
  store.stages = exampleStages
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

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
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

.variable-tree {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 8px;
  background: var(--el-bg-color-page);
  max-height: 200px;
  overflow-y: auto;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .panel-content {
    padding: 12px;
  }
  
  .yaml-actions {
    flex-direction: column;
  }
  
  .yaml-actions .el-button-group {
    width: 100%;
  }
  
  .yaml-actions .el-button {
    flex: 1;
  }
}
</style>