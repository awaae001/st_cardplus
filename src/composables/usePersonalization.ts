import { ref, onMounted } from 'vue';
import { getAutoExpandSidebar, setAutoExpandSidebar } from '@/utils/localStorageUtils';

export function usePersonalization() {
  const autoExpandSidebar = ref(false);

  const onAutoExpandSidebarToggle = (value: boolean) => {
    setAutoExpandSidebar(value);
    window.dispatchEvent(new CustomEvent('autoExpandSidebarToggle', { detail: value }));
  };

  onMounted(() => {
    autoExpandSidebar.value = getAutoExpandSidebar();
  });

  return {
    autoExpandSidebar,
    onAutoExpandSidebarToggle,
  };
}