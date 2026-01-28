import { createClient } from 'webdav';
import type { WebDAVClientOptions } from 'webdav';

export interface WebDAVConnectionOptions extends WebDAVClientOptions {
  url: string;
}

/**
 * 创建一个 WebDAV 客户端实例
 * @param options - WebDAV 连接选项
 * @returns WebDAV 客户端实例
 */
export function createWebDAVClient(options: WebDAVConnectionOptions) {
  return createClient(options.url, {
    username: options.username,
    password: options.password,
  });
}

/**
 * 上传文件到 WebDAV 服务器
 * @param options - WebDAV 连接选项
 * @param remotePath - 远程服务器上的文件路径
 * @param data - 要上传的数据 (字符串)
 * @returns Promise<void>
 */
export async function uploadToWebDAV(options: WebDAVConnectionOptions, remotePath: string, data: string) {
  const client = createWebDAVClient(options);
  await client.putFileContents(remotePath, data, { overwrite: true });
}

function buildWebDAVUrl(baseUrl: string, remotePath: string) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(remotePath, normalizedBase).toString();
}

function buildAuthHeader(options: WebDAVConnectionOptions) {
  if (!options.username && !options.password) return null;
  const token = btoa(`${options.username ?? ''}:${options.password ?? ''}`);
  return `Basic ${token}`;
}

export async function uploadToWebDAVWithProgress(
  options: WebDAVConnectionOptions,
  remotePath: string,
  data: string,
  onProgress?: (progress: number) => void
) {
  const url = buildWebDAVUrl(options.url, remotePath);
  const authHeader = buildAuthHeader(options);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (authHeader) xhr.setRequestHeader('Authorization', authHeader);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(xhr.statusText || `HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('网络错误'));
    xhr.send(data);
  });
}

/**
 * 从 WebDAV 服务器下载文件
 * @param options - WebDAV 连接选项
 * @param remotePath - 远程服务器上的文件路径
 * @returns Promise<string> - 文件内容
 */
export async function downloadFromWebDAV(options: WebDAVConnectionOptions, remotePath: string): Promise<string> {
  const client = createWebDAVClient(options);
  const content = await client.getFileContents(remotePath, { format: 'text' });
  return content as string;
}

export async function downloadFromWebDAVWithProgress(
  options: WebDAVConnectionOptions,
  remotePath: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const url = buildWebDAVUrl(options.url, remotePath);
  const authHeader = buildAuthHeader(options);

  return await new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    if (authHeader) xhr.setRequestHeader('Authorization', authHeader);

    xhr.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(xhr.statusText || `HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('网络错误'));
    xhr.send();
  });
}

/**
 * 测试 WebDAV 连接
 * @param options - WebDAV 连接选项
 * @returns Promise<void>
 */
export async function testWebDAVConnection(options: WebDAVConnectionOptions): Promise<void> {
  const client = createWebDAVClient(options);
  // 尝试列出根目录的内容来验证连接
  await client.getDirectoryContents('/');
}
