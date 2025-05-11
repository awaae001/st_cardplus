<template>
  <div class="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 min-h-screen"><!-- Base bg is now in global style.css -->

    <!-- Left Panel: Entry List -->
    <div class="w-full md:w-1/3 lg:w-1/4 flex flex-col bg-white dark:bg-neutral-800 shadow-lg dark:shadow-neutral-950/50 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center shrink-0">
        <h2 class="text-base font-semibold text-neutral-700 dark:text-neutral-100">世界书条目</h2>
        <el-button type="primary" :icon="Plus" @click="addNewEntry" size="small" class="!bg-sky-600 hover:!bg-sky-500 !border-sky-600 dark:!text-white">新增</el-button>
      </div>
      <el-scrollbar class="flex-grow">
        <div v-if="!worldBookEntries.length" class="p-6 text-center text-neutral-500 dark:text-neutral-400">
          <el-empty description="暂无条目" :image-size="100"></el-empty>
        </div>
        <el-menu
          v-else
          :default-active="selectedEntryIndex !== null ? String(selectedEntryIndex) : undefined"
          @select="handleSelectEntry"
          class="entry-menu !border-none !bg-transparent py-1"
        >
          <el-menu-item
            v-for="(entry, index) in worldBookEntries"
            :key="entry.uid || index"
            :index="String(index)"
            class="!h-auto !px-3 !py-2.5 !leading-normal group"
          >
            <div class="flex-grow overflow-hidden w-full">
              <div class="text-sm font-medium text-neutral-700 dark:text-neutral-100 group-[.is-active]:text-sky-600 dark:group-[.is-active]:text-sky-300 truncate">{{ entry.comment || `条目 ${index + 1}` }}</div>
              <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 flex items-center flex-wrap gap-1 group-[.is-active]:text-sky-500 dark:group-[.is-active]:text-sky-400/90">
                <el-tag v-if="entry.disable" type="info" size="small" effect="dark" class="!border-neutral-600 !bg-neutral-600/80 !text-neutral-300">已禁用</el-tag>
                <el-tag v-if="entry.constant" type="success" size="small" effect="dark" class="!border-green-700/70 !bg-green-600/60 !text-green-100">常驻</el-tag>
                <span v-if="!entry.disable && !entry.constant" class="inline-block h-[18px]"></span> <!-- Placeholder for consistent height -->
              </div>
            </div>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </div>

    <!-- Right Panel: Entry Editor -->
    <div class="w-full md:w-2/3 lg:w-3/4 flex flex-col bg-white dark:bg-neutral-800 shadow-lg dark:shadow-neutral-950/50 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center shrink-0">
        <h2 class="text-base font-semibold text-neutral-700 dark:text-neutral-100">
          编辑: <span class="text-sky-600 dark:text-sky-400">{{ selectedEntry ? (selectedEntry.comment || '新条目') : '未选择条目' }}</span>
        </h2>
        <div>
          <el-button v-if="selectedEntry" type="primary" :icon="DocumentChecked" @click="saveCurrentEntry" size="small" class="mr-2 !bg-sky-600 hover:!bg-sky-500 !border-sky-600 dark:!text-white">保存</el-button>
          <el-button v-if="selectedEntry" type="danger" :icon="Delete" @click="deleteSelectedEntry" size="small" class="!bg-red-600 hover:!bg-red-500 !border-red-600 dark:!text-white">删除</el-button>
        </div>
      </div>

      <el-scrollbar class="flex-grow p-5 md:p-6">
        <div v-if="!selectedEntry" class="h-full flex items-center justify-center">
          <el-empty description="请选择或新增条目进行编辑" :image-size="150"></el-empty>
        </div>

        <el-form
          v-if="selectedEntry && editableEntry"
          :model="editableEntry"
          label-position="top"
          ref="entryFormRef"
          class="space-y-8"
        >
          <section class="form-section">
            <h3 class="form-section-title">基本信息</h3>
            <div class="space-y-5">
              <div>
                <label class="form-label">标题/备注 (Comment)</label>
                <el-input v-model="editableEntry.comment" placeholder="给条目起个易于识别的名字" />
              </div>
              <div>
                <label class="form-label">主要关键词 (Key) - <span class="text-xs text-neutral-500 dark:text-neutral-400">逗号分隔, 支持 /regex/i</span></label>
                <el-input v-model="keysInput" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="例如: 角色名, /他说了什么/i, 地点A" />
                <p class="form-help-text">提示: 普通文本关键词不要包含逗号，逗号被视作分隔符。</p>
              </div>
              <div>
                <label class="form-label">条目内容 (Content)</label>
                <el-input v-model="editableEntry.content" type="textarea" :autosize="{ minRows: 5, maxRows: 12 }" placeholder="当条目激活时，这段文本会被插入到AI的提示中..." />
              </div>
            </div>
          </section>

          <section class="form-section">
            <h3 class="form-section-title">触发与激活</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label class="form-label">次要关键词 (Optional Filter) - <span class="text-xs text-neutral-500 dark:text-neutral-400">逗号分隔</span></label>
                <el-input v-model="secondaryKeysInput" type="textarea" :autosize="{ minRows: 2, maxRows: 3 }" placeholder="可选的过滤关键词" />
              </div>
              <div>
                <label class="form-label">次要关键词逻辑 (Logic)</label>
                <el-select v-model="editableEntry.selectiveLogic" placeholder="选择逻辑" class="w-full" :disabled="!editableEntry.selective">
                  <el-option label="AND ANY (主Key存在, 且至少一个次要Key存在)" :value="0" />
                  <el-option label="NOT ALL (主Key存在, 但非所有次要Key都存在)" :value="1" />
                  <el-option label="NOT ANY (主Key存在, 且无任何次要Key存在)" :value="2" />
                  <el-option label="AND ALL (主Key存在, 且所有次要Key都存在)" :value="3" />
                </el-select>
                <el-checkbox v-model="editableEntry.selective" label="启用次要逻辑" class="mt-2.5" />
              </div>
              <div class="flex flex-col">
                <label class="form-label">常驻 (Constant)</label>
                <el-switch v-model="editableEntry.constant" />
              </div>
              <div class="flex flex-col">
                <label class="form-label">禁用 (Disable)</label>
                <el-switch v-model="editableEntry.disable" />
              </div>
              <div class="md:col-span-2">
                <label class="form-label">触发概率 (Probability %)</label>
                <div class="flex items-center gap-3">
                  <el-slider v-model="editableEntry.probability" :min="0" :max="100" show-input class="flex-grow" :disabled="!editableEntry.useProbability" />
                  <el-checkbox v-model="editableEntry.useProbability" label="启用概率" class="whitespace-nowrap" />
                </div>
              </div>
            </div>
          </section>

          <section class="form-section">
            <h3 class="form-section-title">插入与顺序</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-end">
              <div>
                <label class="form-label">插入顺序 (Order)</label>
                <el-input-number v-model="editableEntry.order" :min="0" controls-position="right" class="w-full" />
              </div>
              <div>
                <label class="form-label">插入位置 (Position)</label>
                <el-select v-model="editableEntry.position" placeholder="选择插入位置" class="w-full">
                  <el-option label="主提示之前" :value="0" /> <el-option label="主提示之后" :value="1" />
                  <el-option label="作者注释顶部" :value="2" /> <el-option label="作者注释底部" :value="3" />
                  <el-option label="聊天内指定深度" :value="4" /> <el-option label="示例消息顶部" :value="5" />
                  <el-option label="示例消息底部" :value="6" />
                </el-select>
              </div>
              <div v-if="editableEntry.position === 4">
                <label class="form-label">深度角色 (Role for In-chat)</label>
                <el-select v-model="editableEntry.role" placeholder="选择角色" class="w-full">
                  <el-option label="系统" :value="0" /> <el-option label="用户" :value="1" /> <el-option label="助手" :value="2" />
                </el-select>
              </div>
            </div>
          </section>

          <section class="form-section">
             <h3 class="form-section-title">扫描与匹配</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-start">
              <div>
                <label class="form-label">扫描深度 (Scan Depth)</label>
                <el-input-number v-model="editableEntry.depth" :min="0" :max="999" controls-position="right" class="w-full" />
                <p class="form-help-text">0表示可能使用全局设置。</p>
              </div>
              <div class="flex flex-col items-start">
                <label class="form-label">大小写敏感</label>
                <el-switch v-model="editableEntry.caseSensitive" />
              </div>
              <div class="flex flex-col items-start">
                <label class="form-label">匹配整个单词</label>
                <el-switch v-model="editableEntry.matchWholeWords" />
                <p class="form-help-text">非空格分词语言建议关闭。</p>
              </div>
              <div class="flex flex-col items-start">
                <label class="form-label">启用向量匹配</label>
                <el-switch v-model="editableEntry.vectorized" />
              </div>
            </div>
          </section>

          <section class="form-section">
            <h3 class="form-section-title">递归与分组</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-start">
               <div class="flex flex-col">
                <label class="form-label">排除递归激活</label>
                <el-switch v-model="editableEntry.excludeRecursion" />
              </div>
              <div>
                <label class="form-label">所属收录组 (Group)</label>
                <el-input v-model="editableEntry.group" placeholder="组名, 多个用逗号分隔" />
              </div>
              <div>
                <label class="form-label">组内优先级/权重</label>
                <el-input-number v-model="editableEntry.groupPriority" controls-position="right" class="w-full" />
              </div>
            </div>
          </section>

          <section class="form-section">
            <h3 class="form-section-title">其他</h3>
            <div>
              <label class="form-label">自动化ID (Automation ID)</label>
              <el-input v-model="editableEntry.automationId" placeholder="用于Quick Replies扩展" />
            </div>
          </section>

        </el-form>
      </el-scrollbar>

      <div class="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 flex flex-wrap gap-3 justify-start shrink-0">
        <el-button type="success" @click="exportToJson" :icon="Upload" size="small" class="!bg-green-600 hover:!bg-green-500 !border-green-600 dark:!text-white">导出JSON</el-button>
        <el-upload action="#" :before-upload="loadFromJson" :show-file-list="false" accept=".json">
          <el-button type="warning" :icon="Download" size="small" class="!bg-amber-500 hover:!bg-amber-400 !border-amber-500 !text-neutral-900 dark:!text-neutral-800">导入JSON</el-button>
        </el-upload>
        <el-button @click="clearAllEntries" type="danger" :icon="Delete" size="small" class="!bg-red-600 hover:!bg-red-500 !border-red-600 dark:!text-white">清空所有</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import { Plus, Delete, DocumentChecked, Upload, Download } from '@element-plus/icons-vue';

interface WorldBookEntry {
  uid: number;
  comment: string;
  key: string[];
  content: string;
  order: number;
  constant: boolean;
  disable: boolean;
  keysecondary: string[];
  selectiveLogic: number; // 0: AND ANY, 1: NOT ALL, 2: NOT ANY, 3: AND ALL
  selective: boolean;
  excludeRecursion: boolean;
  probability: number; // 0-100
  useProbability: boolean;
  position: number; // 0: before_prompt, 1: after_prompt, 2: an_top, 3: an_bottom, 4: in_chat, 5: example_top, 6: example_bottom
  role: number; // Only for position 4 (in_chat): 0: system, 1: user, 2: assistant
  depth: number; // Scan depth, 0 for global/default
  caseSensitive: boolean;
  matchWholeWords: boolean;
  vectorized: boolean; // For SillyTavern's vector DB feature
  group: string; // Comma-separated group names
  groupPriority: number; // Priority within the group
  automationId: string; // For QuickReplies extension
}

const worldBookEntries = ref<WorldBookEntry[]>([]);
const selectedEntryIndex = ref<number | null>(null);
const editableEntry = ref<Partial<WorldBookEntry>>({}); // Use Partial for the form binding
const entryFormRef = ref<InstanceType<typeof ElForm> | null>(null);

const selectedEntry = computed<WorldBookEntry | null>(() => {
  if (selectedEntryIndex.value !== null && worldBookEntries.value[selectedEntryIndex.value]) {
    return worldBookEntries.value[selectedEntryIndex.value];
  }
  return null;
});

// Computed property for handling keys as a comma-separated string
const keysInput = computed({
  get: () => (editableEntry.value?.key ? editableEntry.value.key.join(', ') : ''),
  set: (value) => {
    if (editableEntry.value) {
      editableEntry.value.key = value.split(',').map(k => k.trim()).filter(k => k);
    }
  },
});

// Computed property for handling secondary keys
const secondaryKeysInput = computed({
  get: () => (editableEntry.value?.keysecondary ? editableEntry.value.keysecondary.join(', ') : ''),
  set: (value) => {
    if (editableEntry.value) {
      editableEntry.value.keysecondary = value.split(',').map(k => k.trim()).filter(k => k);
    }
  },
});

// Watch for changes in selectedEntry to update the editableEntry for the form
watch(selectedEntry, (newEntry) => {
  if (newEntry) {
    // Create a full default entry to ensure all fields exist, then merge with the selected one
    const defaultFullEntry = createDefaultEntryData(newEntry.uid || Date.now()); // Ensure UID from newEntry or generate
    editableEntry.value = { ...defaultFullEntry, ...JSON.parse(JSON.stringify(newEntry)) };
  } else {
    editableEntry.value = {}; // Clear form if no entry is selected
  }
  // Clear validation on form when entry changes
  nextTick(() => {
    entryFormRef.value?.clearValidate();
  });
}, { deep: true, immediate: true });


function createDefaultEntryData(uid: number): WorldBookEntry {
  return {
    uid: uid,
    comment: '',
    key: [],
    content: '',
    order: 0,
    constant: false,
    disable: false,
    keysecondary: [],
    selectiveLogic: 0, // Default to AND ANY
    selective: false,
    excludeRecursion: false,
    probability: 100,
    useProbability: false,
    position: 1, // Default to after_prompt
    role: 0, // Default to system (relevant if position is in_chat)
    depth: 0,
    caseSensitive: false,
    matchWholeWords: false, // Default might depend on common use cases
    vectorized: false,
    group: "",
    groupPriority: 0,
    automationId: ""
  };
}

const addNewEntry = () => {
  const newUid = Date.now();
  const newEntryData = createDefaultEntryData(newUid);
  newEntryData.comment = `新条目 ${worldBookEntries.value.length + 1}`;
  worldBookEntries.value.push(newEntryData);
  selectedEntryIndex.value = worldBookEntries.value.length - 1;
};

const handleSelectEntry = (indexStr: string) => {
  const index = parseInt(indexStr, 10);
  if (index >= 0 && index < worldBookEntries.value.length) {
    selectedEntryIndex.value = index;
  }
};

const saveCurrentEntry = () => {
  if (selectedEntryIndex.value !== null && editableEntry.value && editableEntry.value.uid !== undefined) {
    // Merge editableEntry with a full default structure to ensure all fields are present
    const entryToSave = { 
      ...createDefaultEntryData(editableEntry.value.uid), // Base with UID
      ...editableEntry.value // Overlay with current edits
    };
    // Ensure arrays are arrays (they should be due to computed props and createDefaultEntryData)
    entryToSave.key = Array.isArray(entryToSave.key) ? entryToSave.key : [];
    entryToSave.keysecondary = Array.isArray(entryToSave.keysecondary) ? entryToSave.keysecondary : [];

    worldBookEntries.value[selectedEntryIndex.value] = JSON.parse(JSON.stringify(entryToSave as WorldBookEntry));
    ElMessage.success('条目已保存！');
  } else {
    ElMessage.error('无法保存条目，缺少UID或未选择条目。');
  }
};

const deleteSelectedEntry = () => {
  if (selectedEntryIndex.value !== null && selectedEntry.value) {
    ElMessageBox.confirm(
      `确定要删除条目 "${selectedEntry.value.comment || '此条目'}" 吗？`,
      '警告',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    ).then(() => {
      worldBookEntries.value.splice(selectedEntryIndex.value!, 1);
      ElMessage.success('条目已删除');
      if (worldBookEntries.value.length > 0) {
        // If the deleted item was not the first, select the previous one.
        // If it was the first, select the new first (index 0).
        selectedEntryIndex.value = Math.max(0, selectedEntryIndex.value! -1);
         if (selectedEntryIndex.value >= worldBookEntries.value.length) { // if last one deleted and index was out of bound
            selectedEntryIndex.value = worldBookEntries.value.length > 0 ? worldBookEntries.value.length - 1 : null;
        }

      } else {
        selectedEntryIndex.value = null; // No entries left
      }
    }).catch(() => {
      // User cancelled
    });
  }
};

const exportToJson = () => {
  if (!worldBookEntries.value.length) {
    ElMessage.warning('没有条目可以导出。');
    return;
  }
  // Format for SillyTavern world_info.json
  const exportData: { entries: Record<string, Omit<WorldBookEntry, 'uid'>> } = { entries: {} };
  worldBookEntries.value.forEach((entry) => {
    const { uid, ...entryDataToExport } = entry; // Exclude UID from the value part
    exportData.entries[String(entry.uid)] = entryDataToExport; // UID becomes the key
  });

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'world_info.json'; // Standard filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  ElMessage.success('已导出为 world_info.json');
};

const loadFromJson = (file: File): boolean => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const jsonData = JSON.parse(e.target?.result as string);
      // Check if the root is an object and has an 'entries' property which is also an object
      if (jsonData && typeof jsonData.entries === 'object' && jsonData.entries !== null) {
        const loadedEntries: WorldBookEntry[] = [];
        let uidCounter = Date.now(); // Fallback for entries that might miss a numeric key or UID field

        Object.keys(jsonData.entries).forEach((entryKey, index) => {
          const entryFromFile = jsonData.entries[entryKey];
          let currentUid: number;

          // Try to parse UID from the key, then from entry.uid, then generate
          const uidFromKey = parseInt(entryKey, 10);
          if (!isNaN(uidFromKey)) {
            currentUid = uidFromKey;
          } else if (entryFromFile.uid && typeof entryFromFile.uid === 'number') {
            currentUid = entryFromFile.uid;
          } else {
            currentUid = uidCounter++; // Ensure unique UIDs if not present
          }
          
          const baseEntry = createDefaultEntryData(currentUid); // Get defaults for all fields

          // Merge, ensuring types are correct
          const newEntry: WorldBookEntry = {
            ...baseEntry, // Start with defaults
            ...entryFromFile, // Overlay with data from file
            uid: currentUid, // Crucially, set the determined UID
            // Ensure array types
            key: Array.isArray(entryFromFile.key) ? entryFromFile.key.map(String) : [],
            keysecondary: Array.isArray(entryFromFile.keysecondary) ? entryFromFile.keysecondary.map(String) : [],
            // Ensure boolean types (important for switches/checkboxes)
            constant: typeof entryFromFile.constant === 'boolean' ? entryFromFile.constant : baseEntry.constant,
            disable: typeof entryFromFile.disable === 'boolean' ? entryFromFile.disable : baseEntry.disable,
            selective: typeof entryFromFile.selective === 'boolean' ? entryFromFile.selective : baseEntry.selective,
            excludeRecursion: typeof entryFromFile.excludeRecursion === 'boolean' ? entryFromFile.excludeRecursion : baseEntry.excludeRecursion,
            useProbability: typeof entryFromFile.useProbability === 'boolean' ? entryFromFile.useProbability : baseEntry.useProbability,
            caseSensitive: typeof entryFromFile.caseSensitive === 'boolean' ? entryFromFile.caseSensitive : baseEntry.caseSensitive,
            matchWholeWords: typeof entryFromFile.matchWholeWords === 'boolean' ? entryFromFile.matchWholeWords : baseEntry.matchWholeWords,
            vectorized: typeof entryFromFile.vectorized === 'boolean' ? entryFromFile.vectorized : baseEntry.vectorized,
             // Ensure number types
            order: typeof entryFromFile.order === 'number' ? entryFromFile.order : baseEntry.order,
            selectiveLogic: typeof entryFromFile.selectiveLogic === 'number' ? entryFromFile.selectiveLogic : baseEntry.selectiveLogic,
            probability: typeof entryFromFile.probability === 'number' ? entryFromFile.probability : baseEntry.probability,
            position: typeof entryFromFile.position === 'number' ? entryFromFile.position : baseEntry.position,
            role: typeof entryFromFile.role === 'number' ? entryFromFile.role : baseEntry.role,
            depth: typeof entryFromFile.depth === 'number' ? entryFromFile.depth : baseEntry.depth,
            groupPriority: typeof entryFromFile.groupPriority === 'number' ? entryFromFile.groupPriority : baseEntry.groupPriority,
            // Ensure string types for fields that should be strings
            comment: typeof entryFromFile.comment === 'string' ? entryFromFile.comment : baseEntry.comment,
            content: typeof entryFromFile.content === 'string' ? entryFromFile.content : baseEntry.content,
            group: typeof entryFromFile.group === 'string' ? entryFromFile.group : baseEntry.group,
            automationId: typeof entryFromFile.automationId === 'string' ? entryFromFile.automationId : baseEntry.automationId,
          };
          loadedEntries.push(newEntry);
        });

        worldBookEntries.value = loadedEntries;
        selectedEntryIndex.value = loadedEntries.length > 0 ? 0 : null; // Select first item or none
        ElMessage.success(`成功导入 ${loadedEntries.length} 个条目！`);
      } else {
        ElMessage.error('JSON文件格式不正确: 根对象必须包含 "entries" 对象。');
      }
    } catch (error) {
      ElMessage.error('解析JSON文件失败: ' + (error as Error).message);
    }
  };
  reader.readAsText(file);
  return false; // Prevent el-upload default upload behavior
};

const clearAllEntries = () => {
  ElMessageBox.confirm(
    '确定要清空所有世界书条目吗？此操作不可恢复！',
    '严重警告',
    { confirmButtonText: '清空', cancelButtonText: '取消', type: 'error' }
  ).then(() => {
    worldBookEntries.value = [];
    selectedEntryIndex.value = null;
    editableEntry.value = {}; // Clear the form
    ElMessage.success('所有条目已清空。');
  }).catch(() => {
    // User cancelled
  });
};
</script>