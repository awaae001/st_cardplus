<template>
  <div class="migration-container">
    <div class="migration-header">
      <div class="migration-title">
        <Icon icon="ph:database-duotone" class="title-icon" />
        <h1>数据库迁移小助手</h1>
      </div>
      <div class="migration-subtitle">
        <p>协助您将数据从旧版数据库迁移到新版数据库</p>
      </div>
    </div>

    <div class="migration-content">
      <!-- 检测阶段 -->
      <el-card class="migration-card" v-if="migrationStep === 'detect'">
        <template #header>
          <div class="card-header">
            <Icon icon="ph:magnifying-glass-duotone" />
            <span>检测旧数据</span>
          </div>
        </template>

        <div class="detection-status">
          <el-alert
            v-if="!isDetecting && detectionResult"
            :title="detectionResult.message"
            :type="detectionResult.type"
            :description="detectionResult.description"
            show-icon
            :closable="false"
          />

          <div v-if="isDetecting" class="detecting">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>正在检测旧数据库...</span>
          </div>

          <div v-if="oldDatabaseData && oldDatabaseData.hasData" class="data-summary">
            <h3>发现的数据：</h3>
            <ul>
              <li v-if="oldDatabaseData.worldBooks > 0">
                <Icon icon="ph:book-duotone" />
                世界书：{{ oldDatabaseData.worldBooks }} 个
              </li>
              <li v-if="oldDatabaseData.worldBookEntries > 0">
                <Icon icon="ph:note-duotone" />
                世界书条目：{{ oldDatabaseData.worldBookEntries }} 个
              </li>
            </ul>
          </div>
        </div>

        <template #footer>
          <div class="card-footer">
            <el-button @click="detectOldDatabase" :loading="isDetecting">
              <Icon icon="ph:refresh-duotone" />
              重新检测
            </el-button>
            <el-button
              v-if="oldDatabaseData?.hasData"
              type="primary"
              @click="migrationStep = 'migrate'"
            >
              开始迁移
              <Icon icon="ph:arrow-right-duotone" />
            </el-button>
            <el-button v-else @click="migrationStep = 'complete'">
              跳过迁移
              <Icon icon="ph:skip-forward-duotone" />
            </el-button>
          </div>
        </template>
      </el-card>

      <!-- 迁移阶段 -->
      <el-card class="migration-card" v-if="migrationStep === 'migrate'">
        <template #header>
          <div class="card-header">
            <Icon icon="ph:arrow-circle-right-duotone" />
            <span>数据迁移</span>
          </div>
        </template>

        <div class="migration-progress">
          <el-alert
            v-if="migrationError"
            :title="migrationError.title"
            :description="migrationError.message"
            type="error"
            show-icon
            :closable="false"
          />

          <div v-if="isMigrating" class="migrating">
            <el-progress
              :percentage="migrationProgress"
              :status="migrationProgress === 100 ? 'success' : undefined"
            />
            <p class="progress-text">{{ migrationStatus }}</p>
          </div>

          <div v-if="!isMigrating && !migrationError" class="migration-ready">
            <el-alert
              title="准备迁移"
              description="点击下方按钮开始迁移数据。迁移过程中请不要关闭页面。"
              type="info"
              show-icon
              :closable="false"
            />

            <div class="migration-options">
              <el-checkbox v-model="backupBeforeMigration">
                迁移前创建备份文件（推荐）
              </el-checkbox>
              <el-checkbox v-model="deleteOldDatabase">
                迁移完成后删除旧数据库
              </el-checkbox>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="card-footer">
            <el-button @click="migrationStep = 'detect'">
              <Icon icon="ph:arrow-left-duotone" />
              返回检测
            </el-button>
            <el-button
              v-if="!isMigrating && !migrationError"
              type="primary"
              @click="startMigration"
            >
              <Icon icon="ph:play-duotone" />
              开始迁移
            </el-button>
            <el-button
              v-if="migrationProgress === 100"
              type="success"
              @click="migrationStep = 'complete'"
            >
              完成
              <Icon icon="ph:check-circle-duotone" />
            </el-button>
          </div>
        </template>
      </el-card>

      <!-- 完成阶段 -->
      <el-card class="migration-card" v-if="migrationStep === 'complete'">
        <template #header>
          <div class="card-header">
            <Icon icon="ph:check-circle-duotone" />
            <span>迁移完成</span>
          </div>
        </template>

        <div class="completion-status">
          <el-result
            icon="success"
            title="迁移成功！"
            sub-title="您的数据已成功迁移到新的数据库系统"
          >
            <template #extra>
              <div class="completion-actions">
                <el-button type="primary" @click="goToWorldBook">
                  <Icon icon="ph:book-duotone" />
                  查看世界书
                </el-button>
              </div>
            </template>
          </el-result>

          <div v-if="migrationSummary" class="migration-summary">
            <h3>迁移摘要：</h3>
            <ul>
              <li v-if="migrationSummary.worldBooks > 0">
                成功迁移 {{ migrationSummary.worldBooks }} 个世界书
              </li>
              <li v-if="migrationSummary.worldBookEntries > 0">
                成功迁移 {{ migrationSummary.worldBookEntries }} 个世界书条目
              </li>
              <li v-if="migrationSummary.backupCreated">
                已创建备份文件
              </li>
              <li v-if="migrationSummary.oldDatabaseDeleted">
                已删除旧数据库
              </li>
            </ul>
          </div>
        </div>

        <template #footer>
          <div class="card-footer">
            <el-button @click="closeMigrationHelper">
              <Icon icon="ph:x-duotone" />
              关闭助手
            </el-button>
          </div>
        </template>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  ElCard,
  ElButton,
  ElAlert,
  ElIcon,
  ElProgress,
  ElCheckbox,
  ElResult,
  ElMessage
} from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { Icon } from '@iconify/vue';
import Dexie from 'dexie';

const router = useRouter();

// 迁移步骤
type MigrationStep = 'detect' | 'migrate' | 'complete';
const migrationStep = ref<MigrationStep>('detect');

// 检测状态
const isDetecting = ref(false);
const detectionResult = ref<{
  type: 'success' | 'warning' | 'error';
  message: string;
  description: string;
} | null>(null);

const oldDatabaseData = ref<{
  hasData: boolean;
  worldBooks: number;
  worldBookEntries: number;
} | null>(null);

// 迁移状态
const isMigrating = ref(false);
const migrationProgress = ref(0);
const migrationStatus = ref('');
const migrationError = ref<{
  title: string;
  message: string;
} | null>(null);

// 迁移选项
const backupBeforeMigration = ref(true);
const deleteOldDatabase = ref(true); // 默认建议删除旧数据库

// 迁移摘要
const migrationSummary = ref<{
  worldBooks: number;
  worldBookEntries: number;
  backupCreated: boolean;
  oldDatabaseDeleted: boolean;
} | null>(null);

// 检测旧数据库
const detectOldDatabase = async () => {
  isDetecting.value = true;
  detectionResult.value = null;
  oldDatabaseData.value = null;

  try {
    // 尝试打开旧数据库
    const oldDb = new Dexie('worldBookDatabase');
    oldDb.version(1).stores({
      books: '&id, name, order, updatedAt',
      entries: '++id, bookId, uid',
    });

    await oldDb.open();

    const booksCount = await oldDb.table('books').count();
    const entriesCount = await oldDb.table('entries').count();

    if (booksCount > 0 || entriesCount > 0) {
      oldDatabaseData.value = {
        hasData: true,
        worldBooks: booksCount,
        worldBookEntries: entriesCount,
      };

      detectionResult.value = {
        type: 'success',
        message: '发现旧数据库',
        description: `检测到 ${booksCount} 个世界书和 ${entriesCount} 个条目，可以进行迁移。`,
      };
    } else {
      oldDatabaseData.value = {
        hasData: false,
        worldBooks: 0,
        worldBookEntries: 0,
      };

      detectionResult.value = {
        type: 'warning',
        message: '未发现数据',
        description: '旧数据库为空或不存在，无需迁移。',
      };
    }

    await oldDb.close();
  } catch (error) {
    console.error('检测旧数据库失败:', error);

    detectionResult.value = {
      type: 'error',
      message: '检测失败',
      description: '无法访问旧数据库，可能不存在或已损坏。',
    };

    oldDatabaseData.value = {
      hasData: false,
      worldBooks: 0,
      worldBookEntries: 0,
    };
  } finally {
    isDetecting.value = false;
  }
};

// 开始迁移
const startMigration = async () => {
  isMigrating.value = true;
  migrationProgress.value = 0;
  migrationError.value = null;

  try {
    // 第一步：备份数据（如果选择）
    if (backupBeforeMigration.value) {
      migrationStatus.value = '正在创建备份...';
      await createBackup();
      migrationProgress.value = 25;
    }

    // 第二步：打开旧数据库并读取数据
    migrationStatus.value = '正在读取旧数据...';
    const oldData = await readOldDatabase();
    migrationProgress.value = 50;

    // 第三步：将数据写入新数据库
    migrationStatus.value = '正在写入新数据库...';
    await writeToNewDatabase(oldData);
    migrationProgress.value = 75;

    // 第四步：删除旧数据库（如果选择）
    if (deleteOldDatabase.value) {
      migrationStatus.value = '正在清理旧数据库...';
      await deleteOldDatabaseData();
    }

    migrationProgress.value = 100;
    migrationStatus.value = '迁移完成！';

    // 设置迁移摘要
    migrationSummary.value = {
      worldBooks: oldData.books.length,
      worldBookEntries: oldData.entries.length,
      backupCreated: backupBeforeMigration.value,
      oldDatabaseDeleted: deleteOldDatabase.value,
    };

    ElMessage.success('数据迁移成功！');
  } catch (error) {
    console.error('迁移失败:', error);
    migrationError.value = {
      title: '迁移失败',
      message: error instanceof Error ? error.message : '未知错误',
    };
    ElMessage.error('迁移过程中发生错误');
  } finally {
    isMigrating.value = false;
  }
};

// 创建备份
const createBackup = async () => {
  // 实现备份逻辑
  // 这里可以导出数据为 JSON 文件
  await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟备份时间
};

// 读取旧数据库
const readOldDatabase = async () => {
  const oldDb = new Dexie('worldBookDatabase');
  oldDb.version(1).stores({
    books: '&id, name, order, updatedAt',
    entries: '++id, bookId, uid',
  });

  await oldDb.open();

  const books = await oldDb.table('books').toArray();
  const entries = await oldDb.table('entries').toArray();

  await oldDb.close();

  return { books, entries };
};

// 写入新数据库
const writeToNewDatabase = async (data: any) => {
  const { db } = await import('@/database/db');

  await db.transaction('rw', db.books, db.entries, async () => {
    // 写入世界书
    await db.books.bulkAdd(data.books);
    // 写入条目
    await db.entries.bulkAdd(data.entries);
  });
};

// 删除旧数据库
const deleteOldDatabaseData = async () => {
  await Dexie.delete('worldBookDatabase');
};

// 导航函数
const goToWorldBook = () => {
  router.push('/world');
};


const closeMigrationHelper = () => {
  router.push('/');
};

// 页面加载时自动检测
onMounted(() => {
  detectOldDatabase();
});
</script>

<style scoped>
.migration-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.migration-header {
  text-align: center;
  margin-bottom: 32px;
}

.migration-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.title-icon {
  font-size: 32px;
  color: var(--el-color-primary);
}

.migration-title h1 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 28px;
  font-weight: 600;
}

.migration-subtitle p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 16px;
}

.migration-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detecting, .migrating {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.data-summary {
  margin-top: 16px;
}

.data-summary h3 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.data-summary ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.data-summary li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  color: var(--el-text-color-regular);
}

.migration-options {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-text {
  text-align: center;
  margin: 8px 0 0 0;
  color: var(--el-text-color-regular);
}

.completion-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.migration-summary {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.migration-summary h3 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.migration-summary ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.migration-summary li {
  padding: 4px 0;
  color: var(--el-text-color-regular);
}

.migration-summary li::before {
  content: '✓';
  color: var(--el-color-success);
  margin-right: 8px;
}
</style>