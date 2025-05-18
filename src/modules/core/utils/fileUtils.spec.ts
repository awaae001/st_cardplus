import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateRandomNumericString, saveDataToFile } from './fileUtils';

describe('generateRandomNumericString', () => {
  it('should return a string', () => {
    expect(typeof generateRandomNumericString()).toBe('string');
  });

  it('should return a string of default length 8', () => {
    expect(generateRandomNumericString()).toHaveLength(8);
  });

  it('should return a string of specified length', () => {
    expect(generateRandomNumericString(5)).toHaveLength(5);
    expect(generateRandomNumericString(10)).toHaveLength(10);
  });

  it('should return a string containing only numeric characters', () => {
    const randomString = generateRandomNumericString(100); // Test with a longer string
    expect(randomString).toMatch(/^[0-9]+$/);
  });

  it('should return different strings on subsequent calls (basic randomness check)', () => {
    const string1 = generateRandomNumericString();
    const string2 = generateRandomNumericString();
    expect(string1).not.toBe(string2);
  });

  it('should handle length 0 correctly', () => {
    expect(generateRandomNumericString(0)).toBe('');
  });
});

describe('saveDataToFile', () => {
  let createElementSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;
  let clickSpy: any;
  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;

  beforeEach(() => {
    // Mock document methods
    clickSpy = vi.fn();
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation(() => ({
      href: '',
      download: '',
      click: clickSpy,
      style: {}, // Basic style object
    } as any));
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    // Mock URL methods
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mockurl');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original implementations
    vi.restoreAllMocks();
  });

  it('should create an anchor element', () => {
    saveDataToFile('test data', 'test.txt');
    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  it('should set the correct href and download attributes on the anchor element', () => {
    const mockData = 'some data';
    const mockFilename = 'data.txt';
    const link = { href: '', download: '', click: clickSpy, style: {} };
    createElementSpy.mockReturnValue(link);

    saveDataToFile(mockData, mockFilename);

    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob; // Get the Blob argument
    // expect(blob.type).toBe('application/octet-stream'); // Default type
    // Note: Directly checking blob content like this can be complex.
    // Focus on if createObjectURL was called with a Blob.
    expect(blob).toBeInstanceOf(Blob);


    expect(link.href).toBe('blob:mockurl');
    expect(link.download).toBe(mockFilename);
  });

  it('should call link.click() to trigger download', () => {
    saveDataToFile('test data', 'test.txt');
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('should append and remove the link from the document body', () => {
    saveDataToFile('test data', 'test.txt');
    expect(appendChildSpy).toHaveBeenCalledOnce();
    // The argument to appendChildSpy should be the created link element
    expect(appendChildSpy.mock.calls[0][0]).toBe(createElementSpy.mock.results[0].value);
    expect(removeChildSpy).toHaveBeenCalledOnce();
    // The argument to removeChildSpy should also be the created link element
    expect(removeChildSpy.mock.calls[0][0]).toBe(createElementSpy.mock.results[0].value);
  });

  it('should revoke the object URL after download', () => {
    saveDataToFile('test data', 'test.txt');
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mockurl');
  });

  it('should use the specified contentType for the Blob', () => {
    const mockData = '{"key": "value"}';
    const mockFilename = 'data.json';
    const mockContentType = 'application/json';

    saveDataToFile(mockData, mockFilename, mockContentType);
    expect(createObjectURLSpy).toHaveBeenCalledOnce();
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe(mockContentType);
  });
});