import type { Ref } from 'vue';
import type { WorldBookCollection, WorldBookEntry } from '../components/worldbook/types';
import type { NodeDropType } from 'element-plus/es/components/tree/src/tree.type';
import { ElMessage } from 'element-plus';

export function useWorldBookDragDrop(
  worldBookCollection: Ref<WorldBookCollection>,
  moveEntryBetweenBooks: (
    entryToMove: WorldBookEntry,
    fromBookId: string,
    toBookId: string,
    insertIndex: number
  ) => void,
  updateBookEntries: (bookId: string, entries: WorldBookEntry[]) => void,
  forceUpdateEntries: () => void
) {

  const allowDrag = (draggingNode: any): boolean => {
    return draggingNode.data.isEntry;
  };

  const allowDrop = (draggingNode: any, dropNode: any, type: NodeDropType): boolean => {
    if (!draggingNode.data.isEntry) {
      return false; // Can't drag books
    }
    if (dropNode.data.isEntry) {
      // Can drop before or after another entry
      return type !== 'inner';
    } else {
      // Can drop into a book
      return type === 'inner';
    }
  };

  const handleNodeDrop = (draggingNode: any, dropNode: any, dropType: NodeDropType): boolean => {
    const entryToMove: WorldBookEntry = draggingNode.data.raw;
    const fromBookId: string = draggingNode.parent?.data?.id || draggingNode.data.bookId;

    if (!fromBookId) {
      ElMessage.error("拖拽失败：无法确定源世界书。");
      return false;
    }

    let toBookId: string;
    let toBook;
    let insertIndex: number;

    if (dropNode.data.isEntry) {
      toBookId = dropNode.parent?.data?.id || dropNode.data.bookId;
      toBook = worldBookCollection.value.books[toBookId];
      const dropEntryIndex = toBook.entries.findIndex(e => e.uid === dropNode.data.raw.uid);
      if (dropEntryIndex === -1) {
        ElMessage.error("拖拽失败：在目标世界书中找不到定位条目。");
        return false;
      }
      if (dropType === 'before') {
        insertIndex = dropEntryIndex;
      } else { // 'after'
        insertIndex = dropEntryIndex + 1;
      }
    } else { // drop into a book
      toBookId = dropNode.data.id;
      toBook = worldBookCollection.value.books[toBookId];
      insertIndex = 0; // 'inner' drop means at the top
    }

    if (!toBook) {
      ElMessage.error("拖拽失败：找不到目标世界书。");
      return false;
    }

    if (fromBookId === toBookId) {
      const book = worldBookCollection.value.books[fromBookId];
      const newEntries = [...book.entries];
      const oldIndex = newEntries.findIndex(e => e.uid === entryToMove.uid);
      if (oldIndex > -1) {
        newEntries.splice(oldIndex, 1);
        // Adjust insertIndex if the removal affected it
        const adjustedInsertIndex = oldIndex < insertIndex ? insertIndex - 1 : insertIndex;
        newEntries.splice(adjustedInsertIndex, 0, entryToMove);

        // DANGEROUS: Re-assigning UID based on the new sequence as requested.
        // This can lead to issues with component keys and selection state.
        newEntries.forEach((entry, index) => {
          entry.uid = index;
          entry.order = index; // Also update the 'order' field for safer tracking
        });
        
        updateBookEntries(fromBookId, newEntries);
        ElMessage.success(`条目顺序已更新`);
      } else {
        ElMessage.error("排序失败：找不到原始条目。");
        return false;
      }
    } else {
      moveEntryBetweenBooks(entryToMove, fromBookId, toBookId, insertIndex);
      ElMessage.success(`条目已移至 "${toBook.name}"`);
    }
    
    forceUpdateEntries();
    return true;
  };

  return {
    allowDrag,
    allowDrop,
    handleNodeDrop,
  };
}