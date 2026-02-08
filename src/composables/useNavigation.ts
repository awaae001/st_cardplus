import type { Component, InjectionKey, Ref } from 'vue';
import { computed, inject, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { MenuItemConfig } from '@/config/menuConfig';
import { getIconComponent } from '@/config/menuConfig';

import { useDark, useToggle } from '@vueuse/core';
import { useDevice } from './useDevice';

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
  isDark: Ref<boolean>;

  // 处理后的菜单数据
  mainNavItems: Ref<ProcessedMenuItem[]>;
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

/**
 * 提供导航上下文（在 App.vue 中调用）
 * @param menuItems 原始菜单配置项
 */
export function provideNavigation(menuItems: Ref<MenuItemConfig[]>): NavigationContext {
  const router = useRouter();
  const route = useRoute();

  // 复用 useDevice 的断点判断
  const { isMobileOrTablet } = useDevice();
  // 导航上下文中的 isMobile 实际上指的是"非桌面端"（<1024px）
  const isMobile = isMobileOrTablet;

  // 主题切换
  const isDark = useDark();
  const toggleDarkFn = useToggle(isDark);

  // 带过渡效果的主题切换
  const toggleDark = () => {
    // 使用 View Transitions API（现代浏览器）或 fallback
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        toggleDarkFn();
      });
    } else {
      // 手动添加过渡类
      document.documentElement.classList.add('theme-transitioning');
      toggleDarkFn();
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 300);
    }
  };

  // 处理菜单项（添加图标组件和路由索引）
  const processMenuItem = (item: MenuItemConfig): ProcessedMenuItem => ({
    ...item,
    index: item.route,
    originalIcon: item.icon,
    icon: getIconComponent(item.icon),
  });

  // 所有处理后的菜单项
  const allMenuItems = computed(() => menuItems.value.map(processMenuItem));

  // 主要导航项（不含工具箱，工具箱单独处理）
  const mainNavItems = computed(() => allMenuItems.value.filter((item) => item.visible && item.id !== 'toolbox'));

  // 工具箱菜单项（始终显示）
  const toolboxItem = computed(() => {
    const item = allMenuItems.value.find((item) => item.id === 'toolbox' && item.visible);
    return item || null;
  });

  // TabBar 显示的项目（根据 showInTabBar 配置过滤，按 order 排序）
  const tabBarItems = computed(() =>
    allMenuItems.value.filter((item) => item.visible && item.showInTabBar === true).sort((a, b) => a.order - b.order)
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
    isDark,
    mainNavItems,
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
