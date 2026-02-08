import type { Component, InjectionKey, Ref } from 'vue';
import { computed, inject, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { MenuItemConfig } from '@/config/menuConfig';
import { getIconComponent } from '@/config/menuConfig';

import { useDark, useToggle, useWindowSize } from '@vueuse/core';

// 处理后的菜单项类型（带有解析好的图标组件）
export interface ProcessedMenuItem extends Omit<MenuItemConfig, 'icon'> {
  index: string;
  icon: Component;
  originalIcon: string; // 保留原始图标名称
}

// 导航上下文类型
export interface NavigationContext {
  // 响应式状态
  isMobile: Ref<boolean>;
  isNarrowScreen: Ref<boolean>;
  isDark: Ref<boolean>;

  // 处理后的菜单数据
  mainNavItems: Ref<ProcessedMenuItem[]>;
  overflowItems: Ref<ProcessedMenuItem[]>;
  toolboxItem: Ref<ProcessedMenuItem | null>;
  tabBarItems: Ref<ProcessedMenuItem[]>;
  allMenuItems: Ref<ProcessedMenuItem[]>;

  // 方法
  toggleDark: () => void;
  isActive: (path: string) => boolean;
  navigateTo: (path: string) => void;
}

// Injection Key
export const NavigationKey: InjectionKey<NavigationContext> = Symbol('navigation');

// 顶栏最多显示的菜单项数量
const MAX_VISIBLE_ITEMS = 6;

// TabBar 优先显示的核心功能 ID
const TAB_BAR_PRIORITY_IDS = ['home', 'cardmanager', 'cardinfo', 'world', 'toolbox'];

/**
 * 提供导航上下文（在 App.vue 中调用）
 * @param menuItems 原始菜单配置项
 */
export function provideNavigation(menuItems: Ref<MenuItemConfig[]>): NavigationContext {
  const router = useRouter();
  const route = useRoute();

  // 响应式窗口尺寸
  const { width } = useWindowSize();
  const isMobile = computed(() => width.value < 1024);
  const isNarrowScreen = computed(() => width.value >= 1024 && width.value <= 1200);

  // 主题切换
  const isDark = useDark();
  const toggleDarkFn = useToggle(isDark);
  const toggleDark = () => toggleDarkFn();

  // 处理菜单项（添加图标组件和路由索引）
  const processMenuItem = (item: MenuItemConfig): ProcessedMenuItem => ({
    ...item,
    index: item.route,
    originalIcon: item.icon,
    icon: getIconComponent(item.icon),
  });

  // 所有处理后的菜单项
  const allMenuItems = computed(() => menuItems.value.map(processMenuItem));

  // 常规菜单项（不含工具箱）
  const regularMenuItems = computed(() => allMenuItems.value.filter((item) => item.visible && item.id !== 'toolbox'));

  // 主要导航项（顶栏直接显示）
  const mainNavItems = computed(() => regularMenuItems.value.slice(0, MAX_VISIBLE_ITEMS));

  // 溢出项（放入更多菜单）
  const overflowItems = computed(() => regularMenuItems.value.slice(MAX_VISIBLE_ITEMS));

  // 工具箱菜单项（始终显示）
  const toolboxItem = computed(() => {
    const item = allMenuItems.value.find((item) => item.id === 'toolbox' && item.visible);
    return item || null;
  });

  // TabBar 显示的项目（最多5个核心功能）
  const tabBarItems = computed(() =>
    allMenuItems.value
      .filter((item) => item.visible && TAB_BAR_PRIORITY_IDS.includes(item.id))
      .sort((a, b) => TAB_BAR_PRIORITY_IDS.indexOf(a.id) - TAB_BAR_PRIORITY_IDS.indexOf(b.id))
      .slice(0, 5)
  );

  // 判断路由是否激活
  const isActive = (path: string): boolean => {
    if (path === '/') {
      return route.path === '/';
    }
    // 精确匹配或匹配子路由
    return route.path === path || route.path.startsWith(path + '/');
  };

  // 导航到指定路径
  const navigateTo = (path: string) => {
    router.push(path);
  };

  const context: NavigationContext = {
    isMobile,
    isNarrowScreen,
    isDark,
    mainNavItems,
    overflowItems,
    toolboxItem,
    tabBarItems,
    allMenuItems,
    toggleDark,
    isActive,
    navigateTo,
  };

  provide(NavigationKey, context);

  return context;
}

/**
 * 使用导航上下文（在子组件中调用）
 */
export function useNavigation(): NavigationContext {
  const context = inject(NavigationKey);
  if (!context) {
    throw new Error('useNavigation must be used within a component that has called provideNavigation');
  }
  return context;
}
