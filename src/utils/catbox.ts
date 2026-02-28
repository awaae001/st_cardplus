const isString = (value: unknown): value is string => typeof value === 'string';
export type HostingProvider = 'catbox' | 'imgbb';

export const isTauriApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return '__TAURI_INTERNALS__' in window;
};

const fileToBase64 = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (!isString(result)) {
        reject(new Error('读取文件失败：无法转换为 base64'));
        return;
      }
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('读取文件失败：base64 数据为空'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });

export const uploadImageToHostingViaTauri = async (
  file: File,
  provider: HostingProvider,
  imgbbApiKey?: string
): Promise<string> => {
  if (!isTauriApp()) {
    throw new Error('该功能仅在桌面 APP 版本可用');
  }

  const base64Data = await fileToBase64(file);
  const { invoke } = await import('@tauri-apps/api/core');

  const result = await invoke<string>('upload_image_to_hosting', {
    base64Data,
    base64_data: base64Data,
    fileName: file.name || 'avatar.png',
    file_name: file.name || 'avatar.png',
    mimeType: file.type || 'image/png',
    mime_type: file.type || 'image/png',
    provider,
    imgbbApiKey: imgbbApiKey || '',
    imgbb_api_key: imgbbApiKey || '',
  });

  const url = String(result || '').trim();
  if (!url) {
    throw new Error('上传失败：图床返回为空');
  }

  return url;
};

export const uploadImageToCatboxViaTauri = async (file: File): Promise<string> => {
  return uploadImageToHostingViaTauri(file, 'catbox');
};
