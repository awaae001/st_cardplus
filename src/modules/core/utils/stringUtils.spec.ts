import { describe, it, expect } from 'vitest';
import {
  removeAllWhitespace,
  removeAllLineBreaks,
  replaceWhitespaceWithSingleSpace,
  processTextToArray,
  arrayToText,
} from './stringUtils';

describe('stringUtils', () => {
  describe('removeAllWhitespace', () => {
    it('should remove all whitespace characters', () => {
      expect(removeAllWhitespace('  hello   world  \n\t')).toBe('helloworld');
    });
    it('should return an empty string for null input', () => {
      expect(removeAllWhitespace(null)).toBe('');
    });
    it('should return an empty string for undefined input', () => {
      expect(removeAllWhitespace(undefined)).toBe('');
    });
    it('should return an empty string for an empty string input', () => {
      expect(removeAllWhitespace('')).toBe('');
    });
    it('should return the same string if no whitespace', () => {
      expect(removeAllWhitespace('abc')).toBe('abc');
    });
    it('should remove mixed whitespace characters', () => {
      expect(removeAllWhitespace('a\nb\tc d\r\ne')).toBe('abcde');
    });
  });

  describe('removeAllLineBreaks', () => {
    it('should remove all line break characters but keep other whitespace', () => {
      expect(removeAllLineBreaks('hello\nworld\r\n  test\rthis')).toBe('helloworld  testthis');
    });
    it('should return an empty string for null input', () => {
      expect(removeAllLineBreaks(null)).toBe('');
    });
    it('should return an empty string for undefined input', () => {
      expect(removeAllLineBreaks(undefined)).toBe('');
    });
    it('should return an empty string for an empty string input', () => {
      expect(removeAllLineBreaks('')).toBe('');
    });
    it('should return the same string if no line breaks', () => {
      expect(removeAllLineBreaks('abc def')).toBe('abc def');
    });
    it('should handle mixed line breaks correctly', () => {
      expect(removeAllLineBreaks('line1\nline2\rline3\r\nline4')).toBe('line1line2line3line4');
    });
  });

  describe('replaceWhitespaceWithSingleSpace', () => {
    it('should replace all consecutive whitespace characters with a single space', () => {
      expect(replaceWhitespaceWithSingleSpace('  hello \n\t world  ')).toBe(' hello world ');
    });
    it('should return an empty string for null input', () => {
      expect(replaceWhitespaceWithSingleSpace(null)).toBe('');
    });
    it('should return an empty string for undefined input', () => {
      expect(replaceWhitespaceWithSingleSpace(undefined)).toBe('');
    });
    it('should return an empty string for an empty string input', () => {
      expect(replaceWhitespaceWithSingleSpace('')).toBe('');
    });
    it('should return the same string if only single spaces exist or no whitespace', () => {
      expect(replaceWhitespaceWithSingleSpace('abc def')).toBe('abc def');
      expect(replaceWhitespaceWithSingleSpace('abc')).toBe('abc');
    });
    it('should correctly handle leading/trailing whitespace', () => {
      expect(replaceWhitespaceWithSingleSpace('\n test \t')).toBe(' test ');
    });
  });

  describe('processTextToArray', () => {
    it('should split text by newlines and filter empty/whitespace-only lines', () => {
      const text = 'line1\n  \nline2\n\nline3  \n';
      expect(processTextToArray(text)).toEqual(['line1', 'line2', 'line3  ']);
    });
    it('should return an empty array for undefined input', () => {
      expect(processTextToArray(undefined)).toEqual([]);
    });
    it('should return an empty array for an empty string input', () => {
      expect(processTextToArray('')).toEqual([]);
    });
    it('should return an empty array for a string with only whitespace lines', () => {
      expect(processTextToArray('\n  \n\t\n')).toEqual([]);
    });
    it('should return an array with one element for a single line text', () => {
      expect(processTextToArray('single line')).toEqual(['single line']);
    });
     it('should handle text with no newlines correctly', () => {
      expect(processTextToArray('line without newline')).toEqual(['line without newline']);
    });
  });

  describe('arrayToText', () => {
    it('should join array elements with newlines', () => {
      const arr = ['line1', 'line2', 'line3'];
      expect(arrayToText(arr)).toBe('line1\nline2\nline3');
    });
    it('should return an empty string for undefined input', () => {
      expect(arrayToText(undefined)).toBe('');
    });
    it('should return an empty string for an empty array input', () => {
      expect(arrayToText([])).toBe('');
    });
    it('should handle an array with a single element', () => {
      expect(arrayToText(['single line'])).toBe('single line');
    });
    it('should handle an array with empty strings', () => {
      expect(arrayToText(['line1', '', 'line3'])).toBe('line1\n\nline3');
    });
  });
});