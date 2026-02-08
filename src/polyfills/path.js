// Browser polyfill for Node.js path module
export function resolve(...paths) {
  return paths.join('/').replace(/\/+/g, '/');
}

export function join(...paths) {
  return paths.join('/').replace(/\/+/g, '/');
}

export function dirname(path) {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '/';
}

export function basename(path, ext) {
  const name = path.split('/').pop();
  if (ext && name.endsWith(ext)) {
    return name.slice(0, -ext.length);
  }
  return name;
}

export function extname(path) {
  const name = basename(path);
  const index = name.lastIndexOf('.');
  return index > 0 ? name.slice(index) : '';
}

export const sep = '/';
export const delimiter = ':';

export default {
  resolve,
  join,
  dirname,
  basename,
  extname,
  sep,
  delimiter,
};
