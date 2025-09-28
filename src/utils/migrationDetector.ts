import Dexie from 'dexie';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Router } from 'vue-router';

export interface MigrationDetectionResult {
  needsMigration: boolean;
  oldDatabaseExists: boolean;
  oldDataCount: {
    worldBooks: number;
    worldBookEntries: number;
  };
}

/**
 * 检测是否需要数据库迁移
 */
export async function detectMigrationNeeds(): Promise<MigrationDetectionResult> {
  const result: MigrationDetectionResult = {
    needsMigration: false,
    oldDatabaseExists: false,
    oldDataCount: {
      worldBooks: 0,
      worldBookEntries: 0,
    },
  };

  try {
    // 检测旧数据库是否存在
    const oldDb = new Dexie('worldBookDatabase');
    oldDb.version(1).stores({
      books: '&id, name, order, updatedAt',
      entries: '++id, bookId, uid',
    });

    await oldDb.open();
    result.oldDatabaseExists = true;

    // 统计旧数据库中的数据
    const booksCount = await oldDb.table('books').count();
    const entriesCount = await oldDb.table('entries').count();

    result.oldDataCount.worldBooks = booksCount;
    result.oldDataCount.worldBookEntries = entriesCount;

    // 如果有数据，则需要迁移
    result.needsMigration = booksCount > 0 || entriesCount > 0;

    await oldDb.close();
  } catch (error) {
    // 旧数据库不存在或无法访问
    console.log('旧数据库不存在或无法访问:', error);
  }

  return result;
}

/**
 * 检查是否已经显示过迁移提示
 */
export function hasShownMigrationPrompt(): boolean {
  const key = 'migration_prompt_shown';
  return localStorage.getItem(key) === 'true';
}

/**
 * 标记已显示迁移提示
 */
export function markMigrationPromptShown(): void {
  const key = 'migration_prompt_shown';
  localStorage.setItem(key, 'true');
}

/**
 * 显示迁移提示并引导用户到迁移页面
 */
export async function showMigrationPrompt(
  router: Router,
  detectionResult: MigrationDetectionResult
): Promise<void> {
  if (!detectionResult.needsMigration || hasShownMigrationPrompt()) {
    return;
  }

  try {
    const { worldBooks, worldBookEntries } = detectionResult.oldDataCount;

    await ElMessageBox.confirm(
      `检测到您有旧版本的数据库数据：\n\n• ${worldBooks} 个世界书\n• ${worldBookEntries} 个世界书条目\n\n为了确保数据安全和功能正常，建议您使用数据库迁移助手将数据迁移到新版本。\n\n是否现在进行迁移？`,
      '🚀 发现旧数据库',
      {
        confirmButtonText: '立即迁移',
        cancelButtonText: '稍后处理',
        type: 'warning',
        distinguishCancelAndClose: true,
        cancelButtonClass: 'el-button--info',
        center: true,
      }
    );

    // 用户选择立即迁移
    router.push('/migration');
    ElMessage.info('正在跳转到迁移助手...');
  } catch (action) {
    if (action === 'cancel') {
      // 用户选择稍后处理
      ElMessage.info('您可以随时在工具箱中找到"数据库迁移助手"');
    }
    // 无论如何都标记为已显示
    markMigrationPromptShown();
  }
}

/**
 * 自动检测并提示迁移（应用启动时调用）
 */
export async function autoDetectAndPromptMigration(router: Router): Promise<void> {
  try {
    const detectionResult = await detectMigrationNeeds();

    if (detectionResult.needsMigration) {
      // 延迟显示提示，避免与其他启动流程冲突
      setTimeout(() => {
        showMigrationPrompt(router, detectionResult);
      }, 2000);
    }
  } catch (error) {
    console.error('自动检测迁移失败:', error);
  }
}

/**
 * 重置迁移提示状态（用于测试或重置）
 */
export function resetMigrationPromptStatus(): void {
  const key = 'migration_prompt_shown';
  localStorage.removeItem(key);
}