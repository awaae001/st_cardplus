import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  initAutoSave,
  clearAutoSave,
} from './localStorage.utils';

const TEST_KEY = 'testStorageKey';
const TEST_DATA = { message: 'hello world' };
const TEST_DATA_STRINGIFIED = JSON.stringify(TEST_DATA);

describe('localStorage Utils', () => {
  let getItemSpy: import('vitest').SpyInstance;
  let setItemSpy: import('vitest').SpyInstance;
  let removeItemSpy: import('vitest').SpyInstance;
  let consoleErrorSpy: import('vitest').SpyInstance;
  let consoleLogSpy: import('vitest').SpyInstance;


  beforeEach(() => {
    // localStorage is tricky to mock directly in Vitest/JSDOM if not fully implemented.
    // We can spy on its methods if they exist, or provide a simple mock.
    const mockStorage: Record<string, string> = {};
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => mockStorage[key] || null);
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => { mockStorage[key] = value; });
    removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => { delete mockStorage[key]; });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveToLocalStorage', () => {
    it('should call localStorage.setItem with the correct key and stringified data', () => {
      saveToLocalStorage(TEST_DATA, TEST_KEY);
      expect(setItemSpy).toHaveBeenCalledWith(TEST_KEY, TEST_DATA_STRINGIFIED);
      expect(consoleLogSpy).toHaveBeenCalledWith('数据已保存到本地存储, key:', TEST_KEY);
    });

    it('should use default key if no key is provided', () => {
      saveToLocalStorage(TEST_DATA);
      expect(setItemSpy).toHaveBeenCalledWith('characterCardData', TEST_DATA_STRINGIFIED);
    });

    it('should log an error if localStorage.setItem fails', () => {
      setItemSpy.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });
      saveToLocalStorage(TEST_DATA, TEST_KEY);
      expect(consoleErrorSpy).toHaveBeenCalledWith('保存到本地存储失败:', expect.any(Error));
    });
  });

  describe('loadFromLocalStorage', () => {
    it('should call localStorage.getItem with the correct key', () => {
      loadFromLocalStorage(TEST_KEY);
      expect(getItemSpy).toHaveBeenCalledWith(TEST_KEY);
    });

    it('should return parsed data if found', () => {
      setItemSpy(TEST_KEY, TEST_DATA_STRINGIFIED); // Simulate data being present
      // Re-mock getItem for this specific test case to ensure it returns the value set by setItemSpy
      getItemSpy.mockReturnValueOnce(TEST_DATA_STRINGIFIED);
      const loadedData = loadFromLocalStorage(TEST_KEY);
      expect(loadedData).toEqual(TEST_DATA);
    });

    it('should return null if data is not found', () => {
      getItemSpy.mockReturnValueOnce(null);
      const loadedData = loadFromLocalStorage('nonExistentKey');
      expect(loadedData).toBeNull();
    });

    it('should call processFn with parsed data if provided', () => {
      const processFn = vi.fn((data) => ({ ...data, processed: true }));
      setItemSpy(TEST_KEY, TEST_DATA_STRINGIFIED);
      getItemSpy.mockReturnValueOnce(TEST_DATA_STRINGIFIED);
      loadFromLocalStorage(TEST_KEY, processFn);
      expect(processFn).toHaveBeenCalledWith(TEST_DATA);
    });

    it('should return the result of processFn', () => {
      const processedResult = { message: 'processed data' };
      const processFn = vi.fn().mockReturnValue(processedResult);
      setItemSpy(TEST_KEY, TEST_DATA_STRINGIFIED);
      getItemSpy.mockReturnValueOnce(TEST_DATA_STRINGIFIED);
      const loadedData = loadFromLocalStorage(TEST_KEY, processFn);
      expect(loadedData).toEqual(processedResult);
    });

    it('should log an error and return null if JSON.parse fails', () => {
      getItemSpy.mockReturnValueOnce('invalid json');
      const loadedData = loadFromLocalStorage(TEST_KEY);
      expect(consoleErrorSpy).toHaveBeenCalledWith('从本地存储加载失败:', expect.any(Error));
      expect(loadedData).toBeNull();
    });
  });

  describe('clearLocalStorage', () => {
    it('should call localStorage.removeItem with the correct key', () => {
      clearLocalStorage(TEST_KEY);
      expect(removeItemSpy).toHaveBeenCalledWith(TEST_KEY);
      expect(consoleLogSpy).toHaveBeenCalledWith('本地存储数据已清除, key:', TEST_KEY);
    });

    it('should use default key if no key is provided', () => {
      clearLocalStorage();
      expect(removeItemSpy).toHaveBeenCalledWith('characterCardData');
    });

     it('should log an error if localStorage.removeItem fails', () => {
      removeItemSpy.mockImplementationOnce(() => {
        throw new Error('Failed to remove');
      });
      clearLocalStorage(TEST_KEY);
      expect(consoleErrorSpy).toHaveBeenCalledWith('清除本地存储数据失败:', expect.any(Error));
    });
  });
});

describe('AutoSave Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'setInterval');
    vi.spyOn(window, 'clearInterval');
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initAutoSave', () => {
    it('should call window.setInterval with the given interval', () => {
      const saveFn = vi.fn();
      const conditionFn = vi.fn(() => true);
      const interval = 10000;
      initAutoSave(saveFn, conditionFn, interval);
      expect(window.setInterval).toHaveBeenCalledWith(expect.any(Function), interval);
    });

    it('should call saveFn if conditionFn returns true', () => {
      const saveFn = vi.fn();
      const conditionFn = vi.fn(() => true);
      initAutoSave(saveFn, conditionFn, 1000);
      
      vi.advanceTimersByTime(1000);
      expect(saveFn).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(1000);
      expect(saveFn).toHaveBeenCalledTimes(2);
    });

    it('should not call saveFn if conditionFn returns false', () => {
      const saveFn = vi.fn();
      const conditionFn = vi.fn(() => false);
      initAutoSave(saveFn, conditionFn, 1000);
      
      vi.advanceTimersByTime(1000);
      expect(saveFn).not.toHaveBeenCalled();
    });

    it('should use default interval if not provided', () => {
      const saveFn = vi.fn();
      const conditionFn = vi.fn(() => true);
      const DEFAULT_INTERVAL = 5000; // As defined in the source
      initAutoSave(saveFn, conditionFn);
      expect(window.setInterval).toHaveBeenCalledWith(expect.any(Function), DEFAULT_INTERVAL);
    });
  });

  describe('clearAutoSave', () => {
    it('should call window.clearInterval with the timerId if provided', () => {
      const timerId = 12345;
      clearAutoSave(timerId);
      expect(window.clearInterval).toHaveBeenCalledWith(timerId);
    });

    it('should not call window.clearInterval if timerId is null', () => {
      clearAutoSave(null);
      expect(window.clearInterval).not.toHaveBeenCalled();
    });

    it('should not call window.clearInterval if timerId is undefined', () => {
      clearAutoSave(undefined);
      expect(window.clearInterval).not.toHaveBeenCalled();
    });
  });
});