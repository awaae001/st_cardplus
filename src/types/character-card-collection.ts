import type { CharacterCardV3 } from './character-card-v3';

/**
 * 角色卡集合中的单个角色卡接口
 * 包含了完整的角色卡数据和管理所需的元数据
 */
export interface CharacterCardItem extends CharacterCardV3 {
  id: string; // UUID 唯一标识符
  createdAt: string; // 创建时间 ISO 8601
  updatedAt: string; // 更新时间 ISO 8601
  order: number; // 排序序号
}

/**
 * 角色卡集合接口
 * 用于管理多个角色卡的集合状态
 */
export interface CharacterCardCollection {
  cards: Record<string, CharacterCardItem>;
  activeCardId: string | null;
  settings?: Record<string, any>; // 全局设置
}

/**
 * 角色卡导出数据格式
 * 用于导入导出功能
 */
export interface CharacterCardExportData {
  version: string; // 导出格式版本
  exportedAt: string; // 导出时间
  cards: CharacterCardItem[];
  metadata?: Record<string, any>; // 导出元数据
}

/**
 * 角色卡搜索过滤器
 */
export interface CharacterCardFilter {
  query?: string; // 搜索关键词
  tags?: string[]; // 标签过滤
  creator?: string; // 创建者过滤
  dateRange?: {
    start?: string;
    end?: string;
  }; // 日期范围过滤
}

/**
 * 角色卡排序选项
 */
export interface CharacterCardSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'order';
  direction: 'asc' | 'desc';
}

/**
 * 角色卡统计信息
 */
export interface CharacterCardStats {
  totalCount: number;
  tagsCount: number;
  averageCardSize: number;
  lastUpdateTime?: string;
}
