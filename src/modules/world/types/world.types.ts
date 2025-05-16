// src/modules/world/types/world.types.ts
import type { UID, Timestamp, Nullable, KeyValuePair } from '../../core/types/common.types';

/**
 * @description 世界书条目元数据接口
 */
export interface IWorldEntryMetadata {
  /**
   * @description 条目唯一ID (可选，新建时可能没有)
   */
  id?: UID;
  /**
   * @description 条目标题/名称
   */
  title: string;
  /**
   * @description 条目分类/类型 (例如 "地点", "组织", "物品", "设定")
   */
  category: string;
  /**
   * @description 条目标签/关键词
   */
  tags: string[];
  /**
   * @description 创建时间戳
   */
  createdAt: Timestamp;
  /**
   * @description 最后更新时间戳
   */
  updatedAt: Timestamp;
  /**
   * @description 创作者 (可选)
   */
  author?: string;
  /**
   * @description 关联图片URL (可选)
   */
  imageUrl?: string;
}

/**
 * @description 世界书条目内容区块接口
 * 允许灵活地组织条目内容
 */
export interface IWorldEntryContentBlock {
  /**
   * @description 内容区块类型 (例如 "text", "image", "list", "table", "quote")
   */
  type: string;
  /**
   * @description 内容区块的标题 (可选)
   */
  title?: string;
  /**
   * @description 内容区块的具体内容
   * 对于 "text", "quote": string
   * 对于 "image": { url: string, caption?: string }
   * 对于 "list": string[]
   * 对于 "table": { headers: string[], rows: string[][] }
   * 可以根据 type 扩展更多具体内容结构
   */
  content: any;
  /**
   * @description 内容区块的排序 (可选，用于自定义显示顺序)
   */
  order?: number;
}

/**
 * @description 世界书条目关系接口
 * 用于表示条目之间的关联
 */
export interface IWorldEntryRelationship {
  /**
   * @description 关联的条目ID
   */
  relatedEntryId: UID;
  /**
   * @description 关系类型 (例如 "属于", "位于", "敌对", "盟友")
   */
  type: string;
  /**
   * @description 关系描述 (可选)
   */
  description?: string;
}

/**
 * @description 完整的世界书条目数据结构
 */
export interface IWorldEntryData {
  /**
   * @description 条目元数据
   */
  metadata: IWorldEntryMetadata;
  /**
   * @description 条目的主要描述/简介
   */
  summary: Nullable<string>;
  /**
   * @description 条目详细内容区块列表
   */
  contentBlocks: IWorldEntryContentBlock[];
  /**
   * @description 与其他条目的关系列表 (可选)
   */
  relationships?: IWorldEntryRelationship[];
  /**
   * @description 扩展字段，用于存储自定义属性 (可选)
   * 例如：地点条目可能有 "地理位置坐标", "气候" 等
   * 组织条目可能有 "成员列表", "势力范围" 等
   */
  customProperties?: KeyValuePair<string, any>;
}

/**
 * @description 世界书本身的元数据 (如果需要管理多个世界观)
 */
export interface IWorldBookInfo {
  /**
   * @description 世界书唯一ID
   */
  id: UID;
  /**
   * @description 世界书名称
   */
  name: string;
  /**
   * @description 世界书简介
   */
  description: string;
  /**
   * @description 创建时间
   */
  createdAt: Timestamp;
  /**
   * @description 最后更新时间
   */
  updatedAt: Timestamp;
}
/**
 * @description Defines the structure for a single entry in the World Book.
 * This interface is used by the WorldBookEditor component.
 * @interface IWorldBookEntry
 */
export interface IWorldBookEntry {
  /**
   * @description Unique identifier for the entry. Optional for new entries not yet saved.
   * SillyTavern uses number for UID in world info.
   */
  uid?: number;
  /**
   * @description A descriptive comment or title for the entry, for user identification.
   */
  comment: string;
  /**
   * @description Primary keywords that trigger this entry. Supports regex with /regex/flags format.
   */
  key: string[];
  /**
   * @description The main content of the world book entry that gets inserted into the context.
   */
  content: string;
  /**
   * @description If true, the entry's comment (title) will be added along with the content.
   */
  addMemo: boolean;
  /**
   * @description Insertion order priority for this entry. Lower numbers typically insert earlier.
   */
  order: number;
  /**
   * @description If true, this entry is always active and inserted into the context.
   */
  constant: boolean;
  /**
   * @description If true, this entry is disabled and will not be processed or inserted.
   */
  disable: boolean;
  /**
   * @description Secondary keywords for more specific filtering.
   */
  keysecondary: string[];
  /**
   * @description Logic for secondary key matching.
   * 0: OR (any secondary key matches)
   * 1: NAND (not all secondary keys match)
   * 2: NOR (no secondary keys match)
   * 3: AND (all secondary keys match)
   */
  selectiveLogic: number;
  /**
   * @description If true, enables secondary key matching logic.
   */
  selective: boolean;
  /**
   * @description If true, this entry will not be activated by recursive searches.
   */
  excludeRecursion: boolean;
  /**
   * @description If true, activation of this entry prevents further recursive searches.
   */
  preventRecursion: boolean;
  /**
   * @description If true, this entry will only activate during recursive searches, not initial ones.
   */
  delayUntilRecursion: boolean;
  /**
   * @description Probability (0-100) of this entry being activated if its keys match.
   */
  probability: number;
  /**
   * @description If true, enables probability-based activation.
   */
  useProbability: boolean;
  /**
   * @description Position where the entry's content is inserted.
   * 0: Before character definition
   * 1: After character definition
   * 2: Before author's note
   * 3: After author's note
   * 4: @D (Deep character, requires 'role')
   * 5: Before example messages
   * 6: After example messages
   */
  position: number;
  /**
   * @description Role for in-chat insertion when position is @D.
   * 0: System
   * 1: User
   * 2: Assistant
   */
  role: number;
  /**
   * @description Scan depth for key matching. 0 might use global setting.
   */
  depth: number;
  /**
   * @description If true, key matching is case-sensitive.
   */
  caseSensitive: boolean;
  /**
   * @description If true, keys match whole words only.
   */
  matchWholeWords: boolean;
  /**
   * @description If true, enables vector-based matching for this entry.
   */
  vectorized: boolean;
  /**
   * @description Group name(s) this entry belongs to, comma-separated.
   */
  group: string;
  /**
   * @description Priority or weight of this entry within its group.
   */
  groupPriority: number;
  /**
   * @description If true, prioritize this entry based on its 'order' within the group, overriding other group selection logic.
   */
  groupOverride: boolean;
  /**
   * @description If true, enables scoring within the group (e.g., more matched keys get higher priority).
   */
  useGroupScoring: boolean;
  /**
   * @description Number of turns this entry remains active (sticky) after activation. 0 for not sticky.
   */
  sticky: number;
  /**
   * @description Number of turns this entry is on cooldown after activation. 0 for no cooldown.
   */
  cooldown: number;
  /**
   * @description Number of messages to wait before this entry can be activated. 0 for no delay.
   */
  delay: number;
  /**
   * @description ID used for automation purposes, e.g., by Quick Replies extension.
   */
  automationId: string;
}