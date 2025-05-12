<template>
  <div class="json-formatter-page p-3 md:p-5 h-full flex flex-col">
    <header class="flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-6 flex-shrink-0 gap-y-3">
      <div class="flex items-center gap-3">
        <button @click="$router.push('/toolbox')" class="btn-secondary-adv !py-1.5 !px-3 text-sm">
          <Icon icon="ph:arrow-left-duotone" class="mr-1.5 -ml-0.5" />
          返回工具箱
        </button>
        <h1 class="text-xl md:text-2xl font-bold text-neutral-700 dark:text-neutral-100">
          JSON 去除换行工具
        </h1>
      </div>
      <div class="flex items-center gap-2 md:gap-3">
        <button @click="formatJson" :disabled="!inputJson" class="btn-primary-adv !py-1.5 !px-3 text-sm">
          <Icon icon="ph:sparkle-duotone" class="mr-1.5 -ml-0.5" />
          处理
        </button>
        <el-tooltip content="复制处理结果" placement="bottom" :show-arrow="false" :offset="8" :hide-after="0">
          <button @click="copyToClipboard" :disabled="!outputJson" class="btn-secondary-adv !p-2.5 aspect-square group">
            <Icon icon="ph:copy-simple-duotone" class="text-lg group-hover:scale-110 transition-transform"/>
          </button>
        </el-tooltip>
      </div>
    </header>

    <el-alert title="去除回车可以有效的节省Token，也可以在一定程度上增加阅读困难，但是不影响AI的阅读。" type="info" :closable="false" class="mb-4 md:mb-6 flex-shrink-0" />

    <div class="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 min-h-0">
      <div class="content-panel flex flex-col">
        <div class="content-panel-header">
          <h3 class="content-panel-title flex items-center gap-2">
            <Icon icon="ph:keyboard-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
            输入
          </h3>
        </div>
        <div class="content-panel-body flex-grow flex">
          <el-input v-model="inputJson" type="textarea" placeholder="粘贴带换行的JSON内容" class="flex-grow custom-textarea"/>
        </div>
      </div>

      <div class="content-panel flex flex-col">
        <div class="content-panel-header">
          <h3 class="content-panel-title flex items-center gap-2">
            <Icon icon="ph:file-text-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
            输出 (自动去除换行)
          </h3>
        </div>
        <div class="content-panel-body flex-grow flex">
          <el-input v-model="outputJson" type="textarea" readonly placeholder="处理后的JSON将显示在这里" class="flex-grow custom-textarea"/>
        </div>
      </div>
    </div>

    <div class="content-panel mt-4 md:mt-6 flex-shrink-0">
      <div class="content-panel-header">
        <h3 class="content-panel-title flex items-center gap-2">
          <Icon icon="ph:clock-counter-clockwise-duotone" class="text-xl text-accent-500 dark:text-accent-400"/>
          历史记录 (最近10条)
        </h3>
      </div>
      <div class="content-panel-body">
        <el-table :data="historyRecords" height="250px" @row-click="useHistoryRecord" style="width: 100%" empty-text="暂无历史记录">
          <el-table-column prop="date" label="时间" width="160" />
          <el-table-column prop="json" label="内容" show-overflow-tooltip min-width="150"/>
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope">
              <el-tooltip content="删除此记录" placement="top" :show-arrow="false" :offset="8" :hide-after="0">
                <button @click.stop="deleteRecord(scope.row.id)" class="btn-danger-adv !p-1.5 aspect-square group">
                  <Icon icon="ph:trash-simple-duotone" class="text-base"/>
                </button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElButton, ElInput, ElTable, ElTableColumn, ElMessageBox, ElAlert, ElTooltip } from 'element-plus'
import { Icon } from '@iconify/vue'

const inputJson = ref('')
const outputJson = ref('')
const historyRecords = ref<Array<{ id: string, json: string, date: string }>>([])

onMounted(() => {
  const records = localStorage.getItem('jsonFormatterHistory')
  if (records) {
    historyRecords.value = JSON.parse(records)
  }
})

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

const useHistoryRecord = (record: { json: string }) => {
  outputJson.value = record.json
  inputJson.value = ''
}

const deleteRecord = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'app-dialog'
    })
    historyRecords.value = historyRecords.value.filter(record => record.id !== id)
    localStorage.setItem('jsonFormatterHistory', JSON.stringify(historyRecords.value))
    ElMessage.success('删除成功')
  } catch {}
}

const copyToClipboard = () => {
  if (!outputJson.value) return
  navigator.clipboard.writeText(outputJson.value)
    .then(() => ElMessage.success('已复制到剪贴板'))
    .catch(() => ElMessage.error('复制失败'))
}

const formatJson = () => {
  try {
    const trimmed = inputJson.value.replace(/\s+/g, ' ')
    JSON.parse(trimmed)
    outputJson.value = trimmed
    saveToHistory()
    ElMessage.success('处理完成！')
  } catch (error) {
    ElMessage.error('无效的JSON格式或处理失败')
    console.error(error)
  }
}
</script>

<style scoped>
.custom-textarea :deep(.el-textarea__inner) {
  height: 100% !important;
  min-height: 200px; /* Ensure a minimum height */
  resize: none;
}

@media (max-width: 1023px) { /* Below lg */
  .flex-grow.grid {
    grid-template-columns: 1fr; /* Stack IO columns */
    min-height: auto; /* Allow natural height */
  }
  .custom-textarea :deep(.el-textarea__inner) {
     min-height: 20vh; /* Adjust for smaller screens */
  }
}
</style>