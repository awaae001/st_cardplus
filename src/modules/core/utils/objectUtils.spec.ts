import { describe, it, expect } from 'vitest';
import { ensureArrayExists, stripIdsFromArray, filterEmptyValues } from './objectUtils';

describe('objectUtils', () => {
  describe('ensureArrayExists', () => {
    it('should create an empty array if the key does not exist', () => {
      const obj: { a: number[] | undefined; b?: string } = { b: 'test', a: undefined };
      ensureArrayExists(obj, 'a');
      expect(obj.a).toEqual([]);
    });

    it('should create an empty array if the key exists but the value is null', () => {
      const obj: { data: null | string[] } = { data: null };
      ensureArrayExists(obj, 'data');
      expect(obj.data).toEqual([]);
    });

    it('should create an empty array if the key exists but the value is undefined', () => {
      const obj: { list: number[] | undefined } = { list: undefined };
      ensureArrayExists(obj, 'list');
      expect(obj.list).toEqual([]);
    });

    it('should create an empty array if the key exists but the value is not an array', () => {
      const obj: { items: any } = { items: 'not an array' };
      ensureArrayExists(obj, 'items');
      expect(obj.items).toEqual([]);
    });

    it('should not change an existing array', () => {
      const existingArray = [1, 2, 3];
      const obj = { data: existingArray };
      ensureArrayExists(obj, 'data');
      expect(obj.data).toBe(existingArray); // Check for reference equality
      expect(obj.data).toEqual([1, 2, 3]);
    });

    it('should work with different property names', () => {
      const obj: { users: string[] | undefined, products: object[] | undefined } = { users: undefined, products: undefined };
      ensureArrayExists(obj, 'users');
      expect(obj.users).toEqual([]);
      ensureArrayExists(obj, 'products');
      expect(obj.products).toEqual([]);
    });

    it('should handle objects with pre-existing properties correctly', () => {
        const obj = { name: 'test', age: 30, tags: undefined as string[] | undefined };
        ensureArrayExists(obj, 'tags');
        expect(obj.tags).toEqual([]);
        expect(obj.name).toBe('test');
        expect(obj.age).toBe(30);
    });
  });

  // Placeholder for stripIdsFromArray tests
  describe('stripIdsFromArray', () => {
    it('should remove "id" property from each object in the array', () => {
      const inputArray = [
        { id: 1, name: 'Alice', age: 30 },
        { id: 2, name: 'Bob', value: 'test' },
        { id: 3, data: [1, 2] },
      ];
      const expectedOutput = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', value: 'test' },
        { data: [1, 2] },
      ];
      const result = stripIdsFromArray(inputArray);
      expect(result).toEqual(expectedOutput);
      // Ensure original array objects are not modified if they were complex types (though map creates new objects for the array itself)
      expect(inputArray[0]).toHaveProperty('id');
    });

    it('should return an empty array if the input array is empty', () => {
      const inputArray: { id: number }[] = [];
      const result = stripIdsFromArray(inputArray);
      expect(result).toEqual([]);
    });

    it('should return an empty array if the input is undefined', () => {
      const result = stripIdsFromArray(undefined);
      expect(result).toEqual([]);
    });

    it('should handle objects with only an id property', () => {
      const inputArray = [{ id: 100 }, { id: 200 }];
      const expectedOutput = [{}, {}];
      const result = stripIdsFromArray(inputArray);
      expect(result).toEqual(expectedOutput);
    });

    it('should not modify the original array', () => {
      const inputArray = [{ id: 1, name: 'Original' }];
      const inputArrayCopy = JSON.parse(JSON.stringify(inputArray)); // Deep copy for comparison
      stripIdsFromArray(inputArray);
      expect(inputArray).toEqual(inputArrayCopy);
    });

    it('should work with various types for id property', () => {
      const inputArray = [
        { id: 'abc', value: 'string id' },
        { id: Symbol('symId'), value: 'symbol id' },
      ];
      const expectedOutput = [
        { value: 'string id' },
        { value: 'symbol id' },
      ];
      const result = stripIdsFromArray(inputArray);
      expect(result).toEqual(expectedOutput);
    });
  });

  // Placeholder for filterEmptyValues tests
  describe('filterEmptyValues', () => {
    it('should return null for null or undefined input', () => {
      expect(filterEmptyValues(null)).toBeNull();
      expect(filterEmptyValues(undefined)).toBeNull();
    });

    it('should remove null, undefined, and empty string properties from an object', () => {
      const obj = {
        a: 'hello',
        b: null,
        c: undefined,
        d: '',
        e: 'world',
        f: 0, // should be kept as it's not empty string, null or undefined
        g: false, // should be kept
      };
      const expected = {
        a: 'hello',
        e: 'world',
        f: 0,
        g: false,
      };
      expect(filterEmptyValues(obj)).toEqual(expected);
    });

    it('should return null if all object properties are empty', () => {
      const obj = { a: null, b: undefined, c: '' };
      expect(filterEmptyValues(obj)).toBeNull();
    });

    it('should filter empty values from an array', () => {
      const arr = ['hello', null, undefined, '', 'world', 0, false, ['nested', null, '']];
      const expected = ['hello', 'world', 0, false, ['nested']]; // nested empty string is removed, nested null is removed
      expect(filterEmptyValues(arr)).toEqual(expected);
    });

    it('should return null if all array elements are empty', () => {
      const arr = [null, undefined, '', [null, '']];
      expect(filterEmptyValues(arr)).toBeNull();
    });

    it('should handle nested objects and arrays', () => {
      const obj = {
        name: 'Test',
        details: {
          info: 'Some info',
          extra: null,
          meta: {
            key1: 'value1',
            key2: '',
            key3: undefined,
          },
        },
        tags: ['tag1', null, 'tag2', ''],
        misc: [1, {deep: 'val', empty: null}, undefined]
      };
      const expected = {
        name: 'Test',
        details: {
          info: 'Some info',
          meta: {
            key1: 'value1',
          },
        },
        tags: ['tag1', 'tag2'],
        misc: [1, {deep: 'val'}]
      };
      expect(filterEmptyValues(obj)).toEqual(expected);
    });

    it('should return null for a nested object that becomes empty', () => {
      const obj = { data: { a: null, b: '' } };
      const expected = { data: null }; // The inner object becomes null
      expect(filterEmptyValues(obj)).toEqual(expected); // but if data's value is null, it should be removed.
    });
    
    it('should return null for a deeply nested object that becomes entirely empty', () => {
        const obj = { level1: { level2: { level3: null, level3empty: ""}}};
        expect(filterEmptyValues(obj)).toBeNull();
    });


    it('should keep "age" property if it is a number, including 0', () => {
      const obj = { name: 'Test', age: 30, other: null };
      const expected = { name: 'Test', age: 30 };
      expect(filterEmptyValues(obj)).toEqual(expected);

      const objWithZeroAge = { name: 'Baby', age: 0, description: '' };
      const expectedWithZeroAge = { name: 'Baby', age: 0 };
      expect(filterEmptyValues(objWithZeroAge)).toEqual(expectedWithZeroAge);
      
      const objWithNonNumericAge = { name: 'NoAge', age: '', other: 'value' };
      const expectedNonNumericAge = { other: 'value' }; // age: '' should be removed
      expect(filterEmptyValues(objWithNonNumericAge)).toEqual(expectedNonNumericAge);
    });

    it('should handle basic types: return null for empty string, otherwise return the value', () => {
      expect(filterEmptyValues('')).toBeNull();
      expect(filterEmptyValues('hello')).toBe('hello');
      expect(filterEmptyValues(123)).toBe(123);
      expect(filterEmptyValues(0)).toBe(0);
      expect(filterEmptyValues(true)).toBe(true);
      expect(filterEmptyValues(false)).toBe(false);
    });
    
    it('should correctly filter an array within an object that might become null', () => {
        const obj = {
            items: [null, "item1", "", undefined, "item2"],
            otherData: null
        };
        const expected = {
            items: ["item1", "item2"]
        };
        expect(filterEmptyValues(obj)).toEqual(expected);

        const obj2 = {
            items: [null, "", undefined],
            otherData: "present"
        };
        const expected2 = {
            // items becomes null and thus removed
            otherData: "present"
        };
        expect(filterEmptyValues(obj2)).toEqual(expected2);
    });
  });
});