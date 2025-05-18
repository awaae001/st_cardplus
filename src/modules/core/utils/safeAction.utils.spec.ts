import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ElMessage, ElMessageBox } from 'element-plus';
import { performSafeAction } from './safeAction.utils';
import type { SafeModeLevel } from '@core/store/appSettings.store';

// Mock Element Plus components
vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    },
    ElMessageBox: {
      confirm: vi.fn(),
    },
  };
});

describe('performSafeAction', () => {
  const mockActionFn = vi.fn();
  const mockActionName = '测试操作';
  const mockItemName = '测试项目';

  beforeEach(() => {
    vi.clearAllMocks();
    mockActionFn.mockReset();
  });

  it('should forbid action if safeModeLevel is "forbidden"', async () => {
    const safeModeLevel: SafeModeLevel = 'forbidden';
    await expect(
      performSafeAction(safeModeLevel, mockActionName, mockItemName, mockActionFn)
    ).rejects.toBe('forbidden');
    expect(ElMessage.warning).toHaveBeenCalledWith(`当前处于禁止模式，无法${mockActionName}。`);
    expect(mockActionFn).not.toHaveBeenCalled();
  });

  describe('safeModeLevel: "double"', () => {
    const safeModeLevel: SafeModeLevel = 'double';

    it('should call actionFn and show success message if user confirms', async () => {
      (ElMessageBox.confirm as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true); // User confirms
      mockActionFn.mockResolvedValueOnce(undefined); // Action succeeds

      await performSafeAction(safeModeLevel, mockActionName, mockItemName, mockActionFn);

      expect(ElMessageBox.confirm).toHaveBeenCalledOnce();
      expect(mockActionFn).toHaveBeenCalledOnce();
      expect(ElMessage.success).toHaveBeenCalledWith(`${mockActionName}成功！`);
    });

    it('should not call actionFn and show info message if user cancels', async () => {
      (ElMessageBox.confirm as ReturnType<typeof vi.fn>).mockRejectedValueOnce('cancel'); // User cancels

      await expect(
        performSafeAction(safeModeLevel, mockActionName, mockItemName, mockActionFn)
      ).rejects.toBe('cancel');

      expect(ElMessageBox.confirm).toHaveBeenCalledOnce();
      expect(mockActionFn).not.toHaveBeenCalled();
      expect(ElMessage.info).toHaveBeenCalledWith(`已取消${mockActionName}操作。`);
    });

    it('should handle actionFn throwing an error after confirmation', async () => {
      const actionError = new Error('Action failed');
      (ElMessageBox.confirm as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);
      mockActionFn.mockRejectedValueOnce(actionError);

      await expect(
        performSafeAction(safeModeLevel, mockActionName, mockItemName, mockActionFn)
      ).rejects.toThrow(actionError);

      expect(ElMessageBox.confirm).toHaveBeenCalledOnce();
      expect(mockActionFn).toHaveBeenCalledOnce();
      expect(ElMessage.error).toHaveBeenCalledWith(`${mockActionName}操作失败: ${actionError.message}`);
    });
  });

  describe('safeModeLevel: "single" (or default)', () => {
    const safeModeLevels: SafeModeLevel[] = ['single']; // Could add more if 'single' is the default fallback

    safeModeLevels.forEach((level) => {
      it(`should call actionFn directly and show success message for level "${level}"`, async () => {
        mockActionFn.mockResolvedValueOnce(undefined); // Action succeeds

        await performSafeAction(level, mockActionName, mockItemName, mockActionFn);

        expect(ElMessageBox.confirm).not.toHaveBeenCalled();
        expect(mockActionFn).toHaveBeenCalledOnce();
        expect(ElMessage.success).toHaveBeenCalledWith(`${mockActionName}成功！`);
      });

      it(`should handle actionFn throwing an error for level "${level}"`, async () => {
        const actionError = new Error('Direct action failed');
        mockActionFn.mockRejectedValueOnce(actionError);

        await expect(
          performSafeAction(level, mockActionName, mockItemName, mockActionFn)
        ).rejects.toThrow(actionError);
        
        expect(mockActionFn).toHaveBeenCalledOnce();
        expect(ElMessage.error).toHaveBeenCalledWith(`${mockActionName}操作失败: ${actionError.message}`);
      });
    });
  });

   it('should correctly build confirm messages with and without itemName', async () => {
    (ElMessageBox.confirm as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);
    mockActionFn.mockResolvedValueOnce(undefined);

    // With itemName
    await performSafeAction('double', mockActionName, mockItemName, mockActionFn);
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      `确定要${mockActionName} "${mockItemName}" 吗？`,
      `确认${mockActionName}`,
      expect.objectContaining({ confirmButtonText: `确定${mockActionName}` })
    );

    vi.clearAllMocks(); // Clear mocks for the next call
    (ElMessageBox.confirm as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);
    mockActionFn.mockResolvedValueOnce(undefined);

    // Without itemName
    await performSafeAction('double', mockActionName, '', mockActionFn);
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      `确定要${mockActionName}吗？`,
      `确认${mockActionName}`,
      expect.objectContaining({ confirmButtonText: '确定' })
    );
  });

  it('should handle non-Error rejections from actionFn', async () => {
    const nonErrorRejection = 'action_failed_string';
    (ElMessageBox.confirm as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);
    mockActionFn.mockRejectedValueOnce(nonErrorRejection);

    await expect(
      performSafeAction('double', mockActionName, mockItemName, mockActionFn)
    ).rejects.toBe(nonErrorRejection);
    
    expect(mockActionFn).toHaveBeenCalledOnce();
    expect(ElMessage.error).toHaveBeenCalledWith(`${mockActionName}操作失败: ${nonErrorRejection}`);
  });
});