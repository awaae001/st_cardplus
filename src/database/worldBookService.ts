import { db, type StoredWorldBook, type StoredWorldBookEntry } from './db';
import type { WorldBookCollection, WorldBook, WorldBookEntry } from '../components/worldbook/types';

export interface WorldBookExport {
  books: StoredWorldBook[];
  entries: StoredWorldBookEntry[];
}

const ACTIVE_BOOK_ID_KEY = 'worldBookActiveId';

export const worldBookService = {
  /**
   * 从 IndexedDB 加载并组装完整的 WorldBookCollection 对象
   */
  async getFullWorldBookCollection(): Promise<WorldBookCollection> {
    // 并行获取所有书籍和所有条目以提高效率
    const [allBooksStored, allEntriesStored] = await Promise.all([
      db.books.orderBy('order').toArray(),
      db.entries.toArray(),
    ]);

    const booksMap = new Map<string, WorldBook>();

    // 1. 初始化所有书籍，此时 entries 数组为空
    allBooksStored.forEach(storedBook => {
      booksMap.set(storedBook.id, {
        ...storedBook,
        entries: [],
      });
    });

    // 2. 将所有条目填充到对应书籍的 entries 数组中
    allEntriesStored.forEach(storedEntry => {
      const book = booksMap.get(storedEntry.bookId);
      if (book) {
        // 从存储对象中移除 bookId，但保留数据库主键 id
        const { bookId, ...entry } = storedEntry;
        book.entries.push(entry);
      }
    });

    // 3. 将 Map 转换为应用所需的 Record<string, WorldBook> 格式
    const books: Record<string, WorldBook> = {};
    for (const [id, book] of booksMap.entries()) {
      books[id] = book;
    }

    // 4. 从 localStorage 获取并验证 activeBookId
    const activeBookId = localStorage.getItem(ACTIVE_BOOK_ID_KEY);
    const finalActiveBookId = activeBookId && books[activeBookId]
      ? activeBookId
      : (allBooksStored[0]?.id || null);

    return {
      books,
      activeBookId: finalActiveBookId,
    };
  },

  /**
   * 将当前活动的 bookId 保存到 localStorage
   * @param bookId - 活动书籍的 ID
   */
  setActiveBookId(bookId: string | null): void {
    if (bookId) {
      localStorage.setItem(ACTIVE_BOOK_ID_KEY, bookId);
    } else {
      localStorage.removeItem(ACTIVE_BOOK_ID_KEY);
    }
  },

  /**
   * 添加一本新的世界书
   */
  async addBook(book: StoredWorldBook): Promise<void> {
    await db.books.add(book);
  },

  /**
   * 更新一本书的元数据 (除 entries 外的所有字段)
   */
  async updateBook(book: StoredWorldBook): Promise<void> {
    await db.books.put(book);
  },

  /**
   * 删除一本书及其所有条目
   */
  async deleteBook(bookId: string): Promise<void> {
    await db.transaction('rw', db.books, db.entries, async () => {
      // 1. 删除书籍本身
      await db.books.delete(bookId);
      // 2. 删除该书籍下的所有条目
      await db.entries.where('bookId').equals(bookId).delete();
    });
  },

  /**
   * 批量更新书籍的顺序
   */
  async updateBookOrder(books: Pick<StoredWorldBook, 'id' | 'order' | 'updatedAt'>[]): Promise<void> {
    await db.transaction('rw', db.books, async () => {
      for (const book of books) {
        await db.books.update(book.id, { order: book.order, updatedAt: book.updatedAt });
      }
    });
  },

  /**
   * 完全替换一本书的所有条目 (用于导入、拖拽等操作)
   */
  async replaceEntriesForBook(bookId: string, entries: WorldBookEntry[]): Promise<void> {
    const storedEntries: StoredWorldBookEntry[] = entries.map(entry => ({
      ...entry,
      bookId,
    }));

    await db.transaction('rw', db.entries, async () => {
      // 1. 删除旧的所有条目
      await db.entries.where('bookId').equals(bookId).delete();
      // 2. 添加新的所有条目
      if (storedEntries.length > 0) {
        await db.entries.bulkAdd(storedEntries);
      }
    });
  },

  /**
   * 添加一个新条目
   */
  async addEntry(bookId: string, entry: WorldBookEntry): Promise<number> {
    const storedEntry: StoredWorldBookEntry = { ...entry, bookId };
    return await db.entries.add(storedEntry);
  },

  /**
   * 更新一个条目
   * 注意: 需要条目的数据库主键 id
   */
  async updateEntry(entry: StoredWorldBookEntry): Promise<void> {
    if (entry.id === undefined) {
      throw new Error("更新条目需要提供数据库主键 'id'");
    }
    await db.entries.put(entry);
  },

  /**
   * 删除一个条目
   */
  async deleteEntry(entryId: number): Promise<void> {
    await db.entries.delete(entryId);
  },

  /**
   * 检查数据库是否为空 (通过检查是否有任何书籍)
   */
  async isDatabaseEmpty(): Promise<boolean> {
    const count = await db.books.count();
    return count === 0;
  },

  /**
   * 导出整个世界书数据库为 JSON 对象
   */
  async exportDatabase(): Promise<WorldBookExport> {
    const books = await db.books.toArray();
    const entries = await db.entries.toArray();
    return { books, entries };
  },

  /**
   * 从 JSON 对象导入数据，完全覆盖现有数据库
   */
  async importDatabase(data: WorldBookExport): Promise<void> {
    await db.transaction('rw', db.books, db.entries, async () => {
      // 1. 清空现有数据
      await db.books.clear();
      await db.entries.clear();

      // 2. 批量导入新数据
      await db.books.bulkAdd(data.books);
      await db.entries.bulkAdd(data.entries);
    });
  },

  /**
   * 清空整个世界书数据库
   */
  async clearDatabase(): Promise<void> {
    await db.transaction('rw', db.books, db.entries, async () => {
      await db.books.clear();
      await db.entries.clear();
    });
  },
};