/**
 * 创建一个对象的深拷贝副本，并移除指定的键
 * 支持移除顶层和嵌套的键，以及符合特定模式的键（例如以下划线开头的键）
 *
 * @param obj - 需要清理的原始对象
 * @param keysToRemove - 一个字符串数组，包含需要精确匹配并移除的键
 * @param removeKeysStartingWith - 一个字符串数组，定义了需要移除的键的前缀（例如 `['__']` 会移除所有以下划线开头的键）
 * @returns 返回一个移除了指定键的新的深拷贝对象
 */
export const cleanObject = (obj: any, keysToRemove: string[] = [], removeKeysStartingWith: string[] = []): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObject(item, keysToRemove, removeKeysStartingWith));
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

/**
 * Deeply remove empty fields from objects/arrays.
 * Empty means: null, undefined, empty string (after trim), empty array, empty object.
 */
export const removeEmptyFields = (value: any): any => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : value;
  }

  if (Array.isArray(value)) {
    const cleaned = value.map((item) => removeEmptyFields(item)).filter((item) => item !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const key in value) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
      const cleaned = removeEmptyFields(value[key]);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  return value;
};
