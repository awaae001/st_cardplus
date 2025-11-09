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
          type="success"
          size="small"
          @click="handleSendToWorldBook"
        >
          <Icon icon="ph:upload-duotone" style="margin-right: 4px;" />
          发送到世界书
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
      <div v-if="character.data.extensions?.regex_scripts?.length" class="regex-content">
        <!-- 单个正则脚本时显示类似世界书的样式 -->
        <div v-if="character.data.extensions.regex_scripts.length === 1" class="regex-single-script">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="正则脚本">
              <el-tag type="success" size="large">
                {{ character.data.extensions.regex_scripts[0].scriptName }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <div class="regex-actions-section">
            <el-button
              type="primary"
              size="small"
              @click="handleSendToRegexEditor"
            >
              <Icon icon="ph:upload-duotone" style="margin-right: 4px;" />
              发送到正则编辑器
            </el-button>
          </div>
        </div>
        
        <!-- 多个正则脚本时显示列表 -->
        <div v-else class="regex-multiple-scripts">
          <el-scrollbar max-height="200px">
            <div class="regex-scripts-list">
              <el-tag
                v-for="script in character.data.extensions.regex_scripts"
                :key="script.id"
                class="regex-script-tag"
              >
                {{ script.scriptName }}
              </el-tag>
            </div>
          </el-scrollbar>
          <div class="regex-actions-section">
            <el-button
              type="primary"
              size="small"
              @click="handleSendToRegexEditor"
            >
              <Icon icon="ph:upload-duotone" style="margin-right: 4px;" />
              发送到正则编辑器
            </el-button>
          </div>
        </div>
      </div>
      <el-empty v-else description="无正则脚本" :image-size="60" />
    </div>

    <!-- 世界书选择对话框 -->
    <WorldBookSelectorDialog
      v-model="showSelectorDialog"
      @confirm="handleBindWorldBook"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElDescriptions, ElDescriptionsItem, ElTag, ElScrollbar, ElEmpty, ElButton, ElMessageBox, ElMessage } from 'element-plus';
import { Icon } from '@iconify/vue';
import type { CharacterCardV3 } from '@/types/character-card-v3';
import type { CharacterBook } from '@/types/character-book';
import WorldBookSelectorDialog from '../WorldBookSelectorDialog.vue';
import { worldBookService } from '@/database/worldBookService';
import { convertWorldBookToCharacterBook } from '@/utils/worldBookConverter';
import { useRegexCollection } from '@/composables/regex/useRegexCollection';

const props = defineProps<{
  type: 'worldbook' | 'regex';
  character: CharacterCardV3;
}>();

const emit = defineEmits<{
  (e: 'worldbook-changed'): void;
}>();

const showSelectorDialog = ref(false);

// 正则脚本导入功能
const { handleImportFromCharacterCard } = useRegexCollection();

// 基于 ID 的绑定：extensions.world_book_id
const linkedBookId = computed<string | null>(() => props.character.data?.extensions?.world_book_id || null);
const linkedBook = ref<any | null>(null);

const loadLinkedBook = async () => {
  if (!linkedBookId.value) {
    linkedBook.value = null;
    return;
  }
  try {
    const collection = await worldBookService.getFullWorldBookCollection();
    linkedBook.value = collection.books[linkedBookId.value] || null;
  } catch (e) {
    console.error('加载绑定世界书失败:', e);
    linkedBook.value = null;
  }
};

watch(linkedBookId, () => { loadLinkedBook(); }, { immediate: true });

// 是否已绑定（通过ID）
const hasWorldBook = computed(() => !!linkedBookId.value);

// 世界书名称
const worldBookName = computed(() => linkedBook.value?.name || '未命名');

// 世界书条目数量
const worldBookEntriesCount = computed(() => Array.isArray(linkedBook.value?.entries) ? linkedBook.value.entries.length : 0);

// 常驻条目数量
const constantEntriesCount = computed(() => Array.isArray(linkedBook.value?.entries) ? linkedBook.value.entries.filter((e: any) => e.constant).length : 0);

// 绑定世界书（通过ID，不复制数据，移除双向绑定）
const handleBindWorldBook = async (bookId: string) => {
  try {
    props.character.data.extensions = props.character.data.extensions || {};
    (props.character.data.extensions as any).world_book_id = bookId;
    // 可选：清空内联，避免混淆
    Object.assign(props.character.data, { character_book: [] });
    await loadLinkedBook();
    ElMessage.success('已绑定世界书');
    emit('worldbook-changed');
  } catch (error) {
    console.error('绑定世界书失败:', error);
    ElMessage.error(`绑定失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 发送到世界书
const handleSendToWorldBook = async () => {
  try {
    const book = props.character.data.character_book;
    if (Array.isArray(book) || !book || !book.entries || book.entries.length === 0) {
      ElMessage.warning('当前角色卡的世界书数据为空或格式不正确');
      return;
    }

    // 准备角色卡信息
    const characterId = props.character.id || 'unknown';
    const characterName = props.character.data.name || '未命名角色';

    // 检查是否已存在来自此角色卡的世界书
    const existingBookId = await worldBookService.findBookByCharacterId(characterId);

    let action: 'update' | 'new' = 'new';
    let bookName = book.name || `${props.character.data.name}的世界书`;

    if (existingBookId) {
      // 如果已存在，询问用户是更新还是创建新副本
      const { action: userAction } = await ElMessageBox.confirm(
        `检测到已存在来自此角色卡的世界书。\n\n当前世界书有 ${book.entries.length} 个条目。\n\n请选择操作：`,
        '发送到世界书',
        {
          confirmButtonText: '更新已有世界书',
          cancelButtonText: '创建新副本',
          distinguishCancelAndClose: true,
          type: 'warning',
        }
      ).then(() => ({ action: 'update' as const }))
        .catch((error) => {
          if (error === 'cancel') {
            return { action: 'new' as const };
          }
          throw error;
        });

      action = userAction;
    }

    if (action === 'new') {
      // 创建新世界书，提示用户输入名称
      const { value: inputName } = await ElMessageBox.prompt(
        `将角色卡的世界书(${book.entries.length} 个条目)保存为 APP 世界书。\n您可以在世界书页面编辑后再导出。`,
        '发送到世界书',
        {
          confirmButtonText: '确认发送',
          cancelButtonText: '取消',
          inputValue: bookName,
          inputPattern: /.+/,
          inputErrorMessage: '世界书名称不能为空',
        }
      );
      bookName = inputName;
    }

    // 创建要保存的 CharacterBook 对象
    const characterBook: CharacterBook = {
      name: bookName,
      description: book.description,
      entries: book.entries,
      extensions: book.extensions || {},
      scan_depth: book.scan_depth,
      token_budget: book.token_budget,
      recursive_scanning: book.recursive_scanning,
    };

    if (action === 'update' && existingBookId) {
      // 更新已有世界书
      await worldBookService.updateBookFromCharacterCard(
        existingBookId,
        characterBook,
        characterName
      );

      ElMessage.success({
        message: `已成功更新世界书"${bookName}"！包含 ${book.entries.length} 个条目。`,
        duration: 4000,
      });

      console.log('已更新世界书:', existingBookId);
    } else {
      // 创建新世界书
      const newBookId = await worldBookService.addBookFromCharacterCard(
        characterBook,
        characterId,
        characterName
      );

      ElMessage.success({
        message: `已成功将世界书保存为"${bookName}"！您可以在世界书页面查看和编辑。`,
        duration: 4000,
      });

      console.log('已创建世界书:', newBookId);
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('发送到世界书失败:', error);
      ElMessage.error(`发送失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
};

// 解绑世界书（移除ID及可能的来源标记，不再使用内联）
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

    // 检查是否存在来自此角色卡的世界书，如果有则清除来源信息
    const characterId = props.character.id;
    if (characterId) {
      try {
        const existingBookId = await worldBookService.findBookByCharacterId(characterId);
        if (existingBookId) {
          // 清除数据库中世界书的来源信息
          await worldBookService.clearBookSource(existingBookId);
          console.log('已清除世界书的来源信息:', existingBookId);
        }
      } catch (error) {
        console.warn('清除世界书来源信息失败:', error);
        // 不阻止解绑操作
      }
    }

    // 清空内联与ID绑定
    const ext = props.character.data.extensions || {};
    delete (ext as any).world_book_id;
    delete (ext as any).world;
    Object.assign(props.character.data, { character_book: [] , extensions: ext});

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

// 发送正则脚本到正则编辑器
const handleSendToRegexEditor = async () => {
  const scripts = props.character.data.extensions?.regex_scripts;
  
  if (!scripts || scripts.length === 0) {
    ElMessage.warning('当前角色卡没有正则脚本');
    return;
  }

  const characterId = props.character.id || 'unknown';
  const characterName = props.character.data.name || '未命名角色';

  try {
    const categoryId = await handleImportFromCharacterCard(
      scripts,
      characterId,
      characterName
    );

    if (categoryId) {
      ElMessage.success({
        message: `正则脚本已成功发送到正则编辑器！`,
        duration: 3000,
      });
    }
  } catch (error) {
    console.error('发送正则脚本失败:', error);
    ElMessage.error(`发送失败：${error instanceof Error ? error.message : '未知错误'}`);
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

.regex-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.regex-single-script,
.regex-multiple-scripts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.regex-scripts-list {
  padding: 8px;
}

.regex-script-tag {
  margin: 4px;
}

.regex-actions-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.el-scrollbar {
  height: 100%;
}
</style>
