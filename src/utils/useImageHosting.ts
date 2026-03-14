
import { ElMessage, ElMessageBox } from 'element-plus';
import { isTauriApp, uploadImageToHostingViaTauri, type HostingProvider } from '@/utils/catbox';
import type { Ref } from 'vue';

const IMGBB_API_KEY_STORAGE = 'imgbb-api-key';

const ensureImgBBApiKey = async (): Promise<string | null> => {
  const cached = localStorage.getItem(IMGBB_API_KEY_STORAGE)?.trim();
  if (cached) return cached;
  try {
    const result = await ElMessageBox.prompt('请输入 ImgBB API Key（仅需一次）', 'ImgBB 配置', {
      confirmButtonText: '保存并继续',
      cancelButtonText: '取消',
      inputPlaceholder: 'ImgBB API Key',
      inputPattern: /^.{6,}$/,
      inputErrorMessage: '请输入有效的 ImgBB API Key',
    });
    const key = String((result as { value?: string }).value || '').trim();
    if (!key) return null;
    localStorage.setItem(IMGBB_API_KEY_STORAGE, key);
    return key;
  } catch {
    return null;
  }
};

export function useImageHosting(
  currentImageFile: Ref<File | null>,
  setCurrentSessionAvatarUrl: (url: string) => void
) {
  const isDesktopApp = isTauriApp();

  const handleUploadToHosting = async (provider: HostingProvider) => {
    if (!isDesktopApp) {
      ElMessage.warning('该功能仅在桌面 APP 版本可用');
      return;
    }

    if (!currentImageFile.value) {
      ElMessage.warning('请先选择一张本地头像图片');
      return;
    }

    try {
      let imgbbApiKey: string | undefined;
      if (provider === 'imgbb') {
        const key = await ensureImgBBApiKey();
        if (!key) {
          ElMessage.info('已取消 ImgBB 上传');
          return;
        }
        imgbbApiKey = key;
      }

      const uploadedUrl = await uploadImageToHostingViaTauri(currentImageFile.value, provider, imgbbApiKey);
      setCurrentSessionAvatarUrl(uploadedUrl);
      ElMessage.success(`上传到 ${provider === 'catbox' ? 'Catbox' : 'ImgBB'} 成功，已写入角色 image URL`);
    } catch (error) {
      const errorInfo =
        error instanceof Error
          ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
          : { raw: error };
      console.error('[ImageHosting] 上传失败 - 完整错误对象:', error);
      console.error('[ImageHosting] 上传失败 - 可读详情:', errorInfo);
      ElMessage.error(error instanceof Error ? error.message : '上传失败');
    }
  };

  return {
    handleUploadToHosting,
  };
}
