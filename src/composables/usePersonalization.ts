import {
  getSetting,
  getSidebarConfig,
  setSetting,
  setSidebarConfig,
  type SidebarConfig,
} from '@/utils/localStorageUtils';
import { ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';

export function usePersonalization() {
  const allowBodyScroll = ref(false);
  const useOldWorldEditor = ref(false);
  const sidebarConfig = ref<SidebarConfig>(getSidebarConfig());

  const createReloadConfirm = (setter: (value: boolean) => void) => (value: boolean) => {
    setter(value);
    ElMessageBox.confirm('此设置将在您下次刷新页面 (Ctrl+R) 后生效 ', '提示', {
      confirmButtonText: '立即刷新',
      cancelButtonText: '稍后',
      type: 'info',
    }).then(() => {
      window.location.reload();
    });
  };

  const onAllowBodyScrollToggle = createReloadConfirm((value) => setSetting('allowBodyScroll', value));
  const onUseOldWorldEditorToggle = createReloadConfirm((value) => setSetting('useOldWorldEditor', value));

  // 导航栏配置相关方法
  const refreshSidebarConfig = () => {
    sidebarConfig.value = getSidebarConfig();
  };

  const updateSidebarConfig = (config: SidebarConfig) => {
    setSidebarConfig(config);
    refreshSidebarConfig();
  };

  onMounted(() => {
    allowBodyScroll.value = getSetting('allowBodyScroll');
    useOldWorldEditor.value = getSetting('useOldWorldEditor');
    refreshSidebarConfig();
  });

  return {
    allowBodyScroll,
    onAllowBodyScrollToggle,
    useOldWorldEditor,
    onUseOldWorldEditorToggle,
    sidebarConfig,
    refreshSidebarConfig,
    updateSidebarConfig,
  };
}
