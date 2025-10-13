import type { Ref } from 'vue';
import type { RegexScriptCollection, SillyTavernRegexScript } from './types';
import type { NodeDropType } from 'element-plus/es/components/tree/src/tree.type';
import { ElMessage } from 'element-plus';

export function useRegexDragDrop(
  regexCollection: Ref<RegexScriptCollection>,
  moveScriptBetweenCategories: (
    scriptId: string,
    fromCategoryId: string,
    toCategoryId: string,
    insertIndex: number
  ) => boolean,
  updateCategoryScripts: (categoryId: string, scripts: SillyTavernRegexScript[]) => void
) {
  const allowDrag = (): boolean => {
    // 允许拖动所有项目
    return true;
  };

  const allowDrop = (draggingNode: any, dropNode: any, type: NodeDropType): boolean => {
    const isDraggingCategory = !draggingNode.data.isScript;
    const isDropTargetCategory = !dropNode.data.isScript;

    if (isDraggingCategory) {
      // 如果拖动的是类别，只允许在其他类别前后放置
      return isDropTargetCategory && type !== 'inner';
    } else {
      // 如果拖动的是脚本
      if (isDropTargetCategory) {
        // 允许将脚本放入类别
        return type === 'inner';
      } else {
        // 允许在其他脚本前后放置
        return type !== 'inner';
      }
    }
  };

  const handleNodeDrop = (draggingNode: any, dropNode: any, dropType: NodeDropType): boolean => {
    const isDraggingCategory = !draggingNode.data.isScript;

    if (isDraggingCategory) {
      // 处理类别排序
      const allCategories = Object.values(regexCollection.value.categories).sort((a, b) => a.order - b.order);
      const draggingCategoryId = draggingNode.data.id;
      const dropCategoryId = dropNode.data.id;

      const oldIndex = allCategories.findIndex(c => c.id === draggingCategoryId);
      let newIndex = allCategories.findIndex(c => c.id === dropCategoryId);

      if (oldIndex === -1 || newIndex === -1) {
        ElMessage.error("排序失败：找不到类别");
        return false;
      }

      // 根据放置位置调整索引
      if (dropType === 'after') {
        newIndex += 1;
      }

      // 移动类别
      const [movedCategory] = allCategories.splice(oldIndex, 1);
      allCategories.splice(newIndex, 0, movedCategory);

      // 更新所有类别的 order
      allCategories.forEach((category, index) => {
        category.order = index;
        category.updatedAt = new Date().toISOString();
      });

      ElMessage.success("类别顺序已更新");
      return true;
    }

    // 处理脚本拖放
    const scriptId: string = draggingNode.data.scriptId;
    const fromCategoryId: string = draggingNode.parent?.data?.id || draggingNode.data.categoryId;

    if (!fromCategoryId) {
      ElMessage.error("拖拽失败：无法确定源类别");
      return false;
    }

    let toCategoryId: string;
    let toCategory;
    let insertIndex: number;

    if (dropNode.data.isScript) {
      toCategoryId = dropNode.parent?.data?.id || dropNode.data.categoryId;
      toCategory = regexCollection.value.categories[toCategoryId];
      const dropScriptIndex = toCategory.scripts.findIndex(s => s.id === dropNode.data.scriptId);
      if (dropScriptIndex === -1) {
        ElMessage.error("拖拽失败：在目标类别中找不到定位脚本");
        return false;
      }
      if (dropType === 'before') {
        insertIndex = dropScriptIndex;
      } else {
        insertIndex = dropScriptIndex + 1;
      }
    } else {
      // drop into a category
      toCategoryId = dropNode.data.id;
      toCategory = regexCollection.value.categories[toCategoryId];
      insertIndex = 0; // 'inner' drop means at the top
    }

    if (!toCategory) {
      ElMessage.error("拖拽失败：找不到目标类别");
      return false;
    }

    if (fromCategoryId === toCategoryId) {
      // 同类别内排序
      const category = regexCollection.value.categories[fromCategoryId];
      const newScripts = [...category.scripts];
      const oldIndex = newScripts.findIndex(s => s.id === scriptId);
      if (oldIndex > -1) {
        const [movedScript] = newScripts.splice(oldIndex, 1);
        const adjustedInsertIndex = oldIndex < insertIndex ? insertIndex - 1 : insertIndex;
        newScripts.splice(adjustedInsertIndex, 0, movedScript);

        updateCategoryScripts(fromCategoryId, newScripts);
        ElMessage.success(`脚本顺序已更新`);
      } else {
        ElMessage.error("排序失败：找不到原始脚本");
        return false;
      }
    } else {
      // 跨类别移动
      const success = moveScriptBetweenCategories(scriptId, fromCategoryId, toCategoryId, insertIndex);
      if (success) {
        ElMessage.success(`脚本已移至 "${toCategory.name}"`);
      } else {
        return false;
      }
    }

    return true;
  };

  return {
    allowDrag,
    allowDrop,
    handleNodeDrop,
  };
}
