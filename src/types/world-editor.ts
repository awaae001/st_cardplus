// src/types/world-editor.ts

/**
 * 增强的地标实体接口
 */
export interface EnhancedLandmark {
  // 基础信息
  id: string;                    // UUID 唯一标识
  name: string;                  // 地标名称
  description: string;           // 详细描述

  // 分类属性
  type: LandmarkType;           // 地标类型
  importance: ImportanceLevel;   // 重要性等级（1-5星）
  tags: string[];               // 自定义标签

  // 位置信息
  coordinates?: Coordinates;     // 可选坐标信息
  region?: string;              // 所属区域

  // 关系管理
  controllingForces: string[];  // 控制势力ID列表
  relatedLandmarks: string[];   // 相关地标ID列表

  // 扩展属性
  climate?: string;             // 气候类型
  population?: number;          // 人口数量
  resources: string[];          // 可用资源
  defenseLevel?: number;        // 防御等级

  // 元数据
  notes: string;                // 额外备注
  imageUrl?: string;            // 图片链接
  createdAt: string;            // 创建时间
  updatedAt: string;            // 更新时间
  version: number;              // 版本号
}

/**
 * 地标类型枚举
 */
export enum LandmarkType {
  CITY = 'city',               // 城市
  TOWN = 'town',               // 城镇
  VILLAGE = 'village',         // 村庄
  FORTRESS = 'fortress',       // 要塞
  RUINS = 'ruins',             // 遗迹
  DUNGEON = 'dungeon',         // 地下城
  TEMPLE = 'temple',           // 神殿
  ACADEMY = 'academy',         // 学院
  HARBOR = 'harbor',           // 港口
  MARKET = 'market',           // 市场
  NATURAL = 'natural',         // 自然景观
  MYSTICAL = 'mystical',       // 神秘地点
  CUSTOM = 'custom'            // 自定义
}

/**
 * 重要性等级
 */
export enum ImportanceLevel {
  MINOR = 1,        // 次要
  NORMAL = 2,       // 普通
  IMPORTANT = 3,    // 重要
  MAJOR = 4,        // 主要
  CRITICAL = 5      // 关键
}

/**
 * 坐标信息
 */
export interface Coordinates {
  x: number;
  y: number;
  z?: number;       // 可选高度信息
}

/**
 * 增强的势力实体接口
 */
export interface EnhancedForce {
  // 基础信息
  id: string;
  name: string;
  description: string;

  // 组织属性
  type: ForceType;              // 势力类型
  power: PowerLevel;            // 势力强度
  structure: OrganizationStructure; // 组织结构

  // 人员管理
  leaders: Leader[];            // 领导者列表
  members: Member[];            // 成员列表
  totalMembers: number;         // 总成员数

  // 地域控制
  controlledTerritories: string[];  // 控制地标ID
  influenceAreas: string[];         // 影响区域ID
  headquarters?: string;            // 总部地标ID

  // 外交关系
  allies: Relationship[];       // 盟友关系
  enemies: Relationship[];      // 敌对关系
  neutral: string[];           // 中立势力ID

  // 资源与能力
  resources: Resource[];        // 拥有资源
  capabilities: string[];      // 特殊能力
  weaknesses: string[];        // 弱点

  // 历史记录
  history: HistoryEvent[];     // 重要历史事件
  foundedDate?: string;        // 成立日期

  // 元数据
  tags: string[];
  notes: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

/**
 * 势力类型
 */
export enum ForceType {
  POLITICAL = 'political',     // 政治组织
  MILITARY = 'military',       // 军事组织
  RELIGIOUS = 'religious',     // 宗教组织
  COMMERCIAL = 'commercial',   // 商业组织
  CRIMINAL = 'criminal',       // 犯罪组织
  ACADEMIC = 'academic',       // 学术组织
  MAGICAL = 'magical',         // 魔法组织
  TRIBAL = 'tribal',          // 部族组织
  GUILD = 'guild',            // 行会
  CULT = 'cult',              // 教派
  CUSTOM = 'custom'           // 自定义
}

/**
 * 势力等级
 */
export enum PowerLevel {
  WEAK = 1,         // 弱小
  MODERATE = 2,     // 中等
  STRONG = 3,       // 强大
  DOMINANT = 4,     // 主导
  SUPREME = 5       // 至上
}

/**
 * 组织结构
 */
export interface OrganizationStructure {
  hierarchy: string[];         // 层级结构
  decisionMaking: string;      // 决策方式
  recruitment: string;         // 招募方式
}

/**
 * 领导者信息
 */
export interface Leader {
  id: string; // 前端使用的唯一ID
  name: string;
  title: string;
  description?: string;
  characterId?: string;        // 关联角色卡ID
}

/**
 * 成员信息
 */
export interface Member {
  name: string;
  role: string;
  rank?: string;
  characterId?: string;
}

/**
 * 外交关系信息
 */
export interface Relationship {
  forceId: string;
  type: ForceRelationType;
  strength: number;            // 关系强度 1-5
  since?: string;              // 关系开始时间
  description?: string;
}

/**
 * 势力间关系类型
 */
export enum ForceRelationType {
  ALLIANCE = 'alliance',       // 联盟
  TRADE_PARTNER = 'trade_partner', // 贸易伙伴
  VASSAL = 'vassal',          // 附庸
  RIVALRY = 'rivalry',        // 竞争
  ENEMY = 'enemy',            // 敌对
  WAR = 'war'                 // 战争状态
}

/**
 * 资源信息
 */
export interface Resource {
  type: string;               // 资源类型
  quantity: number;           // 数量
  quality: string;            // 品质
  source?: string;            // 来源
}

/**
 * 历史事件
 */
export interface HistoryEvent {
  date: string;
  title: string;
  description: string;
  impact: string;             // 影响
}


// =================================================================
// 关系图谱 (Relationship Graph) 相关类型
// =================================================================

export interface RelationshipGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  type: 'landmark' | 'force';
  name: string;
  data: EnhancedLandmark | EnhancedForce;
  position?: { x: number; y: number };
}

export interface GraphEdge {
  source: string; // source node id
  target: string; // target node id
  type: GraphEdgeType;
  strength: number;
  label?: string;
}

/**
 * 图谱中的关系类型
 */
export enum GraphEdgeType {
  CONTROLS = 'controls',           // 势力控制地标
  INFLUENCES = 'influences',       // 势力影响地标
  ALLIED_WITH = 'allied_with',     // 势力联盟
  ENEMY_OF = 'enemy_of',          // 势力敌对
  LOCATED_IN = 'located_in',      // 地标位于区域
  CONNECTED_TO = 'connected_to'   // 地标连接
}

/**
 * 数据验证规则
 */
export interface ValidationRule {
  field: string;
  rule: ValidationType;
  message: string;
  params?: any;
}

/**
 * 验证规则类型
 */
export enum ValidationType {
  REQUIRED = 'required',
  UNIQUE = 'unique',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  PATTERN = 'pattern',
  CUSTOM = 'custom'
}

/**
 * 操作历史记录条目
 */
export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: ActionType;
  target: 'landmark' | 'force';
  targetId: string;
  previousState: any;
  newState: any;
  description: string;
}

/**
 * 历史记录管理器接口
 */
export interface IHistoryManager {
  history: HistoryEntry[];
  currentIndex: number;
  maxHistorySize: number;

  undo(): boolean;
  redo(): boolean;
  addEntry(entry: HistoryEntry): void;
  clear(): void;
  getHistory(): HistoryEntry[];
}


/**
 * 操作类型
 */
export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  BATCH_UPDATE = 'batch_update',
  IMPORT = 'import'
}