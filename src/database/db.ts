import Dexie, { type Table } from 'dexie';
import type { WorldBook, WorldBookEntry } from '../components/worldbook/types';

// 定义存储在 IndexedDB 中的 WorldBookEntry 结构，增加了 bookId 作为外键
export interface StoredWorldBookEntry extends WorldBookEntry {
  id?: number; // 自增主键
  bookId: string;
}

// 定义存储在 IndexedDB 中的 WorldBook 结构，移除了 entries 数组
export interface StoredWorldBook extends Omit<WorldBook, 'entries'> {}

/**
 * 定义 Dexie 数据库类
 */
export class WorldBookDatabase extends Dexie {
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

  constructor() {
    super('worldBookDatabase');
    this.version(1).stores({
      books: '&id, name, order, updatedAt',
      entries: '++id, bookId, uid',
    });
  }
}

// 导出数据库的单例
export const db = new WorldBookDatabase();