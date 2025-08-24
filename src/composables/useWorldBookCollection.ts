import { ref, computed, watch, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  saveToLocalStorage as saveToLS,
  loadFromLocalStorage as loadFromLS,
} from "../utils/localStorageUtils";
import type { WorldBook, WorldBookCollection, WorldBookEntry } from "../components/worldbook/types";
import { v4 as uuidv4 } from 'uuid';
import { processImportedWorldBookData } from "./useWorldBookEntry";

const LOCAL_STORAGE_KEY_WORLDBOOK_MANAGER = "worldBookManagerData";
const LOCAL_STORAGE_KEY_WORLDBOOK_LEGACY = "worldBookEditorData";

export function useWorldBookCollection() {
  const worldBookCollection = ref<WorldBookCollection>({
    books: {},
    activeBookId: null,
  });

  const activeBookId = computed(() => worldBookCollection.value.activeBookId);

  const activeBook = computed<WorldBook | null>(() => {
    if (activeBookId.value && worldBookCollection.value.books[activeBookId.value]) {
      return worldBookCollection.value.books[activeBookId.value];
    }
    return null;
  });

  const saveWorldBookToLocalStorage = (): void => {
    saveToLS(worldBookCollection.value, LOCAL_STORAGE_KEY_WORLDBOOK_MANAGER);
  };

  onMounted(() => {
    const loadAndMigrateData = () => {
      const newFormatData = loadFromLS(LOCAL_STORAGE_KEY_WORLDBOOK_MANAGER);

      if (newFormatData && typeof newFormatData === 'object' && newFormatData.books && newFormatData.activeBookId) {
        worldBookCollection.value = newFormatData as WorldBookCollection;

        //数据迁移：确保旧数据有 order 字段
        Object.values(worldBookCollection.value.books).forEach((book) => {
          if (typeof book.order !== 'number') {
            book.order = new Date(book.createdAt).getTime();
          }
        });

      } else {
        const legacyData = loadFromLS(LOCAL_STORAGE_KEY_WORLDBOOK_LEGACY);
        const newCollection: WorldBookCollection = {
          books: {},
          activeBookId: null,
        };

        if (legacyData) {
          const entries = processImportedWorldBookData(legacyData);
          if (entries && entries.length > 0) {
            const newBookId = uuidv4();
            const now = new Date().toISOString();
            newCollection.books[newBookId] = {
              id: newBookId,
              name: "默认世界书 (迁移)",
              entries: entries,
              createdAt: now,
              updatedAt: now,
              description: "这是从旧版本自动迁移的世界书 ",
              order: 0,
            };
            newCollection.activeBookId = newBookId;
            ElMessage.success("旧的世界书数据已成功迁移！");
          }
        }

        if (Object.keys(newCollection.books).length === 0) {
          const newBookId = uuidv4();
          const now = new Date().toISOString();
          newCollection.books[newBookId] = {
            id: newBookId,
            name: "我的第一个世界书",
            entries: [],
            createdAt: now,
            updatedAt: now,
            description: "在这里开始你的创作吧！",
            order: 0,
          };
          newCollection.activeBookId = newBookId;
        }

        worldBookCollection.value = newCollection;
        saveWorldBookToLocalStorage();
      }
    };

    loadAndMigrateData();
  });

  watch(
    worldBookCollection,
    () => {
      saveWorldBookToLocalStorage();
    },
    { deep: true }
  );

  const handleSelectBook = (bookId: string) => {
    if (worldBookCollection.value.books[bookId]) {
      worldBookCollection.value.activeBookId = bookId;
    }
  };

  const handleCreateBook = async () => {
    try {
      const { value: bookName } = await ElMessageBox.prompt(
        '请输入新世界书的名称：',
        '创建新世界书',
        {
          confirmButtonText: '创建',
          cancelButtonText: '取消',
          inputPattern: /.+/,
          inputErrorMessage: '名称不能为空',
        }
      );

      const newBookId = uuidv4();
      const now = new Date().toISOString();
      //   为新书设置 order  
      const existingOrders = Object.values(worldBookCollection.value.books).map(b => b.order).filter(o => typeof o === 'number');
      const maxOrder = existingOrders.length > 0 ? Math.max(...existingOrders) : -1;

      const newBook: WorldBook = {
        id: newBookId,
        name: bookName,
        entries: [],
        createdAt: now,
        updatedAt: now,
        description: `创建于 ${new Date().toLocaleString()}`,
        order: maxOrder + 1,
      };

      worldBookCollection.value.books[newBookId] = newBook;
      worldBookCollection.value.activeBookId = newBookId;
      ElMessage.success(`世界书 "${bookName}" 已创建！`);

    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.info('创建操作已取消');
      }
    }
  };

  const handleRenameBook = async (bookId: string) => {
    const book = worldBookCollection.value.books[bookId];
    if (!book) return;

    try {
      const { value: newBookName } = await ElMessageBox.prompt(
        '请输入新的名称：',
        '重命名世界书',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          inputValue: book.name,
          inputPattern: /.+/,
          inputErrorMessage: '名称不能为空',
        }
      );

      book.name = newBookName;
      book.updatedAt = new Date().toISOString();
      ElMessage.success('世界书已重命名！');

    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.info('重命名操作已取消');
      }
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const book = worldBookCollection.value.books[bookId];
    if (!book) return;

    if (Object.keys(worldBookCollection.value.books).length <= 1) {
      ElMessage.warning('不能删除最后一个世界书 ');
      return;
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除世界书 "${book.name}" 吗？此操作不可恢复！`,
        '删除世界书',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      );

      delete worldBookCollection.value.books[bookId];

      if (worldBookCollection.value.activeBookId === bookId) {
        worldBookCollection.value.activeBookId = Object.keys(worldBookCollection.value.books)[0] || null;
      }

      ElMessage.success(`世界书 "${book.name}" 已删除 `);

    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.info('删除操作已取消');
      }
    }
  };

  const handleImportBookFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        if (!jsonData || typeof jsonData !== 'object' || !('entries' in jsonData)) {
          throw new Error('无效的世界书文件格式 文件必须是一个包含 "entries" 数组的JSON对象 ');
        }

        const loadedEntries = processImportedWorldBookData(jsonData);
        if (loadedEntries === null) {
          throw new Error('处理导入数据时出错 ');
        }

        const newBookId = uuidv4();
        const now = new Date().toISOString();
        const fileName = file.name.replace(/\.json$/i, '').replace(/\.world$/i, '');

        //   为导入的书设置 order  
        const existingOrders = Object.values(worldBookCollection.value.books).map(b => b.order).filter(o => typeof o === 'number');
        const maxOrder = existingOrders.length > 0 ? Math.max(...existingOrders) : -1;

        const newBook: WorldBook = {
          id: newBookId,
          name: jsonData.name || fileName || `导入的世界书`,
          description: jsonData.description || `从文件 ${file.name} 导入`,
          entries: loadedEntries,
          createdAt: now,
          updatedAt: now,
          metadata: jsonData.metadata || {},
          order: maxOrder + 1,
        };

        worldBookCollection.value.books[newBookId] = newBook;
        worldBookCollection.value.activeBookId = newBookId;

        ElMessage.success(`新的世界书 "${newBook.name}" 已成功导入！`);
        saveWorldBookToLocalStorage();

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        ElMessage.error(`导入失败: ${errorMessage}`);
        console.error("从文件导入新世界书操作未成功完成:", error);
      }
    };

    reader.onerror = () => {
      ElMessage.error("读取文件时出错 ");
    };

    reader.readAsText(file);
  };

  const moveEntryBetweenBooks = (
    entryToMove: WorldBookEntry,
    fromBookId: string,
    toBookId: string,
    insertIndex: number
  ) => {
    const fromBook = worldBookCollection.value.books[fromBookId];
    const toBook = worldBookCollection.value.books[toBookId];

    if (!fromBook || !toBook) {
      console.error("移动条目失败：源或目标世界书未找到 ");
      ElMessage.error("移动条目失败：源或目标世界书未找到 ");
      return;
    }

    // Create copies of the arrays to avoid direct mutation issues
    // Create copies of the arrays to avoid direct mutation issues
    const newFromEntries = [...fromBook.entries];
    const newToEntries = [...toBook.entries];

    const entryIndexInSource = newFromEntries.indexOf(entryToMove);
    if (entryIndexInSource === -1) {
      console.error("移动条目失败：在源世界书中未找到该条目 ");
      ElMessage.error("移动条目失败：在源世界书中未找到该条目 ");
      return;
    }

    // 1. Remove from the source copy
    const [removedEntry] = newFromEntries.splice(entryIndexInSource, 1);

    // 2. Add to the destination copy
    newToEntries.splice(insertIndex, 0, removedEntry);

    // 3. Atomically update the book objects by replacing the arrays
    fromBook.entries = newFromEntries;
    fromBook.updatedAt = new Date().toISOString();

    toBook.entries = newToEntries;
    toBook.updatedAt = new Date().toISOString();
  };

  const updateBookEntries = (bookId: string, entries: WorldBookEntry[]) => {
    const book = worldBookCollection.value.books[bookId];
    if (book) {
      book.entries = entries;
      book.updatedAt = new Date().toISOString();
      nextTick(() => {
        saveWorldBookToLocalStorage();
      });
    }
  };

  const updateBookOrder = (bookIdsInOrder: string[]) => {
    bookIdsInOrder.forEach((bookId, index) => {
      const book = worldBookCollection.value.books[bookId];
      if (book) {
        book.order = index;
        book.updatedAt = new Date().toISOString();
      }
    });
    saveWorldBookToLocalStorage();
  };

  return {
    worldBookCollection,
    activeBookId,
    activeBook,
    handleSelectBook,
    handleCreateBook,
    handleRenameBook,
    handleDeleteBook,
    handleImportBookFile,
    saveWorldBookToLocalStorage,
    moveEntryBetweenBooks,
    updateBookEntries,
    updateBookOrder,
  };
}