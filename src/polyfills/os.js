// Browser polyfill for Node.js os module
export function platform() {
  return 'browser';
}

export function type() {
  return 'Browser';
}

export function arch() {
  return 'browser';
}

export function release() {
  return 'browser';
}

export function hostname() {
  return 'localhost';
}

export function tmpdir() {
  return '/tmp';
}

export function homedir() {
  return '/home';
}

export const EOL = '\n';

export default {
  platform,
  type,
  arch,
  release,
  hostname,
  tmpdir,
  homedir,
  EOL,
};
