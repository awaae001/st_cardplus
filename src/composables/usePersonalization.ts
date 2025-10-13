import { ref, onMounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import {
  getAutoExpandSidebar, setAutoExpandSidebar,
  getAllowBodyScroll, setAllowBodyScroll,
  getUseOldSidebar, setUseOldSidebar,
  getUseOldCharCardEditor, setUseOldCharCardEditor,
  getUseOldWorldEditor, setUseOldWorldEditor,
  getSidebarConfig, setSidebarConfig,
  type SidebarConfig
} from '@/utils/localStorageUtils';

export function usePersonalization() {
  const autoExpandSidebar = ref(false);
  const allowBodyScroll = ref(false);
  const useOldSidebar = ref(false);
  const useOldCharCardEditor = ref(false);
  const useOldWorldEditor = ref(false);
  const sidebarConfig = ref<SidebarConfig>(getSidebarConfig());

  const createReloadConfirm = (setter: (value: boolean) => void) => (value: boolean) => {
    setter(value);
    ElMessageBox.confirm(
      '此设置将在您下次刷新页面 (Ctrl+R) 后生效 ',
      '提示',
      {
        confirmButtonText: '立即刷新',
        cancelButtonText: '稍后',
        type: 'info',
      }
    ).then(() => {
      window.location.reload();
    });
  };

  const onAutoExpandSidebarToggle = (value: boolean) => {
    setAutoExpandSidebar(value);
    ElMessageBox.confirm(
      '此设置将在您下次刷新页面 (Ctrl+R) 后生效 ',
      '提示',
      {
        confirmButtonText: '立即刷新',
        cancelButtonText: '稍后',
        type: 'info',
      }
    ).then(() => {
      window.location.reload();
    });
  };

  const onAllowBodyScrollToggle = createReloadConfirm(setAllowBodyScroll);
  const onUseOldSidebarToggle = createReloadConfirm(setUseOldSidebar);
  const onUseOldCharCardEditorToggle = createReloadConfirm(setUseOldCharCardEditor);
  const onUseOldWorldEditorToggle = createReloadConfirm(setUseOldWorldEditor);

  // 侧边栏配置相关方法
  const refreshSidebarConfig = () => {
    sidebarConfig.value = getSidebarConfig();
  };

  const updateSidebarConfig = (config: SidebarConfig) => {
    setSidebarConfig(config);
    refreshSidebarConfig();
  };

  onMounted(() => {
    autoExpandSidebar.value = getAutoExpandSidebar();
    allowBodyScroll.value = getAllowBodyScroll();
    useOldSidebar.value = getUseOldSidebar();
    useOldCharCardEditor.value = getUseOldCharCardEditor();
    useOldWorldEditor.value = getUseOldWorldEditor();
    refreshSidebarConfig();
  });


  return {
    autoExpandSidebar,
    onAutoExpandSidebarToggle,
    allowBodyScroll,
    onAllowBodyScrollToggle,
    useOldSidebar,
    onUseOldSidebarToggle,
    useOldCharCardEditor,
    onUseOldCharCardEditorToggle,
    useOldWorldEditor,
    onUseOldWorldEditorToggle,
    sidebarConfig,
    refreshSidebarConfig,
    updateSidebarConfig,
  };
}
