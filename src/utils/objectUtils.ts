/**
 * 创建一个对象的深拷贝副本，并移除指定的键。
 * 支持移除顶层和嵌套的键，以及符合特定模式的键（例如以下划线开头的键）。
 *
 * @param obj - 需要清理的原始对象。
 * @param keysToRemove - 一个字符串数组，包含需要精确匹配并移除的键。
 * @param removeKeysStartingWith - 一个字符串数组，定义了需要移除的键的前缀（例如 `['__']` 会移除所有以下划线开头的键）。
 * @returns 返回一个移除了指定键的新的深拷贝对象。
 */
export const cleanObject = (obj: any, keysToRemove: string[] = [], removeKeysStartingWith: string[] = []): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item, keysToRemove, removeKeysStartingWith));
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (keysToRemove.includes(key)) {
        continue;
      }
      let shouldRemove = false;
      for (const prefix of removeKeysStartingWith) {
        if (key.startsWith(prefix)) {
          shouldRemove = true;
          break;
        }
      }
      if (shouldRemove) {
        continue;
      }
      newObj[key] = cleanObject(obj[key], keysToRemove, removeKeysStartingWith);
    }
  }
  return newObj;
};