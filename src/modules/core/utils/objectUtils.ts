// src/modules/core/utils/objectUtils.ts

/**
 * @file 对象和数组处理相关的通用工具函数
 */

/**
 * @function ensureArrayExists
 * @description 确保对象上的指定键对应的值是一个数组。如果该键不存在，或者对应的值不是数组，
 *              则会将其初始化为空数组。此函数直接修改传入的对象。
 * @template T - 包含目标属性的对象类型。
 * @template K - 对象 T 中属性的键名，该属性预期为数组类型。
 * @param {T} obj - 需要操作的对象。
 * @param {K} arrayKey - 对象中预期为数组的属性的键名。
 * @returns {void}
 * @example
 * const myObj = { name: 'test' };
 * ensureArrayExists(myObj, 'tags'); // myObj is now { name: 'test', tags: [] }
 * ensureArrayExists(myObj, 'tags'); // myObj remains { name: 'test', tags: [] }
 * const myObjWithNull = { list: null };
 * ensureArrayExists(myObjWithNull, 'list'); // myObjWithNull is now { list: [] }
 */
export const ensureArrayExists = <T extends Record<K, any>, K extends keyof T>(
  obj: T,
  arrayKey: K
): void => {
  if (!(obj[arrayKey] && Array.isArray(obj[arrayKey]))) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj[arrayKey] = [] as any; // 使用 as any 来处理潜在的复杂类型推断问题
  }
};

/**
 * @function stripIdsFromArray
 * @description 从对象数组中移除每个对象的 'id' 属性。
 * @template TItem - 数组中对象的类型，必须包含一个 'id' 属性。
 * @param {TItem[] | undefined} arr - 需要处理的对象数组。
 * @returns {Omit<TItem, 'id'>[]} 一个新的数组，其中每个对象都移除了 'id' 属性。如果输入为 undefined 或非数组，则返回空数组。
 */
export const stripIdsFromArray = <TItem extends { id: any }>(
  arr: TItem[] | undefined
): Omit<TItem, 'id'>[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.map((item) => {
    const { id, ...rest } = item;
    return rest;
  });
};

/**
 * @function filterEmptyValues
 * @description 递归地从对象或数组中移除值为 null、undefined 或空字符串 ("") 的属性/元素。
 *              对于对象，如果所有属性都被移除，则对象本身也会变成 null。
 *              对于数组，如果所有元素都被移除，则数组本身也会变成 null。
 *              特殊处理：如果对象的属性键为 'age' 且值为数字(包括0)，则保留该属性。
 * @param {any} obj - 需要处理的对象或数组。
 * @returns {any} 处理后的对象或数组，或在完全为空时返回 null。
 */
export const filterEmptyValues = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    const filteredArray = obj
      .map(filterEmptyValues) // 递归处理数组中的每个元素
      .filter((item) => item !== null && item !== ''); // 移除 null 或空字符串的元素
    return filteredArray.length > 0 ? filteredArray : null; // 如果数组为空，则返回 null
  }

  if (typeof obj === 'object') {
    const filteredObject: any = {};
    let hasValues = false;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        // 特殊情况：如果键是 'age' 且值是数字 (即使是0)，也保留
        if (key === 'age' && typeof value === 'number') {
          filteredObject[key] = value;
          hasValues = true;
          continue;
        }
        const filteredValue = filterEmptyValues(value); // 递归处理对象的属性值
        if (filteredValue !== null && filteredValue !== '') {
          filteredObject[key] = filteredValue;
          hasValues = true;
        }
      }
    }
    return hasValues ? filteredObject : null; // 如果对象没有有效值，则返回 null
  }

  // 对于基本类型，如果是空字符串则返回 null，否则返回原始值
  if (obj === '') {
    return null;
  }
  return obj;
};