import { markRaw } from 'vue';
import {
  House, EditPen, Location, Postcard, Tools, DataLine, Collection, Tickets
} from '@element-plus/icons-vue';

// 菜单项类型
export type MenuItemType = 'main' | 'tool';

// 菜单项配置接口
export interface MenuItemConfig {
  id: string;
  type: MenuItemType;
  visible: boolean;
  order: number;
  title: string;
  icon: string;
  route: string;
  beta?: boolean;
  description?: string;
  fixed?: boolean;
}

// 工具箱固定工具接口
export interface ToolboxToolConfig {
  id: string;
  title: string;
  icon: string;
  description: string;
  route: string;
  category: 'utility' | 'converter' | 'metadata';
}

// Element Plus 图标映射
export const iconMap = {
  House: markRaw(House),
  EditPen: markRaw(EditPen),
  Location: markRaw(Location),
  Postcard: markRaw(Postcard),
  Tools: markRaw(Tools),
  DataLine: markRaw(DataLine),
  Collection: markRaw(Collection),
  Tickets: markRaw(Tickets),
};

// Iconify 图标映射
export const iconifyIconMap: Record<string, string> = {
  'House': 'ep:house',
  'EditPen': 'ep:edit-pen',
  'Location': 'ep:location',
  'Postcard': 'ep:postcard',
  'Tools': 'ep:tools',
  'DataLine': 'ep:data-line',
  'Collection': 'ep:collection',
  'Tickets': 'ep:tickets'
};

// 主菜单项配置
export const mainMenuItems: MenuItemConfig[] = [
  {
    id: 'home',
    type: 'main',
    visible: true,
    order: 0,
    title: '首页',
    icon: 'House',
    route: '/',
    fixed: true
  },
  {
    id: 'cardinfo',
    type: 'main',
    visible: true,
    order: 1,
    title: '角色信息',
    icon: 'EditPen',
    route: '/cardinfo'
  },
  {
    id: 'world',
    type: 'main',
    visible: true,
    order: 2,
    title: '世界地标',
    icon: 'Location',
    route: '/world'
  },
  {
    id: 'cardmanager',
    type: 'main',
    visible: true,
    order: 3,
    title: '角色卡快搭',
    icon: 'Postcard',
    route: '/cardmanager'
  },
  {
    id: 'ejs-editor',
    type: 'main',
    visible: true,
    order: 4,
    title: 'EJS模板 · 测试版',
    icon: 'DataLine',
    route: '/ejs-editor',
    beta: true
  },
  {
    id: 'worldbook',
    type: 'main',
    visible: true,
    order: 5,
    title: '世界书 · 测试版',
    icon: 'Collection',
    route: '/worldbook',
    beta: true
  },
  {
    id: 'regex-editor',
    type: 'main',
    visible: true,
    order: 6,
    title: '正则编辑器 · 测试版',
    icon: 'Tickets',
    route: '/regex-editor',
    beta: true
  },
  {
    id: 'toolbox',
    type: 'main',
    visible: true,
    order: 7,
    title: '工具箱',
    icon: 'Tools',
    route: '/toolbox',
    fixed: true
  }
];

// 工具箱小工具配置
export const toolboxToolItems: MenuItemConfig[] = [
  {
    id: 'json-formatter',
    type: 'tool',
    visible: false,
    order: 100,
    title: 'JSON格式化',
    icon: 'material-symbols:code',
    route: '/toolbox/json-formatter',
    description: '去除JSON中的换行和多余空格'
  },
  {
    id: 'separator',
    type: 'tool',
    visible: false,
    order: 101,
    title: '元数据分离器',
    icon: 'material-symbols:image-outline',
    route: '/toolbox/separator',
    description: '分离角色卡的 json 和图片'
  },
  {
    id: 'worldbook-converter',
    type: 'tool',
    visible: false,
    order: 102,
    title: '世界书转换器',
    icon: 'ph:books-bold',
    route: '/toolbox/worldbook-converter',
    description: '在 CharacterBook 和 WorldBook 格式之间进行双向转换'
  },
  {
    id: 'png-metadata',
    type: 'tool',
    visible: false,
    order: 103,
    title: 'PNG元数据工具',
    icon: 'mdi:file-image-plus-outline',
    route: '/toolbox/png-metadata',
    description: '读取或写入 PNG 图片的元数据'
  }
];

// 工具箱固定工具配置（不会出现在侧边栏中的固定工具）
export const toolboxFixedTools: ToolboxToolConfig[] = [
  {
    id: 'json-formatter',
    title: 'JSON格式化',
    icon: 'material-symbols:code',
    description: '去除JSON中的换行和多余空格',
    route: '/toolbox/json-formatter',
    category: 'utility'
  },
  {
    id: 'separator',
    title: '元数据分离器',
    icon: 'material-symbols:image-outline',
    description: '分离角色卡的 json 和图片',
    route: '/toolbox/separator',
    category: 'metadata'
  },
  {
    id: 'worldbook-converter',
    title: '世界书转换器',
    icon: 'ph:books-bold',
    description: '在 CharacterBook 和 WorldBook 格式之间进行双向转换',
    route: '/toolbox/worldbook-converter',
    category: 'converter'
  },
  {
    id: 'png-metadata',
    title: 'PNG元数据工具',
    icon: 'mdi:file-image-plus-outline',
    description: '读取或写入 PNG 图片的元数据',
    route: '/toolbox/png-metadata',
    category: 'metadata'
  },
  {
    id: 'database-migration',
    title: '数据库迁移助手',
    icon: 'ph:database-duotone',
    description: '协助您将数据从旧版数据库迁移到新版数据库',
    route: '/migration',
    category: 'utility'
  }
];

// 获取所有默认菜单项配置
export const getAllDefaultMenuItems = (): MenuItemConfig[] => {
  return [...mainMenuItems, ...toolboxToolItems];
};

// 获取图标组件
export const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || markRaw(Tools);
};

// 获取 Iconify 图标名称
export const getIconifyIconName = (iconName: string): string => {
  return iconifyIconMap[iconName] || iconName;
};

// 侧边栏配置接口
export interface SidebarConfig {
  items: MenuItemConfig[];
  lastUpdated: number;
}

// 创建默认侧边栏配置
export const createDefaultSidebarConfig = (): SidebarConfig => ({
  items: getAllDefaultMenuItems(),
  lastUpdated: Date.now()
});

// 配置验证
export const validateMenuConfig = (config: SidebarConfig): boolean => {
  if (!config || !Array.isArray(config.items)) {
    return false;
  }

  // 检查必要的固定项目是否存在
  const requiredFixedItems = ['home', 'toolbox'];
  const hasRequiredItems = requiredFixedItems.every(id =>
    config.items.some(item => item.id === id && item.fixed)
  );

  return hasRequiredItems;
};

// 配置迁移（用于处理旧版本配置）
export const migrateMenuConfig = (oldConfig: any): SidebarConfig => {
  const defaultConfig = createDefaultSidebarConfig();

  if (!oldConfig || !Array.isArray(oldConfig.items)) {
    return defaultConfig;
  }

  // 合并旧配置和新配置
  const mergedItems = defaultConfig.items.map(defaultItem => {
    const oldItem = oldConfig.items.find((item: any) => item.id === defaultItem.id);
    if (oldItem) {
      return {
        ...defaultItem,
        visible: oldItem.visible ?? defaultItem.visible,
        order: oldItem.order ?? defaultItem.order
      };
    }
    return defaultItem;
  });

  return {
    items: mergedItems,
    lastUpdated: Date.now()
  };
};