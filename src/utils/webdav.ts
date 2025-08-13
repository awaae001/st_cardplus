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