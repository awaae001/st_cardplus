// fs 模块的浏览器兼容性 polyfill
export const readFileSync = () => {
  throw new Error('fs.readFileSync is not available in browser environment');
};

export const writeFileSync = () => {
  throw new Error('fs.writeFileSync is not available in browser environment');
};

export const existsSync = () => false;

export default {
  readFileSync,
  writeFileSync,
  existsSync,
};
