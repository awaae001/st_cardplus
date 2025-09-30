import Dexie, { type Table } from 'dexie';
import type { WorldBook, WorldBookEntry } from '../components/worldbook/types';
import type { CharacterCardV3 } from '../types/character-card-v3';

// 定义存储在 IndexedDB 中的 WorldBookEntry 结构，增加了 bookId 作为外键
export interface StoredWorldBookEntry extends WorldBookEntry {
  id?: number; // 自增主键
  bookId: string;
}

// 定义存储在 IndexedDB 中的 WorldBook 结构，移除了 entries 数组
export interface StoredWorldBook extends Omit<WorldBook, 'entries'> { }

// 定义存储在 IndexedDB 中的角色卡结构
export interface StoredCharacterCard {
  id: string; // UUID 主键
  name: string; // 角色名称
  description?: string; // 角色简介
  avatar?: string; // 头像信息
  cardData: CharacterCardV3; // 完整的角色卡数据
  createdAt: string; // 创建时间 ISO 8601
  updatedAt: string; // 更新时间 ISO 8601
  order: number; // 排序序号
  tags?: string[]; // 标签
  metadata?: Record<string, any>; // 额外元数据
}

/**
 * 定义应用主数据库类
 * 包含世界书、角色卡等所有应用数据
 */
export class AppDatabase extends Dexie {
  /**
   * `books` 表，用于存储世界书的元数据
   * 主键是 `id` (string, UUID)
   * 索引了 `name`, `order`, `updatedAt` 字段以便查询和排序
   */
  books!: Table<StoredWorldBook, string>;

  /**
   * `entries` 表，用于存储所有世界书的条目
   * 主键是 `id` (number, auto-incrementing)
   * 索引了 `bookId` 以便快速检索属于特定书籍的所有条目
   * 索引了 `uid` 以保留旧数据结构中的唯一标识符
   */
  entries!: Table<StoredWorldBookEntry, number>;

  /**
   * `characterCards` 表，用于存储角色卡
   * 主键是 `id` (string, UUID)
   * 索引了 `name`, `order`, `updatedAt` 字段以便查询和排序
   */
  characterCards!: Table<StoredCharacterCard, string>;

  constructor() {
    super('appDatabase');
    this.version(1).stores({
      books: '&id, name, order, updatedAt',
      entries: '++id, bookId, uid',
    });

    // 版本 2: 添加角色卡表
    this.version(2).stores({
      books: '&id, name, order, updatedAt',
      entries: '++id, bookId, uid',
      characterCards: '&id, name, order, updatedAt',
    });
  }
}

// 导出数据库的单例
export const db = new AppDatabase();