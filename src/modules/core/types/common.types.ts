// src/modules/core/types/common.types.ts

/**
 * @description 通用唯一标识符类型
 * 通常用于数据库主键或唯一识别码
 */
export type UID = string | number;

/**
 * @description 通用时间戳类型
 * 表示自 Unix 纪元以来的毫秒数
 */
export type Timestamp = number;

/**
 * @description 表示一个可能为 null 或 undefined 的值
 * T 代表原始类型
 */
export type Maybe<T> = T | null | undefined;

/**
 * @description 表示一个可能为 null 的值
 * T 代表原始类型
 */
export type Nullable<T> = T | null;

/**
 * @description 用于表示键值对的对象，常用于字典或映射
 * K 通常是 string, number, or symbol
 * V 可以是任何类型
 */
export type KeyValuePair<K extends keyof any = string, V = any> = {
  [key in K]: V;
};

/**
 * @description 分页查询参数接口
 */
export interface IPaginationQuery {
  /**
   * @description 当前页码，从 1 开始
   */
  page: number;
  /**
   * @description 每页记录数
   */
  pageSize: number;
  /**
   * @description 排序字段 (可选)
   */
  sortBy?: string;
  /**
   * @description 排序方向 (asc/desc) (可选)
   */
  sortOrder?: 'asc' | 'desc';
}

/**
 * @description 分页查询结果接口
 * T 代表列表项的类型
 */
export interface IPaginatedResult<T> {
  /**
   * @description 当前页的数据列表
   */
  items: T[];
  /**
   * @description 总记录数
   */
  totalItems: number;
  /**
   * @description 总页数
   */
  totalPages: number;
  /**
   * @description 当前页码
   */
  currentPage: number;
}

/**
 * @description 操作结果接口，用于表示一个操作是否成功及其附带信息
 */
export interface IOperationOutcome {
  /**
   * @description 操作是否成功
   */
  success: boolean;
  /**
   * @description 操作成功或失败时的消息文本 (可选)
   */
  message?: string;
  /**
   * @description 如果操作失败，可以包含错误代码 (可选)
   */
  errorCode?: string;
  /**
   * @description 操作可能返回的数据 (可选)
   */
  data?: any;
}

/**
 * @description 解析后的文件基本信息接口
 * 通常用于文件上传后或读取文件元数据后展示文件的一些基本属性。
 */
export interface IParsedFileInfo {
  /**
   * @description 文件名
   */
  filename: string;
  /**
   * @description 文件大小（以字节为单位）(可选)
   */
  size?: number;
  /**
   * @description 文件的 MIME 类型
   * 例如：'image/png', 'application/json'
   */
  type: string;
  /**
   * @description 文件最后修改时间的时间戳 (毫秒)
   */
  lastModified: Timestamp;
}