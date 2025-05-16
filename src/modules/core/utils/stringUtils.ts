// src/modules/core/utils/stringUtils.ts

/**
 * @file 字符串处理相关的工具函数
 */

/**
 * @function removeAllWhitespace
 * @description 移除字符串中所有的空白字符 (包括空格、换行符、制表符等)。
 * @param {string | null | undefined} str - 需要处理的原始字符串。
 * @returns {string} 移除了所有空白字符后的新字符串。如果输入为 null 或 undefined，则返回空字符串。
 */
export const removeAllWhitespace = (str: string | null | undefined): string => {
  if (str === null || str === undefined) {
    return '';
  }
  return str.replace(/\s+/g, '');
};

/**
 * @function removeAllLineBreaks
 * @description 移除字符串中所有的换行符 (CRLF, LF, CR)，但保留其他空白字符（如空格、制表符）。
 * @param {string | null | undefined} str - 需要处理的原始字符串。
 * @returns {string} 移除了所有换行符后的新字符串。如果输入为 null 或 undefined，则返回空字符串。
 */
export const removeAllLineBreaks = (str: string | null | undefined): string => {
  if (str === null || str === undefined) {
    return '';
  }
  return str.replace(/(\r\n|\n|\r)/gm, '');
};

/**
 * @function replaceWhitespaceWithSingleSpace
 * @description 将字符串中所有连续的空白字符（包括换行符、制表符等）替换为单个空格。
 * @param {string | null | undefined} str - 需要处理的原始字符串。
 * @returns {string} 处理后的新字符串。如果输入为 null 或 undefined，则返回空字符串。
 */
export const replaceWhitespaceWithSingleSpace = (str: string | null | undefined): string => {
  if (str === null || str === undefined) {
    return '';
  }
  return str.replace(/\s+/g, ' ');
};

/**
 * @function processTextToArray
 * @description 将以换行符分隔的文本字符串转换为字符串数组，并过滤掉空行或仅包含空白字符的行。
 * @param {string | undefined} text - 需要处理的文本字符串。
 * @returns {string[]} 处理后的字符串数组。如果输入为 undefined，则返回空数组。
 */
export const processTextToArray = (text: string | undefined): string[] => {
  return text ? text.split("\n").filter((line) => line.trim() !== "") : [];
};

/**
 * @function arrayToText
 * @description 将字符串数组转换为以换行符分隔的单个文本字符串。
 * @param {string[] | undefined} arr - 需要处理的字符串数组。
 * @returns {string} 处理后的文本字符串。如果输入为 undefined，则返回空字符串。
 */
export const arrayToText = (arr: string[] | undefined): string => {
  return arr && Array.isArray(arr) ? arr.join("\n") : "";
};