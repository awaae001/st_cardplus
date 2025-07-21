<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElButton, ElInput, ElTable, ElTableColumn, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { copyToClipboard } from '../../utils/clipboard'

const inputJson = ref('')
const outputJson = ref('')
const historyRecords = ref<Array<{ id: string, json: string, date: string }>>([])

// 加载历史记录
onMounted(() => {
  const records = localStorage.getItem('jsonFormatterHistory')
  if (records) {
    historyRecords.value = JSON.parse(records)
  }
})

// 保存记录
const saveToHistory = () => {
  if (!outputJson.value) return

  const newRecord = {
    id: Date.now().toString(),
    json: outputJson.value,
    date: new Date().toLocaleString()
  }

  historyRecords.value = [newRecord, ...historyRecords.value].slice(0, 10)
  localStorage.setItem('jsonFormatterHistory', JSON.stringify(historyRecords.value))
}

// 使用历史记录
const useHistoryRecord = (record: { json: string }) => {
  outputJson.value = record.json
  inputJson.value = ''
}

// 删除记录
const deleteRecord = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    historyRecords.value = historyRecords.value.filter(record => record.id !== id)
    localStorage.setItem('jsonFormatterHistory', JSON.stringify(historyRecords.value))
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleCopy = () => {
  if (!outputJson.value) return
  copyToClipboard(outputJson.value)
}

const formatJson = () => {
  try {
    // 去除换行和多余空格
    const trimmed = inputJson.value.replace(/\s+/g, ' ')
    // 尝试解析确保是有效JSON
    JSON.parse(trimmed)
    outputJson.value = trimmed
    saveToHistory()
  } catch (error) {
    ElMessage.error('无效的JSON格式')
    console.error(error)
  }
}
</script>

<template>
  <div class="json-formatter">
    <div class="header">
      <div class="header-top">
        <el-button type="primary" plain @click="$router.push('/toolbox')" class="back-button">
          <Icon icon="material-symbols:arrow-back" width="16" height="16" />
          返回工具箱
        </el-button>
        <el-alert title="去除回车可以有效的节省token，也可以在一定程度上增加阅读困难，但是不影响AI的阅读" type="info" :closable="false"
          class="info-alert" />
      </div>
      <div style="display: flex;align-items: center;gap: 16px;">
        <h3>JSON去除换行工具</h3>
        <div class="output-actions">
          <el-button type="primary" @click="formatJson" :disabled="!inputJson">
            <Icon icon="material-symbols:autorenew" width="16" height="16" />
            格式化
          </el-button>
          <el-button type="primary" @click="handleCopy" :disabled="!outputJson">
            <Icon icon="material-symbols:content-copy" width="16" height="16" />
            复制到剪贴板
          </el-button>
        </div>
      </div>
    </div>
    <div class="content-wrapper">
      <div class="io-columns">
        <el-input v-model="inputJson" type="textarea" :rows="20" placeholder="粘贴带换行的JSON内容" class="input-area" />
        <el-input v-model="outputJson" type="textarea" :rows="20" readonly placeholder="处理后的JSON将显示在这里"
          class="output-area" />
      </div>
      <div class="history-panel">
        <h4>历史记录 (最近10条)</h4>
        <el-table :data="historyRecords" height="500" @row-click="useHistoryRecord" style="width: 100%">
          <el-table-column prop="date" label="时间" width="120" />
          <el-table-column prop="json" label="内容" show-overflow-tooltip />
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button type="danger" size="small" @click.stop="deleteRecord(scope.row.id)" :icon="Delete" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.json-formatter {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.io-columns {
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.history-panel {
  background: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
  width: 100%;
}

.history-panel h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.input-area,
.output-area {
  flex: 1;
  min-width: 0;
}

.header {
  margin-bottom: 20px;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.header-top .format-button {
  margin-right: auto;
}

.header-top .info-alert {
  flex: 1;
  margin: 0;
}

/* 响应式设计 - 移动端 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .io-columns {
    flex-direction: column;
  }

  .input-area,
  .output-area {
    height: 200px;
  }

  .history-panel {
    max-width: 100%;
    min-width: 100%;
  }

  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-top .format-button {
    margin-right: 0;
    width: 100%;
  }

  .header-top .info-alert {
    width: 100%;
  }
}
</style>
