<template>
  <div class="info-display-container">
    <!-- 世界书信息展示 -->
    <div v-if="type === 'worldbook'" class="worldbook-panel">
      <div class="worldbook-info-section">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="世界书名称">
            <div class="worldbook-name-display">
              <el-tag v-if="hasWorldBook" type="success">
                {{ worldBookName }}
              </el-tag>
              <span v-else class="no-worldbook-text">未关联</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item v-if="hasWorldBook" label="条目数量">
            <el-tag type="info">{{ worldBookEntriesCount }} 条</el-tag>
            <el-tag v-if="constantEntriesCount > 0" type="success" size="small" class="stat-tag">
              常驻: {{ constantEntriesCount }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="worldbook-actions-section">
        <el-button
          type="primary"
          size="small"
          @click="showSelectorDialog = true"
          :icon="hasWorldBook ? 'RefreshRight' : 'Link'"
        >
          {{ hasWorldBook ? '更换世界书' : '绑定世界书' }}
        </el-button>
        <el-button
          v-if="hasWorldBook"
          type="danger"
          size="small"
          @click="handleUnbindWorldBook"
          :icon="'Close'"
        >
          解绑世界书
        </el-button>
      </div>
    </div>

    <!-- 正则脚本信息展示 -->
    <div v-else-if="type === 'regex'" class="regex-panel">
      <el-scrollbar>
        <div v-if="character.data.extensions?.regex_scripts?.length">
          <el-tag
            v-for="script in character.data.extensions.regex_scripts"
            :key="script.id"
            class="regex-script-tag"
          >
            {{ script.scriptName }}
          </el-tag>
        </div>
        <el-empty v-else description="无正则脚本" :image-size="60" />
      </el-scrollbar>
    </div>

    <!-- 世界书选择对话框 -->
    <WorldBookSelectorDialog
      v-model="showSelectorDialog"
      @confirm="handleBindWorldBook"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElDescriptions, ElDescriptionsItem, ElTag, ElScrollbar, ElEmpty, ElButton, ElMessageBox, ElMessage } from 'element-plus';
import type { CharacterCardV3 } from '@/types/character-card-v3';
import WorldBookSelectorDialog from './WorldBookSelectorDialog.vue';
import { worldBookService } from '@/database/worldBookService';
import { convertWorldBookToCharacterBook } from '@/utils/worldBookConverter';

const props = defineProps<{
  type: 'worldbook' | 'regex';
  character: CharacterCardV3;
}>();

const emit = defineEmits<{
  (e: 'worldbook-changed'): void;
}>();

const showSelectorDialog = ref(false);

// 检查是否已绑定世界书
const hasWorldBook = computed(() => {
  const book = props.character.data.character_book;
  return !Array.isArray(book) && book && book.name;
});

// 世界书名称
const worldBookName = computed(() => {
  const book = props.character.data.character_book;
  if (!Array.isArray(book) && book?.name) {
    return book.name;
  }
  return '未命名';
});

// 世界书条目数量
const worldBookEntriesCount = computed(() => {
  const book = props.character.data.character_book;
  if (!Array.isArray(book) && book?.entries) {
    return book.entries.length;
  }
  return 0;
});

// 常驻条目数量
const constantEntriesCount = computed(() => {
  const book = props.character.data.character_book;
  if (!Array.isArray(book) && book?.entries) {
    return book.entries.filter((entry: any) => entry.constant).length;
  }
  return 0;
});

// 绑定世界书
const handleBindWorldBook = async (bookId: string) => {
  try {
    // 从数据库加载世界书
    const collection = await worldBookService.getFullWorldBookCollection();
    const worldBook = collection.books[bookId];

    if (!worldBook) {
      ElMessage.error('未找到选中的世界书');
      return;
    }

    // 转换格式
    const characterBook = convertWorldBookToCharacterBook(worldBook);

    console.log('绑定世界书 - 转换后的数据:', characterBook);
    console.log('绑定世界书 - 条目数量:', characterBook.entries?.length);

    // 使用 Object.assign 或直接替换整个对象来确保响应式更新
    // 方法1: 直接赋值（触发响应式）
    props.character.data.character_book = { ...characterBook };

    // 确保 Vue 检测到变化 - 强制触发响应式更新
    Object.assign(props.character.data, {
      character_book: { ...characterBook }
    });

    console.log('绑定世界书 - 更新后的 character_book:', props.character.data.character_book);

    ElMessage.success(`已成功绑定世界书 "${worldBook.name}"，包含 ${characterBook.entries?.length || 0} 个条目！`);

    // 触发事件，通知父组件世界书已更改
    emit('worldbook-changed');
  } catch (error) {
    console.error('绑定世界书失败:', error);
    ElMessage.error(`绑定失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 解绑世界书
const handleUnbindWorldBook = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要解绑当前世界书吗？此操作将移除角色卡中的世界书数据。',
      '解绑世界书',
      {
        confirmButtonText: '确认解绑',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    console.log('解绑世界书 - 解绑前:', props.character.data.character_book);

    // 清空世界书数据 - 使用 Object.assign 确保响应式更新
    Object.assign(props.character.data, {
      character_book: []
    });

    // 移除可能存在的 extensions.world 引用
    if (props.character.data.extensions?.world) {
      delete props.character.data.extensions.world;
    }

    console.log('解绑世界书 - 解绑后:', props.character.data.character_book);

    ElMessage.success('已成功解绑世界书');

    // 触发事件，通知父组件世界书已更改
    emit('worldbook-changed');
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('解绑世界书失败:', error);
    }
  }
};
</script>

<style scoped>
.info-display-container {
  height: 100%;
}

.worldbook-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.worldbook-info-section {
  flex: 1;
}

.worldbook-name-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-worldbook-text {
  color: var(--el-text-color-secondary);
  font-style: italic;
}

.stat-tag {
  margin-left: 8px;
}

.worldbook-actions-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.regex-panel {
  height: 100%;
}

.el-scrollbar {
  height: 100%;
}

.regex-script-tag {
  margin: 4px;
}
</style>