/**
 * @file 提供统一的安全操作执行流程，结合安全模式进行操作确认。
 */
import { ElMessage, ElMessageBox } from 'element-plus';
import type { SafeModeLevel } from '@core/store/appSettings.store';

/**
 * @function performSafeAction
 * @description 根据当前的安全模式级别，执行一个可能需要用户确认的操作。
 *              如果操作成功，Promise 会 resolve。
 *              如果操作被安全模式禁止、用户取消确认，或实际操作函数 (`actionFn`) 抛出错误，Promise 会 reject。
 * @param {SafeModeLevel} safeModeLevel - 当前的安全模式级别 ('forbidden', 'double', 'single')。
 * @param {string} actionName - 操作的描述性中文名称，用于构建提示信息 (例如 "删除角色卡")。
 * @param {string} [itemName=''] - (可选) 具体操作对象的名称，用于更详细的提示 (例如 "角色卡 '我的角色'")。
 * @param {() => void | Promise<void>} actionFn - 要执行的实际操作函数。此函数可以是同步的，也可以返回一个 Promise。
 * @returns {Promise<void>} 一个 Promise，在操作成功执行后 resolve。
 * @throws {string | Error} 当操作被禁止 (`'forbidden'`)、用户取消 (`'cancel'`) 或 `actionFn` 抛出错误时，Promise 会 reject，并抛出相应的错误信息或原始错误。
 */
export async function performSafeAction(
  safeModeLevel: SafeModeLevel,
  actionName: string,
  itemName: string = '',
  actionFn: () => void | Promise<void>
): Promise<void> {
  if (safeModeLevel === 'forbidden') {
    ElMessage.warning(`当前处于禁止模式，无法${actionName}。`);
    throw 'forbidden';
  }

  const confirmTitle = itemName ? `确认${actionName}` : `确认${actionName}`;
  const confirmMessage = itemName ? `确定要${actionName} "${itemName}" 吗？` : `确定要${actionName}吗？`;
  const confirmButtonText = itemName ? `确定${actionName}` : '确定';

  try {
    if (safeModeLevel === 'double') {
      await ElMessageBox.confirm(confirmMessage, confirmTitle, {
        confirmButtonText,
        cancelButtonText: '取消',
        type: 'warning',
        draggable: true,
        customClass: 'app-dialog',
      });
    }
    // 对于 'single' 或其他未明确处理的级别 (视为直接执行)
    // 或者 'double' 确认后，执行 actionFn
    await actionFn();
    ElMessage.success(`${actionName}成功！`);
  } catch (e: unknown) {
    // ElMessageBox.confirm 在用户点击取消或关闭时会 reject
    // actionFn 也可能抛出错误
    handleError(e, actionName); // handleError 将会 re-throw，导致 performSafeAction 的 Promise reject
  }
}

/**
 * @function handleError
 * @private
 * @description 内部辅助函数，用于统一处理 `performSafeAction` 中捕获的错误和用户取消操作的情况。
 *              此函数会根据错误类型显示相应的提示信息，并重新抛出错误或一个表示取消的特定字符串，
 *              以确保 `performSafeAction` 返回的 Promise 正确地 reject。
 * @param {unknown} e - `try...catch` 块中捕获到的错误或 Element Plus MessageBox 取消时 reject 的值。
 * @param {string} actionName - 操作的描述性中文名称，用于构建提示信息。
 * @throws {string | Error} 重新抛出原始错误，或在用户取消时抛出字符串 `'cancel'`。
 */
function handleError(e: unknown, actionName: string): void {
  let errorMessage = '未知错误';
  let isCancel = false;

  // 检查是否为 ElMessageBox 的取消操作 (通常 reject 的是字符串 'cancel')
  if (typeof e === 'string' && e.toLowerCase() === 'cancel') {
    isCancel = true;
  } else if (e instanceof Error) { // 标准错误对象
    errorMessage = e.message;
    if (e.message?.toLowerCase().includes('cancel')) { // 有些库可能在 Error message 中包含 cancel
      isCancel = true;
    }
  } else if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message: string }).message === 'string') {
    // 其他类型的错误对象，尝试读取 message 属性
    errorMessage = (e as { message: string }).message;
    if (errorMessage.toLowerCase().includes('cancel')) {
      isCancel = true;
    }
  } else if (typeof e === 'string') { // 其他字符串类型的错误/信息
    errorMessage = e;
  }

  if (isCancel) {
    ElMessage.info(`已取消${actionName}操作。`);
    throw 'cancel'; // 抛出 'cancel' 字符串，使 performSafeAction 的 Promise reject
  } else {
    console.error(`${actionName}时发生错误:`, e);
    ElMessage.error(`${actionName}操作失败: ${errorMessage}`);
    throw e; // 重新抛出原始错误或包装后的错误，使 Promise reject
  }
}