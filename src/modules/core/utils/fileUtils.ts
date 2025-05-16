/**
 * @file 通用文件操作相关的工具函数
 */

/**
 * @description 生成指定长度的随机数字字符串。
 * @param {number} [length=8] - 随机字符串的长度，默认为 8。
 * @returns {string} 生成的随机数字字符串。
 */
export const generateRandomNumericString = (length: number = 8): string => {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * @description 将数据保存为文件并触发浏览器下载。
 * @param {BlobPart} data - 要保存的数据，可以是字符串、Blob、ArrayBuffer等。
 * @param {string} filename - 下载文件的建议文件名。
 * @param {string} [contentType='application/octet-stream'] - 内容的MIME类型，默认为通用二进制流。
 */
export const saveDataToFile = (data: BlobPart, filename: string, contentType: string = 'application/octet-stream'): void => {
  const blob = new Blob([data], { type: contentType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  // Firefox 需要将链接添加到 DOM 中才能正确触发下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};