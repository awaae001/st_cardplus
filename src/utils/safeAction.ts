import { ElMessage, ElMessageBox } from 'element-plus';
import type { SafeModeLevel } from '@/stores/appSettings';

export async function performSafeAction(
  safeModeLevel: SafeModeLevel,
  actionName: string,
  itemName: string = '',
  actionFn: () => void | Promise<void>
): Promise<void> {
  if (safeModeLevel === 'forbidden') {
    ElMessage.warning(`当前处于禁止模式，无法${actionName}。`);
    return Promise.reject('forbidden');
  }

  const confirmTitle = itemName ? `确认${actionName}` : `确认${actionName}`;
  const confirmMessage = itemName ? `确定要${actionName} "${itemName}" 吗？` : `确定要${actionName}吗？`;
  const confirmButtonText = itemName ? `确定${actionName}` : '确定';

  if (safeModeLevel === 'double') {
    try {
      await ElMessageBox.confirm(confirmMessage, confirmTitle, {
        confirmButtonText,
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true,
        customClass: 'app-dialog',
      });
      await actionFn();
      ElMessage.success(`${actionName}成功！`);
    } catch (e) {
      handleError(e, actionName);
    }
  } else if (safeModeLevel === 'single') {
    try {
      await actionFn();
      ElMessage.success(`${actionName}成功！`);
    } catch (e) {
      handleError(e, actionName);
    }
  } else {
    console.warn(`Unhandled safeModeLevel: ${safeModeLevel}. Performing action directly.`);
    try {
      await actionFn();
      ElMessage.success(`${actionName}成功！`);
    } catch (e) {
      handleError(e, actionName);
    }
  }
}

function handleError(e: any, actionName: string): void {
  if (e === 'cancel' || e?.message?.includes('cancel') || (e instanceof Error && e.message === 'cancel')) {
    ElMessage.info(`已取消${actionName}操作。`);
  } else {
    console.error(`${actionName}时出错:`, e);
    ElMessage.error(`${actionName}操作失败: ${e instanceof Error ? e.message : '未知错误'}`);
  }
}
