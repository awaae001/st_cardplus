import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ElMessage } from 'element-plus';
import { copyTextToClipboard } from './clipboard.utils';

// Mock Element Plus ElMessage
vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('copyTextToClipboard', () => {
  const mockTextToCopy = 'Hello, clipboard!';
  const mockSuccessMessage = '复制成功啦！';
  const mockErrorMessage = '复制出错了！';

  // Store original clipboard and restore it after tests
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    vi.clearAllMocks();
    // Define a writable clipboard object for mocking
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore the original clipboard object
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  it('should call navigator.clipboard.writeText with the given text', async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
    await copyTextToClipboard(mockTextToCopy);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockTextToCopy);
  });

  it('should show success message and return true when copy is successful', async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
    const result = await copyTextToClipboard(mockTextToCopy, mockSuccessMessage);
    expect(ElMessage.success).toHaveBeenCalledWith(mockSuccessMessage);
    expect(result).toBe(true);
  });

  it('should use default success message if none is provided', async () => {
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
    await copyTextToClipboard(mockTextToCopy);
    expect(ElMessage.success).toHaveBeenCalledWith('已复制到剪贴板');
  });

  it('should show error message and return false when navigator.clipboard is not available', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    const result = await copyTextToClipboard(mockTextToCopy);
    expect(ElMessage.error).toHaveBeenCalledWith('当前浏览器不支持剪贴板 API');
    expect(result).toBe(false);
  });

  it('should show error message and return false when writeText fails', async () => {
    const error = new Error('Clipboard write failed');
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
    const result = await copyTextToClipboard(mockTextToCopy, mockSuccessMessage, mockErrorMessage);
    expect(ElMessage.error).toHaveBeenCalledWith(mockErrorMessage);
    expect(result).toBe(false);
  });

  it('should use default error message if writeText fails and no custom message is provided', async () => {
    const error = new Error('Clipboard write failed');
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);
    await copyTextToClipboard(mockTextToCopy);
    expect(ElMessage.error).toHaveBeenCalledWith('复制失败，请检查浏览器权限或手动复制');
  });
});