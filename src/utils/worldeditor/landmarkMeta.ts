import { LandmarkType } from '@/types/world-editor';

const LANDMARK_TYPE_LABELS: Record<string, string> = {
  [LandmarkType.CITY]: '城市',
  [LandmarkType.TOWN]: '城镇',
  [LandmarkType.VILLAGE]: '村庄',
  [LandmarkType.FORTRESS]: '要塞',
  [LandmarkType.RUINS]: '遗迹',
  [LandmarkType.DUNGEON]: '地下城',
  [LandmarkType.TEMPLE]: '神殿',
  [LandmarkType.ACADEMY]: '学院',
  [LandmarkType.HARBOR]: '港口',
  [LandmarkType.MARKET]: '市场',
  [LandmarkType.NATURAL]: '自然景观',
  [LandmarkType.OCEAN]: '海洋',
  [LandmarkType.MYSTICAL]: '神秘地点',
  [LandmarkType.CUSTOM]: '自定义',
};

const LANDMARK_TYPE_ICONS: Record<string, string> = {
  [LandmarkType.CITY]: 'ph:buildings-duotone',
  [LandmarkType.TOWN]: 'ph:house-line-duotone',
  [LandmarkType.VILLAGE]: 'ph:house-duotone',
  [LandmarkType.FORTRESS]: 'ph:castle-turret-duotone',
  [LandmarkType.RUINS]: 'ph:skull-duotone',
  [LandmarkType.DUNGEON]: 'ph:spiral-duotone',
  [LandmarkType.TEMPLE]: 'ph:bank-duotone',
  [LandmarkType.ACADEMY]: 'ph:graduation-cap-duotone',
  [LandmarkType.HARBOR]: 'ph:anchor-duotone',
  [LandmarkType.MARKET]: 'ph:storefront-duotone',
  [LandmarkType.NATURAL]: 'ph:leaf-duotone',
  [LandmarkType.OCEAN]: 'ph:waves-duotone',
  [LandmarkType.MYSTICAL]: 'ph:sparkle-duotone',
  [LandmarkType.CUSTOM]: 'ph:map-pin-line-duotone',
};

export const getLandmarkTypeLabel = (type: string): string => {
  return LANDMARK_TYPE_LABELS[type] || type;
};

export const getLandmarkTypeIcon = (type?: string): string => {
  if (!type) return 'ph:map-pin-duotone';
  return LANDMARK_TYPE_ICONS[type] || 'ph:map-pin-duotone';
};
